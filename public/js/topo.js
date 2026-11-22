(function(){
'use strict';
/* ---------- palette library (shared with GPX Sketch Abstract) ---------- */
const PALETTES=[
{n:"Misty moorland",c:["#818D92", "#586A6A", "#B9A394", "#D4C5C7", "#DAD4EF"],fav:1},
{n:"Weathered olive",c:["#2F2504", "#594E36", "#7E846B", "#A5AE9E", "#D0DDD7"],fav:1},
{n:"Twilight harbor",c:["#DBC2CF", "#9FA2B2", "#3C7A89", "#2E4756", "#16262E"],fav:1},
{n:"Ember dusk",c:["#202C39", "#283845", "#B8B08D", "#F2D492", "#F29559"],fav:1},
{n:"Midnight tide",c:["#0D1321", "#1D2D44", "#3E5C76", "#748CAB", "#F0EBD8"],fav:1},
{n:"Terracotta trail",c:["#7F8267", "#8B9EA0", "#CD896C", "#F3EEE8"],fav:1},
{n:"Forest sage",c:["#CAD2C5", "#84A98C", "#52796F", "#354F52", "#2F3E46"],fav:1},
{n:"Rust and teal",c:["#283D3B", "#197278", "#EDDDD4", "#C44536", "#772E25"],fav:1},
{n:"Arctic harbor",c:["#000000", "#2F4550", "#586F7C", "#B8DBD9", "#F4F4F9"],fav:1},
{n:"Harvest clay",c:["#C0CAAD", "#9DA9A0", "#654C4F", "#B26E63", "#CEC075"],fav:1},
{n:"Sunset spectrum",c:["#005F73", "#94D2BD", "#EE9B00", "#BB3E03", "#9B2226"],x:["#0A9396", "#E9D8A6", "#CA6702", "#AE2012"],fav:1},
{n:"Coastal amber",c:["#8ECAE6", "#219EBC", "#023047", "#FFB703", "#FB8500"],fav:1},
{n:"Savanna sunset",c:["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],fav:1},
{n:"Olive harvest",c:["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"],fav:1},
{n:"Citrus pop",c:["#EAF2E3", "#61E8E1", "#F25757", "#F2E863", "#F2CD60"],fav:1},
{n:"Stormy morning",c:["#6B8AA7", "#BEDDFC", "#87BDF1", "#384959"],f:1},
{n:"Mossy hollow",c:["#636B2F", "#B9C096", "#D4DE95", "#3D4126"]},
{n:"Blue eclipse",c:["#282656", "#8685AD", "#525080", "#0F0E46"]},
{n:"Lush forest",c:["#2D6F3F", "#CDFFDC", "#68BA7F", "#233E2B"],f:1},
{n:"Green juice",c:["#4CBB16", "#48872C", "#39542B", "#2B3324"]},
{n:"Chili spice",c:["#CD1B17", "#FEA996", "#9B1212", "#380009"]},
{n:"Chocolate truffle",c:["#7E4A1A", "#C05800", "#FDFBD4", "#38240D"]},
{n:"Ink wash",c:["#5C5C5C", "#CBCBCB", "#FFFFE3", "#6C8196"]},
{n:"Golden taupe",c:["#D8B84B", "#BDB76B", "#FDFBD4", "#CE8947"]},
{n:"Wisteria bloom",c:["#D8D7FF", "#9400D3", "#D7BFD7", "#EE80E9"]},
{n:"Burnt sienna",c:["#E6644A", "#F5F5DD", "#F5A361", "#A0522C"]},
{n:"Blooming romance",c:["#660032", "#E574AC", "#46920E", "#005208"]},
{n:"Desert dusk",c:["#A4574F", "#E68057", "#BE7588", "#9A3A8C"]},
{n:"Lavender fields",c:["#FEFAD5", "#BCB96A", "#C1BFFF", "#D06DFC"]},
{n:"Hydrangea",c:["#FF8CA1", "#FFC3BA", "#FE9CE9", "#AC56C3"]},
{n:"Cactus flower",c:["#E491A5", "#855764", "#92E5B9", "#8EC67F"]},
{n:"Wildflowers",c:["#A8DCAB", "#509753", "#DBA9A6", "#BD92BE"]},
{n:"Country garden",c:["#FFFFE3", "#DBD4FE", "#808135", "#723380"]},
{n:"Lotus garden",c:["#ADEBB4", "#FF867B", "#ECAEE7", "#6B413D"]},
{n:"Iris garden",c:["#A47DAC", "#692477", "#81AB7D", "#6B6B4F"]},
{n:"Fresh peach",c:["#FFD3AC", "#FFB6AD", "#E39A7B", "#DCB16C"]},
{n:"Golden hour",c:["#FFC519", "#CFB53C", "#E0AFFE", "#EDEDC9"],f:1},
{n:"Spiced chai",c:["#FEFBD8", "#D47E30", "#8D5A2B", "#825E34"]},
{n:"Cherry blossom",c:["#F4CCCC", "#FFFFFF", "#D5F3D9", "#FFB7C5"]},
{n:"Evening rose",c:["#E0AAAA", "#9A6565", "#8E4585", "#4A4A4A"]},
{n:"Pastel garden",c:["#CC6F7F", "#F0B8B9", "#A1AE9D", "#54463B"]},
{n:"Tuscan sunset",c:["#E6644A", "#FFD3AC", "#9888A2", "#8A2B0D"]},
{n:"Zesty lemon",c:["#FFFF68", "#FDE664", "#D7D58A", "#B3B248"]},
{n:"California beaches",c:["#FFBF67", "#66F5FE", "#65C4FF", "#7B99AB"]},
{n:"Freshly squeezed",c:["#FEBF01", "#F2CF7F", "#FFE643", "#FF7800"]},
{n:"Pistachio dream",c:["#7FEF81", "#E3F0A2", "#B9DBA1", "#42D775"]},
{n:"Mango popsicle",c:["#F2BA49", "#ECD378", "#F1E82A", "#F2742F"]},
{n:"Guava",c:["#FF845A", "#FFB679", "#E55246", "#D05277"]},
{n:"Glowing horizon",c:["#FFB345", "#42EAFF", "#4271FD", "#FF7E44"]},
{n:"Sunny day",c:["#FEBF01", "#7F7140", "#007EFF", "#2400FF"]},
{n:"Retro sunset",c:["#C4611B", "#FFCE1B", "#069594", "#B7400F"],f:1},
{n:"Bubblegum pop",c:["#FF78BB", "#069594", "#FFFFFF", "#97F7FD"],f:1},
{n:"Cotton candy skies",c:["#B9A2E9", "#B8E3E9", "#F5B8D5", "#F9BEDE"]},
{n:"Electric kiwi",c:["#D1FF1A", "#FFFF02", "#DFFE01", "#000000"]},
{n:"Watermelon splash",c:["#FC7991", "#89F436", "#4A4A4A", "#ADEBB2"]},
{n:"Alchemical reaction",c:["#9E00FE", "#DE801C", "#6BFF00", "#5C7F3F"]},
{n:"Electropop",c:["#CCFF03", "#FF6900", "#FA00FE", "#5200FF"],f:1},
{n:"Cool revival",c:["#00FFFF", "#01AFFF", "#00DD92", "#00FF53"]},
{n:"Neon jungle",c:["#89F338", "#39A710", "#F23599", "#A936F2"]},
{n:"Sharp edge",c:["#898989", "#D9D9D9", "#FF4C4D", "#4DFFBB"]},
{n:"Electric fusion",c:["#00F0FF", "#00FF81", "#FFA800", "#FF6701"]},
{n:"Fireworks",c:["#EF2101", "#E88A38", "#970116", "#C000AC"]},
{n:"Space berries",c:["#FE3EB5", "#FFB7DC", "#FC692B", "#8B1945"]},
{n:"Pop art",c:["#19F2FE", "#FF46A2", "#FFFF02", "#EE4B2A"]},
{n:"Urban graffiti",c:["#FF3A19", "#2BFF06", "#00F0FF", "#5A5A5A"]},
{n:"Neon noir",c:["#191919", "#2BFF06", "#BF00FE", "#2D2D2D"]},
{n:"Tropical punch",c:["#FF8D56", "#FFBFCB", "#FBE883", "#069594"]},
{n:"Cobalt sky",c:["#1959B3", "#010080", "#82C8E4", "#6C8196"]},
{n:"Technicolor dream",c:["#FF19FE", "#00FFFF", "#CCFF01", "#191971"]},
{n:"Jewel box",c:["#61CE85", "#0F53B9", "#9966CB", "#CFB53C"],f:1},
{n:"Salt and pepper",c:["#FFFFFF", "#D4D4D4", "#B3B3B3", "#2B2B2B"]},
{n:"Quite clear",c:["#CBCBCB", "#F2F2F2", "#174C38", "#4E1617"]},
{n:"Gothic noir",c:["#000000", "#D2D0D1", "#988686", "#5D4F4F"]},
{n:"Yacht club",c:["#F2F1EF", "#BBBDBC", "#225F72", "#713E21"]},
{n:"Quiet luxury",c:["#F5E6C9", "#E7D69E", "#D9BBB0", "#AD9D8D"],f:1},
{n:"Night sands",c:["#CBBE94", "#FCE8B3", "#81775D", "#564A22"]},
{n:"Harbor haze",c:["#919EAE", "#5A8DC4", "#AC9E91", "#726F60"]},
{n:"Old photograph",c:["#FEFAD5", "#DAD7B6", "#878471", "#555233"]},
{n:"Cappuccino",c:["#D8B589", "#C7C0B8", "#705E47", "#432701"]},
{n:"Breakfast tea",c:["#FFD3AC", "#CCBEB1", "#664C35", "#351C08"]},
{n:"Cozy campfire",c:["#89512A", "#AE7933", "#8A6F28", "#680F09"]},
{n:"Stone path",c:["#ADA493", "#A5A58D", "#969084", "#E8E5DE"]},
{n:"Desert mirage",c:["#C7B98C", "#E35336", "#98A869", "#262756"]},
{n:"Honeycomb",c:["#FFC721", "#F9DF76", "#FFFCCF", "#89512A"]},
{n:"Urban loft",c:["#A6A4A5", "#A35E47", "#000000", "#464646"]},
{n:"Spiced mocha",c:["#7E5F4C", "#D47E30", "#F5F5DD", "#6D3B08"]},
{n:"Charming seaside",c:["#B4EBF0", "#85D2DC", "#B6F1D1", "#C9FDF1"]},
{n:"Calm blue",c:["#91D4FF", "#58BBFF", "#77B2D4", "#517992"]},
{n:"Beachfront views",c:["#EDE9D0", "#6F642E", "#DCD1EF", "#ACBEEC"]},
{n:"Under the moonlight",c:["#CACCFD", "#A4A3CD", "#5D5C98", "#282866"]},
{n:"Lavender lullaby",c:["#B7C7E9", "#9EF0FE", "#A4A5F5", "#8E6FCD"]},
{n:"Minty fresh",c:["#99FBCC", "#C0FFEC", "#80CFA8", "#558B71"]},
{n:"Retro calm",c:["#81D8CF", "#D99D82", "#D6D882", "#AE84DA"]},
{n:"Siltstone",c:["#CBBE94", "#FFF5B8", "#FFB170", "#CCA35B"]},
{n:"Emerald odyssey",c:["#006851", "#71E6CB", "#3EBB9E", "#0B3E31"],f:1},
{n:"Ocean tide",c:["#01D2D1", "#4152D6", "#00ADAE", "#005C5C"]},
{n:"Peach skyline",c:["#FFDBB9", "#BADCFF", "#B9FFF5", "#496580"]},
{n:"Mountain mist",c:["#7B8DA1", "#B0C4DD", "#01796E", "#5A5A5A"]},
{n:"Morning dew",c:["#B7EFEE", "#ADEBB2", "#C4C4C4", "#D3D3D3"]},
{n:"Frozen lake",c:["#7B8DA1", "#ADD9E6", "#FFF9F9", "#010080"]},
{n:"Olive grove",c:["#8C8C1A", "#228C22", "#636B2F", "#F1F0EE"]},
{n:"Coastal morning",c:["#9DCC80", "#89D0EF", "#F5F5DD", "#82C8E4"]},
{n:"Eucalyptus grove",c:["#B9B494", "#898989", "#F1F0EE", "#4B6E48"]},
{n:"Soft spring",c:["#6395EC", "#90B9D5", "#89CFAA", "#85DECC"]},
{n:"Autumn leaves",c:["#FFB345", "#DB9B3B", "#B37E2E", "#61441A"]},
{n:"Winter chill",c:["#B7E4EA", "#94B1B5", "#507D82", "#0B2E32"]},
{n:"Spring energy",c:["#89F338", "#FFFC30", "#4EE1C9", "#00BF33"]},
{n:"Pumpkin spice season",c:["#BD5203", "#8A4C1D", "#544822", "#322215"]},
{n:"Island oasis",c:["#CCFF03", "#FFF27F", "#9DE15A", "#FFAE26"]},
{n:"Autumn orchard",c:["#985791", "#DAA522", "#2D6F3F", "#660032"]},
{n:"Tropical rainforest",c:["#61CE85", "#7E8B53", "#4E7943", "#71AA35"]},
{n:"Wildflower meadow",c:["#FBF9EA", "#FDB814", "#82C8E4", "#7BFC01"]},
{n:"Harvest moon",c:["#8C1936", "#FFCE1B", "#A62A2A", "#BF5104"],f:1},
{n:"Winter berry",c:["#9A2235", "#2D6F3F", "#ADD9E6", "#FFFFFF"]},
{n:"Summer breeze",c:["#FFED4D", "#F88379", "#82C8E4", "#E7D8C5"]}
];

/* Six signature themes — the only ones shown up front.
   Hand-picked: the light and dark BACKGROUNDS (the artistic decision) and a
   `lineSeed` per mode that supplies the line's hue family. The actual line
   colours are COMPUTED by the same engine the 115 palettes use, so contrast is
   guaranteed in every render mode rather than eyeballed per theme.
   `natural` is the mode the theme was designed in — what you get on first pick. */
const SIGNATURE=[
 {key:'relief',name:'Relief',mode:'both',natural:'light',
  bgLight:'#f4efe4', bgDark:'#171c16', seedLight:'#6b5f43', seedDark:'#9c8d6a',
  ramp:['#2f6b3f','#6f9d54','#b7bd77','#ddd0a0','#efe6cf','#ffffff'],lineOp:0.35,route:'#d1462f'},
 {key:'blueprint',name:'Blueprint',mode:'line',natural:'dark',
  bgLight:'#eef4f8', bgDark:'#0f2b3d', seedLight:'#2b6079', seedDark:'#8fc0e0',
  ramp:['#173a50','#1f4a63','#2b6079','#3f7d94'],lineOp:0.9,route:'#ff6b5c'},
 {key:'ink',name:'Ink',mode:'line',natural:'light',
  bgLight:'#ece7db', bgDark:'#1a1917', seedLight:'#2b2b2b', seedDark:'#d8d2c4',
  ramp:['#2b2b2b'],lineOp:0.85,route:'#c0392b'},
 {key:'dusk',name:'Dusk',mode:'both',natural:'dark',
  bgLight:'#f5ece2', bgDark:'#1d1828', seedLight:'#8a7590', seedDark:'#b9a3c4',
  ramp:['#332a44','#5b3a54','#93465a','#c76a52','#e69a5c','#f2c884'],lineOp:0.55,route:'#ffe6b0'},
 {key:'sea',name:'Sea',mode:'fill',natural:'light',
  bgLight:'#f1ecdc', bgDark:'#06191f', seedLight:'#234b4f', seedDark:'#7fb3b0',
  ramp:['#0b3a4a','#1f6f7a','#57a1a2','#9cc4ae','#dcd7a2','#f2ead2'],lineOp:0.30,route:'#e4572e'},
 {key:'slate',name:'Mono',mode:'both',natural:'light',
  bgLight:'#e9e9ea', bgDark:'#171719', seedLight:'#2c2c2e', seedDark:'#b8b8bd',
  ramp:['#2c2c2e','#4a4a4d','#727276','#9d9da1','#c9c9cd','#f1f1f3'],lineOp:0.30,route:'#e4572e'},
];

/* ---------- colour helpers ---------- */
function _rgb(h){const c=h.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)];}
function _hex(r,g,b){const f=x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0');return '#'+f(r)+f(g)+f(b);}
function lum(h){const [r,g,b]=_rgb(h);return (0.299*r+0.587*g+0.114*b)/255;}
function chroma(h){const [r,g,b]=_rgb(h);return (Math.max(r,g,b)-Math.min(r,g,b))/255;}
function mix(h,t,a){const [r,g,b]=_rgb(h),[R,G,B]=_rgb(t);return _hex(r+(R-r)*a,g+(G-g)*a,b+(B-b)*a);}
function toHsv(hex){ if(!/^#[0-9a-f]{6}$/i.test(hex||''))hex='#888888';
 const [R,G,B]=_rgb(hex), r=R/255,g=G/255,b=B/255, mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn;
 let h=0; if(d){ if(mx===r)h=((g-b)/d)%6; else if(mx===g)h=(b-r)/d+2; else h=(r-g)/d+4; h/=6; if(h<0)h+=1; }
 return {h,s:mx?d/mx:0,v:mx}; }
function fromHsv(h,s,v){ const i=Math.floor(h*6), f=h*6-i, p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s);
 let r,g,b; switch(i%6){ case 0:r=v;g=t;b=p;break; case 1:r=q;g=v;b=p;break; case 2:r=p;g=v;b=t;break;
  case 3:r=p;g=q;b=v;break; case 4:r=t;g=p;b=v;break; default:r=v;g=p;b=q; }
 return _hex(r*255,g*255,b*255); }
/* ---------- the colour determiner ----------
   Three jobs, each with a guarantee:
     1. Backgrounds keep the palette's OWN character (its warm off-whites, its
        moody near-blacks) instead of washing everything toward pure white.
     2. Any colour can be pushed to a target luminance while keeping its hue.
     3. Contour lines are checked against whatever they actually sit on — the
        background in Lines mode, the filled RAMP in Bands/Both mode. */

const LIGHT_BAND = [0.78, 0.97];  // an acceptable "light background" luminance
const DARK_BAND  = [0.00, 0.19];  // an acceptable "dark background" luminance
const MIN_LINE_DELTA = 0.20;      // lines must differ this much from their backdrop

/* Push a hue/sat to an exact target luminance by binary-searching HSV value.
   A highly saturated hue can be physically incapable of reaching a bright
   target (a pure blue maxes out around lum 0.30), so if the search can't land
   on the target we progressively desaturate until it becomes reachable. */
function shadeToLum(h,s,target){
 let out = fromHsv(h,s,0.5);
 for(let attempt=0; attempt<7; attempt++){
  const sat = s * Math.pow(0.55, attempt);
  let lo=0, hi=1;
  for(let i=0;i<20;i++){ const mid=(lo+hi)/2; out=fromHsv(h,sat,mid);
   if(lum(out) < target) lo=mid; else hi=mid; }
  if(Math.abs(lum(out)-target) < 0.012) return out; }
 return out; }

/* Prefer a colour the palette ALREADY contains in the light band — that's a
   designed off-white with real warmth, far nicer than mixing toward #fff.
   Only synthesise when the palette has nothing bright enough, and even then
   carry a trace of the palette's hue so it never reads as sterile white. */
function pickLightBg(cols){
 const own = cols.filter(c=>lum(c)>=LIGHT_BAND[0] && lum(c)<=LIGHT_BAND[1])
                 .sort((a,b)=>lum(b)-lum(a));
 if(own.length) return own[0];
 const lightest = [...cols].sort((a,b)=>lum(b)-lum(a))[0];
 const {h,s} = toHsv(lightest);
 /* keep 3–11% saturation so the white inherits the palette's temperature */
 return shadeToLum(h, Math.min(Math.max(s*0.40,0.035),0.11), 0.93); }

function pickDarkBg(cols){
 const own = cols.filter(c=>lum(c)<=DARK_BAND[1]).sort((a,b)=>lum(a)-lum(b));
 if(own.length) return own[0];
 const darkest = [...cols].sort((a,b)=>lum(a)-lum(b))[0];
 const {h,s} = toHsv(darkest);
 return shadeToLum(h, Math.min(Math.max(s*0.85,0.10),0.55), 0.12); }

/* A line colour that reads against a single flat backdrop (Lines mode). */
function lineAgainstBg(base,bg){
 if(Math.abs(lum(base)-lum(bg)) >= MIN_LINE_DELTA+0.10) return base;
 const {h,s}=toHsv(base);
 return lum(bg) > 0.5
  ? shadeToLum(h, Math.max(s,0.20), Math.max(0.04, lum(bg)-0.55))
  : shadeToLum(h, Math.min(Math.max(s*0.8,0.14),0.30), Math.min(0.96, lum(bg)+0.55)); }

/* A line colour that reads against the FILLED RAMP (Bands / Both mode).

   A filled ramp occupies a set of luminances. The single flat colour that is
   most visible across ALL of them is the one sitting in the middle of the
   ramp's largest luminance gap — that maximises the minimum distance to any
   band (a maximin choice). For a ramp that spans the whole range no colour can
   contrast with every band, and this provably finds the best available. */
function bestSeparatorLum(ramp){
 const vals = [...new Set(ramp.map(lum))].sort((a,b)=>a-b);
 const pts  = [0, ...vals, 1];
 let bestGap=-1, bestMid=0.5;
 for(let i=0;i<pts.length-1;i++){
  const gap = pts[i+1]-pts[i];
  if(gap > bestGap){ bestGap=gap; bestMid=(pts[i]+pts[i+1])/2; } }
 return {target:bestMid, best:bestGap/2}; }

function lineAgainstRamp(base,bg,ramp){
 const {target} = bestSeparatorLum(ramp);
 const {h,s} = toHsv(base);
 /* Keep some of the seed's chroma, but not so much that it fights the bands. */
 const satCap = target > 0.5 ? 0.22 : 0.50;
 return shadeToLum(h, Math.min(s, satCap), target); }

/* Flip a chosen colour to its opposite end of the light/dark range, keeping its
   hue — so toggling Light/Dark on a CUSTOM colour stays that colour's family. */
function invertShade(hex,toDark){ const {h,s}=toHsv(hex);
 return toDark ? fromHsv(h, Math.min(s*0.85,0.55), 0.16) : fromHsv(h, Math.min(s*0.42,0.28), 0.965); }

/* Map an arbitrary palette onto terrain roles.
   ramp  = palette sorted by luminance (low elevation -> high)
   route = highest-chroma colour, pushed until it pops off the ramp
   line  = TWO variants: one for Lines mode, one for filled modes. */
function paletteToTheme(p,dark){
 const cols = p.c.concat(p.x||[]);
 const ramp = [...p.c].sort((a,b)=>lum(a)-lum(b));
 const bg   = dark ? pickDarkBg(cols) : pickLightBg(cols);
 const baseLine = dark ? ramp[ramp.length-1] : ramp[0];
 let route = [...cols].sort((a,b)=>chroma(b)-chroma(a))[0];
 /* the route must pop against both the bg and the ramp it crosses */
 const rMid = ramp.map(lum).reduce((a,b)=>a+b,0)/ramp.length;
 if(Math.abs(lum(route)-rMid) < 0.16 || Math.abs(lum(route)-lum(bg)) < 0.16){
  const {h,s}=toHsv(route);
  route = shadeToLum(h, Math.max(s,0.55), rMid > 0.5 ? 0.34 : 0.70); }
 return { key:'pal:'+p.n, name:p.n, palRef:p.n, mode:state.mode, ramp, bg,
  line:     lineAgainstBg(baseLine,bg),
  lineFill: lineAgainstRamp(baseLine,bg,ramp),
  lineOp:0.32, route }; }

/* Whichever mode a palette is in, decide its NATURAL starting mode from the
   palette's own centre of gravity — mostly-dark palettes open dark. */
function paletteNaturalDark(p){
 const avg = p.c.reduce((a,c)=>a+lum(c),0)/p.c.length;
 return avg < 0.45; }

const MAP={x:80,y:80,w:740,h:900};
const GW=185,GH=225,S_MIN=240,S_MAX=6400,MILES_PER_GRID=5.4/GW;
const R_W=340,R_H=414;
/* Terrain is framed with generous margin around the route so the Map-zoom slider
   can pull all the way "out" to ~half-canvas and still show terrain everywhere.
   The zoom is then a pure visual scale (≥1) about the route centre — see render(). */
const FRAME_PAD=0.5;

let state={ preset:SIGNATURE[0], themeRef:{type:'sig',key:'relief'}, mode:SIGNATURE[0].mode,
 interval:200, weight:1.0, routeWidth:3.4, routeZoom:0.35, showRoute:true, darkPoster:false,
 bgOverride:null, lineOverride:null, seed:7, showWater:false, showStats:true, showCoords:true, typePreset:'modern' };
let TER=null, route=null, routeStats=null, routeSmooth=true;
let currentIsDefault=false;   // true while showing the built-in Wonderland default
let placeMode=false;          // true = Place/Explore mode (a searched location, no route overlay)
let terrainStatus='idle';     // 'idle' | 'loading' | 'ok' | 'failed' — drives the legend's elevation note
/* Auto-fill tracking: true = the field holds an app-provided value (default or
   an imported route's name/location) and may be overwritten by the next import;
   false = the user typed their own and we must leave it alone. */
let titleAuto=true, subtitleAuto=true;
let rawGpx=null, gpxBbox=null, gpxHasEle=false;
const terrainCache=new Map();

/* Auto contour interval: pick a nice foot interval from the terrain's relief so
   the poster reads well everywhere — fine lines on flat ground, coarse on big
   mountains. Targets ~42 lines. Manual slider override sets intervalAuto=false. */
const NICE_IV=[10,20,40,50,80,100,150,200,250,400,500];
function autoInterval(relief){ const ideal=relief/42; return NICE_IV.find(v=>v>=ideal) ?? NICE_IV[NICE_IV.length-1]; }
let intervalAuto=true;
function applyAutoInterval(minFt,maxFt){
 if(!intervalAuto) return;
 const iv=autoInterval(maxFt-minFt); state.interval=iv;
 const el=document.getElementById('interval'), lab=document.getElementById('intervalVal');
 if(el) el.value=iv; if(lab) lab.textContent=iv+' ft';
}

/* ---------- resolved colours ---------- */
function bgColor(){ return state.bgOverride || state.preset.bg; }
/* Lines sit on the background in Lines mode, but on the filled RAMP in
   Bands/Both mode — so the resolved line colour depends on the render mode. */
function lineColor(){ if(state.lineOverride) return state.lineOverride;
 const P=state.preset, filled = state.mode==='fill' || state.mode==='both';
 return (filled && P.lineFill) ? P.lineFill : P.line; }
/* Legend ink must stay readable against whatever background is in play. */
function inkColor(){ const b=bgColor(); return lum(b)>0.5 ? mix(b,'#000000',0.82) : mix(b,'#ffffff',0.86); }

/* ---------- synthetic terrain ---------- */
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function buildSynthetic(seed){
 const rng=mulberry32(seed),peaks=[];
 peaks.push({cx:GW*(0.40+rng()*0.20),cy:GH*(0.34+rng()*0.22),h:1.15+rng()*0.30,s:GW*0.24});
 const extra=2+Math.floor(rng()*3); for(let i=0;i<extra;i++) peaks.push({cx:rng()*GW,cy:rng()*GH,h:0.35+rng()*0.75,s:GW*(0.10+rng()*0.16)});
 const noise=[]; for(let k=0;k<4;k++) noise.push({fx:(0.5+rng()*2)/GW*6.283,fy:(0.5+rng()*2)/GH*6.283,px:rng()*6.28,py:rng()*6.28,a:0.05+rng()*0.06});
 const tiltx=(rng()-0.5)*0.25,tilty=(rng()-0.5)*0.25,v=new Float64Array(GW*GH); let min=Infinity,max=-Infinity;
 for(let y=0;y<GH;y++) for(let x=0;x<GW;x++){ let e=0;
  for(const p of peaks){ const dx=x-p.cx,dy=y-p.cy; e+=p.h*Math.exp(-(dx*dx+dy*dy)/(2*p.s*p.s)); }
  for(const n of noise){ e+=n.a*Math.sin(n.fx*x+n.px)*Math.sin(n.fy*y+n.py); } e+=tiltx*(x/GW)+tilty*(y/GH);
  v[y*GW+x]=e; if(e<min)min=e; if(e>max)max=e; }
 const span=max-min||1; for(let i=0;i<v.length;i++) v[i]=S_MIN+((v[i]-min)/span)*(S_MAX-S_MIN);
 return {data:v,w:GW,h:GH,minFt:S_MIN,maxFt:S_MAX,kind:'synthetic',hasElev:true}; }
function elevAt(t,gx,gy){ gx=Math.max(0,Math.min(t.w-1.001,gx)); gy=Math.max(0,Math.min(t.h-1.001,gy));
 const x0=Math.floor(gx),y0=Math.floor(gy),fx=gx-x0,fy=gy-y0,W=t.w,D=t.data;
 const a=D[y0*W+x0],b=D[y0*W+x0+1],c=D[(y0+1)*W+x0],d=D[(y0+1)*W+x0+1];
 return a*(1-fx)*(1-fy)+b*fx*(1-fy)+c*(1-fx)*fy+d*fx*fy; }
function buildRoute(t,seed){ const rng=mulberry32(seed*911+13); let hi=-1,hx=t.w/2,hy=t.h/2;
 for(let y=0;y<t.h;y+=3) for(let x=0;x<t.w;x+=3){ const e=t.data[y*t.w+x]; if(e>hi){hi=e;hx=x;hy=y;} }
 const s=[t.w*(0.12+rng()*0.12),t.h*(0.80+rng()*0.14)];
 return [ s,[s[0]+(hx-s[0])*0.35+(rng()-0.5)*40,s[1]+(hy-s[1])*0.30+(rng()-0.5)*40],
  [s[0]+(hx-s[0])*0.68+(rng()-0.5)*34,s[1]+(hy-s[1])*0.66+(rng()-0.5)*34],
  [hx+(rng()-0.5)*10,hy+(rng()-0.5)*10],[hx+(rng()-0.3)*70,hy+(0.25+rng()*0.3)*60] ]; }
function statsFromGridPts(t,pts){
 const line=d3.line().curve(d3.curveCatmullRom.alpha(0.6)).x(d=>d[0]).y(d=>d[1]);
 const p=document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d',line(pts)); p.setAttribute('visibility','hidden');
 const host=document.getElementById('poster'); host.appendChild(p);
 const L=p.getTotalLength(),N=220; let dist=0,gain=0,hiE=-Infinity,prevE=null,prev=null;
 for(let i=0;i<=N;i++){ const q=p.getPointAtLength(L*i/N), e=elevAt(t,q.x,q.y);
  if(prev) dist+=Math.hypot(q.x-prev.x,q.y-prev.y); if(prevE!=null&&e>prevE) gain+=(e-prevE); hiE=Math.max(hiE,e); prev=q; prevE=e; }
 host.removeChild(p); return {miles:dist*MILES_PER_GRID,gain,high:hiE}; }

/* ---------- geo / GPX ---------- */
const lon2tileX=(lon,z)=>(lon+180)/360*Math.pow(2,z);
const lat2tileY=(lat,z)=>{ const r=lat*Math.PI/180; return (1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*Math.pow(2,z); };
/* OVERSCAN — we fetch a grid larger than the visible map (R_W×R_H) so panning
   reveals terrain that's already loaded instead of loading "on the spot", and
   so the water overlay is fetched once for the whole padded area. The visible
   window is R_W×R_H; the fetched grid is OSCAN× that. `viewDX/viewDY` are the
   window's offset inside the grid (centre by default; a drag slides them). */
const OSCAN=2.0;   // v0.35.0: wider margin → far fewer edge-reframes while panning
const GRID_W=Math.round(R_W*OSCAN), GRID_H=Math.round(R_H*OSCAN);
function makeFrame(la,lo,z){ const wx=lon2tileX(lo,z)*256, wy=lat2tileY(la,z)*256;
 const gw=GRID_W, gh=GRID_H;
 return {data:null,w:gw,h:gh,minFt:0,maxFt:1,kind:'route',left:wx-gw/2,top:wy-gh/2,zoom:z,lat:la,lon:lo,hasElev:false,
  viewDX:(gw-R_W)/2, viewDY:(gh-R_H)/2 }; }
/* Inverse Web-Mercator — world pixels back to lat/lon, for Place-mode pan/zoom. */
const tileX2lon=(tx,z)=> tx/Math.pow(2,z)*360-180;
const tileY2lat=(ty,z)=>{ const n=Math.PI*(1-2*ty/Math.pow(2,z)); return Math.atan(Math.sinh(n))*180/Math.PI; };
/* Display-window centre of a frame, in lat/lon (accounts for any pan offset). */
function frameCenterLatLon(t){
 const vx = t.viewDX!=null ? t.viewDX : 0, vy = t.viewDY!=null ? t.viewDY : 0;
 const cx = t.left + vx + R_W/2, cy = t.top + vy + R_H/2;
 return { lat: tileY2lat(cy/256, t.zoom), lon: tileX2lon(cx/256, t.zoom) }; }
/* Place-mode camera: the "Map zoom" slider (0..1) maps to an integer tile-zoom
   band. Effective zoom is continuous; render fetches at floor(eff) and applies a
   small visual scale (2^frac, always ≥1 so there's never an edge gap) to smooth
   between levels. Pan/zoom refetch keeps floor(eff) == TER.zoom. */
const PLACE_ZMIN=8, PLACE_ZMAX=15;
const zoomFromT=t=> PLACE_ZMIN + Math.max(0,Math.min(1,t))*(PLACE_ZMAX-PLACE_ZMIN);
const tFromZoom=z=> (Math.max(PLACE_ZMIN,Math.min(PLACE_ZMAX,z))-PLACE_ZMIN)/(PLACE_ZMAX-PLACE_ZMIN);

/* ---------- backend terrain fetch ---------- */
// BACKEND_URL: empty in production (same-origin, single service).
// During local dev with a separate frontend, point to the backend port.
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : '';    // same origin — no cross-domain needed
window.BACKEND_URL = BACKEND_URL;

// Real elevation, fetched + decoded IN THE BROWSER from AWS Terrarium tiles.
// Keyless open data on S3; no backend, no cold start. Standard XYZ tiles, so
// the frame's world-pixel box (left/top at zoom) maps straight onto tile pixels.
// Terrarium decode: metres = (R*256 + G + B/256) - 32768, then ×3.28084 = feet.
const TERRARIUM_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium';

/* Fetch one elevation tile with a per-attempt timeout and exponential backoff.
   A single stalled tile used to hang the whole map forever (Promise.all never
   settled) — now each attempt is aborted after `timeoutMs` and retried, so a
   flaky network or a rate-limit blip recovers on its own instead of freezing
   the "Creating map…" spinner. 4xx (other than 429) won't improve on retry, so
   we bail early on those. Resolves to an ImageBitmap or rejects after all tries. */
async function fetchTileImage(url, { timeoutMs = 6000, tries = 3 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < tries; attempt++) {
    if (attempt > 0) {
      const wait = Math.min(1500, 300 * Math.pow(2, attempt - 1)) + Math.random() * 200;
      await new Promise(r => setTimeout(r, wait));
    }
    const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    const to = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    try {
      const r = await fetch(url, { mode: 'cors', cache: 'force-cache', signal: ctrl ? ctrl.signal : undefined });
      if (to) clearTimeout(to);
      if (!r.ok) {
        lastErr = new Error('HTTP ' + r.status);
        if (r.status >= 400 && r.status < 500 && r.status !== 429) break; // permanent — don't retry
        continue;
      }
      const bmp = await createImageBitmap(await r.blob());
      return bmp;
    } catch (e) {
      if (to) clearTimeout(to);
      lastErr = e; // abort/timeout or network error → retry
    }
  }
  throw lastErr || new Error('tile failed');
}

/* Nearest-neighbour fill for the occasional missing tile. Before this, a tile
   that failed left its pixels at 0 (sea level) — a hard, off-colour flat patch
   that also dragged the elevation range's floor down to 0. Holes are marked NaN
   during sampling and filled here from the closest real neighbour (horizontal
   then vertical sweep), so a partial fetch degrades smoothly instead of tearing
   a blue-black rectangle through the poster. */
function fillHoles(a, w, h, fallback) {
  const sweep = (get, set, len, run) => {
    for (let outer = 0; outer < run; outer++) {
      let last = NaN;
      for (let inner = 0; inner < len; inner++) { const o = get(outer, inner); if (!isNaN(a[o])) last = a[o]; else if (!isNaN(last)) a[o] = last; }
      last = NaN;
      for (let inner = len - 1; inner >= 0; inner--) { const o = get(outer, inner); if (!isNaN(a[o])) last = a[o]; else if (!isNaN(last)) a[o] = last; }
    }
  };
  sweep((row, col) => row * w + col, null, w, h);   // horizontal
  sweep((col, row) => row * w + col, null, h, w);   // vertical
  for (let k = 0; k < a.length; k++) if (isNaN(a[k])) a[k] = fallback;
}

async function fetchTerrain(frame, source) {
  const TILE = 256;
  const { left, top, zoom } = frame;
  const GW = frame.w || R_W, GH = frame.h || R_H;   // grid (overscan) dimensions
  const scale = Math.pow(2, zoom), maxIdx = scale - 1;
  const tx0 = Math.floor(left / TILE), tx1 = Math.floor((left + GW - 1) / TILE);
  const ty0 = Math.floor(top  / TILE), ty1 = Math.floor((top  + GH - 1) / TILE);

  // Fetch + decode every covering tile in parallel.
  const tiles = {};
  const jobs  = [];
  let total = 0;
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      total++;
      const X = ((tx % scale) + scale) % scale;
      const Y = Math.min(Math.max(ty, 0), maxIdx);
      const url = `${TERRARIUM_URL}/${zoom}/${X}/${Y}.png`;
      jobs.push(
        fetchTileImage(url, { timeoutMs: 6000, tries: 3 })
          .then(bmp => {
            const c = document.createElement('canvas'); c.width = TILE; c.height = TILE;
            const g = c.getContext('2d', { willReadFrequently: true });
            g.drawImage(bmp, 0, 0);
            tiles[tx + '_' + ty] = g.getImageData(0, 0, TILE, TILE).data;
          })
          .catch(err => { console.warn('[topo] tile ' + tx + '/' + ty + ' failed:', err.message); })
      );
    }
  }
  await Promise.all(jobs);
  const got = Object.keys(tiles).length;
  if (got === 0) {
    throw new Error('Could not load elevation tiles (check your connection).');
  }
  // Too many holes to fill convincingly — fail cleanly to the plain-background
  // fallback rather than paint a map that's mostly guessed.
  if (got / total < 0.5) {
    throw new Error('Only part of the elevation data loaded — please try again.');
  }
  const hasHoles = got < total;

  // Sample the GW×GH output grid straight out of the tile mosaic.
  const out = new Float64Array(GW * GH);
  let min = Infinity, max = -Infinity;
  for (let j = 0; j < GH; j++) {
    for (let i = 0; i < GW; i++) {
      const wX = left + i, wY = top + j;
      const tx = Math.floor(wX / TILE), ty = Math.floor(wY / TILE);
      const px = tiles[tx + '_' + ty];
      if (px) {
        const lx = (wX - tx * TILE) | 0, ly = (wY - ty * TILE) | 0, o = (ly * TILE + lx) * 4;
        const ef = ((px[o] * 256 + px[o + 1] + px[o + 2] / 256) - 32768) * 3.28084;
        out[j * GW + i] = ef;
        if (ef < min) min = ef;
        if (ef > max) max = ef;
      } else {
        out[j * GW + i] = NaN;   // missing tile → hole, filled after the range is known
      }
    }
  }
  if (!(max > min)) throw new Error('No elevation range in tiles (flat or all water?).');
  if (hasHoles) fillHoles(out, GW, GH, min);
  return { data: out, minFt: min, maxFt: max };
}
function parseGpx(text){
 const xml=new DOMParser().parseFromString(text,'application/xml');
 if(xml.getElementsByTagName('parsererror').length) throw new Error('not valid GPX/XML');
 const grab=t=>Array.from(xml.getElementsByTagName(t));
 let els=grab('trkpt'); if(els.length<2) els=grab('rtept'); if(els.length<2) els=grab('wpt'); const pts=[];
 for(const el of els){ const lat=parseFloat(el.getAttribute('lat')),lon=parseFloat(el.getAttribute('lon'));
  if(!isFinite(lat)||!isFinite(lon)) continue; const e=el.getElementsByTagName('ele')[0]; const ele=e?parseFloat(e.textContent):null;
  pts.push({lat,lon,ele:isFinite(ele)?ele:null}); }
 if(pts.length<2) throw new Error('no track points found in file'); return pts; }
function bboxOf(pts){ let a=Infinity,b=-Infinity,c=Infinity,d=-Infinity;
 for(const p of pts){ if(p.lat<a)a=p.lat; if(p.lat>b)b=p.lat; if(p.lon<c)c=p.lon; if(p.lon>d)d=p.lon; }
 return {minLat:a,maxLat:b,minLon:c,maxLon:d}; }
function frameFromBbox(b,pad){
 const lp=((b.maxLat-b.minLat)||0.002)*pad, op=((b.maxLon-b.minLon)||0.002)*pad;
 const minLat=b.minLat-lp,maxLat=b.maxLat+lp,minLon=b.minLon-op,maxLon=b.maxLon+op;
 const cLat=(minLat+maxLat)/2,cLon=(minLon+maxLon)/2; let z=9;
 for(let cz=15;cz>=9;cz--){ const wpx=(lon2tileX(maxLon,cz)-lon2tileX(minLon,cz))*256,hpx=(lat2tileY(minLat,cz)-lat2tileY(maxLat,cz))*256;
  if(wpx<=R_W&&hpx<=R_H){ z=cz; break; } }
 return {centerLat:cLat,centerLon:cLon,zoom:z}; }
function projectGpx(pts,t){ return pts.map(p=>[lon2tileX(p.lon,t.zoom)*256-t.left, lat2tileY(p.lat,t.zoom)*256-t.top]); }
function haversine(a,b){ const R=6371000,toR=Math.PI/180,dLat=(b.lat-a.lat)*toR,dLon=(b.lon-a.lon)*toR,la1=a.lat*toR,la2=b.lat*toR;
 const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }
function gpxStatsBase(pts){ let d=0; for(let i=1;i<pts.length;i++) d+=haversine(pts[i-1],pts[i]);
 let gain=null,high=null;
 if(gpxHasEle){ gain=0; high=-Infinity; let prev=null;
  for(const p of pts){ if(p.ele==null) continue; const ft=p.ele*3.28084; if(prev!=null&&ft>prev) gain+=ft-prev; prev=ft; high=Math.max(high,ft); } }
 return {miles:d/1609.344,gain,high}; }
function gpxStatsWithTerrain(pts,grid,t){ const base=gpxStatsBase(pts); if(base.gain!=null) return base;
 let gain=0,high=-Infinity,prev=null;
 for(const g of grid){ const ft=elevAt(t,g[0],g[1]); if(prev!=null&&ft>prev) gain+=ft-prev; prev=ft; high=Math.max(high,ft); }
 return {miles:base.miles,gain,high}; }

/* ---------- render ---------- */
const svg=d3.select('#poster');
/* Title layout: wrap a topo title to at most TWO lines, shrinking the type
   when it spills a single line, and hard-truncating with an ellipsis so an
   over-long name (e.g. a verbose Strava activity title) is cut off cleanly
   instead of running off the edge of the 900-wide poster. There is a fixed
   ~60px of breathing room on each side, and the guardrail refuses to grow a
   third line — the second line simply ends in "…". Returns {lines, fontPx}. */
/* ==========================================================================
   TYPE TREATMENTS (U2) — full typographic looks for the poster label block.
   Each preset drives font family, weight, case, size, letter-spacing,
   alignment and vertical rhythm for the title / subtitle / stats / coords.
   Font stacks all carry a system fallback so the poster still reads if a web
   font is slow or (in the PNG export) not embedded. Serif = Georgia, a
   web-safe face that rasterises identically everywhere.
   ========================================================================== */
const FF_SANS    ="'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const FF_DISPLAY ="'Bricolage Grotesque', 'Inter', system-ui, sans-serif";
const FF_MONO    ="'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace";
const FF_SERIF   ="Georgia, 'Times New Roman', Times, serif";
const TYPE_PRESETS=[
 { key:'modern', name:'Modern', align:'center', leftX:88,
   title:{fam:FF_SANS,w:800,ls:2,upper:true,one:46,two:34},
   sub:{fam:FF_SANS,w:500,sz:18,ls:1,upper:false,it:false,op:.75},
   div:{show:true,half:150,w:1,op:.4},
   stat:{fam:FF_SANS,w:600,sz:15.5,ls:1.5,cs:'upper'},
   coord:{fam:FF_SANS,w:500,sz:12,ls:2,cs:'none',op:.6},
   gaps:{sub:30,div:52,stat:82,coord:108} },
 { key:'editorial', name:'Editorial', align:'center', leftX:88,
   title:{fam:FF_DISPLAY,w:800,ls:-0.5,upper:false,one:54,two:40},
   sub:{fam:FF_DISPLAY,w:300,sz:20,ls:0,upper:false,it:true,op:.82},
   div:{show:true,half:34,w:1.5,op:.5},
   stat:{fam:FF_SANS,w:500,sz:14,ls:1.6,cs:'upper'},
   coord:{fam:FF_SANS,w:400,sz:11.5,ls:1.6,cs:'none',op:.55},
   gaps:{sub:34,div:60,stat:86,coord:110} },
 { key:'technical', name:'Technical', align:'left', leftX:90, leftRule:true,
   title:{fam:FF_MONO,w:600,ls:1,upper:true,one:32,two:26},
   sub:{fam:FF_MONO,w:400,sz:13,ls:0.5,upper:false,it:false,op:.8},
   div:{show:false},
   stat:{fam:FF_MONO,w:500,sz:12.5,ls:0.5,cs:'upper'},
   coord:{fam:FF_MONO,w:400,sz:11,ls:0.5,cs:'none',op:.6},
   gaps:{sub:26,div:0,stat:58,coord:80} },
 { key:'minimal', name:'Minimal', align:'center', leftX:88,
   title:{fam:FF_SANS,w:200,ls:5,upper:true,one:30,two:24},
   sub:{fam:FF_SANS,w:300,sz:12,ls:3,upper:true,it:false,op:.7},
   div:{show:false},
   stat:{fam:FF_SANS,w:300,sz:11,ls:2,cs:'upper'},
   coord:{fam:FF_SANS,w:300,sz:9.5,ls:3,cs:'none',op:.55},
   gaps:{sub:34,div:0,stat:64,coord:86} },
 { key:'bold', name:'Bold', align:'center', leftX:88,
   title:{fam:FF_DISPLAY,w:800,ls:0,upper:true,one:60,two:46},
   sub:{fam:FF_SANS,w:600,sz:12,ls:1.6,upper:true,it:false,op:.75},
   div:{show:true,half:370,w:3,op:1},
   stat:{fam:FF_DISPLAY,w:700,sz:17,ls:0.2,cs:'upper'},
   coord:{fam:FF_SANS,w:500,sz:10.5,ls:1.4,cs:'none',op:.6},
   gaps:{sub:28,div:48,stat:76,coord:100} },
 { key:'serif', name:'Serif', align:'center', leftX:88,
   title:{fam:FF_SERIF,w:700,ls:0.5,upper:false,one:44,two:34},
   sub:{fam:FF_SERIF,w:400,sz:16,ls:0,upper:false,it:true,op:.8},
   div:{show:true,half:90,w:1,op:.35},
   stat:{fam:FF_SERIF,w:400,sz:13,ls:1.2,cs:'upper'},
   coord:{fam:FF_SERIF,w:400,sz:11.5,ls:0,cs:'none',it:true,op:.6},
   gaps:{sub:32,div:56,stat:84,coord:108} },
];
function typePreset(){ return TYPE_PRESETS.find(p=>p.key===state.typePreset) || TYPE_PRESETS[0]; }
function applyCase(s,cs){ if(cs==='upper') return (s||'').toUpperCase(); if(cs==='lower') return (s||'').toLowerCase(); return s||''; }
/* Type-treatment picker: one button per preset, each set in its own typeface. */
function buildTypeUI(){
 const pane=document.getElementById('typePane'); if(!pane) return;
 pane.innerHTML='';
 TYPE_PRESETS.forEach(p=>{
  const b=document.createElement('button'); b.type='button'; b.className='typebtn'; b.dataset.type=p.key;
  b.textContent=p.name; b.title=p.name+' type treatment';
  b.style.fontFamily=p.title.fam;
  b.style.fontWeight = p.key==='minimal' ? 400 : Math.min(700, p.title.w);   // keep labels legible at small size
  b.onclick=()=>{ if(state.typePreset===p.key) return; state.typePreset=p.key; markTypePreset(); render();
   if(typeof saveSessionSoon==='function') saveSessionSoon(); if(typeof pushHist==='function') pushHist(); };
  pane.appendChild(b);
 });
 markTypePreset();
}
function markTypePreset(){ const pane=document.getElementById('typePane'); if(!pane) return;
 pane.querySelectorAll('.typebtn').forEach(b=> b.setAttribute('aria-pressed', b.dataset.type===state.typePreset ? 'true':'false')); }

/* Title wrap/fit — measured in the ACTIVE treatment's font so wrapping stays
   correct across families/weights/sizes. `t` = a treatment's `title` spec. */
function topoTitleLayout(raw, t){
 t = t || TYPE_PRESETS[0].title;
 const MAXW=780;   // 900 poster − 60px padding each side
 let text=(raw||'').replace(/\s+/g,' ').trim();
 if(t.upper) text=text.toUpperCase();
 if(!text) return {lines:[''], fontPx:t.one};
 const ctx=topoTitleLayout._c||(topoTitleLayout._c=document.createElement('canvas').getContext('2d'));
 const wide=(s,fs)=>{ ctx.font=t.w+' '+fs+'px '+t.fam; return s?ctx.measureText(s).width+t.ls*Math.max(0,s.length-1):0; };
 if(wide(text,t.one)<=MAXW) return {lines:[text], fontPx:t.one};   // fits one line at full size
 const FS=t.two;                                                    // spills → drop a size and wrap
 const trunc=s=>{ if(wide(s,FS)<=MAXW) return s; let n=s.length;
  while(n>0 && wide(s.slice(0,n).replace(/\s+$/,'')+'…',FS)>MAXW) n--;
  return s.slice(0,Math.max(0,n)).replace(/\s+$/,'')+'…'; };
 const words=text.split(' '); const lines=[]; let cur='', i=0;
 while(i<words.length){
  const word=words[i], trial=cur?cur+' '+word:word;
  if(wide(trial,FS)<=MAXW){ cur=trial; i++; continue; }
  if(cur===''){                                   // one word wider than a whole line
   if(lines.length===1){ lines.push(trunc(word)); cur=''; break; }
   let n=1; while(n<word.length && wide(word.slice(0,n+1),FS)<=MAXW) n++;
   lines.push(word.slice(0,n)); words[i]=word.slice(n); continue;   // reprocess remainder
  }
  lines.push(cur); cur='';                         // commit line, wrap the word down
  if(lines.length===1){ lines.push(trunc([word].concat(words.slice(i+1)).join(' '))); cur=''; break; }
 }
 if(cur!=='' && lines.length<2) lines.push(cur);
 return {lines: lines.length?lines:[text], fontPx:FS};
}
/* Single-line fit-with-ellipsis for the subtitle/stat lines. */
function topoFitLine(raw, fontPx, weight, ls, maxW, family){
 const text=(raw||'').replace(/\s+/g,' ').trim();
 if(!text) return '';
 const ctx=topoTitleLayout._c||(topoTitleLayout._c=document.createElement('canvas').getContext('2d'));
 ctx.font=weight+' '+fontPx+'px '+(family||FF_SANS);
 const wide=s=> s?ctx.measureText(s).width+ls*Math.max(0,s.length-1):0;
 if(wide(text)<=maxW) return text;
 let n=text.length;
 while(n>0 && wide(text.slice(0,n).replace(/\s+$/,'')+'…')>maxW) n--;
 return text.slice(0,Math.max(0,n)).replace(/\s+$/,'')+'…';
}
function render(){
 if(!TER) return; const P=state.preset, BG=bgColor(), LN=lineColor(), INK=inkColor();
 svg.selectAll('*').remove();
 svg.append('rect').attr('width',900).attr('height',1200).attr('fill',BG);
 /* Display window (R_W×R_H) vs. the fetched OVERSCAN grid (TER.w×TER.h). For a
    real frame the terrain grid is larger than the visible box; `vDX/vDY` slide
    the window inside it (a live pan). The synthetic default has no overscan, so
    it falls back to showing its whole grid exactly as before. */
 const DISPW = TER.viewDX!=null ? R_W : TER.w;
 const DISPH = TER.viewDX!=null ? R_H : TER.h;
 const vDX = TER.viewDX||0, vDY = TER.viewDY||0;
 const sc0=`translate(${MAP.x},${MAP.y}) scale(${MAP.w/DISPW},${MAP.h/DISPH})`;
 svg.append('clipPath').attr('id','mapclip').append('rect').attr('width',DISPW).attr('height',DISPH);
 /* Map zoom — a visual scale. Route mode zooms about the route centre; Place
    mode about the display-window centre. Clamped ≥1 so terrain always covers. */
 let Z=1, zt='';
 if(route&&route.length>1){
  let xa=Infinity,xb=-Infinity,ya=Infinity,yb=-Infinity;
  for(const p of route){ if(p[0]<xa)xa=p[0]; if(p[0]>xb)xb=p[0]; if(p[1]<ya)ya=p[1]; if(p[1]>yb)yb=p[1]; }
  const zx=(xa+xb)/2, zy=(ya+yb)/2;
  const f0=Math.max((xb-xa)/DISPW,(yb-ya)/DISPH,0.05);   // route's fraction of the display window
  const t=Math.max(0,Math.min(1, state.routeZoom==null?0.35:state.routeZoom));
  Z=(0.5+0.45*t)/f0; if(Z<1) Z=1;
  if(Math.abs(Z-1)>0.001) zt=`translate(${zx},${zy}) scale(${Z}) translate(${-zx},${-zy})`;
 } else if(placeMode){
  /* Place mode is a live camera: the "Map zoom" slider sets a continuous
     effective tile-zoom; terrain is fetched at floor(eff) and the fractional
     part becomes a small visual scale (2^frac ∈ [1,2)) about the window centre. */
  const eff=zoomFromT(state.routeZoom==null?0.35:state.routeZoom);
  Z=Math.pow(2, eff-TER.zoom); const minZ=R_W/GRID_W; if(Z<minZ) Z=minZ;   // zoom-out into the overscan margin
  if(Math.abs(Z-1)>0.001){ const zx=vDX+R_W/2, zy=vDY+R_H/2; zt=`translate(${zx},${zy}) scale(${Z}) translate(${-zx},${-zy})`; }
 }
 const mapG=svg.append('g').attr('transform',sc0).attr('clip-path','url(#mapclip)');
 /* #panG slides the grid inside the clipped window — a live drag just updates
    this one transform (no re-render), and the overscan margin means real terrain
    scrolls into view instead of a blank edge. */
 const panG=mapG.append('g').attr('id','panG').attr('transform',`translate(${-vDX},${-vDY})`);
 const zoomG=panG.append('g').attr('id','zoomG'); if(zt) zoomG.attr('transform',zt);
 svg.node().style.cursor = placeMode ? 'grab' : '';
 if(TER.data){
  const rampFn=d3.interpolateRgbBasis(P.ramp.length>1?P.ramp:[P.ramp[0],P.ramp[0]]);
  const lo=TER.minFt,hi=TER.maxFt,span=(hi-lo)||1,levels=d3.range(lo+state.interval,hi,state.interval);
  const contours=d3.contours().size([TER.w,TER.h]).thresholds(levels)(TER.data),geo=d3.geoPath();
  const g=zoomG.append('g');
  const doFill=state.mode==='fill'||state.mode==='both', doLine=state.mode==='line'||state.mode==='both';
  if(doFill){
   /* Base layer: the lowest ramp colour under everything. d3.contours only
      produces bands for area ABOVE the first threshold, so terrain below it
      (valley floors, frame corners) would otherwise fall through to the poster
      background — a hard off-colour blob on any theme whose bg ≠ ramp[0]. */
   g.append('rect').attr('width',TER.w).attr('height',TER.h).attr('fill',rampFn(0));
   g.append('g').selectAll('path').data(contours).join('path').attr('d',geo).attr('fill',d=>rampFn((d.value-lo)/span)).attr('stroke','none');
  }
  if(doLine){ const wBase=state.weight/(MAP.w/DISPW)/Z;
   /* Lines-only is a two-colour piece, so the strokes go full strength. */
   const op = state.mode==='line' ? 1 : P.lineOp;
   g.append('g').selectAll('path').data(contours).join('path').attr('d',geo).attr('fill','none')
    .attr('stroke',LN).attr('stroke-opacity',op)
    .attr('stroke-width',d=>(Math.round((d.value-lo)/state.interval)%5===0?wBase*2.1:wBase)).attr('stroke-linejoin','round'); }
 }
 /* Water overlay (F1) — drawn over the terrain so lakes/rivers read as water,
    under the route line. Projected into TER space with the frame math; only
    drawn when the fetched data matches the current frame (no stale geometry). */
 if(state.showWater && featData && featData.gridKey===gridKey() && (featData.areas.length||featData.lines.length)){
  const wc=waterColors();
  const proj=pt=>[ lon2tileX(pt[0],TER.zoom)*256-TER.left, lat2tileY(pt[1],TER.zoom)*256-TER.top ];
  /* Water is drawn OVER the contours and is fully OPAQUE, so a lake — which is
     level — covers the terrain contour lines inside it and reads as a clean flat
     body right up to the shoreline (no topo lines crossing the water). A touch of
     Catmull-Rom smoothing softens the shoreline/rivers so they aren't faceted. */
  const areaCurve=d3.line().curve(d3.curveCatmullRomClosed.alpha(0.5)).x(d=>d[0]).y(d=>d[1]);
  const riverCurve=d3.line().curve(d3.curveCatmullRom.alpha(0.5)).x(d=>d[0]).y(d=>d[1]);
  const wg=zoomG.append('g');
  const sw=0.6/(MAP.w/DISPW)/Z;
  /* v0.46.0 — each area is a polygon WITH its islands (rings after the first are
     holes → fill-rule evenodd), and each ring is split into runs: real shoreline
     (type 0: smoothed + stroked) and tile-clip edge (type 1: straight, fill only),
     so big lakes/sea show no seam lines where map tiles meet. All fills are drawn
     first, then one shoreline stroke on top (a neighbouring tile's fill can't
     cover it). */
  const lin=d3.line().x(d=>d[0]).y(d=>d[1]);
  const shore=[];
  const ringPath=runs=>{
   if(runs.length===1){ const pts=runs[0][1].map(proj);
    if(pts.length>2 && pts[0][0]===pts[pts.length-1][0] && pts[0][1]===pts[pts.length-1][1]) pts.pop();
    if(pts.length<3) return '';
    if(runs[0][0]===0){ const d=areaCurve(pts)+'Z'; shore.push(d); return d; }
    return lin(pts)+'Z'; }
   let d='';
   for(const run of runs){ const pts=run[1].map(proj); if(pts.length<2) continue;
    const seg=(run[0]?lin:riverCurve)(pts); if(!run[0]) shore.push(seg);
    d+= d ? 'L'+seg.slice(1) : seg; }
   return d ? d+'Z' : ''; };
  for(const poly of featData.areas){ const d=poly.map(ringPath).join(''); if(!d) continue;
   wg.append('path').attr('d',d).attr('fill',wc.fill).attr('fill-rule','evenodd').attr('stroke','none'); }
  if(shore.length) wg.append('path').attr('d',shore.join('')).attr('fill','none')
   .attr('stroke',wc.line).attr('stroke-width',sw).attr('stroke-linejoin','round').attr('stroke-linecap','round');
  const lw=1.7/(MAP.w/DISPW)/Z;
  for(const ln of featData.lines){ if(ln.length<2) continue;
   wg.append('path').attr('d',riverCurve(ln.map(proj))).attr('fill','none').attr('stroke',wc.line).attr('stroke-width',lw)
    .attr('stroke-linecap','round').attr('stroke-linejoin','round'); }
 }
 if(state.showRoute&&route&&route.length>1){
  let pts=route;
  if(pts.length>2500){ const step=Math.ceil(pts.length/2000); pts=route.filter((_,i)=>i%step===0); if(pts[pts.length-1]!==route[route.length-1]) pts.push(route[route.length-1]); }
  const curve=routeSmooth?d3.curveCatmullRom.alpha(0.6):d3.curveLinear, line=d3.line().curve(curve).x(d=>d[0]).y(d=>d[1]);
  const rg=zoomG.append('g'), w=state.routeWidth/(MAP.w/DISPW)/Z;
  rg.append('path').attr('d',line(pts)).attr('fill','none').attr('stroke',BG).attr('stroke-opacity',0.6).attr('stroke-width',w*2.1).attr('stroke-linecap','round').attr('stroke-linejoin','round');
  rg.append('path').attr('d',line(pts)).attr('fill','none').attr('stroke',P.route).attr('stroke-width',w).attr('stroke-linecap','round').attr('stroke-linejoin','round');
  const r=(state.routeWidth*1.24)/(MAP.w/DISPW)/Z;
  rg.append('circle').attr('cx',route[0][0]).attr('cy',route[0][1]).attr('r',r).attr('fill',P.route);
  rg.append('circle').attr('cx',route[route.length-1][0]).attr('cy',route[route.length-1][1]).attr('r',r).attr('fill',BG).attr('stroke',P.route).attr('stroke-width',r*0.5);
 }
 /* ----- Label block, driven by the active TYPE TREATMENT (U2) ----- */
 const TP=typePreset();
 const cx=450, L=svg.append('g');
 const TL=topoTitleLayout(document.getElementById('title').value, TP.title);
 const two=TL.lines.length>1;
 const TITLE_PAD=16;
 const lineGap=Math.round(TL.fontPx*0.86);
 /* `base` = baseline of the LAST title line; two-line lifts the first line up. */
 const base=(two?1050:1034)+TITLE_PAD, firstY=two ? base-lineGap : base;
 const align=TP.align, leftX=TP.leftX;
 const anchor = align==='left' ? 'start' : 'middle';
 /* Centering compensation: letter-spacing adds trailing space after the last
    glyph, nudging a centre-anchored line right by ls/2 — pull it back. */
 const xFor=ls=> align==='left' ? leftX : (cx - (ls||0)/2);
 // Title
 TL.lines.forEach((ln,i)=>{
  L.append('text').attr('x',xFor(TP.title.ls)).attr('y',firstY+i*lineGap).attr('text-anchor',anchor)
   .attr('font-family',TP.title.fam).attr('font-weight',TP.title.w).attr('font-style',TP.title.it?'italic':'normal')
   .attr('font-size',TL.fontPx).attr('letter-spacing',TP.title.ls).attr('fill',INK).text(ln);
 });
 // Subtitle
 { const s=TP.sub, subMax= align==='left' ? 720 : 780;
   let txt=applyCase(document.getElementById('subtitle').value, s.upper?'upper':'none');
   txt=topoFitLine(txt, s.sz, s.w, s.ls, subMax, s.fam);
   L.append('text').attr('x',xFor(s.ls)).attr('y',base+TP.gaps.sub).attr('text-anchor',anchor)
    .attr('font-family',s.fam).attr('font-weight',s.w).attr('font-style',s.it?'italic':'normal')
    .attr('font-size',s.sz).attr('letter-spacing',s.ls).attr('fill',INK).attr('opacity',s.op).text(txt); }
 // Stat + coord strings (content logic unchanged)
 let statLine,coordLine;
 const coordStr=()=>{ const ns=TER.lat>=0?'N':'S',ew=TER.lon>=0?'E':'W'; return `${Math.abs(TER.lat).toFixed(4)}° ${ns}   ${Math.abs(TER.lon).toFixed(4)}° ${ew}`; };
 if(!rawGpx && !placeMode){ statLine='UPLOAD A GPX ROUTE TO GET STARTED'; coordLine=''; }
 else if(routeStats){
  const parts=[`${routeStats.miles.toFixed(1)} MI`];
  if(routeStats.gain!=null) parts.push(`+${Math.round(routeStats.gain).toLocaleString()} FT`);
  if(routeStats.high!=null) parts.push(`HIGH ${Math.round(routeStats.high).toLocaleString()} FT`);
  statLine=parts.join('   ·   ');
  const elevNote = TER.hasElev ? '' : (terrainStatus==='failed' ? '   ·   ELEVATION UNAVAILABLE' : '   ·   ELEVATION LOADING');
  coordLine=coordStr()+elevNote;
 } else if(TER.data){
  const r10=x=>Math.round(x/10)*10; statLine=`ELEVATION ${r10(TER.minFt).toLocaleString()}–${r10(TER.maxFt).toLocaleString()} FT   ·   CONTOUR ${state.interval} FT`;
  coordLine=coordStr();
 } else if(placeMode){
  statLine = terrainStatus==='failed' ? 'ELEVATION UNAVAILABLE' : 'LOADING TERRAIN…';
  coordLine = coordStr();
 } else { statLine='LOADING ROUTE…'; coordLine=''; }
 if(state.showStats===false) statLine='';       // "choose what info shows" toggles
 if(state.showCoords===false) coordLine='';
 // Divider / left rule
 if(TP.leftRule){
  const y0=firstY-Math.round(TL.fontPx*0.74), y1=base+TP.gaps.coord+4;
  L.append('line').attr('x1',leftX-14).attr('x2',leftX-14).attr('y1',y0).attr('y2',y1).attr('stroke',INK).attr('stroke-opacity',0.5).attr('stroke-width',2);
 } else if(TP.div && TP.div.show){
  const half=TP.div.half; L.append('line').attr('x1',cx-half).attr('x2',cx+half).attr('y1',base+TP.gaps.div).attr('y2',base+TP.gaps.div).attr('stroke',INK).attr('stroke-opacity',TP.div.op).attr('stroke-width',TP.div.w);
 }
 // Stat line
 { const s=TP.stat; const txt=applyCase(statLine, s.cs);
   L.append('text').attr('x',xFor(s.ls)).attr('y',base+TP.gaps.stat).attr('text-anchor',anchor)
    .attr('font-family',s.fam).attr('font-weight',s.w).attr('font-size',s.sz).attr('letter-spacing',s.ls).attr('fill',INK).text(txt); }
 // Coord line
 { const s=TP.coord; const txt=applyCase(coordLine, s.cs);
   L.append('text').attr('x',xFor(s.ls)).attr('y',base+TP.gaps.coord).attr('text-anchor',anchor)
    .attr('font-family',s.fam).attr('font-weight',s.w).attr('font-style',s.it?'italic':'normal')
    .attr('font-size',s.sz).attr('letter-spacing',s.ls).attr('fill',INK).attr('opacity',s.op).text(txt); }
}
/* One-shot flag: when set, the very next crossfade() renders immediately with NO
   opacity dip. Used by the seamless Place-mode reframe so a drag-release swap has
   zero loading feel — the old terrain stays put and the new frame replaces it in
   a single clean paint. Consumed (reset) by the first crossfade that sees it. */
let _skipFade=false;
function crossfade(){ const shell=document.getElementById('poster-shell');
 if(_skipFade){ _skipFade=false; shell.style.opacity=1; render(); return; }
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){ render(); return; }
 shell.style.opacity=0.25; requestAnimationFrame(()=>{ render(); requestAnimationFrame(()=>shell.style.opacity=1); }); }
function rebuildSynthetic(){ TER=buildSynthetic(state.seed); route=buildRoute(TER,state.seed); routeSmooth=true; routeStats=statsFromGridPts(TER,route); }

/* ============================================================
   UNDO / REDO  — design decisions only.
   Terrain loads and GPX imports are deliberately NOT recorded:
   undoing a file you just imported feels broken, not helpful.
   ============================================================ */
const HIST_MAX=60; let hist=[], histIdx=-1, histLock=false, histTimer=null;
function snap(){ return JSON.stringify({ themeRef:state.themeRef, mode:state.mode, interval:state.interval,
 weight:state.weight, routeWidth:state.routeWidth, routeZoom:state.routeZoom, showRoute:state.showRoute, showWater:state.showWater, showStats:state.showStats, showCoords:state.showCoords, darkPoster:state.darkPoster,
 bgOverride:state.bgOverride, lineOverride:state.lineOverride, seed:state.seed, typePreset:state.typePreset,
 title:document.getElementById('title').value, subtitle:document.getElementById('subtitle').value }); }
function pushHist(){ if(histLock) return; const s=snap(); if(hist[histIdx]===s) return;
 hist=hist.slice(0,histIdx+1); hist.push(s); if(hist.length>HIST_MAX) hist.shift();
 histIdx=hist.length-1; updateHistUI();
 if(typeof saveSessionSoon==='function') saveSessionSoon(); }
function pushHistSoon(){ clearTimeout(histTimer); histTimer=setTimeout(pushHist,400); }
/* THE single source of truth for building a theme in a given mode.
   Signature themes have hand-picked light/dark variants; palettes are derived
   with guaranteed-contrast helpers. Everything that changes theme or mode goes
   through here, so Light/Dark can never drift out of sync with the actual bg. */
function themeForMode(ref,dark){
 if(!ref) ref={type:'sig',key:'relief'};
 if(ref.type==='sig'){
  const s=SIGNATURE.find(p=>p.key===ref.key)||SIGNATURE[0];
  const bg   = dark ? s.bgDark   : s.bgLight;
  const seed = dark ? s.seedDark : s.seedLight;
  return {...s, mode:state.mode, bg,
   line:     lineAgainstBg(seed,bg),
   lineFill: lineAgainstRamp(seed,bg,s.ramp) }; }
 const p=PALETTES.find(x=>x.n===ref.name);
 return p ? paletteToTheme(p,dark) : themeForMode({type:'sig',key:'relief'},dark); }
/* The mode a theme opens in the first time you pick it. */
function naturalDarkFor(ref){
 if(ref.type==='sig'){ const s=SIGNATURE.find(p=>p.key===ref.key); return s ? s.natural==='dark' : false; }
 const p=PALETTES.find(x=>x.n===ref.name); return p ? paletteNaturalDark(p) : false; }
function themeFromRef(ref){ return themeForMode(ref,state.darkPoster); }
function restore(s){ const o=JSON.parse(s); histLock=true;
 state.themeRef=o.themeRef; state.mode=o.mode; state.interval=o.interval; state.weight=o.weight;
 if(o.routeWidth!=null) state.routeWidth=o.routeWidth;
 if(o.routeZoom!=null) state.routeZoom=o.routeZoom;
 state.showRoute=o.showRoute; state.darkPoster=o.darkPoster; state.bgOverride=o.bgOverride;
 state.lineOverride=o.lineOverride;
 const seedChanged = state.seed!==o.seed; state.seed=o.seed;
 state.preset=themeFromRef(state.themeRef); state.preset.mode=state.mode;
 document.getElementById('title').value=o.title; document.getElementById('subtitle').value=o.subtitle;
 document.getElementById('interval').value=state.interval; document.getElementById('intervalVal').textContent=state.interval+' ft';
 document.getElementById('weight').value=state.weight; document.getElementById('weightVal').textContent=(+state.weight).toFixed(1);
 { const rwEl=document.getElementById('routeWidth'), rwv=document.getElementById('routeWidthVal');
   if(rwEl){ rwEl.value=state.routeWidth; rwv.textContent=(+state.routeWidth).toFixed(1); } }
 { const rzEl=document.getElementById('routeZoom');
   if(rzEl){ rzEl.value=state.routeZoom; document.getElementById('routeZoomVal').textContent=Math.round((+state.routeZoom)*100)+'%'; } }
 if(typeof syncRoutePresets==='function') syncRoutePresets();
 document.getElementById('showRoute').checked=state.showRoute;
 if(o.showWater!=null){ const changed=state.showWater!==o.showWater; state.showWater=o.showWater;
   const wt=document.getElementById('showWater'); if(wt) wt.checked=!!o.showWater;
   if(changed && typeof updateFeatures==='function'){ if(o.showWater) updateFeatures(); else featData=null; } }
 if(o.showStats!=null){ state.showStats=o.showStats; const el=document.getElementById('showStats'); if(el) el.checked=!!o.showStats; }
 if(o.showCoords!=null){ state.showCoords=o.showCoords; const el=document.getElementById('showCoords'); if(el) el.checked=!!o.showCoords; }
 if(o.typePreset){ state.typePreset=o.typePreset; if(typeof markTypePreset==='function') markTypePreset(); }
 syncMode(); syncPosterMode(); markSelectedTheme(); buildColorsUI(); render();
 histLock=false; updateHistUI(); }
function undo(){ if(histIdx>0){ histIdx--; restore(hist[histIdx]); } }
function redo(){ if(histIdx<hist.length-1){ histIdx++; restore(hist[histIdx]); } }
function updateHistUI(){ const bar=document.getElementById('histBar');
 if(hist.length>1) bar.classList.add('on');
 document.getElementById('undoBtn').disabled=histIdx<=0;
 document.getElementById('redoBtn').disabled=histIdx>=hist.length-1; }
document.getElementById('undoBtn').onclick=undo;
document.getElementById('redoBtn').onclick=redo;
document.addEventListener('keydown',e=>{ const t=e.target;
 if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return;
 if(!(e.ctrlKey||e.metaKey)) return; const k=e.key.toLowerCase();
 if(k==='z'&&!e.shiftKey){ e.preventDefault(); undo(); }
 else if((k==='z'&&e.shiftKey)||k==='y'){ e.preventDefault(); redo(); } });

/* ---------- themes: six tiles + everything else in the dropdown ---------- */
function markSelectedTheme(){
 document.querySelectorAll('#signaturePane .preset').forEach(b=>b.setAttribute('aria-pressed', b.dataset.key===state.preset.key));
 document.querySelectorAll('#moreList .palrow').forEach(r=>r.classList.toggle('sel', 'pal:'+r.dataset.raw===state.preset.key));
 document.getElementById('moreBtnLabel').textContent = 'More themes'; }
/* Apply a theme by REFERENCE. The theme opens in its natural mode (the mode it
   was designed in), and the Light/Dark toggle is synced to match — so the
   toggle always shows the truth, and clicking the other side always changes. */
function applyTheme(ref){
 state.themeRef=ref;
 /* A new theme is a fresh start — custom colours don't carry over. */
 state.bgOverride=null; state.lineOverride=null; closePicker();
 state.darkPoster=naturalDarkFor(ref);
 const theme=themeForMode(ref,state.darkPoster);
 if(theme.mode) state.mode=theme.mode;
 theme.mode=state.mode;
 state.preset=theme;
 syncMode(); markSelectedTheme(); buildColorsUI(); syncPosterMode(); crossfade(); pushHist(); }
function buildThemeUI(){
 const sig=document.getElementById('signaturePane');
 SIGNATURE.forEach(p=>{ const b=document.createElement('button'); b.className='preset'; b.dataset.key=p.key; b.title=p.name;
  /* Tile previews the theme in its natural mode. */
  const tileBg = p.natural==='dark' ? p.bgDark : p.bgLight;
  const ramp=p.ramp.length>1?p.ramp:[tileBg,p.ramp[0],p.route];
  b.innerHTML=`<span class="sw" style="background:${tileBg}">`+ramp.map(c=>`<i style="background:${c}"></i>`).join('')+`</span><span class="nm">${p.name}</span>`;
  b.onclick=()=>applyTheme({type:'sig',key:p.key}); sig.appendChild(b); });
 document.getElementById('moreCount').textContent=PALETTES.length;
 const list=document.getElementById('moreList');
 const mk=p=>{ const r=document.createElement('button'); r.className='palrow'; r.dataset.name=p.n.toLowerCase(); r.dataset.raw=p.n;
  r.innerHTML=`<span class="palsw">`+p.c.map(c=>`<i style="background:${c}"></i>`).join('')+`</span><span class="palnm">${p.n}</span>`;
  r.onclick=()=>{ applyTheme({type:'pal',name:p.n}); document.getElementById('moreDrop').classList.remove('open'); };
  return r; };
 const hd=t=>{ const h=document.createElement('div'); h.className='subhead'; h.style.margin='4px 0 6px'; h.textContent=t; return h; };
 const favs=PALETTES.filter(p=>p.fav), feat=PALETTES.filter(p=>!p.fav&&p.f), rest=PALETTES.filter(p=>!p.fav&&!p.f);
 if(favs.length){ list.appendChild(hd('Favorites')); favs.forEach(p=>list.appendChild(mk(p))); }
 if(feat.length){ list.appendChild(hd('Featured')); feat.forEach(p=>list.appendChild(mk(p))); }
 list.appendChild(hd('All themes')); rest.forEach(p=>list.appendChild(mk(p)));
 markSelectedTheme(); }
document.getElementById('moreBtn').onclick=e=>{ e.stopPropagation(); document.getElementById('moreDrop').classList.toggle('open'); };
document.getElementById('moreDrop').onclick=e=>e.stopPropagation();
document.addEventListener('click',()=>document.getElementById('moreDrop').classList.remove('open'));
/* Dice — jump to a random theme (signature or palette), never the current one. */
function randomTheme(){
 const all=[...SIGNATURE.map(p=>({type:'sig',key:p.key})), ...PALETTES.map(p=>({type:'pal',name:p.n}))];
 if(!all.length) return;
 const curKey = state.themeRef && state.themeRef.type==='sig' ? 'sig:'+state.themeRef.key
              : state.themeRef ? 'pal:'+state.themeRef.name : '';
 let pick=all[0];
 for(let i=0;i<10;i++){ const c=all[Math.floor(Math.random()*all.length)];
  const k=c.type==='sig'?'sig:'+c.key:'pal:'+c.name; if(k!==curKey){ pick=c; break; } pick=c; }
 applyTheme(pick);
}
{ const dt=document.getElementById('diceTheme'); if(dt) dt.onclick=randomTheme; }


/* ---------- Colors panel (swatches + inline picker) ---------- */
let pickTarget=null;   // 'bg' | 'line'
function buildColorsUI(){
 const row=document.getElementById('swatchRow'); row.innerHTML='';
 const linesOnly=state.mode==='line';
 const add=(id,label,val,custom)=>{ const b=document.createElement('button'); b.className='cswatch'; b.dataset.t=id;
  b.setAttribute('aria-expanded', pickTarget===id);
  b.innerHTML=`<span class="chip" style="background:${val}"></span><span class="cl">${label}${custom?' ·':''}</span><span class="cv">${val.toUpperCase()}</span>`;
  b.onclick=e=>{ e.stopPropagation(); togglePicker(id); }; row.appendChild(b); };
 add('bg','Background',bgColor(),!!state.bgOverride);
 if(linesOnly) add('line','Lines',lineColor(),!!state.lineOverride);
 document.getElementById('colorsNote').textContent = linesOnly
  ? 'Lines mode is a two-colour piece — click either swatch to pick its colour.'
  : 'Switch Map Style to Lines to colour the contour strokes directly.';
 if(pickTarget && !(pickTarget==='bg'||linesOnly)) closePicker();
 syncPosterMode(); }
function togglePicker(t){ if(pickTarget===t){ closePicker(); return; }
 pickTarget=t; const w=document.getElementById('pickerWrap'); w.classList.add('open');
 document.getElementById('pkTitle').textContent = t==='bg'?'Background colour':'Line colour';
 setPickerFrom(t==='bg'?bgColor():lineColor()); buildColorsUI(); }
function closePicker(){ pickTarget=null; document.getElementById('pickerWrap').classList.remove('open');
 document.querySelectorAll('.cswatch').forEach(b=>b.setAttribute('aria-expanded','false')); }
let pkH=0,pkS=1,pkV=1;
function setPickerFrom(hex){ const c=toHsv(hex); pkH=c.h; pkS=c.s; pkV=c.v; paintPicker(false); }
function paintPicker(apply){
 const pure=fromHsv(pkH,1,1);
 document.getElementById('pkSV').style.background=`linear-gradient(to top,#000,rgba(0,0,0,0)),linear-gradient(to right,#fff,${pure})`;
 const k=document.getElementById('pkSVKnob'); k.style.left=(pkS*100)+'%'; k.style.top=((1-pkV)*100)+'%';
 const hex=fromHsv(pkH,pkS,pkV); k.style.background=hex;
 const hk=document.getElementById('pkHueKnob'); hk.style.left=(pkH*100)+'%'; hk.style.background=pure;
 document.getElementById('pkHex').value=hex.toUpperCase();
 if(apply){ if(pickTarget==='bg') state.bgOverride=hex; else if(pickTarget==='line') state.lineOverride=hex;
  render(); refreshSwatchValues(); syncPosterMode(); }
 return hex; }
function refreshSwatchValues(){ document.querySelectorAll('.cswatch').forEach(b=>{
 const v=b.dataset.t==='bg'?bgColor():lineColor();
 b.querySelector('.chip').style.background=v; b.querySelector('.cv').textContent=v.toUpperCase(); }); }
function track(el,onMove){ const at=e=>{ const r=el.getBoundingClientRect();
  return [Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)), Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))]; };
 el.addEventListener('pointerdown',e=>{ el.setPointerCapture(e.pointerId); el.dataset.d='1'; onMove(...at(e)); e.preventDefault(); });
 el.addEventListener('pointermove',e=>{ if(el.dataset.d==='1') onMove(...at(e)); });
 el.addEventListener('pointerup',e=>{ try{el.releasePointerCapture(e.pointerId);}catch(_){} delete el.dataset.d; pushHistSoon(); }); }
track(document.getElementById('pkSV'),(x,y)=>{ pkS=x; pkV=1-y; paintPicker(true); });
track(document.getElementById('pkHue'),(x)=>{ pkH=x; paintPicker(true); });
document.getElementById('pkHex').onchange=e=>{ const v=e.target.value.trim();
 if(/^#?[0-9a-f]{6}$/i.test(v)){ setPickerFrom(v.startsWith('#')?v:'#'+v); paintPicker(true); pushHist(); } };
document.getElementById('pkReset').onclick=()=>{ if(pickTarget==='bg') state.bgOverride=null; else state.lineOverride=null;
 setPickerFrom(pickTarget==='bg'?bgColor():lineColor()); render(); buildColorsUI(); syncPosterMode(); pushHist(); };
document.getElementById('pickerWrap').onclick=e=>e.stopPropagation();
document.addEventListener('click',()=>{ if(pickTarget) closePicker(); });

/* Light/Dark applies to the POSTER. It rebuilds the theme from its reference in
   the requested mode — so it always lands on the theme's real light or real dark
   variant, never a darkened version of an already-dark background. */
function syncPosterMode(){
 document.querySelectorAll('#posterMode button').forEach(b=>
  b.setAttribute('aria-pressed', (b.dataset.pm==='dark')===state.darkPoster));
 /* Custom colours override the theme, so Light/Dark no longer has a meaningful
    job — hide it until a new theme resets things. */
 const custom = !!(state.bgOverride || state.lineOverride);
 document.getElementById('posterMode').style.display = custom ? 'none' : 'flex';
 document.getElementById('customNote').style.display = custom ? 'block' : 'none'; }
document.querySelectorAll('#posterMode button').forEach(b=>{ b.onclick=()=>{
 const dark=b.dataset.pm==='dark'; if(dark===state.darkPoster) return;
 state.darkPoster=dark;
 const theme=themeForMode(state.themeRef,dark); theme.mode=state.mode; state.preset=theme;
 syncPosterMode(); buildColorsUI();
 if(pickTarget) setPickerFrom(pickTarget==='bg'?bgColor():lineColor());
 crossfade(); pushHist(); }; });

/* ---------- app tabs ---------- */
function setApp(mode){ const topo=mode==='topo';
 document.body.dataset.app=topo?'topo':'abstract';
 document.getElementById('tabTopo').setAttribute('aria-selected',topo);
 document.getElementById('tabAbstract').setAttribute('aria-selected',!topo);
 document.getElementById('histBar').style.visibility=topo?'visible':'hidden'; }
/* ---------- tab-switch transition (whole-shell crossfade + slide) ----------
   Two shells, two layers. The leaving shell fades + drifts up and out; the
   entering shell is parked just below (invisible, no transition) then released
   to its resting position on the next frame so it fades + rises in. They
   overlap slightly for a smooth crossfade — no flash, no per-piece reflow.
   CX_DUR must match --cx-dur in the CSS. */
const CX_DUR   = 500;                 // matches --cx-dur (ms)
const CX_TOTAL = CX_DUR + 60;         // full cycle + small buffer
let currentApp = 'topo';
let cxAnimating = false;

function switchApp(mode){
  if(mode===currentApp || cxAnimating) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){ currentApp=mode; setApp(mode); return; }

  cxAnimating = true;
  const prevApp = currentApp;
  currentApp = mode;

  const leaving  = document.getElementById(prevApp==='topo' ? 'shell' : 'abstractShell');
  const entering = document.getElementById(mode==='topo'    ? 'shell' : 'abstractShell');

  // Enter transition mode: both shells painted, neither interactive.
  document.body.dataset.transitioning = '1';

  // Park the entering shell (invisible, below, NO transition) and mark the
  // leaving shell so it can animate out.
  entering.classList.add('cx-enter-park');
  leaving.classList.add('cx-leave-prep');   // currently at rest, still visible
  void document.body.offsetWidth;            // commit both states

  // Flip theme + tabs now — the leaving shell fades over the new skin.
  setApp(mode);

  requestAnimationFrame(()=>{
    // Leaving shell animates out; entering shell releases from its parked
    // position and animates in — the two crossfade.
    leaving.classList.remove('cx-leave-prep');
    leaving.classList.add('cx-leave');
    entering.classList.remove('cx-enter-park');
    // second rAF guarantees the parked (no-transition) state was painted
    requestAnimationFrame(()=>{ entering.classList.add('cx-enter-active'); });
  });

  // Cleanup: strip classes, exit transition mode.
  setTimeout(()=>{
    leaving.classList.remove('cx-leave','cx-leave-prep');
    entering.classList.remove('cx-enter-park','cx-enter-active');
    delete document.body.dataset.transitioning;
    cxAnimating = false;
  }, CX_TOTAL);
}
document.getElementById('tabTopo').onclick=()=>switchApp('topo');
document.getElementById('tabAbstract').onclick=()=>switchApp('abstract');

// Restore the tab the user was on before Strava OAuth redirect
(function restoreTab(){
 try{
  const saved = localStorage.getItem('gpxsketch_tab');
  if(saved && saved !== currentApp){
   localStorage.removeItem('gpxsketch_tab');
   setApp(saved); currentApp = saved;
  }
 }catch(e){}
})();
/* ---------- controls ---------- */
function syncMode(){ document.querySelectorAll('#mode button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.mode===state.mode)); }
document.querySelectorAll('#mode button').forEach(b=>{ b.onclick=()=>{ state.mode=b.dataset.mode; if(state.preset) state.preset.mode=state.mode;
 syncMode(); buildColorsUI(); crossfade(); pushHist(); }; });
const iv=document.getElementById('interval'),ivv=document.getElementById('intervalVal');
iv.oninput=()=>{ state.interval=+iv.value; intervalAuto=false; ivv.textContent=iv.value+' ft'; render(); pushHistSoon(); };
const wt=document.getElementById('weight'),wtv=document.getElementById('weightVal');
wt.oninput=()=>{ state.weight=+wt.value; wtv.textContent=(+wt.value).toFixed(1); render(); pushHistSoon(); };
const rw=document.getElementById('routeWidth'),rwv=document.getElementById('routeWidthVal');
/* Keep the Fine/Medium/Bold chips lit when the slider value matches a preset. */
function syncRoutePresets(){
 document.querySelectorAll('#routePresets button').forEach(b=>{
  b.setAttribute('aria-pressed', Math.abs(parseFloat(b.dataset.rw)-state.routeWidth)<0.05 ? 'true':'false'); });
}
rw.oninput=()=>{ state.routeWidth=+rw.value; rwv.textContent=(+rw.value).toFixed(1); syncRoutePresets(); render(); pushHistSoon(); };
document.querySelectorAll('#routePresets button').forEach(b=>{
 b.onclick=()=>{ state.routeWidth=parseFloat(b.dataset.rw); rw.value=state.routeWidth;
  rwv.textContent=state.routeWidth.toFixed(1); syncRoutePresets(); render(); pushHist(); };
});
syncRoutePresets();
const rz=document.getElementById('routeZoom'),rzv=document.getElementById('routeZoomVal');
rz.oninput=()=>{ if(placeMode){ setPlaceZoomT(+rz.value); pushHistSoon(); return; }
 state.routeZoom=+rz.value; rzv.textContent=Math.round(+rz.value*100)+'%'; render(); pushHistSoon(); };

/* ---------- Place-mode live camera: zoom (slider / wheel) + drag-to-pan ----------
   Overscan makes both feel live: the terrain grid is bigger than the visible box,
   so a drag just slides the grid inside the clip (one transform, no re-render, no
   network) and a zoom scales the vector contours instantly. Terrain only refetches
   when the window nears the grid edge (pan) or crosses a tile-zoom level (zoom). */
let placeZoomTimer=null;
/* Fresh, centred overscan frame + refetch. Keeps a manual contour interval
   (no intervalAuto reset); the Chunk-D race guard makes rapid calls safe. */
async function reframePlace(lat,lon,zoom,{seamless=false}={}){
 placeMode=true; TER=makeFrame(lat,lon,zoom); route=null; routeStats=null;
 if(seamless){
  /* Seamless reframe (drag-release / zoom-settle): DON'T blank. The new frame
     has no data yet, so we deliberately skip the empty-frame render — the old
     terrain stays on screen — and let the terminal load render swap it in with
     no opacity dip (tiles are usually already cached, so the swap is instant). */
  _skipFade=true;
  if(typeof saveSessionSoon==='function') saveSessionSoon();
  await tryLoadTerrain();
  _skipFade=false;   // safety: clear if the load path never consumed it (e.g. error)
  return;
 }
 crossfade();
 if(typeof saveSessionSoon==='function') saveSessionSoon();
 await tryLoadTerrain();
}
function placeZt(){ // current visual-zoom transform string about the window centre
 const Z=Math.max(R_W/GRID_W, Math.pow(2, zoomFromT(state.routeZoom)-TER.zoom));
 if(Math.abs(Z-1)<=0.001) return '';
 const zx=(TER.viewDX||0)+R_W/2, zy=(TER.viewDY||0)+R_H/2;
 return `translate(${zx},${zy}) scale(${Z}) translate(${-zx},${-zy})`;
}
function setPlaceZoomT(t,{live=false}={}){
 t=Math.max(0,Math.min(1,t));
 state.routeZoom=t; rz.value=t;
 rzv.textContent='z'+Math.round(zoomFromT(t));
 if(live){ const zg=document.getElementById('zoomG'); if(zg){ const z=placeZt(); if(z) zg.setAttribute('transform',z); else zg.removeAttribute('transform'); } }
 else render();
 clearTimeout(placeZoomTimer);
 placeZoomTimer=setTimeout(()=>{
  if(!placeMode||!TER) return;
  const target=Math.floor(zoomFromT(state.routeZoom)+1e-9);
  if(target!==TER.zoom) reframePlace(TER.lat,TER.lon,target,{seamless:true});
  else render();     // normalise (crisp) once the gesture settles
 }, 220);
}
{
 const posterEl=document.getElementById('poster');
 const posterPt=e=>{ const r=posterEl.getBoundingClientRect(); return { x:(e.clientX-r.left)/r.width*900, y:(e.clientY-r.top)/r.height*1200, rw:r.width, rh:r.height }; };
 const inMap=(x,y)=> x>=MAP.x&&x<=MAP.x+MAP.w&&y>=MAP.y&&y<=MAP.y+MAP.h;
 // Wheel to zoom — smaller steps + live transform, so it tracks the wheel.
 posterEl.addEventListener('wheel', e=>{
  if(!placeMode||!TER) return; const p=posterPt(e); if(!inMap(p.x,p.y)) return;
  e.preventDefault();
  const step=(e.deltaY<0?1:-1)*0.4/(PLACE_ZMAX-PLACE_ZMIN);   // ~0.4 tile-levels per notch
  setPlaceZoomT(state.routeZoom+step,{live:true});
 }, {passive:false});
 // Drag to pan — slides the grid inside the clip live; refetch only at the edge.
 let panning=false, pan0=null, moved=false;
 posterEl.addEventListener('pointerdown', e=>{
  if(!placeMode||!TER) return; const p=posterPt(e); if(!inMap(p.x,p.y)) return;
  panning=true; moved=false;
  pan0={ cx:e.clientX, cy:e.clientY, rw:p.rw, rh:p.rh, vdx:TER.viewDX||0, vdy:TER.viewDY||0,
         gpp:(R_W/MAP.w)/Math.max(R_W/GRID_W,Math.pow(2, zoomFromT(state.routeZoom)-TER.zoom)) }; // grid-px per poster-unit ÷ zoom
  try{ posterEl.setPointerCapture(e.pointerId); }catch(_){}
  posterEl.style.cursor='grabbing'; e.preventDefault();
 });
 posterEl.addEventListener('pointermove', e=>{
  if(!panning) return;
  const dPx=(e.clientX-pan0.cx)/pan0.rw*900, dPy=(e.clientY-pan0.cy)/pan0.rh*1200;
  if(Math.abs(dPx)>2||Math.abs(dPy)>2) moved=true;
  const maxX=Math.max(0,TER.w-R_W), maxY=Math.max(0,TER.h-R_H);
  const vdx=Math.max(0,Math.min(maxX, pan0.vdx - dPx*pan0.gpp));
  const vdy=Math.max(0,Math.min(maxY, pan0.vdy - dPy*pan0.gpp));
  TER.viewDX=vdx; TER.viewDY=vdy;
  const pg=document.getElementById('panG'); if(pg) pg.setAttribute('transform',`translate(${-vdx},${-vdy})`);
 });
 const endPan=e=>{
  if(!panning) return; panning=false; posterEl.style.cursor='grab';
  try{ posterEl.releasePointerCapture(e.pointerId); }catch(_){}
  if(!moved) return;
  const c=frameCenterLatLon(TER); TER.lat=c.lat; TER.lon=c.lon;   // window centre is the new centre
  const maxX=Math.max(0,TER.w-R_W), maxY=Math.max(0,TER.h-R_H), m=0.18;
  const nearEdge = TER.viewDX<maxX*m || TER.viewDX>maxX*(1-m) || TER.viewDY<maxY*m || TER.viewDY>maxY*(1-m);
  if(nearEdge){ reframePlace(c.lat,c.lon,TER.zoom,{seamless:true}); }   // recentre + refetch (restores margin) — no flash
  else { render(); if(typeof saveSessionSoon==='function') saveSessionSoon(); if(state.showWater) updateFeaturesSoon(); }
 };
 posterEl.addEventListener('pointerup', endPan);
 posterEl.addEventListener('pointercancel', endPan);
}
/* Small read-only hook for debugging/support (and headless tests): current frame. */
window.__topoFrame=()=> TER ? { lat:TER.lat, lon:TER.lon, zoom:TER.zoom, placeMode,
 w:TER.w, h:TER.h, viewDX:TER.viewDX, viewDY:TER.viewDY, hasElev:!!TER.hasElev } : null;

/* ==========================================================================
   MAP FEATURES (F1: water) — optional themed overlay of lakes / rivers /
   coastline. Geometry comes from /api/features (source-agnostic contract);
   we project it with the same frame math as the terrain and draw it inside
   the map viewport, so it pans/zooms with everything else. Off by default.
   ========================================================================== */
const featCache=new Map(), featRetried=new Set(); let featData=null, featReq=0, featTimer=null;
/* Water is keyed to the GRID (overscan extent), not the display centre — so
   panning within the loaded grid keeps the overlay without a refetch. */
function gridKey(){ return TER ? (Math.round(TER.left)+','+Math.round(TER.top)+','+TER.zoom) : ''; }
function frameGeoBbox(){
 if(!TER) return null; const z=TER.zoom;
 return { s:tileY2lat((TER.top+TER.h)/256,z), w:tileX2lon(TER.left/256,z),
          n:tileY2lat(TER.top/256,z),        e:tileX2lon((TER.left+TER.w)/256,z) };
}
async function updateFeatures(){
 const note=document.getElementById('featNote');
 if(!state.showWater || !TER){ featData=null; if(note) note.textContent=''; render(); return; }
 const bb=frameGeoBbox(); if(!bb) return;
 const key=[bb.s,bb.w,bb.n,bb.e].map(v=>v.toFixed(3)).join(',');
 if(featCache.has(key)){ featData={...featCache.get(key), gridKey:gridKey()}; if(note) note.textContent=''; render(); return; }
 const seq=++featReq; if(note) note.textContent='Loading water…';
 try{
  const res=await fetch(`${BACKEND_URL}/api/features?bbox=${bb.s},${bb.w},${bb.n},${bb.e}&layers=water`, {cache:'no-store'});
  if(seq!==featReq) return;                          // a newer frame superseded this
  if(!res.ok) throw new Error('features '+res.status);
  const data=await res.json();
  const rec={ areas:data.areas||[], lines:data.lines||[] };
  /* Only remember complete results — a partial/failed answer is retried once
     shortly after, instead of sticking for the whole session. */
  if(!data.partial && !data.error) featCache.set(key,rec);
  else if(!featRetried.has(key)){ featRetried.add(key); setTimeout(()=>{ if(state.showWater) updateFeatures(); },3500); }
  featData={...rec, gridKey:gridKey()};
  if(note) note.textContent = data.error ? 'Water data unavailable right now.' : ((rec.areas.length+rec.lines.length) ? '' : 'No water features in view.');
  render();
 }catch(e){ if(seq===featReq){ featData=null; if(note) note.textContent='Water data unavailable — the map is still fine.'; render(); } }
}
function updateFeaturesSoon(){ clearTimeout(featTimer); featTimer=setTimeout(updateFeatures,350); }
function waterColors(){
 /* Water colour is DERIVED FROM THE ACTIVE PALETTE (roadmap v0.33.0) instead of
    a fixed blue: take the ramp's highest-value stop — as if water were the top
    of the elevation range — so it stays on-theme and contrasts the mostly
    mid/low terrain around it. Safeguard: a near-white top stop wouldn't read as
    water, so the lighter that stop is, the more we deepen + cool it; already
    dark/teal tops (e.g. the ocean theme) stay essentially as the palette gives
    them. The outline is a crisper shade of the fill for a clean shoreline. */
 const P=state.preset, ramp=(P&&P.ramp&&P.ramp.length)?P.ramp:['#173a50'];
 let top; try{ top=d3.color(ramp[ramp.length-1]); }catch(_){ top=null; }
 if(!top) return state.darkPoster ? { fill:'#33566a', line:'#6fa9c4' } : { fill:'#b9d4e3', line:'#6f9fba' };
 const lum=d3.hsl(top).l;                                   // 0 (black) … 1 (white)
 const t=Math.max(0, Math.min(0.7, (lum-0.45)*1.3));        // 0 for dark tops → up to .7 for white
 const deep=state.darkPoster ? '#0c2a3a' : '#3d6f8c';
 const fill=d3.interpolateRgb(top.formatHex(), deep)(t);
 const line=d3.interpolateRgb(fill, state.darkPoster ? '#cfe8f5' : '#20455a')(0.42);
 return { fill, line };
}
{
 const wt=document.getElementById('showWater');
 if(wt){ wt.checked=!!state.showWater;
  wt.onchange=e=>{ state.showWater=e.target.checked;
   if(state.showWater) updateFeatures();
   else { featData=null; const note=document.getElementById('featNote'); if(note) note.textContent=''; render(); }
   if(typeof saveSessionSoon==='function') saveSessionSoon(); if(typeof pushHist==='function') pushHist(); };
 }
}
document.getElementById('showRoute').onchange=e=>{ state.showRoute=e.target.checked; render(); pushHist(); };
{ const ss=document.getElementById('showStats'); if(ss) ss.onchange=e=>{ state.showStats=e.target.checked; render(); if(typeof saveSessionSoon==='function') saveSessionSoon(); pushHist(); }; }
{ const sc=document.getElementById('showCoords'); if(sc) sc.onchange=e=>{ state.showCoords=e.target.checked; render(); if(typeof saveSessionSoon==='function') saveSessionSoon(); pushHist(); }; }
document.getElementById('title').oninput=()=>{ titleAuto=false; render(); pushHistSoon(); };
document.getElementById('subtitle').oninput=()=>{ subtitleAuto=false; render(); pushHistSoon(); };


const busy=document.getElementById('busy'),loadMsg=document.getElementById('loadMsg');
function msg(cls,txt){ loadMsg.className='note'+(cls?' '+cls:''); loadMsg.textContent=txt; }
/* ---------- smoothing for real elevation ----------
   Synthetic terrain is inherently smooth (a handful of Gaussian peaks summed),
   so it contours cleanly with zero processing. Real DEM data has genuine
   ground-level noise — at a fixed foot interval that noise turns into dense
   hatching instead of clean bands. A separable box blur, run a few times to
   approximate a Gaussian, removes that noise. It also blends away any hard
   seam where two source tiles meet, since the blur radius crosses the boundary
   and mixes values from both sides. */
function boxBlur1D(src,w,h,horizontal,radius){
 const out=new Float64Array(src.length);
 const len = horizontal? w : h, lines = horizontal? h : w;
 for(let line=0; line<lines; line++){
  // running-sum sliding window for O(n) per line
  let sum=0, count=0;
  const idx=(p)=> horizontal ? line*w+p : p*w+line;
  for(let p=-radius; p<=radius; p++){ if(p>=0&&p<len){ sum+=src[idx(p)]; count++; } }
  for(let p=0; p<len; p++){
   out[idx(p)] = sum/count;
   const addP=p+radius+1, remP=p-radius;
   if(addP<len){ sum+=src[idx(addP)]; count++; }
   if(remP>=0){ sum-=src[idx(remP)]; count--; } } }
 return out; }
function smoothGrid(data,w,h,radius,passes){
 let cur=data;
 for(let i=0;i<(passes??3);i++){ cur=boxBlur1D(cur,w,h,true,radius); cur=boxBlur1D(cur,w,h,false,radius); }
 return cur; }

let terrainReq=0;   // generation token — only the newest load may apply its result
async function tryLoadTerrain(){
 const myReq=++terrainReq;
 const key=TER.lat.toFixed(3)+','+TER.lon.toFixed(3)+','+TER.zoom;
 const stale=()=>myReq!==terrainReq;   // a newer load has superseded this one
 const applyElev=(rawData,cached)=>{
  if(stale()) return;
  /* Radius 2, 3 passes ≈ a soft gaussian — enough to erase ground noise and
     tile seams without softening the shape of real ridgelines and valleys. */
  /* Light touch only: real Terrarium DEM already has true detail. A radius-1
     blur, 2 passes, cleans ground noise + tile seams without erasing ridgelines.
     (The old radius-2 / 3-pass blur was a big part of the "mushy" look.) */
  const data = smoothGrid(rawData, TER.w, TER.h, 1, 2);
  let minFt=Infinity, maxFt=-Infinity;
  for(let i=0;i<data.length;i++){ if(data[i]<minFt)minFt=data[i]; if(data[i]>maxFt)maxFt=data[i]; }
  TER.data=data; TER.minFt=minFt; TER.maxFt=maxFt; TER.kind='real'; TER.hasElev=true;
  terrainStatus='ok';
  { const rEl=document.getElementById('retryElev'); if(rEl) rEl.style.display='none'; }
  applyAutoInterval(minFt,maxFt);
  if(route&&rawGpx) routeStats=gpxStatsWithTerrain(rawGpx,route,TER);
  const tag=cached?' (cached)':'';
  if(routeStats) msg('ok',`Loaded${tag} · route ${routeStats.miles.toFixed(1)} mi${routeStats.gain!=null?' · +'+Math.round(routeStats.gain).toLocaleString()+' ft':''}.`);
  else msg('ok',`Loaded${tag} · ${Math.round(minFt).toLocaleString()}–${Math.round(maxFt).toLocaleString()} ft.`); crossfade();
  if(typeof saveSessionSoon==='function') saveSessionSoon();
  if(state.showWater && typeof updateFeaturesSoon==='function') updateFeaturesSoon(); };
 if(terrainCache.has(key)){ const c=terrainCache.get(key); applyElev(c.rawData,true); return; }
 busy.classList.add('on'); document.getElementById('retryElev').disabled=true; terrainStatus='loading'; msg('','Creating map…');
 /* 'auto' — the server tries its best available source and falls back
    automatically. The person using this app never needs to know or care
    which elevation provider actually served the data. */
 try{ const {data,minFt,maxFt}=await fetchTerrain(TER,'auto');
  if(stale()) return;                                   // a newer route/frame won the race
  terrainCache.set(key,{rawData:data,minFt,maxFt}); applyElev(data,false); }
 catch(err){
  if(stale()) return;                                   // don't clobber a newer load's UI
  /* Graceful fallback: the route still makes a clean poster on a plain
     background. Keep the message friendly and offer the retry affordance. The
     message names the likely cause (offline vs area) so it's actually useful. */
  terrainStatus='failed';
  const offline = (typeof navigator!=='undefined' && navigator.onLine===false);
  msg('warn', offline
   ? 'You appear to be offline — showing your route on a plain background. Reconnect, then tap “Retry elevation.”'
   : 'Couldn’t load elevation for this area — showing your route on a plain background. Tap “Retry elevation” to try again.');
  document.getElementById('retryElev').style.display='';
  render();
 }
 finally{ if(!stale()){ busy.classList.remove('on'); document.getElementById('retryElev').disabled=false; } } }
/* Loads a route frame centred on given coordinates and kicks off the elevation
   fetch. Called automatically after a GPX/Strava import — no manual lat/lon/
   zoom entry needed; the frame is derived from the route's own bounding box. */
async function loadRouteFrame(lat,lon,z){
 intervalAuto=true;
 TER=makeFrame(lat,lon,z);
 if(rawGpx){ route=projectGpx(rawGpx,TER); routeSmooth=false; routeStats=gpxStatsBase(rawGpx); } else { route=null; routeStats=null; }
 crossfade();
 /* Persist the frame + route now, so it survives even if terrain is slow/down. */
 if(typeof saveSessionSoon==='function') saveSessionSoon();
 await tryLoadTerrain(); }
document.getElementById('retryElev').onclick=async()=>{
 if(!rawGpx){ msg('warn','Upload a GPX route first.'); return; }
 await tryLoadTerrain(); };
/* If the connection drops mid-load and comes back, quietly retry the elevation
   fetch instead of stranding the user on the plain-background fallback. */
window.addEventListener('online', ()=>{
 if(terrainStatus==='failed' && rawGpx){ msg('','Back online — retrying elevation…'); tryLoadTerrain(); }
});
/* ---------- Strava connect ---------- */
let stravaConnected=false;
function setStravaUI(connected, name, profile){
 console.log('[TOPO] setStravaUI called — connected:', connected, 'name:', name);
 stravaConnected=connected;
 const label=document.getElementById('stravaBtnLabel');
 const avatar=document.getElementById('stravaBtnAvatar');
 const btn=document.getElementById('stravaBtn');
 if(connected){
  label.textContent = name || 'Connected';
  if(profile){ avatar.src=profile; avatar.style.display='inline'; btn.insertBefore(avatar, btn.firstChild); }
  else { avatar.style.display='none'; }
  btn.style.justifyContent='center';
 } else {
  label.textContent='Connect to Strava';
  avatar.style.display='none';
 } }
window._setTopoStravaUI = setStravaUI;
console.log('[TOPO] _setTopoStravaUI registered');
async function checkStravaStatus(){
 try{
  const res=await fetch(`${BACKEND_URL}/api/status`, { cache:'no-store' });
  if(!res.ok) return;
  const s=await res.json();
  if(s.connected){ setStravaUI(true, s.athlete.firstname, s.athlete.profile); }
  else { setStravaUI(false); }
 }catch(e){ console.warn('[topo] checkStravaStatus failed:', e.message, 'URL was:', BACKEND_URL+'/api/status'); } }
async function loadStravaActivity(id,name){
 console.log('[TOPO] loadStravaActivity START — id:', id, 'name:', name);
 msg('','Loading route…');
 try{
  const res=await fetch(`${BACKEND_URL}/api/streams/${id}`, { cache:'no-store' });
  if(!res.ok){ const b=await res.json().catch(()=>({})); throw new Error(b.error||`HTTP ${res.status}`); }
  const {points}=await res.json();
  console.log('[TOPO] got', points?.length, 'points from server');
  if(!points || points.length<2) throw new Error('no GPS points on this activity');
  currentIsDefault=false; placeMode=false; rawGpx=points.map(p=>({lat:p[1],lon:p[0],ele:null})); gpxBbox=bboxOf(rawGpx); gpxHasEle=false;
  { const ps=document.getElementById('placeSearch'); if(ps) ps.value=''; const pn=document.getElementById('placeNote'); if(pn) pn.textContent=''; if(typeof clearPlaceResults==='function') clearPlaceResults();
    const rzvEl=document.getElementById('routeZoomVal'); if(rzvEl) rzvEl.textContent=Math.round((state.routeZoom||0)*100)+'%'; }
  document.getElementById('gpxName').textContent=`${name} · ${rawGpx.length.toLocaleString()} pts (from Strava)`;
  const fr=frameFromBbox(gpxBbox,FRAME_PAD);
  console.log('[TOPO] frame:', fr, '— calling loadRouteFrame');
  // Auto-fill title + smart subtitle (unless the user typed their own)
  const t0=document.getElementById('title');
  if(titleAuto){ t0.value=name.toUpperCase(); }
  reverseGeocode(fr.centerLat, fr.centerLon, routeHighPoint(rawGpx));
  await loadRouteFrame(fr.centerLat, fr.centerLon, fr.zoom);
  console.log('[TOPO] loadRouteFrame DONE — route should be visible');
 }catch(err){ console.error('[TOPO] loadStravaActivity FAILED:', err); msg('warn','Could not load Strava route: '+err.message); } }
window._loadTopoStravaRoute = loadStravaActivity;
// Smart subtitle: ask the backend to geocode the route + apply the priority ladder.
// Passes the centroid (for parks/city/county) and the route's high point (for peak tier).
async function reverseGeocode(lat, lon, hiPoint){
 const sub=document.getElementById('subtitle');
 if(!subtitleAuto) return; // user typed their own subtitle — leave it alone
 try{
  let url=`${BACKEND_URL}/api/geocode?lat=${lat}&lon=${lon}`;
  if(hiPoint && isFinite(hiPoint.lat) && isFinite(hiPoint.lon)) url+=`&hilat=${hiPoint.lat}&hilon=${hiPoint.lon}`;
  const res=await fetch(url, { cache:'no-store' });
  if(!res.ok) throw new Error('geocode failed');
  const g=await res.json();
  if(g.subtitle){ sub.value=g.subtitle; subtitleAuto=true; console.log('[TOPO] subtitle:', g.subtitle, '('+g.tier+')'); if(typeof render==='function') render(); }
 }catch(e){ console.warn('[TOPO] geocode failed:', e.message); }
}
// Find the highest-elevation point on a route (returns {lat,lon} or null).
function routeHighPoint(pts){
 if(!pts || !pts.length) return null;
 let best=null, bestEle=-Infinity;
 for(const p of pts){ if(p.ele!=null && p.ele>bestEle){ bestEle=p.ele; best=p; } }
 return best ? {lat:best.lat, lon:best.lon} : null;
}
document.getElementById('stravaBtn').onclick=async()=>{
 if(stravaConnected){
  // Open the same popup Abstract uses, in single-select "topo" mode
  if(window._openStravaOverlay) window._openStravaOverlay('topo');
  return; }
 try{ localStorage.setItem('gpxsketch_tab', currentApp); }catch(e){}
 window.location.href = `${BACKEND_URL}/auth/login`; };
/* Banner shortcuts — proxy straight to the toolbar controls so behaviour stays
   in sync (Strava connect/picker + the GPX file dialog) without hunting the rail. */
{ const bs=document.getElementById('bannerStrava'), bu=document.getElementById('bannerUpload');
  if(bs) bs.onclick=()=>document.getElementById('stravaBtn').click();
  if(bu) bu.onclick=()=>document.getElementById('gpxInput').click(); }
/* Coming back from Strava's sign-in redirect lands here with a query param
   on THIS page (the front end), not the backend. Abstract's own script reads
   AND cleans up this same query string (to auto-open its activity picker) —
   so Topo only reads it here, never mutates the URL. Whichever script's
   cleanup runs is fine; both just need the param to still exist when they
   check it, and unconditional history.replaceState from here would erase it
   before Abstract gets a look. */
(function(){
 const qs=new URLSearchParams(window.location.search);
 if(qs.has('strava')){ checkStravaStatus(); }
 else if(qs.has('strava_error')){ msg('warn','Strava sign-in failed: '+qs.get('strava_error')); }
 else { checkStravaStatus(); }
})();
document.getElementById('testSrc').onclick=async()=>{
 msg('','Checking backend…');
 try{
  const res=await fetch(`${BACKEND_URL}/health`, { cache: 'no-store' });
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  const h=await res.json();
  const mt=h.maptilerKeySet?' · MapTiler ✓':'';
  const sv=h.stravaConfigured?' · Strava key ✓':' · ⚠ Strava not configured';
  // Also check Strava status to see full picture
  let stravaInfo='';
  try{
   const sr=await fetch(`${BACKEND_URL}/api/status`, { cache: 'no-store' });
   if(sr.ok){ const ss=await sr.json(); stravaInfo=ss.connected? ` · Strava connected (${ss.athlete.firstname})`:' · Strava not connected'; }
   else { stravaInfo=` · Strava status: HTTP ${sr.status}`; }
  }catch(se){ stravaInfo=' · Strava status: unreachable'; }
  msg('ok',`Backend ✓ at ${BACKEND_URL}\n${h.cachedAreas} cached${mt}${sv}${stravaInfo}\nAllowed origins: ${(h.allowedOrigins||[]).join(', ')}`);
 }catch(err){
  msg('warn',`Backend not reachable (${err.message}). Make sure the server is running.\nTried: ${BACKEND_URL}`);
 } };
document.getElementById('gpxInput').onchange=async e=>{
 const f=e.target.files[0]; if(!f) return; msg('','Reading GPX…');
 try{ const text=await f.text(); const pts=parseGpx(text);
  currentIsDefault=false; placeMode=false; rawGpx=pts; gpxBbox=bboxOf(pts); gpxHasEle=pts.some(p=>p.ele!=null);
  { const ps=document.getElementById('placeSearch'); if(ps) ps.value=''; const pn=document.getElementById('placeNote'); if(pn) pn.textContent=''; if(typeof clearPlaceResults==='function') clearPlaceResults();
    const rzvEl=document.getElementById('routeZoomVal'); if(rzvEl) rzvEl.textContent=Math.round((state.routeZoom||0)*100)+'%'; }
  document.getElementById('gpxName').textContent=`${f.name} · ${pts.length.toLocaleString()} pts${gpxHasEle?' · has elevation':''}`;
  const fr=frameFromBbox(gpxBbox,FRAME_PAD);
  const t0=document.getElementById('title'); if(titleAuto){ t0.value=f.name.replace(/\.(gpx|xml)$/i,'').replace(/[_-]/g,' ').toUpperCase(); }
  reverseGeocode(fr.centerLat, fr.centerLon, routeHighPoint(rawGpx));
  await loadRouteFrame(fr.centerLat, fr.centerLon, fr.zoom);
 }catch(err){ msg('warn','Could not read GPX: '+err.message); } };

/* ==========================================================================
   PLACE / EXPLORE MODE — make a topo poster of any searched location, no route.
   Lives inside the Topo tab: a search box that geocodes a place (or parses raw
   coordinates), frames the terrain, and renders routeless. Route mode is
   untouched — a GPX upload flips placeMode back off.
   ========================================================================== */
function parseCoords(str){
 const m=(str||'').trim().match(/^(-?\d+(?:\.\d+)?)\s*°?\s*([NnSs])?[\s,]+(-?\d+(?:\.\d+)?)\s*°?\s*([EeWw])?$/);
 if(!m) return null;
 let lat=parseFloat(m[1]), lon=parseFloat(m[3]);
 if(m[2]) lat=Math.abs(lat)*(/[Ss]/.test(m[2])?-1:1);
 if(m[4]) lon=Math.abs(lon)*(/[Ww]/.test(m[4])?-1:1);
 if(!isFinite(lat)||!isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180) return null;
 return {lat,lon};
}
function escapeHtml(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function clearPlaceResults(){ const r=document.getElementById('placeResults'); if(r){ r.innerHTML=''; r.style.display='none'; } }
async function enterPlace(lat, lon, zoom, name, context){
 placeMode=true; currentIsDefault=false;
 rawGpx=null; gpxBbox=null; gpxHasEle=false; route=null; routeStats=null;
 const t=document.getElementById('title'); if(t){ t.value=(name||'').toUpperCase(); titleAuto=true; }
 const sub=document.getElementById('subtitle'); if(sub){ sub.value=context||''; subtitleAuto=true; }
 const gn=document.getElementById('gpxName'); if(gn) gn.textContent = name ? ('📍 '+name) : ('📍 '+lat.toFixed(4)+', '+lon.toFixed(4));
 clearPlaceResults();
 const pn=document.getElementById('placeNote'); if(pn) pn.textContent='Drag the map to pan · scroll to zoom.';
 /* Point the "Map zoom" slider at this place's tile zoom so pan/zoom start crisp. */
 const zc=Math.max(PLACE_ZMIN,Math.min(PLACE_ZMAX,Math.round(zoom)));
 state.routeZoom=tFromZoom(zc);
 { const rzEl=document.getElementById('routeZoom'); if(rzEl) rzEl.value=state.routeZoom;
   const rzvEl=document.getElementById('routeZoomVal'); if(rzvEl) rzvEl.textContent='z'+zc; }
 msg('','Creating map…');
 await loadRouteFrame(lat, lon, zc);
 showPlaceHint();   // first-time "drag to pan · scroll to zoom" nudge (once per session)
}
/* First-time Place hint: a glass pill over the poster. Shows ONCE per browser
   session, auto-dismisses after a few seconds, and vanishes on the first
   drag/scroll (the pill is pointer-events:none, so that same gesture pans/zooms). */
let _placeHintTimer=null;
function _placeHintSeen(){ try{ return sessionStorage.getItem('gpxsketch_place_hint')==='1'; }catch(_){ return window.__placeHintSeen===true; } }
function _markPlaceHintSeen(){ try{ sessionStorage.setItem('gpxsketch_place_hint','1'); }catch(_){ window.__placeHintSeen=true; } }
function hidePlaceHint(){ const el=document.getElementById('placeHint'); if(!el) return;
 clearTimeout(_placeHintTimer);
 el.classList.remove('show');
 setTimeout(()=>{ if(!el.classList.contains('show')) el.style.display='none'; }, 450);
 const poster=document.getElementById('poster');
 if(poster){ poster.removeEventListener('pointerdown', hidePlaceHint); poster.removeEventListener('wheel', hidePlaceHint); }
}
function showPlaceHint(){ const el=document.getElementById('placeHint'); if(!el || _placeHintSeen()) return;
 _markPlaceHintSeen();
 el.style.display='flex';
 void el.offsetWidth;                                   // reflow so the fade-in runs
 requestAnimationFrame(()=>el.classList.add('show'));
 clearTimeout(_placeHintTimer); _placeHintTimer=setTimeout(hidePlaceHint, 4800);
 const poster=document.getElementById('poster');
 if(poster){ poster.addEventListener('pointerdown', hidePlaceHint); poster.addEventListener('wheel', hidePlaceHint, {passive:true}); }
}
window.__showPlaceHint=showPlaceHint;   // headless-test hook
function pickPlace(r){
 let lat=r.lat, lon=r.lon, zoom=12;
 if(r.bbox){ const fr=frameFromBbox(r.bbox, 0.15); lat=fr.centerLat; lon=fr.centerLon; zoom=fr.zoom; }
 const ps=document.getElementById('placeSearch'); if(ps) ps.value=r.name||'';
 enterPlace(lat, lon, zoom, r.name, r.context);
}
let placeTimer=null, placeSeq=0;
function renderPlaceResults(list){
 const box=document.getElementById('placeResults'), note=document.getElementById('placeNote');
 if(!box) return;
 box.innerHTML='';
 if(!list.length){ box.style.display='none'; if(note) note.textContent='No matches — try a broader name or coordinates.'; return; }
 if(note) note.textContent='';
 box.style.cssText='display:block; margin-top:6px; border:1px solid var(--line,rgba(0,0,0,.15)); border-radius:8px; overflow:hidden; max-height:220px; overflow-y:auto;';
 list.slice(0,5).forEach((r,i)=>{
  const row=document.createElement('button'); row.type='button';
  row.style.cssText='display:block; width:100%; text-align:left; padding:8px 10px; border:0; border-top:'+(i?'1px solid var(--line,rgba(0,0,0,.08))':'0')+'; background:transparent; cursor:pointer; font-size:12px; line-height:1.3; color:inherit;';
  row.innerHTML='<span style="font-weight:600;">'+escapeHtml(r.name)+'</span>'+(r.context?'<br><span style="opacity:.6;">'+escapeHtml(r.context)+'</span>':'');
  row.onmouseenter=()=>row.style.background='rgba(127,127,127,.12)';
  row.onmouseleave=()=>row.style.background='transparent';
  row.onclick=()=>pickPlace(r);
  box.appendChild(row);
 });
}
async function runPlaceSearch(q){
 const note=document.getElementById('placeNote');
 const c=parseCoords(q);
 if(c){ clearPlaceResults(); if(note) note.textContent=''; enterPlace(c.lat, c.lon, 12, null, null); return; }
 if((q||'').trim().length<3){ clearPlaceResults(); if(note) note.textContent=''; return; }
 const seq=++placeSeq; if(note) note.textContent='Searching…';
 try{
  const res=await fetch(`${BACKEND_URL}/api/geocode/search?q=${encodeURIComponent(q.trim())}`, {cache:'no-store'});
  if(seq!==placeSeq) return;                 // a newer query superseded this one
  if(!res.ok) throw new Error('search '+res.status);
  const data=await res.json();
  renderPlaceResults(data.results||[]);
 }catch(e){ if(seq===placeSeq){ clearPlaceResults(); if(note) note.textContent='Search unavailable — try coordinates, e.g. 40.01, -105.27'; } }
}
{
 const inp=document.getElementById('placeSearch');
 if(inp){
  inp.addEventListener('input',()=>{ clearTimeout(placeTimer); const q=inp.value; placeTimer=setTimeout(()=>runPlaceSearch(q),500); });
  inp.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); clearTimeout(placeTimer); runPlaceSearch(inp.value); } });
  document.addEventListener('click',(e)=>{ const t=e.target; if(!(t.closest && t.closest('#placeSearch, #placeResults'))) clearPlaceResults(); });
 }
}
function download(name,blob){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
function serialized(){ const c=svg.node().cloneNode(true); c.setAttribute('xmlns','http://www.w3.org/2000/svg'); return '<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(c); }
function pkey(){ return (state.preset.key||'art').replace(/[^a-z0-9]+/gi,'-').toLowerCase(); }
document.getElementById('dlSvg').onclick=()=>download(`gpxsketch-topo-${pkey()}.svg`, new Blob([serialized()],{type:'image/svg+xml'}));
/* PNG export sizes. Poster is 3:4 (900×1200 viewBox), so every print size is a
   clean 3:4 at 300 dpi — no cropping or distortion. 'screen' keeps the old 2.5×. */
const PNG_SIZES={ screen:{w:2250,h:3000,tag:'screen'}, '9x12':{w:2700,h:3600,tag:'9x12in-300dpi'},
 '12x16':{w:3600,h:4800,tag:'12x16in-300dpi'}, '18x24':{w:5400,h:7200,tag:'18x24in-300dpi'} };
document.getElementById('dlPng').onclick=()=>{
 const sel=document.getElementById('exportSize'), spec=PNG_SIZES[sel && sel.value] || PNG_SIZES.screen;
 const W=spec.w, H=spec.h, img=new Image();
 img.onload=()=>{ const c=document.createElement('canvas'); c.width=W; c.height=H;
  const ctx=c.getContext('2d'); ctx.drawImage(img,0,0,W,H);
  c.toBlob(b=>download(`gpxsketch-topo-${pkey()}-${spec.tag}.png`,b),'image/png'); };
 img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(serialized()); };
(function(){ const n=document.getElementById('envNote'); const bits=[];
 try{ if(window.self!==window.top) bits.push('Running inside an embed — open this file in a real browser tab for terrain to load correctly.'); }catch(e){ bits.push('Running inside an embed — open locally for real terrain.'); }
 if(bits.length){ n.className='banner'; n.innerHTML=bits.join('<br><br>'); } })();

/* ---- Default poster: Wonderland Trail · Mt Rainier National Park ----
   Downsampled from the recorded GPX (1,386 pts) so the app opens on a real,
   recognisable route instead of a synthetic placeholder. [lat, lon, elev_m]. */
const DEFAULT_ROUTE_GPX=[[46.75198,-121.81128,861],[46.7523,-121.81142,859],[46.75292,-121.81132,858],[46.7534,-121.81156,857],[46.75372,-121.81289,858],[46.75438,-121.81222,875],[46.75496,-121.81239,882],[46.75697,-121.81089,887],[46.75728,-121.81082,885],[46.75813,-121.80985,885],[46.75854,-121.81032,892],[46.75931,-121.81025,905],[46.75974,-121.80977,915],[46.76054,-121.80937,929],[46.76126,-121.80867,941],[46.76143,-121.8083,948],[46.76156,-121.80891,961],[46.76221,-121.80845,984],[46.76251,-121.80777,997],[46.76277,-121.80756,1004],[46.76323,-121.80628,1030],[46.76327,-121.80731,1043],[46.76365,-121.80667,1062],[46.76414,-121.80625,1068],[46.76393,-121.80687,1079],[46.76462,-121.80664,1091],[46.76581,-121.80567,1117],[46.76656,-121.8048,1141],[46.76657,-121.80566,1152],[46.76604,-121.80809,1174],[46.76623,-121.80857,1179],[46.76672,-121.80884,1186],[46.76803,-121.80889,1182],[46.76919,-121.80823,1169],[46.76943,-121.80816,1167],[46.77011,-121.80834,1167],[46.77079,-121.80794,1172],[46.77161,-121.80799,1181],[46.77189,-121.80844,1179],[46.77192,-121.80886,1176],[46.77246,-121.80894,1175],[46.77335,-121.80846,1171],[46.77364,-121.80814,1169],[46.77359,-121.80863,1161],[46.77398,-121.80845,1146],[46.774,-121.80872,1135],[46.77481,-121.80806,1115],[46.77511,-121.80861,1105],[46.77555,-121.80787,1106],[46.77576,-121.80805,1106],[46.77575,-121.80826,1107],[46.77591,-121.80798,1107],[46.77583,-121.80854,1107],[46.77553,-121.80812,1107],[46.77652,-121.80672,1125],[46.77666,-121.80692,1128],[46.77684,-121.80858,1125],[46.77716,-121.80886,1127],[46.77808,-121.81094,1129],[46.7792,-121.81094,1140],[46.77979,-121.81117,1142],[46.77996,-121.81104,1142],[46.78028,-121.81126,1140],[46.78044,-121.81168,1142],[46.7807,-121.81171,1144],[46.78113,-121.81136,1160],[46.78115,-121.8133,1177],[46.78134,-121.81369,1181],[46.78137,-121.8134,1187],[46.78181,-121.81278,1210],[46.782,-121.81275,1212],[46.78228,-121.81301,1216],[46.78236,-121.81239,1238],[46.78259,-121.81251,1245],[46.78261,-121.81239,1250],[46.78248,-121.8119,1266],[46.78294,-121.81208,1274],[46.78386,-121.81212,1287],[46.7843,-121.81233,1291],[46.78493,-121.81298,1301],[46.78628,-121.81316,1316],[46.78648,-121.81378,1315],[46.78625,-121.815,1330],[46.78557,-121.81561,1340],[46.78471,-121.81723,1350],[46.78275,-121.81957,1371],[46.78322,-121.82178,1378],[46.78314,-121.82408,1384],[46.78283,-121.82507,1382],[46.78219,-121.82629,1382],[46.78198,-121.82716,1393],[46.78146,-121.82786,1410],[46.78184,-121.82807,1420],[46.78224,-121.82808,1427],[46.78231,-121.8284,1432],[46.7823,-121.82885,1442],[46.78204,-121.82898,1449],[46.78225,-121.8294,1458],[46.78213,-121.8299,1463],[46.78228,-121.83105,1469],[46.782,-121.83219,1486],[46.78171,-121.83277,1494],[46.78185,-121.83292,1498],[46.78173,-121.83343,1505],[46.78186,-121.83366,1508],[46.78229,-121.83384,1516],[46.78277,-121.83572,1539],[46.78333,-121.83606,1545],[46.78441,-121.83551,1548],[46.7849,-121.8358,1547],[46.78593,-121.83445,1547],[46.78713,-121.83374,1546],[46.788,-121.83466,1552],[46.78831,-121.8358,1569],[46.78883,-121.8366,1579],[46.78946,-121.8368,1585],[46.78963,-121.83658,1590],[46.78993,-121.83654,1598],[46.79105,-121.83694,1622],[46.79159,-121.83777,1630],[46.79213,-121.83803,1625],[46.79292,-121.83995,1634],[46.79415,-121.84161,1629],[46.79464,-121.84293,1626],[46.79497,-121.84298,1626],[46.79547,-121.84189,1612],[46.79613,-121.84156,1608],[46.79691,-121.84192,1603],[46.79753,-121.84193,1589],[46.79823,-121.84243,1577],[46.79928,-121.84184,1559],[46.79938,-121.84193,1556],[46.79923,-121.84262,1541],[46.79849,-121.8438,1522],[46.7984,-121.84468,1516],[46.79859,-121.84584,1506],[46.79891,-121.84659,1501],[46.80026,-121.84787,1484],[46.80045,-121.84794,1481],[46.80034,-121.84744,1472],[46.80073,-121.84752,1462],[46.80071,-121.84731,1458],[46.80088,-121.84739,1454],[46.801,-121.8472,1449],[46.80138,-121.84728,1429],[46.80156,-121.84664,1409],[46.80169,-121.84671,1402],[46.8019,-121.84645,1390],[46.80186,-121.84566,1376],[46.8025,-121.84495,1361],[46.80284,-121.8447,1359],[46.80358,-121.84509,1352],[46.80442,-121.84593,1328],[46.80438,-121.84685,1298],[46.80448,-121.84708,1292],[46.80436,-121.84728,1288],[46.80476,-121.84749,1280],[46.80485,-121.84907,1282],[46.80506,-121.84928,1289],[46.80567,-121.84864,1308],[46.80596,-121.84678,1327],[46.80669,-121.84567,1348],[46.80758,-121.84281,1389],[46.80768,-121.84259,1393],[46.80789,-121.84387,1410],[46.80841,-121.84261,1431],[46.80855,-121.84165,1445],[46.80875,-121.84313,1466],[46.80933,-121.84185,1485],[46.80998,-121.84136,1494],[46.81113,-121.84083,1516],[46.81152,-121.84013,1534],[46.81287,-121.84037,1569],[46.81365,-121.84084,1588],[46.81468,-121.84111,1607],[46.81589,-121.84125,1618],[46.81688,-121.84095,1627],[46.81797,-121.84105,1641],[46.81887,-121.84068,1647],[46.81995,-121.83979,1654],[46.82046,-121.83964,1658],[46.82135,-121.83905,1675],[46.8214,-121.83939,1679],[46.82111,-121.83981,1688],[46.82169,-121.83963,1697],[46.82195,-121.83935,1702],[46.82181,-121.84032,1712],[46.8216,-121.84014,1714],[46.82108,-121.84068,1717],[46.82131,-121.841,1716],[46.82128,-121.84142,1714],[46.82015,-121.84508,1673],[46.82026,-121.84575,1659],[46.82014,-121.84593,1653],[46.82028,-121.84599,1648],[46.82008,-121.84735,1617],[46.81939,-121.84914,1591],[46.81931,-121.84888,1586],[46.81921,-121.84911,1581],[46.81914,-121.85006,1570],[46.81935,-121.85022,1564],[46.81928,-121.85044,1560],[46.8191,-121.85067,1556],[46.81862,-121.85045,1545],[46.81835,-121.85094,1540],[46.81835,-121.85105,1539],[46.81852,-121.85094,1535],[46.81859,-121.85123,1531],[46.81852,-121.85279,1513],[46.81878,-121.8529,1508],[46.81914,-121.85277,1500],[46.81915,-121.85292,1498],[46.81865,-121.85435,1476],[46.81881,-121.85448,1471],[46.81862,-121.85494,1462],[46.81836,-121.85515,1455],[46.81841,-121.85568,1447],[46.81821,-121.85572,1442],[46.81837,-121.85619,1434],[46.81782,-121.85625,1421],[46.81753,-121.85598,1413],[46.81699,-121.85649,1401],[46.81706,-121.85701,1393],[46.81724,-121.85711,1389],[46.81713,-121.85773,1380],[46.81644,-121.85882,1355],[46.81609,-121.86001,1337],[46.81537,-121.86078,1322],[46.81508,-121.86213,1308],[46.81373,-121.86416,1283],[46.81409,-121.86408,1275],[46.81428,-121.86439,1277],[46.81455,-121.86448,1283],[46.81503,-121.86553,1300],[46.81531,-121.86513,1308],[46.81596,-121.86501,1321],[46.81669,-121.86461,1334],[46.81716,-121.86369,1349],[46.81759,-121.8649,1368],[46.81835,-121.8625,1403],[46.81873,-121.864,1427],[46.8188,-121.86585,1452],[46.81946,-121.86471,1475],[46.8198,-121.86187,1509],[46.82025,-121.86356,1534],[46.82025,-121.86719,1584],[46.82056,-121.86678,1594],[46.82095,-121.86544,1613],[46.82128,-121.86665,1627],[46.82089,-121.87005,1662],[46.82104,-121.87319,1696],[46.82283,-121.86822,1753],[46.82362,-121.86706,1772],[46.82419,-121.86461,1803],[46.82394,-121.86451,1809],[46.82404,-121.86411,1813],[46.82493,-121.86371,1808],[46.82504,-121.86337,1805],[46.82536,-121.86391,1794],[46.82659,-121.86333,1772],[46.82831,-121.86501,1747],[46.82823,-121.86542,1750],[46.82843,-121.86578,1756],[46.82988,-121.86483,1773],[46.83092,-121.86482,1780],[46.8313,-121.86409,1794],[46.83235,-121.86469,1795],[46.83259,-121.86497,1793],[46.83309,-121.86483,1803],[46.83293,-121.86525,1806],[46.83303,-121.86561,1804],[46.8339,-121.8662,1784],[46.83464,-121.86743,1763],[46.83475,-121.86794,1759],[46.8342,-121.8687,1744],[46.83405,-121.86939,1734],[46.83388,-121.8724,1717],[46.83435,-121.87336,1717],[46.83496,-121.87564,1691],[46.83523,-121.8774,1673],[46.83539,-121.87748,1672],[46.83609,-121.87722,1674],[46.83625,-121.8763,1673],[46.83675,-121.87517,1668],[46.83667,-121.87347,1664],[46.83693,-121.87302,1655],[46.83703,-121.87332,1648],[46.83716,-121.8732,1643],[46.83752,-121.87218,1622],[46.83748,-121.8717,1619],[46.83801,-121.87261,1608],[46.83798,-121.8706,1573],[46.83843,-121.87098,1555],[46.8384,-121.86998,1539],[46.83875,-121.87028,1539],[46.83873,-121.86957,1514],[46.83905,-121.86947,1502],[46.83884,-121.86849,1491],[46.83892,-121.86814,1486],[46.83903,-121.86833,1478],[46.83913,-121.86774,1474],[46.83908,-121.86661,1469],[46.83873,-121.86548,1462],[46.83892,-121.86453,1461],[46.83952,-121.86415,1458],[46.83977,-121.86331,1447],[46.84013,-121.86341,1439],[46.84036,-121.86364,1435],[46.84025,-121.86401,1432],[46.84035,-121.86419,1429],[46.83981,-121.86457,1404],[46.83959,-121.86534,1389],[46.84005,-121.86647,1385],[46.84003,-121.86681,1386],[46.84029,-121.86749,1372],[46.84077,-121.86813,1340],[46.84081,-121.86856,1345],[46.84074,-121.86805,1344],[46.84097,-121.86881,1341],[46.84095,-121.86827,1332],[46.84118,-121.86853,1320],[46.8412,-121.86786,1310],[46.84134,-121.86808,1300],[46.8415,-121.86803,1293],[46.84169,-121.86834,1278],[46.84178,-121.86813,1273],[46.84184,-121.86876,1265],[46.84196,-121.86847,1260],[46.84212,-121.86899,1254],[46.84243,-121.86852,1245],[46.84273,-121.86922,1238],[46.84276,-121.86854,1224],[46.843,-121.86916,1216],[46.84307,-121.86873,1209],[46.84385,-121.86915,1191],[46.84399,-121.86895,1185],[46.84398,-121.86907,1182],[46.84436,-121.86905,1175],[46.84518,-121.86992,1156],[46.84557,-121.86965,1144],[46.84591,-121.8698,1135],[46.84613,-121.86929,1127],[46.8462,-121.86938,1126],[46.84651,-121.86907,1116],[46.84726,-121.87051,1115],[46.84749,-121.87295,1084],[46.84738,-121.87368,1083],[46.84794,-121.87532,1108],[46.84785,-121.87664,1097],[46.84863,-121.87845,1121],[46.84857,-121.88003,1090],[46.84902,-121.88285,1086],[46.84896,-121.88425,1086],[46.84928,-121.88548,1088],[46.84958,-121.88822,1090],[46.84973,-121.8889,1093],[46.85,-121.88913,1095],[46.85039,-121.89141,1111],[46.8509,-121.89275,1124],[46.8517,-121.89264,1130],[46.85294,-121.89275,1143],[46.85484,-121.89315,1170],[46.85559,-121.89391,1185],[46.85565,-121.89444,1192],[46.85613,-121.8946,1200],[46.85717,-121.89422,1220],[46.85882,-121.89412,1248],[46.85924,-121.89502,1255],[46.85878,-121.89732,1283],[46.85938,-121.89736,1292],[46.8599,-121.89684,1303],[46.86008,-121.89689,1306],[46.86045,-121.89756,1316],[46.86169,-121.89723,1338],[46.86204,-121.89736,1345],[46.86282,-121.89831,1364],[46.86311,-121.89719,1380],[46.86502,-121.89568,1418],[46.86551,-121.89497,1430],[46.86555,-121.89388,1446],[46.86641,-121.89171,1480],[46.86659,-121.89162,1484],[46.86723,-121.89185,1496],[46.86809,-121.89098,1514],[46.86893,-121.89315,1540],[46.86871,-121.89478,1553],[46.86859,-121.89938,1585],[46.86888,-121.90118,1593],[46.86905,-121.90139,1595],[46.86981,-121.90136,1596],[46.87043,-121.90084,1597],[46.87292,-121.90188,1600],[46.87394,-121.90194,1592],[46.87435,-121.90228,1589],[46.87472,-121.90216,1589],[46.87514,-121.90177,1587],[46.87607,-121.90291,1581],[46.87647,-121.90252,1577],[46.87672,-121.90256,1576],[46.87734,-121.90369,1574],[46.87778,-121.90381,1574],[46.87817,-121.90336,1572],[46.87872,-121.90315,1573],[46.87924,-121.90382,1575],[46.87952,-121.90374,1577],[46.87996,-121.90237,1579],[46.88023,-121.90201,1575],[46.8803,-121.90021,1556],[46.88054,-121.89956,1549],[46.88163,-121.89908,1533],[46.88201,-121.89903,1526],[46.88216,-121.89921,1522],[46.88238,-121.89836,1511],[46.88278,-121.89899,1498],[46.88273,-121.89708,1502],[46.88337,-121.89606,1500],[46.88362,-121.89473,1501],[46.8844,-121.89247,1514],[46.88484,-121.89209,1517],[46.88564,-121.89202,1516],[46.8861,-121.89179,1511],[46.88738,-121.89204,1500],[46.88826,-121.8932,1487],[46.8901,-121.89432,1472],[46.89123,-121.89548,1473],[46.89237,-121.89892,1480],[46.89339,-121.89938,1482],[46.89479,-121.9004,1482],[46.89582,-121.90162,1476],[46.89612,-121.90254,1477],[46.89618,-121.90489,1466],[46.89654,-121.90593,1460],[46.89705,-121.90682,1455],[46.8979,-121.9097,1437],[46.89875,-121.91146,1428],[46.89878,-121.91178,1426],[46.89931,-121.91244,1411],[46.89919,-121.91162,1402],[46.89941,-121.91107,1396],[46.90063,-121.91007,1375],[46.90066,-121.90943,1368],[46.90048,-121.90884,1358],[46.90086,-121.90891,1347],[46.90075,-121.90867,1344],[46.90089,-121.90847,1343],[46.90117,-121.909,1337],[46.90124,-121.90888,1334],[46.90132,-121.90538,1300],[46.90112,-121.90282,1275],[46.90133,-121.90308,1265],[46.90133,-121.90234,1253],[46.90179,-121.90345,1237],[46.90165,-121.90161,1220],[46.90233,-121.90306,1197],[46.90212,-121.90146,1196],[46.90255,-121.90239,1185],[46.90273,-121.8999,1167],[46.90334,-121.9,1158],[46.90353,-121.8998,1156],[46.9039,-121.90005,1151],[46.90408,-121.90039,1147],[46.90436,-121.90038,1141],[46.90436,-121.89963,1129],[46.90399,-121.89836,1111],[46.90336,-121.89738,1097],[46.90374,-121.89732,1086],[46.90298,-121.8966,1077],[46.90397,-121.89674,1065],[46.90358,-121.89618,1063],[46.90357,-121.89565,1032],[46.90477,-121.89582,1017],[46.90593,-121.89673,1003],[46.90636,-121.89767,1000],[46.90637,-121.89724,982],[46.90652,-121.89745,978],[46.90662,-121.8975,970],[46.90665,-121.89734,964],[46.90643,-121.89687,958],[46.90671,-121.89696,945],[46.90734,-121.89799,926],[46.90715,-121.89707,917],[46.90648,-121.89575,909],[46.90516,-121.89373,895],[46.90453,-121.89305,886],[46.90441,-121.89258,880],[46.90501,-121.89254,868],[46.90495,-121.89211,863],[46.90549,-121.89167,861],[46.90618,-121.89203,856],[46.90662,-121.89257,853],[46.90713,-121.89274,848],[46.90747,-121.89246,843],[46.90758,-121.89102,846],[46.90785,-121.89065,847],[46.90859,-121.89102,846],[46.90881,-121.8908,845],[46.90942,-121.89081,840],[46.91075,-121.89193,828],[46.91226,-121.89264,815],[46.9132,-121.89285,807],[46.91468,-121.89258,799],[46.91501,-121.89296,801],[46.91504,-121.89345,801],[46.91552,-121.89377,800],[46.9159,-121.89382,800],[46.91642,-121.8949,808],[46.91691,-121.89529,824],[46.91675,-121.89505,826],[46.91661,-121.89372,834],[46.91667,-121.89181,846],[46.91693,-121.89105,853],[46.91706,-121.89226,865],[46.91749,-121.89074,885],[46.91834,-121.88936,907],[46.9186,-121.88839,919],[46.91862,-121.88852,923],[46.91878,-121.88836,933],[46.91883,-121.88744,945],[46.91927,-121.88643,962],[46.91928,-121.88571,968],[46.91956,-121.88521,974],[46.91962,-121.88356,992],[46.92006,-121.88296,1003],[46.9201,-121.88204,1014],[46.92023,-121.88189,1017],[46.92016,-121.88215,1023],[46.92054,-121.88275,1033],[46.92063,-121.8857,1064],[46.92095,-121.88459,1078],[46.9211,-121.88512,1099],[46.92181,-121.88075,1145],[46.9222,-121.88019,1155],[46.9222,-121.87959,1159],[46.92205,-121.87933,1163],[46.92203,-121.87816,1175],[46.9222,-121.87736,1183],[46.92195,-121.87441,1209],[46.92204,-121.87311,1232],[46.92215,-121.87408,1243],[46.9223,-121.87398,1247],[46.92247,-121.87417,1252],[46.92296,-121.87503,1266],[46.92318,-121.87412,1279],[46.92399,-121.87372,1294],[46.92479,-121.87221,1314],[46.92613,-121.87137,1329],[46.92721,-121.86907,1354],[46.92872,-121.86878,1376],[46.92898,-121.86855,1379],[46.92938,-121.86792,1386],[46.9294,-121.86763,1389],[46.92987,-121.86728,1397],[46.93022,-121.86665,1401],[46.93053,-121.86547,1411],[46.92948,-121.86483,1426],[46.92898,-121.86477,1434],[46.9295,-121.86413,1446],[46.92982,-121.86327,1459],[46.9307,-121.86282,1474],[46.93158,-121.86302,1482],[46.93179,-121.86268,1491],[46.93212,-121.86334,1496],[46.93238,-121.86325,1501],[46.93277,-121.86346,1507],[46.93323,-121.8631,1504],[46.93384,-121.86357,1505],[46.93356,-121.86467,1508],[46.93377,-121.86478,1505],[46.93384,-121.86533,1505],[46.9343,-121.86588,1513],[46.93467,-121.86569,1514],[46.93537,-121.86583,1507],[46.93612,-121.8665,1509],[46.9374,-121.86703,1510],[46.93796,-121.86697,1512],[46.93855,-121.86662,1512],[46.94054,-121.86482,1515],[46.94153,-121.86462,1528],[46.94232,-121.86557,1523],[46.94341,-121.86607,1520],[46.94414,-121.86595,1525],[46.94513,-121.8663,1533],[46.94704,-121.86592,1540],[46.94795,-121.86657,1539],[46.94893,-121.86694,1544],[46.94971,-121.86763,1551],[46.9502,-121.86771,1555],[46.95061,-121.86808,1547],[46.95101,-121.86797,1534],[46.96436,-121.83634,916],[46.96493,-121.8361,895],[46.96574,-121.83542,881],[46.96973,-121.83149,816],[46.97041,-121.8301,799],[46.97096,-121.83105,783],[46.9718,-121.82995,740],[46.97087,-121.82851,746],[46.97047,-121.82712,748],[46.9701,-121.82645,752],[46.96921,-121.8232,757],[46.96882,-121.82248,762],[46.96867,-121.82137,764],[46.96747,-121.81863,772],[46.96701,-121.81661,779],[46.96494,-121.81333,794],[46.96462,-121.81304,796],[46.96428,-121.81106,795],[46.96335,-121.80892,810],[46.9631,-121.80668,825],[46.96244,-121.80504,837],[46.96201,-121.80438,843],[46.96228,-121.80227,856],[46.96207,-121.80102,864],[46.96215,-121.80017,869],[46.96146,-121.79899,879],[46.96119,-121.79878,877],[46.96153,-121.7966,883],[46.96174,-121.79617,884],[46.96202,-121.79603,884],[46.96225,-121.79474,885],[46.96256,-121.7945,885],[46.96314,-121.79451,880],[46.96327,-121.7943,878],[46.96305,-121.79372,887],[46.96314,-121.79381,886],[46.96326,-121.79367,888],[46.96237,-121.79244,894],[46.96154,-121.79194,891],[46.96052,-121.79203,890],[46.95994,-121.79179,893],[46.95954,-121.79143,895],[46.9591,-121.79169,896],[46.95844,-121.79166,896],[46.95656,-121.79368,916],[46.95581,-121.79385,924],[46.9547,-121.79475,938],[46.95434,-121.79493,942],[46.95406,-121.79485,945],[46.9528,-121.79562,961],[46.95146,-121.79569,976],[46.95082,-121.79507,985],[46.94943,-121.79417,1007],[46.94777,-121.79222,1046],[46.94641,-121.79142,1062],[46.94441,-121.78856,1138],[46.94428,-121.78822,1147],[46.94492,-121.78855,1164],[46.9449,-121.78842,1166],[46.94396,-121.78688,1195],[46.94254,-121.78602,1207],[46.94088,-121.78374,1259],[46.94072,-121.78374,1262],[46.94058,-121.78396,1266],[46.93983,-121.78387,1284],[46.93986,-121.78346,1298],[46.94002,-121.78337,1294],[46.93941,-121.78315,1322],[46.9397,-121.7826,1341],[46.93936,-121.78198,1359],[46.93979,-121.78178,1368],[46.93906,-121.78102,1397],[46.93921,-121.7807,1410],[46.93949,-121.78068,1417],[46.9396,-121.7805,1421],[46.93858,-121.77973,1444],[46.93679,-121.77781,1492],[46.93717,-121.77785,1507],[46.93691,-121.77763,1521],[46.93543,-121.77719,1541],[46.93489,-121.77619,1558],[46.93421,-121.77576,1574],[46.93365,-121.77495,1580],[46.9329,-121.77445,1585],[46.93196,-121.77275,1602],[46.93122,-121.77186,1611],[46.93023,-121.77105,1623],[46.92976,-121.77087,1628],[46.92874,-121.77009,1643],[46.9283,-121.76998,1650],[46.9281,-121.76974,1655],[46.9275,-121.76979,1665],[46.92733,-121.77012,1670],[46.92681,-121.76966,1680],[46.9255,-121.76913,1700],[46.92431,-121.7683,1711],[46.92267,-121.76769,1726],[46.92145,-121.7675,1736],[46.9204,-121.76678,1741],[46.91872,-121.76635,1751],[46.91818,-121.76549,1773],[46.91798,-121.76551,1780],[46.9181,-121.7649,1794],[46.91767,-121.76509,1809],[46.91775,-121.76483,1816],[46.9173,-121.76478,1829],[46.91728,-121.76413,1842],[46.91677,-121.7643,1852],[46.91602,-121.76372,1843],[46.91562,-121.76286,1830],[46.9154,-121.76272,1821],[46.9152,-121.76167,1800],[46.91451,-121.76179,1785],[46.91417,-121.76153,1783],[46.91382,-121.76075,1796],[46.91331,-121.76027,1789],[46.91328,-121.75926,1773],[46.91281,-121.75952,1762],[46.91245,-121.75846,1748],[46.91258,-121.75678,1741],[46.91241,-121.75626,1741],[46.91284,-121.75293,1740],[46.91329,-121.75233,1740],[46.91369,-121.75227,1739],[46.91389,-121.7525,1740],[46.91487,-121.75168,1712],[46.91547,-121.75054,1698],[46.91596,-121.75039,1690],[46.91632,-121.75059,1685],[46.91592,-121.74978,1675],[46.91615,-121.74838,1658],[46.91578,-121.74737,1654],[46.91498,-121.74726,1643],[46.91435,-121.74747,1633],[46.91352,-121.74741,1621],[46.91323,-121.747,1616],[46.91502,-121.74457,1590],[46.91512,-121.74414,1590],[46.91539,-121.74407,1582],[46.91512,-121.74333,1582],[46.91633,-121.74093,1588],[46.91632,-121.74029,1588],[46.91682,-121.74012,1585],[46.91703,-121.73894,1575],[46.918,-121.73837,1573],[46.91876,-121.7382,1572],[46.91884,-121.73779,1572],[46.92028,-121.73527,1553],[46.92048,-121.73452,1546],[46.9211,-121.73452,1537],[46.92108,-121.73415,1533],[46.92174,-121.73422,1526],[46.92152,-121.73373,1518],[46.92251,-121.73342,1507],[46.92375,-121.73269,1485],[46.92468,-121.7314,1460],[46.92504,-121.72975,1455],[46.92496,-121.72918,1455],[46.92447,-121.72869,1446],[46.92456,-121.72812,1439],[46.92437,-121.72727,1426],[46.92452,-121.72695,1417],[46.92433,-121.72629,1406],[46.92437,-121.7259,1403],[46.92419,-121.72592,1403],[46.92401,-121.72624,1406],[46.92382,-121.72617,1409],[46.92318,-121.7265,1424],[46.92246,-121.72726,1441],[46.92069,-121.72732,1477],[46.91983,-121.72675,1499],[46.91963,-121.72627,1519],[46.91848,-121.72555,1547],[46.91851,-121.72533,1552],[46.91794,-121.72509,1563],[46.91796,-121.72393,1575],[46.91749,-121.72355,1584],[46.91753,-121.72333,1589],[46.91691,-121.72272,1612],[46.91724,-121.72256,1624],[46.91728,-121.72198,1639],[46.91761,-121.72146,1647],[46.91782,-121.72144,1647],[46.91904,-121.72209,1636],[46.91972,-121.72193,1633],[46.9206,-121.72206,1637],[46.92084,-121.72162,1642],[46.92144,-121.72122,1659],[46.92151,-121.72037,1678],[46.92189,-121.71969,1697],[46.92165,-121.71867,1711],[46.92167,-121.71774,1719],[46.92138,-121.71688,1729],[46.9214,-121.71603,1733],[46.92084,-121.7141,1749],[46.92069,-121.71195,1756],[46.92016,-121.71056,1775],[46.91975,-121.71003,1783],[46.91966,-121.70943,1784],[46.91987,-121.7078,1780],[46.92003,-121.70797,1782],[46.92091,-121.70771,1794],[46.92176,-121.70771,1809],[46.92231,-121.70814,1818],[46.92211,-121.70673,1833],[46.92136,-121.70451,1852],[46.92084,-121.70415,1859],[46.91969,-121.7039,1873],[46.91823,-121.70248,1902],[46.91871,-121.702,1911],[46.91902,-121.70201,1915],[46.91974,-121.70165,1924],[46.92163,-121.70207,1955],[46.92138,-121.70147,1962],[46.92018,-121.69975,1990],[46.9192,-121.69869,2011],[46.9227,-121.69757,2050],[46.92275,-121.6967,2043],[46.92314,-121.6955,2031],[46.92245,-121.69559,2022],[46.92193,-121.69587,2013],[46.9215,-121.69581,2007],[46.92089,-121.69491,1998],[46.92014,-121.69487,1989],[46.91937,-121.69436,1979],[46.9183,-121.69311,1961],[46.91646,-121.69208,1930],[46.91606,-121.69147,1925],[46.91596,-121.69056,1925],[46.91485,-121.68675,1934],[46.91503,-121.68439,1938],[46.91551,-121.68388,1936],[46.91568,-121.68305,1943],[46.91721,-121.68005,1952],[46.91667,-121.67872,1966],[46.91603,-121.67775,1982],[46.91596,-121.67713,1989],[46.91627,-121.67683,1994],[46.91715,-121.6774,2001],[46.91739,-121.67736,2002],[46.91755,-121.67715,2004],[46.91766,-121.67525,2021],[46.91812,-121.67346,2030],[46.91737,-121.67127,2042],[46.91756,-121.66845,2060],[46.91716,-121.66769,2050],[46.91718,-121.66641,2038],[46.91653,-121.66591,2023],[46.91626,-121.66547,2015],[46.91607,-121.66422,1988],[46.91546,-121.66296,1967],[46.9157,-121.65925,1937],[46.91524,-121.65942,1936],[46.91439,-121.65901,1932],[46.91386,-121.65907,1931],[46.91332,-121.65896,1930],[46.91305,-121.65978,1925],[46.91282,-121.65997,1923],[46.91221,-121.65988,1917],[46.91176,-121.6604,1913],[46.91123,-121.6604,1908],[46.91064,-121.65995,1906],[46.91072,-121.65848,1900],[46.91041,-121.65739,1892],[46.9097,-121.65608,1896],[46.90993,-121.65546,1896],[46.91072,-121.65528,1901],[46.91141,-121.65556,1897],[46.91275,-121.65561,1895],[46.91298,-121.6539,1896],[46.91388,-121.6535,1901],[46.91428,-121.65304,1903],[46.91442,-121.65183,1901],[46.91492,-121.65132,1904],[46.91497,-121.65103,1903],[46.91468,-121.65075,1900],[46.91451,-121.65024,1894],[46.91412,-121.65024,1884],[46.91353,-121.64954,1869],[46.91305,-121.6492,1858],[46.9126,-121.64786,1840],[46.91249,-121.64821,1827],[46.91199,-121.64718,1812],[46.91195,-121.64921,1781],[46.91219,-121.64965,1774],[46.91182,-121.6501,1772],[46.91157,-121.65079,1760],[46.91146,-121.65053,1752],[46.91095,-121.65103,1740],[46.90951,-121.65087,1717],[46.90941,-121.65064,1713],[46.90958,-121.65002,1704],[46.90922,-121.64994,1693],[46.90921,-121.64979,1691],[46.90943,-121.64879,1672],[46.90899,-121.6486,1662],[46.90881,-121.64884,1657],[46.9084,-121.64838,1650],[46.90815,-121.64849,1644],[46.90805,-121.64792,1632],[46.90761,-121.64815,1620],[46.9073,-121.64806,1615],[46.90678,-121.647,1603],[46.9062,-121.64758,1583],[46.90497,-121.65109,1537],[46.90454,-121.65123,1526],[46.90474,-121.64715,1483],[46.90498,-121.64667,1477],[46.90528,-121.64435,1457],[46.90512,-121.64395,1435],[46.90509,-121.64299,1444],[46.90469,-121.64455,1427],[46.90413,-121.64482,1416],[46.90454,-121.64128,1366],[46.90413,-121.64195,1351],[46.90357,-121.64232,1339],[46.90262,-121.64376,1312],[46.90236,-121.64378,1310],[46.90207,-121.6427,1306],[46.90163,-121.6423,1301],[46.90143,-121.64262,1297],[46.90114,-121.64258,1296],[46.90099,-121.64218,1295],[46.90063,-121.64228,1296],[46.90038,-121.64342,1300],[46.90024,-121.64368,1302],[46.89997,-121.64375,1304],[46.8997,-121.64225,1308],[46.89995,-121.63877,1298],[46.89986,-121.63797,1297],[46.90022,-121.63453,1291],[46.90011,-121.63417,1289],[46.90019,-121.63222,1289],[46.90083,-121.62979,1295],[46.90082,-121.62888,1295],[46.90058,-121.62793,1294],[46.89891,-121.62581,1286],[46.89832,-121.62457,1279],[46.89775,-121.62213,1267],[46.89706,-121.62096,1262],[46.89628,-121.61862,1248],[46.89574,-121.61804,1236],[46.89393,-121.61135,1208],[46.89287,-121.61032,1208],[46.89248,-121.60948,1207],[46.89179,-121.61037,1205],[46.88968,-121.61209,1197],[46.88795,-121.61254,1193],[46.88681,-121.61226,1182],[46.88647,-121.61255,1181],[46.88565,-121.61274,1186],[46.88533,-121.61297,1188],[46.88395,-121.61325,1192],[46.88251,-121.61419,1198],[46.88209,-121.61419,1197],[46.88094,-121.61462,1202],[46.87872,-121.61677,1215],[46.87749,-121.6189,1227],[46.87699,-121.62045,1237],[46.87709,-121.6216,1247],[46.87546,-121.62418,1265],[46.87492,-121.62409,1262],[46.8743,-121.62373,1265],[46.8738,-121.62372,1267],[46.87335,-121.6239,1274],[46.87312,-121.62378,1279],[46.87194,-121.62524,1304],[46.87136,-121.62533,1314],[46.87065,-121.6251,1324],[46.87099,-121.62542,1320],[46.8712,-121.62618,1334],[46.87056,-121.62574,1343],[46.86963,-121.62593,1353],[46.86975,-121.62631,1356],[46.87034,-121.62636,1363],[46.87003,-121.62643,1361],[46.86924,-121.62719,1381],[46.8697,-121.6287,1391],[46.86886,-121.63042,1411],[46.86852,-121.63204,1425],[46.86829,-121.63426,1437],[46.8687,-121.63718,1456],[46.86866,-121.6396,1469],[46.86885,-121.64087,1480],[46.86929,-121.64266,1497],[46.87009,-121.64458,1515],[46.87006,-121.64533,1519],[46.87018,-121.64555,1520],[46.8701,-121.64672,1524],[46.86996,-121.6469,1525],[46.8701,-121.64743,1529],[46.86974,-121.65163,1565],[46.86949,-121.65178,1569],[46.8699,-121.65374,1585],[46.86965,-121.65392,1586],[46.86948,-121.65383,1589],[46.8695,-121.65396,1591],[46.86985,-121.65507,1603],[46.86951,-121.65766,1631],[46.86874,-121.65976,1659],[46.86805,-121.66075,1683],[46.86788,-121.65898,1708],[46.867,-121.66099,1740],[46.86715,-121.65959,1757],[46.86669,-121.66027,1768],[46.86665,-121.66015,1770],[46.86651,-121.66027,1774],[46.86658,-121.66001,1778],[46.86607,-121.66034,1792],[46.86589,-121.65965,1805],[46.86541,-121.65929,1810],[46.8647,-121.65956,1806],[46.86427,-121.65912,1802],[46.86401,-121.65929,1807],[46.86353,-121.65916,1819],[46.86297,-121.65815,1836],[46.86222,-121.65788,1850],[46.86213,-121.65805,1855],[46.86109,-121.65723,1875],[46.86056,-121.65604,1882],[46.86052,-121.65476,1895],[46.86019,-121.65455,1903],[46.85947,-121.65472,1917],[46.85924,-121.65441,1922],[46.85915,-121.654,1926],[46.85758,-121.65121,1940],[46.85751,-121.65075,1942],[46.85775,-121.65013,1945],[46.85783,-121.64915,1949],[46.85774,-121.64877,1954],[46.85712,-121.64809,1971],[46.85741,-121.64764,1977],[46.85743,-121.64714,1983],[46.85763,-121.64715,1986],[46.8572,-121.6462,2000],[46.85737,-121.64535,2014],[46.85726,-121.64512,2018],[46.85678,-121.64493,2028],[46.8567,-121.64503,2031],[46.85663,-121.64481,2035],[46.85625,-121.64463,2044],[46.85557,-121.64486,2055],[46.85497,-121.64622,2060],[46.85397,-121.64718,2045],[46.85356,-121.64715,2039],[46.85305,-121.64744,2029],[46.85259,-121.6474,2022],[46.85149,-121.64778,2006],[46.85052,-121.64783,1999],[46.84977,-121.64928,1992],[46.84947,-121.6503,1992],[46.84904,-121.65037,1990],[46.84886,-121.65059,1989],[46.84839,-121.65033,1987],[46.8481,-121.65039,1986],[46.84771,-121.65074,1983],[46.84734,-121.65062,1981],[46.84675,-121.6507,1980],[46.84645,-121.65052,1978],[46.84615,-121.65056,1980],[46.84602,-121.65083,1984],[46.84542,-121.65051,1990],[46.84545,-121.6517,2000],[46.84457,-121.65325,1996],[46.84417,-121.65372,1988],[46.84384,-121.65355,1980],[46.84327,-121.65436,1978],[46.84241,-121.65508,1975],[46.84211,-121.65554,1978],[46.84236,-121.65604,1987],[46.84242,-121.65681,1997],[46.84219,-121.6577,2015],[46.84224,-121.65821,2024],[46.84172,-121.65812,2029],[46.84121,-121.6583,2031],[46.83975,-121.65759,2011],[46.83934,-121.65678,2003],[46.83905,-121.65693,1997],[46.83821,-121.65682,1983],[46.83822,-121.65642,1975],[46.83787,-121.65623,1963],[46.83761,-121.65641,1956],[46.83732,-121.6559,1943],[46.837,-121.65585,1936],[46.8362,-121.65425,1906],[46.83594,-121.65402,1895],[46.83425,-121.64986,1807],[46.83406,-121.64986,1800],[46.83401,-121.6496,1796],[46.83389,-121.64963,1792],[46.83381,-121.64928,1787],[46.83366,-121.64942,1781],[46.83345,-121.64841,1765],[46.83301,-121.64773,1748],[46.83296,-121.64792,1744],[46.83287,-121.64777,1739],[46.83271,-121.64789,1732],[46.83244,-121.64666,1714],[46.83226,-121.64686,1707],[46.8322,-121.64671,1703],[46.83186,-121.64662,1690],[46.83168,-121.64611,1681],[46.83127,-121.64566,1667],[46.83024,-121.64488,1639],[46.82989,-121.64485,1630],[46.82911,-121.64427,1606],[46.82883,-121.64387,1595],[46.82855,-121.64376,1589],[46.82807,-121.64273,1574],[46.82809,-121.64154,1568],[46.8278,-121.64045,1562],[46.82724,-121.63926,1558],[46.82677,-121.639,1556],[46.82646,-121.63912,1553],[46.82637,-121.639,1553],[46.8262,-121.63923,1554],[46.82606,-121.63916,1557],[46.82522,-121.63752,1585],[46.82459,-121.63754,1606],[46.82432,-121.63779,1613],[46.82375,-121.63785,1627],[46.82313,-121.63741,1635],[46.82226,-121.63533,1666],[46.82175,-121.63457,1681],[46.82125,-121.63113,1721],[46.8203,-121.63046,1739],[46.81895,-121.63041,1728],[46.8185,-121.62952,1718],[46.81755,-121.62856,1720],[46.81682,-121.62723,1712],[46.81655,-121.62641,1718],[46.81633,-121.62625,1724],[46.81614,-121.62529,1740],[46.81586,-121.62491,1752],[46.81591,-121.6236,1776],[46.81569,-121.62362,1782],[46.81571,-121.62328,1789],[46.81512,-121.62307,1800],[46.81388,-121.62172,1783],[46.81343,-121.62186,1770],[46.81312,-121.62135,1764],[46.81276,-121.62121,1766],[46.81209,-121.62051,1770],[46.81132,-121.62001,1751],[46.81113,-121.6201,1744],[46.81068,-121.61885,1719],[46.81027,-121.61882,1712],[46.80937,-121.61795,1698],[46.80903,-121.61742,1693],[46.80884,-121.6174,1687],[46.80868,-121.61763,1681],[46.80846,-121.61715,1669],[46.80747,-121.61683,1647],[46.80674,-121.61615,1654],[46.8057,-121.61591,1653],[46.80488,-121.61607,1649],[46.80436,-121.61587,1657],[46.80388,-121.61521,1655],[46.80325,-121.61494,1644],[46.80371,-121.6146,1632],[46.80355,-121.61443,1628],[46.8024,-121.61385,1611],[46.80171,-121.61373,1604],[46.80001,-121.61284,1594],[46.79962,-121.61285,1595],[46.79941,-121.61258,1601],[46.79871,-121.61226,1608],[46.79695,-121.61079,1641],[46.79577,-121.60842,1658],[46.79509,-121.60791,1661],[46.79463,-121.60779,1655],[46.79235,-121.60599,1679],[46.79139,-121.60555,1676],[46.79088,-121.60566,1671],[46.7894,-121.60507,1657],[46.78878,-121.60511,1649],[46.78769,-121.60593,1624],[46.78748,-121.60591,1618],[46.78728,-121.60621,1611],[46.78711,-121.60624,1605],[46.7869,-121.60668,1596],[46.78596,-121.60742,1567],[46.78426,-121.60845,1546],[46.78366,-121.60864,1538],[46.78141,-121.60827,1502],[46.78036,-121.6073,1477],[46.78007,-121.60763,1472],[46.77941,-121.60771,1470],[46.7784,-121.60716,1463],[46.77797,-121.60719,1457],[46.77746,-121.60695,1457],[46.77678,-121.60631,1447],[46.77613,-121.6065,1450],[46.77666,-121.60741,1432],[46.77658,-121.60783,1424],[46.77515,-121.60883,1401],[46.77538,-121.6093,1394],[46.77425,-121.61013,1369],[46.7748,-121.61053,1358],[46.77398,-121.61113,1335],[46.77424,-121.61144,1322],[46.77463,-121.61258,1311],[46.77534,-121.61352,1292],[46.77483,-121.61468,1276],[46.77431,-121.61513,1265],[46.7746,-121.61561,1254],[46.77361,-121.61634,1229],[46.77392,-121.61692,1219],[46.77342,-121.61798,1198],[46.77274,-121.61807,1184],[46.77189,-121.61752,1169],[46.77157,-121.61788,1162],[46.77157,-121.61847,1151],[46.77117,-121.61855,1141],[46.77032,-121.61912,1123],[46.77091,-121.61949,1103],[46.77108,-121.61989,1091],[46.77146,-121.62012,1084],[46.77149,-121.62037,1081],[46.77112,-121.62076,1073],[46.77178,-121.62143,1060],[46.77208,-121.62275,1045],[46.77257,-121.62334,1035],[46.7725,-121.62413,1028],[46.77171,-121.62506,1018],[46.77146,-121.62493,1016],[46.77114,-121.62568,1020],[46.77019,-121.62596,1029],[46.76839,-121.62714,1027],[46.76709,-121.62863,1010],[46.76714,-121.62917,1006],[46.76629,-121.63038,986],[46.76628,-121.63084,981],[46.7665,-121.63156,969],[46.76599,-121.63417,937],[46.76627,-121.6349,929],[46.76592,-121.63492,924],[46.76549,-121.63621,922],[46.76612,-121.63655,920],[46.76564,-121.63654,923],[46.76557,-121.6367,936],[46.7651,-121.63648,936],[46.76425,-121.63673,927],[46.76388,-121.63667,923],[46.76295,-121.63616,910],[46.76214,-121.63635,901],[46.76174,-121.63597,893],[46.76147,-121.63601,888],[46.7604,-121.63512,884],[46.75896,-121.63439,891],[46.75834,-121.63425,892],[46.75745,-121.63376,890],[46.75645,-121.63371,878],[46.75685,-121.63472,868],[46.75727,-121.63516,861],[46.75699,-121.63772,838],[46.75664,-121.63865,829],[46.75588,-121.6394,817],[46.75519,-121.63931,809],[46.75436,-121.63976,797],[46.75374,-121.63967,791],[46.7536,-121.63956,786],[46.75348,-121.64007,786],[46.75349,-121.64144,798],[46.75444,-121.64272,808],[46.75451,-121.64365,815],[46.75506,-121.64447,815],[46.75519,-121.64595,824],[46.75577,-121.64812,823],[46.75556,-121.64863,823],[46.75558,-121.65005,826],[46.7558,-121.65066,827],[46.75609,-121.65077,828],[46.75657,-121.65144,830],[46.75668,-121.6537,839],[46.75772,-121.65656,851],[46.75757,-121.65716,852],[46.7578,-121.65732,852],[46.75778,-121.65759,852],[46.75814,-121.65758,853],[46.75844,-121.65816,853],[46.75842,-121.66011,854],[46.75869,-121.66063,856],[46.76767,-121.6897,1052],[46.76783,-121.6936,1098],[46.76777,-121.69385,1100],[46.76759,-121.69392,1101],[46.76799,-121.69465,1110],[46.76773,-121.69444,1118],[46.76772,-121.6946,1122],[46.76795,-121.69599,1143],[46.76829,-121.6963,1148],[46.76875,-121.69752,1167],[46.76928,-121.69833,1181],[46.77063,-121.702,1240],[46.77058,-121.70271,1250],[46.76949,-121.7065,1303],[46.76914,-121.70944,1346],[46.76952,-121.71129,1377],[46.77117,-121.71259,1410],[46.77091,-121.71282,1420],[46.77107,-121.71364,1428],[46.76808,-121.71662,1420],[46.76765,-121.71772,1417],[46.7677,-121.71935,1424],[46.76786,-121.72002,1429],[46.76757,-121.72078,1439],[46.76763,-121.72105,1441],[46.76862,-121.72248,1463],[46.77005,-121.72285,1482],[46.77017,-121.72308,1484],[46.77005,-121.72328,1486],[46.76939,-121.72353,1490],[46.76921,-121.72382,1491],[46.76905,-121.72568,1488],[46.76829,-121.72778,1484],[46.76816,-121.7288,1484],[46.76853,-121.72949,1482],[46.76851,-121.73116,1484],[46.7691,-121.7325,1483],[46.76964,-121.73286,1482],[46.76989,-121.73373,1483],[46.76985,-121.73427,1482],[46.76926,-121.73539,1469],[46.76933,-121.73725,1460],[46.76949,-121.73757,1460],[46.76954,-121.7386,1465],[46.76924,-121.7403,1476],[46.76879,-121.74531,1490],[46.76895,-121.74532,1489],[46.76928,-121.74478,1482],[46.76982,-121.74439,1473],[46.76986,-121.74461,1467],[46.7696,-121.74509,1459],[46.76942,-121.74602,1445],[46.76969,-121.74568,1435],[46.76969,-121.74638,1415],[46.77004,-121.7459,1407],[46.77051,-121.74578,1395],[46.77073,-121.74595,1390],[46.77118,-121.74568,1381],[46.77228,-121.74614,1363],[46.7735,-121.74641,1347],[46.77309,-121.7467,1340],[46.77334,-121.74745,1332],[46.77321,-121.74767,1327],[46.77241,-121.74802,1309],[46.77203,-121.74799,1302],[46.77093,-121.75086,1269],[46.77046,-121.75422,1225],[46.77023,-121.75494,1214],[46.76961,-121.75599,1200],[46.76955,-121.75712,1190],[46.77016,-121.75782,1191],[46.77013,-121.7584,1189],[46.7695,-121.75956,1183],[46.76851,-121.76091,1173],[46.76796,-121.76228,1170],[46.76678,-121.76415,1163],[46.76636,-121.7653,1156],[46.76584,-121.76764,1141],[46.76516,-121.76925,1120],[46.76521,-121.76984,1115],[46.76502,-121.77011,1113],[46.76506,-121.77092,1106],[46.7663,-121.77643,1053],[46.7666,-121.77717,1041],[46.76705,-121.78085,1009],[46.76744,-121.78165,1000],[46.76787,-121.78366,986],[46.76773,-121.7861,983],[46.76718,-121.78776,980],[46.76687,-121.78835,978],[46.76629,-121.78851,973],[46.76577,-121.78927,962],[46.76542,-121.78946,958],[46.7655,-121.78989,958],[46.76657,-121.78992,964],[46.76665,-121.79048,963],[46.76626,-121.79117,968],[46.7654,-121.79178,963],[46.76486,-121.79345,952],[46.76394,-121.79546,947],[46.76181,-121.79882,931],[46.76147,-121.80023,929],[46.76044,-121.80199,923],[46.75977,-121.8025,917],[46.7591,-121.80344,909],[46.75897,-121.80394,906],[46.75775,-121.80513,897],[46.75528,-121.80611,893],[46.75472,-121.8061,888],[46.75326,-121.8072,879],[46.7524,-121.80849,870],[46.75202,-121.80942,864],[46.75205,-121.81054,865],[46.7519,-121.81111,864]];
function loadDefaultRoute(){
 try{
  currentIsDefault=true; placeMode=false; titleAuto=true; subtitleAuto=true;
  rawGpx=DEFAULT_ROUTE_GPX.map(p=>({lat:p[0],lon:p[1],ele:p[2]}));
  gpxBbox=bboxOf(rawGpx); gpxHasEle=true;
  const t=document.getElementById('title'), sub=document.getElementById('subtitle');
  if(t) t.value='Wonderland Trail';
  if(sub) sub.value='Mt Rainier National Park';
  const gn=document.getElementById('gpxName'); if(gn) gn.textContent='Wonderland Trail · '+rawGpx.length.toLocaleString()+' pts · has elevation';
  const fr=frameFromBbox(gpxBbox,FRAME_PAD);
  return loadRouteFrame(fr.centerLat, fr.centerLon, fr.zoom).then(()=>{ hist=[]; histIdx=-1; pushHist(); updateHistUI(); });
 }catch(e){ console.warn('[TOPO] default route load failed:', e.message); }
}

/* ============================================================
   SESSION PERSISTENCE — remember the last poster across refreshes.
   Saved to localStorage; silently no-ops if storage is unavailable
   or over quota. Big uploaded routes are downsampled before saving
   so we never blow the ~5 MB budget. The built-in default is stored
   as a flag, not 1,386 points.
   ============================================================ */
const LS_TOPO='gpxsketch_topo_session_v1';
function routeForSave(){
 if(!rawGpx) return null;
 let pts=rawGpx;
 if(pts.length>2200){ const step=Math.ceil(pts.length/2000); pts=rawGpx.filter((_,i)=>i%step===0);
  if(pts[pts.length-1]!==rawGpx[rawGpx.length-1]) pts.push(rawGpx[rawGpx.length-1]); }
 return pts.map(p=>[+p.lat.toFixed(5),+p.lon.toFixed(5), p.ele==null?null:Math.round(p.ele)]);
}
let saveTimer=null;
function saveSession(){
 try{
  if(!TER) return;
  const d={ v:1, isDefault:currentIsDefault, placeMode, hasEle:gpxHasEle,
   route: currentIsDefault ? null : routeForSave(),
   title:document.getElementById('title').value, subtitle:document.getElementById('subtitle').value,
   titleAuto, subtitleAuto,
   gpxName:document.getElementById('gpxName').textContent,
   lat:TER.lat, lon:TER.lon, zoom:TER.zoom, intervalAuto,
   state:{ themeRef:state.themeRef, mode:state.mode, interval:state.interval, weight:state.weight,
    routeWidth:state.routeWidth, routeZoom:state.routeZoom, showRoute:state.showRoute, showWater:state.showWater, showStats:state.showStats, showCoords:state.showCoords, darkPoster:state.darkPoster,
    bgOverride:state.bgOverride, lineOverride:state.lineOverride, seed:state.seed, typePreset:state.typePreset } };
  localStorage.setItem(LS_TOPO, JSON.stringify(d));
 }catch(e){ /* private mode / quota / disabled — persistence is best-effort */ }
}
function saveSessionSoon(){ clearTimeout(saveTimer); saveTimer=setTimeout(saveSession,500); }
function clearSession(){ try{ localStorage.removeItem(LS_TOPO); }catch(e){} }
function restoreSession(){
 let raw; try{ raw=localStorage.getItem(LS_TOPO); }catch(e){ return false; }
 if(!raw) return false;
 let d; try{ d=JSON.parse(raw); }catch(e){ return false; }
 if(!d || d.v!==1 || d.lat==null) return false;
 try{
  const s=d.state||{};
  if(s.themeRef) state.themeRef=s.themeRef;
  if(s.mode) state.mode=s.mode;
  if(s.interval!=null) state.interval=s.interval;
  if(s.weight!=null) state.weight=s.weight;
  if(s.routeWidth!=null) state.routeWidth=s.routeWidth;
  if(s.routeZoom!=null) state.routeZoom=s.routeZoom;
  if(s.showRoute!=null) state.showRoute=s.showRoute;
  if(s.showWater!=null){ state.showWater=s.showWater; const wt=document.getElementById('showWater'); if(wt) wt.checked=!!s.showWater; }
  if(s.showStats!=null){ state.showStats=s.showStats; const el=document.getElementById('showStats'); if(el) el.checked=!!s.showStats; }
  if(s.showCoords!=null){ state.showCoords=s.showCoords; const el=document.getElementById('showCoords'); if(el) el.checked=!!s.showCoords; }
  if(s.darkPoster!=null) state.darkPoster=s.darkPoster;
  state.bgOverride=s.bgOverride??null; state.lineOverride=s.lineOverride??null;
  if(s.seed!=null) state.seed=s.seed;
  if(s.typePreset) state.typePreset=s.typePreset;
  if(d.intervalAuto!=null) intervalAuto=d.intervalAuto;
  state.preset=themeForMode(state.themeRef, state.darkPoster); state.preset.mode=state.mode;
  document.getElementById('title').value=d.title||'';
  document.getElementById('subtitle').value=d.subtitle||'';
  titleAuto=(d.titleAuto!==false); subtitleAuto=(d.subtitleAuto!==false);
  document.getElementById('interval').value=state.interval; document.getElementById('intervalVal').textContent=state.interval+' ft';
  document.getElementById('weight').value=state.weight; document.getElementById('weightVal').textContent=(+state.weight).toFixed(1);
  { const rwEl=document.getElementById('routeWidth'); if(rwEl){ rwEl.value=state.routeWidth; document.getElementById('routeWidthVal').textContent=(+state.routeWidth).toFixed(1); } }
  { const rzEl=document.getElementById('routeZoom'); if(rzEl){ rzEl.value=state.routeZoom; document.getElementById('routeZoomVal').textContent=Math.round((+state.routeZoom)*100)+'%'; } }
  if(typeof syncRoutePresets==='function') syncRoutePresets();
  syncMode(); buildColorsUI(); syncPosterMode(); if(typeof markSelectedTheme==='function') markSelectedTheme(); if(typeof markTypePreset==='function') markTypePreset();
  if(d.placeMode){
   /* Place/Explore session: a searched location with no route. Restore the
      frame and re-fetch terrain; there's no GPX to rebuild. */
   placeMode=true; currentIsDefault=false; rawGpx=null; gpxBbox=null; gpxHasEle=false;
   const gn=document.getElementById('gpxName'); if(gn && d.gpxName) gn.textContent=d.gpxName;
   loadRouteFrame(d.lat, d.lon, d.zoom).then(()=>{ hist=[]; histIdx=-1; pushHist(); updateHistUI(); });
   return true;
  }
  placeMode=false;
  if(d.isDefault || !d.route || d.route.length<2){
   currentIsDefault=true; rawGpx=DEFAULT_ROUTE_GPX.map(p=>({lat:p[0],lon:p[1],ele:p[2]})); gpxHasEle=true;
  } else {
   currentIsDefault=false; rawGpx=d.route.map(p=>({lat:p[0],lon:p[1],ele:p[2]})); gpxHasEle=!!d.hasEle;
  }
  gpxBbox=bboxOf(rawGpx);
  const gn=document.getElementById('gpxName'); if(gn && d.gpxName) gn.textContent=d.gpxName;
  loadRouteFrame(d.lat, d.lon, d.zoom).then(()=>{ hist=[]; histIdx=-1; pushHist(); updateHistUI(); });
  return true;
 }catch(e){ console.warn('[TOPO] restore failed:', e.message); return false; }
}
function resetToDefault(){
 clearSession();
 placeMode=false;
 { const ps=document.getElementById('placeSearch'); if(ps) ps.value=''; const pn=document.getElementById('placeNote'); if(pn) pn.textContent=''; if(typeof clearPlaceResults==='function') clearPlaceResults(); }
 state.themeRef={type:'sig',key:'relief'}; state.mode=SIGNATURE[0].mode;
 state.interval=200; state.weight=1.0; state.routeWidth=3.4; state.routeZoom=0.35; state.showRoute=true;
 state.showWater=false; featData=null; { const wt=document.getElementById('showWater'); if(wt) wt.checked=false; const fn=document.getElementById('featNote'); if(fn) fn.textContent=''; }
 state.showStats=true; state.showCoords=true; { const a=document.getElementById('showStats'); if(a) a.checked=true; const b=document.getElementById('showCoords'); if(b) b.checked=true; }
 state.bgOverride=null; state.lineOverride=null; state.seed=7; intervalAuto=true; state.typePreset='modern';
 state.darkPoster=naturalDarkFor(state.themeRef);
 state.preset=themeForMode(state.themeRef, state.darkPoster); state.preset.mode=state.mode;
 document.getElementById('interval').value=200; document.getElementById('intervalVal').textContent='200 ft';
 document.getElementById('weight').value=1.0; document.getElementById('weightVal').textContent='1.0';
 { const rwEl=document.getElementById('routeWidth'); if(rwEl){ rwEl.value=3.4; document.getElementById('routeWidthVal').textContent='3.4'; } }
 { const rzEl=document.getElementById('routeZoom'); if(rzEl){ rzEl.value=0.35; document.getElementById('routeZoomVal').textContent='35%'; } }
 if(typeof syncRoutePresets==='function') syncRoutePresets();
 syncMode(); buildColorsUI(); syncPosterMode(); if(typeof markSelectedTheme==='function') markSelectedTheme(); if(typeof markTypePreset==='function') markTypePreset();
 loadDefaultRoute();
 msg('ok','Reset to the default map.');
}
{ const rb=document.getElementById('resetDefault'); if(rb) rb.onclick=resetToDefault; }

rebuildSynthetic(); buildThemeUI(); buildTypeUI();
/* Build the opening theme through the same path as every other theme change, so
   bg/line and the Light/Dark toggle are correct from the very first frame. */
state.darkPoster = naturalDarkFor(state.themeRef);
state.preset = themeForMode(state.themeRef, state.darkPoster);
state.preset.mode = state.mode;
syncMode(); buildColorsUI(); syncPosterMode();
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(render);
render(); pushHist(); updateHistUI();
/* Restore the last session if one was saved; otherwise open on the Wonderland default. */
if(!restoreSession()) loadDefaultRoute();
})();
