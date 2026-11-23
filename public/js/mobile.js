/* GPX Sketch — the tool menu, for both layouts and both apps.
   One set of buttons (#mobBar) picks ONE panel at a time:
     - Desktop (above 860px): the buttons are an icon rail down the left edge and a
       panel is always open beside it.
     - Phone (860px and below): the buttons are a bottom bar; the panel is a slide-up
       sheet that can be closed, so the art fills the screen.
   The panel is Topo's sidebar (#rail) or Abstract's left panel, which also holds
   Abstract's old toolbar (#controls-bar). Pieces carry data-tab="<name>"; everything
   not on the open tab gets .mob-hide. Abstract's colour dock stays along the bottom
   on desktop and moves into the sheet ("Colors" tab) on phones. */
(function(){
  'use strict';
  var bar = document.getElementById('mobBar'); if(!bar) return;
  var body = document.body, mq = window.matchMedia('(max-width: 860px)');
  var $ = function(s){ return document.querySelector(s); };
  var rail = $('#rail'), left = $('#left-panel'), main = $('#main-container'),
      cbar = $('#controls-bar'), dock = $('#colorDockWrap'), tabbar = $('#tabbar');
  var HOME = { topo: 'route', abstract: 'routes' };          // panel shown first on desktop
  var lastPanel = { topo: HOME.topo, abstract: HOME.abstract };
  var app = function(){ return body.dataset.app === 'abstract' ? 'abstract' : 'topo'; };

  // Abstract's pieces get their tab here (Topo's are tagged in index.html).
  function tag(sel, tab){ document.querySelectorAll(sel).forEach(function(el){ el.dataset.tab = tab; }); }
  tag('#controls-bar > .file-input-group, #stravaConnectButton, #routesPanel', 'routes');
  tag('#controls-bar > .control-group, #reshuffleButton', 'style');
  tag('#editPanel, #statsCard', 'edit');
  tag('#colorDockWrap', 'colors');
  tag('#controls-bar > .save-group', 'export');

  // Top of each panel: a grab handle (phones — tap to close) and a title (desktop).
  var titles = [];
  var grabs = [rail, left].filter(Boolean).map(function(sheet){
    var h = document.createElement('h2'); h.className = 'menu-title'; sheet.insertBefore(h, sheet.firstChild); titles.push(h);
    var g = document.createElement('button');
    g.type = 'button'; g.className = 'sheet-grab'; g.setAttribute('aria-label', 'Close panel');
    g.addEventListener('click', function(){ setSheet(null); });
    sheet.insertBefore(g, sheet.firstChild);
    return g;
  });
  // Abstract's toolbar always lives in its panel now (it used to sit across the top on desktop).
  if(left && cbar && cbar.parentNode !== left) left.insertBefore(cbar, titles[titles.length - 1].nextSibling);

  function setSheet(name){
    if(!mq.matches && !name) name = lastPanel[app()];                     // desktop always has a panel open
    if(!mq.matches && name === 'colors') name = 'style';                  // …and its colour dock is always visible
    if(name) body.dataset.sheet = name; else delete body.dataset.sheet;
    document.querySelectorAll('[data-tab]').forEach(function(el){
      el.classList.toggle('mob-hide', !!name && el.dataset.tab !== name && !(el === dock && !mq.matches));
    });
    if(cbar) cbar.classList.toggle('mob-hide', !!name && !cbar.querySelector('[data-tab="' + name + '"]'));
    var label = '';
    bar.querySelectorAll('button').forEach(function(b){
      var on = b.dataset.sheet === name && b.classList.contains(app() === 'abstract' ? 'abs' : 'topo');
      b.setAttribute('aria-pressed', String(on));
      if(on) label = b.dataset.title || b.textContent.trim();
    });
    titles.forEach(function(h){ h.textContent = label; });
    if(name) lastPanel[app()] = name;
    [rail, left].forEach(function(s){ if(s) s.scrollTop = 0; });
    // The art area may have changed size — let both apps re-fit once things settle.
    setTimeout(function(){ window.dispatchEvent(new Event('resize')); }, 320);
  }
  window.__setMobileSheet = setSheet;   // test hook

  bar.addEventListener('click', function(e){
    var b = e.target.closest('button[data-sheet]'); if(!b) return;
    if(mq.matches) setSheet(body.dataset.sheet === b.dataset.sheet ? null : b.dataset.sheet);   // phone: tap again to close
    else setSheet(b.dataset.sheet);
  });

  // Colour dock: inside the sheet on phones, along the bottom of the app on desktop.
  function arrange(){
    if(tabbar) document.documentElement.style.setProperty('--tabbar-h', tabbar.offsetHeight + 'px');
    if(left && main && dock){
      if(mq.matches){ if(dock.parentNode !== left) left.appendChild(dock); }
      else if(dock.parentNode !== main) main.appendChild(dock);
    }
    setSheet(mq.matches ? null : lastPanel[app()]);
  }
  if(mq.addEventListener) mq.addEventListener('change', arrange); else mq.addListener(arrange);
  window.addEventListener('resize', function(){ if(tabbar) document.documentElement.style.setProperty('--tabbar-h', tabbar.offsetHeight + 'px'); });
  arrange();

  try{
    // Tab names differ per app: phones close the sheet, desktop shows that app's last panel.
    var lastApp = body.dataset.app;
    new MutationObserver(function(){
      if(body.dataset.app !== lastApp){ lastApp = body.dataset.app; setSheet(mq.matches ? null : lastPanel[app()]); }
    }).observe(body, { attributes:true, attributeFilter:['data-app'] });
    // Abstract, desktop: picking a shape on the canvas opens Edit (its buttons un-grey when something is selected).
    var probe = document.getElementById('reflectHButton');
    if(probe) new MutationObserver(function(){
      if(!mq.matches && app() === 'abstract' && !probe.disabled && body.dataset.sheet !== 'edit') setSheet('edit');
    }).observe(probe, { attributes:true, attributeFilter:['disabled'] });
  }catch(e){}

  // Touch screens pinch instead of scroll.
  if(window.matchMedia('(pointer: coarse)').matches){
    var t = document.querySelectorAll('#placeHint .txt');
    if(t[1]) t[1].textContent = 'Pinch to zoom';
  }
})();
