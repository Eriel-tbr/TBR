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

/* ---------- Completar fichas (desde Estanterías) ---------- */
function openFill(){
  const sh = openSheet(sheetT('Completar fichas', `<p class="note">Busca las sinopsis que faltan y las que están en inglés si el libro está traducido. Las tuyas no se tocan.</p>
    <button class="btn primary" type="button" data-do="fillsyn">Completar sinopsis</button><div class="note" id="s-fill" aria-live="polite"></div>`));
  sh.addEventListener('click', e => { const b = e.target.closest('[data-do="fillsyn"]'); if(b) fillSynopses(b, $('#s-fill', sh)); });
}
