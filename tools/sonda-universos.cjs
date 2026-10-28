// PRUEBA TEMPORAL: ¿qué saben Wikidata e ISFDB de universos y sagas?
const SEEDS = ['The Final Empire','Shadow and Bone','Six of Crows','Fourth Wing','A Court of Thorns and Roses','Throne of Glass','The Cruel Prince','From Blood and Ash','The Name of the Wind','Iron Flame'];
const UA = 'MiTBR-sonda/1.0 (app personal; github.com/Eriel-tbr)';
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function wd(q){ const r = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q), { headers:{ 'user-agent':UA, accept:'application/sparql-results+json' } }); const j = await r.json(); return j.results.bindings.map(b => Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.value.replace('http://www.wikidata.org/entity/', '')]))); }
(async () => {
  const out = { wikidata:{}, isfdb:{} };
  for(const t of SEEDS){
    try{
      const rows = await wd(`SELECT DISTINCT ?book ?series ?seriesLabel ?ord ?parent ?parentLabel ?uni ?uniLabel WHERE {
        ?book rdfs:label "${t}"@en; wdt:P31/wdt:P279* wd:Q7725634 .
        OPTIONAL { ?book p:P179 ?st . ?st ps:P179 ?series . OPTIONAL { ?st pq:P1545 ?ord } OPTIONAL { ?series wdt:P179|wdt:P361 ?parent } }
        OPTIONAL { { ?book wdt:P1434 ?uni } UNION { ?series wdt:P1434 ?uni } }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". } } LIMIT 20`);
      out.wikidata[t] = rows;
      for(const u of [...new Set(rows.map(r => r.uni || r.parent).filter(Boolean))]){
        out.wikidata['universo ' + u] = await wd(`SELECT ?w ?wLabel ?sLabel ?ord WHERE { { ?w wdt:P1434 wd:${u} } UNION { ?w wdt:P179/wdt:P179 wd:${u} } UNION { ?w wdt:P179/wdt:P361 wd:${u} } UNION { ?w wdt:P179 wd:${u} } ?w wdt:P31/wdt:P279* wd:Q7725634 . OPTIONAL { ?w p:P179 ?x . ?x ps:P179 ?s . OPTIONAL { ?x pq:P1545 ?ord } } SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". } } LIMIT 80`);
      }
    }catch(e){ out.wikidata[t] = 'ERROR ' + e.message; }
  }
  try{ const r = await fetch('https://www.isfdb.org/robots.txt', { headers:{ 'user-agent':UA } }); out.isfdb.robots = (await r.text()).slice(0, 1500); }catch(e){ out.isfdb.robots = 'ERROR ' + e.message; }
  for(const s of ['Cosmere','Grishaverse','Empyrean','A Court of Thorns and Roses']){
    try{ const r = await fetch('https://www.isfdb.org/cgi-bin/se.cgi?type=Series&arg=' + encodeURIComponent(s), { headers:{ 'user-agent':UA }, redirect:'follow' });
      const h = await r.text(); out.isfdb[s] = { status:r.status, url:r.url, text:strip(h).slice(0, 3000) }; }catch(e){ out.isfdb[s] = 'ERROR ' + e.message; }
    await new Promise(r => setTimeout(r, 1500));
  }
  require('fs').writeFileSync('sonda-universos.json', JSON.stringify(out, null, 1));
})();
