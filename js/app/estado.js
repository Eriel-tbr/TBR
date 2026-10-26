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
  const s = { v:1, fresh:true, settings:{ theme:'auto' }, units, books:[], seriesStyle:{} };
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
  s.settings = s.settings || { theme:'auto' };
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
  if(!s.settings.migSort){ // el orden pasa de cada balda a la estantería: se toma el más usado entre sus baldas
    s.units.forEach(u => { if(u.sort) return; const c = {}; (u.shelves || []).forEach(sh => { const k = (sh.sort || 'added') + '|' + (sh.dir || 'asc'); c[k] = (c[k] || 0) + 1; });
      const best = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; const [so, di] = (best ? best[0] : 'added|asc').split('|'); u.sort = so; u.dir = di; });
    s.settings.migSort = 1;
  }
  if(!s.settings.migDecor){ // «Ocultar objetos» deja de ser un ajuste general: pasa a cada estantería («Sin objetos»); los lomos automáticos siempre salen de la portada
    if(s.settings.decor === false) s.units.forEach(u => { u.decorMode = 'none'; });
    delete s.settings.decor; delete s.settings.spineFromCover; s.settings.migDecor = 1;
  }
  if(!s.settings.migSpine2){ // lomos nuevos (27/10/2026): los estilos antiguos pasan a su parecido y los colores elegidos, a las partes nuevas
    const MAP = { jaspeado:{ accent:'base', base:'alt', m1:'v1', m2:'v2', foil:'foil' }, escamas:{ base:'base', accent:'accent', foil:'foil' }, nervios:{ base:'base', accent:'alt', foil:'foil' },
      marco:{ base:'base', foil:'foil', orn:'orn' }, grimorio:{ base:'base', foil:'foil', gem:'accent' }, acuarela:{ base:'base', accent:'accent', accent2:'alt' }, holo:{ c1:'c1', c2:'c2', c3:'c3' },
      cristal:{ c1:'c1', c2:'c2', c3:'c3' }, estrellado:{ base:'base', accent:'alt', foil:'foil' }, ilustrado:{ base:'base', sky2:'alt', moon:'foil' }, enredadera:{ base:'base', leaf:'leaf', bloom:'accent' },
      deco:{ base:'base', foil:'foil', accent:'accent' }, synth:{ c1:'base', c2:'alt', c3:'foil' }, planeta:{ c1:'base', c2:'alt', c3:'foil' } };
    const ALIAS = { ilustrado:'celestial', estrellado:'celestial', planeta:'celestial', enredadera:'botanico', synth:'degradado', cristal:'holo' };
    s.books.forEach(b => { const sp = b.spine; if(!sp) return; const st = sp.style && sp.style !== 'auto' ? sp.style : '';
      if(sp.parts){ const m = MAP[st], np = {};
        if(m) Object.entries(sp.parts).forEach(([k, v]) => { if(m[k]) np[m[k]] = v; });
        else Object.entries(sp.parts).forEach(([k, v]) => { np[k === 'accent2' ? 'alt' : k] = v; });
        if(st === 'escamas' && sp.parts.base && !np.alt) np.alt = sp.parts.base;
        sp.parts = np; }
      if(ALIAS[st]) sp.style = ALIAS[st]; });
    Object.values(s.seriesStyle || {}).forEach(x => { if(x && ALIAS[x.style]) x.style = ALIAS[x.style]; });
    s.settings.migSpine2 = 1;
  }
  if(!s.settings.migGaps){ // los huecos («Hueco antes / después») dejan paso a colocar libros y objetos donde se sueltan
    s.units.forEach(u => { delete u.gaps; }); s.settings.migGaps = 1;
  }
  return s;
}
let state = migrate(load());
const ui = { active:0, filters:{ q:'', status:'', lang:'', tags:[], len:'' }, lastShelf:null, width:0 };
let saveT = null;
/* Guardar en el móvil. Si el navegador no deja (cuota llena, poco espacio libre en el teléfono, modo incógnito),
   se libera lo que es solo caché de la app y se reintenta; si sigue fallando, se explica con datos para poder ayudar. */
const CACHE_KEYS = ['tbr.series.v1'];
function lsBytes(){ let n = 0; try{ for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); n += (k.length + (localStorage.getItem(k) || '').length) * 2; } }catch(e){} return n; }
async function storageReport(err){
  let est = null; try{ est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null; }catch(e){}
  const keys = []; try{ for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); keys.push(`${k} ${Math.round((localStorage.getItem(k) || '').length * 2 / 1024)} KB`); } }catch(e){}
  return { error:err ? `${err.name || 'Error'}: ${err.message || ''}`.slice(0, 160) : '', appKB:Math.round(JSON.stringify(state).length * 2 / 1024), localKB:Math.round(lsBytes() / 1024), keys,
    usedMB:est ? +(est.usage / 1048576).toFixed(1) : null, quotaMB:est ? +(est.quota / 1048576).toFixed(0) : null };
}
/* ---------- IndexedDB: copia completa de la colección ----------
   localStorage da unos 5 MB y es lo que se lee al abrir (al momento). IndexedDB guarda lo mismo sin ese límite,
   con las portadas subidas incluidas. Si localStorage se llena, allí va una copia «ligera» (sin las portadas subidas)
   y al abrir se completa con la de IndexedDB. Solo se avisa de que no se pudo guardar si fallan las dos. */
const IDB_NAME = 'mi-tbr';
let idbP = null;
function idbOpen(){
  if(idbP) return idbP;
  return idbP = new Promise((res, rej) => { try{ const r = indexedDB.open(IDB_NAME, 1); r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error || new Error('IndexedDB')); r.onblocked = () => rej(new Error('IndexedDB bloqueada')); }catch(e){ rej(e); } })
    .catch(e => { idbP = null; throw e; });
}
function idbGet(k){ return idbOpen().then(db => new Promise((res, rej) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); })); }
function idbSet(k, v){ return idbOpen().then(db => new Promise((res, rej) => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(true); tx.onerror = tx.onabort = () => rej(tx.error || new Error('IndexedDB')); })); }
/* Copia sin las portadas subidas (data:), para que quepa en localStorage */
const slimJson = () => JSON.stringify({ ...state, slim:true, books:state.books.map(b => (b.coverData || '').startsWith('data:') ? { ...b, coverData:'' } : b) });
function lsWrite(json){
  try{ localStorage.setItem(KEY, json); return null; }
  catch(e1){ try{ CACHE_KEYS.forEach(k => localStorage.removeItem(k)); localStorage.setItem(KEY, json); return null; }catch(e2){ return e2; } } // sin cachés
}
let saveFailShown = false, lastIdb = Promise.resolve(true);
/* Guarda en los dos sitios. Devuelve true si localStorage lo tiene (completo o ligero); la promesa lastIdb dice si IndexedDB también.
   Nunca se borra la copia guardada para «hacer sitio»: si la nueva tampoco cabe, lo guardado antes se queda tal cual. */
function writeState(){
  state.savedAt = Date.now(); delete state.slim;
  const json = JSON.stringify(state), idb = lastIdb = idbSet(KEY, json).then(() => true, () => false);
  let err = lsWrite(json); if(err && state.books.some(b => (b.coverData || '').startsWith('data:'))) err = lsWrite(slimJson()) && err;
  if(!err){ saveFailShown = false; return true; }
  idb.then(ok => { if(ok) saveFailShown = false; else if(!saveFailShown){ saveFailShown = true; showSaveFail(err); } });
  return false;
}
/* Guardado completo (para importar y reintentar): true si quedó guardado en algún sitio */
async function persist(){ const ls = writeState(), idb = await lastIdb; return ls || idb; }
/* Al abrir: si IndexedDB tiene una versión más reciente que localStorage (o la de localStorage es la ligera), se usa esa */
const stateReady = (async () => {
  try{
    const raw = await idbGet(KEY), s = raw ? JSON.parse(raw) : null;
    if(!(s && s.v === 1 && Array.isArray(s.units) && Array.isArray(s.books))){ if(!state.fresh) writeState(); return; } // primera vez: se copia
    if((s.savedAt || 0) > (state.savedAt || 0) || (state.slim && (s.savedAt || 0) >= (state.savedAt || 0))){
      state = migrate(s); state.seriesStyle = state.seriesStyle || {}; delete state.slim;
      if(typeof syncMeta !== 'undefined' && typeof hashAll === 'function'){ syncMeta.h = hashAll(state); saveMeta(); } // lo recuperado es el punto de partida
      if(typeof renderAll === 'function'){ applyTheme(); renderAll(); }
    }
  }catch(e){}
})();
async function showSaveFail(err){
  const r = await storageReport(err), lowQuota = r.quotaMB !== null && r.quotaMB < 50;
  const diag = `Mi TBR ${(document.querySelector('meta[name="app-version"]') || {}).content || ''} · ${r.error} · colección ${r.appKB} KB · guardado ${r.localKB} KB [${r.keys.join(', ')}] · navegador ${r.usedMB ?? '?'} de ${r.quotaMB ?? '?'} MB`;
  const body = `<p>El móvil no ha dejado guardar los cambios en la app. Tu colección ocupa solo ${r.appKB} KB, así que no es por tamaño.</p>
    <p class="note">${lowQuota ? 'El navegador solo le da a la app ' + r.quotaMB + ' MB: casi seguro el teléfono tiene muy poco espacio libre.' : 'Suele pasar cuando al teléfono le queda poco espacio libre, o con el navegador en modo incógnito o con «borrar datos al salir».'}</p>
    <p class="note">Mientras tanto no cierres la app: lo que ves sigue aquí. Libera espacio en el teléfono y pulsa «Reintentar». Si tienes cuenta, la copia de la nube también se guarda.</p>
    <div class="notice" style="user-select:text;font-size:.78rem;overflow-wrap:anywhere">${esc(diag)}</div>`;
  const sh = openSheet(sheetT('No se pudo guardar', body, '<button class="btn" type="button" data-do="copydiag">Copiar datos</button><button class="btn primary" type="button" data-do="retrysave">Reintentar</button>'));
  sh.addEventListener('click', async e => {
    if(e.target.closest('[data-do="copydiag"]')){ try{ await navigator.clipboard.writeText(diag); toast('Datos copiados'); }catch(x){ toast('No se pudieron copiar'); } }
    if(e.target.closest('[data-do="retrysave"]')){ saveFailShown = true; if(await persist()){ saveFailShown = false; await closeSheet(); toast('Guardado'); } else toast('Sigue sin dejar guardar'); }
  });
}
function save(){
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    if(typeof syncStamp === 'function') syncStamp(); // marca qué cambió, para la copia en la nube
    writeState();
    if(typeof syncSoon === 'function'){ syncSoon(); updateCloudUi(); }
  }, 100);
}
const unitOf = id => state.units.find(u => u.id === id);
const bookOf = id => state.books.find(b => b.id === id);
function shelfOf(shelfId){ for(const u of state.units){ const s = u.shelves.find(x => x.id === shelfId); if(s) return { u, s }; } return null; }
const lastName = a => { const f = String(a || '').split(',')[0].trim().split(/\s+/); return f[f.length - 1] || ''; };

/* ---------- Ordenar y filtrar ---------- */
/* El orden es de la estantería (u.sort / u.dir), el mismo en todas sus baldas; los tomos de una saga siempre van juntos */
const unitSort = u => ({ sort:u.sort || ((u.shelves || [])[0] || {}).sort || 'added', dir:u.dir || ((u.shelves || [])[0] || {}).dir || 'asc' });
function sortedBooks(shelf){
  const arr = state.books.filter(b => b.shelfId === shelf.id), o = shelfOf(shelf.id), us = o ? unitSort(o.u) : { sort:shelf.sort || 'added', dir:shelf.dir || 'asc' };
  if(us.sort === 'manual'){
    const idx = new Map((shelf.order || []).map((id, i) => [id, i]));
    return groupSeries(arr.sort((a, b) => (idx.has(a.id) ? idx.get(a.id) : 1e9 + a.addedAt) - (idx.has(b.id) ? idx.get(b.id) : 1e9 + b.addedAt)));
  }
  const d = us.dir === 'desc' ? -1 : 1;
  const num = { added:b => b.addedAt, pub:b => +b.year || null, pages:b => +b.pages || null };
  if(num[us.sort]){
    const f = num[us.sort], known = arr.filter(b => f(b) !== null).sort((a, b) => d * (f(a) - f(b))), unk = arr.filter(b => f(b) === null);
    return groupSeries([...known, ...unk]);
  }
  const key = us.sort === 'author' ? b => lastName(b.author) + ' ' + b.title : b => b.title;
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
function filtersActive(){ const f = ui.filters; return !!(f.q || f.status || f.lang || f.tags.length || f.len || f.own); }
/* Ediciones: lo tengo (en algún formato) / por comprar (alguno que quieres y ninguno que tengas) */
const ownKind = b => { const v = Object.values(b.formats || {}); return v.includes('tengo') ? 'tengo' : v.includes('quiero') ? 'comprar' : ''; };
function langKind(b){ const l = b.langs || []; return l.length === 2 ? 'both' : l[0] === 'es' ? 'es' : l[0] === 'en' ? 'en' : ''; }
function matches(b, f = ui.filters){
  if(f.q && !norm([b.title, b.origTitle, b.esTitle, b.series && b.series.name, b.author, (b.tags || []).join(' '), b.notes].filter(Boolean).join(' ')).includes(norm(f.q))) return false; // también serie y título original
  if(f.status && (b.status || 'pendiente') !== f.status) return false;
  if(f.lang && langKind(b) !== f.lang) return false;
  if(f.tags && f.tags.length && !f.tags.every(t => (b.tags || []).includes(t))) return false;
  if(f.own && ownKind(b) !== f.own) return false;
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
