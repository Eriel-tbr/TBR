'use strict';
/* Mi TBR — universos literarios (datos revisados a mano a partir de wikis y guías de fans, 28/10/2026).
   Cada universo: series con sus libros (k = clave dentro del universo, t = título en español si existe, o = original, alt = otros
   títulos con los que puede estar en la colección), orden de lectura (lista de claves; `opt` = opcional) y conexiones.
   Conexiones: kind 'confirmado' (está en los libros), 'guiño' (detalle que los fans interpretan) o 'teoria' (de fans).
   `books` = libros que hay que haber leído para verla sin tapar (vacío = sin spoilers). `src` = página de donde sale. */
const UNIVERSES = [
  { id:'maas', name:'Maasverse', author:'Sarah J. Maas',
    note:'Orden de publicación. Lee Una corte de llamas plateadas antes de Casa de cielo y aliento: el final de esta y Casa de llama y sombra dan por sabido lo que pasa en ACOTAR.',
    series:[
      { name:'Trono de cristal', world:'Erilea', books:[
        { k:'tog0', t:'La espada de la asesina', o:'The Assassin\'s Blade', y:2014, opt:true, note:'relatos precuela' },
        { k:'tog1', t:'Trono de cristal', o:'Throne of Glass', y:2012 }, { k:'tog2', t:'Corona de medianoche', o:'Crown of Midnight', y:2013 },
        { k:'tog3', t:'Heredera de fuego', o:'Heir of Fire', y:2014 }, { k:'tog4', t:'Reina de sombras', o:'Queen of Shadows', y:2015 },
        { k:'tog5', t:'Imperio de tormentas', o:'Empire of Storms', y:2016 }, { k:'tog6', t:'Torre del alba', o:'Tower of Dawn', y:2017 },
        { k:'tog7', t:'Reino de cenizas', o:'Kingdom of Ash', y:2018 }] },
      { name:'Una corte de rosas y espinas (ACOTAR)', world:'Prythian', books:[
        { k:'a1', t:'Una corte de rosas y espinas', o:'A Court of Thorns and Roses', y:2015 }, { k:'a2', t:'Una corte de niebla y furia', o:'A Court of Mist and Fury', y:2016 },
        { k:'a3', t:'Una corte de alas y ruina', o:'A Court of Wings and Ruin', y:2017 }, { k:'a4', t:'Una corte de hielo y estrellas', o:'A Court of Frost and Starlight', y:2018 },
        { k:'a5', t:'Una corte de llamas plateadas', o:'A Court of Silver Flames', y:2021 }] },
      { name:'Ciudad Medialuna (Crescent City)', world:'Midgard', books:[
        { k:'c1', t:'Casa de tierra y sangre', o:'House of Earth and Blood', y:2020 }, { k:'c2', t:'Casa de cielo y aliento', o:'House of Sky and Breath', y:2022 },
        { k:'c3', t:'Casa de llama y sombra', o:'House of Flame and Shadow', y:2024 }] }],
    order:['tog1', 'tog2', 'tog0', 'tog3', 'tog4', 'tog5', 'tog6', 'tog7', 'a1', 'a2', 'a3', 'a4', 'c1', 'a5', 'c2', 'c3'],
    links:[
      { char:'aelin', short:'Aelin entre mundos', kind:'guiño', books:['tog7'], text:'En Reino de cenizas, mientras Aelin cae entre mundos, ve otros lugares: los fans reconocen una ciudad parecida a Lunathion y a una pareja alada que sería Rhysand y Feyre.', src:'https://www.themarysue.com/are-throne-of-glass-and-acotar-related-explained/' },
      { char:'bryce', short:'Bryce en Prythian', kind:'confirmado', books:['c2', 'a5'], text:'Al final de Casa de cielo y aliento, Bryce aparece en Prythian, junto al río Sidra: la encuentra Azriel y después llegan Amren, Cassian y Nesta.', src:'https://crescentcity.fandom.com/wiki/Nesta_Archeron' },
      { char:'bryce', short:'La Corte Noche', kind:'confirmado', books:['c3'], text:'En Casa de llama y sombra, Bryce pasa tiempo en la Corte Noche: la interrogan Rhysand, Amren y Azriel, recorre unas cuevas con Azriel y Nesta, y escapa usando Truth-Teller, el cuchillo de Azriel.', src:'https://www.bookseriesrecaps.com/house-of-flame-and-shadow-summary-crescent-city-3-full-recap/' },
      { short:'Gwydion', kind:'confirmado', books:['c3', 'a5'], text:'La Espada Estelar de Bryce es Gwydion, la gemela de Truth-Teller: cuando están cerca, brillan una con luz blanca y otra con luz oscura.', src:'https://crescentcity.fandom.com/wiki/Nesta_Archeron' },
      { short:'Asteri = Daglan', kind:'confirmado', books:['c3', 'a3'], text:'Los Asteri son los Daglan, los antiguos tiranos de Prythian que se mencionan en ACOTAR.', src:'https://www.bookseriesrecaps.com/house-of-flame-and-shadow-summary-crescent-city-3-full-recap/' },
      { short:'El linaje de Theia', kind:'confirmado', books:['c3'], text:'Theia, reina de los Astrogénitos, y sus hijas Silene y Helena vienen de Prythian: el linaje de Bryce empieza allí.', src:'https://www.bookseriesrecaps.com/house-of-flame-and-shadow-summary-crescent-city-3-full-recap/' },
      { char:'nesta', short:'Vesperus', kind:'confirmado', books:['c3', 'a5'], text:'Nesta mata a Vesperus, el último Asteri que quedaba en el mundo fae.', src:'https://crescentcity.fandom.com/wiki/Nesta_Archeron' },
      { short:'Lidia y Aelin', kind:'teoria', books:['c3', 'tog7'], text:'Lidia Cervos y Aelin comparten el fuego, el ciervo de Terrasen y un nombre: uno de los hijos de Lidia se llama Brannon, como el primer rey de Terrasen. Muchos creen que hay parentesco entre los dos mundos.', src:'https://wou.edu/westernhowl/into-the-maasverse/' },
      { short:'Los Reyes del Otoño', kind:'teoria', books:['c1', 'a3'], text:'El Rey del Otoño de Valbara se parece mucho a Beron, el Gran Señor de la Corte Otoño (pelo rojo, fuego, carácter frío): se especula que su linaje viene de Prythian.', src:'https://www.themarysue.com/are-throne-of-glass-and-acotar-related-explained/' },
      { short:'Pasado, presente, futuro', kind:'teoria', books:['c3', 'tog7', 'a5'], text:'Orden temporal: ACOTAR sería el pasado, Trono de cristal el presente y Crescent City el futuro (en ACOTAR ya no hay dioses; en Trono de cristal se han ido; en Crescent City siguen).', src:'https://wou.edu/westernhowl/into-the-maasverse/' }] },

  { id:'cosmere', name:'Cosmere', author:'Brandon Sanderson',
    note:'Cada saga se entiende sola. Para pillar las conexiones: la era 1 de Nacidos de la bruma antes que la era 2, y El aliento de los dioses antes de Palabras radiantes.',
    series:[
      { name:'Nacidos de la bruma · era 1', world:'Scadrial', books:[
        { k:'mb1', t:'El imperio final', o:'The Final Empire', alt:['Nacidos de la bruma', 'Mistborn', 'Mistborn: The Final Empire', 'Nacidos de la bruma: El imperio final'], y:2006 },
        { k:'mb2', t:'El Pozo de la Ascensión', o:'The Well of Ascension', y:2007 }, { k:'mb3', t:'El Héroe de las Eras', o:'The Hero of Ages', y:2008 }] },
      { name:'Nacidos de la bruma · era 2', world:'Scadrial', books:[
        { k:'mb4', t:'Aleación de ley', o:'The Alloy of Law', y:2011 }, { k:'mb5', t:'Sombras de identidad', o:'Shadows of Self', y:2015 },
        { k:'mb6', t:'Brazales de duelo', o:'The Bands of Mourning', y:2016 }, { k:'mbs', t:'Historia secreta', o:'Mistborn: Secret History', y:2016, opt:true, note:'novela corta; mejor tras Brazales de duelo' },
        { k:'mb7', t:'El metal perdido', o:'The Lost Metal', y:2022 }] },
      { name:'Otras novelas', books:[
        { k:'el', t:'Elantris', o:'Elantris', y:2005 }, { k:'wb', t:'El aliento de los dioses', o:'Warbreaker', y:2009 },
        { k:'ark', t:'Arcanum ilimitado', o:'Arcanum Unbounded', y:2016, opt:true, note:'relatos' },
        { k:'tress', t:'Trenza del mar Esmeralda', o:'Tress of the Emerald Sea', y:2023 }, { k:'yumi', t:'Yumi y el pintor de pesadillas', o:'Yumi and the Nightmare Painter', y:2023 },
        { k:'sun', t:'El hombre iluminado', o:'The Sunlit Man', y:2023 }] },
      { name:'El archivo de las tormentas', world:'Roshar', books:[
        { k:'s1', t:'El camino de los reyes', o:'The Way of Kings', y:2010 }, { k:'s2', t:'Palabras radiantes', o:'Words of Radiance', y:2014 },
        { k:'s3', t:'Juramentada', o:'Oathbringer', y:2017 }, { k:'s4', t:'El ritmo de la guerra', o:'Rhythm of War', y:2020 }, { k:'s5', t:'Viento y verdad', o:'Wind and Truth', y:2024 }] }],
    order:['mb1', 'mb2', 'mb3', 'el', 'wb', 's1', 's2', 'mb4', 'mb5', 'mb6', 'mbs', 's3', 'ark', 's4', 'mb7', 'tress', 'yumi', 'sun', 's5'],
    links:[
      { char:'hoid', short:'El informante', kind:'guiño', books:['mb1'], text:'Hoid, el viajero que aparece en todo el Cosmere, sale en El imperio final: es el mendigo que vende información a Kelsier.', src:'https://coppermind.net/wiki/Hoid?oldid=6053' },
      { char:'sazed', short:'Armonía', kind:'confirmado', books:['mb3'], text:'Al final de la era 1, Sazed se convierte en Armonía, la unión de los Fragmentos Conservación y Ruina; se le menciona en otras sagas del Cosmere.', src:'https://coppermind.net/wiki/Cosmere' },
      { char:'kelsier', short:'Ghostbloods', kind:'confirmado', books:['mb3', 'mbs', 's4'], text:'Kelsier sigue activo después de la era 1 y funda los Ghostbloods, la organización que actúa en Roshar en El archivo de las tormentas.', src:'https://coppermind.net/wiki/Cosmere' },
      { short:'Autonomía', kind:'confirmado', books:['mb7'], text:'En El metal perdido, la trama de Trell y del Fragmento Autonomía conecta Scadrial con el resto del Cosmere; la cierran Wax, Wayne y Marasi.', src:'https://coppermind.net/wiki/Cosmere' },
      { char:'vasher', short:'Zahel', kind:'confirmado', books:['wb', 's2'], text:'Zahel, el maestro de espadas de Palabras radiantes, es Vasher, de El aliento de los dioses; Sangre Nocturna (Nightblood) también llega a Roshar.', src:'https://www.17thshard.com/forums/topic/98960-vasher-and-zahel/' },
      { char:'vivenna', short:'Azure', kind:'confirmado', books:['wb', 's3'], text:'Azure, la mercenaria de Juramentada, es Vivenna, de El aliento de los dioses.', src:'https://www.17thshard.com/forums/topic/84007-do-we-know-anything-about-why-vivenna-went-to-roshar/' }] },

  { id:'grisha', name:'Grishaverse', author:'Leigh Bardugo',
    note:'Orden de publicación: la trilogía, Seis de cuervos y Rey de cicatrices. Seis de cuervos se puede leer antes, pero da por sabido el final de la trilogía.',
    series:[
      { name:'Sombra y hueso', books:[{ k:'g1', t:'Sombra y hueso', o:'Shadow and Bone', y:2012 }, { k:'g2', t:'Asedio y tormenta', o:'Siege and Storm', y:2013 }, { k:'g3', t:'Ruina y ascenso', o:'Ruin and Rising', y:2014 }] },
      { name:'Seis de cuervos', books:[{ k:'g4', t:'Seis de cuervos', o:'Six of Crows', y:2015 }, { k:'g5', t:'Reino de ladrones', o:'Crooked Kingdom', y:2016 }] },
      { name:'Rey de cicatrices', books:[{ k:'g6', t:'Rey de cicatrices', o:'King of Scars', y:2019 }, { k:'g7', o:'Rule of Wolves', y:2021 }] },
      { name:'Extras', books:[{ k:'g8', t:'El lenguaje de las espinas', o:'The Language of Thorns', y:2017, opt:true, note:'cuentos' }] }],
    order:['g1', 'g2', 'g3', 'g4', 'g5', 'g8', 'g6', 'g7'],
    links:[
      { short:'Dos años después', kind:'confirmado', books:['g3', 'g4'], text:'Seis de cuervos transcurre unos dos años después de la trilogía y aparecen o se nombran personajes de ella.', src:'https://www.sportskeeda.com/pop-culture/do-you-have-read-shadow-bone-before-six-crows-chronology-explained' },
      { char:'nikolai', short:'Rey de cicatrices', kind:'confirmado', books:['g3', 'g6'], text:'Nikolai, que aparece en la trilogía, protagoniza Rey de cicatrices junto a Zoya.', src:'https://www.marieclaire.com/culture/a36291169/shadow-and-bone-grishaverse-books-in-order' },
      { char:'nina', short:'Nina en Fjerda', kind:'confirmado', books:['g5', 'g6'], text:'Nina, de Seis de cuervos, está en Fjerda como espía en Rey de cicatrices, y en Rule of Wolves coincide con Nikolai y Zoya.', src:'https://www.marieclaire.com/culture/a36291169/shadow-and-bone-grishaverse-books-in-order' }] },

  { id:'armentrout', name:'Sangre y cenizas · Carne y fuego', author:'Jennifer L. Armentrout',
    note:'Orden intercalado que recomiendan las guías: las dos sagas se cuentan cosas que la otra completa.',
    series:[
      { name:'Sangre y cenizas', books:[
        { k:'b1', t:'De sangre y cenizas', o:'From Blood and Ash', y:2020 }, { k:'b2', t:'Un reino de carne y fuego', o:'A Kingdom of Flesh and Fire', y:2020 },
        { k:'b3', t:'La corona de huesos dorados', o:'The Crown of Gilded Bones', y:2021 }, { k:'b4', t:'La guerra de las dos reinas', o:'The War of Two Queens', y:2022 },
        { k:'b5', t:'Un alma de ceniza y sangre', o:'A Soul of Ash and Blood', y:2023 }, { k:'b6', o:'The Primal of Blood and Bone' }] },
      { name:'Carne y fuego', books:[
        { k:'f1', t:'Una sombra en las brasas', o:'A Shadow in the Ember', y:2021 }, { k:'f2', t:'Una luz en la llama', o:'A Light in the Flame', y:2022 },
        { k:'f3', t:'Un fuego en la carne', o:'A Fire in the Flesh', y:2023 }, { k:'f4', o:'Born of Blood and Ash', y:2024 }] }],
    order:['b1', 'b2', 'b3', 'f1', 'b4', 'f2', 'b5', 'f3', 'f4', 'b6'],
    links:[
      { short:'Miles de años antes', kind:'confirmado', books:[], text:'Carne y fuego es una precuela: transcurre miles de años antes del nacimiento de Poppy, la protagonista de Sangre y cenizas.', src:'https://ca.news.yahoo.com/best-reading-order-jennifer-l-143207314.html' },
      { char:'sera', short:'Dos Doncellas', kind:'confirmado', books:[], text:'Las dos sagas giran en torno a una Doncella: Poppy en Sangre y cenizas y Sera, prometida al Primigenio de la Muerte, en Carne y fuego.', src:'https://ca.news.yahoo.com/best-reading-order-jennifer-l-143207314.html' }] },

  { id:'elderlings', name:'Realm of the Elderlings', author:'Robin Hobb',
    note:'Orden de publicación: las cinco sagas son una sola historia. No te saltes Liveship Traders aunque no salga Fitz: lo que pasa ahí importa después.',
    series:[
      { name:'Farseer', books:[{ k:'h1', t:'Aprendiz de asesino', o:'Assassin\'s Apprentice', y:1995 }, { k:'h2', t:'Asesino real', o:'Royal Assassin', y:1996 }, { k:'h3', t:'La búsqueda del asesino', o:'Assassin\'s Quest', y:1997 }] },
      { name:'Liveship Traders', books:[{ k:'h4', o:'Ship of Magic', y:1998 }, { k:'h5', o:'The Mad Ship', y:1999 }, { k:'h6', o:'Ship of Destiny', y:2000 }] },
      { name:'Tawny Man', books:[{ k:'h7', o:'Fool\'s Errand', y:2001 }, { k:'h8', o:'Golden Fool', y:2002 }, { k:'h9', o:'Fool\'s Fate', y:2003 }] },
      { name:'Rain Wild Chronicles', books:[{ k:'h10', o:'Dragon Keeper', y:2009 }, { k:'h11', o:'Dragon Haven', y:2010 }, { k:'h12', o:'City of Dragons', y:2012 }, { k:'h13', o:'Blood of Dragons', y:2013 }] },
      { name:'Fitz and the Fool', books:[{ k:'h14', o:'Fool\'s Assassin', y:2014 }, { k:'h15', o:'Fool\'s Quest', y:2015 }, { k:'h16', o:'Assassin\'s Fate', y:2017 }] }],
    order:['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 'h14', 'h15', 'h16'],
    links:[
      { char:'fool', short:'Fitz y el Bufón', kind:'confirmado', books:['h3'], text:'Tawny Man retoma a Fitz y al Bufón años después de Farseer, y Fitz and the Fool cierra su historia.', src:'https://www.tlbranson.com/robin-hobb-books-in-order' },
      { short:'Lluvia Salvaje', kind:'confirmado', books:['h6'], text:'Rain Wild Chronicles sigue a los dragones en las tierras de Lluvia Salvaje que aparecen en Liveship Traders.', src:'https://www.tlbranson.com/robin-hobb-books-in-order' }] },

  { id:'arnes', name:'Las Londres de Shades of Magic', author:'V. E. Schwab',
    note:'Primero la trilogía Shades of Magic; luego Threads of Power.',
    series:[
      { name:'Shades of Magic', books:[{ k:'sm1', t:'Una magia más oscura', o:'A Darker Shade of Magic', y:2015 }, { k:'sm2', o:'A Gathering of Shadows', y:2016 }, { k:'sm3', o:'A Conjuring of Light', y:2017 }] },
      { name:'Threads of Power', books:[{ k:'tp1', o:'The Fragile Threads of Power', y:2023 }] }],
    order:['sm1', 'sm2', 'sm3', 'tp1'],
    links:[{ short:'Siete años después', kind:'confirmado', books:['sm3'], text:'Threads of Power transcurre siete años después de A Conjuring of Light, con protagonistas nuevos (Tes, Kosika) y las casas reales de Arnes muy presentes.', src:'https://shadesofmagic.fandom.com/wiki/Threads_of_Power' }] },

  { id:'solaria', name:'Solaria (Zodiac Academy)', author:'Caroline Peckham y Susanne Valenti',
    note:'Orden de la guía de Solaria: los tres primeros de Zodiac Academy, Ruthless Boys (opcional pero da peso a sus apariciones), el resto de la serie principal, luego Darkmore y al final Sins of the Zodiac.',
    series:[
      { name:'Zodiac Academy', books:[
        { k:'z1', t:'El despertar', o:'The Awakening', alt:['Zodiac Academy - The Awakening', 'El despertar - Zodiac Academy', 'Zodiac Academy: The Awakening'], y:2019 },
        { k:'z2', o:'Ruthless Fae', y:2019 }, { k:'z3', o:'The Reckoning', y:2019 }, { k:'z4', o:'Shadow Princess', y:2020 }, { k:'z5', o:'Cursed Fates', y:2020 },
        { k:'z6', o:'Fated Throne', y:2020 }, { k:'z7', o:'Heartless Sky', y:2021 }, { k:'z8', o:'Sorrow and Starlight', y:2022 }, { k:'z9', o:'Restless Stars', y:2024 }] },
      { name:'Ruthless Boys of the Zodiac', books:[{ k:'r1', o:'Dark Fae', y:2019 }, { k:'r2', o:'Savage Fae', y:2019 }, { k:'r3', o:'Vicious Fae', y:2020 }, { k:'r4', o:'Broken Fae', y:2020 }, { k:'r5', o:'Warrior Fae', y:2021 }] },
      { name:'Darkmore Penitentiary', books:[{ k:'d1', o:'Caged Wolf', y:2020 }, { k:'d2', o:'Alpha Wolf', y:2020 }, { k:'d3', o:'Feral Wolf', y:2021 }, { k:'d4', o:'Wild Wolf', y:2024 }] },
      { name:'Sins of the Zodiac', books:[{ k:'x1', o:'Never Keep', y:2024 }, { k:'x2', o:'Echo Fort', y:2025 }, { k:'x3', o:'Cinder Vale', y:2026 }] }],
    order:['z1', 'z2', 'z3', 'r1', 'r2', 'r3', 'r4', 'r5', 'z4', 'z5', 'z6', 'z7', 'z8', 'z9', 'd1', 'd2', 'd3', 'd4', 'x1', 'x2', 'x3'],
    links:[
      { short:'Elise', kind:'confirmado', books:['r1', 'z4'], text:'Elise Callisto y sus chicos, protagonistas de Ruthless Boys of the Zodiac, aparecen en la serie principal.', src:'https://www.tlbranson.com/zodiac-academy-reading-order/' },
      { short:'Darkmore', kind:'confirmado', books:[], text:'Darkmore Penitentiary sigue a Rosalie Oscura y se sitúa después de la serie principal; Sins of the Zodiac tiene un reparto nuevo en el mismo mundo.', src:'https://www.tlbranson.com/zodiac-academy-reading-order/' }] },

  { id:'addicted', name:'Mundo Addicted', author:'Krista y Becca Ritchie',
    note:'Orden de publicación (lo recomiendan las autoras). Like Us es la generación siguiente.',
    series:[
      { name:'Addicted (incluye Calloway Sisters)', books:[
        { k:'ad1', o:'Addicted to You', y:2013 }, { k:'ad2', o:'Ricochet', y:2013 }, { k:'ad3', o:'Addicted for Now', y:2013 }, { k:'ad4', o:'Kiss the Sky', y:2014 },
        { k:'ad5', o:'Hothouse Flower', y:2014 }, { k:'ad6', o:'Thrive', y:2014 }, { k:'ad7', o:'Addicted After All', y:2014 }, { k:'ad8', o:'Fuel the Fire', y:2015 },
        { k:'ad9', o:'Long Way Down', y:2015 }, { k:'ad10', o:'Some Kind of Perfect', y:2016 }] },
      { name:'Like Us', books:[
        { k:'l1', o:'Damaged Like Us' }, { k:'l2', o:'Lovers Like Us' }, { k:'l3', o:'Alphas Like Us' }, { k:'l4', o:'Tangled Like Us' }, { k:'l5', o:'Sinful Like Us' },
        { k:'l6', o:'Headstrong Like Us' }, { k:'l7', o:'Charming Like Us' }, { k:'l8', o:'Wild Like Us' }, { k:'l9', o:'Fearless Like Us' }, { k:'l10', o:'Infamous Like Us' },
        { k:'l11', o:'Misfits Like Us' }, { k:'l12', o:'Unlucky Like Us' }, { k:'l13', o:'Nobody Like Us' }] }],
    order:['ad1', 'ad2', 'ad3', 'ad4', 'ad5', 'ad6', 'ad7', 'ad8', 'ad9', 'ad10', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10', 'l11', 'l12', 'l13'],
    links:[{ short:'La siguiente generación', kind:'confirmado', books:['ad10'], text:'Like Us sigue a los hijos de las tres hermanas Calloway, empezando por Maximoff Hale; varias de sus parejas son el punto de entrada de cada tramo.', src:'https://kbritchie.com/reading-order' }] },

  { id:'empyrean', name:'Empyrean', author:'Rebecca Yarros',
    note:'Los tres libros en orden; Threshing Day es opcional y no hace falta para el cuarto.',
    series:[{ name:'Empyrean', books:[
      { k:'e1', t:'Alas de sangre', o:'Fourth Wing', y:2023 }, { k:'e2', t:'Alas de hierro', o:'Iron Flame', y:2023 }, { k:'e3', t:'Alas de ónix', o:'Onyx Storm', y:2025 },
      { k:'e4', o:'Threshing Day', y:2026, opt:true, note:'13 relatos (Wing and Claw Collection)' }] }],
    order:['e1', 'e2', 'e3', 'e4'],
    links:[{ short:'Threshing Day', kind:'confirmado', books:['e3'], text:'Threshing Day reúne trece relatos sobre el Threshing y el vínculo entre jinetes y dragones; Yarros confirmó que es opcional.', src:'https://booksofbrilliance.com/2026/10/06/do-you-need-threshing-day-before-fourth-wing-book-4/' }] },

  { id:'priorato', name:'Raíces del caos', author:'Samantha Shannon',
    note:'Orden de publicación: El priorato del naranjo y luego la precuela.',
    series:[{ name:'The Roots of Chaos', books:[
      { k:'p1', t:'El priorato del naranjo', o:'The Priory of the Orange Tree', y:2019 }, { k:'p0', o:'A Day of Fallen Night', y:2023, note:'precuela' },
      { k:'p2', o:'Among the Burning Flowers', y:2025, opt:true, note:'precuela corta' }] }],
    order:['p1', 'p0', 'p2'],
    links:[{ short:'La precuela', kind:'confirmado', books:[], text:'A Day of Fallen Night va antes que El priorato del naranjo en la cronología de la serie, y hay un segundo libro posterior anunciado sin fecha.', src:'https://risingshadow.net/book/78080-the-roots-of-chaos-book-2' }] }
];

/* ---------- Más conexiones y personajes (28/10/2026, segunda tanda) ----------
   kind: 'confirmado' (pasa en los libros), 'cameo' (un personaje aparece en otro libro), 'guiño' (referencia o detalle) o 'teoria'.
   `char`: personaje del tablero al que se ata el hilo (ficha con retrato propio, no copiado de ninguna ilustración).
   `short`: rótulo corto para la nota del tablero. Personajes: sym = símbolo, hair/skin/coat = colores, look = peinado. */
const UNI_EXTRA = {
  maas:{ chars:[
      { id:'aelin', name:'Aelin', sym:'flame', hair:'#d9a441', skin:'#f1c9a5', coat:'#7a1f1f', look:'long' },
      { id:'yrene', name:'Yrene', sym:'leaf', hair:'#8a4b2a', skin:'#e8b88f', coat:'#e8e0c8', look:'long' },
      { id:'lysandra', name:'Lysandra', sym:'paw', hair:'#2a1a12', skin:'#c98e62', coat:'#2f5d50', look:'long' },
      { id:'rhysand', name:'Rhysand', sym:'star', hair:'#15131c', skin:'#e2b896', coat:'#1d1b33', look:'short' },
      { id:'nesta', name:'Nesta', sym:'flame', hair:'#6b4a33', skin:'#f0cfb0', coat:'#5b5f73', look:'bun' },
      { id:'azriel', name:'Azriel', sym:'dagger', hair:'#1b1714', skin:'#c79a74', coat:'#24262c', look:'short' },
      { id:'bryce', name:'Bryce', sym:'star', hair:'#9b2f1e', skin:'#ecc4a2', coat:'#3c2f57', look:'long' }],
    links:[
      { kind:'confirmado', short:'Celaena = Aelin', books:['tog2'], text:'Celaena Sardothien, la asesina, es en realidad Aelin Galathynius, la heredera perdida de Terrasen.', src:'https://reactormag.com/through-the-looking-glass-reading-sarah-j-maass-throne-of-glass-empire-of-storms/', char:'aelin' },
      { kind:'cameo', short:'La sanadora de Innish', books:['tog0', 'tog6'], text:'Yrene, la camarera a la que Celaena salva y da oro en La espada de la asesina, protagoniza Torre del alba como sanadora de la Torre Cesme; Chaol reconoce la letra de Aelin en la nota que Yrene guarda.', src:'https://recaptains.co.uk/2023/10/tower-of-dawn-by-sarah-j-maas/', char:'yrene' },
      { kind:'cameo', short:'La deuda de Ansel', books:['tog0', 'tog5'], text:'Ansel, la compañera de entrenamiento que traiciona a Celaena con los Asesinos Silenciosos, reaparece en Imperio de tormentas: Aelin le cobra la deuda y llega con su flota. Los Asesinos Silenciosos también acuden.', src:'https://reactormag.com/through-the-looking-glass-reading-sarah-j-maass-throne-of-glass-empire-of-storms/' },
      { kind:'cameo', short:'El Señor de los Piratas', books:['tog0', 'tog5'], text:'Rolfe, el pirata de la bahía de la Calavera de La espada de la asesina, vuelve en Imperio de tormentas; Aelin descubre que es un mycenio perdido.', src:'https://reactormag.com/through-the-looking-glass-reading-sarah-j-maass-throne-of-glass-empire-of-storms/' },
      { kind:'cameo', short:'Lysandra', books:['tog0', 'tog5'], text:'Lysandra aparece en La espada de la asesina junto a Arobynn en el teatro; en Imperio de tormentas cambia de forma, se convierte en dragón marino y se hace pasar por Aelin.', src:'https://reactormag.com/through-the-looking-glass-reading-sarah-j-maass-throne-of-glass-empire-of-storms/', char:'lysandra' },
      { kind:'confirmado', short:'Maeve, reina Valg', books:['tog6'], text:'Maeve es en realidad una reina Valg: se casó con Orcus, viajó a otros mundos y robó las llaves del Wyrd.', src:'https://recaptains.co.uk/2023/10/tower-of-dawn-by-sarah-j-maas/' },
      { kind:'confirmado', short:'Elena y la Cerradura', books:['tog5'], text:'Elena usó la Cerradura para encerrar a Erawan, pero traicionó a los dioses: Brannon nunca le contó para qué servía.', src:'https://reactormag.com/through-the-looking-glass-reading-sarah-j-maass-throne-of-glass-empire-of-storms/' },
      { kind:'confirmado', short:'Manon y las llaves', books:['tog5'], text:'Manon es la última reina Crochan; Aelin le confía las llaves del Wyrd para que Maeve no las consiga, y Dorian desciende de la línea de Mala.', src:'https://reactormag.com/through-the-looking-glass-reading-sarah-j-maass-throne-of-glass-empire-of-storms/' },
      { kind:'confirmado', short:'Elide y Lorcan', books:['tog5'], text:'Lorcan cree que Elide está poseída por los Valg, pero lo que nota es la llave que lleva encima.', src:'https://reactormag.com/through-the-looking-glass-reading-sarah-j-maass-throne-of-glass-empire-of-storms/' },
      { kind:'guiño', short:'Mundos y grietas', books:['tog6'], text:'En Torre del alba se habla de puertas entre mundos controladas por las llaves del Wyrd y de una grieta por la que cruzan criaturas: la base de las conexiones entre series.', src:'https://recaptains.co.uk/2023/10/tower-of-dawn-by-sarah-j-maas/' },
      { kind:'confirmado', short:'El vínculo de Elain', books:['a2'], text:'Al salir del Caldero, Elain resulta ser la compañera (mate) de Lucien; el vínculo sigue sin resolverse en los libros siguientes.', src:'https://inkandimaginings.com/elain-archeron-who-she-is-her-powers-and-the-elriel-vs-elucien-debate-explained/' },
      { kind:'confirmado', short:'La predicción', books:['a3'], text:'Elain, vidente, predice la muerte de Cassian; la tensión de esa visión acompaña al personaje en los libros siguientes.', src:'https://m.imdb.com/news/ni64898664' },
      { kind:'teoria', short:'Elriel', books:['a3', 'a4', 'a5'], text:'Teoría Elriel: Azriel y Elain. Se apoya en Truth-Teller (Una corte de alas y ruina), el Solsticio (Una corte de hielo y estrellas) y el capítulo extra de Azriel.', src:'https://inkandimaginings.com/elain-archeron-who-she-is-her-powers-and-the-elriel-vs-elucien-debate-explained/', char:'azriel' },
      { kind:'confirmado', short:'Las visiones', books:['a5'], text:'En Una corte de llamas plateadas, Elain ya controla sus visiones y las usa para encontrar al Suriel.', src:'https://inkandimaginings.com/elain-archeron-who-she-is-her-powers-and-the-elriel-vs-elucien-debate-explained/' },
      { kind:'confirmado', short:'El Cuerno', books:['c1'], text:'Danika roba el Cuerno, lo pulveriza y lo tatúa en la espalda de Bryce; al final abre las puertas de Hel sobre Lunathion.', src:'https://www.today.com/today/amp/rcna135734', char:'bryce' },
      { kind:'confirmado', short:'Daybright', books:['c2'], text:'Lidia Cervos, la Cierva, es la agente Daybright, espía de Ophion; Ruhn se había enamorado de ella sin saberlo.', src:'https://www.today.com/today/amp/rcna135734' },
      { kind:'confirmado', short:'El secreto de Danika', books:['c2'], text:'Danika ayudaba a los rebeldes de Ophion, podía rastrear linajes y su compañero era Baxian.', src:'https://www.today.com/today/amp/rcna135734' },
      { kind:'confirmado', short:'Aidas y Theia', books:['c2'], text:'Hel se alió con Theia contra los Asteri y Aidas fue su gran amor; Pelias mató a Theia, le robó la Espada Estelar y otra de sus hijas desapareció.', src:'https://www.today.com/today/amp/rcna135734' },
      { kind:'cameo', short:'«Me llamo Rhysand»', books:['c2', 'a5'], text:'La última frase de Casa de cielo y aliento: «Hola, Bryce Quinlan. Me llamo Rhysand».', src:'https://www.today.com/today/amp/rcna135734', char:'rhysand' },
      { kind:'cameo', short:'Nesta en Prythian', books:['c3', 'a5'], text:'Nesta se une a Bryce en las cuevas y la ayuda a matar a una criatura.', src:'https://www.bookseriesrecaps.com/house-of-flame-and-shadow-summary-crescent-city-3-full-recap/', char:'nesta' },
      { kind:'cameo', short:'Truth-Teller', books:['c3', 'a3'], text:'Bryce le quita a Azriel su cuchillo Truth-Teller y lo usa para escapar del arresto en la Corte Noche.', src:'https://www.bookseriesrecaps.com/house-of-flame-and-shadow-summary-crescent-city-3-full-recap/', char:'azriel' }] },

  cosmere:{ chars:[
      { id:'hoid', name:'Hoid', sym:'flute', hair:'#e8e4da', skin:'#e0bb98', coat:'#3b3a4a', look:'short' },
      { id:'kelsier', name:'Kelsier', sym:'spike', hair:'#7b5b3a', skin:'#e7c09c', coat:'#2d2a2a', look:'short' },
      { id:'sazed', name:'Sazed', sym:'ring', hair:null, skin:'#c08b5c', coat:'#8a5a2b', look:'bald' },
      { id:'marsh', name:'Marsh', sym:'spike', hair:null, skin:'#d9b08c', coat:'#3a2020', look:'bald' },
      { id:'vasher', name:'Vasher', sym:'sword', hair:'#2a2420', skin:'#cfa27c', coat:'#5a4630', look:'short' },
      { id:'vivenna', name:'Vivenna', sym:'leaf', hair:'#3b2a24', skin:'#ecc8a8', coat:'#2f4f8a', look:'long' },
      { id:'sigzil', name:'Sigzil', sym:'sun', hair:'#1c1814', skin:'#7a4f33', coat:'#2b4a7a', look:'short' }],
    links:[
      { kind:'cameo', short:'El mendigo vendado', books:['el'], text:'Hoid aparece en Elantris disfrazado de mendigo envuelto en vendas; ayuda a Sarene a meter armas en la ciudad.', src:'https://coppermind.net/wiki/User:Windrunner/Hoid', char:'hoid' },
      { kind:'cameo', short:'Hoid en el Pozo', books:['mb2'], text:'En El Pozo de la Ascensión, Hoid se enfrenta a la sombra de Kelsier en el Pozo, roba lerasium y se convierte en nacido de la bruma.', src:'https://coppermind.net/wiki/User:Windrunner/Hoid', char:'hoid' },
      { kind:'cameo', short:'Informante en Fadrex', books:['mb3'], text:'En El Héroe de las Eras, Hoid es informante en Fadrex; Vin decide no hablar con él.', src:'https://coppermind.net/wiki/User:Windrunner/Hoid', char:'hoid' },
      { kind:'cameo', short:'La boda', books:['mb4'], text:'En Aleación de ley, Hoid aparece disfrazado de mendigo en la boda de Joshin y Mi\'chelle.', src:'https://coppermind.net/wiki/User:Windrunner/Hoid', char:'hoid' },
      { kind:'cameo', short:'El cochero', books:['mb5'], text:'En Sombras de identidad, Hoid conduce el carruaje de Wax.', src:'https://coppermind.net/wiki/User:Windrunner/Hoid', char:'hoid' },
      { kind:'cameo', short:'La moneda', books:['mb6'], text:'En Brazales de duelo, Hoid intenta darle a Wax una moneda con un recuerdo de Kelsier.', src:'https://coppermind.net/wiki/User:Windrunner/Hoid', char:'hoid' },
      { kind:'cameo', short:'El cuentacuentos', books:['wb'], text:'En El aliento de los dioses, Hoid es cuentacuentos en la Corte de los Dioses: Lightsong lo llama para oír la historia de Idris y Hallandren.', src:'https://coppermind.net/wiki/User:Windrunner/Hoid', char:'hoid' },
      { kind:'cameo', short:'El Ingenio del rey', books:['s1'], text:'En El camino de los reyes, Hoid es el Ingenio (Wit) del rey y le cuenta a Kaladin la historia de Derethil.', src:'https://coppermind.net/wiki/User:Windrunner/Hoid', char:'hoid' },
      { kind:'cameo', short:'Shallan y Jasnah', books:['s2'], text:'En Palabras radiantes, Hoid conduce el carruaje de Adolin, ve a Shallan en la feria de Jah Keved y se reúne con Jasnah.', src:'https://coppermind.net/wiki/User:Windrunner/Hoid', char:'hoid' },
      { kind:'cameo', short:'Kholinar', books:['s3'], text:'En Juramentada, Hoid vive en Kholinar, ayuda a Shallan y rescata a Patrón en la ciudad ocupada.', src:'https://coppermind.net/wiki/User:Windrunner/Hoid', char:'hoid' },
      { kind:'cameo', short:'El contrato', books:['s4'], text:'En El ritmo de la guerra, Hoid es el Ingenio de Jasnah, visita el sueño de Kaladin y redacta el contrato con Odium.', src:'https://coppermind.net/wiki/User:Windrunner/Hoid', char:'hoid' },
      { kind:'confirmado', short:'Marsh, Inquisidor', books:['mb1'], text:'Marsh, el hermano de Kelsier, se infiltra en los Inquisidores de Acero.', src:'https://reactormag.com/mistborn-era-2-everything-you-need-to-know-before-reading-the-last-metal/', char:'marsh' },
      { kind:'cameo', short:'Ojos de Hierro', books:['mb3', 'mb4'], text:'Al final de Aleación de ley, Marsh (Ojos de Hierro), venerado como la Muerte, se acerca a Marasi y le entrega un libro misterioso.', src:'https://en.wikipedia.org/wiki/Mistborn:_The_Alloy_of_Law', char:'marsh' },
      { kind:'confirmado', short:'Wax y Breeze', books:['mb4', 'mb3'], text:'Wax desciende de la casa de Breeze: por eso su apellido es Ladrian. Aleación de ley transcurre unos 300 años después de la era 1.', src:'https://en.wikipedia.org/wiki/Mistborn:_The_Alloy_of_Law' },
      { kind:'cameo', short:'Armonía habla con Wax', books:['mb3', 'mb5'], text:'En Sombras de identidad, Armonía (Sazed) habla directamente con Wax.', src:'https://reactormag.com/mistborn-era-2-everything-you-need-to-know-before-reading-the-last-metal/', char:'sazed' },
      { kind:'guiño', short:'Los supervivencialistas', books:['mb1', 'mb4'], text:'La religión de Kelsier sigue viva 300 años después: Steris y Marasi son «supervivencialistas».', src:'https://reactormag.com/mistborn-era-2-everything-you-need-to-know-before-reading-the-last-metal/', char:'kelsier' },
      { kind:'cameo', short:'Kelsier y Spook', books:['mb3', 'mbs'], text:'En Historia secreta, Kelsier habla con Spook sobre cómo volver al reino físico.', src:'https://reactormag.com/mistborn-era-2-everything-you-need-to-know-before-reading-the-last-metal/', char:'kelsier' },
      { kind:'confirmado', short:'«Adorad a Trell»', books:['mb4', 'mb5'], text:'Trell aparece por las últimas palabras de Miles Cientovidas («Adorad a Trell…») y Paalm usa un clavo que le dio Trell.', src:'https://reactormag.com/mistborn-era-2-everything-you-need-to-know-before-reading-the-last-metal/' },
      { kind:'confirmado', short:'Los kandra', books:['mb2', 'mb5'], text:'Los kandra siguen ahí en la era 2: MeLaan, VenDell y Paalm, la que se hizo pasar por Lessie, la mujer de Wax.', src:'https://reactormag.com/mistborn-era-2-everything-you-need-to-know-before-reading-the-last-metal/' },
      { kind:'guiño', short:'Mi\'chelle', books:['mb4', 'wb'], text:'La recién casada con la que habla Hoid en Aleación de ley, Mi\'chelle, es una viajera de Nalthis (el mundo de El aliento de los dioses), según Sanderson.', src:'https://www.17thshard.com/forums/topic/59418-list-of-cosmere-hints-throughout-books/' },
      { kind:'cameo', short:'El trío del Lagopuro', books:['s1', 'el', 'mb2'], text:'En el interludio de Ishikk de El camino de los reyes aparecen tres viajeros: Gruñón es Galladon (Elantris) y Pensador es Demoux (Nacidos de la bruma).', src:'https://reactormag.com/everything-we-know-about-worldhoppers-on-roshar/' },
      { kind:'cameo', short:'Felt', books:['s2'], text:'Felt, el explorador de los Kholin en Palabras radiantes, viene de Scadrial.', src:'https://reactormag.com/everything-we-know-about-worldhoppers-on-roshar/' },
      { kind:'cameo', short:'Nazh dibuja', books:['s2'], text:'Nazh, de Threnody, dibuja a la Cuadrilla Cuatro en Palabras radiantes y anota mapas para Khriss; también aparece en persona en Historia secreta.', src:'https://www.17thshard.com/forums/topic/59418-list-of-cosmere-hints-throughout-books/' },
      { kind:'cameo', short:'Sangre Nocturna', books:['wb', 's3'], text:'Sangre Nocturna (Nightblood), la espada de El aliento de los dioses, acaba en manos de Szeth en Roshar.', src:'https://reactormag.com/everything-we-know-about-worldhoppers-on-roshar/', char:'vasher' },
      { kind:'cameo', short:'Sigzil, el Nómada', books:['s4', 'sun'], text:'El Nómada de El hombre iluminado es Sigzil, de la Cuadrilla Cuatro: tras recibir una Esquirla del Alba huye de Roshar perseguido por la Brigada de la Noche.', src:'https://coppermind.net/wiki/Nomad', char:'sigzil' },
      { kind:'confirmado', short:'Hoid y Sigzil', books:['s1', 'sun'], text:'Hoid fue maestro de Sigzil y lo abandonó cuando era esclavo; Sigzil lo odia, pero sigue usando sus enseñanzas.', src:'https://coppermind.net/wiki/Nomad', char:'sigzil' }] },

  grisha:{ chars:[
      { id:'nikolai', name:'Nikolai', sym:'crown', hair:'#c9a24a', skin:'#efcfae', coat:'#2f4e7a', look:'short' },
      { id:'zoya', name:'Zoya', sym:'storm', hair:'#121018', skin:'#e9c3a0', coat:'#2c4a8a', look:'long' },
      { id:'genya', name:'Genya', sym:'eye', hair:'#b2382a', skin:'#f2d2b8', coat:'#7a1f4a', look:'long' },
      { id:'nina', name:'Nina', sym:'heart', hair:'#6a4022', skin:'#efc9a6', coat:'#8a2232', look:'long' },
      { id:'darkling', name:'El Darkling', sym:'shadow', hair:'#0e0d12', skin:'#e6c6a8', coat:'#141218', look:'short' },
      { id:'alina', name:'Alina', sym:'sun', hair:'#e7e2d6', skin:'#efcfae', coat:'#c9a43a', look:'long' }],
    links:[
      { kind:'confirmado', short:'Sturmhond', books:['g2'], text:'El corsario Sturmhond es en realidad Nikolai, el príncipe menor de Ravka.', src:'https://en.wikipedia.org/wiki/List_of_Grishaverse_characters', char:'nikolai' },
      { kind:'cameo', short:'Los gemelos', books:['g2', 'g7'], text:'Tolya y Tamar, de la tripulación de Sturmhond, vuelven en Rule of Wolves: Tamar se une a la causa de Shu Han.', src:'https://en.wikipedia.org/wiki/List_of_Grishaverse_characters' },
      { kind:'cameo', short:'Genya en Ketterdam', books:['g3', 'g5'], text:'En Reino de ladrones, Genya libera a Grisha cautivos en Ketterdam y le devuelve su cara a Wylan.', src:'https://en.wikipedia.org/wiki/List_of_Grishaverse_characters', char:'genya' },
      { kind:'cameo', short:'Zoya', books:['g3', 'g5', 'g6'], text:'Zoya tiene un papel pequeño en Reino de ladrones y es una de las voces principales de Rey de cicatrices.', src:'https://en.wikipedia.org/wiki/List_of_Grishaverse_characters', char:'zoya' },
      { kind:'cameo', short:'Mila Jandersdat', books:['g5', 'g6'], text:'En Rey de cicatrices, Nina se hace pasar por la fjerdana Mila Jandersdat para sacar Grisha de Fjerda.', src:'https://en.wikipedia.org/wiki/List_of_Grishaverse_characters', char:'nina' },
      { kind:'confirmado', short:'Vuelve', books:['g3', 'g6'], text:'El Darkling, muerto en Ruina y ascenso, vuelve en Rey de cicatrices en el cuerpo de un acólito leal.', src:'https://en.wikipedia.org/wiki/List_of_Grishaverse_characters', char:'darkling' },
      { kind:'cameo', short:'Alina y Mal', books:['g3', 'g7'], text:'Alina aparece brevemente en Rule of Wolves, y Mal es clave en la fuga del Darkling.', src:'https://en.wikipedia.org/wiki/List_of_Grishaverse_characters', char:'alina' },
      { kind:'confirmado', short:'Reina Zoya', books:['g7'], text:'Al final de Rule of Wolves, Nikolai renuncia y Zoya es coronada reina; David muere en el bombardeo de Os Alta.', src:'https://en.wikipedia.org/wiki/List_of_Grishaverse_characters', char:'zoya' }] },

  armentrout:{ chars:[
      { id:'nyktos', name:'Nyktos (Ash)', sym:'moon', hair:'#5a3a26', skin:'#dcae88', coat:'#22252b', look:'long' },
      { id:'sera', name:'Sera', sym:'flame', hair:'#e6cf8f', skin:'#efcfae', coat:'#6a3f6a', look:'long' },
      { id:'ires', name:'Ires', sym:'paw', hair:'#d9c6a0', skin:'#e7c4a4', coat:'#4a4a3a', look:'short' },
      { id:'kolis', name:'Kolis', sym:'crown', hair:'#c9a24a', skin:'#e6c6a8', coat:'#8a6a1a', look:'short' },
      { id:'isbeth', name:'Isbeth', sym:'crown', hair:'#7a2a1a', skin:'#efcfae', coat:'#5a1020', look:'long' }],
    links:[
      { kind:'confirmado', short:'Ash es Nyktos', books:['f1'], text:'Ash es Nyktos, el Primigenio de la Muerte; no puede amar a Sera porque le extirparon el kardia.', src:'https://bookishgoblin.com/from-blood-and-ash-series-recap/', char:'nyktos' },
      { kind:'confirmado', short:'Almas gemelas', books:['f3'], text:'Nyktos y Sera son almas gemelas y su kardia se cura.', src:'https://bookishgoblin.com/from-blood-and-ash-series-recap/', char:'sera' },
      { kind:'confirmado', short:'El padre de Poppy', books:['b3', 'f1'], text:'Ires, hijo de Nyktos y la Consorte, es el padre de Poppy: Nyktos y Sera son sus abuelos.', src:'https://bookishgoblin.com/from-blood-and-ash-series-recap/', char:'ires' },
      { kind:'confirmado', short:'Isbeth', books:['b3'], text:'La reina Ileana es Isbeth, la madre de Poppy, la mortal que Malec intentó ascender.', src:'https://bookishgoblin.com/from-blood-and-ash-series-recap/', char:'isbeth' },
      { kind:'confirmado', short:'El verdadero Primigenio', books:['b4', 'f2'], text:'Kolis, que robó las brasas de la vida de Eythos y es la fuente de la Podredumbre, es el verdadero Primigenio de la Muerte; Isbeth quiere devolverle el poder.', src:'https://bookishgoblin.com/from-blood-and-ash-series-recap/', char:'kolis' },
      { kind:'cameo', short:'Nektas', books:['f2', 'b3'], text:'Nektas, el draken que protege a Sera en la precuela, es quien revela en La corona de huesos dorados que Ires es el padre de Poppy.', src:'https://bookishgoblin.com/from-blood-and-ash-series-recap/' },
      { kind:'cameo', short:'Jadis', books:['f2', 'b5'], text:'Jadis, la hija de Nektas con la que Sera se vincula en la precuela, está a salvo en las Llanuras de los Sauces según Ires.', src:'https://bookishgoblin.com/from-blood-and-ash-series-recap/', char:'ires' },
      { kind:'confirmado', short:'La profecía', books:['f4', 'b4'], text:'Penellaphe anticipa en Born of Blood and Ash la profecía de las dos hermanas, Poppy y Millicent; el texto completo se revela en La guerra de las dos reinas. Vikter era uno de los Hados.', src:'https://bookishgoblin.com/from-blood-and-ash-series-recap/' },
      { kind:'confirmado', short:'Malik', books:['b1', 'b4'], text:'Malik, el hermano de Casteel cautivo en Solis, es recibido como el Oscuro por los Disidentes.', src:'https://bookishgoblin.com/from-blood-and-ash-series-recap/' }] },

  elderlings:{ chars:[
      { id:'fool', name:'El Bufón', sym:'mask', hair:'#efe9dc', skin:'#f3eee2', coat:'#c9a43a', look:'short' },
      { id:'tintaglia', name:'Tintaglia', sym:'dragon', hair:null, skin:'#3a6aa8', coat:'#2b4a7a', look:'obj' },
      { id:'chade', name:'Chade', sym:'eye', hair:'#d8d4cc', skin:'#e2c2a2', coat:'#3a3330', look:'short' }],
    links:[
      { kind:'confirmado', short:'Ámbar', books:['h6', 'h8'], text:'En Liveship Traders el Bufón vive como una mujer, Ámbar; en Golden Fool se revela que es la misma persona.', src:'https://en.wikipedia.org/wiki/Tawny_Man_trilogy', char:'fool' },
      { kind:'cameo', short:'Lord Golden', books:['h3', 'h8'], text:'En Golden Fool, el Bufón se presenta en palacio como Lord Golden y Fitz lo sirve disfrazado de criado.', src:'https://en.wikipedia.org/wiki/Tawny_Man_trilogy', char:'fool' },
      { kind:'cameo', short:'Tintaglia acude', books:['h6', 'h9'], text:'Tintaglia, la dragona de Liveship Traders, acude a ayudar a Fitz contra el dragón de piedra en Fool\'s Fate.', src:'https://en.wikipedia.org/wiki/Tawny_Man_trilogy', char:'tintaglia' },
      { kind:'confirmado', short:'Las crías', books:['h9', 'h10'], text:'En Dragon Keeper, Tintaglia e IceFyre dejan a sus crías, débiles y sin vuelo, al cuidado de los humanos; buscan Kelsingra, la ciudad de los Ancestrales.', src:'https://en.wikipedia.org/wiki/Rain_Wild_Chronicles', char:'tintaglia' },
      { kind:'cameo', short:'Dutiful', books:['h3', 'h7'], text:'En Fool\'s Errand, Chade le pide a Fitz que entrene al príncipe Dutiful en el Don.', src:'https://en.wikipedia.org/wiki/Tawny_Man_trilogy', char:'chade' },
      { kind:'confirmado', short:'Nighteyes', books:['h7'], text:'Nighteyes, el lobo de Fitz, enferma y muere al final de Fool\'s Errand.', src:'https://en.wikipedia.org/wiki/Tawny_Man_trilogy' },
      { kind:'confirmado', short:'Burrich', books:['h9'], text:'Burrich, el tutor de Fitz en Farseer, usa el Don como arma contra el dragón de piedra y muere en el combate; Fitz termina junto a Molly.', src:'https://en.wikipedia.org/wiki/Tawny_Man_trilogy' }] },

  arnes:{ chars:[
      { id:'kell', name:'Kell', sym:'coat', hair:'#a8432a', skin:'#efcfae', coat:'#1f1f22', look:'short' },
      { id:'lila', name:'Lila', sym:'dagger', hair:'#1a1612', skin:'#e7c4a4', coat:'#2a2a36', look:'short' },
      { id:'holland', name:'Holland', sym:'eye', hair:'#e9e9e9', skin:'#efe3d2', coat:'#e6e6e6', look:'short' }],
    links:[
      { kind:'cameo', short:'Kell sin magia', books:['sm3', 'tp1'], text:'Kell ha perdido su poder antari; al final, Tes lo cura y se lo devuelve.', src:'https://booksthatslay.com/the-fragile-threads-of-power-summary-characters-and-themes/', char:'kell' },
      { kind:'cameo', short:'Rhy y Alucard', books:['sm3', 'tp1'], text:'Rhy es el rey de la Londres Roja y Alucard su consorte; Berras, el hermano de Alucard, quiere matarlo.', src:'https://booksthatslay.com/the-fragile-threads-of-power-summary-characters-and-themes/' },
      { kind:'cameo', short:'El fantasma', books:['sm3', 'tp1'], text:'Holland está muerto, pero su fantasma aconseja a Kosika, la niña reina de la Londres Blanca, que descubre que es antari.', src:'https://booksthatslay.com/the-fragile-threads-of-power-summary-characters-and-themes/', char:'holland' },
      { kind:'cameo', short:'La tripulación', books:['sm3', 'tp1'], text:'Lila acoge a Tes bajo su protección y Tes se une a la tripulación del Ferase Stras.', src:'https://booksthatslay.com/the-fragile-threads-of-power-summary-characters-and-themes/', char:'lila' }] },

  solaria:{ chars:[], links:[
      { kind:'guiño', short:'Lance Orion', books:['r1'], text:'Dark Fae transcurre unos años antes de Zodiac Academy, y en él se menciona a Lance Orion, del equipo de pitball de la academia.', src:'https://bookishgoblin.com/ruthless-boys-of-the-zodiac-dark-fae-review-summary-ending-explained/' }] },

  addicted:{ chars:[], links:[
      { kind:'confirmado', short:'Diez años después', books:['ad10'], text:'Like Us transcurre casi diez años después del final de Some Kind of Perfect y sigue a la segunda generación, que se enamora de sus guardaespaldas.', src:'https://en.wikipedia.org/wiki/Krista_%26_Becca_Ritchie' }] },

  empyrean:{ chars:[
      { id:'xaden', name:'Xaden', sym:'shadow', hair:'#16130f', skin:'#c9946a', coat:'#1c1c20', look:'short' },
      { id:'andarna', name:'Andarna', sym:'dragon', hair:null, skin:'#c9a43a', coat:'#2a2a2a', look:'obj' }],
    links:[
      { kind:'confirmado', short:'Venin', books:['e2'], text:'Xaden se convierte en venin al final de Alas de hierro; en Alas de ónix lo vigilan para que no canalice y su vínculo con Sgaeyl se resiente.', src:'https://the-empyrean-series.fandom.com/wiki/Onyx_Storm', char:'xaden' },
      { kind:'confirmado', short:'Los irid', books:['e3'], text:'Violet y Andarna exigen una misión para encontrar a los demás dragones irid; Jesinia los investiga en los archivos.', src:'https://the-empyrean-series.fandom.com/wiki/Onyx_Storm', char:'andarna' },
      { kind:'confirmado', short:'AIMSIR', books:['e3'], text:'Dain recupera un libro del padre de Violet protegido con contraseña: AIMSIR.', src:'https://the-empyrean-series.fandom.com/wiki/Onyx_Storm' }] },

  priorato:{ chars:[], links:[
      { kind:'confirmado', short:'500 años antes', books:[], text:'A Day of Fallen Night transcurre 500 años antes de El priorato del naranjo y presenta a antepasados de algunos de sus personajes.', src:'https://booksthatslay.com/a-day-of-fallen-night-summary-characters-and-themes/' },
      { kind:'confirmado', short:'El hijo perdido', books:['p0'], text:'Wulf, housecarl del rey Bardholt, es el hijo perdido de Tunuva; se lo robó de bebé la Bruja de Inysca, que se hace llamar Canthe.', src:'https://booksthatslay.com/a-day-of-fallen-night-summary-characters-and-themes/' },
      { kind:'guiño', short:'El linaje Berethnet', books:['p0', 'p1'], text:'Glorian carga con la creencia de que la línea Berethnet mantiene encadenado al Innominado: la misma carga que pesa sobre Sabran en El priorato del naranjo.', src:'https://booksthatslay.com/a-day-of-fallen-night-summary-characters-and-themes/' }] }
};
UNIVERSES.forEach(u => { const x = UNI_EXTRA[u.id]; if(!x) return; u.chars = x.chars || []; u.links = [...u.links, ...(x.links || [])]; });
