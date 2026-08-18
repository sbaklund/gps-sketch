'use strict';

/**
 * server.js — GPX Sketch backend
 *
 * Endpoints:
 *   GET /health           — Render health check
 *   GET /api/terrain      — Elevation proxy + disk cache
 *   GET /api/geocode      — Reverse geocode via Nominatim (OpenStreetMap)
 *   GET /auth/login|callback|logout  — Strava OAuth (per-visitor sessions)
 *   GET /api/status|activities|streams/:id  — Strava data proxy
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const session = require('express-session');
const path    = require('path');
const fs      = require('fs');

const terrainRouter = require('./routes/terrain');
const strava        = require('./routes/strava');

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const rawOrigins  = process.env.ALLOWED_ORIGINS ?? '';
const allowedList = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
const corsOrigins = allowedList.length > 0
  ? allowedList
  : ['http://localhost:8080', 'http://127.0.0.1:8080',
     'http://localhost:5500', 'http://127.0.0.1:5500'];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);           // curl / Postman / same-origin
    if (corsOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin not allowed — ${origin}`));
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,   // needed for cookies (express-session)
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = express();

// Render (and most hosts) run behind a reverse proxy that terminates HTTPS and
// forwards plain HTTP internally. Without this, Express thinks the connection is
// insecure and express-session refuses to set `secure` cookies — so the Strava
// session never persists and login silently fails. This tells Express to trust
// the proxy's X-Forwarded-Proto header.
app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(express.json());

// Prevent browsers caching stale API responses / stale CORS headers.
app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// ---------------------------------------------------------------------------
// Session middleware (per-visitor Strava tokens)
// ---------------------------------------------------------------------------

const SESSION_TTL_MS = parseInt(process.env.SESSION_TTL_MS || '', 10) || 6 * 60 * 60 * 1000; // 6 h

// Render doesn't set NODE_ENV=production by default, so detect deployment via
// Render's own env var (also honour NODE_ENV if it happens to be set).
const IS_PROD = !!process.env.RENDER_EXTERNAL_URL || process.env.NODE_ENV === 'production';

app.use(session({
  secret:            process.env.SESSION_SECRET || 'gpx-sketch-dev-secret-change-in-production',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    maxAge:   SESSION_TTL_MS,
    httpOnly: true,
    // In production (HTTPS behind Render's proxy) cookies must be secure +
    // sameSite:'none' so they survive the Strava OAuth round-trip. Locally we
    // relax both so plain-HTTP localhost still works.
    secure:   IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
  },
}));

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/health', (req, res) => {
  const cacheDir  = path.join(__dirname, 'cache');
  let   cacheSize = 0;
  try { cacheSize = fs.readdirSync(cacheDir).filter(f => f.endsWith('.json')).length; } catch { /* first boot */ }
  res.json({
    status:           'ok',
    time:             new Date().toISOString(),
    maptilerKeySet:   !!process.env.MAPTILER_KEY,
    stravaConfigured: !!process.env.STRAVA_CLIENT_ID,
    allowedOrigins:   corsOrigins,
    cachedAreas:      cacheSize,
  });
});

// ---------------------------------------------------------------------------
// Reverse geocode — Nominatim (OpenStreetMap, free, no API key)
// Returns the most human-readable place name for a lat/lon pair.
// Usage: GET /api/geocode?lat=39.74&lon=-104.99
// ---------------------------------------------------------------------------

app.get('/api/geocode', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  if (isNaN(lat) || isNaN(lon))
    return res.status(400).json({ error: 'lat and lon are required' });

  try {
    const url = `https://nominatim.openstreetmap.org/reverse`
      + `?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'GPX-Sketch/1.0 (https://gps-sketch.onrender.com)',
        'Accept-Language': 'en',
      },
    });
    if (!r.ok) throw new Error(`Nominatim ${r.status}`);
    const data = await r.json();

    // Build a short human-readable location string, e.g. "San Isabel National Forest, Colorado"
    const addr = data.address || {};
    const parts = [
      addr.natural || addr.park || addr.leisure ||
      addr.suburb  || addr.village || addr.town || addr.city ||
      addr.county  || addr.state_district,
      addr.state || addr.region || addr.country,
    ].filter(Boolean);

    res.json({
      display: data.display_name || '',
      short:   parts.join(', '),
      address: addr,
    });
  } catch (e) {
    console.error('[geocode] error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use('/api/terrain', terrainRouter);
app.use(strava.router);   // /auth/* and /api/{status,activities,streams}

// 404 catch-all
app.use((req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.path}` }));

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env.PORT ?? '3001', 10);
app.listen(PORT, async () => {
  console.log(`[server] GPX Sketch backend listening on port ${PORT}`);
  console.log(`[server] MapTiler key: ${process.env.MAPTILER_KEY ? 'set ✓' : 'not set (openmeteo only)'}`);
  console.log(`[server] CORS origins: ${corsOrigins.join(', ')}`);
  console.log(`[server] Sessions: ${SESSION_TTL_MS / 3600000}h TTL, secret ${process.env.SESSION_SECRET ? 'from env ✓' : 'USING DEV DEFAULT — set SESSION_SECRET in prod!'}`);
  console.log(`[server] Health: http://localhost:${PORT}/health`);
  await strava.init();
});
