'use strict';
/* Mi TBR — los 15 diseños de lomo (fase 5, 27/10/2026).
   Reglas de todos:
   - El título manda: tiene su zona propia, lo más alta posible, sin adornos encima; letras con contraste ≥ 4 (bestInk).
   - Cada color que se ve sale de una parte editable (o de un tono más claro u oscuro de ella): no hay colores fijos,
     así que al cambiar una parte cambia todo lo suyo.
   Cada diseño: name, parts [[campo, nombre]], font (título), colors([B, F, A]) = colores por defecto a partir de la paleta
   (base, metal, acento: de la portada o de la estantería), draw(o, c, w, h, id) → { svg, box, tbg[], numTop, tex, ink }. */

FONT.cinzel = "'Cinzel','Cormorant Garamond',Georgia,serif";
let svid = 0; const sid = () => 'sv' + (++svid); // id únicos (en la página puede haber el mismo lomo con colores distintos)
const svgW = (w, h, s) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;inset:0;display:block" aria-hidden="true">${s}</svg>`;
const motifAt = (k, cx, cy, s, col) => `<path d="${MOTIF[k] || MOTIF.diamond}" transform="translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 16})" fill="${col}"/>`;
const r1 = v => Math.round(v * 10) / 10;

/* Letras que se leen sobre todos los fondos que pisan: la preferida si llega a 4:1; si no, una versión más clara u oscura; si no, casi blanco o casi negro */
function bestInk(pref, bgs, min = 4){
  bgs = bgs.filter(isHex); if(!bgs.length) return pref;
  const worst = c => Math.min(...bgs.map(b => contrast(c, b)));
  if(isHex(pref) && worst(pref) >= min) return pref;
  const avg = bgs.reduce((a, b) => mix(a, b, .5)), cands = isHex(pref) ? [legibleOn(pref, avg, min), lighten(pref, .55), darken(pref, .6), lighten(pref, .8), darken(pref, .8)] : [];
  const ok = cands.find(c => worst(c) >= min); if(ok) return ok;
  return worst('#fbf7ef') >= worst('#17121c') ? '#fbf7ef' : '#17121c';
}

/* Ramita con hojas (botánico): crece desde (x, y) hacia arriba (dir -1) o abajo (1) */
function sprig(x, y, len, dir, side, leaf, flower, seed){
  const r = rng(seed); let s = '', p = `M${x} ${y}`; const pts = [];
  for(let i = 1; i <= 6; i++){ const t = i / 6, xx = x + side * Math.sin(t * 2.2) * 4, yy = y + dir * len * t; p += `L${r1(xx)} ${r1(yy)}`; pts.push([xx, yy]); }
  s += `<path d="${p}" stroke="${darken(leaf, .15)}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
  pts.forEach(([xx, yy], i) => { if(i === pts.length - 1) return; const a = (i % 2 ? 1 : -1) * (40 + r() * 20), L = 5.5 - i * .5;
    s += `<g transform="translate(${r1(xx)} ${r1(yy)}) rotate(${dir < 0 ? a - 90 : a + 90})"><path d="M0 0C${L * .3} ${-L * .4} ${L * .8} ${-L * .3} ${L} 0 ${L * .8} ${L * .3} ${L * .3} ${L * .4} 0 0z" fill="${i % 2 ? leaf : lighten(leaf, .15)}"/></g>`; });
  const [fx, fy] = pts[pts.length - 1];
  for(let k = 0; k < 5; k++){ const a = k * 72 * Math.PI / 180; s += `<circle cx="${r1(fx + Math.cos(a) * 2)}" cy="${r1(fy + Math.sin(a) * 2)}" r="1.6" fill="${flower}"/>`; }
  return s + `<circle cx="${r1(fx)}" cy="${r1(fy)}" r="1.1" fill="${lighten(flower, .6)}"/>`;
}
/* Fase de la luna (0 nueva … 1 llena) dibujada con dos colores: luz y sombra */
function moonG(cx, cy, r, f, light, shade){
  if(f >= .999) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${light}"/>`;
  if(f <= .001) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${shade}" stroke="${light}" stroke-width=".6"/>`;
  const rx = r1(Math.abs(1 - 2 * f) * r);
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${shade}" stroke="${light}" stroke-width=".4"/><path d="M${cx} ${cy - r}A${r} ${r} 0 0 1 ${cx} ${cy + r}A${rx} ${r} 0 0 ${f < .5 ? 0 : 1} ${cx} ${cy - r}Z" fill="${light}"/>`;
}

const SPINES = {
  /* 1. Lámina holo: varios colores difuminados y letras grandes y claras */
  holo:{ name:'Lámina holo', parts:[['c1', 'Color 1'], ['c2', 'Color 2'], ['c3', 'Color 3']], font:{ font:'pop', wt:700, up:1, ls:.05, max:19 },
    colors:([B, F, A]) => ({ c1:B, c2:A, c3:F }),
    draw:(o, c, w, h) => { const g = sid(), b = sid(), sh = sid();
      const svg = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.c1}"/><stop offset=".4" stop-color="${c.c2}"/><stop offset=".75" stop-color="${c.c3}"/><stop offset="1" stop-color="${c.c1}"/></linearGradient>
        <filter id="${b}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${r1(w * .32)}"/></filter>
        <linearGradient id="${sh}" x1="0" y1="0" x2="1" y2="1"><stop offset=".3" stop-color="${lighten(c.c2, .85)}" stop-opacity="0"/><stop offset=".42" stop-color="${lighten(c.c2, .85)}" stop-opacity=".35"/><stop offset=".54" stop-color="${lighten(c.c2, .85)}" stop-opacity="0"/></linearGradient></defs>
        <rect width="${w}" height="${h}" fill="url(#${g})"/><g filter="url(#${b})" opacity=".9"><circle cx="${r1(w * .15)}" cy="${r1(h * .2)}" r="${r1(w * .8)}" fill="${c.c3}"/><circle cx="${r1(w * .9)}" cy="${r1(h * .52)}" r="${r1(w * .8)}" fill="${c.c1}"/><circle cx="${r1(w * .25)}" cy="${r1(h * .86)}" r="${r1(w * .8)}" fill="${c.c2}"/></g>
        <rect width="${w}" height="${h}" fill="url(#${sh})"/>`;
      // Velo del color medio detrás del título: con colores muy distintos entre sí, el título se sigue leyendo
      const avg = mix(mix(c.c1, c.c2, .5), c.c3, .33), dark = lum(avg) < .55, veil = dark ? darken(avg, .55) : lighten(avg, .7), vb = sid(), bh = h - 10 - (o.num ? 20 : 0);
      const svg2 = svg + `<defs><filter id="${vb}" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter></defs><rect x="${r1(w * .14)}" y="5" width="${r1(w * .72)}" height="${bh}" rx="${r1(w * .3)}" fill="${veil}" opacity=".6" filter="url(#${vb})"/>`;
      return { svg:svg2, box:{ l:3, t:7, w:w - 6, h:h - 14 - (o.num ? 20 : 0) }, tbg:[c.c1, c.c2, c.c3, mix(c.c1, c.c2, .5), mix(c.c2, c.c3, .5)].map(x => mix(x, veil, .6)), numTop:h - 25, ink:dark ? '#ffffff' : darken(c.c1, .75) }; } },

  /* 2. Marco: doble filete y adorno arriba y abajo (o fases de la luna en las sagas) */
  marco:{ name:'Marco', parts:[['base', 'Fondo'], ['foil', 'Marco'], ['orn', 'Adornos']], font:{ font:'pag', wt:700, max:16 },
    colors:([B, F, A]) => ({ base:B, foil:F, orn:F }),
    draw:(o, c, w, h) => { const s = Math.min(13, w * .42), top = 13, bot = h - 13;
      const orn = y => o.phase != null ? moonG(w / 2, y, r1(s / 2 - .5), o.phase, c.orn, darken(c.base, .25)) : motifAt(o.motif || 'diamond', w / 2, y, s, c.orn);
      const svg = `<rect x="3" y="4" width="${w - 6}" height="${h - 8}" fill="none" stroke="${c.foil}" stroke-width="1"/><rect x="5" y="6" width="${w - 10}" height="${h - 12}" fill="none" stroke="${c.foil}" stroke-width=".5" opacity=".7"/>
        ${orn(top)}${orn(bot)}<path d="M8 ${top + 9}H${w - 8}M8 ${bot - 9}H${w - 8}" stroke="${c.foil}" stroke-width=".6"/>`;
      return { svg, box:{ l:6, t:top + 12, w:w - 12, h:bot - top - 24 - (o.num ? 19 : 0) }, tbg:[c.base], numTop:bot - 31, tex:'tex-leather', ink:c.foil }; } },

  /* 3. Jaspeado: piel arriba con el título y papel jaspeado abajo */
  jaspeado:{ name:'Jaspeado', parts:[['base', 'Piel'], ['alt', 'Papel'], ['v1', 'Vetas 1'], ['v2', 'Vetas 2'], ['foil', 'Filetes']], font:{ font:'pag', wt:700, max:16 },
    colors:([B, F, A]) => ({ base:B, alt:mix(F, '#ffffff', .55), v1:A, v2:darken(B, .05), foil:F }),
    draw:(o, c, w, h) => { const top = Math.round(h * .64), bot = h - 8, r = rng(o.seed), cl = sid(); let wv = '';
      for(let i = 0; i < 15; i++){ const y = top + r() * (bot - top), a = 1.5 + r() * 3, ph = r() * 6, fr = 3 + r() * 4; let p = `M-2 ${r1(y)}`; for(let x = 0; x <= w + 2; x += 2) p += `L${x} ${r1(y + Math.sin(x / fr + ph) * a)}`;
        wv += `<path d="${p}" stroke="${i % 3 === 2 ? mix(c.v1, c.v2, .5) : i % 2 ? c.v2 : c.v1}" stroke-width="${r1(.7 + r() * 1.8)}" fill="none" opacity=".85"/>`; }
      const svg = `<defs><clipPath id="${cl}"><rect y="${top}" width="${w}" height="${bot - top}"/></clipPath></defs><rect y="${top}" width="${w}" height="${bot - top}" fill="${c.alt}"/><g clip-path="url(#${cl})">${wv}</g>
        <rect y="${top - 1.5}" width="${w}" height="1.5" fill="${c.foil}"/><rect y="${bot}" width="${w}" height="1.5" fill="${c.foil}"/><rect y="6" width="${w}" height="1.2" fill="${c.foil}"/>`;
      return { svg, box:{ l:3, t:10, w:w - 6, h:top - 16 }, tbg:[c.base], numTop:Math.round(top + (bot - top) / 2 - 7.5), numBg:c.base, tex:'tex-leather', ink:c.foil }; } },

  /* 4. Escamas: escamas en el fondo y el título en una etiqueta lisa */
  escamas:{ name:'Escamas', parts:[['base', 'Fondo'], ['accent', 'Escamas'], ['alt', 'Etiqueta'], ['foil', 'Borde']], font:{ font:'pag', wt:700, max:15 },
    colors:([B, F, A]) => ({ base:B, accent:lighten(A, .2), alt:darken(B, .35), foil:F }),
    draw:(o, c, w, h) => { const p = sid(), lt = Math.round(h * .14), lh = Math.round(h * .64);
      const svg = `<defs><pattern id="${p}" width="10" height="7" patternUnits="userSpaceOnUse"><path d="M0 7A5 5 0 0 1 10 7M-5 3.5A5 5 0 0 1 5 3.5M5 3.5A5 5 0 0 1 15 3.5" fill="${mix(c.base, c.accent, .18)}" stroke="${c.accent}" stroke-width=".7"/></pattern></defs>
        <rect width="${w}" height="${h}" fill="url(#${p})"/><rect x="4" y="${lt}" width="${w - 8}" height="${lh}" rx="1.5" fill="${c.alt}" stroke="${c.foil}" stroke-width="1"/>
        <rect x="6" y="${lt + 2}" width="${w - 12}" height="${lh - 4}" rx="1" fill="none" stroke="${c.foil}" stroke-width=".4" opacity=".7"/><rect y="5" width="${w}" height="1.2" fill="${c.foil}"/><rect y="${h - 6}" width="${w}" height="1.2" fill="${c.foil}"/>`;
      return { svg, box:{ l:7, t:lt + 4, w:w - 14, h:lh - 8 }, tbg:[c.alt], numTop:Math.round(lt + lh + (h - 6 - lt - lh) / 2 - 7.5), ink:c.foil }; } },

  /* 5. Nervios: lomo de piel con nervios en relieve y tejuelo para el título */
  nervios:{ name:'Nervios', parts:[['base', 'Piel'], ['alt', 'Tejuelo'], ['foil', 'Dorados']], font:{ font:'cinzel', wt:700, up:1, ls:.06, max:13 },
    colors:([B, F, A]) => ({ base:B, alt:A, foil:F }),
    draw:(o, c, w, h) => { const lt = 17, lb = Math.round(h * .63), ribs = [9, lb + 6, Math.round(h * .8), h - 13];
      const rib = y => `<rect x="-1" y="${y}" width="${w + 2}" height="5" rx="2" fill="${darken(c.base, .22)}"/><rect x="-1" y="${y}" width="${w + 2}" height="1.4" rx=".7" fill="${lighten(c.base, .28)}"/><path d="M0 ${y - 1.8}H${w}M0 ${y + 6.8}H${w}" stroke="${c.foil}" stroke-width=".55"/>`;
      const svg = ribs.map(rib).join('') + `<rect x="3" y="${lt}" width="${w - 6}" height="${lb - lt}" fill="${c.alt}" stroke="${c.foil}" stroke-width=".9"/>` + (o.num ? '' : motifAt('diamond', w / 2, (ribs[1] + ribs[2]) / 2 + 2.5, 7, c.foil));
      return { svg, box:{ l:5, t:lt + 2, w:w - 10, h:lb - lt - 4 }, tbg:[c.alt], numTop:Math.round((ribs[1] + ribs[2]) / 2 + 2.5 - 7.5), tex:'tex-leather', ink:c.foil }; } },

  /* 6. Grimorio: cantoneras de metal, cierre y gema */
  grimorio:{ name:'Grimorio', parts:[['base', 'Piel'], ['foil', 'Metal'], ['accent', 'Gema']], font:{ font:'cinzel', wt:700, up:1, ls:.04, max:14 },
    colors:([B, F, A]) => ({ base:darken(B, .2), foil:F, accent:A }),
    draw:(o, c, w, h) => { const cy = Math.round(h * .72), m = sid(), gm = sid();
      const cn = (x, y, sx, sy) => `<path d="M${x} ${y}h${sx * 10}l${-sx * 10} ${sy * 10}z" fill="url(#${m})"/><circle cx="${x + sx * 2.6}" cy="${y + sy * 2.6}" r=".9" fill="${lighten(c.foil, .5)}"/>`;
      const svg = `<defs><linearGradient id="${m}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(c.foil, .45)}"/><stop offset=".55" stop-color="${c.foil}"/><stop offset="1" stop-color="${darken(c.foil, .4)}"/></linearGradient>
        <radialGradient id="${gm}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${lighten(c.accent, .6)}"/><stop offset=".45" stop-color="${c.accent}"/><stop offset="1" stop-color="${darken(c.accent, .55)}"/></radialGradient></defs>
        <rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="none" stroke="${darken(c.base, .4)}" stroke-width="1"/><rect x="5" y="5" width="${w - 10}" height="${h - 10}" fill="none" stroke="${lighten(c.base, .18)}" stroke-width=".5"/>
        ${cn(0, 0, 1, 1)}${cn(w, 0, -1, 1)}${cn(0, h, 1, -1)}${cn(w, h, -1, -1)}
        <rect x="0" y="${cy - 4}" width="${w}" height="18" fill="url(#${m})"/><path d="M0 ${cy - 1.5}H${w}M0 ${cy + 11.5}H${w}" stroke="${darken(c.foil, .45)}" stroke-width=".6"/>
        <ellipse cx="${w / 2}" cy="${cy + 5}" rx="6.5" ry="7.5" fill="url(#${gm})" stroke="${darken(c.foil, .45)}" stroke-width=".8"/><ellipse cx="${w / 2 - 2}" cy="${cy + 2}" rx="1.8" ry="1.2" fill="${lighten(c.accent, .85)}" opacity=".8"/>`;
      return { svg, box:{ l:6, t:13, w:w - 12, h:cy - 22 }, tbg:[c.base], numTop:Math.min(h - 26, cy + 22), tex:'tex-leather', ink:c.foil }; } },

  /* 7. Filigrana: fondo oscuro con volutas doradas arriba y abajo (como las ediciones especiales) */
  filigrana:{ name:'Filigrana', parts:[['base', 'Fondo'], ['foil', 'Filigrana'], ['accent', 'Detalles']], font:{ font:'cinzel', wt:700, up:1, ls:.05, max:14 },
    colors:([B, F, A]) => ({ base:darken(B, .3), foil:F, accent:A }),
    draw:(o, c, w, h) => { const cx = w / 2, sw = Math.min(w / 2 - 3, 13);
      const curl = `M${cx} 4C${cx - sw * .2} 9 ${cx - sw} 7 ${cx - sw} 13C${cx - sw} 17 ${cx - sw * .45} 18 ${cx - sw * .35} 15C${cx - sw * .25} 12.5 ${cx - sw * .6} 12 ${cx - sw * .6} 14.5`;
      const half = `<path d="${curl}" fill="none" stroke="${c.foil}" stroke-width=".9" stroke-linecap="round"/><path d="${curl}" fill="none" stroke="${c.foil}" stroke-width=".9" stroke-linecap="round" transform="translate(${w} 0) scale(-1 1)"/>
        <path d="M${cx} 9l2.2 3.5-2.2 3.5-2.2-3.5z" fill="${c.accent}" stroke="${c.foil}" stroke-width=".4"/><path d="M${cx - sw * .5} 21H${cx + sw * .5}" stroke="${c.foil}" stroke-width=".6"/>`;
      const svg = `${half}<g transform="translate(0 ${h}) scale(1 -1)">${half}</g><path d="M3 26V${h - 26}M${w - 3} 26V${h - 26}" stroke="${c.foil}" stroke-width=".6"/>
        <circle cx="3" cy="26" r="1" fill="${c.accent}"/><circle cx="${w - 3}" cy="26" r="1" fill="${c.accent}"/><circle cx="3" cy="${h - 26}" r="1" fill="${c.accent}"/><circle cx="${w - 3}" cy="${h - 26}" r="1" fill="${c.accent}"/>`;
      return { svg, box:{ l:6, t:26, w:w - 12, h:h - 52 - (o.num ? 19 : 0) }, tbg:[c.base], numTop:h - 46, ink:c.foil }; } },

  /* 8. Bloque: moderno, a dos colores, título grande y autor/a abajo */
  bloque:{ name:'Bloque', parts:[['base', 'Bloque grande'], ['alt', 'Bloque pequeño']], font:{ font:'pop', wt:700, up:1, ls:.02, max:20 },
    colors:([B, F, A]) => ({ base:B, alt:A }),
    draw:(o, c, w, h) => { const sp = Math.round(h * .75);
      const svg = `<rect y="${sp}" width="${w}" height="${h - sp}" fill="${c.alt}"/><rect y="${sp}" width="${w}" height="1" fill="${darken(c.alt, .25)}"/>`;
      // Apellido abajo, solo si cabe a un tamaño legible (≥ 7 px); si no, nada
      const ab = { l:3, t:sp + 5, w:w - 6, h:h - sp - 10 }, AF = { font:'sans', wt:700, up:1, ls:.1, it:false, max:8 }, ln = !o.num && o.author ? lastName(o.author) : '';
      const au = ln && tlen(ln, AF) * 7 <= ab.h * .93 ? ln : '';
      return { svg, box:{ l:3, t:6, w:w - 6, h:sp - 11 }, tbg:[c.base], numTop:Math.round(sp + (h - sp) / 2 - 7.5), ink:lum(c.base) > .55 ? darken(c.base, .78) : '#ffffff',
        extra:au ? { text:au, box:ab, bg:c.alt, font:AF } : null }; } },

  /* 9. Botánico: papel claro con ramas y flores arriba y abajo */
  botanico:{ name:'Botánico', parts:[['base', 'Papel'], ['leaf', 'Hojas'], ['accent', 'Flores']], font:{ font:'pag', wt:700, max:16 },
    colors:([B, F, A]) => ({ base:mix(lighten(F, .3), '#fbf6ec', .7), leaf:darken(B, .05), accent:A }),
    draw:(o, c, w, h) => { const zt = Math.round(h * .2), zb = Math.round(h * .8);
      const svg = sprig(w * .3, h + 2, h - zb + 2, -1, 1, c.leaf, c.accent, o.seed) + sprig(w * .72, h + 2, (h - zb) * .8, -1, -1, c.leaf, c.accent, o.seed + 7) + sprig(w * .5, -2, zt - 1, 1, 1, c.leaf, c.accent, o.seed + 3);
      return { svg, box:{ l:4, t:zt + 2, w:w - 8, h:zb - zt - 4 - (o.num ? 18 : 0) }, tbg:[c.base], numTop:zb - 20, tex:'tex-paper', ink:darken(c.leaf, .35) }; } },

  /* 10. Degradado: de un color a otro, con filetes finos y un sol */
  degradado:{ name:'Degradado', parts:[['base', 'Arriba'], ['alt', 'Abajo'], ['foil', 'Filetes y sol']], font:{ font:'deco', wt:700, up:1, ls:.12, max:15 },
    colors:([B, F, A]) => ({ base:B, alt:A, foil:F }),
    draw:(o, c, w, h) => { const g = sid();
      const svg = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.base}"/><stop offset=".42" stop-color="${c.base}"/><stop offset="1" stop-color="${c.alt}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${g})"/>
        <path d="M4 7H${w - 4}M4 9.5H${w - 4}M4 ${h - 7}H${w - 4}M4 ${h - 9.5}H${w - 4}" stroke="${c.foil}" stroke-width=".6"/><circle cx="${w / 2}" cy="19" r="${r1(Math.min(6, w * .2))}" fill="none" stroke="${c.foil}" stroke-width=".9"/><circle cx="${w / 2}" cy="19" r="${r1(Math.min(3, w * .1))}" fill="${c.foil}"/>`;
      const tb = Math.round(h * .74) - (o.num ? 19 : 0); // el título acaba donde el degradado va por la mitad
      return { svg, box:{ l:4, t:30, w:w - 8, h:tb - 30 }, tbg:[c.base, mix(c.base, c.alt, (tb / h - .42) / .58)], numTop:tb + 2, ink:c.foil }; } },

  /* 11. Celestial: cielo de noche con luna y estrellas, fuera de la zona del título */
  celestial:{ name:'Celestial', parts:[['base', 'Cielo'], ['alt', 'Horizonte'], ['foil', 'Luna y estrellas']], font:{ font:'cinzel', wt:700, up:1, ls:.05, max:14 },
    colors:([B, F, A]) => ({ base:darken(B, .45), alt:mix(B, A, .45), foil:F }),
    draw:(o, c, w, h) => { const g = sid(), r = rng(o.seed); let st = '';
      const star = (x, y, s) => `<path d="M${r1(x)} ${r1(y - s)}L${r1(x + s * .3)} ${r1(y - s * .3)}L${r1(x + s)} ${r1(y)}L${r1(x + s * .3)} ${r1(y + s * .3)}L${r1(x)} ${r1(y + s)}L${r1(x - s * .3)} ${r1(y + s * .3)}L${r1(x - s)} ${r1(y)}L${r1(x - s * .3)} ${r1(y - s * .3)}Z" fill="${c.foil}"/>`;
      for(let i = 0; i < 6; i++) st += `<circle cx="${r1(2 + r() * (w - 4))}" cy="${r1(3 + r() * 18)}" r="${r1(.4 + r() * .6)}" fill="${c.foil}" opacity="${r1(.5 + r() * .5)}"/>`;
      const by = h - 28, pts = [[w * .2, by + 8], [w * .45, by + 3], [w * .7, by + 11], [w * .84, by + 4]];
      st += `<path d="M${pts.map(p => p.map(r1).join(' ')).join('L')}" stroke="${c.foil}" stroke-width=".4" fill="none" opacity=".75"/>` + pts.map(([x, y], i) => star(x, y, i % 2 ? 1.6 : 1.1)).join('');
      const svg = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.base}"/><stop offset=".7" stop-color="${mix(c.base, c.alt, .45)}"/><stop offset="1" stop-color="${c.alt}"/></linearGradient></defs>
        <rect width="${w}" height="${h}" fill="url(#${g})"/>${st}<circle cx="${w / 2}" cy="14" r="5" fill="${c.foil}"/><circle cx="${w / 2 + 2.3}" cy="12.6" r="4.4" fill="${c.base}"/>`;
      return { svg, box:{ l:4, t:24, w:w - 8, h:by - 28 - (o.num ? 19 : 0) }, tbg:[c.base, mix(c.base, c.alt, .45), mix(c.base, c.alt, .3)], numTop:by - 22, ink:c.foil }; } },

  /* 12. Art déco: sol de rayos arriba, marco escalonado y galones abajo */
  deco:{ name:'Art déco', parts:[['base', 'Fondo'], ['foil', 'Dorados'], ['accent', 'Sol']], font:{ font:'deco', wt:700, up:1, ls:.08, max:13 },
    colors:([B, F, A]) => ({ base:B, foil:F, accent:A }),
    draw:(o, c, w, h) => { const cx = w / 2, R = Math.min(w * .36, 13); let rays = '';
      for(let i = 0; i < 9; i++){ const a = (-80 + i * 20) * Math.PI / 180; rays += `<path d="M${cx} 4L${r1(cx + Math.sin(a) * 30)} ${r1(4 + Math.cos(a) * 30)}" stroke="${c.foil}" stroke-width=".7"/>`; }
      const ft = 36, fb = h - 26, st = 3;
      const frame = `M4 ${ft + st}H${4 + st}V${ft}H${w - 4 - st}V${ft + st}H${w - 4}V${fb - st}H${w - 4 - st}V${fb}H${4 + st}V${fb - st}H4Z`;
      const svg = `<g opacity=".9">${rays}</g><path d="M${cx - R} 4A${R} ${R} 0 0 0 ${cx + R} 4Z" fill="${c.accent}" stroke="${c.foil}" stroke-width=".8"/><rect y="3" width="${w}" height="1.4" fill="${c.foil}"/>
        <path d="${frame}" fill="${c.base}" stroke="${c.foil}" stroke-width="1"/><path d="M6 ${h - 18}L${cx} ${h - 12}L${w - 6} ${h - 18}M6 ${h - 12}L${cx} ${h - 6}L${w - 6} ${h - 12}" fill="none" stroke="${c.foil}" stroke-width="1"/>`;
      return { svg, box:{ l:7, t:ft + 4, w:w - 14, h:fb - ft - 8 - (o.num ? 19 : 0) }, tbg:[c.base], numTop:fb - 25, ink:c.foil }; } },

  /* 13. Tela: tapa de tela con estampado arriba y abajo y etiqueta de papel */
  tela:{ name:'Tela', parts:[['base', 'Tela'], ['alt', 'Etiqueta'], ['foil', 'Estampado']], font:{ font:'pag', wt:700, max:15 },
    colors:([B, F, A]) => ({ base:B, alt:mix(F, '#fbf6ec', .7), foil:F }),
    draw:(o, c, w, h) => { const lt = Math.round(h * .18), lh = Math.round(h * .56);
      const svg = `<path d="M3 7H${w - 3}M3 10H${w - 3}M3 ${h - 7}H${w - 3}M3 ${h - 10}H${w - 3}" stroke="${c.foil}" stroke-width=".8"/>${motifAt('diamond', w / 2, lt - 9, 6, c.foil)}
        <rect x="4" y="${lt}" width="${w - 8}" height="${lh}" rx="1" fill="${c.alt}" stroke="${darken(c.alt, .25)}" stroke-width=".6"/><rect x="5.5" y="${lt + 1.5}" width="${w - 11}" height="${lh - 3}" fill="none" stroke="${c.foil}" stroke-width=".4"/>`;
      return { svg, box:{ l:6, t:lt + 3, w:w - 12, h:lh - 6 }, tbg:[c.alt], numTop:Math.round(lt + lh + (h - 10 - lt - lh) / 2 - 7.5), tex:'tex-cloth', ink:darken(c.base, .2) }; } },

  /* 14. Rayas: franjas en diagonal arriba y abajo, título liso en medio */
  rayas:{ name:'Rayas', parts:[['base', 'Fondo'], ['accent', 'Raya 1'], ['alt', 'Raya 2']], font:{ font:'pop', wt:700, up:1, ls:.03, max:18 },
    colors:([B, F, A]) => ({ base:B, accent:A, alt:F }),
    draw:(o, c, w, h) => { const p = sid(), bt = Math.round(h * .15), bb = Math.round(h * .85);
      const svg = `<defs><pattern id="${p}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4.5" height="9" fill="${c.accent}"/><rect x="4.5" width="4.5" height="9" fill="${c.alt}"/></pattern></defs>
        <rect width="${w}" height="${bt}" fill="url(#${p})"/><rect y="${bb}" width="${w}" height="${h - bb}" fill="url(#${p})"/><path d="M0 ${bt}H${w}M0 ${bb}H${w}" stroke="${darken(c.base, .3)}" stroke-width="1"/>`;
      return { svg, box:{ l:3, t:bt + 5, w:w - 6, h:bb - bt - 10 - (o.num ? 19 : 0) }, tbg:[c.base], numTop:bb - 22, ink:lum(c.base) > .55 ? darken(c.base, .78) : '#ffffff' }; } },

  /* 15. Acuarela: manchas difuminadas arriba y abajo, centro limpio para el título */
  acuarela:{ name:'Acuarela', parts:[['base', 'Papel'], ['accent', 'Mancha 1'], ['alt', 'Mancha 2']], font:{ font:'pag', wt:700, max:16 },
    colors:([B, F, A]) => ({ base:mix(lighten(F, .4), '#fbf6ec', .75), accent:A, alt:B }),
    draw:(o, c, w, h) => { const b = sid(), r = rng(o.seed); let bl = '';
      // Manchas suaves solo arriba y abajo: el centro queda limpio para el título
      for(let i = 0; i < 4; i++) bl += `<circle cx="${r1(r() * w)}" cy="${r1(4 + r() * h * .12)}" r="${r1(w * (.22 + r() * .18))}" fill="${i % 2 ? c.alt : c.accent}" opacity="${r1(.3 + r() * .25)}"/>`;
      for(let i = 0; i < 4; i++) bl += `<circle cx="${r1(r() * w)}" cy="${r1(h - 4 - r() * h * .12)}" r="${r1(w * (.22 + r() * .18))}" fill="${i % 2 ? c.accent : c.alt}" opacity="${r1(.3 + r() * .25)}"/>`;
      const svg = `<defs><filter id="${b}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${r1(Math.max(2.5, w * .1))}"/></filter></defs><g filter="url(#${b})">${bl}</g>`;
      const t = Math.round(h * .2), bt = Math.round(h * .8);
      return { svg, box:{ l:4, t, w:w - 8, h:bt - t - (o.num ? 18 : 0) }, tbg:[c.base, mix(c.base, c.accent, .3), mix(c.base, c.alt, .3)], numTop:bt - 18, tex:'tex-paper', ink:darken(c.alt, .55) }; } }
};
const SPINE_ORDER = ['holo', 'marco', 'jaspeado', 'escamas', 'nervios', 'grimorio', 'filigrana', 'bloque', 'botanico', 'degradado', 'celestial', 'deco', 'tela', 'rayas', 'acuarela'];
/* Estilos antiguos → los nuevos (para colecciones guardadas antes) */
const STYLE_ALIAS = { ilustrado:'celestial', estrellado:'celestial', planeta:'celestial', enredadera:'botanico', synth:'degradado', cristal:'holo' };
const styleKey = s => SPINES[s] ? s : STYLE_ALIAS[s] || '';

/* Dibuja un lomo. o = { w, h, title, author, num, seed, phase, motif }; c = colores ya resueltos de sus partes; ink = letras elegidas (o vacío) */
function drawSpine(style, o, c, ink){
  const D = SPINES[style], r = D.draw(o, c, o.w, o.h), letters = isHex(ink) ? ink : bestInk(r.ink, r.tbg);
  const title = ttl({ title:o.title, ...D.font, titleInk:letters }, r.box);
  const extra = r.extra ? ttl({ title:r.extra.text, ...r.extra.font, titleInk:bestInk(letters, [r.extra.bg]) }, r.extra.box) : '';
  const num = o.num ? `<span class="num" style="--f:${letters};top:${Math.round(r.numTop)}px${r.numBg ? ';background:' + r.numBg : ''}">${o.num}</span>` : '';
  const main = c.base || c.c1;
  return { ink:letters, html:`<div class="it"><div class="bk" style="--w:${o.w}px;--h:${o.h}px;--b:${main};--f:${letters}"><div class="face ${r.tex || ''}">${svgW(o.w, o.h, r.svg)}${title}${extra}${num}</div></div></div>` };
}
