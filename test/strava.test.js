'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { toCard } = require('../routes/strava');

const act = extra => ({ name: 'Run', type: 'Run', start_date_local: '2026-07-10T08:00:00Z', distance: 8000, moving_time: 2400,
  total_elevation_gain: 50, map: { summary_polyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' }, ...extra });

test('activity ids stay exact strings, even past the 64-bit switch', () => {
  assert.strictEqual(toCard(act({ id: 123, id_str: '9007199254740993123' })).id, '9007199254740993123');
  assert.strictEqual(toCard(act({ id: 14567890123 })).id, '14567890123');
});

test('activity card is formatted for the picker', () => {
  const c = toCard(act({ id: 1 }));
  assert.equal(c.dist, '8.0 km'); assert.equal(c.time, '40:00'); assert.equal(c.elev, '50 m');
  assert.equal(c.thumbPoints.length, 3);
  assert.deepEqual(c.thumbPoints[0], [-120.2, 38.5]);
});
