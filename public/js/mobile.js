/* GPX Sketch — phone layout (screens 860px wide and below).
   The poster/canvas fills the screen. A bottom bar (#mobBar) opens ONE tool
   panel at a time as a slide-up sheet. Topo's sheet is its sidebar (#rail);
   Abstract's is its left panel, which also takes the toolbar and colour dock
   while on a phone (moved back on desktop). Pieces carry data-tab="<name>";
   everything not on the open tab gets .mob-hide. Desktop is untouched. */
(function(){
  'use strict';
  var bar = document.getElementById('mobBar'); if(!bar) return;
  var body = document.body, mq = window.matchMedia('(max-width: 860px)');
  var $ = function(s){ return document.querySelector(s); };
  var rail = $('#rail'), left = $('#left-panel'), main = $('#main-container'),
      content = $('#content-area'), cbar = $('#controls-bar'), dock = $('#colorDockWrap');

  // Abstract's pieces get their tab here (Topo's are tagged in index.html).
  function tag(sel, tab){ document.querySelectorAll(sel).forEach(function(el){ el.dataset.tab = tab; }); }
  tag('#controls-bar > .file-input-group, #stravaConnectButton, #routesPanel', 'routes');
  tag('#controls-bar > .control-group, #reshuffleButton', 'style');
  tag('#editPanel, #statsCard', 'edit');
  tag('#colorDockWrap', 'colors');
  tag('#controls-bar > .save-group', 'export');

  // A grab handle at the top of each sheet — tap to close.
  var grabs = [rail, left].filter(Boolean).map(function(sheet){
    var g = document.createElement('button');
    g.type = 'button'; g.className = 'sheet-grab'; g.setAttribute('aria-label', 'Close panel');
    g.addEventListener('click', function(){ setSheet(null); });
    sheet.insertBefore(g, sheet.firstChild);
    return g;
  });

  function setSheet(name){
    if(name) body.dataset.sheet = name; else delete body.dataset.sheet;
    document.querySelectorAll('[data-tab]').forEach(function(el){
      el.classList.toggle('mob-hide', !!name && el.dataset.tab !== name);
    });
    if(cbar) cbar.classList.toggle('mob-hide', !!name && !cbar.querySelector('[data-tab="' + name + '"]'));
    bar.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.sheet === name)); });
    [rail, left].forEach(function(s){ if(s) s.scrollTop = 0; });
    // The art area just changed size — let both apps re-fit once the sheet has settled.
    setTimeout(function(){ window.dispatchEvent(new Event('resize')); }, 320);
  }
  window.__setMobileSheet = setSheet;   // test hook

  bar.addEventListener('click', function(e){
    var b = e.target.closest('button[data-sheet]'); if(!b) return;
    setSheet(body.dataset.sheet === b.dataset.sheet ? null : b.dataset.sheet);
  });

  // Abstract: toolbar + colour dock live inside the sheet on phones, and go home on desktop.
  function arrange(){
    if(!left || !main || !cbar || !dock) return;
    if(mq.matches){
      if(cbar.parentNode !== left){ left.insertBefore(cbar, grabs[grabs.length - 1].nextSibling); left.appendChild(dock); }
    } else {
      if(cbar.parentNode !== main){ main.insertBefore(cbar, content); main.appendChild(dock); }
      if(body.dataset.sheet) setSheet(null);
    }
  }
  if(mq.addEventListener) mq.addEventListener('change', arrange); else mq.addListener(arrange);
  arrange();

  // Tab names differ per app, so close the sheet when the app changes.
  try{
    var lastApp = body.dataset.app;
    new MutationObserver(function(){
      if(body.dataset.app !== lastApp){ lastApp = body.dataset.app; if(body.dataset.sheet) setSheet(null); }
    }).observe(body, { attributes:true, attributeFilter:['data-app'] });
  }catch(e){}

  // Touch screens pinch instead of scroll.
  if(window.matchMedia('(pointer: coarse)').matches){
    var t = document.querySelectorAll('#placeHint .txt');
    if(t[1]) t[1].textContent = 'Pinch to zoom';
  }
})();
