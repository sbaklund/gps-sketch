'use strict';

/**
 * openmeteo.js
 *
 * Fetches elevation for a coarse lat/lon grid from the Open-Meteo elevation
 * API, then upsamples to the full R_W×R_H output grid.
 *
 * Mirrors fetchTerrainPoints() in topo-art-v4.html — same chunk size (100),
 * same concurrency (2 parallel requests), same 429 backoff logic, same
 * metres→feet conversion, same bilinear upsample.
 *
 * Open-Meteo elevation API docs:
 *   https://open-meteo.com/en/docs/elevation-api
 *
 * Key behaviour:
 *   - Up to 100 lat/lon pairs per request (API limit)
 *   - Max 2 requests in flight at once (rate-limit courtesy)
 *   - 429 → honour Retry-After header, or exponential backoff (1s, 2s, 4s…)
 *   - Up to 5 retries per chunk before throwing
 *   - Null elevation values (water/no-data) are replaced with 0
 */

const { makeCoarseGrid, upsampleCoarse, CW, CH } = require('./gridBuilder');

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/elevation';
const CHUNK_SIZE     = 100; // max points per API request
const CONCURRENCY    = 2;   // parallel requests
const MAX_RETRIES    = 5;

// ---------------------------------------------------------------------------
// HTTP helper with 429-aware retry
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch JSON from a URL, retrying on 429 with backoff.
 * Throws on non-retryable errors or exhausted retries.
 *
 * @param {string} url
 * @returns {Promise<any>}
 */
async function fetchJSON(url) {
  // node-fetch v2 is CommonJS-compatible; use built-in fetch if Node >= 18
  const fetcher = globalThis.fetch ?? require('node-fetch');

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let res;
    try {
      res = await fetcher(url);
    } catch (err) {
      // Network-level error (DNS, ECONNREFUSED, etc.)
      if (attempt === MAX_RETRIES - 1) throw new Error(`Network error after ${MAX_RETRIES} attempts: ${err.message}`);
      await sleep(Math.pow(2, attempt) * 1000);
      continue;
    }

    if (res.status === 429) {
      const retryAfter = parseFloat(res.headers.get('retry-after'));
      const wait = (Number.isFinite(retryAfter) ? retryAfter : Math.pow(2, attempt)) * 1000;
      console.warn(`[openmeteo] 429 rate-limited — waiting ${(wait / 1000).toFixed(1)}s (attempt ${attempt + 1})`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status} from Open-Meteo`);

    return res.json();
  }

  throw new Error(`Open-Meteo: exhausted ${MAX_RETRIES} retries (persistent 429)`);
}

// ---------------------------------------------------------------------------
// Concurrency pool — identical logic to pool() in topo-art-v4.html
// ---------------------------------------------------------------------------

/**
 * Run fn over items with at most n concurrent executions.
 *
 * @param {any[]}    items
 * @param {number}   n       max concurrency
 * @param {Function} fn      async (item) => void
 */
async function pool(items, n, fn) {
  let idx = 0;
  const run = async () => {
    while (idx < items.length) {
      const my = idx++;
      await fn(items[my]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, run));
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Fetch elevation for the given pixel frame using Open-Meteo.
 *
 * @param {{ left, top, zoom, width, height }} frame  from gridBuilder.makeFrame()
 * @param {Function} [onProgress]  optional callback(done, total) for logging
 * @returns {Promise<{ data: number[], minFt: number, maxFt: number }>}
 */
async function fetchElevation(frame, onProgress) {
  // 1. Build the CW×CH coarse lat/lon grid
  const { lats, lons, total } = makeCoarseGrid(frame);

  // 2. Split into chunks of CHUNK_SIZE
  const coarse = new Float64Array(total);
  const chunks = [];
  for (let s = 0; s < total; s += CHUNK_SIZE) {
    chunks.push([s, Math.min(s + CHUNK_SIZE, total)]);
  }

  let done = 0;
  console.log(`[openmeteo] Fetching ${total} points in ${chunks.length} chunks (concurrency=${CONCURRENCY})`);

  // 3. Fetch all chunks with bounded concurrency
  await pool(chunks, CONCURRENCY, async ([a, b]) => {
    const url =
      `${OPEN_METEO_URL}?latitude=${lats.slice(a, b).join(',')}&longitude=${lons.slice(a, b).join(',')}`;

    const json = await fetchJSON(url);

    if (!Array.isArray(json.elevation)) {
      throw new Error(`Open-Meteo returned unexpected shape: ${JSON.stringify(json).slice(0, 120)}`);
    }

    for (let k = 0; k < json.elevation.length; k++) {
      // null = water / no-data → treat as sea level (0 m → 0 ft)
      const metres = json.elevation[k] ?? 0;
      coarse[a + k] = metres * 3.28084; // metres → feet
    }

    done += b - a;
    if (onProgress) onProgress(Math.min(done, total), total);
    else console.log(`[openmeteo]   ${Math.min(done, total)}/${total} points received`);
  });

  // 4. Bilinear upsample coarse grid → full R_W×R_H grid
  const result = upsampleCoarse(coarse);

  if (!(result.maxFt > result.minFt)) {
    throw new Error('Open-Meteo: no elevation range in returned data (flat or all-zero?)');
  }

  console.log(`[openmeteo] Done. Range: ${Math.round(result.minFt)}–${Math.round(result.maxFt)} ft`);
  return result;
}

module.exports = { fetchElevation };
