'use strict';
/* Mi TBR — aplicación */
const KEY = 'tbr.v1';
const SORTS = { manual:'Manual', added:'Fecha añadido', pub:'Publicación', author:'Autor', title:'Título', pages:'Páginas' };
const SORT_DIR = { added:['Más antiguos primero','Más recientes primero'], pub:['Más antiguos primero','Más recientes primero'], author:['A → Z','Z → A'], title:['A → Z','Z → A'], pages:['Menos páginas primero','Más páginas primero'] };
const STATUS = { pendiente:'Pendiente', leyendo:'Leyendo', leido:'Leído' };
const FORMATS = [['blanda','Tapa blanda'],['dura','Tapa dura'],['especial','Edición especial'],['audio','Audiolibro'],['ebook','Ebook']];
const WOODS = ['#3a2417','#5a3e2b','#7c6246','#c9a97f','#d8b697','#e2c4a6','#2a3441','#1d1b1c','#6a2a3a','#2f4a3a'];
const ICON = {
  x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  dice:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="15" r="1.1"/><circle cx="15" cy="9" r="1.1"/><circle cx="9" cy="15" r="1.1"/></svg>',
  gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/></svg>',
  dots:'<svg viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  star:'<svg viewBox="0 0 24 24"><path d="M12 2.8l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 17l-5.8 3.3 1.4-6.4L2.7 9.5l6.5-.7z"/></svg>',
  left:'<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  right:'<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>'
};

/* ---------- Estado ---------- */
const mkShelf = name => ({ id:uid(), name, sort:'added', dir:'asc', order:[] });
function defaultState(){
  const U = (name, preset, shelves) => ({ id:uid(), name, tipo:'', preset, shelves:shelves.map(mkShelf) });
  const units = [U('Fantasía', 'fantasia', ['Épica', 'Gótica', 'Paranormal', 'Cozy']), U('Romantasy', 'romantasy', ['Fae', 'Dragones', 'Otras']),
    U('Ciencia ficción', 'cienciaficcion', ['Space opera', 'Distopía']), U('Dark academia', 'darkacademia', ['General']),
    U('Contemporánea', 'contemporanea', ['General']), U('Romance', 'romance', ['General'])];
  const s = { v:1, settings:{ theme:'auto', decor:true }, units, books:[], seriesStyle:{} };
  const ex = [
    ['El nombre del viento','Patrick Rothfuss',660,['es','en'],['épica'],0,0,['Crónica del asesino de reyes',1,3]],['Juego de tronos','George R. R. Martin',800,['es','en'],['épica'],0,0,['Canción de hielo y fuego',1,7]],
    ['El Hobbit','J. R. R. Tolkien',300,['es','en'],['clásico','épica'],0,0],['Mexican Gothic','Silvia Moreno-Garcia',320,['en'],['gótica','terror'],0,1],
    ['Piranesi','Susanna Clarke',270,['es','en'],['misterio'],0,1],['Fourth Wing','Rebecca Yarros',510,['es','en'],['dragones','romance'],1,1,['The Empyrean',1,5]],
    ['Una corte de rosas y espinas','Sarah J. Maas',430,['es'],['fae','romantasy'],1,0,['Una corte de rosas y espinas',1,5]],
    ['The Cruel Prince','Holly Black',380,['en'],['fae'],1,0,['The Folk of the Air',1,3]],['The Wicked King','Holly Black',330,['en'],['fae'],1,0,['The Folk of the Air',2,3]],
    ['The Queen of Nothing','Holly Black',300,['en'],['fae'],1,0,['The Folk of the Air',3,3]],['Dune','Frank Herbert',700,['es','en'],['ciencia ficción'],2,0],
    ['El secreto','Donna Tartt',660,['es','en'],['dark academia'],3,0]
  ];
  ex.forEach((e, i) => { const u = s.units[e[5]], sh = u.shelves[e[6]];
    s.books.push({ id:uid(), title:e[0], author:e[1], synopsis:'Libro de ejemplo. Bórralo desde el aviso de la parte superior.', pages:e[2], year:'', langs:e[3], formats:{}, tags:e[4], notes:'',
      status:'pendiente', rating:0, next:false, cover:'', cover2:'', coverData:'', unitId:u.id, shelfId:sh.id, addedAt:Date.now() - (ex.length - i) * 1000, ejemplo:true,
      series:e[7] ? { name:e[7][0], n:e[7][1], total:e[7][2] } : null, spine:null }); });
  s.books[1].status = 'leyendo'; s.books[2].status = 'leido'; s.books[2].readAt = Date.now() - 86400000 * 20; s.books[2].rating = 5; s.books[5].next = true;
  return s;
}
function load(){
  try{ const raw = localStorage.getItem(KEY); if(raw){ const s = JSON.parse(raw); if(s && s.v === 1 && Array.isArray(s.units) && Array.isArray(s.books)){ s.seriesStyle = s.seriesStyle || {}; return s; } } }catch(e){}
  return defaultState();
}
let state = load();
const ui = { active:0, filters:{ q:'', status:'', lang:'', tags:[], len:'' }, lastShelf:null, width:0 };
let saveT = null;
function save(){
  clearTimeout(saveT);
  saveT = setTimeout(() => { try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){ toast('No se pudo guardar: el almacenamiento está lleno. Exporta una copia desde Ajustes.'); } }, 100);
}
const unitOf = id => state.units.find(u => u.id === id);
const bookOf = id => state.books.find(b => b.id === id);
function shelfOf(shelfId){ for(const u of state.units){ const s = u.shelves.find(x => x.id === shelfId); if(s) return { u, s }; } return null; }
const lastName = a => { const f = String(a || '').split(',')[0].trim().split(/\s+/); return f[f.length - 1] || ''; };

/* ---------- Ordenar y filtrar ---------- */
function sortedBooks(shelf){
  const arr = state.books.filter(b => b.shelfId === shelf.id);
  if(shelf.sort === 'manual'){
    const idx = new Map(shelf.order.map((id, i) => [id, i]));
    return arr.sort((a, b) => (idx.has(a.id) ? idx.get(a.id) : 1e9 + a.addedAt) - (idx.has(b.id) ? idx.get(b.id) : 1e9 + b.addedAt));
  }
  const d = shelf.dir === 'desc' ? -1 : 1;
  const num = { added:b => b.addedAt, pub:b => +b.year || null, pages:b => +b.pages || null };
  if(num[shelf.sort]){
    const f = num[shelf.sort], known = arr.filter(b => f(b) !== null).sort((a, b) => d * (f(a) - f(b))), unk = arr.filter(b => f(b) === null);
    return groupSeries([...known, ...unk]);
  }
  const key = shelf.sort === 'author' ? b => lastName(b.author) + ' ' + b.title : b => b.title;
  return groupSeries(arr.sort((a, b) => d * key(a).localeCompare(key(b), 'es')));
}
/* Los libros de una misma serie se colocan juntos y en orden, donde aparece el primero */
function groupSeries(arr){
  const out = [], seen = new Set();
  for(const b of arr){
    if(seen.has(b.id)) continue; const k = serKey(b);
    if(!k){ out.push(b); continue; }
    arr.filter(x => serKey(x) === k).sort((a, c) => (+a.series.n || 99) - (+c.series.n || 99)).forEach(m => { seen.add(m.id); out.push(m); });
  }
  return out;
}
function filtersActive(){ const f = ui.filters; return !!(f.q || f.status || f.lang || f.tags.length || f.len); }
function langKind(b){ const l = b.langs || []; return l.length === 2 ? 'both' : l[0] === 'es' ? 'es' : l[0] === 'en' ? 'en' : ''; }
function matches(b, f = ui.filters){
  if(f.q && !norm([b.title, b.author, (b.tags || []).join(' '), b.notes].join(' ')).includes(norm(f.q))) return false;
  if(f.status && (b.status || 'pendiente') !== f.status) return false;
  if(f.lang && langKind(b) !== f.lang) return false;
  if(f.tags && f.tags.length && !f.tags.every(t => (b.tags || []).includes(t))) return false;
  if(f.len){ const p = +b.pages; if(!p) return false; if(f.len === 'corto' && p >= 300) return false; if(f.len === 'medio' && (p < 300 || p > 500)) return false; if(f.len === 'largo' && p <= 500) return false; }
  return true;
}
const allTags = () => { const c = {}; state.books.forEach(b => (b.tags || []).forEach(t => c[t] = (c[t] || 0) + 1)); return Object.entries(c).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es')); };

/* ---------- Portadas ---------- */
function fbHtml(title, author, seed, pal){
  const colors = pal || PRESETS.generico.spines, c = colors[hash(seed || title) % colors.length];
  return `<div class="cover-fb" style="--c:${c};--t:${textOn(c)}"><b>${esc(title)}</b><i>${esc(author)}</i></div>`;
}
function coverHtml(b){
  const srcs = [b.coverData, b.cover, b.cover2].filter(Boolean);
  const u = unitOf(b.unitId), pal = u ? unitStyle(u).spines : null;
  if(!srcs.length) return fbHtml(b.title, b.author, b.id, pal);
  return `<img class="cover" src="${esc(srcs[0])}" data-rest="${esc(JSON.stringify(srcs.slice(1)))}" data-t="${esc(b.title)}" data-a="${esc(b.author)}" data-s="${esc(b.id)}" alt="Portada de ${esc(b.title)}" referrerpolicy="no-referrer">`;
}
function coverFail(img){
  let rest = []; try{ rest = JSON.parse(img.dataset.rest || '[]'); }catch(e){}
  if(rest.length){ img.dataset.rest = JSON.stringify(rest.slice(1)); img.src = rest[0]; return; }
  const d = document.createElement('div'); d.innerHTML = fbHtml(img.dataset.t, img.dataset.a, img.dataset.s); img.replaceWith(d.firstChild);
}
document.addEventListener('error', e => { if(e.target.matches && e.target.matches('img.cover')) coverFail(e.target); }, true);
document.addEventListener('load', e => { const t = e.target; if(t.matches && t.matches('img.cover') && t.naturalWidth <= 1) coverFail(t); }, true);
function resizeImage(file, max = 420){
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', .78)); };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('imagen')); }; im.src = url;
  });
}

/* ---------- Dibujo de estanterías ---------- */
/* Agrupa en tramos los libros consecutivos de una misma serie para que compartan diseño y paisaje */
function shelfRuns(list){
  const ctx = new Map(); let i = 0;
  while(i < list.length){
    const k = serKey(list[i]); if(!k){ i++; continue; }
    let j = i; while(j < list.length && serKey(list[j]) === k) j++;
    const run = list.slice(i, j), total = seriesTotal(state, run[0]), m = seriesMode(state, k, total);
    const all = [...seriesMembers(state, k), ...run.filter(b => !bookOf(b.id))];
    const leader = all.sort((a, b) => (+a.series.n || 99) - (+b.series.n || 99))[0] || run[0];
    const widths = run.map(b => spineDims(b, hash(b.id + (b.title || ''))).w + 1), totalW = widths.reduce((a, c) => a + c, 0);
    let off = 0;
    run.forEach((b, idx) => { ctx.set(b.id, { mode:m.mode, scene:m.scene, total, n:+b.series.n || idx + 1, idx:(+b.series.n || idx + 1) - 1, off, totalW, seed:hash(k), leader }); off += widths[idx]; });
    i = j;
  }
  return ctx;
}
function bookItem(b, u, th, sctx){
  const a = spineArt(b, u, th, { series:sctx });
  let html = a.html.replace('<div class="it">', `<div class="it" data-id="${b.id}" data-shelf="${b.shelfId}">`)
    .replace('<div class="bk', `<button type="button" data-id="${b.id}" data-s="${b.status || 'pendiente'}" aria-label="${esc(b.title)}${b.author ? ', ' + esc(b.author) : ''}" class="bk`);
  const end = html.lastIndexOf('</div></div></div>');
  html = html.slice(0, end) + '</div>' + (b.next ? '<i class="bk-next"></i>' : '') + `<span class="bk-flag">${ICON.check}</span></button></div>` + html.slice(end + 18);
  return { w:a.w + 1, html };
}
function decoItem(k, th, size, id){
  if(!DECO[k]) return null;
  const d = DECO[k](th.decoC), s = Math.min(size || 1, 150 / d.h, 1.35);
  const svg = `<svg viewBox="0 0 ${d.w} ${d.h}" width="${d.w * s}" height="${d.h * s}" aria-hidden="true">${d.s}</svg>`;
  return { w:Math.round(d.w * s) + 8, html:id ? `<div class="dc dcm" data-dec="${id}" role="button" tabindex="0" aria-label="${esc(DECO_NAMES[k] || 'Decoración')}">${svg}</div>` : `<div class="dc">${svg}</div>` };
}
/* Libros visibles de la estantería, en orden: baldas seguidas */
function unitSeq(u){ const seq = []; u.shelves.forEach(sh => sortedBooks(sh).filter(b => matches(b)).forEach(b => seq.push(b))); return seq; }
/* Colocación automática de objetos (determinista) */
function autoPlan(u, th, seq){
  const list = themeDecor(u, th); if(!list.length) return [];
  const r = rng(hash(u.id)), plan = []; let next = 2 + Math.floor(r() * 3);
  seq.forEach((b, idx) => { const nb = seq[idx + 1], inRun = nb && serKey(nb) && serKey(nb) === serKey(b);
    if(idx + 1 >= next && !inRun){ plan.push({ k:list[Math.floor(r() * list.length)], after:b.id, size:.82 + r() * .26 }); next = idx + 5 + Math.floor(r() * 4); } });
  if(seq.length < 6) plan.push({ k:list[Math.floor(r() * list.length)], after:seq.length ? seq[seq.length - 1].id : null, size:.9 });
  return plan;
}
const decorOfUnit = id => { for(const u of state.units){ const d = (u.decorItems || []).find(x => x.id === id); if(d) return { u, d }; } return null; };
function innerWidth(th){ const c = $('#carousel'); const slide = Math.min((c.clientWidth || 360) - 28, 420); return slide - 2 * th.P - 20; }
function cabinetHtml(u, i){
  const th = themeOf(u), W = innerWidth(th), decorOn = state.settings.decor !== false, manual = u.decorMode === 'manual';
  const seq = unitSeq(u), total = u.shelves.reduce((n, sh) => n + state.books.filter(b => b.shelfId === sh.id).length, 0), shown = seq.length;
  // Las baldas (subgéneros) se colocan seguidas: solo hay tantas filas como hagan falta.
  const plan = !decorOn ? [] : manual ? (u.decorItems || []) : autoPlan(u, th, seq);
  const ids = new Set(seq.map(b => b.id)), after = new Map(), tail = [];
  plan.forEach(p => { if(p.after === null || p.after === undefined){ (after.get(null) || after.set(null, []).get(null)).push(p); } else if(ids.has(p.after)){ (after.get(p.after) || after.set(p.after, []).get(p.after)).push(p); } else tail.push(p); });
  const items = [], deco = p => { const it = decoItem(p.k, th, p.size, manual ? p.id : null); if(it) items.push(it); };
  (after.get(null) || []).forEach(deco);
  const runsByShelf = new Map(); u.shelves.forEach(sh => runsByShelf.set(sh.id, shelfRuns(seq.filter(b => b.shelfId === sh.id))));
  seq.forEach(b => { items.push(bookItem(b, u, th, runsByShelf.get(b.shelfId).get(b.id))); (after.get(b.id) || []).forEach(deco); });
  tail.forEach(deco);
  const rows = packRows(items, W, th.mullion);
  const hint = !shown ? `<div class="empty-hint">${total ? 'Ningún libro coincide con el filtro' : 'Estantería vacía: añade un libro desde arriba'}</div>` : '';
  const rowsHtml = rows.map((row, ri) => `<div class="row" data-row="${u.id}">${row.map(it => it.spacer ? `<div class="sp" style="width:${it.spacer}px"></div>` : it.html).join('')}<div class="tabla"></div>${ri === 0 ? hint : ''}</div>`).join('');
  const corners = th.corners ? bcSvg('tl') + bcSvg('tr') + bcSvg('bl') + bcSvg('br') : '';
  return `<section class="slide" data-unit="${u.id}" data-i="${i}"><div class="cab-wrap"><div class="mueble ${th.cls} grainH" style="${cabinetStyleVars(th)}">
    <button class="unit-btn" type="button" data-act="editUnit" data-unit="${u.id}" aria-label="Editar la estantería ${esc(u.name)}">${ICON.dots}</button>${manual && decorOn ? `<button class="unit-btn deco-add" type="button" data-act="addDecor" data-unit="${u.id}" aria-label="Añadir decoración">${ICON.plus}</button>` : ''}${crownHtml(u, th)}
    <div class="body"><div class="pil l"></div><div class="inner">${corners}${th.mullion ? '<div class="mull"></div>' : ''}${rowsHtml}</div><div class="pil r"></div></div>
    <div class="base"><div class="b1"></div><div class="b2"></div><div class="b3"></div></div></div></div></section>`;
}
function renderHeader(){
  const yr = new Date().getFullYear(), pend = state.books.filter(b => b.status !== 'leido').length;
  const read = state.books.filter(b => b.status === 'leido' && b.readAt && new Date(b.readAt).getFullYear() === yr).length;
  $('#stats').innerHTML = `<b>${pend}</b> pendientes · <b>${read}</b> leídos en ${yr}`;
  const nb = state.books.find(b => b.next);
  $('#nextchip').innerHTML = nb ? `<button class="next-chip" type="button" data-open="${nb.id}"><i></i><span>Siguiente: ${esc(nb.title)}</span></button>` : '';
  $('#btnFilter').setAttribute('aria-pressed', filtersActive() ? 'true' : 'false');
  const fb = $('#filterbar');
  if(filtersActive()){
    const f = ui.filters, parts = [];
    if(f.q) parts.push('«' + f.q + '»'); if(f.status) parts.push(STATUS[f.status]);
    if(f.lang) parts.push({ es:'Solo español', en:'Solo inglés', both:'Español e inglés' }[f.lang]);
    if(f.tags.length) parts.push(f.tags.join(', ')); if(f.len) parts.push({ corto:'Menos de 300 págs.', medio:'300–500 págs.', largo:'Más de 500 págs.' }[f.len]);
    const n = state.books.filter(b => matches(b)).length;
    fb.hidden = false; fb.innerHTML = `<span>${n} ${n === 1 ? 'libro' : 'libros'} · ${esc(parts.join(' · '))}</span><button class="btn sm" type="button" data-act="clearFilters">Quitar</button>`;
  } else fb.hidden = true;
  const ban = $('#banner');
  if(state.books.some(b => b.ejemplo)){ ban.hidden = false; ban.innerHTML = `<span>Los libros de ejemplo te muestran cómo queda. Cuando quieras, bórralos.</span><button class="btn sm" type="button" data-act="clearExamples">Borrar ejemplos</button>`; }
  else ban.hidden = true;
  document.body.dataset.nodecor = state.settings.decor === false ? '1' : '';
}
function renderTabs(){
  $('#tabs').innerHTML = state.units.map((u, i) => `<button class="tab" type="button" role="tab" data-i="${i}" aria-selected="${i === ui.active}">${esc(u.name)} <small>${state.books.filter(b => b.unitId === u.id).length}</small></button>`).join('')
    + `<button class="tab add" type="button" data-act="newUnit" aria-label="Nueva estantería">+</button>`;
}
function renderCarousel(){
  const c = $('#carousel'), sl = c.scrollLeft; ui.width = c.clientWidth;
  c.innerHTML = state.units.map(cabinetHtml).join('');
  c.style.scrollBehavior = 'auto'; c.scrollLeft = sl; c.style.scrollBehavior = '';
}
function setAccent(){
  const u = state.units[ui.active]; if(!u) return;
  const th = themeOf(u), a = th.key === 'generico' ? th.acc : th.pal[0][th.key === 'moderno' ? 0 : 0], dark = document.documentElement.dataset.theme === 'dark' || (document.documentElement.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  const acc = dark && lum(a) < .35 ? a.replace(/^#(..)(..)(..)$/, (m, r, g, b) => '#' + [r, g, b].map(x => Math.min(255, parseInt(x, 16) + 70).toString(16).padStart(2, '0')).join('')) : a;
  document.documentElement.style.setProperty('--acc', acc); document.documentElement.style.setProperty('--acc-fg', textOn(acc));
}
function renderAll(){
  ui.active = clamp(ui.active, 0, state.units.length - 1);
  renderHeader(); renderTabs(); renderCarousel(); setAccent();
}
function goTo(i, smooth = true){
  const c = $('#carousel'), s = c.children[i]; if(!s) return;
  c.scrollTo({ left:s.offsetLeft - (c.clientWidth - s.offsetWidth) / 2, behavior:smooth ? 'smooth' : 'auto' });
}
let scrollRaf = 0;
$('#carousel').addEventListener('scroll', () => {
  cancelAnimationFrame(scrollRaf);
  scrollRaf = requestAnimationFrame(() => {
    const c = $('#carousel'), mid = c.scrollLeft + c.clientWidth / 2; let best = 0, bd = 1e9;
    [...c.children].forEach((s, i) => { const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid); if(d < bd){ bd = d; best = i; } });
    if(best !== ui.active){ ui.active = best; $$('#tabs .tab[data-i]').forEach(t => t.setAttribute('aria-selected', t.dataset.i == best)); setAccent();
      const t = $(`#tabs .tab[data-i="${best}"]`); t && t.scrollIntoView({ inline:'center', block:'nearest', behavior:'smooth' }); }
  });
}, { passive:true });
function flash(id){
  requestAnimationFrame(() => { const it = $(`.it[data-id="${id}"]`); if(it){ it.scrollIntoView({ block:'nearest', inline:'nearest' }); it.firstElementChild.animate([{ transform:'translateY(-18px)' }, { transform:'translateY(0)' }], { duration:600, easing:'ease-out' }); } });
}

/* ---------- Hojas (ventanas) ---------- */
const sheets = []; let popRes = null;
const sheetT = (title, body, foot = '') => `<div class="sheet-head"><h2>${esc(title)}</h2><button class="iconbtn sm" type="button" data-close aria-label="Cerrar">${ICON.x}</button></div><div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}`;
function openSheet(html, onClose){
  const back = document.createElement('div'); back.className = 'backdrop';
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.innerHTML = html;
  back.addEventListener('click', () => closeSheet());
  sh.addEventListener('click', e => { if(e.target.closest('[data-close]')) closeSheet(); });
  document.body.append(back, sh); sheets.push({ back, sh, onClose }); history.pushState({ sheet:sheets.length }, '');
  const af = sh.querySelector('[data-autofocus]'); if(af) af.focus();
  return sh;
}
function popNow(){ const r = sheets.pop(); if(r){ r.back.remove(); r.sh.remove(); r.onClose && r.onClose(); } const f = popRes; popRes = null; f && f(); }
function closeSheet(){
  return new Promise(res => { if(!sheets.length) return res(); popRes = res; history.back(); setTimeout(() => { if(popRes === res) popNow(); }, 350); });
}
addEventListener('popstate', () => { if(sheets.length) popNow(); });
addEventListener('keydown', e => { if(e.key === 'Escape'){ if(sheets.length) closeSheet(); else hideSuggest(); } });
let toastT = null;
function toast(msg, undo){
  const el = $('#toast'); clearTimeout(toastT);
  el.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button">Deshacer</button>' : ''}`; el.hidden = false;
  if(undo) el.querySelector('button').onclick = () => { undo(); el.hidden = true; };
  toastT = setTimeout(() => { el.hidden = true; }, undo ? 7000 : 3800);
}
const chipsHtml = (items, cur, attr) => items.map(([v, l]) => `<button class="chip" type="button" ${attr}="${esc(v)}" aria-pressed="${cur === v}">${esc(l)}</button>`).join('');
const langBadges = b => { const k = langKind(b); return k === 'both' ? '<span class="badge both">ES · EN</span>' : k === 'es' ? '<span class="badge es">ES</span>' : k === 'en' ? '<span class="badge en">EN</span>' : ''; };
const locName = b => { const l = shelfOf(b.shelfId); return l ? `${l.u.name} › ${l.s.name}` : ''; };

/* ---------- Ficha de un libro ---------- */
function openDetail(id){
  const b0 = bookOf(id); if(!b0) return;
  const sh = openSheet(sheetT('Ficha', '<div id="dbody"></div>'));
  const draw = () => {
    const b = bookOf(id); if(!b){ closeSheet(); return; }
    const fm = FORMATS.filter(([k]) => b.formats && b.formats[k]).map(([k, l]) => `<span class="chip fmt" data-st="${b.formats[k]}">${l}: ${b.formats[k]}</span>`).join('');
    $('#dbody', sh).innerHTML = `
      <div class="hero"><div class="cover-box">${coverHtml(b)}</div><div class="meta"><h2>${esc(b.title)}</h2><div>${esc(b.author) || '<span class="note">Autor sin indicar</span>'}</div>
        <div class="chips">${langBadges(b)}<span class="badge">${STATUS[b.status || 'pendiente']}</span>${b.next ? '<span class="badge">Siguiente lectura</span>' : ''}</div>
        ${b.series && b.series.name ? `<div class="note">Serie: ${esc(b.series.name)} · libro ${b.series.n || '?'}${seriesTotal(state, b) ? ' de ' + seriesTotal(state, b) : ''}</div>` : ''}
        <div class="note">${esc(locName(b))}</div>
        ${b.status === 'leido' ? `<div class="stars" aria-label="Puntuación">${[1,2,3,4,5].map(n => `<button class="star ${n <= b.rating ? 'on' : ''}" type="button" data-star="${n}" aria-label="${n} de 5">${ICON.star}</button>`).join('')}</div>` : ''}
      </div></div>
      ${b.synopsis ? `<div class="sec"><span class="lbl">Sinopsis</span><div class="synopsis">${esc(b.synopsis)}</div></div>` : ''}
      <dl class="kv"><dt>Páginas</dt><dd>${b.pages || '—'}</dd><dt>Publicación</dt><dd>${b.year || '—'}</dd>
        <dt>Idiomas</dt><dd>${(b.langs || []).length === 2 ? 'Español e inglés' : (b.langs || [])[0] === 'es' ? 'Solo español' : (b.langs || [])[0] === 'en' ? 'Solo inglés' : '—'}</dd>
        ${b.readAt ? `<dt>Leído</dt><dd>${new Date(b.readAt).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}</dd>` : ''}</dl>
      ${fm ? `<div class="sec"><span class="lbl">Ediciones</span><div class="chips">${fm}</div></div>` : ''}
      ${(b.tags || []).length ? `<div class="sec"><span class="lbl">Etiquetas</span><div class="chips">${b.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>` : ''}
      ${b.notes ? `<div class="sec"><span class="lbl">Notas</span><div class="synopsis">${esc(b.notes)}</div></div>` : ''}
      <div class="actions">
        ${b.status === 'pendiente' ? '<button class="btn primary" type="button" data-do="start">Empezar a leer</button>' : ''}
        ${b.status === 'leyendo' ? '<button class="btn primary" type="button" data-do="finish">Marcar como leído</button>' : ''}
        ${b.status === 'pendiente' ? '<button class="btn" type="button" data-do="finish">Ya lo he leído</button>' : ''}
        ${b.status === 'leido' ? '<button class="btn" type="button" data-do="pending">Volver a pendiente</button>' : ''}
        ${b.status !== 'leido' ? `<button class="btn" type="button" data-do="next">${b.next ? 'Quitar de siguiente' : 'Siguiente lectura'}</button>` : ''}
        <button class="btn" type="button" data-do="edit">Editar</button><button class="btn" type="button" data-do="move">Mover a…</button>
        <button class="btn danger" type="button" data-do="del">Borrar</button></div>`;
  };
  draw();
  sh.addEventListener('click', async e => {
    const star = e.target.closest('[data-star]'), act = e.target.closest('[data-do]'), b = bookOf(id); if(!b) return;
    if(star){ b.rating = b.rating === +star.dataset.star ? 0 : +star.dataset.star; save(); draw(); return; }
    if(!act) return; const a = act.dataset.do;
    if(a === 'start'){ b.status = 'leyendo'; }
    else if(a === 'finish'){ b.status = 'leido'; b.readAt = Date.now(); b.next = false; }
    else if(a === 'pending'){ b.status = 'pendiente'; b.readAt = null; }
    else if(a === 'next'){ const on = !b.next; state.books.forEach(x => x.next = false); b.next = on; }
    else if(a === 'edit'){ await closeSheet(); openBookForm({ book:b }); return; }
    else if(a === 'move'){ openMove(id, draw); return; }
    else if(a === 'del'){
      if(act.dataset.sure){ const copy = JSON.parse(JSON.stringify(b)), s = shelfOf(b.shelfId);
        state.books = state.books.filter(x => x.id !== id); if(s) s.s.order = s.s.order.filter(x => x !== id); save(); renderAll(); await closeSheet();
        toast('Libro borrado', () => { state.books.push(copy); save(); renderAll(); }); }
      else { act.dataset.sure = '1'; act.textContent = 'Toca otra vez para borrar'; setTimeout(() => { act.dataset.sure = ''; act.textContent = 'Borrar'; }, 3000); }
      return;
    }
    save(); renderAll(); draw();
  });
}
function openMove(id, after){
  const b = bookOf(id);
  const body = state.units.map(u => `<div class="sec"><span class="lbl">${esc(u.name)}</span><div class="row-opts">${u.shelves.map(s => `<button class="opt" type="button" role="radio" data-m="${s.id}" aria-checked="${s.id === b.shelfId}"><span class="dot"></span>${esc(s.name)}</button>`).join('')}</div></div>`).join('');
  const sh = openSheet(sheetT('Mover a…', body));
  sh.addEventListener('click', async e => {
    const o = e.target.closest('[data-m]'); if(!o) return;
    const to = shelfOf(o.dataset.m), from = shelfOf(b.shelfId);
    if(to.s.id !== b.shelfId){ from.s.order = from.s.order.filter(x => x !== id); b.unitId = to.u.id; b.shelfId = to.s.id; ui.lastShelf = to.s.id; save(); renderAll(); toast(`Movido a ${to.u.name} › ${to.s.name}`); }
    await closeSheet(); after && after();
  });
}
function openSort(shelfId){
  const { s } = shelfOf(shelfId);
  const draw = () => {
    const dirs = SORT_DIR[s.sort];
    return `<div class="row-opts">${Object.entries(SORTS).map(([k, l]) => `<button class="opt" type="button" role="radio" data-sort="${k}" aria-checked="${s.sort === k}"><span class="dot"></span>${l}</button>`).join('')}</div>
      ${dirs ? `<div class="sec"><span class="lbl">Dirección</span><div class="chips">${chipsHtml([['asc', dirs[0]], ['desc', dirs[1]]], s.dir, 'data-dir')}</div></div>` : '<p class="note">Orden manual: mantén pulsado un libro y arrástralo hasta su sitio.</p>'}`;
  };
  const sh = openSheet(sheetT('Balda «' + s.name + '»', `<div class="sec"><label for="s-name">Nombre de la balda</label><input class="field" id="s-name" value="${esc(s.name)}"></div><div class="sec"><span class="lbl">Ordenar</span><div id="sbody"></div></div>`));
  $('#sbody', sh).innerHTML = draw();
  sh.addEventListener('change', e => { if(e.target.id === 's-name'){ const v = e.target.value.trim(); if(v){ s.name = v; save(); renderAll(); $('.sheet-head h2', sh).textContent = 'Balda «' + v + '»'; } } });
  sh.addEventListener('click', e => {
    const o = e.target.closest('[data-sort]'), d = e.target.closest('[data-dir]');
    if(o){ if(o.dataset.sort === 'manual' && s.sort !== 'manual') s.order = sortedBooks(s).map(b => b.id); s.sort = o.dataset.sort; if(s.sort === 'added' || s.sort === 'pub') s.dir = s.dir || 'asc'; }
    else if(d) s.dir = d.dataset.dir; else return;
    save(); renderAll(); $('#sbody', sh).innerHTML = draw();
  });
}

/* ---------- Decoración colocada a mano ---------- */
function decoThumbs(th, cur, attr){
  return `<div class="decor-grid">${Object.keys(DECO_NAMES).filter(k => DECO[k]).map(k => { const d = DECO[k](th.decoC), s = Math.min(.9, 50 / d.h);
    return `<button class="decor-opt" type="button" ${attr}="${k}" aria-pressed="${cur === k}" aria-label="${DECO_NAMES[k]}" title="${DECO_NAMES[k]}" style="opacity:1"><svg viewBox="0 0 ${d.w} ${d.h}" width="${d.w * s}" height="${d.h * s}">${d.s}</svg></button>`; }).join('')}</div>`;
}
function openAddDecor(unitId){
  const u = unitOf(unitId); if(!u) return; const th = themeOf(u);
  const sh = openSheet(sheetT('Añadir decoración', `<p class="note">Elige un objeto. Aparecerá al final de la estantería: mantenlo pulsado y arrástralo a donde quieras.</p>${decoThumbs(th, '', 'data-addk')}`));
  sh.addEventListener('click', async e => { const b = e.target.closest('[data-addk]'); if(!b) return;
    u.decorItems = u.decorItems || []; const seq = unitSeq(u);
    u.decorItems.push({ id:uid(), k:b.dataset.addk, after:seq.length ? seq[seq.length - 1].id : null, size:1 }); save(); renderAll(); await closeSheet(); toast('Mantén pulsado el objeto para moverlo'); });
}
function openDecor(decId){
  const f = decorOfUnit(decId); if(!f) return; const { u, d } = f, th = themeOf(u);
  const sizes = [['.75', 'Pequeño'], ['1', 'Mediano'], ['1.25', 'Grande']];
  const draw = () => `<p class="note">Mantén pulsado el objeto en la estantería para cambiarlo de sitio.</p><div class="sec"><span class="lbl">Tamaño</span><div class="chips">${chipsHtml(sizes, String(d.size || 1), 'data-dsize')}</div></div>
    <div class="sec"><span class="lbl">Cambiar por</span>${decoThumbs(th, d.k, 'data-dk')}</div><button class="btn danger" type="button" data-do="drm">Quitar este objeto</button>`;
  const sh = openSheet(sheetT(DECO_NAMES[d.k] || 'Decoración', '<div id="decbody" style="display:flex;flex-direction:column;gap:16px"></div>'));
  const paint = () => { $('#decbody', sh).innerHTML = draw(); $('.sheet-head h2', sh).textContent = DECO_NAMES[d.k] || 'Decoración'; }; paint();
  sh.addEventListener('click', async e => { const g = s => e.target.closest(s);
    if(g('[data-dsize]')) d.size = +g('[data-dsize]').dataset.dsize; else if(g('[data-dk]')) d.k = g('[data-dk]').dataset.dk;
    else if(g('[data-do="drm"]')){ u.decorItems = u.decorItems.filter(x => x.id !== d.id); save(); renderAll(); await closeSheet(); toast('Objeto quitado'); return; } else return;
    save(); renderAll(); paint(); });
}

/* ---------- Formulario de libro ---------- */
function lastLoc(){
  const l = ui.lastShelf && shelfOf(ui.lastShelf);
  if(l) return { unitId:l.u.id, shelfId:l.s.id };
  const u = state.units[ui.active] || state.units[0]; return { unitId:u.id, shelfId:u.shelves[0].id };
}
function newDraft(item){
  const it = item || {}, sugTags = suggestTags(it), sug = suggestShelf(state, sugTags), loc = sug || lastLoc();
  const ps = parseSeries(it.title); let title = it.title || '', series = null, serNote = '';
  if(ps){ title = title.replace(/\s*\([^()]*\)\s*$/, '').trim() || title; series = { name:ps.name, n:ps.n, total:'' }; serNote = 'detectada en el título'; }
  else if(it.seriesN){ const same = state.books.find(b => b.series && b.series.name && lastName(b.author) && lastName(b.author) === lastName(it.author)); if(same){ series = { name:same.series.name, n:+it.seriesN, total:same.series.total || '' }; serNote = 'según Google Books y tus otros libros de esta autora o autor'; } }
  return { serNote, draft:{ series, spine:null, id:uid(), title, author:it.author || '', synopsis:it.desc || '', pages:it.pages || '', year:it.year || '', langs:detectLangs(it), formats:{}, tags:[], notes:'',
    status:'pendiente', rating:0, next:false, cover:(it.covers || [])[0] || '', cover2:(it.covers || [])[1] || '', coverData:'', unitId:loc.unitId, shelfId:loc.shelfId, addedAt:Date.now() }, sugTags, sugged:!!sug };
}
function openBookForm({ book, item }){
  const isNew = !book; let sugTags = [], sugged = false, d;
  let serNote = '';
  if(isNew){ const n = newDraft(item); d = n.draft; sugTags = n.sugTags; sugged = n.sugged; serNote = n.serNote; } else d = JSON.parse(JSON.stringify(book));
  d.series = d.series || null; d.spine = d.spine || null;
  let serStyle = d.series && d.series.name ? { ...((state.seriesStyle || {})[norm(d.series.name)] || {}) } : {};
  let coverTrios = null, coverTriosSrc = null;
  const shelfOpts = uId => (unitOf(uId) || state.units[0]).shelves.map(s => `<option value="${s.id}" ${s.id === d.shelfId ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
  const body = `
    <div id="fnote" class="notice" ${isNew && item ? '' : 'hidden'}>Datos rellenados automáticamente. Revísalos antes de guardar.<span id="fload"> Completando sinopsis, idiomas y serie…</span></div>
    <div class="hero"><div class="cover-box" id="fcover"></div><div class="meta" style="flex:1">
      <button class="btn sm" type="button" data-do="upload">Subir portada</button><button class="btn sm" type="button" data-do="nocover">Quitar portada</button>
      <input id="fupload" type="file" accept="image/*" hidden></div></div>
    <div class="sec"><label for="f-title">Título</label><input class="field" id="f-title" data-f="title" value="${esc(d.title)}" ${isNew && !item ? 'data-autofocus' : ''}></div>
    <div class="sec"><label for="f-author">Autor/a</label><input class="field" id="f-author" data-f="author" value="${esc(d.author)}"></div>
    <div class="two"><div class="sec"><label for="f-pages">Páginas</label><input class="field" id="f-pages" data-f="pages" type="number" inputmode="numeric" min="1" value="${esc(d.pages)}"></div>
      <div class="sec"><label for="f-year">Año de publicación</label><input class="field" id="f-year" data-f="year" type="number" inputmode="numeric" value="${esc(d.year)}"></div></div>
    <div class="sec"><label for="f-syn">Sinopsis</label><textarea class="field" id="f-syn" data-f="synopsis">${esc(d.synopsis)}</textarea></div>
    <div class="sec"><span class="lbl">Idiomas en los que lo puedes leer</span><div class="chips" id="flangs"></div></div>
    <div class="sec"><span class="lbl">Ediciones (toca para alternar: quiero · tengo)</span><div class="chips" id="ffmt"></div></div>
    <div class="sec"><span class="lbl">Etiquetas</span><div class="tagin" id="ftags"></div><div class="chips" id="ftagsug"></div></div>
    <div class="sec"><span class="lbl">Estado</span><div class="chips" id="fstatus"></div><div class="stars" id="frating" hidden></div></div>
    <div class="sec"><label for="f-notes">Notas personales</label><textarea class="field" id="f-notes" data-f="notes" placeholder="Por qué lo quieres leer, quién te lo recomendó…">${esc(d.notes)}</textarea></div>
    <div class="sec"><span class="lbl">Serie</span>
      <div class="three"><input class="field" id="f-sname" list="f-serlist" placeholder="Nombre (vacío si es libro suelto)" value="${esc(d.series ? d.series.name : '')}" aria-label="Nombre de la serie">
        <input class="field" id="f-sn" type="number" inputmode="numeric" min="1" placeholder="Nº" value="${esc(d.series ? d.series.n : '')}" aria-label="Número dentro de la serie">
        <input class="field" id="f-st" type="number" inputmode="numeric" min="1" placeholder="Total" value="${esc(d.series ? d.series.total : '')}" aria-label="Total de libros de la serie"></div>
      <datalist id="f-serlist">${[...new Set(state.books.filter(b => b.series && b.series.name).map(b => b.series.name))].map(n => `<option value="${esc(n)}">`).join('')}</datalist>
      <div id="f-sernote"></div><div id="f-sermode"></div></div>
    <div class="sec"><span class="lbl">Lomo</span>
      <div class="sp-edit"><div class="sp-prev" id="fsp-prev"></div><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px"><div class="chips" id="fsp-style"></div><div class="chips" id="fsp-scene"></div></div></div>
      <span class="lbl">De la portada</span><div class="trios" id="fsp-cover"></div>
      <span class="lbl">Paleta de la estantería</span><div class="trios" id="fsp-pal"></div>
      <span class="lbl">Personalizado</span><div class="pickers"><label class="picker">Base<input type="color" id="fsp-c0"></label><label class="picker">Detalle<input type="color" id="fsp-c1"></label><label class="picker">Acento<input type="color" id="fsp-c2"></label></div>
      <label class="switch">Ajustar a la estética de la estantería<input type="checkbox" id="fsp-adj"></label>
      <button class="btn sm" type="button" data-do="spauto" style="align-self:flex-start">Volver a automático</button></div>
    <div class="sec"><span class="lbl">Dónde va</span>${sugged ? '<div class="note">Balda sugerida según las etiquetas detectadas.</div>' : ''}
      <div class="two"><select class="field" id="f-unit" aria-label="Estantería">${state.units.map(u => `<option value="${u.id}" ${u.id === d.unitId ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>
      <select class="field" id="f-shelf" aria-label="Balda">${shelfOpts(d.unitId)}</select></div></div>
    ${isNew ? '' : '<button class="btn" type="button" data-do="refill">Rellenar datos que faltan desde internet</button>'}`;
  const sh = openSheet(sheetT(isNew ? 'Nuevo libro' : 'Editar libro', body, '<button class="btn" type="button" data-close>Cancelar</button><button class="btn primary" type="button" data-do="save">Guardar</button>'));
  const q = s => $(s, sh);
  let drawCover = () => { q('#fcover').innerHTML = coverHtml(d.title || d.author ? { ...d, title:d.title || 'Sin título' } : { ...d, title:'Sin título' }); };
  const drawLangs = () => { q('#flangs').innerHTML = [['es', 'Español'], ['en', 'Inglés']].map(([k, l]) => `<button class="chip" type="button" data-lang="${k}" aria-pressed="${d.langs.includes(k)}">${l}</button>`).join(''); };
  const drawFmt = () => { q('#ffmt').innerHTML = FORMATS.map(([k, l]) => `<button class="chip fmt" type="button" data-fmt="${k}" data-st="${d.formats[k] || ''}">${l}${d.formats[k] ? ': ' + d.formats[k] : ''}</button>`).join(''); };
  const drawTags = () => {
    q('#ftags').innerHTML = d.tags.map(t => `<span class="chip on">${esc(t)} <button type="button" class="x" data-rt="${esc(t)}" aria-label="Quitar ${esc(t)}" style="all:unset;cursor:pointer">×</button></span>`).join('') + '<input id="ftagin" placeholder="Añadir etiqueta…" enterkeyhint="done" aria-label="Nueva etiqueta">';
    const used = allTags().map(x => x[0]).filter(t => !d.tags.includes(t)).slice(0, 10), sug = sugTags.filter(t => !d.tags.includes(t));
    q('#ftagsug').innerHTML = sug.map(t => `<button class="chip sug" type="button" data-addtag="${esc(t)}">+ ${esc(t)} (sugerida)</button>`).join('') + used.filter(t => !sug.includes(t)).map(t => `<button class="chip" type="button" data-addtag="${esc(t)}">+ ${esc(t)}</button>`).join('');
  };
  const drawStatus = () => { q('#fstatus').innerHTML = chipsHtml(Object.entries(STATUS), d.status, 'data-status');
    const r = q('#frating'); r.hidden = d.status !== 'leido'; r.innerHTML = [1,2,3,4,5].map(n => `<button class="star ${n <= d.rating ? 'on' : ''}" type="button" data-star="${n}" aria-label="${n} de 5">${ICON.star}</button>`).join(''); };
  const addTag = t => { t = t.trim().toLowerCase(); if(t && !d.tags.includes(t)){ d.tags.push(t); } drawTags(); const i = q('#ftagin'); i && i.focus(); };
  const unitNow = () => unitOf(d.unitId) || state.units[0];
  function previewCtx(){
    if(!d.series || !d.series.name) return null;
    const k = norm(d.series.name), others = seriesMembers(state, k).filter(b => b.id !== d.id), list = [...others, d].sort((a, b) => (+a.series.n || 99) - (+b.series.n || 99));
    const saved = state.seriesStyle; state.seriesStyle = { ...saved, [k]:serStyle };
    const ctx = shelfRuns(list).get(d.id); state.seriesStyle = saved; return ctx;
  }
  function drawSeries(){
    const has = d.series && d.series.name;
    q('#f-sernote').innerHTML = serNote && has ? `<div class="note">Serie ${esc(serNote)}. Revisa que sea correcto.</div>` : '';
    if(!has){
      const same = d.author && state.books.find(b => b.id !== d.id && b.series && b.series.name && lastName(b.author) === lastName(d.author));
      q('#f-sermode').innerHTML = same ? `<div class="chips"><button class="chip sug" type="button" data-sersug="${esc(same.series.name)}">¿Es de «${esc(same.series.name)}»?</button></div>` : ''; return;
    }
    const mode = serStyle.mode || 'auto', scene = serStyle.scene || '';
    q('#f-sermode').innerHTML = `<div class="note">Diseño de toda la serie</div><div class="chips">${chipsHtml([['auto', 'Automático'], ['iguales', 'Iguales con número'], ['colores', 'Un color por tomo'], ['luna', 'Fases de la luna'], ['paisaje', 'Paisaje continuo']], mode, 'data-smode')}</div>`
      + ((mode === 'paisaje' || (mode === 'auto' && (+d.series.total || 0) >= 4)) ? `<div class="chips">${chipsHtml([['', 'Paisaje automático'], ...Object.entries(SAGA_SCENES)], scene, 'data-sscene')}</div>` : '');
  }
  function drawSpine(){
    const u = unitNow(), th = themeOf(u), sp = d.spine || {}, ctx = previewCtx();
    const pv = q('#fsp-prev'); pv.className = 'sp-prev ' + th.cls; pv.setAttribute('style', cabinetStyleVars(th));
    pv.innerHTML = spineArt({ ...d, title:d.title || 'Sin título' }, u, th, { series:ctx }).html;
    const cur = sp.style || 'auto';
    q('#fsp-style').innerHTML = ctx && ctx.mode !== 'iguales' && ctx.mode !== 'colores' ? '<span class="note">El estilo lo marca el diseño de la serie.</span>'
      : chipsHtml([['auto', 'Automático'], ...th.styles.map(s => [s, SPINE_STYLES[s]]), ...Object.keys(SPINE_STYLES).filter(s => !th.styles.includes(s)).map(s => [s, SPINE_STYLES[s]])], cur, 'data-spstyle');
    q('#fsp-scene').innerHTML = (cur === 'ilustrado' || (cur === 'auto' && pv.querySelector('.bk') && spineArt(d, u, th).style === 'ilustrado')) && !ctx ? chipsHtml([['', 'Ilustración automática'], ...Object.entries(SCENES)], sp.scene || '', 'data-spscene') : '';
    const trio = (c, sel) => `<button class="trio" type="button" data-trio="${c.join(',')}" aria-pressed="${sel}">${c.map(x => `<i style="background:${x}"></i>`).join('')}</button>`;
    const isSel = c => !!sp.base && sp.base === c[0] && sp.foil === c[1] && sp.accent === c[2];
    q('#fsp-pal').innerHTML = th.pal.map(c => trio(c, isSel(c))).join('');
    q('#fsp-cover').innerHTML = coverTrios === null ? '<span class="note">Analizando la portada…</span>' : coverTrios === false ? `<span class="note">${coverTriosSrc ? 'No se pueden leer los colores de esta portada desde su web. Si subes la portada tú, sí podré sacarlos.' : 'Sin portada todavía.'}</span>` : coverTrios.map(c => trio(c, isSel(c))).join('');
    const pal = sp.base ? [sp.base, sp.foil, sp.accent] : th.pal[(hash(d.id + (d.title || '')) >>> 5) % th.pal.length];
    ['#fsp-c0', '#fsp-c1', '#fsp-c2'].forEach((s, i) => { q(s).value = isHex(pal[i]) ? pal[i] : '#888888'; });
    q('#fsp-adj').checked = sp.adjust !== false;
  }
  function refreshCoverTrios(){
    const src = d.coverData || d.cover || d.cover2 || '';
    if(src === coverTriosSrc) return; coverTriosSrc = src;
    if(!src){ coverTrios = false; drawSpine(); return; }
    coverTrios = null; drawSpine();
    coverPalette(src).then(p => { if(src !== coverTriosSrc) return; coverTrios = p && p.length ? p : false; drawSpine(); });
  }
  const setSpine = patch => { d.spine = { ...(d.spine || {}), ...patch }; drawSpine(); };
  const drawCover0 = drawCover;
  drawCover = () => { drawCover0(); refreshCoverTrios(); };
  drawCover(); drawLangs(); drawFmt(); drawTags(); drawStatus(); drawSeries(); drawSpine();
  sh.addEventListener('input', e => {
    const f = e.target.dataset && e.target.dataset.f; if(f){ d[f] = (f === 'pages' || f === 'year') ? (e.target.value ? +e.target.value : '') : e.target.value; if(f === 'title' || f === 'pages') drawSpine(); }
    const id = e.target.id;
    if(id === 'f-sname' || id === 'f-sn' || id === 'f-st'){
      const name = q('#f-sname').value.trim();
      if(!name){ d.series = null; serStyle = {}; }
      else { const prevName = d.series && d.series.name; d.series = { name, n:+q('#f-sn').value || '', total:+q('#f-st').value || '' };
        if(norm(prevName || '') !== norm(name)){ serStyle = { ...((state.seriesStyle || {})[norm(name)] || {}) }; const ex = state.books.find(b => b.id !== d.id && serKey(b) === norm(name)); if(ex && !q('#f-st').value && ex.series.total){ d.series.total = ex.series.total; q('#f-st').value = ex.series.total; } } }
      serNote = ''; if(id === 'f-sname') drawSeries(); else { drawSeries(); } drawSpine();
    }
    if(/^fsp-c[012]$/.test(id)){ const sp = d.spine || {}, th = themeOf(unitNow()); const pal = sp.base ? [sp.base, sp.foil, sp.accent] : [...th.pal[(hash(d.id + (d.title || '')) >>> 5) % th.pal.length]];
      pal[+id.slice(-1)] = e.target.value; setSpine({ base:pal[0], foil:pal[1], accent:pal[2] }); }
  });
  sh.addEventListener('keydown', e => { if(e.target.id === 'ftagin' && (e.key === 'Enter' || e.key === ',')){ e.preventDefault(); addTag(e.target.value.replace(',', '')); } });
  sh.addEventListener('focusout', e => { if(e.target.id === 'ftagin' && e.target.value.trim()) addTag(e.target.value); });
  sh.addEventListener('change', async e => {
    if(e.target.id === 'f-unit'){ d.unitId = e.target.value; const u = unitOf(d.unitId); d.shelfId = u.shelves[0].id; q('#f-shelf').innerHTML = shelfOpts(d.unitId); drawSpine(); }
    else if(e.target.id === 'fsp-adj'){ setSpine({ adjust:e.target.checked }); }
    else if(e.target.id === 'f-shelf'){ d.shelfId = e.target.value; }
    else if(e.target.id === 'fupload' && e.target.files[0]){ try{ d.coverData = await resizeImage(e.target.files[0]); drawCover(); }catch(err){ toast('No se pudo leer esa imagen'); } }
  });
  sh.addEventListener('click', async e => {
    const t = e.target, g = s => t.closest(s);
    if(g('[data-lang]')){ const k = g('[data-lang]').dataset.lang; d.langs = d.langs.includes(k) ? d.langs.filter(x => x !== k) : [...d.langs, k]; drawLangs(); }
    else if(g('[data-fmt]')){ const k = g('[data-fmt]').dataset.fmt, cur = d.formats[k] || ''; const nx = cur === '' ? 'quiero' : cur === 'quiero' ? 'tengo' : ''; if(nx) d.formats[k] = nx; else delete d.formats[k]; drawFmt(); }
    else if(g('[data-status]')){ d.status = g('[data-status]').dataset.status; if(d.status === 'leido' && !d.readAt) d.readAt = Date.now(); if(d.status !== 'leido'){ d.rating = 0; d.readAt = null; } drawStatus(); }
    else if(g('[data-star]')){ const n = +g('[data-star]').dataset.star; d.rating = d.rating === n ? 0 : n; drawStatus(); }
    else if(g('[data-rt]')){ d.tags = d.tags.filter(x => x !== g('[data-rt]').dataset.rt); drawTags(); }
    else if(g('[data-addtag]')){ addTag(g('[data-addtag]').dataset.addtag); }
    else if(g('[data-do="upload"]')){ q('#fupload').click(); }
    else if(g('[data-do="nocover"]')){ d.coverData = ''; d.cover = ''; d.cover2 = ''; drawCover(); }
    else if(g('[data-do="refill"]')){ refill(g('[data-do="refill"]')); }
    else if(g('[data-do="save"]')){ await doSave(); }
    else if(g('[data-spstyle]')){ setSpine({ style:g('[data-spstyle]').dataset.spstyle }); }
    else if(g('[data-spscene]')){ setSpine({ scene:g('[data-spscene]').dataset.spscene }); }
    else if(g('[data-trio]')){ const c = g('[data-trio]').dataset.trio.split(','); setSpine({ base:c[0], foil:c[1], accent:c[2] }); }
    else if(g('[data-do="spauto"]')){ d.spine = null; drawSpine(); }
    else if(g('[data-smode]')){ serStyle.mode = g('[data-smode]').dataset.smode; drawSeries(); drawSpine(); }
    else if(g('[data-sscene]')){ serStyle.scene = g('[data-sscene]').dataset.sscene; drawSeries(); drawSpine(); }
    else if(g('[data-sersug]')){ const name = g('[data-sersug]').dataset.sersug, mem = state.books.filter(b => serKey(b) === norm(name)), mx = Math.max(0, ...mem.map(b => +b.series.n || 0));
      d.series = { name, n:mx + 1, total:(mem.find(b => b.series.total) || { series:{} }).series.total || '' }; serStyle = { ...((state.seriesStyle || {})[norm(name)] || {}) };
      q('#f-sname').value = name; q('#f-sn').value = d.series.n; q('#f-st').value = d.series.total; drawSeries(); drawSpine(); }
  });
  async function refill(btn){
    if(!d.title.trim()){ toast('Escribe primero el título'); return; }
    btn.disabled = true; btn.textContent = 'Buscando…';
    try{
      const res = await searchBooks(d.title + ' ' + lastName(d.author), new AbortController().signal);
      const it = res && res.items[0]; if(!it){ toast('No he encontrado datos para ese libro'); return; }
      applyItem(await enrichBook(it, new AbortController().signal)); toast('He completado lo que faltaba');
    }catch(err){ toast('No se pudo consultar internet'); }
    finally{ btn.disabled = false; btn.textContent = 'Rellenar datos que faltan desde internet'; }
  }
  function applyItem(it){
    if(!d.author && it.author){ d.author = it.author; q('#f-author').value = d.author; }
    if(!d.synopsis && it.desc){ d.synopsis = it.desc; q('#f-syn').value = d.synopsis; }
    if(!d.pages && it.pages){ d.pages = it.pages; q('#f-pages').value = d.pages; }
    if(!d.year && it.year){ d.year = it.year; q('#f-year').value = d.year; }
    { const L = detectLangs(it); if(L.some(x => !d.langs.includes(x))){ d.langs = [...new Set([...d.langs, ...L])]; drawLangs(); } }
    if(!d.series && it.wd && it.wd.series){ d.series = { ...it.wd.series }; serNote = 'según Wikidata'; serStyle = { ...((state.seriesStyle || {})[norm(d.series.name)] || {}) };
      const ex = state.books.find(b => serKey(b) === norm(d.series.name) && b.series.total); if(!d.series.total && ex) d.series.total = ex.series.total;
      q('#f-sname').value = d.series.name; q('#f-sn').value = d.series.n; q('#f-st').value = d.series.total; drawSeries(); drawSpine(); }
    if(!d.cover && !d.coverData && (it.covers || []).length){ d.cover = it.covers[0]; d.cover2 = it.covers[1] || ''; drawCover(); }
    if(!d.series && it.seriesN){ const same = state.books.find(b => b.series && b.series.name && lastName(b.author) === lastName(it.author || d.author)); if(same){ d.series = { name:same.series.name, n:+it.seriesN, total:same.series.total || '' }; serNote = 'según Google Books y tus otros libros de esta autora o autor'; q('#f-sname').value = d.series.name; q('#f-sn').value = d.series.n; q('#f-st').value = d.series.total; drawSeries(); drawSpine(); } }
    sugTags = [...new Set([...sugTags, ...suggestTags(it)])]; drawTags();
  }
  async function doSave(){
    d.title = d.title.trim(); if(!d.title){ toast('El libro necesita un título'); q('#f-title').focus(); return; }
    d.tags = [...new Set(d.tags)];
    if(d.series && d.series.name){ const k = norm(d.series.name); state.seriesStyle = state.seriesStyle || {}; if(serStyle.mode || serStyle.scene) state.seriesStyle[k] = { ...serStyle };
      if(d.series.total) state.books.forEach(b => { if(serKey(b) === k) b.series.total = d.series.total; }); }
    else d.series = null;
    if(isNew){ state.books.push(d); }
    else { const old = bookOf(d.id); if(old.shelfId !== d.shelfId){ const o = shelfOf(old.shelfId); o && (o.s.order = o.s.order.filter(x => x !== d.id)); } Object.assign(old, d); }
    ui.lastShelf = d.shelfId; save();
    const idx = state.units.findIndex(u => u.id === d.unitId); if(idx >= 0) ui.active = idx;
    renderAll(); await closeSheet(); goTo(ui.active); flash(d.id); toast(isNew ? `Añadido a ${locName(d)}` : 'Cambios guardados');
  }
  if(isNew && item){
    const ac = new AbortController(); sheets[sheets.length - 1].onClose = () => ac.abort();
    enrichBook(item, ac.signal).then(it => { if(ac.signal.aborted) return; applyItem(it); const l = q('#fload'); l && (l.textContent = ''); })
      .catch(() => { const l = q('#fload'); l && (l.textContent = ' No pude completar todo: rellena lo que falte a mano.'); });
  }
}

/* ---------- Añadir: búsqueda con sugerencias ---------- */
const addInput = $('#addInput'); let sAbort = null, sTimer = null, results = [];
function hideSuggest(){ $('#suggest').hidden = true; }
function suggestMsg(msg, withManual){
  const ul = $('#suggest'); ul.hidden = false;
  ul.innerHTML = `<li class="sg-note">${esc(msg)}</li>${withManual ? manualRow() : ''}`;
}
const manualRow = () => `<li><button class="sg" type="button" data-manual><span><span class="sg-t">Añadir «${esc(addInput.value.trim())}» a mano</span></span></button></li>`;
async function runSearch(q){
  if(sAbort) sAbort.abort(); sAbort = new AbortController(); suggestMsg('Buscando…');
  try{
    const res = await searchBooks(q, sAbort.signal); if(!res) return;
    if(res.failed){ suggestMsg('No se pudo consultar internet. Puedes añadirlo a mano.', true); return; }
    results = res.items;
    if(!results.length){ suggestMsg('Sin resultados.', true); return; }
    $('#suggest').innerHTML = results.map((r, i) => `<li><button class="sg" type="button" data-pick="${i}">${r.covers[0] ? `<img class="sg-cover" src="${esc(r.covers[0])}" alt="" referrerpolicy="no-referrer" loading="lazy">` : '<span class="sg-cover"></span>'}
      <span><span class="sg-t">${esc(r.title)}</span><br><span class="sg-a">${esc(r.author || 'Autor desconocido')}${r.year ? ' · ' + r.year : ''}${r.pages ? ' · ' + r.pages + ' págs.' : ''}</span></span></button></li>`).join('') + manualRow();
  }catch(e){ if(e.name !== 'AbortError') suggestMsg('No se pudo consultar internet. Puedes añadirlo a mano.', true); }
}
addInput.addEventListener('input', () => { clearTimeout(sTimer); const q = addInput.value.trim(); if(q.length < 3){ hideSuggest(); return; } sTimer = setTimeout(() => runSearch(q), 450); });
addInput.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); clearTimeout(sTimer); const q = addInput.value.trim(); if(q.length >= 2) runSearch(q); } });
$('#suggest').addEventListener('click', e => {
  const p = e.target.closest('[data-pick]'), m = e.target.closest('[data-manual]');
  if(p){ const it = results[+p.dataset.pick]; hideSuggest(); addInput.value = ''; openBookForm({ item:it }); }
  else if(m){ const t = addInput.value.trim(); hideSuggest(); addInput.value = ''; openBookForm({ item:{ title:t } }); }
});
document.addEventListener('click', e => { if(!e.target.closest('.addbar')) hideSuggest(); });
$('#btnAddManual').addEventListener('click', () => { const t = addInput.value.trim(); hideSuggest(); addInput.value = ''; openBookForm({ item:t ? { title:t } : null }); });

/* ---------- Estanterías y baldas ---------- */
function openUnitForm(unitId){
  const isNew = !unitId, orig = unitOf(unitId);
  const u = isNew ? { id:uid(), name:'', tipo:'', preset:'auto', wood:'', decor:null, shelves:[] } : JSON.parse(JSON.stringify(orig));
  if(!isNew && !PRESETS[u.preset]) u.preset = u.preset || 'gen';
  let presetSel = isNew ? 'auto' : (u.preset || 'gen'); const del = new Set();
  const shelfRow = s => `<div class="shelf-edit" data-sid="${s.id}"><input class="field" value="${esc(s.name)}" data-sname aria-label="Nombre de la balda"><button class="iconbtn sm" type="button" data-up aria-label="Subir">${ICON.left.replace('<svg', '<svg style="transform:rotate(90deg)"')}</button><button class="iconbtn sm" type="button" data-down aria-label="Bajar">${ICON.right.replace('<svg', '<svg style="transform:rotate(90deg)"')}</button>${unitId && orig.shelves.some(x => x.id === s.id) ? `<button class="btn sm" type="button" data-sortshelf="${s.id}">Orden</button>` : ''}<button class="iconbtn sm" type="button" data-delshelf aria-label="Eliminar balda">${ICON.x}</button></div>`;
  const body = `
    <div class="sec"><label for="u-name">Nombre</label><input class="field" id="u-name" value="${esc(u.name)}" placeholder="Fantasía, Terror, Psicología…" data-autofocus></div>
    <div class="sec"><label for="u-tipo">Tipo de libros (para elegir estilo y decoración)</label><input class="field" id="u-tipo" value="${esc(u.tipo || '')}" placeholder="Opcional: fantasía gótica, ciencia ficción, viajes…"></div>
    <div class="sec"><span class="lbl">Estilo</span><div id="u-preview" class="note"></div><div class="palette" id="u-pal"></div><div class="chips" id="u-presets"></div></div>
    <div class="sec" id="u-woodsec"><span class="lbl">Madera</span><div class="chips" id="u-wood"></div></div>
    <div class="sec"><span class="lbl">Decoración</span><div class="chips" id="u-dmode"></div><div class="note" id="u-dnote"></div><div class="chips" id="u-dauto"><button class="chip" type="button" id="u-decor-auto">Todos los del estilo</button></div><div class="decor-grid" id="u-decor"></div><div id="u-dplaced"></div></div>
    <div class="sec"><span class="lbl">Baldas (grupos dentro de la estantería: ordenan los libros, no se ven como rótulos)</span><div id="u-shelves" style="display:flex;flex-direction:column;gap:8px">${isNew ? '' : u.shelves.map(shelfRow).join('')}</div>
      ${isNew ? '<input class="field" id="u-newshelves" placeholder="Nombres separados por comas: Épica, Gótica, Otras">' : '<button class="btn sm" type="button" id="u-addshelf" style="align-self:flex-start">Añadir balda</button>'}</div>
    ${isNew || state.units.length < 2 ? '' : `<div class="sec"><span class="lbl">Eliminar estantería</span>${state.books.some(b => b.unitId === u.id) ? `<select class="field" id="u-moveto" aria-label="Mover los libros a">${state.units.filter(x => x.id !== u.id).map(x => `<option value="${x.id}">Mover sus libros a ${esc(x.name)}</option>`).join('')}</select>` : ''}<button class="btn danger" type="button" id="u-del">Eliminar estantería</button></div>`}`;
  const sh = openSheet(sheetT(isNew ? 'Nueva estantería' : 'Editar estantería', body, '<button class="btn" type="button" data-close>Cancelar</button><button class="btn primary" type="button" id="u-save">Guardar</button>'));
  const q = s => $(s, sh);
  const curKey = () => presetSel === 'auto' ? detectPreset(q('#u-name').value, q('#u-tipo').value) : presetSel;
  const tmp = () => ({ ...u, name:q('#u-name').value, tipo:q('#u-tipo').value, preset:curKey(), wood:u.wood, decor:u.decor });
  function drawStyle(){
    const t = tmp(), th = themeOf(t);
    q('#u-preview').textContent = (presetSel === 'auto' ? 'Automático: ' + (PRESETS[curKey()] ? PRESETS[curKey()].name : 'paleta propia según el nombre') : 'Elegido: ' + (PRESETS[presetSel] ? PRESETS[presetSel].name : 'paleta propia')) + ' · mueble ' + th.name.toLowerCase();
    q('#u-pal').innerHTML = th.pal.slice(0, 9).map(c => `<i style="background:${c[0]}"></i>`).join('');
    q('#u-woodsec').hidden = th.key !== 'generico';
    q('#u-presets').innerHTML = [['auto', 'Automático'], ...Object.entries(PRESETS).map(([k, p]) => [k, p.name]), ['gen', 'Paleta propia']].map(([k, l]) => `<button class="chip" type="button" data-preset="${k}" aria-pressed="${presetSel === k}">${l}</button>`).join('');
    q('#u-wood').innerHTML = `<button class="chip" type="button" data-wood="" aria-pressed="${!u.wood}">Del estilo</button>` + WOODS.map(w => `<button class="chip" type="button" data-wood="${w}" aria-pressed="${u.wood === w}" aria-label="Madera ${w}" style="background:${w};min-width:40px;border-color:${u.wood === w ? 'var(--acc)' : 'transparent'}"></button>`).join('');
    const on = new Set(themeDecor(t, th));
    q('#u-decor').innerHTML = Object.keys(DECO_NAMES).filter(k => DECO[k]).map(k => { const d = DECO[k](th.decoC); return `<button class="decor-opt" type="button" data-decor="${k}" aria-pressed="${on.has(k)}" aria-label="${DECO_NAMES[k]}" title="${DECO_NAMES[k]}"><svg viewBox="0 0 ${d.w} ${d.h}" width="${d.w * Math.min(.9, 50 / d.h)}" height="${d.h * Math.min(.9, 50 / d.h)}">${d.s}</svg></button>`; }).join('');
    q('#u-decor-auto').setAttribute('aria-pressed', u.decor ? 'false' : 'true');
    const man = u.decorMode === 'manual';
    q('#u-dmode').innerHTML = chipsHtml([['auto', 'Automática'], ['manual', 'La elijo y la coloco yo']], man ? 'manual' : 'auto', 'data-dmode');
    q('#u-dnote').textContent = man ? 'Toca un objeto para añadirlo al final. Luego, en la estantería, mantenlo pulsado para moverlo, o tócalo para cambiar su tamaño o quitarlo.' : 'Marca qué objetos puede usar; se reparten solos entre los libros.';
    q('#u-dauto').hidden = man;
    if(man){ q('#u-decor').innerHTML = Object.keys(DECO_NAMES).filter(k => DECO[k]).map(k => { const d = DECO[k](th.decoC), s = Math.min(.9, 50 / d.h); return `<button class="decor-opt" type="button" data-dadd="${k}" aria-label="Añadir ${DECO_NAMES[k]}" style="opacity:1"><svg viewBox="0 0 ${d.w} ${d.h}" width="${d.w * s}" height="${d.h * s}">${d.s}</svg></button>`; }).join('');
      const items = u.decorItems || [];
      q('#u-dplaced').innerHTML = items.length ? `<div class="chips">${items.map(it => `<span class="chip on">${esc(DECO_NAMES[it.k] || it.k)} <button type="button" data-drm="${it.id}" aria-label="Quitar" style="all:unset;cursor:pointer">×</button></span>`).join('')}</div>` : '<span class="note">Aún no hay objetos colocados.</span>'; }
    else q('#u-dplaced').innerHTML = '';
  }
  drawStyle();
  sh.addEventListener('input', e => { if(e.target.id === 'u-name' || e.target.id === 'u-tipo') drawStyle(); });
  sh.addEventListener('click', async e => {
    const t = e.target, g = s => t.closest(s);
    if(g('[data-sortshelf]')){ openSort(g('[data-sortshelf]').dataset.sortshelf); return; }
    if(g('[data-preset]')){ presetSel = g('[data-preset]').dataset.preset; if(presetSel === 'gen') u.hue = u.hue ?? Math.floor(Math.random() * 360); drawStyle(); }
    else if(g('[data-wood]')){ u.wood = g('[data-wood]').dataset.wood; drawStyle(); }
    else if(g('[data-decor]')){ const k = g('[data-decor]').dataset.decor; const cur = [...themeDecor(tmp(), themeOf(tmp()))]; const i = cur.indexOf(k); if(i >= 0) cur.splice(i, 1); else cur.push(k); u.decor = cur.length ? cur : null; drawStyle(); }
    else if(g('#u-decor-auto')){ u.decor = null; drawStyle(); }
    else if(g('[data-dmode]')){ const m = g('[data-dmode]').dataset.dmode;
      if(m === 'manual' && u.decorMode !== 'manual' && !(u.decorItems || []).length && orig){ u.decorItems = autoPlan(orig, themeOf(tmp()), unitSeq(orig)).map(p => ({ ...p, id:uid(), size:Math.round(p.size * 100) / 100 })); }
      u.decorMode = m; drawStyle(); }
    else if(g('[data-dadd]')){ u.decorItems = u.decorItems || []; const seq = orig ? unitSeq(orig) : []; u.decorItems.push({ id:uid(), k:g('[data-dadd]').dataset.dadd, after:seq.length ? seq[seq.length - 1].id : null, size:1 }); drawStyle(); toast('Añadido al final de la estantería'); }
    else if(g('[data-drm]')){ u.decorItems = (u.decorItems || []).filter(x => x.id !== g('[data-drm]').dataset.drm); drawStyle(); }
    else if(g('#u-addshelf')){ const id = uid(); const d = document.createElement('div'); d.innerHTML = shelfRow({ id, name:'Nueva balda' }); q('#u-shelves').append(d.firstChild); u.shelves.push({ ...mkShelf('Nueva balda'), id }); q('#u-shelves').lastElementChild.querySelector('input').select(); }
    else if(g('[data-up]')){ const r = g('.shelf-edit'); r.previousElementSibling && r.previousElementSibling.before(r); }
    else if(g('[data-down]')){ const r = g('.shelf-edit'); r.nextElementSibling && r.nextElementSibling.after(r); }
    else if(g('[data-delshelf]')){
      const r = g('.shelf-edit'), rows = $$('.shelf-edit', sh);
      if(rows.length < 2){ toast('Debe quedar al menos una balda'); return; }
      const n = state.books.filter(b => b.shelfId === r.dataset.sid).length, b = g('[data-delshelf]');
      if(n && !b.dataset.sure){ b.dataset.sure = '1'; b.style.color = 'var(--danger)'; toast(`Sus ${n} libros pasarán a otra balda. Toca de nuevo para confirmar`); return; }
      del.add(r.dataset.sid); r.remove();
    }
    else if(g('#u-del')){
      const b = g('#u-del'); if(!b.dataset.sure){ b.dataset.sure = '1'; b.textContent = 'Toca otra vez para eliminar'; return; }
      const to = unitOf((q('#u-moveto') || {}).value) || state.units.find(x => x.id !== u.id);
      state.books.filter(x => x.unitId === u.id).forEach(x => { x.unitId = to.id; x.shelfId = to.shelves[0].id; to.shelves[0].order = []; });
      state.units = state.units.filter(x => x.id !== u.id); ui.active = 0; save(); renderAll(); await closeSheet(); toast('Estantería eliminada');
    }
    else if(g('#u-save')){
      const name = q('#u-name').value.trim(); if(!name){ toast('Ponle un nombre a la estantería'); return; }
      const key = curKey(), data = { name, tipo:q('#u-tipo').value.trim(), preset:key, wood:u.wood || '', decor:u.decor, hue:u.hue, decorMode:u.decorMode || 'auto', decorItems:u.decorItems || [] };
      if(isNew){
        const names = (q('#u-newshelves').value || '').split(',').map(s => s.trim()).filter(Boolean);
        Object.assign(u, data); u.shelves = (names.length ? names : ['General']).map(mkShelf); state.units.push(u); ui.active = state.units.length - 1;
      } else {
        Object.assign(orig, data);
        const rows = $$('.shelf-edit', sh), keep = [];
        rows.forEach(r => { const id = r.dataset.sid, name = r.querySelector('input').value.trim() || 'Balda'; let s = orig.shelves.find(x => x.id === id); if(!s){ s = mkShelf(name); s.id = id; } s.name = name; keep.push(s); });
        const first = keep[0];
        orig.shelves.filter(s => del.has(s.id)).forEach(s => state.books.filter(b => b.shelfId === s.id).forEach(b => { b.shelfId = first.id; first.order = []; first.sort = first.sort === 'manual' ? 'added' : first.sort; }));
        orig.shelves = keep;
      }
      save(); renderAll(); await closeSheet(); if(isNew) setTimeout(() => goTo(ui.active), 50);
    }
  });
}

/* ---------- Buscar y filtrar ---------- */
function openFilters(){
  const f = JSON.parse(JSON.stringify(ui.filters));
  const draw = () => `
    <div class="sec"><label for="q-text">Buscar</label><input class="field" id="q-text" type="search" value="${esc(f.q)}" placeholder="Título, autor, etiqueta o nota" data-autofocus></div>
    <div class="sec"><span class="lbl">Estado</span><div class="chips">${chipsHtml([['', 'Todos'], ...Object.entries(STATUS)], f.status, 'data-st')}</div></div>
    <div class="sec"><span class="lbl">Idioma</span><div class="chips">${chipsHtml([['', 'Cualquiera'], ['es', 'Solo español'], ['en', 'Solo inglés'], ['both', 'Ambos']], f.lang, 'data-lg')}</div></div>
    <div class="sec"><span class="lbl">Longitud</span><div class="chips">${chipsHtml([['', 'Cualquiera'], ['corto', 'Menos de 300'], ['medio', '300–500'], ['largo', 'Más de 500']], f.len, 'data-ln')}</div></div>
    <div class="sec"><span class="lbl">Etiquetas (deben cumplirse todas)</span><div class="chips">${allTags().map(([t, n]) => `<button class="chip" type="button" data-tg="${esc(t)}" aria-pressed="${f.tags.includes(t)}">${esc(t)} <small>${n}</small></button>`).join('') || '<span class="note">Aún no hay etiquetas.</span>'}</div></div>`;
  const sh = openSheet(sheetT('Buscar y filtrar', '<div id="qbody"></div>', '<button class="btn" type="button" id="q-clear">Limpiar</button><button class="btn primary" type="button" id="q-apply">Aplicar</button>'));
  const paint = () => { const keep = $('#q-text', sh) && $('#q-text', sh).value; $('#qbody', sh).innerHTML = draw(); if(keep !== null && keep !== undefined && $('#q-text', sh)) $('#q-text', sh).value = keep; };
  paint();
  sh.addEventListener('input', e => { if(e.target.id === 'q-text') f.q = e.target.value; });
  sh.addEventListener('click', async e => {
    const g = s => e.target.closest(s);
    if(g('[data-st]')) f.status = g('[data-st]').dataset.st; else if(g('[data-lg]')) f.lang = g('[data-lg]').dataset.lg; else if(g('[data-ln]')) f.len = g('[data-ln]').dataset.ln;
    else if(g('[data-tg]')){ const t = g('[data-tg]').dataset.tg; f.tags = f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t]; }
    else if(g('#q-clear')){ ui.filters = { q:'', status:'', lang:'', tags:[], len:'' }; renderAll(); await closeSheet(); return; }
    else if(g('#q-apply')){ ui.filters = f; renderAll(); await closeSheet(); return; }
    else return;
    paint();
  });
}

/* ---------- Libro aleatorio ---------- */
function openRandom(){
  const f = { unit:'', lang:'', tag:'', len:'', kind:'' }; let cur = null;
  const pool = () => state.books.filter(b => (b.status || 'pendiente') === 'pendiente' && (!f.unit || b.unitId === f.unit) && (!f.kind || seriesKind(state, b) === f.kind) && matches(b, { q:'', status:'', lang:f.lang, tags:f.tag ? [f.tag] : [], len:f.len }));
  const body = `<div id="r-card" class="random-card"></div>
    <div class="sec"><span class="lbl">Condiciones</span>
    <select class="field" id="r-unit" aria-label="Estantería"><option value="">Cualquier estantería</option>${state.units.map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select>
    <div class="chips">${chipsHtml([['', 'Cualquier idioma'], ['es', 'Solo español'], ['en', 'Solo inglés'], ['both', 'Ambos']], '', 'data-lg')}</div>
    <div class="chips">${chipsHtml([['', 'Cualquier longitud'], ['corto', 'Corto'], ['medio', 'Medio'], ['largo', 'Largo']], '', 'data-ln')}</div>
    <div class="chips">${chipsHtml([['', 'Cualquier tipo'], ['ind', 'Individual'], ['bitri', 'Duología / trilogía'], ['saga', 'Saga']], '', 'data-kd')}</div>
    <select class="field" id="r-tag" aria-label="Etiqueta"><option value="">Cualquier etiqueta</option>${allTags().map(([t]) => `<option>${esc(t)}</option>`).join('')}</select></div>`;
  const sh = openSheet(sheetT('Libro aleatorio', body, '<button class="btn" type="button" id="r-open" disabled>Ver ficha</button><button class="btn primary" type="button" id="r-roll">Otro libro</button>'));
  const roll = () => {
    const p = pool(), card = $('#r-card', sh);
    if(!p.length){ cur = null; card.innerHTML = '<p class="note">Ningún libro pendiente cumple esas condiciones.</p>'; $('#r-open', sh).disabled = true; return; }
    let b = p[Math.floor(Math.random() * p.length)]; if(p.length > 1) while(cur && b.id === cur.id) b = p[Math.floor(Math.random() * p.length)];
    cur = b; $('#r-open', sh).disabled = false;
    card.innerHTML = `<div class="cover-box spin">${coverHtml(b)}</div><div><h2>${esc(b.title)}</h2><div>${esc(b.author)}</div>${b.series && b.series.name ? `<div class="note">${esc(b.series.name)} · ${b.series.n || '?'}${seriesTotal(state, b) ? ' de ' + seriesTotal(state, b) : ''}</div>` : ''}<div class="chips" style="justify-content:center;margin-top:6px">${langBadges(b)}${b.pages ? `<span class="badge">${b.pages} págs.</span>` : ''}</div></div>
      ${b.synopsis ? `<p class="note" style="max-height:6.5em;overflow:hidden">${esc(b.synopsis.slice(0, 260))}${b.synopsis.length > 260 ? '…' : ''}</p>` : ''}<div class="note">${esc(locName(b))}</div>`;
  };
  roll();
  sh.addEventListener('change', e => { if(e.target.id === 'r-unit'){ f.unit = e.target.value; roll(); } if(e.target.id === 'r-tag'){ f.tag = e.target.value; roll(); } });
  sh.addEventListener('click', async e => {
    const g = s => e.target.closest(s);
    if(g('[data-lg]')){ f.lang = g('[data-lg]').dataset.lg; $$('[data-lg]', sh).forEach(c => c.setAttribute('aria-pressed', c === g('[data-lg]'))); roll(); }
    else if(g('[data-ln]')){ f.len = g('[data-ln]').dataset.ln; $$('[data-ln]', sh).forEach(c => c.setAttribute('aria-pressed', c === g('[data-ln]'))); roll(); }
    else if(g('[data-kd]')){ f.kind = g('[data-kd]').dataset.kd; $$('[data-kd]', sh).forEach(c => c.setAttribute('aria-pressed', c === g('[data-kd]'))); roll(); }
    else if(g('#r-roll')) roll();
    else if(g('#r-open') && cur){ const id = cur.id; await closeSheet(); openDetail(id); }
  });
}

/* ---------- Ajustes ---------- */
function applyTheme(){ const t = state.settings.theme; if(t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t; setAccent(); }
function statsHtml(){
  const bs = state.books, yr = new Date().getFullYear(), pend = bs.filter(b => (b.status || 'pendiente') === 'pendiente');
  const pg = pend.reduce((a, b) => a + (+b.pages || 0), 0), read = bs.filter(b => b.status === 'leido');
  const kind = k => bs.filter(b => langKind(b) === k).length;
  return `<dl class="kv"><dt>Libros</dt><dd>${bs.length}</dd><dt>Pendientes</dt><dd>${pend.length}${pg ? ` (unas ${pg.toLocaleString('es-ES')} páginas)` : ''}</dd><dt>Leyendo</dt><dd>${bs.filter(b => b.status === 'leyendo').length}</dd>
    <dt>Leídos</dt><dd>${read.length} (${read.filter(b => b.readAt && new Date(b.readAt).getFullYear() === yr).length} este año)</dd>
    <dt>Solo español</dt><dd>${kind('es')}</dd><dt>Solo inglés</dt><dd>${kind('en')}</dd><dt>En ambos</dt><dd>${kind('both')}</dd>
    ${state.units.map(u => `<dt>${esc(u.name)}</dt><dd>${bs.filter(b => b.unitId === u.id).length}</dd>`).join('')}</dl>`;
}
function openSettings(){
  const body = `
    <div class="sec"><span class="lbl">Tema</span><div class="chips">${chipsHtml([['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']], state.settings.theme, 'data-theme')}</div></div>
    <div class="sec"><span class="lbl">Objetos decorativos</span><div class="chips">${chipsHtml([['1', 'Mostrar'], ['0', 'Ocultar']], state.settings.decor === false ? '0' : '1', 'data-decor')}</div></div>
    <div class="sec"><span class="lbl">Estadísticas</span>${statsHtml()}</div>
    <div class="sec"><span class="lbl">Copia de seguridad</span><p class="note">Los datos se guardan solo en este dispositivo. Exporta una copia para pasar tu colección al móvil o al ordenador, o por si borras los datos del navegador.</p>
      <div class="actions"><button class="btn" type="button" data-do="export">Guardar copia</button><button class="btn" type="button" data-do="share">Compartir copia</button><button class="btn" type="button" data-do="import">Importar copia</button></div>
      <input id="s-file" type="file" accept="application/json,.json" hidden><div id="s-import"></div></div>
    <div class="sec"><span class="lbl">Zona delicada</span><button class="btn danger" type="button" data-do="reset">Borrar todo y empezar de cero</button></div>`;
  const sh = openSheet(sheetT('Ajustes', body));
  sh.addEventListener('click', async e => {
    const g = s => e.target.closest(s);
    if(g('[data-theme]')){ state.settings.theme = g('[data-theme]').dataset.theme; save(); applyTheme(); $$('[data-theme]', sh).forEach(c => c.setAttribute('aria-pressed', c === g('[data-theme]'))); }
    else if(g('[data-decor]')){ state.settings.decor = g('[data-decor]').dataset.decor === '1'; save(); renderAll(); $$('[data-decor]', sh).forEach(c => c.setAttribute('aria-pressed', c === g('[data-decor]'))); }
    else if(g('[data-do="export"]')) exportJson();
    else if(g('[data-do="share"]')) shareJson();
    else if(g('[data-do="import"]')) $('#s-file', sh).click();
    else if(g('[data-do="reset"]')){ const b = g('[data-do="reset"]'); if(!b.dataset.sure){ b.dataset.sure = '1'; b.textContent = 'Toca otra vez: se borrará todo'; return; }
      state = { v:1, settings:state.settings, units:[{ id:uid(), name:'Mi estantería', tipo:'', preset:'generico', shelves:[mkShelf('General')] }], books:[], seriesStyle:{} }; save(); ui.active = 0; renderAll(); await closeSheet(); toast('Colección vacía'); }
    else if(g('[data-imp]')){ applyImport(g('[data-imp]').dataset.imp); await closeSheet(); }
  });
  sh.addEventListener('change', async e => {
    if(e.target.id !== 's-file' || !e.target.files[0]) return;
    try{
      const data = JSON.parse(await e.target.files[0].text());
      if(!(data && data.v === 1 && Array.isArray(data.units) && Array.isArray(data.books))) throw new Error('formato');
      pendingImport = data;
      $('#s-import', sh).innerHTML = `<div class="notice">Copia con ${data.books.length} libros y ${data.units.length} estanterías.</div><div class="actions" style="margin-top:8px"><button class="btn primary" type="button" data-imp="merge">Añadir a lo que tengo</button><button class="btn danger" type="button" data-imp="replace">Reemplazar todo</button></div>`;
    }catch(err){ toast('Ese archivo no es una copia válida de Mi TBR'); }
  });
}
let pendingImport = null;
function applyImport(mode){
  const d = pendingImport; if(!d) return;
  if(mode === 'replace'){ state = d; if(!state.settings) state.settings = { theme:'auto', decor:true }; state.seriesStyle = state.seriesStyle || {}; }
  else { d.units.forEach(u => { if(!unitOf(u.id)) state.units.push(u); }); d.books.forEach(b => { if(!bookOf(b.id)) state.books.push(b); }); Object.assign(state.seriesStyle, d.seriesStyle || {}); }
  pendingImport = null; save(); ui.active = 0; applyTheme(); renderAll();
loadAppFonts().then(() => renderCarousel());
let rzT = 0; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { if(Math.abs($('#carousel').clientWidth - ui.width) > 4) renderCarousel(); }, 200); }); toast('Copia importada');
}
function exportJson(){
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 1)], { type:'application/json' }));
  a.download = `mi-tbr-${new Date().toISOString().slice(0, 10)}.json`; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
async function shareJson(){
  const file = new File([JSON.stringify(state)], 'mi-tbr.json', { type:'application/json' });
  try{ if(navigator.canShare && navigator.canShare({ files:[file] })) await navigator.share({ files:[file], title:'Copia de Mi TBR' }); else exportJson(); }catch(e){}
}

/* ---------- Arrastrar y soltar ---------- */
let pend = null, drag = null, noClickUntil = 0, lastPt = { x:0, y:0 }, autoRaf = 0;
document.addEventListener('contextmenu', e => { if(e.target.closest && e.target.closest('.bk, .dcm')) e.preventDefault(); });
document.addEventListener('touchmove', e => { if(drag) e.preventDefault(); }, { passive:false });
document.addEventListener('pointerdown', e => {
  if(e.button > 0) return; const bk = e.target.closest && e.target.closest('#carousel .bk, #carousel .dcm'); if(!bk) return;
  pend = { bk, id:bk.dataset.id || bk.dataset.dec, dec:!!bk.dataset.dec, x:e.clientX, y:e.clientY, type:e.pointerType, timer:setTimeout(startDrag, 380) }; lastPt = { x:e.clientX, y:e.clientY };
});
addEventListener('pointermove', e => {
  lastPt = { x:e.clientX, y:e.clientY };
  if(pend && !drag){ const dist = Math.hypot(e.clientX - pend.x, e.clientY - pend.y);
    if(pend.type === 'mouse' && dist > 6) startDrag(); else if(pend.type !== 'mouse' && dist > 10){ clearTimeout(pend.timer); pend = null; } }
  if(drag){ moveGhost(); updateTarget(); }
});
function startDrag(){
  if(!pend) return; clearTimeout(pend.timer);
  const ghost = document.createElement('div'); ghost.className = 'ghost'; ghost.appendChild(pend.bk.cloneNode(true)); document.body.appendChild(ghost);
  pend.bk.classList.add('dragging'); drag = { id:pend.id, dec:pend.dec, bk:pend.bk, ghost, target:null, marker:null }; pend = null;
  $('#carousel').style.scrollSnapType = 'none'; navigator.vibrate && navigator.vibrate(12); moveGhost(); updateTarget(); autoLoop();
}
function moveGhost(){ drag.ghost.style.left = lastPt.x + 'px'; drag.ghost.style.top = lastPt.y + 'px'; }
function autoLoop(){
  if(!drag) return; const c = $('#carousel');
  if(lastPt.x < 50) c.scrollLeft -= 14; else if(lastPt.x > innerWidth - 50) c.scrollLeft += 14;
  if(lastPt.y < 120) scrollBy(0, -12); else if(lastPt.y > innerHeight - 90) scrollBy(0, 12);
  updateTarget(); autoRaf = requestAnimationFrame(autoLoop);
}
function updateTarget(){
  const els = document.elementsFromPoint(lastPt.x, lastPt.y), row = els.find(el => el.classList && el.classList.contains('row'));
  $$('.row.drop').forEach(r => r !== row && r.classList.remove('drop'));
  if(drag.marker && (!row || drag.marker.parentElement !== row)){ drag.marker.remove(); drag.marker = null; }
  if(!row){ drag.target = null; return; }
  row.classList.add('drop');
  const items = $$('.it[data-id]', row).filter(it => it.dataset.id !== drag.id); let idx = 0;
  for(const it of items){ const r = it.getBoundingClientRect(); const before = r.bottom < lastPt.y - 4 || (lastPt.y >= r.top - 4 && lastPt.y <= r.bottom + 4 && r.left + r.width / 2 < lastPt.x); if(before) idx++; else break; }
  const rr = row.getBoundingClientRect(); let x = 6, top = 0;
  if(items[idx]){ const r = items[idx].getBoundingClientRect(); x = r.left - rr.left - 2; top = r.top - rr.top; }
  else if(items.length){ const r = items[items.length - 1].getBoundingClientRect(); x = r.right - rr.left + 1; top = r.top - rr.top; }
  if(!drag.marker){ drag.marker = document.createElement('div'); drag.marker.className = 'ins'; row.appendChild(drag.marker); }
  Object.assign(drag.marker.style, { left:x + 'px', top:Math.max(0, top - 4) + 'px', height:'168px' });
  const rowsOf = $$(`.row[data-row="${row.dataset.row}"]`), before = rowsOf.slice(0, rowsOf.indexOf(row)).reduce((n, r) => n + $$('.it[data-id]', r).filter(it => it.dataset.id !== drag.id).length, 0);
  const all = rowsOf.flatMap(r => $$('.it[data-id]', r).filter(it => it.dataset.id !== drag.id)), gi = before + idx, nxt = all[gi], prv = all[gi - 1];
  const u = unitOf(row.dataset.row), shelfId = prv ? prv.dataset.shelf : nxt ? nxt.dataset.shelf : (u ? u.shelves[0].id : null);
  drag.target = drag.dec ? { unitId:row.dataset.row, after:prv ? prv.dataset.id : null } : shelfId ? { shelfId, beforeId:nxt && nxt.dataset.shelf === shelfId ? nxt.dataset.id : null } : null;
}
function endDrag(drop){
  if(!drag) return; cancelAnimationFrame(autoRaf);
  const d = drag; drag = null; d.ghost.remove(); d.bk.classList.remove('dragging'); d.marker && d.marker.remove(); $$('.row.drop').forEach(r => r.classList.remove('drop'));
  $('#carousel').style.scrollSnapType = ''; noClickUntil = Date.now() + 450;
  if(drop && d.target){ if(d.dec) moveDecor(d.id, d.target); else moveBook(d.id, d.target); }
}
function moveDecor(id, t){
  const f = decorOfUnit(id), to = unitOf(t.unitId); if(!f || !to) return;
  if(f.u !== to){ f.u.decorItems = f.u.decorItems.filter(x => x.id !== id); to.decorItems = to.decorItems || []; to.decorItems.push(f.d); if(to.decorMode !== 'manual') to.decorMode = 'manual'; }
  f.d.after = t.after; const arr = to.decorItems, i = arr.indexOf(f.d); arr.splice(i, 1); arr.push(f.d); save(); renderAll();
}
function moveBook(id, t){
  const b = bookOf(id), to = shelfOf(t.shelfId), from = shelfOf(b.shelfId); if(!b || !to) return;
  const order = sortedBooks(to.s).map(x => x.id).filter(x => x !== id), pos = t.beforeId ? order.indexOf(t.beforeId) : order.length;
  order.splice(pos < 0 ? order.length : pos, 0, id);
  if(from && from.s !== to.s) from.s.order = from.s.order.filter(x => x !== id);
  b.unitId = to.u.id; b.shelfId = to.s.id; ui.lastShelf = to.s.id; to.s.order = order;
  const changed = to.s.sort !== 'manual'; to.s.sort = 'manual';
  save(); renderAll(); flash(id); if(changed) toast(`El orden de «${to.s.name}» ahora es manual`);
}
addEventListener('pointerup', () => { if(pend){ clearTimeout(pend.timer); pend = null; } endDrag(true); });
addEventListener('pointercancel', () => { if(pend){ clearTimeout(pend.timer); pend = null; } endDrag(false); });

/* ---------- Eventos de la página ---------- */
document.addEventListener('click', e => {
  const g = s => e.target.closest(s);
  if(g('#carousel .bk')){ if(Date.now() < noClickUntil) return; openDetail(g('.bk').dataset.id); return; }
  if(g('#carousel .dcm')){ if(Date.now() < noClickUntil) return; openDecor(g('.dcm').dataset.dec); return; }
  if(g('[data-open]')){ openDetail(g('[data-open]').dataset.open); return; }
  const act = g('[data-act]'); if(act && !g('.sheet')){
    const a = act.dataset.act;
    if(a === 'sort') openSort(act.dataset.shelf); else if(a === 'addDecor') openAddDecor(act.dataset.unit); else if(a === 'editUnit') openUnitForm(act.dataset.unit); else if(a === 'newUnit') openUnitForm(null);
    else if(a === 'clearFilters'){ ui.filters = { q:'', status:'', lang:'', tags:[], len:'' }; renderAll(); }
    else if(a === 'clearExamples'){ const n = state.books.filter(b => b.ejemplo).length; state.books = state.books.filter(b => !b.ejemplo); state.units.forEach(u => u.shelves.forEach(s => s.order = s.order.filter(id => bookOf(id)))); save(); renderAll(); toast(`${n} libros de ejemplo borrados`); }
    return;
  }
  const tab = g('#tabs .tab[data-i]'); if(tab){ ui.active = +tab.dataset.i; $$('#tabs .tab[data-i]').forEach(t => t.setAttribute('aria-selected', t === tab)); setAccent(); goTo(ui.active); }
  if(g('.arrow.l')) goTo(Math.max(0, ui.active - 1)); if(g('.arrow.r')) goTo(Math.min(state.units.length - 1, ui.active + 1));
});
$('#btnFilter').addEventListener('click', openFilters);
$('#btnRandom').addEventListener('click', openRandom);
$('#btnSettings').addEventListener('click', openSettings);

/* ---------- Inicio ---------- */
applyTheme(); renderAll();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setAccent);
if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
