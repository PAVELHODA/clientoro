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
  'Fyzioterapie': 'physiotherapy',
  'Fyzioterapia': 'physiotherapy',
  'physiotherapy': 'physiotherapy',
  'Rehabilitace': 'physiotherapy',
  'esteticka-klinika': 'aesthetic_clinic',
  'estetika': 'aesthetic_clinic',
  'aesthetic': 'aesthetic_clinic',
  'fitness': 'fitness',
  'trenink': 'fitness',
  'trening': 'fitness',
  'other': 'general',
  'general': 'general',
  'Ostatní': 'general',
  'Ostatné': 'general',
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
    cs: ['Plet', 'Líčení', 'Rasy', 'Oboci', 'Depilace', 'Ostatní'],
    sk: ['Plet', 'Líčenie', 'Mihalnice', 'Obočie', 'Depilácia', 'Ostatné'],
    en: ['Skin', 'Makeup', 'Lashes', 'Brows', 'Waxing', 'Other'],
  },
  nails: {
    cs: ['Manikura', 'Pedikura', 'Gel', 'Akryl', 'Zdobení', 'Ostatní'],
    sk: ['Manikura', 'Pedikura', 'Gel', 'Akryl', 'Zdobenie', 'Ostatné'],
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
  general: {
    cs: ['Konzultace', 'Služba', 'Balíček', 'Ostatní'],
    sk: ['Konzultácia', 'Služba', 'Balíček', 'Ostatné'],
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
    hair_salon: { cs: 'Kadeřnictví / Salón', sk: 'Kaderníctvo / Salón', en: 'Hair salon' },
    barber: { cs: 'Barber shop', sk: 'Barber shop', en: 'Barber shop' },
    beauty: { cs: 'Kosmetika / Beauty', sk: 'Kozmetika / Beauty', en: 'Beauty / Cosmetics' },
    nails: { cs: 'Nehty / Nails', sk: 'Nechty / Nails', en: 'Nails' },
    massage: { cs: 'Masáže / Wellness', sk: 'Masáže / Wellness', en: 'Massage / Wellness' },
    physiotherapy: { cs: 'Fyzioterapie', sk: 'Fyzioterapia', en: 'Physiotherapy' },
    aesthetic_clinic: { cs: 'Estetická klinika', sk: 'Estetická klinika', en: 'Aesthetic clinic' },
    fitness: { cs: 'Fitness / Trénink', sk: 'Fitness / Tréning', en: 'Fitness / Training' },
    general: { cs: 'Obecné služby', sk: 'Všeobecné služby', en: 'General services' },
  }
  const l = (lang === 'sk' ? 'sk' : lang === 'en' ? 'en' : 'cs') as Lang
  return Object.entries(labels).map(([value, lbl]) => ({ value: value as Industry, label: lbl[l] }))
}
