'use strict';
// Water decoder checks — builds tiny map tiles by hand and decodes them.
const test = require('node:test');
const assert = require('node:assert');
const f = require('../routes/features');

const vi = n => { const o = []; while (n > 127) { o.push((n & 127) | 128); n = Math.floor(n / 128); } o.push(n); return o; };
const zz = n => (n << 1) ^ (n >> 31);
const ld = (field, bytes) => [...vi(field * 8 + 2), ...vi(bytes.length), ...bytes];
const vf = (field, n) => [...vi(field * 8), ...vi(n)];
function ringCmds(pts, cur) {
  const o = []; let [cx, cy] = cur;
  o.push(...vi(1 * 8 + 1), ...vi(zz(pts[0][0] - cx)), ...vi(zz(pts[0][1] - cy))); [cx, cy] = pts[0];
  o.push(...vi((pts.length - 1) * 8 + 2));
  for (let i = 1; i < pts.length; i++) { o.push(...vi(zz(pts[i][0] - cx)), ...vi(zz(pts[i][1] - cy))); [cx, cy] = pts[i]; }
  o.push(...vi(1 * 8 + 7)); cur[0] = cx; cur[1] = cy; return o;
}
function waterTile(rings) {
  const cur = [0, 0]; const geom = rings.flatMap(r => ringCmds(r, cur));
  const feat = [...vf(3, 3), ...ld(4, geom)];
  return Buffer.from(ld(3, [...ld(1, [...Buffer.from('water')]), ...ld(2, feat), ...vf(5, 4096)]));
}
const decode = tile => { const polys = [], lines = []; f.decodeTile(tile, 5, 5, 4, polys, lines); return polys; };

test('a lake keeps its island as a hole, and the tile-cut side is marked as an edge', () => {
  const lake = [[-64, 500], [3000, 500], [3000, 3500], [-64, 3500]];
  const island = [[1000, 1000], [1000, 2000], [2000, 2000], [2000, 1000]];
  const pond = [[3200, 100], [3600, 100], [3600, 400], [3200, 400]];
  const polys = decode(waterTile([lake, island, pond]));
  assert.equal(polys.length, 2);
  assert.equal(polys[0].length, 2, 'lake = outline + island');
  const outline = polys[0][0];
  const edge = outline.find(r => r[0] === 1), shore = outline.find(r => r[0] === 0);
  assert.equal(edge[1].length, 2, 'one cut segment at the tile edge');
  assert.equal(shore[1].length, 4);
  assert.deepEqual(edge[1][0], shore[1][shore[1].length - 1], 'runs join up');
  assert.deepEqual(polys[0][1].map(r => r[0]), [0], 'island is all shoreline');
  assert.equal(polys[1].length, 1);
});

test('a big shoreline is thinned but tile corners are never dropped', () => {
  const pts = [[-64, -64], [2000, -64]];
  for (let i = 0; i < 1500; i++) { const a = i / 1499 * Math.PI / 2; pts.push([Math.round(2000 * Math.cos(a)) + (i % 2), Math.round(2000 * Math.sin(a)) + (i % 2)]); }
  pts.push([-64, 2000]);
  const ring = decode(waterTile([pts]))[0][0];
  assert.ok(ring.filter(r => r[0] === 1).some(r => r[1].length >= 3), 'corner point kept');
  assert.ok(ring.reduce((s, r) => s + r[1].length, 0) < 700, 'shoreline thinned');
});

test('zoom choice stays within the tile budget', () => {
  const z = f.pickZoom(47.5, -122.4, 47.7, -122.1);
  const n = (f.lon2tileX(-122.1, z) - f.lon2tileX(-122.4, z) + 1) * (f.lat2tileY(47.5, z) - f.lat2tileY(47.7, z) + 1);
  assert.ok(n <= 12 && z >= 3 && z <= 14);
});
