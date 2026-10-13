/* Mi TBR · /api/hardcover?q=...
   Búsqueda en Hardcover (hardcover.app), muy completa en libros en inglés: serie y número, páginas, portada.
   El token va en la variable HARDCOVER_TOKEN de Vercel; Hardcover no permite usarlo desde el navegador. */
const UA = 'MiTBR/1.0 (app personal de lista de lecturas)';
const QUERY = `query Buscar($q: String!) { search(query: $q, query_type: "Book", per_page: 12, page: 1) { results } }`;
module.exports = async (req, res) => {
  const q = (new URL(req.url, 'http://x').searchParams.get('q') || '').slice(0, 200);
  res.setHeader('content-type', 'application/json; charset=utf-8'); res.setHeader('access-control-allow-origin', '*');
  if(!q){ res.statusCode = 400; return res.end('{"error":"q"}'); }
  const tok = (process.env.HARDCOVER_TOKEN || '').replace(/^Bearer\s+/i, '');
  if(!tok){ res.statusCode = 503; return res.end('{"error":"Falta HARDCOVER_TOKEN"}'); }
  try{
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 6000);
    const r = await fetch('https://api.hardcover.app/v1/graphql', { method:'POST', signal:ac.signal,
      headers:{ 'content-type':'application/json', authorization:'Bearer ' + tok, 'user-agent':UA }, body:JSON.stringify({ query:QUERY, variables:{ q } }) });
    clearTimeout(t);
    const j = await r.json().catch(() => ({}));
    if(!r.ok || j.errors){ res.statusCode = r.ok ? 502 : r.status; return res.end(JSON.stringify({ error:(j.errors && j.errors[0] && j.errors[0].message) || 'HTTP ' + r.status })); }
    const hits = (((j.data || {}).search || {}).results || {}).hits || [];
    // Fuera packs y colecciones, y fichas sin autor (suelen ser duplicados incompletos)
    const items = hits.map(h => h.document || {}).filter(d => d.title && (d.author_names || []).length && !/\b(box(ed)? set|books? set|collection set|\d+ books)\b/i.test(d.title)).map(d => {
      const fs = d.featured_series || {}, ser = fs.series || {};
      return { title:d.title, subtitle:d.subtitle || '', author:(d.author_names || []).slice(0, 2).join(', '), year:d.release_year || null, pages:d.pages || 0,
        cover:(d.image && d.image.url) || '', desc:d.description || '', isbns:(d.isbns || []).slice(0, 12),
        series:ser.name || (d.series_names || [])[0] ? { name:ser.name || d.series_names[0], n:fs.position || d.featured_series_position || '', total:ser.primary_books_count || '' } : null,
        genres:(d.genres || []).slice(0, 10), users:d.users_count || 0, slug:d.slug || '' };
    });
    res.setHeader('cache-control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.end(JSON.stringify({ items }));
  }catch(e){ res.statusCode = 504; res.end('{"error":"Hardcover no responde"}'); }
};
