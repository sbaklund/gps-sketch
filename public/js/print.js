/* ======================================================================
   Print order panel. Shows the poster on a wall, to scale, in the chosen
   material and size, with the price. Prices come from the server
   (/api/print/products) — nothing here decides what anything costs.

   An app opens it with  window.__openPrint(() => posterNode, () => svgText):
   posterNode is a fresh copy of its poster for the preview, svgText is the same
   poster as SVG source for the print file. Both are the 3:4 poster shape.
   The scene is drawn in CSS for now; a photo can replace .pp-scene later.
   ====================================================================== */
(function(){
  const $ = id => document.getElementById(id);
  const panel = $('printPanel'); if (!panel) return;
  const CONSOLE_IN = 60;                       // the sideboard in the scene is 5 ft wide — everything is drawn to that scale
  let cat = null, prod = 'paper', size = '18x24', trim = null, lastFocus = null;
  let source = null;        // what is being printed: { node(), svg() } for Topo, { node(), image(longEdge), landscape } for Abstract
  const sideways = () => !!(source && source.landscape);
  const sizeLabel = s => sideways() ? `${s.h} × ${s.w} in` : s.label;

  // The Print button stays hidden until the server says printing is switched on (or ?print=1 for previewing).
  // ?print=1 switches the preview on for THIS browser and it stays on (so it survives the trip to Stripe and back,
  // and plain gpxsketch.io); ?print=0 switches it off again.
  let preview = false;
  try {
    const q = new URLSearchParams(location.search).get('print');
    if (q === '1') localStorage.setItem('gpxPrintPreview', '1'); else if (q === '0') localStorage.removeItem('gpxPrintPreview');
    preview = q === '1' || (q !== '0' && localStorage.getItem('gpxPrintPreview') === '1');
  } catch (e) { preview = /[?&]print=1\b/.test(location.search); }
  fetch('/api/print/products').then(r => r.ok ? r.json() : null).then(d => {
    if (!d || !Array.isArray(d.products)) return;
    cat = d;
    if (d.enabled || preview) { document.body.dataset.print = '1'; for (const id of ['printEntry', 'printOpenAbs']) { const e = $(id); if (e) e.hidden = false; } }
  }).catch(() => {});

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const product = () => cat.products.find(p => p.key === prod) || cat.products[0];

  function draw(){
    const p = product(), si = Math.max(0, cat.sizes.findIndex(s => s.key === size)), s = cat.sizes[si];
    if (p.trims.length) { if (!p.trims.some(t => t.key === trim)) trim = p.trims[0].key; } else trim = null;
    const t = p.trims.find(x => x.key === trim);

    $('ppProds').innerHTML = cat.products.map(x =>
      `<button type="button" class="pp-prod" data-prod="${esc(x.key)}" aria-pressed="${x.key === p.key}"><b>${esc(x.name)}</b><span>${esc(x.blurb)} · from $${x.prices[0]}</span></button>`).join('');
    $('ppSizes').innerHTML = cat.sizes.map((x, i) =>
      `<button type="button" class="pp-pill" data-size="${esc(x.key)}" aria-pressed="${i === si}"><b>${esc(sizeLabel(x))}</b><span>$${p.prices[i]}</span></button>`).join('');
    $('ppTrimRow').hidden = !p.trims.length;
    $('ppTrimLab').textContent = p.key === 'hanger' ? 'Hanger' : 'Frame';
    $('ppTrims').innerHTML = p.trims.map(x =>
      `<button type="button" data-trim="${esc(x.key)}" aria-pressed="${x.key === trim}" title="${esc(x.label)}" aria-label="${esc(x.label)}" style="background:${esc(x.hex)}"></button>`).join('');

    const art = $('ppArt');
    art.dataset.prod = p.key;
    const tall = sideways() ? s.w : s.h, wide = sideways() ? s.h : s.w;
    art.style.setProperty('--tall', tall); art.style.setProperty('--wide', wide); art.style.aspectRatio = wide + ' / ' + tall;
    art.style.setProperty('--trim', t ? t.hex : '#1c1c1c');

    const price = p.prices[si];
    $('ppLine').textContent = `${p.name}${t ? ' (' + t.label.toLowerCase() + ')' : ''}, ${sizeLabel(s)}`;
    $('ppPrice').textContent = '$' + price;
    $('ppShip').textContent = '$' + p.shipping;
    $('ppTotal').textContent = '$' + (price + p.shipping);
    $('ppDays').textContent = p.days;
    $('ppCap').textContent = `Shown to scale · ${sizeLabel(s)} above a ${CONSOLE_IN / 12} ft sideboard`;
  }

  /* ---------- print file ----------
     The poster SVG is drawn onto a big canvas and saved as one JPEG. An SVG used as a
     picture can't see the page's web fonts, so the fonts it uses are copied INTO it first. */
  const PRINT_WIDTHS = [3600, 3000, 2400];   // poster width in px (height = width × 4/3). Smaller ones are for phones that refuse very large canvases.

  function inRange(ranges, cp){
    return ranges.some(r => { const m = /^U\+([0-9A-F?]+)(?:-([0-9A-F]+))?$/i.exec(r.trim()); if (!m) return false;
      const lo = parseInt(m[1].replace(/\?/g, '0'), 16), hi = m[2] ? parseInt(m[2], 16) : parseInt(m[1].replace(/\?/g, 'F'), 16);
      return cp >= lo && cp <= hi; });
  }
  async function toDataUrl(url){
    const buf = new Uint8Array(await (await fetch(url)).arrayBuffer()); let bin = '';
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return 'data:font/woff2;base64,' + btoa(bin);
  }
  async function embedFonts(svgText){
    const link = document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
    if (!link) throw new Error('font list not found');
    const res = await fetch(link.href); if (!res.ok) throw new Error('font list did not load');
    const css = await res.text();
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const chars = [...new Set(doc.documentElement.textContent || '')].map(c => c.codePointAt(0));
    const faces = [];
    for (const block of css.match(/@font-face\s*{[^}]*}/g) || []) {
      const fam = (/font-family:\s*['"]?([^;'"]+)/.exec(block) || [])[1];
      const url = (/url\((https:[^)]+)\)/.exec(block) || [])[1];
      if (!fam || !url || !svgText.includes(fam.trim())) continue;
      const range = (/unicode-range:\s*([^;}]+)/.exec(block) || [])[1];
      if (range && !chars.some(cp => inRange(range.split(','), cp))) continue;
      faces.push(block.replace(url, await toDataUrl(url)));
    }
    if (!faces.length) throw new Error('no fonts matched the poster');
    return svgText.replace(/(<svg\b[^>]*>)/, '$1<style>' + faces.join('\n') + '</style>');
  }
  // pad = extra pixels on every side (canvas wrap). The border is the poster mirrored outwards, so
  // whatever folds around the edge of the canvas continues the picture instead of cutting into it.
  function rasterize(src, w, h, pad){
    return new Promise((resolve, reject) => {
      const img = new Image();
      const done = () => { if (src.startsWith('blob:')) URL.revokeObjectURL(src); };
      img.onerror = () => { done(); reject(new Error('poster could not be drawn')); };
      img.onload = () => {
        try {
          const c = document.createElement('canvas'); c.width = w + 2 * pad; c.height = h + 2 * pad;
          const ctx = c.getContext('2d'); if (!ctx) throw new Error('canvas too large');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
          for (let gx = (pad ? -1 : 0); gx <= (pad ? 1 : 0); gx++) for (let gy = (pad ? -1 : 0); gy <= (pad ? 1 : 0); gy++) {
            ctx.save();                                   // 3×3 tiles; every tile off-centre is flipped towards the middle one
            ctx.translate(pad + gx * w + (gx ? w : 0), pad + gy * h + (gy ? h : 0));
            ctx.scale(gx ? -1 : 1, gy ? -1 : 1);
            ctx.drawImage(img, 0, 0, w, h);
            ctx.restore();
          }
          c.toBlob(b => { done(); (b && b.size > 20000) ? resolve(b) : reject(new Error('canvas too large')); }, 'image/jpeg', 0.92);
        } catch (e) { done(); reject(e); }
      };
      img.src = src;
    });
  }
  /** Makes the print JPEG and uploads it. src is the thing being printed (see `source`); wrap = extra border
      per side as a share of the SHORT edge (canvas), or 0. → { id, url, width, height, bytes } */
  async function makePrintFile(src, wrap){
    if (typeof src === 'string') { const text = src; src = { svg: () => text }; }   // (test hook passes SVG text)
    const withFonts = src.svg ? await embedFonts(src.svg()) : null;              // never print with fallback fonts — fail instead
    let blob = null, lastErr = null;
    for (const short of PRINT_WIDTHS) {
      const long = short * 4 / 3, w = src.landscape ? long : short, h = src.landscape ? short : long;
      try {
        const url = withFonts ? URL.createObjectURL(new Blob([withFonts], { type: 'image/svg+xml' })) : await src.image(long);
        blob = await rasterize(url, w, h, Math.round(short * (wrap || 0))); break;
      } catch (e) { lastErr = e; }
    }
    if (!blob) throw lastErr || new Error('could not make the print file');
    const res = await fetch('/api/print/files', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error || 'upload failed');
    return d;
  }

  let printFile = null, busy = false;
  async function checkout(){
    if (busy) return;
    const btn = $('ppCheckout'), fine = $('ppFine');
    busy = true; btn.disabled = true; btn.textContent = 'Preparing your print file…';
    try {
      const p = product(), wrap = p.wrap ? p.wrap[Math.max(0, cat.sizes.findIndex(s => s.key === size))] : 0;
      if (!printFile || printFile.wrap !== wrap) { printFile = await makePrintFile(source, wrap); printFile.wrap = wrap; }
      btn.textContent = 'Opening secure checkout…';
      const res = await fetch('/api/print/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: prod, size, trim, orient: sideways() ? 'hor' : 'ver', fileId: printFile.id }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.url) { location.href = d.url; return; }           // off to Stripe's payment page
      if (res.status === 400 && /print file/i.test(d.error || '')) printFile = null;   // server lost the file — remake it next time
      fine.textContent = (d.error || 'Checkout could not be opened') + '. ';
      if (preview) { const a = document.createElement('a'); a.href = printFile ? printFile.url : '#'; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Open the print file'; if (printFile) fine.appendChild(a); }
    } catch (e) {
      console.error('[print] print file failed:', e);
      fine.textContent = 'Sorry — the print file could not be made (' + e.message + '). Please try again.';
    } finally { busy = false; btn.disabled = false; btn.textContent = 'Continue to checkout'; }
  }

  function open(src){
    if (!cat || !src) return;
    let node = null; try { node = src.node && src.node(); } catch (e) { console.error('[print] could not copy the artwork:', e); }
    if (!node) return;
    source = src; printFile = null;
    $('ppTitle').textContent = src.svg ? 'Print your poster' : 'Print your artwork';
    node.removeAttribute('id'); node.removeAttribute('width'); node.removeAttribute('height'); node.removeAttribute('style');
    $('ppArtIn').replaceChildren(node);
    $('ppFine').textContent = 'Secure payment by Stripe. Your design is sent to the printer exactly as shown.';
    draw();
    lastFocus = document.activeElement;
    panel.hidden = false; document.body.dataset.printOpen = '1';
    $('ppClose').focus();
  }
  function close(){
    if (panel.hidden) return;
    panel.hidden = true; delete document.body.dataset.printOpen;
    $('ppArtIn').replaceChildren();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  panel.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'ppClose') return close();
    if (b.id === 'ppCheckout') { if (source) checkout(); return; }
    if (b.dataset.prod) prod = b.dataset.prod; else if (b.dataset.size) size = b.dataset.size; else if (b.dataset.trim) trim = b.dataset.trim; else return;
    draw();
    const again = panel.querySelector(`[data-${b.dataset.prod ? 'prod' : b.dataset.size ? 'size' : 'trim'}="${b.dataset.prod || b.dataset.size || b.dataset.trim}"]`);
    if (again) again.focus();                  // the buttons were redrawn — keep keyboard focus where it was
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });

  /* ---------- back from Stripe: ?order=success&session_id=… or ?order=cancelled ---------- */
  function notice(title, text, action){      // action = { label, run } adds a second button
    const old = $('ppNotice'); if (old) old.remove();
    const box = document.createElement('div'); box.id = 'ppNotice'; box.setAttribute('role', 'status');
    const h = document.createElement('b'); h.textContent = title;
    const p = document.createElement('span'); p.textContent = text;
    const row = document.createElement('div'); row.className = 'pp-notice-btns';
    const x = document.createElement('button'); x.type = 'button'; x.textContent = action ? 'Not now' : 'OK'; x.onclick = () => box.remove();
    if (action) { x.className = 'quiet'; const go = document.createElement('button'); go.type = 'button'; go.textContent = action.label; go.onclick = () => { box.remove(); action.run(); }; row.append(x, go); }
    else row.append(x);
    box.append(h, p, row); document.body.appendChild(box);
    return p;
  }
  (function backFromCheckout(){
    const q = new URLSearchParams(location.search), state = q.get('order'); if (!state) return;
    const id = q.get('session_id');
    q.delete('order'); q.delete('session_id');
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);   // a reload must not repeat the message
    if (state === 'cancelled') { notice('Order not placed', 'You left checkout before paying. Nothing was charged.'); return; }
    if (state !== 'success' || !id) return;
    const line = notice('Thank you!', 'Checking your payment…');
    fetch('/api/print/checkout/' + encodeURIComponent(id)).then(r => r.json()).then(d => {
      if (d.paid) line.textContent = `Payment received: $${(d.total / 100).toFixed(2)}.` + (d.test ? ' This was a TEST payment — nothing will be printed or charged.' : ' Your print is on its way to the printer.');
      else line.textContent = 'We couldn’t confirm the payment yet. If you were charged, your order is safe — check your email for the receipt.';
    }).catch(() => { line.textContent = 'We couldn’t confirm the payment just now. Check your email for the receipt.'; });
  })();

  /* ---------- the Print buttons ---------- */
  const openTopo = () => open({ node: window.__topoPosterNode, svg: window.__topoPrintSvg });
  function openAbstract(){
    const a = window.__absPrint;
    if (!a || !a.ready()) { notice('Nothing to print yet', 'Add a route to your artwork first.'); return; }
    const { w, h } = a.shape(), r = w / h;
    if (Math.abs(r - 4 / 3) > 0.01 && Math.abs(r - 3 / 4) > 0.01) {
      notice('Prints come in 3 : 4', 'Your canvas is a different shape. Switch it to 3 : 4 (upright or sideways), arrange your artwork, then press Print again.',
        { label: 'Switch to 3 : 4', run: () => a.makePrintable() });
      return;
    }
    open({ node: a.node, image: a.image, landscape: r > 1 });
  }
  const openForApp = () => (document.body.dataset.app === 'abstract' ? openAbstract() : openTopo());
  { const t = $('printOpenTopo'); if (t) t.addEventListener('click', openTopo); }          // Topo's Save panel
  { const t = $('printOpenTop'); if (t) t.addEventListener('click', openForApp); }         // top bar (desktop), either app
  { const t = $('printOpenAbs'); if (t) t.addEventListener('click', openAbstract); }       // Abstract's Save panel

  window.__openPrint = open; window.__closePrint = close; window.__makePrintFile = makePrintFile;   // last one: test hook
})();
