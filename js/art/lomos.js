'use strict';
/* Lomos de libro: encaje del título y paisaje continuo de las sagas. Los 15 diseños están en disenos.js. */

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

const mo = (k, y, s = 13, col) => `<svg class="orn fxs" style="top:${y}px${col ? ';color:' + col : ''}" width="${s}" height="${s}" viewBox="0 0 16 16"><path d="${MOTIF[k]}"/></svg>`;

function stars(w, h, n, seed, col = '#fff') { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) { const x = 3 + r() * (w - 6), y = 4 + r() * (h - 8), rr = .5 + r() * 1.1; s += `<circle cx="${x}" cy="${y}" r="${rr}" fill="${col}" opacity="${.5 + r() * .5}"/>`; if (r() > .85) s += `<path d="M${x - 3} ${y}H${x + 3}M${x} ${y - 3}V${y + 3}" stroke="${col}" stroke-width=".5" opacity=".8"/>`; } return `<svg width="${w}" height="${h}" style="position:absolute;left:0;top:0">${s}</svg>`; }

function sceneG(kind, W, H, c1, c2, seed, cx) {
  const r = rng(seed); let s = '';
  if (kind === 'mountains') {
    let x = 0, p = `0,${H} `; while (x < W + 14) { p += `${x},${H * .5 - r() * H * .42} `; x += 12 + r() * 16; p += `${x},${H * .85 - r() * H * .12} `; x += 8 + r() * 10; } s += `<polygon points="${p}${W},${H}" fill="${c2}"/>`;
    x = 0; p = `0,${H} `; while (x < W + 14) { p += `${x},${H * .72 - r() * H * .2} `; x += 9 + r() * 12; p += `${x},${H * .95} `; x += 5 + r() * 8; } s += `<polygon points="${p}${W},${H}" fill="${c1}"/>`;
  } else if (kind === 'forest') {
    for (let l = 0; l < 2; l++) for (let x = -4 + l * 4; x < W + 6; x += 6 + r() * 4) { const th = H * (.5 - l * .14) + r() * H * .3; s += `<polygon points="${x},${H} ${x + 5},${H - th} ${x + 10},${H}" fill="${l ? c1 : c2}"/>`; }
  } else if (kind === 'castle') s += castleG(W, H, c1, c2, W / 2);
  else if (kind === 'tree') {
    const cx = W * .56, base = H * .7; s += `<path d="M-2 ${H}V${H * .82}Q${W * .5} ${H * .55} ${W + 2} ${H * .8}V${H}Z" fill="${c2}"/><path d="M${cx - 1.800} ${base}C${cx - 1} ${H * .5} ${cx - 2} ${H * .42} ${cx - 4} ${H * .34}L${cx - 2} ${H * .34}C${cx} ${H * .4} ${cx + 1} ${H * .36} ${cx + 3} ${H * .3}L${cx + 4} ${H * .31}C${cx + 2} ${H * .4} ${cx + 1.800} ${H * .5} ${cx + 2.200} ${base}Z" fill="${c1}"/>`;
    [[0, -.02, .2], [-.18, .06, .14], [.17, .05, .15], [-.08, .12, .13], [.08, .13, .12]].forEach(([dx, dy, rr]) => s += `<circle cx="${cx + dx * W}" cy="${H * (.24 + dy)}" r="${rr * W}" fill="${c1}"/>`);
    s += `<path d="M${W * .14} ${H * .14}l2.500 1.600 2.500-1.600M${W * .26} ${H * .06}l2 1.300 2-1.300" stroke="${c1}" stroke-width=".9" fill="none"/>`;
    for (let i = 0; i < 5; i++) s += `<circle cx="${W * (.15 + i * .17)}" cy="${H * (.62 + (i % 2) * .1)}" r=".9" fill="#fff6b0" opacity=".9"/>`;
  }
  else if (kind === 'city') {
    let x = 0; while (x < W) { const bw = 7 + r() * 9, bh = H * (.3 + r() * .6); s += `<rect x="${x}" y="${H - bh}" width="${bw}" height="${bh}" fill="${r() > .5 ? c1 : c2}"/>`; for (let yy = H - bh + 4; yy < H - 4; yy += 6) if (r() > .45) s += `<rect x="${x + 2}" y="${yy}" width="2" height="2" fill="${r() > .5 ? '#ff2fb8' : '#25f4ee'}" opacity=".9"/>`; x += bw + 1; }
  }
  return s;
}

function castleG(W, H, c1, c2, cx, sc = 1) {
  const u = Math.min(W * .34, 19) * sc, base = H; let s = `<path d="M${cx - u * 1.2} ${base}Q${cx} ${base - H * .3} ${cx + u * 1.2} ${base}Z" fill="${c2}"/>`;
  const wallH = H * .32, wallW = u * 1.5; s += `<rect x="${cx - wallW / 2}" y="${base - wallH}" width="${wallW}" height="${wallH}" fill="${c1}"/>`;
  for (let i = 0; i < 7; i++) s += `<rect x="${cx - wallW / 2 + i * wallW / 6.5}" y="${base - wallH - 3}" width="${wallW / 14}" height="3.500" fill="${c1}"/>`;
  const tw = (x, w, h) => `<rect x="${x - w / 2}" y="${base - h}" width="${w}" height="${h}" fill="${c1}"/><polygon points="${x - w / 2 - 1.500},${base - h} ${x},${base - h - w * 1.5} ${x + w / 2 + 1.500},${base - h}" fill="${c1}"/><rect x="${x - .8}" y="${base - h + h * .2}" width="1.600" height="3.600" fill="#ffd36a"/>`;
  s += tw(cx, u * .42, H * .72) + tw(cx - wallW / 2 + 2, u * .3, H * .5) + tw(cx + wallW / 2 - 2, u * .3, H * .46);
  s += `<path d="M${cx - 2.500} ${base} v-6 a2.500 2.500 0 0 1 5 0 v6z" fill="#ffd36a" opacity=".9"/><path d="M${cx} ${base - H * .72 - u * .63}v-5l4 1.800-4 1.800" fill="#e0529c" stroke="#e0529c" stroke-width=".6"/>`;
  return s;
}

function flowerG(x, y, r, col, c2) {
  let p = ''; for (let i = 0; i < 6; i++) p += `<ellipse cx="${x}" cy="${y - r * .62}" rx="${r * .42}" ry="${r * .7}" transform="rotate(${i * 60} ${x} ${y})" fill="${i % 2 ? col : c2 || lighten(col, .22)}" stroke="${darken(col, .35)}" stroke-width=".4"/>`;
  return p + `<circle cx="${x}" cy="${y}" r="${r * .3}" fill="#ffd36a" stroke="#a8782a" stroke-width=".4"/>`;
}

const leafP = (x, y, ang, L, col) => `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0 0C${L * .3} ${-L * .38} ${L * .8} ${-L * .3} ${L} 0 ${L * .8} ${L * .3} ${L * .3} ${L * .38} 0 0z" fill="${col}" stroke="${darken(col, .4)}" stroke-width=".4"/><path d="M1 0H${L * .9}" stroke="${darken(col, .4)}" stroke-width=".4" opacity=".8"/></g>`;

function sagaScene(o, T, h) {
  const r = rng(o.cont.seed), sd = o.cont.seed; let st = ''; for (let i = 0; i < 40; i++) st += `<circle cx="${r() * T}" cy="${6 + r() * h * .45}" r="${.5 + r()}" fill="#fff" opacity="${.4 + r() * .5}"/>`;
  const sky = `<defs><linearGradient id="sk${sd}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.base}"/><stop offset=".6" stop-color="${o.accent}"/><stop offset="1" stop-color="${o.sky2}"/></linearGradient><radialGradient id="mn${sd}"><stop offset="0" stop-color="#fffbe8"/><stop offset=".6" stop-color="${o.moon}"/><stop offset="1" stop-color="${o.moon}" stop-opacity="0"/></radialGradient></defs><rect width="${T}" height="${h}" fill="url(#sk${sd})"/>`;
  let s = sky;
  if (o.saga === 'castle') {
    const mx = T * .62; s += st + `<circle cx="${mx}" cy="${h * .62}" r="26" fill="url(#mn${sd})" opacity=".55"/><circle cx="${mx}" cy="${h * .62}" r="14" fill="#fff6d8"/><g transform="translate(0 ${h * .44})">${sceneG('mountains', T, h * .56, o.sil, o.sil2, sd)}</g><g transform="translate(0 ${h * .5})">${castleG(T, h * .5, o.sil, o.sil2, T * .3, 1.5)}</g><g transform="translate(0 ${h * .8})">${sceneG('forest', T, h * .2, o.sil, o.sil, sd + 3)}</g>`;
  } else if (o.saga === 'sea') {
    const mx = T * .72, wl = h * .66; s += st + `<circle cx="${mx}" cy="${h * .5}" r="30" fill="url(#mn${sd})" opacity=".5"/><circle cx="${mx}" cy="${h * .5}" r="15" fill="#fff6d8"/>`;
    const wave = (y0, a, f, col, ph) => { let p = `0,${h} `; for (let x = 0; x <= T + 4; x += 4) p += `${x},${y0 + Math.sin(x / f + ph) * a} `; return `<polygon points="${p}${T},${h}" fill="${col}"/>`; };
    s += wave(wl, 1.500, 9, o.sil2, 0) + [...Array(9)].map((_, i) => `<rect x="${mx - 9 + (i % 3) * 6}" y="${wl + 4 + i * 4}" width="${10 - i}" height="1.400" fill="#fff6d8" opacity="${.7 - i * .06}"/>`).join('');
    const sx = T * .3; s += `<g fill="${o.sil}"><path d="M${sx - 30} ${wl - 2}L${sx + 30} ${wl - 2}L${sx + 22} ${wl + 8}L${sx - 24} ${wl + 8}Z"/><rect x="${sx - 1}" y="${wl - 58}" width="2" height="56"/><rect x="${sx - 17}" y="${wl - 44}" width="1.600" height="42"/><rect x="${sx + 15}" y="${wl - 40}" width="1.600" height="38"/><path d="M${sx + 2} ${wl - 56}Q${sx + 18} ${wl - 40} ${sx + 2} ${wl - 10}ZM${sx - 15} ${wl - 42}Q${sx - 2} ${wl - 30} ${sx - 15} ${wl - 8}ZM${sx + 17} ${wl - 38}Q${sx + 28} ${wl - 26} ${sx + 17} ${wl - 8}Z"/><path d="M${sx} ${wl - 58}l7 2.500-7 2.500z" fill="#e0526f"/></g>`;
    s += wave(wl + h * .1, 2.500, 12, o.sil, 1.200) + wave(wl + h * .2, 3, 15, darken(o.sil, .3), 2.500);
  } else if (o.saga === 'dragon') {
    s += `<circle cx="${T * .76}" cy="${h * .64}" r="34" fill="${o.moon}" opacity=".3"/><circle cx="${T * .76}" cy="${h * .64}" r="22" fill="${o.moon}"/>` + [...Array(4)].map((_, i) => `<rect x="${(i * 53) % T - 10}" y="${h * (.3 + i * .08)}" width="${60 + i * 10}" height="3" rx="1.500" fill="#fff" opacity=".18"/>`).join('');
    s += `<g transform="translate(0 ${h * .68})">${sceneG('mountains', T, h * .32, o.sil, o.sil2, sd)}</g>`;
    s += `<path d="${DRAGON_SIL}" fill="${o.sil}" transform="translate(${T * .12} ${h * .3}) scale(${T * .0055})"/>`;
  }
  return s;
}

/* Paisaje continuo de una saga (modo de serie «Paisaje continuo»): un solo dibujo repartido entre los tomos */
function sagaSpine(o) {
  const { w, h } = o, fa = lighten(o.foil, .38), fb = darken(o.foil, .32);
  const f = `<div style="position:absolute;inset:0;overflow:hidden"><svg width="${o.cont.total}" height="${h}" style="position:absolute;left:${-o.cont.off}px;top:0" viewBox="0 0 ${o.cont.total} ${h}">${sagaScene(o, o.cont.total, h)}</svg></div>` + ttl(o, { l: 3, t: 12, w: w - 6, h: Math.round(h * .4), fx: 1 });
  const num = o.num ? `<span class="num" style="--f:${o.titleInk || o.foil};top:${h - 30}px">${o.num}</span>` : '';
  return `<div class="it"><div class="bk" style="--w:${w}px;--h:${h}px;--b:${o.base};--f:${o.foil};--fa:${fa};--fb:${fb}"><div class="face">${f}${num}</div></div></div>`;
}

function ttl(o, b) {
  const O = { font: o.font || 'serif', wt: o.wt || 700, up: !!o.up, ls: o.ls ?? .04, it: !!o.it, max: o.max || 15 };
  const f = fit(o.title, b.h, b.w, O);
  return `<div class="tbox" style="left:${b.l}px;top:${b.t}px;width:${b.w}px;height:${b.h}px"><div class="tt ${b.fx ? 'fxs' : ''}" style="font-family:${FONT[O.font]};font-weight:${O.wt};${O.it ? 'font-style:italic;' : ''}font-size:${f.fs}px;letter-spacing:${O.ls}em;${O.up ? 'text-transform:uppercase;' : ''}color:${o.titleInk || b.c || o.foil};${b.ts && !o.titleInk ? 'text-shadow:' + b.ts + ';' : o.titleInk ? 'text-shadow:0 0 2px ' + (lum(o.titleInk) > .5 ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.35)') + ';' : ''}transform:translateX(${O.up ? -.1 : -.05}em)">${f.lines.map(l => `<span>${esc(l)}</span>`).join('')}</div></div>`;
}

