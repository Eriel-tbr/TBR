// Temporal: para estudiar la estructura de las fichas. Se borrará.
module.exports = async (req, res) => {
  const u = new URL(req.url, 'http://x'); const url = u.searchParams.get('url') || ''; const keys = (u.searchParams.get('k') || '').split('|').filter(Boolean);
  if(!/^https:\/\/www\.(todostuslibros\.com|planetadelibros\.com|penguinlibros\.com)\//.test(url)) return res.status(400).json({ error:'url' });
  const r = await fetch(url, { headers:{ 'user-agent':'Mozilla/5.0 (Linux; Android 14) MiTBR/1.0 (uso personal)', 'accept-language':'es-ES' }, redirect:'follow' });
  const html = await r.text(); const out = { status:r.status, final:r.url, len:html.length, snippets:{} };
  for(const k of keys){ const arr = []; let i = -1; while((i = html.indexOf(k, i + 1)) >= 0 && arr.length < 3) arr.push(html.slice(Math.max(0, i - 150), i + 350).replace(/\s+/g, ' ')); out.snippets[k] = arr; }
  out.ld = (html.match(/<script[^>]+ld\+json[^>]*>[\s\S]*?<\/script>/g) || []).map(s => s.slice(0, 1500));
  res.setHeader('content-type', 'application/json; charset=utf-8'); res.end(JSON.stringify(out, null, 1));
};
