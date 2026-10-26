'use strict';
/* Mi TBR — utilidades y estilos base de estantería */
/* Utilidades, estilos de estantería, búsqueda de libros y sugerencias */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Campo de una línea hecho con <textarea>: Chrome en Android pone encima del teclado su barra de autorrellenar
   (llave, tarjeta, ubicación) en todos los <input> de texto aunque lleven autocomplete="off"; en los <textarea> no.
   Enter no salta de línea y los saltos pegados se cambian por espacios (ver hojas.js). */
const lineHtml = (attrs, v = '') => `<textarea rows="1" wrap="off" autocomplete="off" ${attrs.replace(/class="([^"]*)"/, 'class="$1 one"').replace(/^(?!.*class=)/, 'class="one" ')}>${esc(v)}</textarea>`;
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const isoDay = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }; // AAAA-MM-DD en hora local
function hash(str){ let h = 2166136261; for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const hslHex = (h, s, l) => { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l); const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); const x = v => Math.round(255 * v).toString(16).padStart(2, '0'); return '#' + x(f(0)) + x(f(8)) + x(f(4)); };
function lum(hex){ const n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
const textOn = hex => lum(hex) > 0.58 ? '#231a14' : '#f4ead6';

/* ---------- Estilos de estantería ---------- */
const PRESETS = {
  fantasia:{name:'Fantasía',wood:'#3a2417',panel:'#221a16',plank:'#5b3a25',acc:'#c9a24b',pattern:'stripes',font:'cinzel',d:['#7a5a3a','#e8dcc0','#e0a93b'],
    decor:['vela','calavera','pocion','libros','planta','huevo','luna','llave','espada'],
    spines:['#5b1f2b','#1f4a3c','#2d3a5e','#6b4a1f','#3c2a4d','#7a2e22','#2c4a52','#4a5a2a']},
  romantasy:{name:'Romantasy',wood:'#d8b697',panel:'#4f1e33',plank:'#e6c9a6',acc:'#d4a95a',pattern:'dots',font:'serif',d:['#c9a074','#f6e3d2','#e4b861'],
    decor:['flor','luna','cristal','taza','marco','vela','rosa','estrellas','corona'],
    spines:['#8b2a45','#c46b83','#e3b5b9','#d4a95a','#6e2a4a','#a35577','#f0d9c4','#7a3b52']},
  cienciaficcion:{name:'Ciencia ficción',wood:'#2a3441',panel:'#0d1420',plank:'#40506a',acc:'#4fd1c5',pattern:'grid',font:'modern',d:['#51627c','#cfe0f0','#4fd1c5'],
    decor:['planeta','cohete','telescopio','estrellas','probeta','luna','lampara'],
    spines:['#1e3a5f','#3b2f6b','#0f5257','#5a1f4f','#23506b','#444a6b','#14323f','#6b2b3f']},
  darkacademia:{name:'Dark academia',wood:'#1d3b30',panel:'#101c16',plank:'#35604d',acc:'#d9b25f',pattern:'none',font:'serif',d:['#35604d','#e9dcc0','#d9b25f'],
    decor:['globo','vela','libros','libroab','marco'], spines:['#4a1a1a','#1f3a4a','#2a3a2f','#3a2a1a','#5b1f2b']},
  contemporanea:{name:'Contemporánea y thriller',wood:'#eceae6',panel:'#f5f3ef',plank:'#ffffff',acc:'#d9764a',pattern:'none',font:'modern',light:1,d:['#bdb6a8','#f1e6d8','#d9764a'],
    decor:['planta','taza','lupa','libros','expediente','marco'], spines:['#d9764a','#6a8a7a','#e6c46a','#9ab8d8','#22201d']},
  terror:{name:'Terror y gótico',wood:'#1d1b1c',panel:'#120f10',plank:'#3a3335',acc:'#c0343a',pattern:'diamond',font:'cinzel',d:['#4a4244','#d9d0cc','#c0343a'],
    decor:['calavera','vela','murcielago','gato','llave','luna','pergamino'],
    spines:['#2a1215','#3b0f16','#1b1b24','#4a1a1a','#26222a','#5b1d22','#2b2b2b','#3a2a3a']},
  thriller:{name:'Thriller y misterio',wood:'#2c3236',panel:'#1a2024',plank:'#454e55',acc:'#d0a24a',pattern:'stripes',font:'modern',d:['#59636b','#d7d2c4','#d0a24a'],
    decor:['lupa','llave','reloj','taza','gato','lampara','pergamino'],
    spines:['#1f3a44','#3a3f45','#5a3a2a','#2a2f3a','#4a4a2a','#6a2e2e','#233c3c','#4b4b55']},
  psicologia:{name:'Psicología',wood:'#c9a97f',panel:'#e8e0d2',plank:'#b9966a',acc:'#3a7d6e',pattern:'none',font:'serif',light:1,d:['#8e6f4c','#c4b08e','#3a7d6e'],
    decor:['cerebro','planta','taza','reloj','lampara','libros','lupa','pluma'],
    spines:['#3a7d6e','#c76f4b','#5a6f9a','#b79a4a','#8a5a7a','#4a6a5a','#a8574a','#6a8a9a']},
  ciencia:{name:'Ciencia',wood:'#7c6246',panel:'#d9e4e6',plank:'#9a7d5c',acc:'#2f7da6',pattern:'grid',font:'modern',light:1,d:['#6a5a48','#a3b8bd','#2f7da6'],
    decor:['adn','probeta','globo','planeta','lupa','telescopio','reloj'],
    spines:['#2f7da6','#4a8a5a','#a8573a','#6a5a9a','#2a5a6a','#b08a3a','#4a4a6a','#7a4a5a']},
  clasicos:{name:'Clásicos e histórica',wood:'#5a3e2b',panel:'#3a291f',plank:'#7a5a40',acc:'#b08d57',pattern:'diamond',font:'serif',d:['#8a6a48','#eadcc0','#c9a05a'],
    decor:['globo','pluma','reloj','libros','vela','pergamino','lampara'],
    spines:['#5a2a24','#2a3a2a','#3a2f4a','#6a4a24','#24394a','#4a2430','#5a5a3a','#3a3a3a']},
  romance:{name:'Romance y juvenil',wood:'#e2c4a6',panel:'#f3dfe0',plank:'#efd7bd',acc:'#d6537a',pattern:'dots',font:'serif',light:1,d:['#c99a7a','#e3bfae','#d6537a'],
    decor:['corazon','flor','taza','estrellas','planta','marco','rosa','gato'],
    spines:['#d6537a','#e9a0b4','#f0c58a','#8ab8b0','#b58ac0','#e07a5a','#7a9ac8','#f2d68a']},
  generico:{name:'General',wood:'#7a5a3c',panel:'#2a2220',plank:'#9a7650',acc:'#c08a4a',pattern:'stripes',font:'serif',d:['#8a6a48','#eadcc0','#c9a05a'],
    decor:['libros','planta','vela','taza','lampara','reloj'],
    spines:['#6a2a2a','#2a4a3a','#2a3a5a','#6a4a2a','#4a2a5a','#5a5a2a','#2a5a5a','#5a2a3a']}
};
const PRESET_KW = [
  ['romantasy', /romantas|\bfae\b|hadas|fairy/],
  ['darkacademia', /dark academia|academia oscura/],
  ['contemporanea', /contempor|literaria|actual|thriller|misterio|suspense|policiac|novela negra|noir/],
  ['romance', /romance|romant|juvenil|young adult|\bya\b/],
  ['fantasia', /fantas|magia|dragon|epic|brujer|brujas/],
  ['cienciaficcion', /ciencia ficci|sci-?fi|distop|espacial|cyberpunk|futur/],
  ['terror', /terror|horror|gotic|miedo|macabr/],
  ['thriller', /thriller|misterio|policia|negra|crimen|suspense|detective/],
  ['psicologia', /psicolog|mente|terapia|cognitiv|neuro|emocion/],
  ['ciencia', /ciencia|biolog|bioinform|medic|genetic|quimic|fisic|matemat|program|datos|tecnolog/],
  ['clasicos', /clasic|histor|antigu|literatur|poesia|filosof/]
];
const DECOR_KW = [
  [/cafe|te\b|cocina|receta|gastronom/, ['taza','planta','libros','reloj']],
  [/viaje|aventura|geograf|mundo/, ['globo','lupa','llave','pergamino','planta']],
  [/arte|dise|foto|pintur/, ['marco','lampara','pluma','estrellas','planta']],
  [/musica|poesia|poema/, ['pluma','luna','estrellas','flor','vela']],
  [/espacio|astro|cosmos/, ['planeta','cohete','telescopio','estrellas','luna']],
  [/anim|gato|mascota|natur/, ['gato','planta','flor','luna']],
  [/negocio|empresa|econom|finanz|product/, ['reloj','lampara','globo','libros','taza']],
  [/historia|guerra|medieval/, ['espada','pergamino','corona','globo','vela']]
];
function detectPreset(name, tipo){
  const t = norm((tipo || '') + ' ' + (name || ''));
  for(const [k, re] of PRESET_KW) if(re.test(t)) return k;
  return 'gen';
}
function unitStyle(u){
  let p = PRESETS[u.preset];
  if(!p){ // paleta generada a partir del nombre: tono único y decoración según el tema
    const h = u.hue ?? hash(u.name || 'x') % 360;
    const t = norm((u.tipo || '') + ' ' + (u.name || ''));
    let decor = PRESETS.generico.decor;
    for(const [re, list] of DECOR_KW) if(re.test(t)){ decor = list; break; }
    p = { name:'Personalizada', wood:hslHex(h, 32, 24), panel:hslHex(h, 26, 12), plank:hslHex(h, 30, 36), acc:hslHex((h + 30) % 360, 62, 62),
      pattern:['stripes','dots','grid','diamond'][h % 4], font:['serif','modern','cinzel'][h % 3],
      d:[hslHex(h, 22, 38), hslHex(h, 30, 88), hslHex((h + 30) % 360, 70, 60)], decor,
      spines:[0,1,2,3,4,5,6,7].map(i => hslHex((h + i * 37) % 360, 38 + (i % 3) * 6, 26 + (i % 4) * 4)) };
  }
  const wood = u.wood || p.wood;
  return { ...p, wood, decorList: (u.decor && u.decor.length ? u.decor : p.decor) };
}
function unitVars(u){
  const s = unitStyle(u);
  const hi = lum(s.plank) > .5 ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.18)';
  return `--wood:${s.wood};--panel:${s.panel};--plank:${s.plank};--plank-hi:${hi};--d1:${s.d[0]};--d2:${s.d[1]};--d3:${s.d[2]};--wood-ink:${textOn(s.wood)};--panel-ink:${textOn(s.panel)}`;
}
