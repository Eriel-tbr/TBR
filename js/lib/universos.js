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
      { name:'Trono de cristal', books:[
        { k:'tog0', t:'La espada de la asesina', o:'The Assassin\'s Blade', y:2014, opt:true, note:'relatos precuela' },
        { k:'tog1', t:'Trono de cristal', o:'Throne of Glass', y:2012 }, { k:'tog2', t:'Corona de medianoche', o:'Crown of Midnight', y:2013 },
        { k:'tog3', t:'Heredera de fuego', o:'Heir of Fire', y:2014 }, { k:'tog4', t:'Reina de sombras', o:'Queen of Shadows', y:2015 },
        { k:'tog5', t:'Imperio de tormentas', o:'Empire of Storms', y:2016 }, { k:'tog6', t:'Torre del alba', o:'Tower of Dawn', y:2017 },
        { k:'tog7', t:'Reino de cenizas', o:'Kingdom of Ash', y:2018 }] },
      { name:'Una corte de rosas y espinas (ACOTAR)', books:[
        { k:'a1', t:'Una corte de rosas y espinas', o:'A Court of Thorns and Roses', y:2015 }, { k:'a2', t:'Una corte de niebla y furia', o:'A Court of Mist and Fury', y:2016 },
        { k:'a3', t:'Una corte de alas y ruina', o:'A Court of Wings and Ruin', y:2017 }, { k:'a4', t:'Una corte de hielo y estrellas', o:'A Court of Frost and Starlight', y:2018 },
        { k:'a5', t:'Una corte de llamas plateadas', o:'A Court of Silver Flames', y:2021 }] },
      { name:'Ciudad Medialuna (Crescent City)', books:[
        { k:'c1', t:'Casa de tierra y sangre', o:'House of Earth and Blood', y:2020 }, { k:'c2', t:'Casa de cielo y aliento', o:'House of Sky and Breath', y:2022 },
        { k:'c3', t:'Casa de llama y sombra', o:'House of Flame and Shadow', y:2024 }] }],
    order:['tog1', 'tog2', 'tog0', 'tog3', 'tog4', 'tog5', 'tog6', 'tog7', 'a1', 'a2', 'a3', 'a4', 'c1', 'a5', 'c2', 'c3'],
    links:[
      { kind:'guiño', books:['tog7'], text:'En Reino de cenizas, mientras Aelin cae entre mundos, ve otros lugares: los fans reconocen una ciudad parecida a Lunathion y a una pareja alada que sería Rhysand y Feyre.', src:'https://www.themarysue.com/are-throne-of-glass-and-acotar-related-explained/' },
      { kind:'confirmado', books:['c2', 'a5'], text:'Al final de Casa de cielo y aliento, Bryce aparece en Prythian, junto al río Sidra: la encuentra Azriel y después llegan Amren, Cassian y Nesta.', src:'https://crescentcity.fandom.com/wiki/Nesta_Archeron' },
      { kind:'confirmado', books:['c3'], text:'En Casa de llama y sombra, Bryce pasa tiempo en la Corte Noche: la interrogan Rhysand, Amren y Azriel, recorre unas cuevas con Azriel y Nesta, y escapa usando Truth-Teller, el cuchillo de Azriel.', src:'https://www.bookseriesrecaps.com/house-of-flame-and-shadow-summary-crescent-city-3-full-recap/' },
      { kind:'confirmado', books:['c3', 'a5'], text:'La Espada Estelar de Bryce es Gwydion, la gemela de Truth-Teller: cuando están cerca, brillan una con luz blanca y otra con luz oscura.', src:'https://crescentcity.fandom.com/wiki/Nesta_Archeron' },
      { kind:'confirmado', books:['c3', 'a3'], text:'Los Asteri son los Daglan, los antiguos tiranos de Prythian que se mencionan en ACOTAR.', src:'https://www.bookseriesrecaps.com/house-of-flame-and-shadow-summary-crescent-city-3-full-recap/' },
      { kind:'confirmado', books:['c3'], text:'Theia, reina de los Astrogénitos, y sus hijas Silene y Helena vienen de Prythian: el linaje de Bryce empieza allí.', src:'https://www.bookseriesrecaps.com/house-of-flame-and-shadow-summary-crescent-city-3-full-recap/' },
      { kind:'confirmado', books:['c3', 'a5'], text:'Nesta mata a Vesperus, el último Asteri que quedaba en el mundo fae.', src:'https://crescentcity.fandom.com/wiki/Nesta_Archeron' },
      { kind:'teoria', books:['c3', 'tog7'], text:'Lidia Cervos y Aelin comparten el fuego, el ciervo de Terrasen y un nombre: uno de los hijos de Lidia se llama Brannon, como el primer rey de Terrasen. Muchos creen que hay parentesco entre los dos mundos.', src:'https://wou.edu/westernhowl/into-the-maasverse/' },
      { kind:'teoria', books:['c1', 'a3'], text:'El Rey del Otoño de Valbara se parece mucho a Beron, el Gran Señor de la Corte Otoño (pelo rojo, fuego, carácter frío): se especula que su linaje viene de Prythian.', src:'https://www.themarysue.com/are-throne-of-glass-and-acotar-related-explained/' },
      { kind:'teoria', books:['c3', 'tog7', 'a5'], text:'Orden temporal: ACOTAR sería el pasado, Trono de cristal el presente y Crescent City el futuro (en ACOTAR ya no hay dioses; en Trono de cristal se han ido; en Crescent City siguen).', src:'https://wou.edu/westernhowl/into-the-maasverse/' }] },

  { id:'cosmere', name:'Cosmere', author:'Brandon Sanderson',
    note:'Cada saga se entiende sola. Para pillar las conexiones: la era 1 de Nacidos de la bruma antes que la era 2, y El aliento de los dioses antes de Palabras radiantes.',
    series:[
      { name:'Nacidos de la bruma · era 1', books:[
        { k:'mb1', t:'El imperio final', o:'The Final Empire', alt:['Nacidos de la bruma', 'Mistborn', 'Mistborn: The Final Empire', 'Nacidos de la bruma: El imperio final'], y:2006 },
        { k:'mb2', t:'El Pozo de la Ascensión', o:'The Well of Ascension', y:2007 }, { k:'mb3', t:'El Héroe de las Eras', o:'The Hero of Ages', y:2008 }] },
      { name:'Nacidos de la bruma · era 2', books:[
        { k:'mb4', t:'Aleación de ley', o:'The Alloy of Law', y:2011 }, { k:'mb5', t:'Sombras de identidad', o:'Shadows of Self', y:2015 },
        { k:'mb6', t:'Brazales de duelo', o:'The Bands of Mourning', y:2016 }, { k:'mbs', t:'Historia secreta', o:'Mistborn: Secret History', y:2016, opt:true, note:'novela corta; mejor tras Brazales de duelo' },
        { k:'mb7', t:'El metal perdido', o:'The Lost Metal', y:2022 }] },
      { name:'Otras novelas', books:[
        { k:'el', t:'Elantris', o:'Elantris', y:2005 }, { k:'wb', t:'El aliento de los dioses', o:'Warbreaker', y:2009 },
        { k:'ark', t:'Arcanum ilimitado', o:'Arcanum Unbounded', y:2016, opt:true, note:'relatos' },
        { k:'tress', t:'Trenza del mar Esmeralda', o:'Tress of the Emerald Sea', y:2023 }, { k:'yumi', t:'Yumi y el pintor de pesadillas', o:'Yumi and the Nightmare Painter', y:2023 },
        { k:'sun', t:'El hombre iluminado', o:'The Sunlit Man', y:2023 }] },
      { name:'El archivo de las tormentas', books:[
        { k:'s1', t:'El camino de los reyes', o:'The Way of Kings', y:2010 }, { k:'s2', t:'Palabras radiantes', o:'Words of Radiance', y:2014 },
        { k:'s3', t:'Juramentada', o:'Oathbringer', y:2017 }, { k:'s4', t:'El ritmo de la guerra', o:'Rhythm of War', y:2020 }, { k:'s5', t:'Viento y verdad', o:'Wind and Truth', y:2024 }] }],
    order:['mb1', 'mb2', 'mb3', 'el', 'wb', 's1', 's2', 'mb4', 'mb5', 'mb6', 'mbs', 's3', 'ark', 's4', 'mb7', 'tress', 'yumi', 'sun', 's5'],
    links:[
      { kind:'guiño', books:['mb1'], text:'Hoid, el viajero que aparece en todo el Cosmere, sale en El imperio final: es el mendigo que vende información a Kelsier.', src:'https://coppermind.net/wiki/Hoid?oldid=6053' },
      { kind:'confirmado', books:['mb3'], text:'Al final de la era 1, Sazed se convierte en Armonía, la unión de los Fragmentos Conservación y Ruina; se le menciona en otras sagas del Cosmere.', src:'https://coppermind.net/wiki/Cosmere' },
      { kind:'confirmado', books:['mb3', 'mbs', 's4'], text:'Kelsier sigue activo después de la era 1 y funda los Ghostbloods, la organización que actúa en Roshar en El archivo de las tormentas.', src:'https://coppermind.net/wiki/Cosmere' },
      { kind:'confirmado', books:['mb7'], text:'En El metal perdido, la trama de Trell y del Fragmento Autonomía conecta Scadrial con el resto del Cosmere; la cierran Wax, Wayne y Marasi.', src:'https://coppermind.net/wiki/Cosmere' },
      { kind:'confirmado', books:['wb', 's2'], text:'Zahel, el maestro de espadas de Palabras radiantes, es Vasher, de El aliento de los dioses; Sangre Nocturna (Nightblood) también llega a Roshar.', src:'https://www.17thshard.com/forums/topic/98960-vasher-and-zahel/' },
      { kind:'confirmado', books:['wb', 's3'], text:'Azure, la mercenaria de Juramentada, es Vivenna, de El aliento de los dioses.', src:'https://www.17thshard.com/forums/topic/84007-do-we-know-anything-about-why-vivenna-went-to-roshar/' }] },

  { id:'grisha', name:'Grishaverse', author:'Leigh Bardugo',
    note:'Orden de publicación: la trilogía, Seis de cuervos y Rey de cicatrices. Seis de cuervos se puede leer antes, pero da por sabido el final de la trilogía.',
    series:[
      { name:'Sombra y hueso', books:[{ k:'g1', t:'Sombra y hueso', o:'Shadow and Bone', y:2012 }, { k:'g2', t:'Asedio y tormenta', o:'Siege and Storm', y:2013 }, { k:'g3', t:'Ruina y ascenso', o:'Ruin and Rising', y:2014 }] },
      { name:'Seis de cuervos', books:[{ k:'g4', t:'Seis de cuervos', o:'Six of Crows', y:2015 }, { k:'g5', t:'Reino de ladrones', o:'Crooked Kingdom', y:2016 }] },
      { name:'Rey de cicatrices', books:[{ k:'g6', t:'Rey de cicatrices', o:'King of Scars', y:2019 }, { k:'g7', o:'Rule of Wolves', y:2021 }] },
      { name:'Extras', books:[{ k:'g8', t:'El lenguaje de las espinas', o:'The Language of Thorns', y:2017, opt:true, note:'cuentos' }] }],
    order:['g1', 'g2', 'g3', 'g4', 'g5', 'g8', 'g6', 'g7'],
    links:[
      { kind:'confirmado', books:['g3', 'g4'], text:'Seis de cuervos transcurre unos dos años después de la trilogía y aparecen o se nombran personajes de ella.', src:'https://www.sportskeeda.com/pop-culture/do-you-have-read-shadow-bone-before-six-crows-chronology-explained' },
      { kind:'confirmado', books:['g3', 'g6'], text:'Nikolai, que aparece en la trilogía, protagoniza Rey de cicatrices junto a Zoya.', src:'https://www.marieclaire.com/culture/a36291169/shadow-and-bone-grishaverse-books-in-order' },
      { kind:'confirmado', books:['g5', 'g6'], text:'Nina, de Seis de cuervos, está en Fjerda como espía en Rey de cicatrices, y en Rule of Wolves coincide con Nikolai y Zoya.', src:'https://www.marieclaire.com/culture/a36291169/shadow-and-bone-grishaverse-books-in-order' }] },

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
      { kind:'confirmado', books:[], text:'Carne y fuego es una precuela: transcurre miles de años antes del nacimiento de Poppy, la protagonista de Sangre y cenizas.', src:'https://ca.news.yahoo.com/best-reading-order-jennifer-l-143207314.html' },
      { kind:'confirmado', books:[], text:'Las dos sagas giran en torno a una Doncella: Poppy en Sangre y cenizas y Sera, prometida al Primigenio de la Muerte, en Carne y fuego.', src:'https://ca.news.yahoo.com/best-reading-order-jennifer-l-143207314.html' }] },

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
      { kind:'confirmado', books:['h3'], text:'Tawny Man retoma a Fitz y al Bufón años después de Farseer, y Fitz and the Fool cierra su historia.', src:'https://www.tlbranson.com/robin-hobb-books-in-order' },
      { kind:'confirmado', books:['h6'], text:'Rain Wild Chronicles sigue a los dragones en las tierras de Lluvia Salvaje que aparecen en Liveship Traders.', src:'https://www.tlbranson.com/robin-hobb-books-in-order' }] },

  { id:'arnes', name:'Las Londres de Shades of Magic', author:'V. E. Schwab',
    note:'Primero la trilogía Shades of Magic; luego Threads of Power.',
    series:[
      { name:'Shades of Magic', books:[{ k:'sm1', t:'Una magia más oscura', o:'A Darker Shade of Magic', y:2015 }, { k:'sm2', o:'A Gathering of Shadows', y:2016 }, { k:'sm3', o:'A Conjuring of Light', y:2017 }] },
      { name:'Threads of Power', books:[{ k:'tp1', o:'The Fragile Threads of Power', y:2023 }] }],
    order:['sm1', 'sm2', 'sm3', 'tp1'],
    links:[{ kind:'confirmado', books:['sm3'], text:'Threads of Power transcurre siete años después de A Conjuring of Light, con protagonistas nuevos (Tes, Kosika) y las casas reales de Arnes muy presentes.', src:'https://shadesofmagic.fandom.com/wiki/Threads_of_Power' }] },

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
      { kind:'confirmado', books:['r1', 'z4'], text:'Elise Callisto y sus chicos, protagonistas de Ruthless Boys of the Zodiac, aparecen en la serie principal.', src:'https://www.tlbranson.com/zodiac-academy-reading-order/' },
      { kind:'confirmado', books:[], text:'Darkmore Penitentiary sigue a Rosalie Oscura y se sitúa después de la serie principal; Sins of the Zodiac tiene un reparto nuevo en el mismo mundo.', src:'https://www.tlbranson.com/zodiac-academy-reading-order/' }] },

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
    links:[{ kind:'confirmado', books:['ad10'], text:'Like Us sigue a los hijos de las tres hermanas Calloway, empezando por Maximoff Hale; varias de sus parejas son el punto de entrada de cada tramo.', src:'https://kbritchie.com/reading-order' }] },

  { id:'empyrean', name:'Empyrean', author:'Rebecca Yarros',
    note:'Los tres libros en orden; Threshing Day es opcional y no hace falta para el cuarto.',
    series:[{ name:'Empyrean', books:[
      { k:'e1', t:'Alas de sangre', o:'Fourth Wing', y:2023 }, { k:'e2', t:'Alas de hierro', o:'Iron Flame', y:2023 }, { k:'e3', t:'Alas de ónix', o:'Onyx Storm', y:2025 },
      { k:'e4', o:'Threshing Day', y:2026, opt:true, note:'13 relatos (Wing and Claw Collection)' }] }],
    order:['e1', 'e2', 'e3', 'e4'],
    links:[{ kind:'confirmado', books:['e3'], text:'Threshing Day reúne trece relatos sobre el Threshing y el vínculo entre jinetes y dragones; Yarros confirmó que es opcional.', src:'https://booksofbrilliance.com/2026/10/06/do-you-need-threshing-day-before-fourth-wing-book-4/' }] },

  { id:'priorato', name:'Raíces del caos', author:'Samantha Shannon',
    note:'Orden de publicación: El priorato del naranjo y luego la precuela.',
    series:[{ name:'The Roots of Chaos', books:[
      { k:'p1', t:'El priorato del naranjo', o:'The Priory of the Orange Tree', y:2019 }, { k:'p0', o:'A Day of Fallen Night', y:2023, note:'precuela' },
      { k:'p2', o:'Among the Burning Flowers', y:2025, opt:true, note:'precuela corta' }] }],
    order:['p1', 'p0', 'p2'],
    links:[{ kind:'confirmado', books:[], text:'A Day of Fallen Night va antes que El priorato del naranjo en la cronología de la serie, y hay un segundo libro posterior anunciado sin fecha.', src:'https://risingshadow.net/book/78080-the-roots-of-chaos-book-2' }] }
];
