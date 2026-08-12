'use strict';

/**
 * maptiler.js
 *
 * Fetches MapTiler terrain-RGB tiles, decodes them to elevation, and returns
 * a full R_W×R_H grid in feet.
 *
 * Uses 'sharp' for image decoding — it handles PNG, WebP, JPEG, whatever
 * MapTiler actually sends back regardless of the requested extension.
 *
 * MapTiler terrain-RGB uses the Mapbox encoding:
 *   elevation (metres) = -10000 + (R×65536 + G×256 + B) × 0.1
 *   × 3.28084 → feet
 */

const sharp = require('sharp');
const { R_W, R_H } = require('./gridBuilder');

const BASE_URL = 'https://api.maptiler.com/tiles/terrain-rgb-v2';
const TILE_PX  = 256;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// HTTP helper — fetches raw bytes with retry
// ---------------------------------------------------------------------------

async function fetchBuffer(url) {
  const fetcher = globalThis.fetch ?? require('node-fetch');
  const MAX = 4;

  for (let attempt = 0; attempt < MAX; attempt++) {
    let res;
    try {
      res = await fetcher(url);
    } catch (err) {
      if (attempt === MAX - 1) throw new Error(`Network error: ${err.message}`);
      await sleep(Math.pow(2, attempt) * 500);
      continue;
    }

    if (res.status === 429) {
      const retryAfter = parseFloat(res.headers.get('retry-after'));
      const wait = (Number.isFinite(retryAfter) ? retryAfter : Math.pow(2, attempt)) * 1000;
      console.warn(`[maptiler] 429 — waiting ${(wait / 1000).toFixed(1)}s`);
      await sleep(wait);
      continue;
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error(`MapTiler auth error ${res.status} — check MAPTILER_KEY`);
    }

    if (!res.ok) throw new Error(`HTTP ${res.status} fetching tile`);

    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  }

  throw new Error('MapTiler: exhausted retries');
}

// ---------------------------------------------------------------------------
// Image decode (any format → raw RGBA pixels via sharp)
// ---------------------------------------------------------------------------

async function decodePixels(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { data, width: info.width, height: info.height };
}

// ---------------------------------------------------------------------------
// Mapbox terrain-RGB decode
// ---------------------------------------------------------------------------

function decodePixelFt(R, G, B) {
  return (-10000 + (R * 65536 + G * 256 + B) * 0.1) * 3.28084;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

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

  // 2. Fetch + decode all tiles in parallel
  const tileMap  = {};
  const tileJobs = [];
  let   decoded  = 0;
  let   failed   = 0;

  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const X = ((tx % scale) + scale) % scale;
      const Y = Math.min(Math.max(ty, 0), maxIdx);

      // Request .webp (MapTiler's native format for v2) — sharp handles it.
      const url = `${BASE_URL}/${zoom}/${X}/${Y}.webp?key=${apiKey}`;
      const key = `${tx}_${ty}`;

      tileJobs.push(
        fetchBuffer(url)
          .then((buf) => {
            console.log(`[maptiler] Tile ${key}: ${buf.length} bytes received`);
            return decodePixels(buf);
          })
          .then(({ data }) => {
            tileMap[key] = data;
            decoded++;
          })
          .catch((err) => {
            console.warn(`[maptiler] Tile ${key} FAILED: ${err.message}`);
            failed++;
          })
      );
    }
  }

  const tileCount = tileJobs.length;
  console.log(`[maptiler] Fetching ${tileCount} tile(s) at zoom ${zoom}`);
  await Promise.all(tileJobs);
  console.log(`[maptiler] Tiles: ${decoded} decoded, ${failed} failed`);

  if (decoded === 0) {
    throw new Error(`MapTiler: all ${tileCount} tiles failed to decode — check key and logs above`);
  }

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
    throw new Error(`MapTiler: no elevation range (min=${min} max=${max}) — ${decoded}/${tileCount} tiles decoded but all values identical`);
  }

  console.log(`[maptiler] Done. Range: ${Math.round(min)}–${Math.round(max)} ft`);

  return {
    data:  Array.from(out),
    minFt: min,
    maxFt: max,
  };
}

module.exports = { fetchElevation };
