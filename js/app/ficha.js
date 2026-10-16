'use strict';
/* Mi TBR — ficha de un libro y decoración colocada a mano */
/* ---------- Ficha de un libro ---------- */
function openDetail(id){
  const b0 = bookOf(id); if(!b0) return; lastTab.ficha = 'resumen'; // al abrir, siempre el resumen; al redibujar se mantiene la pestaña
  // Pestañas: Resumen · Detalles · Serie y audio · Comprar. Editar y Mover, siempre a mano en el pie.
  const TABS = [['resumen', 'Resumen'], ['detalles', 'Detalles'], ['extra', b0.series && b0.series.name ? 'Serie y audio' : 'Audio'], ['comprar', 'Comprar']];
  const sh = openSheet(sheetT('Ficha', '<div id="dbody"></div>', '<button class="btn" type="button" data-do="move">Mover a…</button><button class="btn primary" type="button" data-do="edit">Editar</button>',
    tabsBar('ficha', TABS, startTab('ficha', TABS))));
  const draw = () => {
    const b = bookOf(id); if(!b){ closeSheet(); return; }
    const cur = startTab('ficha', TABS);
    const resumen = `
      <div class="hero"><div class="cover-box">${coverHtml(b)}</div><div class="meta"><h2>${esc(b.title)}</h2>${b.origTitle && norm(b.origTitle) !== norm(b.title) ? `<div class="note">Título original: ${esc(b.origTitle)}</div>` : ''}<div>${esc(b.author) || '<span class="note">Autor sin indicar</span>'}</div>
        <div class="chips">${langBadges(b)}<span class="badge">${STATUS[b.status || 'pendiente']}</span>${b.next ? '<span class="badge">Siguiente lectura</span>' : ''}</div>
        ${b.series && b.series.name ? `<div class="note">Serie: ${esc(b.series.name)} · libro ${b.series.n || '?'}${seriesTotal(state, b) ? ' de ' + seriesTotal(state, b) : ''}</div>` : ''}
        <div class="note">${esc(locName(b))}</div>
        ${b.status === 'leido' ? `<div class="stars" aria-label="Puntuación">${[1,2,3,4,5].map(n => `<button class="star ${n <= b.rating ? 'on' : ''}" type="button" data-star="${n}" aria-label="${n} de 5">${ICON.star}</button>`).join('')}</div>` : ''}
      </div></div>
      <div class="actions">
        ${b.status === 'pendiente' ? '<button class="btn primary" type="button" data-do="start">Empezar a leer</button>' : ''}
        ${b.status === 'leyendo' ? '<button class="btn primary" type="button" data-do="finish">Marcar como leído</button>' : ''}
        ${b.status === 'pendiente' ? '<button class="btn" type="button" data-do="finish">Ya lo he leído</button>' : ''}
        ${b.status === 'leido' ? '<button class="btn" type="button" data-do="pending">Volver a pendiente</button>' : ''}
        ${b.status !== 'leido' ? `<button class="btn" type="button" data-do="next">${b.next ? 'Quitar de siguiente' : 'Siguiente lectura'}</button>` : ''}</div>
      ${b.synopsis ? `<div class="sec"><span class="lbl">Sinopsis</span><div class="synopsis clamp" id="dsyn">${esc(b.synopsis)}</div>${b.synopsis.length > 420 ? '<button class="linkbtn" type="button" data-do="more">Leer más</button>' : ''}</div>` : '<p class="note">Sin sinopsis. Puedes completarla en Editar → Revisar con internet.</p>'}`;
    const detalles = `
      <dl class="kv"><dt>Páginas</dt><dd>${b.pages || '—'}</dd><dt>Publicación</dt><dd>${b.year || '—'}</dd>
        <dt>Idiomas</dt><dd>${(b.langs || []).length === 2 ? 'Español e inglés' : (b.langs || [])[0] === 'es' ? 'Solo español' : (b.langs || [])[0] === 'en' ? 'Solo inglés' : '—'}</dd>
        <dt>Dónde está</dt><dd>${esc(locName(b))}</dd>
        ${b.readAt ? `<dt>Leído</dt><dd>${new Date(b.readAt).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}</dd>` : ''}</dl>
      ${(b.tags || []).length ? `<div class="sec"><span class="lbl">Etiquetas</span><div class="chips">${b.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>` : ''}
      ${b.notes ? `<div class="sec"><span class="lbl">Notas</span><div class="synopsis">${esc(b.notes)}</div></div>` : ''}
      <button class="btn danger" type="button" data-do="del">Borrar libro</button>`;
    $('#dbody', sh).innerHTML = tabPanel('ficha', 'resumen', cur, resumen) + tabPanel('ficha', 'detalles', cur, detalles)
      + tabPanel('ficha', 'extra', cur, '<div id="dextra" style="display:flex;flex-direction:column;gap:18px"></div>') + tabPanel('ficha', 'comprar', cur, '<div id="dshop"></div>');
    fichaExtras(sh, id);
  };
  draw();
  sh.addEventListener('click', async e => {
    const star = e.target.closest('[data-star]'), act = e.target.closest('[data-do]'), b = bookOf(id); if(!b) return;
    if(star){ b.rating = b.rating === +star.dataset.star ? 0 : +star.dataset.star; save(); draw(); return; }
    if(!act || act.closest('#dextra')) return; const a = act.dataset.do; // lo de #dextra lo gestiona ficha-extra.js
    if(a === 'start'){ b.status = 'leyendo'; }
    else if(a === 'finish'){ b.status = 'leido'; b.readAt = Date.now(); b.next = false; }
    else if(a === 'pending'){ b.status = 'pendiente'; b.readAt = null; }
    else if(a === 'next'){ const on = !b.next; state.books.forEach(x => x.next = false); b.next = on; }
    else if(a === 'edit'){ await closeSheet(); openBookForm({ book:b }); return; }
    else if(a === 'move'){ openMove(id, draw); return; }
    else if(a === 'more'){ const s = $('#dsyn', sh); s.classList.toggle('clamp'); act.textContent = s.classList.contains('clamp') ? 'Leer más' : 'Leer menos'; return; }
    else if(a === 'del'){ if(confirmTap(act, 'Borrar libro')){ await closeSheet(); deleteBook(id); } return; }
    save(); renderAll(); draw();
  });
}
/* Borrar con dos toques (el primero avisa) y con «Deshacer» en el aviso */
function confirmTap(btn, label){
  if(btn.dataset.sure) return true;
  btn.dataset.sure = '1'; btn.textContent = 'Toca otra vez para borrar'; setTimeout(() => { if(btn.isConnected){ btn.dataset.sure = ''; btn.textContent = label; } }, 3000);
  return false;
}
function deleteBook(id){
  const b = bookOf(id); if(!b) return; const copy = JSON.parse(JSON.stringify(b)), s = shelfOf(b.shelfId);
  state.books = state.books.filter(x => x.id !== id); if(s) s.s.order = s.s.order.filter(x => x !== id);
  state.units.forEach(u => (u.gaps || []).forEach(g => { if(g.after === id) g.after = null; }));
  save(); renderAll();
  toast(`«${b.title}» borrado`, () => { copy.upd = Date.now(); state.books.push(copy); if(state.deleted) delete state.deleted[id]; save(); renderAll(); });
}
function openMove(id, after){
  const b = bookOf(id);
  // La estantería actual primero y abierta; las demás plegadas. En cada una se puede crear una balda, y al final una estantería.
  const units = [...state.units].sort((x, y) => (y.id === b.unitId) - (x.id === b.unitId));
  const gapsHtml = `<div class="sec"><span class="lbl">Dejar espacio libre en la balda</span><div class="actions"><button class="btn" type="button" data-gap="before">Hueco antes</button><button class="btn" type="button" data-gap="after">Hueco después</button></div>
    <p class="note">Luego eliges su tamaño: con «Hasta la otra mitad» el libro siguiente pasa al otro lado.</p></div>`;
  const body = units.map(u => fold(esc(u.name) + (u.id === b.unitId ? ' <small>ahora aquí</small>' : ''), `<div class="row-opts">${u.shelves.map(s => `<button class="opt" type="button" role="radio" data-m="${s.id}" aria-checked="${s.id === b.shelfId}"><span class="dot"></span>${esc(s.name)}</button>`).join('')}</div>
      <button class="chip" type="button" data-newshelf="${u.id}" style="align-self:flex-start">+ Nueva balda en ${esc(u.name)}</button>`, u.id === b.unitId)).join('')
    + '<button class="btn" type="button" data-do="newunitmove">+ Nueva estantería</button>' + gapsHtml;
  const sh = openSheet(sheetT('Mover a…', body));
  const moveTo = async shelfId => { const to = shelfOf(shelfId), from = shelfOf(b.shelfId);
    if(to.s.id !== b.shelfId){ from && (from.s.order = from.s.order.filter(x => x !== id)); b.unitId = to.u.id; b.shelfId = to.s.id; ui.lastShelf = to.s.id; save(); renderAll(); toast(`Movido a ${to.u.name} › ${to.s.name}`); }
    await closeSheet(); after && after(); };
  sh.addEventListener('click', async e => {
    const gb = e.target.closest('[data-gap]'); if(gb){ const u = unitOf(b.unitId); if(!u) return; const seq = unitSeq(u).map(x => x.id), i = seq.indexOf(id);
      const g = { id:uid(), size:'sm', after:gb.dataset.gap === 'after' ? id : i > 0 ? seq[i - 1] : null }; (u.gaps = u.gaps || []).push(g); save(); renderAll();
      await closeSheet(); after && after(); openGap(g.id); return; }
    const ns = e.target.closest('[data-newshelf]'); if(ns){ const s = await newShelfIn(ns.dataset.newshelf); if(s) await moveTo(s.id); return; }
    if(e.target.closest('[data-do="newunitmove"]')){ const u = await newUnitQuick(); if(u) await moveTo(u.shelves[0].id); return; }
    const o = e.target.closest('[data-m]'); if(o) await moveTo(o.dataset.m);
  });
}
function openSort(shelfId){
  const { s } = shelfOf(shelfId);
  const draw = () => {
    const dirs = SORT_DIR[s.sort];
    return `<div class="row-opts">${Object.entries(SORTS).map(([k, l]) => `<button class="opt" type="button" role="radio" data-sort="${k}" aria-checked="${s.sort === k}"><span class="dot"></span>${l}</button>`).join('')}</div>
      ${dirs ? `<div class="sec"><span class="lbl">Dirección</span><div class="chips">${chipsHtml([['asc', dirs[0]], ['desc', dirs[1]]], s.dir, 'data-dir')}</div></div>` : '<p class="note">Orden manual: mantén pulsado un libro y arrástralo hasta su sitio.</p>'}`;
  };
  const sh = openSheet(sheetT('Balda «' + s.name + '»', `<div class="sec"><label for="s-name">Nombre de la balda</label>${lineHtml('class="field" id="s-name"', s.name)}</div><div class="sec"><span class="lbl">Ordenar</span><div id="sbody"></div></div>`));
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
/* Hueco: tamaño, posición y quitar */
function openGap(gapId){
  const f = gapOfUnit(gapId); if(!f) return; const { u, g } = f;
  const draw = () => `<p class="note">Un hueco es espacio libre en la balda. Mantenlo pulsado y arrástralo, o muévelo de libro en libro con estos botones.</p>
    <div class="sec"><span class="lbl">Tamaño</span><div class="row-opts">${Object.entries(GAP_SIZES).map(([k, [l]]) => `<button class="opt" type="button" role="radio" data-gsize="${k}" aria-checked="${(g.size || 'sm') === k}"><span class="dot"></span>${l}</button>`).join('')}</div></div>
    <div class="sec"><span class="lbl">Posición</span><div class="actions"><button class="btn" type="button" data-gmove="-1">‹ Antes</button><button class="btn" type="button" data-gmove="1">Después ›</button></div></div>
    <button class="btn danger" type="button" data-do="grm">Quitar el hueco</button>`;
  const sh = openSheet(sheetT('Hueco', '<div id="gapbody" style="display:flex;flex-direction:column;gap:16px"></div>'));
  const paint = () => { $('#gapbody', sh).innerHTML = draw(); }; paint();
  sh.addEventListener('click', async e => { const q = s => e.target.closest(s);
    if(q('[data-gsize]')) g.size = q('[data-gsize]').dataset.gsize;
    else if(q('[data-gmove]')){ const seq = unitSeq(u).map(b => b.id), i = g.after ? seq.indexOf(g.after) : -1, j = clamp(i + +q('[data-gmove]').dataset.gmove, -1, seq.length - 1);
      if(j === i){ toast(j < 0 ? 'Ya está al principio' : 'Ya está al final'); return; } g.after = j < 0 ? null : seq[j]; }
    else if(q('[data-do="grm"]')){ u.gaps = u.gaps.filter(x => x !== g); save(); renderAll(); await closeSheet(); toast('Hueco quitado'); return; } else return;
    save(); renderAll(); paint(); });
}
function openDecor(decId){
  if(String(decId).startsWith('auto:')){ decId = materializeDecor(decId); save(); renderAll(); }
  const f = decorOfUnit(decId); if(!f) return; const { u, d } = f, th = themeOf(u);
  const sizes = [['.75', 'Pequeño'], ['1', 'Mediano'], ['1.25', 'Grande']];
  const draw = () => `<p class="note">Mantén pulsado el objeto en la estantería y arrástralo, o muévelo de libro en libro con estos botones.</p>
    <div class="sec"><span class="lbl">Posición</span><div class="actions"><button class="btn" type="button" data-dmove="-1">‹ Antes</button><button class="btn" type="button" data-dmove="1">Después ›</button></div></div><div class="sec"><span class="lbl">Tamaño</span><div class="chips">${chipsHtml(sizes, String(d.size || 1), 'data-dsize')}</div></div>
    <div class="sec"><span class="lbl">Cambiar por</span>${decoThumbs(th, d.k, 'data-dk')}</div><button class="btn danger" type="button" data-do="drm">Quitar este objeto</button>`;
  const sh = openSheet(sheetT(DECO_NAMES[d.k] || 'Decoración', '<div id="decbody" style="display:flex;flex-direction:column;gap:16px"></div>'));
  const paint = () => { $('#decbody', sh).innerHTML = draw(); $('.sheet-head h2', sh).textContent = DECO_NAMES[d.k] || 'Decoración'; }; paint();
  sh.addEventListener('click', async e => { const g = s => e.target.closest(s);
    if(g('[data-dsize]')) d.size = +g('[data-dsize]').dataset.dsize; else if(g('[data-dk]')) d.k = g('[data-dk]').dataset.dk;
    else if(g('[data-dmove]')){ const seq = unitSeq(u).map(b => b.id), i = d.after ? seq.indexOf(d.after) : -1, j = clamp(i + +g('[data-dmove]').dataset.dmove, -1, seq.length - 1);
      if(j === i){ toast(j < 0 ? 'Ya está al principio' : 'Ya está al final'); return; } d.after = j < 0 ? null : seq[j]; }
    else if(g('[data-do="drm"]')){ u.decorItems = u.decorItems.filter(x => x.id !== d.id); save(); renderAll(); await closeSheet(); toast('Objeto quitado'); return; } else return;
    save(); renderAll(); paint(); });
}
