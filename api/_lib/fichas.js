/* Lectura de fichas de libros (servidor). Sin dependencias: HTML → datos con expresiones regulares tolerantes. */
const UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Mobile Safari/537.36 MiTBR/1.0 (app personal)';
const ENT = { amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ', laquo:'«', raquo:'»', hellip:'…', mdash:'—', ndash:'–', iexcl:'¡', iquest:'¿', rsquo:'’', lsquo:'‘', ldquo:'“', rdquo:'”' };
const decode = s => String(s || '').replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e.toLowerCase()] ?? (/^[a-z]acute$|^[a-z]tilde$|^[a-z]uml$/i.test(e) ? decodeLetter(e) : m)));
function decodeLetter(e){ const map = { acute:'́', tilde:'̃', uml:'̈' }; const k = e.slice(1); return (e[0] + (map[k] || '')).normalize('NFC'); }
const text = h => decode(String(h || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').replace(/^[ \t]+|[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
async function get(url, ms = 7000){
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms);
  try{ const r = await fetch(url, { headers:{ 'user-agent':UA, 'accept-language':'es-ES,es;q=0.9' }, redirect:'follow', signal:ac.signal }); return { status:r.status, url:r.url, html:r.ok ? await r.text() : '' }; }
  finally{ clearTimeout(t); }
}
function jsonLd(html){
  const out = [];
  for(const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)){
    try{ const j = JSON.parse(m[1].trim()); (Array.isArray(j) ? j : j['@graph'] || [j]).forEach(x => out.push(x)); }catch(e){}
  }
  return out;
}
const meta = (html, prop) => { const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i')) || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, 'i')); return m ? decode(m[1]) : ''; };
function pairs(html){
  const o = {};
  for(const m of html.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi)) o[text(m[1]).replace(/[\s:]+$/, '').replace(/\s+/g, ' ').toLowerCase()] = text(m[2]);
  return o;
}
/* Formato normalizado para la app: blanda, dura, bolsillo, especial, ebook, audio */
function fmtOf(s, title){
  const t = (String(s || '') + ' ' + String(title || '')).toLowerCase();
  if(/edici[oó]n especial|limitada|coleccionista|deluxe|ilustrad/.test(t)) return 'especial';
  if(/audio/.test(t)) return 'audio';
  if(/ebook|epub|digital|kindle|e-book/.test(t)) return 'ebook';
  if(/bolsillo|pocket|booket/.test(t)) return 'bolsillo';
  if(/dura|carton|cartoné|hardcover|tela/.test(t)) return 'dura';
  if(/blanda|r[uú]stica|paperback|solapa/.test(t)) return 'blanda';
  return '';
}
/* Contenido de un elemento con un id/clase dado, respetando los <div> anidados */
function inner(html, re){
  const m = html.match(re); if(!m) return '';
  const tag = (m[0].match(/^<(\w+)/) || [, 'div'])[1].toLowerCase(), start = m.index + m[0].length;
  const rx = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi'); rx.lastIndex = start; let depth = 1, k;
  while((k = rx.exec(html))){ depth += k[1] ? -1 : 1; if(!depth) return html.slice(start, k.index); }
  return html.slice(start, start + 6000);
}
module.exports = { inner, UA, get, jsonLd, meta, pairs, text, decode, fmtOf };
