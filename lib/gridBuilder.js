'use strict';

/**
 * gridBuilder.js
 *
 * Shared Web Mercator math used by both elevation providers (Open-Meteo and
 * MapTiler). All constants are copied verbatim from topo-art-v4.html so the
 * server returns a grid that the front end can drop in without any changes.
 *
 * Tile coordinate system: standard XYZ slippy-map tiles, 256 px each.
 * Pixel coordinates: world-space pixels at the given zoom level
 *   (tile column * 256 = left edge of that tile in world-px).
 */

// ---------------------------------------------------------------------------
// Grid dimensions — must match R_W / R_H in topo-art-v4.html
// ---------------------------------------------------------------------------
const R_W = 340; // output grid width  (pixels / columns)
const R_H = 414; // output grid height (pixels / rows)

// Coarse sample grid used by the Open-Meteo path (34×41 points → bilinear
// upsample to R_W×R_H). Matches CW/CH in fetchTerrainPoints().
const CW = 34;
const CH = 41;

// ---------------------------------------------------------------------------
// Web Mercator helpers
// ---------------------------------------------------------------------------

/** Longitude → fractional tile X at zoom z */
function lon2tileX(lon, z) {
  return ((lon + 180) / 360) * Math.pow(2, z);
}

/** Latitude → fractional tile Y at zoom z (standard Web Mercator) */
function lat2tileY(lat, z) {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Math.pow(2, z);
}

/** Fractional tile X → longitude */
function tileX2lon(tx, z) {
  return (tx / Math.pow(2, z)) * 360 - 180;
}

/** Fractional tile Y → latitude */
function tileY2lat(ty, z) {
  const n = Math.PI - (2 * Math.PI * ty) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

// ---------------------------------------------------------------------------
// Frame builder
// ---------------------------------------------------------------------------

/**
 * Build the pixel-space frame that describes the region we want elevation for.
 * Mirrors makeFrame() in topo-art-v4.html.
 *
 * @param {number} lat  Centre latitude  (decimal degrees)
 * @param {number} lon  Centre longitude (decimal degrees)
 * @param {number} z    Zoom level (integer, typically 8–12)
 * @returns {{ left, top, zoom, width, height }}
 */
function makeFrame(lat, lon, z) {
  const wx = lon2tileX(lon, z) * 256;
  const wy = lat2tileY(lat, z) * 256;
  return {
    left: wx - R_W / 2,
    top:  wy - R_H / 2,
    zoom: z,
    width:  R_W,
    height: R_H,
  };
}

// ---------------------------------------------------------------------------
// Coarse lat/lon grid  (used by Open-Meteo provider)
// ---------------------------------------------------------------------------

/**
 * Generate the CW×CH coarse sampling grid as parallel lat[] and lon[] arrays.
 * Mirrors the loop inside fetchTerrainPoints() in topo-art-v4.html.
 *
 * @param {{ left, top, zoom, width, height }} frame
 * @returns {{ lats: string[], lons: string[], total: number }}
 */
function makeCoarseGrid(frame) {
  const { left, top, zoom, width, height } = frame;
  const scale = Math.pow(2, zoom);
  const lats = [];
  const lons = [];

  for (let j = 0; j < CH; j++) {
    for (let i = 0; i < CW; i++) {
      // World-pixel position of this sample point
      const wX = left + (i / (CW - 1)) * width;
      const wY = top  + (j / (CH - 1)) * height;

      // World-pixel → fractional tile coords → lat/lon
      const tx  = wX / 256;
      const ty  = wY / 256;
      const lon = tileX2lon(tx, zoom);
      const lat = tileY2lat(ty, zoom);

      lats.push(lat.toFixed(5));
      lons.push(lon.toFixed(5));
    }
  }

  return { lats, lons, total: CW * CH };
}

// ---------------------------------------------------------------------------
// Bilinear upsample: coarse Float64Array (CW×CH) → full grid (R_W×R_H)
// ---------------------------------------------------------------------------

/**
 * Upsample a CW×CH coarse elevation array to the full R_W×R_H output grid
 * using bilinear interpolation. Mirrors the upsample loop in
 * fetchTerrainPoints() in topo-art-v4.html.
 *
 * @param {Float64Array} coarse  Length CW*CH, elevation values in feet
 * @returns {{ data: number[], minFt: number, maxFt: number }}
 */
function upsampleCoarse(coarse) {
  const out = new Float64Array(R_W * R_H);
  let min = Infinity;
  let max = -Infinity;

  for (let j = 0; j < R_H; j++) {
    for (let i = 0; i < R_W; i++) {
      const cgx = (i / (R_W - 1)) * (CW - 1);
      const cgy = (j / (R_H - 1)) * (CH - 1);
      const x0  = Math.floor(cgx);
      const y0  = Math.floor(cgy);
      const fx  = cgx - x0;
      const fy  = cgy - y0;
      const x1  = Math.min(x0 + 1, CW - 1);
      const y1  = Math.min(y0 + 1, CH - 1);

      const A = coarse[y0 * CW + x0];
      const B = coarse[y0 * CW + x1];
      const C = coarse[y1 * CW + x0];
      const D = coarse[y1 * CW + x1];

      const e = A * (1 - fx) * (1 - fy)
              + B * fx       * (1 - fy)
              + C * (1 - fx) * fy
              + D * fx       * fy;

      out[j * R_W + i] = e;
      if (e < min) min = e;
      if (e > max) max = e;
    }
  }

  return {
    data:  Array.from(out), // plain array — safe to JSON.stringify
    minFt: min,
    maxFt: max,
  };
}

// ---------------------------------------------------------------------------
// Cache key
// ---------------------------------------------------------------------------

/**
 * Build a stable, filesystem-safe cache key from the request parameters.
 * Uses the pixel frame (left/top/zoom) rather than raw lat/lon so floating-
 * point rounding doesn't create near-duplicate keys for the same area.
 *
 * @param {string} source   'openmeteo' | 'maptiler'
 * @param {{ left, top, zoom }} frame
 * @returns {string}  e.g. "openmeteo_z10_l12544_t9872"
 */
function cacheKey(source, frame) {
  const l = Math.round(frame.left);
  const t = Math.round(frame.top);
  return `${source}_z${frame.zoom}_l${l}_t${t}`;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  R_W,
  R_H,
  CW,
  CH,
  makeFrame,
  makeCoarseGrid,
  upsampleCoarse,
  cacheKey,
  // expose helpers in case other modules need them
  lon2tileX,
  lat2tileY,
  tileX2lon,
  tileY2lat,
};

