/* Mi TBR · /api/serie?s=<nombre de la serie>&t=<título de un tomo>&a=<autor/a>
   Tomos de una serie según Hardcover, en orden: posición, título, año, portada y páginas.
   Busca la serie por su nombre (con el mismo autor) y, si no la encuentra (p. ej. nombre en español),
   por el libro. ?diag=1 devuelve también los datos en bruto. */
const { gql, search, findBook, norm, lastName } = require('./_lib/hardcover');
const Q = `query S($id: Int!) { series(where: {id: {_eq: $id}}) { id name slug books_count primary_books_count
  book_series(distinct_on: position, order_by: [{position: asc}, {book: {users_count: desc}}],
    where: {book: {canonical_id: {_is_null: true}, is_partial_book: {_eq: false}}, compilation: {_eq: false}}) {
    position book { id title slug release_year pages image { url } } } } }`;
module.exports = async (req, res) => {
  const p = new URL(req.url, 'http://x').searchParams, s = (p.get('s') || '').slice(0, 160), t = (p.get('t') || '').slice(0, 200), a = (p.get('a') || '').slice(0, 120), diag = p.get('diag');
  res.setHeader('content-type', 'application/json; charset=utf-8'); res.setHeader('access-control-allow-origin', '*');
  if(!s && !t){ res.statusCode = 400; return res.end('{"error":"s o t"}'); }
  const last = lastName(a), raw = {};
  try{
    let id = null;
    if(s){
      const docs = await search(s, 'Series', 8); if(diag) raw.series = docs;
      // Solo series con libros (Hardcover tiene duplicados vacíos, p. ej. con el nombre traducido)
      const byAuthor = d => !last || norm(d.author_name || (d.author || {}).name || '').includes(last);
      const full = docs.filter(d => +(d.primary_books_count || d.books_count || 0) > 0);
      const hit = full.find(d => byAuthor(d) && norm(d.name) === norm(s)) || full.find(byAuthor);
      if(hit && hit.id) id = +hit.id;
    }
    if(!id && t){
      const b = await findBook(t, a); if(diag) raw.book = b;
      const fs = b && b.featured_series; id = fs && fs.series && fs.series.id ? +fs.series.id : null;
    }
    if(!id){ res.statusCode = diag ? 200 : 404; return res.end(JSON.stringify(diag ? { error:'serie no encontrada', raw } : { error:'serie no encontrada' })); }
    let d = await gql(Q, { id }), se = (d.series || [])[0]; if(diag) raw.query = d;
    if((!se || !(se.book_series || []).length) && t){ // serie vacía: la del libro
      const b = await findBook(t, a), fs = b && b.featured_series, id2 = fs && fs.series && fs.series.id ? +fs.series.id : null; if(diag) raw.book = b;
      if(id2 && id2 !== id){ d = await gql(Q, { id:id2 }); se = (d.series || [])[0]; } }
    if(!se || !(se.book_series || []).length){ res.statusCode = diag ? 200 : 404; return res.end(JSON.stringify(diag ? { error:'serie no encontrada', raw } : { error:'serie no encontrada' })); }
    const books = (se.book_series || []).filter(x => x.book && x.position != null).map(x => ({ n:+x.position, main:Number.isInteger(+x.position) && +x.position > 0,
      title:x.book.title, year:x.book.release_year || null, pages:x.book.pages || 0, cover:(x.book.image || {}).url || '', url:x.book.slug ? 'https://hardcover.app/books/' + x.book.slug : '' }));
    res.setHeader('cache-control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
    const out = { name:se.name, total:se.primary_books_count || books.filter(b => b.main).length, url:se.slug ? 'https://hardcover.app/series/' + se.slug : '', books };
    res.end(JSON.stringify(diag ? { ...out, raw } : out));
  }catch(e){ res.statusCode = diag ? 200 : 502; res.end(JSON.stringify({ error:e.message, stack:diag ? String(e.stack).slice(0, 600) : undefined, raw:diag ? raw : undefined })); }
};
