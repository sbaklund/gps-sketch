'use strict';

/**
 * server.js — GPX Sketch (single-service architecture)
 *
 * Serves BOTH the frontend (static HTML) AND the API from one process.
 * One domain, no CORS headaches, no FRONTEND_URL to keep in sync.
 *
 * Static files:  /  → public/topo-art-v5-merged.html (+ any other assets in public/)
 * API:           /health, /api/terrain, /auth/*, /api/status, /api/activities, /api/streams/*
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const terrainRouter = require('./routes/terrain');
const strava        = require('./routes/strava');

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

app.use(cors(corsOptions));
app.use(express.json());

// No-cache for API responses (static files use their own caching below)
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/auth', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/health', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// ---------------------------------------------------------------------------
// Static files — serve the frontend from /public
// ---------------------------------------------------------------------------

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',                 // cache static assets for 1 hour
  index: 'topo-art-v5-merged.html',   // serve this as the homepage
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
