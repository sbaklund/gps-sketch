'use strict';

/**
 * routes/features.js
 *
 * GET /api/features?bbox=<south,west,north,east>&layers=water
 *   → { bbox:[s,w,n,e], polys:[ [[lon,lat],…], … ], lines:[ [[lon,lat],…], … ] }
 *     polys = filled areas (lakes, reservoirs, oceans, bays)
 *     lines = strokes      (rivers, streams, canals)
 *
 * ── v0.39.0 DATA SOURCE = MapTiler vector tiles ────────────────────────────
 * Overpass is unreachable from Render's datacenter IP (confirmed live: the host
 * either refuses the socket — "fetch failed" — or hangs past our timeout, even
 * with IPv4 forced). MapTiler, by contrast, is a CDN Render already reaches for
 * the elevation fallback, and Stephen has a MAPTILER_KEY. So water now comes
 * from MapTiler's OpenMapTiles "v3" vector tiles:
 *   - the `water` layer → polygons (oceans, lakes, bays, reservoirs) → polys
 *   - the `waterway` layer → lines (rivers, streams, canals)          → lines
 * We decode the .pbf with @mapbox/vector-tile + pbf and use each feature's
 * toGeoJSON(x,y,z), which yields lon/lat coordinates directly — the SAME
 * source-agnostic contract the client already consumes, so NOTHING on the
 * frontend changes. If we ever swap sources again, only this file changes.
 *
 * Kept from before: disk cache (like geocode.js), a hard time budget so the
 * endpoint always returns a fast 200 (never a 502), soft-fail to an empty
 * overlay, and a /diag endpoint to debug reachability live.
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const dns     = require('node:dns');
const net     = require('node:net');
const { VectorTile } = require('@mapbox/vector-tile');
const Pbf     = require('pbf');

try { dns.setDefaultResultOrder('ipv4first'); } catch (_) {}

const router = express.Router();

const MAPTILER_KEY = (process.env.MAPTILER_KEY || '').trim();
const MT_HOST = 'api.maptiler.com';
// OpenMapTiles v3 schema — has `water` (polygons) + `waterway` (lines).
const tileUrl = (z, x, y) => `https://${MT_HOST}/tiles/v3/${z}/${x}/${y}.pbf?key=${MAPTILER_KEY}`;
const UA = 'GPXSketch/1.0 (route-art poster generator)';

// Request bounding — keep the whole thing short so Render never times us out.
const ATTEMPT_MS = 4500;   // per tile fetch
const BUDGET_MS  = 10000;  // hard cap across all tiles
const MAX_TILES  = 12;     // cap the tile fan-out for one frame
const MT_MAXZOOM = 14;     // v3 water tiles top out here (overzoom above)

const CACHE_DIR  = path.join(__dirname, '..', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'features-cache.json');

// ---- tiny disk cache (keyed by rounded bbox + layers) -------------------
let cache = {};
try { if (fs.existsSync(CACHE_FILE)) cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch {}
function saveCache() {
  try { fs.mkdirSync(CACHE_DIR, { recursive: true }); fs.writeFileSync(CACHE_FILE, JSON.stringify(cache)); } catch {}
}

const r6 = n => Math.round(n * 1e6) / 1e6;

function decimate(coords, max) {
  if (coords.length <= max) return coords;
  const step = Math.ceil(coords.length / max);
  const out = [];
  for (let i = 0; i < coords.length; i += step) out.push(coords[i]);
  if (out[out.length - 1] !== coords[coords.length - 1]) out.push(coords[coords.length - 1]);
  return out;
}

// ---- Web-Mercator tile math ---------------------------------------------
const lon2tileX = (lon, z) => Math.floor((lon + 180) / 360 * Math.pow(2, z));
const lat2tileY = (lat, z) => {
  const r = lat * Math.PI / 180;
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z));
};

// Pick a tile zoom that covers the bbox in a manageable number of tiles.
// Start near "one tile across the bbox" + a touch more detail, then step DOWN
// until the covering tile count is within MAX_TILES.
function pickZoom(s, w, n, e) {
  const lonSpan = Math.max(1e-6, e - w);
  let z = Math.round(Math.log2(360 / lonSpan)) + 1;
  z = Math.max(3, Math.min(MT_MAXZOOM, z));
  for (; z > 3; z--) {
    const x0 = lon2tileX(w, z), x1 = lon2tileX(e, z);
    const y0 = lat2tileY(n, z), y1 = lat2tileY(s, z);
    if ((x1 - x0 + 1) * (y1 - y0 + 1) <= MAX_TILES) break;
  }
  return z;
}

// Turn one GeoJSON geometry (lon/lat) into our polys/lines, decimated.
function collectGeo(geom, polys, lines) {
  if (!geom) return;
  const push = (coords, isPoly) => {
    const d = decimate(coords.map(c => [r6(c[0]), r6(c[1])]), 600);
    if (isPoly) { if (d.length >= 4) polys.push(d); }
    else if (d.length >= 2) lines.push(d);
  };
  switch (geom.type) {
    case 'Polygon':         geom.coordinates.forEach(ring => push(ring, true)); break;
    case 'MultiPolygon':    geom.coordinates.forEach(poly => poly.forEach(ring => push(ring, true))); break;
    case 'LineString':      push(geom.coordinates, false); break;
    case 'MultiLineString': geom.coordinates.forEach(l => push(l, false)); break;
  }
}

// Decode one MapTiler v3 tile buffer → append water geometry to polys/lines.
// Classify by GEOMETRY TYPE (robust): water areas are polygons, waterways lines.
function decodeTile(buf, x, y, z, polys, lines) {
  const tile = new VectorTile(new Pbf(buf));
  for (const name of ['water', 'waterway']) {
    const layer = tile.layers[name];
    if (!layer) continue;
    for (let i = 0; i < layer.length; i++) {
      let gj; try { gj = layer.feature(i).toGeoJSON(x, y, z); } catch (_) { continue; }
      if (gj) collectGeo(gj.geometry, polys, lines);
    }
  }
}

async function fetchArrayBuffer(url, timeout) {
  const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  const to = ctrl ? setTimeout(() => ctrl.abort(), timeout || ATTEMPT_MS) : null;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl ? ctrl.signal : undefined });
    if (to) clearTimeout(to);
    if (res.status === 204 || res.status === 404) return null;   // empty tile → no water here
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return Buffer.from(await res.arrayBuffer());
  } catch (e) { if (to) clearTimeout(to); throw e; }
}

// Fetch + decode all tiles covering the bbox, within the time budget.
async function fetchWater(s, w, n, e) {
  if (!MAPTILER_KEY) throw new Error('MAPTILER_KEY not set');
  const z = pickZoom(s, w, n, e);
  const x0 = lon2tileX(w, z), x1 = lon2tileX(e, z);
  const y0 = lat2tileY(n, z), y1 = lat2tileY(s, z);
  const polys = [], lines = [];
  const deadline = Date.now() + BUDGET_MS;
  const jobs = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
    const remaining = deadline - Date.now();
    if (remaining <= 300) break;
    jobs.push(
      fetchArrayBuffer(tileUrl(z, x, y), Math.min(ATTEMPT_MS, remaining))
        .then(buf => { if (buf && buf.length) decodeTile(buf, x, y, z, polys, lines); })
        .catch(err => { console.warn(`[features] maptiler tile ${z}/${x}/${y} failed: ${err.message}`); })
    );
  }
  await Promise.all(jobs);
  return { polys, lines, z };
}

router.get('/', async (req, res) => {
  const bbox = String(req.query.bbox || '').split(',').map(Number);
  if (bbox.length !== 4 || bbox.some(v => !isFinite(v))) {
    return res.status(400).json({ error: 'bbox=south,west,north,east required', polys: [], lines: [] });
  }
  let [s, w, n, e] = bbox;
  if (s > n) [s, n] = [n, s];
  if (w > e) [w, e] = [e, w];
  if ((n - s) > 1.6 || (e - w) > 1.6) {
    return res.json({ bbox: [s, w, n, e], polys: [], lines: [], note: 'area too large for feature overlay' });
  }

  const layers = new Set(String(req.query.layers || 'water').split(',').map(x => x.trim()).filter(Boolean));
  const key = [s, w, n, e].map(v => v.toFixed(3)).join(',') + '|' + [...layers].sort().join(',');
  if (cache[key]) return res.json(cache[key]);
  if (!layers.has('water')) return res.json({ bbox: [s, w, n, e], polys: [], lines: [] });

  try {
    const { polys, lines } = await fetchWater(s, w, n, e);
    const out = { bbox: [s, w, n, e], polys, lines };
    cache[key] = out; saveCache();
    res.json(out);
  } catch (err) {
    console.error('[features] water fetch failed:', err.message);
    // Soft-fail 200 so the client treats it as "no overlay right now", never a 502.
    res.json({ bbox: [s, w, n, e], polys: [], lines: [], error: 'water source unavailable' });
  }
});

// ---- diagnostic: GET /api/features/diag --------------------------------
// Confirms live whether MapTiler is reachable + the key works, and decodes a
// sample tile so you can see real feature counts.
function tcpProbe(host, port, timeout) {
  return new Promise(resolve => {
    const t0 = Date.now();
    const sock = net.connect({ host, port, family: 4 });
    let done = false;
    const finish = (ok, err) => { if (done) return; done = true; try { sock.destroy(); } catch {} resolve({ ok, ms: Date.now() - t0, error: err }); };
    sock.setTimeout(timeout || 4000);
    sock.once('connect', () => finish(true));
    sock.once('timeout', () => finish(false, 'timeout'));
    sock.once('error', ev => finish(false, ev.code || ev.message));
  });
}
router.get('/diag', async (req, res) => {
  const out = { source: 'maptiler', node: process.version, hasGlobalFetch: typeof fetch === 'function',
    dnsOrder: (dns.getDefaultResultOrder && dns.getDefaultResultOrder()) || 'unknown',
    maptilerKeySet: !!MAPTILER_KEY, host: MT_HOST };
  try { out.dnsA = await dns.promises.resolve4(MT_HOST); } catch (e) { out.dnsA = 'ERR ' + (e.code || e.message); }
  out.tcp443 = await tcpProbe(MT_HOST, 443, 4000);
  // Sample tile over Seattle / Puget Sound (z10) — should have water.
  const z = 10, x = lon2tileX(-122.33, z), y = lat2tileY(47.61, z);
  const t0 = Date.now();
  try {
    const buf = await fetchArrayBuffer(tileUrl(z, x, y), ATTEMPT_MS);
    if (!buf) { out.sampleTile = { z, x, y, ok: true, empty: true, ms: Date.now() - t0 }; }
    else {
      const polys = [], lines = [];
      decodeTile(buf, x, y, z, polys, lines);
      out.sampleTile = { z, x, y, ok: true, ms: Date.now() - t0, bytes: buf.length, polys: polys.length, lines: lines.length };
    }
  } catch (e) { out.sampleTile = { z, x, y, ok: false, ms: Date.now() - t0, error: e.message }; }
  res.json(out);
});

module.exports = router;
// exported for unit tests
module.exports.decodeTile = decodeTile;
module.exports.collectGeo = collectGeo;
module.exports.pickZoom   = pickZoom;
module.exports.lon2tileX  = lon2tileX;
module.exports.lat2tileY  = lat2tileY;
