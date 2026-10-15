/* Mi TBR · /api/audio?t=<título>&es=<título en español>&a=<autor/a>
   Audiolibros de un libro: Apple Books (tiendas de España y de EE. UU., buscador público sin clave)
   y ediciones en audio de Hardcover (duración, narradores, idioma).
   Ninguna fuente dice si es dramatizado: se marca como «posible» si el título o la editorial lo sugieren.
   ?diag=1 devuelve también los datos en bruto para depurar. */
const { gql, findBook, norm, lastName } = require('./_lib/hardcover');
const DRAMA = /dramati[sz]|full[- ]cast|reparto completo|audioserie|audio drama|graphic ?audio|radio play/i;
/* Idioma por palabras frecuentes del título y la descripción (Apple no lo indica). Las tiendas mezclan traducciones a otros idiomas. */
const WORDS = { es:'el la los las una que del por para con como sus pero novela historia libro', en:'the and with of her his novel story but from this that book',
  it:'il gli della degli che per una romanzo libro non accadimenti', de:'der die das und mit ein eine nicht band lesung roman ungekürzte gekürzte',
  fr:'le les des une du est pour roman tome dans', pt:'os das dos uma com não livro sombra', nd:'og det som til af første del bind' };
const RX = Object.fromEntries(Object.entries(WORDS).map(([k, w]) => [k, new RegExp(`(^|[^\\p{L}])(${w.split(' ').join('|')})(?=$|[^\\p{L}])`, 'giu')]));
function guessLang(text){ let best = '', n = 0; for(const [k, rx] of Object.entries(RX)){ const c = (String(text).match(rx) || []).length; if(c > n){ n = c; best = k; } } return best; }
async function apple(term, country){
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), 4000);
  try{
    const r = await fetch(`https://itunes.apple.com/search?media=audiobook&entity=audiobook&limit=10&country=${country}&term=${encodeURIComponent(term)}`, { signal:ac.signal });
    if(!r.ok) throw new Error('Apple ' + r.status); return (await r.json()).results || [];
  }finally{ clearTimeout(t); }
}
module.exports = async (req, res) => { try{ await main(req, res); }catch(e){ res.statusCode = 200; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ items:[], errors:{ fallo:e.message, stack:String(e.stack).slice(0, 600) } })); } };
async function main(req, res){
  if(/[?&]ping=1/.test(req.url)){ res.setHeader('content-type', 'application/json'); return res.end('{"ok":true}'); }
  const p = new URL(req.url, 'http://x').searchParams, t = (p.get('t') || '').slice(0, 200), es = (p.get('es') || '').slice(0, 200), a = (p.get('a') || '').slice(0, 120), diag = p.get('diag'), only = p.get('only') || '';
  res.setHeader('content-type', 'application/json; charset=utf-8'); res.setHeader('access-control-allow-origin', '*');
  if(!t){ res.statusCode = 400; return res.end('{"error":"t"}'); }
  const last = lastName(a), raw = {}, errors = {}, items = [];
  const titles = [t, es].filter(Boolean).map(norm);
  const sameBook = name => { const n = norm(name); return titles.some(x => x && (n.includes(x) || x.includes(n.split(' ').slice(0, 4).join(' ')))); };
  // Apple Books: tienda española con el título en español (si lo hay) y tienda de EE. UU. con el original
  const jobs = [['es', (es || t) + (last ? ' ' + last : '')], ['us', t + (last ? ' ' + last : '')]];
  const appleRes = {};
  const work = Promise.all([
    ...(only === 'hc' ? [] : jobs).map(async ([c, term]) => {
      try{
        const list = await apple(term, c); if(diag) raw['apple_' + c] = list;
        appleRes[c] = list;
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
            lang:/spanish|espanol|castellano/.test(lang) ? 'es' : /english|ingles/.test(lang) ? 'en' : lang ? 'otro' : (es && norm(e.title || '') === norm(es) ? 'es' : norm(e.title || '') === norm(t) && norm(es || '') !== norm(t) ? 'en' : ''), seconds:e.audio_seconds || 0,
            narrators:narr.slice(0, 4), publisher:pub, year:String(e.release_date || '').slice(0, 4), drama:DRAMA.test(text) });
        });
      }catch(e){ errors.hardcover = e.message; }
    })()
  ]);
  // Vercel corta a los 10 s: se responde con lo que haya a los 8,5 s
  let timer; await Promise.race([work, new Promise(r => { timer = setTimeout(() => { errors.tiempo = 'respuesta parcial'; r(); }, 6500); })]); clearTimeout(timer);
  // Apple: primero la tienda española (precios en euros), luego la de EE. UU.; un mismo audiolibro solo una vez
  ['es', 'us'].forEach(c => (appleRes[c] || []).filter(x => (!last || norm(x.artistName).includes(last)) && sameBook(x.collectionName || '')).forEach(x => {
    if(items.some(i => i.id === 'a' + x.collectionId)) return;
    const text = `${x.collectionName || ''} ${String(x.description || '').replace(/<[^>]+>/g, ' ')}`;
    items.push({ id:'a' + x.collectionId, src:'apple', store:'Apple Books', country:c, title:x.collectionName, author:x.artistName, url:x.collectionViewUrl,
      cover:x.artworkUrl100 || '', year:String(x.releaseDate || '').slice(0, 4), price:x.collectionPrice != null ? `${x.collectionPrice} ${x.currency || ''}`.trim() : '',
      lang:es && norm(x.collectionName).includes(norm(es)) && norm(es) !== norm(t) ? 'es' : guessLang(text), drama:DRAMA.test(text) });
  }));
  // Solo español e inglés (los de idioma desconocido de Hardcover, solo si no hay otros); primero español; Apple antes (tiene enlace de compra)
  const rank = i => (i.lang === 'es' ? 0 : i.lang === 'en' ? 1 : 2) * 2 + (i.src === 'apple' ? 0 : 1);
  const keep = items.filter(i => i.lang === 'es' || i.lang === 'en'), list = (keep.length ? keep : items.filter(i => !i.lang)).sort((x, y) => rank(x) - rank(y));
  const dup = new Set(); const seen = {}; const out = list.filter(i => { const d = [i.src, i.lang, i.seconds, (i.narrators || []).join()].join('|'); if(i.src === 'hardcover' && dup.has(d)) return false; dup.add(d); const k = i.src + i.lang; seen[k] = (seen[k] || 0) + 1; return seen[k] <= 2; });
  items.length = 0; items.push(...out);
  res.setHeader('cache-control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
  res.end(JSON.stringify(diag ? { items, errors, raw } : { items, errors:Object.keys(errors).length ? errors : undefined }));
}
