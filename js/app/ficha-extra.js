'use strict';
/* Mi TBR — partes de la ficha que miran fuera: serie completa, audiolibros y enlaces a tiendas */

/* Título original (para buscar en fuentes en inglés) y título en español, si se conocen */
const titlesOf = b => ({ t:b.origTitle || b.title, es:b.origTitle ? b.title : (b.esTitle || '') });
const enc = encodeURIComponent;

/* ---------- Buscar en tiendas ---------- */
/* Solo enlaces: la app no lee datos de estas webs. Con ISBN español si lo hay (búsqueda exacta), si no título + autor/a. */
function storeLinksHtml(b){
  const isbn = ((b.eds || []).find(e => e.isbn) || {}).isbn || '', q = isbn || `${b.title} ${lastName(b.author)}`.trim();
  const { t } = titlesOf(b), qEn = `${t} ${lastName(b.author)}`.trim();
  const links = [
    ['Amazon.es', `https://www.amazon.es/s?k=${enc(q)}&i=stripbooks`],
    ['Buscalibre', `https://www.buscalibre.es/libros/search?q=${enc(q)}`],
    ['Casa del Libro', `https://www.google.com/search?q=${enc('site:casadellibro.com ' + q)}`]
  ];
  // En inglés: Books2Door y Come In (librería inglesa de Barcelona; su buscador solo encuentra por título, sin autor/a)
  const linksEn = [
    ['Books2Door', `https://www.books2door.com/search?q=${enc(qEn)}`],
    ['Come In', `https://www.libreriainglesa.com/producto/listadobuscar?buscar=${enc(t)}`]
  ];
  const chips = l => `<div class="chips">${l.map(([n, u]) => `<a class="chip" href="${esc(u)}" target="_blank" rel="noopener">${esc(n)} ↗</a>`).join('')}</div>`;
  const found = (b.edsEn || []).filter(e => e.url).slice(0, 6);
  return `<div class="sec"><span class="lbl">Comprar en español</span>${chips(links)}</div>
    <div class="sec"><span class="lbl">Comprar en inglés</span>${chips(linksEn)}${found.length ? `<div class="eds"><span class="note">Encontradas en Books2Door:</span>${found.map(e => `<a href="${esc(e.url)}" target="_blank" rel="noopener">${[e.title, FMT_NAME[e.fmt], e.price, e.available === false ? 'agotado' : ''].filter(Boolean).map(esc).join(' · ')}</a>`).join('')}</div>` : ''}</div>`;
}

/* ---------- Mis ediciones: por formato, «Por comprar» o «Lo tengo» (b.formats) ----------
   Cada toque pasa al siguiente: nada → por comprar → lo tengo → nada. ES / EN: en qué idioma se ha encontrado ese formato. */
const OWN_NEXT = { '':'quiero', quiero:'tengo', tengo:'' }, OWN_TXT = { quiero:'por comprar', tengo:'lo tengo' };
function ownHtml(b){
  const av = edAvail(b), f = b.formats || {};
  return `<div class="sec" id="d-own"><span class="lbl">Mis ediciones</span><div class="chips">${FORMATS.map(([k, l]) => `<button class="chip own" type="button" data-own="${k}" data-st="${f[k] || ''}" aria-pressed="${f[k] === 'tengo'}">${esc(l)}${f[k] ? ` · <b>${OWN_TXT[f[k]]}</b>` : ''}${av[k] ? ` <small>${av[k]}</small>` : ''}</button>`).join('')}</div></div>`;
}
/* ---------- Audiolibro ---------- */
const AUDIO_TTL = 30 * 86400000, AUDIO_V = 2; // AUDIO_V sube cuando cambian las fuentes (2 = con Audible): lo guardado antes se vuelve a buscar
const AUD_STORE = { audible:'Audible', apple:'Apple Books', hardcover:'Hardcover' };
const hms = s => { const h = Math.floor(s / 3600), m = Math.round(s % 3600 / 60); return h ? `${h} h ${m} min` : `${m} min`; };
function audioHtml(b, st){
  const a = b.audio || {}, items = a.items || [], drama = !!b.audioDrama;
  const row = i => `<li class="aud"><div><b>${esc(i.title)}</b> <span class="badge ${i.lang || ''}">${i.lang === 'es' ? 'ES' : i.lang === 'en' ? 'EN' : '¿idioma?'}</span>${i.dramaSure ? ' <span class="badge">dramatizado</span>' : i.drama ? ' <span class="badge">¿dramatizado?</span>' : ''}${i.abridged ? ' <span class="badge">abreviado</span>' : ''}</div>
    <div class="note">${esc([i.store, i.seconds ? hms(i.seconds) : '', (i.narrators || []).length ? 'narra ' + i.narrators.join(', ') : '', i.publisher, i.year, i.price].filter(Boolean).join(' · '))}</div>
    ${i.url ? `<a href="${esc(i.url)}" target="_blank" rel="noopener">Ver en ${AUD_STORE[i.src] || 'Hardcover'} ↗</a>` : ''}</li>`;
  const { t, es } = titlesOf(b), q = `${es || t} ${lastName(b.author)}`.trim();
  return `<div class="sec" id="d-audio"><span class="lbl">Audiolibro</span>
    ${st === 'busy' ? '<p class="note">Buscando audiolibros…</p>' : st === 'error' ? '<p class="note">No se pudo consultar ahora. Prueba más tarde.</p>'
      : a.at ? (items.length ? `<ul class="auds">${items.slice(0, 6).map(row).join('')}</ul>` : '<p class="note">No he encontrado audiolibro en Audible, Apple Books ni Hardcover.</p>') : ''}
    <label class="switch">Lo tengo o quiero en versión dramatizada<input type="checkbox" data-adrama ${drama ? 'checked' : ''}></label>
    <div class="chips"><button class="chip" type="button" data-xdo="audio">${a.at ? 'Volver a buscar' : 'Buscar audiolibro'}</button>
      <a class="chip" href="https://www.audible.es/search?keywords=${enc(q)}" target="_blank" rel="noopener">Audible ↗</a>
      <a class="chip" href="https://www.google.com/search?q=${enc('site:storytel.com ' + q)}" target="_blank" rel="noopener">Storytel ↗</a>
      <a class="chip" href="https://open.spotify.com/search/${enc(q)}/audiobooks" target="_blank" rel="noopener">Spotify ↗</a></div>
    ${items.some(i => i.drama && !i.dramaSure) ? '<p class="note">«¿Dramatizado?» es solo una sospecha por el título.</p>' : ''}</div>`;
}
const audioBusy = new Set(), seriesBusy = new Set(), xSt = {}; // xSt[id] = { a, s }: estado de la búsqueda de audiolibro y de serie
async function loadAudio(id, paint){
  const b = bookOf(id); if(!b || audioBusy.has(id)) return; audioBusy.add(id);
  const { t, es } = titlesOf(b);
  paint('busy');
  try{
    const url = API_BASE + `api/audio?t=${enc(t)}&es=${enc(es)}&a=${enc(b.author || '')}`;
    let r = await fetchTimeout(url, null, 15000).catch(() => null);
    if(!r || r.status >= 500) r = await fetchTimeout(url, null, 15000);
    if(!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json(), cur = bookOf(id); if(!cur) return;
    cur.audio = { v:AUDIO_V, at:Date.now(), items:(j.items || []).slice(0, 8) };
    save(); paint('');
  }catch(e){ paint('error'); }
  finally{ audioBusy.delete(id); }
}

/* ---------- Serie completa ---------- */
const SERIES_KEY = 'tbr.series.v1', SERIES_TTL = 14 * 86400000, SERIES_WAIT = 800; // ms sin escribir antes de buscar los tomos
const seriesCache = (() => { try{ return JSON.parse(localStorage.getItem(SERIES_KEY)) || {}; }catch(e){ return {}; } })();
const saveSeriesCache = () => { try{ localStorage.setItem(SERIES_KEY, JSON.stringify(seriesCache)); }catch(e){} };
function seriesHtml(b, st){
  if(!b.series || !b.series.name) return '';
  const k = serKey(b), mine = seriesMembers(state, k).sort((x, y) => (+x.series.n || 99) - (+y.series.n || 99)), total = seriesTotal(state, b);
  const remote = (seriesCache[k] || {}).data, rows = new Map();
  mine.forEach(x => { const n = +x.series.n || 0; rows.set(n || 'x' + x.id, { n, own:x }); });
  if(remote) remote.books.filter(r => r.main).forEach(r => { const cur = rows.get(r.n); if(cur) cur.remote = r; else rows.set(r.n, { n:r.n, remote:r }); });
  for(let n = 1; n <= Math.max(total, remote ? remote.total : 0); n++) if(!rows.has(n)) rows.set(n, { n });
  const list = [...rows.values()].sort((x, y) => (x.n || 99) - (y.n || 99));
  const missing = list.filter(r => !r.own).length;
  const li = r => r.own ? `<li class="ser-row own${r.own.id === b.id ? ' cur' : ''}"><span class="ser-n">${r.n || '?'}</span><button type="button" class="ser-t" data-open-book="${r.own.id}">${esc(r.own.title)}</button><span class="badge">${STATUS[r.own.status || 'pendiente']}</span></li>`
    : `<li class="ser-row miss"><span class="ser-n">${r.n}</span><span class="ser-t">${r.remote ? esc(r.remote.title) + (r.remote.year ? ` <span class="note">(${r.remote.year})</span>` : '') : '<span class="note">No lo tienes</span>'}</span>${r.remote ? `<button class="btn sm" type="button" data-addvol="${r.n}">Añadir</button>` : ''}</li>`;
  return `<div class="sec" id="d-serie"><span class="lbl">Serie · ${esc(b.series.name)}</span>
    <p class="note">${mine.length} de ${Math.max(total, remote ? remote.total : 0) || '?'} en tu estantería${missing ? ` · te ${missing === 1 ? 'falta' : 'faltan'} ${missing}` : ''}.</p>
    <ol class="ser">${list.map(li).join('')}</ol>
    ${st === 'busy' ? '<p class="note">Buscando los tomos de la serie…</p>' : st === 'error' ? '<p class="note">No he encontrado esta serie en Hardcover.</p>' : ''}
    ${remote ? `<p class="note">Títulos de los que faltan según <a href="${esc(remote.url || 'https://hardcover.app')}" target="_blank" rel="noopener">Hardcover</a> (suelen ser los originales en inglés).</p>`
      : `<button class="chip" type="button" data-xdo="serie">Ver los tomos que faltan</button>`}</div>`;
}
/* Tomos de una serie (Hardcover vía api/serie), con caché. Sirve también para un libro que aún no está guardado */
async function fetchSeriesData(name, title, author){
  const k = norm(name), c = seriesCache[k]; if(c && Date.now() - c.at < SERIES_TTL) return c.data;
  const url = API_BASE + `api/serie?s=${enc(name)}&t=${enc(title || '')}&a=${enc(author || '')}`;
  let r = await fetchTimeout(url, null, 15000).catch(() => null);
  if(!r || r.status >= 500) r = await fetchTimeout(url, null, 15000);
  if(!r.ok) throw new Error('HTTP ' + r.status);
  seriesCache[k] = { at:Date.now(), data:await r.json() }; saveSeriesCache(); return seriesCache[k].data;
}
/* Libros añadidos de golpe (tomos de una saga): se completan en segundo plano con portada, páginas, año, sinopsis e idiomas */
async function completeNewBooks(ids){
  // Lo mismo que «Completar fichas» (edición española si está traducido); si el tomo de partida usa el título en español, este también
  for(const id of ids){
    try{
      await fillOne(id, new AbortController().signal); const b = bookOf(id); if(!b) continue;
      if(b.useEs && b.esTitle && !b.origTitle){ b.origTitle = b.title; b.title = b.esTitle; delete b.esTitle; }
      delete b.useEs; save(); renderAll();
    }catch(e){}
  }
  ids.forEach(id => { const b = bookOf(id); if(b && b.useEs){ delete b.useEs; save(); } });
  if(typeof refreshCoverPals === 'function') refreshCoverPals();
}
async function loadSeries(id, paint){
  const b = bookOf(id); if(!b || !b.series) return;
  const k = serKey(b), { t } = titlesOf(b); if(seriesBusy.has(k)) return; seriesBusy.add(k);
  paint('busy');
  try{
    const url = API_BASE + `api/serie?s=${enc(b.series.name)}&t=${enc(t)}&a=${enc(b.author || '')}`;
    let r = await fetchTimeout(url, null, 15000).catch(() => null);
    if(!r || r.status >= 500) r = await fetchTimeout(url, null, 15000); // Hardcover a veces tarda en la primera llamada: un reintento
    if(!r.ok) throw new Error('HTTP ' + r.status);
    seriesCache[k] = { at:Date.now(), data:await r.json() }; saveSeriesCache(); paint('');
  }catch(e){ paint('error'); }
  finally{ seriesBusy.delete(k); }
}
function addVolume(b, n){
  const r = ((seriesCache[serKey(b)] || {}).data || { books:[] }).books.find(x => x.n === n); if(!r) return;
  const total = seriesTotal(state, b) || ((seriesCache[serKey(b)] || {}).data || {}).total || '';
  openBookForm({ item:{ title:r.title, author:b.author, year:r.year, pages:r.pages, covers:r.cover ? [r.cover] : [], series:{ name:b.series.name, n, total } } });
}

/* Engancha las tres partes en la ficha ya pintada */
function fichaExtras(sh, id){
  const b = bookOf(id); if(!b) return;
  // Serie en su pestaña (si la hay); audiolibro y tiendas en «Ediciones»
  // La ficha se redibuja al tocar estrellas o cambiar el estado: lo que está cargando se guarda fuera (xSt) y se pinta
  // siempre en los paneles que haya en ese momento (antes los resultados iban a los paneles viejos y la sección quedaba en blanco)
  const st = xSt[id] = xSt[id] || { a:'', s:'' };
  const paint = () => { const cur = bookOf(id), shop = $('#dshop', sh), box = $('#dextra', sh); if(!cur || !shop) return; if(box) box.innerHTML = seriesHtml(cur, st.s); shop.innerHTML = ownHtml(cur) + audioHtml(cur, st.a) + storeLinksHtml(cur); };
  st.paint = paint; // la ficha abierta más reciente es la que recibe los resultados
  const setA = v => { st.a = v; st.paint(); }, setS = v => { st.s = v; st.paint(); };
  paint();
  if((!b.audio || b.audio.v !== AUDIO_V || Date.now() - (b.audio.at || 0) > AUDIO_TTL) && !audioBusy.has(id)) loadAudio(id, setA);
  const sc = b.series && seriesCache[serKey(b)]; if(sc && Date.now() - sc.at > SERIES_TTL) loadSeries(id, setS);
  const box = $('#dextra', sh), shop = $('#dshop', sh); if(!shop) return;
  const onClick = async e => {
    const g = s => e.target.closest(s), cur = bookOf(id); if(!cur) return;
    if(g('[data-own]')){ const k = g('[data-own]').dataset.own; cur.formats = cur.formats || {}; const nx = OWN_NEXT[cur.formats[k] || ''];
      if(nx) cur.formats[k] = nx; else delete cur.formats[k]; save(); if(sh.redraw) sh.redraw(); else paint(); return; }
    if(g('[data-xdo="audio"]')) loadAudio(id, setA);
    else if(g('[data-xdo="serie"]')) loadSeries(id, setS);
    else if(g('[data-addvol]')){ const n = +g('[data-addvol]').dataset.addvol; await closeSheet(); addVolume(cur, n); }
    else if(g('[data-open-book]')){ const o = g('[data-open-book]').dataset.openBook; if(o !== id){ await closeSheet(); openDetail(o); } }
  };
  [box, shop].forEach(el => { if(!el) return; el.addEventListener('click', onClick);
    el.addEventListener('change', e => { if(e.target.matches('[data-adrama]')){ const cur = bookOf(id); cur.audioDrama = e.target.checked; save(); } }); });
}
