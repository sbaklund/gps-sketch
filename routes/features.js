'use strict';

/**
 * routes/features.js
 *
 * GET /api/features?bbox=<south,west,north,east>&layers=water
 *   → { bbox:[s,w,n,e], polys:[ [[lon,lat],…], … ], lines:[ [[lon,lat],…], … ] }
 *     polys = filled areas (lakes, oceans, bays, reservoirs)
 *     lines = strokes      (rivers, streams, canals)
 *
 * ── v0.40.0 DATA SOURCE = MapTiler vector tiles, ZERO npm dependencies ─────
 * Overpass is unreachable from Render (confirmed live). Water now comes from
 * MapTiler's OpenMapTiles "v3" vector tiles — a CDN Render already reaches for
 * elevation. We decode the Mapbox-Vector-Tile protobuf with a SMALL SELF-
 * CONTAINED decoder below (no @mapbox/vector-tile, no pbf) so a deploy can never
 * fail on a missing node_module — the whole endpoint is plain Node + global
 * fetch. Layers used: `water` (polygons → polys), `waterway` (lines → lines).
 * The client + `{bbox,polys,lines}` contract are unchanged.
 *
 * Kept: disk cache, a hard time budget (never 502), soft-fail to an empty
 * overlay, and a /diag endpoint that decodes a Seattle sample tile.
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const dns     = require('node:dns');
const net     = require('node:net');

try { dns.setDefaultResultOrder('ipv4first'); } catch (_) {}

const router = express.Router();

const MAPTILER_KEY = (process.env.MAPTILER_KEY || '').trim();
const MT_HOST = 'api.maptiler.com';
const tileUrl = (z, x, y) => `https://${MT_HOST}/tiles/v3/${z}/${x}/${y}.pbf?key=${MAPTILER_KEY}`;
const UA = 'GPXSketch/1.0 (route-art poster generator)';

const ATTEMPT_MS = 4500;
const BUDGET_MS  = 10000;
const MAX_TILES  = 12;
const MT_MAXZOOM = 14;

const CACHE_DIR  = path.join(__dirname, '..', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'features-cache.json');
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

// ---- Web-Mercator tile math --------------------------------------------
const lon2tileX = (lon, z) => Math.floor((lon + 180) / 360 * Math.pow(2, z));
const lat2tileY = (lat, z) => {
  const r = lat * Math.PI / 180;
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z));
};
// tile-local (0..extent) within tile (tx,ty) at zoom z → [lon,lat]
function tileToLonLat(txf, tyf, z) {
  const n = Math.pow(2, z);
  const lon = txf / n * 360 - 180;
  const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * tyf / n))) * 180 / Math.PI;
  return [r6(lon), r6(lat)];
}
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

// ==========================================================================
//  Minimal Mapbox-Vector-Tile decoder (protobuf subset) — no dependencies.
//  Reads only what we need: layer name, extent, and each feature's geometry
//  type + geometry commands. Tags/values/ids are skipped.
// ==========================================================================
class Reader {
  constructor(buf) { this.b = buf; this.p = 0; this.len = buf.length; }
  varint() { let b, val = 0, shift = 0;
    do { b = this.b[this.p++]; val += (b & 0x7f) * Math.pow(2, shift); shift += 7; } while (b >= 0x80);
    return val; }
  skip(wire) {
    if (wire === 0) this.varint();
    else if (wire === 2) { const l = this.varint(); this.p += l; }
    else if (wire === 5) this.p += 4;
    else if (wire === 1) this.p += 8;
    else throw new Error('bad wiretype ' + wire);
  }
}
const zigzag = n => (Math.floor(n) & 1) ? -((Math.floor(n) + 1) / 2) : Math.floor(n) / 2;

// Decode packed geometry commands → array of point-rings/lines in tile coords.
function decodeGeometry(b, start, end) {
  const r = new Reader(b); r.p = start;
  let x = 0, y = 0; const out = []; let cur = null;
  while (r.p < end) {
    const cmdInt = r.varint(); const cmd = cmdInt & 0x7; let count = Math.floor(cmdInt / 8);
    if (cmd === 1) {            // MoveTo — starts a new ring/line per point
      for (let i = 0; i < count; i++) { x += zigzag(r.varint()); y += zigzag(r.varint()); cur = [[x, y]]; out.push(cur); }
    } else if (cmd === 2) {     // LineTo
      for (let i = 0; i < count; i++) { x += zigzag(r.varint()); y += zigzag(r.varint()); if (cur) cur.push([x, y]); }
    } else if (cmd === 7) {     // ClosePath
      if (cur && cur.length) cur.push([cur[0][0], cur[0][1]]);
    } else break;
  }
  return out;
}

// Decode one tile buffer, appending `water`/`waterway` geometry to polys/lines.
function decodeTile(buf, tx, ty, z, polys, lines) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  const r = new Reader(b);
  while (r.p < r.len) {                       // Tile: repeated Layer = field 3
    const tag = r.varint(), field = Math.floor(tag / 8), wire = tag & 7;
    if (field === 3 && wire === 2) {
      const len = r.varint(); const end = r.p + len;
      decodeLayer(b, r.p, end, tx, ty, z, polys, lines);
      r.p = end;
    } else r.skip(wire);
  }
}
function decodeLayer(b, start, end, tx, ty, z, polys, lines) {
  const r = new Reader(b); r.p = start;
  let name = '', extent = 4096; const feats = [];
  while (r.p < end) {
    const tag = r.varint(), field = Math.floor(tag / 8), wire = tag & 7;
    if (field === 1 && wire === 2) { const l = r.varint(); name = b.toString('utf8', r.p, r.p + l); r.p += l; }
    else if (field === 5 && wire === 0) { extent = r.varint(); }
    else if (field === 2 && wire === 2) { const l = r.varint(); feats.push([r.p, r.p + l]); r.p += l; }
    else r.skip(wire);
  }
  if (name !== 'water' && name !== 'waterway') return;
  for (const [fs, fe] of feats) decodeFeature(b, fs, fe, extent, tx, ty, z, polys, lines);
}
function decodeFeature(b, start, end, extent, tx, ty, z, polys, lines) {
  const r = new Reader(b); r.p = start;
  let gtype = 0, gStart = -1, gEnd = -1;
  while (r.p < end) {
    const tag = r.varint(), field = Math.floor(tag / 8), wire = tag & 7;
    if (field === 3 && wire === 0) gtype = r.varint();
    else if (field === 4 && wire === 2) { const l = r.varint(); gStart = r.p; gEnd = r.p + l; r.p += l; }
    else r.skip(wire);
  }
  if (gStart < 0) return;
  const parts = decodeGeometry(b, gStart, gEnd);
  const conv = pt => tileToLonLat(tx + pt[0] / extent, ty + pt[1] / extent, z);
  if (gtype === 3) { for (const ring of parts) if (ring.length >= 4) polys.push(decimate(ring.map(conv), 600)); }
  else if (gtype === 2) { for (const ln of parts) if (ln.length >= 2) lines.push(decimate(ln.map(conv), 600)); }
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
        .then(buf => { if (buf && buf.length) { try { decodeTile(buf, x, y, z, polys, lines); } catch (e) { console.warn('[features] decode ' + z + '/' + x + '/' + y + ': ' + e.message); } } })
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
    res.json({ bbox: [s, w, n, e], polys: [], lines: [], error: 'water source unavailable' });
  }
});

// ---- diagnostic: GET /api/features/diag --------------------------------
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
  const out = { source: 'maptiler (zero-dep decoder)', node: process.version, hasGlobalFetch: typeof fetch === 'function',
    dnsOrder: (dns.getDefaultResultOrder && dns.getDefaultResultOrder()) || 'unknown',
    maptilerKeySet: !!MAPTILER_KEY, host: MT_HOST };
  try { out.dnsA = await dns.promises.resolve4(MT_HOST); } catch (e) { out.dnsA = 'ERR ' + (e.code || e.message); }
  out.tcp443 = await tcpProbe(MT_HOST, 443, 4000);
  const z = 10, x = lon2tileX(-122.33, z), y = lat2tileY(47.61, z);
  const t0 = Date.now();
  try {
    const buf = await fetchArrayBuffer(tileUrl(z, x, y), ATTEMPT_MS);
    if (!buf) out.sampleTile = { z, x, y, ok: true, empty: true, ms: Date.now() - t0 };
    else { const polys = [], lines = []; decodeTile(buf, x, y, z, polys, lines);
      out.sampleTile = { z, x, y, ok: true, ms: Date.now() - t0, bytes: buf.length, polys: polys.length, lines: lines.length }; }
  } catch (e) { out.sampleTile = { z, x, y, ok: false, ms: Date.now() - t0, error: e.message }; }
  res.json(out);
});

module.exports = router;
module.exports.decodeTile = decodeTile;
module.exports.pickZoom   = pickZoom;
module.exports.lon2tileX  = lon2tileX;
module.exports.lat2tileY  = lat2tileY;
