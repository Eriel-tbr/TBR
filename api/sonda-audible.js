/* Mi TBR · /api/sonda-audible — PRUEBA TEMPORAL (rama sonda-audible, no va a main).
   ¿Responde el catálogo de Audible sin clave y qué datos da? */
const CASES = [
  ['es', { title:'Alas de sangre', author:'Yarros' }],
  ['es', { title:'Una corte de rosas y espinas', author:'Maas' }],
  ['es', { title:'El imperio final', author:'Sanderson' }],
  ['es', { title:'Seis de cuervos', author:'Bardugo' }],
  ['es', { title:'La sombra del viento', author:'Ruiz Zafón' }],
  ['es', { keywords:'Fourth Wing Yarros' }],
  ['com', { title:'Fourth Wing', author:'Yarros' }],
  ['com', { title:'The Sandman', author:'Gaiman' }],
  ['co.uk', { title:'Six of Crows', author:'Bardugo' }]
];
const RG = 'contributors,product_attrs,media,series,product_extended_attrs';
async function one(tld, q){
  const p = new URLSearchParams({ num_results:'5', products_sort_by:'Relevance', response_groups:RG, ...q });
  const url = `https://api.audible.${tld}/1.0/catalog/products?${p}`, t0 = Date.now();
  try{
    const ac = new AbortController(), to = setTimeout(() => ac.abort(), 6000);
    const r = await fetch(url, { signal:ac.signal, headers:{ accept:'application/json' } }); clearTimeout(to);
    const txt = await r.text(); let j = null; try{ j = JSON.parse(txt); }catch{}
    return { tld, q, status:r.status, ms:Date.now() - t0, total:j && j.total_results,
      items:j && j.products ? j.products.map(x => ({ asin:x.asin, title:x.title, subtitle:x.subtitle, authors:(x.authors || []).map(a => a.name),
        narrators:(x.narrators || []).map(a => a.name), lang:x.language, min:x.runtime_length_min, fmt:x.format_type, type:x.content_type, deliv:x.content_delivery_type,
        series:(x.series || []).map(s => s.title + ' #' + s.sequence), pub:x.publisher_name, date:x.release_date, isbn:x.isbn })) : txt.slice(0, 300) };
  }catch(e){ return { tld, q, error:e.message, ms:Date.now() - t0 }; }
}
module.exports = async (req, res) => {
  const out = [];
  for(const [tld, q] of CASES) out.push(await one(tld, q));
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ desde:process.env.VERCEL ? 'vercel ' + (process.env.VERCEL_REGION || '') : 'otro', out }, null, 1));
};
