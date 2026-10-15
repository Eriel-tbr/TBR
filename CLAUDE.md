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
  `js/lib/util.js, busqueda.js, etiquetas.js` → `js/art/decoracion.js, lomos.js, muebles.js, temas.js` → `js/app/estado.js, hojas.js, estanterias.js, ficha.js, ficha-extra.js, formulario.js, anadir.js, ajustes.js, arrastrar.js, nube.js, inicio.js`.
- `css/styles.css` (interfaz) y `css/furniture.css` (muebles y lomos).
- Estado: `state = {v:1, settings, units[], books[], seriesStyle{}, deleted{}, metaUpd}` en localStorage `tbr.v1`; `save()` en estado.js.
- Hojas (ventanas): `openSheet(sheetT(título, cuerpo, pie))`, `closeSheet()`; chips con `chipsHtml()`. Las hojas apiladas suben de z-index para que la de debajo quede tapada.
- Selectores (fase 4, hecha): no se usan `<select>` nativos. `pickHtml(id, etiqueta, [[valor, texto]…], actual)` (hojas.js) pinta un botón `.pick` que abre una hoja con las opciones (radiogroup, flechas/Inicio/Fin, Escape, devuelve el foco). Se usa como un select: valor en `btn.value` y evento `change` que burbujea. `setPick(btn, opciones, valor)` cambia opciones o valor sin lanzar `change` (p. ej. la balda al cambiar de estantería). Están en `#f-unit`, `#f-shelf`, `#r-unit`, `#r-tag`, `#u-moveto`.
- Campos de texto de una línea: `lineHtml(atributos, valor)` (util.js) crea un `<textarea class="one">`, no un `<input>`: Chrome en Android pone su barra de autorrellenar (llave, tarjeta, ubicación) en todos los `<input>` de texto aunque lleven `autocomplete="off"`. Enter termina el campo, los saltos pegados se quitan y `data-num` solo deja cifras (hojas.js). No volver a usar `<input>` de texto.
- Decoración: los objetos automáticos se pintan como `auto:<unidad>:<n>`; al tocarlos o arrastrarlos, `materializeDecor()` pasa la estantería a manual guardando los que se ven. En la hoja del objeto hay botones «Antes / Después» además de arrastrar.
- Colores de lomo: `spineArt()` devuelve también `pal` y `ink` efectivos (los selectores parten de ahí). `sp.ink` = color de letras elegido; si no, el título se fuerza a contraste ≥ 2,6 con su fondo (`legibleOn`). Un color elegido a mano pone `adjust:false` y se respeta aunque la serie comparta diseño.
- `DECO_C`: cada tema parte de la paleta de fantasía; si a un tema le falta un color, el dibujo de objetos fallaba y la ventana de editar estantería dejaba de responder (pasó con Ciencia ficción).
- Baldas a la par: todos los muebles reservan `CROWN_Z` (150 de 358) para el remate (temas.js `crownHtml`/`crownHead`): los remates bajos llevan un hueco superior `.head` dentro del mueble; el gótico (200) se comprime en vertical. Así la primera balda queda a la misma altura en todos.
- Estantería «Contemporánea y thriller» (preset `contemporanea`): `migrate()` en estado.js renombra la antigua «Contemporánea» y le añade la balda «Thriller y misterio» una sola vez (`settings.migThriller`).
- Lomos automáticos con colores de su portada: `autoPal()`; `refreshCoverPals()` (inicio.js) calcula `b.coverPal` en segundo plano. Ajustes → «Colores de los lomos automáticos» (`settings.spineFromCover`).
- Ficha (ficha-extra.js): serie completa (tomos propios + los que faltan según `api/serie`, con «Añadir»), audiolibro (`api/audio`, guardado en `b.audio` 30 días; `b.audioDrama` lo marca ella) y enlaces «Buscar en» (Amazon.es, Buscalibre, Casa del Libro vía Google, Books2Door). Sus botones usan `data-xdo`, no `data-do` (el manejador de la ficha redibujaría).
- Títulos: `b.origTitle` guarda el original cuando se usa el título en español (`esTitle` de `enrichBook`: Wikidata o edición española). «Buscar y comparar» busca con el original y ofrece el español.
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
- `audio.js`: audiolibros de un libro (`?t=` título original, `es=` título en español, `a=` autor/a): Apple Books (iTunes Search, tiendas `es` y `us`, sin clave, ~20 llamadas/min) + ediciones de audio de Hardcover (`reading_format_id` 2: duración, narradores). Idioma por palabras frecuentes; solo español e inglés. «¿Dramatizado?» solo como sospecha por el texto. Responde como mucho a los 6,5 s.
- `serie.js`: tomos de una serie en Hardcover (`?s=` serie, `t=` título, `a=`). Descarta series vacías (Hardcover tiene duplicados con nombres traducidos) y, si hace falta, usa la serie del libro.
- `_lib/hardcover.js`: `gql`, `search`, `findBook` compartidos.
- Para probar la API en producción: WebFetch falla con estas rutas; usar el navegador integrado y `fetch` desde https://tbr-sage.vercel.app.
- `portada.js`: proxy de portadas con lista de dominios permitidos, para leer colores en canvas. Incluye hardcover.app (faltaba: los libros en inglés salían con «No se pueden leer los colores»).
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
- Revisada la copia del 15/10/2026 (29 libros): corregidos títulos, autoría, series, idiomas y una etiqueta. Faltan sinopsis en 7 libros y sinopsis en inglés en libros traducidos (Blue Monday, Weyward, A Darker Shade of Magic): se completan con «Buscar y comparar datos» desde la app (no copiar sinopsis a mano). `migrate()` también pone `adjust:false` a los colores de lomo elegidos a mano antes (`settings.migAdjust`).
- Tanda 3: informe (audiolibros, tienda tipo Books2Door en español, análisis de la app Mistbook).
- Descartado por decisión de Leyre: gastos, estadísticas nuevas y avisos.
