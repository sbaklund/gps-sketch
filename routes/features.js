'use strict';

/**
 * routes/features.js
 *
 * GET /api/features?bbox=<south,west,north,east>&layers=water
 *
 * Map-feature overlays for the topo poster (roads/rivers/lakes push, F1 = water).
 * Returns geometry in a small, source-agnostic shape so the client never has to
 * know where it came from:
 *
 *   { bbox:[s,w,n,e], polys:[ [[lon,lat],…], … ], lines:[ [[lon,lat],…], … ] }
 *
 *   polys = filled areas (lakes, reservoirs, riverbanks, bays)
 *   lines = strokes      (rivers, streams, canals, coastline)
 *
 * F1 data source = Overpass API (OpenStreetMap), server-side, disk-cached like
 * geocode.js. The contract above is deliberately decoupled from Overpass: if we
 * later swap to MapTiler vector tiles for scale, only this file changes.
 *
 * ── v0.34.0 fetch hardening ────────────────────────────────────────────────
 * Symptom (Render logs): every Overpass call fails with "fetch failed" — a
 * CONNECTION-level error (socket never opened), NOT an HTTP status — while the
 * geocoder's Nominatim GET works fine from the same host. Classic Node/undici
 * IPv6 signature: fetch resolves an AAAA record and the container's IPv6 egress
 * is dead, so it errors instead of trying IPv4.
 *   1. Force IPv4 DNS order (`dns.setDefaultResultOrder('ipv4first')`) so every
 *      outbound socket prefers A records. Zero-dependency, the canonical fix.
 *   2. Bound the whole request: short per-attempt timeout + a total-time budget,
 *      so /api/features ALWAYS returns a fast 200-empty on failure instead of
 *      hanging past the proxy timeout and surfacing as a 502 in the client.
 *   3. /api/features/diag is now definitive — it resolves A/AAAA, raw-TCP-tests
 *      :443, and reports per-mirror fetch results, so one look pinpoints whether
 *      the problem is DNS, IPv6-only, a datacenter-IP block, or an HTTP block.
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const dns     = require('node:dns');
const net     = require('node:net');

// Prefer IPv4 for every outbound connection from this process. Most cloud
// containers have working IPv4 but broken/absent IPv6 egress; Node's fetch
// otherwise picks an AAAA record and dies with a bare "fetch failed".
try { dns.setDefaultResultOrder('ipv4first'); } catch (_) {}

const router = express.Router();

const UA = 'GPXSketch/1.0 (route-art poster generator; contact via gpxsketch)';
// Several public Overpass mirrors — we try them in order so one being down or
// rate-limiting doesn't kill the overlay.
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

// Request bounding. Keep the whole feature request short so the client never
// waits long and Render's proxy never times us out into a 502.
const ATTEMPT_MS = 5000;   // per mirror×method attempt
const BUDGET_MS  = 11000;  // hard cap across all attempts

const CACHE_DIR = path.join(__dirname, '..', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'features-cache.json');

// ---- tiny disk cache (keyed by rounded bbox + layers) -------------------
let cache = {};
try { if (fs.existsSync(CACHE_FILE)) cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch {}
function saveCache() {
  try { fs.mkdirSync(CACHE_DIR, { recursive: true }); fs.writeFileSync(CACHE_FILE, JSON.stringify(cache)); } catch {}
}

const r6 = n => Math.round(n * 1e6) / 1e6;   // ~0.1 m precision — plenty for a poster

// Decimate an over-dense ring/line so payloads and SVG stay light.
function decimate(coords, max) {
  if (coords.length <= max) return coords;
  const step = Math.ceil(coords.length / max);
  const out = [];
  for (let i = 0; i < coords.length; i += step) out.push(coords[i]);
  if (out[out.length - 1] !== coords[coords.length - 1]) out.push(coords[coords.length - 1]);
  return out;
}

// Build the Overpass query for the requested layers within a bbox.
function overpassQuery(s, w, n, e, layers) {
  const box = `(${s},${w},${n},${e})`;
  const parts = [];
  if (layers.has('water')) {
    // Filled areas: lakes, reservoirs, riverbanks, and — key for coastal cities
    // like Seattle/Puget Sound — bays and straits, which map big open water as
    // fillable polygons (coastline alone is only a line, so a sound would show
    // as a thin stroke, not a filled body).
    parts.push(`way["natural"="water"]${box};`);
    parts.push(`way["natural"="bay"]${box};`);
    parts.push(`way["natural"="strait"]${box};`);
    parts.push(`way["waterway"~"^(river|stream|canal|riverbank|ditch)$"]${box};`);
    parts.push(`way["natural"="coastline"]${box};`);
    parts.push(`relation["natural"="water"]${box};`);
    parts.push(`relation["natural"="bay"]${box};`);
  }
  return `[out:json][timeout:20];(${parts.join('')});out geom;`;
}

// Turn one Overpass element's geometry into [ [lon,lat], … ] (rounded).
function geomToCoords(geometry) {
  if (!Array.isArray(geometry)) return null;
  const c = [];
  for (const g of geometry) {
    if (g && isFinite(g.lon) && isFinite(g.lat)) c.push([r6(g.lon), r6(g.lat)]);
  }
  return c.length ? c : null;
}

function isClosed(c) {
  if (c.length < 4) return false;
  const a = c[0], b = c[c.length - 1];
  return a[0] === b[0] && a[1] === b[1];
}

// Parse an Overpass JSON response into { polys, lines }.
function parseOverpass(json) {
  const polys = [], lines = [];
  const els = (json && json.elements) || [];
  for (const el of els) {
    const tags = el.tags || {};
    if (el.type === 'way') {
      const c = geomToCoords(el.geometry);
      if (!c) continue;
      const isWaterArea = tags.natural === 'water' || tags.natural === 'bay'
        || tags.natural === 'strait' || tags.waterway === 'riverbank';
      if (isWaterArea && c.length >= 4) {
        polys.push(decimate(c, 600));
      } else if (tags.waterway || tags.natural === 'coastline') {
        if (c.length >= 2) lines.push(decimate(c, 600));
      } else if (isClosed(c) && c.length >= 4) {
        polys.push(decimate(c, 600));
      }
    } else if (el.type === 'relation' && Array.isArray(el.members)) {
      // natural=water / natural=bay multipolygon: draw each member way as a
      // filled ring. (Inner "hole" rings are drawn as fills too — acceptable
      // for poster art; noted as a later-fidelity item.)
      for (const m of el.members) {
        if (m && m.type === 'way' && m.geometry) {
          const c = geomToCoords(m.geometry);
          if (c && c.length >= 4) polys.push(decimate(c, 600));
        }
      }
    }
  }
  return { polys, lines };
}

// Hit one Overpass mirror. Default method is GET (`?data=<query>`) — the SAME
// request style as the geocoder's Nominatim call, which is known to work from
// the deploy host; a POST fallback covers mirrors that prefer it. `timeout`
// bounds the attempt. Returns parsed JSON, or throws with the status + a body
// snippet (where Overpass reports "rate_limited" / syntax errors).
async function hitOverpass(url, query, method, timeout) {
  const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  const to = ctrl ? setTimeout(() => ctrl.abort(), timeout || ATTEMPT_MS) : null;
  try {
    const opts = { headers: { 'User-Agent': UA, 'Accept': 'application/json' }, signal: ctrl ? ctrl.signal : undefined };
    let target = url;
    if (method === 'POST') {
      opts.method = 'POST';
      opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      opts.body = 'data=' + encodeURIComponent(query);
    } else {
      target = url + '?data=' + encodeURIComponent(query);   // GET
    }
    const res = await fetch(target, opts);
    if (to) clearTimeout(to);
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 160).replace(/\s+/g, ' ')}`);
    try { return JSON.parse(text); }
    catch { throw new Error(`non-JSON: ${text.slice(0, 160).replace(/\s+/g, ' ')}`); }
  } catch (e) {
    if (to) clearTimeout(to);
    throw e;
  }
}

// Try mirrors × methods within a total time budget. Fails fast and never runs
// long enough to trip Render's proxy timeout (which is what turned into a 502).
async function fetchOverpass(query) {
  const deadline = Date.now() + BUDGET_MS;
  let lastErr;
  for (const url of OVERPASS_MIRRORS) {
    for (const method of ['GET', 'POST']) {
      const remaining = deadline - Date.now();
      if (remaining <= 250) { lastErr = lastErr || new Error('feature request budget exhausted'); return Promise.reject(lastErr); }
      try { return await hitOverpass(url, query, method, Math.min(ATTEMPT_MS, remaining)); }
      catch (e) { lastErr = e; console.warn(`[features] overpass ${method} failed (${url}): ${e.message}`); }
    }
  }
  throw lastErr || new Error('all overpass mirrors failed');
}

router.get('/', async (req, res) => {
  const bbox = String(req.query.bbox || '').split(',').map(Number);
  if (bbox.length !== 4 || bbox.some(v => !isFinite(v))) {
    return res.status(400).json({ error: 'bbox=south,west,north,east required', polys: [], lines: [] });
  }
  let [s, w, n, e] = bbox;
  if (s > n) [s, n] = [n, s];
  if (w > e) [w, e] = [e, w];

  // Guard against absurdly large queries (whole-continent / very-zoomed-out).
  if ((n - s) > 1.6 || (e - w) > 1.6) {
    return res.json({ bbox: [s, w, n, e], polys: [], lines: [], note: 'area too large for feature overlay' });
  }

  const layers = new Set(String(req.query.layers || 'water').split(',').map(x => x.trim()).filter(Boolean));
  const key = [s, w, n, e].map(v => v.toFixed(3)).join(',') + '|' + [...layers].sort().join(',');
  if (cache[key]) return res.json(cache[key]);

  try {
    const json = await fetchOverpass(overpassQuery(s, w, n, e, layers));
    const { polys, lines } = parseOverpass(json);
    const out = { bbox: [s, w, n, e], polys, lines };
    cache[key] = out;
    saveCache();
    res.json(out);
  } catch (err) {
    console.error('[features] all overpass mirrors failed:', err.message);
    // Soft-fail with 200 so the client treats it as "no overlay right now"
    // rather than a scary network error; the poster is fine without it.
    res.json({ bbox: [s, w, n, e], polys: [], lines: [], error: 'overpass unavailable' });
  }
});

// ---- diagnostic: GET /api/features/diag --------------------------------
// Visit this in a browser on the deployed site to see exactly why the water
// overlay can't reach Overpass. It answers, per mirror:
//   • does DNS resolve A (IPv4) and AAAA (IPv6) records?
//   • can we open a raw TCP socket to :443 on the IPv4 address? (error code
//     distinguishes "network unreachable / blocked" from a working route)
//   • does the actual GET/POST fetch succeed, and how many elements come back?
// Between those three, one look tells us: DNS problem, IPv6-only failure,
// datacenter-IP block (TCP refused/timeout), or HTTP-level block (403/429).
function hostOf(url) { try { return new URL(url).hostname; } catch { return url; } }

function tcpProbe(host, port, timeout) {
  return new Promise(resolve => {
    const t0 = Date.now();
    const sock = net.connect({ host, port, family: 4 });
    let done = false;
    const finish = (ok, err) => { if (done) return; done = true; try { sock.destroy(); } catch {} resolve({ ok, ms: Date.now() - t0, error: err }); };
    sock.setTimeout(timeout || 4000);
    sock.once('connect', () => finish(true));
    sock.once('timeout', () => finish(false, 'timeout'));
    sock.once('error', e => finish(false, e.code || e.message));
  });
}

router.get('/diag', async (req, res) => {
  const q = '[out:json][timeout:15];(way["natural"="water"](40.00,-105.30,40.05,-105.25););out geom 5;';
  const mirrors = [];
  for (const url of OVERPASS_MIRRORS) {
    const host = hostOf(url);
    const entry = { url, host, dns: {}, tcp443: null, fetch: {} };
    // DNS
    try { entry.dns.A    = await dns.promises.resolve4(host); } catch (e) { entry.dns.A    = 'ERR ' + (e.code || e.message); }
    try { entry.dns.AAAA = await dns.promises.resolve6(host); } catch (e) { entry.dns.AAAA = 'ERR ' + (e.code || e.message); }
    // Raw TCP to :443 (IPv4)
    entry.tcp443 = await tcpProbe(host, 443, 4000);
    // Real fetch, both methods
    for (const method of ['GET', 'POST']) {
      const t0 = Date.now();
      try {
        const json = await hitOverpass(url, q, method, ATTEMPT_MS);
        entry.fetch[method] = { ok: true, ms: Date.now() - t0, elements: (json.elements || []).length };
      } catch (e) {
        entry.fetch[method] = { ok: false, ms: Date.now() - t0, error: e.message };
      }
    }
    mirrors.push(entry);
  }
  res.json({
    node: process.version,
    hasGlobalFetch: typeof fetch === 'function',
    dnsOrder: (dns.getDefaultResultOrder && dns.getDefaultResultOrder()) || 'unknown',
    mirrors,
  });
});

module.exports = router;
module.exports.parseOverpass = parseOverpass;   // exported for unit tests
