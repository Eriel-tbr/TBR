/* Llamadas a Hardcover (GraphQL) desde el servidor. El token va en HARDCOVER_TOKEN (variable de Vercel). */
const UA = 'MiTBR/1.0 (app personal de lista de lecturas)';
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const lastName = a => norm(String(a || '').split(',')[0]).split(' ').pop() || '';
async function gql(query, variables, ms = 6500){
  const tok = (process.env.HARDCOVER_TOKEN || '').replace(/^Bearer\s+/i, '');
  if(!tok) throw new Error('Falta HARDCOVER_TOKEN');
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms);
  try{
    const r = await fetch('https://api.hardcover.app/v1/graphql', { method:'POST', signal:ac.signal,
      headers:{ 'content-type':'application/json', authorization:'Bearer ' + tok, 'user-agent':UA }, body:JSON.stringify({ query, variables }) });
    const j = await r.json().catch(() => ({}));
    if(!r.ok || j.errors) throw new Error((j.errors && j.errors[0] && j.errors[0].message) || 'HTTP ' + r.status);
    return j.data || {};
  }finally{ clearTimeout(t); }
}
/* Búsqueda de Hardcover (Typesense por debajo): devuelve los documentos tal cual */
async function search(q, type = 'Book', per = 10){
  const d = await gql(`query S($q: String!, $t: String!, $n: Int!) { search(query: $q, query_type: $t, per_page: $n, page: 1) { results } }`, { q, t:type, n:per });
  return ((((d.search || {}).results || {}).hits) || []).map(h => h.document || {});
}
/* El libro de Hardcover que corresponde a un título y autor (o null) */
async function findBook(title, author){
  const last = lastName(author), docs = await search(title + (last ? ' ' + last : ''), 'Book', 10);
  const ok = d => !last || (d.author_names || []).some(n => norm(n).includes(last));
  const nt = norm(title);
  // Coincidencia de título (también con sus títulos traducidos) y, a igualdad, el más leído:
  // así «Juego de tronos» da la novela y no un cómic con el mismo título
  const tm = d => Math.max(...[d.title, ...(d.alternative_titles || [])].map(x => { const n = norm(x); return n === nt ? 3 : n && (n.includes(nt) || nt.includes(n)) ? 2 : 0; }));
  const cands = docs.filter(ok).map(d => ({ d, s:tm(d) * 1e6 + Math.min(+(d.users_count || 0), 999999) - (/graphic novel|comic|c[oó]mic|manga/i.test(d.title || '') ? 2e6 : 0) }));
  cands.sort((x, y) => y.s - x.s);
  return cands.length ? cands[0].d : null;
}
module.exports = { gql, search, findBook, norm, lastName };
