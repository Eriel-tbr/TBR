'use strict';
/* Mi TBR — editor de color de los lomos (sustituye al <input type="color"> del sistema y a la ventana de color de antes). */

/* Portada en un canvas pequeño (a través del proxy de portadas, para poder leer sus píxeles) */
const coverCanvasCache = new Map();
function coverCanvas(src){
  if(!src) return Promise.resolve(null);
  if(coverCanvasCache.has(src)) return coverCanvasCache.get(src);
  const load = u => new Promise(res => {
    const im = new Image(); let done = false; const fin = v => { if(!done){ done = true; res(v); } };
    if(!/^data:/.test(u)) im.crossOrigin = 'anonymous'; im.referrerPolicy = 'no-referrer';
    im.onload = () => { try{ const W = 200, H = Math.round(W * (im.naturalHeight || 300) / (im.naturalWidth || 200)), c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(im, 0, 0, W, H); x.getImageData(0, 0, 1, 1); fin(c); }catch(e){ fin(null); } };
    im.onerror = () => fin(null); setTimeout(() => fin(null), 9000); im.src = u;
  });
  const proxied = !/^data:/.test(src) && !src.startsWith(location.origin) && typeof API_BASE !== 'undefined';
  const p = (proxied ? load(API_BASE + 'api/portada?u=' + encodeURIComponent(src)).then(c => c || load(src)) : load(src));
  coverCanvasCache.set(src, p); return p;
}
const rgbHex = (r, g, b) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
/* Hasta 12 colores distintos de la portada, de más a menos presentes */
function canvasSwatches(c){
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, bins = new Map();
  for(let i = 0; i < d.length; i += 8){ const k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4), e = bins.get(k) || [0, 0, 0, 0]; e[0] += d[i]; e[1] += d[i + 1]; e[2] += d[i + 2]; e[3]++; bins.set(k, e); }
  const cols = [...bins.values()].sort((a, b) => b[3] - a[3]).map(e => rgbHex(e[0] / e[3], e[1] / e[3], e[2] / e[3]));
  const dist = (a, b) => { const p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16); return Math.hypot((p >> 16) - (q >> 16), (p >> 8 & 255) - (q >> 8 & 255), (p & 255) - (q & 255)); };
  const out = []; for(const c2 of cols){ if(out.every(o => dist(o, c2) > 40)) out.push(c2); if(out.length >= 12) break; }
  return out;
}
const swatch = (c, attr = 'data-cp') => `<button class="sw" type="button" ${attr}="${c}" style="background:${c}" aria-label="Color ${c}"></button>`;
function shades(hex){ const [h, s] = hexHsl(hex); return [.12, .22, .32, .42, .52, .62, .72, .82, .92].map(l => hslToHex(h, s, l)); }
/* ---------- Editor de color dentro de la pestaña Lomo ----------
   Se pinta en el sitio (sin ventana encima) para ver el lomo cambiar mientras eliges. Parte del color actual y ofrece:
   colores de la portada (y tocar la portada para coger uno exacto), tonos del color, colores de este lomo, la paleta
   de la estantería y un ajuste fino (tono, saturación, luz y código).
   onPick(hex, live): live = true mientras se arrastra un deslizador (redibujo ligero). onAuto(): volver a automático. */
function colorEditor(el, { label, color, manual, cover = '', groups = [], onPick, onAuto }){
  let cur = isHex(color) ? color.toLowerCase() : '#888888';
  const uniq = l => [...new Set(l.filter(isHex).map(c => c.toLowerCase()))];
  const head = m => `<span class="ce-sw" id="ce-now" style="background:${cur}"></span><b>${esc(label)}</b><small>${m ? 'elegido' : 'automático'}</small>${m ? '<button class="btn sm" type="button" data-ce="auto">Automático</button>' : ''}`;
  el.innerHTML = `<div class="ce-head" id="ce-head">${head(manual)}</div>
    <div class="sec" id="ce-covsec"${cover ? '' : ' hidden'}><span class="lbl">De la portada</span><div class="ce-cover"><canvas id="ce-canvas" aria-label="Portada: toca para coger un color"></canvas><div class="sws" id="ce-cov"><span class="note">Leyendo la portada…</span></div></div></div>
    <div class="sec"><span class="lbl">Tonos</span><div class="sws" id="ce-shades"></div></div>
    ${groups.map(([t, cols]) => uniq(cols).length ? `<div class="sec"><span class="lbl">${esc(t)}</span><div class="sws">${uniq(cols).slice(0, 18).map(c => swatch(c)).join('')}</div></div>` : '').join('')}
    ${fold('Ajuste fino', `<label class="cp-sl">Tono<input type="range" id="ce-h" min="0" max="359"></label><label class="cp-sl">Saturación<input type="range" id="ce-s" min="0" max="100"></label><label class="cp-sl">Luz<input type="range" id="ce-l" min="0" max="100"></label>
      <div class="sec"><label for="ce-hex">Código</label>${lineHtml('class="field" id="ce-hex" spellcheck="false" autocapitalize="off"', cur)}</div>`)}`;
  const q = s => $(s, el);
  const sync = from => {
    q('#ce-now').style.background = cur; if(from !== 'sl') q('#ce-shades').innerHTML = shades(cur).map(c => swatch(c)).join('');
    if(from !== 'sl'){ const [h, s, l] = hexHsl(cur); q('#ce-h').value = Math.round(h); q('#ce-s').value = Math.round(s * 100); q('#ce-l').value = Math.round(l * 100); }
    const H = +q('#ce-h').value, S = +q('#ce-s').value / 100, L = +q('#ce-l').value / 100;
    q('#ce-h').style.background = `linear-gradient(90deg,${[0, 60, 120, 180, 240, 300, 359].map(x => hslToHex(x, Math.max(S, .5), .5)).join(',')})`;
    q('#ce-s').style.background = `linear-gradient(90deg,${hslToHex(H, 0, L)},${hslToHex(H, 1, L)})`;
    q('#ce-l').style.background = `linear-gradient(90deg,#000,${hslToHex(H, S, .5)},#fff)`;
    if(from !== 'hex') q('#ce-hex').value = cur;
    $$('.sw', el).forEach(b => b.setAttribute('aria-pressed', b.dataset.cp === cur));
  };
  const pick = (hex, live, from) => { cur = hex.toLowerCase(); if(!manual){ manual = true; q('#ce-head').innerHTML = head(true); } sync(from); onPick && onPick(cur, !!live); };
  sync();
  if(cover) coverCanvas(cover).then(c => {
    if(!el.isConnected || !q('#ce-cov')) return;
    if(!c){ q('#ce-cov').innerHTML = '<span class="note">No se puede leer esta portada desde su web. Si la subes tú, sí.</span>'; q('#ce-canvas').hidden = true; return; }
    const cv = q('#ce-canvas'); cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0);
    q('#ce-cov').innerHTML = canvasSwatches(c).map(x => swatch(x)).join(''); sync('cover');
    cv.addEventListener('click', e => { const r = cv.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * cv.width), y = Math.floor((e.clientY - r.top) / r.height * cv.height);
      const p = cv.getContext('2d').getImageData(clamp(x, 0, cv.width - 1), clamp(y, 0, cv.height - 1), 1, 1).data; pick(rgbHex(p[0], p[1], p[2])); });
  });
  el.onclick = e => { const s = e.target.closest('[data-cp]'); if(s){ pick(s.dataset.cp); return; } if(e.target.closest('[data-ce="auto"]')) onAuto && onAuto(); };
  el.oninput = e => {
    if(/^ce-[hsl]$/.test(e.target.id)) pick(hslToHex(+q('#ce-h').value, +q('#ce-s').value / 100, +q('#ce-l').value / 100), true, 'sl');
    if(e.target.id === 'ce-hex'){ let v = e.target.value.trim(); if(!v.startsWith('#')) v = '#' + v; if(isHex(v)) pick(v, false, 'hex'); }
  };
  el.onchange = e => { if(/^ce-[hsl]$/.test(e.target.id)) pick(cur, false, 'sl'); }; // al soltar el deslizador, redibujo completo
}
