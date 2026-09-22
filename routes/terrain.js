'use strict';

/**
 * routes/terrain.js
 *
 * GET /api/terrain?lat=&lon=&zoom=&source=
 *
 * Query params:
 *   lat     {number}  Centre latitude  (decimal degrees, required)
 *   lon     {number}  Centre longitude (decimal degrees, required)
 *   zoom    {number}  Zoom level 7–13  (integer, optional — defaults to auto)
 *   source  {string}  'openmeteo' | 'maptiler' (optional — defaults to 'openmeteo')
 *
 * Response (200):
 *   {
 *     data:   number[],  // flat Float64 array as JSON array, R_W × R_H values in feet
 *     minFt:  number,
 *     maxFt:  number,
 *     width:  number,    // always R_W (340)
 *     height: number,    // always R_H (414)
 *     zoom:   number,    // zoom level actually used
 *     cached: boolean,
 *     source: string
 *   }
 *
 * Error responses:
 *   400  Bad / missing query params
 *   503  Upstream elevation provider failed
 */

const fs      = require('fs');
const path    = require('path');
const express = require('express');

const { makeFrame, cacheKey, R_W, R_H } = require('../lib/gridBuilder');
const openmeteo = require('../lib/openmeteo');
const maptiler  = require('../lib/maptiler');

const router   = express.Router();
const CACHE_DIR = path.join(__dirname, '..', 'cache');

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

function cachePath(key) {
  return path.join(CACHE_DIR, `${key}.json`);
}

function readCache(key) {
  try {
    const raw = fs.readFileSync(cachePath(key), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(key, payload) {
  try {
    // Ensure cache dir exists (first run)
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cachePath(key), JSON.stringify(payload), 'utf8');
  } catch (err) {
    // Non-fatal — a cache write failure just means the next request re-fetches
    console.warn(`[terrain] Cache write failed for ${key}: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Auto zoom selection
// ---------------------------------------------------------------------------

/**
 * Pick a sensible default zoom from lat/lon alone.
 * The front end uses zoom 10 for most routes; we mirror that default.
 * Callers can override with an explicit ?zoom= param.
 */
function defaultZoom() {
  return 10;
}

// ---------------------------------------------------------------------------
// Param validation
// ---------------------------------------------------------------------------

/**
 * Parse and validate the incoming query string.
 * Returns { lat, lon, zoom, source } or throws with a human-readable message.
 */
function parseParams(query) {
  const lat = parseFloat(query.lat);
  const lon = parseFloat(query.lon);

  if (!Number.isFinite(lat) || lat < -90  || lat > 90)  throw new Error('lat must be a number between -90 and 90');
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error('lon must be a number between -180 and 180');

  const zoom = query.zoom !== undefined
    ? parseInt(query.zoom, 10)
    : defaultZoom();

  if (!Number.isInteger(zoom) || zoom < 7 || zoom > 13) {
    throw new Error('zoom must be an integer between 7 and 13');
  }

  const source = query.source ?? 'auto';
  if (!['auto', 'openmeteo', 'maptiler'].includes(source)) {
    throw new Error('source must be "auto", "openmeteo", or "maptiler"');
  }

  if (source === 'maptiler' && !process.env.MAPTILER_KEY) {
    throw new Error('source=maptiler requested but MAPTILER_KEY is not set on the server');
  }

  return { lat, lon, zoom, source };
}

// ---------------------------------------------------------------------------
// Automatic source resolution
// ---------------------------------------------------------------------------

/**
 * When the caller doesn't care which provider serves the data (source=auto,
 * the only mode the front end uses now), prefer MapTiler's higher detail when
 * a key is configured, and fall back to Open-Meteo automatically if that
 * fails for any reason. The caller never needs to know which one won.
 */
async function resolveAuto(frame) {
  if (process.env.MAPTILER_KEY) {
    try {
      const result = await maptiler.fetchElevation(frame, process.env.MAPTILER_KEY);
      return { result, usedSource: 'maptiler' };
    } catch (err) {
      console.warn(`[terrain] auto: maptiler failed (${err.message}) — falling back to openmeteo`);
    }
  }
  const result = await openmeteo.fetchElevation(frame);
  return { result, usedSource: 'openmeteo' };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

router.get('/', async (req, res) => {
  // 1. Validate params
  let params;
  try {
    params = parseParams(req.query);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const { lat, lon, zoom, source } = params;
  const frame = makeFrame(lat, lon, zoom);
  const key   = cacheKey(source, frame);

  console.log(`[terrain] GET lat=${lat} lon=${lon} zoom=${zoom} source=${source} key=${key}`);

  // 2. Cache hit?
  const cached = readCache(key);
  if (cached) {
    console.log(`[terrain] Cache hit → ${key}`);
    return res.json({ ...cached, cached: true });
  }

  // 3. Fetch from provider (auto picks the best available, with fallback)
  console.log(`[terrain] Cache miss — fetching (source=${source})`);
  let result, resolvedSource;
  try {
    if (source === 'auto') {
      const r = await resolveAuto(frame);
      result = r.result;
      resolvedSource = r.usedSource;
    } else if (source === 'openmeteo') {
      result = await openmeteo.fetchElevation(frame);
      resolvedSource = 'openmeteo';
    } else {
      result = await maptiler.fetchElevation(frame, process.env.MAPTILER_KEY);
      resolvedSource = 'maptiler';
    }
  } catch (err) {
    console.error(`[terrain] Provider error (${source}):`, err.message);
    return res.status(503).json({
      error: `Elevation provider failed: ${err.message}`,
      source,
    });
  }

  // 4. Build response payload
  const payload = {
    data:   result.data,
    minFt:  result.minFt,
    maxFt:  result.maxFt,
    width:  R_W,
    height: R_H,
    zoom,
    source: resolvedSource,
  };

  // 5. Write to disk cache
  writeCache(key, payload);
  console.log(`[terrain] Cached → ${key} (resolved: ${resolvedSource})`);

  // 6. Respond
  return res.json({ ...payload, cached: false });
});

module.exports = router;
