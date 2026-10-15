'use strict';
/* Mi TBR — selector de color propio (sustituye al <input type="color"> del sistema).
   Parte siempre del color actual y ofrece, por orden de utilidad: colores de la portada (y tocar la portada para
   coger el color exacto), tonos del color actual, la paleta de la estantería y un ajuste fino con tono, saturación y luz. */

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
function tints(hex){ const [h, , l] = hexHsl(hex); return [0, .2, .4, .6, .8, 1].map(s => hslToHex(h, s, l)); }

/* Abre el selector. Devuelve una promesa con el color elegido (#rrggbb) o null si se cancela. */
function openColorPicker({ title = 'Color', color = '#888888', cover = '', palette = [] } = {}){
  return new Promise(res => {
    const start = isHex(color) ? color.toLowerCase() : '#888888'; let cur = start, picked = null;
    const pal = [...new Set(palette.filter(isHex).map(c => c.toLowerCase()))].slice(0, 18);
    const body = `<div class="cp-prev"><div style="background:${start}"><span>Antes</span></div><div id="cp-now" style="background:${start}"><span>Ahora</span></div></div>
      <div class="sec" id="cp-coversec"${cover ? '' : ' hidden'}><span class="lbl">De la portada</span><div class="cp-cover"><canvas id="cp-canvas" aria-label="Portada: toca para coger un color"></canvas><div><div class="sws" id="cp-cov"><span class="note">Leyendo la portada…</span></div><p class="note" id="cp-tapnote">O toca un punto de la portada.</p></div></div></div>
      <div class="sec"><span class="lbl">Tonos de este color</span><div class="sws" id="cp-shades"></div><div class="sws" id="cp-tints"></div></div>
      ${pal.length ? `<div class="sec"><span class="lbl">Paleta de la estantería</span><div class="sws">${pal.map(c => swatch(c)).join('')}</div></div>` : ''}
      ${fold('Ajuste fino', `<label class="cp-sl">Tono<input type="range" id="cp-h" min="0" max="359"></label><label class="cp-sl">Saturación<input type="range" id="cp-s" min="0" max="100"></label><label class="cp-sl">Luz<input type="range" id="cp-l" min="0" max="100"></label>
        <div class="sec"><label for="cp-hex">Código</label>${lineHtml('class="field" id="cp-hex" spellcheck="false" autocapitalize="off"', start)}</div>`)}`;
    const sh = openSheet(sheetT(title, body, '<button class="btn" type="button" data-close>Cancelar</button><button class="btn primary" type="button" data-do="cpok">Usar este color</button>'), () => res(picked));
    sh.classList.add('cp-sheet');
    const q = s => $(s, sh);
    const sync = (from) => {
      q('#cp-now').style.background = cur;
      q('#cp-shades').innerHTML = shades(cur).map(c => swatch(c)).join(''); q('#cp-tints').innerHTML = tints(cur).map(c => swatch(c)).join('');
      if(from !== 'sl'){ const [h, s, l] = hexHsl(cur); q('#cp-h').value = Math.round(h); q('#cp-s').value = Math.round(s * 100); q('#cp-l').value = Math.round(l * 100); }
      const H = +q('#cp-h').value, S = +q('#cp-s').value / 100, L = +q('#cp-l').value / 100;
      q('#cp-h').style.background = `linear-gradient(90deg,${[0, 60, 120, 180, 240, 300, 359].map(x => hslToHex(x, Math.max(S, .5), .5)).join(',')})`;
      q('#cp-s').style.background = `linear-gradient(90deg,${hslToHex(H, 0, L)},${hslToHex(H, 1, L)})`;
      q('#cp-l').style.background = `linear-gradient(90deg,#000,${hslToHex(H, S, .5)},#fff)`;
      if(from !== 'hex') q('#cp-hex').value = cur;
      $$('.sw', sh).forEach(b => b.setAttribute('aria-pressed', b.dataset.cp === cur));
    };
    sync();
    if(cover) coverCanvas(cover).then(c => {
      if(!sh.isConnected) return;
      if(!c){ q('#cp-cov').innerHTML = '<span class="note">No se puede leer esta portada desde su web. Si la subes tú, sí.</span>'; q('#cp-canvas').hidden = true; q('#cp-tapnote').hidden = true; return; }
      const cv = q('#cp-canvas'); cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0);
      q('#cp-cov').innerHTML = canvasSwatches(c).map(x => swatch(x)).join(''); sync();
      cv.addEventListener('click', e => { const r = cv.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * cv.width), y = Math.floor((e.clientY - r.top) / r.height * cv.height);
        const p = cv.getContext('2d').getImageData(Math.max(0, Math.min(cv.width - 1, x)), Math.max(0, Math.min(cv.height - 1, y)), 1, 1).data; cur = rgbHex(p[0], p[1], p[2]); sync(); });
    });
    sh.addEventListener('click', async e => {
      const s = e.target.closest('[data-cp]'); if(s){ cur = s.dataset.cp; sync(); return; }
      if(e.target.closest('[data-do="cpok"]')){ picked = cur; await closeSheet(); }
    });
    sh.addEventListener('input', e => {
      if(/^cp-[hsl]$/.test(e.target.id)){ cur = hslToHex(+q('#cp-h').value, +q('#cp-s').value / 100, +q('#cp-l').value / 100); sync('sl'); }
      if(e.target.id === 'cp-hex'){ let v = e.target.value.trim(); if(!v.startsWith('#')) v = '#' + v; if(isHex(v)){ cur = v.toLowerCase(); sync('hex'); } }
    });
  });
}
