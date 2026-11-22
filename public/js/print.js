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

  // The Print button stays hidden until the server says printing is switched on (or ?print=1 for previewing).
  const preview = /[?&]print=1\b/.test(location.search);
  fetch('/api/print/products').then(r => r.ok ? r.json() : null).then(d => {
    if (!d || !Array.isArray(d.products)) return;
    cat = d;
    if (d.enabled || preview) { document.body.dataset.print = '1'; const e = $('printEntry'); if (e) e.hidden = false; }
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
      `<button type="button" class="pp-pill" data-size="${esc(x.key)}" aria-pressed="${i === si}"><b>${esc(x.label)}</b><span>$${p.prices[i]}</span></button>`).join('');
    $('ppTrimRow').hidden = !p.trims.length;
    $('ppTrimLab').textContent = p.key === 'hanger' ? 'Hanger' : 'Frame';
    $('ppTrims').innerHTML = p.trims.map(x =>
      `<button type="button" data-trim="${esc(x.key)}" aria-pressed="${x.key === trim}" title="${esc(x.label)}" aria-label="${esc(x.label)}" style="background:${esc(x.hex)}"></button>`).join('');

    const art = $('ppArt');
    art.dataset.prod = p.key;
    art.style.setProperty('--tall', s.h); art.style.setProperty('--wide', s.w);
    art.style.setProperty('--trim', t ? t.hex : '#1c1c1c');

    const price = p.prices[si];
    $('ppLine').textContent = `${p.name}${t ? ' (' + t.label.toLowerCase() + ')' : ''}, ${s.label}`;
    $('ppPrice').textContent = '$' + price;
    $('ppShip').textContent = '$' + p.shipping;
    $('ppTotal').textContent = '$' + (price + p.shipping);
    $('ppDays').textContent = p.days;
    $('ppCap').textContent = `Shown to scale · ${s.label} above a ${CONSOLE_IN / 12} ft sideboard`;
  }

  /* ---------- print file ----------
     The poster SVG is drawn onto a big canvas and saved as one JPEG. An SVG used as a
     picture can't see the page's web fonts, so the fonts it uses are copied INTO it first. */
  const PRINT_SIZES = [[3600, 4800], [3000, 4000]];   // 3:4. Second size is for phones that refuse very large canvases.

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
  function rasterize(svgText, w, h){
    return new Promise((resolve, reject) => {
      const src = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' })), img = new Image();
      const done = () => URL.revokeObjectURL(src);
      img.onerror = () => { done(); reject(new Error('poster could not be drawn')); };
      img.onload = () => {
        try {
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          const ctx = c.getContext('2d'); if (!ctx) throw new Error('canvas too large');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h);
          c.toBlob(b => { done(); (b && b.size > 20000) ? resolve(b) : reject(new Error('canvas too large')); }, 'image/jpeg', 0.92);
        } catch (e) { done(); reject(e); }
      };
      img.src = src;
    });
  }
  /** Makes the print JPEG from poster SVG text and uploads it. → { id, url, width, height, bytes } */
  async function makePrintFile(svgText){
    const withFonts = await embedFonts(svgText);        // never print with fallback fonts — fail instead
    let blob = null, lastErr = null;
    for (const [w, h] of PRINT_SIZES) { try { blob = await rasterize(withFonts, w, h); break; } catch (e) { lastErr = e; } }
    if (!blob) throw lastErr || new Error('could not make the print file');
    const res = await fetch('/api/print/files', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error || 'upload failed');
    return d;
  }

  let getSvg = null, printFile = null, busy = false;
  async function checkout(){
    if (busy) return;
    const btn = $('ppCheckout'), fine = $('ppFine');
    busy = true; btn.disabled = true; btn.textContent = 'Preparing your print file…';
    try {
      if (!printFile) printFile = await makePrintFile(getSvg());
      btn.textContent = 'Opening secure checkout…';
      const res = await fetch('/api/print/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: prod, size, trim, fileId: printFile.id }) });
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

  function open(getNode, getSvgText){
    getSvg = getSvgText || null; printFile = null;
    if (!cat) return;
    let node = null; try { node = getNode && getNode(); } catch (e) { console.error('[print] could not copy the poster:', e); }
    if (!node) return;
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
    if (b.id === 'ppCheckout') { if (getSvg) checkout(); return; }
    if (b.dataset.prod) prod = b.dataset.prod; else if (b.dataset.size) size = b.dataset.size; else if (b.dataset.trim) trim = b.dataset.trim; else return;
    draw();
    const again = panel.querySelector(`[data-${b.dataset.prod ? 'prod' : b.dataset.size ? 'size' : 'trim'}="${b.dataset.prod || b.dataset.size || b.dataset.trim}"]`);
    if (again) again.focus();                  // the buttons were redrawn — keep keyboard focus where it was
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });

  /* ---------- back from Stripe: ?order=success&session_id=… or ?order=cancelled ---------- */
  function notice(title, text){
    const box = document.createElement('div'); box.id = 'ppNotice'; box.setAttribute('role', 'status');
    const h = document.createElement('b'); h.textContent = title;
    const p = document.createElement('span'); p.textContent = text;
    const x = document.createElement('button'); x.type = 'button'; x.textContent = 'OK'; x.onclick = () => box.remove();
    box.append(h, p, x); document.body.appendChild(box);
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

  const topoBtn = $('printOpenTopo');
  if (topoBtn) topoBtn.addEventListener('click', () => open(window.__topoPosterNode, window.__topoPrintSvg));

  window.__openPrint = open; window.__closePrint = close; window.__makePrintFile = makePrintFile;   // last one: test hook
})();
