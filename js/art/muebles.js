'use strict';
/* Remates superiores de cada mueble (gótico, rococó, chip…). */

const sv = (h, inner, defs = '') => `<svg class="crown" viewBox="0 0 358 ${h}" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${inner}</svg>`;

function crownAcademia(name) {
  const defs = `${G.lin('aw', [[0, '#35604d'], [.5, '#1d3b30'], [1, '#0d1f18']], 0, 1)}${G.lin('ab', [[0, '#f8e3a0'], [.5, '#d9b25f'], [1, '#8a6420']], 0, 1)}`;
  const path = 'M0 110V54Q0 46 8 46H24A155 56 0 0 1 334 46H350Q358 46 358 54V110Z';
  const inner = `<path d="${path}" fill="url(#aw)" stroke="#06100c" stroke-width="1.200"/><path d="M6 110V56Q6 52 11 52H30A149 50 0 0 1 328 52H347Q352 52 352 56V110" fill="none" stroke="url(#ab)" stroke-width="1.800"/><path d="M13 110V58H34A142 44 0 0 1 324 58H345V110" fill="none" stroke="url(#ab)" stroke-width=".6" opacity=".7"/>
  <path d="M168 6h22l5 16h-32z" fill="url(#ab)" stroke="#6a4a14" stroke-width=".6"/><path d="M172 10h14l3 10h-20z" fill="none" stroke="#6a4a14" stroke-width=".5" opacity=".7"/>
  <g fill="url(#ab)" opacity=".9"><circle cx="30" cy="62" r="3"/><circle cx="328" cy="62" r="3"/></g>
  <rect x="104" y="68" width="150" height="30" rx="3" fill="#0f2119" stroke="url(#ab)" stroke-width="1.200"/><path d="M104 68h150" stroke="#fff" opacity=".1"/>
  <g fill="none" stroke="url(#ab)" stroke-width="1"><path d="M40 84c10-10 22-6 28 0-8 4-18 8-28 0zM318 84c-10-10-22-6-28 0 8 4 18 8 28 0z"/><path d="M76 84h22M260 84h-22" opacity=".7"/></g>`;
  return `<div class="crownw">${sv(110, inner, defs)}<div class="plaq" style="top:77px;color:#f1d68f;font:600 12px 'GFS Baskerville',serif;letter-spacing:.2em;text-transform:uppercase;text-shadow:0 0 6px rgba(255,200,100,.4)">${name}</div></div>`;
}

function crownModern(name) {
  const inner = `<path d="M0 54V12Q0 0 12 0H346Q358 0 358 12V54Z" fill="#fff" stroke="#d4d0c8" stroke-width="1"/><rect x="0" y="48" width="358" height="6" fill="#ece9e3"/><rect x="14" y="14" width="330" height="1" fill="#22201d" opacity=".12"/>`;
  return `<div class="crownw">${sv(54, inner)}<div class="plaq" style="top:21px;color:#22201d;font:600 11px 'Poppins',sans-serif;letter-spacing:.34em;text-transform:uppercase">${name}</div></div>`;
}

function crownRomance(name) {
  const n = 13, ww = 358 / n; let d = 'M0 10H358V46'; for (let i = 0; i < n; i++) d += `a${ww / 2} ${ww / 2} 0 0 1 ${-ww} 0`; d += 'Z';
  const defs = `${G.lin('rp', [[0, '#fbc9d6'], [1, '#e08aa4']], 0, 1)}${G.lin('rg', [[0, '#fff3d6'], [1, '#d9b25f']], 0, 1)}`;
  let dots = ''; for (let i = 0; i < n; i++) dots += `<circle cx="${358 - ww / 2 - i * ww}" cy="${46 + ww / 2 - 5}" r="2" fill="url(#rg)"/>`;
  const heart = x => `<g transform="translate(${x} 28) scale(.55)"><path d="M0 8C-14 -4 -9 -14 0 -6 9 -14 14 -4 0 8z" fill="url(#rg)" stroke="#a8782a" stroke-width=".8"/></g>`;
  const inner = `<rect x="-6" y="0" width="370" height="10" rx="4" fill="url(#rp)" stroke="#c9728f" stroke-width=".6"/><path d="${d}" fill="url(#rp)" stroke="#c9728f" stroke-width=".8"/><path d="M0 14H358" stroke="#fff" stroke-width="1.500" opacity=".7"/>${dots}${heart(92)}${heart(266)}`;
  return `<div class="crownw">${sv(66, inner, defs)}<div class="plaq" style="top:22px;color:#8a3a52;font:700 11px 'GFS Baskerville',serif;letter-spacing:.24em;text-transform:uppercase;text-shadow:0 1px 0 rgba(255,255,255,.7)">${name}</div></div>`;
}

function archQ(x0, x1, ys, A, base, inset = 0) { const xm = (x0 + x1) / 2, a = x0 + inset, b = x1 - inset, ap = A - inset * 1.1; return `M${a} ${base}V${ys}C${a} ${ys - ap * .42} ${xm - 8} ${ys - ap * .8} ${xm} ${ys - ap}C${xm + 8} ${ys - ap * .8} ${b} ${ys - ap * .42} ${b} ${ys}V${base}`; }

function crownGothic2(name) {
  const defs = `${G.lin('gw', [[0, '#94684a'], [.5, '#62402a'], [1, '#3e2617']], 0, 1)}${G.lin('gh', [[0, '#d2a47c'], [1, '#8a5e3c']], 0, 1)}${G.lin('gb', [[0, '#120a06'], [.55, '#241710'], [1, '#2a1c13']], 0, 1)}
   <pattern id="gr" width="7" height="160" patternUnits="userSpaceOnUse"><path d="M2 0V160M5 0V160" stroke="#000" stroke-width=".4" opacity=".09"/></pattern>`;
  const W = 'url(#gw)', HL = 'url(#gh)', D = '#140b06', E = '#1c0f07';
  const pin = x => `<rect x="${x}" y="96" width="26" height="104" fill="${W}" stroke="${E}"/><rect x="${x}" y="96" width="26" height="104" fill="url(#gr)"/><path d="M${x + 2} 96L${x + 13} 26L${x + 24} 96Z" fill="${W}" stroke="${E}"/>${[0, 1, 2, 3].map(k => `<path d="M${x + 4 + k * 2.200} ${86 - k * 15}l-4 -3 5 -2z M${x + 22 - k * 2.200} ${86 - k * 15}l4 -3 -5 -2z" fill="${W}" stroke="${E}" stroke-width=".6"/>`).join('')}<path d="M${x + 13} 26v-9" stroke="#62402a" stroke-width="2.400"/><circle cx="${x + 13}" cy="15" r="3.200" fill="${W}" stroke="${E}" stroke-width=".8"/><rect x="${x - 2}" y="92" width="30" height="7" rx="1.500" fill="${HL}" stroke="${E}" stroke-width=".8"/><path d="M${x + 8} 92L${x + 13} 48L${x + 18} 92" fill="none" stroke="${HL}" stroke-width=".8"/><rect x="${x + 6}" y="108" width="14" height="80" rx="7" fill="none" stroke="${HL}" stroke-width=".8" opacity=".8"/>`;
  const gable = 'M26 200V112C26 66 112 38 179 6C246 38 332 66 332 112V200Z';
  const rose = (cx, cy, R) => { let s = `<circle cx="${cx}" cy="${cy}" r="${R + 5}" fill="${W}" stroke="${E}"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="${D}"/>`;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += `<path d="M${cx + Math.cos(a) * R * .22} ${cy + Math.sin(a) * R * .22}L${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R}" stroke="${W}" stroke-width="2.600"/>`; }
    for (let i = 0; i < 8; i++) { const a = (i + .5) * Math.PI / 4; s += `<circle cx="${cx + Math.cos(a) * R * .62}" cy="${cy + Math.sin(a) * R * .62}" r="${R * .27}" fill="none" stroke="${W}" stroke-width="2.400"/>`; }
    return s + `<circle cx="${cx}" cy="${cy}" r="${R * .24}" fill="${W}" stroke="${HL}" stroke-width=".8"/><circle cx="${cx}" cy="${cy}" r="${R * .1}" fill="${HL}"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${W}" stroke-width="3.500"/><circle cx="${cx}" cy="${cy}" r="${R + 2.500}" fill="none" stroke="${HL}" stroke-width=".9"/>`; };
  const quat = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="${W}" stroke="${E}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${D}"/>${[[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => `<circle cx="${cx + dx * r * .45}" cy="${cy + dy * r * .45}" r="${r * .45}" fill="none" stroke="${W}" stroke-width="2.400"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="${r * .16}" fill="${W}"/><circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="none" stroke="${HL}" stroke-width=".8"/>`;
  const bay = (x0, x1) => `<path d="${archQ(x0, x1, 178, 50, 200)}Z" fill="url(#gb)"/><path d="${archQ(x0, x1, 178, 50, 200)}" fill="none" stroke="${HL}" stroke-width="2"/><path d="${archQ(x0, x1, 178, 50, 200, 5)}" fill="none" stroke="${E}" stroke-width=".9"/><path d="${archQ(x0, x1, 178, 50, 200, 8)}" fill="none" stroke="${HL}" stroke-width=".6" opacity=".55"/>`;
  const inner = `<path d="${gable}" fill="${W}" stroke="${E}" stroke-width="1.200"/><path d="${gable}" fill="url(#gr)"/><path d="M34 200V114C34 74 114 46 179 16C244 46 324 74 324 114V200" fill="none" stroke="${HL}" stroke-width="1.300"/><path d="M39 200V116C39 80 116 52 179 23C242 52 319 80 319 116V200" fill="none" stroke="${E}" stroke-width=".8"/>
   ${rose(179, 66, 29)}${quat(99, 95, 20)}${quat(259, 95, 20)}${bay(26, 172)}${bay(186, 332)}
   <rect x="172" y="150" width="14" height="50" fill="${W}"/><rect x="170" y="172" width="18" height="6" rx="1.500" fill="${HL}" stroke="${E}" stroke-width=".6"/>
   <circle cx="179" cy="6" r="3.600" fill="${W}" stroke="${E}" stroke-width=".8"/>${pin(0)}${pin(332)}`;
  return `<div class="crownw">${sv(200, inner, defs)}<div class="plaq" style="top:110px;color:#f3d6b4;font:600 12.500px 'GFS Baskerville',serif;letter-spacing:.26em;text-transform:uppercase;text-shadow:0 1px 0 #1c0f07,0 -1px 0 rgba(0,0,0,.4),0 0 8px rgba(255,200,140,.25)">${name}</div></div>`;
}

function rosette(x, y, r) { let s = ''; for (let i = 0; i < 6; i++) { const a = (i * 60 + 15) * Math.PI / 180; s += `<circle cx="${x + Math.cos(a) * r * .55}" cy="${y + Math.sin(a) * r * .55}" r="${r * .5}" fill="url(#iv)" stroke="#b8a37a" stroke-width=".5"/>`; }
  return s + `<circle cx="${x}" cy="${y}" r="${r * .55}" fill="url(#iv)" stroke="#b8a37a" stroke-width=".5"/><path d="M${x - r * .3} ${y}a${r * .3} ${r * .3} 0 1 1 ${r * .3} ${r * .3}a${r * .18} ${r * .18} 0 1 1 ${-r * .06} ${-r * .3}" fill="none" stroke="#b8a37a" stroke-width=".6"/>`; }

const ROC_DEFS = () => `${G.lin('iv', [[0, '#fffdf6'], [.55, '#f3ead8'], [1, '#d6c8a8']], 1, 1)}<filter id="rel" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="1" dy="1.500" stdDeviation=".9" flood-color="#5a4020" flood-opacity=".45"/></filter><g id="leaf"><path d="M0 0C4-8 15-8 20 0 15 5 4 5 0 0z" fill="url(#iv)" stroke="#bda97f" stroke-width=".6"/><path d="M2 0H18" stroke="#d3c4a0" stroke-width=".5"/></g>
  <g id="corner" filter="url(#rel)"><path d="M14 5C26 0 38 2 46 7 52 11 49 17 44 15 41 13 43 10 46 11" fill="none" stroke="#bda97f" stroke-width="3.600" stroke-linecap="round"/><path d="M14 5C26 0 38 2 46 7 52 11 49 17 44 15 41 13 43 10 46 11" fill="none" stroke="url(#iv)" stroke-width="2.500" stroke-linecap="round"/>
   <path d="M5 14C0 26 2 38 7 46 11 52 17 49 15 44 13 41 10 43 11 46" fill="none" stroke="#bda97f" stroke-width="3.600" stroke-linecap="round"/><path d="M5 14C0 26 2 38 7 46 11 52 17 49 15 44 13 41 10 43 11 46" fill="none" stroke="url(#iv)" stroke-width="2.500" stroke-linecap="round"/>
   <use href="#leaf" transform="translate(20 9) rotate(-12) scale(.5)"/><use href="#leaf" transform="translate(30 4) rotate(14) scale(.5)"/><use href="#leaf" transform="translate(9 20) rotate(102) scale(.5)"/><use href="#leaf" transform="translate(4 30) rotate(76) scale(.5)"/><use href="#leaf" transform="translate(16 16) rotate(45) scale(.6)"/>
   ${rosette(11, 11, 9)}${rosette(27, 13, 4.500)}${rosette(13, 27, 4.500)}</g>`;

function crownRococo2(name) {
  const defs = `${G.lin('ow', [[0, '#f8ead0'], [.55, '#e3caa0'], [1, '#c3a276']], 0, 1)}${G.lin('ow2', [[0, '#ecd8b2'], [1, '#dcc196']], 0, 1)}${G.lin('ivs', [[0, '#fffef8'], [1, '#d9c9a6']], 0, 1)}${ROC_DEFS()}`;
  const fr = (x, y, w, h, sw, col, op = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${col}" stroke-width="${sw}" opacity="${op}"/>`;
  const inner = `<rect x="-8" y="0" width="374" height="9" rx="3" fill="url(#ow)" filter="url(#rel)"/><rect x="-3" y="9" width="364" height="6" fill="url(#ow2)"/>${[...Array(40)].map((_, i) => `<rect x="${1 + i * 9}" y="15" width="5" height="5.500" fill="#fbf4e4" stroke="#c9b58a" stroke-width=".4"/>`).join('')}<rect x="0" y="20" width="358" height="5" fill="url(#ow)"/>
   <rect x="0" y="25" width="358" height="98" fill="url(#ow)"/><path d="M0 123H358" stroke="#b79a6c" stroke-width="1"/>
   <rect x="12" y="34" width="334" height="80" fill="url(#ow2)"/>${fr(12, 34, 334, 80, 6, '#b59c72')}${fr(12, 34, 334, 80, 4.200, 'url(#ivs)')}${fr(11.200, 33.200, 334, 80, .8, '#fff', .9)}${fr(21, 43, 316, 62, .8, '#a98d60', .8)}${fr(22, 44, 314, 60, .8, '#fff', .6)}
   <g transform="translate(13 35) scale(.76)"><use href="#corner"/></g><g transform="translate(345 35) scale(-.76 .76)"><use href="#corner"/></g><g transform="translate(13 113) scale(.76 -.76)"><use href="#corner"/></g><g transform="translate(345 113) scale(-.76 -.76)"><use href="#corner"/></g>`;
  return `<div class="crownw">${sv(124, inner, defs)}<div class="plaq" style="top:67px;color:#fffaf0;font:700 14px 'GFS Baskerville',serif;letter-spacing:.24em;text-transform:uppercase;text-shadow:1px 1.500px 1.200px rgba(90,64,32,.6),-.5px -.5px 0 rgba(255,255,255,.9)">${name}</div></div>`;
}

const bcSvg = cls => `<svg class="bc ${cls}" viewBox="0 0 56 56"><defs>${ROC_DEFS()}</defs><g transform="scale(.9)"><use href="#corner"/></g></svg>`;

function chipTraces(c1, c2, c3) {
  const T = [[104, 46, 80, 46, 70, 36, 22, 36, c1], [104, 62, 62, 62, 52, 72, 22, 72, c2], [104, 92, 78, 92, 68, 104, 22, 104, c3], [254, 46, 278, 46, 288, 36, 336, 36, c2], [254, 62, 296, 62, 306, 72, 336, 72, c1], [254, 92, 280, 92, 290, 104, 336, 104, c3]];
  let s = T.map(([a, b, c, d, e, f, g, h, col]) => `<path d="M${a} ${b}H${c}L${e} ${f}H${g}" fill="none" stroke="${col}" stroke-width="1.300" opacity=".9"/><circle cx="${g}" cy="${h === undefined ? f : f}" r="2.200" fill="none" stroke="${col}" stroke-width="1"/>`).join('');
  [140, 160, 198, 218].forEach((x, i) => s += `<path d="M${x} 34V24" stroke="${[c1, c3, c2, c1][i]}" stroke-width="1.200"/><circle cx="${x}" cy="22" r="1.800" fill="${[c1, c3, c2, c1][i]}"/><path d="M${x} 106V116" stroke="${[c2, c1, c3, c2][i]}" stroke-width="1.200"/><circle cx="${x}" cy="118" r="1.800" fill="${[c2, c1, c3, c2][i]}"/>`);
  return s;
}

function crownChip(name, P) {
  const { c1, c2, c3 } = P;
  const defs = `<linearGradient id="pk${c1.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241d3e"/><stop offset="1" stop-color="#0a0814"/></linearGradient><linearGradient id="dw${c1.slice(1)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}" stop-opacity=".35"/><stop offset=".5" stop-color="${c3}" stop-opacity=".12"/><stop offset="1" stop-color="${c2}" stop-opacity=".35"/></linearGradient><linearGradient id="pn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a909c"/><stop offset=".5" stop-color="#f2f4f7"/><stop offset="1" stop-color="#8a909c"/></linearGradient><pattern id="sl2" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" opacity=".1"/></pattern><filter id="cg"><feGaussianBlur stdDeviation="2.600"/></filter>`;
  let pins = ''; for (let x = 30; x <= 324; x += 12) pins += `<rect x="${x}" y="2" width="6" height="12" rx="1" fill="url(#pn)"/>`;
  const pkg = 'M22 12H338L348 22V132H10V24Z';
  const inner = `${pins}<path d="${pkg}" fill="url(#pk${c1.slice(1)})"/><path d="${pkg}" fill="none" stroke="${c1}" stroke-width="4" filter="url(#cg)" opacity=".6"/><path d="${pkg}" fill="none" stroke="${c1}" stroke-width="1.200"/>
   ${chipTraces(c1, c2, c3)}<circle cx="26" cy="26" r="3" fill="${c3}"/>
   <rect x="104" y="34" width="150" height="72" rx="4" fill="#06040e"/><rect x="104" y="34" width="150" height="72" rx="4" fill="url(#dw${c1.slice(1)})"/><rect x="104" y="34" width="150" height="72" rx="4" fill="url(#sl2)"/><rect x="104" y="34" width="150" height="72" rx="4" fill="none" stroke="${c1}" stroke-width="4" filter="url(#cg)" opacity=".7"/><rect x="104" y="34" width="150" height="72" rx="4" fill="none" stroke="#fff" stroke-width="1" opacity=".9"/>
   <path d="M112 42h14M112 42v8M246 98h-14M246 98v-8" stroke="${c3}" stroke-width="1.400"/><text x="332" y="124" text-anchor="end" font-family="Poppins" font-weight="700" font-size="7" fill="${c3}" letter-spacing="1">HX-2077</text>`;
  return `<div class="crownw">${sv(132, inner, defs)}<div class="plaq" style="top:58px;color:#fff;font:700 11.500px 'Poppins',sans-serif;letter-spacing:.22em;text-transform:uppercase;text-shadow:-1px 0 ${c2},1px 0 ${c1},0 0 8px ${c1},0 0 18px ${c1}">${name.replace(' ', '<br>')}</div></div>`;
}
