/* Motor de dibujo de Mi TBR: muebles, lomos y decoración (SVG generado) */
let gid = 0; const U = p => p + (++gid);
const mix = (a, b, t) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const f = (s) => Math.round(((pa >> s & 255) * (1 - t) + (pb >> s & 255) * t)); return '#' + [16, 8, 0].map(s => f(s).toString(16).padStart(2, '0')).join(''); };
const lighten = (c, t) => mix(c, '#ffffff', t), darken = (c, t) => mix(c, '#000000', t);

/* ---------- DECORACIÓN con volumen (degradados, brillos, sombra de contacto) ---------- */
const G = {
  lin: (id, stops, x2 = 1, y2 = 0) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" ${a != null ? `stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`,
  rad: (id, stops, cx = .5, cy = .5, r = .5, fx, fy) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" ${fx != null ? `fx="${fx}" fy="${fy}"` : ''}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" ${a != null ? `stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`
};
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
    <path d="M9 36L1 50l8-3zM25 36l8 14-8-3z" fill="${c.nose}"/><path d="M12 45h10l-5 18z" fill="#ff9a3c"/><path d="M14 45h6l-3 11z" fill="#fff2b0"/><rect x="6" y="66" width="22" height="4" rx="1.500" fill="#5b6c82"/>` } }
};
function deco(name, c, scale = 1) { const d = DECO[name](c); return `<div class="dc"><svg viewBox="0 0 ${d.w} ${d.h}" width="${d.w * scale}" height="${d.h * scale}">${d.s}</svg></div>`; }

/* ---------- decoración nueva ---------- */
Object.assign(DECO, {
  vidriera: c => { const id = U('c'), g = U('g'), w = U('w'); const arch = 'M5 90V36C5 18 24 9 30 2 36 9 55 18 55 36V90Z'; return { w: 60, h: 96, s: `<defs><clipPath id="${id}"><path d="${arch}"/></clipPath>${G.rad(g, [[0, '#ffd36a', .85], [1, '#ff8a3c', 0]], .5, .75, .6)}${G.lin(w, [[0, '#8a5a30'], [1, '#33200f']], 0, 1)}</defs>
    <ellipse cx="30" cy="78" rx="36" ry="34" fill="url(#${g})"/>
    <g clip-path="url(#${id})"><rect width="60" height="96" fill="#f08a5a"/>
    <polygon points="0,0 30,0 30,28 0,36" fill="#6a4fb8"/><polygon points="30,0 60,0 60,36 30,28" fill="#2f66b0"/><polygon points="0,36 30,28 26,50 0,56" fill="#d8508a"/><polygon points="30,28 60,36 60,58 26,50" fill="#f0a04a"/><polygon points="0,56 26,50 18,76 0,80" fill="#f26a4a"/><polygon points="26,50 60,58 60,82 40,72 18,76" fill="#ffc15a"/><polygon points="0,80 18,76 40,72 60,82 60,96 0,96" fill="#ffe08a"/>
    <path d="M6 38c9-3 14-8 23-6 6-7 14-11 22-11-4 6-6 9-7 13 6 0 11 2 14 7-7 0-11 3-18 3-4 6-11 9-19 6-6-3-9-5-15-12z" fill="#13405a"/><path d="M12 56c8-3 12-8 18-6 5-4 11-6 16-5-3 4-4 7-4 9 5 1 8 3 10 6-6-1-9 1-14 2-5 5-12 5-18 2z" fill="#4a2a5e" opacity=".9"/>
    <g stroke="#1a1210" stroke-width="1.2" fill="none"><path d="M30 0v30M0 36l30-8 30 8M0 56l26-6 34 8M26 50l-8 26M40 72l20 10M0 80l18-4 22-4"/></g>
    <path d="M10 0L50 96" stroke="#fff" stroke-width="7" opacity=".1"/></g>
    <path d="${arch}" fill="none" stroke="#1a1210" stroke-width="3"/><path d="M8 88V37C8 21 25 12 30 6 35 12 52 21 52 37V88" fill="none" stroke="#1a1210" stroke-width=".8" opacity=".7"/>
    <rect x="1" y="89" width="58" height="7" rx="1.5" fill="url(#${w})"/><rect x="1" y="89" width="58" height="1.4" fill="#fff" opacity=".25"/>` } },
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
  taza2: c => DECO.taza(c)
});


/* ---------- decoración v3 ---------- */
Object.assign(DECO, {
  vidriera: c => { const id = U('c'), g = U('g'), w = U('w'), dr = U('d'); const arch = 'M5 90V36C5 18 24 9 30 2 36 9 55 18 55 36V90Z'; return { w: 60, h: 96, s: `<defs><clipPath id="${id}"><path d="${arch}"/></clipPath>${G.rad(g, [[0, '#ffd36a', .85], [1, '#ff8a3c', 0]], .5, .75, .6)}${G.lin(w, [[0, '#8a5a30'], [1, '#33200f']], 0, 1)}${G.lin(dr, [[0, '#1d5c78'], [1, '#0b2a3c']], 0, 1)}</defs>
    <ellipse cx="30" cy="78" rx="36" ry="34" fill="url(#${g})"/>
    <g clip-path="url(#${id})"><rect width="60" height="96" fill="#f08a5a"/>
    <polygon points="0,0 30,0 30,28 0,36" fill="#6a4fb8"/><polygon points="30,0 60,0 60,36 30,28" fill="#2f66b0"/><polygon points="0,36 30,28 26,50 0,56" fill="#d8508a"/><polygon points="30,28 60,36 60,58 26,50" fill="#f0a04a"/><polygon points="0,56 26,50 18,76 0,80" fill="#f26a4a"/><polygon points="26,50 60,58 60,82 40,72 18,76" fill="#ffc15a"/><polygon points="0,80 18,76 40,72 60,82 60,96 0,96" fill="#ffe08a"/>
    <g transform="translate(3 17) scale(.9)" fill="url(#${dr})" stroke="#0a2433" stroke-width=".6">
      <path d="M30 52C36 38 44 24 56 16 54 25 54 29 52 33 56 33 58 35 60 37 56 39 54 41 54 45 58 47 60 51 60 55 52 53 46 55 42 59Z"/>
      <path d="M31 55C24 46 20 42 15 40" fill="none" stroke="#1d5c78" stroke-width="5.500" stroke-linecap="round"/>
      <path d="M9 36L19 34 23 38 17 43 12 41Z"/><path d="M19 34L26 29 22 36Z"/><path d="M15 35L19 28 18 35Z"/>
      <ellipse cx="34" cy="56" rx="12" ry="6.500" transform="rotate(22 34 56)"/>
      <path d="M42 60C49 64 51 71 47 77 45 81 49 84 54 82" fill="none" stroke="#1d5c78" stroke-width="3.600" stroke-linecap="round"/><path d="M52 78L60 80 54 86Z"/>
      <path d="M30 60L27 69 32 68ZM38 62L37 71 42 69ZM25 52L21 60 26 60Z"/></g>
    <g stroke="#0a2433" stroke-width=".9" fill="none"><path d="M33 58L53 33M33 58L58 42M33 58L56 55"/></g><circle cx="15" cy="49" r="1.100" fill="#ffd36a"/>
    <g stroke="#1a1210" stroke-width="1.100" fill="none"><path d="M30 0v30M0 36l30-8 30 8M0 56l26-6 34 8M26 50l-8 26M40 72l20 10M0 80l18-4 22-4"/></g><path d="M10 0L50 96" stroke="#fff" stroke-width="7" opacity=".1"/></g>
    <path d="${arch}" fill="none" stroke="#1a1210" stroke-width="3"/><path d="M8 88V37C8 21 25 12 30 6 35 12 52 21 52 37V88" fill="none" stroke="#1a1210" stroke-width=".8" opacity=".7"/>
    <rect x="1" y="89" width="58" height="7" rx="1.500" fill="url(#${w})"/><rect x="1" y="89" width="58" height="1.400" fill="#fff" opacity=".25"/>` } },
  robot: c => { const m = U('m'), v = U('v'); return { w: 46, h: 62, s: `<defs>${G.lin(m, [[0, '#8d94ad'], [.5, '#3a3f55'], [1, '#14161f']])}${G.lin(v, [[0, '#25f4ee'], [1, '#0aa6c0']], 1, 0)}</defs>
    <ellipse cx="23" cy="59" rx="18" ry="3" fill="#000" opacity=".35"/>
    <path d="M4 60V48C4 42 10 38 23 38S42 42 42 48V60Z" fill="url(#${m})"/><rect x="18" y="34" width="10" height="6" fill="#14161f"/><path d="M10 52h26" stroke="#ff2fb8" stroke-width="1.600"/><circle cx="23" cy="47" r="2.600" fill="#25f4ee"/>
    <rect x="7" y="8" width="32" height="27" rx="7" fill="url(#${m})" stroke="#0a0b12" stroke-width="1"/><rect x="3" y="16" width="5" height="11" rx="2" fill="#2a2e40"/><rect x="38" y="16" width="5" height="11" rx="2" fill="#2a2e40"/>
    <rect x="11" y="16" width="24" height="9" rx="4.500" fill="#07080e"/><rect x="12.500" y="17.500" width="21" height="6" rx="3" fill="url(#${v})"/><rect x="12.500" y="17.500" width="21" height="2" rx="1" fill="#fff" opacity=".45"/>
    <path d="M23 8V1" stroke="#8d94ad" stroke-width="1.600"/><circle cx="23" cy="1.500" r="2" fill="#ff2fb8"/><path d="M14 30h18" stroke="#0a0b12" stroke-width="1.200"/><path d="M16 28v3M20 28v3M24 28v3M28 28v3" stroke="#0a0b12" stroke-width=".8"/>
    <path d="M9 10h14" stroke="#fff" stroke-width="1.200" opacity=".35"/>` } },
  ramen: c => { const cp = U('c'); return { w: 44, h: 52, s: `<defs>${G.lin(cp, [[0, '#ff6fd0'], [.5, '#e2229f'], [1, '#7a0f60']])}</defs>
    <ellipse cx="22" cy="49" rx="17" ry="3" fill="#000" opacity=".35"/>
    <path d="M14 10c-3-3 3-4 0-8M22 10c-3-3 3-4 0-8M30 10c-3-3 3-4 0-8" fill="none" stroke="#fff" stroke-width="1.200" opacity=".55" stroke-linecap="round"/>
    <path d="M26 6L40 -4M30 8L43 0" stroke="#ffd400" stroke-width="1.600" stroke-linecap="round"/>
    <ellipse cx="22" cy="16" rx="17" ry="4" fill="#f3e3b0"/><path d="M8 16c4 4 8 3 14 4s10-1 14-4" fill="none" stroke="#e8c25a" stroke-width="1.400"/><circle cx="16" cy="15" r="2.200" fill="#ff7a5a"/><circle cx="27" cy="16" r="1.800" fill="#7ad67a"/>
    <path d="M5 16h34l-4 31H9z" fill="url(#${cp})"/><path d="M5 16h34" stroke="#fff" stroke-width="1.200" opacity=".5"/>
    <path d="M10 26h24M11 36h22" stroke="#25f4ee" stroke-width="1.600" opacity=".95"/><rect x="14" y="28" width="16" height="6" fill="#0a0b12" opacity=".6"/><path d="M16 31h12" stroke="#ffd400" stroke-width="1.200"/><path d="M9 18L12 45" stroke="#fff" stroke-width="2" opacity=".25"/>` } },
  holocubo: c => { const g = U('g'), b = U('b'); return { w: 44, h: 60, s: `<defs>${G.rad(g, [[0, '#25f4ee', .55], [1, '#25f4ee', 0]])}${G.lin(b, [[0, '#6a7090'], [1, '#14161f']], 0, 1)}</defs>
    <circle cx="22" cy="24" r="24" fill="url(#${g})"/><path d="M12 48h20l5 8H7z" fill="url(#${b})"/><ellipse cx="22" cy="48" rx="10" ry="2.400" fill="#25f4ee" opacity=".85"/><path d="M14 47L8 24h28L30 47" fill="#25f4ee" opacity=".12"/>
    <g fill="none" stroke="#25f4ee" stroke-width="1.100"><path d="M22 4l14 7v16l-14 7-14-7V11z"/><path d="M8 11l14 7 14-7M22 18v16" stroke="#ff2fb8"/></g><g fill="#fff"><circle cx="22" cy="4" r="1.200"/><circle cx="36" cy="27" r="1.200"/><circle cx="8" cy="27" r="1.200"/></g>` } }
});


/* vidriera: fondo de color + dragón en silueta */
DECO.vidriera = c => { const id = U('c'), g = U('g'), w = U('w'); const arch = 'M4 96V38C4 18 24 9 32 2 40 9 60 18 60 38V96Z';
  const body = 'M50 30C62 34 66 48 58 58C48 70 40 76 48 86C54 94 62 96 58 104C52 112 30 112 24 100C18 88 34 80 42 90C46 96 38 100 36 96';
  const K = '#1b1020';
  const dr = `<g transform="translate(6 22) scale(.5)" fill="${K}">
   <path d="M44 42C34 30 22 18 8 10C10 18 8 24 4 30C10 32 12 36 10 42C16 42 20 46 18 52C26 50 32 52 38 58Z"/><path d="M58 46C68 32 80 20 96 12C94 20 96 26 98 32C92 34 92 40 94 46C88 46 86 52 86 58C78 54 70 56 62 62Z"/>
   <path d="${body}" fill="none" stroke="${K}" stroke-width="12" stroke-linecap="round"/><path d="M62 34l7-3-3 7zM65 46l7 0-5 6zM59 62l6 2-6 4zM50 84l6 1-5 4z"/>
   <path d="M40 22L52 14 60 18 62 26 54 31 46 31 42 28Z"/><path d="M40 22L30 26 42 29Z"/><path d="M52 14L49 0 56 14Z M57 16L65 3 61 18Z"/><circle cx="50" cy="21" r="2" fill="#ffd36a"/></g>`;
  return { w: 64, h: 102, s: `<defs><clipPath id="${id}"><path d="${arch}"/></clipPath>${G.rad(g, [[0, '#ffd36a', .85], [1, '#ff8a3c', 0]], .5, .75, .6)}${G.lin(w, [[0, '#8a5a30'], [1, '#33200f']], 0, 1)}</defs>
    <ellipse cx="32" cy="80" rx="38" ry="36" fill="url(#${g})"/>
    <g clip-path="url(#${id})"><rect width="64" height="102" fill="#f08a5a"/>
    <polygon points="0,0 32,0 32,30 0,38" fill="#6a4fb8"/><polygon points="32,0 64,0 64,38 32,30" fill="#2f66b0"/><polygon points="0,38 32,30 28,54 0,60" fill="#d8508a"/><polygon points="32,30 64,38 64,62 28,54" fill="#f0a04a"/><polygon points="0,60 28,54 20,80 0,84" fill="#f26a4a"/><polygon points="28,54 64,62 64,86 42,76 20,80" fill="#ffc15a"/><polygon points="0,84 20,80 42,76 64,86 64,102 0,102" fill="#ffe08a"/>
    <g stroke="${K}" stroke-width="1.100" fill="none" opacity=".85"><path d="M32 0v30M0 38l32-8 32 8M0 60l28-6 36 8M28 54l-8 26M42 76l22 10M0 84l20-4 22-4"/></g>${dr}<path d="M10 0L52 102" stroke="#fff" stroke-width="7" opacity=".1"/></g>
    <path d="${arch}" fill="none" stroke="${K}" stroke-width="3.200"/><path d="M7 94V39C7 21 25 12 32 6 39 12 57 21 57 39V94" fill="none" stroke="${K}" stroke-width=".8" opacity=".6"/>
    <rect x="1" y="95" width="62" height="7" rx="1.500" fill="url(#${w})"/><rect x="1" y="95" width="62" height="1.400" fill="#fff" opacity=".25"/>` }; };
/* mano robótica (referencia) */
DECO.mano = c => { const s = U('s'), gd = U('g'), b = U('b');
  const fing = (x, y0, y1, wd, rot) => { let j = ''; for (let y = y0 + 7; y < y1 - 2; y += 7.500) j += `<path d="M${x + .5} ${y}h${wd - 1}" stroke="#2a2d33" stroke-width=".9"/>`; return `<g transform="rotate(${rot} ${x + wd / 2} ${y1})"><rect x="${x}" y="${y0}" width="${wd}" height="${y1 - y0}" rx="${wd / 2}" fill="url(#${s})" stroke="#2a2d33" stroke-width=".7"/>${j}<rect x="${x + 1}" y="${y0 + 1}" width="${wd * .35}" height="${y1 - y0 - 3}" rx="1" fill="#fff" opacity=".22"/><circle cx="${x + wd}" cy="${y0 + 13}" r="1" fill="#d98a5a"/></g>`; };
  let sp = ''; for (let y = 68; y <= 90; y += 2.600) sp += `<ellipse cx="21" cy="${y}" rx="3.200" ry="1.100" fill="none" stroke="url(#${gd})" stroke-width="1"/><ellipse cx="29" cy="${y + 1.300}" rx="3.200" ry="1.100" fill="none" stroke="url(#${gd})" stroke-width="1"/>`;
  return { w: 52, h: 104, s: `<defs>${G.lin(s, [[0, '#f2f3f5'], [.45, '#a6abb4'], [1, '#4e535c']])}${G.lin(gd, [[0, '#f6d77a'], [.5, '#c79a2e'], [1, '#6e4f12']])}${G.lin(b, [[0, '#d4d7dc'], [1, '#5a5f68']], 0, 1)}</defs>
    <ellipse cx="25" cy="99" rx="20" ry="4.500" fill="#000" opacity=".3"/><path d="M5 93v4c0 3 9 5 20 5s20-2 20-5v-4z" fill="url(#${b})"/><ellipse cx="25" cy="93" rx="20" ry="5" fill="#c4c8ce" stroke="#4e535c" stroke-width=".6"/><ellipse cx="25" cy="92.500" rx="13" ry="3" fill="none" stroke="#7a7f88" stroke-width=".6"/>
    <rect x="17" y="62" width="16" height="30" fill="#1e1f22"/>${sp}<path d="M15 60h20v6H15z" fill="none" stroke="url(#${gd})" stroke-width="1.600"/><rect x="31" y="66" width="3" height="24" fill="url(#${gd})"/>
    ${fing(11, 14, 40, 5.500, -6)}${fing(17.500, 6, 38, 6, -2)}${fing(24.500, 2, 38, 6, 1)}${fing(31.500, 8, 40, 6, 5)}
    <path d="M12 38L38 38 40 52 35 64 16 64 11 52Z" fill="url(#${s})" stroke="#2a2d33" stroke-width=".8"/><path d="M18 40l3 10-4 8M26 40v8M33 40l-3 9 4 9M20 50h12" stroke="#2a2d33" stroke-width=".8" fill="none"/>
    <rect x="22" y="41" width="8" height="1.400" fill="url(#${gd})"/><rect x="22" y="43.500" width="8" height="1.400" fill="url(#${gd})"/><rect x="22" y="46" width="8" height="1.400" fill="url(#${gd})"/>
    <g transform="rotate(-38 36 50)"><rect x="34" y="34" width="7" height="18" rx="3.500" fill="url(#${s})" stroke="#2a2d33" stroke-width=".7"/><path d="M34.500 42h6" stroke="#2a2d33" stroke-width=".8"/><circle cx="41" cy="42" r="1.300" fill="#d98a5a"/></g>
    <path d="M24 52c4-2 10-2 13 2l-3 8c-4-1-8-1-11 1z" fill="url(#${s})" stroke="#2a2d33" stroke-width=".7"/><circle cx="11.500" cy="50" r="1.100" fill="#d98a5a"/>` }; };
/* planeta holográfico */
DECO.holoplaneta = c => { const g = U('g'), b = U('b'), h1 = c.h1 || '#25f4ee', h2 = c.h2 || '#ff2fb8'; let lines = '';
  for (let i = -3; i <= 3; i++) lines += `<ellipse cx="24" cy="${24 + i * 4.500}" rx="${Math.sqrt(1 - (i / 3.6) ** 2) * 16}" ry="1.600" fill="none" stroke="${h1}" stroke-width=".6" opacity=".8"/>`;
  for (let i = 0; i < 4; i++) lines += `<ellipse cx="24" cy="24" rx="${4 + i * 4}" ry="16" fill="none" stroke="${h1}" stroke-width=".6" opacity=".7"/>`;
  return { w: 48, h: 66, s: `<defs>${G.rad(g, [[0, h1, .45], [1, h1, 0]])}${G.lin(b, [[0, '#6a7090'], [1, '#14161f']], 0, 1)}${G.lin(U('x'), [[0, h1, .5], [1, h1, 0]], 0, 1)}</defs>
    <circle cx="24" cy="24" r="24" fill="url(#${g})"/><path d="M14 56L4 30h40L34 56Z" fill="${h1}" opacity=".1"/>${lines}<circle cx="24" cy="24" r="16" fill="none" stroke="${h1}" stroke-width="1.100"/><ellipse cx="24" cy="24" rx="23" ry="5" fill="none" stroke="${h2}" stroke-width="1.200" transform="rotate(-14 24 24)"/>
    <path d="M14 56h20l5 9H9z" fill="url(#${b})"/><ellipse cx="24" cy="56" rx="10" ry="2.400" fill="${h1}" opacity=".9"/>` }; };


/* v6: vidriera con dragón en silueta corregido + ADN holográfico */
const DRAGON_S = K => `<g fill="${K}"><path d="M53 50C44 36 30 20 10 12Q15 25 6 31Q17 36 14 47Q25 49 28 58Q40 53 53 57Z"/><path d="M61 48C70 34 82 20 96 10Q90 23 98 30Q88 35 92 46Q82 48 82 58Q70 53 62 58Z"/>
 <path d="M46 28C58 30 63 40 58 52" fill="none" stroke="${K}" stroke-width="8" stroke-linecap="round"/><path d="M58 52C54 62 43 66 43 76C43 86 56 86 58 95" fill="none" stroke="${K}" stroke-width="11" stroke-linecap="round"/><path d="M58 95C60 105 48 110 40 106C32 102 30 94 36 92C41 90 44 95 40 98" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/>
 <path d="M47 19C42 17 35 19 29 24L31 26L37 26L35 28L41 30L49 29C51 26 51 22 47 19Z"/><path d="M46 19C49 12 53 7 59 3C56 9 54 14 51 21Z"/><path d="M44 20C45 14 47 9 51 5C50 11 49 15 48 21Z"/>
 <path d="M60 33l6-1-3 5zM63 43l6 1-5 4zM61 55l6 2-6 3zM50 69l-6 2 5 3zM55 86l6 1-5 4z"/><path d="M47 60L40 67L44 67L42 71L50 64Z"/><path d="M48 82L41 88L45 88L43 92L51 86Z"/></g><circle cx="40" cy="23" r="1.300" fill="#ffd36a"/>`;
DECO.vidriera = c => { const id = U('c'), g = U('g'), w = U('w'); const arch = 'M4 96V38C4 18 24 9 32 2 40 9 60 18 60 38V96Z', K = '#1b1020';
  return { w: 64, h: 102, s: `<defs><clipPath id="${id}"><path d="${arch}"/></clipPath>${G.rad(g, [[0, '#ffd36a', .85], [1, '#ff8a3c', 0]], .5, .75, .6)}${G.lin(w, [[0, '#8a5a30'], [1, '#33200f']], 0, 1)}</defs>
    <ellipse cx="32" cy="80" rx="38" ry="36" fill="url(#${g})"/>
    <g clip-path="url(#${id})"><rect width="64" height="102" fill="#f08a5a"/>
    <polygon points="0,0 32,0 32,30 0,38" fill="#6a4fb8"/><polygon points="32,0 64,0 64,38 32,30" fill="#2f66b0"/><polygon points="0,38 32,30 28,54 0,60" fill="#d8508a"/><polygon points="32,30 64,38 64,62 28,54" fill="#f0a04a"/><polygon points="0,60 28,54 20,80 0,84" fill="#f26a4a"/><polygon points="28,54 64,62 64,86 42,76 20,80" fill="#ffc15a"/><polygon points="0,84 20,80 42,76 64,86 64,102 0,102" fill="#ffe08a"/>
    <g stroke="${K}" stroke-width="1.100" fill="none" opacity=".85"><path d="M32 0v30M0 38l32-8 32 8M0 60l28-6 36 8M28 54l-8 26M42 76l22 10M0 84l20-4 22-4"/></g><g transform="translate(8 26) scale(.48)">${DRAGON_S(K)}</g><path d="M10 0L52 102" stroke="#fff" stroke-width="7" opacity=".1"/></g>
    <path d="${arch}" fill="none" stroke="${K}" stroke-width="3.200"/><path d="M7 94V39C7 21 25 12 32 6 39 12 57 21 57 39V94" fill="none" stroke="${K}" stroke-width=".8" opacity=".6"/>
    <rect x="1" y="95" width="62" height="7" rx="1.500" fill="url(#${w})"/><rect x="1" y="95" width="62" height="1.400" fill="#fff" opacity=".25"/>` }; };
DECO.adn = c => { const g = U('g'), b = U('b'); let s = '', p1 = 'M', p2 = 'M';
  for (let y = 4; y <= 52; y += 2) { const t = (y - 4) / 48 * Math.PI * 3, x1 = 18 + Math.sin(t) * 10, x2 = 18 - Math.sin(t) * 10; p1 += `${x1} ${y} `; p2 += `${x2} ${y} `; if (y % 4 === 0) s += `<path d="M${x1} ${y}H${x2}" stroke="#bffffb" stroke-width=".7" opacity="${.35 + Math.abs(Math.cos(t)) * .5}"/>`; }
  return { w: 36, h: 66, s: `<defs>${G.rad(g, [[0, '#25f4ee', .4], [1, '#25f4ee', 0]])}${G.lin(b, [[0, '#6a7090'], [1, '#14161f']], 0, 1)}</defs><ellipse cx="18" cy="28" rx="20" ry="30" fill="url(#${g})"/>${s}<path d="${p1}" fill="none" stroke="#25f4ee" stroke-width="1.600"/><path d="${p2}" fill="none" stroke="#ff2fb8" stroke-width="1.600"/><path d="M9 56h18l4 9H5z" fill="url(#${b})"/><ellipse cx="18" cy="56" rx="9" ry="2.200" fill="#25f4ee" opacity=".9"/>` }; };


/* v7: dragón en vuelo + mano robótica nueva */
const DRAGON_F = K => `<g fill="${K}"><path d="M41 50C43 38 48 23 56 10L80 3Q75 15 93 19Q79 27 88 40Q74 39 67 52Z"/><path d="M38 50C38 40 39 30 42 20L32 10Q34 20 26 24Q33 29 28 36Q34 38 33 46Z"/>
 <path d="M29 55C35 47 55 46 67 52C72 56 69 63 60 64C49 66 38 65 31 61Z"/><path d="M34 54C26 49 22 41 24 33" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round"/>
 <path d="M29 29C25 24 17 24 10 27L13 29L7 31C13 34 22 36 28 34Z"/><path d="M27 27L36 18L31 29Z"/><path d="M25 26L30 17L28 27Z"/>
 <path d="M62 57C76 58 84 67 81 77C78 86 85 91 92 86" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/><path d="M90 82L98 82L94 90L90 88Z"/>
 <path d="M57 61L60 71L55 75L62 75L64 64Z"/><path d="M38 60L35 68L30 70L37 71L42 62Z"/><path d="M26 39l-4-2 3-3zM29 46l-4 0 2-4zM47 49l1-4 3 3zM56 48l2-4 2 4zM72 57l3-3 1 4zM81 69l4-1-1 4z"/></g>
 <path d="M56 10L93 19M56 10L88 40M56 10L67 52" stroke="#4a2e3a" stroke-width=".8" fill="none"/><circle cx="16" cy="29" r="1.200" fill="#ffd36a"/>`;
DECO.vidriera = c => { const id = U('c'), g = U('g'), w = U('w'); const arch = 'M4 96V38C4 18 24 9 32 2 40 9 60 18 60 38V96Z', K = '#1b1020';
  return { w: 64, h: 102, s: `<defs><clipPath id="${id}"><path d="${arch}"/></clipPath>${G.rad(g, [[0, '#ffd36a', .85], [1, '#ff8a3c', 0]], .5, .75, .6)}${G.lin(w, [[0, '#8a5a30'], [1, '#33200f']], 0, 1)}</defs>
    <ellipse cx="32" cy="80" rx="38" ry="36" fill="url(#${g})"/>
    <g clip-path="url(#${id})"><rect width="64" height="102" fill="#f08a5a"/>
    <polygon points="0,0 32,0 32,30 0,38" fill="#6a4fb8"/><polygon points="32,0 64,0 64,38 32,30" fill="#2f66b0"/><polygon points="0,38 32,30 28,54 0,60" fill="#d8508a"/><polygon points="32,30 64,38 64,62 28,54" fill="#f0a04a"/><polygon points="0,60 28,54 20,80 0,84" fill="#f26a4a"/><polygon points="28,54 64,62 64,86 42,76 20,80" fill="#ffc15a"/><polygon points="0,84 20,80 42,76 64,86 64,102 0,102" fill="#ffe08a"/>
    <g stroke="${K}" stroke-width="1.100" fill="none" opacity=".85"><path d="M32 0v30M0 38l32-8 32 8M0 60l28-6 36 8M28 54l-8 26M42 76l22 10M0 84l20-4 22-4"/></g><g transform="translate(9 34) scale(.47)">${DRAGON_F(K)}</g><path d="M10 0L52 102" stroke="#fff" stroke-width="7" opacity=".1"/></g>
    <path d="${arch}" fill="none" stroke="${K}" stroke-width="3.200"/><path d="M7 94V39C7 21 25 12 32 6 39 12 57 21 57 39V94" fill="none" stroke="${K}" stroke-width=".8" opacity=".6"/>
    <rect x="1" y="95" width="62" height="7" rx="1.500" fill="url(#${w})"/><rect x="1" y="95" width="62" height="1.400" fill="#fff" opacity=".25"/>` }; };
DECO.mano = c => { const s = U('s'), d = U('d'), gd = U('g'), b = U('b'), gl = U('l');
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
    <path d="M16 42H42" stroke="#fff" stroke-width=".8" opacity=".5"/>` }; };


/* v8: dragón visto desde arriba */
const DRAGON_T = K => `<g fill="${K}"><path d="M45 34C34 26 18 22 3 26C9 29 10 33 7 37C13 37 16 41 14 45C20 44 24 47 24 52C30 49 36 50 40 54C42 46 44 40 46 38Z"/><path d="M55 34C66 26 82 22 97 26C91 29 90 33 93 37C87 37 84 41 86 45C80 44 76 47 76 52C70 49 64 50 60 54C58 46 56 40 54 38Z"/>
 <ellipse cx="50" cy="44" rx="6.500" ry="13"/><path d="M50 34V20" stroke="${K}" stroke-width="5.500" stroke-linecap="round"/><path d="M50 6C53 8 55 12 54 17C53 20 51 22 50 22C49 22 47 20 46 17C45 12 47 8 50 6Z"/><path d="M47 10L42 5L46 11ZM53 10L58 5L54 11Z"/>
 <path d="M50 56C50 66 56 72 56 80C56 88 46 90 44 84C43 80 47 78 49 80" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"/><path d="M47 82L43 86L49 87Z"/><path d="M44 38L38 36L39 40ZM56 38L62 36L61 40ZM44 52L38 56L41 57ZM56 52L62 56L59 57Z"/></g>
 <g stroke="#5a3a4a" stroke-width=".8" fill="none"><path d="M44 36L10 30M44 38L16 42M42 44L24 50M56 36L90 30M56 38L84 42M58 44L76 50"/></g><circle cx="48" cy="12" r="1" fill="#ffd36a"/><circle cx="52" cy="12" r="1" fill="#ffd36a"/>`;
DECO.vidriera = c => { const id = U('c'), g = U('g'), w = U('w'); const arch = 'M4 96V38C4 18 24 9 32 2 40 9 60 18 60 38V96Z', K = '#1b1020';
  return { w: 64, h: 102, s: `<defs><clipPath id="${id}"><path d="${arch}"/></clipPath>${G.rad(g, [[0, '#ffd36a', .85], [1, '#ff8a3c', 0]], .5, .75, .6)}${G.lin(w, [[0, '#8a5a30'], [1, '#33200f']], 0, 1)}</defs>
    <ellipse cx="32" cy="80" rx="38" ry="36" fill="url(#${g})"/>
    <g clip-path="url(#${id})"><rect width="64" height="102" fill="#f08a5a"/>
    <polygon points="0,0 32,0 32,30 0,38" fill="#6a4fb8"/><polygon points="32,0 64,0 64,38 32,30" fill="#2f66b0"/><polygon points="0,38 32,30 28,54 0,60" fill="#d8508a"/><polygon points="32,30 64,38 64,62 28,54" fill="#f0a04a"/><polygon points="0,60 28,54 20,80 0,84" fill="#f26a4a"/><polygon points="28,54 64,62 64,86 42,76 20,80" fill="#ffc15a"/><polygon points="0,84 20,80 42,76 64,86 64,102 0,102" fill="#ffe08a"/>
    <g stroke="${K}" stroke-width="1.100" fill="none" opacity=".85"><path d="M32 0v30M0 38l32-8 32 8M0 60l28-6 36 8M28 54l-8 26M42 76l22 10M0 84l20-4 22-4"/></g><g transform="translate(1 22) scale(.62)">${DRAGON_T(K)}</g><path d="M10 0L52 102" stroke="#fff" stroke-width="7" opacity=".1"/></g>
    <path d="${arch}" fill="none" stroke="${K}" stroke-width="3.200"/><path d="M7 94V39C7 21 25 12 32 6 39 12 57 21 57 39V94" fill="none" stroke="${K}" stroke-width=".8" opacity=".6"/>
    <rect x="1" y="95" width="62" height="7" rx="1.500" fill="url(#${w})"/><rect x="1" y="95" width="62" height="1.400" fill="#fff" opacity=".25"/>` }; };


/* ---------- LOMOS: ajuste de título, escenas, 10 estilos ---------- */
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
function ttl(o, b, extra = {}) {
  const O = { font: o.font || 'serif', wt: o.wt || 700, up: !!o.up, ls: o.ls ?? .04, it: !!o.it, max: o.max || 15 };
  const f = fit(o.title, b.h, b.w, O);
  return `<div class="tbox" style="left:${b.l}px;top:${b.t}px;width:${b.w}px;height:${b.h}px"><div class="tt ${b.fx ? 'fxs' : ''}" style="font-family:${FONT[O.font]};font-weight:${O.wt};${O.it ? 'font-style:italic;' : ''}font-size:${f.fs}px;letter-spacing:${O.ls}em;${O.up ? 'text-transform:uppercase;' : ''}color:${b.c || o.foil}">${f.lines.map(l => `<span>${esc(l)}</span>`).join('')}</div></div>`;
}
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
function spine(o) {
  const { w, h } = o, foil = o.foil, fa = lighten(foil, .38), fb = darken(foil, .32), acc = o.accent || darken(o.base, .3), seed = hs(o.title);
  let f = '';
  switch (o.type) {
    case 0: { // nervios + tejuelo
      const ribs = [8, 14, Math.round(h * .66), Math.round(h * .66) + 6, h - 20, h - 14].map((y, i) => `<i class="rib" style="top:${y}px;height:${i % 2 ? 2.5 : 4}px"></i>`).join('');
      f = ribs + `<div class="tej" style="left:4px;right:4px;top:22px;height:${Math.round(h * .46)}px"></div>` + ttl(o, { l: 4, t: 22, w: w - 8, h: Math.round(h * .46) }) + mo('diamond', Math.round(h * .66) + 14, 9); break; }
    case 1: // marco ornamental
      f = `<i class="frame"></i>` + mo(o.motif || 'leaf', 9, Math.min(15, w * .42)) + ttl(o, { l: 3, t: 28, w: w - 6, h: h - 60 - (o.num ? 20 : 0), fx: 1 }) + mo(o.motif2 || 'diamond', h - 25 - (o.num ? 20 : 0), Math.min(13, w * .36)); break;
    case 2: // damasco + etiqueta
      f = `<i class="damask"></i><i class="band" style="top:6px;height:2px"></i><i class="band" style="top:10px;height:1px"></i><i class="band" style="bottom:6px;height:2px"></i><i class="band" style="bottom:10px;height:1px"></i><div class="lab" style="top:${Math.round(h * .17)}px;height:${Math.round(h * .58)}px;background:${o.label}"></div>` + ttl(o, { l: 4, t: Math.round(h * .17), w: w - 8, h: Math.round(h * .58), c: o.ink }); break;
    case 3: // bloque moderno
      f = `<i class="band" style="top:12px;height:20px;background:${o.block}"></i>` + ttl(o, { l: 3, t: 40, w: w - 6, h: h - 40 - 34 }) + `<i class="ring" style="bottom:10px;width:${Math.min(13, w * .36)}px;height:${Math.min(13, w * .36)}px"></i>`; break;
    case 4: { // ilustrado
      const sh = Math.round(h * .36);
      f = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,${o.base},${o.accent || lighten(o.base, .25)} 70%,${o.sky2 || o.accent || lighten(o.base, .3)})"></div>` + stars(w, h * .5, 5, seed) +
        (o.moon ? `<div style="position:absolute;left:50%;top:${Math.round(h * .58)}px;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fffbe8,${o.moon});box-shadow:0 0 8px ${o.moon}"></div>` : '') +
        (o.cont ? `<div style="position:absolute;left:0;right:0;bottom:0;height:${sh}px;overflow:hidden"><div style="position:absolute;left:${-o.cont.off}px;bottom:0">${scene(o.scene, o.cont.total, sh, o.sil, o.sil2, o.cont.seed)}</div></div>` : scene(o.scene, w, sh, o.sil, o.sil2, seed)) +
        ttl(o, { l: 3, t: 12, w: w - 6, h: Math.round(h * .5) - 6, fx: 1 }); break; }
    case 5: { // art déco
      const rays = [...Array(7)].map((_, i) => { const a = (-70 + i * 23.3) * Math.PI / 180; return `<path d="M${w / 2} 0L${w / 2 + Math.sin(a) * 40} ${Math.cos(a) * 40}" stroke="${foil}" stroke-width=".8" opacity=".8"/>`; }).join('');
      f = `<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 3px,rgba(255,255,255,.06) 3px 4px)"></div><svg width="${w}" height="34" style="position:absolute;left:0;top:0;z-index:2;overflow:hidden">${rays}<circle cx="${w / 2}" cy="0" r="7" fill="${foil}"/><circle cx="${w / 2}" cy="0" r="10" fill="none" stroke="${foil}" stroke-width=".8"/></svg>` +
        `<div style="position:absolute;left:4px;right:4px;top:38px;bottom:42px;border:1px solid ${foil};border-radius:${Math.min(14, w / 2 - 2)}px;box-shadow:inset 0 0 0 2px ${o.base},inset 0 0 0 3px color-mix(in srgb,${foil} 60%,transparent);z-index:2"></div>` + ttl(o, { l: 9, t: 42, w: w - 18, h: h - 42 - 46 - (o.num ? 30 : 0), fx: 1 }) +
        `<svg width="${w}" height="30" style="position:absolute;left:0;bottom:4px;z-index:2"><path d="M4 8L${w / 2} 20 ${w - 4} 8M4 15L${w / 2} 27 ${w - 4} 15" fill="none" stroke="${foil}" stroke-width="1.200"/></svg>`; break; }
    case 6: { // capitular
      const d = Math.min(w - 8, 30);
      f = `<div style="position:absolute;left:50%;top:8px;width:${d}px;height:${d}px;margin-left:${-d / 2}px;border-radius:50%;background:${o.accent || darken(o.base, .3)};border:1px solid ${foil};box-shadow:inset 0 0 0 2px ${o.base},inset 0 0 0 3px ${foil}88;display:grid;place-items:center;z-index:3;color:${foil};font:700 ${d * .62}px/1 ${FONT.script}">${o.title[0].toUpperCase()}</div><i class="band" style="top:${d + 14}px;height:1.500px;left:6px;right:6px"></i>` + ttl(o, { l: 3, t: d + 20, w: w - 6, h: h - d - 20 - 26, fx: 1 }) + mo('star', h - 22, 11); break; }
    case 7: { // paperback
      f = `<div style="position:absolute;left:0;right:0;top:0;height:24px;background:${o.accent}"></div><div style="position:absolute;left:0;right:0;top:27px;height:2px;background:${o.accent}"></div><div style="position:absolute;left:0;right:0;bottom:0;height:20px;background:${o.accent}"></div>` +
        ttl(o, { l: 2, t: 34, w: w - 4, h: h - 34 - 26, c: o.ink }) + `<div style="position:absolute;left:50%;bottom:4px;width:12px;height:12px;margin-left:-6px;border-radius:50%;border:1.500px solid ${o.base};z-index:3"></div>`; break; }
    case 8: // estrellado
      f = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,${darken(o.base, .3)},${o.base} 60%,${lighten(o.base, .12)})"></div>` + stars(w, h, 14, seed, foil) + mo('moon', 8, Math.min(15, w * .45)) + ttl(o, { l: 3, t: 30, w: w - 6, h: h - 30 - 28, fx: 1 }) + mo('star', h - 22, 10); break;
    case 9: { // botánico
      const r = rng(seed); let v = `<path d="M${w * .3} ${h}C${w * .8} ${h * .9} ${w * .1} ${h * .76} ${w * .6} ${h * .62}" stroke="${o.leaf}" stroke-width="1.100" fill="none"/>`;
      for (let i = 0; i < 6; i++) { const t = i / 5, y = h - 10 - t * h * .36, x = w * (.3 + (i % 2 ? .38 : .08)) - 0; const sc = 1 - t * .3; v += `<path d="M${x} ${y}c${(i % 2 ? 1 : -1) * 6} -5 ${(i % 2 ? 1 : -1) * 12} -2 ${(i % 2 ? 1 : -1) * 13} 4 -6 3 -11 2 -13 -4z" fill="${o.leaf}" transform="scale(${sc}) translate(${x * (1 / sc - 1)} ${y * (1 / sc - 1)})" opacity=".95"/>`; }
      v += `<circle cx="${w * .6}" cy="${h * .62}" r="3.200" fill="${o.bloom}"/><circle cx="${w * .6 - 3}" cy="${h * .62 + 1}" r="2.200" fill="${lighten(o.bloom, .3)}"/>`;
      f = `<svg width="${w}" height="${h}" style="position:absolute;inset:0;z-index:2">${v}</svg><i class="band" style="top:6px;height:1.500px"></i><i class="band" style="top:10px;height:1px"></i>` + ttl(o, { l: 3, t: 16, w: w - 6, h: Math.round(h * .5), fx: 1 }); break; }
  }
  const num = o.num ? `<span class="num" style="--f:${foil}">${o.num}</span>` : '';
  return `<div class="it"><div class="bk ${o.lean ? 'lean' : ''}" style="--w:${w}px;--h:${h}px;--b:${o.base};--f:${foil};--fa:${fa};--fb:${fb};--ac:${acc}"><div class="face ${o.tex || ''}">${f}${num}</div></div></div>`;
}
const row = (items, label) => `<div class="row">${items.join('')}<div class="tabla"></div><div class="label">${label}</div></div>`;
const grp = (items, tag) => `<div class="grp">${items.join('')}<span class="gtag">${tag}</span></div>`;


/* ---------- LOMOS v3 ---------- */
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
function spine(o) {
  const { w, h } = o, foil = o.foil, fa = lighten(foil, .38), fb = darken(foil, .32), acc = o.accent || darken(o.base, .3), seed = hs(o.title);
  let f = '';
  switch (o.type) {
    case 0: {
      const ribs = [8, 14, Math.round(h * .66), Math.round(h * .66) + 6, h - 20, h - 14].map((y, i) => `<i class="rib" style="top:${y}px;height:${i % 2 ? 2.5 : 4}px"></i>`).join('');
      f = ribs + `<div class="tej" style="left:4px;right:4px;top:22px;height:${Math.round(h * .46)}px"></div>` + ttl(o, { l: 4, t: 22, w: w - 8, h: Math.round(h * .46) }) + mo('diamond', Math.round(h * .66) + 14, 9); break; }
    case 1: { const m = o.motif || 'leaf', ex = o.num ? 20 : 0;
      f = `<i class="frame"></i>` + mo(m, 11, Math.min(14, w * .4)) + ttl(o, { l: 8, t: 32, w: w - 16, h: h - 68 - ex, fx: 1 }) + mo(m, h - 27 - ex, Math.min(14, w * .4)); break; }
    case 2:
      f = `<i class="damask"></i><i class="band" style="top:6px;height:2px"></i><i class="band" style="top:10px;height:1px"></i><i class="band" style="bottom:6px;height:2px"></i><i class="band" style="bottom:10px;height:1px"></i><div class="lab" style="top:${Math.round(h * .17)}px;height:${Math.round(h * .58)}px;background:${o.label}"></div>` + ttl(o, { l: 4, t: Math.round(h * .17), w: w - 8, h: Math.round(h * .58), c: o.ink }); break;
    case 3:
      f = `<i class="band" style="top:12px;height:20px;background:${o.block}"></i>` + ttl(o, { l: 3, t: 40, w: w - 6, h: h - 40 - 34 }) + `<i class="ring" style="bottom:10px;width:${Math.min(13, w * .36)}px;height:${Math.min(13, w * .36)}px"></i>`; break;
    case 4: {
      const sh = Math.round(h * (o.scene === 'castle' ? .46 : .36));
      if (o.cont) {
        const T = o.cont.total, r = rng(o.cont.seed); let st = ''; for (let i = 0; i < 40; i++) st += `<circle cx="${r() * T}" cy="${6 + r() * h * .5}" r="${.5 + r()}" fill="#fff" opacity="${.5 + r() * .5}"/>`;
        const mx = T * .62;
        f = `<div style="position:absolute;inset:0;overflow:hidden"><svg width="${T}" height="${h}" style="position:absolute;left:${-o.cont.off}px;top:0" viewBox="0 0 ${T} ${h}"><defs><linearGradient id="sk${o.cont.seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.base}"/><stop offset=".62" stop-color="${o.accent}"/><stop offset="1" stop-color="${o.sky2}"/></linearGradient><radialGradient id="mn${o.cont.seed}"><stop offset="0" stop-color="#fffbe8"/><stop offset=".6" stop-color="${o.moon}"/><stop offset="1" stop-color="${o.moon}" stop-opacity="0"/></radialGradient></defs><rect width="${T}" height="${h}" fill="url(#sk${o.cont.seed})"/>${st}<circle cx="${mx}" cy="${h * .62}" r="26" fill="url(#mn${o.cont.seed})" opacity=".55"/><circle cx="${mx}" cy="${h * .62}" r="14" fill="#fff6d8"/>
        <g transform="translate(0 ${h - h * .56})">${sceneG('mountains', T, h * .56, o.sil, o.sil2, o.cont.seed)}</g><g transform="translate(0 ${h - h * .5})">${castleG(T, h * .5, o.sil, o.sil2, T * .3, 1.5)}</g><g transform="translate(0 ${h - h * .2})">${sceneG('forest', T, h * .2, o.sil, o.sil, o.cont.seed + 3)}</g></svg></div>` + ttl(o, { l: 3, t: 12, w: w - 6, h: Math.round(h * .42), fx: 1 });
      } else {
        f = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,${o.base},${o.accent || lighten(o.base, .25)} 70%,${o.sky2 || o.accent || lighten(o.base, .3)})"></div>` + stars(w, h * .5, 5, seed) +
          (o.moon ? `<div style="position:absolute;left:${o.scene === 'castle' ? '24%' : '50%'};top:${Math.round(h * (o.scene === 'castle' ? .6 : .5))}px;width:11px;height:11px;margin-left:-5px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fffbe8,${o.moon});box-shadow:0 0 8px ${o.moon}"></div>` : '') +
          `<svg width="${w}" height="${sh}" viewBox="0 0 ${w} ${sh}" style="position:absolute;bottom:0;left:0">${sceneG(o.scene, w, sh, o.sil, o.sil2, seed)}</svg>` + ttl(o, { l: 3, t: 12, w: w - 6, h: Math.round(h * .42) - 4, fx: 1 });
      } break; }
    case 5: {
      const rays = [...Array(7)].map((_, i) => { const a = (-70 + i * 23.3) * Math.PI / 180; return `<path d="M${w / 2} 0L${w / 2 + Math.sin(a) * 40} ${Math.cos(a) * 40}" stroke="${foil}" stroke-width=".8" opacity=".8"/>`; }).join('');
      f = `<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 3px,rgba(255,255,255,.06) 3px 4px)"></div><svg width="${w}" height="34" style="position:absolute;left:0;top:0;z-index:2;overflow:hidden">${rays}<circle cx="${w / 2}" cy="0" r="7" fill="${foil}"/><circle cx="${w / 2}" cy="0" r="10" fill="none" stroke="${foil}" stroke-width=".8"/></svg>` +
        `<div style="position:absolute;left:4px;right:4px;top:38px;bottom:42px;border:1px solid ${foil};border-radius:${Math.min(14, w / 2 - 2)}px;box-shadow:inset 0 0 0 2px ${o.base},inset 0 0 0 3px color-mix(in srgb,${foil} 60%,transparent);z-index:2"></div>` + ttl(o, { l: 9, t: 42, w: w - 18, h: h - 42 - 46, fx: 1 }) +
        `<svg width="${w}" height="30" style="position:absolute;left:0;bottom:4px;z-index:2"><path d="M4 8L${w / 2} 20 ${w - 4} 8M4 15L${w / 2} 27 ${w - 4} 15" fill="none" stroke="${foil}" stroke-width="1.200"/></svg>`; break; }
    case 6: { // inicial grande (sin círculo)
      const d = Math.min(w - 6, 30);
      f = `<div style="position:absolute;left:0;right:0;top:6px;height:${d + 4}px;display:flex;align-items:center;justify-content:center;z-index:3;color:${foil};font:400 ${d * 1.05}px/1 ${FONT.script};padding-bottom:${d * .08}px;text-shadow:0 1px 0 rgba(0,0,0,.5)">${o.title[0].toUpperCase()}</div><i class="band" style="top:${d + 14}px;height:1.500px;left:6px;right:6px"></i>` + ttl(o, { l: 3, t: d + 20, w: w - 6, h: h - d - 20 - 14, fx: 1 }); break; }
    case 7: { // escamas de dragón
      const id = 'sc' + seed, ac = o.accent || lighten(o.base, .3);
      f = `<svg width="${w}" height="${h}" style="position:absolute;inset:0"><defs><pattern id="${id}" width="12" height="8" patternUnits="userSpaceOnUse"><g fill="none" stroke="${ac}" stroke-width=".8" opacity=".8"><path d="M0 8a6 6 0 0 1 12 0M-6 4a6 6 0 0 1 12 0M6 4a6 6 0 0 1 12 0"/><path d="M2.500 8a3.500 3.500 0 0 1 7 0M-3.500 4a3.500 3.500 0 0 1 7 0M8.500 4a3.500 3.500 0 0 1 7 0" opacity=".6"/></g></pattern></defs><rect width="${w}" height="${h}" fill="url(#${id})"/></svg>` +
        `<i class="band" style="top:7px;height:2px"></i><i class="band" style="bottom:7px;height:2px"></i><div class="lab" style="top:${Math.round(h * .18)}px;height:${Math.round(h * .56)}px;background:${o.base};box-shadow:inset 0 0 0 1px ${foil},inset 0 0 0 3px ${o.base},inset 0 0 0 4px ${foil}99,0 1px 3px rgba(0,0,0,.6)"></div>` + ttl(o, { l: 7, t: Math.round(h * .18) + 3, w: w - 14, h: Math.round(h * .56) - 6, fx: 1 }) + mo('diamond', h - 26, 10); break; }
    case 8:
      f = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,${darken(o.base, .3)},${o.base} 60%,${lighten(o.base, .12)})"></div>` + stars(w, h, 14, seed, foil) + mo('moon', 8, Math.min(15, w * .45)) + ttl(o, { l: 3, t: 30, w: w - 6, h: h - 30 - 28, fx: 1 }) + mo('star', h - 22, 10); break;
    case 9: { // botánico completo
      const lf = o.leaf, bl = o.bloom, r = Math.min(w * .3, 11); let v = '';
      v += `<path d="M${w * .5} ${h - 20}C${w * .5} ${h - 40} ${w * .3} ${h - 50} ${w * .5} ${h - 62}" stroke="${lf}" stroke-width="1.100" fill="none"/>`;
      v += leafP(w * .5, h - 36, -150, w * .45, lf) + leafP(w * .5, h - 36, -30, w * .45, lf) + leafP(w * .42, h - 48, -140, w * .3, lf) + leafP(w * .44, h - 54, -20, w * .28, lf);
      v += leafP(w * .22, h - 12, -120, w * .4, lf) + leafP(w * .78, h - 12, -60, w * .4, lf);
      v += flowerG(w * .22, h - 28, r * .62, bl) + flowerG(w * .78, h - 27, r * .62, bl) + flowerG(w * .5, h - 20, r, bl);
      v += leafP(w * .5, 20, -90, 11, lf) + leafP(w * .5, 20, -150, 9, lf) + leafP(w * .5, 20, -30, 9, lf) + `<circle cx="${w * .5}" cy="9" r="2.600" fill="${bl}" stroke="${darken(bl, .4)}" stroke-width=".4"/><path d="M${w * .5} 12V22" stroke="${lf}" stroke-width="1"/>`;
      f = `<svg width="${w}" height="${h}" style="position:absolute;inset:0;z-index:2">${v}</svg>` + ttl(o, { l: 3, t: 28, w: w - 6, h: h - 28 - 76, fx: 1 }); break; }
    case 10: { // glitch ciberpunk
      const r = rng(seed); let sl = ''; for (let i = 0; i < 7; i++) { const y = 10 + r() * (h - 20), hh = 1.5 + r() * 4, dx = (r() - .5) * 8; sl += `<i style="position:absolute;left:${dx}px;right:${-dx}px;top:${y}px;height:${hh}px;background:${r() > .5 ? '#ff2fb8' : '#25f4ee'};opacity:.75;mix-blend-mode:screen"></i>`; }
      f = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#0d0a1c,${o.base})"></div><div style="position:absolute;left:0;right:0;top:0;height:14px;background:${o.block || '#ffd400'}"></div>${sl}` + ttl({ ...o, foil: '#fff' }, { l: 3, t: 22, w: w - 6, h: h - 22 - 30 }).replace('<div class="tt', '<div style="text-shadow:-1.500px 0 #ff2fb8,1.500px 0 #25f4ee" class="tt') + `<i class="ring" style="bottom:9px;width:9px;height:9px;border-color:#25f4ee;box-shadow:0 0 6px #25f4ee"></i>`; break; }
  }
  const num = o.num ? `<span class="num" style="--f:${foil}">${o.num}</span>` : '';
  return `<div class="it"><div class="bk ${o.lean ? 'lean' : ''}" style="--w:${w}px;--h:${h}px;--b:${o.base};--f:${foil};--fa:${fa};--fb:${fb};--ac:${acc}"><div class="face ${o.tex || ''}">${f}${num}</div></div></div>`;
}


/* ---------- LOMOS v6 ---------- */
const DRAGON_SIL = 'M8 34L16 30 22 32 30 30C36 28 42 30 48 32L56 34C64 36 72 36 80 34 86 33 92 34 98 38 92 37 86 37 80 38 72 40 62 40 54 40L46 40C40 40 34 38 28 38L20 38 14 40ZM38 32L46 6 52 14 58 4 62 16 70 10 66 26 56 32ZM44 37L36 52 48 46 54 56 58 39Z';
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
        `<div style="position:absolute;left:4px;right:4px;top:38px;bottom:42px;border:1px solid ${foil};border-radius:${Math.min(14, w / 2 - 2)}px;box-shadow:inset 0 0 0 2px ${o.base},inset 0 0 0 3px color-mix(in srgb,${foil} 60%,transparent);z-index:2"></div>` + ttl(o, { l: 9, t: 42, w: w - 18, h: h - 42 - 46 - (o.num ? 30 : 0), fx: 1 }) +
        `<svg width="${w}" height="30" style="position:absolute;left:0;bottom:4px;z-index:2"><path d="M4 8L${w / 2} 20 ${w - 4} 8M4 15L${w / 2} 27 ${w - 4} 15" fill="none" stroke="${foil}" stroke-width="1.200"/></svg>`; numTop = h - 42 - 21; break; }
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

function moonPhase(k, n, y, s, col, bg) { const r = s / 2 - 1, off = 2 * r * (k / n); return `<svg class="orn fxs" style="top:${y}px" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="${col}"/>${k < n ? `<circle cx="${s / 2 - off}" cy="${s / 2}" r="${r + .3}" fill="${bg}"/>` : ''}<circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="${col}" stroke-width=".7"/></svg>`; }

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


/* ---------- lomos sci-fi: propuestas ---------- */
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
function sfSpine(kind, o) { const w = o.w, h = o.h, sd = hs(o.title + kind); return `<div class="it"><div class="bk" style="--w:${w}px;--h:${h}px;--b:#111"><div class="face">${SF[kind](o, w, h, sd)}</div></div></div>`; }


/* ---------- CORONAS (parte superior distinta por categoría) ---------- */
const sv = (h, inner, defs = '') => `<svg class="crown" viewBox="0 0 358 ${h}" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${inner}</svg>`;
function crownGothic(name) {
  const defs = `${G.lin('gw', [[0, '#4a3d34'], [.5, '#251d18'], [1, '#120d0a']], 0, 1)}${G.lin('gc', [[0, '#fbe3cc'], [1, '#d0a07a']], 0, 1)}${G.lin('gp', [[0, '#d6b8ff'], [.5, '#9a6aea'], [1, '#4a2a90']], 1, 1)}${G.lin('gpd', [[0, '#8a5ad0'], [1, '#33186a']], 0, 1)}<filter id="gg"><feGaussianBlur stdDeviation="3"/></filter>
  <pattern id="gr" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke="#fff" stroke-width=".3" opacity=".06"/></pattern>`;
  const tower = x => `<g><path d="M${x} 160V70L${x + 13} 8L${x + 26} 70V160Z" fill="url(#gw)" stroke="#080504" stroke-width="1.200"/><path d="M${x + 4.500} 70L${x + 13} 22L${x + 21.500} 70Z" fill="none" stroke="url(#gc)" stroke-width="1.300"/><path d="M${x + 13} 28V66" stroke="url(#gc)" stroke-width=".8"/><circle cx="${x + 13}" cy="7" r="2.600" fill="url(#gc)"/><path d="M${x + 13} 4V0" stroke="url(#gc)" stroke-width="1.200"/><rect x="${x + 5}" y="80" width="16" height="64" rx="8" ry="8" fill="none" stroke="url(#gc)" stroke-width="1" opacity=".85"/><path d="M${x + 13} 88V136" stroke="url(#gc)" stroke-width=".6" opacity=".7"/></g>`;
  const crys = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><polygon points="-12,0 -8,-14 -4,0" fill="url(#gp)"/><polygon points="-5,0 0,-24 5,0" fill="url(#gp)"/><polygon points="4,0 9,-15 13,0" fill="url(#gp)"/><polygon points="0,-24 5,0 0,0" fill="url(#gpd)" opacity=".6"/><path d="M0 -24L-2 -4" stroke="#fff" stroke-width=".7" opacity=".6"/></g>`;
  const moon = (x, y) => `<g transform="translate(${x} ${y})" fill="none" stroke="url(#gc)" stroke-width="1.100"><path d="M6 -8A9 9 0 1 0 6 8 7 7 0 1 1 6 -8z" fill="url(#gc)" fill-opacity=".25"/><path d="M14 -6l1.500 3.500 3.500 1.500-3.500 1.500L14 6l-1.500-3.500L9 1l3.500-1.500z" fill="url(#gc)" stroke="none"/></g>`;
  const inner = `<path d="M26 160V112C26 70 112 46 179 10C246 46 332 70 332 112V160Z" fill="url(#gw)" stroke="#080504" stroke-width="1.200"/><path d="M26 160V112C26 70 112 46 179 10C246 46 332 70 332 112V160Z" fill="url(#gr)"/>
  <path d="M33 160V114C33 78 114 54 179 20C244 54 325 78 325 114V160" fill="none" stroke="url(#gc)" stroke-width="2.200"/><path d="M39 160V116C39 84 116 60 179 28C242 60 319 84 319 116V160" fill="none" stroke="url(#gc)" stroke-width=".7" opacity=".7"/>
  <g stroke="url(#gc)" fill="url(#gc)"><circle cx="179" cy="14" r="2.800"/></g>
  <path d="M62 160V122C62 100 128 84 179 56C230 84 296 100 296 122V160Z" fill="#100c09" stroke="url(#gc)" stroke-width="1.600"/><path d="M67 160V123C67 104 130 89 179 63C228 89 291 104 291 123V160" fill="none" stroke="url(#gc)" stroke-width=".6" opacity=".6"/>
  <circle cx="179" cy="40" r="26" fill="#9a6aea" opacity=".45" filter="url(#gg)"/>${crys(179, 56, .85)}
  ${moon(86, 112)}${moon(272, 112)}
  <g fill="none" stroke="url(#gc)" stroke-width="1"><path d="M44 152C52 140 62 138 70 142M314 152C306 140 296 138 288 142M104 96c8 2 14 6 18 12M254 96c-8 2-14 6-18 12"/><circle cx="112" cy="92" r="2" fill="url(#gc)" stroke="none"/><circle cx="246" cy="92" r="2" fill="url(#gc)" stroke="none"/></g>
  ${tower(0)}${tower(332)}`;
  return `<div class="crownw">${sv(160, inner, defs)}<div class="plaq" style="top:118px;color:#f8dcc2;font:600 15px 'GFS Baskerville',serif;letter-spacing:.22em;text-transform:uppercase;text-shadow:0 1px 0 #000,0 0 10px rgba(255,190,120,.55)">${name}</div><div class="plaq" style="top:138px;color:#d0a07a;font:8px 'Inter';letter-spacing:.5em;opacity:.9">✦ ✦ ✦</div></div>`;
}
function fan(cx, cy, r, n, rot) { let s = ''; const a0 = -165, a1 = -15; for (let i = 0; i < n; i++) { const A = (a0 + (a1 - a0) * i / n) * Math.PI / 180, B = (a0 + (a1 - a0) * (i + 1) / n) * Math.PI / 180, M = (A + B) / 2; const p = (a, rr) => `${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr}`; s += `<path d="M${cx} ${cy}L${p(A, r)}Q${p(M, r * 1.18)} ${p(B, r)}Z" fill="url(#iv)" stroke="#bda97f" stroke-width=".6"/><path d="M${cx} ${cy}L${p(M, r * 1.02)}" stroke="#d3c4a0" stroke-width=".6"/>`; } return `<g transform="rotate(${rot} ${cx} ${cy})">${s}<ellipse cx="${cx}" cy="${cy + 1}" rx="${r * .36}" ry="${r * .22}" fill="url(#iv)" stroke="#bda97f" stroke-width=".6"/></g>`; }
const flor = (x, y, r) => { let p = ''; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; p += `<ellipse cx="${x + Math.cos(a) * r * .9}" cy="${y + Math.sin(a) * r * .9}" rx="${r * .62}" ry="${r * .42}" transform="rotate(${i * 60} ${x + Math.cos(a) * r * .9} ${y + Math.sin(a) * r * .9})" fill="url(#iv)" stroke="#bda97f" stroke-width=".5"/>`; } return p + `<circle cx="${x}" cy="${y}" r="${r * .5}" fill="#efe4c8" stroke="#bda97f" stroke-width=".5"/><circle cx="${x}" cy="${y}" r="${r * .22}" fill="#d9b25f"/>`; };
function crownRococo(name) {
  const defs = `${G.lin('ow', [[0, '#f8ead0'], [.55, '#e3caa0'], [1, '#c3a276']], 0, 1)}${G.lin('ow2', [[0, '#e9d3ab'], [1, '#d3b688']], 0, 1)}${G.lin('iv', [[0, '#fffdf6'], [.55, '#f3ead8'], [1, '#d6c8a8']], 1, 1)}<filter id="rel" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1.200" dy="1.800" stdDeviation="1.100" flood-color="#5a4020" flood-opacity=".5"/></filter>
  <g id="leaf"><path d="M0 0C4-8 15-8 20 0 15 5 4 5 0 0z" fill="url(#iv)" stroke="#bda97f" stroke-width=".6"/><path d="M2 0H18" stroke="#d3c4a0" stroke-width=".5"/></g>
  <g id="orn" filter="url(#rel)"><path d="M34 22C48 8 68 8 84 18C96 26 90 42 77 39C67 37 69 26 77 29" fill="none" stroke="#bda97f" stroke-width="7.500" stroke-linecap="round"/><path d="M34 22C48 8 68 8 84 18C96 26 90 42 77 39C67 37 69 26 77 29" fill="none" stroke="url(#iv)" stroke-width="6" stroke-linecap="round"/>
   <path d="M22 34C8 48 8 68 18 84C26 96 42 90 39 77C37 67 26 69 29 77" fill="none" stroke="#bda97f" stroke-width="7.500" stroke-linecap="round"/><path d="M22 34C8 48 8 68 18 84C26 96 42 90 39 77C37 67 26 69 29 77" fill="none" stroke="url(#iv)" stroke-width="6" stroke-linecap="round"/>
   <use href="#leaf" transform="translate(48 12) rotate(-25) scale(.95)"/><use href="#leaf" transform="translate(64 10) rotate(10) scale(.9)"/><use href="#leaf" transform="translate(86 28) rotate(70) scale(.85)"/><use href="#leaf" transform="translate(12 48) rotate(-115) scale(.95)"/><use href="#leaf" transform="translate(10 64) rotate(-80) scale(.9)"/><use href="#leaf" transform="translate(28 86) rotate(-20) scale(.85)"/>
   <use href="#leaf" transform="translate(40 40) rotate(45) scale(1.5)"/>
   ${fan(26, 26, 17, 8, -45)}${flor(54, 30, 4.600)}${flor(30, 54, 4.600)}${flor(14, 14, 3)}</g>`;
  const inner = `<g filter="url(#rel)"><rect x="-8" y="0" width="374" height="9" rx="3" fill="url(#ow)"/></g><rect x="-3" y="9" width="364" height="6" fill="url(#ow2)"/>${[...Array(40)].map((_, i) => `<rect x="${1 + i * 9}" y="15" width="5" height="5.500" fill="#fbf4e4" stroke="#c9b58a" stroke-width=".4"/>`).join('')}<rect x="0" y="20" width="358" height="5" fill="url(#ow)"/>
  <rect x="0" y="25" width="358" height="100" fill="url(#ow)"/><rect x="0" y="25" width="358" height="100" fill="none" stroke="#b79a6c" stroke-width=".8"/>
  <rect x="10" y="34" width="338" height="82" rx="3" fill="url(#ow2)" stroke="#fffaf0" stroke-width="3"/><rect x="10" y="34" width="338" height="82" rx="3" fill="none" stroke="#a98d60" stroke-width=".8"/><rect x="17" y="41" width="324" height="68" rx="2" fill="none" stroke="#fffaf0" stroke-width="1.500"/><rect x="17" y="41" width="324" height="68" rx="2" fill="none" stroke="#a98d60" stroke-width=".5" opacity=".8"/>
  <use href="#orn" transform="translate(11 35) scale(.88)"/><use href="#orn" transform="translate(347 35) scale(-.88 .88)"/>
  <g filter="url(#rel)" transform="translate(179 44)"><path d="M0 0C-14 -2 -26 4 -36 12M0 0C14 -2 26 4 36 12" fill="none" stroke="#bda97f" stroke-width="5.500" stroke-linecap="round"/><path d="M0 0C-14 -2 -26 4 -36 12M0 0C14 -2 26 4 36 12" fill="none" stroke="url(#iv)" stroke-width="4.200" stroke-linecap="round"/>${fan(0, 12, 12, 7, 0).replace('rotate(0', 'rotate(180').replace(/transform="rotate\(180 0 12\)"/, 'transform="translate(0 20) scale(1 -1)"')}</g>
  <g filter="url(#rel)"><path d="M100 98c18-8 34 6 52-2s26 4 27 8c1-4 9-16 27-8s34-6 52 2" fill="none" stroke="#bda97f" stroke-width="3.200" stroke-linecap="round"/><path d="M100 98c18-8 34 6 52-2s26 4 27 8c1-4 9-16 27-8s34-6 52 2" fill="none" stroke="url(#iv)" stroke-width="2.200" stroke-linecap="round"/>${[112, 136, 160, 198, 222, 246].map((x, i) => `<use href="#leaf" transform="translate(${x} ${i % 2 ? 100 : 94}) rotate(${i % 2 ? 40 : -40}) scale(.55)"/>`).join('')}</g>
  <g filter="url(#rel)"><path d="M120 76h118q8 0 8 8t-8 8H120q-8 0-8-8t8-8z" fill="url(#iv)" stroke="#bda97f" stroke-width=".7"/></g>`;
  return `<div class="crownw">${sv(126, inner, defs)}<div class="plaq" style="top:77px;color:#7a5530;font:700 12.500px 'GFS Baskerville',serif;letter-spacing:.2em;text-transform:uppercase;text-shadow:0 1px 0 rgba(255,255,255,.8)">${name}</div></div>`;
}
function crownStation(name) {
  const defs = `${G.lin('sc', [[0, '#fbfcfe'], [.55, '#d5dbe5'], [1, '#9aa5b6']], 0, 1)}${G.lin('sr', [[0, '#eef2f7'], [.5, '#8f9bad'], [1, '#4a5568']], 1, 1)}${G.rad('sp', [[0, '#7fe8dc'], [.5, '#2aa89c'], [1, '#0b3a44']], .35, .35, .8)}${G.lin('sk', [[0, '#05081a'], [1, '#14204a']], 0, 1)}<clipPath id="sw"><circle cx="179" cy="58" r="33"/></clipPath>
  <pattern id="hz" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="10" fill="#f08a2c"/><rect x="5" width="5" height="10" fill="#1b1f2a"/></pattern><filter id="sg"><feGaussianBlur stdDeviation="2.500"/></filter>`;
  const bolts = [...Array(10)].map((_, i) => { const a = i * Math.PI / 5; return `<circle cx="${179 + Math.cos(a) * 41}" cy="${58 + Math.sin(a) * 41}" r="1.700" fill="#5a6577" stroke="#fff" stroke-width=".4"/>`; }).join('');
  const inner = `<path d="M0 124V22L16 6H342L358 22V124Z" fill="url(#sc)" stroke="#6b7686" stroke-width="1"/><path d="M0 24L16 8M358 24L342 8" stroke="#fff" stroke-width="1" opacity=".7"/><rect x="16" y="6" width="326" height="3.500" fill="#f08a2c"/><path d="M8 22H350" stroke="#aab4c3" stroke-width=".8"/>
  <rect x="14" y="30" width="100" height="62" rx="5" fill="#0c1220" stroke="#6b7686" stroke-width="1.200"/><rect x="14" y="30" width="100" height="62" rx="5" fill="none" stroke="#fff" stroke-width=".5" opacity=".6"/>
  <g stroke="#38e0d2" fill="none" stroke-width="1.200"><path d="M22 66l9-12 8 16 9-22 8 26 8-14 9 6 8-10 9 4" /></g><g fill="#38e0d2" opacity=".8">${[...Array(7)].map((_, i) => `<rect x="${22 + i * 12}" y="${86 - (i * 7) % 11}" width="7" height="${3 + (i * 7) % 11}"/>`).join('')}</g><g stroke="#38e0d2" opacity=".5" stroke-width=".6"><path d="M22 38h50M22 43h34"/></g>
  <rect x="244" y="30" width="100" height="62" rx="5" fill="#d8dfe9" stroke="#6b7686" stroke-width="1.200"/>${[...Array(7)].map((_, i) => `<rect x="254" y="${37 + i * 7.500}" width="80" height="3.500" rx="1.700" fill="#8b97a8"/><rect x="254" y="${37 + i * 7.500}" width="${30 + (i * 17) % 48}" height="3.500" rx="1.700" fill="#6b7686"/>`).join('')}<circle cx="334" cy="39" r="2.200" fill="#f08a2c"/><circle cx="334" cy="46" r="2.200" fill="#38e0d2"/>
  <circle cx="179" cy="58" r="48" fill="#aab4c3" opacity=".5" filter="url(#sg)"/><circle cx="179" cy="58" r="46" fill="url(#sr)" stroke="#2a3342" stroke-width="1"/><circle cx="179" cy="58" r="37" fill="#1c2431" stroke="#0a0f18" stroke-width="1.500"/>${bolts}
  <g clip-path="url(#sw)"><rect x="140" y="20" width="80" height="80" fill="url(#sk)"/><g fill="#fff">${[...Array(26)].map((_, i) => `<circle cx="${146 + (i * 37) % 70}" cy="${26 + (i * 53) % 64}" r="${.4 + (i % 3) * .35}" opacity="${.5 + (i % 4) * .12}"/>`).join('')}</g>
   <circle cx="188" cy="74" r="30" fill="#f08a2c" opacity=".55" filter="url(#sg)"/><circle cx="188" cy="74" r="26" fill="url(#sp)"/><path d="M164 70c10 6 28 4 46-6M165 80c10 6 26 6 44-2" stroke="#0b3a44" stroke-width="2" opacity=".35" fill="none"/><ellipse cx="188" cy="74" rx="40" ry="6" fill="none" stroke="#ffd9a0" stroke-width="1.600" opacity=".8" transform="rotate(-16 188 74)"/>
   <path d="M150 36A40 40 0 0 1 200 26" stroke="#fff" stroke-width="5" opacity=".13" fill="none" stroke-linecap="round"/></g>
  <rect x="14" y="98" width="84" height="9" fill="url(#hz)" stroke="#1b1f2a" stroke-width=".8"/><rect x="260" y="98" width="84" height="9" fill="url(#hz)" stroke="#1b1f2a" stroke-width=".8"/>
  <rect x="104" y="98" width="150" height="21" rx="4" fill="#0c1220" stroke="#6b7686" stroke-width="1.200"/><rect x="124" y="98" width="110" height="21" rx="4" fill="none" stroke="#f08a2c" stroke-width=".6" opacity=".8"/>`;
  return `<div class="crownw">${sv(124, inner, defs)}<div class="plaq" style="top:103px;color:#ffb84d;font:700 9.500px 'Poppins',sans-serif;letter-spacing:.24em;text-transform:uppercase;text-shadow:0 0 8px rgba(255,160,50,.9)">${name}</div></div>`;
}
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
  let sc = ''; const n = 13, ww = 358 / n; for (let i = 0; i < n; i++) sc += `a${ww / 2} ${ww / 2} 0 0 1 ${-ww} 0`; // sin usar
  let d = 'M0 0H358V46'; for (let i = 0; i < n; i++) d += `a${ww / 2} ${ww / 2} 0 0 1 ${-ww} 0`; d += 'Z';
  const defs = `${G.lin('rp', [[0, '#fbc9d6'], [1, '#e08aa4']], 0, 1)}${G.lin('rg', [[0, '#fff3d6'], [1, '#d9b25f']], 0, 1)}`;
  let dots = ''; for (let i = 0; i < n; i++) dots += `<circle cx="${358 - ww / 2 - i * ww}" cy="${46 + ww / 2 - 5}" r="2" fill="url(#rg)"/>`;
  const inner = `<rect x="-6" y="0" width="370" height="10" rx="4" fill="url(#rp)" stroke="#c9728f" stroke-width=".6"/><path d="${d.replace('M0 0H358V46', 'M0 10H358V46')}" fill="url(#rp)" stroke="#c9728f" stroke-width=".8"/><path d="M0 14H358" stroke="#fff" stroke-width="1.500" opacity=".7"/>${dots}<g transform="translate(179 37) scale(.8)"><path d="M0 8C-14 -4 -9 -14 0 -6 9 -14 14 -4 0 8z" fill="url(#rg)" stroke="#a8782a" stroke-width=".6"/></g>`;
  return `<div class="crownw">${sv(66, inner, defs)}<div class="plaq" style="top:15px;color:#8a3a52;font:700 10.500px 'GFS Baskerville',serif;letter-spacing:.22em;text-transform:uppercase">${name}</div></div>`;
}


function archP(x0, x1, ys, A, inset = 0) { const xm = (x0 + x1) / 2, a = x0 + inset, b = x1 - inset, y = ys, ap = A - inset * 1.1; return `M${a} 160V${y}C${a} ${y - ap * .35} ${xm - 7} ${y - ap * .8} ${xm} ${y - ap}C${xm + 7} ${y - ap * .8} ${b} ${y - ap * .35} ${b} ${y}V160`; }
function crownGothic(name) {
  const defs = `${G.lin('gw', [[0, '#8e6244'], [.5, '#5a3822'], [1, '#2f1b0e']], 0, 1)}${G.lin('gc', [[0, '#fbe3cc'], [1, '#d0a07a']], 0, 1)}
  <pattern id="gr" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke="#fff" stroke-width=".3" opacity=".06"/></pattern>`;
  const tower = x => `<g><path d="M${x} 160V70L${x + 13} 8L${x + 26} 70V160Z" fill="url(#gw)" stroke="#1c0f07" stroke-width="1.200"/><path d="M${x + 4.500} 70L${x + 13} 22L${x + 21.500} 70Z" fill="none" stroke="url(#gc)" stroke-width="1.300"/><rect x="${x + 5}" y="80" width="16" height="64" rx="8" ry="8" fill="none" stroke="url(#gc)" stroke-width="1" opacity=".85"/></g>`;
  const arc = (x0, x1, ys, A, fill = '#1f1209') => `<path d="${archP(x0, x1, ys, A)}Z" fill="${fill}" stroke="url(#gc)" stroke-width="1.500"/><path d="${archP(x0, x1, ys, A, 5)}" fill="none" stroke="url(#gc)" stroke-width=".7" opacity=".75"/>`;
  const inner = `<path d="M26 160V112C26 70 112 46 179 10C246 46 332 70 332 112V160Z" fill="url(#gw)" stroke="#1c0f07" stroke-width="1.200"/><path d="M26 160V112C26 70 112 46 179 10C246 46 332 70 332 112V160Z" fill="url(#gr)"/>
  <path d="M33 160V114C33 78 114 54 179 20C244 54 325 78 325 114V160" fill="none" stroke="url(#gc)" stroke-width="2.200"/><path d="M39 160V116C39 84 116 60 179 28C242 60 319 84 319 116V160" fill="none" stroke="url(#gc)" stroke-width=".7" opacity=".7"/>
  <path d="M62 160V122C62 100 128 84 179 56C230 84 296 100 296 122V160Z" fill="#3a2315" stroke="url(#gc)" stroke-width="1.600"/>
  ${arc(76, 116, 146, 34)}${arc(242, 282, 146, 34)}${arc(120, 238, 138, 56)}
  ${tower(0)}${tower(332)}`;
  return `<div class="crownw">${sv(160, inner, defs)}<div class="plaq" style="top:121px;color:#f8dcc2;font:600 13.500px 'GFS Baskerville',serif;letter-spacing:.2em;text-transform:uppercase;text-shadow:0 1px 0 #000,0 0 10px rgba(255,190,120,.45)">${name}</div></div>`;
}
function crownRococo(name) {
  const defs = `${G.lin('ow', [[0, '#f8ead0'], [.55, '#e3caa0'], [1, '#c3a276']], 0, 1)}${G.lin('ow2', [[0, '#ebd6ae'], [1, '#d6b98b']], 0, 1)}${G.lin('iv', [[0, '#fffdf6'], [.55, '#f3ead8'], [1, '#d6c8a8']], 1, 1)}<filter id="rel" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1.200" dy="1.800" stdDeviation="1.100" flood-color="#5a4020" flood-opacity=".5"/></filter>
  <g id="leaf"><path d="M0 0C4-8 15-8 20 0 15 5 4 5 0 0z" fill="url(#iv)" stroke="#bda97f" stroke-width=".6"/><path d="M2 0H18" stroke="#d3c4a0" stroke-width=".5"/></g>
  <g id="orn" filter="url(#rel)"><path d="M34 22C48 8 68 8 84 18C96 26 90 42 77 39C67 37 69 26 77 29" fill="none" stroke="#bda97f" stroke-width="7.500" stroke-linecap="round"/><path d="M34 22C48 8 68 8 84 18C96 26 90 42 77 39C67 37 69 26 77 29" fill="none" stroke="url(#iv)" stroke-width="6" stroke-linecap="round"/>
   <path d="M22 34C8 48 8 68 18 84C26 96 42 90 39 77C37 67 26 69 29 77" fill="none" stroke="#bda97f" stroke-width="7.500" stroke-linecap="round"/><path d="M22 34C8 48 8 68 18 84C26 96 42 90 39 77C37 67 26 69 29 77" fill="none" stroke="url(#iv)" stroke-width="6" stroke-linecap="round"/>
   <use href="#leaf" transform="translate(48 12) rotate(-25) scale(.95)"/><use href="#leaf" transform="translate(64 10) rotate(10) scale(.9)"/><use href="#leaf" transform="translate(86 28) rotate(70) scale(.85)"/><use href="#leaf" transform="translate(12 48) rotate(-115) scale(.95)"/><use href="#leaf" transform="translate(10 64) rotate(-80) scale(.9)"/><use href="#leaf" transform="translate(28 86) rotate(-20) scale(.85)"/>
   ${fan(26, 26, 17, 8, -45)}${flor(56, 32, 4.200)}${flor(32, 56, 4.200)}</g>`;
  const cap = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2}" fill="url(#iv)" stroke="#bda97f" stroke-width=".7"/>`;
  const inner = `<g filter="url(#rel)"><rect x="-8" y="0" width="374" height="9" rx="3" fill="url(#ow)"/></g><rect x="-3" y="9" width="364" height="6" fill="url(#ow2)"/>${[...Array(40)].map((_, i) => `<rect x="${1 + i * 9}" y="15" width="5" height="5.500" fill="#fbf4e4" stroke="#c9b58a" stroke-width=".4"/>`).join('')}<rect x="0" y="20" width="358" height="5" fill="url(#ow)"/>
  <rect x="0" y="25" width="358" height="100" fill="url(#ow)"/><rect x="0" y="25" width="358" height="100" fill="none" stroke="#b79a6c" stroke-width=".8"/>
  <rect x="9" y="33" width="340" height="84" rx="2" fill="url(#ow2)" stroke="#fffaf0" stroke-width="3.500"/><rect x="9" y="33" width="340" height="84" rx="2" fill="none" stroke="#a98d60" stroke-width=".8"/><rect x="15" y="39" width="328" height="72" fill="none" stroke="#a98d60" stroke-width=".6"/><rect x="19" y="43" width="320" height="64" fill="none" stroke="#fffaf0" stroke-width="1.800"/><rect x="19" y="43" width="320" height="64" fill="none" stroke="#a98d60" stroke-width=".5" opacity=".7"/>
  <g filter="url(#rel)">${cap(159, 31, 40, 8)}${cap(159, 111, 40, 8)}</g>
  <use href="#orn" transform="translate(12 36) scale(.8)"/><use href="#orn" transform="translate(346 36) scale(-.8 .8)"/>
  <g filter="url(#rel)"><path d="M126 76C140 66 150 66 156 76M232 76C218 66 208 66 202 76" fill="none" stroke="#bda97f" stroke-width="3.800" stroke-linecap="round"/><path d="M126 76C140 66 150 66 156 76M232 76C218 66 208 66 202 76" fill="none" stroke="url(#iv)" stroke-width="2.600" stroke-linecap="round"/>${flor(116, 76, 6)}${flor(242, 76, 6)}<use href="#leaf" transform="translate(124 84) rotate(150) scale(.6)"/><use href="#leaf" transform="translate(234 84) rotate(30) scale(.6)"/><path d="M130 64h98q9 0 9 12t-9 12h-98q-9 0-9-12t9-12z" fill="url(#iv)" stroke="#bda97f" stroke-width=".8"/></g>`;
  return `<div class="crownw">${sv(126, inner, defs)}<div class="plaq" style="top:70px;color:#7a5530;font:700 12.500px 'GFS Baskerville',serif;letter-spacing:.2em;text-transform:uppercase;text-shadow:0 1px 0 rgba(255,255,255,.8)">${name}</div></div>`;
}
function crownCyber(name) {
  const defs = `${G.lin('cm', [[0, '#4b5068'], [.5, '#262a3a'], [1, '#10111b']], 0, 1)}${G.lin('cg', [[0, '#ff2fb8'], [.5, '#25f4ee'], [1, '#ffd400']], 1, 0)}<filter id="nb"><feGaussianBlur stdDeviation="2.600"/></filter>`;
  const shape = 'M0 126V40L22 14H190L206 0H336L358 22V126Z';
  const gl = [...Array(9)].map((_, i) => `<rect x="${24 + (i % 3) * 30}" y="${42 + i * 4.600}" width="${18 + (i * 29) % 48}" height="2.600" fill="${i % 2 ? '#ff2fb8' : '#25f4ee'}" opacity=".9"/>`).join('');
  const fanb = [...Array(5)].map((_, i) => `<path d="M0 0C6 -5 14 -4 16 0 10 3 4 3 0 0z" transform="rotate(${i * 72}) translate(2 0)" fill="#3a3f55" stroke="#07080d" stroke-width=".6"/>`).join('');
  const inner = `<path d="${shape}" fill="url(#cm)" stroke="#05060a" stroke-width="1.500"/><path d="${shape}" fill="none" stroke="#25f4ee" stroke-width="3" filter="url(#nb)" opacity=".8"/><path d="M0 40L22 14H190L206 0H336L358 22" fill="none" stroke="#25f4ee" stroke-width="1.300"/>
  <path d="M10 126V52M348 126V40" stroke="#ff2fb8" stroke-width="1.200" opacity=".9"/>
  <rect x="20" y="34" width="96" height="58" rx="3" fill="#0a0814" stroke="#6a7090" stroke-width="1"/><rect x="20" y="34" width="96" height="58" rx="3" fill="none" stroke="#ff2fb8" stroke-width=".7" opacity=".9"/>${gl}<text x="68" y="28" font-family="'Noto Sans CJK JP',sans-serif" font-weight="700" font-size="12" text-anchor="middle" fill="#ffd400" style="filter:drop-shadow(0 0 4px #ffd400)">電脳 2077</text>
  <g transform="translate(316 66)"><circle r="28" fill="#0c0d16" stroke="#6a7090" stroke-width="1.500"/><circle r="22" fill="#05060a"/><g>${fanb}</g><circle r="3.500" fill="#25f4ee"/><path d="M-26 0h52M0 -26v52" stroke="#10111b" stroke-width="1" opacity=".9"/><circle r="28" fill="none" stroke="#25f4ee" stroke-width=".8" opacity=".7"/></g>
  <path d="M236 12C240 34 252 40 258 56M246 12C250 32 262 36 270 50" fill="none" stroke="#06070c" stroke-width="3.200" stroke-linecap="round"/><path d="M236 12C240 34 252 40 258 56" fill="none" stroke="#4a4f68" stroke-width=".7"/>
  <rect x="128" y="86" width="164" height="30" rx="4" fill="#0a0814" stroke="#25f4ee" stroke-width="1.400"/><rect x="128" y="86" width="164" height="30" rx="4" fill="none" stroke="#25f4ee" stroke-width="4" filter="url(#nb)" opacity=".55"/>
  <path d="M130 30h60l8 8h40" fill="none" stroke="url(#cg)" stroke-width="1.300"/><g fill="#ffd400"><rect x="132" y="22" width="14" height="3"/><rect x="150" y="22" width="6" height="3"/></g>`;
  return `<div class="crownw">${sv(126, inner, defs)}<div class="plaq" style="top:95px;color:#ffe6f8;font:700 11px 'Poppins',sans-serif;letter-spacing:.22em;text-transform:uppercase;text-shadow:0 0 3px #fff,0 0 8px #ff2fb8,0 0 18px #ff2fb8">${name}</div></div>`;
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
function cabinetGothic(name, L, R) {
  const col = rows => `<div class="inner">${rows.map(([l, it]) => rowX(it, l)).join('')}</div>`;
  return `<div class="phone"><div class="mueble t-got grainH">${crownGothic2(name)}<div class="body" style="grid-template-columns:26px 1fr 14px 1fr 26px"><div class="pil l"></div>${col(L)}<div class="pil m"></div>${col(R)}<div class="pil r"></div></div><div class="base"><div class="b1"></div><div class="b2"></div><div class="b3"></div></div></div></div>`;
}
/* rococó */
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
function cabinetRococo(name, rows) {
  return `<div class="phone"><div class="mueble t-roc grainH">${crownRococo2(name)}<div class="body"><div class="pil l"></div><div class="inner">${bcSvg('tl')}${bcSvg('tr')}${bcSvg('bl')}${bcSvg('br')}${rows.map(([l, it]) => rowX(it, l)).join('')}</div><div class="pil r"></div></div><div class="base"><div class="b1"></div><div class="b2"></div><div class="b3"></div></div></div></div>`;
}
/* ciberpunk A: neón industrial */
function crownIndustrial(name) {
  const defs = `${G.lin('st', [[0, '#b8bfcc'], [.5, '#5a6070'], [1, '#2a2d38']], 0, 1)}<filter id="nb"><feGaussianBlur stdDeviation="2.800"/></filter>`;
  const chain = x => [...Array(5)].map((_, i) => i % 2 ? `<rect x="${x - .9}" y="${28 + i * 4.400}" width="1.800" height="6" rx=".9" fill="#9aa0b0"/>` : `<ellipse cx="${x}" cy="${31 + i * 4.400}" rx="2.200" ry="3.400" fill="none" stroke="#9aa0b0" stroke-width="1.200"/>`).join('');
  const inner = `<rect x="-6" y="0" width="370" height="8" fill="url(#st)"/><rect x="-2" y="8" width="362" height="12" fill="#262934"/><rect x="-6" y="20" width="370" height="8" fill="url(#st)"/>${[...Array(17)].map((_, i) => `<circle cx="${8 + i * 22}" cy="14" r="1.700" fill="#8a90a0"/>`).join('')}
   ${chain(104)}${chain(254)}
   <rect x="58" y="50" width="242" height="60" rx="7" fill="#14081e" stroke="#4a4f5e" stroke-width="1.600"/><rect x="58" y="50" width="242" height="60" rx="7" fill="url(#st)" opacity=".06"/>
   <rect x="65" y="57" width="228" height="46" rx="5" fill="none" stroke="#25f4ee" stroke-width="5" filter="url(#nb)" opacity=".7"/><rect x="65" y="57" width="228" height="46" rx="5" fill="none" stroke="#bffcfa" stroke-width="1.600"/>
   <rect x="10" y="28" width="28" height="90" rx="3" fill="#120a1c" stroke="#4a4f5e" stroke-width="1.200"/><g font-family="'Noto Sans CJK JP',sans-serif" font-weight="700" font-size="19" text-anchor="middle"><g fill="#25f4ee" filter="url(#nb)"><text x="24" y="62">本</text><text x="24" y="94">屋</text></g><g fill="#d6fffd"><text x="24" y="62">本</text><text x="24" y="94">屋</text></g></g>
   <path d="M306 28C312 52 330 56 340 46S350 30 352 28" fill="none" stroke="#07080c" stroke-width="3"/><path d="M318 28C322 44 336 48 344 40" fill="none" stroke="#07080c" stroke-width="2.200"/>`;
  return `<div class="crownw">${sv(120, inner, defs)}<div class="plaq" style="top:62px;color:#ffe1f5;font:400 25px 'TeX Gyre Chorus',cursive;letter-spacing:.02em;text-shadow:0 0 2px #fff,0 0 6px #ff2fb8,0 0 14px #ff2fb8,0 0 26px #ff2fb8">${name}</div></div>`;
}
/* ciberpunk B: neo-Tokio */
function crownTokyo(name) {
  const defs = `${G.lin('tl', [[0, '#3a3f4e'], [1, '#0d0f15']], 0, 1)}${G.lin('rd', [[0, '#ee3a50'], [1, '#8a0f20']], 0, 1)}${G.lin('gd', [[0, '#f8e3a0'], [1, '#a8782a']], 0, 1)}${G.rad('ln', [[0, '#ffd08a'], [.45, '#f04a3a'], [1, '#8a0f14']], .45, .4, .6)}<filter id="nb"><feGaussianBlur stdDeviation="3"/></filter>`;
  const roof = 'M-12 52C30 52 58 42 74 22L284 22C300 42 328 52 370 52L362 62C320 62 296 54 280 42L78 42C62 54 38 62 -4 62Z';
  const lant = (x, k) => `<path d="M${x} 74V82" stroke="#222" stroke-width="1.200"/><circle cx="${x}" cy="98" r="24" fill="#ff6a3a" opacity=".35" filter="url(#nb)"/><rect x="${x - 7}" y="82" width="14" height="4" rx="1" fill="#1a1214"/><ellipse cx="${x}" cy="98" rx="13" ry="13" fill="url(#ln)"/><g fill="none" stroke="#7a0f14" stroke-width=".6" opacity=".7"><ellipse cx="${x}" cy="98" rx="6" ry="13"/><path d="M${x - 13} 94h26M${x - 13} 102h26"/></g><rect x="${x - 7}" y="110" width="14" height="4" rx="1" fill="#1a1214"/><text x="${x}" y="102" text-anchor="middle" font-family="'Noto Sans CJK JP',sans-serif" font-weight="700" font-size="10" fill="#2a0608">${k}</text><path d="M${x} 114v6" stroke="#d9b25f" stroke-width="1"/>`;
  const inner = `<path d="${roof}" fill="url(#tl)" stroke="#05060a" stroke-width="1"/>${[...Array(26)].map((_, i) => `<path d="M${84 + i * 8} 24V41" stroke="#4a5060" stroke-width=".8"/>`).join('')}
   <rect x="68" y="14" width="222" height="9" rx="2" fill="#16121a" stroke="#05060a"/><path d="M68 18C60 18 56 10 62 6 66 4 70 8 66 10M290 18C298 18 302 10 296 6 292 4 288 8 292 10" fill="none" stroke="#16121a" stroke-width="3" stroke-linecap="round"/>
   <path d="M-4 62C38 62 62 54 78 42L280 42C296 54 320 62 362 62" fill="none" stroke="#ff2fb8" stroke-width="5" filter="url(#nb)" opacity=".8"/><path d="M-4 62C38 62 62 54 78 42L280 42C296 54 320 62 362 62" fill="none" stroke="#ffd6f2" stroke-width="1.400"/>
   <rect x="0" y="62" width="358" height="12" fill="url(#rd)"/><path d="M0 64.500H358M0 71.500H358" stroke="url(#gd)" stroke-width=".7"/>
   <rect x="92" y="80" width="174" height="34" rx="3" fill="#0a0a12" stroke="url(#gd)" stroke-width="1.200"/>${lant(34, '本')}${lant(324, '夜')}`;
  return `<div class="crownw">${sv(124, inner, defs)}<div class="plaq" style="top:90px;color:#e6fffe;font:700 11px 'Poppins',sans-serif;letter-spacing:.24em;text-transform:uppercase;text-shadow:0 0 3px #fff,0 0 8px #25f4ee,0 0 16px #25f4ee">${name}</div></div>`;
}

/* ---------- sci-fi holográfico: 3 propuestas ---------- */
function crownHolo1(name) {
  const defs = `<filter id="hb"><feGaussianBlur stdDeviation="2.400"/></filter><linearGradient id="hp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25f4ee" stop-opacity=".22"/><stop offset="1" stop-color="#25f4ee" stop-opacity=".04"/></linearGradient><pattern id="sl" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#25f4ee" opacity=".12"/></pattern>`;
  const br = (x, y, sx, sy) => `<path d="M${x} ${y + sy * 14}V${y}H${x + sx * 14}" fill="none" stroke="#bffffb" stroke-width="2"/>`;
  const gauge = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="15" fill="none" stroke="#25f4ee" stroke-width=".8" opacity=".6"/><path d="M${cx} ${cy - 15}A15 15 0 0 1 ${cx + 14.200} ${cy + 4.800}" fill="none" stroke="#bffffb" stroke-width="2.400"/><circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="#25f4ee" stroke-width=".6" stroke-dasharray="2 2"/><circle cx="${cx}" cy="${cy}" r="2.500" fill="#bffffb"/>`;
  const inner = `<rect x="0" y="4" width="358" height="104" rx="5" fill="#031019"/><rect x="2" y="6" width="354" height="100" rx="4" fill="url(#hp)"/><rect x="2" y="6" width="354" height="100" rx="4" fill="url(#sl)"/><rect x="2" y="6" width="354" height="100" rx="4" fill="none" stroke="#25f4ee" stroke-width="1" opacity=".55"/>
   ${br(2, 6, 1, 1)}${br(356, 6, -1, 1)}${br(2, 106, 1, -1)}${br(356, 106, -1, -1)}${gauge(38, 50)}${gauge(320, 50)}
   <g stroke="#25f4ee" stroke-width=".8" opacity=".7"><path d="M66 30h60M66 36h40M232 30h60M252 36h40"/></g><g fill="#bffffb" opacity=".8" font-family="Inter" font-size="6" letter-spacing="1"><text x="66" y="24">SYS·HOLO 04</text><text x="248" y="24">◉ ONLINE</text></g>
   <path d="M90 84h178" stroke="#25f4ee" stroke-width="4" filter="url(#hb)" opacity=".6"/><path d="M90 84h178" stroke="#bffffb" stroke-width="1"/>`;
  return `<div class="crownw">${sv(112, inner, defs)}<div class="plaq" style="top:50px;color:#dffffd;font:700 15px 'Poppins',sans-serif;letter-spacing:.24em;text-transform:uppercase;text-shadow:-1.500px 0 rgba(255,47,184,.7),1.500px 0 rgba(37,244,238,.9),0 0 10px #25f4ee,0 0 22px #25f4ee;opacity:.95">${name}</div></div>`;
}
function crownHolo2(name) {
  const defs = `<linearGradient id="ir" x1="0" y1="0" x2="1" y2=".4"><stop offset="0" stop-color="#ffc9ee"/><stop offset=".22" stop-color="#c4efff"/><stop offset=".44" stop-color="#dcc9ff"/><stop offset=".66" stop-color="#c4ffe4"/><stop offset=".84" stop-color="#ffe6c4"/><stop offset="1" stop-color="#ffc9ee"/></linearGradient><linearGradient id="cr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#9aa1ad"/><stop offset=".5" stop-color="#f5f7fa"/><stop offset=".8" stop-color="#6b7280"/><stop offset="1" stop-color="#d9dde3"/></linearGradient><pattern id="sh" width="26" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(25)"><rect x="0" width="5" height="100" fill="#fff" opacity=".35"/></pattern>`;
  const sp = (x, y, s) => `<path d="M${x} ${y - s}L${x + s * .25} ${y - s * .25} ${x + s} ${y} ${x + s * .25} ${y + s * .25} ${x} ${y + s} ${x - s * .25} ${y + s * .25} ${x - s} ${y} ${x - s * .25} ${y - s * .25}Z" fill="#fff"/>`;
  const inner = `<rect x="3" y="6" width="352" height="88" rx="44" fill="url(#ir)"/><rect x="3" y="6" width="352" height="88" rx="44" fill="url(#sh)"/><rect x="3" y="6" width="352" height="88" rx="44" fill="none" stroke="url(#cr)" stroke-width="6"/><rect x="9" y="12" width="340" height="76" rx="38" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>
   ${sp(70, 30, 6)}${sp(292, 66, 7)}${sp(104, 70, 3.500)}${sp(262, 28, 4)}${sp(312, 40, 3)}<rect x="0" y="92" width="358" height="8" fill="url(#cr)"/>`;
  return `<div class="crownw">${sv(100, inner, defs)}<div class="plaq" style="top:41px;color:#2e2a48;font:700 15px 'Poppins',sans-serif;letter-spacing:.26em;text-transform:uppercase;text-shadow:0 1px 0 rgba(255,255,255,.9),0 0 8px rgba(255,255,255,.8)">${name}</div></div>`;
}
function crownHolo3(name) {
  const defs = `${G.lin('hm', [[0, '#4b5068'], [.5, '#22252f'], [1, '#0f1016']], 0, 1)}<filter id="hb3"><feGaussianBlur stdDeviation="2.600"/></filter><linearGradient id="cone" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#25f4ee" stop-opacity=".55"/><stop offset="1" stop-color="#25f4ee" stop-opacity="0"/></linearGradient>`;
  let globe = ''; const cx = 179, cy = 58, r = 32;
  for (let i = -3; i <= 3; i++) globe += `<ellipse cx="${cx}" cy="${cy + i * 8}" rx="${Math.sqrt(Math.max(0, 1 - (i * 8 / r) ** 2)) * r}" ry="2.600" fill="none" stroke="#25f4ee" stroke-width=".7" opacity=".85"/>`;
  for (let i = 0; i < 4; i++) globe += `<ellipse cx="${cx}" cy="${cy}" rx="${6 + i * 9}" ry="${r}" fill="none" stroke="#25f4ee" stroke-width=".7" opacity=".75"/>`;
  const hud = (x) => `<rect x="${x}" y="40" width="74" height="46" rx="3" fill="rgba(37,244,238,.07)" stroke="#25f4ee" stroke-width=".8" opacity=".9"/><path d="M${x + 6} 74l10-12 9 8 10-18 10 12 9-6 10 4" fill="none" stroke="#ff2fb8" stroke-width="1.100"/><path d="M${x + 6} 48h40M${x + 6} 53h26" stroke="#25f4ee" stroke-width=".8" opacity=".7"/>`;
  const inner = `<path d="M0 150V40L30 10H328L358 40V150Z" fill="url(#hm)" stroke="#05060a" stroke-width="1.200"/><path d="M0 40L30 10H328L358 40" fill="none" stroke="#6a7090" stroke-width="1"/>
   ${hud(18)}${hud(266)}
   <path d="M159 116L143 34H215L199 116Z" fill="url(#cone)"/><circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="#25f4ee" opacity=".18" filter="url(#hb3)"/>${globe}<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#bffffb" stroke-width="1.200"/><ellipse cx="${cx}" cy="${cy}" rx="46" ry="9" fill="none" stroke="#ff2fb8" stroke-width="1.300" transform="rotate(-16 ${cx} ${cy})"/>
   <ellipse cx="${cx}" cy="118" rx="24" ry="5" fill="#0a0b10" stroke="#6a7090"/><ellipse cx="${cx}" cy="117" rx="16" ry="3" fill="#25f4ee"/><ellipse cx="${cx}" cy="117" rx="20" ry="4.500" fill="#25f4ee" opacity=".5" filter="url(#hb3)"/>
   <rect x="94" y="128" width="170" height="18" rx="3" fill="rgba(37,244,238,.08)" stroke="#25f4ee" stroke-width=".8"/>`;
  return `<div class="crownw">${sv(150, inner, defs)}<div class="plaq" style="top:132px;color:#e6fffe;font:700 10.500px 'Poppins',sans-serif;letter-spacing:.3em;text-transform:uppercase;text-shadow:0 0 6px #25f4ee,0 0 14px #25f4ee">${name}</div></div>`;
}

function crownHolo1b(name) {
  const defs = `<filter id="hb"><feGaussianBlur stdDeviation="2.200"/></filter><linearGradient id="hp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25f4ee" stop-opacity=".16"/><stop offset="1" stop-color="#25f4ee" stop-opacity=".03"/></linearGradient><pattern id="sl" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#25f4ee" opacity=".1"/></pattern>`;
  const F = 'M6 124V64L179 12L352 64V124', B = 'M18 116V58L189 6L362 58';
  let dent = ''; for (let x = 14; x < 346; x += 12) dent += `<rect x="${x}" y="66" width="6" height="7" fill="none" stroke="#25f4ee" stroke-width=".6" opacity=".7"/>`;
  const v = [[6, 64], [179, 12], [352, 64], [6, 124], [352, 124]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#bffffb"/>`).join('');
  const inner = `<path d="M0 124V62L179 6L358 62V124Z" fill="#031019"/><path d="${F}Z" fill="url(#hp)"/><path d="${F}Z" fill="url(#sl)"/>
   <path d="${B}" fill="none" stroke="#25f4ee" stroke-width=".7" stroke-dasharray="3 3" opacity=".55"/><path d="M6 64L18 58M179 12L189 6M352 64L362 58" stroke="#25f4ee" stroke-width=".7" opacity=".55"/>
   <path d="${F}" fill="none" stroke="#25f4ee" stroke-width="4" filter="url(#hb)" opacity=".7"/><path d="${F}" fill="none" stroke="#dffffd" stroke-width="1.300"/>
   <path d="M30 60L179 22L328 60Z" fill="none" stroke="#25f4ee" stroke-width=".9" opacity=".8"/>${dent}<path d="M6 76H352M6 80H352" stroke="#25f4ee" stroke-width=".8" opacity=".75"/>
   ${v}<path d="M0 94H358" stroke="#bffffb" stroke-width=".6" opacity=".35"/><path d="M0 104H120M240 104H358" stroke="#bffffb" stroke-width=".4" opacity=".3"/>`;
  return `<div class="crownw">${sv(124, inner, defs)}<div class="plaq" style="top:40px;color:#e6fffe;font:600 12px 'Poppins',sans-serif;letter-spacing:.3em;text-transform:uppercase;text-shadow:0 0 6px #25f4ee,0 0 14px #25f4ee">${name}</div></div>`;
}


/* ---------- sci-fi: chip holográfico ---------- */
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
function crownChipHolo(name, P) {
  const { c1, c2, c3 } = P;
  const defs = `<linearGradient id="pkB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241d3e"/><stop offset="1" stop-color="#0a0814"/></linearGradient><linearGradient id="pn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a909c"/><stop offset=".5" stop-color="#f2f4f7"/><stop offset="1" stop-color="#8a909c"/></linearGradient><linearGradient id="cn" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c1}" stop-opacity=".55"/><stop offset="1" stop-color="${c1}" stop-opacity=".02"/></linearGradient><linearGradient id="hpB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}" stop-opacity=".3"/><stop offset="1" stop-color="${c2}" stop-opacity=".25"/></linearGradient><pattern id="sl3" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" opacity=".14"/></pattern><filter id="cg2"><feGaussianBlur stdDeviation="2.600"/></filter>`;
  let pins = ''; for (let x = 30; x <= 324; x += 12) pins += `<rect x="${x}" y="80" width="6" height="10" rx="1" fill="url(#pn)"/>`;
  const pkg = 'M22 88H338L348 98V152H10V100Z';
  let tr = ''; [[30, 120, 100, 120, 110, 110, 150, 110, c1], [328, 120, 258, 120, 248, 110, 208, 110, c2], [30, 140, 90, 140, 100, 132, 150, 132, c3], [328, 140, 268, 140, 258, 132, 208, 132, c1]].forEach(([a, b, c, d, e, f, g, h, col]) => tr += `<path d="M${a} ${b}H${c}L${e} ${f}H${g}" fill="none" stroke="${col}" stroke-width="1.200"/><circle cx="${a}" cy="${b}" r="2" fill="none" stroke="${col}"/>`);
  const inner = `<path d="M118 108L74 8H284L240 108Z" fill="url(#cn)"/><rect x="66" y="6" width="226" height="54" rx="6" fill="url(#hpB)"/><rect x="66" y="6" width="226" height="54" rx="6" fill="url(#sl3)"/><rect x="66" y="6" width="226" height="54" rx="6" fill="none" stroke="${c1}" stroke-width="1.100" opacity=".9"/><path d="M72 12h14M72 12v8M286 54h-14M286 54v-8" stroke="${c3}" stroke-width="1.400"/>
   ${pins}<path d="${pkg}" fill="url(#pkB)"/><path d="${pkg}" fill="none" stroke="${c1}" stroke-width="4" filter="url(#cg2)" opacity=".6"/><path d="${pkg}" fill="none" stroke="${c1}" stroke-width="1.200"/>${tr}
   <rect x="150" y="100" width="58" height="42" rx="3" fill="#06040e" stroke="#fff" stroke-width=".8"/><ellipse cx="179" cy="108" rx="20" ry="4" fill="${c1}" opacity=".9"/><ellipse cx="179" cy="108" rx="26" ry="6" fill="${c1}" opacity=".5" filter="url(#cg2)"/><circle cx="26" cy="102" r="3" fill="${c3}"/><text x="179" y="134" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="7" fill="${c3}" letter-spacing="1">HX-2077</text>`;
  return `<div class="crownw">${sv(152, inner, defs)}<div class="plaq" style="top:26px;color:#fff;font:700 13px 'Poppins',sans-serif;letter-spacing:.24em;text-transform:uppercase;text-shadow:-1.500px 0 ${c2},1.500px 0 ${c1},0 0 8px ${c1},0 0 18px ${c1};opacity:.95">${name}</div></div>`;
}
