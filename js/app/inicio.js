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
    if(a === 'addDecor') openAddDecor(act.dataset.unit); else if(a === 'editUnit') openUnitForm(act.dataset.unit); else if(a === 'newUnit') openUnitForm(null);
    else if(a === 'clearFilters'){ ui.filters = { q:'', status:'', lang:'', tags:[], len:'' }; renderAll(); }
    else if(a === 'clearExamples'){ const n = state.books.filter(b => b.ejemplo).length; state.books = state.books.filter(b => !b.ejemplo); state.units.forEach(u => u.shelves.forEach(s => s.order = s.order.filter(id => bookOf(id)))); save(); renderAll(); toast(`${n} libros de ejemplo borrados`); }
    return;
  }
  const tab = g('#tabs [data-i]'); if(tab) goTo(+tab.dataset.i);
});
document.addEventListener('keydown', e => { const p = e.target.closest && e.target.closest('.crown-hit'); if(p && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); p.click(); } });
$('#btnFilter').addEventListener('click', openFilters);
$('#fillnote').addEventListener('click', openFill);
$('#btnRandom').addEventListener('click', openRandom);
$('#btnSettings').addEventListener('click', openSettings);
$('#navAdd').addEventListener('click', openAdd);
$$('.bottombar [data-view]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
$('#stats').addEventListener('click', () => showView('reading'));
setInterval(() => { const s = $$('#stats .st'); if(s.length < 2 || document.hidden) return; ui.hdrI = ((ui.hdrI || 0) + 1) % s.length; s.forEach((x, i) => x.classList.toggle('on', i === ui.hdrI)); }, 4000);

/* ---------- Inicio ---------- */
applyTheme(); renderAll();
loadAppFonts().then(() => renderCarousel());
let rzT = 0; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { if(Math.abs($('#carousel').clientWidth - ui.width) > 4) renderCarousel(); }, 200); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setAccent);
if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
initCloud();
/* Colores de portada para los lomos automáticos: se calculan poco a poco y se guardan con el libro (coverPal) */
const palFailed = new Set();
async function refreshCoverPals(){
  if(refreshCoverPals.busy) return; refreshCoverPals.busy = true; let n = 0;
  const paint = () => { if(typeof drag !== 'undefined' && drag) return setTimeout(paint, 1500); save(); renderCarousel(); };
  try{
    for(const b of [...state.books]){
      const src = b.coverData || b.cover || b.cover2 || '';
      if(!src || b.coverPalSrc === src || palFailed.has(src)) continue;
      const p = await coverPalette(src), cur = bookOf(b.id); if(!cur) continue;
      if(p && p.length){ cur.coverPal = p.slice(0, 3); cur.coverPalSrc = src; if(++n % 5 === 0) paint(); } else palFailed.add(src);
    }
  }catch(e){} finally{ refreshCoverPals.busy = false; if(n) paint(); }
}
setTimeout(refreshCoverPals, 2500);
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
/* Actualizar: se descarga el service worker nuevo (con todos los archivos de la versión nueva) y se recarga cuando ya manda él */
$('#btnUpdate').addEventListener('click', async () => {
  $('#btnUpdate').disabled = true; $('#btnUpdate').textContent = 'Actualizando…';
  try{
    const sw = navigator.serviceWorker, reg = sw && await sw.getRegistration();
    if(reg){ const changed = new Promise(r => sw.addEventListener('controllerchange', r, { once:true }));
      await reg.update(); if(reg.installing || reg.waiting) await Promise.race([changed, new Promise(r => setTimeout(r, 6000))]); }
  }catch(e){}
  location.reload();
});
checkUpdate();
document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') checkUpdate(); });
