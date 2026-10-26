/* Mi TBR · /api/edicion?isbn=978...,978...
   Datos de ediciones en español a partir del ISBN: editorial, formato, idioma, páginas, fecha y sinopsis.
   Fuente: las fichas de todostuslibros.com (CEGAL), que reciben los datos que publican las propias editoriales. */
const { get, jsonLd, meta, pairs, text, fmtOf, inner } = require('./_lib/fichas');
const clean = s => String(s || '').replace(/[^0-9Xx]/g, '').toUpperCase();
async function ficha(isbn){
  const r = await get(`https://www.todostuslibros.com/libros/x_${isbn}`, 5000);
  if(!r.html) return { isbn, ok:false, status:r.status };
  const ld = jsonLd(r.html).find(x => /Book|Product/i.test([].concat(x['@type']).join())) || {};
  const p = pairs(r.html);
  const pub = (ld.publisher && (ld.publisher.name || ld.publisher)) || p.editorial || '';
  const title = text(inner(r.html, /<h1[^>]*class=["'][^"']*\btitle\b[^"']*["'][^>]*>/i) || ld.name || meta(r.html, 'og:title')).replace(/\s*\|.*$/, '');
  const author = text(inner(r.html, /<h2[^>]*class=["'][^"']*\bauthor\b[^"']*["'][^>]*>/i)) || p['autoría'] || '';
  let syn = text(inner(r.html, /<div[^>]+id=["']collapseSynopsis["'][^>]*>/i));
  if(syn.length < 40) syn = text(inner(r.html, /<div[^>]+class=["'][^"']*synopsis-short[^"']*["'][^>]*>/i)).replace(/\s*Leer descripci[oó]n completa\s*$/i, '');
  if(syn.length < 40) syn = text(ld.description || meta(r.html, 'og:description') || meta(r.html, 'description'));
  const binding = p['encuadernación'] || p.encuadernacion || ld.bookFormat || '';
  const year = ((p[Object.keys(p).find(k => /fecha/.test(k))] || ld.datePublished || '').match(/(19|20)\d\d/) || [''])[0];
  return { isbn, ok:true, url:r.url, title, author, publisher:text(pub), translated:!!p['traducción'] || !!(p['idioma original'] && !/castellano|español/i.test(p['idioma original'])), origLang:p['idioma original'] || '',
    binding, fmt:fmtOf(binding, title), country:p['país de publicación'] || '', lang:p['idioma de publicación'] || p.idioma || ld.inLanguage || '', pages:+(p['nº páginas'] || p['páginas'] || ld.numberOfPages || 0) || 0,
    year, synopsis:syn, cover:ld.image ? [].concat(ld.image)[0] : meta(r.html, 'og:image') };
}
module.exports = async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const isbns = [...new Set((u.searchParams.get('isbn') || '').split(',').map(clean).filter(x => x.length === 13 || x.length === 10))].slice(0, 6);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('access-control-allow-origin', '*');
  if(!isbns.length){ res.statusCode = 400; return res.end(JSON.stringify({ error:'Falta el ISBN' })); }
  // De una en una y con una pausa corta: si se le piden muchas a la vez, todostuslibros deja de responder un rato.
  // Con stop=1 se para en la primera ficha que tenga sinopsis (lo que necesita la app) y no se gastan más peticiones.
  const stop = u.searchParams.get('stop') === '1', t0 = Date.now(), eds = [];
  for(const i of isbns){
    if(Date.now() - t0 > 8000) break; // límite de tiempo de la función
    const e = await ficha(i).catch(e => ({ isbn:i, ok:false, error:String(e.message || e) })); eds.push(e);
    if(stop && e.ok && (e.synopsis || '').length > 60) break;
    await new Promise(r => setTimeout(r, 250));
  }
  res.setHeader('cache-control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
  res.end(JSON.stringify({ eds }));
};
