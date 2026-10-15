/* Mi TBR · /api/audio?t=<título>&es=<título en español>&a=<autor/a>
   Audiolibros de un libro: Apple Books (tiendas de España y de EE. UU., buscador público sin clave)
   y ediciones en audio de Hardcover (duración, narradores, idioma).
   Ninguna fuente dice si es dramatizado: se marca como «posible» si el título o la editorial lo sugieren.
   ?diag=1 devuelve también los datos en bruto para depurar. */
const { gql, findBook, norm, lastName } = require('./_lib/hardcover');
const DRAMA = /dramati[sz]|full[- ]cast|reparto completo|audioserie|audio drama|graphic ?audio|radio play/i;
const ES_WORDS = /\b(el|la|los|las|una|que|del|por|para|con|novela|historia|narrado)\b/gi, EN_WORDS = /\b(the|and|with|of|her|his|novel|story|narrated|read by)\b/gi;
function guessLang(text){ const es = (text.match(ES_WORDS) || []).length, en = (text.match(EN_WORDS) || []).length; return es > en * 1.3 ? 'es' : en > es * 1.3 ? 'en' : ''; }
async function apple(term, country){
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), 6000);
  try{
    const r = await fetch(`https://itunes.apple.com/search?media=audiobook&entity=audiobook&limit=10&country=${country}&term=${encodeURIComponent(term)}`, { signal:ac.signal });
    if(!r.ok) throw new Error('Apple ' + r.status); return (await r.json()).results || [];
  }finally{ clearTimeout(t); }
}
module.exports = async (req, res) => {
  const p = new URL(req.url, 'http://x').searchParams, t = (p.get('t') || '').slice(0, 200), es = (p.get('es') || '').slice(0, 200), a = (p.get('a') || '').slice(0, 120), diag = p.get('diag'), only = p.get('only') || '';
  res.setHeader('content-type', 'application/json; charset=utf-8'); res.setHeader('access-control-allow-origin', '*');
  if(!t){ res.statusCode = 400; return res.end('{"error":"t"}'); }
  const last = lastName(a), raw = {}, errors = {}, items = [];
  const titles = [t, es].filter(Boolean).map(norm);
  const sameBook = name => { const n = norm(name); return titles.some(x => x && (n.includes(x) || x.includes(n.split(' ').slice(0, 4).join(' ')))); };
  // Apple Books: tienda española con el título en español (si lo hay) y tienda de EE. UU. con el original
  const jobs = [['es', (es || t) + (last ? ' ' + last : '')], ['us', t + (last ? ' ' + last : '')]];
  const work = Promise.all([
    ...(only === 'hc' ? [] : jobs).map(async ([c, term]) => {
      try{
        const list = await apple(term, c); if(diag) raw['apple_' + c] = list;
        list.filter(x => (!last || norm(x.artistName).includes(last)) && sameBook(x.collectionName || '')).forEach(x => {
          if(items.some(i => i.id === 'a' + x.collectionId)) return;
          const text = `${x.collectionName || ''} ${String(x.description || '').replace(/<[^>]+>/g, ' ')}`;
          items.push({ id:'a' + x.collectionId, src:'apple', store:'Apple Books', country:c, title:x.collectionName, author:x.artistName, url:x.collectionViewUrl,
            cover:x.artworkUrl100 || '', year:String(x.releaseDate || '').slice(0, 4), price:x.collectionPrice != null ? `${x.collectionPrice} ${x.currency || ''}`.trim() : '',
            lang:es && norm(x.collectionName).includes(norm(es)) && norm(es) !== norm(t) ? 'es' : guessLang(text) || (c === 'es' ? '' : 'en'), drama:DRAMA.test(text) });
        });
      }catch(e){ errors['apple_' + c] = e.message; }
    }),
    (async () => { if(only === 'apple') return;
      try{
        const book = await findBook(t, a); if(diag) raw.hardcoverBook = book; if(!book || !book.id) return;
        let d;
        try{ d = await gql(`query E($id: Int!) { editions(where: {book_id: {_eq: $id}, reading_format_id: {_eq: 2}}, limit: 25, order_by: {users_count: desc}) {
          id title audio_seconds release_date edition_information language { language } publisher { name } contributions { contribution author { name } } } }`, { id:+book.id }); }
        catch(e){ errors.hardcoverFull = e.message; if(/abort/i.test(e.message)) throw e; // por si algún campo no existe: consulta mínima
          d = await gql(`query E($id: Int!) { editions(where: {book_id: {_eq: $id}, reading_format_id: {_eq: 2}}, limit: 25) { id title audio_seconds release_date } }`, { id:+book.id }); }
        if(diag) raw.hardcoverEditions = d.editions;
        (d.editions || []).forEach(e => {
          const lang = norm((e.language || {}).language || ''), narr = (e.contributions || []).filter(c => /narrat|reader|voice|narrad/i.test(c.contribution || '')).map(c => (c.author || {}).name).filter(Boolean);
          const pub = (e.publisher || {}).name || '', text = `${e.title || ''} ${e.edition_information || ''} ${pub}`;
          items.push({ id:'h' + e.id, src:'hardcover', store:'Hardcover', title:e.title || t, url:book.slug ? `https://hardcover.app/books/${book.slug}/editions` : '',
            lang:/spanish|espanol|castellano/.test(lang) ? 'es' : /english|ingles/.test(lang) ? 'en' : lang ? 'otro' : '', seconds:e.audio_seconds || 0,
            narrators:narr.slice(0, 4), publisher:pub, year:String(e.release_date || '').slice(0, 4), drama:DRAMA.test(text) });
        });
      }catch(e){ errors.hardcover = e.message; }
    })()
  ]);
  // Vercel corta a los 10 s: se responde con lo que haya a los 8,5 s
  await Promise.race([work, new Promise(r => setTimeout(() => { errors.tiempo = 'respuesta parcial'; r(); }, 8500))]);
  // Primero en español, luego en inglés; dentro, Apple antes que Hardcover (tiene enlace de compra)
  const rank = i => (i.lang === 'es' ? 0 : i.lang === 'en' ? 1 : 2) * 2 + (i.src === 'apple' ? 0 : 1);
  items.sort((x, y) => rank(x) - rank(y));
  res.setHeader('cache-control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
  res.end(JSON.stringify(diag ? { items, errors, raw } : { items, errors:Object.keys(errors).length ? errors : undefined }));
};
