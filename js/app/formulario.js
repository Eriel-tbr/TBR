'use strict';
/* Mi TBR — formulario de libro (datos, serie y lomo) */
/* ---------- Formulario de libro ---------- */
function lastLoc(){
  const l = ui.lastShelf && shelfOf(ui.lastShelf);
  if(l) return { unitId:l.u.id, shelfId:l.s.id };
  const u = state.units[ui.active] || state.units[0]; return { unitId:u.id, shelfId:u.shelves[0].id };
}
function newDraft(item){
  const it = item || {}, sugTags = suggestTags(it), sug = suggestShelf(state, sugTags), loc = sug || lastLoc();
  const ps = parseSeries(it.title); let title = it.title || '', series = null, serNote = '', origTitle = '';
  if(ps){ title = title.replace(/\s*\([^()]*\)\s*$/, '').trim() || title; series = { name:ps.name, n:ps.n, total:'' }; serNote = 'detectada en el título'; }
  else if(it.series && it.series.name){ series = { name:it.series.name, n:it.series.n || '', total:it.series.total || '' }; serNote = 'según Hardcover'; }
  else if(it.seriesN){ const same = state.books.find(b => b.series && b.series.name && lastName(b.author) && lastName(b.author) === lastName(it.author)); if(same){ series = { name:same.series.name, n:+it.seriesN, total:same.series.total || '' }; serNote = 'según Google Books y tus otros libros de esta autora o autor'; } }
  // Buscado por su título en español: se queda ese título y el original se guarda para buscar en fuentes en inglés
  if(it.esTitleQ && norm(it.esTitleQ) !== norm(title)){ origTitle = title; title = it.esTitleQ; }
  return { serNote, draft:{ series, spine:null, id:uid(), title, ...(origTitle ? { origTitle } : {}), author:it.author || '', synopsis:it.desc || '', pages:it.pages || '', year:it.year || '', langs:detectLangs(it), formats:{}, tags:[], notes:'',
    status:'pendiente', rating:0, next:false, cover:(it.covers || [])[0] || '', cover2:(it.covers || [])[1] || '', coverData:'', unitId:loc.unitId, shelfId:loc.shelfId, addedAt:Date.now() }, sugTags, sugged:!!sug };
}
function openBookForm({ book, item }){
  const isNew = !book; let sugTags = [], sugged = false, d;
  let serNote = '', autoSyn = '';
  if(isNew){ const n = newDraft(item); d = n.draft; sugTags = n.sugTags; sugged = n.sugged; serNote = n.serNote; autoSyn = d.synopsis; } else d = JSON.parse(JSON.stringify(book));
  d.series = d.series || null; d.spine = d.spine || null;
  let serStyle = d.series && d.series.name ? { ...((state.seriesStyle || {})[norm(d.series.name)] || {}) } : {};
  let coverTrios = null, coverTriosSrc = null, lastArt = {};
  const shelfOpts = uId => (unitOf(uId) || state.units[0]).shelves.map(s => [s.id, s.name]);
  // Pestañas: Datos · Serie · Lomo · Dónde va. Lo menos usado, plegado.
  const TABS = [['datos', 'Datos'], ['serie', 'Serie'], ['lomo', 'Lomo'], ['lugar', 'Dónde va']], tab0 = lastTab.libro = 'datos'; // siempre se empieza por Datos
  const pDatos = `
    <div id="fnote" class="notice" ${isNew && item ? '' : 'hidden'}>Datos rellenados automáticamente. Revísalos antes de guardar.<span id="fload"> Completando sinopsis, idiomas y serie…</span></div>
    <div class="hero"><div class="cover-box" id="fcover"></div><div class="meta" style="flex:1">
      <button class="btn sm" type="button" data-do="upload">Subir portada</button><button class="btn sm" type="button" data-do="nocover">Quitar portada</button>
      <input id="fupload" type="file" accept="image/*" hidden></div></div>
    <div class="sec"><label for="f-title">Título</label>${lineHtml(`class="field" id="f-title" data-f="title" ${isNew && !item ? 'data-autofocus' : ''}`, d.title)}<div id="f-estit"></div></div>
    <div class="sec"><label for="f-author">Autor/a</label>${lineHtml('class="field" id="f-author" data-f="author"', d.author)}</div>
    <div class="two"><div class="sec"><label for="f-pages">Páginas</label>${lineHtml('class="field" id="f-pages" data-f="pages" data-num inputmode="numeric"', d.pages)}</div>
      <div class="sec"><label for="f-year">Año de publicación</label>${lineHtml('class="field" id="f-year" data-f="year" data-num inputmode="numeric"', d.year)}</div></div>
    <div class="sec"><span class="lbl">Estado</span><div class="chips" id="fstatus"></div><div class="stars" id="frating" hidden></div></div>
    <div class="sec"><span class="lbl">Idiomas en los que lo puedes leer</span><div class="chips" id="flangs"></div></div>
    <div class="sec"><span class="lbl">Etiquetas</span><div class="tagin" id="ftags"></div><div class="chips" id="ftagsug"></div></div>
    <div class="sec"><label for="f-syn">Sinopsis</label><textarea class="field" id="f-syn" data-f="synopsis">${esc(d.synopsis)}</textarea><div class="note" id="f-synsrc"></div></div>
    ${fold('Notas personales', `<textarea class="field" id="f-notes" data-f="notes" aria-label="Notas personales" placeholder="Por qué lo quieres leer, quién te lo recomendó…">${esc(d.notes)}</textarea>`, !!d.notes)}
    ${isNew ? '' : fold('Revisar con internet', '<p class="note">Compara con internet y eliges qué cambiar.</p><button class="btn" type="button" data-do="refill">Buscar y comparar datos</button>')}
    ${isNew ? '' : '<button class="btn danger" type="button" data-do="delbook">Borrar libro</button>'}`;
  const pSerie = `
    <div class="sec"><span class="lbl">Serie</span><p class="note">Déjalo vacío si es un libro suelto.</p>
      <div class="three">${lineHtml('class="field" id="f-sname" placeholder="Nombre de la serie" aria-label="Nombre de la serie"', d.series ? d.series.name : '')}
        ${lineHtml('class="field" id="f-sn" data-num inputmode="numeric" placeholder="Nº" aria-label="Número dentro de la serie"', d.series ? d.series.n : '')}
        ${lineHtml('class="field" id="f-st" data-num inputmode="numeric" placeholder="Total" aria-label="Total de libros de la serie"', d.series ? d.series.total : '')}</div>
      <div class="chips" id="f-serlist"></div>
      <div id="f-sernote"></div></div>
    <div class="sec" id="f-vols"></div>
    <div id="f-sermode" class="sermode"></div>`;
  const pLomo = `
    <div class="sp-edit"><div class="sp-prev" id="fsp-prev"></div><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px"><span class="lbl">Estilo</span><div class="chips" id="fsp-style"></div><div class="chips" id="fsp-scene"></div></div></div>
    ${fold('Colores de cada parte', '<div id="fsp-parts" class="parts"></div><div class="note" id="fsp-inknote"></div>', true)}
    ${fold('Combinaciones rápidas', '<span class="lbl">De la portada</span><div class="trios" id="fsp-cover"></div><span class="lbl">Paleta de la estantería</span><div class="trios" id="fsp-pal"></div>')}
    <label class="switch">Ajustar a la estética de la estantería<input type="checkbox" id="fsp-adj"></label>
    <button class="btn sm" type="button" data-do="spauto" style="align-self:flex-start">Volver a automático</button>`;
  const pLugar = `
    <div class="sec"><span class="lbl">Dónde va</span>${sugged ? '<div class="note">Sugerida por las etiquetas.</div>' : ''}
      <div class="two">${pickHtml('f-unit', 'Estantería', state.units.map(u => [u.id, u.name]), d.unitId)}
      ${pickHtml('f-shelf', 'Balda', shelfOpts(d.unitId), d.shelfId)}</div>
      <div class="chips"><button class="chip" type="button" data-do="newshelf">+ Nueva balda aquí</button><button class="chip" type="button" data-do="newunit">+ Nueva estantería</button></div></div>`;
  const body = tabPanel('libro', 'datos', tab0, pDatos) + tabPanel('libro', 'serie', tab0, pSerie) + tabPanel('libro', 'lomo', tab0, pLomo) + tabPanel('libro', 'lugar', tab0, pLugar);
  const sh = openSheet(sheetT(isNew ? 'Nuevo libro' : 'Editar libro', body, '<button class="btn" type="button" data-close>Cancelar</button><button class="btn primary" type="button" data-do="save">Guardar</button>', tabsBar('libro', TABS, tab0)));
  sh.draft = d; // para las pruebas: datos del libro mientras se edita
  // ¿Hay cambios sin guardar? Se compara con cómo estaba al abrir (y tras completarse solo con internet)
  const snap = () => JSON.stringify([d, serStyle]); let base = null;
  sh.guard = () => base !== null && (snap() !== base || addVols.size > 0 || (isNew && !!item && !!d.title.trim()));
  const q = s => $(s, sh);
  let drawCover = () => { q('#fcover').innerHTML = coverHtml(d.title || d.author ? { ...d, title:d.title || 'Sin título' } : { ...d, title:'Sin título' }); };
  const drawLangs = () => { q('#flangs').innerHTML = [['es', 'Español'], ['en', 'Inglés']].map(([k, l]) => `<button class="chip" type="button" data-lang="${k}" aria-pressed="${d.langs.includes(k)}">${l}</button>`).join(''); };
  const drawTags = () => {
    q('#ftags').innerHTML = d.tags.map(t => `<span class="chip on">${esc(t)} <button type="button" class="x" data-rt="${esc(t)}" aria-label="Quitar ${esc(t)}" style="all:unset;cursor:pointer">×</button></span>`).join('') + lineHtml('id="ftagin" placeholder="Añadir etiqueta…" enterkeyhint="done" aria-label="Nueva etiqueta"');
    const used = allTags().map(x => x[0]).filter(t => !d.tags.includes(t)).slice(0, 10), sug = sugTags.filter(t => !d.tags.includes(t));
    q('#ftagsug').innerHTML = sug.map(t => `<button class="chip sug" type="button" data-addtag="${esc(t)}">+ ${esc(t)} (sugerida)</button>`).join('') + used.filter(t => !sug.includes(t)).map(t => `<button class="chip" type="button" data-addtag="${esc(t)}">+ ${esc(t)}</button>`).join('');
  };
  const drawStatus = () => { q('#fstatus').innerHTML = chipsHtml(Object.entries(STATUS), d.status, 'data-status');
    const r = q('#frating'); r.hidden = d.status !== 'leido'; r.innerHTML = [1,2,3,4,5].map(n => `<button class="star ${n <= d.rating ? 'on' : ''}" type="button" data-star="${n}" aria-label="${n} de 5">${ICON.star}</button>`).join(''); };
  const addTag = t => { t = t.trim().toLowerCase(); if(t && !d.tags.includes(t)){ d.tags.push(t); } drawTags(); const i = q('#ftagin'); i && i.focus(); };
  const unitNow = () => unitOf(d.unitId) || state.units[0];
  function previewCtx(){
    if(!d.series || !d.series.name) return null;
    const k = norm(d.series.name), others = seriesMembers(state, k).filter(b => b.id !== d.id), list = [...others, d].sort((a, b) => (+a.series.n || 99) - (+b.series.n || 99));
    const saved = state.seriesStyle; state.seriesStyle = { ...saved, [k]:serStyle };
    const ctx = shelfRuns(list).get(d.id); state.seriesStyle = saved; return ctx;
  }
  /* Tomos de la serie: los que ya tienes, este y los que faltan (según Hardcover) con casilla para añadirlos al guardar */
  // La búsqueda de tomos espera a que termines de escribir el nombre de la serie (antes se lanzaba con cada letra)
  const addVols = new Set(); let volsFor = '', volsSt = '', volsT = 0, volsTyping = false;
  function drawVols(){
    const el = q('#f-vols'); if(!el) return; const has = d.series && d.series.name;
    if(!has){ el.innerHTML = ''; return; }
    const k = norm(d.series.name), remote = (seriesCache[k] || {}).data;
    if(!remote && volsFor !== k){ volsFor = k; volsSt = 'busy'; clearTimeout(volsT);
      volsT = setTimeout(() => { if(!d.series || norm(d.series.name) !== k) return; const name = d.series.name;
        fetchSeriesData(name, d.origTitle || d.title, d.author).then(r => { if(!d.series || norm(d.series.name) !== k) return; volsSt = ''; if(r && r.total && !d.series.total){ d.series.total = r.total; q('#f-st').value = r.total; } drawVols(); })
          .catch(() => { if(volsFor === k){ volsSt = 'error'; drawVols(); } }); }, volsTyping ? SERIES_WAIT : 0); }
    const mine = seriesMembers(state, k).filter(b => b.id !== d.id), total = Math.max(+d.series.total || 0, remote ? remote.total || 0 : 0, ...mine.map(b => +b.series.n || 0), +d.series.n || 0);
    const rows = []; for(let n = 1; n <= total; n++){
      const own = mine.find(b => +b.series.n === n), r = remote && remote.books.find(x => x.main && x.n === n);
      if(+d.series.n === n) rows.push(`<li class="ser-row own cur"><span class="ser-n">${n}</span><span class="ser-t">${esc(d.title || 'Este libro')}</span><span class="badge">Este</span></li>`);
      else if(own) rows.push(`<li class="ser-row own"><span class="ser-n">${n}</span><span class="ser-t">${esc(own.title)}</span><span class="badge">Ya lo tienes</span></li>`);
      else if(r) rows.push(`<li class="ser-row miss"><span class="ser-n">${n}</span><label class="ser-t vol"><input type="checkbox" data-vol="${n}" ${addVols.has(n) ? 'checked' : ''}> ${esc(r.title)}</label></li>`);
      else rows.push(`<li class="ser-row miss"><span class="ser-n">${n}</span><span class="ser-t note">Sin datos</span></li>`);
    }
    const miss = remote ? remote.books.filter(x => x.main && !mine.some(b => +b.series.n === x.n) && x.n !== +d.series.n) : [];
    el.innerHTML = `<span class="lbl">Tomos</span>${rows.length ? `<ol class="ser">${rows.join('')}</ol>` : ''}
      ${volsSt === 'busy' ? '<p class="note">Buscando los tomos…</p>' : volsSt === 'error' && rows.some(r => r.includes('Sin datos')) ? '<p class="note">No he encontrado los tomos que faltan.</p>' : ''}
      ${miss.length ? `<div class="chips"><button class="chip" type="button" data-volall>${miss.every(x => addVols.has(x.n)) ? 'Desmarcar todos' : 'Marcar los que faltan'}</button></div><p class="note">Los marcados se añaden al guardar, en la misma balda.</p>` : ''}`;
  }
  function drawSeries(){
    drawVols();
    const has = d.series && d.series.name;
    q('#f-sernote').innerHTML = serNote && has ? `<div class="note">Serie ${esc(serNote)}. Revisa que sea correcto.</div>` : '';
    if(!has){
      const same = d.author && state.books.find(b => b.id !== d.id && b.series && b.series.name && lastName(b.author) === lastName(d.author));
      q('#f-sermode').innerHTML = same ? `<div class="chips"><button class="chip sug" type="button" data-sersug="${esc(same.series.name)}">¿Es de «${esc(same.series.name)}»?</button></div>` : ''; return;
    }
    const mode = serStyle.mode || 'auto', scene = serStyle.scene || '';
    // Dos grupos separados con su título: antes las dos filas de botones iban pegadas y parecían solaparse
    q('#f-sermode').innerHTML = `<div class="sec"><span class="lbl">Diseño de toda la serie</span><div class="chips">${chipsHtml([['auto', 'Automático'], ['iguales', 'Iguales con número'], ['colores', 'Un color por tomo'], ['luna', 'Fases de la luna'], ['paisaje', 'Paisaje continuo']], mode, 'data-smode')}</div></div>`
      + ((mode === 'paisaje' || (mode === 'auto' && (+d.series.total || 0) >= 4)) ? `<div class="sec"><span class="lbl">Paisaje</span><div class="chips">${chipsHtml([['', 'Automático'], ...Object.entries(SAGA_SCENES)], scene, 'data-sscene')}</div></div>` : '');
  }
  function drawSpine(){
    const u = unitNow(), th = themeOf(u), sp = d.spine || {}, ctx = previewCtx();
    const pv = q('#fsp-prev'); pv.className = 'sp-prev ' + th.cls; pv.setAttribute('style', cabinetStyleVars(th));
    lastArt = spineArt({ ...d, title:d.title || 'Sin título' }, u, th, { series:ctx }); pv.innerHTML = lastArt.html;
    // En «Iguales con número» y «Un color por tomo» el estilo es de toda la serie (se guarda en seriesStyle.style)
    const serWide = ctx && (ctx.mode === 'iguales' || ctx.mode === 'colores'), cur = serWide ? (serStyle.style || 'auto') : (sp.style || 'auto');
    q('#fsp-style').innerHTML = ctx && !serWide ? '<span class="note">El estilo lo marca el diseño de la serie.</span>'
      : (serWide ? '<span class="note">Se aplica a todos los tomos de la serie.</span>' : '') + chipsHtml([['auto', 'Automático'], ...th.styles.map(s => [s, SPINE_STYLES[s]]), ...Object.keys(SPINE_STYLES).filter(s => !th.styles.includes(s)).map(s => [s, SPINE_STYLES[s]])], cur, 'data-spstyle');
    q('#fsp-scene').innerHTML = (cur === 'ilustrado' || (cur === 'auto' && pv.querySelector('.bk') && spineArt(d, u, th).style === 'ilustrado')) && !ctx ? chipsHtml([['', 'Ilustración automática'], ...Object.entries(SCENES)], sp.scene || '', 'data-spscene') : '';
    const trio = (c, sel) => `<button class="trio" type="button" data-trio="${c.join(',')}" aria-pressed="${sel}">${c.map(x => `<i style="background:${x}"></i>`).join('')}</button>`;
    const isSel = c => !!sp.base && sp.base === c[0] && sp.foil === c[1] && sp.accent === c[2];
    q('#fsp-pal').innerHTML = th.pal.map(c => trio(c, isSel(c))).join('');
    q('#fsp-cover').innerHTML = coverTrios === null ? '<span class="note">Analizando la portada…</span>' : coverTrios === false ? `<span class="note">${coverTriosSrc ? 'No se pueden leer los colores de esta portada desde su web. Si subes la portada tú, sí podré sacarlos.' : 'Sin portada todavía.'}</span>` : coverTrios.map(c => trio(c, isSel(c))).join('');
    // Una fila por parte del diseño actual, con el color que se ve ahora; al tocarla se abre el selector partiendo de ese color
    const own = sp.parts || {}, row = (f, l, c, manual) => `<div class="part"><button class="part-b" type="button" data-part="${f}" data-col="${c}" data-lbl="${esc(l)}"><i style="background:${c}"></i><span>${esc(l)}</span><small>${manual ? 'elegido' : 'automático'}</small></button>${manual ? `<button class="iconbtn sm" type="button" data-partauto="${f}" aria-label="Volver a automático: ${esc(l)}">${ICON.x}</button>` : ''}</div>`;
    q('#fsp-parts').innerHTML = (lastArt.parts || []).filter(p => p[2]).map(([f, l, c]) => row(f, l, c, isHex(own[f]))).join('') + row('ink', 'Letras', isHex(lastArt.ink) ? lastArt.ink : '#ffffff', isHex(sp.ink));
    q('#fsp-inknote').textContent = isHex(sp.ink) ? '' : 'Letras automáticas: siempre con contraste suficiente para leerse.';
    q('#fsp-adj').checked = sp.adjust !== false;
  }
  function refreshCoverTrios(){
    const src = d.coverData || d.cover || d.cover2 || '';
    if(src === coverTriosSrc) return; coverTriosSrc = src;
    if(!src){ coverTrios = false; drawSpine(); return; }
    coverTrios = null; drawSpine();
    coverPalette(src).then(p => { if(src !== coverTriosSrc) return; coverTrios = p && p.length ? p : false; drawSpine(); });
  }
  const setSpine = patch => { d.spine = { ...(d.spine || {}), ...patch }; drawSpine(); };
  const drawCover0 = drawCover;
  drawCover = () => { drawCover0(); refreshCoverTrios(); };
  /* Título en español: aviso con un toque para usarlo; el original queda guardado (origTitle) para buscar en fuentes en inglés */
  function drawEsTitle(){
    const el = q('#f-estit'); if(!el) return;
    const es = d.esTitle && norm(d.esTitle) !== norm(d.title) ? d.esTitle : '';
    el.innerHTML = es ? `<div class="chips" style="margin-top:6px"><button class="chip sug" type="button" data-do="usees">Usar el título en español: «${esc(es)}»</button></div>`
      : d.origTitle && norm(d.origTitle) !== norm(d.title) ? `<div class="note" style="margin-top:4px">Título original: ${esc(d.origTitle)}</div>` : '';
  }
  drawCover(); drawLangs(); drawTags(); drawStatus(); drawSeries(); drawSpine(); drawEsTitle(); base = snap();
  sh.addEventListener('change', e => { const v = e.target.dataset && e.target.dataset.vol; if(v){ if(e.target.checked) addVols.add(+v); else addVols.delete(+v); drawVols(); } });
  sh.addEventListener('input', e => {
    const f = e.target.dataset && e.target.dataset.f; if(f){ d[f] = (f === 'pages' || f === 'year') ? (e.target.value ? +e.target.value : '') : e.target.value; if(f === 'title' || f === 'pages') drawSpine(); }
    const id = e.target.id;
    if(id === 'f-sname' || id === 'f-sn' || id === 'f-st'){ if(id === 'f-sname') volsTyping = true;
      const name = q('#f-sname').value.trim();
      if(!name){ d.series = null; serStyle = {}; }
      else { const prevName = d.series && d.series.name; d.series = { name, n:+q('#f-sn').value || '', total:+q('#f-st').value || '' };
        if(norm(prevName || '') !== norm(name)){ serStyle = { ...((state.seriesStyle || {})[norm(name)] || {}) }; const ex = state.books.find(b => b.id !== d.id && serKey(b) === norm(name)); if(ex && !q('#f-st').value && ex.series.total){ d.series.total = ex.series.total; q('#f-st').value = ex.series.total; } } }
      serNote = ''; drawSeries(); drawSpine();
      if(id === 'f-sname'){ // sugerencias de series que ya tienes (sustituye al antiguo <datalist>)
        const k = norm(name), all = [...new Set(state.books.filter(b => b.series && b.series.name).map(b => b.series.name))];
        q('#f-serlist').innerHTML = k ? all.filter(n => norm(n).includes(k) && norm(n) !== k).slice(0, 5).map(n => `<button class="chip sug" type="button" data-serpick="${esc(n)}">${esc(n)}</button>`).join('') : ''; }
    }

  });
  sh.addEventListener('keydown', e => { if(e.target.id === 'ftagin' && (e.key === 'Enter' || e.key === ',')){ e.preventDefault(); addTag(e.target.value.replace(',', '')); } });
  sh.addEventListener('focusout', e => { if(e.target.id === 'ftagin' && e.target.value.trim()) addTag(e.target.value); });
  sh.addEventListener('change', async e => {
    if(e.target.id === 'f-unit'){ d.unitId = e.target.value; const u = unitOf(d.unitId); d.shelfId = u.shelves[0].id; setPick(q('#f-shelf'), shelfOpts(d.unitId), d.shelfId); drawSpine(); }
    else if(e.target.id === 'fsp-adj'){ setSpine({ adjust:e.target.checked }); }
    else if(e.target.id === 'f-shelf'){ d.shelfId = e.target.value; }
    else if(e.target.id === 'fupload' && e.target.files[0]){ try{ d.coverData = await resizeImage(e.target.files[0]); drawCover(); }catch(err){ toast('No se pudo leer esa imagen'); } }
  });
  sh.addEventListener('click', async e => {
    const t = e.target, g = s => t.closest(s);
    if(g('[data-lang]')){ const k = g('[data-lang]').dataset.lang; d.langs = d.langs.includes(k) ? d.langs.filter(x => x !== k) : [...d.langs, k]; drawLangs(); }
    else if(g('[data-status]')){ d.status = g('[data-status]').dataset.status; if(d.status === 'leido' && !d.readAt) d.readAt = Date.now(); if(d.status !== 'leido'){ d.rating = 0; d.readAt = null; } drawStatus(); }
    else if(g('[data-star]')){ const n = +g('[data-star]').dataset.star; d.rating = d.rating === n ? 0 : n; drawStatus(); }
    else if(g('[data-rt]')){ d.tags = d.tags.filter(x => x !== g('[data-rt]').dataset.rt); drawTags(); }
    else if(g('[data-addtag]')){ addTag(g('[data-addtag]').dataset.addtag); }
    else if(g('[data-do="upload"]')){ q('#fupload').click(); }
    else if(g('[data-do="nocover"]')){ d.coverData = ''; d.cover = ''; d.cover2 = ''; drawCover(); }
    else if(g('[data-do="refill"]')){ refill(g('[data-do="refill"]')); }
    else if(g('[data-do="save"]')){ await doSave(); }
    else if(g('[data-spstyle]')){ const v = g('[data-spstyle]').dataset.spstyle, ctx = previewCtx();
      if(ctx && (ctx.mode === 'iguales' || ctx.mode === 'colores')){ serStyle.style = v === 'auto' ? '' : v; if(d.spine) delete d.spine.style; drawSpine(); } else setSpine({ style:v }); }
    else if(g('[data-spscene]')){ setSpine({ scene:g('[data-spscene]').dataset.spscene }); }
    else if(g('[data-trio]')){ const c = g('[data-trio]').dataset.trio.split(','); setSpine({ base:c[0], foil:c[1], accent:c[2], parts:{} }); }
    else if(g('[data-do="spauto"]')){ d.spine = null; drawSpine(); }
    else if(g('[data-do="usees"]')){ d.origTitle = d.origTitle || d.title; d.title = d.esTitle; q('#f-title').value = d.title; drawEsTitle(); drawSpine(); drawCover(); }
    else if(g('[data-volall]')){ const k = norm(d.series.name), remote = (seriesCache[k] || {}).data, mine = seriesMembers(state, k);
      const miss = remote ? remote.books.filter(x => x.main && !mine.some(b => b.id !== d.id && +b.series.n === x.n) && x.n !== +d.series.n).map(x => x.n) : [];
      if(miss.every(n => addVols.has(n))) miss.forEach(n => addVols.delete(n)); else miss.forEach(n => addVols.add(n)); drawVols(); }
    else if(g('[data-do="delbook"]')){ if(confirmTap(g('[data-do="delbook"]'), 'Borrar libro')){ sh.guard = null; await closeSheet(); deleteBook(d.id); } }
    else if(g('[data-do="newshelf"]')){ const s = await newShelfIn(d.unitId); if(s){ d.shelfId = s.id; setPick(q('#f-shelf'), shelfOpts(d.unitId), s.id); } }
    else if(g('[data-do="newunit"]')){ const u = await newUnitQuick(); if(u){ d.unitId = u.id; d.shelfId = u.shelves[0].id; setPick(q('#f-unit'), state.units.map(x => [x.id, x.name]), u.id); setPick(q('#f-shelf'), shelfOpts(u.id), d.shelfId); drawSpine(); } }
    else if(g('[data-part]')){ const b = g('[data-part]'), f = b.dataset.part, th = themeOf(unitNow());
      const c = await openColorPicker({ title:b.dataset.lbl, color:b.dataset.col, cover:d.coverData || d.cover || d.cover2 || '', palette:th.pal.flat() });
      if(!c) return;
      if(f === 'ink') setSpine({ ink:c }); else setSpine({ parts:{ ...((d.spine || {}).parts || {}), [f]:c } }); }
    else if(g('[data-partauto]')){ const f = g('[data-partauto]').dataset.partauto, sp = { ...(d.spine || {}) };
      if(f === 'ink') delete sp.ink; else { sp.parts = { ...(sp.parts || {}) }; delete sp.parts[f]; } d.spine = sp; drawSpine(); }
    else if(g('[data-smode]')){ serStyle.mode = g('[data-smode]').dataset.smode; drawSeries(); drawSpine(); }
    else if(g('[data-sscene]')){ serStyle.scene = g('[data-sscene]').dataset.sscene; drawSeries(); drawSpine(); }
    else if(g('[data-serpick]')){ const i = q('#f-sname'); i.value = g('[data-serpick]').dataset.serpick; q('#f-serlist').innerHTML = ''; i.dispatchEvent(new Event('input', { bubbles:true })); q('#f-serlist').innerHTML = ''; }
    else if(g('[data-sersug]')){ const name = g('[data-sersug]').dataset.sersug, mem = state.books.filter(b => serKey(b) === norm(name)), mx = Math.max(0, ...mem.map(b => +b.series.n || 0));
      d.series = { name, n:mx + 1, total:(mem.find(b => b.series.total) || { series:{} }).series.total || '' }; serStyle = { ...((state.seriesStyle || {})[norm(name)] || {}) };
      q('#f-sname').value = name; q('#f-sn').value = d.series.n; q('#f-st').value = d.series.total; drawSeries(); drawSpine(); }
  });
  /* Buscar y comparar: antes cogía el primer resultado (a veces otro libro) y solo rellenaba campos vacíos,
     así que casi nunca cambiaba nada. Ahora elige el libro correcto (o te deja elegir) y te enseña las diferencias. */
  async function refill(btn){
    if(!d.title.trim()){ toast('Escribe primero el título'); return; }
    const label = btn.textContent; btn.disabled = true; btn.textContent = 'Buscando…';
    try{
      const qT = d.origTitle || d.title; // con el título original se encuentra en todas las fuentes; el español sale después
      const res = await searchBooks(qT + ' ' + lastName(d.author), new AbortController().signal);
      const items = (res && res.items) || []; if(!items.length){ toast(res && res.failed ? 'No se pudo consultar internet' : 'No he encontrado este libro'); return; }
      const { ranked, sure } = bestMatch(items, [d.title, d.origTitle], d.author);
      const it = sure ? ranked[0] : await chooseItem(ranked.slice(0, 6)); if(!it) return;
      btn.textContent = 'Completando datos…';
      reviewItem(await enrichBook(it, new AbortController().signal));
    }catch(err){ toast('No se pudo consultar internet'); }
    finally{ if(btn.isConnected){ btn.disabled = false; btn.textContent = label; } }
  }
  function chooseItem(list){
    return new Promise(res => { let pick = null;
      const s2 = openSheet(sheetT('¿Cuál es tu libro?', `<p class="note">He encontrado varios parecidos. Elige el tuyo.</p><div class="row-opts">${list.map((x, i) => `<button class="opt" type="button" data-ci="${i}" style="min-height:64px">${x.covers && x.covers[0] ? `<img src="${esc(x.covers[0])}" alt="" style="width:34px;height:50px;object-fit:cover;border-radius:3px;flex:none" referrerpolicy="no-referrer">` : '<span class="dot"></span>'}<span><b>${esc(x.title)}</b><br><span class="note">${esc([x.author, x.year].filter(Boolean).join(' · '))}</span></span></button>`).join('')}</div>`), () => res(pick));
      s2.addEventListener('click', e => { const b = e.target.closest('[data-ci]'); if(b){ pick = list[+b.dataset.ci]; closeSheet(); } });
    });
  }
  function reviewItem(it){
    if(it.eds && it.eds.length){ d.eds = it.eds.map(({ synopsis, ...e }) => e); } if(it.edsEn && it.edsEn.length) d.edsEn = it.edsEn;
    const ser = it.series && it.series.name ? { name:it.series.name, n:it.series.n || '', total:it.series.total || '' } : it.wd && it.wd.series ? { ...it.wd.series } : null;
    const serTxt = s => s && s.name ? `${s.name}${s.n ? ' · nº ' + s.n : ''}${s.total ? ' de ' + s.total : ''}` : '';
    const langs = [...new Set([...d.langs, ...detectLangs(it)])], langTxt = l => l.map(x => ({ es:'Español', en:'Inglés' }[x])).join(' y ');
    const short = s => { s = String(s || ''); return s.length > 140 ? s.slice(0, 140) + '…' : s; };
    const esT = it.esTitle && norm(it.esTitle) !== norm(d.title) ? it.esTitle : '';
    const rows = [
      ...(esT ? [['esTitle', 'Título en español', d.title, esT]] : [['title', 'Título', d.title, it.title]]), ['author', 'Autor/a', d.author, it.author], ['pages', 'Páginas', d.pages, it.pages], ['year', 'Año', d.year, it.year],
      ['synopsis', 'Sinopsis' + (it.descSrc ? ` (edición española, ${it.descSrc})` : ''), d.synopsis, it.desc],
      ['series', 'Serie', serTxt(d.series), serTxt(ser)], ['langs', 'Idiomas', langTxt(d.langs), langTxt(langs)],
      ['cover', 'Portada', d.coverData || d.cover ? 'la actual' : '', (it.covers || [])[0] ? 'la encontrada' : '']
    ].filter(([k, , a, b]) => b && String(b).trim() && norm(String(a)) !== norm(String(b)) && !(k === 'cover' && (it.covers || [])[0] === d.cover));
    if(!rows.length){ toast(it.eds || it.edsEn ? 'La ficha ya estaba al día (he actualizado las ediciones)' : 'La ficha ya está al día'); return; }
    const on = new Set(rows.filter(([k, , a]) => !a || !String(a).trim() || k === 'langs' || k === 'esTitle').map(r => r[0]));
    const body = `<p class="note">Marca lo que quieras cambiar.</p><div class="row-opts">${rows.map(([k, l, a, b]) => `<button class="opt" type="button" role="checkbox" data-rv="${k}" aria-checked="${on.has(k)}" style="align-items:flex-start;padding:10px 12px"><span class="dot" style="margin-top:2px;border-radius:4px"></span><span style="min-width:0"><b>${esc(l)}</b><br><span class="note">Ahora: ${esc(short(a)) || '—'}</span><br><span>Internet: ${esc(short(b))}</span>${k === 'cover' ? `<br><img src="${esc(it.covers[0])}" alt="" referrerpolicy="no-referrer" style="width:48px;margin-top:4px;border-radius:3px">` : ''}</span></button>`).join('')}</div>`;
    const s2 = openSheet(sheetT('Datos encontrados', body, '<button class="btn" type="button" data-close>Cancelar</button><button class="btn primary" type="button" data-do="rvapply">Aplicar</button>'));
    s2.addEventListener('click', async e => {
      const o = e.target.closest('[data-rv]'); if(o){ const k = o.dataset.rv; on.has(k) ? on.delete(k) : on.add(k); o.setAttribute('aria-checked', on.has(k)); return; }
      if(!e.target.closest('[data-do="rvapply"]')) return;
      const set = (k, v, sel) => { d[k] = v; if(sel) q(sel).value = v; };
      if(on.has('title')) set('title', it.title, '#f-title');
      if(on.has('esTitle')){ d.origTitle = d.origTitle || (norm(d.title) === norm(it.title) ? d.title : it.title); set('title', esT, '#f-title'); }
      if(it.esTitle) d.esTitle = it.esTitle; drawEsTitle(); if(on.has('author')) set('author', it.author, '#f-author');
      if(on.has('pages')) set('pages', +it.pages, '#f-pages'); if(on.has('year')) set('year', +it.year, '#f-year');
      if(on.has('synopsis')){ set('synopsis', it.desc, '#f-syn'); autoSyn = it.desc; q('#f-synsrc').textContent = it.descSrc ? `Sinopsis de la edición española (${it.descSrc}).` : ''; }
      if(on.has('series')){ d.series = ser; serNote = 'según internet'; serStyle = { ...((state.seriesStyle || {})[norm(ser.name)] || {}) }; q('#f-sname').value = ser.name; q('#f-sn').value = ser.n; q('#f-st').value = ser.total; drawSeries(); }
      if(on.has('langs')){ d.langs = langs; drawLangs(); }
      if(on.has('cover')){ d.coverData = ''; d.cover = it.covers[0]; d.cover2 = it.covers[1] || ''; drawCover(); }
      sugTags = [...new Set([...sugTags, ...suggestTags(it)])]; drawTags(); drawSpine();
      const n = on.size; await closeSheet(); toast(n ? `${n} ${n === 1 ? 'dato cambiado' : 'datos cambiados'}: revisa y pulsa Guardar` : 'No he cambiado nada');
    });
  }
  function applyItem(it){
    if(!d.author && it.author){ d.author = it.author; q('#f-author').value = d.author; }
    // La sinopsis puesta automáticamente se cambia por la de la edición española si existe; la escrita a mano no se toca
    if(it.desc && (!d.synopsis || (d.synopsis === autoSyn && it.descLang === 'es' && d.synopsis !== it.desc))){ d.synopsis = autoSyn = it.desc; q('#f-syn').value = d.synopsis;
      q('#f-synsrc').textContent = it.descSrc ? `Sinopsis de la edición española (${it.descSrc}).` : ''; }
    if(it.eds && it.eds.length) d.eds = it.eds.map(({ synopsis, ...e }) => e);
    if(it.edsEn && it.edsEn.length) d.edsEn = it.edsEn;
    if(!d.series && it.series && it.series.name){ d.series = { name:it.series.name, n:it.series.n || '', total:it.series.total || '' }; serNote = 'según Hardcover'; serStyle = { ...((state.seriesStyle || {})[norm(d.series.name)] || {}) };
      q('#f-sname').value = d.series.name; q('#f-sn').value = d.series.n; q('#f-st').value = d.series.total; drawSeries(); drawSpine(); }
    if(!d.pages && it.pages){ d.pages = it.pages; q('#f-pages').value = d.pages; }
    if(!d.year && it.year){ d.year = it.year; q('#f-year').value = d.year; }
    { const L = detectLangs(it); if(L.some(x => !d.langs.includes(x))){ d.langs = [...new Set([...d.langs, ...L])]; drawLangs(); } }
    if(!d.series && it.wd && it.wd.series){ d.series = { ...it.wd.series }; serNote = 'según Wikidata'; serStyle = { ...((state.seriesStyle || {})[norm(d.series.name)] || {}) };
      const ex = state.books.find(b => serKey(b) === norm(d.series.name) && b.series.total); if(!d.series.total && ex) d.series.total = ex.series.total;
      q('#f-sname').value = d.series.name; q('#f-sn').value = d.series.n; q('#f-st').value = d.series.total; drawSeries(); drawSpine(); }
    if(!d.cover && !d.coverData && (it.covers || []).length){ d.cover = it.covers[0]; d.cover2 = it.covers[1] || ''; drawCover(); }
    if(!d.series && it.seriesN){ const same = state.books.find(b => b.series && b.series.name && lastName(b.author) === lastName(it.author || d.author)); if(same){ d.series = { name:same.series.name, n:+it.seriesN, total:same.series.total || '' }; serNote = 'según Google Books y tus otros libros de esta autora o autor'; q('#f-sname').value = d.series.name; q('#f-sn').value = d.series.n; q('#f-st').value = d.series.total; drawSeries(); drawSpine(); } }
    sugTags = [...new Set([...sugTags, ...suggestTags(it)])]; drawTags();
    if(it.esTitle){ d.esTitle = it.esTitle; drawEsTitle(); }
  }
  async function doSave(){
    d.title = d.title.trim(); if(!d.title){ toast('El libro necesita un título'); q('#f-title').focus(); return; }
    d.tags = [...new Set(d.tags)];
    if(d.series && d.series.name){ const k = norm(d.series.name); state.seriesStyle = state.seriesStyle || {}; if(serStyle.mode || serStyle.scene || serStyle.style) state.seriesStyle[k] = { ...serStyle };
      if(d.series.total) state.books.forEach(b => { if(serKey(b) === k) b.series.total = d.series.total; }); }
    else d.series = null;
    if(isNew){ state.books.push(d); }
    else { const old = bookOf(d.id); if(old.shelfId !== d.shelfId){ const o = shelfOf(old.shelfId); o && (o.s.order = o.s.order.filter(x => x !== d.id)); } Object.assign(old, d); }
    // Tomos marcados para añadir: con lo básico ahora y el resto en segundo plano
    const newVols = [];
    if(d.series && d.series.name && addVols.size){ const k = norm(d.series.name), remote = (seriesCache[k] || {}).data;
      [...addVols].sort((a, b) => a - b).forEach(n => { const r = remote && remote.books.find(x => x.main && x.n === n); if(!r || seriesMembers(state, k).some(b => +b.series.n === n)) return;
        const nb = { ...newDraft(null).draft, title:r.title, author:d.author, year:r.year || '', pages:r.pages || '', cover:r.cover || '', series:{ name:d.series.name, n, total:d.series.total || remote.total || '' },
          langs:[...d.langs], tags:[...d.tags], unitId:d.unitId, shelfId:d.shelfId, addedAt:Date.now() + n, useEs:!!d.origTitle };
        state.books.push(nb); newVols.push(nb.id); }); }
    { const src = d.coverData || d.cover || d.cover2 || ''; if(src && src === coverTriosSrc && coverTrios){ const t = bookOf(d.id) || d; t.coverPal = coverTrios.slice(0, 3); t.coverPalSrc = src; } }
    ui.lastShelf = d.shelfId; save(); setTimeout(() => typeof refreshCoverPals === 'function' && refreshCoverPals(), 800);
    const idx = state.units.findIndex(u => u.id === d.unitId); if(idx >= 0) ui.active = idx;
    sh.guard = null; renderAll(); await closeSheet(); if(isNew && ui.view !== 'shelves') showView('shelves'); goTo(ui.active); flash(d.id);
    toast((isNew ? `Añadido a ${locName(d)}` : 'Cambios guardados') + (newVols.length ? ` · ${newVols.length} ${newVols.length === 1 ? 'tomo más' : 'tomos más'}` : ''));
    if(newVols.length) completeNewBooks(newVols);
  }
  if(isNew && item){
    const ac = new AbortController(); sheets[sheets.length - 1].onClose = () => ac.abort();
    // Lo que se completa solo con internet no cuenta como cambio tuyo (si no has tocado nada aún)
    enrichBook(item, ac.signal).then(it => { if(ac.signal.aborted) return; const clean = snap() === base; applyItem(it); if(clean) base = snap(); const l = q('#fload'); l && (l.textContent = ''); })
      .catch(() => { const l = q('#fload'); l && (l.textContent = ' No pude completar todo: rellena lo que falte a mano.'); });
  }
}
