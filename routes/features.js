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
 *   polys = filled areas (lakes, reservoirs, riverbanks)
 *   lines = strokes      (rivers, streams, canals, coastline)
 *
 * F1 data source = Overpass API (OpenStreetMap), server-side, disk-cached like
 * geocode.js. The contract above is deliberately decoupled from Overpass: if we
 * later swap to MapTiler vector tiles for scale, only this file changes.
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const router = express.Router();

const UA = 'GPXSketch/1.0 (route-art poster generator; contact via gpxsketch)';
// Several public Overpass mirrors — we try them in order so one being down or
// rate-limiting doesn't kill the overlay.
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];
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
    parts.push(`way["natural"="water"]${box};`);
    parts.push(`way["waterway"~"^(river|stream|canal|riverbank|ditch)$"]${box};`);
    parts.push(`way["natural"="coastline"]${box};`);
    parts.push(`relation["natural"="water"]${box};`);
  }
  return `[out:json][timeout:25];(${parts.join('')});out geom;`;
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
      const isWaterArea = tags.natural === 'water' || tags.waterway === 'riverbank';
      if (isWaterArea && c.length >= 4) {
        polys.push(decimate(c, 600));
      } else if (tags.waterway || tags.natural === 'coastline') {
        if (c.length >= 2) lines.push(decimate(c, 600));
      } else if (isClosed(c) && c.length >= 4) {
        polys.push(decimate(c, 600));
      }
    } else if (el.type === 'relation' && Array.isArray(el.members)) {
      // natural=water multipolygon: draw each member way as a filled ring.
      // (Inner "hole" rings are drawn as fills too — acceptable for poster art.)
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

// POST one Overpass mirror with the canonical `data=` form encoding. Returns
// parsed JSON, or throws with a helpful message (status + a snippet of the body,
// which is where Overpass puts its "rate_limited" / syntax errors).
async function postOverpass(url, query) {
  const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  const to = ctrl ? setTimeout(() => ctrl.abort(), 25000) : null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
      body: 'data=' + encodeURIComponent(query),
      signal: ctrl ? ctrl.signal : undefined,
    });
    if (to) clearTimeout(to);
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 160).replace(/\s+/g, ' ')}`);
    try { return JSON.parse(text); }
    catch { throw new Error(`non-JSON reply: ${text.slice(0, 160).replace(/\s+/g, ' ')}`); }
  } catch (e) {
    if (to) clearTimeout(to);
    throw e;
  }
}

async function fetchOverpass(query) {
  let lastErr;
  for (const url of OVERPASS_MIRRORS) {
    try {
      const json = await postOverpass(url, query);
      return json;
    } catch (e) {
      lastErr = e;
      console.warn(`[features] overpass mirror failed (${url}): ${e.message}`);
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

module.exports = router;
module.exports.parseOverpass = parseOverpass;   // exported for unit tests
