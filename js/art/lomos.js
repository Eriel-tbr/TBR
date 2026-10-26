'use strict';
/* Lomos de libro: encaje del título y paisaje continuo de las sagas. Los diseños están en disenos.js. */

const FONT = { serif: "'GFS Baskerville','Caladea',Georgia,serif", pag: "'TeX Gyre Pagella','Caladea',Georgia,serif", script: "'TeX Gyre Chorus','Caladea',serif", deco: "'TeX Gyre Adventor','Poppins',sans-serif", sans: "'Inter',system-ui,sans-serif", pop: "'Poppins','Inter',sans-serif" };

const cvx = document.createElement('canvas').getContext('2d');

const tlen = (t, o) => { cvx.font = `${o.it ? 'italic ' : ''}${o.wt} 100px ${FONT[o.font]}`; const s = o.up ? t.toUpperCase() : t; return cvx.measureText(s).width / 100 + o.ls * s.length; };

function fit(text, len, wid, o) {
  len *= .93; const lh = 1.12, one = Math.min(o.max, len / tlen(text, o), wid / lh);
  let best = { lines: [text], fs: one };
  const w = text.split(' ');
  if (w.length > 1) {
    let bs = 0, bl = null;
    for (let i = 1; i < w.length; i++) { const a = w.slice(0, i).join(' '), b = w.slice(i).join(' '); const m = Math.max(tlen(a, o), tlen(b, o)); const f = Math.min(o.max, len / m, wid / (2 * lh)); if (f > bs) { bs = f; bl = [a, b]; } }
    if (bs > one * 1.15 || one < 9.5) best = { lines: bl, fs: bs };
    if (w.length > 2) { // títulos largos en lomos estrechos: probar también en tres líneas
      let b3 = 0, l3 = null;
      for (let i = 1; i < w.length - 1; i++) for (let j = i + 1; j < w.length; j++) { const p = [w.slice(0, i), w.slice(i, j), w.slice(j)].map(x => x.join(' ')); const f = Math.min(o.max, len / Math.max(...p.map(x => tlen(x, o))), wid / (3 * lh)); if (f > b3) { b3 = f; l3 = p; } }
      if (b3 > best.fs * 1.12 && best.fs < 10) best = { lines: l3, fs: b3 };
    }
  }
  best.fs = Math.max(6.5, Math.floor(best.fs * 10) / 10); return best;
}

function rng(seed) { let a = seed >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const hs = s => { let h = 7; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };

const MOTIF = {
  star: 'M8 1l2 4.800 5 .4-3.800 3.300 1.200 5L8 11.800 3.600 14.500l1.200-5L1 6.200l5-.4z', moon: 'M10 1.500A6.500 6.500 0 1 0 14 12a5.200 5.200 0 1 1-4-10.500z',
  leaf: 'M2 14C2 6 7 2 14 2c0 7-4 12-12 12zM3 13L10 6', flame: 'M8 1c3 3 5 6 3 9.500A4 4 0 0 1 4 11c0-2 2-3 2-5 1 1 2 1 2-5z',
  rose: 'M8 2a3 3 0 0 1 3 3 3 3 0 0 1 3 3 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 4-5zM8 6a2 2 0 0 0-2 2 2 2 0 0 0 2 2', crown: 'M1 12l1-7 3.500 3L8 3l2.500 5L14 5l1 7z',
  diamond: 'M8 1l6 7-6 7-6-7z', key: 'M5 1a3.500 3.500 0 1 1-1 6.800L2 10v2h2v2h2v-2l2-2.500A3.500 3.500 0 0 1 5 1z', drop: 'M8 1C11 5 13 8 13 10.500A5 5 0 0 1 3 10.500C3 8 5 5 8 1z', feather: 'M13 2C6 3 3 8 3 13l1 1c0-3 1-5 3-7-1 3 0 5 2 6 4-1 5-6 4-11z'
};

/* ---------- Paisaje continuo de las sagas ----------
   Un solo dibujo repartido entre los tomos (castillo, mar, dragón o bosque). Todos los colores salen de sus partes:
   cielo arriba (base), cielo medio (accent), horizonte (sky2), luna (moon), silueta (sil) y silueta lejana (sil2).
   El cielo es liso en la zona del título (arriba) para que se lea. */
const pineP = (x, b, ht) => { const wd = ht * .42; return `M${r1(x)} ${r1(b - ht)}L${r1(x + wd * .55)} ${r1(b - ht * .55)}L${r1(x + wd * .3)} ${r1(b - ht * .55)}L${r1(x + wd)} ${r1(b)}L${r1(x - wd)} ${r1(b)}L${r1(x - wd * .3)} ${r1(b - ht * .55)}L${r1(x - wd * .55)} ${r1(b - ht * .55)}Z`; };
function ridgeP(T, h, top, bot, r, step){ let x = -4, p = `M-4 ${h}L-4 ${r1(bot)}`; while(x < T + 4){ x += step * (.6 + r() * .8); p += `L${r1(x)} ${r1(top + r() * (bot - top))}`; x += step * (.4 + r() * .5); p += `L${r1(x)} ${r1(bot - r() * (bot - top) * .25)}`; } return p + `L${T + 4} ${h}Z`; }
/* Colinas suaves (curvas en vez de picos) */
function hillsP(T, h, top, bot, r, step){
  const pts = []; for(let x = -6; x < T + step; x += step * (.8 + r() * .6)) pts.push([x, top + r() * (bot - top)]);
  let p = `M-6 ${h}L${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for(let i = 1; i < pts.length; i++){ const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; p += `Q${r1(x0)} ${r1(y0)} ${r1((x0 + x1) / 2)} ${r1((y0 + y1) / 2)}`; }
  const L = pts[pts.length - 1]; return p + `L${r1(L[0])} ${r1(L[1])}L${r1(L[0])} ${h}Z`;
}
/* Dragón con las alas abiertas, visto desde abajo (caja de 3 a 127 × 24 a 111): alas de murciélago con espolón, cabeza con cuernos, patas con garras y cola enroscada.
   Cada pieza va en su propio <path> (si van juntas, donde se solapan con sentido contrario queda un hueco) */
const DRAGON_P = 'M56 55C48 52 40 51 31 51L29 46.5L28.5 51.5C20 56 11 64 3 72Q9.8 68.0 16 73Q22.3 69.6 27 75Q31.0 68.8 38 71Q41.3 64.8 48 67Q51.7 61.2 58 64ZM60 55C64 46 68 38 72 31L73 25.5L74.5 30.5C90 28 108 26 127 24Q118.3 26.6 115 35Q107.1 35.8 104 43Q96.1 43.8 93 51Q85.3 52.5 83 60Q73.4 59.8 67 67ZM73 81C77 86 82 90 87 93C92 96 95 100 94.5 105C94 109 90 111.5 86 111C82 110.5 79.5 107.5 80 104.5C80.5 101.5 83.5 100.5 85.5 102C87 103.2 86 105.2 84.5 104.8C85 106.8 88 107.4 90 105.8C92.5 103.6 91.5 99.8 88 97C83.5 93.5 78.5 89.5 74 85.5ZM54 57C56 53 60 51 64 52C69 56 73 64 75 72C76 77 75 81 72 83C69 82 66 78 63 73C59 67 55 62 54 57ZM48 49C50 52 53 55 57 58L60.5 55.5C57.5 53.5 55.5 50.5 53.5 46ZM53 46.5C51 48.5 47 50 43 50L39.5 49.4L41.5 48L39.3 47C41.8 44.6 45 43 48 42.5L47.6 37.6L50.6 42L54 38.2L53.8 43.2C54.4 44.4 54.2 45.6 53 46.5ZM55.5 49.8L56.4 47.2L57.3 50.6ZM58 52.6L59.4 50.4L59.9 54ZM61 66C58 70 54.5 75 54 78L51 81L53.5 81L54.2 79.8L54.6 82.4L55.8 80L57.6 81.2L56.8 78C57.5 75.5 59.5 72.5 63 69.5ZM63 74C62.5 77 62.5 80 63.5 83L61 86L63.6 85.8L64.2 84.6L64.8 87L66 84.6L67.6 85.6L66.4 82.6C66 80 66 77.5 66.6 75ZM71 80C72 83 73.5 85.5 76 87L74.5 90L77 89.6L77.8 88.4L78.6 90.6L79.6 88.2L81.4 88.8L79.6 86C77.5 84.5 76 82 75 79Z';
function sagaScene(o, T, h){
  const r = rng(o.cont.seed), sk = sid(), mg = sid(), mx = T * (o.saga === 'dragon' ? .86 : .68), my = h * (o.saga === 'dragon' ? .5 : .56);
  let s = `<defs><linearGradient id="${sk}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.base}"/><stop offset=".45" stop-color="${o.base}"/><stop offset=".76" stop-color="${o.accent}"/><stop offset="1" stop-color="${o.sky2}"/></linearGradient>
    <radialGradient id="${mg}"><stop offset="0" stop-color="${o.moon}" stop-opacity=".5"/><stop offset="1" stop-color="${o.moon}" stop-opacity="0"/></radialGradient></defs><rect width="${T}" height="${h}" fill="url(#${sk})"/>`;
  for(let i = 0; i < Math.round(T / 5); i++) s += `<circle cx="${r1(r() * T)}" cy="${r1(h * (.47 + r() * .2))}" r="${r1(.35 + r() * .5)}" fill="${o.moon}" opacity="${r1(.4 + r() * .5)}"/>`;
  s += `<circle cx="${r1(mx)}" cy="${r1(my)}" r="22" fill="url(#${mg})"/><circle cx="${r1(mx)}" cy="${r1(my)}" r="9" fill="${o.moon}"/><circle cx="${r1(mx + 2.5)}" cy="${r1(my - 2)}" r="1.6" fill="${darken(o.moon, .08)}"/><circle cx="${r1(mx - 3)}" cy="${r1(my + 2.5)}" r="1.1" fill="${darken(o.moon, .08)}"/>`;
  if(o.saga === 'castle'){
    s += `<path d="${ridgeP(T, h, h * .62, h * .76, r, 16)}" fill="${o.sil2}"/>`;
    const cx = T * .3, b = h * .9, u = Math.min(16, T * .09), win = (x, y) => `<rect x="${r1(x - .7)}" y="${r1(y)}" width="1.4" height="2.6" rx=".7" fill="${o.moon}"/>`;
    const tower = (x, tw, th) => `<rect x="${r1(x - tw / 2)}" y="${r1(b - th)}" width="${r1(tw)}" height="${r1(th)}" fill="${o.sil}"/><path d="M${r1(x - tw / 2 - 1.2)} ${r1(b - th)}L${r1(x)} ${r1(b - th - tw * 1.5)}L${r1(x + tw / 2 + 1.2)} ${r1(b - th)}Z" fill="${o.sil}"/>${win(x, b - th + th * .22)}`;
    s += `<rect x="${r1(cx - u * 1.6)}" y="${r1(b - h * .14)}" width="${r1(u * 3.2)}" height="${r1(h * .14)}" fill="${o.sil}"/>`;
    for(let i = 0; i < 9; i++) s += `<rect x="${r1(cx - u * 1.6 + i * u * .38)}" y="${r1(b - h * .14 - 2.6)}" width="${r1(u * .2)}" height="2.6" fill="${o.sil}"/>`;
    s += tower(cx, u * .55, h * .3) + tower(cx - u * 1.35, u * .42, h * .2) + tower(cx + u * 1.35, u * .42, h * .18) + win(cx - u * .7, b - h * .09) + win(cx + u * .7, b - h * .09);
    s += `<path d="M${r1(cx)} ${r1(b - h * .3 - u * .82)}v-5l4 1.6-4 1.6" fill="${o.moon}" stroke="${o.sil}" stroke-width=".5"/>`;
    s += `<path d="M-4 ${h}L-4 ${r1(h * .9)}Q${r1(T * .5)} ${r1(h * .84)} ${T + 4} ${r1(h * .9)}L${T + 4} ${h}Z" fill="${o.sil}"/>`;
    for(let x = 2; x < T; x += 5 + r() * 6) if(Math.abs(x - cx) > u * 1.9) s += `<path d="${pineP(x, h * .93, h * (.07 + r() * .06))}" fill="${o.sil}"/>`;
  } else if(o.saga === 'sea'){
    const wl = h * .7; s += `<rect y="${r1(wl)}" width="${T}" height="${r1(h - wl)}" fill="${o.sil2}"/>`;
    for(let i = 0; i < 8; i++) s += `<rect x="${r1(mx - 8 + (i % 3) * 5)}" y="${r1(wl + 3 + i * 3.6)}" width="${r1(11 - i)}" height="1.2" rx=".6" fill="${o.moon}" opacity="${r1(.75 - i * .07)}"/>`;
    for(let i = 0; i < Math.round(T / 9); i++) s += `<path d="M${r1(r() * T)} ${r1(wl + 4 + r() * (h - wl - 8))}h${r1(2 + r() * 4)}" stroke="${lighten(o.sil2, .22)}" stroke-width=".5"/>`;
    const sx = T * .3; s += `<g fill="${o.sil}"><path d="M${r1(sx - 24)} ${r1(wl - 2)}H${r1(sx + 24)}L${r1(sx + 18)} ${r1(wl + 6)}H${r1(sx - 19)}Z"/><rect x="${r1(sx - 1)}" y="${r1(wl - 50)}" width="2" height="48"/><rect x="${r1(sx - 14)}" y="${r1(wl - 38)}" width="1.5" height="36"/><rect x="${r1(sx + 12)}" y="${r1(wl - 34)}" width="1.5" height="32"/>
      <path d="M${r1(sx + 2)} ${r1(wl - 48)}Q${r1(sx + 16)} ${r1(wl - 34)} ${r1(sx + 2)} ${r1(wl - 9)}ZM${r1(sx - 12)} ${r1(wl - 36)}Q${r1(sx - 1)} ${r1(wl - 26)} ${r1(sx - 12)} ${r1(wl - 7)}ZM${r1(sx + 14)} ${r1(wl - 32)}Q${r1(sx + 23)} ${r1(wl - 22)} ${r1(sx + 14)} ${r1(wl - 7)}Z"/></g><path d="M${r1(sx)} ${r1(wl - 50)}l6 2.2-6 2.2z" fill="${o.moon}"/>`;
    const wave = (y0, a, f, col, ph) => { let p = `M-2 ${h}L-2 ${r1(y0)}`; for(let x = 0; x <= T + 4; x += 3) p += `L${x} ${r1(y0 + Math.sin(x / f + ph) * a)}`; return `<path d="${p}L${T + 4} ${h}Z" fill="${col}"/>`; };
    s += wave(h * .84, 1.8, 7, o.sil, 1.2) + wave(h * .92, 2.4, 10, darken(o.sil, .3), 2.5);
  } else if(o.saga === 'dragon'){
    // todo el fondo es cielo: unas nubes suaves abajo y el dragón volando
    for(let i = 0; i < Math.max(2, Math.round(T / 45)); i++){ const x = r() * T, y = h * (.8 + r() * .12), rw = 14 + r() * 16;
      s += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rw)}" ry="${r1(rw * .28)}" fill="${mix(o.sky2, o.sil2, .3)}" opacity=".7"/><ellipse cx="${r1(x + rw * .4)}" cy="${r1(y - rw * .14)}" rx="${r1(rw * .55)}" ry="${r1(rw * .22)}" fill="${mix(o.sky2, o.accent, .2)}" opacity=".7"/>`; }
    const k = Math.min(T * .006, .72); s += `<g fill="${o.sil}" transform="translate(${r1(T * .46 - 65 * k)} ${r1(h * .47 - 24 * k)}) scale(${r1(k * 100) / 100})">${DRAGON_P.split('Z').filter(Boolean).map(d => `<path d="${d}Z"/>`).join('')}</g>`;
  } else { // bosque
    s += `<path d="${ridgeP(T, h, h * .64, h * .74, r, 22)}" fill="${mix(o.sil2, o.sky2, .35)}"/>`;
    for(let x = -2; x < T + 4; x += 3 + r() * 4) s += `<path d="${pineP(x, h * .82, h * (.1 + r() * .08))}" fill="${o.sil2}"/>`;
    s += `<rect y="${r1(h * .82)}" width="${T}" height="${r1(h * .18)}" fill="${o.sil2}"/>`;
    for(let x = 0; x < T + 4; x += 5 + r() * 6) s += `<path d="${pineP(x, h * .97, h * (.16 + r() * .12))}" fill="${o.sil}"/>`;
    s += `<rect y="${r1(h * .95)}" width="${T}" height="${r1(h * .05)}" fill="${o.sil}"/>`;
    for(let i = 0; i < Math.round(T / 14); i++) s += `<circle cx="${r1(r() * T)}" cy="${r1(h * (.78 + r() * .12))}" r=".7" fill="${o.moon}" opacity="${r1(.5 + r() * .4)}"/>`;
  }
  return s;
}
function sagaSpine(o){
  const { w, h } = o;
  const f = `<div style="position:absolute;inset:0;overflow:hidden"><svg width="${o.cont.total}" height="${h}" style="position:absolute;left:${-o.cont.off}px;top:0" viewBox="0 0 ${o.cont.total} ${h}" aria-hidden="true">${sagaScene(o, o.cont.total, h)}</svg></div>` + ttl(o, { l:3, t:10, w:w - 6, h:Math.round(h * .38) });
  const num = o.num ? `<span class="nm" style="top:${h - 20}px;color:${o.numInk};font-family:${FONT[o.font || 'pag']};font-size:${numSize(o.num)}px">${o.num}</span>` : '';
  return `<div class="it"><div class="bk" style="--w:${w}px;--h:${h}px;--b:${o.base};--f:${o.titleInk}"><div class="face">${f}${num}</div></div></div>`;
}

function ttl(o, b) {
  const O = { font: o.font || 'serif', wt: o.wt || 700, up: !!o.up, ls: o.ls ?? .04, it: !!o.it, max: o.max || 15 };
  const f = fit(o.title, b.h, b.w, O), ink = o.titleInk || b.c || o.foil;
  // Brillo (neón) o una sombra muy suave para que las letras se separen del fondo
  const sh = o.glow ? `0 0 3px ${o.glow},0 0 6px ${o.glow}` : o.titleInk ? '0 0 2px ' + (lum(ink) > .5 ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.35)') : '';
  // Centrado: el espaciado entre letras deja un hueco detrás de la última; se compensa con el mismo hueco delante (padding-top)
  return `<div class="tbox" style="left:${b.l}px;top:${b.t}px;width:${b.w}px;height:${b.h}px"><div class="tt" style="font-family:${FONT[O.font]};font-weight:${O.wt};${O.it ? 'font-style:italic;' : ''}font-size:${f.fs}px;letter-spacing:${O.ls}em;padding-top:${O.ls}em;${O.up ? 'text-transform:uppercase;' : ''}color:${ink};${sh ? 'text-shadow:' + sh + ';' : ''}">${f.lines.map(l => `<span>${esc(l)}</span>`).join('')}</div></div>`;
}
