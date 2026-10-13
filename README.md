# Mi TBR

Mi lista de libros por leer, organizada en estanterías con muebles y lomos dibujados.
Web instalable (PWA) publicada con GitHub Pages: https://eriel-tbr.github.io/TBR/

## Estructura

| Carpeta | Qué hay |
|---|---|
| `index.html`, `manifest.webmanifest`, `sw.js` | Página, datos de instalación y funcionamiento sin conexión |
| `css/` | Estilos de la interfaz (`styles.css`) y de muebles y lomos (`furniture.css`) |
| `js/lib/` | Utilidades, búsqueda (Google Books, Open Library, Wikidata) y etiquetas |
| `js/art/` | Dibujo: objetos decorativos, lomos, remates de los muebles y temas de cada estantería |
| `js/app/` | La app: estado, estanterías, ficha, formulario, ajustes, arrastrar y soltar… |
| `tests/` | Pruebas automáticas (`npm test`) |
| `tools/version.py` | Pone una versión nueva antes de publicar |

Los datos se guardan en el navegador del móvil (`localStorage`, clave `tbr.v1`).
Haz copias desde **Ajustes › Guardar copia**.

## Publicar un cambio

1. `python3 tools/version.py` (cambia la versión para que el móvil muestre «Hay una versión nueva»).
2. `npm test`
3. Subir a la rama `main`: GitHub Pages lo publica solo en 1–2 minutos.

## Copia en la nube (Supabase)

- Opcional: la app funciona sin cuenta. Con «Entrar con Google» (Ajustes o el aviso de arriba) la colección se guarda en Supabase y se sincroniza entre dispositivos.
- Código: `js/app/nube.js`. Cada libro y estantería lleva `upd` (último cambio); los borrados quedan en `deleted`. Al juntar, gana el cambio más reciente de cada libro.
- Las portadas subidas desde el móvil se mueven al bucket `tbr-portadas` (carpeta propia de cada cuenta).
- Base de datos: ejecutar `supabase/tbr_fase2.sql` una vez en el SQL Editor del proyecto. Guarda copias automáticas en `tbr_backups` (como mucho una cada 12 h, las 30 últimas).
- En Supabase → Authentication → URL Configuration, cada dirección donde se publique la app tiene que estar en «Redirect URLs».
