'use strict';
/* Mi TBR — dibujo de las estanterías */
/* ---------- Dibujo de estanterías ---------- */
/* Agrupa en tramos los libros consecutivos de una misma serie para que compartan diseño y paisaje */
function shelfRuns(list){
  const ctx = new Map(); let i = 0;
  while(i < list.length){
    const k = serKey(list[i]); if(!k){ i++; continue; }
    let j = i; while(j < list.length && serKey(list[j]) === k) j++;
    const run = list.slice(i, j), total = seriesTotal(state, run[0]), m = seriesMode(state, k, total);
    const all = [...seriesMembers(state, k), ...run.filter(b => !bookOf(b.id))];
    const leader = all.sort((a, b) => (+a.series.n || 99) - (+b.series.n || 99))[0] || run[0];
    const widths = run.map(b => spineDims(b, hash(b.id + (b.title || ''))).w + 1), totalW = widths.reduce((a, c) => a + c, 0);
    let off = 0;
    run.forEach((b, idx) => { ctx.set(b.id, { mode:m.mode, scene:m.scene, style:m.style, total, n:+b.series.n || idx + 1, idx:(+b.series.n || idx + 1) - 1, off, totalW, seed:hash(k), leader }); off += widths[idx]; });
    i = j;
  }
  return ctx;
}
function bookItem(b, u, th, sctx){
  const a = spineArt(b, u, th, { series:sctx });
  let html = a.html.replace('<div class="it">', `<div class="it" data-id="${b.id}" data-shelf="${b.shelfId}">`)
    .replace('<div class="bk', `<button type="button" data-id="${b.id}" data-s="${b.status || 'pendiente'}" aria-label="${esc(b.title)}${b.author ? ', ' + esc(b.author) : ''}" class="bk`);
  const end = html.lastIndexOf('</div></div></div>');
  html = html.slice(0, end) + '</div>' + (b.next ? '<i class="bk-next"></i>' : '') + `<span class="bk-flag">${ICON.check}</span></button></div>` + html.slice(end + 18);
  return { w:a.w + 1, html, book:true };
}
function decoItem(k, th, size, id){
  if(!DECO[k]) return null;
  const d = DECO[k](th.decoC), s = Math.min(size || 1, 150 / d.h, 1.35);
  const svg = `<svg viewBox="0 0 ${d.w} ${d.h}" width="${d.w * s}" height="${d.h * s}" aria-hidden="true">${d.s}</svg>`;
  return { w:Math.round(d.w * s) + 8, html:id ? `<div class="dc dcm" data-dec="${id}" role="button" tabindex="0" aria-label="${esc(DECO_NAMES[k] || 'Decoración')}">${svg}</div>` : `<div class="dc">${svg}</div>` };
}
/* Libros visibles de la estantería, en orden: baldas seguidas */
function unitSeq(u){ const seq = []; u.shelves.forEach(sh => sortedBooks(sh).filter(b => matches(b)).forEach(b => seq.push(b))); return seq; }
/* Colocación automática de objetos (determinista) */
function autoPlan(u, th, seq){
  const list = themeDecor(u, th); if(!list.length) return [];
  const r = rng(hash(u.id)), plan = []; let next = 2 + Math.floor(r() * 3);
  seq.forEach((b, idx) => { const nb = seq[idx + 1], inRun = nb && serKey(nb) && serKey(nb) === serKey(b);
    if(idx + 1 >= next && !inRun){ plan.push({ k:list[Math.floor(r() * list.length)], after:b.id, size:.82 + r() * .26 }); next = idx + 5 + Math.floor(r() * 4); } });
  if(seq.length < 6) plan.push({ k:list[Math.floor(r() * list.length)], after:seq.length ? seq[seq.length - 1].id : null, size:.9 });
  return plan;
}
/* Hueco: espacio vacío que se coloca y arrastra como un objeto. Tamaños: pequeño, mediano, hasta la otra mitad (muebles con
   parteluz, o la mitad de la balda) y hasta el final de la balda (lo siguiente pasa a la balda de abajo). */
const GAP_SIZES = { sm:['Pequeño', 26], md:['Mediano', 80], half:['Hasta la otra mitad', 0], row:['Hasta el final de la balda', 0] };
function gapItem(g){
  const html = w => `<div class="gap dcm" data-dec="gap:${g.id}" role="button" tabindex="0" aria-label="Hueco (${GAP_SIZES[g.size] ? GAP_SIZES[g.size][0].toLowerCase() : 'pequeño'})" style="width:${w}px"></div>`;
  const fixed = (GAP_SIZES[g.size] || GAP_SIZES.sm)[1];
  return fixed ? { w:fixed + 4, html:html(fixed), gap:true } : { w:26, fill:g.size, html, gap:true };
}
const gapOfUnit = id => { for(const u of state.units){ const g = (u.gaps || []).find(x => x.id === id); if(g) return { u, g }; } return null; };
const decorOfUnit = id => { for(const u of state.units){ const d = (u.decorItems || []).find(x => x.id === id); if(d) return { u, d }; } return null; };
/* Un objeto colocado automáticamente («auto:unidad:n») se convierte en manual: se guardan todos los de esa estantería tal y como están */
function materializeDecor(id){
  const m = /^auto:(.+):(\d+)$/.exec(id || ''); if(!m) return id;
  const u = unitOf(m[1]); if(!u) return null;
  const shown = new Set($$(`.slide[data-unit="${u.id}"] .dcm`).map(e => e.dataset.dec)); let mine = null; // solo los que se ven ahora mismo
  u.decorItems = autoPlan(u, themeOf(u), unitSeq(u)).map((p, i) => ({ k:p.k, after:p.after, id:uid(), size:Math.round(p.size * 100) / 100, i }))
    .filter(p => shown.has(`auto:${u.id}:${p.i}`) || p.i === +m[2]).map(({ i, ...p }) => { if(i === +m[2]) mine = p.id; return p; });
  u.decorMode = 'manual'; toast('Ahora la decoración de esta estantería la colocas tú');
  return mine;
}
function innerWidth(th){ const c = $('#carousel'); const slide = Math.min((c.clientWidth || 360) - 28, 420); return slide - 2 * th.P - 20; }
function cabinetHtml(u, i){
  const th = themeOf(u), W = innerWidth(th), decorOn = u.decorMode !== 'none', manual = u.decorMode === 'manual';
  const seq = unitSeq(u), total = u.shelves.reduce((n, sh) => n + state.books.filter(b => b.shelfId === sh.id).length, 0), shown = seq.length;
  const plan = !decorOn ? [] : manual ? (u.decorItems || []) : autoPlan(u, th, seq);
  const ids = new Set(seq.map(b => b.id)), after = new Map(), tail = [];
  plan.forEach(p => { if(p.after === null || p.after === undefined){ (after.get(null) || after.set(null, []).get(null)).push(p); } else if(ids.has(p.after)){ (after.get(p.after) || after.set(p.after, []).get(p.after)).push(p); } else tail.push(p); });
  // Los objetos automáticos también se pueden tocar y arrastrar: al hacerlo, la estantería pasa a decoración manual (ver materializeDecor)
  plan.forEach((p, i) => { if(!manual) p.id = `auto:${u.id}:${i}`; });
  // Cada balda se ve como tal: empieza en una fila nueva y lleva una etiqueta con su nombre (si hay más de una)
  const gapsAfter = new Map(); (u.gaps || []).forEach(g => { const k = g.after && ids.has(g.after) ? g.after : g.after ? 'tail' : null; (gapsAfter.get(k) || gapsAfter.set(k, []).get(k)).push(g); });
  const multi = u.shelves.length > 1, filtering = filtersActive(), last = u.shelves.length - 1, out = [];
  const hint = !shown ? `<div class="empty-hint">${total ? 'Ningún libro coincide con el filtro' : 'Estantería vacía: añade un libro con el botón +'}</div>` : '';
  u.shelves.forEach((sh, si) => {
    const items = [], deco = p => { const it = decoItem(p.k, th, p.size, p.id); if(it) items.push(it); }, gap = g => items.push(gapItem(g));
    const list = seq.filter(b => b.shelfId === sh.id), runs = shelfRuns(list);
    if(filtering && !list.length) return; // con filtro, las baldas sin coincidencias no se pintan
    if(si === 0){ (gapsAfter.get(null) || []).forEach(gap); (after.get(null) || []).forEach(deco); }
    list.forEach(b => { items.push(bookItem(b, u, th, runs.get(b.id))); (gapsAfter.get(b.id) || []).forEach(gap); (after.get(b.id) || []).forEach(deco); });
    if(si === last){ tail.forEach(deco); (gapsAfter.get('tail') || []).forEach(gap); }
    const rows = packRows(items, W, th.mullion);
    // Una fila solo con un adorno automático no merece aparecer
    if(!manual) while(rows.length > 1 && !rows[rows.length - 1].some(it => it.book || it.gap)) rows.pop();
    rows.forEach((row, ri) => out.push(`<div class="row" data-row="${u.id}" data-shelf="${sh.id}">${row.map(it => it.spacer ? `<div class="sp" style="width:${it.spacer}px"></div>` : it.html).join('')}<div class="tabla"></div>`
      + (multi && ri === 0 ? `<button class="blabel" type="button" data-act="editUnit" data-unit="${u.id}" aria-label="Balda ${esc(sh.name)}: editar la estantería">${esc(sh.name)}</button>` : '')
      + (!out.length ? hint : '') + '</div>'));
  });
  if(!out.length) out.push(`<div class="row" data-row="${u.id}" data-shelf="${u.shelves[0].id}"><div class="tabla"></div>${hint}</div>`);
  const rowsHtml = out.join('');
  const corners = th.corners ? bcSvg('tl') + bcSvg('tr') + bcSvg('bl') + bcSvg('br') : '';
  return `<section class="slide${i === ui.active ? ' on' : ''}" data-unit="${u.id}" data-i="${i}" aria-label="${esc(u.name)}"><div class="cab-wrap"><div class="mueble ${th.cls} grainH" style="${cabinetStyleVars(th)}">
    ${crownHtml(u, th)}
    <div class="body"><div class="pil l"></div><div class="inner">${corners}${th.mullion ? '<div class="mull"></div>' : ''}${crownHead(u, th)}${rowsHtml}</div><div class="pil r"></div></div>
    <div class="base"><div class="b1"></div><div class="b2"></div><div class="b3"></div></div></div></div></section>`;
}
function renderHeader(){
  const yr = new Date().getFullYear(), pend = state.books.filter(b => b.status !== 'leido').length;
  const read = state.books.filter(b => b.status === 'leido' && b.readAt && new Date(b.readAt).getFullYear() === yr).length;
  $('#stats').innerHTML = `<b>${pend}</b> pendientes · <b>${read}</b> leídos en ${yr}`;
  const nb = state.books.find(b => b.next);
  $('#nextchip').innerHTML = nb ? `<button class="next-chip" type="button" data-open="${nb.id}"><i></i><span>Siguiente: ${esc(nb.title)}</span></button>` : '';
  $('#btnFilter').setAttribute('aria-pressed', filtersActive() ? 'true' : 'false');
  const fb = $('#filterbar');
  if(filtersActive()){
    const f = ui.filters, parts = [];
    if(f.q) parts.push('«' + f.q + '»'); if(f.status) parts.push(STATUS[f.status]);
    if(f.lang) parts.push({ es:'Solo español', en:'Solo inglés', both:'Español e inglés' }[f.lang]);
    if(f.tags.length) parts.push(f.tags.join(', ')); if(f.len) parts.push({ corto:'Menos de 300 págs.', medio:'300–500 págs.', largo:'Más de 500 págs.' }[f.len]);
    const n = state.books.filter(b => matches(b)).length;
    fb.hidden = false; fb.innerHTML = `<span>${n} ${n === 1 ? 'libro' : 'libros'} · ${esc(parts.join(' · '))}</span><button class="btn sm" type="button" data-act="clearFilters">Quitar</button>`;
  } else fb.hidden = true;
  const ban = $('#banner');
  if(state.books.some(b => b.ejemplo)){ ban.hidden = false; ban.innerHTML = `<span>Los libros de ejemplo te muestran cómo queda. Cuando quieras, bórralos.</span><button class="btn sm" type="button" data-act="clearExamples">Borrar ejemplos</button>`; }
  else ban.hidden = true;
}
/* Puntos de posición (una estantería por punto); al tocarlos se va a esa estantería */
function renderTabs(){
  $('#tabs').innerHTML = state.units.map((u, i) => `<button class="dot-b" type="button" data-i="${i}" aria-label="${esc(u.name)}" title="${esc(u.name)}" aria-current="${i === ui.active}"><i></i></button>`).join('');
}
function renderCarousel(){
  const c = $('#carousel'), sl = c.scrollLeft; ui.width = c.clientWidth;
  c.innerHTML = state.units.map(cabinetHtml).join('');
  c.style.scrollBehavior = 'auto'; c.scrollLeft = sl; c.style.scrollBehavior = '';
}
function setAccent(){
  const u = state.units[ui.active]; if(!u) return;
  const th = themeOf(u), a = th.key === 'generico' ? th.acc : th.pal[0][th.key === 'moderno' ? 0 : 0], dark = document.documentElement.dataset.theme === 'dark' || (document.documentElement.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  const acc = dark && lum(a) < .35 ? a.replace(/^#(..)(..)(..)$/, (m, r, g, b) => '#' + [r, g, b].map(x => Math.min(255, parseInt(x, 16) + 70).toString(16).padStart(2, '0')).join('')) : a;
  document.documentElement.style.setProperty('--acc', acc); document.documentElement.style.setProperty('--acc-fg', textOn(acc));
}
function renderAll(){
  ui.active = clamp(ui.active, 0, state.units.length - 1);
  renderHeader(); renderTabs(); renderCarousel(); setAccent(); if(typeof renderReading === 'function') renderReading();
}
/* Se desliza entre estanterías (una en una); goTo lleva a una concreta */
function markActive(i){
  ui.active = i; $$('#carousel .slide').forEach(s => s.classList.toggle('on', +s.dataset.i === i));
  $$('#tabs [data-i]').forEach(t => t.setAttribute('aria-current', +t.dataset.i === i)); setAccent();
}
function goTo(i, smooth = true){
  i = clamp(i, 0, state.units.length - 1); const c = $('#carousel'), s = c.children[i]; markActive(i); if(!s) return;
  c.scrollTo({ left:s.offsetLeft - (c.clientWidth - s.offsetWidth) / 2, behavior:smooth ? 'smooth' : 'auto' });
}
let scrollRaf = 0;
$('#carousel').addEventListener('scroll', () => {
  cancelAnimationFrame(scrollRaf);
  scrollRaf = requestAnimationFrame(() => {
    const c = $('#carousel'), mid = c.scrollLeft + c.clientWidth / 2; let best = 0, bd = 1e9;
    [...c.children].forEach((s, i) => { const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid); if(d < bd){ bd = d; best = i; } });
    if(best !== ui.active) markActive(best);
  });
}, { passive:true });
function flash(id){
  requestAnimationFrame(() => { const it = $(`.it[data-id="${id}"]`); if(it){ it.scrollIntoView({ block:'nearest', inline:'nearest' }); it.firstElementChild.animate([{ transform:'translateY(-18px)' }, { transform:'translateY(0)' }], { duration:600, easing:'ease-out' }); } });
}
