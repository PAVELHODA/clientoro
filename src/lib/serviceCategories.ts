// PATH: src/lib/serviceCategories.ts

export type Industry =
  | 'hair_salon'
  | 'beauty'
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
  // Hair & Barber
  'kadernictvi': 'hair_salon',
  'kadernictvo': 'hair_salon',
  'hair-salon': 'hair_salon',
  'hair_salon': 'hair_salon',
  'barber': 'hair_salon',
  'barber-shop': 'hair_salon',
  // Beauty & Nails
  'kosmetika': 'beauty',
  'kozmetika': 'beauty',
  'beauty': 'beauty',
  'nehty': 'beauty',
  'nechty': 'beauty',
  'nails': 'beauty',
  // Massage
  'masaze': 'massage',
  'massage': 'massage',
  'wellness': 'massage',
  // Physiotherapy
  'fyzioterapie': 'physiotherapy',
  'fyzioterapia': 'physiotherapy',
  'physiotherapy': 'physiotherapy',
  'rehabilitace': 'physiotherapy',
  // Aesthetic clinic
  'esteticka-klinika': 'aesthetic_clinic',
  'estetika': 'aesthetic_clinic',
  'aesthetic': 'aesthetic_clinic',
  'aesthetic_clinic': 'aesthetic_clinic',
  // Fitness
  'fitness': 'fitness',
  'trenink': 'fitness',
  'trening': 'fitness',
  // Psychology
  'psychologie': 'psychology',
  'psychologia': 'psychology',
  'psychology': 'psychology',
  'koucink': 'psychology',
  'koucing': 'psychology',
  'coaching': 'psychology',
  // Tattoo
  'tetovani': 'tattoo',
  'tetovanie': 'tattoo',
  'tattoo': 'tattoo',
  'piercing': 'tattoo',
  // Pets
  'pece-o-zvirata': 'pets',
  'starostlivost-o-zvierata': 'pets',
  'pets': 'pets',
  'grooming': 'pets',
  // Education
  'vzdelavani': 'education',
  'vzdelavanie': 'education',
  'education': 'education',
  'lekce': 'education',
  'lekcie': 'education',
  // Tours
  'prohlidky': 'tours',
  'prehliadky': 'tours',
  'tours': 'tours',
  'pruvodce': 'tours',
  'sprievodca': 'tours',
  // Wellness experiences
  'wellness-zazitky': 'wellness_experiences',
  'wellness-experiences': 'wellness_experiences',
  'terapie-tmou': 'wellness_experiences',
  // Experiences
  'zazitky': 'experiences',
  'experiences': 'experiences',
  'aktivity': 'experiences',
  // Events
  'oslavy': 'events',
  'events': 'events',
  'party': 'events',
  // Weddings
  'svatby': 'weddings',
  'svadby': 'weddings',
  'weddings': 'weddings',
  // Photo
  'foto': 'photo',
  'photo': 'photo',
  'video': 'photo',
  'foceni': 'photo',
  'fotenie': 'photo',
  // Consulting
  'poradenstvi': 'consulting',
  'poradenstvo': 'consulting',
  'consulting': 'consulting',
  'konzultace': 'consulting',
  // General (fallback)
  'other': 'general',
  'general': 'general',
  'ostatni': 'general',
  'ostatne': 'general',
}

const CATEGORIES: Record<Industry, Record<Lang, string[]>> = {
  hair_salon: {
    cs: ['Strihani', 'Barveni', 'Styling', 'Pece o vlasy', 'Holeni', 'Vousy', 'Uprava brady', 'Ostatni'],
    sk: ['Strihanie', 'Farbenie', 'Styling', 'Starostlivost o vlasy', 'Holenie', 'Fuzy', 'Uprava brady', 'Ostatne'],
    en: ['Haircut', 'Coloring', 'Styling', 'Hair care', 'Shaving', 'Beard', 'Beard trim', 'Other'],
  },
  beauty: {
    cs: ['Plet', 'Liceni', 'Rasy', 'Oboci', 'Depilace', 'Manikura', 'Pedikura', 'Gel', 'Akryl', 'Zdobeni', 'Ostatni'],
    sk: ['Plet', 'Licenie', 'Mihalnice', 'Obocie', 'Depilacia', 'Manikura', 'Pedikura', 'Gel', 'Akryl', 'Zdobenie', 'Ostatne'],
    en: ['Skin', 'Makeup', 'Lashes', 'Brows', 'Waxing', 'Manicure', 'Pedicure', 'Gel', 'Acrylic', 'Nail art', 'Other'],
  },
  massage: {
    cs: ['Klasicka', 'Sportovni', 'Relaxacni', 'Lymfaticka', 'Reflexni', 'Ostatni'],
    sk: ['Klasicka', 'Sportova', 'Relaxacna', 'Lymfaticka', 'Reflexna', 'Ostatne'],
    en: ['Classic', 'Sports', 'Relaxation', 'Lymphatic', 'Reflexology', 'Other'],
  },
  physiotherapy: {
    cs: ['Vysetreni', 'Manualni terapie', 'Rehabilitace', 'Elektroterapie', 'Prevence', 'Ostatni'],
    sk: ['Vysetrenie', 'Manualna terapia', 'Rehabilitacia', 'Elektroterapia', 'Prevencia', 'Ostatne'],
    en: ['Examination', 'Manual therapy', 'Rehabilitation', 'Electrotherapy', 'Prevention', 'Other'],
  },
  aesthetic_clinic: {
    cs: ['Injekce', 'Laser', 'Peeling', 'Body', 'Konzultace', 'Ostatni'],
    sk: ['Injekcie', 'Laser', 'Peeling', 'Body', 'Konzultacia', 'Ostatne'],
    en: ['Injectables', 'Laser', 'Peeling', 'Body', 'Consultation', 'Other'],
  },
  fitness: {
    cs: ['Osobni trenink', 'Skupinovy', 'Vyziva', 'Diagnostika', 'Ostatni'],
    sk: ['Osobny trening', 'Skupinovy', 'Vyziva', 'Diagnostika', 'Ostatne'],
    en: ['Personal training', 'Group', 'Nutrition', 'Diagnostics', 'Other'],
  },
  psychology: {
    cs: ['Individualni terapie', 'Parova terapie', 'Koucink', 'Mentoring', 'Diagnostika', 'Ostatni'],
    sk: ['Individualna terapia', 'Parova terapia', 'Koucing', 'Mentoring', 'Diagnostika', 'Ostatne'],
    en: ['Individual therapy', 'Couples therapy', 'Coaching', 'Mentoring', 'Diagnostics', 'Other'],
  },
  tattoo: {
    cs: ['Tetovani male', 'Tetovani stredni', 'Tetovani velke', 'Cover-up', 'Piercing', 'Konzultace', 'Ostatni'],
    sk: ['Tetovanie male', 'Tetovanie stredne', 'Tetovanie velke', 'Cover-up', 'Piercing', 'Konzultacia', 'Ostatne'],
    en: ['Small tattoo', 'Medium tattoo', 'Large tattoo', 'Cover-up', 'Piercing', 'Consultation', 'Other'],
  },
  pets: {
    cs: ['Strihani', 'Koupani', 'Trimovani', 'Drapky', 'Trenink', 'Ostatni'],
    sk: ['Strihanie', 'Kupanie', 'Trimovanie', 'Drapky', 'Trening', 'Ostatne'],
    en: ['Grooming', 'Bathing', 'Trimming', 'Nail clipping', 'Training', 'Other'],
  },
  education: {
    cs: ['Doucovani', 'Jazykovy kurz', 'Hudebni lekce', 'Workshop', 'Online lekce', 'Ostatni'],
    sk: ['Doucovanie', 'Jazykovy kurz', 'Hudobna lekcia', 'Workshop', 'Online lekcia', 'Ostatne'],
    en: ['Tutoring', 'Language course', 'Music lesson', 'Workshop', 'Online lesson', 'Other'],
  },
  tours: {
    cs: ['Historicka prohlidka', 'Food tour', 'Ghost tour', 'Architektura', 'Degustace', 'Ostatni'],
    sk: ['Historicka prehliadka', 'Food tour', 'Ghost tour', 'Architektura', 'Degustacia', 'Ostatne'],
    en: ['Historical tour', 'Food tour', 'Ghost tour', 'Architecture', 'Tasting', 'Other'],
  },
  wellness_experiences: {
    cs: ['Terapie tmou', 'Vceli maringotka', 'Flotacni tank', 'Kryokomora', 'Saunove ritualy', 'Zvukova terapie', 'Ostatni'],
    sk: ['Terapia tmou', 'Vcelia maringotka', 'Flotacny tank', 'Kryokomora', 'Saunove ritualy', 'Zvukova terapia', 'Ostatne'],
    en: ['Dark therapy', 'Bee hive cabin', 'Float tank', 'Cryotherapy', 'Sauna rituals', 'Sound therapy', 'Other'],
  },
  experiences: {
    cs: ['Unikova hra', 'Kreativni dilna', 'Teambuilding', 'Farma zazitky', 'Skolni vylet', 'Ostatni'],
    sk: ['Unikova hra', 'Kreativna dielna', 'Teambuilding', 'Farma zazitky', 'Skolsky vylet', 'Ostatne'],
    en: ['Escape room', 'Creative workshop', 'Team building', 'Farm experience', 'School trip', 'Other'],
  },
  events: {
    cs: ['Narozeninova oslava', 'Firemni akce', 'Detska party', 'Rozlucka', 'Vyroci', 'Ostatni'],
    sk: ['Narodeninova oslava', 'Firemna akcia', 'Detska party', 'Rozlucka', 'Vyrocie', 'Ostatne'],
    en: ['Birthday party', 'Corporate event', 'Kids party', 'Farewell', 'Anniversary', 'Other'],
  },
  weddings: {
    cs: ['Koordinace svatby', 'Obradni misto', 'Cajovy obrad', 'Svatebni vyzdoba', 'Moderovani', 'Ostatni'],
    sk: ['Koordinacia svadby', 'Obradne miesto', 'Cajovy obrad', 'Svadobna vyzdoba', 'Moderovanie', 'Ostatne'],
    en: ['Wedding coordination', 'Ceremony venue', 'Tea ceremony', 'Wedding decoration', 'MC / Hosting', 'Other'],
  },
  photo: {
    cs: ['Portretni foceni', 'Svatebni foto', 'Produktove foto', 'Video nataceni', 'Editace', 'Ostatni'],
    sk: ['Portretne fotenie', 'Svadobne foto', 'Produktove foto', 'Video natacanie', 'Editacia', 'Ostatne'],
    en: ['Portrait photography', 'Wedding photo', 'Product photo', 'Video production', 'Editing', 'Other'],
  },
  consulting: {
    cs: ['Pravni poradenstvi', 'Financni poradenstvi', 'Danove poradenstvi', 'IT konzultace', 'Ostatni'],
    sk: ['Pravne poradenstvo', 'Financne poradenstvo', 'Danove poradenstvo', 'IT konzultacia', 'Ostatne'],
    en: ['Legal consulting', 'Financial consulting', 'Tax consulting', 'IT consulting', 'Other'],
  },
  general: {
    cs: ['Konzultace', 'Sluzba', 'Balicek', 'Ostatni'],
    sk: ['Konzultacia', 'Sluzba', 'Balicek', 'Ostatne'],
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
    hair_salon: { cs: 'Kadernictvi & Barber', sk: 'Kadernictvo & Barber', en: 'Hair salon & Barber' },
    beauty: { cs: 'Kosmetika & Nehty', sk: 'Kozmetika & Nechty', en: 'Beauty & Nails' },
    massage: { cs: 'Masaze & Wellness', sk: 'Masaze & Wellness', en: 'Massage & Wellness' },
    physiotherapy: { cs: 'Fyzioterapie & Zdravi', sk: 'Fyzioterapia & Zdravie', en: 'Physiotherapy & Health' },
    aesthetic_clinic: { cs: 'Esteticka klinika', sk: 'Esteticka klinika', en: 'Aesthetic clinic' },
    fitness: { cs: 'Fitness & Trenink', sk: 'Fitness & Trening', en: 'Fitness & Training' },
    psychology: { cs: 'Psychologie & Koucink', sk: 'Psychologia & Koucing', en: 'Psychology & Coaching' },
    tattoo: { cs: 'Tetovani & Piercing', sk: 'Tetovanie & Piercing', en: 'Tattoo & Piercing' },
    pets: { cs: 'Pece o zvirata', sk: 'Starostlivost o zvierata', en: 'Pet care' },
    education: { cs: 'Vzdelavani & Lekce', sk: 'Vzdelavanie & Lekcie', en: 'Education & Lessons' },
    tours: { cs: 'Prohlidky & Pruvodci', sk: 'Prehliadky & Sprievodcovia', en: 'Tours & Guides' },
    wellness_experiences: { cs: 'Wellness zazitky', sk: 'Wellness zazitky', en: 'Wellness experiences' },
    experiences: { cs: 'Zazitky & Aktivity', sk: 'Zazitky & Aktivity', en: 'Experiences & Activities' },
    events: { cs: 'Oslavy & Udalosti', sk: 'Oslavy & Udalosti', en: 'Events & Parties' },
    weddings: { cs: 'Svatby & Obrady', sk: 'Svadby & Obrady', en: 'Weddings & Ceremonies' },
    photo: { cs: 'Foto & Video', sk: 'Foto & Video', en: 'Photo & Video' },
    consulting: { cs: 'Poradenstvi & Konzultace', sk: 'Poradenstvo & Konzultacie', en: 'Consulting' },
    general: { cs: 'Dalsi sluzby', sk: 'Dalsie sluzby', en: 'Other services' },
  }
  const l = (lang === 'sk' ? 'sk' : lang === 'en' ? 'en' : 'cs') as Lang
  return Object.entries(labels).map(([value, lbl]) => ({ value: value as Industry, label: lbl[l] }))
}