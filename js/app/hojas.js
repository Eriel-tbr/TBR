'use strict';
/* Mi TBR — ventanas (hojas) y avisos */
/* ---------- Hojas (ventanas) ---------- */
const sheets = []; let popRes = null;
const sheetT = (title, body, foot = '') => `<div class="sheet-head"><h2>${esc(title)}</h2><button class="iconbtn sm" type="button" data-close aria-label="Cerrar">${ICON.x}</button></div><div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}`;
function openSheet(html, onClose){
  const back = document.createElement('div'); back.className = 'backdrop';
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.innerHTML = html;
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
const langBadges = b => { const k = langKind(b); return k === 'both' ? '<span class="badge both">ES · EN</span>' : k === 'es' ? '<span class="badge es">ES</span>' : k === 'en' ? '<span class="badge en">EN</span>' : ''; };
const locName = b => { const l = shelfOf(b.shelfId); return l ? `${l.u.name} › ${l.s.name}` : ''; };
/* Ediciones en español encontradas (fichas con los datos de las editoriales) */
const FMT_NAME = { blanda:'Tapa blanda', dura:'Tapa dura', bolsillo:'Bolsillo', especial:'Edición especial', ebook:'Ebook', audio:'Audiolibro' };
const edFormats = eds => new Set((eds || []).map(e => e.fmt === 'bolsillo' ? 'blanda' : e.fmt).filter(Boolean));
function edsHtml(eds){
  if(!eds || !eds.length) return '';
  return `<div class="eds"><span class="note">Ediciones en español encontradas:</span>${eds.map(e => {
    const bind = /no definid|^libro$|otro formato/i.test(e.binding || '') ? '' : e.binding, bits = [e.publisher, FMT_NAME[e.fmt] || bind, e.year].filter(Boolean).map(esc).join(' · ');
    return `<a href="${esc(e.url)}" target="_blank" rel="noopener">${bits || esc(e.isbn)}</a>`; }).join('')}</div>`;
}
