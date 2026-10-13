// Temporal: mide la cobertura de la cadena Google/Open Library → ISBN español → ficha. Se borrará.
const { get } = require('./_lib/fichas');
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const BOOKS = [['A Court of Thorns and Roses','Maas','Una corte de rosas y espinas'],['Throne of Glass','Maas','Trono de cristal'],['Piranesi','Clarke','Piranesi'],['Fourth Wing','Yarros','Alas de sangre'],
 ['The Name of the Wind','Rothfuss','El nombre del viento'],['Mexican Gothic','Moreno-Garcia','Gótico'],['The Cruel Prince','Black','El príncipe cruel'],['The Song of Achilles','Miller','La canción de Aquiles'],
 ['From Blood and Ash','Armentrout','De sangre y cenizas'],['Six of Crows','Bardugo','Seis de cuervos'],['The Invisible Life of Addie LaRue','Schwab','La vida invisible de Addie LaRue'],['Babel','Kuang','Babel'],
 ['Divine Rivals','Ross','Rivales divinos'],['The Serpent and the Wings of Night','Broadbent','La serpiente y las alas de la noche'],['Quicksilver','Fortune',''],['The Ashes and the Star-Cursed King','Broadbent','']];
const status = {}; async function j(u){ const r = await fetch(u); status[new URL(u).hostname + ' ' + r.status] = (status[new URL(u).hostname + ' ' + r.status] || 0) + 1; return r.ok ? r.json() : {}; }
module.exports = async (req, res) => {
  const out = []; const sp = new URL(req.url, 'http://x').searchParams, from = +sp.get('from') || 0, n = +sp.get('n') || 4;
  try{ await Promise.all(BOOKS.slice(from, from + n).map(async ([en, last, es], i) => {
    const row = { en, es, isbns:[], fichas:0, sinopsis:0, editoriales:[], formatos:[] };
    const qs = [en, es].filter(Boolean).map(t => `https://www.googleapis.com/books/v1/volumes?printType=books&maxResults=8&langRestrict=es&q=${encodeURIComponent('intitle:' + t + ' inauthor:' + last)}`);
    for(const q of qs){ const g = await j(q); (g.items || []).forEach(it => { const v = it.volumeInfo || {}; if(v.language !== 'es' || !norm((v.authors || []).join()).includes(norm(last))) return;
      const i13 = ((v.industryIdentifiers || []).find(x => x.type === 'ISBN_13') || {}).identifier; if(i13) row.isbns.push(i13); }); }
    const ol = await j(`https://openlibrary.org/search.json?limit=3&fields=key&q=${encodeURIComponent(en + ' ' + last)}`);
    const key = ((ol.docs || [])[0] || {}).key;
    if(key){ const e = await j(`https://openlibrary.org${key}/editions.json?limit=60`); (e.entries || []).filter(x => (x.languages || []).some(l => l.key === '/languages/spa')).forEach(x => (x.isbn_13 || []).forEach(i => row.isbns.push('OL' + i))); }
    row.isbns = [...new Set(row.isbns)];
    const plain = [...new Set(row.isbns.map(x => x.replace('OL', '')))].sort((a, b) => /^(97884|97913)/.test(b) - /^(97884|97913)/.test(a)).slice(0, 6);
    row.google = row.isbns.filter(x => !x.startsWith('OL')).length; row.ol = row.isbns.filter(x => x.startsWith('OL')).length;
    const base = 'https://' + req.headers.host + '/api/edicion?isbn=' + plain.join(',');
    if(plain.length){ const d = await j(base); (d.eds || []).forEach(e => { if(!e.ok) return; row.fichas++; if((e.synopsis || '').length > 60) row.sinopsis++; row.editoriales.push(e.publisher); row.formatos.push(e.fmt || e.binding); }); }
    row.editoriales = [...new Set(row.editoriales)]; row.formatos = [...new Set(row.formatos)]; delete row.isbns; out[i] = row;
  })); }catch(e){ out.push({ error:String(e) }); }
  res.setHeader('content-type', 'application/json; charset=utf-8'); res.end(JSON.stringify({ out, status }, null, 1));
};
module.exports.config = { maxDuration:60 };
