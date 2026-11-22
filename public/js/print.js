/* ======================================================================
   Print order panel. Shows the poster on a wall, to scale, in the chosen
   material and size, with the price. Prices come from the server
   (/api/print/products) — nothing here decides what anything costs.

   An app opens it with  window.__openPrint(() => posterNode)  where posterNode
   is a fresh copy of its poster (an <svg> or <img>) in the 3:4 poster shape.
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

  function open(getNode){
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
    if (b.id === 'ppCheckout') { $('ppFine').textContent = 'Checkout isn’t switched on yet — ordering is coming soon.'; return; }
    if (b.dataset.prod) prod = b.dataset.prod; else if (b.dataset.size) size = b.dataset.size; else if (b.dataset.trim) trim = b.dataset.trim; else return;
    draw();
    const again = panel.querySelector(`[data-${b.dataset.prod ? 'prod' : b.dataset.size ? 'size' : 'trim'}="${b.dataset.prod || b.dataset.size || b.dataset.trim}"]`);
    if (again) again.focus();                  // the buttons were redrawn — keep keyboard focus where it was
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });

  const topoBtn = $('printOpenTopo');
  if (topoBtn) topoBtn.addEventListener('click', () => open(window.__topoPosterNode));

  window.__openPrint = open; window.__closePrint = close;
})();
