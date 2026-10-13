'use strict';
/* Lomos de libro: encaje del título, estilos, ilustraciones y paisajes de saga. */

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

const mo = (k, y, s = 13) => `<svg class="orn fxs" style="top:${y}px" width="${s}" height="${s}" viewBox="0 0 16 16"><path d="${MOTIF[k]}"/></svg>`;

function scene(kind, W, H, c1, c2, seed) {
  const r = rng(seed); let s = '';
  if (kind === 'mountains') {
    let x = 0, p = `0,${H} `; while (x < W + 14) { p += `${x},${H * .62 - r() * H * .3} `; x += 10 + r() * 14; p += `${x},${H * .85 - r() * H * .15} `; x += 6 + r() * 8; } s += `<polygon points="${p}${W},${H}" fill="${c2}"/>`;
    x = 0; p = `0,${H} `; while (x < W + 14) { p += `${x},${H * .78 - r() * H * .22} `; x += 8 + r() * 10; p += `${x},${H * .95} `; x += 5 + r() * 8; } s += `<polygon points="${p}${W},${H}" fill="${c1}"/>`;
  } else if (kind === 'forest') {
    for (let l = 0; l < 2; l++) for (let x = -4 + l * 4; x < W + 6; x += 6 + r() * 4) { const th = H * (.45 - l * .12) + r() * H * .25; s += `<polygon points="${x},${H} ${x + 5},${H - th} ${x + 10},${H}" fill="${l ? c1 : c2}"/>`; }
  } else if (kind === 'castle') {
    s += `<polygon points="0,${H} 0,${H * .7} ${W * .3},${H * .6} ${W * .6},${H * .75} ${W},${H * .62} ${W},${H}" fill="${c2}"/>`;
    const cx = W * .5, bw = Math.min(W * .9, 40); s += `<rect x="${cx - bw / 2}" y="${H * .5}" width="${bw}" height="${H * .5}" fill="${c1}"/>`;
    [-.5, 0, .5].forEach((k, i) => { const tx = cx + k * bw * .8, tw = bw * .26, ty = H * (.28 + (i === 1 ? -.1 : .05)); s += `<rect x="${tx - tw / 2}" y="${ty}" width="${tw}" height="${H - ty}" fill="${c1}"/><polygon points="${tx - tw / 2 - 1},${ty} ${tx},${ty - H * .16} ${tx + tw / 2 + 1},${ty}" fill="${c1}"/>`; });
    s += `<rect x="${cx - 1.5}" y="${H * .8}" width="3" height="${H * .2}" rx="1.5" fill="${c2}" opacity=".6"/>`;
  } else if (kind === 'city') {
    let x = 0; while (x < W) { const bw = 7 + r() * 9, bh = H * (.3 + r() * .55); s += `<rect x="${x}" y="${H - bh}" width="${bw}" height="${bh}" fill="${r() > .5 ? c1 : c2}"/>`; for (let yy = H - bh + 4; yy < H - 4; yy += 6) if (r() > .45) s += `<rect x="${x + 2}" y="${yy}" width="2" height="2" fill="#ffd36a" opacity=".85"/>`; x += bw + 1; }
  }
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;bottom:0;left:0;display:block">${s}</svg>`;
}

function stars(w, h, n, seed, col = '#fff') { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) { const x = 3 + r() * (w - 6), y = 4 + r() * (h - 8), rr = .5 + r() * 1.1; s += `<circle cx="${x}" cy="${y}" r="${rr}" fill="${col}" opacity="${.5 + r() * .5}"/>`; if (r() > .85) s += `<path d="M${x - 3} ${y}H${x + 3}M${x} ${y - 3}V${y + 3}" stroke="${col}" stroke-width=".5" opacity=".8"/>`; } return `<svg width="${w}" height="${h}" style="position:absolute;left:0;top:0">${s}</svg>`; }

const row = (items, label) => `<div class="row">${items.join('')}<div class="tabla"></div><div class="label">${label}</div></div>`;

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

function spine(o) {
  const { w, h } = o, foil = o.foil, fa = lighten(foil, .38), fb = darken(foil, .32), acc = o.accent || darken(o.base, .3), seed = hs(o.title);
  let f = '', numTop = h - 30;
  switch (o.type) {
    case 0: {
      const ribs = [8, 14, Math.round(h * .66), Math.round(h * .66) + 6, h - 20, h - 14].map((y, i) => `<i class="rib" style="top:${y}px;height:${i % 2 ? 2.5 : 4}px"></i>`).join('');
      numTop = Math.round((Math.round(h * .66) + 8.5 + (h - 20)) / 2 - 7.5);
      f = ribs + `<div class="tej" style="left:4px;right:4px;top:22px;height:${Math.round(h * .46)}px"></div>` + ttl(o, { l: 4, t: 22, w: w - 8, h: Math.round(h * .46) }) + (o.num ? '' : mo('diamond', Math.round(h * .66) + 16, 9)); break; }
    case 1: { const m = o.motif || 'leaf'; const ph = o.phase != null ? (y, s) => moonPhase2(o.phase, y, s, foil, o.base) : null;
      numTop = h - 31;
      f = `<i class="frame"></i>` + (ph ? ph(10, 14) : mo(m, 11, Math.min(14, w * .4))) + ttl(o, { l: 8, t: 32, w: w - 16, h: h - 68, fx: 1 }) + (o.num ? '' : ph ? ph(h - 27, 14) : mo(m, h - 27, Math.min(14, w * .4))); break; }
    case 2: { // media piel + papel jaspeado
      const r = rng(seed), top = Math.round(h * .6), bot = h - 9; let wv = '';
      const cols = [o.m1 || lighten(o.base, .45), o.m2 || darken(o.base, .2), o.m3 || '#f3e6cc'];
      for (let i = 0; i < 16; i++) { const y = top + r() * (bot - top), a = 1.500 + r() * 3, ph = r() * 6, fr = 3 + r() * 4; let p = `M-2 ${y}`; for (let x = 0; x <= w + 2; x += 2) p += `L${x} ${y + Math.sin(x / fr + ph) * a}`; wv += `<path d="${p}" stroke="${cols[i % 3]}" stroke-width="${.8 + r() * 2.400}" fill="none" opacity="${.6 + r() * .4}"/>`; }
      numTop = o.numPos === 'top' ? 13 : o.numPos === 'mid' ? Math.round(top + (bot - top) / 2 - 7.5) : top + 6;
      f = `<svg width="${w}" height="${h}" style="position:absolute;inset:0"><rect y="${top}" width="${w}" height="${bot - top}" fill="${o.base}"/>${wv}</svg><div style="position:absolute;left:0;right:0;top:0;height:${top}px;background:${acc};box-shadow:0 1px 2px rgba(0,0,0,.5)"></div><div style="position:absolute;left:0;right:0;top:${bot}px;bottom:0;background:${acc};box-shadow:0 -1px 2px rgba(0,0,0,.5)"></div>` +
        `<i class="band" style="top:${top - 1.500}px;height:1.500px"></i><i class="band" style="top:${bot}px;height:1.500px"></i><i class="band" style="top:7px;height:1.500px"></i>` + ttl(o, { l: 3, t: o.num && o.numPos === 'top' ? 32 : 12, w: w - 6, h: top - (o.num && o.numPos === 'top' ? 38 : 18), fx: 1 }); break; }
    case 3: { // acuarela
      o = { ...o, accent: o.accent || o.block || '#c9a0d0', ink: o.ink || '#2a2030' }; const r = rng(seed); let bl = ''; for (let i = 0; i < 7; i++) { const cx = r() * w, cy = r() * h, rr = 10 + r() * 18, col = [o.accent, o.accent2 || o.accent, lighten(o.accent, .4)][i % 3]; bl += `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="${col}" opacity="${.35 + r() * .3}" filter="url(#wb${seed})"/><circle cx="${cx}" cy="${cy}" r="${rr * .92}" fill="none" stroke="${darken(col, .15)}" stroke-width=".6" opacity=".35" filter="url(#wc${seed})"/>`; }
      numTop = h - 34;
      f = `<svg width="${w}" height="${h}" style="position:absolute;inset:0"><defs><filter id="wb${seed}"><feGaussianBlur stdDeviation="3.500"/></filter><filter id="wc${seed}"><feGaussianBlur stdDeviation=".7"/></filter></defs>${bl}<path d="M${w / 2} ${h - 8}C${w / 2} ${h - 18} ${w / 2 - 3} ${h - 24} ${w / 2} ${h - 30}M${w / 2} ${h - 16}c-5-2-6-6-4-9 3 1 4 5 4 9zM${w / 2} ${h - 22}c5-2 6-6 4-9-3 1-4 5-4 9z" stroke="${o.ink}" stroke-width=".8" fill="none" opacity=".75"/></svg>` + ttl(o, { l: 3, t: 12, w: w - 6, h: h - 12 - 40, c: o.ink }); break; }
    case 4: {
      const sh = Math.round(h * (o.scene === 'castle' || o.scene === 'tree' ? .5 : .36));
      if (o.cont) { numTop = h - 30; f = `<div style="position:absolute;inset:0;overflow:hidden"><svg width="${o.cont.total}" height="${h}" style="position:absolute;left:${-o.cont.off}px;top:0" viewBox="0 0 ${o.cont.total} ${h}">${sagaScene(o, o.cont.total, h)}</svg></div>` + ttl(o, { l: 3, t: 12, w: w - 6, h: Math.round(h * .4), fx: 1 }); }
      else if (FULLSC[o.scene]) f = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,${o.base},${o.accent} 70%,${o.sky2})"></div><svg width="${w}" height="${h}" style="position:absolute;inset:0">${FULLSC[o.scene](o, w, h, seed)}</svg>` + ttl(o, { l: 3, t: 12, w: w - 6, h: Math.round(h * .4), fx: 1 });
      else f = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,${o.base},${o.accent || lighten(o.base, .25)} 70%,${o.sky2 || o.accent || lighten(o.base, .3)})"></div>` + stars(w, h * .5, 5, seed) +
        (o.moon ? `<div style="position:absolute;left:${o.scene === 'castle' || o.scene === 'tree' ? '26%' : '50%'};top:${Math.round(h * (o.scene === 'castle' ? .6 : o.scene === 'tree' ? .47 : .5))}px;width:11px;height:11px;margin-left:-5px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fffbe8,${o.moon});box-shadow:0 0 8px ${o.moon}"></div>` : '') +
        `<svg width="${w}" height="${sh}" viewBox="0 0 ${w} ${sh}" style="position:absolute;bottom:0;left:0">${sceneG(o.scene, w, sh, o.sil, o.sil2, seed)}</svg>` + ttl(o, { l: 3, t: 12, w: w - 6, h: Math.round(h * .42) - 4, fx: 1 });
      break; }
    case 5: {
      const rays = [...Array(7)].map((_, i) => { const a = (-70 + i * 23.3) * Math.PI / 180; return `<path d="M${w / 2} 0L${w / 2 + Math.sin(a) * 40} ${Math.cos(a) * 40}" stroke="${foil}" stroke-width=".8" opacity=".8"/>`; }).join('');
      f = `<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 3px,rgba(255,255,255,.06) 3px 4px)"></div><svg width="${w}" height="34" style="position:absolute;left:0;top:0;z-index:2;overflow:hidden">${rays}<circle cx="${w / 2}" cy="0" r="7" fill="${foil}"/><circle cx="${w / 2}" cy="0" r="10" fill="none" stroke="${foil}" stroke-width=".8"/></svg>` +
        `<div style="position:absolute;left:4px;right:4px;top:38px;bottom:${o.num ? 60 : 42}px;border:1px solid ${foil};border-radius:${Math.min(14, w / 2 - 2)}px;box-shadow:inset 0 0 0 2px ${o.base},inset 0 0 0 3px color-mix(in srgb,${foil} 60%,transparent);z-index:2"></div>` + ttl(o, { l: 9, t: 42, w: w - 18, h: h - 42 - (o.num ? 64 : 46), fx: 1 }) +
        `<svg width="${w}" height="30" style="position:absolute;left:0;bottom:4px;z-index:2"><path d="M4 8L${w / 2} 20 ${w - 4} 8M4 15L${w / 2} 27 ${w - 4} 15" fill="none" stroke="${foil}" stroke-width="1.200"/></svg>`; numTop = h - 57; break; }
    case 6: { // grimorio: cantoneras de metal y cierre
      const cy = Math.round(h * .7), cn = (x, y, sx, sy) => `<path d="M${x} ${y}h${sx * 9}l${-sx * 9} ${sy * 9}z" fill="url(#gm${seed})" stroke="${darken(foil, .5)}" stroke-width=".5"/>`;
      f = `<svg width="${w}" height="${h}" style="position:absolute;inset:0;z-index:3"><defs><linearGradient id="gm${seed}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(foil, .5)}"/><stop offset=".5" stop-color="${foil}"/><stop offset="1" stop-color="${darken(foil, .45)}"/></linearGradient></defs>
        <rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="none" stroke="${darken(o.base, .45)}" stroke-width="1"/><rect x="5" y="5" width="${w - 10}" height="${h - 10}" fill="none" stroke="${lighten(o.base, .15)}" stroke-width=".5" opacity=".6"/>
        ${cn(0, 0, 1, 1)}${cn(w, 0, -1, 1)}${cn(0, h, 1, -1)}${cn(w, h, -1, -1)}
        <rect x="0" y="${cy - 3}" width="${w}" height="17" fill="${darken(o.base, .35)}" stroke="${darken(o.base, .6)}" stroke-width=".6"/><path d="M0 ${cy - 1}H${w}M0 ${cy + 12}H${w}" stroke="${lighten(o.base, .1)}" stroke-width=".4" stroke-dasharray="1.500 1.500"/>
        <g transform="translate(${w / 2} ${cy + 5.500}) scale(1.450) translate(${-w / 2} ${-(cy + 5.500)})">${gemSvg(w / 2, cy + 5.500, o.gem || '#2a8a6a', seed)}</g></svg>` +
        ttl(o, { l: 6, t: 16, w: w - 12, h: cy - 34, fx: 1 }); numTop = cy + 24; break; }
    case 7: { const id = 'sc' + seed, ac = o.accent || lighten(o.base, .3);
      f = `<svg width="${w}" height="${h}" style="position:absolute;inset:0"><defs><pattern id="${id}" width="12" height="8" patternUnits="userSpaceOnUse"><g fill="none" stroke="${ac}" stroke-width=".8" opacity=".8"><path d="M0 8a6 6 0 0 1 12 0M-6 4a6 6 0 0 1 12 0M6 4a6 6 0 0 1 12 0"/><path d="M2.500 8a3.500 3.500 0 0 1 7 0M-3.500 4a3.500 3.500 0 0 1 7 0M8.500 4a3.500 3.500 0 0 1 7 0" opacity=".6"/></g></pattern></defs><rect width="${w}" height="${h}" fill="url(#${id})"/></svg>` +
        `<i class="band" style="top:7px;height:2px"></i><i class="band" style="bottom:7px;height:2px"></i><div class="lab" style="top:${Math.round(h * .18)}px;height:${Math.round(h * .56)}px;background:${o.base};box-shadow:inset 0 0 0 1px ${foil},inset 0 0 0 3px ${o.base},inset 0 0 0 4px ${foil}99,0 1px 3px rgba(0,0,0,.6)"></div>` + ttl(o, { l: 7, t: Math.round(h * .18) + 3, w: w - 14, h: Math.round(h * .56) - 6, fx: 1 }) + (o.num ? '' : mo('diamond', h - 26, 10)); numTop = h - 32; break; }
    case 8:
      f = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,${darken(o.base, .3)},${o.base} 60%,${lighten(o.base, .12)})"></div>` + stars(w, h, 14, seed, foil) + mo('moon', 8, Math.min(15, w * .45)) + ttl(o, { l: 3, t: 30, w: w - 6, h: h - 30 - 28, fx: 1 }) + (o.num ? '' : mo('star', h - 22, 10)); numTop = h - 28; break;
    case 9: { // enredadera de extremo a extremo
      const lf = o.leaf, bl = o.bloom; let v = '';
      [7, w - 7].forEach((x0, side) => { let p = `M${x0} ${h + 2}`; for (let y = h + 2; y >= -2; y -= 3) p += `L${x0 + Math.sin(y / 7 + side * 2) * 1.200} ${y}`; v += `<path d="${p}" stroke="${lf}" stroke-width=".9" fill="none"/>`;
        for (let y = h - 4, k = 0; y > 2; y -= 8, k++) { const xx = x0 + Math.sin(y / 7 + side * 2) * 1.200; v += leafP(xx, y, k % 2 ? -62 : -118, 5.500, lf); if (k % 3 === 1) v += flowerG(xx, y - 4, 2.600, bl); } });
      f = `<svg width="${w}" height="${h}" style="position:absolute;inset:0;z-index:2">${v}</svg>` + ttl(o, { l: 11, t: 10, w: w - 22, h: h - 20 - (o.num ? 24 : 0), c: o.ink || '#24361f', ts: '0 0 2px ' + o.base + ',0 0 4px ' + o.base + ',0 0 6px ' + o.base }); numTop = h - 30; break; }
    case 10: { // panel tecnológico
      const L = o.light || '#25f4ee', r = rng(seed); let seams = '', riv = '';
      [Math.round(h * .2), Math.round(h * .78)].forEach(y => seams += `<path d="M0 ${y}H${w}" stroke="#05070b" stroke-width="1"/><path d="M0 ${y + 1}H${w}" stroke="#fff" stroke-width=".5" opacity=".18"/>`);
      [[4, 5], [w - 4, 5], [4, h - 5], [w - 4, h - 5], [4, h * .2 + 5], [w - 4, h * .2 + 5], [4, h * .78 - 5], [w - 4, h * .78 - 5]].forEach(([x, y]) => riv += `<circle cx="${x}" cy="${y}" r="1.200" fill="#9aa1ad" stroke="#15171c" stroke-width=".4"/>`);
      const code = (o.code || 'X-' + (seed % 90 + 10));
      f = `<div style="position:absolute;inset:0;background:linear-gradient(90deg,${darken(o.base, .3)},${lighten(o.base, .12)} 30%,${o.base} 60%,${darken(o.base, .35)})"></div>${o.holo ? `<div style="position:absolute;inset:0;background:linear-gradient(${160 + seed % 30}deg,#c45cff,#ff2fb8 35%,#ffd400 60%,#c45cff 85%);mix-blend-mode:color;opacity:.85"></div><div style="position:absolute;inset:0;background:repeating-linear-gradient(118deg,rgba(255,255,255,0) 0 8px,rgba(255,255,255,.45) 10px,rgba(255,255,255,0) 13px 22px),repeating-linear-gradient(0deg,rgba(255,255,255,.08) 0 1px,transparent 1px 3px);mix-blend-mode:screen"></div>` : ''}<svg width="${w}" height="${h}" style="position:absolute;inset:0;z-index:2">${seams}${riv}
        <rect x="7" y="9" width="${w - 14}" height="${h * .2 - 16}" rx="1.500" fill="#06080c" stroke="#3a3f48" stroke-width=".6"/><text x="${w / 2}" y="${9 + (h * .2 - 16) / 2 + 3}" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="7" fill="${L}" style="filter:drop-shadow(0 0 2px ${L})">${code}</text>
        <rect x="${w - 7}" y="${h * .2 + 8}" width="2.500" height="${h * .58 - 16}" rx="1.200" fill="${L}" style="filter:drop-shadow(0 0 3px ${L})"/>
        <g transform="translate(0 ${h * .78 + 6})">${[0, 1, 2, 3, 4].map(i => `<path d="M${-6 + i * 9} 14L${i * 9} 0H${4 + i * 9}L${-2 + i * 9} 14Z" fill="${o.warn || '#ffd400'}" opacity=".9"/>`).join('')}</g><rect x="0" y="${h * .78 + 6}" width="${w}" height="14" fill="none"/></svg>` +
        ttl(o, { l: 4, t: Math.round(h * .2) + 8, w: w - 14, h: Math.round(h * .58) - 16, c: o.ink || '#e8edf3', ts: '0 1px 0 rgba(0,0,0,.6)' }); numTop = h * .78 - 22; break; }
  }
  const num = o.num ? `<span class="num" style="--f:${foil};top:${numTop}px${o.numPos === 'mid' ? ';background:' + o.accent : ''}">${o.num}</span>` : '';
  return `<div class="it"><div class="bk ${o.lean ? 'lean' : ''}" style="--w:${w}px;--h:${h}px;--b:${o.base};--f:${foil};--fa:${fa};--fb:${fb};--ac:${acc}"><div class="face ${o.tex || ''}">${f}${num}</div></div></div>`;
}

function ttl(o, b) {
  const O = { font: o.font || 'serif', wt: o.wt || 700, up: !!o.up, ls: o.ls ?? .04, it: !!o.it, max: o.max || 15 };
  const f = fit(o.title, b.h, b.w, O);
  return `<div class="tbox" style="left:${b.l}px;top:${b.t}px;width:${b.w}px;height:${b.h}px"><div class="tt ${b.fx ? 'fxs' : ''}" style="font-family:${FONT[O.font]};font-weight:${O.wt};${O.it ? 'font-style:italic;' : ''}font-size:${f.fs}px;letter-spacing:${O.ls}em;${O.up ? 'text-transform:uppercase;' : ''}color:${b.c || o.foil};${b.ts ? 'text-shadow:' + b.ts + ';' : ''}transform:translateX(${O.up ? -.1 : -.05}em)">${f.lines.map(l => `<span>${esc(l)}</span>`).join('')}</div></div>`;
}

function moonPhase2(f, y, s, col, bg) { const r = s / 2 - 1, cx = s / 2, cy = s / 2, rx = Math.abs(1 - 2 * f) * r;
  const sh = f >= .999 ? '' : f <= .001 ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}" opacity=".9"/>` : `<path d="M${cx} ${cy - r}A${r} ${r} 0 0 0 ${cx} ${cy + r}A${rx} ${r} 0 0 ${f < .5 ? 0 : 1} ${cx} ${cy - r}Z" fill="${bg}" opacity=".92"/>`;
  return `<svg class="orn fxs" style="top:${y}px" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>${sh}<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width=".8"/></svg>`; }

function gemSvg(x, y, col, seed) { const g = 'gem' + seed;
  return `<defs><radialGradient id="${g}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${lighten(col, .6)}"/><stop offset=".45" stop-color="${col}"/><stop offset="1" stop-color="${darken(col, .55)}"/></radialGradient></defs>
  <ellipse cx="${x}" cy="${y}" rx="7.200" ry="8.600" fill="url(#gm${seed})" stroke="${darken(col, .7)}" stroke-width=".5"/><path d="M${x} ${y - 7}L${x + 5} ${y - 3}L${x + 5} ${y + 3}L${x} ${y + 7}L${x - 5} ${y + 3}L${x - 5} ${y - 3}Z" fill="url(#${g})" stroke="${darken(col, .6)}" stroke-width=".4"/>
  <path d="M${x} ${y - 7}L${x} ${y - 2.500}M${x + 5} ${y - 3}L${x + 2.500} ${y - 1.500}M${x - 5} ${y - 3}L${x - 2.500} ${y - 1.500}M${x - 2.500} ${y - 1.500}H${x + 2.500}L${x + 2.500} ${y + 2}L${x} ${y + 3.500}L${x - 2.500} ${y + 2}Z" fill="none" stroke="${lighten(col, .4)}" stroke-width=".4" opacity=".8"/><path d="M${x - 3} ${y - 4}l2 -1.500" stroke="#fff" stroke-width=".9" opacity=".8"/>`; }

const FULLSC = {
  deer: (o, w, h, sd) => { let s = stars(w, h * .5, 5, sd).replace(/<\/?svg[^>]*>/g, ''); const m = `<circle cx="${w * .5}" cy="${h * .5}" r="9" fill="${o.moon}" opacity=".35"/><circle cx="${w * .5}" cy="${h * .5}" r="5.500" fill="#fff8dc"/>`;
    let pines = ''; [[2, .66], [w - 3, .62], [w * .18, .74], [w * .84, .72]].forEach(([x, yy]) => { for (let k = 0; k < 3; k++) pines += `<polygon points="${x - 4 + k},${h * yy + k * 6 + 8} ${x},${h * yy + k * 6} ${x + 4 - k},${h * yy + k * 6 + 8}" fill="${o.sil}"/>`; pines += `<rect x="${x - .6}" y="${h * yy + 20}" width="1.200" height="${h}" fill="${o.sil}"/>`; });
    const sc = w / 30, dx = w * .5 - 10 * sc, dy = h * .8 - 21 * sc;
    const deer = `<g transform="translate(${dx} ${dy}) scale(${sc})" fill="${o.sil}" stroke="${o.sil}"><ellipse cx="10" cy="12" rx="6" ry="3" stroke="none"/><polygon points="13.500,11 15.500,5 17.500,5.500 16,12" stroke="none"/><ellipse cx="17.500" cy="4.800" rx="2.300" ry="1.400" stroke="none"/><path d="M16.800 3.800L15 -1.500M15.600 1L13.400 -.2M17.800 3.800L19.300 -1.500M18.800 1L20.800 0" fill="none" stroke-width=".7"/><path d="M5.500 14V21M7.200 14V21M13 14V21M14.700 14V21" fill="none" stroke-width=".9"/></g>`;
    return s + m + `<path d="M0 ${h}V${h * .82}Q${w * .5} ${h * .74} ${w} ${h * .84}V${h}Z" fill="${o.sil2}"/>` + pines + deer + `<path d="M0 ${h}V${h * .9}Q${w * .6} ${h * .84} ${w} ${h * .9}V${h}Z" fill="${o.sil}"/>`; },
  lighthouse: (o, w, h, sd) => { const lx = w * .68, by = h * .7, th = h * .2, ly = by - th - 6;
    return stars(w, h * .45, 5, sd).replace(/<\/?svg[^>]*>/g, '') + `<polygon points="${lx},${ly + 2} -2,${ly - 14} -2,${ly + 18}" fill="#fff3b0" opacity=".35"/><rect x="0" y="${h * .84}" width="${w}" height="${h * .16}" fill="${o.sil2}"/><path d="M0 ${h * .87}q4 -2 8 0t8 0 8 0 8 0 8 0 8 0M0 ${h * .92}q4 -2 8 0t8 0 8 0 8 0 8 0 8 0" stroke="#fff" stroke-width=".5" fill="none" opacity=".35"/>
      <path d="M${w * .3} ${h}L${w * .46} ${by + 4}L${w * .56} ${by}L${w} ${by - 2}V${h}Z" fill="${o.sil}"/><path d="M${lx - 4.500} ${by}L${lx - 3} ${by - th}H${lx + 3}L${lx + 4.500} ${by}Z" fill="${lighten(o.sil, .75)}"/><path d="M${lx - 4.100} ${by - th * .3}H${lx + 4.100}V${by - th * .3 - 3}H${lx - 3.800}ZM${lx - 3.600} ${by - th * .7}H${lx + 3.600}V${by - th * .7 - 3}H${lx - 3.400}Z" fill="${o.sil}"/>
      <rect x="${lx - 3.500}" y="${ly}" width="7" height="6" fill="#ffe08a"/><circle cx="${lx}" cy="${ly + 3}" r="7" fill="#ffe08a" opacity=".35"/><path d="M${lx - 4.500} ${ly}L${lx} ${ly - 5}L${lx + 4.500} ${ly}Z" fill="${o.sil}"/><rect x="${lx - 5}" y="${ly + 6}" width="10" height="1.500" fill="${o.sil}"/>`; },
  aurora: (o, w, h, sd) => { const r = rng(sd), rib = (yb, yt, ph, op) => { let bot = '', top = ''; for (let x = -2; x <= w + 2; x += 2) { bot += `${x},${h * yb + Math.sin(x / 9 + ph) * h * .03} `; } for (let x = w + 2; x >= -2; x -= 2) top += `${x},${h * yt + Math.sin(x / 7 + ph * 1.700) * h * .05} `; return `<polygon points="${bot}${top}" fill="url(#au${sd})" opacity="${op}"/>`; };
    let streak = ''; for (let x = 1; x < w; x += 2.200) streak += `<rect x="${x}" y="${h * .22}" width=".8" height="${h * .5}" fill="#eafff5" opacity="${.08 + r() * .14}"/>`;
    return `<defs><linearGradient id="au${sd}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d07aff" stop-opacity="0"/><stop offset=".35" stop-color="#b07aff" stop-opacity=".35"/><stop offset=".7" stop-color="#5affb4" stop-opacity=".75"/><stop offset="1" stop-color="#b8ffdd" stop-opacity=".95"/></linearGradient><filter id="ab${sd}"><feGaussianBlur stdDeviation=".9"/></filter><clipPath id="ac${sd}">${'<rect width="' + w + '" height="' + h + '"/>'}</clipPath></defs>` + stars(w, h * .7, 9, sd).replace(/<\/?svg[^>]*>/g, '') +
      `<g filter="url(#ab${sd})">${rib(.62, .26, 0, .9)}${rib(.7, .4, 2.300, .65)}<g opacity=".8">${streak}</g></g>` +
      `<g transform="translate(0 ${h * .68})">${sceneG('mountains', w, h * .32, o.sil, o.sil2, sd)}</g>`; },
  lanterns: (o, w, h, sd) => { const r = rng(sd); let L = ''; for (let i = 0; i < 9; i++) { const x = 4 + r() * (w - 8), y = h * (.44 + r() * .32), s = .6 + (y / h - .44) * 1.300; L += `<circle cx="${x}" cy="${y}" r="${5 * s}" fill="#ffb84d" opacity=".25"/><rect x="${x - 1.600 * s}" y="${y - 2.200 * s}" width="${3.200 * s}" height="${4.400 * s}" rx="${1.200 * s}" fill="#ffcf6a"/><rect x="${x - 1.200 * s}" y="${y + 1.400 * s}" width="${2.400 * s}" height="${.7 * s}" fill="#e0782a"/>`; }
    let refl = ''; for (let i = 0; i < 6; i++) refl += `<rect x="${3 + r() * (w - 8)}" y="${h * (.86 + r() * .1)}" width="${2 + r() * 4}" height="1" fill="#ffcf6a" opacity=".6"/>`;
    return stars(w, h * .4, 4, sd).replace(/<\/?svg[^>]*>/g, '') + `<path d="M0 ${h * .84}Q${w * .3} ${h * .76} ${w * .55} ${h * .82}T${w} ${h * .8}V${h * .84}Z" fill="${o.sil}"/><rect x="0" y="${h * .84}" width="${w}" height="${h * .16}" fill="${o.sil2}"/>` + L + refl; }
};

const SF = {
  foil: (o, w, h, sd) => `<div style="position:absolute;inset:0;background:linear-gradient(${150 + sd % 40}deg,#3a1a6a,${o.c1} 25%,#ff7ad0 45%,#ffd77a 62%,#7ae0ff 80%,#5a2aa0)"></div><div style="position:absolute;inset:0;background:repeating-linear-gradient(120deg,rgba(255,255,255,0) 0 10px,rgba(255,255,255,.4) 12px,rgba(255,255,255,0) 15px 26px);mix-blend-mode:soft-light"></div><div style="position:absolute;left:5px;right:5px;top:10px;height:1px;background:#fff;opacity:.8"></div><div style="position:absolute;left:5px;right:5px;bottom:10px;height:1px;background:#fff;opacity:.8"></div>` + ttl({ ...o, foil: '#fff' }, { l: 4, t: 18, w: w - 8, h: h - 36, c: '#fff', ts: '0 0 6px rgba(80,0,120,.6)' }),
  hud: (o, w, h, sd) => { const c = o.c1 || '${o.c1}'; return `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#120a22,#06040c);"></div><div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px)"></div><svg width="${w}" height="${h}" style="position:absolute;inset:0;z-index:2"><path d="M5 14V6H13M${w - 5} 14V6H${w - 13}M5 ${h - 34}V${h - 26}H13M${w - 5} ${h - 34}V${h - 26}H${w - 13}" fill="none" stroke="${c}" stroke-width="1.300"/><rect x="6" y="${h - 18}" width="${w - 12}" height="4" rx="2" fill="none" stroke="${c}" stroke-width=".8"/><rect x="7" y="${h - 17}" width="${(w - 14) * .62}" height="2" rx="1" fill="${o.c2 || '${o.c3}'}"/><circle cx="${w / 2}" cy="${h - 8}" r="1.300" fill="${c}"/></svg>` + ttl({ ...o, foil: '#fff' }, { l: 5, t: 18, w: w - 10, h: h - 56, c: lighten(c, .6), ts: `0 0 4px ${c},0 0 10px ${c}` }); },
  synth: (o, w, h, sd) => { let g = ''; for (let i = 0; i < 6; i++) { const y = h * .78 + i * i * 1.100 + i * 2; g += `<path d="M0 ${y}H${w}" stroke="${o.c2}" stroke-width=".7" opacity=".9"/>`; } for (let i = -3; i <= 3; i++) g += `<path d="M${w / 2 + i * 2} ${h * .78}L${w / 2 + i * 14} ${h}" stroke="${o.c2}" stroke-width=".7" opacity=".9"/>`;
    let sun = ''; for (let i = 0; i < 4; i++) sun += `<rect x="0" y="${h * .66 + i * 3.200}" width="${w}" height="${1 + i * .6}" fill="#2a0a3a"/>`;
    return `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#120628,#4a0f5a 50%,#ff5a8a 78%,#2a0a3a 78%)"></div><svg width="${w}" height="${h}" style="position:absolute;inset:0"><defs><linearGradient id="sn${sd}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.c3}"/><stop offset="1" stop-color="${o.c2}"/></linearGradient><clipPath id="sc${sd}"><rect width="${w}" height="${h * .78}"/></clipPath></defs><circle cx="${w / 2}" cy="${h * .74}" r="${w * .38}" fill="url(#sn${sd})" clip-path="url(#sc${sd})"/>${sun}${g}</svg>` + ttl({ ...o, foil: '#fff' }, { l: 4, t: 10, w: w - 8, h: h * .5, c: '#fff', ts: '0 0 6px ${o.c2}' }); },
  orbit: (o, w, h, sd) => `<div style="position:absolute;inset:0;background:radial-gradient(120% 50% at 50% 100%,#3a1a6a,#0a0618 60%)"></div>${stars(w, h * .7, 12, sd)}<svg width="${w}" height="${h}" style="position:absolute;inset:0"><defs><radialGradient id="pl${sd}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffd77a"/><stop offset=".5" stop-color="#ff7a5a"/><stop offset="1" stop-color="#5a1a4a"/></radialGradient></defs><circle cx="${w / 2}" cy="${h + w * .3}" r="${w * .8}" fill="url(#pl${sd})"/><ellipse cx="${w / 2}" cy="${h * .8}" rx="${w * .9}" ry="5" fill="none" stroke="${o.c1}" stroke-width="1" opacity=".9"/><circle cx="${w * .78}" cy="${h * .22}" r="3" fill="#7ae0ff"/><ellipse cx="${w * .78}" cy="${h * .22}" rx="7" ry="1.800" fill="none" stroke="#7ae0ff" stroke-width=".6"/></svg>` + ttl({ ...o, foil: '#fff' }, { l: 4, t: 26, w: w - 8, h: h * .5, c: '#f4eaff', ts: '0 1px 2px #000' }),
  poly: (o, w, h, sd) => { const r = rng(sd); let pts = []; for (let y = -10; y <= h + 10; y += 14) for (let x = -6; x <= w + 6; x += 12) pts.push([x + (r() - .5) * 8, y + (r() - .5) * 8]); let s = ''; const cols = Math.ceil((w + 12) / 12) + 1;
    for (let i = 0; i < pts.length - cols - 1; i++) { if ((i + 1) % cols === 0) continue; const a = pts[i], b = pts[i + 1], c = pts[i + cols], d = pts[i + cols + 1], f1 = `rgba(${150 + r() * 80 | 0},${60 + r() * 60 | 0},${200 + r() * 55 | 0},${.15 + r() * .35})`; s += `<polygon points="${a} ${b} ${c}" fill="${f1}" stroke="${o.c1}" stroke-width=".4"/><polygon points="${b} ${d} ${c}" fill="rgba(20,10,40,.4)" stroke="${o.c1}" stroke-width=".4"/>`; }
    return `<div style="position:absolute;inset:0;background:#120a24"></div><svg width="${w}" height="${h}" style="position:absolute;inset:0">${s}</svg><div style="position:absolute;left:4px;right:4px;top:${h * .2}px;bottom:${h * .2}px;background:rgba(10,6,20,.82);border:1px solid ${o.c3}"></div>` + ttl({ ...o, foil: '#fff' }, { l: 6, t: h * .2 + 4, w: w - 12, h: h * .6 - 8, c: '${o.c3}' }); },
  glass: (o, w, h, sd) => `<div style="position:absolute;inset:0;background:radial-gradient(60% 30% at 30% 25%,${o.c2},transparent 70%),radial-gradient(70% 35% at 70% 70%,${o.c1},transparent 70%),radial-gradient(50% 25% at 40% 90%,${o.c3},transparent 70%),#1a1030;filter:blur(3px);transform:scale(1.1)"></div><div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.35),rgba(255,255,255,.08) 30%,rgba(255,255,255,0) 60%,rgba(255,255,255,.15));box-shadow:inset 0 0 0 1px rgba(255,255,255,.45)"></div>` + ttl({ ...o, foil: '#fff' }, { l: 4, t: 14, w: w - 8, h: h - 28, c: '#fff', ts: '0 1px 3px rgba(0,0,0,.5)' }),
  label: (o, w, h, sd) => { const r = rng(sd); let bc = ''; for (let x = 6; x < w - 6; x += 1.500 + r() * 1.800) bc += `<rect x="${x}" y="${h - 26}" width="${r() > .5 ? 1.200 : .6}" height="12" fill="#14101e"/>`;
    return `<div style="position:absolute;inset:0;background:#ece9f2"></div><div style="position:absolute;left:0;right:0;top:0;height:${h * .2}px;background:${o.c1 || '${o.c1}'}"></div><div style="position:absolute;left:0;right:0;top:${h * .2}px;height:3px;background:${o.c3}"></div><svg width="${w}" height="${h}" style="position:absolute;inset:0">${bc}<text x="${w / 2}" y="${h - 8}" text-anchor="middle" font-family="Poppins" font-size="5" font-weight="700" fill="#14101e" letter-spacing=".5">SF-${sd % 900 + 100}</text><text x="${w / 2}" y="${h * .2 - 6}" text-anchor="middle" font-family="'Noto Sans CJK JP'" font-size="9" font-weight="700" fill="#fff">本</text></svg>` + ttl({ ...o, foil: '#14101e' }, { l: 4, t: h * .2 + 8, w: w - 8, h: h * .8 - 44, c: '#14101e' }); },
  void: (o, w, h, sd) => `<div style="position:absolute;inset:0;background:#08060f"></div><div style="position:absolute;left:50%;top:${h * .62}px;width:${w * .8}px;height:${w * .8}px;margin:${-w * .4}px 0 0 ${-w * .4}px;border-radius:50%;background:#000;box-shadow:0 0 0 1.500px #ffd77a,0 0 10px 3px #ff7a5a,0 0 22px 6px rgba(196,92,255,.6)"></div><div style="position:absolute;left:-2px;right:-2px;top:${h * .62 - 1.500}px;height:3px;background:linear-gradient(90deg,transparent,#ffd77a,#fff,#ffd77a,transparent);opacity:.9"></div>` + ttl({ ...o, foil: '#fff' }, { l: 4, t: 12, w: w - 8, h: h * .62 - w * .4 - 22, c: '#efe6ff' })
};
