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
