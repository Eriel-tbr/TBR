/* Mi TBR · /api/buscar?q=...&langRestrict=es
   Búsqueda en Google Books desde el servidor con la clave de la app (variable GOOGLE_BOOKS_KEY en Vercel).
   Sin clave, Google rechaza a menudo las peticiones anónimas por cuota (error 429). La clave nunca va en el código. */
module.exports = async (req, res) => {
  const sp = new URL(req.url, 'http://x').searchParams, q = (sp.get('q') || '').slice(0, 200);
  res.setHeader('content-type', 'application/json; charset=utf-8'); res.setHeader('access-control-allow-origin', '*');
  if(!q){ res.statusCode = 400; return res.end('{"error":"q"}'); }
  const u = new URL('https://www.googleapis.com/books/v1/volumes');
  u.searchParams.set('q', q); u.searchParams.set('printType', 'books'); u.searchParams.set('maxResults', String(Math.min(20, +sp.get('maxResults') || 10)));
  if(/^[a-z]{2}$/.test(sp.get('langRestrict') || '')) u.searchParams.set('langRestrict', sp.get('langRestrict'));
  u.searchParams.set('country', 'ES'); // los servidores no tienen país y algunas consultas lo necesitan
  if(process.env.GOOGLE_BOOKS_KEY && !sp.has('sinclave')) u.searchParams.set('key', process.env.GOOGLE_BOOKS_KEY);
  try{
    // Google Books tiene caídas pasajeras (503): se reintenta dos veces antes de rendirse
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 8000); let r;
    for(const wait of [0, 500, 1200]){ if(wait) await new Promise(ok => setTimeout(ok, wait)); r = await fetch(u, { signal:ac.signal }); if(r.status < 500) break; }
    clearTimeout(t);
    const body = await r.text();
    if(sp.has('diag')){ let msg = ''; try{ const e = JSON.parse(body).error; msg = e && (e.message + ' [' + (e.status || '') + ']'); }catch(x){}
      return res.end(JSON.stringify({ status:r.status, conClave:!!process.env.GOOGLE_BOOKS_KEY, items:r.ok ? (JSON.parse(body).items || []).length : 0, error:msg || '' })); }
    res.statusCode = r.status; res.setHeader('x-con-clave', process.env.GOOGLE_BOOKS_KEY ? '1' : '0');
    if(r.ok) res.setHeader('cache-control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.end(body);
  }catch(e){ if(sp.has('diag')) return res.end(JSON.stringify({ excepcion:String(e) })); res.statusCode = 504; res.end('{"error":"sin respuesta de Google"}'); }
};
