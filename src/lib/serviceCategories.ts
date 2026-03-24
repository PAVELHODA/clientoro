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
  | 'general'

type Lang = 'cs' | 'sk' | 'en'

// Map org.category slugs (from admin/onboarding) to industry keys
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
  'other': 'general',
  'general': 'general',
  'ostatni': 'general',
  'ostatne': 'general',
}

const CATEGORIES: Record<Industry, Record<Lang, string[]>> = {
  hair_salon: {
    cs: ['Strihani', 'Barveni', 'Styling', 'Pece o vlasy', 'Ostatni'],
    sk: ['Strihanie', 'Farbenie', 'Styling', 'Starostlivost o vlasy', 'Ostatne'],
    en: ['Haircut', 'Coloring', 'Styling', 'Hair care', 'Other'],
  },
  barber: {
    cs: ['Strihani', 'Holeni', 'Vousy', 'Styling', 'Ostatni'],
    sk: ['Strihanie', 'Holenie', 'Fuzy', 'Styling', 'Ostatne'],
    en: ['Haircut', 'Shaving', 'Beard', 'Styling', 'Other'],
  },
  beauty: {
    cs: ['Plet', 'Liceni', 'Rasy', 'Oboci', 'Depilace', 'Ostatni'],
    sk: ['Plet', 'Licenie', 'Mihalnice', 'Obicie', 'Depilacia', 'Ostatne'],
    en: ['Skin', 'Makeup', 'Lashes', 'Brows', 'Waxing', 'Other'],
  },
  nails: {
    cs: ['Manikura', 'Pedikura', 'Gel', 'Akryl', 'Zdobeni', 'Ostatni'],
    sk: ['Manikura', 'Pedikura', 'Gel', 'Akryl', 'Zdobenie', 'Ostatne'],
    en: ['Manicure', 'Pedicure', 'Gel', 'Acrylic', 'Nail art', 'Other'],
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
  general: {
    cs: ['Konzultace', 'Sluzba', 'Balicek', 'Ostatni'],
    sk: ['Konzultacia', 'Sluzba', 'Balicek', 'Ostatne'],
    en: ['Consultation', 'Service', 'Package', 'Other'],
  },
}

function resolveIndustry(category: string | null | undefined): Industry {
  if (!category) return 'general'
  // Category can be comma-separated from onboarding (e.g. "kadernictvi,kosmetika")
  // Use the first one
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
    hair_salon: { cs: 'Kadernictvi / Salon', sk: 'Kadernictvo / Salon', en: 'Hair salon' },
    barber: { cs: 'Barber shop', sk: 'Barber shop', en: 'Barber shop' },
    beauty: { cs: 'Kosmetika / Beauty', sk: 'Kozmetika / Beauty', en: 'Beauty / Cosmetics' },
    nails: { cs: 'Nehty / Nails', sk: 'Nechty / Nails', en: 'Nails' },
    massage: { cs: 'Masaze / Wellness', sk: 'Masaze / Wellness', en: 'Massage / Wellness' },
    physiotherapy: { cs: 'Fyzioterapie', sk: 'Fyzioterapia', en: 'Physiotherapy' },
    aesthetic_clinic: { cs: 'Esteticka klinika', sk: 'Esteticka klinika', en: 'Aesthetic clinic' },
    fitness: { cs: 'Fitness / Trenink', sk: 'Fitness / Trening', en: 'Fitness / Training' },
    general: { cs: 'Obecne sluzby', sk: 'Vseobecne sluzby', en: 'General services' },
  }
  const l = (lang === 'sk' ? 'sk' : lang === 'en' ? 'en' : 'cs') as Lang
  return Object.entries(labels).map(([value, lbl]) => ({ value: value as Industry, label: lbl[l] }))
}
