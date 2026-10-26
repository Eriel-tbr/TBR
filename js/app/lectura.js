'use strict';
/* Mi TBR — barra de abajo: vistas (Estanterías · Lectura), añadir un libro y completar fichas */

/* ---------- Vistas ---------- */
ui.view = 'shelves';
function showView(v){
  ui.view = v;
  $('#view-shelves').hidden = v !== 'shelves'; $('#view-reading').hidden = v !== 'reading';
  $$('.bottombar [data-view]').forEach(b => b.dataset.view === v ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  if(v === 'reading') renderReading();
  scrollTo({ top:0 });
}

/* ---------- Lectura: lo que estás leyendo, la siguiente y lo leído por año ---------- */
function readingRow(b, extra = ''){
  return `<li><button class="rd" type="button" data-open="${b.id}"><span class="cv">${coverHtml(b)}</span>
    <span class="tx"><b>${esc(b.title)}</b><span>${esc([b.author, b.pages ? b.pages + ' págs.' : ''].filter(Boolean).join(' · '))}</span>${extra}</span></button></li>`;
}
function renderReading(){
  const el = $('#view-reading'); if(!el || el.hidden) return;
  const now = state.books.filter(b => b.status === 'leyendo'), next = state.books.filter(b => b.next && b.status !== 'leido');
  const read = state.books.filter(b => b.status === 'leido').sort((a, b) => (b.readAt || 0) - (a.readAt || 0));
  const years = new Map(); read.forEach(b => { const y = b.readAt ? new Date(b.readAt).getFullYear() : 'Sin fecha'; (years.get(y) || years.set(y, []).get(y)).push(b); });
  const stars = b => b.rating ? `<span class="stars-t" aria-label="${b.rating} de 5">${'★'.repeat(b.rating)}${'☆'.repeat(5 - b.rating)}</span>` : '';
  el.innerHTML = `
    <section class="rd-sec"><h2>Leyendo ahora</h2>${now.length ? `<ul class="rd-list">${now.map(b => readingRow(b)).join('')}</ul>` : '<p class="rd-empty">Nada empezado.</p>'}</section>
    <section class="rd-sec"><h2>Siguiente lectura</h2>${next.length ? `<ul class="rd-list">${next.map(b => readingRow(b)).join('')}</ul>` : '<p class="rd-empty">Sin elegir.</p>'}</section>
    <section class="rd-sec"><h2>Leídos</h2>${read.length ? [...years].map(([y, list]) => `<div class="rd-year"><span>${y}</span><span class="note">${list.length} ${list.length === 1 ? 'libro' : 'libros'}</span></div><ul class="rd-list">${list.map(b => readingRow(b, stars(b))).join('')}</ul>`).join('') : '<p class="rd-empty">Todavía ninguno.</p>'}</section>
    <section class="rd-sec"><h2>Estadísticas</h2>${statsHtml()}</section>`;
}

/* ---------- Añadir un libro (botón grande del centro) ---------- */
/* La barra de búsqueda vive escondida en #addhome y se mueve dentro de la hoja mientras está abierta */
function openAdd(){
  const bar = $('.addbar');
  const sh = openSheet(sheetT('Añadir un libro', '<div id="addslot"></div>'), () => { $('#addhome').append(bar); hideSuggest(); });
  sh.classList.add('add-sheet'); $('#addslot', sh).append(bar);
  setTimeout(() => addInput.focus(), 60);
}
/* Al elegir un resultado o «A mano», se cierra la hoja de añadir antes de abrir el formulario */
async function leaveAdd(){ if($('.sheet .addbar')) await closeSheet(); }

/* ---------- Completar fichas (aviso bajo los puntos, solo cuando hay fichas por completar) ---------- */
function fillCount(){ return state.books.filter(needsFill).length; }
function renderFillNote(){
  const el = $('#fillnote'); if(!el) return; const n = fillCount();
  el.hidden = !n && !fill.run; el.innerHTML = fill.run ? `Completando fichas · <b>${fill.done} de ${fill.total}</b>` : `${n} ${n === 1 ? 'ficha' : 'fichas'} por completar · <b>Completar</b>`;
}
function openFill(){
  const sh = openSheet(sheetT('Completar fichas', `<p class="note">Datos de la edición en español si está traducido; si no, de la original. Lo que escribiste a mano no se toca.</p>
    <button class="btn primary" type="button" data-do="fillrun"></button><div id="s-fill" aria-live="polite"></div>`), () => fill.listeners.delete(paint));
  const paint = () => {
    const btn = $('[data-do="fillrun"]', sh), out = $('#s-fill', sh); if(!btn) return; const n = fillCount();
    btn.textContent = fill.run ? (fill.run.stop ? 'Parando…' : 'Parar') : n ? `Completar ${n} ${n === 1 ? 'ficha' : 'fichas'}` : 'Todo completo'; btn.disabled = !fill.run && !n;
    const changed = fill.results.filter(r => r.ch.length), miss = fill.results.filter(r => !r.found), offers = fill.results.filter(r => r.offer && bookOf(r.id));
    out.innerHTML = (fill.run ? `<p class="note">${fill.done} de ${fill.total}${fill.cur ? ': ' + esc(fill.cur) : ''}…</p>` : fill.results.length ? `<p class="note">${changed.length} ${changed.length === 1 ? 'ficha completada' : 'fichas completadas'} de ${fill.results.length} revisadas.</p>` : '')
      + (changed.length ? `<ul class="fill-list">${changed.map(r => `<li><b>${esc(r.title)}</b>: ${esc(r.ch.join(', '))}</li>`).join('')}</ul>` : '')
      + (miss.length && !fill.run ? `<p class="note">Sin encontrar: ${miss.map(r => esc(r.title)).join(', ')}. Revisa el título y la autoría en su ficha.</p>` : '')
      + (offers.length && !fill.run ? `<div class="sec"><span class="lbl">En español también hay</span><div class="row-opts">${offers.map(r => `<button class="opt" type="button" role="checkbox" data-offer="${r.id}" aria-checked="false" style="align-items:flex-start"><span class="dot" style="margin-top:2px;border-radius:4px"></span><span>${[r.offer.esTitle ? `Título «${esc(r.offer.esTitle)}» en vez de «${esc(bookOf(r.id).title)}»` : '', r.offer.coverEs ? `portada española${r.offer.esTitle ? '' : ' de «' + esc(bookOf(r.id).title) + '»'}` : ''].filter(Boolean).join(' y ')}</span></button>`).join('')}</div>
        <button class="btn" type="button" data-do="offerapply" style="align-self:flex-start">Usar lo marcado</button></div>` : '');
  };
  fill.listeners.add(paint); paint();
  sh.addEventListener('click', e => {
    if(e.target.closest('[data-do="fillrun"]')){ runFill(); return; }
    const o = e.target.closest('[data-offer]'); if(o){ o.setAttribute('aria-checked', o.getAttribute('aria-checked') !== 'true'); return; }
    if(e.target.closest('[data-do="offerapply"]')){ let n = 0;
      $$('[data-offer][aria-checked="true"]', sh).forEach(x => { const r = fill.results.find(y => y.id === x.dataset.offer), b = bookOf(x.dataset.offer); if(!r || !b) return;
        if(r.offer.esTitle){ b.origTitle = b.origTitle || b.title; b.title = r.offer.esTitle; delete b.esTitle; }
        if(r.offer.coverEs){ b.cover2 = b.cover || b.cover2; b.cover = r.offer.coverEs; delete b.coverPal; delete b.coverPalSrc; }
        r.offer = null; n++; });
      if(n){ save(); renderAll(); setTimeout(() => typeof refreshCoverPals === 'function' && refreshCoverPals(), 500); toast(`${n} ${n === 1 ? 'libro cambiado' : 'libros cambiados'}`); } paint(); }
  });
}
