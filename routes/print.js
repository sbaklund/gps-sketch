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

module.exports = { router, lookup, PRODUCTS, SIZES };
