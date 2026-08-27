'use strict';

/**
 * routes/geocode.js
 *
 * GET /api/geocode?lat=&lon=&hilat=&hilon=
 *
 * Turns a route location into a poster subtitle using a priority ladder:
 *   1. National Park            → "Rocky Mountain National Park"
 *   2. National Forest / Wild.  → "Arapaho National Forest"
 *   3. State / Regional Park    → "Chugach State Park"
 *   4. Single summited peak     → "Mount Tamalpais"  (only if hilat/hilon given
 *                                  AND exactly one named peak sits at that point)
 *   5. City/Town, Full State    → "Golden, Colorado"
 *   6. County, Full State       → "Boulder County, Colorado"
 *   7. State / Region           → "Colorado"  (full region name, US or intl.)
 *
 * GET /api/geocode/search?q=            (forward search — Place/Explore mode)
 *   → { q, results:[{ name, context, displayName, lat, lon, bbox, type, class }] }
 *
 * lat/lon   = route centroid (used for tiers 1-3, 5-7)
 * hilat/hilon = route's highest point (optional; used only for tier 4)
 *
 * All lookups go through Nominatim server-side (compliant User-Agent, cached).
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const router = express.Router();

const UA = 'GPXSketch/1.0 (route-art poster generator)';
const CACHE_DIR = path.join(__dirname, '..', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'geocode-cache.json');

// ---- tiny disk cache (keyed by rounded coords) --------------------------
let cache = {};
try { if (fs.existsSync(CACHE_FILE)) cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch {}
function saveCache() {
  try { fs.mkdirSync(CACHE_DIR, { recursive: true }); fs.writeFileSync(CACHE_FILE, JSON.stringify(cache)); } catch {}
}
const keyOf = (lat, lon) => `${lat.toFixed(3)},${lon.toFixed(3)}`;

// ---- Nominatim helpers --------------------------------------------------
async function reverse(lat, lon, zoom = 12) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=${zoom}&extratags=1&namedetails=1&accept-language=en`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`nominatim ${res.status}`);
  return res.json();
}

// Look for a named natural peak within ~250m of the high point.
async function peakAt(lat, lon) {
  // Nominatim reverse with a very tight zoom favours the nearest feature.
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=17&namedetails=1&accept-language=en`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const g = await res.json();
  const a = g.address || {};
  // Accept only if the returned feature is actually a peak and named.
  const cls = g.category || g.class;
  const type = g.type;
  const name = (g.namedetails && (g.namedetails.name || g.namedetails['name:en'])) || a.peak || '';
  if (name && (type === 'peak' || cls === 'natural' && type === 'peak')) {
    // distance guard: Nominatim returns the feature centre; make sure it's close
    if (g.lat && g.lon) {
      const d = haversine(lat, lon, +g.lat, +g.lon);
      if (d > 400) return null; // more than ~400m from the summit → not "on" it
    }
    return name;
  }
  return null;
}

function haversine(la1, lo1, la2, lo2) {
  const R = 6371000, toR = Math.PI / 180;
  const dLa = (la2 - la1) * toR, dLo = (lo2 - lo1) * toR;
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * toR) * Math.cos(la2 * toR) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ---- the priority ladder ------------------------------------------------
function buildSubtitle(g, peakName) {
  const a = g.address || {};
  const x = g.extratags || {};
  const isUS = a.country_code === 'us';

  // Tier 1: National Park
  const natPark = a.national_park
    || (x.protection_title && /national park/i.test(x.protection_title) ? (a.protected_area || a.leisure) : '')
    || (a.protected_area && /national park/i.test(a.protected_area) ? a.protected_area : '');
  if (natPark) return { subtitle: cleanName(natPark), tier: 'national_park' };

  // Tier 2: National Forest / Wilderness
  const forest = pickMatch([a.protected_area, a.forest, a.leisure, x.protection_title],
                           /national forest|national grassland|wilderness/i);
  if (forest) return { subtitle: cleanName(forest), tier: 'national_forest' };

  // Tier 3: State / Regional Park
  const statePark = pickMatch([a.protected_area, a.park, a.leisure, x.protection_title],
                              /state park|regional park|state recreation|provincial park|country park/i);
  if (statePark) return { subtitle: cleanName(statePark), tier: 'state_park' };
  // generic leisure park with a real name (e.g. "Golden Gate Park")
  if (a.park) return { subtitle: cleanName(a.park), tier: 'park' };

  // Tier 4: single summited peak (only when caller found one)
  if (peakName) return { subtitle: cleanName(peakName), tier: 'peak' };

  // Tier 5: City/Town, State
  const city = a.city || a.town || a.village || a.hamlet || a.municipality || '';
  const region = a.state || a.region || a.province || '';
  if (city && region) {
    // US → full state name (already full from Nominatim). Intl → full region name.
    return { subtitle: `${city}, ${region}`, tier: 'city' };
  }
  if (city) return { subtitle: city, tier: 'city_only' };

  // Tier 6: County, State
  const county = a.county || a.district || '';
  if (county && region) return { subtitle: `${county}, ${region}`, tier: 'county' };

  // Tier 7: State / Region
  if (region) return { subtitle: region, tier: 'region' };

  // Absolute fallback
  const parts = (g.display_name || '').split(',').map(s => s.trim()).filter(Boolean);
  return { subtitle: parts.slice(0, 2).join(', ') || 'Route', tier: 'fallback' };
}

function pickMatch(candidates, re) {
  for (const c of candidates) if (c && re.test(c)) return c;
  return '';
}
function cleanName(s) {
  return String(s).replace(/\s+/g, ' ').trim();
}

// A short "context" line for a search hit: "<region>, <country>" without
// repeating the place's own name. Used as the poster subtitle in Place mode.
function contextOf(g) {
  const a = g.address || {};
  const region = a.state || a.region || a.province || a.county || '';
  const country = a.country || '';
  return cleanName([region, country].filter(Boolean).join(', '));
}

// ---- route: reverse (subtitle ladder) -----------------------------------
router.get('/', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  if (!isFinite(lat) || !isFinite(lon)) return res.status(400).json({ error: 'lat/lon required' });
  const hilat = parseFloat(req.query.hilat);
  const hilon = parseFloat(req.query.hilon);
  const hasHigh = isFinite(hilat) && isFinite(hilon);

  const cacheKey = keyOf(lat, lon) + (hasHigh ? '|' + keyOf(hilat, hilon) : '');
  if (cache[cacheKey]) return res.json(cache[cacheKey]);

  try {
    const g = await reverse(lat, lon);

    // Peak tier only if we have a high point AND it's meaningfully far from the
    // centroid (a summit run climbs away from its middle). If the high point IS
    // basically the centroid, a peak is still fine.
    let peakName = null;
    if (hasHigh) {
      try { peakName = await peakAt(hilat, hilon); } catch {}
    }

    const out = buildSubtitle(g, peakName);
    cache[cacheKey] = out;
    saveCache();
    res.json(out);
  } catch (e) {
    console.error('[geocode] error:', e.message);
    res.status(502).json({ error: e.message, subtitle: '' });
  }
});

// ---- route: forward search (Place / Explore mode) -----------------------
// GET /api/geocode/search?q=<place name>
// Returns up to 5 matches with coordinates + a bounding box so the client can
// frame the poster. Same Nominatim client + disk cache + compliant UA.
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'q required', results: [] });
  if (q.length > 120) return res.status(400).json({ error: 'query too long', results: [] });

  const cacheKey = 'search:' + q.toLowerCase();
  if (cache[cacheKey]) return res.json(cache[cacheKey]);

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}`
      + `&format=jsonv2&limit=5&addressdetails=1&namedetails=1&accept-language=en`;
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`nominatim ${r.status}`);
    const arr = await r.json();

    const results = (Array.isArray(arr) ? arr : []).map(g => {
      const name = (g.namedetails && (g.namedetails.name || g.namedetails['name:en']))
        || g.name || (g.display_name || '').split(',')[0] || q;
      const bb = (g.boundingbox || []).map(Number);
      const hasBox = bb.length === 4 && bb.every(Number.isFinite);
      return {
        name: cleanName(name),
        context: contextOf(g),
        displayName: g.display_name || '',
        lat: parseFloat(g.lat),
        lon: parseFloat(g.lon),
        // Nominatim boundingbox order is [south, north, west, east].
        bbox: hasBox ? { minLat: bb[0], maxLat: bb[1], minLon: bb[2], maxLon: bb[3] } : null,
        type: g.type || '',
        class: g.category || g.class || '',
      };
    }).filter(x => isFinite(x.lat) && isFinite(x.lon));

    const out = { q, results };
    cache[cacheKey] = out;
    saveCache();
    res.json(out);
  } catch (e) {
    console.error('[geocode/search] error:', e.message);
    res.status(502).json({ error: e.message, results: [] });
  }
});

module.exports = router;
