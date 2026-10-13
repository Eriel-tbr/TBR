'use strict';
/* Mi TBR — etiquetas y balda sugerida */
/* ---------- Etiquetas y estantería sugerida ---------- */
const TAGMAP = [
  ['fantasía', ['fantasy','fantasia','magic','magia','wizard','sword','espada','elves','elfos']],
  ['épica', ['epic fantasy','fantasia epica','epica','epic','quest','kingdom','reino']],
  ['gótica', ['gothic','gotic','manor','mansion','haunted','victorian','victoriana']],
  ['romance', ['romance','love stories','romantic','historias de amor','novela romantica']],
  ['fae', ['fae','faerie','faery','fairies','hadas','fairy']],
  ['brujas', ['witch','bruja','sorcer']],
  ['dragones', ['dragon']],
  ['ciencia ficción', ['science fiction','ciencia ficcion','sci-fi','space opera','alien','robot']],
  ['distopía', ['dystopi','distopi']],
  ['terror', ['horror','terror']],
  ['thriller', ['thriller','suspense','suspenso']],
  ['misterio', ['mystery','misterio','detective','murder','asesinato']],
  ['histórica', ['historical fiction','novela historica','historical']],
  ['juvenil', ['young adult','juvenil','teen']],
  ['clásico', ['classic','clasic']],
  ['psicología', ['psycholog','psicolog','cognitive']],
  ['ensayo', ['essay','ensayo']],
  ['ciencia', ['science','ciencia','biolog','genetic','neuro']],
  ['no ficción', ['nonfiction','non-fiction','no ficcion','biography','memoir','biografia']]
];
function suggestTags(item){
  const hay = norm([...(item.subjects || []), item.desc || '', item.title || ''].join(' | '));
  const out = [];
  for(const [tag, kws] of TAGMAP) if(kws.some(k => hay.includes(norm(k)))) out.push(tag);
  if(out.includes('fantasía') && out.includes('romance')) out.unshift('romantasy');
  return [...new Set(out)].slice(0, 6);
}
function suggestShelf(state, tags){
  // Las etiquetas están ordenadas de más a menos específica: las primeras pesan un poco más al desempatar.
  const nt = tags.map(norm); let best = null, score = 0;
  for(const u of state.units){
    const un = norm(u.name);
    for(const sh of u.shelves){
      const sn = norm(sh.name); let s = 0;
      nt.forEach((t, i) => {
        const w = 1 + (nt.length - i) * 0.05;
        if(sn === t) s += 4 * w; else if(sn && (sn.includes(t) || t.includes(sn))) s += 2 * w;
        if(un === t) s += 3 * w; else if(un && (un.includes(t) || t.includes(un))) s += 1 * w;
      });
      if(s > score){ score = s; best = { unitId:u.id, shelfId:sh.id }; }
    }
  }
  return best;
}
