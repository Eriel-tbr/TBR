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
    ['Casa del Libro', `https://www.google.com/search?q=${enc('site:casadellibro.com ' + q)}`],
    ...((b.langs || []).includes('en') ? [['Books2Door', `https://www.books2door.com/search?q=${enc(qEn)}`]] : [])
  ];
  return `<div class="sec"><span class="lbl">Buscar en</span><div class="chips">${links.map(([l, u]) => `<a class="chip" href="${esc(u)}" target="_blank" rel="noopener">${esc(l)} ↗</a>`).join('')}</div>
    <p class="note">${isbn ? 'Busca por el ISBN de la edición española.' : 'Busca por título y autor/a.'} Casa del Libro se abre a través de Google.</p></div>`;
}

/* ---------- Audiolibro ---------- */
const AUDIO_TTL = 30 * 86400000;
const hms = s => { const h = Math.floor(s / 3600), m = Math.round(s % 3600 / 60); return h ? `${h} h ${m} min` : `${m} min`; };
function audioHtml(b, st){
  const a = b.audio || {}, items = a.items || [], drama = !!b.audioDrama;
  const row = i => `<li class="aud"><div><b>${esc(i.title)}</b> <span class="badge ${i.lang || ''}">${i.lang === 'es' ? 'ES' : i.lang === 'en' ? 'EN' : '¿idioma?'}</span>${i.drama ? ' <span class="badge">¿dramatizado?</span>' : ''}</div>
    <div class="note">${esc([i.store, i.seconds ? hms(i.seconds) : '', (i.narrators || []).length ? 'narra ' + i.narrators.join(', ') : '', i.publisher, i.year, i.price].filter(Boolean).join(' · '))}</div>
    ${i.url ? `<a href="${esc(i.url)}" target="_blank" rel="noopener">${i.src === 'apple' ? 'Ver en Apple Books' : 'Ver en Hardcover'} ↗</a>` : ''}</li>`;
  const { t, es } = titlesOf(b), q = `${es || t} ${lastName(b.author)}`.trim();
  return `<div class="sec" id="d-audio"><span class="lbl">Audiolibro</span>
    ${st === 'busy' ? '<p class="note">Buscando audiolibros…</p>' : st === 'error' ? '<p class="note">No se pudo consultar ahora. Prueba más tarde.</p>'
      : a.at ? (items.length ? `<ul class="auds">${items.slice(0, 6).map(row).join('')}</ul>` : '<p class="note">No he encontrado audiolibro en Apple Books ni en Hardcover.</p>') : ''}
    <label class="switch">Lo tengo o quiero en versión dramatizada<input type="checkbox" data-adrama ${drama ? 'checked' : ''}></label>
    <div class="chips"><button class="chip" type="button" data-xdo="audio">${a.at ? 'Volver a buscar' : 'Buscar audiolibro'}</button>
      <a class="chip" href="https://www.audible.es/search?keywords=${enc(q)}" target="_blank" rel="noopener">Audible ↗</a>
      <a class="chip" href="https://www.google.com/search?q=${enc('site:storytel.com ' + q)}" target="_blank" rel="noopener">Storytel ↗</a></div>
    <p class="note">Ninguna fuente indica si un audiolibro es dramatizado: lo marcas tú. «¿Dramatizado?» sale cuando el título o la editorial lo sugieren.</p></div>`;
}
const audioBusy = new Set(), seriesBusy = new Set();
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
    cur.audio = { at:Date.now(), items:(j.items || []).slice(0, 8) };
    save(); paint('');
  }catch(e){ paint('error'); }
  finally{ audioBusy.delete(id); }
}

/* ---------- Serie completa ---------- */
const SERIES_KEY = 'tbr.series.v1', SERIES_TTL = 14 * 86400000;
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
    <p class="note">${mine.length} de ${Math.max(total, remote ? remote.total : 0) || '?'} en tu estantería${missing ? ` · te faltan ${missing}` : ''}.</p>
    <ol class="ser">${list.map(li).join('')}</ol>
    ${st === 'busy' ? '<p class="note">Buscando los tomos de la serie…</p>' : st === 'error' ? '<p class="note">No he encontrado esta serie en Hardcover.</p>' : ''}
    ${remote ? `<p class="note">Títulos de los que faltan según <a href="${esc(remote.url || 'https://hardcover.app')}" target="_blank" rel="noopener">Hardcover</a> (suelen ser los originales en inglés).</p>`
      : `<button class="chip" type="button" data-xdo="serie">Ver los tomos que faltan</button>`}</div>`;
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
  const box = $('#dextra', sh); if(!box) return;
  let aSt = '', sSt = '';
  const paint = () => { const cur = bookOf(id); if(!cur || !box.isConnected) return; box.innerHTML = seriesHtml(cur, sSt) + audioHtml(cur, aSt) + storeLinksHtml(cur); };
  paint();
  if(!b.audio || Date.now() - (b.audio.at || 0) > AUDIO_TTL) loadAudio(id, s => { aSt = s; paint(); });
  const sc = b.series && seriesCache[serKey(b)]; if(sc && Date.now() - sc.at > SERIES_TTL) loadSeries(id, s => { sSt = s; paint(); });
  box.addEventListener('click', async e => {
    const g = s => e.target.closest(s), cur = bookOf(id); if(!cur) return;
    if(g('[data-xdo="audio"]')) loadAudio(id, s => { aSt = s; paint(); });
    else if(g('[data-xdo="serie"]')) loadSeries(id, s => { sSt = s; paint(); });
    else if(g('[data-addvol]')){ const n = +g('[data-addvol]').dataset.addvol; await closeSheet(); addVolume(cur, n); }
    else if(g('[data-open-book]')){ const o = g('[data-open-book]').dataset.openBook; if(o !== id){ await closeSheet(); openDetail(o); } }
  });
  box.addEventListener('change', e => { if(e.target.matches('[data-adrama]')){ const cur = bookOf(id); cur.audioDrama = e.target.checked; save(); } });
}
