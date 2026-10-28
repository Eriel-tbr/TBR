'use strict';
/* Mi TBR — vista «Universos» (datos en js/lib/universos.js).
   Cada libro del universo se busca en la colección (título, original o alternativo + autor/a). Si está, manda su estado;
   si no, se puede marcar como leído aquí (state.settings.uniRead['universo:clave'], se sincroniza con los ajustes).
   Una conexión se ve tal cual si has leído todos sus libros; si falta alguno, sale tapada y se destapa al tocarla. */
const UNI_BOARD = false; // tablero en preparación: hasta que Leyre lo apruebe solo se ve la lista
ui.uniOpen = ui.uniOpen || new Set(); ui.uniShown = ui.uniShown || new Set(); ui.uniMode = ui.uniMode || {}; ui.uniSel = ui.uniSel || {};
const uniNorm = s => norm(String(s || '').replace(/\([^)]*\)/g, ' '));
const uniAuthOk = (b, u) => { const a = norm(b.author || ''); return norm(u.author).split(' ').some(w => w.length > 3 && a.includes(w)); };
const uniTitle = ub => ub.t || ub.o;
function uniBooks(u){ return u.series.flatMap(s => s.books.map(ub => ({ ...ub, serie:s.name }))); }
/* Libro de la colección que corresponde a un libro del universo (o null) */
function uniFind(u, ub){
  const keys = [ub.t, ub.o, ...(ub.alt || [])].filter(Boolean).map(uniNorm);
  return state.books.find(b => uniAuthOk(b, u) && [b.title, b.origTitle, b.esTitle].filter(Boolean).some(t => keys.includes(uniNorm(t)))) || null;
}
const uniRead = () => state.settings.uniRead || (state.settings.uniRead = {});
function uniIsRead(u, ub){ const b = uniFind(u, ub); return b ? b.status === 'leido' : !!uniRead()[u.id + ':' + ub.k]; }
const UNI_KIND = { 'confirmado':'Confirmado', 'guiño':'Guiño', 'teoria':'Teoría' };
const uniKindCls = k => k === 'guiño' ? 'guino' : k;
const uniHidden = () => state.settings.uniHidden || (state.settings.uniHidden = {});
/* Conexión tapada: falta por leer alguno de sus libros y no la has destapado */
function uniMiss(u, l, byK){ return l.books.filter(k => byK[k] && !uniIsRead(u, byK[k])); }
const uniLocked = (u, l, i, byK) => uniMiss(u, l, byK).length && !ui.uniShown.has(u.id + ':' + i);

/* ---------- Tablero: cada saga es una fila de fichas clavadas; los hilos son las conexiones ----------
   Rojo = confirmado, ámbar = guiño, morado discontinuo = teoría, gris discontinuo = spoiler aún tapado.
   El hilo fino marrón une los tomos de una misma saga en orden. El número de cada hilo es el de la lista de abajo. */
const BD = { cw:84, ch:98, gx:18, gy:52, pad:20, lab:30 };
function uniBoardHtml(u, byK){
  const pos = {}, rows = u.series.length, cols = Math.max(...u.series.map(s => s.books.length));
  u.series.forEach((s, r) => s.books.forEach((ub, i) => { pos[ub.k] = { x:BD.pad + i * (BD.cw + BD.gx), y:BD.pad + BD.lab + r * (BD.ch + BD.gy + BD.lab) }; }));
  const W = BD.pad * 2 + cols * (BD.cw + BD.gx) - BD.gx, H = BD.pad * 2 + rows * (BD.ch + BD.gy + BD.lab) - BD.gy;
  const pin = k => ({ x:pos[k].x + BD.cw / 2, y:pos[k].y + 9 });
  const sel = ui.uniSel[u.id] || '', selBook = sel.startsWith('b:') ? sel.slice(2) : '', selLink = sel.startsWith('l:') ? +sel.slice(2) : -1;
  const curve = (a, b, sag) => { const p = pin(a), q = pin(b), mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2 + sag; return { d:`M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`, mid:{ x:(p.x + 2 * mx + q.x) / 4, y:(p.y + 2 * my + q.y) / 4 } }; };
  let threads = '', tags = ''; const pairs = {}, singles = {}, placed = [];
  const free = m => { let t = 0; while(t++ < 8 && placed.some(q => Math.hypot(q.x - m.x, q.y - m.y) < 26)) m = { x:m.x, y:m.y + 26 }; placed.push(m); return m; }; // que los números no se tapen
  u.series.forEach(s => s.books.slice(1).forEach((ub, i) => { threads += `<path class="th-seq" d="${curve(s.books[i].k, ub.k, 10).d}"/>`; }));
  u.links.forEach((l, i) => {
    const ks = l.books.filter(k => pos[k]); if(!ks.length) return;
    const locked = uniLocked(u, l, i, byK), cls = locked ? 'th-lock' : 'th-' + uniKindCls(l.kind);
    const dim = (selBook && !ks.includes(selBook)) || (selLink >= 0 && selLink !== i) ? ' dim' : '';
    let mid;
    if(ks.length === 1){ const p = pos[ks[0]], n = singles[ks[0]] = (singles[ks[0]] || 0) + 1; mid = { x:p.x + BD.cw - 2 - (n - 1) * 26, y:p.y + BD.ch - 2 }; }
    else ks.slice(1).forEach((k, j) => { const pk = [ks[j], k].sort().join(), n = pairs[pk] = (pairs[pk] || 0) + 1; // hilos repetidos entre los mismos libros: cada uno más curvado
      const dist = Math.hypot(pos[k].x - pos[ks[j]].x, pos[k].y - pos[ks[j]].y), c = curve(ks[j], k, 24 + dist * .12 + (n - 1) * 26);
      threads += `<path class="th ${cls}${dim}" d="${c.d}"/>`; if(!j) mid = c.mid; });
    mid = free(mid);
    tags += `<button class="bd-tag ${cls}${dim}${selLink === i ? ' on' : ''}" type="button" data-bl="${i}" style="left:${mid.x}px;top:${mid.y}px" aria-label="Conexión ${i + 1}">${locked ? '?' : i + 1}</button>`;
  });
  const cards = u.series.flatMap(s => s.books.map(ub => {
    const b = uniFind(u, ub), read = uniIsRead(u, ub), p = pos[ub.k], rot = ((ub.k.charCodeAt(ub.k.length - 1) * 7) % 7 - 3) * .8;
    return `<button class="bd-card${read ? ' read' : ''}${b && !read ? ' tbr' : ''}${ub.opt ? ' opt' : ''}${selBook === ub.k ? ' on' : ''}" type="button" data-bb="${ub.k}" style="left:${p.x}px;top:${p.y}px;--r:${rot}deg">
      <i class="bd-pin"></i><b>${esc(uniTitle(ub))}</b><small>${ub.y || ''}</small>${read ? '<em class="bd-stamp">Leído</em>' : b ? '<em class="bd-tbr">En tu TBR</em>' : ''}</button>`;
  })).join('');
  const labels = u.series.map((s, r) => `<span class="bd-lab" style="left:${BD.pad}px;top:${BD.pad + r * (BD.ch + BD.gy + BD.lab)}px">${esc(s.world ? s.world + ' · ' + s.name : s.name)}</span>`).join('');
  return `<div class="board-wrap"><div class="board" style="width:${W}px;height:${H}px">${labels}<svg class="bd-svg" width="${W}" height="${H}" aria-hidden="true">${threads}</svg>${cards}${tags}</div></div>
    <div class="bd-legend"><span class="lg th-confirmado">Confirmado</span><span class="lg th-guino">Guiño</span><span class="lg th-teoria">Teoría</span><span class="lg th-lock">Spoiler tapado</span><span class="lg th-seq">Misma saga</span></div>`;
}
/* Ficha pequeña bajo el tablero al tocar un libro */
function uniBookPanel(u, ub){
  const b = uniFind(u, ub), read = uniIsRead(u, ub), sub = [ub.t && ub.o !== ub.t ? ub.o : '', ub.serie, ub.y, ub.note || (ub.opt ? 'opcional' : '')].filter(Boolean).join(' · ');
  const act = b ? `<button class="btn sm" type="button" data-open="${b.id}">Ver ficha</button>` : `<button class="chip uni-rd" type="button" data-ur="${esc(u.id + ':' + ub.k)}" aria-pressed="${read}">${read ? 'Leído' : 'Sin leer'}</button>`;
  return `<div class="bd-panel"><div class="tx"><b>${esc(uniTitle(ub))}</b><span>${esc(sub)}</span></div>${act}</div>`;
}

function uniCardHtml(u){
  const all = uniBooks(u), byK = Object.fromEntries(all.map(b => [b.k, b])), main = all.filter(b => !b.opt);
  const nRead = main.filter(b => uniIsRead(u, b)).length, inTbr = all.filter(b => { const x = uniFind(u, b); return x && x.status !== 'leido'; }).length;
  const row = (ub, i) => {
    const b = uniFind(u, ub), read = uniIsRead(u, ub), sub = [ub.t && ub.o !== ub.t ? ub.o : '', uniNorm(ub.serie) === uniNorm(uniTitle(ub)) || /^(otras novelas|extras)$/i.test(ub.serie) ? '' : ub.serie, ub.y, ub.note || (ub.opt ? 'opcional' : '')].filter(Boolean).join(' · ');
    const st = b ? `<button class="badge uni-st ${b.status || 'pendiente'}" type="button" data-open="${b.id}">${b.status === 'leido' ? 'Leído' : b.status === 'leyendo' ? 'Leyendo' : 'En tu TBR'}</button>`
      : `<button class="chip uni-rd" type="button" data-ur="${esc(u.id + ':' + ub.k)}" aria-pressed="${read}">${read ? 'Leído' : 'Sin leer'}</button>`;
    return `<li class="uni-b${read ? ' read' : ''}${ub.opt ? ' opt' : ''}"><span class="n">${i + 1}</span><span class="tx"><b>${esc(uniTitle(ub))}</b><span>${esc(sub)}</span></span>${st}</li>`;
  };
  const sel = ui.uniSel[u.id] || '', selLink = sel.startsWith('l:') ? +sel.slice(2) : -1;
  const link = (l, i) => {
    const id = u.id + ':' + i, miss = uniMiss(u, l, byK), open = !miss.length || ui.uniShown.has(id);
    const src = l.src ? ` <a href="${esc(l.src)}" target="_blank" rel="noopener">Fuente ↗</a>` : '', n = `<span class="uni-n">${i + 1}</span>`;
    return open ? `<li class="uni-l${selLink === i ? ' on' : ''}" id="ul-${id.replace(':', '-')}">${n}<span class="badge k-${uniKindCls(l.kind)}">${UNI_KIND[l.kind] || l.kind}</span> ${esc(l.text)}${src}</li>`
      : `<li class="uni-l${selLink === i ? ' on' : ''}" id="ul-${id.replace(':', '-')}"><button class="uni-lock" type="button" data-ul="${id}">${n}<span class="badge k-${uniKindCls(l.kind)}">${UNI_KIND[l.kind] || l.kind}</span> Spoiler de ${esc(miss.map(k => uniTitle(byK[k])).join(', '))} · <u>Toca para ver</u></button></li>`;
  };
  const mode = UNI_BOARD ? ui.uniMode[u.id] || 'tablero' : 'lista', selBook = sel.startsWith('b:') ? byK[sel.slice(2)] : null;
  const order = u.order.map(k => byK[k]).filter(Boolean);
  const view = mode === 'tablero' ? uniBoardHtml(u, byK) + (selBook ? uniBookPanel(u, selBook) : '<p class="note bd-hint">Toca un libro o un número.</p>')
    : `<h3>Orden de lectura</h3><ol class="uni-order">${order.map(row).join('')}</ol>`;
  return `<details class="uni" data-uni="${u.id}"${ui.uniOpen.has(u.id) ? ' open' : ''}><summary><span class="tx"><b>${esc(u.name)}</b><span>${esc(u.author)} · ${nRead} de ${main.length} leídos${inTbr ? ` · ${inTbr} en tu TBR` : ''}</span></span>
      <span class="uni-bar" aria-hidden="true"><i style="width:${Math.round(nRead / (main.length || 1) * 100)}%"></i></span></summary>
    <div class="uni-body"><p class="note">${esc(u.note)}</p>
      ${UNI_BOARD ? `<div class="chips uni-mode">${chipsHtml([['tablero', 'Tablero'], ['lista', 'Orden de lectura']], mode, 'data-um')}</div>` : ''}
      ${view}
      ${u.links.length ? `<h3>Conexiones y teorías</h3><ul class="uni-links">${u.links.map(link).join('')}</ul>` : ''}
      <button class="btn sm danger-l uni-hide" type="button" data-uh="${u.id}">Quitar este universo</button></div></details>`;
}
function renderUniverses(){
  const el = $('#view-universes'); if(!el || el.hidden) return;
  const hid = uniHidden(), shown = UNIVERSES.filter(u => !hid[u.id]), gone = UNIVERSES.filter(u => hid[u.id]);
  const keep = [...el.querySelectorAll('.board-wrap')].map(w => [w.closest('details').dataset.uni, w.scrollLeft]); // que el tablero no salte al redibujar
  el.innerHTML = `<section class="rd-sec"><h2>Universos</h2>${shown.map(uniCardHtml).join('') || '<p class="rd-empty">Has quitado todos.</p>'}
    ${gone.length ? `<div class="uni-gone"><h3>Quitados</h3><div class="chips">${gone.map(u => `<button class="chip" type="button" data-ush="${u.id}">+ ${esc(u.name)}</button>`).join('')}</div></div>` : ''}</section>`;
  keep.forEach(([id, x]) => { const w = el.querySelector(`details[data-uni="${id}"] .board-wrap`); if(w) w.scrollLeft = x; });
}
document.addEventListener('click', e => {
  if(!e.target.closest('#view-universes')) return;
  const g = s => e.target.closest(s), uni = g('details.uni') ? g('details.uni').dataset.uni : '';
  if(g('details.uni > summary')){ const d = g('details.uni'); d.open ? ui.uniOpen.delete(d.dataset.uni) : ui.uniOpen.add(d.dataset.uni); return; } // antes de que se abra: así sobrevive a un redibujo
  if(g('[data-ur]')){ const k = g('[data-ur]').dataset.ur, r = uniRead(); if(r[k]) delete r[k]; else r[k] = Date.now(); save(); renderUniverses(); }
  else if(g('[data-ul]')){ ui.uniShown.add(g('[data-ul]').dataset.ul); renderUniverses(); }
  else if(g('[data-um]')){ ui.uniMode[uni] = g('[data-um]').dataset.um; renderUniverses(); }
  else if(g('[data-bb]')){ const v = 'b:' + g('[data-bb]').dataset.bb; ui.uniSel[uni] = ui.uniSel[uni] === v ? '' : v; renderUniverses(); }
  else if(g('[data-bl]')){ const i = g('[data-bl]').dataset.bl, v = 'l:' + i; ui.uniSel[uni] = ui.uniSel[uni] === v ? '' : v; renderUniverses();
    const li = document.getElementById(`ul-${uni}-${i}`); if(li && ui.uniSel[uni]) li.scrollIntoView({ block:'nearest', behavior:'smooth' }); }
  else if(g('[data-uh]')){ const btn = g('[data-uh]');
    if(!btn.dataset.sure){ btn.dataset.sure = '1'; btn.textContent = 'Toca otra vez para quitarlo'; setTimeout(() => { if(btn.isConnected){ btn.dataset.sure = ''; btn.textContent = 'Quitar este universo'; } }, 3000); return; }
    uniHidden()[btn.dataset.uh] = Date.now(); save(); renderUniverses(); const u = UNIVERSES.find(x => x.id === btn.dataset.uh);
    toast(`«${u.name}» quitado`, () => { delete uniHidden()[u.id]; save(); renderUniverses(); }); }
  else if(g('[data-ush]')){ delete uniHidden()[g('[data-ush]').dataset.ush]; save(); renderUniverses(); }
});
