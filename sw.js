/* Mi TBR · service worker: la app abre sin conexión.
   La versión la escribe tools/version.py en cada publicación; no hace falta tocarla a mano. */
const VERSION = '2026.10.26-1';
const CACHE = 'mi-tbr-' + VERSION;
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'version.json', 'css/styles.css', 'css/furniture.css',
  'js/lib/util.js', 'js/lib/busqueda.js', 'js/lib/etiquetas.js', 'js/art/decoracion.js', 'js/art/lomos.js', 'js/art/muebles.js', 'js/art/temas.js',
  'js/app/estado.js', 'js/app/hojas.js', 'js/app/colores.js', 'js/app/estanterias.js', 'js/app/ficha.js', 'js/app/ficha-extra.js', 'js/app/formulario.js', 'js/app/anadir.js', 'js/app/ajustes.js', 'js/app/arrastrar.js', 'js/app/nube.js', 'js/app/lectura.js', 'js/app/inicio.js',
  'icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache:'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'mi-tbr-fuentes' && k !== 'mi-tbr-libs').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin === location.origin){
    // Archivos propios: siempre la versión más reciente si hay conexión; si no, la guardada.
    e.respondWith(fetch(req, { cache:'no-cache' }).then(r => { if(r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch:true }).then(r => r || caches.match('index.html'))));
  } else if(url.hostname === 'cdn.jsdelivr.net'){
    // Librería de la nube (versión fija): se guarda la primera vez y luego se usa la guardada
    e.respondWith(caches.open('mi-tbr-libs').then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if(r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }))));
  } else if(url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'){
    e.respondWith(caches.open('mi-tbr-fuentes').then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }))));
  }
  // Supabase, Google Books, Open Library, Wikidata y portadas: siempre a la red.
});
