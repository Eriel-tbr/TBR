'use strict';
/* Utilidades, estilos de estantería, búsqueda de libros y sugerencias */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function hash(str){ let h = 2166136261; for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const hslHex = (h, s, l) => { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l); const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); const x = v => Math.round(255 * v).toString(16).padStart(2, '0'); return '#' + x(f(0)) + x(f(8)) + x(f(4)); };
function lum(hex){ const n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
const textOn = hex => lum(hex) > 0.58 ? '#231a14' : '#f4ead6';

/* ---------- Estilos de estantería ---------- */
const PRESETS = {
  fantasia:{name:'Fantasía',wood:'#3a2417',panel:'#221a16',plank:'#5b3a25',acc:'#c9a24b',pattern:'stripes',font:'cinzel',d:['#7a5a3a','#e8dcc0','#e0a93b'],
    decor:['vela','calavera','pocion','libros','planta','huevo','luna','llave','espada'],
    spines:['#5b1f2b','#1f4a3c','#2d3a5e','#6b4a1f','#3c2a4d','#7a2e22','#2c4a52','#4a5a2a']},
  romantasy:{name:'Romantasy',wood:'#d8b697',panel:'#4f1e33',plank:'#e6c9a6',acc:'#d4a95a',pattern:'dots',font:'serif',d:['#c9a074','#f6e3d2','#e4b861'],
    decor:['flor','luna','cristal','taza','marco','vela','rosa','estrellas','corona'],
    spines:['#8b2a45','#c46b83','#e3b5b9','#d4a95a','#6e2a4a','#a35577','#f0d9c4','#7a3b52']},
  cienciaficcion:{name:'Ciencia ficción',wood:'#2a3441',panel:'#0d1420',plank:'#40506a',acc:'#4fd1c5',pattern:'grid',font:'modern',d:['#51627c','#cfe0f0','#4fd1c5'],
    decor:['planeta','cohete','telescopio','estrellas','probeta','luna','lampara'],
    spines:['#1e3a5f','#3b2f6b','#0f5257','#5a1f4f','#23506b','#444a6b','#14323f','#6b2b3f']},
  darkacademia:{name:'Dark academia',wood:'#1d3b30',panel:'#101c16',plank:'#35604d',acc:'#d9b25f',pattern:'none',font:'serif',d:['#35604d','#e9dcc0','#d9b25f'],
    decor:['globo','vela','libros','libroab','marco'], spines:['#4a1a1a','#1f3a4a','#2a3a2f','#3a2a1a','#5b1f2b']},
  contemporanea:{name:'Contemporánea',wood:'#eceae6',panel:'#f5f3ef',plank:'#ffffff',acc:'#d9764a',pattern:'none',font:'modern',light:1,d:['#bdb6a8','#f1e6d8','#d9764a'],
    decor:['planta','taza','marco','libros'], spines:['#d9764a','#6a8a7a','#e6c46a','#9ab8d8','#22201d']},
  terror:{name:'Terror y gótico',wood:'#1d1b1c',panel:'#120f10',plank:'#3a3335',acc:'#c0343a',pattern:'diamond',font:'cinzel',d:['#4a4244','#d9d0cc','#c0343a'],
    decor:['calavera','vela','murcielago','gato','llave','luna','pergamino'],
    spines:['#2a1215','#3b0f16','#1b1b24','#4a1a1a','#26222a','#5b1d22','#2b2b2b','#3a2a3a']},
  thriller:{name:'Thriller y misterio',wood:'#2c3236',panel:'#1a2024',plank:'#454e55',acc:'#d0a24a',pattern:'stripes',font:'modern',d:['#59636b','#d7d2c4','#d0a24a'],
    decor:['lupa','llave','reloj','taza','gato','lampara','pergamino'],
    spines:['#1f3a44','#3a3f45','#5a3a2a','#2a2f3a','#4a4a2a','#6a2e2e','#233c3c','#4b4b55']},
  psicologia:{name:'Psicología',wood:'#c9a97f',panel:'#e8e0d2',plank:'#b9966a',acc:'#3a7d6e',pattern:'none',font:'serif',light:1,d:['#8e6f4c','#c4b08e','#3a7d6e'],
    decor:['cerebro','planta','taza','reloj','lampara','libros','lupa','pluma'],
    spines:['#3a7d6e','#c76f4b','#5a6f9a','#b79a4a','#8a5a7a','#4a6a5a','#a8574a','#6a8a9a']},
  ciencia:{name:'Ciencia',wood:'#7c6246',panel:'#d9e4e6',plank:'#9a7d5c',acc:'#2f7da6',pattern:'grid',font:'modern',light:1,d:['#6a5a48','#a3b8bd','#2f7da6'],
    decor:['adn','probeta','globo','planeta','lupa','telescopio','reloj'],
    spines:['#2f7da6','#4a8a5a','#a8573a','#6a5a9a','#2a5a6a','#b08a3a','#4a4a6a','#7a4a5a']},
  clasicos:{name:'Clásicos e histórica',wood:'#5a3e2b',panel:'#3a291f',plank:'#7a5a40',acc:'#b08d57',pattern:'diamond',font:'serif',d:['#8a6a48','#eadcc0','#c9a05a'],
    decor:['globo','pluma','reloj','libros','vela','pergamino','lampara'],
    spines:['#5a2a24','#2a3a2a','#3a2f4a','#6a4a24','#24394a','#4a2430','#5a5a3a','#3a3a3a']},
  romance:{name:'Romance y juvenil',wood:'#e2c4a6',panel:'#f3dfe0',plank:'#efd7bd',acc:'#d6537a',pattern:'dots',font:'serif',light:1,d:['#c99a7a','#e3bfae','#d6537a'],
    decor:['corazon','flor','taza','estrellas','planta','marco','rosa','gato'],
    spines:['#d6537a','#e9a0b4','#f0c58a','#8ab8b0','#b58ac0','#e07a5a','#7a9ac8','#f2d68a']},
  generico:{name:'General',wood:'#7a5a3c',panel:'#2a2220',plank:'#9a7650',acc:'#c08a4a',pattern:'stripes',font:'serif',d:['#8a6a48','#eadcc0','#c9a05a'],
    decor:['libros','planta','vela','taza','lampara','reloj'],
    spines:['#6a2a2a','#2a4a3a','#2a3a5a','#6a4a2a','#4a2a5a','#5a5a2a','#2a5a5a','#5a2a3a']}
};
const PRESET_KW = [
  ['romantasy', /romantas|\bfae\b|hadas|fairy/],
  ['darkacademia', /dark academia|academia oscura/],
  ['contemporanea', /contempor|literaria|actual/],
  ['romance', /romance|romant|juvenil|young adult|\bya\b/],
  ['fantasia', /fantas|magia|dragon|epic|brujer|brujas/],
  ['cienciaficcion', /ciencia ficci|sci-?fi|distop|espacial|cyberpunk|futur/],
  ['terror', /terror|horror|gotic|miedo|macabr/],
  ['thriller', /thriller|misterio|policia|negra|crimen|suspense|detective/],
  ['psicologia', /psicolog|mente|terapia|cognitiv|neuro|emocion/],
  ['ciencia', /ciencia|biolog|bioinform|medic|genetic|quimic|fisic|matemat|program|datos|tecnolog/],
  ['clasicos', /clasic|histor|antigu|literatur|poesia|filosof/]
];
const DECOR_KW = [
  [/cafe|te\b|cocina|receta|gastronom/, ['taza','planta','libros','reloj']],
  [/viaje|aventura|geograf|mundo/, ['globo','lupa','llave','pergamino','planta']],
  [/arte|dise|foto|pintur/, ['marco','lampara','pluma','estrellas','planta']],
  [/musica|poesia|poema/, ['pluma','luna','estrellas','flor','vela']],
  [/espacio|astro|cosmos/, ['planeta','cohete','telescopio','estrellas','luna']],
  [/anim|gato|mascota|natur/, ['gato','planta','flor','luna']],
  [/negocio|empresa|econom|finanz|product/, ['reloj','lampara','globo','libros','taza']],
  [/historia|guerra|medieval/, ['espada','pergamino','corona','globo','vela']]
];
function detectPreset(name, tipo){
  const t = norm((tipo || '') + ' ' + (name || ''));
  for(const [k, re] of PRESET_KW) if(re.test(t)) return k;
  return 'gen';
}
function unitStyle(u){
  let p = PRESETS[u.preset];
  if(!p){ // paleta generada a partir del nombre: tono único y decoración según el tema
    const h = u.hue ?? hash(u.name || 'x') % 360;
    const t = norm((u.tipo || '') + ' ' + (u.name || ''));
    let decor = PRESETS.generico.decor;
    for(const [re, list] of DECOR_KW) if(re.test(t)){ decor = list; break; }
    p = { name:'Personalizada', wood:hslHex(h, 32, 24), panel:hslHex(h, 26, 12), plank:hslHex(h, 30, 36), acc:hslHex((h + 30) % 360, 62, 62),
      pattern:['stripes','dots','grid','diamond'][h % 4], font:['serif','modern','cinzel'][h % 3],
      d:[hslHex(h, 22, 38), hslHex(h, 30, 88), hslHex((h + 30) % 360, 70, 60)], decor,
      spines:[0,1,2,3,4,5,6,7].map(i => hslHex((h + i * 37) % 360, 38 + (i % 3) * 6, 26 + (i % 4) * 4)) };
  }
  const wood = u.wood || p.wood;
  return { ...p, wood, decorList: (u.decor && u.decor.length ? u.decor : p.decor) };
}
function unitVars(u){
  const s = unitStyle(u);
  const hi = lum(s.plank) > .5 ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.18)';
  return `--wood:${s.wood};--panel:${s.panel};--plank:${s.plank};--plank-hi:${hi};--d1:${s.d[0]};--d2:${s.d[1]};--d3:${s.d[2]};--wood-ink:${textOn(s.wood)};--panel-ink:${textOn(s.panel)}`;
}

/* ---------- Búsqueda en Google Books y Open Library ---------- */
const https = u => (u || '').replace(/^http:/, 'https:');
function stripHtml(h){
  if(!h) return '';
  const d = new DOMParser().parseFromString(String(h).replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n'), 'text/html');
  return d.body.textContent.replace(/\n{3,}/g, '\n\n').trim();
}
const yearOf = s => { const m = String(s || '').match(/\d{4}/); return m ? +m[0] : null; };
async function getJson(url, signal){
  const r = await fetch(url, { signal });
  if(!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
async function searchGoogle(q, signal, lang){
  const u = 'https://www.googleapis.com/books/v1/volumes?printType=books&maxResults=8&q=' + encodeURIComponent(q) + (lang ? '&langRestrict=' + lang : '');
  const j = await getJson(u, signal);
  return (j.items || []).map(it => {
    const v = it.volumeInfo || {}, im = v.imageLinks || {};
    let cover = https(im.thumbnail || im.smallThumbnail || '').replace('&edge=curl', '').replace('zoom=1', 'zoom=2');
    return { src:'g', title:v.title || '', author:(v.authors || []).join(', '), year:yearOf(v.publishedDate), pages:v.pageCount || 0,
      lang:v.language || '', covers:cover ? [cover] : [], subjects:v.categories || [], desc:stripHtml(v.description), descLang:v.language || '',
      seriesN:(v.seriesInfo && +v.seriesInfo.bookDisplayNumber) || 0 };
  }).filter(x => x.title);
}
async function searchOpenLib(q, signal){
  const u = 'https://openlibrary.org/search.json?limit=8&fields=key,title,author_name,first_publish_year,number_of_pages_median,language,cover_i,subject&q=' + encodeURIComponent(q);
  const j = await getJson(u, signal);
  return (j.docs || []).map(d => ({ src:'o', title:d.title || '', author:(d.author_name || []).slice(0, 2).join(', '), year:d.first_publish_year || null,
    pages:d.number_of_pages_median || 0, olLangs:d.language || [], covers:d.cover_i ? ['https://covers.openlibrary.org/b/id/' + d.cover_i + '-L.jpg'] : [],
    subjects:(d.subject || []).slice(0, 25) })).filter(x => x.title);
}
const bookKey = x => norm(x.title).replace(/[^a-z0-9]/g, '').slice(0, 24) + '|' + norm((x.author || '').split(',')[0]).split(' ').pop();
async function searchBooks(q, signal){
  // Tres búsquedas a la vez: Google (general y solo ediciones en español) y Open Library.
  const [g, ge, o] = await Promise.allSettled([searchGoogle(q, signal), searchGoogle(q, signal, 'es'), searchOpenLib(q, signal)]);
  if(signal.aborted) return null;
  const nq = norm(q), score = x => (norm(x.title).includes(nq) || nq.includes(norm(x.title)) ? 0 : 1);
  const gi = [...(g.status === 'fulfilled' ? g.value : []), ...(ge.status === 'fulfilled' ? ge.value : [])].sort((a, b) => score(a) - score(b)), oi = o.status === 'fulfilled' ? o.value : [];
  const map = new Map();
  for(const x of [...gi, ...oi]){
    const k = bookKey(x), cur = map.get(k);
    if(!cur){ map.set(k, { ...x }); continue; }
    cur.covers = [...new Set([...cur.covers, ...x.covers])];
    cur.subjects = [...new Set([...(cur.subjects || []), ...(x.subjects || [])])];
    cur.pages = cur.pages || x.pages; cur.year = x.year || cur.year;
    cur.desc = cur.desc || x.desc; cur.descLang = cur.descLang || x.descLang; cur.lang = cur.lang || x.lang;
    cur.olLangs = cur.olLangs || x.olLangs; cur.seriesN = cur.seriesN || x.seriesN;
  }
  return { items:[...map.values()].sort((a, b) => score(a) - score(b)).slice(0, 10), failed: g.status === 'rejected' && ge.status === 'rejected' && o.status === 'rejected' };
}
/* Completa un resultado: sinopsis en español si existe, idiomas de todas las ediciones, materias */
async function enrichBook(item, signal){
  const out = { ...item };
  const author = (item.author || '').split(',')[0];
  const tasks = [];
  if(!out.olLangs || !out.olLangs.length){
    tasks.push(searchOpenLib(item.title + ' ' + author, signal).then(list => {
      const m = list.find(x => bookKey(x) === bookKey(item)) || list[0];
      if(m){ out.olLangs = m.olLangs; out.subjects = [...new Set([...(out.subjects || []), ...(m.subjects || [])])]; out.year = m.year || out.year; out.pages = out.pages || m.pages; out.covers = [...new Set([...(out.covers || []), ...m.covers])]; }
    }).catch(() => {}));
  }
  if(!out.desc || out.descLang !== 'es'){
    tasks.push(searchGoogle('intitle:' + item.title + (author ? ' inauthor:' + author : ''), signal, 'es').then(list => {
      const m = list.find(x => x.desc && bookKey(x) === bookKey(item)) || list.find(x => x.desc && norm(x.title) === norm(item.title));
      if(m){ out.desc = m.desc; out.descLang = 'es'; if(!out.covers.length) out.covers = m.covers; out.pages = out.pages || m.pages; }
    }).catch(() => {}));
  }
  tasks.push(wikidataInfo(item.title, author, signal).then(w => { if(w) out.wd = w; }).catch(() => {}));
  await Promise.all(tasks);
  // Con el título en español de Wikidata se busca la edición española (sinopsis e idioma)
  if(out.wd && out.wd.esTitle && (out.descLang !== 'es' || !out.esFound)){
    try{
      const list = await searchGoogle('intitle:' + out.wd.esTitle + (author ? ' inauthor:' + author : ''), signal, 'es');
      const m = list.find(x => x.lang === 'es' && (!author || norm(x.author).includes(norm(author).split(' ').pop())));
      if(m){ out.esFound = true; if(m.desc){ out.desc = m.desc; out.descLang = 'es'; } }
    }catch(e){}
  }
  return out;
}
/* Wikidata: serie, número dentro de la serie, total y si existe en español o inglés */
async function wikidataInfo(title, author, signal){
  const api = 'https://www.wikidata.org/w/api.php?format=json&origin=*&';
  const clean = String(title || '').replace(/\s*[(:].*$/, '').trim(); if(!clean) return null;
  const last = norm(author || '').split(' ').pop();
  const searches = await Promise.all(['es', 'en'].map(l => getJson(api + 'action=wbsearchentities&type=item&limit=7&language=' + l + '&uselang=' + l + '&search=' + encodeURIComponent(clean), signal).catch(() => ({}))));
  const cands = []; const seen = new Set();
  searches.forEach(s => (s.search || []).forEach(r => { if(seen.has(r.id)) return; seen.add(r.id); const d = norm(r.description || '');
    const bookish = /novel|novela|book|libro|saga|trilog|fantasy|fantasia|romance/.test(d), byAuthor = last && d.includes(last);
    if(byAuthor || (!last && bookish)) cands.push({ id:r.id, byAuthor, bookish }); }));
  if(!cands.length) return null;
  cands.sort((a, b) => (b.byAuthor - a.byAuthor) || (b.bookish - a.bookish));
  const ids = cands.slice(0, 4).map(c => c.id);
  const ent = (await getJson(api + 'action=wbgetentities&props=claims|sitelinks|labels&languages=es|en&ids=' + ids.join('|'), signal)).entities || {};
  const e = ids.map(i => ent[i]).find(x => x && x.claims && x.claims.P50) || ent[ids[0]]; if(!e) return null;
  const val = (c) => c && c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value;
  const out = { id:e.id, es:!!(e.sitelinks && e.sitelinks.eswiki), en:!!(e.sitelinks && e.sitelinks.enwiki),
    esTitle:e.labels && e.labels.es ? e.labels.es.value : '', enTitle:e.labels && e.labels.en ? e.labels.en.value : '' };
  const langs = (e.claims.P407 || []).map(c => (val(c) || {}).id);
  if(langs.includes('Q1321')) out.es = true; if(langs.includes('Q1860')) out.en = true;
  const sc = (e.claims.P179 || [])[0];
  if(sc && val(sc)){
    const sid = val(sc).id, q = sc.qualifiers && sc.qualifiers.P1545, n = q && q[0] && q[0].datavalue ? parseInt(q[0].datavalue.value, 10) : 0;
    const se = ((await getJson(api + 'action=wbgetentities&props=claims|labels&languages=es|en&ids=' + sid, signal)).entities || {})[sid];
    if(se){
      const name = (se.labels.es || se.labels.en || {}).value || '';
      const parts = (se.claims && se.claims.P527 || []).length, qty = val((se.claims && se.claims.P1114 || [])[0]);
      const total = parts || (qty && parseInt(qty.amount, 10)) || 0;
      if(name) out.series = { name, n:n || '', total:total || '' };
    }
  }
  return out;
}
function detectLangs(item){
  const set = new Set();
  if(item.wd){ if(item.wd.es) set.add('es'); if(item.wd.en) set.add('en'); }
  if(item.esFound) set.add('es');
  for(const l of item.olLangs || []){ if(l === 'spa') set.add('es'); if(l === 'eng') set.add('en'); }
  if(item.lang === 'es') set.add('es'); if(item.lang === 'en') set.add('en');
  return [...set];
}

/* ---------- Etiquetas y estantería sugerida ---------- */
const TAGMAP = [
  ['fantasía', ['fantasy','fantasia','magic','magia','wizard','sword','espada','elves','elfos']],
  ['épica', ['epic fantasy','fantasia epica','epica','epic','quest','kingdom','reino']],
  ['gótica', ['gothic','gotic','manor','mansion','haunted','victorian','victoriana']],
  ['romance', ['romance','love stories','romantic','historias de amor','novela romantica']],
  ['fae', ['fae','faerie','faery','fairies','hadas','fairy']],
  ['brujas', ['witch','bruja','sorcer']],
  ['dragones', ['dragon']],
  ['ciencia ficción', ['science fiction','ciencia ficcion','sci-fi','space opera','alien','robot']],
  ['distopía', ['dystopi','distopi']],
  ['terror', ['horror','terror']],
  ['thriller', ['thriller','suspense','suspenso']],
  ['misterio', ['mystery','misterio','detective','murder','asesinato']],
  ['histórica', ['historical fiction','novela historica','historical']],
  ['juvenil', ['young adult','juvenil','teen']],
  ['clásico', ['classic','clasic']],
  ['psicología', ['psycholog','psicolog','cognitive']],
  ['ensayo', ['essay','ensayo']],
  ['ciencia', ['science','ciencia','biolog','genetic','neuro']],
  ['no ficción', ['nonfiction','non-fiction','no ficcion','biography','memoir','biografia']]
];
function suggestTags(item){
  const hay = norm([...(item.subjects || []), item.desc || '', item.title || ''].join(' | '));
  const out = [];
  for(const [tag, kws] of TAGMAP) if(kws.some(k => hay.includes(norm(k)))) out.push(tag);
  if(out.includes('fantasía') && out.includes('romance')) out.unshift('romantasy');
  return [...new Set(out)].slice(0, 6);
}
function suggestShelf(state, tags){
  // Las etiquetas están ordenadas de más a menos específica: las primeras pesan un poco más al desempatar.
  const nt = tags.map(norm); let best = null, score = 0;
  for(const u of state.units){
    const un = norm(u.name);
    for(const sh of u.shelves){
      const sn = norm(sh.name); let s = 0;
      nt.forEach((t, i) => {
        const w = 1 + (nt.length - i) * 0.05;
        if(sn === t) s += 4 * w; else if(sn && (sn.includes(t) || t.includes(sn))) s += 2 * w;
        if(un === t) s += 3 * w; else if(un && (un.includes(t) || t.includes(un))) s += 1 * w;
      });
      if(s > score){ score = s; best = { unitId:u.id, shelfId:sh.id }; }
    }
  }
  return best;
}
