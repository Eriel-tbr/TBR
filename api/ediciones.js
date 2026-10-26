/* Mi TBR · /api/ediciones?t=<título>&a=<autor/a>
   Ediciones de un libro según Hardcover, separadas por idioma (español e inglés): título, ISBN, editorial, páginas, año y portada.
   Sirve para encontrar la edición española aunque se llame distinto (One Dark Window → Una ventana oscura):
   con su ISBN se piden luego los datos de la editorial (api/edicion). ?diag=1 devuelve también los datos en bruto. */
const { gql, findBook, norm } = require('./_lib/hardcover');
const FIELDS = 'id title isbn_13 isbn_10 pages release_date reading_format_id edition_format users_count image { url } publisher { name }';
const langOf = l => { const s = norm([(l || {}).language, (l || {}).code2, (l || {}).code3].filter(Boolean).join(' '));
  return /\b(spanish|espanol|castellano|es|spa)\b/.test(s) ? 'es' : /\b(english|en|eng)\b/.test(s) ? 'en' : s ? 'otro' : ''; };
async function editions(id){
  try{ return (await gql(`query E($id: Int!) { editions(where: {book_id: {_eq: $id}}, limit: 80, order_by: {users_count: desc}) { ${FIELDS} language { language code2 code3 } } }`, { id })).editions || []; }
  catch(e){ return (await gql(`query E($id: Int!) { editions(where: {book_id: {_eq: $id}}, limit: 80, order_by: {users_count: desc}) { ${FIELDS} language { language } } }`, { id })).editions || []; }
}
module.exports = async (req, res) => {
  const p = new URL(req.url, 'http://x').searchParams, t = (p.get('t') || '').slice(0, 200), a = (p.get('a') || '').slice(0, 120), diag = p.get('diag');
  res.setHeader('content-type', 'application/json; charset=utf-8'); res.setHeader('access-control-allow-origin', '*');
  if(!t){ res.statusCode = 400; return res.end('{"error":"t"}'); }
  try{
    const book = await findBook(t, a);
    if(!book || !book.id){ res.statusCode = 404; return res.end(JSON.stringify({ error:'libro no encontrado' })); }
    const list = await editions(+book.id);
    // Solo papel (ni audio ni ebook): son las que tienen ficha de editorial con sinopsis
    const out = { es:[], en:[] };
    list.filter(e => ![2, 4].includes(+e.reading_format_id)).forEach(e => {
      const l = langOf(e.language); if(!out[l]) return;
      out[l].push({ title:e.title || '', isbn:e.isbn_13 || e.isbn_10 || '', publisher:(e.publisher || {}).name || '', pages:e.pages || 0,
        year:((e.release_date || '').match(/\d{4}/) || [''])[0], cover:(e.image || {}).url || '', format:e.edition_format || '', users:e.users_count || 0 });
    });
    const result = { book:{ id:+book.id, title:book.title, slug:book.slug || '', year:book.release_year || null }, es:out.es.slice(0, 12), en:out.en.slice(0, 12) };
    res.setHeader('cache-control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
    res.end(JSON.stringify(diag ? { ...result, raw:{ book, editions:list } } : result));
  }catch(e){ res.statusCode = 502; res.end(JSON.stringify({ error:e.message })); }
};
