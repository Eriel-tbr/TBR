'use strict';
/* Mi TBR — adaptador entre el motor de dibujo (art-engine.js) y la app:
   temas de mueble, paletas, estilos de lomo, series y colores de portada. */

Object.assign(FONT, {
  serif:"'Cormorant Garamond','GFS Baskerville',Georgia,serif",
  pag:"'Lora','TeX Gyre Pagella',Georgia,serif",
  script:"'Parisienne','TeX Gyre Chorus',cursive",
  deco:"'Josefin Sans','TeX Gyre Adventor',sans-serif",
  sans:"'Karla','Inter',system-ui,sans-serif",
  pop:"'Poppins','Inter',system-ui,sans-serif"
});
const APP_FONTS = ["700 20px 'Cormorant Garamond'", "600 20px 'Lora'", "700 20px 'Lora'", "400 20px 'Parisienne'", "700 20px 'Josefin Sans'", "600 20px 'Josefin Sans'", "700 20px 'Poppins'", "600 20px 'Poppins'", "700 20px 'Cinzel'", "600 20px 'Cinzel'", "700 20px 'Dancing Script'"];
function loadAppFonts(){ if(!document.fonts || !document.fonts.load) return Promise.resolve(); return Promise.all(APP_FONTS.map(f => document.fonts.load(f).catch(() => {}))).then(() => {}); }

/* ---------- Colores auxiliares ---------- */
function hexHsl(hex){ const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if(mx !== mn){ const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s, l]; }
const hslToHex = (h, s, l) => hslHex(h, s * 100, l * 100);
const isHex = c => /^#[0-9a-f]{6}$/i.test(c || '');
/* Contraste WCAG entre dos colores (1 a 21): para que el título del lomo siempre se lea */
function relLum(hex){ const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0); }
function contrast(a, b){ const x = relLum(a), y = relLum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
function legibleOn(col, bg, min = 2.6){
  if(contrast(col, bg) >= min) return col;
  const dark = relLum(bg) < .35, alt = dark ? lighten(col, .65) : darken(col, .65);
  return contrast(alt, bg) >= min ? alt : dark ? '#fbf6ec' : '#1d1720';
}

/* ---------- Temas de mueble ---------- */
const DECO_NAMES = { vidriera:'Vidriera', linterna:'Farol', buho:'Búho', caldero:'Caldero', lavanda:'Lavanda', libroab:'Libro abierto', vela:'Vela', calavera:'Calavera', pocion:'Poción',
  huevo:'Huevo de dragón', libros:'Libros apilados', planta:'Planta', flores:'Flores', taza:'Taza', marco:'Cuadro', cristal:'Cristales', globo:'Globo terráqueo', planeta:'Planeta',
  cohete:'Cohete', matraz:'Matraz', mano:'Mano robótica', holoplaneta:'Planeta holográfico', holocubo:'Cubo holográfico', adn:'ADN holográfico', satelite:'Satélite', robot:'Robot',
  lupa:'Lupa', expediente:'Expediente' };
const THEMES = {
  gotico:{ cls:'t-got', name:'Gótico', P:26, mullion:true, overCrown:true, motif:'leaf', crown:n => crownGothic2(n), colors:C => C.fan,
    styles:['grimorio','vidriera','daga','marco','escamas','filigrana','jaspeado','celestial','bosque'],
    decor:['vidriera','linterna','buho','caldero','lavanda','libroab','vela','calavera','pocion','huevo','libros'],
    range:{ s:[.15,.65], l:[.1,.4] },
    pal:[['#5b1f2b','#d9b25f','#2a0c12'],['#1f4a3c','#d9b25f','#8fb36a'],['#2d3a5e','#c9d4ea','#7a9ab8'],['#3a2418','#d9b25f','#2a8a6a'],['#2b1b35','#d6b8ff','#9a6aea'],
      ['#14404a','#f0d28a','#5fb8b0'],['#6b4a1f','#f0d28a','#c86a3a'],['#3b0f16','#e8c877','#a8452f'],['#1b2a5e','#fbeed0','#c25a7a'],['#4a3a2a','#e8c877','#7a2a3a']] },
  rococo:{ cls:'t-roc', name:'Rococó', P:24, corners:true, motif:'rose', crown:n => crownRococo2(n), colors:C => C.rom,
    styles:['romantico','floral','filigrana','marco','degradado','holo','escamas'],
    decor:['flores','taza','marco','cristal','vela','libros','planta'], range:{ s:[.2,.8], l:[.2,.85] },
    pal:[['#7a2342','#f0d28a','#e08aa8'],['#f0c4ca','#8a2a48','#d9647f'],['#5a2a6e','#f0d28a','#b89ac8'],['#e8a9b3','#7a1f3a','#c9566f'],['#1f4a4a','#f0d28a','#8ac8b8'],
      ['#a8325b','#fbe8c0','#f0a0b8'],['#3a2a5e','#d9c6f0','#c9a2e6'],['#b8606f','#f3d9a4','#fff0f4'],['#2e3a72','#f6e7c4','#d9647f']] },
  chip:{ cls:'t-chip c-b', name:'Chip holográfico', P:22, motif:'star', crown:n => crownChip(n, { c1:'#c45cff', c2:'#ff2fb8', c3:'#ffd400' }), colors:C => C.cyb,
    styles:['holo','celestial','degradado','escamas','marco','daga'], decor:['mano','holoplaneta','holocubo','adn','planeta','cohete','matraz','robot','satelite'], range:{ s:[.6,1], l:[.35,.75] },
    pal:[['#c45cff','#ffd400','#ff2fb8'],['#7a3cff','#ffe066','#ff5fa8'],['#ff2fb8','#ffd400','#c45cff'],['#5a2aa0','#7ae0ff','#ff2fb8'],['#c45cff','#7ae0ff','#ffd400']] },
  academia:{ cls:'t-aca', name:'Dark academia', P:24, motif:'key', crown:n => crownAcademia(n), colors:C => C.aca,
    styles:['jaspeado','tela','grimorio','bosque','marco','mapa','filigrana'], decor:['globo','vela','libros','libroab','marco','planta','buho'], range:{ s:[.1,.55], l:[.08,.35] },
    pal:[['#4a1a1a','#d9b25f','#2a0c0c'],['#1f3a4a','#d9b25f','#7a9ab8'],['#2a3a2f','#e9dcc0','#6a8a5a'],['#3a2a1a','#d9b25f','#7a2a2a'],['#5b1f2b','#e8c877','#2a3a2f']] },
  moderno:{ cls:'t-con', name:'Moderno', P:16, motif:'leaf', crown:n => crownModern(n), colors:C => C.con,
    styles:['tela','degradado','holo','floral','marco','mapa'], decor:['planta','taza','lupa','marco','libros','expediente','flores'], range:{ s:[0,.6], l:[.35,.9] },
    pal:[['#d9764a','#22201d','#f1e6d8'],['#6a8a7a','#22201d','#d9764a'],['#e6c46a','#22201d','#6a8a7a'],['#9ab8d8','#22201d','#e08aa0'],['#22201d','#f1e6d8','#d9764a']] },
  romance:{ cls:'t-rmc', name:'Romance', P:20, motif:'rose', crown:n => crownRomance(n), colors:C => C.rmc,
    styles:['romantico','floral','holo','degradado','marco','tela'], decor:['flores','vela','taza','marco','cristal','planta'], range:{ s:[.25,.85], l:[.35,.88] },
    pal:[['#e07a95','#fff2dc','#a83a5a'],['#f4c6d0','#7a2a3a','#e0526f'],['#b84a6a','#ffe0a8','#fff0e6'],['#f0b48a','#7a2a3a','#e0526f'],['#9ab8d8','#4a2a5a','#e0a0c0']] },
  generico:{ cls:'t-gen', name:'Clásico', P:22, motif:'diamond', crown:null, colors:null,
    styles:['marco','tela','jaspeado','grimorio','bosque','filigrana'], decor:['libros','planta','vela','taza','globo','marco'], range:{ s:[.1,.7], l:[.1,.5] }, pal:null }
};
const PRESET_THEME = { fantasia:'gotico', romantasy:'rococo', cienciaficcion:'chip', darkacademia:'academia', contemporanea:'moderno', romance:'romance' };
const DECO_C = {
  fan:{ cream:'#efe4c8', metal:'#c8a04e', glow:'#ffbb55', foil:'#d9b25f', b1:'#6b1f2d', b2:'#1f4a3c', b3:'#2d3a5e', pot:'#7a4a36', potTrim:'#d9b25f', liq:'#7cd6a6', egg:'#2f6b5a', cup:'#e9e0c8', trim:'#d9b25f', vase:'#7a4a36', f1:'#b58aff', f2:'#d6b8ff', f3:'#9a6aea', frame:'#c8a04e', art1:'#e9dcc0', art2:'#e0a04a', art3:'#5a3a5a', cr:'#9a6aea', pl:'#c86a3a', ring:'#e9dcc0', nose:'#c8a04e' },
  rom:{ cream:'#fbf2ea', metal:'#e0b85a', glow:'#ffd9a0', foil:'#e0b85a', b1:'#9a2f4f', b2:'#d98aa0', b3:'#f0d9c4', pot:'#f4e6dc', potTrim:'#e0b85a', vase:'#f5ebe4', f1:'#d9647f', f2:'#f6d2dc', f3:'#e6b95e', cup:'#fbf3ee', trim:'#d98aa0', frame:'#d9b25f', art1:'#f3d9d4', art2:'#e9a36a', art3:'#b5546b', cr:'#d98aa8', liq:'#e08aa8', egg:'#d98aa0', pl:'#e9a36a', ring:'#f6d2dc', nose:'#d98aa0' },
  cyb:{ liq:'#ff2fb8', pl:'#c45cff', ring:'#ffd400', nose:'#ff2fb8', b1:'#2a1a4a', b2:'#3b0f4a', b3:'#1a1030', foil:'#ffd400', cream:'#e9e0ff', metal:'#9aa1ad', glow:'#c45cff',
    potTrim:'#7ae0ff', pot:'#2a1a4a', egg:'#7a3cff', cup:'#e9e0ff', trim:'#ff2fb8', vase:'#2a1a4a', f1:'#ff2fb8', f2:'#e9b8ff', f3:'#7ae0ff', frame:'#9aa1ad', art1:'#1a1030', art2:'#c45cff', art3:'#7ae0ff', cr:'#7ae0ff' },
  aca:{ cream:'#efe4c8', metal:'#c8a04e', glow:'#ffbb55', foil:'#d9b25f', b1:'#5b1f2b', b2:'#1f3a4a', b3:'#4a3a1f', cup:'#e9e0c8', trim:'#8a3a2a', frame:'#7a5a2a', art1:'#e9dcc0', art2:'#c8a04e', art3:'#3a5a4a', pot:'#2f4a3a', potTrim:'#d9b25f', vase:'#e9dcc0', f1:'#c86a6a', f2:'#e9dcc0', f3:'#d9b25f', cr:'#7a9ab8', liq:'#7cd6a6', egg:'#2f4a3a', pl:'#c8a04e', ring:'#e9dcc0', nose:'#8a3a2a' },
  con:{ cup:'#f0ece4', trim:'#22201d', frame:'#22201d', art1:'#f1e6d8', art2:'#d9764a', art3:'#6a8a7a', pot:'#e6e1d8', potTrim:'#bdb6a8', cream:'#f4efe6', metal:'#9a9488', glow:'#ffe2a0', b1:'#d9764a', b2:'#6a8a7a', b3:'#22201d', foil:'#9a9488', vase:'#f0ece4', f1:'#d9764a', f2:'#f1e6d8', f3:'#e6c46a', cr:'#9ab8d8', liq:'#6a8a7a', pl:'#d9764a', ring:'#22201d', nose:'#d9764a', egg:'#6a8a7a' }
};
DECO_C.rmc = { ...DECO_C.rom, f1:'#e0526f', f2:'#fbd0dc', cream:'#fff0f2' };
function themeKey(u){ return PRESET_THEME[u.preset] || 'generico'; }
function themeOf(u){
  const k = themeKey(u), t = THEMES[k];
  // Se parte de la paleta de fantasía para que ningún objeto se quede sin algún color (si falta uno, el dibujo falla y la ventana deja de responder)
  if(k !== 'generico') return { key:k, ...t, decoC:{ ...DECO_C.fan, ...t.colors(DECO_C) } };
  const st = unitStyle(u), d = st.d;
  const pal = st.spines.map((c, i) => [c, i % 2 ? d[1] : d[2], st.acc]);
  const decoC = { cream:d[1], metal:d[2], glow:'#ffcf80', foil:d[2], b1:st.spines[0], b2:st.spines[1], b3:st.spines[2], pot:d[0], potTrim:d[2], liq:st.acc, egg:st.spines[1], cup:d[1], trim:d[2], vase:d[1],
    f1:st.acc, f2:d[1], f3:d[2], frame:d[2], art1:d[1], art2:d[2], art3:st.spines[0], cr:st.acc, pl:st.acc, ring:d[1], nose:st.acc };
  return { key:k, ...t, pal, decoC, wood:st.wood, acc:st.acc, panel:st.panel, plank:st.plank, light:!!st.light };
}
function themeDecor(u, th){
  const own = (u.decor || []).filter(k => DECO[k] && DECO_NAMES[k]);
  return own.length ? own : th.decor.filter(k => DECO[k]);
}

/* ---------- Estilos de lomo (los diseños están en disenos.js) ---------- */
const SPINE_STYLES = Object.fromEntries(SPINE_ORDER.map(k => [k, SPINES[k].name]));
const SAGA_SCENES = { castle:'Castillo', sea:'Mar', dragon:'Dragón', forest:'Bosque' };
function adjustToTheme(hex, th){
  if(!isHex(hex) || !th.range) return hex; const [h, s, l] = hexHsl(hex);
  return hslToHex(h, clamp(s, th.range.s[0], th.range.s[1]), clamp(l, th.range.l[0], th.range.l[1]));
}
function spineDims(b, seed){
  const p = +b.pages || 0;
  const w = clamp(Math.round(22 + (p ? Math.min(p, 1100) / 32 : 10) + seed % 4), 26, 52);
  const h = clamp(Math.round(134 + (seed >>> 3) % 20 + Math.min(p / 60, 10)), 132, 164);
  return { w, h };
}
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
/* Partes de cada diseño: [campo, nombre]. Cada una se pinta de un color (sp.parts[campo]); las letras van aparte (sp.ink) */
const SPINE_PARTS = { ...Object.fromEntries(Object.keys(SPINES).map(k => [k, SPINES[k].parts])),
  saga:[['base', 'Cielo arriba'], ['accent', 'Cielo medio'], ['sky2', 'Horizonte'], ['moon', 'Luna'], ['sil', 'Silueta'], ['sil2', 'Silueta lejana']] };
const applyParts = (spec, style, parts) => { (SPINE_PARTS[style] || []).forEach(([f]) => { if(parts && isHex(parts[f])) spec[f] = parts[f]; }); return spec; };
const partsOf = (spec, style) => (SPINE_PARTS[style] || []).map(([f, l]) => [f, l, isHex(spec[f]) ? spec[f] : '']);
/* Colores base de un lomo (fondo, metal, acento): los elegidos a mano; si no, los de su portada (ajustados a la estantería); si no, la paleta de la estantería */
function autoPal(b, th){
  const sp = b.spine || {}, seed = hash(b.id + (b.title || '')), tp = th.pal[(seed >>> 5) % th.pal.length];
  if(isHex(sp.base)){ const p = [sp.base, isHex(sp.foil) ? sp.foil : tp[1], isHex(sp.accent) ? sp.accent : tp[2]]; return sp.adjust !== false ? [adjustToTheme(p[0], th), p[1], p[2]] : p; }
  const cp = b.coverPal && b.coverPal[0];
  if(cp && isHex(cp[0])) return [adjustToTheme(cp[0], th), cp[1], cp[2]];
  return tp;
}
const autoStyle = (th, seed) => th.styles[seed % th.styles.length];
/* Devuelve el lomo dibujado. ctx: { series:{ mode, idx, total, n, off, totalW, seed, scene, leader, style } }
   → { w, h, style, pal, parts:[[campo, nombre, color]], ink, html } */
function spineArt(b, u, th, ctx = {}){
  const seed = hash(b.id + (b.title || '')), sp = b.spine || {}, ser = ctx.series;
  let { w, h } = spineDims(b, seed);
  let style = styleKey(sp.style) || autoStyle(th, seed), pal = autoPal(b, th), num = '', phase = null;
  if(ser){
    h = 156; const L = ser.leader, lsp = L.spine || {}, lseed = hash(L.id + (L.title || ''));
    const lpi = (lseed >>> 5) % th.pal.length, lpal = autoPal(L, th);
    // Estilo común de la serie: el elegido para la serie (seriesStyle.style); si no, el del primer tomo
    const lstyle = styleKey(ser.style) || styleKey(lsp.style) || autoStyle(th, lseed);
    num = ser.total <= 3 && ser.n <= 10 ? ROMAN[ser.n - 1] : String(ser.n);
    const own = isHex(sp.base); // colores elegidos a mano en este tomo: se respetan aunque la serie comparta diseño
    if(ser.mode === 'iguales'){ style = lstyle; if(!own) pal = lpal; }
    else if(ser.mode === 'colores'){ style = lstyle; if(!own) pal = th.pal[(lpi + ser.idx) % th.pal.length]; }
    // Fases de la luna: de creciente fina a llena, repartidas entre los tomos
    else if(ser.mode === 'luna'){ style = 'luna'; if(!own) pal = lpal; phase = ser.total > 1 ? .2 + .8 * (ser.n - 1) / (ser.total - 1) : 1; }
    else if(ser.mode === 'paisaje') style = 'saga';
    if(style === 'saga'){ if(!own) pal = lpal; return sagaArt(b, sp, ser, pal, w, h, num); }
  }
  const D = SPINES[style], own = sp.parts || {}, c = D.colors(pal);
  D.parts.forEach(([k]) => { if(isHex(own[k])) c[k] = own[k]; });
  const r = drawSpine(style, { w, h, title:b.title || 'Sin título', author:b.author || '', num, seed, phase, motif:th.motif }, c, sp.ink);
  return { w, h, style, pal, parts:D.parts.map(([k, l]) => [k, l, c[k]]), ink:r.ink, html:r.html };
}
/* Modo de serie «Paisaje continuo»: castillo, mar o dragón repartidos entre los tomos */
function sagaArt(b, sp, ser, [B, F, A], w, h, num){
  const sc = ser.scene || ['castle', 'sea', 'dragon', 'forest'][ser.seed % 4];
  const spec = applyParts({ saga:sc, base:darken(B, lum(B) > .45 ? .62 : .35), accent:vivid(mix(B, A, .6), .42), sky2:vivid(mix(A, F, .35), .72), moon:mix(lighten(F, .6), '#fff3c8', .5), sil:darken(B, .82), sil2:darken(vivid(mix(B, A, .5), .4), .3), foil:lum(F) > .6 ? F : lighten(F, .7),
    font:'pag', max:12, cont:{ off:ser.off, total:ser.totalW, seed:ser.seed } }, 'saga', sp.parts);
  spec.titleInk = isHex(sp.ink) ? sp.ink : bestInk(spec.foil, [spec.base]); spec.numInk = bestInk(spec.moon, [spec.sil]);
  return { w, h, style:'saga', pal:[B, F, A], parts:SPINE_PARTS.saga.map(([k, l]) => [k, l, spec[k]]), ink:spec.titleInk, html:sagaSpine({ w, h, title:b.title || 'Sin título', num, ...spec }) };
}

/* ---------- Series ---------- */
const serKey = b => b.series && b.series.name ? norm(b.series.name) : '';
function seriesMembers(state, key){ return state.books.filter(x => serKey(x) === key); }
function seriesTotal(state, b){
  const k = serKey(b); if(!k) return 0; const m = seriesMembers(state, k);
  return Math.max(+b.series.total || 0, ...m.map(x => +x.series.total || 0), ...m.map(x => +x.series.n || 0), m.length);
}
function seriesKind(state, b){ const t = seriesTotal(state, b); return !t ? 'ind' : t <= 3 ? 'bitri' : 'saga'; }
function seriesMode(state, key, total){
  const s = (state.seriesStyle || {})[key] || {};
  return { mode:s.mode && s.mode !== 'auto' ? s.mode : (total >= 4 ? 'paisaje' : 'iguales'), scene:s.scene || '', style:s.style || '' };
}
/* Detecta serie en el título: «Título (Serie, #2)», «Serie 2», «Libro 2»… */
function parseSeries(title){
  const t = String(title || '');
  let m = t.match(/\(([^()#]+?),?\s*#\s*(\d+)\)/); if(m) return { name:m[1].trim(), n:+m[2] };
  m = t.match(/\(([^()]+?)\s*[,:]\s*(?:libro|book|vol\.?|volumen|tomo)\s*(\d+)\)/i); if(m) return { name:m[1].trim(), n:+m[2] };
  return null;
}

/* ---------- Disposición en filas (con parteluz opcional) ---------- */
/* Reparte los elementos de una balda en filas. Cada uno puede llevar una posición propia (colocada a mano al arrastrar):
   at = dónde empieza, en fracción del ancho de la fila (deja espacio libre delante); nl = empieza en una fila nueva.
   Si lo de antes ya pasa de ese punto, va detrás; si no cabe en la fila, baja a la siguiente (en el mismo punto). */
function packRows(items, W, mullion){
  const rows = []; let cur = [], x = 0; const mid = W / 2, gap = 18;
  const push = () => { rows.push(cur); cur = []; x = 0; };
  const room = to => { if(to > x + .5){ cur.push({ spacer:Math.round(to - x), room:true }); x = to; } };
  for(let it of items){
    if(it.nl && cur.length) push();
    const tx = it.at !== undefined && it.at !== null ? Math.min(clamp(+it.at, 0, 1) * W, Math.max(0, W - it.w)) : null;
    if(tx !== null) room(tx);
    if(x + it.w > W && cur.length){ push(); if(tx !== null) room(tx); }
    if(mullion && x < mid + gap / 2 && x + it.w > mid - gap / 2){
      const sp = mid + gap / 2 - x; if(x + sp + it.w > W && cur.length){ push(); if(tx !== null) room(tx); }
      else { cur.push({ spacer:sp }); x += sp; }
    }
    cur.push(it); x += it.w;
  }
  if(cur.length || !rows.length) rows.push(cur);
  return rows;
}

/* ---------- Mueble completo ---------- */
function scaleCrown(html){
  // Los rótulos del remate están medidos para 358px: se escalan con el ancho real.
  return html.replace(/class="plaq" style="([^"]*)"/g, (m, st) => `class="plaq" style="${st.replace(/(-?\d+(?:\.\d+)?)px/g, (q, n) => `calc(${n} * var(--k))`).replace(/'GFS Baskerville',serif/g, "'Cinzel','GFS Baskerville',serif")}"`);
}
function genericCrown(name, th){
  const id = 'g' + hash(name + th.wood).toString(36), w1 = lighten(th.wood, .25), w3 = darken(th.wood, .45), ac = th.acc;
  const defs = `${G.lin(id + 'w', [[0, w1], [.5, th.wood], [1, w3]], 0, 1)}${G.lin(id + 'a', [[0, lighten(ac, .4)], [.5, ac], [1, darken(ac, .4)]], 0, 1)}`;
  const path = 'M0 110V54Q0 46 8 46H24A155 56 0 0 1 334 46H350Q358 46 358 54V110Z';
  const inner = `<path d="${path}" fill="url(#${id}w)" stroke="${darken(th.wood, .7)}" stroke-width="1.200"/><path d="M6 110V56Q6 52 11 52H30A149 50 0 0 1 328 52H347Q352 52 352 56V110" fill="none" stroke="url(#${id}a)" stroke-width="1.800"/>
   <path d="M168 6h22l5 16h-32z" fill="url(#${id}a)"/><rect x="104" y="68" width="150" height="30" rx="3" fill="${darken(th.wood, .5)}" stroke="url(#${id}a)" stroke-width="1.200"/>
   <g fill="none" stroke="url(#${id}a)" stroke-width="1"><path d="M40 84c10-10 22-6 28 0-8 4-18 8-28 0zM318 84c-10-10-22-6-28 0 8 4 18 8 28 0z"/></g>`;
  return `<div class="crownw">${sv(110, inner, defs)}<div class="plaq" style="top:77px;color:${lighten(ac, .35)};font:600 12px 'Cinzel',serif;letter-spacing:.2em;text-transform:uppercase">${esc(name)}</div></div>`;
}
function cabinetStyleVars(th){
  if(th.key !== 'generico') return '';
  const w = th.wood;
  return `--w1:${lighten(w, .25)};--w2:${w};--w3:${darken(w, .45)};--back:${th.panel};--trimline:${th.acc}88;--labelbg:${th.acc};--labeltxt:${textOn(th.acc)};--sh:${th.light ? .2 : .4}`;
}
/* Todos los remates ocupan la misma altura (CROWN_Z, en unidades de 358 de ancho), sin huecos vacíos debajo:
   - los que miden eso (academia, clásico) tal cual; los bajos (moderno, romance) están dibujados a esa altura;
   - rococó y chip, algo más altos, se comprimen un poco en vertical;
   - el gótico no se comprime: sus dos arcos bajan por encima de la primera balda y por ellos asoma la parte alta de los tomos
     (arcos huecos y sin toques: los libros de debajo se pueden tocar). */
const CROWN_Z = 110;
const crownH = html => +((/viewBox="0 0 358 (\d+(?:\.\d+)?)"/.exec(html) || [])[1] || CROWN_Z);
function crownHtml(u, th){
  let html = th.key === 'generico' ? genericCrown(u.name, th) : th.crown(esc(u.name)); const h = crownH(html);
  // El rótulo abre el editor de la estantería: zona táctil del alto del remate
  const hit = `<button class="crown-hit" type="button" data-act="editUnit" data-unit="${u.id}" aria-label="Editar la estantería ${esc(u.name)}" style="height:calc(${CROWN_Z} * 100cqw / 358)"></button>`;
  if(th.overCrown && h > CROWN_Z){
    html = html.replace('<div class="crownw">', `<div class="crownw over" style="margin-bottom:calc(${CROWN_Z - h} * 100cqw / 358)">`);
    return scaleCrown(html).replace(/<\/div>$/, hit + '</div>');
  }
  if(h > CROWN_Z){ const f = CROWN_Z / h;
    html = html.replace('<svg class="crown"', `<svg class="crown" preserveAspectRatio="none" style="aspect-ratio:358/${CROWN_Z}"`)
      .replace(/(class="plaq" style="top:)(\d+(?:\.\d+)?)px/g, (m, a, n) => a + (Math.round(n * f * 10) / 10) + 'px'); }
  return scaleCrown(html).replace(/<\/div>$/, hit + '</div>');
}
const crownHead = () => '';

/* ---------- Colores desde la portada ---------- */
/* Las portadas de otras webs no dejan leer sus colores: se piden a través de /api/portada (Vercel) */
function coverPalette(src){
  if(!src || /^data:/.test(src) || src.startsWith(location.origin) || typeof API_BASE === 'undefined') return coverPaletteRaw(src);
  return coverPaletteRaw(API_BASE + 'api/portada?u=' + encodeURIComponent(src)).then(p => p || coverPaletteRaw(src));
}
function coverPaletteRaw(src){
  return new Promise(res => {
    if(!src) return res(null);
    const im = new Image(); let done = false; const fin = v => { if(!done){ done = true; res(v); } };
    if(!/^data:/.test(src)) im.crossOrigin = 'anonymous';
    im.referrerPolicy = 'no-referrer';
    im.onload = () => {
      try{
        const W = 36, H = 54, c = document.createElement('canvas'); c.width = W; c.height = H;
        const x = c.getContext('2d'); x.drawImage(im, 0, 0, W, H); const d = x.getImageData(0, 0, W, H).data;
        const bins = new Map();
        for(let i = 0; i < d.length; i += 4){ const k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4); const e = bins.get(k) || [0, 0, 0, 0]; e[0] += d[i]; e[1] += d[i + 1]; e[2] += d[i + 2]; e[3]++; bins.set(k, e); }
        const cols = [...bins.values()].sort((a, b) => b[3] - a[3]).map(e => '#' + [e[0], e[1], e[2]].map(v => Math.round(v / e[3]).toString(16).padStart(2, '0')).join(''));
        const dist = (a, b) => { const p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16); return Math.hypot((p >> 16) - (q >> 16), (p >> 8 & 255) - (q >> 8 & 255), (p & 255) - (q & 255)); };
        const pick = []; for(const c2 of cols){ if(pick.every(p => dist(p, c2) > 48)) pick.push(c2); if(pick.length >= 7) break; }
        if(pick.length < 2) return fin(null);
        const sat = c2 => hexHsl(c2)[1];
        const dark = pick.filter(c2 => lum(c2) < .5), light = pick.filter(c2 => lum(c2) >= .5).sort((a, b) => sat(b) - sat(a));
        const bases = dark.length ? dark : [darken(pick[0], .45)], foils = light.length ? light : [lighten(pick[0], .6)];
        const accs = [...pick].sort((a, b) => sat(b) - sat(a));
        const out = [];
        for(let i = 0; i < 3; i++){ const B = bases[i % bases.length], F = foils[i % foils.length], A = accs.find(a => a !== B && a !== F && !out.some(t => t[2] === a)) || accs[i % accs.length]; if(!out.some(t => t[0] === B && t[1] === F)) out.push([B, F, A]); }
        fin(out);
      }catch(e){ fin(null); }
    };
    im.onerror = () => fin(null); setTimeout(() => fin(null), 9000); im.src = src;
  });
}
