/* Pruebas de extremo a extremo de Mi TBR.
   Abren la app en un Chrome con tamaño de móvil, con Google Books, Open Library y Wikidata simulados.
   Uso: npm test   (o: node tests/e2e.cjs) */
const http = require('http'), fs = require('fs'), path = require('path');
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
  description:es ? 'Sinopsis en español.' : 'English blurb.', seriesInfo:{ bookDisplayNumber:'2' }, imageLinks:{} } }] });
function fakeApis(route){
  const u = route.request().url(), json = b => route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify(b) });
  if(u.includes('googleapis.com/books')) return json(GB(u.includes('langRestrict=es')));
  if(u.includes('openlibrary.org/search')) return json({ docs:[] });
  if(u.includes('wikidata.org')){
    if(u.includes('wbsearchentities')) return json({ search:[{ id:'Q1', description:'novel by Holly Black' }] });
    if(u.includes('ids=Q1')) return json({ entities:{ Q1:{ id:'Q1', labels:{ es:{ value:'El rey malvado' }, en:{ value:'The Wicked King' } }, sitelinks:{ eswiki:{}, enwiki:{} },
      claims:{ P50:[{}], P179:[{ mainsnak:{ datavalue:{ value:{ id:'Q9' } } }, qualifiers:{ P1545:[{ datavalue:{ value:'2' } }] } }] } } } });
    if(u.includes('ids=Q9')) return json({ entities:{ Q9:{ labels:{ es:{ value:'Los habitantes del aire' } }, claims:{ P527:[{}, {}, {}] } } } });
  }
  return route.abort();
}

const results = []; let page, ctx, errors = [];
async function test(name, fn){
  try{ await fn(); results.push(['ok', name]); console.log('  ✓ ' + name); }
  catch(e){ results.push(['FALLO', name, e.message]); console.log('  ✗ ' + name + '\n      ' + e.message.split('\n')[0]); }
}
const assert = (c, m) => { if(!c) throw new Error(m); };
const ev = (f, ...a) => page.evaluate(f, ...a);

(async () => {
  await new Promise(r => server.listen(0, r)); const BASE = `http://localhost:${server.address().port}/`;
  const browser = await chromium.launch();
  ctx = await browser.newContext({ viewport:{ width:390, height:844 }, deviceScaleFactor:2, hasTouch:false, serviceWorkers:'allow' });
  await ctx.route(u => /googleapis|openlibrary|wikidata|gstatic/.test(u.href), fakeApis);
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
  await test('arrastrar un libro lo mueve', async () => {
    await ev(() => goTo(0, false)); await page.waitForTimeout(300);
    const order0 = await ev(() => [...document.querySelectorAll('.slide[data-i="0"] .it[data-id]')].map(i => i.dataset.id));
    await ev(() => window.scrollTo(0, 0)); await page.locator(`.slide[data-i="0"] .it[data-id="${order0[0]}"]`).scrollIntoViewIfNeeded();
    const a = await page.locator(`.slide[data-i="0"] .it[data-id="${order0[0]}"]`).boundingBox(), b = await page.locator(`.slide[data-i="0"] .it[data-id="${order0[2]}"]`).boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height - 40); await page.mouse.down(); await page.mouse.move(a.x + 20, a.y + a.height - 30, { steps:4 });
    await page.mouse.move(b.x + b.width + 4, b.y + b.height - 40, { steps:12 }); await page.waitForTimeout(150); await page.mouse.up(); await page.waitForTimeout(400);
    const order1 = await ev(() => [...document.querySelectorAll('.slide[data-i="0"] .it[data-id]')].map(i => i.dataset.id));
    assert(order1.join() !== order0.join(), 'el orden no cambió');
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
  await test('sin errores de JavaScript en toda la prueba', async () => { assert(!errors.length, errors.join(' | ')); });

  await browser.close(); server.close();
  const bad = results.filter(r => r[0] !== 'ok');
  console.log(`\n${results.length - bad.length}/${results.length} pruebas correctas`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
