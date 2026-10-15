'use strict';
/* Mi TBR — estado, orden, filtros y portadas */
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
    U('Contemporánea y thriller', 'contemporanea', ['Contemporánea', 'Thriller y misterio']), U('Romance', 'romance', ['General'])];
  const s = { v:1, fresh:true, settings:{ theme:'auto', decor:true }, units, books:[], seriesStyle:{} };
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
/* Cambios de una sola vez en colecciones ya creadas (la marca va en settings, que es lo que se conserva al juntar con la nube) */
function migrate(s){
  s.settings = s.settings || { theme:'auto', decor:true };
  if(!s.settings.migThriller){ // la estantería de contemporánea pasa a ser también la de thriller
    s.units.filter(u => u.preset === 'contemporanea' && norm(u.name) === 'contemporanea').forEach(u => { u.name = 'Contemporánea y thriller';
      if(!u.shelves.some(sh => /thriller|misterio|suspense/.test(norm(sh.name)))) u.shelves.push(mkShelf('Thriller y misterio')); });
    s.settings.migThriller = 1;
  }
  if(!s.settings.migAdjust && typeof THEMES !== 'undefined'){ // colores elegidos a mano antes de existir el ajuste: se respetan tal cual
    const pals = new Set(Object.values(THEMES).flatMap(t => (t.pal || []).map(p => p.join(',').toLowerCase())));
    s.books.forEach(b => { const sp = b.spine; if(sp && sp.base && sp.adjust === undefined && !pals.has([sp.base, sp.foil, sp.accent].join(',').toLowerCase())) sp.adjust = false; });
    s.settings.migAdjust = 1;
  }
  return s;
}
let state = migrate(load());
const ui = { active:0, filters:{ q:'', status:'', lang:'', tags:[], len:'' }, lastShelf:null, width:0 };
let saveT = null;
function save(){
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    if(typeof syncStamp === 'function') syncStamp(); // marca qué cambió, para la copia en la nube
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){ toast('No se pudo guardar: el almacenamiento está lleno. Exporta una copia desde Ajustes.'); }
    if(typeof syncSoon === 'function'){ syncSoon(); updateCloudUi(); }
  }, 100);
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
