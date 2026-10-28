'use strict';
/* Mi TBR — vista «Universos» (datos en js/lib/universos.js).
   Cada libro del universo se busca en la colección (título, original o alternativo + autor/a). Si está, manda su estado;
   si no, se puede marcar como leído aquí (state.settings.uniRead['universo:clave'], se sincroniza con los ajustes).
   Una conexión se ve tal cual si has leído todos sus libros; si falta alguno, sale tapada y se destapa al tocarla. */
ui.uniOpen = ui.uniOpen || new Set(); ui.uniShown = ui.uniShown || new Set();
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

function uniCardHtml(u){
  const all = uniBooks(u), byK = Object.fromEntries(all.map(b => [b.k, b])), main = all.filter(b => !b.opt);
  const nRead = main.filter(b => uniIsRead(u, b)).length, inTbr = all.filter(b => { const x = uniFind(u, b); return x && x.status !== 'leido'; }).length;
  const row = (ub, i) => {
    const b = uniFind(u, ub), read = uniIsRead(u, ub), sub = [ub.t && ub.o !== ub.t ? ub.o : '', uniNorm(ub.serie) === uniNorm(uniTitle(ub)) || /^(otras novelas|extras)$/i.test(ub.serie) ? '' : ub.serie, ub.y, ub.note || (ub.opt ? 'opcional' : '')].filter(Boolean).join(' · ');
    const st = b ? `<button class="badge uni-st ${b.status || 'pendiente'}" type="button" data-open="${b.id}">${b.status === 'leido' ? 'Leído' : b.status === 'leyendo' ? 'Leyendo' : 'En tu TBR'}</button>`
      : `<button class="chip uni-rd" type="button" data-ur="${esc(u.id + ':' + ub.k)}" aria-pressed="${read}">${read ? 'Leído' : 'Sin leer'}</button>`;
    return `<li class="uni-b${read ? ' read' : ''}${ub.opt ? ' opt' : ''}"><span class="n">${i + 1}</span><span class="tx"><b>${esc(uniTitle(ub))}</b><span>${esc(sub)}</span></span>${st}</li>`;
  };
  const link = (l, i) => {
    const id = u.id + ':' + i, miss = l.books.filter(k => byK[k] && !uniIsRead(u, byK[k])), open = !miss.length || ui.uniShown.has(id);
    const src = l.src ? ` <a href="${esc(l.src)}" target="_blank" rel="noopener">Fuente ↗</a>` : '';
    return open ? `<li class="uni-l"><span class="badge k-${l.kind === 'guiño' ? 'guino' : l.kind}">${UNI_KIND[l.kind] || l.kind}</span> ${esc(l.text)}${src}</li>`
      : `<li class="uni-l"><button class="uni-lock" type="button" data-ul="${id}"><span class="badge k-${l.kind === 'guiño' ? 'guino' : l.kind}">${UNI_KIND[l.kind] || l.kind}</span> Spoiler de ${esc(miss.map(k => uniTitle(byK[k])).join(', '))} · <u>Toca para ver</u></button></li>`;
  };
  const order = u.order.map(k => byK[k]).filter(Boolean);
  return `<details class="uni" data-uni="${u.id}"${ui.uniOpen.has(u.id) ? ' open' : ''}><summary><span class="tx"><b>${esc(u.name)}</b><span>${esc(u.author)} · ${nRead} de ${main.length} leídos${inTbr ? ` · ${inTbr} en tu TBR` : ''}</span></span>
      <span class="uni-bar" aria-hidden="true"><i style="width:${Math.round(nRead / (main.length || 1) * 100)}%"></i></span></summary>
    <div class="uni-body"><p class="note">${esc(u.note)}</p>
      <h3>Orden de lectura</h3><ol class="uni-order">${order.map(row).join('')}</ol>
      ${u.links.length ? `<h3>Conexiones y teorías</h3><ul class="uni-links">${u.links.map(link).join('')}</ul>` : ''}</div></details>`;
}
function renderUniverses(){
  const el = $('#view-universes'); if(!el || el.hidden) return;
  el.innerHTML = `<section class="rd-sec"><h2>Universos</h2>${UNIVERSES.map(uniCardHtml).join('')}</section>`;
}
document.addEventListener('click', e => {
  if(!e.target.closest('#view-universes')) return;
  const g = s => e.target.closest(s);
  if(g('details.uni > summary')){ const d = g('details.uni'); d.open ? ui.uniOpen.delete(d.dataset.uni) : ui.uniOpen.add(d.dataset.uni); return; } // antes de que se abra: así sobrevive a un redibujo
  if(g('[data-ur]')){ const k = g('[data-ur]').dataset.ur, r = uniRead(); if(r[k]) delete r[k]; else r[k] = Date.now(); save(); renderUniverses(); }
  else if(g('[data-ul]')){ ui.uniShown.add(g('[data-ul]').dataset.ul); renderUniverses(); }
});
