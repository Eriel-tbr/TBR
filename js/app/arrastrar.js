'use strict';
/* Mi TBR — arrastrar y soltar */
/* Libros y objetos se colocan donde se sueltan:
   - encima o pegado a otro elemento: se mete entre ellos (sin espacio);
   - en un espacio libre de la fila: se queda en ese punto (at = fracción del ancho de la fila) y deja el espacio delante;
   - en «Fila nueva» (aparece al final de cada balda mientras se arrastra): empieza una fila nueva de esa balda (nl).
   Colocar un libro a mano pasa la estantería a orden manual. */
let pend = null, drag = null, noClickUntil = 0, lastPt = { x:0, y:0 }, autoRaf = 0;
const SNAP = 12; // px: más cerca que esto del elemento de la izquierda, se pega a él (sin espacio)
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
/* «Fila nueva» al final de cada balda (solo mientras se arrastra). Se compensa el desplazamiento para que lo arrastrado no salte */
function addNewRows(anchor){
  const before = anchor.getBoundingClientRect().top;
  $$('#carousel .slide').forEach(sl => { const last = new Map(); $$('.row[data-shelf]', sl).forEach(r => last.set(r.dataset.shelf, r));
    last.forEach((r, shelf) => { const n = document.createElement('div'); n.className = 'row newrow'; n.dataset.row = r.dataset.row; n.dataset.shelf = shelf; n.dataset.new = '1';
      n.innerHTML = '<span>Fila nueva</span>'; r.after(n); }); });
  const d = anchor.getBoundingClientRect().top - before; if(Math.abs(d) > 1) scrollBy(0, d);
}
function startDrag(){
  if(!pend) return; clearTimeout(pend.timer);
  const ghost = document.createElement('div'); ghost.className = 'ghost'; ghost.appendChild(pend.bk.cloneNode(true)); document.body.appendChild(ghost);
  const el = pend.dec ? pend.bk : pend.bk.closest('.it') || pend.bk, w = el.getBoundingClientRect().width;
  pend.bk.classList.add('dragging'); drag = { id:pend.id, dec:pend.dec, bk:pend.bk, el, w, ghost, target:null, marker:null }; pend = null;
  $('#carousel').style.scrollSnapType = 'none'; addNewRows(el); navigator.vibrate && navigator.vibrate(12); moveGhost(); updateTarget(); autoLoop();
}
function moveGhost(){ drag.ghost.style.left = lastPt.x + 'px'; drag.ghost.style.top = lastPt.y + 'px'; }
function autoLoop(){
  if(!drag) return; const c = $('#carousel');
  // window.innerWidth: «innerWidth» a secas es la función de estanterias.js (por eso nunca pasaba de estantería arrastrando)
  if(lastPt.x < 50) c.scrollLeft -= 14; else if(lastPt.x > window.innerWidth - 50) c.scrollLeft += 14;
  if(lastPt.y < 120) scrollBy(0, -12); else if(lastPt.y > window.innerHeight - 90) scrollBy(0, 12);
  updateTarget(); autoRaf = requestAnimationFrame(autoLoop);
}
/* Elementos que ocupan sitio en una fila (libros y objetos), sin lo que se está arrastrando */
const rowItems = row => [...row.children].filter(el => (el.matches('.it[data-id]') || el.matches('.dc')) && el !== drag.el);
function updateTarget(){
  const els = document.elementsFromPoint(lastPt.x, lastPt.y), row = els.find(el => el.classList && el.classList.contains('row') && el.dataset.shelf);
  $$('.row.drop').forEach(r => r !== row && r.classList.remove('drop'));
  if(drag.marker && (!row || drag.marker.parentElement !== row)){ drag.marker.remove(); drag.marker = null; }
  if(!row){ drag.target = null; return; }
  row.classList.add('drop');
  const rr = row.getBoundingClientRect(), cs = getComputedStyle(row), padL = parseFloat(cs.paddingLeft) || 0, padR = parseFloat(cs.paddingRight) || 0;
  const W = rr.width - padL - padR, start = rr.left + padL, px = lastPt.x, isNew = !!row.dataset.new;
  const occ = isNew ? [] : rowItems(row).map(el => ({ el, r:el.getBoundingClientRect() }));
  // Dónde entra en el orden: detrás de los que quedan a la izquierda del dedo
  let k = 0; for(const o of occ){ if(o.r.left + o.r.width / 2 < px) k++; else break; }
  const prev = occ[k - 1], next = occ[k], over = occ.find(o => px >= o.r.left && px <= o.r.right);
  // ¿Espacio libre? Solo si no está encima de otro, hay sitio y no está pegado al de la izquierda
  const prevEnd = prev ? prev.r.right : start, nextStart = next ? next.r.left : start + W;
  let left = clamp(px - drag.w / 2, prevEnd, Math.min(nextStart, start + W) - drag.w), free = null;
  if(isNew) free = clamp(px - drag.w / 2, start, start + W - drag.w) - start;
  else if(!over && nextStart - prevEnd >= drag.w && left - prevEnd >= SNAP) free = left - start;
  // Marcador: una caja donde quedará (espacio libre) o una línea entre dos (pegado)
  if(!drag.marker){ drag.marker = document.createElement('div'); row.appendChild(drag.marker); }
  const mk = drag.marker, h = isNew ? rr.height - 8 : Math.min(168, rr.height - 18);
  if(free !== null){ mk.className = 'ins free'; Object.assign(mk.style, { left:(free + padL) + 'px', width:drag.w + 'px', top:Math.max(0, rr.height - h - (isNew ? 4 : 14)) + 'px', height:h + 'px' }); }
  else { const x = prev ? prev.r.right - rr.left + 1 : next ? next.r.left - rr.left - 2 : padL; mk.className = 'ins'; Object.assign(mk.style, { left:x + 'px', width:'', top:Math.max(0, rr.height - h - 14) + 'px', height:h + 'px' }); }
  // Libros de esta balda (todas sus filas) en orden, sin el arrastrado: el que va antes y el que va después
  const shelfId = row.dataset.shelf, unitId = row.dataset.row, rows = $$(`.row[data-row="${unitId}"][data-shelf="${shelfId}"]`);
  const booksIn = r => $$('.it[data-id]', r).filter(it => it !== drag.el);
  const all = rows.flatMap(booksIn), mine = booksIn(row), before = rows.slice(0, rows.indexOf(row)).reduce((n, r) => n + booksIn(r).length, 0);
  const kb = isNew ? mine.length : occ.slice(0, k).filter(o => o.el.matches('.it[data-id]')).length, gi = before + kb, nxt = all[gi], prv = all[gi - 1];
  const pos = { at:free !== null ? Math.round(free / W * 1000) / 1000 : null, nl:isNew };
  drag.target = drag.dec ? { unitId, shelfId, after:prv ? prv.dataset.id : null, ...pos } : { shelfId, beforeId:nxt ? nxt.dataset.id : null, ...pos };
}
function endDrag(drop){
  if(!drag) return; cancelAnimationFrame(autoRaf);
  const d = drag; drag = null; d.ghost.remove(); d.bk.classList.remove('dragging'); d.marker && d.marker.remove(); $$('.row.drop').forEach(r => r.classList.remove('drop'));
  $$('#carousel .newrow').forEach(r => r.remove());
  $('#carousel').style.scrollSnapType = ''; noClickUntil = Date.now() + 450;
  if(drop && d.target){ if(d.dec) moveDecor(d.id, d.target); else moveBook(d.id, d.target); }
}
const setPos = (o, t) => { if(t.at !== null && t.at !== undefined) o.at = t.at; else delete o.at; if(t.nl) o.nl = true; else delete o.nl; };
function moveDecor(id, t){
  id = materializeDecor(id); const f = decorOfUnit(id), to = unitOf(t.unitId); if(!f || !to) return;
  if(f.u !== to){ f.u.decorItems = f.u.decorItems.filter(x => x.id !== id); to.decorItems = to.decorItems || []; to.decorItems.push(f.d); if(to.decorMode !== 'manual') to.decorMode = 'manual'; }
  f.d.after = t.after; f.d.shelf = t.shelfId; setPos(f.d, t);
  const arr = to.decorItems, i = arr.indexOf(f.d); arr.splice(i, 1); arr.push(f.d); save(); renderAll();
}
function moveBook(id, t){
  const b = bookOf(id), to = shelfOf(t.shelfId), from = shelfOf(b.shelfId); if(!b || !to) return;
  const order = sortedBooks(to.s).map(x => x.id).filter(x => x !== id), pos = t.beforeId ? order.indexOf(t.beforeId) : order.length;
  order.splice(pos < 0 ? order.length : pos, 0, id);
  if(from && from.s !== to.s) from.s.order = from.s.order.filter(x => x !== id);
  if(from && from.u !== to.u && from.u.place) delete from.u.place[id];
  b.unitId = to.u.id; b.shelfId = to.s.id; ui.lastShelf = to.s.id;
  const pl = {}; setPos(pl, t); to.u.place = to.u.place || {}; if(Object.keys(pl).length) to.u.place[id] = pl; else delete to.u.place[id];
  // El orden es de la estantería: al colocar un libro a mano, toda ella pasa a orden manual (se conserva cómo estaba cada balda)
  const changed = unitSort(to.u).sort !== 'manual';
  if(changed){ to.u.shelves.forEach(s => { if(s !== to.s) s.order = sortedBooks(s).map(x => x.id); }); to.u.sort = 'manual'; }
  to.s.order = order;
  save(); renderAll(); flash(id); if(changed) toast(`El orden de «${to.u.name}» ahora es manual`);
}
addEventListener('pointerup', () => { if(pend){ clearTimeout(pend.timer); pend = null; } endDrag(true); });
addEventListener('pointercancel', () => { if(pend){ clearTimeout(pend.timer); pend = null; } endDrag(false); });
