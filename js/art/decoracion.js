'use strict';
/* Objetos decorativos de las baldas (SVG con volumen). Cada función recibe una paleta de colores. */

let gid = 0;

const U = p => p + (++gid);

const mix = (a, b, t) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const f = (s) => Math.round(((pa >> s & 255) * (1 - t) + (pb >> s & 255) * t)); return '#' + [16, 8, 0].map(s => f(s).toString(16).padStart(2, '0')).join(''); };

const lighten = (c, t) => mix(c, '#ffffff', t);

const darken = (c, t) => mix(c, '#000000', t);

const G = {
  lin: (id, stops, x2 = 1, y2 = 0) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" ${a != null ? `stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`,
  rad: (id, stops, cx = .5, cy = .5, r = .5, fx, fy) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" ${fx != null ? `fx="${fx}" fy="${fy}"` : ''}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" ${a != null ? `stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`
};

function deco(name, c, scale = 1) { const d = DECO[name](c); return `<div class="dc"><svg viewBox="0 0 ${d.w} ${d.h}" width="${d.w * scale}" height="${d.h * scale}">${d.s}</svg></div>`; }

const DRAGON_T = K => `<g fill="${K}"><path d="M45 34C34 26 18 22 3 26C9 29 10 33 7 37C13 37 16 41 14 45C20 44 24 47 24 52C30 49 36 50 40 54C42 46 44 40 46 38Z"/><path d="M55 34C66 26 82 22 97 26C91 29 90 33 93 37C87 37 84 41 86 45C80 44 76 47 76 52C70 49 64 50 60 54C58 46 56 40 54 38Z"/>
 <ellipse cx="50" cy="44" rx="6.500" ry="13"/><path d="M50 34V20" stroke="${K}" stroke-width="5.500" stroke-linecap="round"/><path d="M50 6C53 8 55 12 54 17C53 20 51 22 50 22C49 22 47 20 46 17C45 12 47 8 50 6Z"/><path d="M47 10L42 5L46 11ZM53 10L58 5L54 11Z"/>
 <path d="M50 56C50 66 56 72 56 80C56 88 46 90 44 84C43 80 47 78 49 80" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"/><path d="M47 82L43 86L49 87Z"/><path d="M44 38L38 36L39 40ZM56 38L62 36L61 40ZM44 52L38 56L41 57ZM56 52L62 56L59 57Z"/></g>
 <g stroke="#5a3a4a" stroke-width=".8" fill="none"><path d="M44 36L10 30M44 38L16 42M42 44L24 50M56 36L90 30M56 38L84 42M58 44L76 50"/></g><circle cx="48" cy="12" r="1" fill="#ffd36a"/><circle cx="52" cy="12" r="1" fill="#ffd36a"/>`;

const DRAGON_SIL = 'M8 34L16 30 22 32 30 30C36 28 42 30 48 32L56 34C64 36 72 36 80 34 86 33 92 34 98 38 92 37 86 37 80 38 72 40 62 40 54 40L46 40C40 40 34 38 28 38L20 38 14 40ZM38 32L46 6 52 14 58 4 62 16 70 10 66 26 56 32ZM44 37L36 52 48 46 54 56 58 39Z';

const DECO = {
  vela: c => { const a = U('a'), b = U('b'), g = U('g'), f = U('f'); return { w: 36, h: 70, s: `<defs>${G.lin(a, [[0, darken(c.cream, .25)], [.45, lighten(c.cream, .35)], [1, darken(c.cream, .18)]])}${G.lin(b, [[0, lighten(c.metal, .4)], [.5, c.metal], [1, darken(c.metal, .4)]])}${G.rad(g, [[0, c.glow, .6], [1, c.glow, 0]])}${G.rad(f, [[0, '#fff8d8'], [.4, '#ffd36a'], [1, '#ff9a2e']], .5, .7, .5)}</defs>
    <circle cx="18" cy="19" r="26" fill="url(#${g})"/>
    <ellipse cx="18" cy="66" rx="15" ry="3" fill="url(#${b})"/><path d="M8 66c0-5 4-7 10-7s10 2 10 7z" fill="url(#${b})"/><ellipse cx="18" cy="59" rx="11" ry="2.4" fill="${lighten(c.metal, .3)}"/>
    <rect x="11" y="28" width="14" height="32" rx="1.5" fill="url(#${a})"/><path d="M11 28c0-2 14-2 14 0 0 3-3 4-4 7-1-3-3-3-4 0s-4 2-6-1c-.4-1.4 0-4 0-6z" fill="${lighten(c.cream, .5)}"/><ellipse cx="18" cy="28" rx="7" ry="1.8" fill="${lighten(c.cream, .6)}"/>
    <path d="M18 27v-4" stroke="#3a2a20" stroke-width="1.2"/><path d="M18 5c5 7 6 12 0 17-6-5-5-10 0-17z" fill="url(#${f})"/><ellipse cx="18" cy="17" rx="1.6" ry="3" fill="#fffbe8" opacity=".9"/>` } },

  libros: c => { const gs = [U('a'), U('b'), U('c')]; const bk = (y, w, col, x, i) => `<g><rect x="${x}" y="${y}" width="${w}" height="11" rx="1" fill="url(#${gs[i]})"/><rect x="${x + w - 6}" y="${y + 1.5}" width="6" height="8" fill="#efe6d2"/><path d="M${x + w - 6} ${y + 3.2}h6M${x + w - 6} ${y + 5}h6M${x + w - 6} ${y + 6.8}h6" stroke="#b9ab8f" stroke-width=".5"/><rect x="${x + 4}" y="${y}" width="2" height="11" fill="${c.foil}" opacity=".85"/><rect x="${x + 9}" y="${y}" width="1.2" height="11" fill="${c.foil}" opacity=".7"/></g>`;
    return { w: 64, h: 40, s: `<defs>${gs.map((id, i) => G.lin(id, [[0, lighten([c.b1, c.b2, c.b3][i], .25)], [.5, [c.b1, c.b2, c.b3][i]], [1, darken([c.b1, c.b2, c.b3][i], .35)]], 0, 1)).join('')}</defs>${bk(28, 60, 0, 2, 0)}${bk(17, 52, 0, 8, 1)}${bk(6, 56, 0, 4, 2)}` } },

  planta: c => { const p = U('p'), l1 = U('l'), l2 = U('m'); return { w: 46, h: 72, s: `<defs>${G.lin(p, [[0, lighten(c.pot, .3)], [.5, c.pot], [1, darken(c.pot, .35)]])}${G.lin(l1, [[0, '#7bbf7e'], [1, '#2f6b43']], 0, 1)}${G.lin(l2, [[0, '#5fa96a'], [1, '#245a39']], 1, 1)}</defs>
    <g stroke="#1f4a30" stroke-width=".6"><path d="M23 46C14 38 8 24 12 8c10 7 14 22 11 38z" fill="url(#${l1})"/><path d="M23 46C26 28 34 16 44 12c0 14-8 28-21 34z" fill="url(#${l2})"/><path d="M23 46C10 46 3 38 2 28c11 0 19 6 21 18z" fill="url(#${l2})"/><path d="M23 46C34 44 41 38 42 30c-9-1-17 5-19 16z" fill="url(#${l1})"/><path d="M23 46C20 32 22 20 27 6c5 12 4 26-4 40z" fill="url(#${l1})"/></g>
    <path d="M23 46C18 34 14 22 12 8M23 46C27 32 33 22 42 13M23 46c-2-15 0-27 4-40" stroke="#c9e8c4" stroke-width=".5" fill="none" opacity=".7"/>
    <path d="M9 46h28l-3 24H12z" fill="url(#${p})"/><rect x="7" y="43" width="32" height="6" rx="2" fill="url(#${p})"/><rect x="7" y="43" width="32" height="1.6" rx=".8" fill="#fff" opacity=".35"/><path d="M13 57h20" stroke="${c.potTrim}" stroke-width="1.2" opacity=".8"/>` } },

  calavera: c => { const a = U('a'), e = U('e'); return { w: 44, h: 46, s: `<defs>${G.rad(a, [[0, '#fbf5e4'], [.7, '#d8cdb0'], [1, '#9e9170']], .4, .35, .75)}${G.rad(e, [[0, '#000'], [1, '#2b2118']])}</defs>
    <path d="M22 3C10 3 3 12 4 22c1 6 4 8 6 10v6c0 2 2 4 4 4h16c2 0 4-2 4-4v-6c2-2 5-4 6-10C41 12 34 3 22 3z" fill="url(#${a})"/>
    <ellipse cx="14.5" cy="21" rx="5.2" ry="5.8" fill="url(#${e})"/><ellipse cx="29.5" cy="21" rx="5.2" ry="5.8" fill="url(#${e})"/><path d="M22 27l-3 6h6z" fill="#2b2118"/>
    <path d="M13 36v6M18 36v6M22 36v6M26 36v6M31 36v6" stroke="#8a7d5c" stroke-width="1"/><path d="M24 4l-3 8 4 5" stroke="#8a7d5c" stroke-width=".8" fill="none"/><ellipse cx="15" cy="10" rx="6" ry="3" fill="#fff" opacity=".35"/>` } },

  pocion: c => { const l = U('l'), gl = U('g'); return { w: 38, h: 56, s: `<defs>${G.rad(l, [[0, lighten(c.liq, .5)], [.55, c.liq], [1, darken(c.liq, .4)]], .4, .35, .75)}${G.rad(gl, [[0, c.liq, .5], [1, c.liq, 0]])}</defs>
    <circle cx="19" cy="38" r="26" fill="url(#${gl})"/>
    <path d="M14 10h10v12c10 3 13 10 13 19 0 7-6 13-18 13S1 48 1 41c0-9 3-16 13-19z" fill="#cfe6ee" fill-opacity=".28" stroke="#e9f6fb" stroke-opacity=".7" stroke-width=".9"/>
    <path d="M3 38c3 3 7 1 10 3s8 2 12 0 8 1 11-1c0 12-8 15-17 15S3 50 3 38z" fill="url(#${l})"/>
    <rect x="13" y="3" width="12" height="8" rx="2" fill="#8a5a30"/><rect x="13" y="3" width="12" height="2" rx="1" fill="#c79a60"/><rect x="12" y="19" width="14" height="5" fill="#cbb98e" opacity=".9"/>
    <ellipse cx="10" cy="36" rx="2.4" ry="7" fill="#fff" opacity=".4" transform="rotate(12 10 36)"/><circle cx="22" cy="42" r="1.5" fill="#fff" opacity=".6"/><circle cx="27" cy="46" r="1" fill="#fff" opacity=".6"/>` } },

  huevo: c => { const e = U('e'), st = U('s'); return { w: 40, h: 58, s: `<defs>${G.rad(e, [[0, lighten(c.egg, .4)], [.5, c.egg], [1, darken(c.egg, .55)]], .38, .3, .85)}${G.lin(st, [[0, lighten(c.foil, .3)], [1, darken(c.foil, .4)]], 0, 1)}</defs>
    <ellipse cx="20" cy="30" rx="15" ry="22" fill="url(#${e})"/>
    <g fill="none" stroke="${lighten(c.egg, .55)}" stroke-width=".9" opacity=".6">${[0, 1, 2, 3, 4].map(r => [0, 1, 2, 3].map(k => `<path d="M${9 + k * 7 + (r % 2) * 3.5} ${14 + r * 8}q3.5 5 7 0"/>`).join('')).join('')}</g>
    <ellipse cx="14" cy="16" rx="4" ry="8" fill="#fff" opacity=".25" transform="rotate(20 14 16)"/>
    <path d="M7 50c2 5 24 5 26 0v3c-2 5-24 5-26 0z" fill="url(#${st})"/><ellipse cx="20" cy="50" rx="13" ry="3" fill="url(#${st})"/>` } },

  flores: c => { const v = U('v'); const fl = (x, y, r, col) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><circle cx="${x - r * .3}" cy="${y - r * .3}" r="${r * .45}" fill="${lighten(col, .45)}" opacity=".7"/></g>`;
    return { w: 48, h: 80, s: `<defs>${G.lin(v, [[0, lighten(c.vase, .5)], [.45, c.vase], [1, darken(c.vase, .3)]])}</defs>
    <g stroke="#8a7a56" stroke-width="1" fill="none"><path d="M24 52C22 38 14 26 10 16"/><path d="M24 52C24 36 24 22 25 8"/><path d="M24 52C27 38 34 26 40 18"/><path d="M24 52C20 40 8 36 6 28"/></g>
    <g>${fl(10, 15, 5, c.f1)}${fl(25, 8, 5.5, c.f2)}${fl(40, 17, 5, c.f1)}${fl(6, 27, 4, c.f3)}${fl(17, 20, 3.6, c.f3)}${fl(33, 24, 3.8, c.f2)}</g>
    <path d="M14 50h20c1 5 4 8 3 14-1 6-5 10-13 10s-12-4-13-10c-1-6 2-9 3-14z" fill="url(#${v})"/><ellipse cx="24" cy="50" rx="10" ry="2.4" fill="${darken(c.vase, .45)}"/><path d="M17 60c2 3 12 3 14 0" stroke="${c.f2}" stroke-width="1" fill="none" opacity=".6"/><ellipse cx="18" cy="62" rx="2" ry="8" fill="#fff" opacity=".35"/>` } },

  // Toque de thriller: lupa y expediente con sello rojo
  lupa: c => { const m = U('m'), g = U('g'); return { w: 58, h: 30, s: `<defs>${G.lin(m, [[0, '#f1d68f'], [.5, '#b98d3c'], [1, '#6a4a14']])}${G.rad(g, [[0, '#ffffff', .55], [.7, '#cfe3ee', .25], [1, '#9fb8c8', .35]], .35, .35, .7)}</defs>
    <ellipse cx="30" cy="27" rx="26" ry="3" fill="#000" opacity=".22"/><rect x="30" y="16" width="26" height="6" rx="3" fill="#3a2414" transform="rotate(14 30 19)"/>
    <circle cx="18" cy="15" r="12" fill="url(#${g})" stroke="url(#${m})" stroke-width="3.500"/><path d="M11 10a9 9 0 0 1 8-4" stroke="#fff" stroke-width="1.500" fill="none" opacity=".7" stroke-linecap="round"/>` } },
  expediente: c => ({ w: 58, h: 22, s: `<ellipse cx="29" cy="20" rx="27" ry="2.500" fill="#000" opacity=".2"/><path d="M3 6h18l3 3h31v10H3z" fill="#c9a46a" stroke="#7a5a2a" stroke-width=".6"/>
    <rect x="3" y="9" width="52" height="10" fill="#d8b77e" stroke="#7a5a2a" stroke-width=".6"/><rect x="14" y="11" width="30" height="6" rx="1" fill="none" stroke="#c0392b" stroke-width="1.100" transform="rotate(-6 29 14)"/>
    <text x="29" y="15.800" text-anchor="middle" font-family="Poppins,sans-serif" font-size="4.300" font-weight="700" fill="#c0392b" transform="rotate(-6 29 14)" letter-spacing=".4">CONFIDENCIAL</text>` }),
  taza: c => { const a = U('a'); return { w: 54, h: 36, s: `<defs>${G.lin(a, [[0, lighten(c.cup, .4)], [.5, c.cup], [1, darken(c.cup, .25)]])}</defs>
    <ellipse cx="25" cy="31" rx="22" ry="4.5" fill="url(#${a})"/><ellipse cx="25" cy="30" rx="15" ry="2.6" fill="${darken(c.cup, .1)}"/>
    <path d="M10 12h30c0 11-3 19-15 19S10 23 10 12z" fill="url(#${a})"/><path d="M40 15h3c5 0 5 8 0 8h-3.5" fill="none" stroke="${c.cup}" stroke-width="2.6"/><ellipse cx="25" cy="12" rx="15" ry="3" fill="#7a4a2a"/><ellipse cx="25" cy="11.5" rx="12" ry="2" fill="#a46a3c"/>
    <path d="M17 9c-3-3 3-4 0-8M25 9c-3-3 3-4 0-8M33 9c-3-3 3-4 0-8" fill="none" stroke="#fff" stroke-width="1.2" opacity=".45" stroke-linecap="round"/><path d="M12 15c0 7 3 10 6 11" stroke="#fff" stroke-width="1.6" opacity=".45" fill="none" stroke-linecap="round"/><path d="M13 20h24" stroke="${c.trim}" stroke-width="1.6" opacity=".8"/>` } },

  marco: c => { const f = U('f'); return { w: 58, h: 70, s: `<defs>${G.lin(f, [[0, lighten(c.frame, .45)], [.5, c.frame], [1, darken(c.frame, .4)]], 1, 1)}</defs>
    <rect x="2" y="2" width="54" height="62" rx="1.5" fill="url(#${f})"/><rect x="7" y="7" width="44" height="52" fill="#f7f1e6"/><rect x="7" y="7" width="44" height="52" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>
    <rect x="12" y="12" width="34" height="42" fill="${c.art1}"/><circle cx="35" cy="26" r="6" fill="${c.art2}"/><path d="M12 54V42c8-8 14-4 20-10s10-2 14 2v20z" fill="${c.art3}"/><path d="M12 54V48c8-6 16-2 34-8v14z" fill="${darken(c.art3, .25)}"/>
    <path d="M22 64l-8 8M36 64l8 8" stroke="${darken(c.frame, .4)}" stroke-width="2.4"/>` } },

  cristal: c => { const a = U('a'), b = U('b'), g = U('g'); return { w: 46, h: 62, s: `<defs>${G.lin(a, [[0, lighten(c.cr, .5)], [1, c.cr]], 1, 1)}${G.lin(b, [[0, c.cr], [1, darken(c.cr, .45)]], 0, 1)}${G.rad(g, [[0, c.cr, .5], [1, c.cr, 0]])}</defs>
    <circle cx="23" cy="36" r="24" fill="url(#${g})"/>
    <polygon points="23,4 33,18 29,58 17,58 13,18" fill="url(#${b})"/><polygon points="23,4 33,18 23,24 13,18" fill="url(#${a})"/><polygon points="23,24 33,18 29,58 23,58" fill="${darken(c.cr, .35)}" opacity=".55"/>
    <polygon points="8,26 15,36 12,58 4,58 2,38" fill="url(#${b})" opacity=".9"/><polygon points="8,26 15,36 8,40 2,38" fill="url(#${a})" opacity=".9"/>
    <polygon points="38,32 45,42 43,58 34,58 33,42" fill="url(#${b})" opacity=".9"/><polygon points="38,32 45,42 38,46 33,42" fill="url(#${a})" opacity=".9"/><path d="M23 4l-3 14" stroke="#fff" stroke-width="1" opacity=".6"/>` } },

  planeta: c => { const s = U('s'); return { w: 66, h: 56, s: `<defs>${G.rad(s, [[0, lighten(c.pl, .55)], [.55, c.pl], [1, darken(c.pl, .6)]], .35, .3, .8)}</defs>
    <ellipse cx="33" cy="30" rx="30" ry="8" fill="none" stroke="${c.ring}" stroke-width="3" opacity=".6" transform="rotate(-18 33 30)"/>
    <circle cx="33" cy="26" r="15" fill="url(#${s})"/><path d="M19 22c8 3 20 3 28-2M18 29c9 4 21 3 29-2" stroke="${darken(c.pl, .35)}" stroke-width="2" fill="none" opacity=".35"/>
    <path d="M5 34c10 6 38-2 56-14" fill="none" stroke="${c.ring}" stroke-width="3" transform="rotate(0)" opacity=".95" clip-path="inset(26px 0 0 0)"/>
    <path d="M18 51h30" stroke="#8aa0b8" stroke-width="3"/><ellipse cx="33" cy="52" rx="9" ry="2.4" fill="#5b6c82"/>` } },

  matraz: c => { const l = U('l'), g = U('g'); return { w: 40, h: 58, s: `<defs>${G.lin(l, [[0, lighten(c.liq, .4)], [1, darken(c.liq, .25)]], 0, 1)}${G.rad(g, [[0, c.liq, .55], [1, c.liq, 0]])}</defs>
    <circle cx="20" cy="42" r="26" fill="url(#${g})"/>
    <path d="M14 4h12v16l12 26c1.4 3-.6 8-4 8H6c-3.400 0-5.400-5-4-8l12-26z" fill="#cfe9f0" fill-opacity=".22" stroke="#d9f1f7" stroke-opacity=".7" stroke-width=".9"/>
    <path d="M7 40c4-2 8 2 13 0s9-2 14 0l4 6c1.400 3-.6 8-4 8H6c-3.400 0-5.400-5-4-8z" fill="url(#${l})"/><ellipse cx="11" cy="42" rx="2" ry="7" fill="#fff" opacity=".4" transform="rotate(20 11 42)"/>
    <rect x="12" y="2" width="16" height="4" rx="1.5" fill="#6a7a90"/><circle cx="24" cy="46" r="1.6" fill="#fff" opacity=".7"/><circle cx="17" cy="49" r="1.1" fill="#fff" opacity=".7"/>` } },

  cohete: c => { const b = U('b'); return { w: 34, h: 70, s: `<defs>${G.lin(b, [[0, '#9fb0c6'], [.5, '#f1f5fa'], [1, '#7b8ba2']])}</defs>
    <path d="M17 3c9 9 10 28 8 40H9C7 31 8 12 17 3z" fill="url(#${b})"/><path d="M17 3c4 4 7 10 8 16H9c1-6 4-12 8-16z" fill="${c.nose}"/><circle cx="17" cy="26" r="5" fill="#223247"/><circle cx="17" cy="26" r="3.6" fill="#59e0d2" opacity=".85"/><circle cx="15.600" cy="24.600" r="1.200" fill="#fff"/>
    <path d="M9 36L1 50l8-3zM25 36l8 14-8-3z" fill="${c.nose}"/><path d="M12 45h10l-5 18z" fill="#ff9a3c"/><path d="M14 45h6l-3 11z" fill="#fff2b0"/><rect x="6" y="66" width="22" height="4" rx="1.500" fill="#5b6c82"/>` } },

  vidriera: c => { const id = U('c'), g = U('g'), w = U('w'); const arch = 'M4 96V38C4 18 24 9 32 2 40 9 60 18 60 38V96Z', K = '#1b1020';
  return { w: 64, h: 102, s: `<defs><clipPath id="${id}"><path d="${arch}"/></clipPath>${G.rad(g, [[0, '#ffd36a', .85], [1, '#ff8a3c', 0]], .5, .75, .6)}${G.lin(w, [[0, '#8a5a30'], [1, '#33200f']], 0, 1)}</defs>
    <ellipse cx="32" cy="80" rx="38" ry="36" fill="url(#${g})"/>
    <g clip-path="url(#${id})"><rect width="64" height="102" fill="#f08a5a"/>
    <polygon points="0,0 32,0 32,30 0,38" fill="#6a4fb8"/><polygon points="32,0 64,0 64,38 32,30" fill="#2f66b0"/><polygon points="0,38 32,30 28,54 0,60" fill="#d8508a"/><polygon points="32,30 64,38 64,62 28,54" fill="#f0a04a"/><polygon points="0,60 28,54 20,80 0,84" fill="#f26a4a"/><polygon points="28,54 64,62 64,86 42,76 20,80" fill="#ffc15a"/><polygon points="0,84 20,80 42,76 64,86 64,102 0,102" fill="#ffe08a"/>
    <g stroke="${K}" stroke-width="1.100" fill="none" opacity=".85"><path d="M32 0v30M0 38l32-8 32 8M0 60l28-6 36 8M28 54l-8 26M42 76l22 10M0 84l20-4 22-4"/></g><g transform="translate(1 22) scale(.62)">${DRAGON_T(K)}</g><path d="M10 0L52 102" stroke="#fff" stroke-width="7" opacity=".1"/></g>
    <path d="${arch}" fill="none" stroke="${K}" stroke-width="3.200"/><path d="M7 94V39C7 21 25 12 32 6 39 12 57 21 57 39V94" fill="none" stroke="${K}" stroke-width=".8" opacity=".6"/>
    <rect x="1" y="95" width="62" height="7" rx="1.500" fill="url(#${w})"/><rect x="1" y="95" width="62" height="1.400" fill="#fff" opacity=".25"/>` }; },

  linterna: c => { const g = U('g'), m = U('m'), gl = U('l'); return { w: 34, h: 66, s: `<defs>${G.rad(g, [[0, '#ffc766', .7], [1, '#ff9a2e', 0]])}${G.lin(m, [[0, '#8a7a66'], [.5, '#2b241d'], [1, '#0f0b08']])}${G.lin(gl, [[0, '#fff0b8'], [1, '#ff9d3a']], 0, 1)}</defs>
    <circle cx="17" cy="34" r="28" fill="url(#${g})"/>
    <path d="M10 12C10 2 24 2 24 12" fill="none" stroke="#2b241d" stroke-width="2"/><circle cx="17" cy="4.500" r="2" fill="none" stroke="#2b241d" stroke-width="1.400"/>
    <path d="M7 18l4-7h12l4 7z" fill="url(#${m})"/><rect x="9" y="18" width="16" height="31" fill="url(#${gl})"/><ellipse cx="17" cy="36" rx="4" ry="9" fill="#fffbe8" opacity=".75"/><path d="M17 26c3 4 3 8 0 12-3-4-3-8 0-12z" fill="#fff" opacity=".9"/>
    <rect x="7" y="18" width="3" height="31" fill="url(#${m})"/><rect x="24" y="18" width="3" height="31" fill="url(#${m})"/><rect x="9" y="32" width="16" height="1.600" fill="#1a1410" opacity=".8"/>
    <path d="M5 49h24l2 7H3z" fill="url(#${m})"/><rect x="3" y="56" width="28" height="3" rx="1" fill="#3a2f26"/><path d="M6 52h22" stroke="#fff" stroke-width=".6" opacity=".35"/>
    <path d="M9 60l-3 6M25 60l3 6" stroke="#2b241d" stroke-width="2"/>` } },

  buho: c => { const b = U('b'), h = U('h'); return { w: 42, h: 56, s: `<defs>${G.rad(b, [[0, '#ffffff'], [.6, '#e9e4dc'], [1, '#9a9288']], .4, .3, .85)}</defs>
    <ellipse cx="21" cy="52" rx="16" ry="3" fill="#000" opacity=".25"/>
    <path d="M7 50c-2-12 0-26 6-33h16c6 7 8 21 6 33z" fill="url(#${b})"/>
    <path d="M9 11l4-9 6 6h4l6-6 4 9c2 8-3 14-12 14S7 19 9 11z" fill="url(#${b})"/>
    <path d="M10 24c4 3 7 3 11 3s7 0 11-3" stroke="#c9c1b4" fill="none" stroke-width=".8"/>
    <g fill="#c4baa8" opacity=".9"><path d="M12 34q3 3 6 0M20 38q3 3 6 0M12 42q3 3 6 0M24 31q3 3 6 0M26 44q3 3 6 0"/></g>
    <path d="M7 28c-3 8-3 16 0 22 3-4 5-14 4-20z" fill="#cfc6b6"/><path d="M35 28c3 8 3 16 0 22-3-4-5-14-4-20z" fill="#cfc6b6"/>
    <circle cx="14.500" cy="15" r="5.200" fill="#fff4d6" stroke="#c9a85a" stroke-width=".8"/><circle cx="27.500" cy="15" r="5.200" fill="#fff4d6" stroke="#c9a85a" stroke-width=".8"/>
    <circle cx="14.500" cy="15" r="3.200" fill="#f0a82a"/><circle cx="27.500" cy="15" r="3.200" fill="#f0a82a"/><circle cx="14.500" cy="15" r="1.700" fill="#111"/><circle cx="27.500" cy="15" r="1.700" fill="#111"/><circle cx="13.600" cy="14" r=".7" fill="#fff"/><circle cx="26.600" cy="14" r=".7" fill="#fff"/>
    <path d="M19.500 19h3L21 23z" fill="#e0902a"/><rect x="2" y="50" width="38" height="4" rx="2" fill="#6a4a2a"/><rect x="2" y="50" width="38" height="1.200" rx=".6" fill="#b0865a"/>` } },

  caldero: c => { const m = U('m'), l = U('l'), g = U('g'); return { w: 54, h: 50, s: `<defs>${G.lin(m, [[0, '#f0b08a'], [.4, '#b8643c'], [1, '#5a2a18']])}${G.rad(l, [[0, '#c9a2ff'], [1, '#5a2aa0']])}${G.rad(g, [[0, '#b58aff', .6], [1, '#8a5aff', 0]])}</defs>
    <circle cx="27" cy="16" r="24" fill="url(#${g})"/>
    <path d="M8 40l-3 8M46 40l3 8M27 44v6" stroke="#4a2212" stroke-width="3" stroke-linecap="round"/>
    <path d="M6 20c0 18 9 26 21 26s21-8 21-26z" fill="url(#${m})"/><path d="M12 24c0 8 2 14 6 18" stroke="#fff" stroke-width="1.600" opacity=".4" fill="none" stroke-linecap="round"/>
    <ellipse cx="27" cy="20" rx="22" ry="5.500" fill="#d9885a"/><ellipse cx="27" cy="20" rx="19" ry="4" fill="url(#${l})"/>
    <polygon points="20,18 24,4 28,18" fill="#b58aff"/><polygon points="26,19 32,8 36,19" fill="#d6b8ff"/><polygon points="14,19 17,10 21,19" fill="#9a6aea"/><polygon points="24,4 26,18 28,18" fill="#fff" opacity=".4"/>
    <circle cx="9" cy="24" r="3" fill="none" stroke="#7a3a1e" stroke-width="1.600"/><circle cx="45" cy="24" r="3" fill="none" stroke="#7a3a1e" stroke-width="1.600"/><circle cx="36" cy="14" r="1.400" fill="#8aeab4"/><circle cx="41" cy="9" r="1" fill="#8aeab4"/>` } },

  libroab: c => { const pg = U('p'), cv = U('c'); return { w: 70, h: 42, s: `<defs>${G.lin(pg, [[0, '#f6ecd4'], [.5, '#fffaf0'], [1, '#e4d6b4']])}${G.lin(cv, [[0, '#6b3a2a'], [1, '#2a140c']], 0, 1)}</defs>
    <ellipse cx="35" cy="38" rx="32" ry="3.500" fill="#000" opacity=".3"/>
    <path d="M1 12c10-5 24-5 34 2 10-7 24-7 34-2v24c-10-4-24-4-34 2-10-6-24-6-34-2z" fill="url(#${cv})"/>
    <path d="M4 10c10-5 22-5 31 2v24c-9-5-21-5-31-2z" fill="url(#${pg})"/><path d="M66 10c-10-5-22-5-31 2v24c9-5 21-5 31-2z" fill="url(#${pg})"/>
    <g stroke="#a89878" stroke-width=".7" opacity=".9"><path d="M9 14c6-2 14-1 21 3M9 19c6-2 14-1 21 3M9 24c6-2 14-1 21 3M9 29c6-2 14-1 21 3M61 14c-6-2-14-1-21 3M61 19c-6-2-14-1-21 3M61 24c-6-2-14-1-21 3"/></g>
    <rect x="46" y="27" width="14" height="7" rx="1" fill="#b3465a" opacity=".5"/><path d="M35 12v26" stroke="#8a7a58" stroke-width="1" opacity=".7"/><path d="M33 36l-2 8 4-2 3 2-1-8z" fill="#b3283c"/>` } },

  lavanda: c => { const p = U('p'); let st = ''; [[8, -16], [14, -8], [21, 0], [28, 8], [34, 16], [18, -4], [25, 4]].forEach(([x, dx], i) => { const x0 = 21, top = 6 + (i % 3) * 5, xt = x0 + dx * 1.1; st += `<path d="M${x0} 48Q${(x0 + xt) / 2} 30 ${xt} ${top + 10}" stroke="#5f7a4a" stroke-width="1" fill="none"/>`; for (let k = 0; k < 6; k++) { const yy = top + k * 3.6, xx = xt + (-dx * .02) * k; st += `<ellipse cx="${xx - 1.600}" cy="${yy}" rx="1.800" ry="1.300" fill="${k % 2 ? '#9a6fd8' : '#b891ec'}"/><ellipse cx="${xx + 1.600}" cy="${yy + 1.500}" rx="1.800" ry="1.300" fill="${k % 2 ? '#b891ec' : '#8a5fc8'}"/>`; } }); return { w: 42, h: 74, s: `<defs>${G.lin(p, [[0, '#7a5a60'], [.45, '#33222a'], [1, '#150c10']])}</defs>${st}
    <path d="M9 48h24l-3 25H12z" fill="url(#${p})"/><rect x="7" y="45" width="28" height="6" rx="2.500" fill="url(#${p})"/><rect x="7" y="45" width="28" height="1.500" rx=".7" fill="#fff" opacity=".3"/><path d="M12 58h18M13 64h16" stroke="#d9b25f" stroke-width="1" opacity=".75"/><path d="M15 54l3 4-3 4M27 54l-3 4 3 4" stroke="#d9b25f" stroke-width=".8" fill="none" opacity=".7"/>` } },

  globo: c => { const s = U('s'), m = U('m'); return { w: 50, h: 64, s: `<defs>${G.rad(s, [[0, '#7fb0d8'], [.6, '#2e6a9a'], [1, '#12304a']], .35, .3, .8)}${G.lin(m, [[0, '#f1d68f'], [.5, '#c8a04e'], [1, '#6a4a14']])}</defs>
    <ellipse cx="25" cy="61" rx="15" ry="3" fill="#000" opacity=".3"/><path d="M19 56h12l2 5H17z" fill="url(#${m})"/><rect x="23" y="48" width="4" height="9" fill="url(#${m})"/>
    <circle cx="25" cy="26" r="21" fill="url(#${s})"/><g fill="#8fb36a" opacity=".85"><path d="M12 18c4-6 10-4 12 0-2 4-6 4-8 8-3 0-5-4-4-8zM28 10c6-2 12 2 11 8-4 2-6-2-9 2-3-1-4-6-2-10zM26 30c6 0 10 4 8 10-5 2-6-3-10-2-2-3 0-6 2-8z"/></g>
    <path d="M6 20C14 24 36 24 44 20M5 31C14 35 36 35 45 31" stroke="#fff" stroke-width=".5" opacity=".35" fill="none"/>
    <path d="M7 40C2 20 12 4 28 5" stroke="url(#${m})" stroke-width="2.600" fill="none"/><ellipse cx="18" cy="14" rx="5" ry="9" fill="#fff" opacity=".28" transform="rotate(30 18 14)"/>` } },

  satelite: c => { const b = U('b'), p = U('p'); return { w: 60, h: 54, s: `<defs>${G.lin(b, [[0, '#f7f9fc'], [.5, '#c4ccd8'], [1, '#6f7b8c']])}${G.lin(p, [[0, '#2a4a9a'], [1, '#0f1f52']], 1, 1)}</defs>
    <ellipse cx="30" cy="51" rx="16" ry="2.600" fill="#000" opacity=".3"/><path d="M26 44h8l3 7H23z" fill="#4a5568"/>
    <g stroke="#0a1230" stroke-width=".7"><rect x="1" y="14" width="19" height="14" fill="url(#${p})"/><rect x="40" y="14" width="19" height="14" fill="url(#${p})"/></g><g stroke="#6f8be0" stroke-width=".5" opacity=".8"><path d="M7 14v14M13 14v14M1 21h19M46 14v14M52 14v14M40 21h19"/></g><path d="M20 21h6M34 21h6" stroke="#8a95a6" stroke-width="2"/>
    <rect x="24" y="12" width="12" height="20" rx="2.500" fill="url(#${b})" stroke="#4a5568" stroke-width=".6"/><rect x="26" y="16" width="8" height="5" fill="#16202e"/><circle cx="30" cy="27" r="2" fill="#f08a2c"/><path d="M30 12V4" stroke="#8a95a6" stroke-width="1.200"/><circle cx="30" cy="3" r="2" fill="#f08a2c"/><path d="M30 32v12" stroke="#8a95a6" stroke-width="2"/>` } },

  robot: c => { const m = U('m'), v = U('v'); return { w: 46, h: 62, s: `<defs>${G.lin(m, [[0, '#8d94ad'], [.5, '#3a3f55'], [1, '#14161f']])}${G.lin(v, [[0, '#25f4ee'], [1, '#0aa6c0']], 1, 0)}</defs>
    <ellipse cx="23" cy="59" rx="18" ry="3" fill="#000" opacity=".35"/>
    <path d="M4 60V48C4 42 10 38 23 38S42 42 42 48V60Z" fill="url(#${m})"/><rect x="18" y="34" width="10" height="6" fill="#14161f"/><path d="M10 52h26" stroke="#ff2fb8" stroke-width="1.600"/><circle cx="23" cy="47" r="2.600" fill="#25f4ee"/>
    <rect x="7" y="8" width="32" height="27" rx="7" fill="url(#${m})" stroke="#0a0b12" stroke-width="1"/><rect x="3" y="16" width="5" height="11" rx="2" fill="#2a2e40"/><rect x="38" y="16" width="5" height="11" rx="2" fill="#2a2e40"/>
    <rect x="11" y="16" width="24" height="9" rx="4.500" fill="#07080e"/><rect x="12.500" y="17.500" width="21" height="6" rx="3" fill="url(#${v})"/><rect x="12.500" y="17.500" width="21" height="2" rx="1" fill="#fff" opacity=".45"/>
    <path d="M23 8V1" stroke="#8d94ad" stroke-width="1.600"/><circle cx="23" cy="1.500" r="2" fill="#ff2fb8"/><path d="M14 30h18" stroke="#0a0b12" stroke-width="1.200"/><path d="M16 28v3M20 28v3M24 28v3M28 28v3" stroke="#0a0b12" stroke-width=".8"/>
    <path d="M9 10h14" stroke="#fff" stroke-width="1.200" opacity=".35"/>` } },

  holocubo: c => { const g = U('g'), b = U('b'); return { w: 44, h: 60, s: `<defs>${G.rad(g, [[0, '#25f4ee', .55], [1, '#25f4ee', 0]])}${G.lin(b, [[0, '#6a7090'], [1, '#14161f']], 0, 1)}</defs>
    <circle cx="22" cy="24" r="24" fill="url(#${g})"/><path d="M12 48h20l5 8H7z" fill="url(#${b})"/><ellipse cx="22" cy="48" rx="10" ry="2.400" fill="#25f4ee" opacity=".85"/><path d="M14 47L8 24h28L30 47" fill="#25f4ee" opacity=".12"/>
    <g fill="none" stroke="#25f4ee" stroke-width="1.100"><path d="M22 4l14 7v16l-14 7-14-7V11z"/><path d="M8 11l14 7 14-7M22 18v16" stroke="#ff2fb8"/></g><g fill="#fff"><circle cx="22" cy="4" r="1.200"/><circle cx="36" cy="27" r="1.200"/><circle cx="8" cy="27" r="1.200"/></g>` } },

  mano: c => { const s = U('s'), d = U('d'), gd = U('g'), b = U('b'), gl = U('l');
  const joint = (x, y, r = 2.300) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${d})" stroke="#15171c" stroke-width=".5"/><circle cx="${x}" cy="${y}" r="${r * .45}" fill="#25f4ee"/>`;
  const finger = (cx, base, segs, rot) => { let y = base, g = ''; segs.forEach((L, i) => { const top = y - L; g += `<rect x="${cx - 2.700}" y="${top}" width="5.400" height="${L - 1.500}" rx="${i === segs.length - 1 ? 2.700 : 1.200}" fill="url(#${s})" stroke="#15171c" stroke-width=".6"/><path d="M${cx - 1.800} ${top + 1.500}V${y - 3}" stroke="#fff" stroke-width=".8" opacity=".5"/><path d="M${cx + 1.400} ${top + 2}V${y - 3.500}" stroke="#3a3f48" stroke-width=".6"/>`; if (i < segs.length - 1) g += joint(cx, top - .8, 2); y = top - 1.600; }); return `<g transform="rotate(${rot} ${cx} ${base})">${joint(cx, base + 1, 2.400)}${g}</g>`; };
  return { w: 58, h: 112, s: `<defs>${G.lin(s, [[0, '#f4f6f8'], [.4, '#b9bec7'], [1, '#5a5f69']])}${G.lin(d, [[0, '#6a707c'], [1, '#22252c']], 1, 1)}${G.lin(gd, [[0, '#f6d77a'], [1, '#8a6418']])}${G.lin(b, [[0, '#d4d7dc'], [1, '#4a4f58']], 0, 1)}${G.rad(gl, [[0, '#25f4ee', .55], [1, '#25f4ee', 0]])}</defs>
    <ellipse cx="29" cy="106" rx="22" ry="5" fill="#000" opacity=".3"/><path d="M8 100v4c0 3 9 5 21 5s21-2 21-5v-4z" fill="url(#${b})"/><ellipse cx="29" cy="100" rx="21" ry="5.500" fill="#b9bec7" stroke="#3a3f48" stroke-width=".6"/><ellipse cx="29" cy="99.500" rx="12" ry="2.800" fill="#25f4ee" opacity=".55"/>
    <rect x="20" y="70" width="18" height="30" rx="2" fill="url(#${d})" stroke="#15171c" stroke-width=".6"/><rect x="22" y="72" width="3" height="26" fill="url(#${gd})"/><rect x="33" y="72" width="3" height="26" fill="url(#${gd})"/><rect x="26.500" y="74" width="5" height="22" rx="1" fill="url(#${s})"/>
    <path d="M24 70C18 80 18 90 22 98M34 70C40 80 40 90 36 98" fill="none" stroke="#ff2fb8" stroke-width="1.300"/><path d="M27 70C25 82 26 90 27 98" fill="none" stroke="#25f4ee" stroke-width="1"/>
    <circle cx="29" cy="54" r="20" fill="url(#${gl})"/>
    ${finger(19, 40, [12, 9, 7], -7)}${finger(26, 38, [13, 10, 8], -2)}${finger(33, 38, [13, 10, 8], 2)}${finger(40, 40, [11, 8, 7], 7)}
    <path d="M14 42Q14 38 18 38H40Q44 38 44 42L42 66Q41 71 37 71H21Q17 71 16 66Z" fill="url(#${s})" stroke="#15171c" stroke-width=".8"/><path d="M18 46H40M19 60H39M29 42V68" stroke="#3a3f48" stroke-width=".6" opacity=".8"/>
    <path d="M29 48l5 3v6l-5 3-5-3v-6z" fill="#0e1218" stroke="#25f4ee" stroke-width=".8"/><circle cx="29" cy="54" r="2" fill="#25f4ee"/>
    <g transform="rotate(-42 15 58)">${joint(15, 58, 2.400)}<rect x="12.300" y="44" width="5.400" height="12" rx="1.200" fill="url(#${s})" stroke="#15171c" stroke-width=".6"/>${joint(15, 43, 2)}<rect x="12.300" y="32" width="5.400" height="10" rx="2.700" fill="url(#${s})" stroke="#15171c" stroke-width=".6"/></g>
    <path d="M16 42H42" stroke="#fff" stroke-width=".8" opacity=".5"/>` }; },

  holoplaneta: c => { const g = U('g'), b = U('b'), h1 = c.h1 || '#25f4ee', h2 = c.h2 || '#ff2fb8'; let lines = '';
  for (let i = -3; i <= 3; i++) lines += `<ellipse cx="24" cy="${24 + i * 4.500}" rx="${Math.sqrt(1 - (i / 3.6) ** 2) * 16}" ry="1.600" fill="none" stroke="${h1}" stroke-width=".6" opacity=".8"/>`;
  for (let i = 0; i < 4; i++) lines += `<ellipse cx="24" cy="24" rx="${4 + i * 4}" ry="16" fill="none" stroke="${h1}" stroke-width=".6" opacity=".7"/>`;
  return { w: 48, h: 66, s: `<defs>${G.rad(g, [[0, h1, .45], [1, h1, 0]])}${G.lin(b, [[0, '#6a7090'], [1, '#14161f']], 0, 1)}${G.lin(U('x'), [[0, h1, .5], [1, h1, 0]], 0, 1)}</defs>
    <circle cx="24" cy="24" r="24" fill="url(#${g})"/><path d="M14 56L4 30h40L34 56Z" fill="${h1}" opacity=".1"/>${lines}<circle cx="24" cy="24" r="16" fill="none" stroke="${h1}" stroke-width="1.100"/><ellipse cx="24" cy="24" rx="23" ry="5" fill="none" stroke="${h2}" stroke-width="1.200" transform="rotate(-14 24 24)"/>
    <path d="M14 56h20l5 9H9z" fill="url(#${b})"/><ellipse cx="24" cy="56" rx="10" ry="2.400" fill="${h1}" opacity=".9"/>` }; },

  adn: c => { const g = U('g'), b = U('b'); let s = '', p1 = 'M', p2 = 'M';
  for (let y = 4; y <= 52; y += 2) { const t = (y - 4) / 48 * Math.PI * 3, x1 = 18 + Math.sin(t) * 10, x2 = 18 - Math.sin(t) * 10; p1 += `${x1} ${y} `; p2 += `${x2} ${y} `; if (y % 4 === 0) s += `<path d="M${x1} ${y}H${x2}" stroke="#bffffb" stroke-width=".7" opacity="${.35 + Math.abs(Math.cos(t)) * .5}"/>`; }
  return { w: 36, h: 66, s: `<defs>${G.rad(g, [[0, '#25f4ee', .4], [1, '#25f4ee', 0]])}${G.lin(b, [[0, '#6a7090'], [1, '#14161f']], 0, 1)}</defs><ellipse cx="18" cy="28" rx="20" ry="30" fill="url(#${g})"/>${s}<path d="${p1}" fill="none" stroke="#25f4ee" stroke-width="1.600"/><path d="${p2}" fill="none" stroke="#ff2fb8" stroke-width="1.600"/><path d="M9 56h18l4 9H5z" fill="url(#${b})"/><ellipse cx="18" cy="56" rx="9" ry="2.200" fill="#25f4ee" opacity=".9"/>` }; }
};
