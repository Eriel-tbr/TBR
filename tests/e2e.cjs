/* Pruebas de extremo a extremo de Mi TBR.
   Abren la app en un Chrome con tamaño de móvil, con Google Books, Open Library y Wikidata simulados.
   Uso: npm test   (o: node tests/e2e.cjs) */
const http = require('http'), fs = require('fs'), path = require('path');
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = '1'; // que las respuestas simuladas valgan también para el service worker
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.webmanifest':'application/manifest+json' };
let versionOverride = null;
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
    desc:'Fae romantasy.', series:{ name:'Fae & Alchemy', n:1, total:3 }, genres:['Fantasy', 'Romance'] }] }) });
  if(u.pathname === '/api/b2d') return route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ items:/quicksilver/i.test(u.searchParams.get('q')) ? [
    { title:'Quicksilver', full:'Quicksilver by Callie Hart - Special Edition Sprayed Edges', price:'£22.00', available:true, publisher:'Hodder', url:'https://www.books2door.com/products/qs', isbn:'', fmt:'especial', author:'Callie Hart' },
    { title:'Quicksilver', full:'Quicksilver by Callie Hart', price:'£9.99', available:true, publisher:'Hodder', url:'https://www.books2door.com/products/9781399741',  isbn:'', fmt:'', author:'Callie Hart' }] : [] }) });
  if(u.pathname === '/api/audio') return route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ items:[
    { id:'a1', src:'apple', store:'Apple Books', country:'es', title:'El rey malvado', lang:'es', url:'https://books.apple.com/x', price:'18.99 EUR' },
    { id:'h1', src:'hardcover', store:'Hardcover', title:'The Wicked King', lang:'en', seconds:36000, narrators:['Caitlin Kelly'], drama:true }] }) });
  if(u.pathname === '/api/serie') return route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ name:'The Folk of the Air', total:4, url:'https://hardcover.app/series/x',
    books:[{ n:1, main:true, title:'The Cruel Prince', year:2018 }, { n:2, main:true, title:'The Wicked King', year:2019 }, { n:3, main:true, title:'The Queen of Nothing', year:2019 }, { n:3.5, main:false, title:'How the King of Elfhame Learned to Hate Stories', year:2020 }, { n:4, main:true, title:'The Stolen Heir', year:2023, pages:350 }] }) });
  if(u.pathname === '/api/portada') return route.fulfill({ status:200, contentType:'image/png', headers:{ 'access-control-allow-origin':'*' }, body:PNG });
  return route.fulfill({ status:404, body:'' });
}
let googleDown = false;
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

/* ---- nube simulada ---- */
const MOCK_SB = fs.readFileSync(path.join(__dirname, 'mock-supabase.js'), 'utf8');
const db = { row:null, files:[] };
function mockDb(src, op, arg){
  const clone = x => JSON.parse(JSON.stringify(x));
  if(op === 'get') return db.row && clone(db.row);
  if(op === 'insert'){ if(db.row) return { code:'23505' }; db.row = clone(arg); return null; }
  if(op === 'update'){ if(!db.row || db.row.rev !== arg.expect) return []; db.row = { ...db.row, data:clone(arg.data), rev:arg.rev }; return [{ rev:arg.rev }]; }
  if(op === 'upload'){ db.files.push(arg); return null; }
}
async function newDevice(browser, { cdn = true } = {}){
  const c = await browser.newContext({ viewport:{ width:390, height:844 }, deviceScaleFactor:2, serviceWorkers:'block' });
  await c.route(u => /googleapis|openlibrary|wikidata|gstatic/.test(u.href), fakeApis);
  await c.route(u => u.hostname === 'cdn.jsdelivr.net', r => cdn ? r.fulfill({ status:200, contentType:'text/javascript', headers:{ 'access-control-allow-origin':'*' }, body:MOCK_SB }) : r.abort());
  await c.route(u => u.pathname.startsWith('/api/'), fakeOwnApi);
  await c.exposeBinding('mockDb', mockDb);
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

(async () => {
  await new Promise(r => server.listen(0, r)); const BASE = `http://localhost:${server.address().port}/`;
  const browser = await chromium.launch();
  ctx = await browser.newContext({ viewport:{ width:390, height:844 }, deviceScaleFactor:2, hasTouch:false, serviceWorkers:'allow' });
  await ctx.route(u => /googleapis|openlibrary|wikidata|gstatic/.test(u.href), fakeApis);
  await ctx.route(u => u.pathname.startsWith('/api/'), fakeOwnApi);
  await ctx.route(u => u.hostname === 'cdn.jsdelivr.net', r => r.fulfill({ status:200, contentType:'text/javascript', headers:{ 'access-control-allow-origin':'*' }, body:MOCK_SB }));
  await ctx.exposeBinding('mockDb', mockDb);
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
    const tops = await ev(() => [...document.querySelectorAll('.slide')].map(s => { const m = s.querySelector('.mueble').getBoundingClientRect(), r = s.querySelector('.row').getBoundingClientRect(); return Math.round(r.top - m.top); }));
    assert(Math.max(...tops) - Math.min(...tops) <= 1, 'primera balda en ' + tops.join(', '));
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
      return [...document.querySelectorAll('.it[data-id]')].filter(i => ids.includes(i.dataset.id)).map(i => (i.querySelector('.num') || {}).textContent); });
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
    await page.fill('#addInput', 'El rey malvado'); await page.waitForSelector('#suggest [data-pick="0"]');
    await page.click('#suggest [data-pick="0"]'); await page.waitForFunction(() => document.querySelector('#f-sname') && document.querySelector('#f-sname').value);
    await page.waitForTimeout(500);
    const r = await ev(() => ({ s:document.querySelector('#f-sname').value, n:document.querySelector('#f-sn').value, t:document.querySelector('#f-st').value,
      l:[...document.querySelectorAll('#flangs [aria-pressed="true"]')].map(e => e.dataset.lang).sort().join(','), syn:document.querySelector('#f-syn').value }));
    assert(r.n === '2' && r.t === '3', 'serie ' + JSON.stringify(r)); assert(r.l === 'en,es', 'idiomas ' + r.l); assert(r.syn.includes('español'), 'sinopsis ' + r.syn);
  });
  await test('encuentra la edición española: editorial, formato y sinopsis oficial', async () => {
    await page.waitForSelector('#feds a', { timeout:5000 });
    const r = await ev(() => ({ eds:document.querySelector('#feds').innerText, dura:document.querySelector('[data-fmt="dura"]').dataset.av,
      syn:document.querySelector('#f-syn').value, src:document.querySelector('#f-synsrc').textContent }));
    assert(/Hidra/.test(r.eds) && r.dura === 'ES', JSON.stringify(r)); assert(r.syn.startsWith('Sinopsis oficial') && /Hidra/.test(r.src), 'sinopsis ' + r.syn);
  });
  await test('si Google no responde, salen los resultados de Open Library y se avisa', async () => {
    await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    googleDown = true; await page.fill('#addInput', 'wicked king'); await page.waitForSelector('#suggest [data-pick="0"]', { timeout:6000 });
    await page.waitForFunction(() => !/Buscando más/.test(document.querySelector('#suggest').innerText), null, { timeout:8000 });
    const t = await page.locator('#suggest').innerText(); googleDown = false;
    assert(/Wicked King/.test(t) && /no han respondido/.test(t), t);
    await page.fill('#addInput', ''); await page.fill('#addInput', 'El rey malvado'); await page.waitForSelector('#suggest [data-pick="0"]');
    await page.click('#suggest [data-pick="0"]'); await page.waitForSelector('#feds a', { timeout:6000 });
  });
  await test('Hardcover: libro en inglés con serie y ediciones de Books2Door', async () => {
    await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await page.fill('#addInput', 'quicksilver'); await page.waitForSelector('#suggest [data-pick]');
    await page.waitForFunction(() => /Quicksilver/.test(document.querySelector('#suggest').innerText));
    await page.locator('#suggest [data-pick]', { hasText:'Quicksilver' }).first().click(); await page.waitForSelector('#feds a', { timeout:8000 });
    const r = await ev(() => ({ s:document.querySelector('#f-sname').value, n:document.querySelector('#f-sn').value, eds:document.querySelector('#feds').innerText,
      esp:document.querySelector('[data-fmt="especial"]').dataset.av, en:document.querySelector('[data-lang="en"]').getAttribute('aria-pressed') }));
    assert(r.s === 'Fae & Alchemy' && r.n === '1', 'serie ' + JSON.stringify(r)); assert(/Books2Door/.test(r.eds) && /£22/.test(r.eds) && r.esp === 'EN' && r.en === 'true', JSON.stringify(r));
    await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    await page.fill('#addInput', 'El rey malvado'); await page.waitForSelector('#suggest [data-pick="0"]');
    await page.locator('#suggest .sg', { hasText:'El rey malvado' }).first().click(); await page.waitForSelector('#feds a', { timeout:6000 });
  });
  await test('editar el lomo cambia la vista previa y se guarda', async () => {
    await page.click('[data-spstyle="grimorio"]'); await page.click('#fsp-pal .trio >> nth=2');
    await page.click('[data-do="save"]'); await page.waitForSelector('.sheet', { state:'detached' });
    const sp = await ev(() => state.books[state.books.length - 1].spine); assert(sp && sp.style === 'grimorio' && sp.base, 'lomo ' + JSON.stringify(sp));
  });
  await test('añadir a mano un libro', async () => {
    await page.click('#btnAddManual'); await page.fill('#f-title', 'Libro de prueba'); await page.fill('#f-pages', '250');
    await page.click('[data-do="save"]'); await page.waitForSelector('.sheet', { state:'detached' });
    assert(await page.locator('.bk[aria-label^="Libro de prueba"]').count() === 1, 'no aparece');
  });
  await test('selector propio: estantería y balda del libro (la balda depende de la estantería)', async () => {
    await page.click('#btnAddManual'); await page.fill('#f-title', 'Libro movido');
    assert(await page.locator('.sheet select').count() === 0, 'quedan <select> nativos');
    const u = await ev(() => { const u = state.units.find(x => x.shelves.length > 1 && x.id !== document.querySelector('#f-unit').value); return { id:u.id, s:u.shelves.map(s => s.id) }; });
    await page.click('#f-unit'); await page.waitForSelector('.pick-sheet [role="radiogroup"]');
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
    await page.click('#r-tag'); await page.keyboard.press('Escape'); await page.waitForSelector('.pick-sheet', { state:'detached' });
    assert(await page.locator('.sheet').count() === 1, 'Escape cerró más de una hoja'); await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('selector propio: al eliminar una estantería, sus libros van a la elegida', async () => {
    const t = await ev(() => { const b = state.books.find(x => x.title === 'Libro movido'), u = { id:'tmpu', name:'Temporal', tipo:'', preset:'gen', shelves:[mkShelf('Única')] };
      state.units.push(u); b.unitId = u.id; b.shelfId = u.shelves[0].id; save(); renderAll(); openUnitForm(u.id); return state.units[2]; });
    await page.click('#u-moveto'); await page.click(`.pick-sheet [data-pv="${t.id}"]`); await page.waitForSelector('.pick-sheet', { state:'detached' });
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
    await page.click('#btnAddManual');
    const n = await ev(() => document.querySelectorAll('input:not([type=color]):not([type=checkbox]):not([type=file])').length); assert(n === 0, n + ' campos input');
    await page.fill('#f-title', 'Prueba'); await page.focus('#f-pages'); await page.keyboard.type('12a3'); await page.keyboard.press('Enter');
    const r = await ev(() => ({ t:document.querySelector('#f-title').value, p:document.querySelector('#f-pages').value })); assert(r.t === 'Prueba' && r.p === '123', JSON.stringify(r));
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('buscar y comparar datos: enseña lo distinto y aplica lo elegido', async () => {
    await ev(() => { const b = state.books.find(x => x.title === 'El rey malvado'); openBookForm({ book:{ ...b, pages:'', synopsis:'Mi sinopsis' } }); });
    await page.click('[data-do="refill"]'); await page.waitForSelector('[data-rv]', { timeout:15000 });
    const rows = await ev(() => [...document.querySelectorAll('[data-rv]')].map(o => o.dataset.rv + ':' + o.getAttribute('aria-checked')));
    assert(rows.includes('pages:true') && rows.includes('synopsis:false'), rows.join());
    await page.click('[data-do="rvapply"]'); await page.waitForSelector('[data-rv]', { state:'detached' });
    const r = await ev(() => ({ p:document.querySelector('#f-pages').value, s:document.querySelector('#f-syn').value })); assert(r.p === '336' && r.s === 'Mi sinopsis', JSON.stringify(r));
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
  await test('colores del lomo: parten de los actuales, letras elegibles y legibles', async () => {
    await ev(() => openBookForm({ book:state.books.find(x => x.title === 'El rey malvado') }));
    const r0 = await ev(() => ({ c0:document.querySelector('#fsp-c0').value, ink:document.querySelector('#fsp-ink').value }));
    await page.locator('#fsp-ink').evaluate(e => { e.value = '#ff0000'; e.dispatchEvent(new Event('input', { bubbles:true })); });
    const r1 = await ev(() => ({ c0:document.querySelector('#fsp-c0').value, col:getComputedStyle(document.querySelector('#fsp-prev .tt')).color }));
    assert(r1.c0 === r0.c0 && r1.col === 'rgb(255, 0, 0)', JSON.stringify({ r0, r1 }));
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
    const bad = await ev(() => { const out = []; state.units.forEach(u => { const th = themeOf(u); Object.keys(SPINE_STYLES).forEach(st => [['#f2d7a0', '#f6e6c0', '#ffffff'], ['#101010', '#202020', '#303030']].forEach(([b, f, a]) => {
      const div = document.createElement('div'); div.innerHTML = spineArt({ id:'q', title:'Prueba de contraste', spine:{ style:st, base:b, foil:f, accent:a, adjust:false } }, u, th).html;
      const t = div.querySelector('.tt'); if(t && !SF_KIND[st]){ const m = t.getAttribute('style').match(/color:(#[0-9a-f]{6})/i); if(m && b === '#f2d7a0' && st === 'marco' && contrast(m[1], b) < 2.5) out.push(u.name + '/' + st); } })); }); return out; });
    assert(!bad.length, 'títulos ilegibles: ' + bad.join(', '));
  });
  await test('ficha: serie completa con los tomos que faltan, audiolibro y enlaces a tiendas', async () => {
    const id = await ev(() => state.books.find(b => b.title === 'The Cruel Prince').id);
    await ev(id => openDetail(id), id); await page.waitForSelector('#d-serie');
    assert(await page.locator('#d-serie .ser-row.own').count() === 3, 'tomos propios');
    await page.click('[data-xdo="serie"]'); await page.waitForSelector('[data-addvol="4"]');
    assert(await page.locator('#d-serie .ser-row.miss').count() === 1, 'debe faltar solo el 4 (el 3.5 es un relato)');
    await page.waitForSelector('#d-audio .aud', { timeout:5000 });
    const a = await ev(() => ({ n:document.querySelectorAll('#d-audio .aud').length, t:document.querySelector('#d-audio').innerText, shops:[...document.querySelectorAll('a.chip')].map(x => x.textContent) }));
    assert(a.n === 2 && /10 h 0 min/.test(a.t) && /Caitlin Kelly/.test(a.t), JSON.stringify(a)); assert(a.shops.some(s => /Amazon/.test(s)) && a.shops.some(s => /Buscalibre/.test(s)), a.shops.join());
    await page.click('[data-adrama]'); assert(await ev(id => bookOf(id).audioDrama, id) === true, 'dramatizado');
    await page.click('[data-addvol="4"]'); await page.waitForSelector('#f-title');
    const f = await ev(() => ({ t:document.querySelector('#f-title').value, s:document.querySelector('#f-sname').value, n:document.querySelector('#f-sn').value }));
    assert(f.t === 'The Stolen Heir' && f.s === 'The Folk of the Air' && f.n === '4', JSON.stringify(f));
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('título en español: buscar y comparar lo ofrece y guarda el original', async () => {
    await ev(() => { const b = state.books.find(x => x.title === 'El rey malvado'); openBookForm({ book:{ ...b, title:'The Wicked King', origTitle:'' } }); });
    await page.click('[data-do="refill"]'); await page.waitForSelector('[data-rv]', { timeout:15000 });
    const rows = await ev(() => [...document.querySelectorAll('[data-rv]')].map(o => o.dataset.rv + ':' + o.getAttribute('aria-checked')));
    assert(rows.includes('esTitle:true'), rows.join());
    await page.click('[data-do="rvapply"]'); await page.waitForSelector('[data-rv]', { state:'detached' });
    const r = await ev(() => ({ t:document.querySelector('#f-title').value, n:document.querySelector('#f-estit').innerText }));
    assert(r.t === 'El rey malvado' && /The Wicked King/.test(r.n), JSON.stringify(r));
    await page.click('.sheet [data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('Ajustes: completar sinopsis que faltan', async () => {
    await ev(() => { state.books.forEach(b => { if(!b.synopsis) b.synopsis = 'Texto puesto para la prueba en español, con la historia de la que va el libro.'; }); const b = state.books.find(x => x.title === 'El rey malvado'); b.synopsis = ''; save(); });
    await page.click('#btnSettings'); await page.click('[data-do="fillsyn"]');
    await page.waitForFunction(() => /completada/.test(document.querySelector('#s-fill').textContent), null, { timeout:30000 });
    const s = await ev(() => state.books.find(x => x.title === 'El rey malvado').synopsis); assert(/Sinopsis oficial/.test(s), s);
    await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
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
    await page.click('.slide[data-i="0"] [data-act="editUnit"]'); await page.click('[data-dmode="manual"]'); await page.click('[data-dadd="buho"]'); await page.click('#u-save');
    await page.waitForSelector('.sheet', { state:'detached' }); await page.waitForTimeout(300);
    const n = await page.locator('.slide[data-i="0"] .dcm').count(); assert(n >= 1, 'no hay objetos');
    await page.locator('.slide[data-i="0"] .dcm').first().click(); await page.waitForSelector('[data-do="drm"]'); await page.click('[data-do="drm"]'); await page.waitForTimeout(400);
    assert(await page.locator('.slide[data-i="0"] .dcm').count() === n - 1, 'no se quitó');
  });
  await test('libro al azar con filtro de saga', async () => {
    await page.click('#btnRandom'); await page.click('[data-kd="saga"]'); await page.waitForTimeout(200);
    const t = await page.locator('#r-card').innerText(); assert(t.length > 0, 'vacío'); await page.click('[data-close]'); await page.waitForSelector('.sheet', { state:'detached' });
  });
  await test('guardar copia descarga un JSON válido', async () => {
    await page.click('#btnSettings'); const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-do="export"]')]);
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
    const p2 = dev2.p; await p2.click('#btnAddManual'); await p2.fill('#f-title', 'Desde el otro móvil'); await p2.click('[data-do="save"]');
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
    await p3.click('#btnAddManual'); await p3.fill('#f-title', 'Solo en el tercero'); await p3.click('[data-do="save"]'); await p3.waitForSelector('.sheet', { state:'detached' });
    await p3.waitForSelector('#cloudban:not([hidden])', { timeout:3000 });
    await p3.click('#cloudban [data-cloud="login"]'); await p3.waitForSelector('[data-join="join"]', { timeout:5000 }); await p3.click('[data-join="join"]');
    await until(() => dbTitles().includes('Solo en el tercero'), 8000, 'no se juntó');
    const r = await p3.evaluate(() => ({ u:state.units.length, titles:state.books.map(b => b.title) }));
    assert(r.u === db.row.data.units.length && r.u === 6, 'estanterías ' + r.u);
    assert(new Set(r.titles).size === r.titles.length, 'libros repetidos: ' + r.titles.join(', '));
    assert(await p3.locator('#cloudban:not([hidden])').count() === 0, 'el aviso sigue');
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
