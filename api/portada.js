/* Mi TBR · /api/portada?u=<url de una portada>
   Devuelve la imagen con permiso CORS para que la app pueda leer sus colores (lomos «de la portada»).
   Solo acepta portadas de las fuentes que usa la app, para no ser un proxy abierto. */
const { UA } = require('./_lib/fichas');
// hardcover.app: portadas de los libros en inglés (antes faltaba y por eso salía «No se pueden leer los colores…»)
const OK = /(^|\.)(books\.google\.com|googleusercontent\.com|googleapis\.com|openlibrary\.org|archive\.org|supabase\.co|cegal\.es|todostuslibros\.com|hardcover\.app|books2door\.com|cdn\.shopify\.com|media-amazon\.com|ssl-images-amazon\.com|wikimedia\.org)$/i;
module.exports = async (req, res) => {
  const raw = new URL(req.url, 'http://x').searchParams.get('u') || '';
  let u; try{ u = new URL(raw); }catch(e){ res.statusCode = 400; return res.end('url'); }
  if(u.protocol !== 'https:' && u.protocol !== 'http:' || !OK.test(u.hostname)){ res.statusCode = 403; return res.end('origen no permitido'); }
  u.protocol = 'https:';
  try{
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 8000);
    const r = await fetch(u.href, { headers:{ 'user-agent':UA }, redirect:'follow', signal:ac.signal }); clearTimeout(t);
    const type = r.headers.get('content-type') || '';
    if(!r.ok || !/^image\//.test(type) || !OK.test(new URL(r.url).hostname)){ res.statusCode = 502; return res.end('no es una imagen'); }
    const buf = Buffer.from(await r.arrayBuffer()); if(buf.length > 4e6){ res.statusCode = 413; return res.end('demasiado grande'); }
    res.setHeader('content-type', type); res.setHeader('access-control-allow-origin', '*');
    res.setHeader('cache-control', 'public, max-age=86400, s-maxage=2592000, immutable');
    res.end(buf);
  }catch(e){ res.statusCode = 504; res.end('sin respuesta'); }
};
