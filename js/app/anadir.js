'use strict';
/* Mi TBR — barra de añadir con sugerencias */
/* ---------- Añadir: búsqueda con sugerencias ---------- */
const addInput = $('#addInput'); let sAbort = null, sTimer = null, results = [];
function hideSuggest(){ $('#suggest').hidden = true; }
function suggestMsg(msg, withManual){
  const ul = $('#suggest'); ul.hidden = false;
  ul.innerHTML = `<li class="sg-note">${esc(msg)}</li>${withManual ? manualRow() : ''}`;
}
const manualRow = () => `<li><button class="sg" type="button" data-manual><span><span class="sg-t">Añadir «${esc(addInput.value.trim())}» a mano</span></span></button></li>`;
function drawResults(res, done){
  results = res.items;
  if(!results.length){ if(done) suggestMsg(res.failed ? 'No se pudo consultar internet. Puedes añadirlo a mano.' : 'Sin resultados.', true); return; }
  $('#suggest').hidden = false;
  $('#suggest').innerHTML = results.map((r, i) => `<li><button class="sg" type="button" data-pick="${i}">${r.covers[0] ? `<img class="sg-cover" src="${esc(r.covers[0])}" alt="" referrerpolicy="no-referrer" loading="lazy">` : '<span class="sg-cover"></span>'}
      <span><span class="sg-t">${esc(r.title)}</span><br><span class="sg-a">${esc(r.author || 'Autor desconocido')}${r.year ? ' · ' + r.year : ''}${r.pages ? ' · ' + r.pages + ' págs.' : ''}${r.lang === 'es' ? ' · ES' : r.lang === 'en' ? ' · EN' : ''}</span></span></button></li>`).join('')
    + (done ? '' : '<li class="sg-note">Buscando más…</li>')
    + (done && res.googleDown ? '<li class="sg-note">Google Books no ha respondido: solo hay resultados de Open Library.</li>' : '') + manualRow();
}
async function runSearch(q){
  if(sAbort) sAbort.abort(); const ac = sAbort = new AbortController(); suggestMsg('Buscando…');
  try{
    const res = await searchBooks(q, ac.signal, part => { if(sAbort === ac) drawResults(part, false); });
    if(!res || sAbort !== ac) return;
    drawResults(res, true);
  }catch(e){ if(e.name !== 'AbortError') suggestMsg('No se pudo consultar internet. Puedes añadirlo a mano.', true); }
}
addInput.addEventListener('input', () => { clearTimeout(sTimer); const q = addInput.value.trim(); if(q.length < 3){ hideSuggest(); return; } sTimer = setTimeout(() => runSearch(q), 350); });
addInput.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); clearTimeout(sTimer); const q = addInput.value.trim(); if(q.length >= 2) runSearch(q); } });
$('#suggest').addEventListener('click', e => {
  const p = e.target.closest('[data-pick]'), m = e.target.closest('[data-manual]');
  if(p){ const it = results[+p.dataset.pick]; hideSuggest(); addInput.value = ''; openBookForm({ item:it }); }
  else if(m){ const t = addInput.value.trim(); hideSuggest(); addInput.value = ''; openBookForm({ item:{ title:t } }); }
});
document.addEventListener('click', e => { if(!e.target.closest('.addbar')) hideSuggest(); });
$('#btnAddManual').addEventListener('click', () => { const t = addInput.value.trim(); hideSuggest(); addInput.value = ''; openBookForm({ item:t ? { title:t } : null }); });
