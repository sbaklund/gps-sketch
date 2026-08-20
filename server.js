'use strict';

console.log('[boot] server.js loading…');
console.log('[boot] Node version:', process.version);

// BUILD version — must match window.__BUILD__.html in the frontend.
// Bumped on every code export so /health can confirm the deploy is current.
const BUILD = 'v0.15.0';
console.log('[boot] build', BUILD);

/**
 * server.js — GPX Sketch (single-service architecture)
 *
 * Serves BOTH the frontend (static HTML) AND the API from one process.
 * One domain, no CORS headaches, no FRONTEND_URL to keep in sync.
 *
 * Static files:  /  → public/topo-art-v5-merged.html (+ any other assets in public/)
 * API:           /health, /api/terrain, /auth/*, /api/status, /api/activities, /api/streams/*
 */

try { require('dotenv').config(); } catch(e) { console.warn('[boot] dotenv not found, skipping:', e.message); }

let express, cors, session;
try {
  express = require('express');
  cors    = require('cors');
  session = require('express-session');
  console.log('[boot] express + cors + express-session loaded ✓');
} catch(e) { console.error('[boot] FATAL: cannot load express/cors/session:', e.message); process.exit(1); }

const path    = require('path');
const fs      = require('fs');

let terrainRouter, strava;
try {
  terrainRouter = require('./routes/terrain');
  console.log('[boot] routes/terrain loaded ✓');
} catch(e) { console.error('[boot] FATAL: cannot load routes/terrain:', e.message, e.stack); process.exit(1); }

try {
  strava = require('./routes/strava');
  console.log('[boot] routes/strava loaded ✓');
} catch(e) { console.error('[boot] FATAL: cannot load routes/strava:', e.message, e.stack); process.exit(1); }

let geocodeRouter;
try {
  geocodeRouter = require('./routes/geocode');
  console.log('[boot] routes/geocode loaded ✓');
} catch(e) { console.error('[boot] WARN: cannot load routes/geocode:', e.message); }

// ---------------------------------------------------------------------------
// CORS — only needed for local dev (production is same-origin)
// ---------------------------------------------------------------------------

const rawOrigins  = process.env.ALLOWED_ORIGINS ?? '';
const allowedList = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
const corsOrigins = allowedList.length > 0
  ? allowedList
  : ['http://localhost:8080', 'http://127.0.0.1:8080',
     'http://localhost:5500', 'http://127.0.0.1:5500',
     'http://localhost:3001', 'http://127.0.0.1:3001'];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);          // curl, Postman, same-origin
    if (corsOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin not allowed — ${origin}`));
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = express();

// Render terminates SSL at the load balancer — trust the proxy so secure
// cookies work (otherwise the browser won't send them over HTTPS).
app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(express.json());

// Per-user sessions — each visitor gets their own cookie + Strava token store.
// On Render's free tier, MemoryStore resets on redeploy (users re-authenticate).
const SESSION_SECRET = process.env.SESSION_SECRET || 'gpxsketch-' + Math.random().toString(36).slice(2);
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,     // don't create sessions until Strava login
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 1 week
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || !!process.env.RENDER,
  },
}));

// No-cache for API responses (static files use their own caching below)
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/auth', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/health', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// ---------------------------------------------------------------------------
// Static files — serve the frontend from /public
// ---------------------------------------------------------------------------

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',                 // cache static assets for 1 hour
  index: 'topo-art-v5-merged.html',
  setHeaders(res, filePath) {
    // Never cache HTML — ensures deploys take effect immediately
    if (filePath.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
}));

// Also serve the root index explicitly (in case someone hits / )
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'topo-art-v5-merged.html'));
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/health', (req, res) => {
  const cacheDir  = path.join(__dirname, 'cache');
  let   cacheSize = 0;
  try {
    cacheSize = fs.readdirSync(cacheDir).filter(f => f.endsWith('.json')).length;
  } catch { /* cache dir may not exist on first boot */ }

  res.json({
    status:           'ok',
    build:            BUILD,
    time:             new Date().toISOString(),
    maptilerKeySet:   !!process.env.MAPTILER_KEY,
    stravaConfigured: !!process.env.STRAVA_CLIENT_ID,
    allowedOrigins:   corsOrigins,
    cachedAreas:      cacheSize,
    architecture:     'single-service',
  });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

app.use('/api/terrain', terrainRouter);
if (geocodeRouter) app.use('/api/geocode', geocodeRouter);
app.use(strava.router);

// 404 — but only for /api and /auth paths (static misses are already handled)
app.use('/api', (req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

// For any other unmatched route, serve the SPA (the frontend handles its own routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'topo-art-v5-merged.html'));
});

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
  console.log(`[server] GPX Sketch listening on port ${PORT}`);
  console.log(`[server] Frontend: http://localhost:${PORT}/`);
  console.log(`[server] MapTiler key: ${process.env.MAPTILER_KEY ? 'set ✓' : 'not set (openmeteo only)'}`);
  console.log(`[server] Health check: http://localhost:${PORT}/health`);
  await strava.init();
});
