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
const DRAGON_P = 'M57 56C49 53 40 51.5 31 52L28.5 47.5L28 52.5C20 57 11 65 3.5 72.5Q14.7 69.6 25 75Q31.0 69.2 39 71.5Q43.6 66.2 50 69Q53.2 63.5 59 66ZM61 56C64 48 68 39 72 31L72.5 26.5L74.6 30.6C90 28.5 108 26.5 126 25Q117.4 26.9 114 35Q104.4 38.0 100 47Q91.6 48.3 88 56Q79.4 57.3 75.5 65Q70.1 61.8 66 66.5ZM72.1 81.6L72.6 82.1L73.2 82.8L73.9 83.7L74.7 84.6L75.6 85.6L76.5 86.6L77.5 87.6L78.3 88.5L79.2 89.4L80.2 90.3L81.1 91.2L82.1 92.1L83.0 93.0L83.9 93.8L84.7 94.6L85.5 95.4L86.3 96.2L87.1 96.9L87.8 97.6L88.4 98.3L89.0 99.0L89.6 99.6L90.0 100.2L90.5 100.9L90.8 101.5L91.2 102.2L91.5 102.9L91.7 103.5L91.9 104.2L92.0 104.7L92.0 105.3L92.0 105.7L91.9 106.1L91.7 106.6L91.5 107.1L91.1 107.6L90.7 108.1L90.2 108.5L89.8 108.9L89.4 109.2L89.0 109.4L88.5 109.6L88.0 109.7L87.5 109.8L86.9 109.9L86.3 109.9L85.8 109.9L85.3 109.8L84.7 109.7L84.2 109.5L83.6 109.2L83.1 108.9L82.5 108.6L82.0 108.2L81.5 107.8L81.1 107.5L80.7 107.1L80.4 106.6L80.0 106.2L79.8 105.7L79.5 105.2L79.3 104.7L79.1 104.3L79.0 103.9L79.0 103.6L79.0 103.3L79.1 103.0L79.2 102.7L79.4 102.4L79.6 102.1L79.7 101.9L79.8 101.6L79.2 101.4L79.1 101.5L78.9 101.7L78.7 102.0L78.5 102.3L78.3 102.7L78.1 103.1L78.0 103.6L78.0 104.1L78.0 104.6L78.2 105.1L78.3 105.7L78.6 106.3L78.8 106.9L79.1 107.4L79.5 108.0L79.9 108.5L80.4 109.0L80.9 109.5L81.5 110.0L82.1 110.4L82.7 110.9L83.4 111.2L84.1 111.6L84.7 111.8L85.4 112.0L86.2 112.1L86.9 112.1L87.7 112.1L88.4 112.1L89.2 111.9L89.9 111.7L90.6 111.4L91.3 111.0L92.0 110.6L92.6 110.0L93.2 109.4L93.8 108.7L94.3 108.0L94.7 107.2L95.0 106.3L95.1 105.4L95.1 104.5L95.0 103.6L94.9 102.7L94.6 101.8L94.3 100.9L94.0 100.0L93.5 99.1L93.1 98.3L92.5 97.4L91.9 96.6L91.3 95.8L90.6 95.0L89.9 94.2L89.2 93.4L88.5 92.6L87.7 91.7L86.8 90.9L85.9 89.9L85.0 89.0L84.1 88.1L83.3 87.2L82.4 86.3L81.7 85.5L80.9 84.6L80.0 83.6L79.2 82.5L78.4 81.5L77.6 80.6L76.9 79.7L76.3 79.0L75.9 78.4ZM54.1 62.2L54.6 62.5L55.3 62.8L55.9 63.1L56.6 63.5L57.2 63.9L57.8 64.2L58.3 64.6L58.8 64.9L59.3 65.3L59.9 65.9L60.5 66.6L61.2 67.4L61.8 68.2L62.5 69.0L63.1 69.9L63.8 70.7L64.4 71.5L65.0 72.2L65.5 73.0L66.1 73.8L66.6 74.6L67.2 75.4L67.7 76.2L68.3 77.0L68.8 77.8L69.3 78.5L69.8 79.4L70.3 80.1L70.7 80.9L71.2 81.6L71.5 82.1L71.9 82.5L78.1 79.5L78.0 79.0L77.8 78.3L77.5 77.6L77.2 76.7L76.9 75.8L76.5 74.9L76.1 73.9L75.7 73.0L75.4 72.1L75.0 71.2L74.6 70.3L74.2 69.3L73.7 68.3L73.2 67.3L72.7 66.3L72.2 65.3L71.7 64.3L71.2 63.3L70.6 62.3L70.0 61.2L69.3 60.2L68.7 59.1L68.0 58.1L67.2 57.1L66.4 56.1L65.5 55.2L64.6 54.4L63.8 53.6L63.1 53.0L62.5 52.5L62.1 52.1L61.9 51.8ZM63.1 57.5L62.7 57.1L62.2 56.6L61.6 56.1L61.0 55.5L60.4 54.8L59.8 54.2L59.2 53.6L58.7 53.1L58.3 52.5L57.8 52.0L57.4 51.4L57.0 50.9L56.5 50.3L56.2 49.8L55.8 49.3L55.5 48.8L55.2 48.3L54.9 47.9L54.6 47.4L54.3 46.9L54.1 46.4L53.9 46.0L53.7 45.6L53.5 45.3L49.5 46.7L49.5 47.0L49.6 47.4L49.7 47.9L49.8 48.5L49.9 49.1L50.1 49.8L50.3 50.5L50.5 51.2L50.8 51.9L51.1 52.6L51.4 53.3L51.7 54.0L52.1 54.7L52.4 55.5L52.8 56.2L53.3 56.9L53.7 57.7L54.2 58.5L54.8 59.4L55.3 60.1L55.9 60.9L56.3 61.6L56.7 62.1L56.9 62.5ZM53.5 47.2C52 49.4 48.6 51 44.6 51.6L40.6 51.6L42.4 50L40.2 49.4L43 48.6L40.4 47.4C43.2 44.8 46.2 43.2 49.4 42.8L46.8 37.2L51.2 42.2L53.6 36.6L54.2 43C55 44.4 54.8 46 53.5 47.2ZM54.4 50.1L57.2 47.2L56.9 50.6ZM56.8 54.3L59.6 51.4L59.3 54.8ZM63.6 60.6L66.4 57.7L66.1 61.1ZM67.4 65.7L70.2 62.8L69.9 66.2ZM70.4 71.5L73.2 68.6L72.9 72.0ZM72.8 77.1L75.6 74.2L75.3 77.6ZM58.5 63.7L58.2 64.1L57.8 64.5L57.4 65.1L56.8 65.8L56.3 66.5L55.8 67.2L55.3 68.0L54.9 68.7L54.6 69.4L54.5 70.1L54.4 70.8L54.3 71.4L54.3 72.1L54.3 72.6L54.4 73.2L54.5 73.8L54.7 74.4L54.9 75.0L55.2 75.5L55.5 76.0L55.8 76.4L56.0 76.7L56.2 77.0L56.4 77.1L58.6 75.9L58.5 75.6L58.3 75.2L58.1 74.9L57.9 74.5L57.8 74.2L57.6 73.8L57.5 73.5L57.5 73.2L57.5 72.9L57.5 72.5L57.5 72.1L57.6 71.7L57.7 71.4L57.8 71.0L57.9 70.6L58.1 70.3L58.3 69.9L58.7 69.4L59.2 68.8L59.7 68.2L60.3 67.6L60.8 67.1L61.2 66.6L61.5 66.3ZM57.5 76.5L59.7 79.1L57.5 77.8ZM57.5 76.5L57.8 79.9L56.8 77.6ZM57.5 76.5L55.8 79.4L56.3 76.9ZM63.2 69.1L63.1 69.5L62.9 69.9L62.6 70.5L62.3 71.2L62.0 71.9L61.7 72.6L61.4 73.4L61.3 74.2L61.2 74.9L61.2 75.6L61.3 76.2L61.4 76.9L61.5 77.5L61.7 78.0L61.9 78.6L62.1 79.1L62.4 79.6L62.7 80.1L63.1 80.6L63.5 81.0L63.8 81.3L64.1 81.5L64.4 81.7L64.5 81.9L66.5 80.1L66.3 79.9L66.1 79.6L65.8 79.3L65.6 79.0L65.3 78.7L65.1 78.4L65.0 78.2L64.9 77.9L64.8 77.6L64.7 77.2L64.7 76.8L64.6 76.4L64.6 76.0L64.6 75.6L64.7 75.2L64.7 74.8L64.9 74.5L65.1 74.0L65.3 73.4L65.7 72.8L66.0 72.3L66.3 71.7L66.6 71.2L66.8 70.9ZM65.5 81.0L67.9 83.4L65.6 82.3ZM65.5 81.0L66.1 84.3L64.8 82.1ZM65.5 81.0L64.1 84.1L64.3 81.5ZM70.4 79.2L70.6 79.5L71.0 79.8L71.3 80.2L71.7 80.7L72.1 81.1L72.5 81.6L72.8 82.0L73.0 82.3L73.2 82.6L73.4 82.9L73.6 83.3L73.7 83.6L73.9 84.0L74.0 84.3L74.1 84.6L74.3 84.9L76.7 84.1L76.7 83.9L76.7 83.6L76.6 83.3L76.6 82.8L76.5 82.3L76.3 81.8L76.2 81.3L76.0 80.7L75.7 80.2L75.4 79.6L75.0 79.0L74.6 78.5L74.3 77.9L74.0 77.5L73.8 77.1L73.6 76.8ZM75.5 84.5L78.3 86.5L75.8 85.8ZM75.5 84.5L76.7 87.7L75.1 85.7ZM75.5 84.5L74.6 87.8L74.4 85.2Z';
/* Nubes del paisaje del dragón: colores de luz, medio y sombra sacados del horizonte, la luna y la silueta lejana */
const cloudCols = o => ({ light:lighten(mix(o.sky2, o.moon, .35), .3), mid:mix(o.sky2, o.moon, .12), shade:mix(o.sky2, o.sil2, .38) });
/* Cúmulo: bolas que se solapan, con sombra debajo y luz arriba, y la base aplanada */
function cloudG(r, cx, cy, wd, ht, C){
  const n = Math.max(4, Math.round(wd / 6)); let a = '', b = '', c = '';
  for(let i = 0; i < n; i++){ const t = i / (n - 1), x = cx - wd / 2 + t * wd + (r() - .5) * 3, rr = ht * (.42 + Math.sin(t * Math.PI) * .58) * (.8 + r() * .4), y = cy - rr * .3;
    a += `<circle cx="${r1(x)}" cy="${r1(y + rr * .28)}" r="${r1(rr)}" fill="${C.shade}"/>`; b += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(rr * .9)}" fill="${C.mid}"/>`;
    c += `<circle cx="${r1(x - rr * .22)}" cy="${r1(y - rr * .32)}" r="${r1(rr * .5)}" fill="${C.light}"/>`; }
  return `<ellipse cx="${r1(cx)}" cy="${r1(cy + ht * .3)}" rx="${r1(wd * .56)}" ry="${r1(ht * .4)}" fill="${C.shade}"/>${a}${b}${c}`;
}
function sagaScene(o, T, h){
  const r = rng(o.cont.seed), sk = sid(), mg = sid(), dr = o.saga === 'dragon', mx = T * (dr ? .86 : .68), my = h * (dr ? .5 : .56);
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
    // todo el fondo es cielo: un banco de nubes lejano, el dragón y un mar de nubes delante, abajo
    const C = cloudCols(o), far = { light:mix(C.light, o.accent, .35), mid:mix(C.mid, o.accent, .4), shade:mix(C.shade, o.accent, .4) }, bl = sid();
    let back = '', front = '';
    for(let x = -10; x < T + 20; x += 26 + r() * 18) back += cloudG(r, x, h * (.72 + r() * .05), 24 + r() * 16, 7 + r() * 4, far);
    for(let x = -8; x < T + 20; x += 20 + r() * 14) front += cloudG(r, x, h * (.9 + r() * .05), 26 + r() * 18, 10 + r() * 5, C);
    const k = Math.min(T * .006, .72);
    s += `<defs><filter id="${bl}" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation=".7"/></filter></defs><g filter="url(#${bl})" opacity=".85">${back}</g>`;
    s += `<g fill="${o.sil}" transform="translate(${r1(T * .46 - 65 * k)} ${r1(h * .47 - 24 * k)}) scale(${r1(k * 100) / 100})">${DRAGON_P.split('Z').filter(Boolean).map(d => `<path d="${d}Z"/>`).join('')}</g>`;
    s += `<g filter="url(#${bl})">${front}</g><rect y="${r1(h * .96)}" width="${T}" height="${r1(h * .04)}" fill="${C.mid}"/>`;
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
