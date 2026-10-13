'use strict';
/* Mi TBR — ficha de un libro y decoración colocada a mano */
/* ---------- Ficha de un libro ---------- */
function openDetail(id){
  const b0 = bookOf(id); if(!b0) return;
  const sh = openSheet(sheetT('Ficha', '<div id="dbody"></div>'));
  const draw = () => {
    const b = bookOf(id); if(!b){ closeSheet(); return; }
    const fm = FORMATS.filter(([k]) => b.formats && b.formats[k]).map(([k, l]) => `<span class="chip fmt" data-st="${b.formats[k]}">${l}: ${b.formats[k]}</span>`).join('');
    $('#dbody', sh).innerHTML = `
      <div class="hero"><div class="cover-box">${coverHtml(b)}</div><div class="meta"><h2>${esc(b.title)}</h2><div>${esc(b.author) || '<span class="note">Autor sin indicar</span>'}</div>
        <div class="chips">${langBadges(b)}<span class="badge">${STATUS[b.status || 'pendiente']}</span>${b.next ? '<span class="badge">Siguiente lectura</span>' : ''}</div>
        ${b.series && b.series.name ? `<div class="note">Serie: ${esc(b.series.name)} · libro ${b.series.n || '?'}${seriesTotal(state, b) ? ' de ' + seriesTotal(state, b) : ''}</div>` : ''}
        <div class="note">${esc(locName(b))}</div>
        ${b.status === 'leido' ? `<div class="stars" aria-label="Puntuación">${[1,2,3,4,5].map(n => `<button class="star ${n <= b.rating ? 'on' : ''}" type="button" data-star="${n}" aria-label="${n} de 5">${ICON.star}</button>`).join('')}</div>` : ''}
      </div></div>
      ${b.synopsis ? `<div class="sec"><span class="lbl">Sinopsis</span><div class="synopsis">${esc(b.synopsis)}</div></div>` : ''}
      <dl class="kv"><dt>Páginas</dt><dd>${b.pages || '—'}</dd><dt>Publicación</dt><dd>${b.year || '—'}</dd>
        <dt>Idiomas</dt><dd>${(b.langs || []).length === 2 ? 'Español e inglés' : (b.langs || [])[0] === 'es' ? 'Solo español' : (b.langs || [])[0] === 'en' ? 'Solo inglés' : '—'}</dd>
        ${b.readAt ? `<dt>Leído</dt><dd>${new Date(b.readAt).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}</dd>` : ''}</dl>
      ${fm || (b.eds || []).length || (b.edsEn || []).length ? `<div class="sec"><span class="lbl">Ediciones</span>${fm ? `<div class="chips">${fm}</div>` : ''}${edsHtml(b.eds)}${edsHtml(b.edsEn, true)}</div>` : ''}
      ${(b.tags || []).length ? `<div class="sec"><span class="lbl">Etiquetas</span><div class="chips">${b.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>` : ''}
      ${b.notes ? `<div class="sec"><span class="lbl">Notas</span><div class="synopsis">${esc(b.notes)}</div></div>` : ''}
      <div class="actions">
        ${b.status === 'pendiente' ? '<button class="btn primary" type="button" data-do="start">Empezar a leer</button>' : ''}
        ${b.status === 'leyendo' ? '<button class="btn primary" type="button" data-do="finish">Marcar como leído</button>' : ''}
        ${b.status === 'pendiente' ? '<button class="btn" type="button" data-do="finish">Ya lo he leído</button>' : ''}
        ${b.status === 'leido' ? '<button class="btn" type="button" data-do="pending">Volver a pendiente</button>' : ''}
        ${b.status !== 'leido' ? `<button class="btn" type="button" data-do="next">${b.next ? 'Quitar de siguiente' : 'Siguiente lectura'}</button>` : ''}
        <button class="btn" type="button" data-do="edit">Editar</button><button class="btn" type="button" data-do="move">Mover a…</button>
        <button class="btn danger" type="button" data-do="del">Borrar</button></div>`;
  };
  draw();
  sh.addEventListener('click', async e => {
    const star = e.target.closest('[data-star]'), act = e.target.closest('[data-do]'), b = bookOf(id); if(!b) return;
    if(star){ b.rating = b.rating === +star.dataset.star ? 0 : +star.dataset.star; save(); draw(); return; }
    if(!act) return; const a = act.dataset.do;
    if(a === 'start'){ b.status = 'leyendo'; }
    else if(a === 'finish'){ b.status = 'leido'; b.readAt = Date.now(); b.next = false; }
    else if(a === 'pending'){ b.status = 'pendiente'; b.readAt = null; }
    else if(a === 'next'){ const on = !b.next; state.books.forEach(x => x.next = false); b.next = on; }
    else if(a === 'edit'){ await closeSheet(); openBookForm({ book:b }); return; }
    else if(a === 'move'){ openMove(id, draw); return; }
    else if(a === 'del'){
      if(act.dataset.sure){ const copy = JSON.parse(JSON.stringify(b)), s = shelfOf(b.shelfId);
        state.books = state.books.filter(x => x.id !== id); if(s) s.s.order = s.s.order.filter(x => x !== id); save(); renderAll(); await closeSheet();
        toast('Libro borrado', () => { state.books.push(copy); save(); renderAll(); }); }
      else { act.dataset.sure = '1'; act.textContent = 'Toca otra vez para borrar'; setTimeout(() => { act.dataset.sure = ''; act.textContent = 'Borrar'; }, 3000); }
      return;
    }
    save(); renderAll(); draw();
  });
}
function openMove(id, after){
  const b = bookOf(id);
  const body = state.units.map(u => `<div class="sec"><span class="lbl">${esc(u.name)}</span><div class="row-opts">${u.shelves.map(s => `<button class="opt" type="button" role="radio" data-m="${s.id}" aria-checked="${s.id === b.shelfId}"><span class="dot"></span>${esc(s.name)}</button>`).join('')}</div></div>`).join('');
  const sh = openSheet(sheetT('Mover a…', body));
  sh.addEventListener('click', async e => {
    const o = e.target.closest('[data-m]'); if(!o) return;
    const to = shelfOf(o.dataset.m), from = shelfOf(b.shelfId);
    if(to.s.id !== b.shelfId){ from.s.order = from.s.order.filter(x => x !== id); b.unitId = to.u.id; b.shelfId = to.s.id; ui.lastShelf = to.s.id; save(); renderAll(); toast(`Movido a ${to.u.name} › ${to.s.name}`); }
    await closeSheet(); after && after();
  });
}
function openSort(shelfId){
  const { s } = shelfOf(shelfId);
  const draw = () => {
    const dirs = SORT_DIR[s.sort];
    return `<div class="row-opts">${Object.entries(SORTS).map(([k, l]) => `<button class="opt" type="button" role="radio" data-sort="${k}" aria-checked="${s.sort === k}"><span class="dot"></span>${l}</button>`).join('')}</div>
      ${dirs ? `<div class="sec"><span class="lbl">Dirección</span><div class="chips">${chipsHtml([['asc', dirs[0]], ['desc', dirs[1]]], s.dir, 'data-dir')}</div></div>` : '<p class="note">Orden manual: mantén pulsado un libro y arrástralo hasta su sitio.</p>'}`;
  };
  const sh = openSheet(sheetT('Balda «' + s.name + '»', `<div class="sec"><label for="s-name">Nombre de la balda</label><input class="field" id="s-name" value="${esc(s.name)}"></div><div class="sec"><span class="lbl">Ordenar</span><div id="sbody"></div></div>`));
  $('#sbody', sh).innerHTML = draw();
  sh.addEventListener('change', e => { if(e.target.id === 's-name'){ const v = e.target.value.trim(); if(v){ s.name = v; save(); renderAll(); $('.sheet-head h2', sh).textContent = 'Balda «' + v + '»'; } } });
  sh.addEventListener('click', e => {
    const o = e.target.closest('[data-sort]'), d = e.target.closest('[data-dir]');
    if(o){ if(o.dataset.sort === 'manual' && s.sort !== 'manual') s.order = sortedBooks(s).map(b => b.id); s.sort = o.dataset.sort; if(s.sort === 'added' || s.sort === 'pub') s.dir = s.dir || 'asc'; }
    else if(d) s.dir = d.dataset.dir; else return;
    save(); renderAll(); $('#sbody', sh).innerHTML = draw();
  });
}

/* ---------- Decoración colocada a mano ---------- */
function decoThumbs(th, cur, attr){
  return `<div class="decor-grid">${Object.keys(DECO_NAMES).filter(k => DECO[k]).map(k => { const d = DECO[k](th.decoC), s = Math.min(.9, 50 / d.h);
    return `<button class="decor-opt" type="button" ${attr}="${k}" aria-pressed="${cur === k}" aria-label="${DECO_NAMES[k]}" title="${DECO_NAMES[k]}" style="opacity:1"><svg viewBox="0 0 ${d.w} ${d.h}" width="${d.w * s}" height="${d.h * s}">${d.s}</svg></button>`; }).join('')}</div>`;
}
function openAddDecor(unitId){
  const u = unitOf(unitId); if(!u) return; const th = themeOf(u);
  const sh = openSheet(sheetT('Añadir decoración', `<p class="note">Elige un objeto. Aparecerá al final de la estantería: mantenlo pulsado y arrástralo a donde quieras.</p>${decoThumbs(th, '', 'data-addk')}`));
  sh.addEventListener('click', async e => { const b = e.target.closest('[data-addk]'); if(!b) return;
    u.decorItems = u.decorItems || []; const seq = unitSeq(u);
    u.decorItems.push({ id:uid(), k:b.dataset.addk, after:seq.length ? seq[seq.length - 1].id : null, size:1 }); save(); renderAll(); await closeSheet(); toast('Mantén pulsado el objeto para moverlo'); });
}
function openDecor(decId){
  const f = decorOfUnit(decId); if(!f) return; const { u, d } = f, th = themeOf(u);
  const sizes = [['.75', 'Pequeño'], ['1', 'Mediano'], ['1.25', 'Grande']];
  const draw = () => `<p class="note">Mantén pulsado el objeto en la estantería para cambiarlo de sitio.</p><div class="sec"><span class="lbl">Tamaño</span><div class="chips">${chipsHtml(sizes, String(d.size || 1), 'data-dsize')}</div></div>
    <div class="sec"><span class="lbl">Cambiar por</span>${decoThumbs(th, d.k, 'data-dk')}</div><button class="btn danger" type="button" data-do="drm">Quitar este objeto</button>`;
  const sh = openSheet(sheetT(DECO_NAMES[d.k] || 'Decoración', '<div id="decbody" style="display:flex;flex-direction:column;gap:16px"></div>'));
  const paint = () => { $('#decbody', sh).innerHTML = draw(); $('.sheet-head h2', sh).textContent = DECO_NAMES[d.k] || 'Decoración'; }; paint();
  sh.addEventListener('click', async e => { const g = s => e.target.closest(s);
    if(g('[data-dsize]')) d.size = +g('[data-dsize]').dataset.dsize; else if(g('[data-dk]')) d.k = g('[data-dk]').dataset.dk;
    else if(g('[data-do="drm"]')){ u.decorItems = u.decorItems.filter(x => x.id !== d.id); save(); renderAll(); await closeSheet(); toast('Objeto quitado'); return; } else return;
    save(); renderAll(); paint(); });
}
