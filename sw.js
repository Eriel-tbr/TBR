/* Service worker: la app funciona sin conexión. Sube el número de versión al cambiar archivos. */
const CACHE = 'mi-tbr-v4';
const SHELL = ['./', 'index.html', 'styles.css', 'furniture.css', 'lib.js', 'art-engine.js', 'art.js', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin === location.origin){
    // Archivos propios: primero la red (para recibir cambios) y, sin conexión, la copia guardada.
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  } else if(url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'){
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })));
  }
  // Consultas a Google Books / Open Library y portadas: siempre a la red, sin guardar.
});
