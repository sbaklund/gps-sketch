'use strict';

/**
 * server.js
 *
 * Entry point for the Topo Route Art backend.
 *
 * Endpoints:
 *   GET /health            — Render health check + config summary
 *   GET /api/terrain       — Elevation proxy + disk cache (see routes/terrain.js)
 *
 * Environment variables (see .env.example):
 *   PORT             Server port (Render sets this automatically)
 *   MAPTILER_KEY     MapTiler API key (optional — enables maptiler source)
 *   ALLOWED_ORIGINS  Comma-separated CORS origins
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const terrainRouter = require('./routes/terrain');

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const rawOrigins  = process.env.ALLOWED_ORIGINS ?? '';
const allowedList = rawOrigins
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// If no origins are configured, fall back to localhost dev defaults so the
// server is usable out of the box without needing a .env file set up.
const corsOrigins = allowedList.length > 0
  ? allowedList
  : ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5500', 'http://127.0.0.1:5500'];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no Origin header (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
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

// Never let browsers cache API responses. Without this, a browser can serve
// a stale response (including stale CORS headers) for an identical URL even
// after the server config has changed — exactly the kind of "it's fixed on
// the server but the browser doesn't know it" confusion this avoids.
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// ---------------------------------------------------------------------------
// Health check — Render pings this to confirm the service is up.
// Also a quick sanity readout for debugging config in production.
// ---------------------------------------------------------------------------

app.get('/health', (req, res) => {
  const cacheDir  = path.join(__dirname, 'cache');
  let   cacheSize = 0;
  try {
    cacheSize = fs.readdirSync(cacheDir).filter((f) => f.endsWith('.json')).length;
  } catch { /* cache dir may not exist on first boot */ }

  res.json({
    status:          'ok',
    time:            new Date().toISOString(),
    maptilerKeySet:  !!process.env.MAPTILER_KEY,
    allowedOrigins:  corsOrigins,
    cachedAreas:     cacheSize,
  });
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use('/api/terrain', terrainRouter);

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
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

app.listen(PORT, () => {
  console.log(`[server] Topo backend listening on port ${PORT}`);
  console.log(`[server] MapTiler key: ${process.env.MAPTILER_KEY ? 'set ✓' : 'not set (openmeteo only)'}`);
  console.log(`[server] CORS origins: ${corsOrigins.join(', ')}`);
  console.log(`[server] Health check: http://localhost:${PORT}/health`);
  console.log(`[server] Terrain API:  http://localhost:${PORT}/api/terrain?lat=39.74&lon=-104.99&zoom=10`);
});
