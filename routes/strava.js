'use strict';

/**
 * routes/strava.js
 *
 * Strava OAuth + activity proxy for GPX Sketch.
 * PER-USER SESSIONS: each visitor gets their own Strava connection via
 * express-session cookies. No shared global token — person A's Strava
 * never leaks to person B.
 *
 * Endpoints:
 *   GET  /auth/login        → redirects to Strava's sign-in page
 *   GET  /auth/callback     → Strava redirects here after sign-in
 *   GET  /auth/logout       → clears THIS user's session
 *   GET  /api/status        → { connected, athlete } for THIS user
 *   GET  /api/activities    → paginated activity list for THIS user
 *   GET  /api/streams/:id   → full-resolution lat/lon points for one activity
 *   GET  /healthz           → { ok, mode }
 */

const express = require('express');
const router = express.Router();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CLIENT_ID     = process.env.STRAVA_CLIENT_ID || '';
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '';
const MOCK          = process.env.STRAVA_MOCK === '1';

const BASE_URL =
  process.env.BASE_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null) ||
  'http://localhost:3001';

const FRONTEND_URL = process.env.FRONTEND_URL || BASE_URL;

// ---------------------------------------------------------------------------
// Strava API helpers (accept tokens as parameter, not global)
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

async function refreshIfNeeded(tokens) {
  if (!tokens) throw new Error('Not connected');
  if (tokens.expires_at * 1000 > Date.now() + 60_000) return tokens;
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
  return { ...tokens, ...t };
}

async function stravaGet(url, tokens) {
  tokens = await refreshIfNeeded(tokens);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (res.status === 429) throw new Error('Strava rate limit reached — try again in ~15 minutes');
  if (!res.ok) throw new Error(`Strava API ${res.status}: ${await res.text()}`);
  return { data: await res.json(), tokens };
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

const MOCK_ATHLETE = { id: 1, firstname: 'Demo', lastname: 'User', city: 'Boulder', state: 'Colorado', profile: null };
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
// Session helpers — read/write tokens from req.session
// ---------------------------------------------------------------------------

function getTokens(req) { return req.session && req.session.stravaTokens || null; }
function setTokens(req, t) { if (req.session) req.session.stravaTokens = t; }
function clearTokens(req) { if (req.session) delete req.session.stravaTokens; }

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.get('/auth/login', (req, res) => {
  if (MOCK) {
    setTokens(req, { mock: true, athlete: MOCK_ATHLETE, expires_at: 9e9 });
    return res.redirect(FRONTEND_URL + '?strava=connected');
  }
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
    setTokens(req, data);
    console.log('[strava] user connected:', (data.athlete && data.athlete.firstname) || 'unknown');
    res.redirect(FRONTEND_URL + '?strava=connected');
  } catch (e) {
    console.error('[strava] callback error:', e.message);
    res.redirect(FRONTEND_URL + '?strava_error=' + encodeURIComponent(e.message));
  }
});

router.get('/auth/logout', (req, res) => {
  clearTokens(req);
  res.json({ ok: true });
});

router.get('/api/status', (req, res) => {
  const tokens = getTokens(req);
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
    let tokens = getTokens(req);
    if (!tokens) return res.status(401).json({ error: 'Not connected', code: 'NOT_CONNECTED' });
    if (MOCK) {
      return res.json({
        activities: mockActivities().map(a => ({ ...a, thumbPoints: a.points })),
        hiddenCount: 1, nextPage: 2, hasMore: false,
      });
    }

    const PER_PAGE = 30, TARGET = 15, MAX_PAGES = 5;
    let page = Math.max(1, parseInt(req.query.page || '1', 10));
    const activities = [];
    let hiddenCount = 0, scanned = 0, reachedEnd = false;

    while (activities.length < TARGET && scanned < MAX_PAGES) {
      const result = await stravaGet(
        `https://www.strava.com/api/v3/athlete/activities?per_page=${PER_PAGE}&page=${page}`,
        tokens
      );
      tokens = result.tokens; // may have been refreshed
      const raw = result.data;
      scanned++; page++;

      if (!Array.isArray(raw) || raw.length === 0) { reachedEnd = true; break; }
      const withGps = raw.filter(a => a.map && a.map.summary_polyline);
      hiddenCount += raw.length - withGps.length;
      for (const a of withGps) activities.push(toCard(a));
      if (raw.length < PER_PAGE) { reachedEnd = true; break; }
    }

    // Persist any refreshed tokens back to session
    setTokens(req, tokens);
    res.json({ activities, hiddenCount, nextPage: page, hasMore: !reachedEnd });
  } catch (e) {
    console.error('[strava] activities error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/api/streams/:id', async (req, res) => {
  try {
    let tokens = getTokens(req);
    if (!tokens) return res.status(401).json({ error: 'Not connected', code: 'NOT_CONNECTED' });
    if (MOCK) {
      const act = mockActivities().find(a => String(a.id) === req.params.id);
      return act ? res.json({ points: act.points }) : res.status(404).json({ error: 'not found' });
    }
    const result = await stravaGet(
      `https://www.strava.com/api/v3/activities/${req.params.id}/streams?keys=latlng&key_by_type=true`,
      tokens
    );
    tokens = result.tokens;
    setTokens(req, tokens);
    if (!result.data.latlng || !result.data.latlng.data) return res.status(404).json({ error: 'No GPS stream' });
    res.json({ points: result.data.latlng.data.map(p => [p[1], p[0]]) });
  } catch (e) {
    console.error('[strava] streams error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/healthz', (req, res) => res.json({ ok: true, mode: MOCK ? 'mock' : (CLIENT_ID ? 'strava' : 'unconfigured') }));

// ---------------------------------------------------------------------------
// Init — no global token bootstrap needed (per-user sessions handle it)
// ---------------------------------------------------------------------------

async function init() {
  if (MOCK) { console.log('[strava] MOCK mode'); return; }
  if (!CLIENT_ID) console.warn('[strava] STRAVA_CLIENT_ID not set — Strava features disabled');
  else console.log('[strava] per-user session mode — each visitor signs in independently');
}

module.exports = { router, init };
