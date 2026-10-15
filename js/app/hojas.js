'use strict';
/* Mi TBR — ventanas (hojas) y avisos */
/* ---------- Hojas (ventanas) ---------- */
const sheets = []; let popRes = null;
const sheetT = (title, body, foot = '') => `<div class="sheet-head"><h2>${esc(title)}</h2><button class="iconbtn sm" type="button" data-close aria-label="Cerrar">${ICON.x}</button></div><div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}`;
function openSheet(html, onClose){
  const back = document.createElement('div'); back.className = 'backdrop';
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.innerHTML = html;
  // Cada hoja nueva va por encima de la anterior con su fondo: así la de abajo queda oscurecida y no recibe toques
  const z = 90 + sheets.length * 20; back.style.zIndex = z; sh.style.zIndex = z + 10;
  back.addEventListener('click', () => closeSheet());
  sh.addEventListener('click', e => { if(e.target.closest('[data-close]')) closeSheet(); });
  document.body.append(back, sh); sheets.push({ back, sh, onClose }); history.pushState({ sheet:sheets.length }, '');
  const af = sh.querySelector('[data-autofocus]'); if(af) af.focus();
  return sh;
}
function popNow(){ const r = sheets.pop(); if(r){ r.back.remove(); r.sh.remove(); r.onClose && r.onClose(); } const f = popRes; popRes = null; f && f(); }
function closeSheet(){
  return new Promise(res => { if(!sheets.length) return res(); popRes = res; history.back(); setTimeout(() => { if(popRes === res) popNow(); }, 350); });
}
addEventListener('popstate', () => { if(sheets.length) popNow(); });
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
function edsHtml(eds, en){
  if(!eds || !eds.length) return '';
  return `<div class="eds"><span class="note">${en ? 'En inglés, en Books2Door:' : 'Ediciones en español encontradas:'}</span>${eds.map(e => {
    const bind = /no definid|^libro$|otro formato/i.test(e.binding || '') ? '' : e.binding;
    const bits = (en ? [e.title, FMT_NAME[e.fmt], e.price, e.available === false ? 'agotado' : ''] : [e.publisher, FMT_NAME[e.fmt] || bind, e.year]).filter(Boolean).map(esc).join(' · ');
    return `<a href="${esc(e.url)}" target="_blank" rel="noopener">${bits || esc(e.isbn)}</a>`; }).join('')}</div>`;
}
