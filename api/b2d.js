/* Mi TBR · /api/b2d?q=título autor
   Ediciones en inglés a la venta en Books2Door (tienda británica, muchas ediciones especiales).
   Usa el buscador público de la tienda (Shopify, permitido en su robots.txt). */
const UA = 'Mozilla/5.0 (Linux; Android 14) MiTBR/1.0 (app personal)';
const strip = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
function fmtOf(t){
  if(/special|exclusive|sprayed|signed|deluxe|collector|limited|illustrated/i.test(t)) return 'especial';
  if(/hardback|hardcover/i.test(t)) return 'dura';
  if(/paperback/i.test(t)) return 'blanda';
  return '';
}
module.exports = async (req, res) => {
  const q = (new URL(req.url, 'http://x').searchParams.get('q') || '').slice(0, 150);
  res.setHeader('content-type', 'application/json; charset=utf-8'); res.setHeader('access-control-allow-origin', '*');
  if(!q){ res.statusCode = 400; return res.end('{"error":"q"}'); }
  try{
    const u = 'https://www.books2door.com/search/suggest.json?resources[type]=product&resources[limit]=10&q=' + encodeURIComponent(q);
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 6000);
    const r = await fetch(u, { headers:{ 'user-agent':UA, accept:'application/json' }, signal:ac.signal }); clearTimeout(t);
    if(!r.ok){ res.statusCode = 502; return res.end(JSON.stringify({ error:'HTTP ' + r.status })); }
    const j = await r.json(), list = (((j.resources || {}).results || {}).products) || [];
    const items = list.map(p => {
      const tags = [].concat(p.tags || []), full = strip(p.title);
      return { title:full.replace(/\s+by\s+[^:]+$/i, '').replace(/:\s.*$/, '').trim(), full, url:'https://www.books2door.com' + (p.url || '/products/' + p.handle).split('?')[0],
        price:p.price ? '£' + p.price : '', available:p.available !== false, publisher:p.vendor || '', image:p.image || (p.featured_image && p.featured_image.url) || '',
        isbn:/^\d{13}$/.test(p.handle || '') ? p.handle : '', fmt:fmtOf(full + ' ' + (p.type || '')),
        author:(tags.find(x => /^Author_/.test(x)) || '').replace(/^Author_/, ''), series:(tags.find(x => /^Series_/.test(x)) || '').replace(/^Series_/, '') };
    });
    res.setHeader('cache-control', 'public, s-maxage=43200, stale-while-revalidate=604800');
    res.end(JSON.stringify({ items }));
  }catch(e){ res.statusCode = 504; res.end('{"error":"Books2Door no responde"}'); }
};
