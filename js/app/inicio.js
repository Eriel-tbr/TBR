'use strict';
/* Mi TBR — eventos de la página e inicio */
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
loadAppFonts().then(() => renderCarousel());
let rzT = 0; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { if(Math.abs($('#carousel').clientWidth - ui.width) > 4) renderCarousel(); }, 200); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setAccent);
if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
initCloud();
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});

/* ---------- Aviso de versión nueva ---------- */
const APP_VERSION = (document.querySelector('meta[name="app-version"]') || {}).content || '0';
async function checkUpdate(){
  if(!location.protocol.startsWith('http')) return;
  try{
    const r = await fetch('version.json?t=' + Date.now(), { cache:'no-store' }); if(!r.ok) return;
    const { version } = await r.json();
    if(version && version !== APP_VERSION) $('#update').hidden = false;
  }catch(e){}
}
$('#btnUpdate').addEventListener('click', async () => {
  $('#btnUpdate').disabled = true; $('#btnUpdate').textContent = 'Actualizando…';
  try{ const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if(reg) await reg.update(); }catch(e){}
  location.reload();
});
checkUpdate();
document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') checkUpdate(); });
