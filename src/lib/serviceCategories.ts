// PATH: src/lib/serviceCategories.ts

export type Industry =
  | 'hair_salon'
  | 'barber'
  | 'beauty'
  | 'nails'
  | 'massage'
  | 'physiotherapy'
  | 'aesthetic_clinic'
  | 'fitness'
  | 'psychology'
  | 'tattoo'
  | 'pets'
  | 'education'
  | 'tours'
  | 'wellness_experiences'
  | 'experiences'
  | 'events'
  | 'weddings'
  | 'photo'
  | 'consulting'
  | 'general'

type Lang = 'cs' | 'sk' | 'en'

const SLUG_MAP: Record<string, Industry> = {
  'kadernictvi': 'hair_salon',
  'kadernictvo': 'hair_salon',
  'hair-salon': 'hair_salon',
  'hair_salon': 'hair_salon',
  'barber': 'barber',
  'barber-shop': 'barber',
  'kosmetika': 'beauty',
  'kozmetika': 'beauty',
  'beauty': 'beauty',
  'nehty': 'nails',
  'nechty': 'nails',
  'nails': 'nails',
  'masaze': 'massage',
  'massage': 'massage',
  'wellness': 'massage',
  'fyzioterapie': 'physiotherapy',
  'fyzioterapia': 'physiotherapy',
  'physiotherapy': 'physiotherapy',
  'rehabilitace': 'physiotherapy',
  'esteticka-klinika': 'aesthetic_clinic',
  'estetika': 'aesthetic_clinic',
  'aesthetic': 'aesthetic_clinic',
  'fitness': 'fitness',
  'trenink': 'fitness',
  'trening': 'fitness',
  'psychologie': 'psychology',
  'psychologia': 'psychology',
  'psychology': 'psychology',
  'koucink': 'psychology',
  'koucing': 'psychology',
  'coaching': 'psychology',
  'tetovani': 'tattoo',
  'tetovanie': 'tattoo',
  'tattoo': 'tattoo',
  'piercing': 'tattoo',
  'pece-o-zvirata': 'pets',
  'starostlivost-o-zvierata': 'pets',
  'pets': 'pets',
  'grooming': 'pets',
  'vzdelavani': 'education',
  'vzdelavanie': 'education',
  'education': 'education',
  'lekce': 'education',
  'lekcie': 'education',
  'prohlidky': 'tours',
  'prehliadky': 'tours',
  'tours': 'tours',
  'pruvodce': 'tours',
  'sprievodca': 'tours',
  'wellness-zazitky': 'wellness_experiences',
  'wellness-experiences': 'wellness_experiences',
  'terapie-tmou': 'wellness_experiences',
  'zazitky': 'experiences',
  'experiences': 'experiences',
  'aktivity': 'experiences',
  'oslavy': 'events',
  'events': 'events',
  'party': 'events',
  'svatby': 'weddings',
  'svadby': 'weddings',
  'weddings': 'weddings',
  'foto': 'photo',
  'photo': 'photo',
  'video': 'photo',
  'foceni': 'photo',
  'fotenie': 'photo',
  'poradenstvi': 'consulting',
  'poradenstvo': 'consulting',
  'consulting': 'consulting',
  'konzultace': 'consulting',
  'other': 'general',
  'general': 'general',
  'ostatni': 'general',
  'ostatne': 'general',
}

const CATEGORIES: Record<Industry, Record<Lang, string[]>> = {
  hair_salon: {
    cs: ['Stříhání', 'Barvení', 'Styling', 'Péče o vlasy', 'Ostatní'],
    sk: ['Strihanie', 'Farbenie', 'Styling', 'Starostlivosť o vlasy', 'Ostatné'],
    en: ['Haircut', 'Coloring', 'Styling', 'Hair care', 'Other'],
  },
  barber: {
    cs: ['Stříhání', 'Holení', 'Vousy', 'Styling', 'Ostatní'],
    sk: ['Strihanie', 'Holenie', 'Fúzy', 'Styling', 'Ostatné'],
    en: ['Haircut', 'Shaving', 'Beard', 'Styling', 'Other'],
  },
  beauty: {
    cs: ['Pleť', 'Líčení', 'Řasy', 'Obočí', 'Depilace', 'Ostatní'],
    sk: ['Pleť', 'Líčenie', 'Mihalnice', 'Obočie', 'Depilácia', 'Ostatné'],
    en: ['Skin', 'Makeup', 'Lashes', 'Brows', 'Waxing', 'Other'],
  },
  nails: {
    cs: ['Manikúra', 'Pedikúra', 'Gel', 'Akryl', 'Zdobení', 'Ostatní'],
    sk: ['Manikúra', 'Pedikúra', 'Gel', 'Akryl', 'Zdobenie', 'Ostatné'],
    en: ['Manicure', 'Pedicure', 'Gel', 'Acrylic', 'Nail art', 'Other'],
  },
  massage: {
    cs: ['Klasická', 'Sportovní', 'Relaxační', 'Lymfatická', 'Reflexní', 'Ostatní'],
    sk: ['Klasická', 'Športová', 'Relaxačná', 'Lymfatická', 'Reflexná', 'Ostatné'],
    en: ['Classic', 'Sports', 'Relaxation', 'Lymphatic', 'Reflexology', 'Other'],
  },
  physiotherapy: {
    cs: ['Vyšetření', 'Manuální terapie', 'Rehabilitace', 'Elektroterapie', 'Prevence', 'Ostatní'],
    sk: ['Vyšetrenie', 'Manuálna terapia', 'Rehabilitácia', 'Elektroterapia', 'Prevencia', 'Ostatné'],
    en: ['Examination', 'Manual therapy', 'Rehabilitation', 'Electrotherapy', 'Prevention', 'Other'],
  },
  aesthetic_clinic: {
    cs: ['Injekce', 'Laser', 'Peeling', 'Body', 'Konzultace', 'Ostatní'],
    sk: ['Injekcie', 'Laser', 'Peeling', 'Body', 'Konzultácia', 'Ostatné'],
    en: ['Injectables', 'Laser', 'Peeling', 'Body', 'Consultation', 'Other'],
  },
  fitness: {
    cs: ['Osobní trénink', 'Skupinový', 'Výživa', 'Diagnostika', 'Ostatní'],
    sk: ['Osobný tréning', 'Skupinový', 'Výživa', 'Diagnostika', 'Ostatné'],
    en: ['Personal training', 'Group', 'Nutrition', 'Diagnostics', 'Other'],
  },
  psychology: {
    cs: ['Individuální terapie', 'Párová terapie', 'Koučink', 'Mentoring', 'Diagnostika', 'Ostatní'],
    sk: ['Individuálna terapia', 'Párová terapia', 'Koučing', 'Mentoring', 'Diagnostika', 'Ostatné'],
    en: ['Individual therapy', 'Couples therapy', 'Coaching', 'Mentoring', 'Diagnostics', 'Other'],
  },
  tattoo: {
    cs: ['Tetování malé', 'Tetování střední', 'Tetování velké', 'Cover-up', 'Piercing', 'Konzultace', 'Ostatní'],
    sk: ['Tetovanie malé', 'Tetovanie stredné', 'Tetovanie veľké', 'Cover-up', 'Piercing', 'Konzultácia', 'Ostatné'],
    en: ['Small tattoo', 'Medium tattoo', 'Large tattoo', 'Cover-up', 'Piercing', 'Consultation', 'Other'],
  },
  pets: {
    cs: ['Stříhání', 'Koupání', 'Trimování', 'Drápky', 'Trénink', 'Ostatní'],
    sk: ['Strihanie', 'Kúpanie', 'Trimovanie', 'Drápky', 'Tréning', 'Ostatné'],
    en: ['Grooming', 'Bathing', 'Trimming', 'Nail clipping', 'Training', 'Other'],
  },
  education: {
    cs: ['Doučování', 'Jazykový kurz', 'Hudební lekce', 'Workshop', 'Online lekce', 'Ostatní'],
    sk: ['Doučovanie', 'Jazykový kurz', 'Hudobná lekcia', 'Workshop', 'Online lekcia', 'Ostatné'],
    en: ['Tutoring', 'Language course', 'Music lesson', 'Workshop', 'Online lesson', 'Other'],
  },
  tours: {
    cs: ['Historická prohlídka', 'Food tour', 'Ghost tour', 'Architektura', 'Degustace', 'Ostatní'],
    sk: ['Historická prehliadka', 'Food tour', 'Ghost tour', 'Architektúra', 'Degustácia', 'Ostatné'],
    en: ['Historical tour', 'Food tour', 'Ghost tour', 'Architecture', 'Tasting', 'Other'],
  },
  wellness_experiences: {
    cs: ['Terapie tmou', 'Včelí maringotka', 'Flotační tank', 'Kryokomora', 'Saunové rituály', 'Zvuková terapie', 'Ostatní'],
    sk: ['Terapia tmou', 'Včelia maringotka', 'Flotačný tank', 'Kryokomora', 'Saunové rituály', 'Zvuková terapia', 'Ostatné'],
    en: ['Dark therapy', 'Bee hive cabin', 'Float tank', 'Cryotherapy', 'Sauna rituals', 'Sound therapy', 'Other'],
  },
  experiences: {
    cs: ['Úniková hra', 'Kreativní dílna', 'Teambuilding', 'Farma zážitky', 'Školní výlet', 'Ostatní'],
    sk: ['Úniková hra', 'Kreatívna dielňa', 'Teambuilding', 'Farma zážitky', 'Školský výlet', 'Ostatné'],
    en: ['Escape room', 'Creative workshop', 'Team building', 'Farm experience', 'School trip', 'Other'],
  },
  events: {
    cs: ['Narozeninová oslava', 'Firemní akce', 'Dětská párty', 'Rozlučka', 'Výročí', 'Ostatní'],
    sk: ['Narodeninová oslava', 'Firemná akcia', 'Detská párty', 'Rozlúčka', 'Výročie', 'Ostatné'],
    en: ['Birthday party', 'Corporate event', 'Kids party', 'Farewell', 'Anniversary', 'Other'],
  },
  weddings: {
    cs: ['Koordinace svatby', 'Obřadní místo', 'Čajový obřad', 'Svatební výzdoba', 'Moderování', 'Ostatní'],
    sk: ['Koordinácia svadby', 'Obradné miesto', 'Čajový obrad', 'Svadobná výzdoba', 'Moderovanie', 'Ostatné'],
    en: ['Wedding coordination', 'Ceremony venue', 'Tea ceremony', 'Wedding decoration', 'MC / Hosting', 'Other'],
  },
  photo: {
    cs: ['Portrétní focení', 'Svatební foto', 'Produktové foto', 'Video natáčení', 'Editace', 'Ostatní'],
    sk: ['Portrétne fotenie', 'Svadobné foto', 'Produktové foto', 'Video natáčanie', 'Editácia', 'Ostatné'],
    en: ['Portrait photography', 'Wedding photo', 'Product photo', 'Video production', 'Editing', 'Other'],
  },
  consulting: {
    cs: ['Právní poradenství', 'Finanční poradenství', 'Daňové poradenství', 'IT konzultace', 'Ostatní'],
    sk: ['Právne poradenstvo', 'Finančné poradenstvo', 'Daňové poradenstvo', 'IT konzultácia', 'Ostatné'],
    en: ['Legal consulting', 'Financial consulting', 'Tax consulting', 'IT consulting', 'Other'],
  },
  general: {
    cs: ['Konzultace', 'Služba', 'Balíček', 'Ostatní'],
    sk: ['Konzultácia', 'Služba', 'Balíček', 'Ostatné'],
    en: ['Consultation', 'Service', 'Package', 'Other'],
  },
}

function resolveIndustry(category: string | null | undefined): Industry {
  if (!category) return 'general'
  const first = category.split(',')[0].trim().toLowerCase()
  return SLUG_MAP[first] || 'general'
}

export function getServiceCategories(category: string | null | undefined, lang: string): string[] {
  const industry = resolveIndustry(category)
  const l = (lang === 'sk' ? 'sk' : lang === 'en' ? 'en' : 'cs') as Lang
  return CATEGORIES[industry]?.[l] || CATEGORIES.general[l]
}

export function getAllIndustries(lang: string): { value: Industry; label: string }[] {
  const labels: Record<Industry, Record<Lang, string>> = {
    hair_salon: { cs: 'Kadeřnictví / Salón', sk: 'Kaderníctvo / Salón', en: 'Hair salon' },
    barber: { cs: 'Barber shop', sk: 'Barber shop', en: 'Barber shop' },
    beauty: { cs: 'Kosmetika / Beauty', sk: 'Kozmetika / Beauty', en: 'Beauty / Cosmetics' },
    nails: { cs: 'Nehty / Nails', sk: 'Nechty / Nails', en: 'Nails' },
    massage: { cs: 'Masáže / Wellness', sk: 'Masáže / Wellness', en: 'Massage / Wellness' },
    physiotherapy: { cs: 'Fyzioterapie', sk: 'Fyzioterapia', en: 'Physiotherapy' },
    aesthetic_clinic: { cs: 'Estetická klinika', sk: 'Estetická klinika', en: 'Aesthetic clinic' },
    fitness: { cs: 'Fitness / Trénink', sk: 'Fitness / Tréning', en: 'Fitness / Training' },
    psychology: { cs: 'Psychologie / Koučink', sk: 'Psychológia / Koučing', en: 'Psychology / Coaching' },
    tattoo: { cs: 'Tetování / Piercing', sk: 'Tetovanie / Piercing', en: 'Tattoo / Piercing' },
    pets: { cs: 'Péče o zvířata', sk: 'Starostlivosť o zvieratá', en: 'Pet care' },
    education: { cs: 'Vzdělávání / Lekce', sk: 'Vzdelávanie / Lekcie', en: 'Education / Lessons' },
    tours: { cs: 'Prohlídky / Průvodci', sk: 'Prehliadky / Sprievodcovia', en: 'Tours / Guides' },
    wellness_experiences: { cs: 'Wellness zážitky', sk: 'Wellness zážitky', en: 'Wellness experiences' },
    experiences: { cs: 'Zážitky / Aktivity', sk: 'Zážitky / Aktivity', en: 'Experiences / Activities' },
    events: { cs: 'Oslavy / Události', sk: 'Oslavy / Udalosti', en: 'Events / Parties' },
    weddings: { cs: 'Svatby / Obřady', sk: 'Svadby / Obrady', en: 'Weddings / Ceremonies' },
    photo: { cs: 'Foto / Video', sk: 'Foto / Video', en: 'Photo / Video' },
    consulting: { cs: 'Poradenství / Konzultace', sk: 'Poradenstvo / Konzultácie', en: 'Consulting' },
    general: { cs: 'Obecné služby', sk: 'Všeobecné služby', en: 'General services' },
  }
  const l = (lang === 'sk' ? 'sk' : lang === 'en' ? 'en' : 'cs') as Lang
  return Object.entries(labels).map(([value, lbl]) => ({ value: value as Industry, label: lbl[l] }))
}