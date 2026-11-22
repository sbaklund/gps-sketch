'use strict';

/**
 * routes/print.js — print shop (Gelato) catalogue for the order panel.
 *
 * The SERVER owns the price list: the page only displays it, and checkout (a later
 * step) will look prices up here again, so a customer can never set their own price.
 *
 *   GET /api/print/products → { enabled, sizes, products }
 *
 * `enabled` is PRINT_ENABLED=1 on the server. Until checkout works end to end the
 * Print button stays hidden on the live site (Stephen can preview it with ?print=1).
 */

const express = require('express');
const router = express.Router();

// Poster is 3:4. Gelato's size keys, one per size we sell.
const SIZES = [
  { key: '12x16', label: '12 × 16 in', w: 12, h: 16, gelato: '12x16-inch-300x400-mm', hanger: '310-mm' },
  { key: '18x24', label: '18 × 24 in', w: 18, h: 24, gelato: '18x24-inch-450x600-mm', hanger: '450-mm' },
  { key: '24x32', label: '24 × 32 in', w: 24, h: 32, gelato: '24x32-inch-600x800-mm', hanger: '635-mm' },
];
const PAPER = '250-gsm-100lb-uncoated-offwhite-archival';
const TRIMS = {
  black:   { label: 'Black',     hex: '#1c1c1c', gelato: 'black' },
  white:   { label: 'White',     hex: '#f7f6f2', gelato: 'white' },
  natural: { label: 'Natural',   hex: '#c9a06c', gelato: 'natural-wood' },
  dark:    { label: 'Dark wood', hex: '#5a3d28', gelato: 'dark-wood' },
};

// Selling prices in whole US dollars, by size (12x16, 18x24, 24x32). Shipping is a flat rate per product.
const PRODUCTS = [
  { key: 'paper',  name: 'Paper poster',  blurb: 'Archival matte paper',           prices: [29, 39, 49],   shipping: 6,  days: '5–9',   trims: [],
    uid: s => `flat_${s.gelato}_${PAPER}_4-0_ver` },
  { key: 'hanger', name: 'Poster + hanger', blurb: 'Wood rails, ready to hang',    prices: [49, 59, 79],   shipping: 8,  days: '12–16', trims: ['natural', 'black', 'white', 'dark'],
    uid: (s, t) => `wall_hanging_poster_${s.hanger}_${TRIMS[t].gelato}_wood_w14xt20-mm_${s.gelato}_${PAPER}_4-0_ver` },
  { key: 'canvas', name: 'Canvas',        blurb: 'Stretched, ready to hang',       prices: [69, 89, 119],  shipping: 17, days: '10–11', trims: [],
    uid: s => `canvas_${s.gelato}_canvas_wood-fsc-slim_4-0_ver` },
  { key: 'framed', name: 'Framed',        blurb: 'Wood frame, ready to hang',      prices: [89, 119, 169], shipping: 25, days: '5–8',   trims: ['black', 'white', 'natural'],
    uid: (s, t) => `framed_poster_${s.gelato}_${TRIMS[t].gelato}_wood_w12xt22-mm_plexiglass_${s.gelato}_${PAPER}_4-0_ver` },
  { key: 'wood',   name: 'Wood print',    blurb: 'Printed on birch',               prices: [99, 129, 159], shipping: 27, days: '5–9',   trims: [],
    uid: s => `wood_${s.gelato}_lined-plywood_10-mm_hor-grain_4-0_ver` },
];

/** Price + Gelato product id for one choice, or null if the choice isn't something we sell. */
function lookup(productKey, sizeKey, trimKey) {
  const p = PRODUCTS.find(x => x.key === productKey);
  const i = SIZES.findIndex(x => x.key === sizeKey);
  if (!p || i < 0) return null;
  if (p.trims.length ? !p.trims.includes(trimKey) : !!trimKey) return null;
  return { name: p.name, size: SIZES[i].label, price: p.prices[i], shipping: p.shipping, total: p.prices[i] + p.shipping,
           gelatoUid: p.uid(SIZES[i], trimKey) };
}

router.get('/products', (req, res) => {
  res.json({
    enabled: process.env.PRINT_ENABLED === '1',
    currency: 'USD',
    sizes: SIZES.map(({ key, label, w, h }) => ({ key, label, w, h })),
    products: PRODUCTS.map(p => ({ key: p.key, name: p.name, blurb: p.blurb, prices: p.prices, shipping: p.shipping, days: p.days,
      trims: p.trims.map(t => ({ key: t, label: TRIMS[t].label, hex: TRIMS[t].hex })) })),
  });
});

// ---------------------------------------------------------------------------
// Print files. The browser renders the poster as one JPEG and uploads it here; the
// printer later downloads it from a long random address. Files live in cache/print-files
// (temporary disk — wiped on a Render restart), so an order must be sent to the printer
// soon after upload. Guards: JPEG only, poster shape only, size cap, per-visitor rate
// limit, old files deleted, total disk use capped.
// ---------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FILE_DIR   = path.join(__dirname, '..', 'cache', 'print-files');
const MAX_BYTES  = 25 * 1024 * 1024;          // one file
const MAX_TOTAL  = 400 * 1024 * 1024;         // whole folder
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_WIDTH  = 2400, MAX_WIDTH = 7200;    // px; 3:4 only
const RATE = { max: 12, windowMs: 10 * 60 * 1000 };
const FILE_RE = /^[0-9a-f]{32}\.jpg$/;
const hits = new Map();                       // ip → [timestamps]

/** Width/height of a JPEG from its header, or null if it isn't one. */
function jpegSize(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xFF) return null;
    const m = buf[i + 1];
    if (m === 0xFF) { i++; continue; }                                   // padding
    if (m === 0xD8 || (m >= 0xD0 && m <= 0xD7) || m === 0x01) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2) return null;
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) // a start-of-frame block
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}

/** Why a print file is refused, or null if it is fine. */
function checkPrintFile(buf) {
  const size = jpegSize(buf);
  if (!size) return 'Not a JPEG image';
  if (size.w < MIN_WIDTH || size.w > MAX_WIDTH) return 'Image is the wrong size for printing';
  if (Math.abs(size.w * 4 - size.h * 3) > 4) return 'Image is not the 3:4 poster shape';
  return null;
}

function tidy() {
  let files;
  try { files = fs.readdirSync(FILE_DIR).filter(f => FILE_RE.test(f)).map(f => { const st = fs.statSync(path.join(FILE_DIR, f)); return { f, t: st.mtimeMs, n: st.size }; }); }
  catch { return; }
  files.sort((a, b) => a.t - b.t);                                       // oldest first
  let total = files.reduce((n, x) => n + x.n, 0);
  for (const x of files) {
    if (Date.now() - x.t < MAX_AGE_MS && total <= MAX_TOTAL) break;
    try { fs.unlinkSync(path.join(FILE_DIR, x.f)); total -= x.n; } catch { /* already gone */ }
  }
}

function printFilePath(id) { return /^[0-9a-f]{32}$/.test(id || '') ? path.join(FILE_DIR, id + '.jpg') : null; }
function printFileExists(id) { const p = printFilePath(id); return !!p && fs.existsSync(p); }

router.post('/files', express.raw({ type: 'image/jpeg', limit: MAX_BYTES }), (req, res) => {
  const now = Date.now(), ip = req.ip || 'unknown';
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE.windowMs);
  if (recent.length >= RATE.max) return res.status(429).json({ error: 'Too many uploads — please wait a few minutes' });
  recent.push(now); hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();

  if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(415).json({ error: 'Send the print file as image/jpeg' });
  const why = checkPrintFile(req.body);
  if (why) return res.status(400).json({ error: why });
  try {
    fs.mkdirSync(FILE_DIR, { recursive: true });
    tidy();
    const id = crypto.randomBytes(16).toString('hex');
    fs.writeFileSync(printFilePath(id), req.body);
    const size = jpegSize(req.body);
    const base = (process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    res.json({ id, url: `${base}/api/print/files/${id}.jpg`, width: size.w, height: size.h, bytes: req.body.length });
  } catch (e) {
    console.error('[print] could not save print file:', e.message);
    res.status(500).json({ error: 'Could not save the print file' });
  }
});

router.get('/files/:name', (req, res) => {
  if (!FILE_RE.test(req.params.name)) return res.status(404).json({ error: 'Not found' });
  const p = path.join(FILE_DIR, req.params.name);
  if (!fs.existsSync(p)) return res.status(404).json({ error: 'Not found' });
  res.set('Cache-Control', 'private, max-age=3600').type('jpeg').sendFile(p);
});

// A file over the size cap arrives here as an error from express.raw.
router.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'Print file is too large' });
  next(err);
});

module.exports = { router, lookup, PRODUCTS, SIZES, jpegSize, checkPrintFile, printFileExists, printFilePath };
