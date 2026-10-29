'use strict';
/* Mi TBR — vista «Universos» (datos en js/lib/universos.js).
   Cada libro del universo se busca en la colección (título, original o alternativo + autor/a). Si está, manda su estado;
   si no, se puede marcar como leído aquí (state.settings.uniRead['universo:clave'], se sincroniza con los ajustes).
   Una conexión se ve tal cual si has leído todos sus libros; si falta alguno, sale tapada y se destapa al tocarla. */
const UNI_BOARD = true; // tablero en preparación: hasta que Leyre lo apruebe solo se ve la lista
ui.uniOpen = ui.uniOpen || new Set(); ui.uniShown = ui.uniShown || new Set(); ui.uniMode = ui.uniMode || {}; ui.uniSel = ui.uniSel || {}; ui.uniZoom = ui.uniZoom || {}; ui.uniView = ui.uniView || {}; ui.uniFull = ui.uniFull || '';
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
  dragon:'M2 14c4 0 6-2 8-6 1 3 3 4 8 3-3 2-5 5-11 5zM10 8l2-5 1 4', coat:'M6 3h8l3 4-3 1v10H6V8L3 7z',
  book:'M3 4h6c1 0 1 1 1 1v12s0-1-1-1H3zM17 4h-6c-1 0-1 1-1 1v12s0-1 1-1h6z', coin:'M10 3a7 7 0 1 0 .1 0zM10 6v8M7.5 8h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4'
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

/* ---------- Tablero (SVG de 1000×1400, igual para todos los universos; se amplía con los dedos o con − / +) ----------
   Cada saga es una zona redonda con sus libros alrededor en orden de lectura; los personajes van dentro de la zona de su saga
   (o entre zonas si son de varias). Hilos: entre libros (con número), de personaje a libro y entre personajes (con su relación).
   Colores de las conexiones: rojo confirmado, azul cameo, ámbar guiño, morado discontinuo teoría, gris punteado tapado. */
const BW = 1000, BH = 1400;
const SER_COL = ['#b3261e', '#1f6fb8', '#2f8a3a', '#8a4fb0', '#c8780f', '#227a7a'];
const REL = { pareja:['Pareja', '#d6336c'], familia:['Familia', '#2b8a3e'], amistad:['Amistad', '#1098ad'], mentor:['Mentor', '#e8590c'], vinculo:['Vínculo', '#b08900'], ex:['Ex', '#6c6c6c'], rival:['Rivales', '#495057'] };
const KCOL = { confirmado:'#c4251c', cameo:'#1f6fb8', 'guiño':'#d9961a', teoria:'#7a55d6' };
const uniWrap = (t, n, max) => { const w = String(t).split(/\s+/), out = []; let cur = '';
  w.forEach(x => { if((cur + ' ' + x).trim().length > n && cur){ out.push(cur); cur = x; } else cur = (cur + ' ' + x).trim(); }); if(cur) out.push(cur);
  if(out.length > max){ out.length = max; out[max - 1] = out[max - 1].replace(/.{0,2}$/, '…'); } return out; };
const uniLayouts = {};
/* Distribución en bandas: una por saga, de arriba abajo. En cada banda, sus libros en orden de lectura (filas de 7)
   y debajo sus personajes (filas de 6), ordenados para que los que se relacionan queden juntos. */
function uniLayout(u){
  if(uniLayouts[u.id]) return uniLayouts[u.id];
  const pos = {}, cp = {}, chars = u.chars || [], ns = u.series.length, bookSer = {};
  u.series.forEach((s, i) => s.books.forEach(b => { bookSer[b.k] = i; }));
  // Saga de cada personaje: la de la mayoría de sus libros; si no tiene, la de quienes se relaciona con él
  const home = {};
  chars.forEach(c => { const cnt = {}; u.links.filter(l => l.char === c.id).forEach(l => l.books.forEach(k => { if(k in bookSer) cnt[bookSer[k]] = (cnt[bookSer[k]] || 0) + 1; }));
    const e = Object.entries(cnt).sort((a, b) => b[1] - a[1]); if(e.length) home[c.id] = +e[0][0]; });
  for(let pass = 0; pass < 4; pass++) chars.forEach(c => { if(c.id in home) return; const cnt = {};
    u.rels.forEach(r => { const o = r.a === c.id ? r.b : r.b === c.id ? r.a : null; if(o && o in home) cnt[home[o]] = (cnt[home[o]] || 0) + 1;
      if(o) r.books.forEach(k => { if(k in bookSer) cnt[bookSer[k]] = (cnt[bookSer[k]] || 0) + .5; }); });
    const e = Object.entries(cnt).sort((a, b) => b[1] - a[1]); if(e.length) home[c.id] = +e[0][0]; });
  chars.forEach(c => { if(!(c.id in home)) home[c.id] = 0; });
  // Orden dentro de la banda: se encadenan los que tienen relación (los más conectados primero)
  const deg = id => u.rels.filter(r => r.a === id || r.b === id).length;
  const order = si => { const mine = chars.filter(c => home[c.id] === si).map(c => c.id), out = [], seen = new Set();
    const visit = id => { if(seen.has(id)) return; seen.add(id); out.push(id);
      u.rels.filter(r => r.a === id || r.b === id).map(r => r.a === id ? r.b : r.a).filter(o => mine.includes(o)).sort((a, b) => deg(b) - deg(a)).forEach(visit); };
    mine.sort((a, b) => deg(b) - deg(a)).forEach(visit); return out; };
  const BPR = 8, CPR = 6, bands = u.series.map((s, i) => { const ids = order(i); return { s, i, ids, rb:Math.ceil(s.books.length / BPR), rc:Math.ceil(ids.length / CPR) }; });
  const need = b => 52 + b.rb * 96 + (b.rc ? 34 + b.rc * 132 : 0) + 34, T = bands.reduce((a, b) => a + need(b), 0), k = Math.min(1, (BH - 30) / T), extra = Math.max(0, BH - 30 - T) / ns;
  let y = 15;
  bands.forEach(b => { b.y = y; b.h = need(b) * k + extra; let yy = y + 52 * k + extra / 2 + 34;
    b.s.books.forEach((bk, j) => { const row = Math.floor(j / BPR), inRow = Math.min(BPR, b.s.books.length - row * BPR), col = j % BPR, sp = Math.min(134, 944 / inRow);
      pos[bk.k] = { x:BW / 2 + (col - (inRow - 1) / 2) * sp, y:yy + row * 96 * k, si:b.i }; });
    yy += b.rb * 96 * k + 34 * k + 54;
    b.ids.forEach((id, j) => { const row = Math.floor(j / CPR), inRow = Math.min(CPR, b.ids.length - row * CPR), col = j % CPR, sp = Math.min(158, 940 / inRow);
      cp[id] = { x:BW / 2 + (col - (inRow - 1) / 2) * sp, y:yy + row * 132 * k, si:b.i, row, col }; });
    y += b.h; });
  return uniLayouts[u.id] = { pos, cp, bands };
}
const qCurve = (p, q, bend) => { const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1, cx = mx - dy / d * bend, cy = my + dx / d * bend;
  return { d:`M${p.x.toFixed(1)} ${p.y.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`, mid:{ x:(p.x + 2 * cx + q.x) / 4, y:(p.y + 2 * cy + q.y) / 4 } }; };
function uniBoardHtml(u, byK){
  const { pos, bands, cp } = uniLayout(u), sel = ui.uniSel[u.id] || '', v = ui.uniView[u.id] || { x:0, y:0, w:BW };
  const [st, sv] = [sel.slice(0, 1), sel.slice(2)], hi = new Set(); // lo que queda resaltado al tocar algo
  const relLocked = (r, i) => r.books.some(k => byK[k] && !uniIsRead(u, byK[k])) && !ui.uniShown.has(u.id + ':r' + i);
  if(st === 'b'){ hi.add('b' + sv); u.links.forEach((l, i) => { if(l.books.includes(sv)){ hi.add('l' + i); l.books.forEach(k => hi.add('b' + k)); if(l.char) hi.add('c' + l.char); } }); }
  if(st === 'c'){ hi.add('c' + sv); u.links.forEach((l, i) => { if(l.char === sv){ hi.add('l' + i); l.books.forEach(k => hi.add('b' + k)); } }); u.rels.forEach((r, i) => { if(r.a === sv || r.b === sv){ hi.add('r' + i); hi.add('c' + r.a); hi.add('c' + r.b); } }); }
  if(st === 'l'){ const l = u.links[+sv]; if(l){ hi.add('l' + sv); l.books.forEach(k => hi.add('b' + k)); if(l.char) hi.add('c' + l.char); } }
  if(st === 'r'){ const r = u.rels[+sv]; if(r){ hi.add('r' + sv); hi.add('c' + r.a); hi.add('c' + r.b); } }
  const dim = k => sel && !hi.has(k) ? ' dim' : '';
  let zs = '', seq = '', th = '', marks = '', nodes = '';
  bands.forEach(b => { const col = SER_COL[b.i % SER_COL.length], lab = b.s.world ? `${b.s.world} · ${b.s.name}` : b.s.name;
    zs += `<rect class="bz" x="12" y="${b.y.toFixed(1)}" width="${BW - 24}" height="${(b.h - 10).toFixed(1)}" rx="22" style="--c:${col}"/><text class="bz-t" x="34" y="${(b.y + 32).toFixed(1)}" style="fill:${col}">${esc(lab)}</text>`;
    const ks = b.s.books.map(x => x.k); ks.forEach((k, j) => { if(j) seq += `<path class="sq" d="M${pos[ks[j - 1]].x + 52} ${pos[ks[j - 1]].y}L${pos[k].x - 52} ${pos[k].y}"/>`; }); });
  // Hilos entre libros (con número) y de personaje a libro
  const pairN = {}, taken = [];
  const spot = (m, w, h) => { const ok = q => !taken.some(t => Math.abs(t.x - q.x) < (t.w + w) / 2 + 3 && Math.abs(t.y - q.y) < (t.h + h) / 2 + 2);
    for(let t = 0; t < 9; t++){ const q = { x:m.x, y:m.y + (t % 2 ? 1 : -1) * Math.ceil(t / 2) * (h + 3) }; if(ok(q)){ taken.push({ ...q, w, h }); return q; } }
    taken.push({ ...m, w, h }); return m; };
  Object.values(pos).forEach(p => taken.push({ x:p.x, y:p.y, w:106, h:70 })); Object.values(cp).forEach(p => taken.push({ x:p.x, y:p.y + 8, w:70, h:86 })); // ni encima de libros ni de personajes
  u.links.forEach((l, i) => {
    const ks = l.books.filter(k => pos[k]), lock = uniLocked(u, l, i, byK), col = lock ? '#8a8178' : KCOL[l.kind] || '#c4251c', cls = `th${lock ? ' lk' : l.kind === 'teoria' ? ' te' : ''}${dim('l' + i)}`;
    if(l.char && cp[l.char]){ ks.forEach(k => { const c = cp[l.char], q = pos[k]; th += `<path class="${cls} tc" d="${qCurve({ x:c.x, y:c.y - 32 }, { x:q.x, y:q.y + 34 }, (q.x - c.x) * .08).d}" style="--c:${col}"/>`; }); return; }
    if(!ks.length) return;
    let mid;
    if(ks.length === 1){ const p = pos[ks[0]], n = pairN[ks[0]] = (pairN[ks[0]] || 0) + 1; mid = { x:p.x - 40 + (n - 1) * 30, y:p.y + 44 }; }
    else ks.slice(1).forEach((k, j) => { const pk = [ks[j], k].sort().join(), n = pairN[pk] = (pairN[pk] || 0) + 1, P = pos[ks[j]], Q = pos[k], same = Math.abs(P.y - Q.y) < 20;
      const [p0, q0] = same ? [{ x:P.x, y:P.y - 34 }, { x:Q.x, y:Q.y - 34 }].sort((a, b) => a.x - b.x) : [P, Q], c = qCurve(p0, q0, same ? -(22 + Math.abs(Q.x - P.x) * .12 + (n - 1) * 16) : 50 + (n - 1) * 30);
      th += `<path class="${cls}" d="${c.d}" style="--c:${col}"/>`; if(!j) mid = c.mid; });
    mid = spot(mid, 30, 30);
    marks += `<g class="mk${dim('l' + i)}" data-bl="${i}" transform="translate(${mid.x.toFixed(1)} ${mid.y.toFixed(1)})"><circle r="15" style="fill:${col}"/><text dy="5">${lock ? '?' : i + 1}</text></g>`;
  });
  // Relaciones entre personajes: hilo grueso con la palabra encima
  const relN = {};
  u.rels.forEach((r, i) => { const p = cp[r.a], q = cp[r.b]; if(!p || !q) return; const lock = relLocked(r, i), col = lock ? '#8a8178' : (REL[r.t] || REL.amistad)[1];
    const pk = [r.a, r.b].sort().join(), n = relN[pk] = (relN[pk] || 0) + 1, sameRow = p.si === q.si && p.row === q.row, adj = sameRow && Math.abs(p.col - q.col) === 1;
    const [L, R] = [p, q].sort((m, o) => m.x - o.x), c = adj ? qCurve({ x:L.x + 32, y:L.y }, { x:R.x - 32, y:R.y }, (n - 1) * 24)
      : sameRow ? qCurve({ x:L.x, y:L.y - 34 }, { x:R.x, y:R.y - 34 }, -(24 + Math.abs(R.x - L.x) * .1 + (n - 1) * 18)) : qCurve(p, q, 40 + (n - 1) * 26);
    const t = lock ? '?' : r.label, w = Math.min(14 + t.length * 7.4, 170);
    th += `<path class="rl${lock ? ' lk' : r.t === 'rival' || r.t === 'ex' ? ' te' : ''}${dim('r' + i)}" d="${c.d}" style="--c:${col}"/>`;
    const lm = spot(c.mid, w, 24);
    marks += `<g class="rt${dim('r' + i)}" data-br="${i}" transform="translate(${lm.x.toFixed(1)} ${lm.y.toFixed(1)})"><rect x="${-w / 2}" y="-12" width="${w}" height="24" rx="12" style="stroke:${col}"/><text dy="5" style="fill:${col}">${esc(t)}</text></g>`; });
  // Libros
  u.series.forEach((s, si) => s.books.forEach(ub => { const p = pos[ub.k], b = uniFind(u, ub), read = uniIsRead(u, ub), col = SER_COL[si % SER_COL.length], lines = uniWrap(uniTitle(ub), 13, 3);
    nodes += `<g class="bn${read ? ' rd' : ''}${b && !read ? ' tb' : ''}${ub.opt ? ' op' : ''}${sel === 'b:' + ub.k ? ' on' : ''}${dim('b' + ub.k)}" data-bb="${ub.k}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})">
      <rect x="-52" y="-34" width="104" height="68" rx="8" style="stroke:${col}"/><rect x="-52" y="-34" width="104" height="7" rx="3" style="fill:${col}"/>
      ${lines.map((t, j) => `<text class="bt" y="${-8 + j * 16 - (lines.length - 1) * 6}">${esc(t)}</text>`).join('')}<text class="by" y="27">${ub.y || ''}</text>
      ${read ? '<g transform="translate(44 -30)"><circle r="11" fill="#2b8a3e"/><path d="M-5 0l3.5 3.5L5-4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>' : b ? '<g transform="translate(36 -32)"><rect x="-26" y="-9" width="52" height="18" rx="9" class="tbp"/><text class="tbt" dy="4">en tu TBR</text></g>' : ''}</g>`; }));
  // Personajes
  (u.chars || []).forEach(c => { const p = cp[c.id]; if(!p) return;
    nodes += `<g class="cn${sel === 'c:' + c.id ? ' on' : ''}${dim('c' + c.id)}" data-bc="${c.id}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})">
      <circle r="34" class="cr"/><svg x="-30" y="-30" width="60" height="60" viewBox="3 1 60 60" clip-path="url(#cc-${u.id})">${charSvg(c).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
      <text class="cnm" y="52">${esc(c.name)}</text></g>`; });
  return `<div class="bd-box${ui.uniFull === u.id ? ' full' : ''}" data-ub="${u.id}">
    <div class="bd-fh">${ui.uniFull === u.id ? `<b>${esc(u.name)}</b>` : '<span></span>'}<div class="bd-tools"><button class="iconbtn sm" type="button" data-bz="-1" aria-label="Alejar">−</button><button class="iconbtn sm" type="button" data-bz="1" aria-label="Acercar">+</button><button class="iconbtn sm" type="button" data-bz="0" aria-label="Ver todo">⤢</button>
      ${ui.uniFull === u.id ? `<button class="iconbtn sm" type="button" data-bf="0" aria-label="Cerrar">${ICON.x}</button>` : `<button class="btn sm" type="button" data-bf="1">Pantalla completa</button>`}</div></div>
    <div class="bd-stage"><svg class="bd" viewBox="${v.x} ${v.y} ${v.w} ${v.w * BH / BW}" preserveAspectRatio="xMidYMid meet" data-u="${u.id}">
      <defs><clipPath id="cc-${u.id}"><circle cx="33" cy="31" r="30"/></clipPath></defs>
      <rect class="bg" x="-2000" y="-2000" width="${BW + 4000}" height="${BH + 4000}"/>${zs}<g class="seqs">${seq}</g><g class="ths">${th}</g>${nodes}${marks}</svg>
</div>
    ${ui.uniFull === u.id ? uniPanel(u, byK) : ''}</div>
    <div class="bd-legend">${Object.entries(KCOL).map(([k, c]) => `<span class="lg" style="--c:${c}">${UNI_KIND[k]}</span>`).join('')}${Object.values(REL).slice(0, 5).map(([t, c]) => `<span class="lg rel" style="--c:${c}">${t}</span>`).join('')}<span class="lg lk">Tapado</span></div>`;
}
/* Zoom y arrastre: con un dedo se mueve, con dos se amplía (también rueda del ratón). No redibuja: cambia el viewBox. */
const uniDrag = { at:0 };
function uniZoomTo(svg, f, cx, cy){ const id = svg.dataset.u, v = ui.uniView[id] || { x:0, y:0, w:BW }, w = Math.min(BW * 1.15, Math.max(160, v.w / f));
  const px = cx === undefined ? v.x + v.w / 2 : cx, py = cy === undefined ? v.y + v.w * BH / BW / 2 : cy, k = w / v.w;
  ui.uniView[id] = { x:px - (px - v.x) * k, y:py - (py - v.y) * k, w }; uniApplyView(svg); }
function uniApplyView(svg){ const v = ui.uniView[svg.dataset.u]; svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.w * BH / BW}`); }
function uniPt(svg, x, y){ const r = svg.getBoundingClientRect(), v = ui.uniView[svg.dataset.u] || { x:0, y:0, w:BW }, s = Math.max(v.w / r.width, v.w * BH / BW / r.height);
  return { x:v.x + (x - r.left - (r.width - v.w / s) / 2) * s, y:v.y + (y - r.top - (r.height - v.w * BH / BW / s) / 2) * s, s }; }
function uniAttach(svg){
  const ptrs = new Map(); let last = null;
  svg.addEventListener('pointerdown', e => { ptrs.set(e.pointerId, { x:e.clientX, y:e.clientY, x0:e.clientX, y0:e.clientY }); uniDrag.moved = false; });
  svg.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if(!p) return; const id = svg.dataset.u, v = ui.uniView[id] = ui.uniView[id] || { x:0, y:0, w:BW };
    if(ptrs.size === 1){ const s = uniPt(svg, 0, 0).s, dx = e.clientX - p.x, dy = e.clientY - p.y;
      if(Math.hypot(e.clientX - p.x0, e.clientY - p.y0) > 6){ uniDrag.moved = true; svg.setPointerCapture(e.pointerId); }
      if(uniDrag.moved){ v.x -= dx * s; v.y -= dy * s; uniApplyView(svg); } }
    else if(ptrs.size === 2){ const [a, b] = [...ptrs.values()], d0 = Math.hypot(a.x - b.x, a.y - b.y); p.x = e.clientX; p.y = e.clientY; const [c, d] = [...ptrs.values()], d1 = Math.hypot(c.x - d.x, c.y - d.y);
      const m = uniPt(svg, (c.x + d.x) / 2, (c.y + d.y) / 2); uniDrag.moved = true; if(d0 > 0) uniZoomTo(svg, d1 / d0, m.x, m.y); return; }
    p.x = e.clientX; p.y = e.clientY; });
  const up = e => { ptrs.delete(e.pointerId); if(uniDrag.moved) uniDrag.at = Date.now(); };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('wheel', e => { e.preventDefault(); const m = uniPt(svg, e.clientX, e.clientY); uniZoomTo(svg, e.deltaY < 0 ? 1.15 : 1 / 1.15, m.x, m.y); }, { passive:false });
}
function uniLinkLi(u, l, i, byK){
  const id = u.id + ':' + i, miss = uniMiss(u, l, byK), open = !miss.length || ui.uniShown.has(id), sel = ui.uniSel[u.id] === 'l:' + i;
  const src = l.src ? ` <a href="${esc(l.src)}" target="_blank" rel="noopener">Fuente ↗</a>` : '', n = `<span class="uni-n">${i + 1}</span>`, kb = `<span class="badge k-${uniKindCls(l.kind)}">${UNI_KIND[l.kind] || l.kind}</span>`;
  return open ? `<li class="uni-l${sel ? ' on' : ''}" id="ul-${u.id}-${i}">${n}${kb} ${esc(l.text)}${src}</li>`
    : `<li class="uni-l${sel ? ' on' : ''}" id="ul-${u.id}-${i}"><button class="uni-lock" type="button" data-ul="${id}">${n}${kb} Spoiler de ${esc(miss.map(k => uniTitle(byK[k])).join(', '))} · <u>Toca para ver</u></button></li>`;
}
/* Una relación entre personajes en la lista (tapada si falta por leer algún libro) */
function uniRelLi(u, r, i, byK, from){
  const nm = id => ((u.chars || []).find(c => c.id === id) || {}).name || id, miss = r.books.filter(k => byK[k] && !uniIsRead(u, byK[k])), id = u.id + ':r' + i;
  const [tn, col] = REL[r.t] || REL.amistad, open = !miss.length || ui.uniShown.has(id), who = from ? nm(from === r.a ? r.b : r.a) : `${nm(r.a)} y ${nm(r.b)}`;
  const src = r.src ? ` <a href="${esc(r.src)}" target="_blank" rel="noopener">Fuente ↗</a>` : '', kb = `<span class="badge" style="background:${col}22;color:${col}">${tn}</span>`;
  return open ? `<li class="uni-l">${kb} <b>${esc(who)}</b>: ${esc(r.label)}${src}</li>`
    : `<li class="uni-l"><button class="uni-lock" type="button" data-ul="${id}">${kb} ${esc(who)} · Spoiler de ${esc(miss.map(k => uniTitle(byK[k])).join(', '))} · <u>Toca para ver</u></button></li>`;
}
function uniPanel(u, byK){
  const sel = ui.uniSel[u.id] || '';
  if(sel.startsWith('b:')){ const ub = byK[sel.slice(2)]; if(!ub) return '';
    const b = uniFind(u, ub), read = uniIsRead(u, ub), sub = [ub.t && ub.o !== ub.t ? ub.o : '', ub.serie, ub.y, ub.note || (ub.opt ? 'opcional' : '')].filter(Boolean).join(' · ');
    const act = b ? `<button class="btn sm" type="button" data-open="${b.id}">Ver ficha</button>` : `<button class="chip uni-rd" type="button" data-ur="${esc(u.id + ':' + ub.k)}" aria-pressed="${read}">${read ? 'Leído' : 'Sin leer'}</button>`;
    const ls = u.links.map((l, i) => [l, i]).filter(([l]) => l.books.includes(ub.k));
    return `<div class="bd-panel"><div class="bd-ph"><div class="tx"><b>${esc(uniTitle(ub))}</b><span>${esc(sub)}</span></div>${act}</div>${ls.length ? `<ul class="uni-links">${ls.map(([l, i]) => uniLinkLi(u, l, i, byK)).join('')}</ul>` : ''}</div>`; }
  if(sel.startsWith('c:')){ const c = (u.chars || []).find(x => x.id === sel.slice(2)); if(!c) return '';
    const ls = u.links.map((l, i) => [l, i]).filter(([l]) => l.char === c.id), rs = u.rels.map((r, i) => [r, i]).filter(([r]) => r.a === c.id || r.b === c.id);
    return `<div class="bd-panel"><div class="bd-ph"><span class="bd-mini">${charSvg(c)}</span><div class="tx"><b>${esc(c.name)}</b><span>${[rs.length ? rs.length + (rs.length === 1 ? ' relación' : ' relaciones') : '', ls.length ? ls.length + (ls.length === 1 ? ' aparición' : ' apariciones') : ''].filter(Boolean).join(' · ')}</span></div></div>
      ${rs.length ? `<ul class="uni-links">${rs.map(([r, i]) => uniRelLi(u, r, i, byK, c.id)).join('')}</ul>` : ''}${ls.length ? `<ul class="uni-links">${ls.map(([l, i]) => uniLinkLi(u, l, i, byK)).join('')}</ul>` : ''}</div>`; }
  if(sel.startsWith('r:')){ const i = +sel.slice(2), r = u.rels[i]; if(!r) return ''; return `<div class="bd-panel"><ul class="uni-links">${uniRelLi(u, r, i, byK)}</ul></div>`; }
  if(sel.startsWith('l:')){ const i = +sel.slice(2), l = u.links[i]; if(!l) return ''; return `<div class="bd-panel"><ul class="uni-links">${uniLinkLi(u, l, i, byK)}</ul></div>`; }
  return '<p class="note bd-hint">Toca un libro, un personaje, un número o una relación. Pellizca para ampliar.</p>';
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
  const view = mode === 'tablero' ? uniBoardHtml(u, byK) + (ui.uniFull === u.id ? '' : uniPanel(u, byK)) : `<h3>Orden de lectura</h3><ol class="uni-order">${order.map(row).join('')}</ol>`;
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
  el.innerHTML = `<section class="rd-sec"><h2>Universos</h2>${shown.map(uniCardHtml).join('') || '<p class="rd-empty">Has quitado todos.</p>'}
    ${gone.length ? `<div class="uni-gone"><h3>Quitados</h3><div class="chips">${gone.map(u => `<button class="chip" type="button" data-ush="${u.id}">+ ${esc(u.name)}</button>`).join('')}</div></div>` : ''}</section>`;
  $$('svg.bd', el).forEach(uniAttach); document.body.classList.toggle('uni-full-on', !!ui.uniFull);
}
document.addEventListener('click', e => {
  if(!e.target.closest('#view-universes')) return;
  const g = s => e.target.closest(s), uni = g('[data-ub]') ? g('[data-ub]').dataset.ub : g('details.uni') ? g('details.uni').dataset.uni : '';
  const pick = v => { ui.uniSel[uni] = ui.uniSel[uni] === v ? '' : v; renderUniverses(); };
  if(g('details.uni > summary')){ const d = g('details.uni'); d.open ? ui.uniOpen.delete(d.dataset.uni) : ui.uniOpen.add(d.dataset.uni); return; } // antes de que se abra: así sobrevive a un redibujo
  if(g('[data-ur]')){ const k = g('[data-ur]').dataset.ur, r = uniRead(); if(r[k]) delete r[k]; else r[k] = Date.now(); save(); renderUniverses(); }
  else if(g('[data-ul]')){ ui.uniShown.add(g('[data-ul]').dataset.ul); renderUniverses(); }
  else if(g('[data-um]')){ ui.uniMode[uni] = g('[data-um]').dataset.um; renderUniverses(); }
  else if(g('[data-bz]')){ const svg = $('svg.bd', g('.bd-box')), z = +g('[data-bz]').dataset.bz; if(!z){ ui.uniView[uni] = { x:0, y:0, w:BW }; uniApplyView(svg); } else uniZoomTo(svg, z > 0 ? 1.4 : 1 / 1.4); }
  else if(g('[data-bf]')){ ui.uniFull = g('[data-bf]').dataset.bf === '1' ? uni : ''; renderUniverses(); }
  else if(g('svg.bd') && Date.now() - uniDrag.at < 350) return; // fue un arrastre, no un toque
  else if(g('[data-br]')) pick('r:' + g('[data-br]').dataset.br);
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
document.addEventListener('keydown', e => { if(e.key === 'Escape' && ui.uniFull){ ui.uniFull = ''; renderUniverses(); } });
