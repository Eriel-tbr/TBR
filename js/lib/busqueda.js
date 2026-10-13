'use strict';
/* Mi TBR — búsqueda en Google Books, Open Library y Wikidata */
/* ---------- Búsqueda en Google Books y Open Library ---------- */
const https = u => (u || '').replace(/^http:/, 'https:');
function stripHtml(h){
  if(!h) return '';
  const d = new DOMParser().parseFromString(String(h).replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n'), 'text/html');
  return d.body.textContent.replace(/\n{3,}/g, '\n\n').trim();
}
const yearOf = s => { const m = String(s || '').match(/\d{4}/); return m ? +m[0] : null; };
async function getJson(url, signal){
  const r = await fetch(url, { signal });
  if(!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
async function searchGoogle(q, signal, lang){
  const u = 'https://www.googleapis.com/books/v1/volumes?printType=books&maxResults=8&q=' + encodeURIComponent(q) + (lang ? '&langRestrict=' + lang : '');
  const j = await getJson(u, signal);
  return (j.items || []).map(it => {
    const v = it.volumeInfo || {}, im = v.imageLinks || {};
    let cover = https(im.thumbnail || im.smallThumbnail || '').replace('&edge=curl', '').replace('zoom=1', 'zoom=2');
    return { src:'g', title:v.title || '', author:(v.authors || []).join(', '), year:yearOf(v.publishedDate), pages:v.pageCount || 0,
      lang:v.language || '', covers:cover ? [cover] : [], subjects:v.categories || [], desc:stripHtml(v.description), descLang:v.language || '',
      seriesN:(v.seriesInfo && +v.seriesInfo.bookDisplayNumber) || 0 };
  }).filter(x => x.title);
}
async function searchOpenLib(q, signal){
  const u = 'https://openlibrary.org/search.json?limit=8&fields=key,title,author_name,first_publish_year,number_of_pages_median,language,cover_i,subject&q=' + encodeURIComponent(q);
  const j = await getJson(u, signal);
  return (j.docs || []).map(d => ({ src:'o', title:d.title || '', author:(d.author_name || []).slice(0, 2).join(', '), year:d.first_publish_year || null,
    pages:d.number_of_pages_median || 0, olLangs:d.language || [], covers:d.cover_i ? ['https://covers.openlibrary.org/b/id/' + d.cover_i + '-L.jpg'] : [],
    subjects:(d.subject || []).slice(0, 25) })).filter(x => x.title);
}
const bookKey = x => norm(x.title).replace(/[^a-z0-9]/g, '').slice(0, 24) + '|' + norm((x.author || '').split(',')[0]).split(' ').pop();
async function searchBooks(q, signal){
  // Tres búsquedas a la vez: Google (general y solo ediciones en español) y Open Library.
  const [g, ge, o] = await Promise.allSettled([searchGoogle(q, signal), searchGoogle(q, signal, 'es'), searchOpenLib(q, signal)]);
  if(signal.aborted) return null;
  const nq = norm(q), score = x => (norm(x.title).includes(nq) || nq.includes(norm(x.title)) ? 0 : 1);
  const gi = [...(g.status === 'fulfilled' ? g.value : []), ...(ge.status === 'fulfilled' ? ge.value : [])].sort((a, b) => score(a) - score(b)), oi = o.status === 'fulfilled' ? o.value : [];
  const map = new Map();
  for(const x of [...gi, ...oi]){
    const k = bookKey(x), cur = map.get(k);
    if(!cur){ map.set(k, { ...x }); continue; }
    cur.covers = [...new Set([...cur.covers, ...x.covers])];
    cur.subjects = [...new Set([...(cur.subjects || []), ...(x.subjects || [])])];
    cur.pages = cur.pages || x.pages; cur.year = x.year || cur.year;
    cur.desc = cur.desc || x.desc; cur.descLang = cur.descLang || x.descLang; cur.lang = cur.lang || x.lang;
    cur.olLangs = cur.olLangs || x.olLangs; cur.seriesN = cur.seriesN || x.seriesN;
  }
  return { items:[...map.values()].sort((a, b) => score(a) - score(b)).slice(0, 10), failed: g.status === 'rejected' && ge.status === 'rejected' && o.status === 'rejected' };
}
/* Completa un resultado: sinopsis en español si existe, idiomas de todas las ediciones, materias */
async function enrichBook(item, signal){
  const out = { ...item };
  const author = (item.author || '').split(',')[0];
  const tasks = [];
  if(!out.olLangs || !out.olLangs.length){
    tasks.push(searchOpenLib(item.title + ' ' + author, signal).then(list => {
      const m = list.find(x => bookKey(x) === bookKey(item)) || list[0];
      if(m){ out.olLangs = m.olLangs; out.subjects = [...new Set([...(out.subjects || []), ...(m.subjects || [])])]; out.year = m.year || out.year; out.pages = out.pages || m.pages; out.covers = [...new Set([...(out.covers || []), ...m.covers])]; }
    }).catch(() => {}));
  }
  if(!out.desc || out.descLang !== 'es'){
    tasks.push(searchGoogle('intitle:' + item.title + (author ? ' inauthor:' + author : ''), signal, 'es').then(list => {
      const m = list.find(x => x.desc && bookKey(x) === bookKey(item)) || list.find(x => x.desc && norm(x.title) === norm(item.title));
      if(m){ out.desc = m.desc; out.descLang = 'es'; if(!out.covers.length) out.covers = m.covers; out.pages = out.pages || m.pages; }
    }).catch(() => {}));
  }
  tasks.push(wikidataInfo(item.title, author, signal).then(w => { if(w) out.wd = w; }).catch(() => {}));
  await Promise.all(tasks);
  // Con el título en español de Wikidata se busca la edición española (sinopsis e idioma)
  if(out.wd && out.wd.esTitle && (out.descLang !== 'es' || !out.esFound)){
    try{
      const list = await searchGoogle('intitle:' + out.wd.esTitle + (author ? ' inauthor:' + author : ''), signal, 'es');
      const m = list.find(x => x.lang === 'es' && (!author || norm(x.author).includes(norm(author).split(' ').pop())));
      if(m){ out.esFound = true; if(m.desc){ out.desc = m.desc; out.descLang = 'es'; } }
    }catch(e){}
  }
  return out;
}
/* Wikidata: serie, número dentro de la serie, total y si existe en español o inglés */
async function wikidataInfo(title, author, signal){
  const api = 'https://www.wikidata.org/w/api.php?format=json&origin=*&';
  const clean = String(title || '').replace(/\s*[(:].*$/, '').trim(); if(!clean) return null;
  const last = norm(author || '').split(' ').pop();
  const searches = await Promise.all(['es', 'en'].map(l => getJson(api + 'action=wbsearchentities&type=item&limit=7&language=' + l + '&uselang=' + l + '&search=' + encodeURIComponent(clean), signal).catch(() => ({}))));
  const cands = []; const seen = new Set();
  searches.forEach(s => (s.search || []).forEach(r => { if(seen.has(r.id)) return; seen.add(r.id); const d = norm(r.description || '');
    const bookish = /novel|novela|book|libro|saga|trilog|fantasy|fantasia|romance/.test(d), byAuthor = last && d.includes(last);
    if(byAuthor || (!last && bookish)) cands.push({ id:r.id, byAuthor, bookish }); }));
  if(!cands.length) return null;
  cands.sort((a, b) => (b.byAuthor - a.byAuthor) || (b.bookish - a.bookish));
  const ids = cands.slice(0, 4).map(c => c.id);
  const ent = (await getJson(api + 'action=wbgetentities&props=claims|sitelinks|labels&languages=es|en&ids=' + ids.join('|'), signal)).entities || {};
  const e = ids.map(i => ent[i]).find(x => x && x.claims && x.claims.P50) || ent[ids[0]]; if(!e) return null;
  const val = (c) => c && c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value;
  const out = { id:e.id, es:!!(e.sitelinks && e.sitelinks.eswiki), en:!!(e.sitelinks && e.sitelinks.enwiki),
    esTitle:e.labels && e.labels.es ? e.labels.es.value : '', enTitle:e.labels && e.labels.en ? e.labels.en.value : '' };
  const langs = (e.claims.P407 || []).map(c => (val(c) || {}).id);
  if(langs.includes('Q1321')) out.es = true; if(langs.includes('Q1860')) out.en = true;
  const sc = (e.claims.P179 || [])[0];
  if(sc && val(sc)){
    const sid = val(sc).id, q = sc.qualifiers && sc.qualifiers.P1545, n = q && q[0] && q[0].datavalue ? parseInt(q[0].datavalue.value, 10) : 0;
    const se = ((await getJson(api + 'action=wbgetentities&props=claims|labels&languages=es|en&ids=' + sid, signal)).entities || {})[sid];
    if(se){
      const name = (se.labels.es || se.labels.en || {}).value || '';
      const parts = (se.claims && se.claims.P527 || []).length, qty = val((se.claims && se.claims.P1114 || [])[0]);
      const total = parts || (qty && parseInt(qty.amount, 10)) || 0;
      if(name) out.series = { name, n:n || '', total:total || '' };
    }
  }
  return out;
}
function detectLangs(item){
  const set = new Set();
  if(item.wd){ if(item.wd.es) set.add('es'); if(item.wd.en) set.add('en'); }
  if(item.esFound) set.add('es');
  for(const l of item.olLangs || []){ if(l === 'spa') set.add('es'); if(l === 'eng') set.add('en'); }
  if(item.lang === 'es') set.add('es'); if(item.lang === 'en') set.add('en');
  return [...set];
}
