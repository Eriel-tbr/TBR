'use strict';
/* Mi TBR — estanterías, filtros, libro al azar y ajustes */
/* ---------- Estanterías y baldas ---------- */
function openUnitForm(unitId){
  const isNew = !unitId, orig = unitOf(unitId);
  const u = isNew ? { id:uid(), name:'', tipo:'', preset:'auto', wood:'', decor:null, shelves:[] } : JSON.parse(JSON.stringify(orig));
  if(!isNew && !PRESETS[u.preset]) u.preset = u.preset || 'gen';
  let presetSel = isNew ? 'auto' : (u.preset || 'gen'); const del = new Set();
  const shelfRow = s => `<div class="shelf-edit" data-sid="${s.id}"><input class="field" value="${esc(s.name)}" data-sname aria-label="Nombre de la balda"><button class="iconbtn sm" type="button" data-up aria-label="Subir">${ICON.left.replace('<svg', '<svg style="transform:rotate(90deg)"')}</button><button class="iconbtn sm" type="button" data-down aria-label="Bajar">${ICON.right.replace('<svg', '<svg style="transform:rotate(90deg)"')}</button>${unitId && orig.shelves.some(x => x.id === s.id) ? `<button class="btn sm" type="button" data-sortshelf="${s.id}">Orden</button>` : ''}<button class="iconbtn sm" type="button" data-delshelf aria-label="Eliminar balda">${ICON.x}</button></div>`;
  const body = `
    <div class="sec"><label for="u-name">Nombre</label><input class="field" id="u-name" value="${esc(u.name)}" placeholder="Fantasía, Terror, Psicología…" data-autofocus></div>
    <div class="sec"><label for="u-tipo">Tipo de libros (para elegir estilo y decoración)</label><input class="field" id="u-tipo" value="${esc(u.tipo || '')}" placeholder="Opcional: fantasía gótica, ciencia ficción, viajes…"></div>
    <div class="sec"><span class="lbl">Estilo</span><div id="u-preview" class="note"></div><div class="palette" id="u-pal"></div><div class="chips" id="u-presets"></div></div>
    <div class="sec" id="u-woodsec"><span class="lbl">Madera</span><div class="chips" id="u-wood"></div></div>
    <div class="sec"><span class="lbl">Decoración</span><div class="chips" id="u-dmode"></div><div class="note" id="u-dnote"></div><div class="chips" id="u-dauto"><button class="chip" type="button" id="u-decor-auto">Todos los del estilo</button></div><div class="decor-grid" id="u-decor"></div><div id="u-dplaced"></div></div>
    <div class="sec"><span class="lbl">Baldas (grupos dentro de la estantería: ordenan los libros, no se ven como rótulos)</span><div id="u-shelves" style="display:flex;flex-direction:column;gap:8px">${isNew ? '' : u.shelves.map(shelfRow).join('')}</div>
      ${isNew ? '<input class="field" id="u-newshelves" placeholder="Nombres separados por comas: Épica, Gótica, Otras">' : '<button class="btn sm" type="button" id="u-addshelf" style="align-self:flex-start">Añadir balda</button>'}</div>
    ${isNew || state.units.length < 2 ? '' : `<div class="sec"><span class="lbl">Eliminar estantería</span>${state.books.some(b => b.unitId === u.id) ? `<select class="field" id="u-moveto" aria-label="Mover los libros a">${state.units.filter(x => x.id !== u.id).map(x => `<option value="${x.id}">Mover sus libros a ${esc(x.name)}</option>`).join('')}</select>` : ''}<button class="btn danger" type="button" id="u-del">Eliminar estantería</button></div>`}`;
  const sh = openSheet(sheetT(isNew ? 'Nueva estantería' : 'Editar estantería', body, '<button class="btn" type="button" data-close>Cancelar</button><button class="btn primary" type="button" id="u-save">Guardar</button>'));
  const q = s => $(s, sh);
  const curKey = () => presetSel === 'auto' ? detectPreset(q('#u-name').value, q('#u-tipo').value) : presetSel;
  const tmp = () => ({ ...u, name:q('#u-name').value, tipo:q('#u-tipo').value, preset:curKey(), wood:u.wood, decor:u.decor });
  function drawStyle(){
    const t = tmp(), th = themeOf(t);
    q('#u-preview').textContent = (presetSel === 'auto' ? 'Automático: ' + (PRESETS[curKey()] ? PRESETS[curKey()].name : 'paleta propia según el nombre') : 'Elegido: ' + (PRESETS[presetSel] ? PRESETS[presetSel].name : 'paleta propia')) + ' · mueble ' + th.name.toLowerCase();
    q('#u-pal').innerHTML = th.pal.slice(0, 9).map(c => `<i style="background:${c[0]}"></i>`).join('');
    q('#u-woodsec').hidden = th.key !== 'generico';
    q('#u-presets').innerHTML = [['auto', 'Automático'], ...Object.entries(PRESETS).map(([k, p]) => [k, p.name]), ['gen', 'Paleta propia']].map(([k, l]) => `<button class="chip" type="button" data-preset="${k}" aria-pressed="${presetSel === k}">${l}</button>`).join('');
    q('#u-wood').innerHTML = `<button class="chip" type="button" data-wood="" aria-pressed="${!u.wood}">Del estilo</button>` + WOODS.map(w => `<button class="chip" type="button" data-wood="${w}" aria-pressed="${u.wood === w}" aria-label="Madera ${w}" style="background:${w};min-width:40px;border-color:${u.wood === w ? 'var(--acc)' : 'transparent'}"></button>`).join('');
    const on = new Set(themeDecor(t, th));
    q('#u-decor').innerHTML = Object.keys(DECO_NAMES).filter(k => DECO[k]).map(k => { const d = DECO[k](th.decoC); return `<button class="decor-opt" type="button" data-decor="${k}" aria-pressed="${on.has(k)}" aria-label="${DECO_NAMES[k]}" title="${DECO_NAMES[k]}"><svg viewBox="0 0 ${d.w} ${d.h}" width="${d.w * Math.min(.9, 50 / d.h)}" height="${d.h * Math.min(.9, 50 / d.h)}">${d.s}</svg></button>`; }).join('');
    q('#u-decor-auto').setAttribute('aria-pressed', u.decor ? 'false' : 'true');
    const man = u.decorMode === 'manual';
    q('#u-dmode').innerHTML = chipsHtml([['auto', 'Automática'], ['manual', 'La elijo y la coloco yo']], man ? 'manual' : 'auto', 'data-dmode');
    q('#u-dnote').textContent = man ? 'Toca un objeto para añadirlo al final. Luego, en la estantería, mantenlo pulsado para moverlo, o tócalo para cambiar su tamaño o quitarlo.' : 'Marca qué objetos puede usar; se reparten solos entre los libros.';
    q('#u-dauto').hidden = man;
    if(man){ q('#u-decor').innerHTML = Object.keys(DECO_NAMES).filter(k => DECO[k]).map(k => { const d = DECO[k](th.decoC), s = Math.min(.9, 50 / d.h); return `<button class="decor-opt" type="button" data-dadd="${k}" aria-label="Añadir ${DECO_NAMES[k]}" style="opacity:1"><svg viewBox="0 0 ${d.w} ${d.h}" width="${d.w * s}" height="${d.h * s}">${d.s}</svg></button>`; }).join('');
      const items = u.decorItems || [];
      q('#u-dplaced').innerHTML = items.length ? `<div class="chips">${items.map(it => `<span class="chip on">${esc(DECO_NAMES[it.k] || it.k)} <button type="button" data-drm="${it.id}" aria-label="Quitar" style="all:unset;cursor:pointer">×</button></span>`).join('')}</div>` : '<span class="note">Aún no hay objetos colocados.</span>'; }
    else q('#u-dplaced').innerHTML = '';
  }
  drawStyle();
  sh.addEventListener('input', e => { if(e.target.id === 'u-name' || e.target.id === 'u-tipo') drawStyle(); });
  sh.addEventListener('click', async e => {
    const t = e.target, g = s => t.closest(s);
    if(g('[data-sortshelf]')){ openSort(g('[data-sortshelf]').dataset.sortshelf); return; }
    if(g('[data-preset]')){ presetSel = g('[data-preset]').dataset.preset; if(presetSel === 'gen') u.hue = u.hue ?? Math.floor(Math.random() * 360); drawStyle(); }
    else if(g('[data-wood]')){ u.wood = g('[data-wood]').dataset.wood; drawStyle(); }
    else if(g('[data-decor]')){ const k = g('[data-decor]').dataset.decor; const cur = [...themeDecor(tmp(), themeOf(tmp()))]; const i = cur.indexOf(k); if(i >= 0) cur.splice(i, 1); else cur.push(k); u.decor = cur.length ? cur : null; drawStyle(); }
    else if(g('#u-decor-auto')){ u.decor = null; drawStyle(); }
    else if(g('[data-dmode]')){ const m = g('[data-dmode]').dataset.dmode;
      if(m === 'manual' && u.decorMode !== 'manual' && !(u.decorItems || []).length && orig){ u.decorItems = autoPlan(orig, themeOf(tmp()), unitSeq(orig)).map(p => ({ ...p, id:uid(), size:Math.round(p.size * 100) / 100 })); }
      u.decorMode = m; drawStyle(); }
    else if(g('[data-dadd]')){ u.decorItems = u.decorItems || []; const seq = orig ? unitSeq(orig) : []; u.decorItems.push({ id:uid(), k:g('[data-dadd]').dataset.dadd, after:seq.length ? seq[seq.length - 1].id : null, size:1 }); drawStyle(); toast('Añadido al final de la estantería'); }
    else if(g('[data-drm]')){ u.decorItems = (u.decorItems || []).filter(x => x.id !== g('[data-drm]').dataset.drm); drawStyle(); }
    else if(g('#u-addshelf')){ const id = uid(); const d = document.createElement('div'); d.innerHTML = shelfRow({ id, name:'Nueva balda' }); q('#u-shelves').append(d.firstChild); u.shelves.push({ ...mkShelf('Nueva balda'), id }); q('#u-shelves').lastElementChild.querySelector('input').select(); }
    else if(g('[data-up]')){ const r = g('.shelf-edit'); r.previousElementSibling && r.previousElementSibling.before(r); }
    else if(g('[data-down]')){ const r = g('.shelf-edit'); r.nextElementSibling && r.nextElementSibling.after(r); }
    else if(g('[data-delshelf]')){
      const r = g('.shelf-edit'), rows = $$('.shelf-edit', sh);
      if(rows.length < 2){ toast('Debe quedar al menos una balda'); return; }
      const n = state.books.filter(b => b.shelfId === r.dataset.sid).length, b = g('[data-delshelf]');
      if(n && !b.dataset.sure){ b.dataset.sure = '1'; b.style.color = 'var(--danger)'; toast(`Sus ${n} libros pasarán a otra balda. Toca de nuevo para confirmar`); return; }
      del.add(r.dataset.sid); r.remove();
    }
    else if(g('#u-del')){
      const b = g('#u-del'); if(!b.dataset.sure){ b.dataset.sure = '1'; b.textContent = 'Toca otra vez para eliminar'; return; }
      const to = unitOf((q('#u-moveto') || {}).value) || state.units.find(x => x.id !== u.id);
      state.books.filter(x => x.unitId === u.id).forEach(x => { x.unitId = to.id; x.shelfId = to.shelves[0].id; to.shelves[0].order = []; });
      state.units = state.units.filter(x => x.id !== u.id); ui.active = 0; save(); renderAll(); await closeSheet(); toast('Estantería eliminada');
    }
    else if(g('#u-save')){
      const name = q('#u-name').value.trim(); if(!name){ toast('Ponle un nombre a la estantería'); return; }
      const key = curKey(), data = { name, tipo:q('#u-tipo').value.trim(), preset:key, wood:u.wood || '', decor:u.decor, hue:u.hue, decorMode:u.decorMode || 'auto', decorItems:u.decorItems || [] };
      if(isNew){
        const names = (q('#u-newshelves').value || '').split(',').map(s => s.trim()).filter(Boolean);
        Object.assign(u, data); u.shelves = (names.length ? names : ['General']).map(mkShelf); state.units.push(u); ui.active = state.units.length - 1;
      } else {
        Object.assign(orig, data);
        const rows = $$('.shelf-edit', sh), keep = [];
        rows.forEach(r => { const id = r.dataset.sid, name = r.querySelector('input').value.trim() || 'Balda'; let s = orig.shelves.find(x => x.id === id); if(!s){ s = mkShelf(name); s.id = id; } s.name = name; keep.push(s); });
        const first = keep[0];
        orig.shelves.filter(s => del.has(s.id)).forEach(s => state.books.filter(b => b.shelfId === s.id).forEach(b => { b.shelfId = first.id; first.order = []; first.sort = first.sort === 'manual' ? 'added' : first.sort; }));
        orig.shelves = keep;
      }
      save(); renderAll(); await closeSheet(); if(isNew) setTimeout(() => goTo(ui.active), 50);
    }
  });
}

/* ---------- Buscar y filtrar ---------- */
function openFilters(){
  const f = JSON.parse(JSON.stringify(ui.filters));
  const draw = () => `
    <div class="sec"><label for="q-text">Buscar</label><input class="field" id="q-text" type="search" value="${esc(f.q)}" placeholder="Título, autor, etiqueta o nota" data-autofocus></div>
    <div class="sec"><span class="lbl">Estado</span><div class="chips">${chipsHtml([['', 'Todos'], ...Object.entries(STATUS)], f.status, 'data-st')}</div></div>
    <div class="sec"><span class="lbl">Idioma</span><div class="chips">${chipsHtml([['', 'Cualquiera'], ['es', 'Solo español'], ['en', 'Solo inglés'], ['both', 'Ambos']], f.lang, 'data-lg')}</div></div>
    <div class="sec"><span class="lbl">Longitud</span><div class="chips">${chipsHtml([['', 'Cualquiera'], ['corto', 'Menos de 300'], ['medio', '300–500'], ['largo', 'Más de 500']], f.len, 'data-ln')}</div></div>
    <div class="sec"><span class="lbl">Etiquetas (deben cumplirse todas)</span><div class="chips">${allTags().map(([t, n]) => `<button class="chip" type="button" data-tg="${esc(t)}" aria-pressed="${f.tags.includes(t)}">${esc(t)} <small>${n}</small></button>`).join('') || '<span class="note">Aún no hay etiquetas.</span>'}</div></div>`;
  const sh = openSheet(sheetT('Buscar y filtrar', '<div id="qbody"></div>', '<button class="btn" type="button" id="q-clear">Limpiar</button><button class="btn primary" type="button" id="q-apply">Aplicar</button>'));
  const paint = () => { const keep = $('#q-text', sh) && $('#q-text', sh).value; $('#qbody', sh).innerHTML = draw(); if(keep !== null && keep !== undefined && $('#q-text', sh)) $('#q-text', sh).value = keep; };
  paint();
  sh.addEventListener('input', e => { if(e.target.id === 'q-text') f.q = e.target.value; });
  sh.addEventListener('click', async e => {
    const g = s => e.target.closest(s);
    if(g('[data-st]')) f.status = g('[data-st]').dataset.st; else if(g('[data-lg]')) f.lang = g('[data-lg]').dataset.lg; else if(g('[data-ln]')) f.len = g('[data-ln]').dataset.ln;
    else if(g('[data-tg]')){ const t = g('[data-tg]').dataset.tg; f.tags = f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t]; }
    else if(g('#q-clear')){ ui.filters = { q:'', status:'', lang:'', tags:[], len:'' }; renderAll(); await closeSheet(); return; }
    else if(g('#q-apply')){ ui.filters = f; renderAll(); await closeSheet(); return; }
    else return;
    paint();
  });
}

/* ---------- Libro aleatorio ---------- */
function openRandom(){
  const f = { unit:'', lang:'', tag:'', len:'', kind:'' }; let cur = null;
  const pool = () => state.books.filter(b => (b.status || 'pendiente') === 'pendiente' && (!f.unit || b.unitId === f.unit) && (!f.kind || seriesKind(state, b) === f.kind) && matches(b, { q:'', status:'', lang:f.lang, tags:f.tag ? [f.tag] : [], len:f.len }));
  const body = `<div id="r-card" class="random-card"></div>
    <div class="sec"><span class="lbl">Condiciones</span>
    <select class="field" id="r-unit" aria-label="Estantería"><option value="">Cualquier estantería</option>${state.units.map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select>
    <div class="chips">${chipsHtml([['', 'Cualquier idioma'], ['es', 'Solo español'], ['en', 'Solo inglés'], ['both', 'Ambos']], '', 'data-lg')}</div>
    <div class="chips">${chipsHtml([['', 'Cualquier longitud'], ['corto', 'Corto'], ['medio', 'Medio'], ['largo', 'Largo']], '', 'data-ln')}</div>
    <div class="chips">${chipsHtml([['', 'Cualquier tipo'], ['ind', 'Individual'], ['bitri', 'Duología / trilogía'], ['saga', 'Saga']], '', 'data-kd')}</div>
    <select class="field" id="r-tag" aria-label="Etiqueta"><option value="">Cualquier etiqueta</option>${allTags().map(([t]) => `<option>${esc(t)}</option>`).join('')}</select></div>`;
  const sh = openSheet(sheetT('Libro aleatorio', body, '<button class="btn" type="button" id="r-open" disabled>Ver ficha</button><button class="btn primary" type="button" id="r-roll">Otro libro</button>'));
  const roll = () => {
    const p = pool(), card = $('#r-card', sh);
    if(!p.length){ cur = null; card.innerHTML = '<p class="note">Ningún libro pendiente cumple esas condiciones.</p>'; $('#r-open', sh).disabled = true; return; }
    let b = p[Math.floor(Math.random() * p.length)]; if(p.length > 1) while(cur && b.id === cur.id) b = p[Math.floor(Math.random() * p.length)];
    cur = b; $('#r-open', sh).disabled = false;
    card.innerHTML = `<div class="cover-box spin">${coverHtml(b)}</div><div><h2>${esc(b.title)}</h2><div>${esc(b.author)}</div>${b.series && b.series.name ? `<div class="note">${esc(b.series.name)} · ${b.series.n || '?'}${seriesTotal(state, b) ? ' de ' + seriesTotal(state, b) : ''}</div>` : ''}<div class="chips" style="justify-content:center;margin-top:6px">${langBadges(b)}${b.pages ? `<span class="badge">${b.pages} págs.</span>` : ''}</div></div>
      ${b.synopsis ? `<p class="note" style="max-height:6.5em;overflow:hidden">${esc(b.synopsis.slice(0, 260))}${b.synopsis.length > 260 ? '…' : ''}</p>` : ''}<div class="note">${esc(locName(b))}</div>`;
  };
  roll();
  sh.addEventListener('change', e => { if(e.target.id === 'r-unit'){ f.unit = e.target.value; roll(); } if(e.target.id === 'r-tag'){ f.tag = e.target.value; roll(); } });
  sh.addEventListener('click', async e => {
    const g = s => e.target.closest(s);
    if(g('[data-lg]')){ f.lang = g('[data-lg]').dataset.lg; $$('[data-lg]', sh).forEach(c => c.setAttribute('aria-pressed', c === g('[data-lg]'))); roll(); }
    else if(g('[data-ln]')){ f.len = g('[data-ln]').dataset.ln; $$('[data-ln]', sh).forEach(c => c.setAttribute('aria-pressed', c === g('[data-ln]'))); roll(); }
    else if(g('[data-kd]')){ f.kind = g('[data-kd]').dataset.kd; $$('[data-kd]', sh).forEach(c => c.setAttribute('aria-pressed', c === g('[data-kd]'))); roll(); }
    else if(g('#r-roll')) roll();
    else if(g('#r-open') && cur){ const id = cur.id; await closeSheet(); openDetail(id); }
  });
}

/* ---------- Ajustes ---------- */
function applyTheme(){ const t = state.settings.theme; if(t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t; setAccent(); }
function statsHtml(){
  const bs = state.books, yr = new Date().getFullYear(), pend = bs.filter(b => (b.status || 'pendiente') === 'pendiente');
  const pg = pend.reduce((a, b) => a + (+b.pages || 0), 0), read = bs.filter(b => b.status === 'leido');
  const kind = k => bs.filter(b => langKind(b) === k).length;
  return `<dl class="kv"><dt>Libros</dt><dd>${bs.length}</dd><dt>Pendientes</dt><dd>${pend.length}${pg ? ` (unas ${pg.toLocaleString('es-ES')} páginas)` : ''}</dd><dt>Leyendo</dt><dd>${bs.filter(b => b.status === 'leyendo').length}</dd>
    <dt>Leídos</dt><dd>${read.length} (${read.filter(b => b.readAt && new Date(b.readAt).getFullYear() === yr).length} este año)</dd>
    <dt>Solo español</dt><dd>${kind('es')}</dd><dt>Solo inglés</dt><dd>${kind('en')}</dd><dt>En ambos</dt><dd>${kind('both')}</dd>
    ${state.units.map(u => `<dt>${esc(u.name)}</dt><dd>${bs.filter(b => b.unitId === u.id).length}</dd>`).join('')}</dl>`;
}
function openSettings(){
  const body = `
    <div class="sec"><span class="lbl">Tema</span><div class="chips">${chipsHtml([['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']], state.settings.theme, 'data-theme')}</div></div>
    <div class="sec"><span class="lbl">Objetos decorativos</span><div class="chips">${chipsHtml([['1', 'Mostrar'], ['0', 'Ocultar']], state.settings.decor === false ? '0' : '1', 'data-decor')}</div></div>
    <div class="sec"><span class="lbl">Estadísticas</span>${statsHtml()}</div>
    <div class="sec"><span class="lbl">Cuenta y copia en la nube</span><div id="cloud-sec">${cloudSecHtml()}</div></div>
    <div class="sec"><span class="lbl">Copia en archivo</span><p class="note">Un archivo con toda tu colección, por si quieres guardarla aparte o pasarla a otra app.</p>
      <div class="actions"><button class="btn" type="button" data-do="export">Guardar copia</button><button class="btn" type="button" data-do="share">Compartir copia</button><button class="btn" type="button" data-do="import">Importar copia</button></div>
      <input id="s-file" type="file" accept="application/json,.json" hidden><div id="s-import"></div></div>
    <div class="sec"><span class="lbl">Zona delicada</span><button class="btn danger" type="button" data-do="reset">Borrar todo y empezar de cero</button></div>`;
  const sh = openSheet(sheetT('Ajustes', body));
  sh.addEventListener('click', async e => {
    const g = s => e.target.closest(s);
    if(g('[data-theme]')){ state.settings.theme = g('[data-theme]').dataset.theme; save(); applyTheme(); $$('[data-theme]', sh).forEach(c => c.setAttribute('aria-pressed', c === g('[data-theme]'))); }
    else if(g('[data-decor]')){ state.settings.decor = g('[data-decor]').dataset.decor === '1'; save(); renderAll(); $$('[data-decor]', sh).forEach(c => c.setAttribute('aria-pressed', c === g('[data-decor]'))); }
    else if(g('[data-do="export"]')) exportJson();
    else if(g('[data-do="share"]')) shareJson();
    else if(g('[data-do="import"]')) $('#s-file', sh).click();
    else if(g('[data-do="reset"]')){ const b = g('[data-do="reset"]'); if(!b.dataset.sure){ b.dataset.sure = '1'; b.textContent = 'Toca otra vez: se borrará todo'; return; }
      state = { v:1, settings:state.settings, units:[{ id:uid(), name:'Mi estantería', tipo:'', preset:'generico', shelves:[mkShelf('General')] }], books:[], seriesStyle:{} }; save(); ui.active = 0; renderAll(); await closeSheet(); toast('Colección vacía'); }
    else if(g('[data-imp]')){ applyImport(g('[data-imp]').dataset.imp); await closeSheet(); }
  });
  sh.addEventListener('change', async e => {
    if(e.target.id !== 's-file' || !e.target.files[0]) return;
    try{
      const data = JSON.parse(await e.target.files[0].text());
      if(!(data && data.v === 1 && Array.isArray(data.units) && Array.isArray(data.books))) throw new Error('formato');
      pendingImport = data;
      $('#s-import', sh).innerHTML = `<div class="notice">Copia con ${data.books.length} libros y ${data.units.length} estanterías.</div><div class="actions" style="margin-top:8px"><button class="btn primary" type="button" data-imp="merge">Añadir a lo que tengo</button><button class="btn danger" type="button" data-imp="replace">Reemplazar todo</button></div>`;
    }catch(err){ toast('Ese archivo no es una copia válida de Mi TBR'); }
  });
}
let pendingImport = null;
function applyImport(mode){
  const d = pendingImport; if(!d) return;
  if(mode === 'replace'){ state = d; if(!state.settings) state.settings = { theme:'auto', decor:true }; state.seriesStyle = state.seriesStyle || {}; }
  else { d.units.forEach(u => { if(!unitOf(u.id)) state.units.push(u); }); d.books.forEach(b => { if(!bookOf(b.id)) state.books.push(b); }); Object.assign(state.seriesStyle, d.seriesStyle || {}); }
  pendingImport = null; save(); ui.active = 0; applyTheme(); renderAll(); toast('Copia importada');
}
function exportJson(){
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 1)], { type:'application/json' }));
  a.download = `mi-tbr-${new Date().toISOString().slice(0, 10)}.json`; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
async function shareJson(){
  const file = new File([JSON.stringify(state)], 'mi-tbr.json', { type:'application/json' });
  try{ if(navigator.canShare && navigator.canShare({ files:[file] })) await navigator.share({ files:[file], title:'Copia de Mi TBR' }); else exportJson(); }catch(e){}
}
