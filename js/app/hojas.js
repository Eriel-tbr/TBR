'use strict';
/* Mi TBR — ventanas (hojas) y avisos */
/* ---------- Hojas (ventanas) ---------- */
const sheets = []; let popRes = null;
const sheetT = (title, body, foot = '', bar = '') => `<div class="sheet-head"><h2>${esc(title)}</h2><button class="iconbtn sm" type="button" data-close aria-label="Cerrar">${ICON.x}</button></div>${bar}<div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}`;
/* ---------- Pestañas y secciones plegables ----------
   La barra de pestañas va fija bajo el título de la hoja; los paneles están todos en el DOM (los no elegidos, ocultos),
   así el código de cada hoja sigue encontrando sus campos. La última pestaña usada de cada grupo se recuerda en la sesión. */
const lastTab = {};
const tabsBar = (group, tabs, cur) => `<div class="tabbar" role="tablist" aria-label="Secciones" data-tabs="${group}">${tabs.map(([k, l]) =>
  `<button class="tabb" type="button" role="tab" id="tb-${group}-${k}" data-tab="${k}" aria-controls="tp-${group}-${k}" aria-selected="${k === cur}" tabindex="${k === cur ? 0 : -1}">${esc(l)}</button>`).join('')}</div>`;
const tabPanel = (group, k, cur, html) => `<div class="tabpanel" role="tabpanel" id="tp-${group}-${k}" aria-labelledby="tb-${group}-${k}" data-panel="${group}:${k}"${k === cur ? '' : ' hidden'}>${html}</div>`;
const startTab = (group, tabs, def) => tabs.some(([k]) => k === lastTab[group]) ? lastTab[group] : def || tabs[0][0];
function showTab(sh, group, k){
  const bar = $(`.tabbar[data-tabs="${group}"]`, sh); if(!bar) return;
  $$('[data-tab]', bar).forEach(b => { const on = b.dataset.tab === k; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; if(on) b.scrollIntoView({ block:'nearest', inline:'nearest' }); });
  $$(`[data-panel^="${group}:"]`, sh).forEach(p => p.hidden = p.dataset.panel !== group + ':' + k);
  lastTab[group] = k; const body = $('.sheet-body', sh); if(body) body.scrollTop = 0;
}
document.addEventListener('click', e => { const b = e.target.closest('.tabbar [data-tab]'); if(b) showTab(b.closest('.sheet'), b.closest('.tabbar').dataset.tabs, b.dataset.tab); });
document.addEventListener('keydown', e => { const b = e.target.closest && e.target.closest('.tabbar [data-tab]'); if(!b || !/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) return;
  const all = $$('[data-tab]', b.parentElement), i = all.indexOf(b), j = { ArrowLeft:i - 1, ArrowRight:i + 1, Home:0, End:all.length - 1 }[e.key], n = all[(j + all.length) % all.length];
  e.preventDefault(); n.focus(); n.click(); });
const fold = (title, body, open = false, extra = '') => `<details class="fold"${open ? ' open' : ''} ${extra}><summary><span>${title}</span></summary><div class="fold-b">${body}</div></details>`;
function openSheet(html, onClose){
  const back = document.createElement('div'); back.className = 'backdrop';
  const sh = document.createElement('div'); sh.className = 'sheet' + (html.includes('class="tabbar"') ? ' tabbed' : ''); sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.innerHTML = html;
  // Cada hoja nueva va por encima de la anterior con su fondo: así la de abajo queda oscurecida y no recibe toques
  const z = 90 + sheets.length * 20; back.style.zIndex = z; sh.style.zIndex = z + 10;
  back.addEventListener('click', () => closeSheet());
  sh.addEventListener('click', e => { if(e.target.closest('[data-close]')) closeSheet(); });
  document.body.append(back, sh); sheets.push({ back, sh, onClose }); history.pushState({ sheet:sheets.length }, '');
  const af = sh.querySelector('[data-autofocus]'); if(af) af.focus();
  return sh;
}
function popNow(){ const r = sheets.pop(); if(r){ r.back.remove(); r.sh.remove(); r.onClose && r.onClose(); } const f = popRes; popRes = null; f && f(); }
/* Formularios con cambios sin guardar: sh.guard() dice si los hay. Al cerrar (X, fondo, Cancelar o el gesto atrás) se pregunta antes.
   Al guardar, el formulario pone sh.guard = null para cerrarse sin preguntar. */
let asking = null;
function askDiscard(){
  if(asking) return asking;
  return asking = new Promise(res => { let out = false;
    const sh = openSheet(sheetT('¿Descartar los cambios?', '<p class="note">Hay cambios sin guardar.</p>',
      '<button class="btn" type="button" data-close>Seguir editando</button><button class="btn danger" type="button" data-do="discard">Descartar</button>'), () => { asking = null; res(out); });
    sh.classList.add('ask-sheet');
    sh.addEventListener('click', e => { if(e.target.closest('[data-do="discard"]')){ out = true; closeSheet(); } });
  });
}
const dirtyTop = () => { const t = sheets[sheets.length - 1]; return !!(t && t.sh.guard && t.sh.guard()); };
let closing = null;
function closeSheet(){ // dos cierres seguidos de la misma hoja no deben retroceder dos veces (se saldría de la app)
  if(closing) return closing;
  if(dirtyTop()){ const top = sheets[sheets.length - 1]; return askDiscard().then(ok => { if(!ok || sheets[sheets.length - 1] !== top) return; top.sh.guard = null; return closeSheet(); }); }
  return closing = new Promise(res => { if(!sheets.length){ closing = null; return res(); } popRes = () => { closing = null; res(); }; const mine = popRes; history.back(); setTimeout(() => { if(popRes === mine) popNow(); }, 350); });
}
addEventListener('popstate', () => {
  if(!sheets.length) return;
  // Gesto atrás del móvil sobre un formulario con cambios: se vuelve a poner la entrada del historial y se pregunta
  if(!closing && dirtyTop()){ history.pushState({ sheet:sheets.length }, ''); const top = sheets[sheets.length - 1];
    askDiscard().then(ok => { if(ok && sheets[sheets.length - 1] === top){ top.sh.guard = null; closeSheet(); } }); return; }
  popNow();
});
addEventListener('keydown', e => { if(e.key === 'Escape'){ if(sheets.length) closeSheet(); else hideSuggest(); } });
let toastT = null;
function toast(msg, undo){
  const el = $('#toast'); clearTimeout(toastT);
  el.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button">Deshacer</button>' : ''}`; el.hidden = false;
  if(undo) el.querySelector('button').onclick = () => { undo(); el.hidden = true; };
  toastT = setTimeout(() => { el.hidden = true; }, undo ? 7000 : 3800);
}
const chipsHtml = (items, cur, attr) => items.map(([v, l]) => `<button class="chip" type="button" ${attr}="${esc(v)}" aria-pressed="${cur === v}">${esc(l)}</button>`).join('');
/* ---------- Selector propio (sustituye a los <select> nativos) ----------
   Es un botón con la etiqueta y el valor elegido. Al tocarlo abre una hoja pequeña con las opciones.
   Se comporta como un <select>: el valor está en btn.value y al cambiar lanza un evento «change» que sube por el DOM. */
const CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>';
const pickOpt = (opts, cur) => opts.find(([v]) => v === cur) || opts[0] || ['', ''];
const pickHtml = (id, label, opts, cur) => { const [v, l] = pickOpt(opts, cur);
  return `<button class="field pick" type="button" id="${id}" value="${esc(v)}" aria-haspopup="dialog" aria-expanded="false" data-label="${esc(label)}" data-opts="${esc(JSON.stringify(opts))}"><span class="pick-t"><small>${esc(label)}</small><span class="pick-v">${esc(l)}</span></span>${CHEVRON}</button>`; };
function setPick(btn, opts, cur){ // cambia opciones y/o valor sin abrir la hoja (no lanza «change»)
  if(opts) btn.dataset.opts = JSON.stringify(opts); else opts = JSON.parse(btn.dataset.opts);
  const [v, l] = pickOpt(opts, cur); btn.value = v; $('.pick-v', btn).textContent = l;
}
function openPick(btn){
  const opts = JSON.parse(btn.dataset.opts), label = btn.dataset.label, cur = pickOpt(opts, btn.value)[0];
  const list = opts.map(([v, l]) => `<button class="opt" type="button" role="radio" data-pv="${esc(v)}" aria-checked="${v === cur}" tabindex="${v === cur ? 0 : -1}" ${v === cur ? 'data-autofocus' : ''}><span class="dot"></span><span class="opt-l">${esc(l)}</span></button>`).join('');
  const sh = openSheet(sheetT(label, `<div class="row-opts" role="radiogroup" aria-label="${esc(label)}">${list}</div>`), () => { btn.setAttribute('aria-expanded', 'false'); if(btn.isConnected) btn.focus({ preventScroll:true }); });
  btn.setAttribute('aria-expanded', 'true');
  sh.classList.add('pick-sheet');
  sh.addEventListener('click', e => {
    const o = e.target.closest('[data-pv]'); if(!o) return;
    const v = o.dataset.pv; $$('[data-pv]', sh).forEach(x => x.setAttribute('aria-checked', x === o));
    if(v !== btn.value){ setPick(btn, opts, v); btn.dispatchEvent(new Event('change', { bubbles:true })); }
    closeSheet();
  });
  sh.addEventListener('keydown', e => { // flechas, Inicio y Fin para moverse por las opciones con teclado
    const all = $$('[data-pv]', sh), i = all.indexOf(document.activeElement); if(i < 0) return;
    const j = { ArrowDown:i + 1, ArrowRight:i + 1, ArrowUp:i - 1, ArrowLeft:i - 1, Home:0, End:all.length - 1 }[e.key]; if(j === undefined) return;
    e.preventDefault(); const n = all[(j + all.length) % all.length]; all.forEach(x => x.tabIndex = x === n ? 0 : -1); n.focus();
  });
}
document.addEventListener('click', e => { const b = e.target.closest('.pick'); if(b && !b.disabled) openPick(b); });
const langBadges = b => { const k = langKind(b); return k === 'both' ? '<span class="badge both">ES · EN</span>' : k === 'es' ? '<span class="badge es">ES</span>' : k === 'en' ? '<span class="badge en">EN</span>' : ''; };
const locName = b => { const l = shelfOf(b.shelfId); return l ? `${l.u.name} › ${l.s.name}` : ''; };
/* Ediciones encontradas: en español (fichas con datos de las editoriales) y en inglés (Books2Door) */
const FMT_NAME = { blanda:'Tapa blanda', dura:'Tapa dura', bolsillo:'Bolsillo', especial:'Edición especial', ebook:'Ebook', audio:'Audiolibro' };
const edFmtSet = eds => new Set((eds || []).filter(e => !e.set).map(e => e.fmt === 'bolsillo' ? 'blanda' : e.fmt).filter(Boolean));
function edAvail(b){ const es = edFmtSet(b.eds), en = edFmtSet(b.edsEn), out = {};
  FORMATS.forEach(([k]) => { const l = [es.has(k) && 'ES', en.has(k) && 'EN'].filter(Boolean).join('·'); if(l) out[k] = l; }); return out; }
/* Campos de una línea (textarea .one, ver lineHtml): Enter termina en vez de saltar de línea; sin saltos al pegar; los numéricos solo admiten cifras */
document.addEventListener('input', e => { const t = e.target; if(!t.classList || !t.classList.contains('one')) return;
  const v = 'num' in t.dataset ? t.value.replace(/\D/g, '') : t.value.replace(/[\r\n]+/g, ' ');
  if(v !== t.value){ const p = Math.min(t.selectionStart, v.length); t.value = v; t.setSelectionRange(p, p); } }, true);
document.addEventListener('keydown', e => { const t = e.target;
  if(e.key !== 'Enter' || e.isComposing || !t.classList || !t.classList.contains('one') || e.defaultPrevented) return;
  e.preventDefault(); t.dispatchEvent(new Event('change', { bubbles:true })); t.blur(); });
/* Pedir un nombre en una hoja pequeña (crear balda o estantería sin salir de lo que se está haciendo) */
function askName(title, label, placeholder = ''){
  return new Promise(res => { let out = null;
    const sh = openSheet(sheetT(title, `<div class="sec"><label for="an-name">${esc(label)}</label>${lineHtml(`class="field" id="an-name" placeholder="${esc(placeholder)}" data-autofocus enterkeyhint="done"`)}</div>`,
      '<button class="btn" type="button" data-close>Cancelar</button><button class="btn primary" type="button" data-do="anok">Crear</button>'), () => res(out));
    const ok = async () => { if(out !== null) return; const v = $('#an-name', sh).value.trim(); if(!v){ toast('Escribe un nombre'); return; } out = v; await closeSheet(); }; // una sola vez: Enter lanza «change» y luego el blur otro
    sh.addEventListener('click', e => { if(e.target.closest('[data-do="anok"]')) ok(); });
    sh.addEventListener('change', e => { if(e.target.id === 'an-name' && e.target.value.trim()) ok(); });
  });
}
async function newShelfIn(unitId){
  const u = unitOf(unitId); if(!u) return null;
  const name = await askName('Nueva balda en ' + u.name, 'Nombre de la balda', 'Cozy, Mitología, Retellings…'); if(!name) return null;
  const s = mkShelf(name); u.shelves.push(s); save(); renderAll(); toast(`Balda «${name}» creada`); return s;
}
async function newUnitQuick(){
  const name = await askName('Nueva estantería', 'Nombre de la estantería', 'Terror, Clásicos, Psicología…'); if(!name) return null;
  const u = { id:uid(), name, tipo:'', preset:detectPreset(name, ''), wood:'', decor:null, shelves:[mkShelf('General')] };
  if(u.preset === 'gen') u.hue = Math.floor(Math.random() * 360);
  state.units.push(u); save(); renderAll(); toast(`Estantería «${name}» creada. Su estilo se cambia en «Editar estantería».`); return u;
}
