'use strict';

/**
 * maptiler.js
 *
 * Fetches MapTiler terrain-RGB tiles for a pixel frame, decodes the Mapbox
 * elevation encoding, and returns a full R_W×R_H elevation grid in feet.
 *
 * Mirrors fetchTerrainTiles() in topo-art-v4.html, with one key difference:
 * the browser used <img> + Canvas to decode PNG pixels. On the server we use
 * the 'sharp' library — but sharp is a native dep, so we use 'node-fetch' +
 * a pure-JS PNG decoder ('pngjs') instead to keep deploys simple on Render.
 *
 * Tile URL format:
 *   https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=KEY
 *
 * MapTiler terrain-RGB uses the Mapbox encoding:
 *   elevation (metres) = -10000 + (R×65536 + G×256 + B) × 0.1
 *
 * Multiply by 3.28084 for feet.
 *
 * MapTiler free tier: ~100k tile requests/month.
 * With disk caching one area is fetched only once, so this budget goes far.
 */

const { PNG }  = require('pngjs');
const { R_W, R_H } = require('./gridBuilder');

const BASE_URL = 'https://api.maptiler.com/tiles/terrain-rgb-v2';
const TILE_PX  = 256; // standard slippy-map tile size

// ---------------------------------------------------------------------------
// HTTP helper (tiles arrive as binary PNG/WebP)
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a URL and return the raw Buffer of the response body.
 * Retries up to 4 times on transient errors and 429s.
 */
async function fetchBuffer(url) {
  const fetcher = globalThis.fetch ?? require('node-fetch');
  const MAX = 4;

  for (let attempt = 0; attempt < MAX; attempt++) {
    let res;
    try {
      res = await fetcher(url);
    } catch (err) {
      if (attempt === MAX - 1) throw new Error(`Network error fetching tile: ${err.message}`);
      await sleep(Math.pow(2, attempt) * 500);
      continue;
    }

    if (res.status === 429) {
      const retryAfter = parseFloat(res.headers.get('retry-after'));
      const wait = (Number.isFinite(retryAfter) ? retryAfter : Math.pow(2, attempt)) * 1000;
      console.warn(`[maptiler] 429 on tile — waiting ${(wait / 1000).toFixed(1)}s`);
      await sleep(wait);
      continue;
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error(`MapTiler auth error ${res.status} — check MAPTILER_KEY`);
    }

    if (!res.ok) throw new Error(`HTTP ${res.status} fetching tile`);

    // Collect response body as a Buffer
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  }

  throw new Error('MapTiler: exhausted retries on tile fetch');
}

// ---------------------------------------------------------------------------
// PNG decode → pixel array
// ---------------------------------------------------------------------------

/**
 * Decode a PNG buffer into a flat Uint8Array of RGBA pixels.
 * Returns { data: Uint8Array, width, height }.
 */
function decodePNG(buf) {
  return new Promise((resolve, reject) => {
    const png = new PNG();
    png.on('parsed', function () {
      resolve({ data: this.data, width: this.width, height: this.height });
    });
    png.on('error', reject);
    png.parse(buf);
  });
}

// ---------------------------------------------------------------------------
// Mapbox terrain-RGB decode
// ---------------------------------------------------------------------------

/**
 * Decode Mapbox terrain-RGB encoding to metres, then convert to feet.
 * elevation_m = -10000 + (R*65536 + G*256 + B) * 0.1
 */
function decodePixelFt(R, G, B) {
  return (-10000 + (R * 65536 + G * 256 + B) * 0.1) * 3.28084;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Fetch elevation tiles from MapTiler and assemble a full R_W×R_H grid.
 *
 * @param {{ left, top, zoom, width, height }} frame  from gridBuilder.makeFrame()
 * @param {string} apiKey  MapTiler API key (from env)
 * @returns {Promise<{ data: number[], minFt: number, maxFt: number }>}
 */
async function fetchElevation(frame, apiKey) {
  if (!apiKey) throw new Error('MapTiler: MAPTILER_KEY is not set');

  const { left, top, zoom } = frame;
  const scale  = Math.pow(2, zoom);
  const maxIdx = scale - 1;

  // 1. Determine which tiles we need
  const tx0 = Math.floor(left / TILE_PX);
  const tx1 = Math.floor((left + R_W - 1) / TILE_PX);
  const ty0 = Math.floor(top  / TILE_PX);
  const ty1 = Math.floor((top  + R_H - 1) / TILE_PX);

  // 2. Fetch all tiles in parallel
  const tileJobs = [];
  const tileMap  = {}; // key: "tx_ty" → decoded pixel Uint8Array

  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      // Wrap X (world wraps east/west), clamp Y (poles)
      const X = ((tx % scale) + scale) % scale;
      const Y = Math.min(Math.max(ty, 0), maxIdx);

      const url = `${BASE_URL}/${zoom}/${X}/${Y}.png?key=${apiKey}`;
      const key = `${tx}_${ty}`;

      tileJobs.push(
        fetchBuffer(url)
          .then((buf) => decodePNG(buf))
          .then(({ data }) => {
            tileMap[key] = data;
          })
          .catch((err) => {
            // A missing tile (e.g. ocean) shouldn't kill the whole render —
            // leave tileMap[key] undefined so pixels default to 0.
            console.warn(`[maptiler] Tile ${key} failed: ${err.message} — treating as sea level`);
          })
      );
    }
  }

  const tileCount = tileJobs.length;
  console.log(`[maptiler] Fetching ${tileCount} tile(s) at zoom ${zoom}`);
  await Promise.all(tileJobs);
  console.log(`[maptiler] All tiles received — assembling grid`);

  // 3. Sample each output pixel from the tile mosaic
  const out = new Float64Array(R_W * R_H);
  let min =  Infinity;
  let max = -Infinity;

  for (let j = 0; j < R_H; j++) {
    for (let i = 0; i < R_W; i++) {
      const wX = left + i;
      const wY = top  + j;
      const tx  = Math.floor(wX / TILE_PX);
      const ty  = Math.floor(wY / TILE_PX);
      const px  = tileMap[`${tx}_${ty}`];

      let ef = 0;
      if (px) {
        const lx = (wX - tx * TILE_PX) | 0;
        const ly = (wY - ty * TILE_PX) | 0;
        const o  = (ly * TILE_PX + lx) * 4; // RGBA stride
        ef = decodePixelFt(px[o], px[o + 1], px[o + 2]);
      }

      out[j * R_W + i] = ef;
      if (ef < min) min = ef;
      if (ef > max) max = ef;
    }
  }

  if (!(max > min)) {
    throw new Error('MapTiler: no elevation range — tiles may be all ocean or decoding failed');
  }

  console.log(`[maptiler] Done. Range: ${Math.round(min)}–${Math.round(max)} ft`);

  return {
    data:  Array.from(out),
    minFt: min,
    maxFt: max,
  };
}

module.exports = { fetchElevation };
