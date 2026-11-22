'use strict';
// Starts the real server on a spare port and checks the things a deploy must get right.
const test = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION.txt'), 'utf8').trim();
const PORT = 39000 + Math.floor(Math.random() * 900);
const base = 'http://127.0.0.1:' + PORT;
let proc;

test.before(async () => {
  proc = spawn(process.execPath, ['server.js'], { cwd: ROOT, stdio: 'ignore',
    env: { ...process.env, PORT: String(PORT), STRAVA_CLIENT_ID: 'test-id', STRAVA_CLIENT_SECRET: 'x', STRAVA_MOCK: '', MAPTILER_KEY: '', CANONICAL_HOST: '', RENDER: '' } });
  for (let i = 0; i < 50; i++) { try { await fetch(base + '/health'); return; } catch { await new Promise(r => setTimeout(r, 100)); } }
  throw new Error('server did not start');
});
test.after(() => { if (proc) proc.kill(); });

test('health reports the version from VERSION.txt', async () => {
  const h = await (await fetch(base + '/health')).json();
  assert.equal(h.build, VERSION);
});

test('the page is stamped with the version and every file it loads exists', async () => {
  const html = await (await fetch(base + '/')).text();
  assert.ok(!html.includes('__V__'), 'placeholder filled in');
  assert.ok(html.includes(`html: '${VERSION}'`));
  const urls = [...html.matchAll(/(?:src|href)="(\/(?:js|css|vendor)\/[^"]+)"/g)].map(m => m[1]);
  assert.ok(urls.length >= 5);
  for (const u of urls) assert.equal((await fetch(base + u)).status, 200, u);
});

test('phone layout: bottom bar, its script, and a tab for every Topo panel', async () => {
  const html = await (await fetch(base + '/')).text();
  assert.ok(html.includes('id="mobBar"'));
  assert.ok(html.includes('/js/mobile.js?v=' + VERSION));
  const tabs = new Set([...html.matchAll(/class="group" data-tab="(\w+)"/g)].map(m => m[1]));
  const untagged = [...html.matchAll(/class="group"(?! data-tab)/g)].length;
  assert.equal(untagged, 0, 'every sidebar group needs a data-tab or it never shows on phones');
  for (const t of tabs) assert.ok(html.includes(`class="topo" data-sheet="${t}"`) || html.includes(`class="topo cta" data-sheet="${t}"`), t);
});

test('a missing file is a 404, an unknown page path still serves the app', async () => {
  assert.equal((await fetch(base + '/js/nope.js')).status, 404);
  assert.equal((await fetch(base + '/some/page')).status, 200);
});

test('Strava: not signed in → 401; junk activity id → 400', async () => {
  assert.equal((await fetch(base + '/api/activities')).status, 401);
  assert.equal((await fetch(base + '/api/streams/12abc')).status, 400);
  assert.equal((await (await fetch(base + '/api/status')).json()).connected, false);
});

test('Strava sign-in carries a one-time state, and a wrong state is rejected', async () => {
  const login = await fetch(base + '/auth/login', { redirect: 'manual' });
  assert.equal(login.status, 302);
  const to = new URL(login.headers.get('location'));
  assert.equal(to.hostname, 'www.strava.com');
  const state = to.searchParams.get('state');
  assert.match(state, /^[0-9a-f]{32}$/);
  const cookie = (login.headers.get('set-cookie') || '').split(';')[0];
  assert.ok(cookie, 'session cookie set');
  const bad = await fetch(base + '/auth/callback?code=x&state=wrong', { redirect: 'manual', headers: { cookie } });
  assert.match(decodeURIComponent(bad.headers.get('location')), /Sign-in expired/);
  const none = await fetch(base + '/auth/callback?code=x&state=' + state, { redirect: 'manual' });
  assert.match(decodeURIComponent(none.headers.get('location')), /Sign-in expired/, 'no cookie → rejected');
});

test('water endpoint rejects bad input and soft-fails without a key', async () => {
  assert.equal((await fetch(base + '/api/features?bbox=1,2,3')).status, 400);
  const r = await (await fetch(base + '/api/features?bbox=47.5,-122.3,47.6,-122.2')).json();
  assert.deepEqual(r.areas, []);
});

test('print shop: price list is served, the panel is in the page, and prices come from the server', async () => {
  const d = await (await fetch(base + '/api/print/products')).json();
  assert.equal(d.enabled, false, 'printing is off unless PRINT_ENABLED=1');
  assert.deepEqual(d.products.map(p => p.key), ['paper', 'hanger', 'canvas', 'framed', 'wood']);
  for (const p of d.products) assert.equal(p.prices.length, d.sizes.length, p.key);
  assert.ok(!JSON.stringify(d).includes('gsm'), 'printer product ids stay on the server');
  const html = await (await fetch(base + '/')).text();
  assert.ok(html.includes('id="printPanel" hidden') && html.includes('id="printEntry" hidden'));
  assert.ok(html.includes('/js/print.js?v=' + VERSION));
  const { lookup } = require('../routes/print');
  assert.equal(lookup('framed', '18x24', 'black').total, 119 + 25);
  assert.match(lookup('hanger', '12x16', 'natural').gelatoUid, /^wall_hanging_poster_310-mm_natural-wood_/);
  assert.equal(lookup('framed', '18x24', 'purple'), null);
  assert.equal(lookup('paper', '9x9'), null);
});

test('print files: only a poster-shaped JPEG is accepted, and it comes back from its private address', async () => {
  const { jpegSize, checkPrintFile } = require('../routes/print');
  // Smallest believable JPEG header: start marker + a start-of-frame block carrying height and width.
  const jpeg = (w, h) => Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xC0, 0x00, 0x11, 0x08, h >> 8, h & 255, w >> 8, w & 255, 3]), Buffer.alloc(40)]);
  assert.deepEqual(jpegSize(jpeg(3600, 4800)), { w: 3600, h: 4800 });
  assert.equal(checkPrintFile(jpeg(3600, 4800)), null);
  assert.match(checkPrintFile(jpeg(4800, 3600)), /3:4/);
  assert.match(checkPrintFile(jpeg(300, 400)), /wrong size/);
  assert.match(checkPrintFile(Buffer.from('<html>hello</html>')), /Not a JPEG/);

  const post = (body, type) => fetch(base + '/api/print/files', { method: 'POST', headers: { 'Content-Type': type }, body });
  assert.equal((await post(Buffer.from('nope'), 'image/jpeg')).status, 400);
  assert.equal((await post('{}', 'application/json')).status, 415);
  const ok = await post(jpeg(3000, 4000), 'image/jpeg');
  assert.equal(ok.status, 200);
  const d = await ok.json();
  assert.match(d.id, /^[0-9a-f]{32}$/);
  assert.equal(d.width, 3000);
  const got = await fetch(base + '/api/print/files/' + d.id + '.jpg');
  assert.equal(got.status, 200);
  assert.equal(got.headers.get('content-type'), 'image/jpeg');
  assert.equal((await fetch(base + '/api/print/files/' + 'a'.repeat(32) + '.jpg')).status, 404);
  assert.equal((await fetch(base + '/api/print/files/..%2F..%2Fserver.js')).status, 404);
  fs.unlinkSync(path.join(ROOT, 'cache', 'print-files', d.id + '.jpg'));
});
