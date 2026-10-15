# Mi TBR — contexto para seguir trabajando

App web personal (PWA, interfaz en español) para la lista de libros por leer de Leyre. Uso principal: móvil Android Samsung, instalada desde Vercel.
Responder en español, directo, con apartados. Explicar decisiones técnicas y avisar de limitaciones.

## Dónde está
- Repo: `Eriel-tbr/TBR` (rama `main`). Cada push publica solo:
  - **Vercel** (principal): https://tbr-sage.vercel.app — estático + funciones en `api/`.
  - GitHub Pages (antigua): https://eriel-tbr.github.io/TBR/ — sin `api/`; el código llama a la API de Vercel desde ahí.
- GitHub Action «Pruebas» ejecuta `npm test` en cada push.

## Estructura
- `index.html`, `sw.js` (service worker, network-first para lo propio), `version.json`, `manifest.webmanifest`.
- JS clásico sin módulos ni build; scripts que comparten variables globales, en este orden:
  `js/lib/util.js, busqueda.js, etiquetas.js` → `js/art/decoracion.js, lomos.js, muebles.js, temas.js` → `js/app/estado.js, hojas.js, estanterias.js, ficha.js, formulario.js, anadir.js, ajustes.js, arrastrar.js, nube.js, inicio.js`.
- `css/styles.css` (interfaz) y `css/furniture.css` (muebles y lomos).
- Estado: `state = {v:1, settings, units[], books[], seriesStyle{}, deleted{}, metaUpd}` en localStorage `tbr.v1`; `save()` en estado.js.
- Hojas (ventanas): `openSheet(sheetT(título, cuerpo, pie))`, `closeSheet()`; chips con `chipsHtml()`.
- Arte: lomos SVG (`spine`), muebles por tema (`THEMES` en temas.js: fantasía→gótico, romantasy→rococó, ciencia ficción→chip, dark academia→academia, contemporánea→moderno, romance→romance, resto→genérico). Decoración automática o manual (`u.decorMode`).

## Nube (fase 2, hecha)
- Supabase (mismo proyecto que la app de cocina «Puerco»), tablas `tbr_state` (un JSON por usuaria, columna `rev` para concurrencia) y `tbr_backups`, bucket `tbr-portadas`. SQL en `supabase/tbr_fase2.sql`.
- `js/app/nube.js`: login opcional con Google (PKCE), fusión libro a libro por `upd`, borrados en `deleted`, primera unión sin duplicar, realtime. La app funciona sin cuenta.
- supabase-js 2.58.0 por CDN jsDelivr (async).

## API en Vercel (`api/`, CommonJS, sin dependencias)
- `buscar.js`: Google Books con clave (`GOOGLE_BOOKS_KEY` en Vercel), reintenta ante 503 (Google tiene caídas pasajeras). `?diag=1` para diagnosticar.
- `hardcover.js`: búsqueda en Hardcover (`HARDCOVER_TOKEN` en Vercel; no usar en el navegador). Da serie y número.
- `edicion.js`: ediciones en español por ISBN desde fichas de todostuslibros.com (editorial, formato, sinopsis oficial). No usar su buscador (/busquedas está prohibido en su robots.txt).
- `b2d.js`: ediciones en inglés en Books2Door (buscador Shopify `search/suggest.json`, permitido). No indica tapa dura/blanda.
- `portada.js`: proxy de portadas con lista de dominios permitidos, para leer colores en canvas.
- Las claves y tokens solo en variables de Vercel. Nunca en el código ni en el chat.

## Búsqueda (js/lib/busqueda.js + js/app/anadir.js)
- `searchBooks(q, signal, onPartial)`: Google (general y `langRestrict=es`), Hardcover y Open Library en paralelo; resultados progresivos.
- `enrichBook`: Wikidata (serie, idiomas, título en español), ISBN españoles (Google + Open Library) → `api/edicion`, ediciones inglesas → `api/b2d`.
- Reglas de sinopsis: si el libro está traducido al español, sinopsis de la edición española; si no, la original en inglés sin traducir. La sinopsis escrita a mano no se toca.

## Versiones y pruebas
- Antes de cada push: `python3 tools/version.py` (cambia versión en version.json, sw.js e index.html → aparece el aviso «Actualizar» en el móvil).
- Pruebas: `NODE_PATH=/opt/node22/lib/node_modules node tests/e2e.cjs` (Playwright, APIs simuladas, Supabase simulado en `tests/mock-supabase.js`). Deben pasar todas antes de subir.
- Commits en español.

## Pendiente
- **Fase 4**: sustituir los `<select>` nativos por un selector propio con el estilo de la app (tipo chips/lista en hoja). Hay 5: estantería y balda en el formulario de libro (`formulario.js` `#f-unit`, `#f-shelf`, la balda depende de la estantería), estantería y etiqueta en el libro al azar (`ajustes.js` `#r-unit`, `#r-tag`) y uno en el formulario de estantería (`ajustes.js` `#u-moveto`, a dónde mover los libros al eliminar una estantería). Mantener accesibilidad y que funcione con el dedo en móvil; actualizar las pruebas que usen esos campos.
- Descartado por decisión de Leyre: gastos, estadísticas nuevas y avisos.
