'use strict';
/* Mi TBR — arrastrar y soltar */
/* ---------- Arrastrar y soltar ---------- */
let pend = null, drag = null, noClickUntil = 0, lastPt = { x:0, y:0 }, autoRaf = 0;
document.addEventListener('contextmenu', e => { if(e.target.closest && e.target.closest('.bk, .dcm')) e.preventDefault(); });
document.addEventListener('touchmove', e => { if(drag) e.preventDefault(); }, { passive:false });
document.addEventListener('pointerdown', e => {
  if(e.button > 0) return; const bk = e.target.closest && e.target.closest('#carousel .bk, #carousel .dcm'); if(!bk) return;
  pend = { bk, id:bk.dataset.id || bk.dataset.dec, dec:!!bk.dataset.dec, x:e.clientX, y:e.clientY, type:e.pointerType, timer:setTimeout(startDrag, 380) }; lastPt = { x:e.clientX, y:e.clientY };
});
addEventListener('pointermove', e => {
  lastPt = { x:e.clientX, y:e.clientY };
  if(pend && !drag){ const dist = Math.hypot(e.clientX - pend.x, e.clientY - pend.y);
    if(pend.type === 'mouse' && dist > 6) startDrag(); else if(pend.type !== 'mouse' && dist > 10){ clearTimeout(pend.timer); pend = null; } }
  if(drag){ moveGhost(); updateTarget(); }
});
function startDrag(){
  if(!pend) return; clearTimeout(pend.timer);
  const ghost = document.createElement('div'); ghost.className = 'ghost'; ghost.appendChild(pend.bk.cloneNode(true)); document.body.appendChild(ghost);
  pend.bk.classList.add('dragging'); drag = { id:pend.id, dec:pend.dec, bk:pend.bk, ghost, target:null, marker:null }; pend = null;
  $('#carousel').style.scrollSnapType = 'none'; navigator.vibrate && navigator.vibrate(12); moveGhost(); updateTarget(); autoLoop();
}
function moveGhost(){ drag.ghost.style.left = lastPt.x + 'px'; drag.ghost.style.top = lastPt.y + 'px'; }
function autoLoop(){
  if(!drag) return; const c = $('#carousel');
  if(lastPt.x < 50) c.scrollLeft -= 14; else if(lastPt.x > innerWidth - 50) c.scrollLeft += 14;
  if(lastPt.y < 120) scrollBy(0, -12); else if(lastPt.y > innerHeight - 90) scrollBy(0, 12);
  updateTarget(); autoRaf = requestAnimationFrame(autoLoop);
}
function updateTarget(){
  const els = document.elementsFromPoint(lastPt.x, lastPt.y), row = els.find(el => el.classList && el.classList.contains('row'));
  $$('.row.drop').forEach(r => r !== row && r.classList.remove('drop'));
  if(drag.marker && (!row || drag.marker.parentElement !== row)){ drag.marker.remove(); drag.marker = null; }
  if(!row){ drag.target = null; return; }
  row.classList.add('drop');
  const items = $$('.it[data-id]', row).filter(it => it.dataset.id !== drag.id); let idx = 0;
  for(const it of items){ const r = it.getBoundingClientRect(); const before = r.bottom < lastPt.y - 4 || (lastPt.y >= r.top - 4 && lastPt.y <= r.bottom + 4 && r.left + r.width / 2 < lastPt.x); if(before) idx++; else break; }
  const rr = row.getBoundingClientRect(); let x = 6, top = 0;
  if(items[idx]){ const r = items[idx].getBoundingClientRect(); x = r.left - rr.left - 2; top = r.top - rr.top; }
  else if(items.length){ const r = items[items.length - 1].getBoundingClientRect(); x = r.right - rr.left + 1; top = r.top - rr.top; }
  if(!drag.marker){ drag.marker = document.createElement('div'); drag.marker.className = 'ins'; row.appendChild(drag.marker); }
  Object.assign(drag.marker.style, { left:x + 'px', top:Math.max(0, top - 4) + 'px', height:'168px' });
  const rowsOf = $$(`.row[data-row="${row.dataset.row}"]`), before = rowsOf.slice(0, rowsOf.indexOf(row)).reduce((n, r) => n + $$('.it[data-id]', r).filter(it => it.dataset.id !== drag.id).length, 0);
  const all = rowsOf.flatMap(r => $$('.it[data-id]', r).filter(it => it.dataset.id !== drag.id)), gi = before + idx, nxt = all[gi], prv = all[gi - 1];
  // Cada fila pertenece a una balda (data-shelf): el libro va a la balda de la fila donde se suelta
  const u = unitOf(row.dataset.row), shelfId = row.dataset.shelf || (prv ? prv.dataset.shelf : nxt ? nxt.dataset.shelf : (u ? u.shelves[0].id : null));
  drag.target = drag.dec ? { unitId:row.dataset.row, after:prv ? prv.dataset.id : null } : shelfId ? { shelfId, beforeId:nxt && nxt.dataset.shelf === shelfId ? nxt.dataset.id : null } : null;
}
function endDrag(drop){
  if(!drag) return; cancelAnimationFrame(autoRaf);
  const d = drag; drag = null; d.ghost.remove(); d.bk.classList.remove('dragging'); d.marker && d.marker.remove(); $$('.row.drop').forEach(r => r.classList.remove('drop'));
  $('#carousel').style.scrollSnapType = ''; noClickUntil = Date.now() + 450;
  if(drop && d.target){ if(d.dec) moveDecor(d.id, d.target); else moveBook(d.id, d.target); }
}
function moveDecor(id, t){
  if(String(id).startsWith('gap:')){ const f = gapOfUnit(id.slice(4)), to = unitOf(t.unitId); if(!f || !to) return;
    if(f.u !== to){ f.u.gaps = f.u.gaps.filter(x => x !== f.g); (to.gaps = to.gaps || []).push(f.g); }
    f.g.after = t.after; save(); renderAll(); return; }
  id = materializeDecor(id); const f = decorOfUnit(id), to = unitOf(t.unitId); if(!f || !to) return;
  if(f.u !== to){ f.u.decorItems = f.u.decorItems.filter(x => x.id !== id); to.decorItems = to.decorItems || []; to.decorItems.push(f.d); if(to.decorMode !== 'manual') to.decorMode = 'manual'; }
  f.d.after = t.after; const arr = to.decorItems, i = arr.indexOf(f.d); arr.splice(i, 1); arr.push(f.d); save(); renderAll();
}
function moveBook(id, t){
  const b = bookOf(id), to = shelfOf(t.shelfId), from = shelfOf(b.shelfId); if(!b || !to) return;
  const order = sortedBooks(to.s).map(x => x.id).filter(x => x !== id), pos = t.beforeId ? order.indexOf(t.beforeId) : order.length;
  order.splice(pos < 0 ? order.length : pos, 0, id);
  if(from && from.s !== to.s) from.s.order = from.s.order.filter(x => x !== id);
  b.unitId = to.u.id; b.shelfId = to.s.id; ui.lastShelf = to.s.id;
  // El orden es de la estantería: al colocar un libro a mano, toda ella pasa a orden manual (se conserva cómo estaba cada balda)
  const changed = unitSort(to.u).sort !== 'manual';
  if(changed){ to.u.shelves.forEach(s => { if(s !== to.s) s.order = sortedBooks(s).map(x => x.id); }); to.u.sort = 'manual'; }
  to.s.order = order;
  save(); renderAll(); flash(id); if(changed) toast(`El orden de «${to.u.name}» ahora es manual`);
}
addEventListener('pointerup', () => { if(pend){ clearTimeout(pend.timer); pend = null; } endDrag(true); });
addEventListener('pointercancel', () => { if(pend){ clearTimeout(pend.timer); pend = null; } endDrag(false); });
