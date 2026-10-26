/* Mi TBR · service worker: la app abre al momento, también sin conexión o con mala cobertura.
   Los archivos propios se sirven de lo guardado para esta versión (antes se esperaba a la red cada vez).
   version.json y la API (api/) van siempre a la red. La versión la escribe tools/version.py; no hace falta tocarla a mano. */
const VERSION = '2026.10.26-8';
const CACHE = 'mi-tbr-' + VERSION;
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'css/styles.css', 'css/furniture.css',
  'js/lib/util.js', 'js/lib/busqueda.js', 'js/lib/etiquetas.js', 'js/art/decoracion.js', 'js/art/lomos.js', 'js/art/disenos.js', 'js/art/muebles.js', 'js/art/temas.js',
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
    if(url.pathname.includes('/api/') || url.pathname.endsWith('version.json')) return; // siempre a la red, sin guardar
    // Lo guardado de esta versión, al momento (todo de la misma versión: nunca se mezclan archivos nuevos y viejos).
    // La versión nueva llega con un service worker nuevo, que el navegador descarga solo o al pulsar «Actualizar».
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req, { ignoreSearch:true }) || (req.mode === 'navigate' ? await c.match('index.html') : null);
      if(hit) return hit;
      return fetch(req, { cache:'no-cache' }).then(r => { if(r.ok) c.put(req, r.clone()); return r; }).catch(() => c.match('index.html'));
    }));
  } else if(url.hostname === 'cdn.jsdelivr.net'){
    // Librería de la nube (versión fija): se guarda la primera vez y luego se usa la guardada
    e.respondWith(caches.open('mi-tbr-libs').then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if(r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }))));
  } else if(url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'){
    e.respondWith(caches.open('mi-tbr-fuentes').then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }))));
  }
  // Supabase, Google Books, Open Library, Wikidata y portadas: siempre a la red.
});
