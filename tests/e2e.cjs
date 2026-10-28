/* Pruebas de extremo a extremo de Mi TBR.
   Abren la app en un Chrome con tamaño de móvil, con Google Books, Open Library y Wikidata simulados.
   Uso: npm test   (o: node tests/e2e.cjs) */
const http = require('http'), fs = require('fs'), path = require('path');
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = '1'; // que las respuestas simuladas valgan también para el service worker
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.webmanifest':'application/manifest+json' };
let versionOverride = null;
const isHexT = c => /^#[0-9a-f]{6}$/i.test(c || '');
const server = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if(p.endsWith('/')) p += 'index.html';
  if(p === '/version.json' && versionOverride){ r.writeHead(200, { 'content-type':'application/json' }); return r.end(JSON.stringify({ version:versionOverride })); }
  const f = path.join(ROOT, p); if(!f.startsWith(ROOT) || !fs.existsSync(f)){ r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type':TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});

/* ---- respuestas simuladas de las APIs ---- */
const GB = es => ({ items:[{ volumeInfo:{ title:es ? 'El rey malvado' : 'The Wicked King', authors:['Holly Black'], language:es ? 'es' : 'en', pageCount:336, publishedDate:'2019-01-08',
  description:es ? 'Sinopsis en español.' : 'English blurb.', seriesInfo:{ bookDisplayNumber:'2' }, imageLinks:{},
  industryIdentifiers:es ? [{ type:'ISBN_13', identifier:'9788417390624' }] : [{ type:'ISBN_13', identifier:'9781471407352' }] } }] });
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVR42mNkYPhfz8DAwMDIwMDAAAAiiwKBVcdhGQAAAABJRU5ErkJggg==', 'base64');
function fakeOwnApi(route){
  const u = new URL(route.request().url());
  if(u.pathname === '/api/edicion') return route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ eds:u.searchParams.get('isbn').split(',').map(isbn => ({ isbn, ok:true,
    url:'https://www.todostuslibros.com/libros/x_' + isbn, title:'El rey malvado', author:'Holly Black', publisher:'Editorial Hidra', binding:'Cartoné', fmt:'dura', lang:'Castellano', pages:336, year:'2019',
    synopsis:'Sinopsis oficial en español de la editorial, bastante más larga que la de Google Books para que se elija.' })) }) });
  if(u.pathname === '/api/buscar'){ if(googleDown) return route.fulfill({ status:429, contentType:'application/json', body:'{}' });
    return route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify(GB(u.searchParams.get('langRestrict') === 'es')) }); }
  if(u.pathname === '/api/hardcover') return googleDown ? route.fulfill({ status:503, body:'{}' }) : route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ items:[{ title:'Quicksilver', author:'Callie Hart', year:2024, pages:610, cover:'',
    desc:'Fae romantasy.', series:{ name:'Fae & Alchemy', n:1, total:3 }, genres:['Fantasy', 'Romance'], altTitles:['Quicksilver', 'Mercurio'] }] }) });
  if(u.pathname === '/api/b2d') return route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ items:/quicksilver/i.test(u.searchParams.get('q')) ? [
    { title:'Quicksilver', full:'Quicksilver by Callie Hart - Special Edition Sprayed Edges', price:'£22.00', available:true, publisher:'Hodder', url:'https://www.books2door.com/products/qs', isbn:'', fmt:'especial', author:'Callie Hart' },
    { title:'Quicksilver', full:'Quicksilver by Callie Hart', price:'£9.99', available:true, publisher:'Hodder', url:'https://www.books2door.com/products/9781399741',  isbn:'', fmt:'', author:'Callie Hart' }] : [] }) });
  if(u.pathname === '/api/audio') return new Promise(r => setTimeout(r, audioDelay)).then(() => route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ items:[
    { id:'uB1', src:'audible', store:'Audible', title:'El rey malvado (Versión dramatizada)', lang:'es', url:'https://www.audible.es/pd/B1', seconds:30000, narrators:['Carla López'], publisher:'BookaVivo', year:'2026', drama:true, dramaSure:true },
    { id:'a1', src:'apple', store:'Apple Books', country:'es', title:'El rey malvado', lang:'es', url:'https://books.apple.com/x', price:'18.99 EUR' },
    { id:'h1', src:'hardcover', store:'Hardcover', title:'The Wicked King', lang:'en', seconds:36000, narrators:['Caitlin Kelly'], drama:true }] }) }));
  if(u.pathname === '/api/serie') return route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ name:'The Folk of the Air', total:4, url:'https://hardcover.app/series/x',
    books:[{ n:1, main:true, title:'The Cruel Prince', year:2018 }, { n:2, main:true, title:'The Wicked King', year:2019 }, { n:3, main:true, title:'The Queen of Nothing', year:2019 }, { n:3.5, main:false, title:'How the King of Elfhame Learned to Hate Stories', year:2020 }, { n:4, main:true, title:'The Stolen Heir', year:2023, pages:350 }] }) });
  if(u.pathname === '/api/ediciones'){ const t = u.searchParams.get('t') || '';
    if(!/wicked|rey malvado/i.test(t)) return route.fulfill({ status:404, contentType:'application/json', body:'{"error":"libro no encontrado"}' });
    return route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ book:{ id:7, title:'The Wicked King', year:2019, pages:336, desc:'English blurb from Hardcover.', cover:'', series:{ name:'The Folk of the Air', n:2, total:3 } },
      es:[{ title:'El rey malvado', isbn:'9788417390624', publisher:'Hidra', pages:352, year:'2019', cover:'https://example.com/rey.jpg', format:'Hardcover', users:9 }], en:[{ title:'The Wicked King', isbn:'9781471407352', publisher:'Hot Key', pages:336, year:'2019', users:90 }] }) }); }
  if(u.pathname === '/api/portada') return route.fulfill({ status:200, contentType:'image/png', headers:{ 'access-control-allow-origin':'*' }, body:PNG });
  return route.fulfill({ status:404, body:'' });
}
let googleDown = false, audioDelay = 0;
function fakeApis(route){
  const u = route.request().url(), json = b => route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify(b) });
  if(u.includes('googleapis.com/books')) return googleDown ? route.fulfill({ status:429, body:'{}' }) : json(GB(u.includes('langRestrict=es')));
  if(u.includes('openlibrary.org/search')) return json({ docs:googleDown ? [{ key:'/works/OL1W', title:'The Wicked King', author_name:['Holly Black'], first_publish_year:2019, language:['eng','spa'] }] : [] });
  if(u.includes('wikidata.org')){
    if(u.includes('wbsearchentities')) return json({ search:[{ id:'Q1', description:'novel by Holly Black' }] });
    if(u.includes('ids=Q1')) return json({ entities:{ Q1:{ id:'Q1', labels:{ es:{ value:'El rey malvado' }, en:{ value:'The Wicked King' } }, sitelinks:{ eswiki:{}, enwiki:{} },
      claims:{ P50:[{}], P179:[{ mainsnak:{ datavalue:{ value:{ id:'Q9' } } }, qualifiers:{ P1545:[{ datavalue:{ value:'2' } }] } }] } } } });
    if(u.includes('ids=Q9')) return json({ entities:{ Q9:{ labels:{ es:{ value:'Los habitantes del aire' } }, claims:{ P527:[{}, {}, {}] } } } });
  }
  return route.abort();
}

/* Las pruebas cierran formularios con cambios a propósito: el aviso «¿Descartar los cambios?» se acepta solo,
   salvo en la prueba que lo comprueba (window.__keepAsk = true) */
const AUTO_DISCARD = () => { new MutationObserver(() => { if(window.__keepAsk) return; const b = document.querySelector('.ask-sheet [data-do="discard"]'); if(b && !b.dataset.auto){ b.dataset.auto = '1'; setTimeout(() => b.click(), 0); } })
  .observe(document, { childList:true, subtree:true }); };
/* ---- nube simulada ---- */
const MOCK_SB = fs.readFileSync(path.join(__dirname, 'mock-supabase.js'), 'utf8');
const db = { row:null, files:[], backups:[] };
function mockDb(src, op, arg){
  const clone = x => JSON.parse(JSON.stringify(x));
  if(op === 'get') return db.row && clone(db.row);
  if(op === 'insert'){ if(db.row) return { code:'23505' }; db.row = clone(arg); return null; }
  if(op === 'update'){ if(!db.row || db.row.rev !== arg.expect) return []; db.row = { ...db.row, data:clone(arg.data), rev:arg.rev }; return [{ rev:arg.rev }]; }
  if(op === 'upload'){ db.files.push(arg); return null; }
  if(op === 'backups') return db.backups.map(x => ({ id:x.id, created_at:x.created_at })).reverse();
  if(op === 'backup'){ const x = db.backups.find(y => y.id === arg); return x && clone(x); }
}
async function newDevice(browser, { cdn = true } = {}){
  const c = await browser.newContext({ viewport:{ width:390, height:844 }, deviceScaleFactor:2, serviceWorkers:'block' });
  await c.route(u => /googleapis|openlibrary|wikidata|gstatic/.test(u.href), fakeApis);
  await c.route(u => u.hostname === 'cdn.jsdelivr.net', r => cdn ? r.fulfill({ status:200, contentType:'text/javascript', headers:{ 'access-control-allow-origin':'*' }, body:MOCK_SB }) : r.abort());
  await c.route(u => u.pathname.startsWith('/api/'), fakeOwnApi);
  await c.exposeBinding('mockDb', mockDb); await c.addInitScript(AUTO_DISCARD);
  const p = await c.newPage(); p.on('pageerror', e => errors.push(e.message)); return { c, p };
}
const dbTitles = () => db.row ? db.row.data.books.map(b => b.title) : [];
async function until(fn, ms = 8000, msg = 'tiempo agotado'){ const t0 = Date.now(); while(Date.now() - t0 < ms){ if(await fn()) return; await new Promise(r => setTimeout(r, 150)); } throw new Error(msg); }

const results = []; let page, ctx, errors = [];
async function test(name, fn){
  try{ await fn(); results.push(['ok', name]); console.log('  ✓ ' + name); }
  catch(e){ if(process.env.DBG){ try{ await page.screenshot({ path:process.env.DBG + '/fail-' + results.length + '.png' }); }catch(x){} } results.push(['FALLO', name, e.message]); console.log('  ✗ ' + name + '\n      ' + e.message.split('\n')[0] + (process.env.DBG ? ' ' + errors.join(' | ') : '')); }
}
const assert = (c, m) => { if(!c) throw new Error(m); };
const ev = (f, ...a) => page.evaluate(f, ...a);
/* La app usa pestañas y secciones plegables: estas ayudas abren la pestaña o despliegan todo antes de tocar */
const tab = k => page.click(`.sheet .tabbar [data-tab="${k}"] >> nth=-1`);
const unfold = () => ev(() => document.querySelectorAll('.sheet details').forEach(d => d.open = true));
/* Añadir: el buscador está en una hoja que se abre con el botón grande de la barra de abajo */
const addSheet = async (pg = page) => { if(!await pg.locator('.sheet .addbar').count()){ await pg.click('#navAdd'); await pg.waitForSelector('.sheet .addbar'); } };
/* Ediciones encontradas (ya no se ven en la ficha): se miran en los datos del formulario abierto */
const draftHas = (k, ms = 8000) => page.waitForFunction(k => { const s = [...document.querySelectorAll('.sheet')].pop(); return s && s.draft && (s.draft[k] || []).length; }, k, { timeout:ms });
const draft = () => ev(() => { const d = [...document.querySelectorAll('.sheet')].pop().draft; return { eds:JSON.stringify(d.eds || []), edsEn:JSON.stringify(d.edsEn || []), av:edAvail(d) }; });

(async () => {
  await new Promise(r => server.listen(0, r)); const BASE = `http://localhost:${server.address().port}/`;
  const browser = await chromium.launch();
  ctx = await browser.newContext({ viewport:{ width:390, height:844 }, deviceScaleFactor:2, hasTouch:false, serviceWorkers:'allow' });
  await ctx.route(u => /googleapis|openlibrary|wikidata|gstatic/.test(u.href), fakeApis);
  await ctx.route(u => u.pathname.startsWith('/api/'), fakeOwnApi);
  await ctx.route(u => u.hostname === 'cdn.jsdelivr.net', r => r.fulfill({ status:200, contentType:'text/javascript', headers:{ 'access-control-allow-origin':'*' }, body:MOCK_SB }));
  await ctx.exposeBinding('mockDb', mockDb); await ctx.addInitScript(AUTO_DISCARD);
  page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  console.log('Mi TBR — pruebas');

  await test('carga sin errores y dibuja las 6 estanterías', async () => {
    await page.goto(BASE); await page.waitForSelector('.slide .bk');
    assert(await page.locator('.slide').count() === 6, 'no hay 6 estanterías'); assert(!errors.length, 'errores: ' + errors.join(' | '));
  });
  await test('cada mueble tiene su estilo', async () => {
    const cls = await ev(() => [...document.querySelectorAll('.mueble')].map(m => m.classList[1]));
    for(const c of ['t-got', 't-roc', 't-chip', 't-aca', 't-con', 't-rmc']) assert(cls.includes(c), 'falta ' + c);
  });
  await test('los títulos de los lomos caben en su caja', async () => {
    const bad = await ev(() => [...document.querySelectorAll('.tt')].filter(t => t.getBoundingClientRect().height > t.parentElement.getBoundingClientRect().height + 2).map(t => t.textContent));
    assert(!bad.length, 'se salen: ' + bad.join(', '));
  });
  await test('las baldas de todos los muebles están a la misma altura', async () => {
    // Remates de la misma altura (el gótico pisa la primera balda con sus arcos) y bases iguales y del mismo ancho que el mueble
    const r = await ev(() => state.units.map((u, i) => { goTo(i); const s = document.querySelector(`.slide[data-i="${i}"]`), m = s.querySelector('.mueble').getBoundingClientRect(), b = s.querySelector('.body').getBoundingClientRect(), base = s.querySelector('.base').getBoundingClientRect();
      return [Math.round(b.top - m.top), Math.round(base.height), Math.round(base.width - m.width)]; }));
    await ev(() => goTo(0));
    const col = k => r.map(x => x[k]);
    assert(Math.max(...col(0)) - Math.min(...col(0)) <= 1 && Math.max(...col(1)) - Math.min(...col(1)) <= 1 && col(2).every(x => Math.abs(x) <= 1), JSON.stringify(r));
  });
  await test('contemporánea es también la estantería de thriller (y se migra)', async () => {
    const r = await ev(() => { const u = state.units.find(x => x.preset === 'contemporanea'); const old = { v:1, settings:{ theme:'auto' }, units:[{ id:'c', name:'Contemporánea', preset:'contemporanea', shelves:[mkShelf('General')] }], books:[] };
      const m = migrate(old); return { name:u.name, shelves:u.shelves.map(s => s.name), mig:m.units[0].name + '|' + m.units[0].shelves.map(s => s.name).join('/'), sug:JSON.stringify(suggestShelf(state, ['thriller'])) === JSON.stringify({ unitId:u.id, shelfId:u.shelves[1].id }) }; });
    assert(r.name === 'Contemporánea y thriller' && r.mig === 'Contemporánea y thriller|General/Thriller y misterio' && r.sug, JSON.stringify(r));
  });
  await test('colores elegidos a mano antes del ajuste se respetan; los de paleta no', async () => {
    const r = await ev(() => { const s = migrate({ v:1, settings:{ migThriller:1 }, units:[], books:[{ spine:{ base:'#ffe699', foil:'#ffffff', accent:'#000000' } }, { spine:{ base:'#5b1f2b', foil:'#d9b25f', accent:'#2a0c12' } }] }); return s.books.map(b => b.spine.adjust); });
    assert(r[0] === false && r[1] === undefined, JSON.stringify(r));
  });
  await test('una trilogía va junta, en orden y con números I II III', async () => {
    const nums = await ev(() => { const ids = state.books.filter(b => b.series && b.series.name === 'The Folk of the Air').map(b => b.id);
      return [...document.querySelectorAll('.it[data-id]')].filter(i => ids.includes(i.dataset.id)).map(i => (i.querySelector('.nm') || {}).textContent); });
    assert(nums.join(',') === 'I,II,III', 'números: ' + nums);
  });
  await test('ficha: empezar a leer se guarda tras recargar', async () => {
    await page.locator('.slide[data-i="0"] button.bk').first().click(); await page.waitForSelector('.sheet');
    const id = await ev(() => document.querySelector('.slide[data-i="0"] button.bk').dataset.id);
    const btn = page.locator('[data-do="start"]'); if(await btn.count()) await btn.click(); else await page.locator('[data-do="pending"]').click();
    await page.waitForTimeout(300); await page.reload(); await page.waitForSelector('.slide .bk');
    const st = await ev(id => JSON.parse(localStorage.getItem('tbr.v1')).books.find(b => b.id === id).status, id);
    assert(st === 'leyendo' || st === 'pendiente', 'estado: ' + st);
  });
  await test('buscar un libro rellena serie, idiomas y sinopsis en español', async () => {
    await addSheet(); await page.fill('#addInput', 'El rey malvado'); await page.waitForSelector('#suggest [data-pick="0"]');
    await page.click('#suggest [data-pick="0"]'); await page.waitForFunction(() => document.querySelector('#f-sname') && document.querySelector('#f-sname').value);
    await page.waitForTimeout(500);
    const r = await ev(() => ({ s:document.querySelector('#f-sname').value, n:document.querySelector('#f-sn').value, t:document.querySelector('#f-st').value,
      l:[...document.querySelectorAll('#flangs [aria-pressed="true"]')].map(e => e.dataset.lang).sort().join(','), syn:document.querySelector('#f-syn').value }));
    assert(r.n === '2' && r.t === '3', 'serie ' + JSON.stringify(r)); assert(r.l === 'en,es', 'idiomas ' + r.l); assert(r.syn.includes('español'), 'sinopsis ' + r.syn);
  });
  await test('encuentra la edición española: editorial, formato y sinopsis oficial', async () => {
    await draftHas('eds', 5000); const dd = await draft();
    const r = await ev(() => ({ syn:document.querySelector('#f-syn').value, src:document.querySelector('#f-synsrc').textContent }));
    assert(/Hidra/.test(dd.eds) && dd.av.dura === 'ES', JSON.stringify(dd)); assert(r.syn.startsWith('Sinopsis oficial') && /Hidra/.test(r.src), 'sinopsis ' + r.syn);
  });
  await test('si Google no responde, salen los resultados de Open Library y se avisa', async () => {
    await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    googleDown = true; await addSheet(); await page.fill('#addInput', 'wicked king'); await page.waitForSelector('#suggest [data-pick="0"]', { timeout:6000 });
    await page.waitForFunction(() => !/Buscando más/.test(document.querySelector('#suggest').innerText), null, { timeout:8000 });
    const t = await page.locator('#suggest').innerText(); googleDown = false;
    assert(/Wicked King/.test(t) && /no han respondido/.test(t), t);
    await addSheet(); await page.fill('#addInput', ''); await addSheet(); await page.fill('#addInput', 'El rey malvado'); await page.waitForSelector('#suggest [data-pick="0"]');
    await page.click('#suggest [data-pick="0"]'); await draftHas('eds', 6000);
  });
  await test('Hardcover: libro en inglés con serie y ediciones de Books2Door', async () => {
    await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await addSheet(); await page.fill('#addInput', 'quicksilver'); await page.waitForSelector('#suggest [data-pick]');
    await page.waitForFunction(() => /Quicksilver/.test(document.querySelector('#suggest').innerText));
    await page.locator('#suggest [data-pick]', { hasText:'Quicksilver' }).first().click(); await draftHas('edsEn'); const dd = await draft();
    const r = await ev(() => ({ s:document.querySelector('#f-sname').value, n:document.querySelector('#f-sn').value, en:document.querySelector('[data-lang="en"]').getAttribute('aria-pressed') }));
    assert(r.s === 'Fae & Alchemy' && r.n === '1', 'serie ' + JSON.stringify(r)); assert(/books2door/i.test(dd.edsEn) && /£22/.test(dd.edsEn) && dd.av.especial === 'EN' && r.en === 'true', JSON.stringify([r, dd]));
    await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await addSheet(); await page.fill('#addInput', 'El rey malvado'); await page.waitForSelector('#suggest [data-pick="0"]');
    await page.locator('#suggest .sg', { hasText:'El rey malvado' }).first().click(); await draftHas('eds', 6000);
  });
  await test('editar el lomo cambia la vista previa y se guarda', async () => {
    await tab('lomo'); assert(!(await page.locator('#fsp-pal, #fsp-adj, .trio').count()), 'siguen las paletas rápidas'); await page.click('[data-spstyle="grimorio"]'); await page.click('#fsp-parts [data-part="base"]'); await page.click('#fsp-editor #ce-shades .sw >> nth=2');
    await page.click('[data-do="save"]'); await page.waitForSelector('.sheet', { state:'detached' });
    // Es un tomo de una saga con «Iguales con número»: el estilo se guarda para toda la serie
    const sp = await ev(() => { const b = state.books[state.books.length - 1]; return { ...b.spine, serie:((state.seriesStyle || {})[serKey(b)] || {}).style }; });
    assert(sp && (sp.style === 'grimorio' || sp.serie === 'grimorio') && sp.parts && isHexT(sp.parts.base), 'lomo ' + JSON.stringify(sp));
  });
  await test('etiquetas: todas las que ya usas se pueden añadir, se filtran al escribir y no se duplican por mayúsculas', async () => {
    await ev(() => { const b = state.books[0]; b.tags = [...(b.tags || []), 'Etiqueta Rara', 'LGBTQ+']; for(let i = 0; i < 14; i++) state.books[1].tags = [...(state.books[1].tags || []), 'extra ' + i]; save(); });
    await addSheet(); await page.click('#btnAddManual');
    // sin escribir: las más usadas y «Ver todas», que enseña todas
    await page.click('#ftagsug [data-tagsall]');
    const r = await ev(() => ({ shown:[...document.querySelectorAll('#ftagsug [data-addtag]')].map(b => b.dataset.addtag), all:allTags().map(x => x[0]) }));
    assert(r.all.every(t => r.shown.includes(t)), 'faltan: ' + r.all.filter(t => !r.shown.includes(t)).join(', '));
    await page.fill('#ftagin', 'rara'); await page.waitForSelector('#ftagsug [data-addtag="Etiqueta Rara"]');
    assert(await page.locator('#ftagsug [data-addtag]').count() <= 2, 'al escribir deben salir solo las que coinciden');
    await page.click('#ftagsug [data-addtag="Etiqueta Rara"]');
    await page.fill('#ftagin', 'lgbtq+'); await page.keyboard.press('Enter');
    const tags = await ev(() => [...document.querySelectorAll('.sheet')].pop().draft.tags);
    assert(tags.includes('Etiqueta Rara') && tags.includes('LGBTQ+') && !tags.includes('lgbtq+'), JSON.stringify(tags));
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await ev(() => { state.books[0].tags = state.books[0].tags.filter(t => t !== 'Etiqueta Rara' && t !== 'LGBTQ+'); state.books[1].tags = state.books[1].tags.filter(t => !/^extra /.test(t)); save(); });
  });
  await test('añadir a mano un libro', async () => {
    await addSheet(); await page.click('#btnAddManual'); await page.fill('#f-title', 'Libro de prueba'); await page.fill('#f-pages', '250');
    await page.click('[data-do="save"]'); await page.waitForSelector('.sheet', { state:'detached' });
    assert(await page.locator('.bk[aria-label^="Libro de prueba"]').count() === 1, 'no aparece');
  });
  await test('selector propio: estantería y balda del libro (la balda depende de la estantería)', async () => {
    await addSheet(); await page.click('#btnAddManual'); await page.fill('#f-title', 'Libro movido');
    assert(await page.locator('.sheet select').count() === 0, 'quedan <select> nativos');
    const u = await ev(() => { const u = state.units.find(x => x.shelves.length > 1 && x.id !== document.querySelector('#f-unit').value); return { id:u.id, s:u.shelves.map(s => s.id) }; });
    await tab('lugar'); await page.click('#f-unit'); await page.waitForSelector('.pick-sheet [role="radiogroup"]');
    assert(await ev(() => document.elementFromPoint(195, 150).classList.contains('backdrop')), 'el formulario de debajo no queda tapado');
    await page.click(`.pick-sheet [data-pv="${u.id}"]`); await page.waitForSelector('.pick-sheet', { state:'detached' });
    const r = await ev(() => ({ u:document.querySelector('#f-unit').value, s:document.querySelector('#f-shelf').value, opts:JSON.parse(document.querySelector('#f-shelf').dataset.opts).map(o => o[0]) }));
    assert(r.u === u.id && r.s === u.s[0] && r.opts.join() === u.s.join(), 'baldas ' + JSON.stringify(r));
    await page.click('#f-shelf'); await page.click(`.pick-sheet [data-pv="${u.s[1]}"]`); await page.waitForSelector('.pick-sheet', { state:'detached' });
    assert(await page.locator('.sheet').count() === 1, 'se cerró también el formulario');
    await page.click('[data-do="save"]'); await page.waitForSelector('.sheet', { state:'detached' });
    const b = await ev(() => state.books.find(x => x.title === 'Libro movido')); assert(b.unitId === u.id && b.shelfId === u.s[1], 'guardado en ' + b.unitId + '/' + b.shelfId);
  });
  await test('selector propio: se maneja con teclado y devuelve el foco', async () => {
    await page.click('#btnRandom'); await page.focus('#r-unit'); await page.keyboard.press('Enter'); await page.waitForSelector('.pick-sheet [role="radiogroup"]');
    assert(await ev(() => document.activeElement.getAttribute('aria-checked')) === 'true', 'el foco no está en la opción elegida');
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.waitForSelector('.pick-sheet', { state:'detached' });
    const r = await ev(() => ({ v:document.querySelector('#r-unit').value, u0:state.units[0].id, name:state.units[0].name, f:document.activeElement.id,
      exp:document.querySelector('#r-unit').getAttribute('aria-expanded'), card:document.querySelector('#r-card').innerText }));
    assert(r.v === r.u0 && r.f === 'r-unit' && r.exp === 'false', JSON.stringify(r)); assert(r.card.includes(r.name) || /Ningún libro/.test(r.card), 'la tarjeta no filtra: ' + r.card);
    await page.click('#r-tags'); await page.waitForSelector('.pick-sheet #rt-list'); await page.keyboard.press('Escape'); await page.waitForSelector('.pick-sheet', { state:'detached' });
    assert(await page.locator('.sheet').count() === 1, 'Escape cerró más de una hoja'); await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('selector propio: al eliminar una estantería, sus libros van a la elegida', async () => {
    const t = await ev(() => { const b = state.books.find(x => x.title === 'Libro movido'), u = { id:'tmpu', name:'Temporal', tipo:'', preset:'gen', shelves:[mkShelf('Única')] };
      state.units.push(u); b.unitId = u.id; b.shelfId = u.shelves[0].id; save(); renderAll(); openUnitForm(u.id); return state.units[2]; });
    await unfold(); await page.click('#u-moveto'); await page.click(`.pick-sheet [data-pv="${t.id}"]`); await page.waitForSelector('.pick-sheet', { state:'detached' });
    await page.click('#u-del'); await page.click('#u-del'); await page.waitForSelector('.sheet', { state:'detached' });
    const r = await ev(() => ({ n:state.units.length, b:state.books.find(x => x.title === 'Libro movido').unitId }));
    assert(r.n === 6 && r.b === t.id, JSON.stringify(r));
  });
  await test('todas las estanterías se pueden editar (antes Ciencia ficción fallaba al abrir)', async () => {
    for(const id of await ev(() => state.units.map(u => u.id))){
      await ev(id => openUnitForm(id), id); await page.waitForSelector('#u-save');
      assert(await page.locator('#u-decor .decor-opt').count() > 5, 'faltan objetos en ' + id); await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    }
    assert(!errors.length, errors.join(' | '));
  });
  await test('sin campos <input> de texto (la barra de autorrellenar de Chrome) y Enter no salta de línea', async () => {
    await addSheet(); await page.click('#btnAddManual');
    const n = await ev(() => document.querySelectorAll('input:not([type=color]):not([type=checkbox]):not([type=file]):not([type=date]):not([type=range])').length); assert(n === 0, n + ' campos input');
    await page.fill('#f-title', 'Prueba'); await page.focus('#f-pages'); await page.keyboard.type('12a3'); await page.keyboard.press('Enter');
    const r = await ev(() => ({ t:document.querySelector('#f-title').value, p:document.querySelector('#f-pages').value })); assert(r.t === 'Prueba' && r.p === '123', JSON.stringify(r));
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('buscar y comparar datos: enseña lo distinto y aplica lo elegido', async () => {
    await ev(() => { const b = state.books.find(x => x.title === 'El rey malvado'); openBookForm({ book:{ ...b, pages:'', synopsis:'Mi sinopsis' } }); });
    await unfold(); await page.click('[data-do="refill"]'); await page.waitForSelector('[data-rv]', { timeout:15000 });
    const rows = await ev(() => [...document.querySelectorAll('[data-rv]')].map(o => o.dataset.rv + ':' + o.getAttribute('aria-checked')));
    assert(rows.includes('pages:true') && rows.includes('synopsis:false'), rows.join());
    await page.click('[data-do="rvapply"]'); await page.waitForSelector('[data-rv]', { state:'detached' });
    const r = await ev(() => ({ p:document.querySelector('#f-pages').value, s:document.querySelector('#f-syn').value })); assert(r.p === '336' && r.s === 'Mi sinopsis', JSON.stringify(r));
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  /* Arrastrar con el ratón: se agarra el elemento, se mueve un poco (aparecen las «Fila nueva») y luego al punto que calcule `to` en la página */
  const dragTo = async (sel, to, arg) => {
    await ev(sel => document.querySelector(sel).scrollIntoView({ block:'center' }), sel); await page.waitForTimeout(150);
    const a = await page.locator(sel).boundingBox(), y0 = a.y + a.height - 30;
    await page.mouse.move(a.x + a.width / 2, y0); await page.mouse.down(); await page.mouse.move(a.x + a.width / 2 + 9, y0, { steps:3 }); await page.waitForTimeout(150);
    const p = await page.evaluate(to, arg); await page.mouse.move(p.x, p.y, { steps:12 }); await page.waitForTimeout(200);
    const t = await ev(() => drag && drag.target); await page.mouse.up(); await page.waitForTimeout(450); return t;
  };
  await test('colocar a mano: un libro se queda en el espacio libre donde se suelta, y se le quita el espacio pegándolo', async () => {
    // Balda con solo dos libros (sitio libre de sobra en la fila); los demás de esta estantería, a la segunda balda
    const r0 = await ev(() => { const u = state.units[0]; u.decorMode = 'none'; delete u.place; const [ep, go] = u.shelves;
      state.books.filter(b => b.unitId === u.id).forEach((b, i) => { b.shelfId = i < 2 ? ep.id : go.id; });
      const l = sortedBooks(ep); save(); renderAll(); goTo(0, false); return { u:u.id, ep:ep.id, a:l[l.length - 1].id, prev:l[l.length - 2].id }; });
    await ev(r0 => { const u = unitOf(r0.u); u.shelves[0].order = []; save(); renderAll(); }, r0); await page.waitForTimeout(200);
    // El último libro de la balda, a tres cuartos de la fila (espacio libre)
    // Punto libre: entre el último elemento de la fila (sin el arrastrado) y el final, pasado de los tres cuartos
    const t = await dragTo(`.slide[data-i="0"] .it[data-id="${r0.a}"] button.bk`, r0 => { const rowEl = document.querySelector(`.it[data-id="${r0.a}"]`).closest('.row'), row = rowEl.getBoundingClientRect();
      const last = Math.max(row.left, ...[...rowEl.querySelectorAll('.it[data-id], .dc')].filter(e => e.dataset.id !== r0.a && !e.classList.contains('dragging')).map(e => e.getBoundingClientRect().right));
      return { x:Math.max(last + 40, row.left + row.width * .82), y:row.bottom - 60 }; }, r0);
    const r = await ev(r0 => { const u = unitOf(r0.u), it = document.querySelector(`.it[data-id="${r0.a}"]`), row = it.closest('.row').getBoundingClientRect(), b = it.getBoundingClientRect();
      return { at:(u.place || {})[r0.a] && u.place[r0.a].at, x:(b.left - row.left) / row.width, room:document.querySelectorAll(`.row[data-shelf="${r0.ep}"] .sp.room`).length, sort:u.sort }; }, r0);
    assert(r.at > .6 && r.x > .6 && r.room === 1 && r.sort === 'manual', JSON.stringify({ r, t }));
    // Pegado al de su izquierda: sin espacio
    await dragTo(`.slide[data-i="0"] .it[data-id="${r0.a}"] button.bk`, r0 => { const p = document.querySelector(`.it[data-id="${r0.prev}"]`).getBoundingClientRect(); return { x:p.right + 3, y:p.bottom - 40 }; }, r0);
    const r2 = await ev(r0 => ({ pl:(unitOf(r0.u).place || {})[r0.a] || null, room:document.querySelectorAll(`.row[data-shelf="${r0.ep}"] .sp.room`).length }), r0);
    assert(!r2.pl && !r2.room, JSON.stringify(r2));
  });
  await test('colocar a mano: «Fila nueva» empieza una fila nueva en la misma balda', async () => {
    const r0 = await ev(() => { const u = state.units[0], ep = u.shelves[0], l = sortedBooks(ep); return { u:u.id, ep:ep.id, a:l[0].id }; });
    const t = await dragTo(`.slide[data-i="0"] .it[data-id="${r0.a}"] button.bk`, r0 => { const n = document.querySelector(`.slide[data-unit="${r0.u}"] .newrow[data-shelf="${r0.ep}"]`); n.scrollIntoView({ block:'center' }); const b = n.getBoundingClientRect(); return { x:b.left + 40, y:b.top + b.height / 2 }; }, r0);
    const r = await ev(r0 => { const rows = [...document.querySelectorAll(`.row[data-shelf="${r0.ep}"]`)], i = rows.findIndex(x => x.querySelector(`.it[data-id="${r0.a}"]`)), first = rows[i] && rows[i].querySelector('.it[data-id]');
      return { pl:(unitOf(r0.u).place || {})[r0.a], rows:rows.length, i, first:first && first.dataset.id, newrows:document.querySelectorAll('.newrow').length }; }, r0);
    assert(r.pl && r.pl.nl && r.i === r.rows - 1 && r.i > 0 && r.first === r0.a && !r.newrows, JSON.stringify({ r, t }));
    await ev(r0 => { delete unitOf(r0.u).place; save(); renderAll(); }, r0);
  });
  await test('colocar a mano: un objeto se puede dejar en una balda vacía, en el punto donde se suelta', async () => {
    const r0 = await ev(() => { const u = state.units[0], empty = u.shelves.find(sh => !state.books.some(b => b.shelfId === sh.id));
      u.decorMode = 'manual'; u.decorItems = [{ id:'d1', k:'vela', after:null, size:1 }]; save(); renderAll(); goTo(0, false); return { u:u.id, sh:empty.id }; });
    await dragTo(`.slide[data-i="0"] .dcm[data-dec="d1"]`, r0 => { const row = document.querySelector(`.slide[data-unit="${r0.u}"] .row[data-shelf="${r0.sh}"]:not(.newrow)`); row.scrollIntoView({ block:'center' }); const b = row.getBoundingClientRect(); return { x:b.left + b.width * .7, y:b.bottom - 50 }; }, r0);
    const r = await ev(r0 => { const d = unitOf(r0.u).decorItems[0], el = document.querySelector('.dcm[data-dec="d1"]'), row = el.closest('.row'), rb = row.getBoundingClientRect();
      return { shelf:d.shelf, after:d.after, at:d.at, inShelf:row.dataset.shelf === r0.sh, x:(el.getBoundingClientRect().left - rb.left) / rb.width }; }, r0);
    assert(r.shelf === r0.sh && r.after === null && r.at > .4 && r.inShelf && r.x > .5, JSON.stringify(r));
    assert(!(await ev(() => document.querySelectorAll('.gap').length)), 'quedan huecos');
    await ev(r0 => { const u = unitOf(r0.u); u.decorItems = []; u.decorMode = 'none'; save(); renderAll(); }, r0);
  });
  await test('«Mover a…» ya no tiene huecos; quita el espacio libre de un libro colocado a mano', async () => {
    const id = await ev(() => { const u = state.units[0], b = state.books.find(x => x.unitId === u.id); u.place = { [b.id]:{ at:.7 } }; save(); renderAll(); return b.id; });
    await ev(id => openMove(id), id); assert(!(await page.locator('[data-gap]').count()), 'siguen los botones de hueco');
    await page.click('[data-do="nospace"]'); await page.waitForSelector('.sheet', { state:'detached' });
    assert(await ev(id => !(state.units[0].place || {})[id], id), 'no se quitó el espacio');
  });
  await test('Mover a…: crear balda y estantería nuevas y mover el libro allí', async () => {
    const id = await ev(() => unitSeq(state.units[0])[0].id); const n0 = await ev(() => state.units.length);
    await ev(id => openMove(id), id); await page.click('[data-newshelf] >> nth=0'); await page.waitForSelector('.sheet .one');
    await page.locator('.sheet .one').last().fill('Balda nueva'); await page.keyboard.press('Enter');
    await until(() => ev(id => { const s = shelfOf(bookOf(id).shelfId); return s && s.s.name === 'Balda nueva'; }, id), 4000, 'no se creó la balda');
    await until(() => ev(() => !document.querySelector('.sheet')), 3000, 'quedan hojas abiertas');
    await ev(id => openMove(id), id); await page.click('[data-do="newunitmove"]'); await page.waitForSelector('.sheet .one');
    await page.locator('.sheet .one').last().fill('Estantería nueva'); await page.keyboard.press('Enter');
    await until(() => ev(([id, n0]) => state.units.length === n0 + 1 && unitOf(bookOf(id).unitId).name === 'Estantería nueva', [id, n0]), 4000, 'no se creó la estantería');
    await until(() => ev(() => !document.querySelector('.sheet')), 3000, 'quedan hojas abiertas');
    await ev(([id, n0]) => { const b = bookOf(id), u0 = state.units[0]; b.unitId = u0.id; b.shelfId = u0.shelves[0].id; state.units.splice(n0); u0.shelves = u0.shelves.filter(s => s.name !== 'Balda nueva'); save(); renderAll(); }, [id, n0]);
  });
  await test('pestañas: cambian con clic y con flechas, y los plegables se abren', async () => {
    await ev(() => openDetail(state.books[0].id)); await page.waitForSelector('.sheet .tabbar');
    await tab('detalles'); assert(await ev(() => !document.querySelector('[data-panel="ficha:detalles"]').hidden && document.querySelector('[data-panel="ficha:resumen"]').hidden), 'no cambió');
    await page.focus('.sheet .tabbar [data-tab="detalles"]'); await page.keyboard.press('ArrowLeft');
    assert(await ev(() => !document.querySelector('[data-panel="ficha:resumen"]').hidden && document.activeElement.dataset.tab === 'resumen'), 'las flechas no cambian');
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await ev(() => openBookForm({ book:state.books[0] })); const d = page.locator('.sheet details.fold').first(); await d.locator('summary').click();
    assert(await d.evaluate(e => e.open), 'el plegable no se abre'); await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('borrar un libro: desde la ficha y desde Editar, con Deshacer', async () => {
    const ids = await ev(() => { const mk = t => { const b = { id:uid(), title:t, author:'X', langs:['es'], formats:{}, tags:[], status:'pendiente', unitId:state.units[0].id, shelfId:state.units[0].shelves[0].id, added:Date.now() }; state.books.push(b); return b.id; };
      const r = [mk('Para borrar 1'), mk('Para borrar 2')]; save(); renderAll(); return r; });
    await ev(id => openDetail(id), ids[0]); await tab('detalles'); await page.click('[data-do="del"]'); await page.click('[data-do="del"]');
    await page.waitForSelector('.sheet', { state:'detached' }); assert(await ev(id => !bookOf(id), ids[0]), 'no se borró desde la ficha');
    await page.click('#toast button'); assert(await ev(id => !!bookOf(id), ids[0]), 'Deshacer no lo recuperó');
    await ev(id => openBookForm({ book:bookOf(id) }), ids[1]); await page.click('[data-do="delbook"]'); await page.click('[data-do="delbook"]');
    await page.waitForSelector('.sheet', { state:'detached' }); assert(await ev(id => !bookOf(id), ids[1]), 'no se borró desde Editar');
    assert(!(await ev(() => document.querySelector('#toast').hidden)), 'sin aviso');
    await ev(id => { state.books = state.books.filter(b => b.id !== id); save(); renderAll(); }, ids[0]);
  });
  await test('navegación: una estantería cada vez, barra de abajo, Lectura y añadir', async () => {
    await ev(() => goTo(0, false)); await page.click('#tabs [data-i="2"]'); await page.waitForTimeout(700);
    const r = await ev(() => { const c = document.querySelector('#carousel'), s = c.children[2]; return { act:ui.active, sw:getComputedStyle(c).overflowX, snap:getComputedStyle(s).scrollSnapStop,
      vis:Math.abs(s.getBoundingClientRect().left - c.getBoundingClientRect().left) < c.clientWidth / 2, cur:document.querySelector('#tabs [aria-current="true"]').dataset.i, chips:document.querySelectorAll('.tab').length }; });
    assert(r.act === 2 && r.sw === 'auto' && r.snap === 'always' && r.vis && r.cur === '2' && r.chips === 0, JSON.stringify(r));
    // deslizar: al mover el carrusel, la estantería activa cambia sola
    await ev(() => { const c = document.querySelector('#carousel'), s = c.children[1]; c.scrollTo({ left:s.offsetLeft - (c.clientWidth - s.offsetWidth) / 2, behavior:'auto' }); }); await page.waitForTimeout(300);
    assert(await ev(() => ui.active) === 1, 'al deslizar no cambia la estantería activa');
    await ev(() => goTo(0));
    const b = await ev(() => { const x = state.books[0]; x.status = 'leyendo'; const y = state.books[1]; y.status = 'leido'; y.readAt = Date.now(); y.rating = 4; save(); renderAll(); return [x.id, y.id]; });
    const hd = await ev(() => [...document.querySelectorAll('#stats .st')].map(x => x.textContent));
    assert(hd.length === 3 && /pendientes/.test(hd[0]) && /leídos en/.test(hd[1]) && hd[2].startsWith('Leyendo: '), 'cabecera: ' + JSON.stringify(hd));
    await page.click('#stats'); await page.waitForSelector('#view-reading:not([hidden]) .rd');
    const t = await ev(() => ({ txt:document.querySelector('#view-reading').innerText, shelves:document.querySelector('#view-shelves').hidden, cur:document.querySelector('#stats').getAttribute('aria-pressed') }));
    assert(/Leyendo ahora/.test(t.txt) && /Leídos/.test(t.txt) && /★★★★☆/.test(t.txt) && t.shelves && t.cur === 'true', JSON.stringify(t));
    await page.click(`#view-reading [data-open="${b[0]}"]`); await page.waitForSelector('.sheet .tabbar'); await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await ev(ids => { ids.forEach(id => { const x = bookOf(id); x.status = 'pendiente'; x.readAt = null; x.rating = 0; }); save(); }, b);
    await page.click('#navAdd'); await page.waitForSelector('.sheet .addbar #addInput');
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    assert(await ev(() => !!document.querySelector('#addhome .addbar')), 'la barra de añadir no volvió a su sitio');
    await page.click('#navShelves'); assert(await ev(() => !document.querySelector('#view-shelves').hidden), 'no vuelve a Estanterías');
  });
  await test('editor de estanterías: se abre tocando el remate; General con baldas; sin «Tipo»', async () => {
    await ev(() => goTo(1, false)); await page.waitForTimeout(300); await page.click('.slide[data-i="1"] .crown-hit'); await page.waitForSelector('#u-save');
    const r = await ev(() => ({ tabs:[...document.querySelectorAll('.sheet .tabbar [data-tab]')].map(x => x.dataset.tab), tipo:!!document.querySelector('#u-tipo'),
      shelvesInGeneral:!!document.querySelector('[data-panel="estanteria:general"] #u-shelves'), btns:document.querySelectorAll('.unit-btn').length }));
    assert(r.tabs.join() === 'general,deco' && !r.tipo && r.shelvesInGeneral && r.btns === 0, JSON.stringify(r));
    await tab('deco'); await page.click('[data-dmode="none"]'); await page.click('#u-save'); await page.waitForSelector('.sheet', { state:'detached' });
    assert(await ev(() => state.units[1].decorMode === 'none' && !document.querySelector('.slide[data-i="1"] .dc')), 'Sin objetos no quita la decoración');
    await ev(() => { state.units[1].decorMode = 'auto'; save(); renderAll(); goTo(0); });
  });
  await test('Ajustes sin colores automáticos, objetos ni completar fichas; la migración pasa «ocultar objetos» a cada estantería', async () => {
    await page.click('#btnSettings'); await unfold(); const t = await page.locator('.sheet').innerText();
    assert(!/lomos automáticos|Objetos decorativos|Completar/i.test(t), t.slice(0, 300)); await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    const m = await ev(() => { const s = migrate({ v:1, settings:{ migThriller:1, migAdjust:1, decor:false, spineFromCover:false }, units:[{ id:'a', name:'A', shelves:[mkShelf('G')] }], books:[] }); return [s.units[0].decorMode, 'decor' in s.settings, 'spineFromCover' in s.settings]; });
    assert(m.join() === 'none,false,false', m.join());
  });
  await test('baldas físicas: cada balda en su fila con etiqueta; la etiqueta abre el editor', async () => {
    const r = await ev(() => { const u = state.units.find(x => x.shelves.length > 1 && state.books.some(b => b.unitId === x.id)); goTo(state.units.indexOf(u), false);
      const sl = document.querySelector(`.slide[data-unit="${u.id}"]`), rows = [...sl.querySelectorAll('.row')];
      const labels = [...sl.querySelectorAll('.blabel')].map(l => l.textContent), firstShelf = rows.map(r => r.dataset.shelf);
      const mixed = rows.some(r => new Set([...r.querySelectorAll('.it[data-id]')].map(i => i.dataset.shelf)).size > 1);
      const single = state.units.find(x => x.shelves.length === 1); const sl1 = single && document.querySelector(`.slide[data-unit="${single.id}"]`);
      return { u:u.id, names:u.shelves.map(s => s.name), labels, mixed, orderOk:[...new Set(firstShelf)].join() === u.shelves.map(s => s.id).join(), singleLabels:sl1 ? sl1.querySelectorAll('.blabel').length : 0 }; });
    assert(r.labels.join() === r.names.join() && !r.mixed && r.orderOk && r.singleLabels === 0, JSON.stringify(r));
    await page.waitForTimeout(300); await page.click(`.slide[data-unit="${r.u}"] .blabel >> nth=0`); await page.waitForSelector('#u-save');
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' }); await ev(() => goTo(0, false));
  });
  await test('orden por estantería (igual en todas sus baldas) y las sagas juntas', async () => {
    const uid0 = await ev(() => { const u = state.units.find(x => x.shelves.length > 1 && state.books.some(b => b.unitId === x.id)); goTo(state.units.indexOf(u), false); return u.id; });
    await page.waitForTimeout(300); await page.click(`.slide[data-unit="${uid0}"] .crown-hit`); await page.waitForSelector('#u-save');
    await page.click('[data-usort="title"]'); await page.click('[data-udir="asc"]'); await page.click('#u-save'); await page.waitForSelector('.sheet', { state:'detached' });
    const r = await ev(id => { const u = unitOf(id); return { sort:u.sort, dir:u.dir, ok:u.shelves.every(s => { const l = sortedBooks(s); const runs = l.map(b => serKey(b) || b.id);
      const together = runs.every((k, i) => runs.indexOf(k) === i || runs[i - 1] === k); const solo = l.filter(b => !serKey(b)).map(b => b.title);
      return together && solo.every((tt, i) => !i || solo[i - 1].localeCompare(tt, 'es') <= 0); }), perShelf:u.shelves.map(s => s.sort || '').join() }; }, uid0);
    assert(r.sort === 'title' && r.dir === 'asc' && r.ok, JSON.stringify(r)); await ev(() => goTo(0, false));
  });
  await test('sagas: el estilo de lomo elegido se aplica a toda la serie («Iguales con número»)', async () => {
    const id = await ev(() => { const b = state.books.find(x => x.title === 'The Queen of Nothing'); state.seriesStyle = state.seriesStyle || {}; state.seriesStyle[serKey(b)] = { mode:'iguales' }; save(); renderAll(); return b.id; });
    await ev(id => openBookForm({ book:bookOf(id) }), id); await tab('lomo'); await page.click('[data-spstyle="vidriera"]'); await page.click('[data-do="save"]'); await page.waitForSelector('.sheet', { state:'detached' });
    const ss = await ev(() => state.seriesStyle['the folk of the air']);
    assert(ss.style === 'vidriera' && ss.mode === 'iguales', JSON.stringify(ss));
    const styles = await ev(() => { const u = state.units[0], th = themeOf(u); return state.books.filter(b => serKey(b) === 'the folk of the air').map(b => spineArt(b, u, th, { series:{ mode:'iguales', style:'vidriera', idx:0, n:+b.series.n, total:3, off:0, totalW:60, seed:1, leader:b } }).style); });
    assert(styles.every(s => s === 'vidriera'), styles.join());
  });
  await test('serie en el formulario: se ven los tomos que faltan y se pueden añadir al guardar', async () => {
    const id = await ev(() => state.books.find(b => b.title === 'The Cruel Prince').id);
    await ev(id => openBookForm({ book:bookOf(id) }), id); await tab('serie'); await page.waitForSelector('#f-vols [data-vol="4"]', { state:'attached', timeout:8000 });
    const own = await page.locator('#f-vols .ser-row.own').count(); assert(own >= 3, 'tomos propios ' + own);
    await page.check('#f-vols [data-vol="4"]'); await page.click('[data-do="save"]'); await page.waitForSelector('.sheet', { state:'detached' });
    const nb = await ev(() => state.books.find(b => b.series && b.series.name === 'The Folk of the Air' && +b.series.n === 4));
    assert(nb && /Stolen Heir/.test(nb.title) && nb.unitId, JSON.stringify(nb && { t:nb.title, s:nb.series }));
    await ev(id => { state.books = state.books.filter(b => b.id !== id); save(); renderAll(); }, nb.id);
  });
  await test('editar un libro y marcar tomos que faltan guarda también los cambios del libro', async () => {
    const id = await ev(() => state.books.find(b => b.title === 'The Cruel Prince').id);
    await ev(id => openBookForm({ book:bookOf(id) }), id); await page.fill('#f-pages', '999');
    await tab('serie'); await page.waitForSelector('#f-vols [data-vol="4"]', { state:'attached', timeout:8000 }); await page.check('#f-vols [data-vol="4"]');
    await page.click('[data-do="save"]'); await page.waitForSelector('.sheet', { state:'detached' });
    const r = await ev(id => ({ pages:bookOf(id).pages, vol:(state.books.find(b => b.series && b.series.name === 'The Folk of the Air' && +b.series.n === 4) || {}).id }), id);
    assert(r.pages === 999 && r.vol, JSON.stringify(r));
    await ev(([id, v]) => { bookOf(id).pages = 380; state.books = state.books.filter(b => b.id !== v); save(); renderAll(); }, [id, r.vol]);
  });
  await test('el nombre de la serie se busca al terminar de escribir, no con cada letra', async () => {
    const calls = []; const on = r => { if(r.url().includes('/api/serie')) calls.push(new URL(r.url()).searchParams.get('s')); }; page.on('request', on);
    await ev(() => openBookForm({ item:null })); await page.fill('#f-title', 'Prueba de serie'); await tab('serie');
    await page.click('#f-sname'); await page.keyboard.type('Throne of Glass', { delay:70 }); await page.waitForTimeout(1600);
    page.off('request', on);
    assert(calls.length === 1 && calls[0] === 'Throne of Glass', calls.join(' | '));
    assert(await ev(() => !Object.keys(JSON.parse(localStorage.getItem('tbr.series.v1') || '{}')).some(k => k === 'th' || k === 'thr')), 'caché con nombres a medias');
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('Ajustes sin plegables, estadísticas en Lectura y menos diseños de mueble', async () => {
    await page.click('#btnSettings'); const n = await page.locator('.sheet details').count(); await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    assert(n === 0, 'plegables en Ajustes: ' + n);
    await page.click('#stats'); assert(/Estadísticas/.test(await page.locator('#view-reading').innerText()), 'sin estadísticas en Lectura'); await page.click('#navShelves');
    await ev(() => openUnitForm(state.units[0].id)); await page.waitForSelector('#u-save'); await unfold();
    const p = await ev(() => [...document.querySelectorAll('[data-preset]')].map(x => x.dataset.preset));
    assert(['auto', 'fantasia', 'romantasy', 'cienciaficcion', 'darkacademia', 'contemporanea', 'romance'].every(k => p.includes(k)) && !p.includes('terror') && !p.includes('psicologia'), p.join());
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('objetos automáticos: se pueden mover y la estantería pasa a manual', async () => {
    await ev(() => { const u = state.units[1]; u.decorMode = 'auto'; u.decorItems = []; save(); renderAll(); });
    const id = await ev(() => document.querySelector('.slide[data-i="1"] .dcm').dataset.dec); assert(/^auto:/.test(id), id);
    await ev(id => openDecor(id), id); await page.waitForSelector('[data-dmove="1"]');
    const before = await ev(() => JSON.stringify(state.units[1].decorItems.map(d => d.after)));
    await page.click('[data-dmove="1"]'); await page.waitForTimeout(200);
    const r = await ev(() => ({ m:state.units[1].decorMode, a:JSON.stringify(state.units[1].decorItems.map(d => d.after)) }));
    assert(r.m === 'manual' && r.a !== before, JSON.stringify(r) + before); await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('pestaña Lomo: miniaturas de los 15 diseños, partes y editor de color en el sitio', async () => {
    await ev(() => openBookForm({ book:state.books.find(x => x.title === 'Dune') })); await tab('lomo');
    assert(await page.locator('#fsp-style [data-spstyle]').count() === 16, 'miniaturas');
    await page.click('#fsp-style [data-spstyle="jaspeado"]');
    const parts = await ev(() => [...document.querySelectorAll('#fsp-parts [data-part]')].map(b => b.dataset.part));
    assert(parts.join() === 'base,alt,v1,v2,foil,ink', parts.join());
    await page.click('#fsp-parts [data-part="alt"]'); await page.waitForSelector('#fsp-editor #ce-shades .sw');
    const before = await ev(() => document.querySelector('#fsp-prev').innerHTML);
    await page.click('#fsp-editor #ce-shades .sw >> nth=1'); const chosen = await ev(() => document.querySelector('#ce-hex').value);
    const r = await ev(() => ({ part:([...document.querySelectorAll('.sheet')].pop().draft.spine || {}).parts, now:document.querySelector('#fsp-prev').innerHTML, label:document.querySelector('[data-part="alt"] small').textContent }));
    assert(r.part.alt === chosen && r.now !== before && r.label === 'elegido', JSON.stringify({ ...r, now:'' }));
    // Deslizador: cambia en vivo; «Automático» devuelve la parte a su color de serie
    await unfold(); await ev(() => { const l = document.querySelector('#ce-l'); l.value = 20; l.dispatchEvent(new Event('input', { bubbles:true })); });
    assert(await ev(c => ([...document.querySelectorAll('.sheet')].pop().draft.spine.parts.alt !== c), chosen), 'el deslizador no cambia el color');
    await page.click('#fsp-editor [data-ce="auto"]'); assert(await ev(() => !([...document.querySelectorAll('.sheet')].pop().draft.spine.parts || {}).alt), 'no volvió a automático');
    // Letras
    await page.click('#fsp-parts [data-part="ink"]'); await unfold(); await page.fill('#ce-hex', '#ff0000');
    assert(await ev(() => getComputedStyle(document.querySelector('#fsp-prev .tt')).color) === 'rgb(255, 0, 0)', 'letras');
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('lomos: con cualquier color se lee el título (contraste ≥ 4 salvo fondos de varios colores, ≥ 3)', async () => {
    const bad = await ev(() => { const P = [['#f2d7a0', '#f6e6c0', '#ffffff'], ['#101010', '#202020', '#303030'], ['#7a7a7a', '#8a8a8a', '#6a6a6a'], ['#c45cff', '#ffd400', '#ff2fb8'], ['#1f4a3c', '#d9b25f', '#8fb36a'], ['#e8a9b3', '#7a1f3a', '#c9566f']], out = [];
      // Lámina holo queda fuera: sus colores los elige Leyre a mano y ella cuida que se lea (decidido el 26/10/2026)
      [...SPINE_ORDER, 'luna'].filter(st => st !== 'holo').forEach(st => P.forEach(pal => { const D = SPINES[st], c = D.colors(pal), r = D.draw({ w:32, h:150, seed:7, title:'Prueba' }, c, 32, 150), ink = bestInk(r.ink, r.tbg);
        const worst = Math.min(...r.tbg.filter(isHex).map(b => contrast(ink, b))); if(worst < (r.tbg.length > 1 ? 3 : 4)) out.push(st + ' ' + pal[0] + ' ' + worst.toFixed(2)); }));
      return out; });
    assert(!bad.length, bad.join(' | '));
  });
  await test('lomos: cada parte cambia algo y no hay zonas de color fijo', async () => {
    const r = await ev(() => { const u = state.units[0], th = themeOf(u), X = '#ff00ff', out = { inert:[], fixed:[] };
      SPINE_ORDER.forEach(st => { const draw = parts => spineArt({ id:'z', title:'Prueba de lomo', author:'Ana Pérez', pages:300, spine:{ style:st, parts, ink:X } }, u, th).html.replace(/(id="|url\(#)([A-Za-z]+)\d+/g, '$1$2');
        const base = draw({}); SPINES[st].parts.forEach(([k]) => { if(draw({ [k]:'#00ff00' }) === base) out.inert.push(st + '.' + k); });
        // Todas las partes del mismo color: todo lo que se ve tiene que ser ese color o un tono suyo (más claro u oscuro)
        const all = draw(Object.fromEntries(SPINES[st].parts.map(([k]) => [k, X])));
        const svg = all.slice(all.indexOf('<svg'), all.indexOf('</svg>')), cols = [...new Set((svg.match(/#[0-9a-f]{6}\b/gi) || []).map(c => c.toLowerCase()))];
        const off = cols.filter(c => { const [h, s] = hexHsl(c); return s > .05 && Math.abs(h - 300) > 3; }); if(off.length) out.fixed.push(st + ':' + off.join(',')); });
      return out; });
    assert(!r.inert.length, 'partes que no cambian nada: ' + r.inert.join(', ')); assert(!r.fixed.length, 'zonas de color fijo: ' + r.fixed.join(' | '));
  });
  await test('lomos: el número de tomo encaja en cada diseño (dentro del lomo, sin pisar el título y legible)', async () => {
    const bad = await ev(() => { const u = state.units[0], th = themeOf(u), out = [], box = document.createElement('div'); box.style.cssText = 'position:fixed;left:0;top:0;display:flex;z-index:9999'; document.body.appendChild(box);
      const L = { id:'L', title:'Uno', series:{ name:'S', n:1 } };
      [...SPINE_ORDER.map(st => ['iguales', st]), ['luna', ''], ['paisaje', '']].forEach(([mode, st]) => [[3, 3], [12, 12], [1, 2]].forEach(([n, total]) => {
        const b = { id:'n' + st + n, title:'Una corona de sombras y fuego', pages:200, series:{ name:'S', n, total } };
        const a = spineArt(b, u, th, { series:{ mode, style:st, idx:n - 1, n, total, off:0, totalW:40, seed:3, leader:L } }); box.innerHTML = a.html;
        const bk = box.querySelector('.bk').getBoundingClientRect(), nm = box.querySelector('.nm'), tt = box.querySelector('.tt').getBoundingClientRect(), tag = (st || mode) + ' ' + n + '/' + total;
        if(!nm){ out.push(tag + ': sin número'); return; }
        const t = document.createRange(); t.selectNodeContents(nm); const r = t.getBoundingClientRect();
        if(r.left < bk.left + 1 || r.right > bk.right - 1 || r.top < bk.top || r.bottom > bk.bottom) out.push(tag + ': se sale');
        if(r.top < tt.bottom - 1 && r.bottom > tt.top + 1) out.push(tag + ': pisa el título');
        if(nm.textContent !== (total <= 3 ? ['I', 'II', 'III'][n - 1] : String(n))) out.push(tag + ': número ' + nm.textContent);
      }));
      // contraste del número sobre su soporte con colores muy distintos
      [['#f2d7a0', '#f6e6c0', '#ffffff'], ['#101010', '#202020', '#303030'], ['#c45cff', '#ffd400', '#ff2fb8']].forEach(pal => [...SPINE_ORDER, 'luna'].forEach(st => { const D = SPINES[st], r = D.draw({ w:32, h:156, seed:7, title:'Prueba', num:'II' }, D.colors(pal), 32, 156);
        const ink = bestInk(r.num.ink, [r.num.bg]); if(contrast(ink, r.num.bg) < 4) out.push(st + ' contraste del número ' + contrast(ink, r.num.bg).toFixed(2)); }));
      box.remove(); return out; });
    assert(!bad.length, bad.join(' | '));
  });
  await test('lomos: el título va centrado en su zona (también en varias líneas)', async () => {
    const bad = await ev(() => { const u = state.units[0], th = themeOf(u), out = [], box = document.createElement('div'); box.style.cssText = 'position:fixed;left:0;top:0;display:flex;z-index:9999'; document.body.appendChild(box);
      SPINE_ORDER.forEach(st => ['Nuncanoche', 'La canción de Aquiles', 'Tomorrow, and Tomorrow, and Tomorrow'].forEach(title => {
        box.innerHTML = spineArt({ id:'c' + st, title, pages:150, spine:{ style:st } }, u, th).html;
        const tb = box.querySelector('.tbox').getBoundingClientRect(), spans = [...box.querySelectorAll('.tt span')], tt = box.querySelector('.tt'), ls = parseFloat(getComputedStyle(tt).letterSpacing) || 0;
        const ctr = r => (r.top + r.bottom) / 2, ttr = tt.getBoundingClientRect();
        if(Math.abs(ctr(ttr) - ctr(tb)) > 1 || Math.abs((ttr.left + ttr.right) / 2 - (tb.left + tb.right) / 2) > 1) out.push(st + ' «' + title + '»: caja descentrada');
        // cada línea centrada en vertical (el texto, sin el hueco del espaciado de la última letra)
        spans.forEach(sp => { const rg = document.createRange(); rg.selectNodeContents(sp); const r = rg.getBoundingClientRect(), mid = (r.top + r.bottom - ls) / 2;
          if(Math.abs(mid - ctr(tb)) > 1.2) out.push(st + ' «' + sp.textContent + '» ' + (mid - ctr(tb)).toFixed(1)); });
      }));
      box.remove(); return out; });
    assert(!bad.length, bad.join(' | '));
  });
  await test('lomos de saga (fases de la luna y paisaje): todo sale de sus partes', async () => {
    const r = await ev(() => { const u = state.units[0], th = themeOf(u), X = '#ff00ff', out = [], L = { id:'L', title:'Uno', series:{ name:'S', n:1 } };
      [['luna', 'luna'], ...Object.keys(SAGA_SCENES).map(k => ['paisaje', 'saga', k])].forEach(([mode, key, scene]) => {
        const parts = Object.fromEntries(SPINE_PARTS[key].map(([k]) => [k, X]));
        const html = spineArt({ id:'q', title:'Prueba', pages:200, series:{ name:'S', n:2, total:5 }, spine:{ parts, ink:X } }, u, th, { series:{ mode, scene, style:'', idx:1, n:2, total:5, off:30, totalW:200, seed:4, leader:L } }).html;
        const svg = html.slice(html.indexOf('<svg'), html.indexOf('</svg>')), off = [...new Set((svg.match(/#[0-9a-f]{6}\b/gi) || []).map(c => c.toLowerCase()))].filter(c => { const [h, s] = hexHsl(c); return s > .05 && Math.abs(h - 300) > 3; });
        if(off.length) out.push((scene || mode) + ': ' + off.join(','));
        SPINE_PARTS[key].forEach(([k]) => { const a = spineArt({ id:'q', title:'Prueba', pages:200, series:{ name:'S', n:2, total:5 }, spine:{ parts:{ [k]:'#00ff00' } } }, u, th, { series:{ mode, scene, style:'', idx:1, n:2, total:5, off:30, totalW:200, seed:4, leader:L } }).html.replace(/(id="|url\(#)([A-Za-z]+)\d+/g, '$1$2');
          const b0 = spineArt({ id:'q', title:'Prueba', pages:200, series:{ name:'S', n:2, total:5 } }, u, th, { series:{ mode, scene, style:'', idx:1, n:2, total:5, off:30, totalW:200, seed:4, leader:L } }).html.replace(/(id="|url\(#)([A-Za-z]+)\d+/g, '$1$2');
          if(a === b0) out.push((scene || mode) + '.' + k + ' no cambia nada'); });
      });
      return out; });
    assert(!r.length, r.join(' | '));
  });
  await test('lomos: los estilos y colores guardados antes pasan a los diseños nuevos', async () => {
    const r = await ev(() => { const s = migrate({ v:1, settings:{ migThriller:1, migAdjust:1, migSort:1, migDecor:1, migGaps:1 }, units:[], seriesStyle:{ x:{ style:'enredadera' } }, books:[
      { spine:{ style:'jaspeado', parts:{ accent:'#111111', base:'#eeeeee', m1:'#ff0000', m2:'#00ff00', m3:'#0000ff' } } }, { spine:{ style:'ilustrado', parts:{ base:'#101030', sky2:'#303060', moon:'#ffee88' } } },
      { spine:{ style:'acuarela', parts:{ accent2:'#abcdef' } } }] });
      return { a:s.books[0].spine, b:s.books[1].spine, c:s.books[2].spine.parts, ser:s.seriesStyle.x.style }; });
    assert(r.a.parts.base === '#111111' && r.a.parts.alt === '#eeeeee' && r.a.parts.v1 === '#ff0000' && r.a.parts.v2 === '#00ff00', JSON.stringify(r.a));
    assert(r.b.style === 'celestial' && r.b.parts.alt === '#303060' && r.b.parts.foil === '#ffee88', JSON.stringify(r.b));
    assert(r.c.alt === '#abcdef' && r.ser === 'botanico', JSON.stringify(r));
  });
  await test('ficha: serie completa con los tomos que faltan, audiolibro y enlaces a tiendas', async () => {
    const id = await ev(() => state.books.find(b => b.title === 'The Cruel Prince').id);
    await ev(id => openDetail(id), id); await tab('extra'); await page.waitForSelector('#d-serie');
    assert(await page.locator('#d-serie .ser-row.own').count() === 3, 'tomos propios');
    if(await page.locator('[data-xdo="serie"]').count()) await page.click('[data-xdo="serie"]'); // puede venir ya de la caché (el formulario busca los tomos)
    await page.waitForSelector('[data-addvol="4"]');
    assert(await page.locator('#d-serie .ser-row.miss').count() === 1, 'debe faltar solo el 4 (el 3.5 es un relato)');
    await tab('comprar'); await page.waitForSelector('#d-audio .aud', { timeout:5000 });
    assert(await ev(() => [...document.querySelectorAll('.sheet .tabbar [data-tab]')].map(x => x.textContent).join()) === 'Resumen,Detalles,Serie,Ediciones', 'pestañas de la ficha');
    const a = await ev(() => ({ n:document.querySelectorAll('#d-audio .aud').length, t:document.querySelector('#d-audio').innerText, shops:[...document.querySelectorAll('a.chip')].map(x => x.textContent) }));
    assert(a.n === 3 && /10 h 0 min/.test(a.t) && /Caitlin Kelly/.test(a.t), JSON.stringify(a));
    assert(/8 h 20 min · narra Carla López/.test(a.t) && /Ver en Audible/.test(a.t) && /\bdramatizado\b/.test(a.t) && /¿dramatizado\?/.test(a.t), 'Audible en la ficha: ' + a.t);
    assert(a.shops.some(s => s.includes('Spotify')), 'enlace a Spotify'); assert(['Amazon', 'Buscalibre', 'Casa del Libro', 'Books2Door', 'Come In'].every(n => a.shops.some(s => s.includes(n))), a.shops.join());
    assert(await ev(() => [...document.querySelectorAll('a.chip')].find(x => /Come In/.test(x.textContent)).href.includes('libreriainglesa.com/producto/listadobuscar?buscar=The%20Cruel%20Prince')), 'enlace de Come In');
    assert(!(await ev(() => document.querySelector('.sheet').innerText)).includes('Ediciones en español encontradas'), 'la ficha aún enseña la lista de ediciones');
    await page.click('[data-adrama]'); assert(await ev(id => bookOf(id).audioDrama, id) === true, 'dramatizado');
    await tab('extra');
    await page.click('[data-addvol="4"]'); await page.waitForSelector('#f-title');
    const f = await ev(() => ({ t:document.querySelector('#f-title').value, s:document.querySelector('#f-sname').value, n:document.querySelector('#f-sn').value }));
    assert(f.t === 'The Stolen Heir' && f.s === 'The Folk of the Air' && f.n === '4', JSON.stringify(f));
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('título en español: buscar y comparar lo ofrece y guarda el original', async () => {
    await ev(() => { const b = state.books.find(x => x.title === 'El rey malvado'); openBookForm({ book:{ ...b, title:'The Wicked King', origTitle:'' } }); });
    await unfold(); await page.click('[data-do="refill"]'); await page.waitForSelector('[data-rv]', { timeout:15000 });
    const rows = await ev(() => [...document.querySelectorAll('[data-rv]')].map(o => o.dataset.rv + ':' + o.getAttribute('aria-checked')));
    assert(rows.includes('esTitle:true'), rows.join());
    await page.click('[data-do="rvapply"]'); await page.waitForSelector('[data-rv]', { state:'detached' });
    const r = await ev(() => ({ t:document.querySelector('#f-title').value, n:document.querySelector('#f-estit').innerText }));
    assert(r.t === 'El rey malvado' && /The Wicked King/.test(r.n), JSON.stringify(r));
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('Completar fichas: aviso solo si hay fichas por completar; datos de la edición española y título español a elegir', async () => {
    await ev(() => { state.books.forEach(b => { if(!b.ejemplo) b.filled = Date.now(); }); renderAll(); });
    assert(await page.locator('#fillnote').isHidden(), 'el aviso sale sin nada que completar');
    assert(!(await page.locator('#btnFill').count()), 'sigue el botón fijo de la barra');
    assert(/Estantería/.test(await page.locator('#btnNewUnit').innerText()), 'el + de estantería sin texto');
    const id = await ev(() => { const b = { ...newDraft(null).draft, title:'The Wicked King', author:'Holly Black', synopsis:'', pages:'', year:'', langs:['en'], cover:'' }; state.books.push(b); save(); renderAll(); return b.id; });
    await page.waitForSelector('#fillnote:not([hidden])'); assert(/1 ficha por completar/.test(await page.locator('#fillnote').innerText()), 'contador');
    await page.click('#fillnote'); await page.click('[data-do="fillrun"]');
    await page.waitForSelector('[data-offer]', { timeout:30000 });
    const b = await ev(id => { const b = bookOf(id); return { syn:b.synopsis, langs:b.langs.sort().join(), pages:b.pages, year:b.year, ser:b.series && b.series.name, filled:!!b.filled }; }, id);
    assert(/Sinopsis oficial/.test(b.syn) && b.langs === 'en,es' && b.pages === 352 && b.year == 2019 && b.ser === 'The Folk of the Air' && b.filled, JSON.stringify(b));
    assert(/páginas de la edición española/.test(await page.locator('#s-fill').innerText()), 'resumen de cambios');
    await page.click('[data-offer]'); await page.click('[data-do="offerapply"]');
    const t = await ev(id => ({ t:bookOf(id).title, o:bookOf(id).origTitle, c:bookOf(id).cover }), id);
    assert(t.t === 'El rey malvado' && t.o === 'The Wicked King' && t.c === 'https://example.com/rey.jpg', JSON.stringify(t));
    await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    assert(await page.locator('#fillnote').isHidden(), 'el aviso sigue después de completar');
    await ev(id => { state.books = state.books.filter(b => b.id !== id); save(); renderAll(); }, id);
  });
  await test('buscar por el título en español encuentra el libro aunque las fuentes lo tengan en inglés', async () => {
    await addSheet(); await page.fill('#addInput', 'Mercurio'); await page.waitForFunction(() => [...document.querySelectorAll('#suggest .sg-t')].some(x => x.textContent === 'Mercurio'), null, { timeout:8000 });
    const i = await ev(() => [...document.querySelectorAll('#suggest [data-pick]')].findIndex(x => x.querySelector('.sg-t').textContent === 'Mercurio'));
    await page.click(`#suggest [data-pick="${i}"]`); await page.waitForSelector('#f-title');
    const r = await ev(() => { const d = [...document.querySelectorAll('.sheet')].pop().draft; return { t:document.querySelector('#f-title').value, o:d.origTitle }; });
    assert(r.t === 'Mercurio' && r.o === 'Quicksilver', JSON.stringify(r));
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('«Nicci French» y «french nicci» son el mismo libro; las sinopsis sin reclamos de la editorial', async () => {
    assert(await ev(() => bookKey({ title:'Blue Monday', author:'Nicci French' }) === bookKey({ title:'blue monday', author:'french nicci' })), 'claves distintas');
    const c = await ev(() => cleanSynopsis('NO TE PIERDAS LA EDICIÓN COLECCIONISTA, ENRIQUECIDA Y LIMITADA, DE LA SAGA MÁS LEÍDA.\n\nViolet Sorrengail tenía previsto entrar en el Cuadrante de los Escribas y vivir tranquila entre libros.'));
    assert(c.startsWith('Violet'), 'reclamo de la editorial: ' + c.slice(0, 40));
  });
  await test('si localStorage se llena, la colección se guarda en IndexedDB y se recupera al abrir', async () => {
    await ev(() => { window.__set = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v){ if(k === 'tbr.v1') throw new DOMException('cuota', 'QuotaExceededError'); return window.__set.call(this, k, v); }; state.books[0].notes = 'solo en IndexedDB'; save(); });
    await page.waitForTimeout(1200); assert(!(await page.locator('[data-do="retrysave"]').count()), 'avisó aunque IndexedDB lo guardó');
    assert(await ev(() => JSON.parse(localStorage.getItem('tbr.v1')).books[0].notes !== 'solo en IndexedDB'), 'la prueba no simula bien el fallo');
    await page.reload(); await page.waitForSelector('.slide .bk'); await page.waitForFunction(() => state.books[0].notes === 'solo en IndexedDB', null, { timeout:4000 });
  });
  await test('si el móvil no deja guardar, se explica con datos y se puede reintentar', async () => {
    await ev(() => { window.__set = Storage.prototype.setItem; Storage.prototype.setItem = function(k, v){ if(k === 'tbr.v1') throw new DOMException('cuota', 'QuotaExceededError'); return window.__set.call(this, k, v); };
      window.__idb = idbSet; idbSet = () => Promise.reject(new Error('sin IndexedDB')); state.books[0].notes = 'prueba guardado'; save(); });
    await page.waitForSelector('[data-do="retrysave"]', { timeout:4000 });
    const t = await page.locator('.sheet').last().innerText(); assert(/QuotaExceededError/.test(t) && /KB/.test(t), t);
    assert(await ev(() => !!localStorage.getItem('tbr.v1')), 'al fallar se borró la copia guardada');
    await ev(() => { Storage.prototype.setItem = window.__set; idbSet = window.__idb; }); await page.click('[data-do="retrysave"]'); await page.waitForSelector('[data-do="retrysave"]', { state:'detached' });
    assert(await ev(() => JSON.parse(localStorage.getItem('tbr.v1')).books[0].notes === 'prueba guardado'), 'no se guardó al reintentar');
  });
  await test('arrastrar un libro lo mueve', async () => {
    await ev(() => goTo(0, false)); await page.waitForTimeout(300);
    const order0 = await ev(() => [...document.querySelectorAll('.slide[data-i="0"] .it[data-id]')].map(i => i.dataset.id));
    await ev(() => window.scrollTo(0, 0)); await ev(id => document.querySelector(`.slide[data-i="0"] .it[data-id="${id}"]`).scrollIntoView({ block:'center' }), order0[0]); await page.waitForTimeout(100);
    const a = await page.locator(`.slide[data-i="0"] .it[data-id="${order0[0]}"]`).boundingBox(), b = await page.locator(`.slide[data-i="0"] .it[data-id="${order0[2]}"]`).boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height - 40); await page.mouse.down(); await page.mouse.move(a.x + 20, a.y + a.height - 30, { steps:4 });
    await page.mouse.move(b.x + b.width + 4, b.y + b.height - 40, { steps:12 }); await page.waitForTimeout(150); await page.mouse.up(); await page.waitForTimeout(400);
    const order1 = await ev(() => [...document.querySelectorAll('.slide[data-i="0"] .it[data-id]')].map(i => i.dataset.id));
    assert(order1.join() !== order0.join(), 'el orden no cambió ' + order0.slice(0,4) + ' / ' + JSON.stringify([a.x,a.y,a.width,a.height,b.x,b.y]));
  });
  await test('decoración a mano: añadir, mover y quitar', async () => {
    await page.click('.slide[data-i="0"] [data-act="editUnit"]'); await tab('deco'); await page.click('[data-dmode="manual"]'); await page.click('[data-dadd="buho"]'); await page.click('#u-save');
    await page.waitForSelector('.sheet', { state:'detached' }); await page.waitForTimeout(300);
    const n = await page.locator('.slide[data-i="0"] .dcm').count(); assert(n >= 1, 'no hay objetos');
    await page.locator('.slide[data-i="0"] .dcm').first().click(); await page.waitForSelector('[data-do="drm"]'); await page.click('[data-do="drm"]'); await page.waitForTimeout(400);
    assert(await page.locator('.slide[data-i="0"] .dcm').count() === n - 1, 'no se quitó');
  });
  await test('ruleta: varias etiquetas (basta con una o todas a la vez)', async () => {
    const ids = await ev(() => { const [a, b] = state.books.filter(x => (x.status || 'pendiente') === 'pendiente' && !serKey(x)); a.tags = [...(a.tags || []), 'zzuno']; b.tags = [...(b.tags || []), 'zzdos', 'zzuno']; save(); return [a.id, b.id]; });
    await page.click('#btnRandom'); await page.click('#r-tags'); await page.waitForSelector('#rt-list');
    await page.fill('#rt-q', 'zz'); assert(await page.locator('#rt-list [data-rt]').count() === 2, 'el buscador de etiquetas no filtra');
    await page.click('[data-rt="zzuno"]'); await page.click('[data-rt="zzdos"]'); await page.click('#rt-ok'); await page.waitForSelector('.pick-sheet', { state:'detached' });
    const seen = new Set(); for(let i = 0; i < 12; i++){ seen.add(await ev(() => document.querySelector('#r-card h2').textContent)); await page.click('#r-roll'); }
    const names = await ev(ids => ids.map(id => bookOf(id).title), ids);
    assert(names.every(n => seen.has(n)) && seen.size === 2, 'con «basta con una» deben salir los dos: ' + [...seen]);
    assert(/zzuno o zzdos/.test(await page.locator('#r-tags').innerText()), 'el botón no enseña las etiquetas');
    await page.click('#r-tags'); await page.click('[data-rm="all"]'); await page.click('#rt-ok'); await page.waitForSelector('.pick-sheet', { state:'detached' });
    for(let i = 0; i < 5; i++){ assert(await ev(() => document.querySelector('#r-card h2').textContent) === names[1], 'con «todas» solo vale el que tiene las dos'); await page.click('#r-roll'); }
    await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await ev(ids => { ids.forEach(id => { const x = bookOf(id); x.tags = x.tags.filter(t => !t.startsWith('zz')); }); save(); }, ids);
  });
  await test('universos: reconoce tus libros, marca leídos y tapa los spoilers', async () => {
    const id = await ev(() => { const b = state.books[0]; b._t = [b.title, b.author, b.status]; b.title = 'Nacidos de la bruma'; b.author = 'Brandon Sanderson'; b.status = 'pendiente'; save(); renderAll(); return b.id; });
    await page.click('#navUni'); await page.waitForSelector('#view-universes:not([hidden]) details.uni');
    assert(await ev(() => document.querySelector('#navUni').getAttribute('aria-current')) === 'page', 'pestaña no marcada');
    const sum = await page.locator('details[data-uni="cosmere"] summary').innerText(); assert(/0 de \d+ leídos · 1 en tu TBR/.test(sum), sum);
    await page.click('details[data-uni="cosmere"] summary');
    assert(await page.locator(`details[data-uni="cosmere"] [data-open="${id}"]`).count() === 1, 'no enlaza con tu libro');
    assert(await page.locator('details[data-uni="cosmere"] [data-ul="cosmere:0"]').count() === 1, 'el spoiler de El imperio final debería estar tapado');
    await ev(id => { bookOf(id).status = 'leido'; save(); renderAll(); }, id);
    assert(await page.locator('details[data-uni="cosmere"][open] [data-ul="cosmere:0"]').count() === 0 && /Hoid/.test(await page.locator('details[data-uni="cosmere"]').innerText()), 'leído el libro, la conexión debería verse: ' + JSON.stringify(await ev(id => ({ open:document.querySelector('details[data-uni="cosmere"]').open, st:bookOf(id).status, f:uniFind(UNIVERSES[1], UNIVERSES[1].series[0].books[0]).id, id, lock:!!document.querySelector('[data-ul="cosmere:0"]') }), id)));
    await page.click('[data-ul="cosmere:1"]'); assert(/Armonía/.test(await page.locator('details[data-uni="cosmere"]').innerText()), 'tocar no destapa');
    await page.click('details[data-uni="maas"] summary'); await page.click('[data-ur="maas:tog7"]');
    assert(await ev(() => !!state.settings.uniRead['maas:tog7']), 'no guarda el leído'); assert(/Lunathion/.test(await page.locator('details[data-uni="maas"]').innerText()), 'con Reino de cenizas leído, el guiño se ve');
    await page.click(`details[data-uni="cosmere"] [data-open="${id}"]`); await page.waitForSelector('.sheet .tabbar'); await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await ev(id => { const b = bookOf(id); [b.title, b.author, b.status] = b._t; delete b._t; delete state.settings.uniRead; save(); renderAll(); }, id);
    await page.click('#navShelves');
  });
  await test('libro al azar con filtro de saga', async () => {
    await page.click('#btnRandom'); await page.click('[data-kd="saga"]'); await page.waitForTimeout(200);
    const t = await page.locator('#r-card').innerText(); assert(t.length > 0, 'vacío'); await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('borrar una balda conserva el orden manual de la balda que recibe sus libros', async () => {
    const r0 = await ev(() => { const u = state.units.find(x => x.preset === 'romantasy'), fae = u.shelves[0]; u.sort = 'manual';
      u.shelves.forEach(s => s.order = sortedBooks(s).map(b => b.id)); fae.order.reverse(); save(); renderAll(); goTo(state.units.indexOf(u), false); return { id:u.id, order:[...fae.order], drop:u.shelves[1].id }; });
    await page.waitForTimeout(300); await page.click(`.slide[data-unit="${r0.id}"] .crown-hit`); await page.waitForSelector('#u-save');
    await page.click(`.shelf-edit[data-sid="${r0.drop}"] [data-delshelf]`); await page.click(`.shelf-edit[data-sid="${r0.drop}"] [data-delshelf]`); await page.click('#u-save'); await page.waitForSelector('.sheet', { state:'detached' });
    const after = await ev(id => unitOf(id).shelves[0].order, r0.id);
    assert(after.slice(0, r0.order.length).join() === r0.order.join(), JSON.stringify({ antes:r0.order, despues:after }));
    await ev(() => goTo(0, false));
  });
  await test('la cabecera y Estadísticas cuentan igual los pendientes', async () => {
    const r = await ev(() => ({ head:+document.querySelector('#stats b').textContent, stats:+statsHtml().match(/Pendientes<\/dt><dd>(\d+)/)[1], n:state.books.filter(b => (b.status || 'pendiente') === 'pendiente').length }));
    assert(r.head === r.stats && r.head === r.n, JSON.stringify(r));
  });
  await test('buscar encuentra por nombre de serie y por título original', async () => {
    await page.click('#btnFilter'); await page.fill('#q-text', 'folk of the air'); await page.click('#q-apply'); await page.waitForSelector('.sheet', { state:'detached' });
    const t = await page.locator('#filterbar').innerText(), n = await ev(() => state.books.filter(b => b.series && /folk of the air/i.test(b.series.name)).length);
    assert(n >= 3 && new RegExp('^' + n + ' libros').test(t), t);
    assert(await ev(() => matches({ title:'El rey malvado', origTitle:'The Wicked King', author:'Holly Black' }, { q:'wicked', status:'', lang:'', tags:[], len:'' })), 'título original');
    await ev(() => { ui.filters = { q:'', status:'', lang:'', tags:[], len:'' }; renderAll(); });
  });
  await test('el aviso de balda vacía se lee entero (no lo tapa el parteluz)', async () => {
    await ev(() => { ui.filters.q = 'zzzz no existe'; renderAll(); goTo(0, false); }); await page.waitForTimeout(300);
    const r = await ev(() => { const h = document.querySelector('.slide[data-i="0"] .empty-hint'); h.style.pointerEvents = 'auto'; h.scrollIntoView({ block:'center' });
      const b = h.getBoundingClientRect(), y = b.top + b.height / 2, hit = x => !!(document.elementFromPoint(x, y) || { closest:() => null }).closest('.empty-hint');
      const out = { l:hit(b.left + 4), c:hit(b.left + b.width / 2), r:hit(b.right - 4) }; h.style.pointerEvents = ''; return out; });
    await ev(() => { ui.filters.q = ''; renderAll(); });
    assert(r.l && r.c && r.r, JSON.stringify(r));
  });
  await test('ficha: si se redibuja mientras busca el audiolibro, los resultados aparecen igual', async () => {
    audioDelay = 900; const id = await ev(() => { const b = state.books.find(x => x.title === 'Dune'); delete b.audio; b.status = 'pendiente'; return b.id; });
    await ev(id => openDetail(id), id); await page.click('.sheet [data-do="start"]'); await tab('comprar');
    await page.waitForSelector('#d-audio .aud', { timeout:5000 }); audioDelay = 0;
    // lo guardado con la versión anterior de las fuentes (sin Audible) se vuelve a buscar al abrir la ficha
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await ev(id => { bookOf(id).audio = { at:Date.now(), items:[{ id:'x', src:'apple', store:'Apple Books', title:'Viejo', lang:'es' }] }; save(); openDetail(id); }, id); await tab('comprar');
    await page.waitForFunction(id => bookOf(id).audio.v === 2 && bookOf(id).audio.items.some(i => i.src === 'audible'), id, { timeout:5000 });
    assert(await page.locator('#d-audio .aud').count() === 3, 'sin resultados');
    await ev(id => { bookOf(id).status = 'pendiente'; save(); }, id); await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('formulario con cambios: pregunta antes de descartarlos (X, fondo y gesto atrás); sin cambios o al guardar, no', async () => {
    await ev(() => { window.__keepAsk = true; }); const id = await ev(() => state.books[0].id);
    await ev(id => openBookForm({ book:bookOf(id) }), id); await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await ev(id => openBookForm({ book:bookOf(id) }), id); await page.fill('#f-pages', '123');
    await page.click('.sheet [data-close]'); await page.waitForSelector('.ask-sheet'); await page.click('.ask-sheet [data-close]'); await page.waitForSelector('.ask-sheet', { state:'detached' });
    assert(await ev(() => !!document.querySelector('#f-pages')) && await page.inputValue('#f-pages') === '123', 'se perdió el formulario al seguir editando');
    await page.evaluate(() => history.back()); await page.waitForSelector('.ask-sheet'); assert(await ev(() => !!document.querySelector('#f-pages')), 'el gesto atrás cerró el formulario');
    await page.click('.ask-sheet [data-do="discard"]'); await page.waitForFunction(() => !sheets.length);
    assert(await ev(id => bookOf(id).pages !== 123, id), 'se guardó al descartar');
    await ev(id => openBookForm({ book:bookOf(id) }), id); await page.fill('#f-pages', '124'); await page.click('[data-do="save"]'); await page.waitForFunction(() => !sheets.length);
    assert(await ev(id => bookOf(id).pages === 124 && !document.querySelector('.ask-sheet'), id), 'guardar preguntó o no guardó');
    const uid = await ev(() => state.units[0].id); await ev(uid => openUnitForm(uid), uid); await page.fill('#u-name', 'Cambiada');
    await ev(() => document.querySelectorAll('.backdrop')[0].click()); await page.waitForSelector('.ask-sheet'); await page.click('.ask-sheet [data-do="discard"]'); await page.waitForFunction(() => !sheets.length);
    assert(await ev(uid => unitOf(uid).name !== 'Cambiada', uid), 'la estantería cambió al descartar');
    await ev(() => { window.__keepAsk = false; });
  });
  await test('hojas con pestañas: misma altura en todas las pestañas', async () => {
    await ev(() => openDetail(state.books[0].id)); const h = [];
    for(const k of ['resumen', 'detalles', 'comprar']){ await tab(k); h.push(await ev(() => Math.round(document.querySelector('.sheet').getBoundingClientRect().height))); }
    assert(h.every(x => x === h[0]), h.join()); await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('cabecera compacta: título y cifras en una línea, sin «Siguiente»; al buscar salta a la estantería con resultados', async () => {
    const r = await ev(() => ({ h:document.querySelector('.top').getBoundingClientRect().height, next:!!document.querySelector('.next-chip') }));
    assert(r.h < 56 && !r.next, JSON.stringify(r));
    await ev(() => goTo(0, false)); const want = await ev(() => { const b = state.books.find(x => x.unitId !== state.units[0].id); return { t:b.title, i:state.units.findIndex(u => u.id === b.unitId) }; });
    await page.click('#btnFilter'); await page.fill('#q-text', want.t); await page.click('#q-apply'); await page.waitForSelector('.sheet', { state:'detached' }); await page.waitForTimeout(300);
    const d = await ev(() => ({ active:ui.active, hits:[...document.querySelectorAll('#tabs .dot-b.hit')].map(x => +x.dataset.i) }));
    assert(d.active === want.i && d.hits.includes(want.i), JSON.stringify({ d, want }));
    await ev(() => { ui.filters = { q:'', status:'', lang:'', tags:[], len:'' }; renderAll(); goTo(0, false); });
  });
  await test('al cambiar un libro solo se redibuja su estantería', async () => {
    const r = await ev(() => { const sl = [...document.querySelectorAll('#carousel .slide')]; sl.forEach((x, i) => x.__k = i); const u = state.units[0], b = state.books.find(x => x.unitId === u.id);
      b.status = b.status === 'leido' ? 'pendiente' : 'leido'; save(); renderAll(); const now = [...document.querySelectorAll('#carousel .slide')];
      return { same:now.slice(1).every((x, i) => x.__k === i + 1), redrawn:now[0].__k === undefined, on:now.filter(x => x.classList.contains('on')).length }; });
    assert(r.same && r.redrawn && r.on === 1, JSON.stringify(r));
  });
  await test('fecha de lectura: se puede cambiar en la ficha y Lectura lo agrupa en ese año', async () => {
    const id = await ev(() => { const b = state.books.find(x => x.status !== 'leido'); b.status = 'leido'; b.readAt = Date.now(); save(); renderAll(); return b.id; });
    await ev(id => openDetail(id), id); await tab('detalles'); await page.fill('#d-readat', '2025-03-14'); await ev(() => document.querySelector('#d-readat').dispatchEvent(new Event('change', { bubbles:true })));
    assert(await ev(id => new Date(bookOf(id).readAt).getFullYear() === 2025 && new Date(bookOf(id).readAt).getMonth() === 2, id), 'fecha');
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' }); await page.click('#stats');
    assert(/2025/.test(await page.locator('#view-reading').innerText()), 'Lectura sin 2025');
    await page.click('#navShelves');
  });
  await test('Lectura: «Terminado» y «Empezar» sin abrir la ficha, con Deshacer', async () => {
    const id = await ev(() => { state.books.forEach(b => { if(b.status === 'leyendo') b.status = 'pendiente'; }); const b = state.books.find(x => x.status === 'pendiente'); b.status = 'leyendo'; save(); renderAll(); return b.id; });
    await page.click('#stats'); await page.click(`[data-quick="finish"][data-id="${id}"]`);
    assert(await ev(id => bookOf(id).status === 'leido' && !!bookOf(id).readAt, id), 'no se terminó');
    await page.click('#toast button'); assert(await ev(id => bookOf(id).status === 'leyendo', id), 'no se deshizo');
    const nx = await ev(() => { const b = state.books.find(x => x.status === 'pendiente'); state.books.forEach(x => x.next = false); b.next = true; save(); renderAll(); return b.id; });
    await page.click(`[data-quick="start"][data-id="${nx}"]`); assert(await ev(id => bookOf(id).status === 'leyendo' && !bookOf(id).next, id), 'no empezó');
    await page.click('#navShelves');
  });
  await test('ruleta: de cada saga solo sale el tomo que te toca', async () => {
    const r = await ev(async () => { const k = 'the folk of the air', mem = state.books.filter(b => serKey(b) === k);
      mem.forEach(b => { b.status = 'pendiente'; }); save(); openRandom(); await new Promise(r => setTimeout(r, 200));
      document.querySelector('[data-kd="saga"]').click(); const seen = new Set();
      for(let i = 0; i < 25; i++){ document.querySelector('#r-roll').click(); seen.add(document.querySelector('#r-card h2').textContent); }
      const first = mem.sort((a, b) => a.series.n - b.series.n)[0].title, others = mem.filter(b => b.title !== first).map(b => b.title);
      return { first, ok:!others.some(t => seen.has(t)), seen:[...seen] }; });
    assert(r.ok, JSON.stringify(r)); await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('mis ediciones: por comprar / lo tengo por formato, en la ficha y para filtrar', async () => {
    const id = await ev(() => { const b = state.books[0]; b.formats = {}; save(); return b.id; });
    await ev(id => openDetail(id), id); await tab('comprar'); await page.click('[data-own="dura"]');
    assert(await ev(id => bookOf(id).formats.dura === 'quiero', id), 'por comprar'); await page.click('[data-own="dura"]');
    assert(await ev(id => bookOf(id).formats.dura === 'tengo', id), 'lo tengo'); await tab('resumen');
    assert(/Lo tengo/.test(await page.locator('.sheet .hero').innerText()), 'sin la marca en el resumen');
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await page.click('#btnFilter'); await page.click('[data-ow="tengo"]'); await page.click('#q-apply'); await page.waitForSelector('.sheet', { state:'detached' });
    const n = await ev(() => state.books.filter(b => matches(b)).length); assert(n >= 1 && /Lo tengo/.test(await page.locator('#filterbar').innerText()), 'filtro ' + n);
    await ev(() => { ui.filters = { q:'', status:'', lang:'', tags:[], len:'' }; renderAll(); goTo(0, false); });
  });
  await test('guardar copia descarga un JSON válido', async () => {
    await page.click('#btnSettings'); await unfold(); const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-do="export"]')]);
    const data = JSON.parse(fs.readFileSync(await dl.path(), 'utf8')); assert(data.v === 1 && data.books.length > 5, 'copia rara'); await page.click('[data-close]');
  });
  await test('funciona sin conexión', async () => {
    await page.reload(); await page.waitForTimeout(1500); await ev(() => navigator.serviceWorker.ready); await ctx.setOffline(true);
    await page.reload(); await page.waitForSelector('.slide .bk', { timeout:5000 }); await ctx.setOffline(false);
  });
  await test('avisa cuando hay una versión nueva', async () => {
    versionOverride = 'nueva'; await page.reload(); await page.waitForSelector('#update:not([hidden])', { timeout:4000 }); versionOverride = null;
  });
  /* ---- nube ---- */
  let dev2, dev3;
  await test('sin cuenta: Ajustes ofrece entrar con Google', async () => {
    await page.goto(BASE); await page.waitForSelector('.slide .bk'); await page.click('#btnSettings');
    await page.waitForSelector('#cloud-sec [data-cloud="login"]', { timeout:4000 });
  });
  await test('entrar sube la colección a la nube', async () => {
    await page.click('#cloud-sec [data-cloud="login"]'); await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await until(() => db.row, 8000, 'no se subió nada');
    const n = await ev(() => state.books.length); assert(db.row.data.books.length === n, `nube ${db.row.data.books.length} / local ${n}`);
  });
  await test('un móvil nuevo recibe la colección sin duplicar estanterías', async () => {
    dev2 = await newDevice(browser); await dev2.p.goto(BASE); await dev2.p.waitForSelector('.slide .bk');
    await dev2.p.evaluate(() => cloudLogin());
    await until(() => dev2.p.evaluate(n => state.books.length === n, db.row.data.books.length), 6000, 'no llegaron los libros');
    const r = await dev2.p.evaluate(() => ({ u:state.units.length, ids:new Set(state.books.map(b => b.id)).size, n:state.books.length }));
    assert(r.u === db.row.data.units.length && r.ids === r.n, JSON.stringify(r));
  });
  await test('un libro añadido en un móvil llega al otro', async () => {
    const p2 = dev2.p; await addSheet(p2); await p2.click('#btnAddManual'); await p2.fill('#f-title', 'Desde el otro móvil'); await p2.click('[data-do="save"]');
    await until(() => dbTitles().includes('Desde el otro móvil'), 8000, 'no llegó a la nube');
    await ev(() => syncNow()); assert(await ev(() => state.books.some(b => b.title === 'Desde el otro móvil')), 'no llegó al primero');
    assert(await page.locator('.bk[aria-label^="Desde el otro móvil"]').count() === 1, 'no se dibuja');
  });
  await test('cambios a la vez en los dos se juntan, y un borrado se respeta', async () => {
    await ev(() => { const b = state.books.find(x => x.title === 'Desde el otro móvil'); state.books = state.books.filter(x => x !== b); save(); });
    await dev2.p.evaluate(() => { state.books.find(x => x.title === 'Libro de prueba').pages = 999; save(); });
    await page.waitForTimeout(300); await dev2.p.waitForTimeout(300);
    await ev(() => syncNow()); await dev2.p.evaluate(() => syncNow()); await ev(() => syncNow());
    const chk = p => p.evaluate(() => ({ gone:!state.books.some(b => b.title === 'Desde el otro móvil'), pages:(state.books.find(b => b.title === 'Libro de prueba') || {}).pages }));
    const a = await chk(page), b = await chk(dev2.p);
    assert(a.gone && b.gone && a.pages == 999 && b.pages == 999, JSON.stringify({ a, b }));
  });
  await test('una portada subida desde el móvil pasa a la nube', async () => {
    const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    await ev(png => { state.books[0].coverData = png; save(); }, png); await page.waitForTimeout(300); await ev(() => syncNow());
    const cd = db.row.data.books.find(b => b.coverData).coverData; assert(cd.startsWith('https://mock.storage/u1/'), cd.slice(0, 40)); assert(db.files.length === 1, 'subidas: ' + db.files.length);
  });
  await test('un móvil con libros propios pregunta y junta sin repetir', async () => {
    dev3 = await newDevice(browser); const p3 = dev3.p; await p3.goto(BASE); await p3.waitForSelector('.slide .bk');
    await addSheet(p3); await p3.click('#btnAddManual'); await p3.fill('#f-title', 'Solo en el tercero'); await p3.click('[data-do="save"]'); await p3.waitForSelector('.sheet', { state:'detached' });
    await p3.waitForSelector('#cloudban:not([hidden])', { timeout:3000 });
    await p3.click('#cloudban [data-cloud="login"]'); await p3.waitForSelector('[data-join="join"]', { timeout:5000 }); await p3.click('[data-join="join"]');
    await until(() => dbTitles().includes('Solo en el tercero'), 8000, 'no se juntó');
    const r = await p3.evaluate(() => ({ u:state.units.length, titles:state.books.map(b => b.title) }));
    assert(r.u === db.row.data.units.length && r.u === 6, 'estanterías ' + r.u);
    assert(new Set(r.titles).size === r.titles.length, 'libros repetidos: ' + r.titles.join(', '));
    assert(await p3.locator('#cloudban:not([hidden])').count() === 0, 'el aviso sigue');
  });
  await test('si este móvil pierde su colección, no borra la de la nube (la recupera de ella)', async () => {
    await ev(() => syncNow(true)); const before = db.row.data.books.map(b => b.id).sort().join();
    await ev(() => localStorage.removeItem('tbr.v1')); await page.reload(); await page.waitForSelector('.slide .bk');
    await until(() => ev(n => state.books.length === n && !state.books.some(b => b.ejemplo && !b.upd && !b.title), db.row.data.books.length), 8000, 'no recuperó la colección');
    await page.waitForTimeout(800); await ev(() => syncNow(true));
    const after = db.row.data.books.map(b => b.id).sort().join(), local = await ev(() => state.books.map(b => b.id).sort().join());
    assert(after === before, 'la nube cambió: ' + db.row.data.books.length + ' libros, ' + Object.keys(db.row.data.deleted || {}).length + ' borrados');
    assert(local === before, 'este móvil no recuperó la colección');
  });
  await test('borrar muchos libros de golpe pregunta antes de tocar la nube', async () => {
    await ev(() => { state.books.forEach(b => delete b.ejemplo); save(); }); await page.waitForTimeout(300); await ev(() => syncNow(true));
    const all = db.row.data.books.map(b => b.id), drop = all.slice(0, Math.ceil(all.length / 2));
    db.backups.push({ id:1, created_at:new Date(Date.now() - 86400000).toISOString(), data:JSON.parse(JSON.stringify(db.row.data)) });
    const del = () => ev(ids => { state.books = state.books.filter(b => !ids.includes(b.id)); save(); setTimeout(() => syncNow(), 200); }, drop);
    await del(); await page.waitForSelector('[data-big="keep"]', { timeout:6000 }); await page.click('[data-big="keep"]');
    await until(() => ev(n => state.books.length === n, all.length), 6000, 'no recuperó los libros');
    assert(db.row.data.books.length === all.length, 'la nube perdió libros');
    await del(); await page.waitForSelector('[data-big="del"]', { timeout:6000 }); await page.click('[data-big="del"]');
    await until(() => db.row.data.books.length === all.length - drop.length, 6000, 'no se borraron al confirmar');
  });
  await test('Ajustes → Copias de la nube: volver a una copia recupera los libros', async () => {
    const n = db.backups[0].data.books.length;
    await page.click('#btnSettings'); await page.click('[data-cloud="backups"]'); await page.click('[data-bk="1"]'); await page.waitForSelector('[data-do="bkrestore"]');
    assert(new RegExp(n + ' libros').test(await page.locator('#bk-pick').innerText()), 'resumen de la copia');
    await page.click('[data-do="bkrestore"]'); await page.click('[data-do="bkrestore"]');
    await until(() => db.row.data.books.length === n, 8000, 'la nube no recuperó la copia');
    assert(await ev(n => state.books.length === n, n), 'este móvil no recuperó la copia');
    while(await ev(() => sheets.length)){ await ev(() => closeSheet()); await page.waitForTimeout(400); }
  });
  await test('cerrar sesión deja los libros en el móvil', async () => {
    await dev2.p.evaluate(() => syncNow(true)); const n = await dev2.p.evaluate(() => state.books.length); await dev2.p.evaluate(() => cloudLogout()); await dev2.p.waitForTimeout(300);
    const r = await dev2.p.evaluate(() => ({ n:state.books.length, u:!!nube.user })); assert(r.n === n && !r.u, JSON.stringify(r));
  });
  await test('sin la librería de la nube la app funciona igual', async () => {
    const d = await newDevice(browser, { cdn:false }); await d.p.goto(BASE); await d.p.waitForSelector('.slide .bk');
    await d.p.click('#btnSettings'); const t = await d.p.locator('#cloud-sec').innerText(); assert(/no se puede conectar/i.test(t), t); await d.c.close();
  });
  await Promise.all([dev2, dev3].filter(Boolean).map(d => d.c.close()));
  await test('sin errores de JavaScript en toda la prueba', async () => { assert(!errors.length, errors.join(' | ')); });

  await browser.close(); server.close();
  const bad = results.filter(r => r[0] !== 'ok');
  console.log(`\n${results.length - bad.length}/${results.length} pruebas correctas`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
