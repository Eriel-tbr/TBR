'use strict';
/* Mi TBR — diseños de lomo (fase 5, revisados el 26/10/2026).
   Reglas de todos:
   - El título manda: tiene su zona propia, sin adornos encima, centrado en ella; letras con contraste ≥ 4 (bestInk).
   - Cada color que se ve sale de una parte editable (o de un tono más claro u oscuro de ella): no hay colores fijos,
     así que al cambiar una parte cambia todo lo suyo. Sin texturas de ruido.
   - En las sagas, el número de tomo va en un soporte propio de cada diseño (num: { cy, bg, ink }) y el título le deja sitio.
   Cada diseño: name, parts [[campo, nombre]], font (título), colors([B, F, A]) = colores por defecto a partir de la paleta
   (base, metal, acento: de la portada o de la estantería), draw(o, c, w, h) → { svg, box, tbg[], ink, num, glow, extra }.
   saga: true = solo para un modo de serie (no sale en la lista de diseños). */

FONT.cinzel = "'Cinzel','Cormorant Garamond',Georgia,serif";
let svid = 0; const sid = () => 'sv' + (++svid); // id únicos (en la página puede haber el mismo lomo con colores distintos)
const svgW = (w, h, s) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;inset:0;display:block" aria-hidden="true">${s}</svg>`;
const motifAt = (k, cx, cy, s, col) => `<path d="${MOTIF[k] || MOTIF.diamond}" transform="translate(${r1(cx - s / 2)} ${r1(cy - s / 2)}) scale(${r1(s / 16 * 100) / 100})" fill="${col}"/>`;
const r1 = v => Math.round(v * 10) / 10;
const pastel = (x, l) => { const [H, S] = hexHsl(x); return hslToHex(H, clamp(S, .3, .8), l); };
const vivid = (x, l = .6) => { const [H, S] = hexHsl(x); return hslToHex(H, Math.max(S, .85), l); };

/* Letras que se leen sobre todos los fondos que pisan: la preferida si llega a 4:1; si no, una versión más clara u oscura; si no, casi blanco o casi negro */
function bestInk(pref, bgs, min = 4){
  bgs = bgs.filter(isHex); if(!bgs.length) return pref;
  const worst = c => Math.min(...bgs.map(b => contrast(c, b)));
  if(isHex(pref) && worst(pref) >= min) return pref;
  const avg = bgs.reduce((a, b) => mix(a, b, .5)), cands = isHex(pref) ? [legibleOn(pref, avg, min), lighten(pref, .55), darken(pref, .6), lighten(pref, .8), darken(pref, .8)] : [];
  const ok = cands.find(c => worst(c) >= min); if(ok) return ok;
  return worst('#fbf7ef') >= worst('#17121c') ? '#fbf7ef' : '#17121c';
}

/* ---------- Piezas de dibujo ---------- */
/* Fase de la luna (0 nueva … 1 llena) con dos colores: luz y sombra */
function moonG(cx, cy, r, f, light, shade){
  if(f >= .999) return `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${light}"/>`;
  if(f <= .001) return `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${shade}" stroke="${light}" stroke-width=".6"/>`;
  const rx = r1(Math.abs(1 - 2 * f) * r);
  return `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${shade}" stroke="${light}" stroke-width=".4"/><path d="M${r1(cx)} ${r1(cy - r)}A${r1(r)} ${r1(r)} 0 0 1 ${r1(cx)} ${r1(cy + r)}A${rx} ${r1(r)} 0 0 ${f < .5 ? 0 : 1} ${r1(cx)} ${r1(cy - r)}Z" fill="${light}"/>`;
}
/* Destello de cuatro puntas */
const spark = (x, y, s, col) => `<path d="M${r1(x)} ${r1(y - s)}Q${r1(x + s * .18)} ${r1(y - s * .18)} ${r1(x + s)} ${r1(y)}Q${r1(x + s * .18)} ${r1(y + s * .18)} ${r1(x)} ${r1(y + s)}Q${r1(x - s * .18)} ${r1(y + s * .18)} ${r1(x - s)} ${r1(y)}Q${r1(x - s * .18)} ${r1(y - s * .18)} ${r1(x)} ${r1(y - s)}Z" fill="${col}"/>`;
/* Estrella de n puntas */
function starP(cx, cy, R, ri, n = 8, rot = -90){
  let p = ''; for(let i = 0; i < n * 2; i++){ const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? ri : R; p += (i ? 'L' : 'M') + r1(cx + Math.cos(a) * rr) + ' ' + r1(cy + Math.sin(a) * rr); }
  return p + 'Z';
}
/* Hoja (punta en (L, 0), base en el origen) con su nervio */
const leafG = (x, y, ang, L, col, vein) => `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${Math.round(ang)})"><path d="M0 0C${r1(L * .3)} ${r1(-L * .34)} ${r1(L * .72)} ${r1(-L * .3)} ${r1(L)} 0C${r1(L * .72)} ${r1(L * .3)} ${r1(L * .3)} ${r1(L * .34)} 0 0Z" fill="${col}"/><path d="M.6 0H${r1(L * .82)}" stroke="${vein}" stroke-width=".35"/></g>`;
/* Flor de cinco pétalos vista de frente */
function flowerF(cx, cy, r, col, edge, heart){
  let s = ''; for(let i = 0; i < 5; i++){ const a = -90 + i * 72; s += `<ellipse cx="${r1(cx)}" cy="${r1(cy - r * .55)}" rx="${r1(r * .42)}" ry="${r1(r * .55)}" transform="rotate(${a + 90} ${r1(cx)} ${r1(cy)})" fill="${col}" stroke="${edge}" stroke-width=".4"/>`; }
  return s + `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r * .3)}" fill="${heart}"/>`;
}
/* Cola de cinta con el final en V: de (sx, sy) a (ex, ey), media anchura hw */
function tailG(sx, sy, ex, ey, hw, col, edge){
  const dx = ex - sx, dy = ey - sy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, px = -uy * hw, py = ux * hw, nx = ex - ux * hw * 1.3, ny = ey - uy * hw * 1.3;
  const P = [[sx + px, sy + py], [ex + px, ey + py], [nx, ny], [ex - px, ey - py], [sx - px, sy - py]].map(p => p.map(r1).join(' ')).join('L');
  return `<path d="M${P}Z" fill="${col}" stroke="${edge}" stroke-width=".4" stroke-linejoin="round"/>`;
}
const heartP = (cx, cy, s) => `M${r1(cx)} ${r1(cy + s * .42)}C${r1(cx - s * .9)} ${r1(cy - s * .1)} ${r1(cx - s * .55)} ${r1(cy - s * .62)} ${r1(cx)} ${r1(cy - s * .25)}C${r1(cx + s * .55)} ${r1(cy - s * .62)} ${r1(cx + s * .9)} ${r1(cy - s * .1)} ${r1(cx)} ${r1(cy + s * .42)}Z`;
const ring = (cx, cy, r, fill, stroke, sw) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

const SPINES = {
  /* 1. Lámina holo: varios colores difuminados y letras grandes y claras */
  holo:{ name:'Lámina holo', parts:[['c1', 'Color 1'], ['c2', 'Color 2'], ['c3', 'Color 3']], font:{ font:'pop', wt:700, up:1, ls:.05, max:19 },
    colors:([B, F, A]) => ({ c1:pastel(B, .72), c2:pastel(A, .8), c3:pastel(F, .86) }),
    draw:(o, c, w, h) => { const g = sid(), b = sid(), sh = sid(), nb = o.num ? 20 : 0, cy = h - 15, pill = lighten(c.c2, .55);
      const svg = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.c1}"/><stop offset=".4" stop-color="${c.c2}"/><stop offset=".75" stop-color="${c.c3}"/><stop offset="1" stop-color="${c.c1}"/></linearGradient>
        <filter id="${b}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${r1(w * .32)}"/></filter>
        <linearGradient id="${sh}" x1="0" y1="0" x2="1" y2="1"><stop offset=".3" stop-color="${lighten(c.c2, .85)}" stop-opacity="0"/><stop offset=".42" stop-color="${lighten(c.c2, .85)}" stop-opacity=".35"/><stop offset=".54" stop-color="${lighten(c.c2, .85)}" stop-opacity="0"/></linearGradient></defs>
        <rect width="${w}" height="${h}" fill="url(#${g})"/><g filter="url(#${b})" opacity=".9"><circle cx="${r1(w * .15)}" cy="${r1(h * .2)}" r="${r1(w * .8)}" fill="${c.c3}"/><circle cx="${r1(w * .9)}" cy="${r1(h * .52)}" r="${r1(w * .8)}" fill="${c.c1}"/><circle cx="${r1(w * .25)}" cy="${r1(h * .86)}" r="${r1(w * .8)}" fill="${c.c2}"/></g>
        <rect width="${w}" height="${h}" fill="url(#${sh})"/>` + (o.num ? `<rect x="${r1(w / 2 - 8)}" y="${cy - 6.5}" width="16" height="13" rx="6.5" fill="${pill}"/>` : '');
      const ink = darken(c.c1, .78);
      return { svg, box:{ l:3, t:7, w:w - 6, h:h - 14 - nb }, tbg:[c.c1, c.c2, c.c3, mix(c.c1, c.c2, .5), mix(c.c2, c.c3, .5)], ink, num:{ cy, bg:pill, ink } }; } },

  /* 2. Marco: doble filete alrededor, sin más adornos */
  marco:{ name:'Marco', parts:[['base', 'Fondo'], ['foil', 'Marco'], ['alt', 'Filete interior']], font:{ font:'pag', wt:700, max:16 },
    colors:([B, F]) => ({ base:B, foil:F, alt:F }),
    draw:(o, c, w, h) => { const cy = h - 17, nbg = darken(c.base, .12);
      const svg = `<rect x="3.5" y="4.5" width="${w - 7}" height="${h - 9}" fill="none" stroke="${c.foil}" stroke-width="1.1"/><rect x="5.8" y="6.8" width="${r1(w - 11.6)}" height="${r1(h - 13.6)}" fill="none" stroke="${c.alt}" stroke-width=".5"/>`
        + (o.num ? ring(w / 2, cy, 6.8, nbg, c.alt, .7) : '');
      return { svg, box:{ l:7, t:9, w:w - 14, h:h - 18 - (o.num ? 22 : 0) }, tbg:[c.base], ink:c.foil, num:{ cy, bg:nbg, ink:c.foil } }; } },

  /* 3. Jaspeado: piel arriba con el título y papel jaspeado abajo */
  jaspeado:{ name:'Jaspeado', parts:[['base', 'Piel'], ['alt', 'Papel'], ['v1', 'Vetas 1'], ['v2', 'Vetas 2'], ['foil', 'Filetes']], font:{ font:'pag', wt:700, max:16 },
    colors:([B, F, A]) => ({ base:B, alt:mix(F, '#ffffff', .55), v1:A, v2:darken(B, .05), foil:F }),
    draw:(o, c, w, h) => { const top = Math.round(h * .64), bot = h - 8, r = rng(o.seed), cl = sid(), cy = Math.round(top + (bot - top) / 2); let wv = '';
      for(let i = 0; i < 15; i++){ const y = top + r() * (bot - top), a = 1.5 + r() * 3, ph = r() * 6, fr = 3 + r() * 4; let p = `M-2 ${r1(y)}`; for(let x = 0; x <= w + 2; x += 2) p += `L${x} ${r1(y + Math.sin(x / fr + ph) * a)}`;
        wv += `<path d="${p}" stroke="${i % 3 === 2 ? mix(c.v1, c.v2, .5) : i % 2 ? c.v2 : c.v1}" stroke-width="${r1(.7 + r() * 1.8)}" fill="none" opacity=".85"/>`; }
      const svg = `<defs><clipPath id="${cl}"><rect y="${top}" width="${w}" height="${bot - top}"/></clipPath></defs><rect y="${top}" width="${w}" height="${bot - top}" fill="${c.alt}"/><g clip-path="url(#${cl})">${wv}</g>
        <rect y="${top - 1.5}" width="${w}" height="1.5" fill="${c.foil}"/><rect y="${bot}" width="${w}" height="1.5" fill="${c.foil}"/><rect y="6" width="${w}" height="1.2" fill="${c.foil}"/>`
        + (o.num ? `<rect x="${r1(w / 2 - 8)}" y="${cy - 6.5}" width="16" height="13" rx="2" fill="${c.base}" stroke="${c.foil}" stroke-width=".8"/>` : '');
      return { svg, box:{ l:3, t:10, w:w - 6, h:top - 16 }, tbg:[c.base], ink:c.foil, num:{ cy, bg:c.base, ink:c.foil } }; } },

  /* 4. Escamas: escamas en el fondo y el título en una etiqueta lisa */
  escamas:{ name:'Escamas', parts:[['base', 'Fondo'], ['accent', 'Escamas'], ['alt', 'Etiqueta'], ['foil', 'Borde']], font:{ font:'pag', wt:700, max:15 },
    colors:([B, F, A]) => ({ base:B, accent:lighten(A, .2), alt:darken(B, .35), foil:F }),
    draw:(o, c, w, h) => { const p = sid(), lt = Math.round(h * .14), lh = Math.round(h * .64), cy = Math.round(lt + lh + (h - 6 - lt - lh) / 2);
      const svg = `<defs><pattern id="${p}" width="10" height="7" patternUnits="userSpaceOnUse"><path d="M0 7A5 5 0 0 1 10 7M-5 3.5A5 5 0 0 1 5 3.5M5 3.5A5 5 0 0 1 15 3.5" fill="${mix(c.base, c.accent, .18)}" stroke="${c.accent}" stroke-width=".7"/></pattern></defs>
        <rect width="${w}" height="${h}" fill="url(#${p})"/><rect x="4" y="${lt}" width="${w - 8}" height="${lh}" rx="1.5" fill="${c.alt}" stroke="${c.foil}" stroke-width="1"/>
        <rect x="6" y="${lt + 2}" width="${w - 12}" height="${lh - 4}" rx="1" fill="none" stroke="${c.foil}" stroke-width=".4" opacity=".7"/><rect y="5" width="${w}" height="1.2" fill="${c.foil}"/><rect y="${h - 6}" width="${w}" height="1.2" fill="${c.foil}"/>`
        + (o.num ? ring(w / 2, cy, 6.8, c.alt, c.foil, .8) : '');
      return { svg, box:{ l:7, t:lt + 4, w:w - 14, h:lh - 8 }, tbg:[c.alt], ink:c.foil, num:{ cy, bg:c.alt, ink:c.foil } }; } },

  /* 5. Grimorio: cantoneras de metal, correa de piel cosida y un cristal tallado */
  grimorio:{ name:'Grimorio', parts:[['base', 'Piel'], ['foil', 'Metal'], ['accent', 'Cristal']], font:{ font:'cinzel', wt:700, up:1, ls:.04, max:14 },
    colors:([B, F, A]) => ({ base:darken(B, .2), foil:F, accent:A }),
    draw:(o, c, w, h) => { const cx = w / 2, cy = Math.round(h * .7), m = sid(), gm = sid(), k = r1(Math.min(1.35, (w - 8) / 14.4)), gy = cy + 5.5, ny = Math.min(h - 13, cy + 31);
      const cn = (x, y, sx, sy) => `<path d="M${x} ${y}h${sx * 9}l${-sx * 9} ${sy * 9}z" fill="url(#${m})" stroke="${darken(c.foil, .5)}" stroke-width=".5"/>`;
      const gem = `<ellipse cx="${cx}" cy="${gy}" rx="7.2" ry="8.6" fill="url(#${m})" stroke="${darken(c.foil, .55)}" stroke-width=".5"/>
        <path d="M${cx} ${gy - 7}L${cx + 5} ${gy - 3}L${cx + 5} ${gy + 3}L${cx} ${gy + 7}L${cx - 5} ${gy + 3}L${cx - 5} ${gy - 3}Z" fill="url(#${gm})" stroke="${darken(c.accent, .6)}" stroke-width=".4"/>
        <path d="M${cx} ${gy - 7}L${cx} ${gy - 2.5}M${cx + 5} ${gy - 3}L${cx + 2.5} ${gy - 1.5}M${cx - 5} ${gy - 3}L${cx - 2.5} ${gy - 1.5}M${cx - 2.5} ${gy - 1.5}H${cx + 2.5}L${cx + 2.5} ${gy + 2}L${cx} ${gy + 3.5}L${cx - 2.5} ${gy + 2}Z" fill="none" stroke="${lighten(c.accent, .4)}" stroke-width=".4" opacity=".85"/>
        <path d="M${cx - 3} ${gy - 4}l2 -1.5" stroke="${lighten(c.accent, .9)}" stroke-width=".9" stroke-linecap="round"/>`;
      const svg = `<defs><linearGradient id="${m}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(c.foil, .5)}"/><stop offset=".5" stop-color="${c.foil}"/><stop offset="1" stop-color="${darken(c.foil, .45)}"/></linearGradient>
        <radialGradient id="${gm}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${lighten(c.accent, .6)}"/><stop offset=".45" stop-color="${c.accent}"/><stop offset="1" stop-color="${darken(c.accent, .55)}"/></radialGradient></defs>
        <rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="none" stroke="${darken(c.base, .45)}" stroke-width="1"/><rect x="5" y="5" width="${w - 10}" height="${h - 10}" fill="none" stroke="${lighten(c.base, .15)}" stroke-width=".5" opacity=".6"/>
        ${cn(0, 0, 1, 1)}${cn(w, 0, -1, 1)}${cn(0, h, 1, -1)}${cn(w, h, -1, -1)}
        <rect x="0" y="${cy - 3}" width="${w}" height="17" fill="${darken(c.base, .35)}" stroke="${darken(c.base, .6)}" stroke-width=".6"/><path d="M0 ${cy - 1}H${w}M0 ${cy + 12}H${w}" stroke="${lighten(c.base, .12)}" stroke-width=".4" stroke-dasharray="1.5 1.5"/>
        <g transform="translate(${cx} ${gy}) scale(${k}) translate(${-cx} ${-gy})">${gem}</g>`
        + (o.num ? `<rect x="${r1(cx - 8)}" y="${ny - 6}" width="16" height="12" rx="2" fill="url(#${m})" stroke="${darken(c.foil, .5)}" stroke-width=".5"/>` : '');
      return { svg, box:{ l:6, t:14, w:w - 12, h:cy - 14 - 9 - Math.round(3 * k) }, tbg:[c.base], ink:c.foil, num:{ cy:ny, bg:c.foil, ink:darken(c.foil, .72) } }; } },

  /* 6. Filigrana: fondo oscuro con volutas doradas arriba y abajo (como las ediciones especiales) */
  filigrana:{ name:'Filigrana', parts:[['base', 'Fondo'], ['foil', 'Filigrana'], ['accent', 'Detalles']], font:{ font:'cinzel', wt:700, up:1, ls:.05, max:14 },
    colors:([B, F, A]) => ({ base:darken(B, .3), foil:F, accent:A }),
    draw:(o, c, w, h) => { const cx = w / 2, sw = Math.min(w / 2 - 3, 13), cy = h - 37;
      const curl = `M${cx} 4C${cx - sw * .2} 9 ${cx - sw} 7 ${cx - sw} 13C${cx - sw} 17 ${cx - sw * .45} 18 ${cx - sw * .35} 15C${cx - sw * .25} 12.5 ${cx - sw * .6} 12 ${cx - sw * .6} 14.5`;
      const half = `<path d="${curl}" fill="none" stroke="${c.foil}" stroke-width=".9" stroke-linecap="round"/><path d="${curl}" fill="none" stroke="${c.foil}" stroke-width=".9" stroke-linecap="round" transform="translate(${w} 0) scale(-1 1)"/>
        <path d="M${cx} 9l2.2 3.5-2.2 3.5-2.2-3.5z" fill="${c.accent}" stroke="${c.foil}" stroke-width=".4"/><path d="M${cx - sw * .5} 21H${cx + sw * .5}" stroke="${c.foil}" stroke-width=".6"/>`;
      const svg = `${half}<g transform="translate(0 ${h}) scale(1 -1)">${half}</g><path d="M3 26V${h - 26}M${w - 3} 26V${h - 26}" stroke="${c.foil}" stroke-width=".6"/>
        <circle cx="3" cy="26" r="1" fill="${c.accent}"/><circle cx="${w - 3}" cy="26" r="1" fill="${c.accent}"/><circle cx="3" cy="${h - 26}" r="1" fill="${c.accent}"/><circle cx="${w - 3}" cy="${h - 26}" r="1" fill="${c.accent}"/>`
        + (o.num ? ring(cx, cy, 6.8, c.base, c.foil, .7) + `<circle cx="${cx - 9.5}" cy="${cy}" r=".9" fill="${c.accent}"/><circle cx="${cx + 9.5}" cy="${cy}" r=".9" fill="${c.accent}"/>` : '');
      return { svg, box:{ l:6, t:26, w:w - 12, h:h - 52 - (o.num ? 20 : 0) }, tbg:[c.base], ink:c.foil, num:{ cy, bg:c.base, ink:c.foil } }; } },

  /* 7. Degradado: de un color a otro, con filetes finos arriba y abajo */
  degradado:{ name:'Degradado', parts:[['base', 'Arriba'], ['alt', 'Abajo'], ['foil', 'Filetes']], font:{ font:'deco', wt:700, up:1, ls:.12, max:15 },
    colors:([B, F, A]) => ({ base:B, alt:A, foil:F }),
    draw:(o, c, w, h) => { const g = sid(), cy = h - 22;
      const svg = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.base}"/><stop offset=".42" stop-color="${c.base}"/><stop offset="1" stop-color="${c.alt}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${g})"/>
        <path d="M4 7H${w - 4}M4 9.5H${w - 4}M4 ${h - 7}H${w - 4}M4 ${h - 9.5}H${w - 4}" stroke="${c.foil}" stroke-width=".6"/>`
        + (o.num ? ring(w / 2, cy, 6.8, c.alt, c.foil, .8) : '');
      const tb = Math.round(h * .74) - (o.num ? 18 : 0); // el título acaba donde el degradado va por la mitad
      return { svg, box:{ l:4, t:15, w:w - 8, h:tb - 15 }, tbg:[c.base, mix(c.base, c.alt, (tb / h - .42) / .58)], ink:c.foil, num:{ cy, bg:c.alt, ink:c.foil } }; } },

  /* 8. Tela: tapa de tela con estampado arriba y abajo y etiqueta de papel */
  tela:{ name:'Tela', parts:[['base', 'Tela'], ['alt', 'Etiqueta'], ['foil', 'Estampado']], font:{ font:'pag', wt:700, max:15 },
    colors:([B, F, A]) => ({ base:B, alt:mix(F, '#fbf6ec', .7), foil:F }),
    draw:(o, c, w, h) => { const lt = Math.round(h * .18), lh = Math.round(h * .56), cy = Math.round(lt + lh + (h - 10 - lt - lh) / 2), ink = darken(c.base, .2);
      const svg = `<path d="M3 7H${w - 3}M3 10H${w - 3}M3 ${h - 7}H${w - 3}M3 ${h - 10}H${w - 3}" stroke="${c.foil}" stroke-width=".8"/>${motifAt('diamond', w / 2, lt - 9, 6, c.foil)}
        <rect x="4" y="${lt}" width="${w - 8}" height="${lh}" rx="1" fill="${c.alt}" stroke="${darken(c.alt, .25)}" stroke-width=".6"/><rect x="5.5" y="${lt + 1.5}" width="${w - 11}" height="${lh - 3}" fill="none" stroke="${c.foil}" stroke-width=".4"/>`
        + (o.num ? `<rect x="${r1(w / 2 - 7.5)}" y="${cy - 6}" width="15" height="12" rx="1" fill="${c.alt}" stroke="${darken(c.alt, .25)}" stroke-width=".6"/>` : '');
      return { svg, box:{ l:6, t:lt + 3, w:w - 12, h:lh - 6 }, tbg:[c.alt], tex:'tex-cloth', ink, num:{ cy, bg:c.alt, ink } }; } },

  /* 9. Botánico: lámina de herbario, con una planta en flor abajo y una guirnalda de hojas arriba */
  botanico:{ name:'Botánico', parts:[['base', 'Fondo'], ['leaf', 'Hojas y tallos'], ['accent', 'Flores']], font:{ font:'pag', wt:700, max:16 },
    colors:([B, F, A]) => ({ base:mix(lighten(F, .3), '#fbf6ec', .7), leaf:darken(B, .05), accent:A }),
    draw:(o, c, w, h) => { const cx = w / 2, s = clamp(w / 34, .82, 1.2), stem = darken(c.leaf, .25), vein = darken(c.leaf, .3), L = Math.min(8.5 * s, w / 2 - 2.5);
      const fr = 6 * s, fy = Math.round(h * .73 + fr), y0 = h - 3; let pl = '';
      // tallo con tres pares de hojas y dos capullos a los lados
      pl += `<path d="M${cx} ${y0}C${r1(cx - 1.2)} ${r1(y0 - 10)} ${r1(cx + 1.2)} ${r1(fy + 12)} ${cx} ${r1(fy + fr * .3)}" stroke="${stem}" stroke-width="1" fill="none"/>`;
      const bud = (sx) => { const ex = cx + sx * Math.min(w / 2 - 4.5, 9 * s), ey = fy + 6 * s; return `<path d="M${cx} ${r1(y0 - 15 * s)}Q${r1(cx + sx * 3)} ${r1(ey + 6)} ${r1(ex)} ${r1(ey)}" stroke="${stem}" stroke-width=".7" fill="none"/><ellipse cx="${r1(ex)}" cy="${r1(ey - 1.6)}" rx="${r1(1.5 * s)}" ry="${r1(2.3 * s)}" fill="${c.accent}" stroke="${darken(c.accent, .25)}" stroke-width=".4"/>${leafG(ex, ey + .4, sx > 0 ? 125 : 55, 3.2 * s, c.leaf, vein)}`; };
      pl += bud(-1) + bud(1);
      [y0 - 4 * s, y0 - 11 * s, y0 - 18 * s].forEach((y, i) => { const l = L * (1 - i * .12); pl += leafG(cx, y, -152 + i * 6, l, i % 2 ? lighten(c.leaf, .12) : c.leaf, vein) + leafG(cx, y - 1.5, -28 - i * 6, l, i % 2 ? c.leaf : lighten(c.leaf, .12), vein); });
      pl += flowerF(cx, fy, fr, c.accent, darken(c.accent, .25), lighten(c.accent, .55));
      // arriba, una ramita que cuelga con dos pares de hojas y un capullo
      let top = `<path d="M${cx} 1.5V${r1(14 * s)}" stroke="${stem}" stroke-width=".8"/>`;
      [4 * s, 9 * s].forEach((y, i) => { const l = Math.min(6.5 * s, w / 2 - 3) * (1 - i * .15); top += leafG(cx, y, 148 - i * 8, l, i ? lighten(c.leaf, .12) : c.leaf, vein) + leafG(cx, y + .8, 32 + i * 8, l, i ? c.leaf : lighten(c.leaf, .12), vein); });
      top += `<ellipse cx="${cx}" cy="${r1(15.5 * s)}" rx="${r1(1.6 * s)}" ry="${r1(2.4 * s)}" fill="${c.accent}" stroke="${darken(c.accent, .25)}" stroke-width=".4"/>`;
      const cy = Math.round(fy - fr - 10);
      const svg = top + pl + (o.num ? ring(cx, cy, 6.5, c.base, c.leaf, .7) : '');
      const tt = Math.round(22 * s), tb = (o.num ? cy - 9 : fy - fr - 5);
      return { svg, box:{ l:4, t:tt, w:w - 8, h:tb - tt }, tbg:[c.base], ink:darken(c.leaf, .45), num:{ cy, bg:c.base, ink:darken(c.leaf, .45) } }; } },

  /* 10. Celestial: como una carta de tarot, luna creciente en un aro arriba y estrella de ocho puntas abajo */
  celestial:{ name:'Celestial', parts:[['base', 'Cielo'], ['foil', 'Oro'], ['accent', 'Luna']], font:{ font:'cinzel', wt:700, up:1, ls:.05, max:14 },
    colors:([B, F, A]) => ({ base:darken(B, .35), foil:F, accent:lighten(mix(F, A, .25), .3) }),
    draw:(o, c, w, h) => { const cx = w / 2, R = clamp(w * .3, 7, 10), c1 = 5 + R, gl = sid(), sr = clamp(w * .22, 5.5, 8), c2 = h - 7 - (o.num ? 7 : sr), glow = lighten(c.base, .12);
      let s = `<defs><radialGradient id="${gl}" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="${glow}"/><stop offset="1" stop-color="${c.base}"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#${gl})"/>`;
      s += ring(cx, c1, R, 'none', c.foil, .7);
      for(let i = 0; i < 12; i++){ const a = i * 30 * Math.PI / 180, x = cx + Math.cos(a) * (R + 2.2), y = c1 + Math.sin(a) * (R + 2.2); if(x > 1.5 && x < w - 1.5) s += `<circle cx="${r1(x)}" cy="${r1(y)}" r=".45" fill="${c.foil}"/>`; }
      s += moonG(cx, c1, R - 2.4, .3, c.accent, darken(c.base, .12));
      s += spark(Math.max(3.5, cx - R - 4), c1 + R + 3, 1.8, c.foil) + spark(Math.min(w - 3.5, cx + R + 3.5), c1 + R + 6, 1.3, c.foil);
      if(o.num){ s += ring(cx, c2, 7, darken(c.base, .15), c.foil, .8); for(let i = 0; i < 8; i++){ const a = (i * 45 + 22.5) * Math.PI / 180; s += `<path d="M${r1(cx + Math.cos(a) * 8)} ${r1(c2 + Math.sin(a) * 8)}L${r1(cx + Math.cos(a) * 9.6)} ${r1(c2 + Math.sin(a) * 9.6)}" stroke="${c.foil}" stroke-width=".55"/>`; } }
      else s += `<path d="${starP(cx, c2, sr, sr * .42, 8)}" fill="${c.foil}"/><circle cx="${cx}" cy="${r1(c2)}" r="${r1(sr * .2)}" fill="${c.base}"/><circle cx="${r1(cx - sr - 3)}" cy="${r1(c2)}" r=".7" fill="${c.foil}"/><circle cx="${r1(cx + sr + 3)}" cy="${r1(c2)}" r=".7" fill="${c.foil}"/>`;
      const tt = Math.round(c1 + R + 9), tb = Math.round(c2 - (o.num ? 10 : sr) - 6);
      return { svg:s, box:{ l:4, t:tt, w:w - 8, h:tb - tt }, tbg:[c.base, glow, mix(c.base, glow, .5)], ink:c.foil, num:{ cy:c2, bg:darken(c.base, .15), ink:c.foil } }; } },

  /* 11. Vitral: rosetón de vidrios de colores arriba, ventana ojival con el título y vidrieras en rombo abajo */
  vitral:{ name:'Vitral', parts:[['lead', 'Plomo'], ['base', 'Cristal central'], ['accent', 'Vidrio 1'], ['alt', 'Vidrio 2']], font:{ font:'cinzel', wt:700, up:1, ls:.04, max:14 },
    colors:([B, F, A]) => ({ lead:darken(B, .62), base:B, accent:A, alt:mix(F, A, .15) }),
    draw:(o, c, w, h) => { const cx = w / 2, R = Math.min(w / 2 - 2.5, 12), c1 = 3 + R, ri = R * .42, gr = sid(), pt = sid(), cl = sid();
      const P = (rr, a) => r1(cx + Math.cos(a) * rr) + ' ' + r1(c1 + Math.sin(a) * rr); let s = `<rect width="${w}" height="${h}" fill="${c.lead}"/>`;
      for(let i = 0; i < 8; i++){ const a0 = (-112.5 + i * 45) * Math.PI / 180, a1 = a0 + Math.PI / 4;
        s += `<path d="M${P(ri, a0)}L${P(R, a0)}A${r1(R)} ${r1(R)} 0 0 1 ${P(R, a1)}L${P(ri, a1)}A${r1(ri)} ${r1(ri)} 0 0 0 ${P(ri, a0)}Z" fill="${i % 2 ? c.accent : c.alt}" stroke="${c.lead}" stroke-width=".9"/>`; }
      s += ring(cx, c1, r1(ri), lighten(c.accent, .25), c.lead, .9);
      const x0 = 3.2, x1 = w - 3.2, y0 = c1 + R + 3.5, ah = (x1 - x0) * .55, y1 = h - 30, ar = r1((x1 - x0) * .8);
      s += `<defs><linearGradient id="${gr}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(c.base, .18)}"/><stop offset=".5" stop-color="${c.base}"/><stop offset="1" stop-color="${darken(c.base, .12)}"/></linearGradient>
        <pattern id="${pt}" width="8" height="10" patternUnits="userSpaceOnUse" x="${r1(cx - 4)}" y="${y1 + 2.5}"><rect width="8" height="10" fill="${c.alt}"/><path d="M4 0L8 5 4 10 0 5Z" fill="${c.accent}" stroke="${c.lead}" stroke-width=".8"/></pattern>
        <clipPath id="${cl}"><rect x="${x0}" y="${y1 + 2.5}" width="${r1(x1 - x0)}" height="${r1(h - 3.5 - y1 - 2.5)}" rx="1"/></clipPath></defs>
        <path d="M${x0} ${y1}V${r1(y0 + ah)}A${ar} ${ar} 0 0 1 ${r1(cx)} ${r1(y0)}A${ar} ${ar} 0 0 1 ${x1} ${r1(y0 + ah)}V${y1}Z" fill="url(#${gr})" stroke="${lighten(c.lead, .2)}" stroke-width=".6"/>
        <rect x="${x0}" y="${y1 + 2.5}" width="${r1(x1 - x0)}" height="${r1(h - 3.5 - y1 - 2.5)}" fill="url(#${pt})" clip-path="url(#${cl})"/>`;
      const cy = Math.round((y1 + 2.5 + h - 3.5) / 2);
      if(o.num) s += ring(cx, cy, 7, c.base, c.lead, 1.4);
      const tt = Math.round(y0 + ah * .75);
      return { svg:s, box:{ l:x0 + 2, t:tt, w:r1(x1 - x0 - 4), h:y1 - 4 - tt }, tbg:[lighten(c.base, .18), c.base, darken(c.base, .12)], ink:lighten(c.alt, .45), num:{ cy, bg:c.base, ink:lighten(c.alt, .45) } }; } },

  /* 12. Daga: una daga colgando bajo el título, con la gema del pomo */
  daga:{ name:'Daga', parts:[['base', 'Fondo'], ['foil', 'Hoja y guarda'], ['accent', 'Puño y gema']], font:{ font:'cinzel', wt:700, up:1, ls:.05, max:15 },
    colors:([B, F, A]) => ({ base:B, foil:F, accent:A }),
    draw:(o, c, w, h) => { const cx = w / 2, gw = Math.min(w / 2 - 3.5, 11), pr = o.num ? 7 : 3.6, tip = h - 5, bl = Math.round(h * .22), gy = tip - bl, gl = 9, py = gy - 2 - gl - pr, m = sid();
      let s = `<defs><linearGradient id="${m}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${lighten(c.foil, .35)}"/><stop offset=".5" stop-color="${c.foil}"/><stop offset="1" stop-color="${darken(c.foil, .35)}"/></linearGradient></defs>`;
      s += `<path d="M${r1(cx - 3.4)} ${gy + 1.6}L${cx} ${gy + 1.6}L${cx} ${tip}Z" fill="${lighten(c.foil, .2)}"/><path d="M${cx} ${gy + 1.6}L${r1(cx + 3.4)} ${gy + 1.6}L${cx} ${tip}Z" fill="${darken(c.foil, .18)}"/><path d="M${cx} ${gy + 2}V${tip - 3}" stroke="${darken(c.foil, .35)}" stroke-width=".35"/>`;
      s += `<rect x="${r1(cx - 1.7)}" y="${r1(py + pr - .5)}" width="3.4" height="${r1(gl + 2.5)}" fill="${darken(c.accent, .3)}"/>`;
      for(let y = py + pr + 1; y < gy - 1.5; y += 2) s += `<path d="M${r1(cx - 1.7)} ${r1(y + 1)}L${r1(cx + 1.7)} ${r1(y)}" stroke="${lighten(c.accent, .15)}" stroke-width=".5"/>`;
      s += `<rect x="${r1(cx - gw)}" y="${r1(gy - 1.5)}" width="${r1(gw * 2)}" height="3" rx="1.5" fill="url(#${m})" stroke="${darken(c.foil, .45)}" stroke-width=".4"/><circle cx="${r1(cx - gw)}" cy="${gy}" r="2" fill="${c.foil}"/><circle cx="${r1(cx + gw)}" cy="${gy}" r="2" fill="${c.foil}"/><path d="M${cx} ${gy - 2.2}L${cx + 2.2} ${gy}L${cx} ${gy + 2.2}L${cx - 2.2} ${gy}Z" fill="${c.accent}" stroke="${darken(c.foil, .45)}" stroke-width=".3"/>`;
      s += ring(cx, r1(py), pr, c.accent, c.foil, o.num ? 1 : .8) + (o.num ? '' : `<circle cx="${r1(cx - 1)}" cy="${r1(py - 1)}" r=".8" fill="${lighten(c.accent, .55)}"/>`);
      const tb = Math.round(py - pr - 6);
      return { svg:s, box:{ l:4, t:8, w:w - 8, h:tb - 8 }, tbg:[c.base], ink:c.foil, num:{ cy:py, bg:c.accent, ink:c.foil } }; } },

  /* 13. Sello de lacre: sello con su cinta abajo y filetes finos arriba */
  sello:{ name:'Sello de lacre', parts:[['base', 'Fondo'], ['accent', 'Lacre'], ['alt', 'Cinta'], ['foil', 'Filetes']], font:{ font:'pag', wt:700, max:16 },
    colors:([B, F, A]) => ({ base:B, accent:A, alt:mix(F, B, .3), foil:F }),
    draw:(o, c, w, h) => { const cx = w / 2, R = Math.min(w / 2 - 3, 9.5), cy = Math.round(h - R - 17), wax = darken(c.accent, .28);
      let s = `<path d="M4 6H${w - 4}" stroke="${c.foil}" stroke-width=".7"/><path d="M4 8.3H${w - 4}" stroke="${c.foil}" stroke-width=".4"/>`;
      s += tailG(cx - 1, cy, cx - R * .75, h + 1, 2.6, c.alt, darken(c.alt, .25)) + tailG(cx + 1, cy, cx + R * .8, h - 1, 2.6, darken(c.alt, .08), darken(c.alt, .3));
      let p = ''; for(let i = 0; i < 36; i++){ const a = i * 10 * Math.PI / 180, rr = R * (i % 2 ? .93 : 1) + Math.sin(i * 1.7) * .25; p += (i ? 'L' : 'M') + r1(cx + Math.cos(a) * rr) + ' ' + r1(cy + Math.sin(a) * rr); }
      s += `<path d="${p}Z" fill="${c.accent}" stroke="${darken(c.accent, .18)}" stroke-width=".4"/>` + ring(cx, cy, r1(R * .72), 'none', wax, .8);
      s += `<path d="M${r1(cx - R * .62)} ${r1(cy - R * .3)}A${r1(R * .72)} ${r1(R * .72)} 0 0 1 ${r1(cx - R * .1)} ${r1(cy - R * .7)}" stroke="${lighten(c.accent, .28)}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
      if(!o.num) s += motifAt(o.motif || 'rose', cx, cy, R * .9, wax);
      const tb = Math.round(cy - R - 6);
      return { svg:s, box:{ l:4, t:13, w:w - 8, h:tb - 13 }, tbg:[c.base], ink:c.foil, num:{ cy, bg:c.accent, ink:darken(c.accent, .55) } }; } },

  /* 14. Neón: marco de neón alrededor del título y horizonte con sol y rejilla (ciencia ficción) */
  neon:{ name:'Neón', parts:[['base', 'Fondo'], ['accent', 'Neón'], ['alt', 'Sol y rejilla']], font:{ font:'pop', wt:700, up:1, ls:.06, max:17 },
    colors:([B, F, A]) => ({ base:darken(B, .72), accent:vivid(A), alt:vivid(F, .62) }),
    draw:(o, c, w, h) => { const cx = w / 2, hz = h - 27, fy = 7, fh = hz - 7 - fy, rx = r1(Math.min(5, w * .16)), gl = sid(), sg = sid(), cl = sid(), sr = r1(Math.min(9, w * .3)), cy = fy + fh - 11, core = lighten(c.accent, .6);
      let s = `<defs><filter id="${gl}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.3"/></filter>
        <linearGradient id="${sg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(c.alt, .25)}"/><stop offset="1" stop-color="${c.accent}"/></linearGradient><clipPath id="${cl}"><rect y="${hz}" width="${w}" height="${h - hz}"/></clipPath></defs>`;
      s += `<rect x="4" y="${fy}" width="${w - 8}" height="${fh}" rx="${rx}" fill="none" stroke="${c.accent}" stroke-width="2.2" filter="url(#${gl})"/><rect x="4" y="${fy}" width="${w - 8}" height="${fh}" rx="${rx}" fill="none" stroke="${core}" stroke-width=".7"/>`;
      s += `<path d="M${r1(cx - sr)} ${hz}A${sr} ${sr} 0 0 1 ${r1(cx + sr)} ${hz}Z" fill="url(#${sg})"/>` + [2, 4.6, 6.8].map((d, i) => `<rect x="${r1(cx - sr)}" y="${r1(hz - d)}" width="${r1(sr * 2)}" height="${r1(1 - i * .2)}" fill="${c.base}"/>`).join('');
      let gr = `<path d="M0 ${hz}H${w}" stroke="${c.alt}" stroke-width="1"/>`;
      for(let k = 1; k <= 5; k++){ const y = r1(hz + (h - hz) * (k / 5) ** 1.6); gr += `<path d="M0 ${y}H${w}" stroke="${mix(c.base, c.alt, .75)}" stroke-width=".5"/>`; }
      for(let k = -4; k <= 4; k++) gr += `<path d="M${r1(cx + k * 1.5)} ${hz}L${r1(cx + k * w * .32)} ${h}" stroke="${mix(c.base, c.alt, .75)}" stroke-width=".5"/>`;
      s += `<g clip-path="url(#${cl})">${gr}</g>`;
      if(o.num) s += `<circle cx="${cx}" cy="${cy}" r="6.5" fill="none" stroke="${c.accent}" stroke-width="1.8" filter="url(#${gl})"/><circle cx="${cx}" cy="${cy}" r="6.5" fill="${c.base}" stroke="${core}" stroke-width=".6"/>`;
      const ink = lighten(c.accent, .75);
      return { svg:s, box:{ l:6, t:fy + 4, w:w - 12, h:fh - 8 - (o.num ? 19 : 0) }, tbg:[c.base], ink, glow:c.accent, num:{ cy, bg:c.base, ink } }; } },

  /* 15. Lazo: cinta con lazo arriba y encaje abajo (romance) */
  lazo:{ name:'Lazo', parts:[['base', 'Fondo'], ['alt', 'Lazo'], ['foil', 'Encaje']], font:{ font:'pag', wt:700, max:16 },
    colors:([B, F, A]) => ({ base:pastel(B, .74), alt:darken(B, .05), foil:pastel(F, .95) }),
    draw:(o, c, w, h) => { const cx = w / 2, by = 13, L = Math.min(w / 2 - 2, 12), edge = darken(c.alt, .28), yl = h - 13, cy = yl - 13;
      let s = `<rect y="${by - 2.2}" width="${w}" height="4.4" fill="${c.alt}"/><path d="M0 ${by - 1.8}H${w}" stroke="${lighten(c.alt, .25)}" stroke-width=".5"/><path d="M0 ${by + 2}H${w}" stroke="${darken(c.alt, .18)}" stroke-width=".5"/>`;
      s += tailG(cx - .8, by + 1, cx - 5.5, by + 23, 2.1, c.alt, edge) + tailG(cx + .8, by + 1, cx + 5.8, by + 25, 2.1, darken(c.alt, .07), edge);
      const loop = sx => `<path d="M${cx} ${by}C${r1(cx + sx * L * .3)} ${by - 8.5} ${r1(cx + sx * (L + 1))} ${by - 8} ${r1(cx + sx * L)} ${r1(by - .5)}C${r1(cx + sx * (L - .5))} ${by + 4.5} ${r1(cx + sx * L * .35)} ${by + 2.5} ${cx} ${by}Z" fill="${c.alt}" stroke="${edge}" stroke-width=".5"/><path d="M${r1(cx + sx * 2)} ${by - .8}Q${r1(cx + sx * L * .55)} ${by - 4} ${r1(cx + sx * (L - 1.5))} ${by - 1.5}" stroke="${lighten(c.alt, .28)}" stroke-width=".5" fill="none"/>`;
      s += loop(-1) + loop(1) + `<rect x="${cx - 2.3}" y="${by - 3}" width="4.6" height="6" rx="1.6" fill="${darken(c.alt, .1)}" stroke="${edge}" stroke-width=".4"/>`;
      // encaje: banda con puntitos y festones calados
      s += `<path d="M0 ${yl - 2}H${w}" stroke="${darken(c.foil, .15)}" stroke-width=".4"/><rect y="${yl - 1.2}" width="${w}" height="5" fill="${c.foil}"/>`;
      for(let x = 0; x < w + 7; x += 7) s += `<circle cx="${x}" cy="${yl + 4}" r="3.6" fill="${c.foil}"/>`;
      for(let x = 0; x < w + 7; x += 7) s += `<circle cx="${x}" cy="${yl + 4.6}" r="1.2" fill="${c.base}"/><circle cx="${x + 3.5}" cy="${yl + 1.2}" r=".6" fill="${c.base}"/>`;
      if(o.num) s += `<path d="${heartP(cx, cy, 15)}" fill="${c.alt}" stroke="${edge}" stroke-width=".4"/>`;
      const tt = by + 27, tb = o.num ? cy - 10 : yl - 6;
      return { svg:s, box:{ l:4, t:tt, w:w - 8, h:tb - tt }, tbg:[c.base], ink:darken(c.alt, .4), num:{ cy:cy - 1, bg:c.alt, ink:darken(c.alt, .6) } }; } },

  /* Modo de serie «Fases de la luna»: la luna crece de un tomo a otro (no sale en la lista de diseños) */
  luna:{ name:'Fases de la luna', saga:true, parts:[['base', 'Cielo'], ['foil', 'Luna y estrellas'], ['alt', 'Sombra de la luna']], font:{ font:'cinzel', wt:700, up:1, ls:.05, max:14 },
    colors:([B, F]) => ({ base:darken(B, .45), foil:lighten(F, .2), alt:darken(B, .6) }),
    draw:(o, c, w, h) => { const cx = w / 2, R = Math.min(w / 2 - 4.5, 10.5), my = h - (o.num ? 25 : 14) - R, gl = sid(), r = rng(o.seed || 1), glow = lighten(c.base, .12);
      let s = `<defs><radialGradient id="${gl}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${glow}"/><stop offset="1" stop-color="${c.base}"/></radialGradient></defs><circle cx="${cx}" cy="${r1(my)}" r="${r1(R * 2.4)}" fill="url(#${gl})"/>`;
      s += ring(cx, my, r1(R + 2.8), 'none', mix(c.base, c.foil, .35), .5) + moonG(cx, my, R, o.phase == null ? 1 : o.phase, c.foil, c.alt);
      const tb = Math.round(my - R - 12);
      for(let i = 0; i < 6; i++){ const x = 3 + r() * (w - 6), y = tb + 2 + r() * (my + R - tb), far = Math.hypot(x - cx, y - my) > R + 4; if(far) s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(.35 + r() * .45)}" fill="${c.foil}"/>`; }
      s += spark(Math.max(3.5, cx - R - 3), my - R + 1, 1.6, c.foil);
      if(o.num) s += `<circle cx="${r1(cx - 9)}" cy="${h - 13}" r=".6" fill="${c.foil}"/><circle cx="${r1(cx + 9)}" cy="${h - 13}" r=".6" fill="${c.foil}"/>`;
      return { svg:s, box:{ l:4, t:10, w:w - 8, h:tb - 10 }, tbg:[c.base], ink:c.foil, num:{ cy:h - 13, bg:c.base, ink:c.foil } }; } }
};
const SPINE_ORDER = ['holo', 'marco', 'jaspeado', 'escamas', 'grimorio', 'filigrana', 'degradado', 'tela', 'botanico', 'celestial', 'vitral', 'daga', 'sello', 'neon', 'lazo'];
/* Estilos antiguos → los nuevos (para colecciones guardadas antes) */
const STYLE_ALIAS = { ilustrado:'celestial', estrellado:'celestial', planeta:'celestial', enredadera:'botanico', synth:'neon', cristal:'holo',
  nervios:'marco', bloque:'tela', deco:'filigrana', rayas:'degradado', acuarela:'holo' };
const styleKey = s => SPINES[s] && !SPINES[s].saga ? s : STYLE_ALIAS[s] || '';

/* Número de tomo: el tamaño depende de cuántas cifras tenga */
const numSize = n => [8.5, 8.5, 7.5, 6.5, 5.6][Math.min(String(n).length, 4)];
/* Dibuja un lomo. o = { w, h, title, author, num, seed, phase, motif }; c = colores ya resueltos de sus partes; ink = letras elegidas (o vacío) */
function drawSpine(style, o, c, ink){
  const D = SPINES[style], r = D.draw(o, c, o.w, o.h);
  const letters = isHex(ink) ? ink : bestInk(r.ink, r.tbg); // las elegidas a mano se respetan (al cambiar de diseño vuelven a automático)
  const title = ttl({ title:o.title, ...D.font, titleInk:letters, glow:r.glow }, r.box);
  const extra = r.extra ? ttl({ title:r.extra.text, ...r.extra.font, titleInk:bestInk(letters, [r.extra.bg]) }, r.extra.box) : '';
  let num = '';
  if(o.num && r.num){ const n = r.num, ni = isHex(ink) && contrast(ink, n.bg) >= 3 ? ink : bestInk(n.ink, [n.bg]);
    num = `<span class="nm" style="top:${r1(n.cy - 7)}px;color:${ni};font-family:${FONT[D.font.font]};font-size:${numSize(o.num)}px${r.glow ? ';text-shadow:0 0 3px ' + r.glow : ''}">${o.num}</span>`; }
  const main = c.base || c.c1;
  return { ink:letters, html:`<div class="it"><div class="bk" style="--w:${o.w}px;--h:${o.h}px;--b:${main};--f:${letters}"><div class="face ${r.tex || ''}">${svgW(o.w, o.h, r.svg)}${title}${extra}${num}</div></div></div>` };
}
