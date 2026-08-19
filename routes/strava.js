'use strict';

/**
 * routes/strava.js
 *
 * Strava OAuth + activity proxy for GPX Sketch.
 *
 * Endpoints:
 *   GET  /auth/login        → redirects to Strava's sign-in page
 *   GET  /auth/callback     → Strava redirects here after sign-in
 *   GET  /auth/logout       → clears the session
 *   GET  /api/status        → { connected, athlete }
 *   GET  /api/activities    → paginated activity list with GPS
 *   GET  /api/streams/:id   → full-resolution lat/lon points for one activity
 *   GET  /healthz           → { ok, mode }
 *
 * SINGLE-SERVICE architecture: the same server serves both the frontend and
 * this API, so /auth/callback redirects back to '/' (same origin). No
 * FRONTEND_URL needed in production. Set FRONTEND_URL only if you're running
 * the frontend from a different origin during development.
 *
 * Strava's app settings ("Authorization Callback Domain") must be set to
 * this server's domain (e.g. gps-sketch.onrender.com).
 */

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const router = express.Router();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CLIENT_ID     = process.env.STRAVA_CLIENT_ID || '';
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '';
const MOCK          = process.env.STRAVA_MOCK === '1';

// BASE_URL = this server's public URL (used for redirect_uri in OAuth)
const BASE_URL =
  process.env.BASE_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null) ||
  'http://localhost:3001';

// Where users land after sign-in. Same origin in production (single service).
// Only override this if your frontend is on a different domain during dev.
const FRONTEND_URL = process.env.FRONTEND_URL || BASE_URL;

// ---------------------------------------------------------------------------
// Token persistence
// ---------------------------------------------------------------------------

let tokens = null; // { access_token, refresh_token, expires_at, athlete }

const TOKEN_FILE = process.env.TOKEN_FILE || path.join(__dirname, '..', '.strava-tokens.json');

function saveTokens() {
  try {
    if (tokens) fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens), { mode: 0o600 });
    else if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
  } catch (e) {
    console.warn('[strava] could not persist token store:', e.message);
  }
}

function loadTokens() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
      console.log('[strava] restored session from', TOKEN_FILE);
      return true;
    }
  } catch (e) {
    console.warn('[strava] could not read token store:', e.message);
  }
  return false;
}

async function bootstrapFromEnv() {
  const rt = process.env.STRAVA_REFRESH_TOKEN;
  if (tokens || !rt || MOCK) return;
  if (!CLIENT_SECRET) {
    console.warn('[strava] STRAVA_REFRESH_TOKEN set but STRAVA_CLIENT_SECRET is missing — cannot bootstrap');
    return;
  }
  try {
    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: rt,
      }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    tokens = await res.json();
    tokens.athlete = await stravaGet('https://www.strava.com/api/v3/athlete');
    saveTokens();
    console.log('[strava] session bootstrapped from STRAVA_REFRESH_TOKEN —',
      (tokens.athlete && tokens.athlete.firstname) || 'connected');
  } catch (e) {
    console.warn('[strava] STRAVA_REFRESH_TOKEN bootstrap failed:', e.message);
    tokens = null;
  }
}

// ---------------------------------------------------------------------------
// Strava API helpers
// ---------------------------------------------------------------------------

async function exchangeCode(code) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function refreshIfNeeded() {
  if (!tokens) throw new Error('Not connected');
  if (tokens.expires_at * 1000 > Date.now() + 60_000) return;
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const t = await res.json();
  tokens = { ...tokens, ...t };
  saveTokens();
}

async function stravaGet(url) {
  await refreshIfNeeded();
  const res = await fetch(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (res.status === 429) throw new Error('Strava rate limit reached — try again in ~15 minutes');
  if (!res.ok) throw new Error(`Strava API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Google polyline decoder (Strava summary polylines)
// ---------------------------------------------------------------------------

function decodePolyline(str) {
  let index = 0, lat = 0, lng = 0;
  const points = [];
  while (index < str.length) {
    for (const which of [0, 1]) {
      let shift = 0, result = 0, byte;
      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const delta = (result & 1) ? ~(result >> 1) : (result >> 1);
      if (which === 0) lat += delta; else lng += delta;
    }
    points.push([lng / 1e5, lat / 1e5]);
  }
  return points;
}

// ---------------------------------------------------------------------------
// Connection-state helper
// ---------------------------------------------------------------------------

let warnedNotConnected = false;
function notConnected(req, res) {
  if (!warnedNotConnected) {
    warnedNotConnected = true;
    console.warn(`[strava] 401 on ${req.path} — no Strava token held.`);
    console.warn('[strava] if you were connected a moment ago, this process restarted.');
    console.warn('[strava] set STRAVA_REFRESH_TOKEN to reconnect automatically on boot.');
  }
  res.status(401).json({ error: 'Not connected', code: 'NOT_CONNECTED' });
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmtDist(m) { return (m / 1000).toFixed(1) + ' km'; }
function fmtTime(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toCard(a) {
  const pts = decodePolyline(a.map.summary_polyline);
  const step = Math.max(1, Math.floor(pts.length / 80));
  return {
    id: a.id,
    name: a.name,
    type: a.sport_type || a.type,
    date: fmtDate(a.start_date_local),
    dist: fmtDist(a.distance),
    time: fmtTime(a.moving_time),
    elev: Math.round(a.total_elevation_gain) + ' m',
    thumbPoints: pts.filter((_, i) => i % step === 0),
  };
}

// ---------------------------------------------------------------------------
// Mock data (STRAVA_MOCK=1)
// ---------------------------------------------------------------------------

const MOCK_ATHLETE = { id: 1, firstname: 'Stephen', lastname: 'B.', city: 'Boulder', state: 'Colorado', profile: null };
function mockActivities() {
  const mk = (i, name, type) => {
    const pts = [];
    for (let k = 0; k <= 120; k++) {
      const t = (k / 120) * 2 * Math.PI;
      pts.push([-105.27 + 0.01 * Math.cos(t + i), 40.0 + 0.008 * Math.sin(2 * t + i)]);
    }
    return { id: i, name, type, date: 'Jul 10, 2026', dist: '8.0 km', time: '40:00', elev: '50 m', points: pts };
  };
  return [mk(101, 'Mock Loop', 'Run'), mk(102, 'Mock Ride', 'Ride'), mk(103, 'Mock Trail', 'Hike')];
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.get('/auth/login', (req, res) => {
  if (MOCK) { tokens = { mock: true, athlete: MOCK_ATHLETE, expires_at: 9e9 }; return res.redirect(FRONTEND_URL + '?strava=connected'); }
  if (!CLIENT_ID) return res.status(500).send('STRAVA_CLIENT_ID not configured on the server');
  const url = 'https://www.strava.com/oauth/authorize'
    + `?client_id=${CLIENT_ID}`
    + `&redirect_uri=${encodeURIComponent(BASE_URL + '/auth/callback')}`
    + '&response_type=code'
    + '&approval_prompt=auto'
    + '&scope=read,activity:read_all';
  res.redirect(url);
});

router.get('/auth/callback', async (req, res) => {
  try {
    if (req.query.error) return res.redirect(FRONTEND_URL + '?strava_error=' + encodeURIComponent(req.query.error));
    const data = await exchangeCode(req.query.code);
    tokens = data;
    saveTokens();
    if (tokens.refresh_token) {
      console.log('[strava] connected. To survive redeploys on an ephemeral disk, set:');
      console.log('         STRAVA_REFRESH_TOKEN=' + tokens.refresh_token);
    }
    res.redirect(FRONTEND_URL + '?strava=connected');
  } catch (e) {
    console.error(e);
    res.redirect(FRONTEND_URL + '?strava_error=' + encodeURIComponent(e.message));
  }
});

router.get('/auth/logout', (req, res) => { tokens = null; saveTokens(); res.json({ ok: true }); });

router.get('/api/status', (req, res) => {
  if (!tokens) return res.json({ connected: false });
  const a = tokens.athlete || {};
  res.json({
    connected: true,
    athlete: {
      firstname: a.firstname || 'Athlete',
      lastname:  a.lastname || '',
      location:  [a.city, a.state].filter(Boolean).join(', '),
      profile:   a.profile && a.profile.startsWith('http') ? a.profile : null,
    },
  });
});

router.get('/api/activities', async (req, res) => {
  try {
    if (!tokens) return notConnected(req, res);
    if (MOCK) {
      return res.json({
        activities: mockActivities().map(a => ({ ...a, thumbPoints: a.points })),
        hiddenCount: 1,
        nextPage: 2,
        hasMore: false,
      });
    }

    const PER_PAGE = 30;
    const TARGET = 15;
    const MAX_PAGES_PER_REQUEST = 5;

    let page = Math.max(1, parseInt(req.query.page || '1', 10));
    const activities = [];
    let hiddenCount = 0;
    let scanned = 0;
    let reachedEnd = false;

    while (activities.length < TARGET && scanned < MAX_PAGES_PER_REQUEST) {
      const raw = await stravaGet(
        `https://www.strava.com/api/v3/athlete/activities?per_page=${PER_PAGE}&page=${page}`
      );
      scanned++;
      page++;

      if (!Array.isArray(raw) || raw.length === 0) { reachedEnd = true; break; }

      const withGps = raw.filter(a => a.map && a.map.summary_polyline);
      hiddenCount += raw.length - withGps.length;
      for (const a of withGps) activities.push(toCard(a));

      if (raw.length < PER_PAGE) { reachedEnd = true; break; }
    }

    res.json({ activities, hiddenCount, nextPage: page, hasMore: !reachedEnd });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/api/streams/:id', async (req, res) => {
  try {
    if (!tokens) return notConnected(req, res);
    if (MOCK) {
      const act = mockActivities().find(a => String(a.id) === req.params.id);
      return act ? res.json({ points: act.points }) : res.status(404).json({ error: 'not found' });
    }
    const data = await stravaGet(`https://www.strava.com/api/v3/activities/${req.params.id}/streams?keys=latlng&key_by_type=true`);
    if (!data.latlng || !data.latlng.data) return res.status(404).json({ error: 'No GPS stream for this activity' });
    res.json({ points: data.latlng.data.map(p => [p[1], p[0]]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/healthz', (req, res) => res.json({ ok: true, mode: MOCK ? 'mock' : (CLIENT_ID ? 'strava' : 'unconfigured') }));

// ---------------------------------------------------------------------------
// Startup — restore any existing session so a restart doesn't silently
// 401 forever. Call once from server.js after the app starts listening.
// ---------------------------------------------------------------------------

async function init() {
  if (MOCK) { console.log('[strava] MOCK mode — no real Strava credentials needed'); return; }
  loadTokens();
  await bootstrapFromEnv();
  if (!tokens) console.log('[strava] no stored session — connect via the app to sign in');
}

module.exports = { router, init };
