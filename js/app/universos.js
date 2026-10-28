'use strict';
/* Mi TBR — vista «Universos» (datos en js/lib/universos.js).
   Cada libro del universo se busca en la colección (título, original o alternativo + autor/a). Si está, manda su estado;
   si no, se puede marcar como leído aquí (state.settings.uniRead['universo:clave'], se sincroniza con los ajustes).
   Una conexión se ve tal cual si has leído todos sus libros; si falta alguno, sale tapada y se destapa al tocarla. */
const UNI_BOARD = true; // tablero en preparación: hasta que Leyre lo apruebe solo se ve la lista
ui.uniOpen = ui.uniOpen || new Set(); ui.uniShown = ui.uniShown || new Set(); ui.uniMode = ui.uniMode || {}; ui.uniSel = ui.uniSel || {}; ui.uniZoom = ui.uniZoom || {};
const uniNorm = s => norm(String(s || '').replace(/\([^)]*\)/g, ' '));
const uniAuthOk = (b, u) => { const a = norm(b.author || ''); return norm(u.author).split(' ').some(w => w.length > 3 && a.includes(w)); };
const uniTitle = ub => ub.t || ub.o;
function uniBooks(u){ return u.series.flatMap((s, si) => s.books.map(ub => ({ ...ub, serie:s.name, si }))); }
/* Libro de la colección que corresponde a un libro del universo (o null) */
function uniFind(u, ub){
  const keys = [ub.t, ub.o, ...(ub.alt || [])].filter(Boolean).map(uniNorm);
  return state.books.find(b => uniAuthOk(b, u) && [b.title, b.origTitle, b.esTitle].filter(Boolean).some(t => keys.includes(uniNorm(t)))) || null;
}
const uniRead = () => state.settings.uniRead || (state.settings.uniRead = {});
function uniIsRead(u, ub){ const b = uniFind(u, ub); return b ? b.status === 'leido' : !!uniRead()[u.id + ':' + ub.k]; }
const UNI_KIND = { 'confirmado':'Confirmado', 'cameo':'Cameo', 'guiño':'Guiño', 'teoria':'Teoría' };
const uniKindCls = k => k === 'guiño' ? 'guino' : k;
const uniHidden = () => state.settings.uniHidden || (state.settings.uniHidden = {});
/* Conexión tapada: falta por leer alguno de sus libros y no la has destapado */
function uniMiss(u, l, byK){ return l.books.filter(k => byK[k] && !uniIsRead(u, byK[k])); }
const uniLocked = (u, l, i, byK) => uniMiss(u, l, byK).length && !ui.uniShown.has(u.id + ':' + i);

/* ---------- Retrato de personaje: dibujo propio (silueta, colores y un símbolo), no copiado de ninguna ilustración ---------- */
const SYM = { // símbolos en una caja de 20×20
  flame:'M10 2c2 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 2 1 3 2 4 1-3 0-5 1-8z', leaf:'M4 16C4 8 9 3 17 3c0 8-5 13-13 13zM4 16l8-8',
  paw:'M10 11c3 0 5 3 5 5s-2 2-5 2-5 0-5-2 2-5 5-5zM5 9a1.6 2 0 1 0 .1 0zM15 9a1.6 2 0 1 0 .1 0zM8 5a1.6 2 0 1 0 .1 0zM12 5a1.6 2 0 1 0 .1 0z',
  star:'M10 2l2.3 5.4 5.7.5-4.3 3.8 1.3 5.6L10 14.4l-5 2.9 1.3-5.6L2 7.9l5.7-.5z', dagger:'M10 2l2 9h-4zM6 11h8v1.5H6zM9 12.5h2V18H9z',
  flute:'M3 15L15 3l2 2L5 17zM7 11.5a.8.8 0 1 0 .1 0M10 8.5a.8.8 0 1 0 .1 0M13 5.5a.8.8 0 1 0 .1 0', spike:'M10 2l2.4 15H7.6zM6 17h8v1.6H6z',
  ring:'M10 4a6 6 0 1 0 .1 0zM10 7a3 3 0 1 1-.1 0z', sword:'M10 1l1.6 3v9H8.4V4zM5.5 13h9v1.6h-9zM9.2 14.6h1.6V19H9.2z',
  sun:'M10 6a4 4 0 1 0 .1 0zM10 1v3M10 16v3M1 10h3M16 10h3M3.6 3.6l2.1 2.1M14.3 14.3l2.1 2.1M3.6 16.4l2.1-2.1M14.3 5.7l2.1-2.1',
  crown:'M3 15l1-9 4 4 2-6 2 6 4-4 1 9z', storm:'M11 2L5 11h4l-2 7 7-10h-4l2-6z', eye:'M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5zM10 7.5a2.5 2.5 0 1 0 .1 0z',
  heart:'M10 17S3 12.5 3 7.6A3.6 3.6 0 0 1 10 6a3.6 3.6 0 0 1 7 1.6C17 12.5 10 17 10 17z', shadow:'M14 3a7 7 0 1 0 3 12A8 8 0 0 1 14 3z',
  moon:'M13 2a8 8 0 1 0 5 13A7 7 0 0 1 13 2z', mask:'M3 6c4-2 10-2 14 0 0 6-3 9-7 9S3 12 3 6zM6.5 9a1.5 1 0 1 0 .1 0M13.5 9a1.5 1 0 1 0 .1 0',
  dragon:'M2 14c4 0 6-2 8-6 1 3 3 4 8 3-3 2-5 5-11 5zM10 8l2-5 1 4', coat:'M6 3h8l3 4-3 1v10H6V8L3 7z'
};
const uniLighten = (h, t) => { const n = parseInt(h.slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255].map(v => Math.round(v + (255 - v) * t)); return '#' + c.map(v => v.toString(16).padStart(2, '0')).join(''); };
function charSvg(c){
  const bg = uniLighten(c.coat, .72), hair = c.hair, head = '<circle cx="33" cy="25" r="11.5" fill="' + c.skin + '"/><rect x="29.5" y="34" width="7" height="6" fill="' + c.skin + '"/>';
  let back = '', front = '';
  if(c.look === 'long') back = `<path d="M20.5 26c0-11 5.5-15 12.5-15s12.5 4 12.5 15v20H20.5z" fill="${hair}"/>`;
  if(c.look === 'bun') back = `<circle cx="33" cy="11.5" r="5.5" fill="${hair}"/>`;
  if(['short', 'long', 'bun'].includes(c.look)) front = `<path d="M21.3 24c0-8 5-12.5 11.7-12.5S44.7 16 44.7 24c-3-4.5-7-6-11.7-6s-8.7 1.5-11.7 6z" fill="${hair}"/>`;
  const body = c.look === 'obj' ? `<g transform="translate(13 9) scale(2)" fill="${c.skin}" stroke="${c.skin}" stroke-width=".6" stroke-linejoin="round">${SYM[c.sym] ? `<path d="${SYM[c.sym]}"/>` : ''}</g>`
    : `${back}<path d="M12 62c0-12 9-20 21-20s21 8 21 20z" fill="${c.coat}"/>${head}${front}`;
  const badge = c.look === 'obj' || !SYM[c.sym] ? '' : `<circle cx="54" cy="51" r="8.5" fill="${c.coat}" stroke="#fff" stroke-width="1.5"/><g transform="translate(48.5 45.5) scale(.55)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${SYM[c.sym]}"/></g>`;
  return `<svg viewBox="0 0 66 62" aria-hidden="true"><rect width="66" height="62" fill="${bg}"/><circle cx="33" cy="30" r="30" fill="#fff" opacity=".25"/>${body}${badge}</svg>`;
}

/* ---------- Tablero de corcho ----------
   Arriba, los personajes (polaroids) con hilos a los libros donde aparecen; debajo, una fila por saga con sus libros.
   Hilos: rojo = confirmado, azul = cameo, ámbar = guiño, morado discontinuo = teoría, gris punteado = tapado.
   Las conexiones entre libros llevan una nota adhesiva con su rótulo; las de personaje se ven al tocar su foto. */
const BD = { cw:86, ch:104, pw:78, ph:96, gx:20, gy:104, pad:22, lab:32 };
const SER_COL = ['#b3201a', '#2f6f9f', '#3f7a3a', '#8a4fb0', '#c8870f', '#2b6b6b'];
function uniBoardHtml(u, byK){
  const chars = u.chars || [], pos = {}, cpos = {}, z = ui.uniZoom[u.id] || 1;
  const hasC = chars.length > 0, top0 = BD.pad + (hasC ? BD.lab + BD.ph + BD.gy : 0);
  chars.forEach((c, i) => { cpos[c.id] = { x:BD.pad + i * (BD.pw + BD.gx), y:BD.pad + BD.lab }; });
  u.series.forEach((s, r) => s.books.forEach((ub, i) => { pos[ub.k] = { x:BD.pad + i * (BD.cw + BD.gx), y:top0 + BD.lab + r * (BD.ch + BD.gy + BD.lab) }; }));
  const cols = Math.max(...u.series.map(s => s.books.length)), W = Math.max(BD.pad * 2 + cols * (BD.cw + BD.gx) - BD.gx, BD.pad * 2 + chars.length * (BD.pw + BD.gx) - BD.gx, 340);
  const H = top0 + u.series.length * (BD.ch + BD.gy + BD.lab) - BD.gy + BD.pad + 10;
  const pinB = k => ({ x:pos[k].x + BD.cw / 2, y:pos[k].y + 9 }), pinC = id => ({ x:cpos[id].x + BD.pw / 2, y:cpos[id].y + 8 });
  const sel = ui.uniSel[u.id] || '', selBook = sel.startsWith('b:') ? sel.slice(2) : '', selLink = sel.startsWith('l:') ? +sel.slice(2) : -1, selChar = sel.startsWith('c:') ? sel.slice(2) : '';
  const curve = (p, q, sag) => { const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2 + sag; return { d:`M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`, mid:{ x:(p.x + 2 * mx + q.x) / 4, y:(p.y + 2 * my + q.y) / 4 } }; };
  const yarn = (d, cls) => `<path class="yarn-sh" d="${d}"/><path class="th ${cls}" d="${d}"/>`;
  let threads = '', notes = ''; const pairs = {}, placed = [];
  // Las notas van en los huecos entre filas (no tapan los libros): se busca el hueco más cercano y un sitio libre en él
  const bands = []; if(hasC) bands.push(BD.pad + BD.lab + BD.ph + BD.gy / 2);
  u.series.forEach((s, r) => bands.push(top0 + BD.lab + r * (BD.ch + BD.gy + BD.lab) + BD.ch + (BD.gy + BD.lab) / 2 - 6));
  const free = m => { const by = bands.reduce((a, b) => Math.abs(b - m.y) < Math.abs(a - m.y) ? b : a, bands[0]);
    for(let line = 0; line < 3; line++) for(let t = 0; t < 14; t++){ const x = Math.min(Math.max(m.x + (t % 2 ? 1 : -1) * Math.ceil(t / 2) * 84, 52), W - 52), y = by + [0, 40, -40][line];
      if(!placed.some(q => Math.abs(q.x - x) < 82 && Math.abs(q.y - y) < 40)){ const r = { x, y }; placed.push(r); return r; } }
    placed.push(m); return m; };
  u.series.forEach(s => s.books.slice(1).forEach((ub, i) => { threads += `<path class="th-seq" d="${curve(pinB(s.books[i].k), pinB(ub.k), 12).d}"/>`; }));
  u.links.forEach((l, i) => {
    const ks = l.books.filter(k => pos[k]), locked = uniLocked(u, l, i, byK), cls = locked ? 'th-lock' : 'th-' + uniKindCls(l.kind);
    const on = selLink === i || (selBook && ks.includes(selBook)) || (selChar && l.char === selChar), dim = sel && !on ? ' dim' : '';
    if(l.char && cpos[l.char]){ // hilos de la foto del personaje a cada libro
      ks.forEach(k => { const p = pinC(l.char), q = pinB(k), dist = Math.hypot(q.x - p.x, q.y - p.y); threads += `<g class="${dim}">${yarn(curve(p, q, 18 + dist * .08).d, cls)}</g>`; });
      return;
    }
    if(!ks.length) return;
    let mid;
    if(ks.length === 1){ const p = pos[ks[0]]; mid = { x:p.x + BD.cw / 2, y:p.y + BD.ch + 30 }; }
    else ks.slice(1).forEach((k, j) => { const pk = [ks[j], k].sort().join(), n = pairs[pk] = (pairs[pk] || 0) + 1; // varios hilos entre los mismos libros: cada uno más curvado
      const p = pinB(ks[j]), q = pinB(k), c = curve(p, q, 26 + Math.hypot(q.x - p.x, q.y - p.y) * .12 + (n - 1) * 28);
      threads += `<g class="${dim}">${yarn(c.d, cls)}</g>`; if(!j) mid = c.mid; });
    const at = ks.length === 1 ? { x:pos[ks[0]].x + BD.cw / 2, y:pos[ks[0]].y + BD.ch - 2 } : mid; mid = free(mid);
    threads += `<path class="th-tie ${cls}${dim}" d="M${at.x} ${at.y} L${mid.x} ${mid.y - 12}"/>`; // hilo corto de la nota a su conexión
    const rot = ((i * 37) % 9 - 4) * .9;
    notes += `<button class="bd-note k-${locked ? 'lock' : uniKindCls(l.kind)}${dim}${selLink === i ? ' on' : ''}" type="button" data-bl="${i}" style="left:${mid.x}px;top:${mid.y}px;--r:${rot}deg"><i>${i + 1}</i>${locked ? '<b>?</b> Spoiler' : esc(l.short || UNI_KIND[l.kind])}</button>`;
  });
  const Hn = Math.max(H, ...placed.map(q => q.y + 44));
  const cards = u.series.flatMap((s, si) => s.books.map(ub => {
    const b = uniFind(u, ub), read = uniIsRead(u, ub), p = pos[ub.k], rot = ((ub.k.charCodeAt(ub.k.length - 1) * 7) % 7 - 3) * .7, col = SER_COL[si % SER_COL.length];
    const cov = b && b.cover && !String(b.cover).startsWith('data:') ? `<img src="${esc(b.cover)}" alt="" loading="lazy" onerror="this.parentNode.remove()">` : '';
    return `<button class="bd-card${read ? ' read' : ''}${b && !read ? ' tbr' : ''}${ub.opt ? ' opt' : ''}${selBook === ub.k ? ' on' : ''}${sel && selBook !== ub.k && !(selLink >= 0 && u.links[selLink].books.includes(ub.k)) && !(selChar && u.links.some(l => l.char === selChar && l.books.includes(ub.k))) ? ' dim' : ''}" type="button" data-bb="${ub.k}" style="left:${p.x}px;top:${p.y}px;--r:${rot}deg;--sc:${col}">
      <i class="bd-pin"></i>${cov ? `<span class="bd-cov">${cov}</span>` : ''}<b>${esc(uniTitle(ub))}</b><small>${ub.y || ''}</small>${read ? '<em class="bd-stamp">Leído</em>' : b ? '<em class="bd-tbr">En tu TBR</em>' : ''}</button>`;
  })).join('');
  const pols = chars.map((c, i) => { const p = cpos[c.id], rot = ((i * 53) % 9 - 4) * .8, n = u.links.filter(l => l.char === c.id).length;
    return `<button class="bd-pol${selChar === c.id ? ' on' : ''}${sel && selChar !== c.id ? ' dim' : ''}" type="button" data-bc="${c.id}" style="left:${p.x}px;top:${p.y}px;--r:${rot}deg"><i class="bd-tape"></i><span class="ph">${charSvg(c)}</span><b>${esc(c.name)}</b><small>${n} ${n === 1 ? 'hilo' : 'hilos'}</small></button>`; }).join('');
  const labels = (hasC ? `<span class="bd-lab" style="left:${BD.pad}px;top:${BD.pad}px">Personajes</span>` : '') +
    u.series.map((s, r) => `<span class="bd-lab" style="left:${BD.pad}px;top:${top0 + r * (BD.ch + BD.gy + BD.lab)}px;--sc:${SER_COL[r % SER_COL.length]}">${esc(s.world ? s.world + ' · ' + s.name : s.name)}</span>`).join('');
  return `<div class="bd-tools"><button class="iconbtn sm" type="button" data-bz="-1" aria-label="Alejar">−</button><button class="iconbtn sm" type="button" data-bz="1" aria-label="Acercar">+</button></div>
    <div class="board-wrap"><div class="board-size" style="width:${W * z}px;height:${Hn * z}px"><div class="board" style="width:${W}px;height:${Hn}px;transform:scale(${z})">${labels}
      <svg class="bd-svg" width="${W}" height="${Hn}" aria-hidden="true">${threads}</svg>${cards}${pols}${notes}</div></div></div>
    <div class="bd-legend"><span class="lg th-confirmado">Confirmado</span><span class="lg th-cameo">Cameo</span><span class="lg th-guino">Guiño</span><span class="lg th-teoria">Teoría</span><span class="lg th-lock">Tapado</span><span class="lg th-seq">Misma saga</span></div>`;
}
/* Debajo del tablero: lo que has tocado (libro o personaje) con sus conexiones */
function uniLinkLi(u, l, i, byK){
  const id = u.id + ':' + i, miss = uniMiss(u, l, byK), open = !miss.length || ui.uniShown.has(id), sel = ui.uniSel[u.id] === 'l:' + i;
  const src = l.src ? ` <a href="${esc(l.src)}" target="_blank" rel="noopener">Fuente ↗</a>` : '', n = `<span class="uni-n">${i + 1}</span>`, kb = `<span class="badge k-${uniKindCls(l.kind)}">${UNI_KIND[l.kind] || l.kind}</span>`;
  return open ? `<li class="uni-l${sel ? ' on' : ''}" id="ul-${u.id}-${i}">${n}${kb} ${esc(l.text)}${src}</li>`
    : `<li class="uni-l${sel ? ' on' : ''}" id="ul-${u.id}-${i}"><button class="uni-lock" type="button" data-ul="${id}">${n}${kb} Spoiler de ${esc(miss.map(k => uniTitle(byK[k])).join(', '))} · <u>Toca para ver</u></button></li>`;
}
function uniPanel(u, byK){
  const sel = ui.uniSel[u.id] || '';
  if(sel.startsWith('b:')){ const ub = byK[sel.slice(2)]; if(!ub) return '';
    const b = uniFind(u, ub), read = uniIsRead(u, ub), sub = [ub.t && ub.o !== ub.t ? ub.o : '', ub.serie, ub.y, ub.note || (ub.opt ? 'opcional' : '')].filter(Boolean).join(' · ');
    const act = b ? `<button class="btn sm" type="button" data-open="${b.id}">Ver ficha</button>` : `<button class="chip uni-rd" type="button" data-ur="${esc(u.id + ':' + ub.k)}" aria-pressed="${read}">${read ? 'Leído' : 'Sin leer'}</button>`;
    const ls = u.links.map((l, i) => [l, i]).filter(([l]) => l.books.includes(ub.k));
    return `<div class="bd-panel"><div class="bd-ph"><div class="tx"><b>${esc(uniTitle(ub))}</b><span>${esc(sub)}</span></div>${act}</div>${ls.length ? `<ul class="uni-links">${ls.map(([l, i]) => uniLinkLi(u, l, i, byK)).join('')}</ul>` : ''}</div>`; }
  if(sel.startsWith('c:')){ const c = (u.chars || []).find(x => x.id === sel.slice(2)); if(!c) return '';
    const ls = u.links.map((l, i) => [l, i]).filter(([l]) => l.char === c.id);
    return `<div class="bd-panel"><div class="bd-ph"><span class="bd-mini">${charSvg(c)}</span><div class="tx"><b>${esc(c.name)}</b><span>${ls.length} ${ls.length === 1 ? 'conexión' : 'conexiones'}</span></div></div><ul class="uni-links">${ls.map(([l, i]) => uniLinkLi(u, l, i, byK)).join('')}</ul></div>`; }
  return '<p class="note bd-hint">Toca un libro, una foto o una nota.</p>';
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
  const mode = UNI_BOARD ? ui.uniMode[u.id] || 'tablero' : 'lista', order = u.order.map(k => byK[k]).filter(Boolean);
  const view = mode === 'tablero' ? uniBoardHtml(u, byK) + uniPanel(u, byK) : `<h3>Orden de lectura</h3><ol class="uni-order">${order.map(row).join('')}</ol>`;
  return `<details class="uni" data-uni="${u.id}"${ui.uniOpen.has(u.id) ? ' open' : ''}><summary><span class="tx"><b>${esc(u.name)}</b><span>${esc(u.author)} · ${nRead} de ${main.length} leídos${inTbr ? ` · ${inTbr} en tu TBR` : ''}</span></span>
      <span class="uni-bar" aria-hidden="true"><i style="width:${Math.round(nRead / (main.length || 1) * 100)}%"></i></span></summary>
    <div class="uni-body"><p class="note">${esc(u.note)}</p>
      ${UNI_BOARD ? `<div class="chips uni-mode">${chipsHtml([['tablero', 'Tablero'], ['lista', 'Orden de lectura']], mode, 'data-um')}</div>` : ''}
      ${view}
      ${u.links.length ? `<h3>Conexiones y teorías (${u.links.length})</h3><ul class="uni-links">${u.links.map((l, i) => uniLinkLi(u, l, i, byK)).join('')}</ul>` : ''}
      <button class="btn sm danger-l uni-hide" type="button" data-uh="${u.id}">Quitar este universo</button></div></details>`;
}
function renderUniverses(){
  const el = $('#view-universes'); if(!el || el.hidden) return;
  const hid = uniHidden(), shown = UNIVERSES.filter(u => !hid[u.id]), gone = UNIVERSES.filter(u => hid[u.id]);
  const keep = [...el.querySelectorAll('.board-wrap')].map(w => [w.closest('details').dataset.uni, w.scrollLeft, w.scrollTop]); // que el tablero no salte al redibujar
  el.innerHTML = `<section class="rd-sec"><h2>Universos</h2>${shown.map(uniCardHtml).join('') || '<p class="rd-empty">Has quitado todos.</p>'}
    ${gone.length ? `<div class="uni-gone"><h3>Quitados</h3><div class="chips">${gone.map(u => `<button class="chip" type="button" data-ush="${u.id}">+ ${esc(u.name)}</button>`).join('')}</div></div>` : ''}</section>`;
  keep.forEach(([id, x, y]) => { const w = el.querySelector(`details[data-uni="${id}"] .board-wrap`); if(w){ w.scrollLeft = x; w.scrollTop = y; } });
}
document.addEventListener('click', e => {
  if(!e.target.closest('#view-universes')) return;
  const g = s => e.target.closest(s), uni = g('details.uni') ? g('details.uni').dataset.uni : '';
  const pick = v => { ui.uniSel[uni] = ui.uniSel[uni] === v ? '' : v; renderUniverses(); };
  if(g('details.uni > summary')){ const d = g('details.uni'); d.open ? ui.uniOpen.delete(d.dataset.uni) : ui.uniOpen.add(d.dataset.uni); return; } // antes de que se abra: así sobrevive a un redibujo
  if(g('[data-ur]')){ const k = g('[data-ur]').dataset.ur, r = uniRead(); if(r[k]) delete r[k]; else r[k] = Date.now(); save(); renderUniverses(); }
  else if(g('[data-ul]')){ ui.uniShown.add(g('[data-ul]').dataset.ul); renderUniverses(); }
  else if(g('[data-um]')){ ui.uniMode[uni] = g('[data-um]').dataset.um; renderUniverses(); }
  else if(g('[data-bz]')){ const z = ui.uniZoom[uni] || 1; ui.uniZoom[uni] = Math.min(1.4, Math.max(.5, Math.round((z + .15 * +g('[data-bz]').dataset.bz) * 100) / 100)); renderUniverses(); }
  else if(g('[data-bb]')) pick('b:' + g('[data-bb]').dataset.bb);
  else if(g('[data-bc]')) pick('c:' + g('[data-bc]').dataset.bc);
  else if(g('[data-bl]')){ const i = g('[data-bl]').dataset.bl; pick('l:' + i);
    const li = document.getElementById(`ul-${uni}-${i}`); if(li && ui.uniSel[uni]) li.scrollIntoView({ block:'nearest', behavior:'smooth' }); }
  else if(g('[data-uh]')){ const btn = g('[data-uh]');
    if(!btn.dataset.sure){ btn.dataset.sure = '1'; btn.textContent = 'Toca otra vez para quitarlo'; setTimeout(() => { if(btn.isConnected){ btn.dataset.sure = ''; btn.textContent = 'Quitar este universo'; } }, 3000); return; }
    uniHidden()[btn.dataset.uh] = Date.now(); save(); renderUniverses(); const u = UNIVERSES.find(x => x.id === btn.dataset.uh);
    toast(`«${u.name}» quitado`, () => { delete uniHidden()[u.id]; save(); renderUniverses(); }); }
  else if(g('[data-ush]')){ delete uniHidden()[g('[data-ush]').dataset.ush]; save(); renderUniverses(); }
});
