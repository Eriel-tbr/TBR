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
FONT.romantica = "'Courgette','Lora',cursive";
let svid = 0; const sid = () => 'sv' + (++svid); // id únicos (en la página puede haber el mismo lomo con colores distintos)
const svgW = (w, h, s) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;inset:0;display:block" aria-hidden="true">${s}</svg>`;
const r1 = v => Math.round(v * 10) / 10;
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
const heartP = (cx, cy, s) => `M${r1(cx)} ${r1(cy + s * .42)}C${r1(cx - s * .9)} ${r1(cy - s * .1)} ${r1(cx - s * .55)} ${r1(cy - s * .62)} ${r1(cx)} ${r1(cy - s * .25)}C${r1(cx + s * .55)} ${r1(cy - s * .62)} ${r1(cx + s * .9)} ${r1(cy - s * .1)} ${r1(cx)} ${r1(cy + s * .42)}Z`;
/* Flor de cinco pétalos con la punta en forma de corazón; big = centro grande (para llevar el número) */
function flowerG(cx, cy, r, col, big){
  const e = darken(col, .28), W = r * .95, L = r; let s = '';
  const pet = `M0 0C${r1(-W * .7)} ${r1(-L * .25)} ${r1(-W * .66)} ${r1(-L * .95)} ${r1(-W * .22)} ${r1(-L)}L0 ${r1(-L * .85)}L${r1(W * .22)} ${r1(-L)}C${r1(W * .66)} ${r1(-L * .95)} ${r1(W * .7)} ${r1(-L * .25)} 0 0Z`;
  for(let i = 0; i < 5; i++) s += `<g transform="translate(${r1(cx)} ${r1(cy)}) rotate(${i * 72})"><path d="${pet}" fill="${col}" stroke="${e}" stroke-width=".4"/><path d="M0 ${r1(-L * .3)}V${r1(-L * .72)}" stroke="${darken(col, .18)}" stroke-width=".35"/></g>`;
  if(big) return s + `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(Math.max(5.8, r * .5))}" fill="${lighten(col, .62)}" stroke="${e}" stroke-width=".5"/>`;
  s += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r * .3)}" fill="${lighten(col, .62)}" stroke="${e}" stroke-width=".35"/>`;
  for(let i = 0; i < 5; i++){ const a = (i * 72 + 36 - 90) * Math.PI / 180; s += `<circle cx="${r1(cx + Math.cos(a) * r * .18)}" cy="${r1(cy + Math.sin(a) * r * .18)}" r="${r1(r * .05 + .2)}" fill="${e}"/>`; }
  return s;
}
/* Capullo cerrado con su cáliz */
const budG = (x, y, r, col, leaf) => `<ellipse cx="${r1(x)}" cy="${r1(y - r * .2)}" rx="${r1(r * .7)}" ry="${r1(r)}" fill="${col}" stroke="${darken(col, .28)}" stroke-width=".4"/><path d="M${r1(x - r * .8)} ${r1(y + r * .1)}Q${r1(x)} ${r1(y + r * 1.3)} ${r1(x + r * .8)} ${r1(y + r * .1)}L${r1(x)} ${r1(y + r * .5)}Z" fill="${leaf}"/>`;
const ring = (cx, cy, r, fill, stroke, sw) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

const SPINES = {
  /* 1. Lámina holo: varios colores difuminados y letras grandes y claras */
  holo:{ name:'Lámina holo', parts:[['c1', 'Color 1'], ['c2', 'Color 2'], ['c3', 'Color 3']], font:{ font:'pop', wt:700, up:1, ls:.05, max:19 },
    colors:([B, F, A]) => ({ c1:B, c2:A, c3:F }),
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
    draw:(o, c, w, h) => { const p = sid(), lh = Math.round(h * .64), lt = Math.round((h - lh) / 2), cy = Math.round(lt + lh + (h - 6 - lt - lh) / 2);
      const svg = `<defs><pattern id="${p}" width="10" height="7" patternUnits="userSpaceOnUse"><path d="M0 7A5 5 0 0 1 10 7M-5 3.5A5 5 0 0 1 5 3.5M5 3.5A5 5 0 0 1 15 3.5" fill="${mix(c.base, c.accent, .18)}" stroke="${c.accent}" stroke-width=".7"/></pattern></defs>
        <rect width="${w}" height="${h}" fill="url(#${p})"/><rect x="4" y="${lt}" width="${w - 8}" height="${lh}" rx="1.5" fill="${c.alt}" stroke="${c.foil}" stroke-width="1"/>
        <rect x="6" y="${lt + 2}" width="${w - 12}" height="${lh - 4}" rx="1" fill="none" stroke="${c.foil}" stroke-width=".4" opacity=".7"/><rect y="5" width="${w}" height="1.2" fill="${c.foil}"/><rect y="${h - 6}" width="${w}" height="1.2" fill="${c.foil}"/>`
        + (o.num ? ring(w / 2, cy, 6.8, c.alt, c.foil, .8) : '');
      return { svg, box:{ l:7, t:lt + 4, w:w - 14, h:lh - 8 }, tbg:[c.alt], ink:c.foil, num:{ cy, bg:c.alt, ink:c.foil } }; } },

  /* 5. Grimorio: cantoneras de metal, correa de piel cosida y un cristal tallado */
  grimorio:{ name:'Grimorio', parts:[['base', 'Piel'], ['foil', 'Metal'], ['accent', 'Cristal']], font:{ font:'cinzel', wt:700, up:1, ls:.04, max:14 },
    colors:([B, F, A]) => ({ base:darken(B, .2), foil:F, accent:A }),
    draw:(o, c, w, h) => { const cx = w / 2, cy = Math.round(h * (o.num ? .7 : .76)), m = sid(), gm = sid(), k = r1(Math.min(1.35, (w - 8) / 14.4)), gy = cy + 5.5, ny = Math.min(h - 13, cy + 31);
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
    colors:([B, F, A]) => ({ base:B, alt:mix(B, A, .65), foil:F }),
    draw:(o, c, w, h) => { const g = sid(), cy = h - 22;
      const svg = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.base}"/><stop offset=".42" stop-color="${c.base}"/><stop offset="1" stop-color="${c.alt}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${g})"/>
        <path d="M4 7H${w - 4}M4 9.5H${w - 4}M4 ${h - 7}H${w - 4}M4 ${h - 9.5}H${w - 4}" stroke="${c.foil}" stroke-width=".6"/>`
        + (o.num ? ring(w / 2, cy, 6.8, c.alt, c.foil, .8) : '');
      const tb = h - 15 - (o.num ? 18 : 0); // título centrado en el lomo
      return { svg, box:{ l:4, t:15, w:w - 8, h:tb - 15 }, tbg:[c.base, mix(c.base, c.alt, (tb / h - .42) / .58), mix(c.base, c.alt, (tb / h - .42) / .9)], ink:c.foil, num:{ cy, bg:c.alt, ink:c.foil } }; } },

  /* 8. Tela: tapa de tela con estampado arriba y abajo y etiqueta de papel */
  tela:{ name:'Tela', parts:[['base', 'Tela'], ['alt', 'Etiqueta'], ['foil', 'Estampado']], font:{ font:'pag', wt:700, max:15 },
    colors:([B, F, A]) => ({ base:B, alt:mix(F, '#fbf6ec', .7), foil:F }),
    draw:(o, c, w, h) => { const lh = Math.round(h * .56), lt = Math.round((h - lh) / 2), cy = Math.round(lt + lh + (h - 10 - lt - lh) / 2), ink = darken(c.base, .2);
      const svg = `<path d="M3 7H${w - 3}M3 10H${w - 3}M3 ${h - 7}H${w - 3}M3 ${h - 10}H${w - 3}" stroke="${c.foil}" stroke-width=".8"/>
        <rect x="4" y="${lt}" width="${w - 8}" height="${lh}" rx="1" fill="${c.alt}" stroke="${darken(c.alt, .25)}" stroke-width=".6"/><rect x="5.5" y="${lt + 1.5}" width="${w - 11}" height="${lh - 3}" fill="none" stroke="${c.foil}" stroke-width=".4"/>`
        + (o.num ? `<rect x="${r1(w / 2 - 7.5)}" y="${cy - 6}" width="15" height="12" rx="1" fill="${c.alt}" stroke="${darken(c.alt, .25)}" stroke-width=".6"/>` : '');
      return { svg, box:{ l:6, t:lt + 3, w:w - 12, h:lh - 6 }, tbg:[c.alt], tex:'tex-cloth', ink, num:{ cy, bg:c.alt, ink } }; } },

  /* 9. Floral: tallos con hojas por los dos cantos y flores de cinco pétalos arriba y abajo (en las sagas, el número va en el centro de la flor grande) */
  floral:{ name:'Floral', parts:[['base', 'Fondo'], ['accent', 'Flores'], ['leaf', 'Hojas y tallos']], font:{ font:'pag', wt:700, max:16 },
    colors:([B, F, A]) => ({ base:B, accent:A, leaf:mix('#5f8a58', F, .2) }),
    draw:(o, c, w, h) => { const cx = w / 2, R = o.num ? clamp(w * .32, 9, 11.5) : clamp(w * .28, 7.5, 10.5), stem = darken(c.leaf, .2), vein = darken(c.leaf, .35), lf = (x, y, a, L, i) => leafG(x, y, a, L, i % 2 ? lighten(c.leaf, .12) : c.leaf, vein);
      const fy = h - R - 5, top = 19, bot = fy - R * 1.9; let s = '';
      // tallos por los dos cantos, con hojas hacia dentro
      [-1, 1].forEach(sd => { const x0 = sd < 0 ? 3.2 : w - 3.2; let p = `M${x0} ${r1(top)}`, i = 0;
        for(let y = top; y <= bot + 6; y += 3) p += `L${r1(x0 + Math.sin(y / 9 + (sd > 0 ? 2 : 0)) * 1.1)} ${r1(y)}`;
        s += `<path d="${p}" stroke="${stem}" stroke-width=".7" fill="none"/>`;
        for(let y = top + 6; y < bot; y += 12, i++){ const x = x0 + Math.sin(y / 9 + (sd > 0 ? 2 : 0)) * 1.1, a = (i % 2 ? -38 : 38) * (sd < 0 ? 1 : -1) + (sd < 0 ? 0 : 180); s += lf(x, y, a, Math.min(4.6, w * .14), i); } });
      // abajo: flor grande con hojas, una flor pequeña y un capullo
      s += lf(cx - R * .4, fy - R * .2, -158, R * 1.35, 0) + lf(cx + R * .4, fy - R * .1, -18, R * 1.3, 1) + lf(cx + R * .2, fy + R * .4, 40, R * 1.1, 0);
      const sx = cx - R * .55, sy = fy - R * 1.45, br = R * .5;
      s += `<path d="M${r1(cx)} ${r1(fy)}Q${r1(cx - R * .2)} ${r1(fy - R)} ${r1(sx)} ${r1(sy)}M${r1(cx)} ${r1(fy)}Q${r1(cx + R * .5)} ${r1(fy - R * .9)} ${r1(cx + R * .75)} ${r1(fy - R * 1.55)}" stroke="${stem}" stroke-width=".7" fill="none"/>`;
      s += budG(cx + R * .75, fy - R * 1.55, R * .32, c.accent, c.leaf) + flowerG(sx, sy, br, c.accent, false) + flowerG(cx, fy, R, c.accent, !!o.num);
      // arriba: una flor pequeña entre dos hojas
      const ty = 9; s += lf(cx - 1, ty + 1, 170, Math.min(7, w * .2), 0) + lf(cx + 1, ty + 1, 10, Math.min(7, w * .2), 1) + flowerG(cx, ty, Math.min(5.5, w * .16), c.accent, false);
      const tt = top + 3, tb = Math.round(bot - 3);
      return { svg:s, box:{ l:6.5, t:tt, w:w - 13, h:tb - tt }, tbg:[c.base], ink:lum(c.base) > .5 ? darken(c.leaf, .5) : lighten(c.accent, .7), num:{ cy:fy, bg:lighten(c.accent, .62), ink:darken(c.accent, .6) } }; } },

  /* 10. Celestial: cielo estrellado con una luna creciente */
  celestial:{ name:'Celestial', parts:[['base', 'Cielo'], ['alt', 'Cielo abajo'], ['foil', 'Luna y estrellas']], font:{ font:'cinzel', wt:700, up:1, ls:.05, max:14 },
    colors:([B, F, A]) => ({ base:darken(B, .45), alt:mix(darken(B, .2), A, .35), foil:F }),
    draw:(o, c, w, h) => { const cx = w / 2, g = sid(), mr = clamp(w * .16, 4, 5.5), my = mr + 7, rr = rng(o.seed || 3), cy = h - 14;
      const tt = Math.round(my + mr + 7), tb = Math.round(h - (o.num ? 26 : 12)), at = y => mix(c.base, c.alt, clamp(y / h, 0, 1));
      let s = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.base}"/><stop offset="1" stop-color="${c.alt}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${g})"/>`;
      // estrellas por todo el cielo menos detrás del título (en sus márgenes, sí)
      for(let i = 0; i < 70; i++){ const x = 1.5 + rr() * (w - 3), y = 2 + rr() * (h - 4), m = x < 4.5 || x > w - 4.5;
        if((y > tt - 2 && y < tb + 2 && !m) || Math.hypot(x - cx, y - my) < mr + 2 || (o.num && Math.hypot(x - cx, y - cy) < 9)) continue;
        s += rr() > .85 ? spark(x, y, 1 + rr() * 1, c.foil) : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(.3 + rr() * .5)}" fill="${c.foil}" opacity="${r1(.5 + rr() * .5)}"/>`; }
      s += `<path d="M${r1(cx)} ${r1(my - mr)}A${mr} ${mr} 0 0 0 ${r1(cx)} ${r1(my + mr)}A${r1(mr * 1.25)} ${r1(mr * 1.25)} 0 0 1 ${r1(cx)} ${r1(my - mr)}Z" fill="${c.foil}" transform="rotate(-24 ${r1(cx)} ${r1(my)}) translate(${r1(mr * .25)} 0)"/>`;
      if(o.num) s += ring(cx, cy, 6.5, 'none', c.foil, .6) + spark(cx - 9.5, cy, 1.5, c.foil) + spark(cx + 9.5, cy, 1.5, c.foil);
      return { svg:s, box:{ l:4, t:tt, w:w - 8, h:tb - tt }, tbg:[at(tt), at(tb), at((tt + tb) / 2)], ink:c.foil, num:{ cy, bg:at(cy), ink:c.foil } }; } },

  /* 11. Vidriera: todo el lomo es un mosaico de vidrios y el título va en una ventana ojival de cristal claro */
  vidriera:{ name:'Vidriera', parts:[['lead', 'Plomo'], ['base', 'Cristal del título'], ['accent', 'Vidrio 1'], ['alt', 'Vidrio 2'], ['c3', 'Vidrio 3']], font:{ font:'cinzel', wt:700, up:1, ls:.04, max:14 },
    colors:([B, F, A]) => ({ lead:darken(B, .72), base:lighten(mix(F, A, .2), .45), accent:A, alt:lighten(B, .12), c3:F }),
    draw:(o, c, w, h) => { const rr = rng(o.seed || 5), C = w > 38 ? 3 : 2, rows = Math.ceil(h / 8.5), gr = sid(), glass = [c.accent, c.alt, c.c3];
      const P = []; for(let r = 0; r <= rows; r++){ P.push([]); for(let k = 0; k <= C; k++){ const x = k / C * w, y = r / rows * h; P[r].push([k && k < C ? x + (rr() - .5) * 3.6 : x, r && r < rows ? y + (rr() - .5) * 4 : y]); } }
      let s = `<rect width="${w}" height="${h}" fill="${c.lead}"/>`;
      for(let r = 0; r < rows; r++) for(let k = 0; k < C; k++){ const q = [P[r][k], P[r][k + 1], P[r + 1][k + 1], P[r + 1][k]], col = glass[Math.floor(rr() * 3)], t = rr();
        s += `<path d="M${q.map(p => p.map(r1).join(' ')).join('L')}Z" fill="${t < .33 ? lighten(col, .16) : t < .66 ? col : darken(col, .14)}" stroke="${c.lead}" stroke-width="1.1" stroke-linejoin="round"/>`; }
      const x0 = 5, x1 = w - 5, y0 = 12, ah = (x1 - x0) * .55, y1 = h - (o.num ? 25 : 15), ar = r1((x1 - x0) * .8), cy = h - 12;
      const lancet = (i) => `M${x0 + i} ${y1 - i}V${r1(y0 + ah)}A${ar - i} ${ar - i} 0 0 1 ${r1(w / 2)} ${r1(y0 + i * 1.6)}A${ar - i} ${ar - i} 0 0 1 ${x1 - i} ${r1(y0 + ah)}V${y1 - i}Z`;
      s += `<defs><linearGradient id="${gr}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(c.base, .12)}"/><stop offset=".5" stop-color="${c.base}"/><stop offset="1" stop-color="${darken(c.base, .08)}"/></linearGradient></defs>
        <path d="${lancet(0)}" fill="url(#${gr})" stroke="${c.lead}" stroke-width="2"/><path d="${lancet(1.8)}" fill="none" stroke="${mix(c.lead, c.base, .55)}" stroke-width=".5"/>`;
      if(o.num) s += ring(w / 2, cy, 7, c.base, c.lead, 1.6);
      const tt = Math.round(y0 + ah * .72), ink = darken(c.accent, .55);
      return { svg:s, box:{ l:x0 + 2, t:tt, w:x1 - x0 - 4, h:y1 - 3 - tt }, tbg:[lighten(c.base, .12), c.base, darken(c.base, .08)], ink, num:{ cy, bg:c.base, ink } }; } },

  /* 12. Daga: el lomo entero es una daga y el título va grabado en la hoja */
  daga:{ name:'Daga', parts:[['base', 'Fondo'], ['foil', 'Hoja'], ['accent', 'Empuñadura'], ['alt', 'Gemas']], font:{ font:'cinzel', wt:700, up:1, ls:.05, max:15 },
    colors:([B, F, A]) => ({ base:B, foil:mix(F, '#e4e8ed', .6), accent:darken(A, .2), alt:A }),
    draw:(o, c, w, h) => { const cx = w / 2, gh = Math.min(3.6, w * .11), pr = Math.min(4.2, w * .14), py = pr + 3, g0 = py + pr + 1, gy = g0 + 13, bw = clamp(w * .58, 15, 24), hw = bw / 2, by = gy + 4.5, tip = h - 3, sh = tip - hw * 1.6;
      const m = sid(), bl = sid(), gm = sid();
      let s = `<defs><linearGradient id="${m}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(c.foil, .45)}"/><stop offset="1" stop-color="${darken(c.foil, .3)}"/></linearGradient>
        <linearGradient id="${bl}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${lighten(c.foil, .35)}"/><stop offset=".5" stop-color="${c.foil}"/><stop offset="1" stop-color="${darken(c.foil, .15)}"/></linearGradient>
        <radialGradient id="${gm}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${lighten(c.alt, .6)}"/><stop offset=".5" stop-color="${c.alt}"/><stop offset="1" stop-color="${darken(c.alt, .5)}"/></radialGradient></defs>`;
      // hoja
      s += `<path d="M${r1(cx - hw)} ${r1(by)}H${r1(cx + hw)}V${r1(sh)}L${r1(cx)} ${tip}L${r1(cx - hw)} ${r1(sh)}Z" fill="url(#${bl})" stroke="${darken(c.foil, .4)}" stroke-width=".5"/>
        <path d="M${r1(cx - hw + 1.3)} ${r1(by + 1)}V${r1(sh - .4)}L${r1(cx)} ${r1(tip - 2.2)}" stroke="${lighten(c.foil, .55)}" stroke-width=".45" fill="none"/><path d="M${r1(cx + hw - 1.3)} ${r1(by + 1)}V${r1(sh - .4)}L${r1(cx)} ${r1(tip - 2.2)}" stroke="${darken(c.foil, .35)}" stroke-width=".45" fill="none"/>`;
      // puño con cuero enrollado, guarda curva y pomo con gema
      s += `<rect x="${r1(cx - gh)}" y="${r1(g0)}" width="${r1(gh * 2)}" height="${gy - g0 + 1}" fill="${c.accent}"/>`;
      for(let y = g0 + 1.2; y < gy; y += 2.2) s += `<path d="M${r1(cx - gh)} ${r1(y + 1.2)}L${r1(cx + gh)} ${r1(y)}" stroke="${darken(c.accent, .35)}" stroke-width=".6"/>`;
      s += `<path d="M2.5 ${r1(gy + 3.6)}Q${r1(cx)} ${r1(gy - 2.2)} ${r1(w - 2.5)} ${r1(gy + 3.6)}L${r1(w - 3)} ${r1(gy + 5.4)}Q${r1(cx)} ${r1(gy + 1.6)} 3 ${r1(gy + 5.4)}Z" fill="url(#${m})" stroke="${darken(c.foil, .45)}" stroke-width=".4"/>
        <circle cx="2.8" cy="${r1(gy + 5)}" r="1.6" fill="url(#${m})"/><circle cx="${r1(w - 2.8)}" cy="${r1(gy + 5)}" r="1.6" fill="url(#${m})"/>
        <path d="M${r1(cx)} ${r1(gy - .6)}L${r1(cx + 2.4)} ${r1(gy + 1.8)}L${r1(cx)} ${r1(gy + 4.2)}L${r1(cx - 2.4)} ${r1(gy + 1.8)}Z" fill="url(#${gm})" stroke="${darken(c.foil, .45)}" stroke-width=".35"/>`;
      s += ring(cx, py, r1(pr + .8), 'none', c.foil, 1) + `<circle cx="${r1(cx)}" cy="${r1(py)}" r="${r1(pr)}" fill="url(#${gm})"/><circle cx="${r1(cx - pr * .35)}" cy="${r1(py - pr * .35)}" r="${r1(pr * .22)}" fill="${lighten(c.alt, .8)}"/>`;
      const ink = darken(c.foil, .72), cy = Math.round(sh - 9);
      if(o.num) s += ring(cx, cy, 6, 'none', darken(c.foil, .35), .5);
      const tt = Math.round(by + 3), tb = Math.round(o.num ? cy - 9 : sh - 3);
      return { svg:s, box:{ l:r1(cx - hw + 2), t:tt, w:r1(bw - 4), h:tb - tt }, tbg:[lighten(c.foil, .35), c.foil, darken(c.foil, .15)], ink, num:{ cy, bg:c.foil, ink } }; } },

  /* 13. Romántico: título grande en letra caligráfica sobre una cinta de raso, con corazoncitos en el fondo */
  romantico:{ name:'Romántico', parts:[['base', 'Fondo'], ['alt', 'Cinta'], ['foil', 'Pespuntes'], ['accent', 'Corazones']], font:{ font:'romantica', wt:400, ls:0, max:21 },
    colors:([B, F, A]) => ({ base:B, alt:darken(B, .28), foil:F, accent:A }),
    draw:(o, c, w, h) => { const pt = sid(), sg = sid(), hc = mix(c.base, c.accent, .4), x0 = 4.5, x1 = w - 4.5, cy = h - 13;
      let s = `<defs><pattern id="${pt}" width="10" height="12" patternUnits="userSpaceOnUse"><path d="${heartP(2.5, 3, 3.2)}" fill="${hc}"/><path d="${heartP(7.5, 9, 3.2)}" fill="${hc}"/></pattern>
        <linearGradient id="${sg}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${darken(c.alt, .12)}"/><stop offset=".35" stop-color="${lighten(c.alt, .12)}"/><stop offset=".65" stop-color="${c.alt}"/><stop offset="1" stop-color="${darken(c.alt, .15)}"/></linearGradient></defs>
        <rect width="${w}" height="${h}" fill="url(#${pt})"/><rect x="${x0}" y="0" width="${r1(x1 - x0)}" height="${h}" fill="url(#${sg})"/>
        <path d="M${x0 + 1.4} 0V${h}M${x1 - 1.4} 0V${h}" stroke="${c.foil}" stroke-width=".5" stroke-dasharray="1.6 1.2"/>`;
      if(o.num) s += `<path d="${heartP(w / 2, cy + .8, 15)}" fill="${c.accent}"/>`;
      const ink = lighten(c.foil, .3);
      return { svg:s, box:{ l:x0 + 2, t:9, w:r1(x1 - x0 - 4), h:h - 18 - (o.num ? 18 : 0) }, tbg:[c.alt, lighten(c.alt, .12), darken(c.alt, .12)], ink, num:{ cy, bg:c.accent, ink:lighten(c.accent, .85) } }; } },

  /* 14. Mapa: pergamino con montañas y costa arriba, la ruta marcada y una rosa de los vientos abajo */
  mapa:{ name:'Mapa', parts:[['base', 'Pergamino'], ['alt', 'Tinta'], ['accent', 'Ruta']], font:{ font:'serif', wt:700, max:17 },
    colors:([B, F, A]) => ({ base:mix(lighten(F, .45), '#eadbb8', .6), alt:mix(darken(B, .35), '#3a2a1a', .5), accent:A }),
    draw:(o, c, w, h) => { const cx = w / 2, vg = sid(), rr = rng(o.seed || 9), zt = Math.round(h * .2), R = Math.min(w / 2 - 3, 11), ay = h - R - 5;
      let s = `<defs><radialGradient id="${vg}" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="${c.base}"/><stop offset="1" stop-color="${darken(c.base, .2)}"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#${vg})"/>`;
      // costa con olas, montañas y árboles
      let p = `M-1 ${r1(zt * .78)}`; for(let x = 0; x <= w + 2; x += 2) p += `L${x} ${r1(zt * .78 + Math.sin(x / 3.2) * 1.6 + Math.sin(x / 7) * 1.4)}`;
      s += `<path d="${p}" stroke="${c.alt}" stroke-width=".7" fill="none"/>`;
      for(let i = 0; i < 4; i++) s += `<path d="M${r1(3 + rr() * (w - 9))} ${r1(zt * .88 + i % 2 * 2.5)}h${r1(2.5 + rr() * 2)}" stroke="${c.alt}" stroke-width=".4"/>`;
      for(let i = 0, x = 3.5; x < w - 4; i++, x += 5 + rr() * 3){ const y = zt * (.42 + (i % 2) * .16), m = 2.2 + rr() * 1.4;
        s += `<path d="M${r1(x - m)} ${r1(y + m)}L${r1(x)} ${r1(y - m * .6)}L${r1(x + m)} ${r1(y + m)}" stroke="${c.alt}" stroke-width=".6" fill="none" stroke-linejoin="round"/><path d="M${r1(x)} ${r1(y - m * .6)}L${r1(x + m * .45)} ${r1(y + m)}" stroke="${c.alt}" stroke-width=".35"/>`; }
      for(let i = 0; i < 3; i++){ const x = 4 + rr() * (w - 8), y = zt * (.12 + rr() * .14); s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="1.2" fill="none" stroke="${c.alt}" stroke-width=".45"/><path d="M${r1(x)} ${r1(y + 1.2)}v1.4" stroke="${c.alt}" stroke-width=".45"/>`; }
      // ruta con la X
      const xx = w * .72, xy = zt * .62; s += `<path d="M${r1(w * .18)} ${r1(zt * .95)}Q${r1(w * .3)} ${r1(zt * .55)} ${r1(w * .5)} ${r1(zt * .7)}T${r1(xx)} ${r1(xy)}" stroke="${c.accent}" stroke-width=".7" fill="none" stroke-dasharray="1.4 1.1"/>
        <path d="M${r1(xx - 1.8)} ${r1(xy - 1.8)}l3.6 3.6M${r1(xx + 1.8)} ${r1(xy - 1.8)}l-3.6 3.6" stroke="${c.accent}" stroke-width=".9" stroke-linecap="round"/>`;
      // rosa de los vientos
      s += ring(cx, ay, R, 'none', c.alt, .6) + ring(cx, ay, r1(R * .8), 'none', c.alt, .35);
      const pt = (a, L, wd, i) => { const A = a * Math.PI / 180, B1 = (a + 90) * Math.PI / 180, tx = cx + Math.cos(A) * L, ty = ay + Math.sin(A) * L, bx = Math.cos(B1) * wd, by2 = Math.sin(B1) * wd;
        return `<path d="M${r1(cx)} ${r1(ay)}L${r1(tx)} ${r1(ty)}L${r1(cx + bx)} ${r1(ay + by2)}Z" fill="${c.alt}"/><path d="M${r1(cx)} ${r1(ay)}L${r1(tx)} ${r1(ty)}L${r1(cx - bx)} ${r1(ay - by2)}Z" fill="${c.base}" stroke="${c.alt}" stroke-width=".35"/>`; };
      [45, 135, 225, 315].forEach(a => s += pt(a, R * .6, R * .16)); [-90, 0, 90, 180].forEach(a => s += pt(a, R * .98, R * .2));
      s += `<path d="M${r1(cx)} ${r1(ay - R - 3)}l1.6 2.6h-3.2z" fill="${c.accent}"/>`;
      if(o.num) s += ring(cx, ay, 5.6, c.base, c.alt, .6);
      const tt = zt + 4, tb = Math.round(ay - R - 7);
      return { svg:s, box:{ l:4, t:tt, w:w - 8, h:tb - tt }, tbg:[c.base], ink:c.alt, num:{ cy:ay, bg:c.base, ink:c.alt } }; } },

  /* 15. Noir: fondo oscuro, título grande en mayúsculas y una franja en diagonal abajo (contemporánea y thriller) */
  noir:{ name:'Noir', parts:[['base', 'Fondo'], ['accent', 'Franja'], ['alt', 'Filetes']], font:{ font:'pop', wt:700, up:1, ls:.06, max:20 },
    colors:([B, F, A]) => ({ base:darken(B, .55), accent:vivid(A, .5), alt:F }),
    draw:(o, c, w, h) => { const d = Math.min(9, w * .28), y1 = h - 36, bh = 12;
      let s = `<path d="M0 ${r1(y1 + d)}L${w} ${y1}L${w} ${y1 + bh}L0 ${r1(y1 + d + bh)}Z" fill="${c.accent}"/><path d="M0 ${r1(y1 + d + bh + 4)}L${w} ${y1 + bh + 4}" stroke="${c.alt}" stroke-width=".8"/>
        <rect x="4" y="6" width="${r1(w * .42)}" height="1.6" fill="${c.accent}"/><rect x="4" y="9" width="${r1(w * .22)}" height=".7" fill="${c.alt}"/>`;
      const tb = y1 - 5, cy = r1(y1 + d / 2 + bh / 2);
      return { svg:s, box:{ l:3, t:14, w:w - 6, h:tb - 14 }, tbg:[c.base], ink:lighten(c.alt, .55), num:{ cy, bg:c.accent, ink:lighten(c.accent, .85) } }; } },
  /* Modo de serie «Fases de la luna»: la luna crece de un tomo a otro (no sale en la lista de diseños) */
  luna:{ name:'Fases de la luna', saga:true, parts:[['base', 'Cielo'], ['foil', 'Luna y estrellas'], ['alt', 'Sombra de la luna']], font:{ font:'cinzel', wt:700, up:1, ls:.05, max:14 },
    colors:([B, F]) => ({ base:darken(B, .45), foil:lighten(F, .2), alt:darken(B, .6) }),
    draw:(o, c, w, h) => { const cx = w / 2, R = Math.min(w / 2 - 6, 8), my = h - (o.num ? 25 : 15) - R, gl = sid(), r = rng(o.seed || 1), glow = lighten(c.base, .12);
      let s = `<defs><radialGradient id="${gl}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${glow}"/><stop offset="1" stop-color="${c.base}"/></radialGradient></defs><circle cx="${cx}" cy="${r1(my)}" r="${r1(R * 2.4)}" fill="url(#${gl})"/>`;
      s += ring(cx, my, r1(R + 2.8), 'none', mix(c.base, c.foil, .35), .5) + moonG(cx, my, R, o.phase == null ? 1 : o.phase, c.foil, c.alt);
      const tb = Math.round(my - R - 12);
      for(let i = 0; i < 6; i++){ const x = 3 + r() * (w - 6), y = tb + 2 + r() * (my + R - tb), far = Math.hypot(x - cx, y - my) > R + 4; if(far) s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(.35 + r() * .45)}" fill="${c.foil}"/>`; }
      s += spark(Math.max(3.5, cx - R - 3), my - R + 1, 1.6, c.foil);
      if(o.num) s += `<circle cx="${r1(cx - 9)}" cy="${h - 13}" r=".6" fill="${c.foil}"/><circle cx="${r1(cx + 9)}" cy="${h - 13}" r=".6" fill="${c.foil}"/>`;
      return { svg:s, box:{ l:4, t:10, w:w - 8, h:tb - 10 }, tbg:[c.base], ink:c.foil, num:{ cy:h - 13, bg:c.base, ink:c.foil } }; } }
};
const SPINE_ORDER = ['holo', 'marco', 'jaspeado', 'escamas', 'grimorio', 'filigrana', 'degradado', 'tela', 'floral', 'celestial', 'vidriera', 'daga', 'romantico', 'mapa', 'noir'];
/* Estilos antiguos → los nuevos (para colecciones guardadas antes) */
const STYLE_ALIAS = { ilustrado:'celestial', estrellado:'celestial', planeta:'celestial', enredadera:'floral', botanico:'floral', synth:'holo', cristal:'holo',
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
