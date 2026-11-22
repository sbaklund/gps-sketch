'use strict';

/**
 * routes/print.js — print shop (Gelato) catalogue for the order panel.
 *
 * The SERVER owns the price list: the page only displays it, and checkout (a later
 * step) will look prices up here again, so a customer can never set their own price.
 *
 *   GET  /api/print/products      → { enabled, checkout, sizes, products }
 *   POST /api/print/files         → store a print file (see below)
 *   POST /api/print/checkout      → { url } of Stripe's payment page for one order
 *   GET  /api/print/checkout/:id  → { paid, total, test } after the customer returns
 *   POST /api/print/stripe-webhook → Stripe says "paid" → order goes to Gelato
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

// wrapIn: inches of picture that fold around each edge (canvas only — measured from Gelato's own
// preview of a ruler image, 2026-11-22: ~5 cm a side). The print file for that product is made
// that much bigger on every side so the whole poster stays on the front.
// Selling prices in whole US dollars, by size (12x16, 18x24, 24x32). Shipping is a flat rate per product.
const PRODUCTS = [
  { key: 'paper',  name: 'Paper poster',  blurb: 'Archival matte paper',           prices: [29, 39, 49],   shipping: 6,  days: '5–9',   trims: [],
    uid: s => `flat_${s.gelato}_${PAPER}_4-0_ver` },
  { key: 'hanger', name: 'Poster + hanger', blurb: 'Wood rails, ready to hang',    prices: [49, 59, 79],   shipping: 8,  days: '12–16', trims: ['natural', 'black', 'white', 'dark'],
    uid: (s, t) => `wall_hanging_poster_${s.hanger}_${TRIMS[t].gelato}_wood_w14xt20-mm_${s.gelato}_${PAPER}_4-0_ver` },
  { key: 'canvas', name: 'Canvas',        blurb: 'Stretched, ready to hang',       prices: [69, 89, 119],  shipping: 17, days: '10–11', trims: [], wrapIn: 1.97,
    uid: s => `canvas_${s.gelato}_canvas_wood-fsc-slim_4-0_ver` },
  { key: 'framed', name: 'Framed',        blurb: 'Wood frame, ready to hang',      prices: [89, 119, 169], shipping: 25, days: '5–8',   trims: ['black', 'white', 'natural'],
    uid: (s, t) => `framed_poster_${s.gelato}_${TRIMS[t].gelato}_wood_w12xt22-mm_plexiglass_${s.gelato}_${PAPER}_4-0_ver` },
  { key: 'wood',   name: 'Wood print',    blurb: 'Printed on birch',               prices: [99, 129, 159], shipping: 27, days: '5–9',   trims: [],
    uid: s => `wood_${s.gelato}_lined-plywood_10-mm_hor-grain_4-0_ver` },
];

/** Width ÷ height the print file must have for this product and size. */
function fileShape(productKey, sizeKey) {
  const p = PRODUCTS.find(x => x.key === productKey), s = SIZES.find(x => x.key === sizeKey);
  if (!p || !s) return null;
  const pad = 2 * (p.wrapIn || 0);
  return (s.w + pad) / (s.h + pad);
}

/** Price + Gelato product id for one choice, or null if the choice isn't something we sell. */
function lookup(productKey, sizeKey, trimKey) {
  const p = PRODUCTS.find(x => x.key === productKey);
  const i = SIZES.findIndex(x => x.key === sizeKey);
  if (!p || i < 0) return null;
  if (p.trims.length ? !p.trims.includes(trimKey) : !!trimKey) return null;
  return { name: p.name, size: SIZES[i].label, price: p.prices[i], shipping: p.shipping, total: p.prices[i] + p.shipping,
           gelatoUid: p.uid(SIZES[i], trimKey) };
}

/** 'test', 'live' or 'off' — from the kind of Stripe key on the server. Never reveals the key. */
function stripeMode() {
  const k = process.env.STRIPE_SECRET_KEY || '';
  return /^(sk|rk)_test_/.test(k) ? 'test' : /^(sk|rk)_live_/.test(k) ? 'live' : 'off';
}

router.get('/products', (req, res) => {
  res.json({
    enabled: process.env.PRINT_ENABLED === '1',
    checkout: stripeMode(),
    currency: 'USD',
    sizes: SIZES.map(({ key, label, w, h }) => ({ key, label, w, h })),
    products: PRODUCTS.map(p => ({ key: p.key, name: p.name, blurb: p.blurb, prices: p.prices, shipping: p.shipping, days: p.days,
      wrap: p.wrapIn ? SIZES.map(s => +(p.wrapIn / s.w).toFixed(4)) : null,   // extra picture per side, as a share of the poster's width, by size
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
const MIN_WIDTH  = 2400, MAX_WIDTH = 7200;    // px; poster-shaped only
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
  const shape = size.w / size.h;                       // 3:4 poster, or a little squarer when it carries a canvas wrap
  if (shape < 0.745 || shape > 0.82) return 'Image is not the poster shape';
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

// ---------------------------------------------------------------------------
// Checkout. Our server asks Stripe for a payment page for ONE order and sends the
// customer there; card details never touch this site. The amount comes from the
// price list above — the browser only says which product, size and trim.
// Plain fetch to Stripe's API (no npm package).
// ---------------------------------------------------------------------------
function siteBase(req) { return (process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, ''); }

/** The form Stripe expects for one order's checkout page. */
function stripeSessionParams(order, choice, fileId, base) {
  const p = new URLSearchParams();
  p.set('mode', 'payment');
  p.set('line_items[0][quantity]', '1');
  p.set('line_items[0][price_data][currency]', 'usd');
  p.set('line_items[0][price_data][unit_amount]', String(choice.price * 100));
  p.set('line_items[0][price_data][product_data][name]', `GPX Sketch ${choice.name.toLowerCase()}, ${choice.size}`);
  p.set('shipping_address_collection[allowed_countries][0]', 'US');
  p.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
  p.set('shipping_options[0][shipping_rate_data][display_name]', 'Standard shipping');
  p.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(choice.shipping * 100));
  p.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'usd');
  p.set('success_url', base + '/?order=success&session_id={CHECKOUT_SESSION_ID}');
  p.set('cancel_url', base + '/?order=cancelled');
  // What the printer needs once this is paid (read back by the payment webhook).
  p.set('metadata[product]', order.product); p.set('metadata[size]', order.size); p.set('metadata[trim]', order.trim || '');
  p.set('metadata[file_id]', fileId); p.set('metadata[gelato_uid]', choice.gelatoUid);
  return p;
}

async function stripe(pathname, params) {
  const res = await fetch('https://api.stripe.com/v1' + pathname, {
    method: params ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY, ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    body: params ? params.toString() : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data.error && data.error.message) || 'Stripe error ' + res.status);
  return data;
}

router.post('/checkout', async (req, res) => {
  const b = req.body || {};
  const order = { product: String(b.product || ''), size: String(b.size || ''), trim: b.trim ? String(b.trim) : null };
  const choice = lookup(order.product, order.size, order.trim);
  if (!choice) return res.status(400).json({ error: 'That product isn’t available' });
  if (!printFileExists(b.fileId)) return res.status(400).json({ error: 'The print file is missing — please try again' });
  // The file must be the right shape for THIS product (a canvas file has a wrap border, the others don't).
  let dims = null; try { dims = jpegSize(fs.readFileSync(printFilePath(b.fileId))); } catch { /* treated as a mismatch below */ }
  if (!dims || Math.abs(dims.w / dims.h - fileShape(order.product, order.size)) > 0.004) return res.status(400).json({ error: 'The print file doesn’t match this product — please try again' });
  const mode = stripeMode();
  if (mode === 'off') return res.status(503).json({ error: 'Checkout isn’t set up yet' });
  // A live key takes real money: only allowed once printing is officially switched on.
  if (mode === 'live' && process.env.PRINT_ENABLED !== '1') return res.status(503).json({ error: 'Checkout isn’t switched on yet' });
  try {
    const session = await stripe('/checkout/sessions', stripeSessionParams(order, choice, b.fileId, siteBase(req)));
    res.json({ url: session.url, mode });
  } catch (e) {
    console.error('[print] checkout error:', e.message);
    res.status(502).json({ error: 'The payment page could not be opened — please try again' });
  }
});

// After Stripe sends the customer back: was it really paid?
router.get('/checkout/:id', async (req, res) => {
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid order reference' });
  if (stripeMode() === 'off') return res.status(503).json({ error: 'Checkout isn’t set up yet' });
  try {
    const s = await stripe('/checkout/sessions/' + req.params.id);
    res.json({ paid: s.payment_status === 'paid', total: s.amount_total, test: !s.livemode });
  } catch (e) {
    console.error('[print] order lookup error:', e.message);
    res.status(502).json({ error: 'Could not check the order' });
  }
});

// ---------------------------------------------------------------------------
// Paid → printer. Stripe calls /stripe-webhook when a checkout is paid; we check the
// call really is from Stripe (signature), then place the order with Gelato.
//  - Test payments, and anything before PRINT_ENABLED=1, become Gelato DRAFT orders:
//    visible in the Gelato dashboard, never printed, never charged.
//  - Stripe repeats a call it thinks failed, so we look the order up at Gelato first
//    and never place the same one twice.
// ---------------------------------------------------------------------------
/** True if `rawBody` was signed by Stripe with `secret` within the last 5 minutes. */
function verifyStripeSignature(rawBody, header, secret, nowMs = Date.now()) {
  if (!rawBody || !header || !secret) return false;
  const parts = String(header).split(',').map(x => x.trim().split('='));
  const t = (parts.find(x => x[0] === 't') || [])[1];
  const sigs = parts.filter(x => x[0] === 'v1').map(x => x[1]);
  if (!/^\d+$/.test(t || '') || !sigs.length) return false;
  if (Math.abs(nowMs / 1000 - Number(t)) > 300) return false;
  const want = Buffer.from(crypto.createHmac('sha256', secret).update(t + '.').update(rawBody).digest('hex'));
  return sigs.some(sig => { const got = Buffer.from(String(sig)); return got.length === want.length && crypto.timingSafeEqual(got, want); });
}

/** The order Gelato expects, from a paid Stripe checkout. Returns null if it isn't one of our print orders. */
function gelatoOrderBody(session, base) {
  const md = session.metadata || {};
  const choice = lookup(md.product, md.size, md.trim || null);
  if (!choice || !/^[0-9a-f]{32}$/.test(md.file_id || '')) return null;
  const ship = session.shipping_details || (session.collected_information && session.collected_information.shipping_details) || {};
  const cust = session.customer_details || {};
  const a = ship.address || cust.address || {};
  const [first, ...rest] = String(ship.name || cust.name || 'Customer').trim().split(/\s+/);
  const live = session.livemode === true && process.env.PRINT_ENABLED === '1';
  return {
    orderType: live ? 'order' : 'draft',
    orderReferenceId: session.id,
    customerReferenceId: cust.email || session.id,
    currency: 'USD',
    items: [{ itemReferenceId: '1', productUid: choice.gelatoUid, quantity: 1, files: [{ type: 'default', url: `${base}/api/print/files/${md.file_id}.jpg` }] }],
    shipmentMethodUid: 'normal',
    shippingAddress: {
      firstName: first, lastName: rest.join(' ') || '-',
      addressLine1: a.line1 || '', addressLine2: a.line2 || '', city: a.city || '', state: a.state || '', postCode: a.postal_code || '',
      country: a.country || 'US', email: cust.email || '', phone: cust.phone || '',
    },
  };
}

async function gelato(pathname, body, method) {
  const res = await fetch('https://order.gelatoapis.com/v4' + pathname, {
    method: method || (body ? 'POST' : 'GET'),
    headers: { 'X-API-KEY': process.env.GELATO_API_KEY || '', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Gelato ' + res.status + ': ' + (data.message || JSON.stringify(data).slice(0, 300)));
  return data;
}

async function placeGelatoOrder(session, base) {
  const body = gelatoOrderBody(session, base);
  if (!body) return { skipped: 'not a print order' };
  const md = session.metadata;
  if (!printFileExists(md.file_id)) throw new Error(`print file ${md.file_id} is gone (server restarted?) — order ${session.id} needs handling by hand`);
  const found = await gelato('/orders:search', { orderReferenceIds: [session.id], limit: 5 });
  const dupe = (found.orders || []).find(o => o.orderReferenceId === session.id);
  if (dupe) return { orderId: dupe.id, duplicate: true };
  const made = await gelato('/orders', body);
  console.log(`[print] Gelato ${body.orderType} ${made.id} placed for ${session.id} (${md.product} ${md.size} ${md.trim || ''})`);
  return { orderId: made.id, orderType: body.orderType };
}

router.post('/stripe-webhook', async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.GELATO_API_KEY) return res.status(503).json({ error: 'Order hand-off isn’t set up yet' });
  if (!verifyStripeSignature(req.rawBody, req.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET)) return res.status(400).json({ error: 'Bad signature' });
  const ev = req.body || {}, s = ev.data && ev.data.object;
  const paid = (ev.type === 'checkout.session.completed' || ev.type === 'checkout.session.async_payment_succeeded') && s && s.payment_status === 'paid';
  if (!paid) return res.json({ received: true });
  try {
    res.json({ received: true, ...(await placeGelatoOrder(s, siteBase(req))) });
  } catch (e) {
    console.error('[print] ORDER NOT PLACED for', s.id, '—', e.message);
    res.status(500).json({ error: 'Order not placed' });        // Stripe will call again later
  }
});

// A file over the size cap arrives here as an error from express.raw.
router.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'Print file is too large' });
  next(err);
});

module.exports = { router, lookup, fileShape, PRODUCTS, SIZES, stripeMode, stripeSessionParams, verifyStripeSignature, gelatoOrderBody, placeGelatoOrder, gelato, jpegSize, checkPrintFile, printFileExists, printFilePath };
