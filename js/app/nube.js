'use strict';
/* Mi TBR — copia en la nube (Supabase) con cuenta de Google.
   La app sigue funcionando sin cuenta: los datos viven en este dispositivo y, si inicias sesión,
   se juntan con los de la nube libro a libro (gana el cambio más reciente; un borrado más reciente también gana). */
const SB_URL = 'https://fntxlswnspecswzsprwz.supabase.co';
const SB_KEY = 'sb_publishable_ZN1abSOh7MkNBFTrQaVSEg_-ZAb6hWY'; // clave pública por diseño (la protección está en las reglas RLS)
const SYNC_KEY = 'tbr.sync.v1', BANNER_KEY = 'tbr.nube.aviso', BUCKET = 'tbr-portadas';

const nube = { sb:null, user:null, busy:false, again:false, rev:0, last:0, err:'', ch:null, t:null };
let syncMeta = (() => { try{ return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; }catch(e){ return {}; } })();
const saveMeta = () => { try{ localStorage.setItem(SYNC_KEY, JSON.stringify(syncMeta)); }catch(e){} };

/* ---------- Marcar qué ha cambiado en este dispositivo ---------- */
const entHash = x => { const { upd, coverPal, coverPalSrc, audio, ...r } = x; return hash(JSON.stringify(r)); }; // lo calculado en segundo plano no cuenta como cambio (si no, un libro borrado en otro móvil podía «revivir»)
const metaHash = s => hash(JSON.stringify([s.settings, s.seriesStyle, s.units.map(u => u.id)]));
function hashAll(s){ const h = { b:{}, u:{}, m:metaHash(s) }; s.books.forEach(b => h.b[b.id] = entHash(b)); s.units.forEach(u => h.u[u.id] = entHash(u)); return h; }
function syncStamp(){
  const now = Date.now(), old = syncMeta.h; if(!old){ syncMeta.h = hashAll(state); saveMeta(); return; }
  const h = hashAll(state); let changed = false; state.deleted = state.deleted || {};
  for(const [k, list] of [['b', state.books], ['u', state.units]]){
    list.forEach(x => { if(old[k][x.id] !== h[k][x.id]){ x.upd = now; changed = true; } });
    Object.keys(old[k]).forEach(id => { if(!(id in h[k])){ state.deleted[id] = now; changed = true; } });
  }
  if(old.m !== h.m){ state.metaUpd = now; changed = true; }
  if(changed && state.fresh) delete state.fresh;
  syncMeta.h = hashAll(state); saveMeta();
}
if(!syncMeta.h){ syncMeta.h = hashAll(state); saveMeta(); }

/* ---------- Juntar dos colecciones ---------- */
function mergeStates(a, b){
  const del = { ...(a.deleted || {}) }; Object.entries(b.deleted || {}).forEach(([id, t]) => { if(!(del[id] >= t)) del[id] = t; });
  const old = Date.now() - 180 * 86400000; Object.keys(del).forEach(id => { if(del[id] < old) delete del[id]; });
  const pick = (la, lb) => { const m = new Map(); [...la, ...lb].forEach(x => { const c = m.get(x.id); if(!c || (x.upd || 0) > (c.upd || 0)) m.set(x.id, x); });
    return [...m.values()].filter(x => !(del[x.id] >= (x.upd || 0))); };
  const newer = (b.metaUpd || 0) > (a.metaUpd || 0) ? b : a, other = newer === a ? b : a;
  const order = [...newer.units.map(u => u.id), ...other.units.map(u => u.id)];
  const units = pick(a.units, b.units).sort((x, y) => order.indexOf(x.id) - order.indexOf(y.id));
  const out = { v:1, settings:newer.settings || other.settings || { theme:'auto', decor:true }, seriesStyle:{ ...(other.seriesStyle || {}), ...(newer.seriesStyle || {}) },
    units, books:pick(a.books, b.books), deleted:del, metaUpd:Math.max(a.metaUpd || 0, b.metaUpd || 0) };
  return fixOrphans(out);
}
/* Libros cuya estantería ya no existe: van a la primera balda de su mueble, o a la primera de todas */
function fixOrphans(s){
  if(!s.units.length) s.units.push({ id:uid(), name:'Mi estantería', tipo:'', preset:'generico', shelves:[mkShelf('General')], upd:Date.now() });
  s.units.forEach(u => { if(!u.shelves || !u.shelves.length){ u.shelves = [mkShelf('General')]; u.upd = Date.now(); } });
  s.books.forEach(bk => {
    const u = s.units.find(x => x.id === bk.unitId), ok = u && u.shelves.some(sh => sh.id === bk.shelfId);
    if(!ok){ const t = u || s.units[0]; bk.unitId = t.id; bk.shelfId = t.shelves[0].id; bk.upd = Date.now(); }
  });
  return s;
}
/* Primera vez que se juntan un dispositivo y la nube: muebles y baldas con el mismo nombre se funden
   y los libros repetidos (mismo título y autor) no se duplican. */
function joinFirst(local, remote){
  const L = JSON.parse(JSON.stringify(local)), uMap = {}, sMap = {}, now = Date.now();
  L.units = L.units.filter(u => {
    const r = remote.units.find(x => norm(x.name) === norm(u.name)); if(!r) return true;
    uMap[u.id] = r.id; u.shelves.forEach(sh => { const rs = r.shelves.find(x => norm(x.name) === norm(sh.name));
      if(rs) sMap[sh.id] = rs.id; else { r.shelves.push(sh); r.upd = now; } });
    return false;
  });
  const key = bk => norm(bk.title) + '|' + norm(bk.author), have = new Set(remote.books.map(key));
  L.books = L.books.filter(bk => !have.has(key(bk)));
  L.books.forEach(bk => { if(uMap[bk.unitId]){ bk.unitId = uMap[bk.unitId]; bk.shelfId = sMap[bk.shelfId] || bk.shelfId; bk.upd = now; } });
  L.deleted = {}; L.metaUpd = 0;
  return mergeStates(L, remote);
}
const isFresh = s => s.fresh || !s.books.some(b => !b.ejemplo) && s.units.every(u => !u.upd);

/* ---------- Portadas subidas: pasan de dentro de los datos a Storage ---------- */
async function migrateCovers(){
  const list = state.books.filter(b => (b.coverData || '').startsWith('data:')); let n = 0;
  for(const b of list){
    try{
      const blob = await (await fetch(b.coverData)).blob(), path = `${nube.user.id}/${b.id}-${hash(b.coverData).toString(36)}.jpg`;
      const { error } = await nube.sb.storage.from(BUCKET).upload(path, blob, { upsert:true, contentType:blob.type || 'image/jpeg' });
      if(error) continue;
      b.coverData = nube.sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl; n++;
    }catch(e){}
  }
  if(n){ syncStamp(); writeLocal(); }
}

/* ---------- Sincronizar ---------- */
const writeLocal = () => writeState();
function syncSoon(ms = 2500){ if(!nube.user) return; clearTimeout(nube.t); nube.t = setTimeout(syncNow, ms); }
async function syncNow(manual){
  if(!nube.sb || !nube.user) return false;
  if(nube.busy){ nube.again = true; return false; }
  if(!manual && ((typeof sheets !== 'undefined' && sheets.length) || (typeof drag !== 'undefined' && drag))){ syncSoon(3000); return false; } // no cambiar datos con una ventana abierta
  if(navigator.onLine === false){ nube.err = 'Sin conexión'; updateCloudUi(); return false; }
  nube.busy = true; nube.err = ''; updateCloudUi(); clearTimeout(saveT); syncStamp(); writeLocal();
  let ok = false, choice = null;
  try{
    await migrateCovers();
    for(let tries = 0; tries < 4 && !ok; tries++){
      const { data:row, error } = await nube.sb.from('tbr_state').select('data,rev').eq('user_id', nube.user.id).maybeSingle();
      if(error) throw error;
      const first = syncMeta.uid !== nube.user.id;
      let merged;
      if(!row) merged = JSON.parse(JSON.stringify(state));
      else if(first && isFresh(state)) merged = row.data;
      else if(first){ choice = choice || await askFirstJoin(row.data); if(!choice){ nube.busy = false; updateCloudUi(); return false; }
        merged = choice === 'cloud' ? row.data : choice === 'local' ? JSON.parse(JSON.stringify(state)) : joinFirst(state, row.data); if(choice === 'local') row.force = true; }
      else merged = mergeStates(state, row.data);
      delete merged.fresh;
      const same = row && !row.force && JSON.stringify(merged) === JSON.stringify(row.data);
      if(!row){ const { error:e2 } = await nube.sb.from('tbr_state').insert({ user_id:nube.user.id, data:merged, rev:1 }); if(e2){ if(e2.code === '23505') continue; throw e2; } nube.rev = 1; }
      else if(!same){
        const { data:upd, error:e3 } = await nube.sb.from('tbr_state').update({ data:merged, rev:row.rev + 1 }).eq('user_id', nube.user.id).eq('rev', row.rev).select('rev');
        if(e3) throw e3; if(!upd || !upd.length) continue; // otro dispositivo guardó a la vez: se repite
        nube.rev = row.rev + 1;
      } else nube.rev = row.rev;
      applyState(merged); syncMeta.uid = nube.user.id; nube.last = Date.now(); syncMeta.last = nube.last; saveMeta(); ok = true;
    }
    if(!ok) throw new Error('conflicto');
  }catch(e){ nube.err = navigator.onLine === false ? 'Sin conexión' : 'No se pudo sincronizar'; console.warn('Mi TBR nube', e); }
  nube.busy = false; updateCloudUi();
  if(nube.again){ nube.again = false; syncSoon(500); }
  return ok;
}
function applyState(s){
  const before = JSON.stringify(state); state = s; state.seriesStyle = state.seriesStyle || {}; state.settings = state.settings || { theme:'auto', decor:true };
  syncMeta.h = hashAll(state); writeLocal();
  if(JSON.stringify(state) !== before){ ui.active = Math.min(ui.active, state.units.length - 1); applyTheme(); renderAll(); if(typeof refreshCoverPals === 'function') setTimeout(refreshCoverPals, 1000); }
}
/* Dispositivo con libros propios que se junta por primera vez con una nube que ya tiene datos */
function askFirstJoin(remote){
  return new Promise(res => {
    const mine = state.books.filter(b => !b.ejemplo).length, theirs = remote.books.filter(b => !b.ejemplo).length;
    const sh = openSheet(sheetT('Juntar colecciones', `<p>En la nube ya hay una colección con <b>${theirs}</b> ${theirs === 1 ? 'libro' : 'libros'} y en este dispositivo tienes <b>${mine}</b>. ¿Qué hacemos?</p>
      <div class="actions col"><button class="btn primary" type="button" data-join="join">Juntar las dos (sin repetir libros ni estanterías)</button>
      <button class="btn" type="button" data-join="cloud">Quedarme con la de la nube</button>
      <button class="btn danger" type="button" data-join="local">Quedarme con la de este dispositivo</button></div>
      <p class="note">La nube guarda copias automáticas de días anteriores por si algo sale mal.</p>`), () => res(done));
    let done = null;
    sh.addEventListener('click', async e => { const b = e.target.closest('[data-join]'); if(!b) return; done = b.dataset.join; await closeSheet(); });
  }).then(async c => { if(c) await new Promise(r => setTimeout(r, 50)); return c; });
}

/* ---------- Cuenta ---------- */
async function cloudLogin(){
  if(!nube.sb){ toast('No se puede conectar con la nube ahora mismo'); return; }
  const { error } = await nube.sb.auth.signInWithOAuth({ provider:'google', options:{ redirectTo:location.origin + location.pathname } });
  if(error) toast('No se pudo abrir el inicio de sesión');
}
async function cloudLogout(){
  if(!nube.sb) return; await syncNow(true).catch(() => {}); await nube.sb.auth.signOut().catch(() => {});
  setUser(null); toast('Sesión cerrada. Tus libros siguen en este dispositivo.');
}
function setUser(u){
  const was = nube.user && nube.user.id; nube.user = u || null;
  if(nube.ch){ nube.sb.removeChannel(nube.ch); nube.ch = null; }
  if(nube.user){
    nube.ch = nube.sb.channel('tbr-' + nube.user.id)
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'tbr_state', filter:'user_id=eq.' + nube.user.id },
        p => { if(p.new && p.new.rev !== nube.rev) syncSoon(400); }).subscribe();
    if(was !== nube.user.id) syncNow();
  }
  updateCloudUi();
}
function initCloud(){
  if(!window.supabase || !window.supabase.createClient){
    // La librería se descarga aparte (async) para que la app no espere por ella
    const tag = document.getElementById('sb-lib');
    if(tag && !initCloud.waiting){ initCloud.waiting = true; tag.addEventListener('load', initCloud, { once:true }); tag.addEventListener('error', updateCloudUi, { once:true }); }
    return updateCloudUi();
  }
  if(nube.sb) return;
  try{ nube.sb = window.supabase.createClient(SB_URL, SB_KEY, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, flowType:'pkce', storageKey:'tbr.auth' } }); }
  catch(e){ return updateCloudUi(); }
  nube.last = syncMeta.last || 0;
  nube.sb.auth.onAuthStateChange((ev, session) => { setTimeout(() => { const u = session && session.user;
    if((u && u.id) !== (nube.user && nube.user.id)) setUser(u); }, 0); });
  nube.sb.auth.getSession().then(({ data }) => { const u = data && data.session && data.session.user; if(u && !nube.user) setUser(u); else updateCloudUi(); }).catch(() => updateCloudUi());
  addEventListener('online', () => syncSoon(500));
  document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') syncSoon(300); else if(nube.user){ clearTimeout(nube.t); syncNow(); } });
}

/* ---------- Pantalla ---------- */
const ago = t => { const s = (Date.now() - t) / 1000; return s < 60 ? 'hace un momento' : s < 3600 ? `hace ${Math.round(s / 60)} min` : s < 86400 ? `hace ${Math.round(s / 3600)} h` : new Date(t).toLocaleDateString('es'); };
function cloudSecHtml(){
  if(!nube.sb) return `<p class="note">Ahora mismo no se puede conectar con la nube (¿sin conexión?). Tus libros están guardados en este dispositivo.</p>`;
  if(!nube.user) return `<p class="note">Entra con Google para tener la colección en la nube y en todos tus dispositivos. Sin cuenta, todo funciona solo en este.</p>
    <div class="actions"><button class="btn primary" type="button" data-cloud="login">Entrar con Google</button></div>`;
  const st = nube.busy ? 'Sincronizando…' : nube.err ? nube.err + ' · se reintentará solo' : nube.last ? 'Sincronizado ' + ago(nube.last) : 'Pendiente de sincronizar';
  return `<div class="notice cloud-st${nube.err ? ' bad' : ''}"><b>${esc(nube.user.email || 'Cuenta de Google')}</b><br><span id="cloud-st">${esc(st)}</span></div>
    <div class="actions"><button class="btn" type="button" data-cloud="sync">Sincronizar ahora</button><button class="btn" type="button" data-cloud="logout">Cerrar sesión</button></div>`;
}
function updateCloudUi(){
  const sec = document.getElementById('cloud-sec'); if(sec) sec.innerHTML = cloudSecHtml();
  const ban = document.getElementById('cloudban'); if(!ban) return;
  let off = false; try{ off = localStorage.getItem(BANNER_KEY) === 'no'; }catch(e){}
  const show = nube.sb && !nube.user && !off && state.books.some(b => !b.ejemplo);
  ban.hidden = !show;
  if(show) ban.innerHTML = `<span>Guarda tu colección en la nube para no perderla y verla en otros dispositivos.</span><button class="btn sm primary" type="button" data-cloud="login">Entrar con Google</button><button class="iconbtn sm" type="button" data-cloud="hide" aria-label="No mostrar más">${ICON.x}</button>`;
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-cloud]'); if(!b) return; const a = b.dataset.cloud;
  if(a === 'login') cloudLogin();
  else if(a === 'logout') cloudLogout();
  else if(a === 'sync'){ const ok = await syncNow(true); if(ok) toast('Colección sincronizada'); }
  else if(a === 'hide'){ try{ localStorage.setItem(BANNER_KEY, 'no'); }catch(err){} updateCloudUi(); }
});
