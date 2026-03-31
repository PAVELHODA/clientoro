﻿// PATH: src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Waves, Calendar, Users, Brain, TrendingUp, ChevronDown, Shield, Zap, Check, ArrowRight, CreditCard, Banknote, Scissors, Sparkles, Gem, HeartPulse, Dumbbell, BrainCircuit, PawPrint, GraduationCap, MessageSquare, X, Eye } from 'lucide-react'
import { PublicLang, publicTranslations } from '@/lib/publicI18n'
import ClientoroLogo from '@/components/ClientoroLogo'

const flags: Record<PublicLang, string> = { cs: '🇨🇿', sk: '🇸🇰', en: '🇬🇧' }

const SEGMENT_ICONS: Record<string, any> = {
  scissors: Scissors, sparkles: Sparkles, gem: Gem, heartPulse: HeartPulse,
  dumbbell: Dumbbell, brainCircuit: BrainCircuit, messageSquare: MessageSquare,
  pawPrint: PawPrint, graduationCap: GraduationCap,
}

const SEGMENT_KEYS = [
  { icon: 'scissors', key: 'hair' },
  { icon: 'sparkles', key: 'massage' },
  { icon: 'gem', key: 'beauty' },
  { icon: 'heartPulse', key: 'physio' },
  { icon: 'dumbbell', key: 'fitness' },
  { icon: 'brainCircuit', key: 'psych' },
  { icon: 'messageSquare', key: 'tattoo' },
  { icon: 'pawPrint', key: 'pets' },
  { icon: 'graduationCap', key: 'edu' },
  { icon: 'sparkles', key: 'exp' },
]

const SEGMENT_SERVICES: Record<string, Record<string, string[]>> = {
  hair: {
    cs: ['Dámský střih', 'Pánský střih', 'Barvení', 'Melír', 'Foukaná', 'Styling', 'Keratin', 'Dětský střih'],
    sk: ['Dámsky strih', 'Pánsky strih', 'Farbenie', 'Melír', 'Fúkaná', 'Styling', 'Keratín', 'Detský strih'],
    en: ['Women\'s cut', 'Men\'s cut', 'Coloring', 'Highlights', 'Blow-dry', 'Styling', 'Keratin', 'Kids cut'],
  },
  massage: {
    cs: ['Klasická masáž', 'Sportovní masáž', 'Relaxační masáž', 'Lymfatická masáž', 'Reflexní masáž', 'Baňkování', 'Masáž lávovými kameny'],
    sk: ['Klasická masáž', 'Športová masáž', 'Relaxačná masáž', 'Lymfatická masáž', 'Reflexná masáž', 'Bankovanie', 'Masáž lávovými kameňmi'],
    en: ['Classic massage', 'Sports massage', 'Relaxation massage', 'Lymphatic massage', 'Reflexology', 'Cupping', 'Hot stone massage'],
  },
  beauty: {
    cs: ['Ošetření pleti', 'Permanentní make-up', 'Manikúra', 'Pedikúra', 'Gelové nehty', 'Řasy', 'Depilace', 'Barvení obočí'],
    sk: ['Ošetrenie pleti', 'Permanentný make-up', 'Manikúra', 'Pedikúra', 'Gélové nechty', 'Mihalnice', 'Depilácia', 'Farbenie obočia'],
    en: ['Facial treatment', 'Permanent makeup', 'Manicure', 'Pedicure', 'Gel nails', 'Lashes', 'Waxing', 'Brow tinting'],
  },
  physio: {
    cs: ['Vstupní vyšetření', 'Manuální terapie', 'Rehabilitace', 'Elektroterapie', 'Tejpování', 'Cvičení s terapeutem'],
    sk: ['Vstupné vyšetrenie', 'Manuálna terapia', 'Rehabilitácia', 'Elektroterapia', 'Tejpovanie', 'Cvičenie s terapeutom'],
    en: ['Initial examination', 'Manual therapy', 'Rehabilitation', 'Electrotherapy', 'Taping', 'Exercise with therapist'],
  },
  fitness: {
    cs: ['Osobní trénink', 'Skupinový trénink', 'Jóga', 'Pilates', 'Funkční trénink', 'Strečink', 'Spinning'],
    sk: ['Osobný tréning', 'Skupinový tréning', 'Jóga', 'Pilates', 'Funkčný tréning', 'Strečing', 'Spinning'],
    en: ['Personal training', 'Group training', 'Yoga', 'Pilates', 'Functional training', 'Stretching', 'Spinning'],
  },
  psych: {
    cs: ['Individuální terapie', 'Párová terapie', 'Koučink', 'Krizová intervence', 'Mentoring', 'Diagnostika'],
    sk: ['Individuálna terapia', 'Párová terapia', 'Koučing', 'Krízová intervencia', 'Mentoring', 'Diagnostika'],
    en: ['Individual therapy', 'Couples therapy', 'Coaching', 'Crisis intervention', 'Mentoring', 'Diagnostics'],
  },
  tattoo: {
    cs: ['Tetování malé', 'Tetování střední', 'Tetování velké', 'Cover-up', 'Piercing', 'Návrh motivu', 'Konzultace'],
    sk: ['Tetovanie malé', 'Tetovanie stredné', 'Tetovanie veľké', 'Cover-up', 'Piercing', 'Návrh motívu', 'Konzultácia'],
    en: ['Small tattoo', 'Medium tattoo', 'Large tattoo', 'Cover-up', 'Piercing', 'Design consultation', 'Consultation'],
  },
  pets: {
    cs: ['Stříhání srsti', 'Koupání', 'Trimování', 'Stříhání drápků', 'Wellness pro psy', 'Canisterapie'],
    sk: ['Strihanie srsti', 'Kúpanie', 'Trimovanie', 'Strihanie drápkov', 'Wellness pre psov', 'Canisterapia'],
    en: ['Fur trimming', 'Bathing', 'Grooming', 'Nail clipping', 'Dog wellness', 'Canistherapy'],
  },
  edu: {
    cs: ['Doučování', 'Jazykový kurz', 'Hudební lekce', 'Workshop', 'Příprava na zkoušky', 'Online lekce'],
    sk: ['Doučovanie', 'Jazykový kurz', 'Hudobná lekcia', 'Workshop', 'Príprava na skúšky', 'Online lekcia'],
    en: ['Tutoring', 'Language course', 'Music lesson', 'Workshop', 'Exam preparation', 'Online lesson'],
  },
  exp: {
    cs: ['Hipoterapie', 'Oslí stezka', 'Farma zážitky', 'Teambuilding', 'Školní výlet', 'Kreativní workshop', 'Úniková hra', 'Degustace'],
    sk: ['Hipoterapia', 'Oslí chodník', 'Farma zážitky', 'Teambuilding', 'Školský výlet', 'Kreatívny workshop', 'Úniková hra', 'Degustácia'],
    en: ['Horse therapy', 'Donkey trail', 'Farm experience', 'Team building', 'School trip', 'Creative workshop', 'Escape room', 'Tasting'],
  },
}

const FEATURE_KEYS = [
  { icon: Calendar, color: 'from-[#0c2d48] to-[#0f6b7a]', key: 'calendar', prefix: 'cal' },
  { icon: Users, color: 'from-[#0f6b7a] to-[#0e9aa7]', key: 'crm', prefix: 'crm' },
  { icon: Brain, color: 'from-[#0c2d48] to-[#0f6b7a]', key: 'ai', prefix: 'ai' },
  { icon: TrendingUp, color: 'from-[#0f6b7a] to-[#0e9aa7]', key: 'growth', prefix: 'growth' },
]

const PRICING_DATA = [
  { key: 'solo', icon: '●', color: 'border-teal-300 bg-teal-50', price: '49', priceAi: '99', trial: true, gradient: 'linear-gradient(135deg, #0d9488, #06b6d4)' },
  { key: 'team', icon: '●●', color: 'border-blue-300 bg-blue-50', price: '299', priceAi: '499', trial: false, popular: true, gradient: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' },
  { key: 'inspire', icon: '●', color: 'border-amber-300 bg-amber-50', price: '499', priceAi: '799', trial: false, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  { key: 'pro', icon: '●', color: 'border-yellow-400 bg-yellow-50', price: '1 299', priceAi: '1 999', trial: false, gradient: 'linear-gradient(135deg, #92400e, #b45309)' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [calcSlots, setCalcSlots] = useState(4)
  const [calcPrice, setCalcPrice] = useState(800)
  const [calcNoshow, setCalcNoshow] = useState(15)
  const [lang, setLangState] = useState<PublicLang>('cs')
  const [openSegment, setOpenSegment] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('clientoro_lang') as PublicLang | null
    if (stored && ['cs', 'sk', 'en'].includes(stored)) setLangState(stored)
  }, [])

  const t = (key: string) => publicTranslations[lang]?.[key] || publicTranslations.cs[key] || key

  const setLang = (l: PublicLang) => {
    localStorage.setItem('clientoro_lang', l)
    setLangState(l)
  }

  const lostRevenue = Math.round(calcSlots * calcPrice * (calcNoshow / 100) * 22)

  return (
    <div className="min-h-screen bg-white max-w-4xl mx-auto shadow-lg rounded-none sm:rounded-2xl sm:my-4 border-0 sm:border-2 sm:border-amber-400/70">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50"><div className="max-w-4xl mx-auto backdrop-blur-md border-b border-white/10 sm:rounded-b-xl" style={{ background: 'linear-gradient(135deg, rgba(12,45,72,0.95), rgba(15,107,122,0.95))' }}>
        <div className="max-w-4xl mx-auto px-4 py-2 sm:py-3">
          {/* Radek 1: Logo + vlajky (mobil) | Logo + menu + vlajky + login + register (desktop) */}
          <div className="flex items-center justify-between">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer">
              <ClientoroLogo size={32} />
              <span className="text-2xl font-bold text-white">Clientoro</span>
            </button>
            <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
              <a href="#segments" className="hover:text-white">{t('land_nav_segments')}</a>
              <a href="#features" className="hover:text-white">{t('land_nav_features')}</a>
              <a href="#pricing" className="hover:text-white">{t('land_nav_pricing')}</a>
              <a href="#faq" className="hover:text-white">FAQ</a>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-white/20 rounded-lg px-1.5 py-0.5 flex-row-reverse md:flex-row">
                {(Object.keys(flags) as PublicLang[]).map(l => (
                  <button key={l} onClick={() => setLang(l)} className={`text-lg px-1.5 py-1 rounded transition-all ${lang === l ? 'scale-125 bg-white/20' : 'opacity-50 hover:opacity-100'}`}>{flags[l]}</button>
                ))}
              </div>
              <a href="/login" className="hidden md:inline text-sm text-white/70 hover:text-white font-medium ml-2 px-3 py-1.5 border border-white/30 rounded-lg hover:border-white/50">{t('land_nav_login')}</a>
              <a href="/register" className="hidden md:inline px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{t('land_nav_register')}</a>
            </div>
          </div>
          {/* Radek 2+3: Prihlasit se + Zacit zdarma (jen mobil) */}
          <div className="flex flex-col gap-2 mt-2 md:hidden">
            <a href="/login" className="w-full py-2.5 text-center text-sm text-white font-semibold border border-white/30 rounded-lg hover:bg-white/10">{t('land_nav_login')}</a>
            <a href="/register" className="w-full py-2.5 text-center text-sm font-semibold rounded-lg shadow-md" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)', color: '#f59e0b' }}>{t('land_nav_register')}</a>
          </div>
        </div>
      </div></nav>

      {/* BANNER 2026 */}
      <div className="pt-[140px] sm:pt-[64px]">
        <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
            <span className="text-amber-600 text-base">🚧</span>
            <p className="text-xs sm:text-sm text-amber-800 font-medium text-center">
              {lang === 'en' ? 'Platform is in active development. Full launch in 2026.' : lang === 'sk' ? 'Platforma je v aktívnom vývoji. Plný prevoz spustíme v priebehu roka 2026.' : 'Platforma je v aktivním vývoji. Plný provoz spustíme v průběhu roku 2026.'}
              <span className="text-amber-600 font-semibold ml-1">{lang === 'en' ? 'Stay tuned!' : lang === 'sk' ? 'Tešíme sa na vás!' : 'Těšíme se na vás!'}</span>
            </p>
            <span className="text-amber-600 text-base">🚀</span>
          </div>
        </div>
      </div>

      {/* HERO - ocean pozadi */}
      <section className="relative py-10 sm:py-16" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48, #0f6b7a)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-amber-300 rounded-full text-sm sm:text-base font-semibold mb-4">
            <Zap className="w-3 h-3" /> {t('land_hero_badge')}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl text-white font-bold leading-tight mb-4 px-2">
            {t('land_hero_title')}
          </h1>
          <div className="grid grid-cols-2 gap-3 mb-6 max-w-md mx-auto px-4">
            {(lang === 'en' ? ['Fair pricing, no commissions', 'No hidden fees', '14 days free', 'Cancel anytime'] : lang === 'sk' ? ['Férový cenník bez provízií', 'Žiadne skryté poplatky', '14 dní zadarmo', 'Zrušíte kedykoľvek'] : ['Férový ceník bez provizí', 'Žádné skryté poplatky', '14 dní zdarma', 'Zrušíte kdykoliv']).map((b, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-3 text-center">
                <Check className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-xs sm:text-sm text-white/90 font-medium">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
      {/* SEGMENTS */}
      <section id="segments" className="py-12 sm:py-16" style={{ background: 'linear-gradient(135deg, rgba(12,45,72,0.03), rgba(15,107,122,0.03))' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('land_segments_title')}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{t('land_segments_desc')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {SEGMENT_KEYS.map((s, idx) => { const Icon = SEGMENT_ICONS[s.icon]; const isLast = idx === SEGMENT_KEYS.length - 1 && SEGMENT_KEYS.length % 2 !== 0; return (
              <button key={s.key} onClick={() => setOpenSegment(openSegment === s.key ? null : s.key)}
                className={`rounded-xl border p-3 sm:p-5 hover:shadow-lg transition-all text-center group overflow-hidden cursor-pointer ${isLast ? 'col-span-2 sm:col-span-1 max-w-[50%] sm:max-w-none mx-auto sm:mx-0' : ''} ${openSegment === s.key ? 'border-amber-400 shadow-lg ring-2 ring-amber-200 bg-white' : 'border-amber-400/40 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-400/30 hover:scale-[1.08] transition-all duration-200 cursor-pointer'}`} style={openSegment !== s.key ? { background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' } : {}}>
                <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 rounded-xl flex items-center justify-center shadow-md" style={openSegment === s.key ? { background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' } : { background: 'rgba(255,255,255,0.1)' }}><Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#f59e0b' }} /></div>
                <h3 className={`font-bold text-xs sm:text-sm leading-tight ${openSegment === s.key ? 'text-gray-900' : 'text-white'}`}>{t(`land_seg_${s.key}`)}</h3>
                <p className={`text-xs mt-1 hidden sm:block leading-tight ${openSegment === s.key ? 'text-gray-400' : 'text-white/60'}`}>{t(`land_seg_${s.key}_desc`)}</p>
                <span className={`text-[10px] sm:text-xs mt-1 block font-medium sm:font-medium ${openSegment === s.key ? 'text-amber-500' : 'text-amber-400/70 sm:text-amber-400/0 sm:group-hover:text-amber-400/80'} transition-all duration-200`}>▼ {openSegment === s.key ? 'zavřít' : 'služby'}</span>
              </button>
            )})}
          </div>

          {/* SEGMENT POPUP - OVERLAY */}
          {openSegment && SEGMENT_SERVICES[openSegment] && (
            <>
            <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setOpenSegment(null)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md bg-white rounded-2xl border-2 border-amber-200 shadow-2xl p-5 sm:p-6">
              <button onClick={() => setOpenSegment(null)} className="absolute top-1/2 -translate-y-1/2 right-3 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <X className="w-4 h-4 text-gray-900 stroke-[3]" />
              </button>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-3 pr-10">{t(`land_seg_${openSegment}`)} — {lang === 'en' ? 'example services' : lang === 'sk' ? 'príklady služieb' : 'příklady služeb'}:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {(SEGMENT_SERVICES[openSegment][lang] || SEGMENT_SERVICES[openSegment].cs).map((service, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {service}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 italic">{lang === 'en' ? '...and any others you create' : lang === 'sk' ? '...a akékoľvek ďalšie, ktoré vytvoríte' : '...a jakékoliv další, které vytvoříte'}</p>
            </div>
            </>
          )}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

      {/* FEATURES */}
      <section id="features" className="py-12 sm:py-16" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{lang === 'en' ? 'What you get' : lang === 'sk' ? 'Čo dostanete' : 'Co dostanete'}</h2>
            <p className="text-white/60 text-sm sm:text-base">{t('land_features_desc')}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {FEATURE_KEYS.map(f => (
              <div key={f.key} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-lg transition-all">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3 sm:mb-4 shadow-md mx-auto`}>
                  <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{t(`land_feat_${f.prefix}_title`)}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3">{t(`land_feat_${f.prefix}_desc`)}</p>
                <ul className="space-y-1.5">
                  {[1,2,3].map(i => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                      <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>{t(`land_feat_${f.prefix}_${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* AI SECTION */}
      <section className="relative py-12 sm:py-16" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium mb-6">
            <Brain className="w-3 h-3" /> {t('land_ai_badge')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t('land_ai_title')}</h2>
          <p className="text-sm sm:text-base mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('land_ai_desc')}</p>
          <div className="grid sm:grid-cols-3 gap-0">
            {[1,2,3].map(i => (
              <div key={i} className={`p-4 sm:p-5 ${i < 3 ? 'border-b sm:border-b-0 sm:border-r border-white/20' : ''}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 mx-auto" style={{ background: 'linear-gradient(135deg, #0f6b7a, #0c2d48)' }}>{[<BrainCircuit key="a" className="w-5 h-5 text-amber-400" />, <TrendingUp key="b" className="w-5 h-5 text-amber-400" />, <Zap key="c" className="w-5 h-5 text-amber-400" />][i-1]}</div>
                <h3 className="font-bold text-white text-sm sm:text-base mb-1">{t(`land_ai_${i}_title`)}</h3>
                <p className="text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{t(`land_ai_${i}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

      {/* CTA + ONBOARDING */}
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4">
          <a href="/register" className="block w-full py-4 text-center text-white rounded-xl font-bold text-base sm:text-lg shadow-xl" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
            <span className="text-amber-400">{t('land_hero_cta')}</span> <ArrowRight className="w-5 h-5 inline ml-2" />
          </a>
        </div>
      </div>

      {/* ONBOARDING STEPS */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('land_onboard_title')}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{t('land_onboard_desc')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl border border-white/20 p-4 sm:p-5 text-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{i}</div>
                <h3 className="font-bold text-white text-xs sm:text-sm">{t(`land_onboard_${i}`)}</h3>
                <p className="text-xs text-white/60 mt-1 hidden sm:block">{t(`land_onboard_${i}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

      {/* CALCULATOR */}
      <section id="calculator" className="py-12 sm:py-16" style={{ background: 'linear-gradient(135deg, rgba(12,45,72,0.03), rgba(15,107,122,0.03))' }}>
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('land_calc_title')}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{t('land_calc_desc')}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-5">
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{t('land_calc_clients')}</span><span className="font-bold">{calcSlots}</span></div><input type="range" min={1} max={20} value={calcSlots} onChange={e => setCalcSlots(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{t('land_calc_price')}</span><span className="font-bold">{calcPrice} Kč</span></div><input type="range" min={200} max={5000} step={100} value={calcPrice} onChange={e => setCalcPrice(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{t('land_calc_noshow')}</span><span className="font-bold">{calcNoshow}%</span></div><input type="range" min={0} max={40} value={calcNoshow} onChange={e => setCalcNoshow(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div className="rounded-xl p-4 border text-center" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.1))', borderColor: '#f59e0b' }}>
              <p className="text-sm text-amber-700 mb-1">{t('land_calc_result')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-800">{lostRevenue.toLocaleString('cs-CZ')} Kč</p>
              <p className="text-xs text-amber-600 mt-1">{t('land_calc_note')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

      {/* DEPOSITS & CASH */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{lang === 'en' ? 'How to do it smarter' : lang === 'sk' ? 'Ako na to chytrejšie' : 'Jak na to chytřeji'}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{lang === 'en' ? 'Deposits reduce no-shows. Cash saves on fees.' : lang === 'sk' ? 'Zálohy znižujú nedorazivších. Hotovosť šetrí poplatky.' : 'Zálohy snižují nedorazivší. Hotovost šetří poplatky.'}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-2xl border-2 border-amber-300/50 p-5 sm:p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(12,45,72,0.05), rgba(15,107,122,0.05))' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}><CreditCard className="w-5 h-5 text-amber-400" /></div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{t('land_deposit_title')}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">{t('land_deposit_desc')}</p>
              <ul className="space-y-2 text-sm text-gray-600 inline-block text-left">
                {[1,2,3].map(i => (<li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500 flex-shrink-0" /> <span className="text-xs sm:text-sm">{t(`land_deposit_${i}`)}</span></li>))}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5 sm:p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(15,107,122,0.05), rgba(14,154,167,0.05))' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #0f6b7a, #0e9aa7)' }}><Banknote className="w-5 h-5 text-amber-400" /></div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{t('land_cash_title')}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">{t('land_cash_desc')}</p>
              <ul className="space-y-2 text-sm text-gray-600 inline-block text-left">
                {[1,2,3].map(i => (<li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500 flex-shrink-0" /> <span className="text-xs sm:text-sm">{t(`land_cash_${i}`)}</span></li>))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
      {/* PRICING */}
      <section id="pricing" className="py-12 sm:py-16" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t('land_pricing_title')}</h2>
            <p className="text-white/60 text-sm sm:text-base">{t('land_pricing_desc')}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {PRICING_DATA.map(p => (
              <div key={p.key} className={`rounded-2xl border-2 p-4 sm:p-5 relative ${p.color} ${p.popular ? 'ring-2 ring-blue-500 lg:scale-105' : ''}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full whitespace-nowrap">{t('land_price_popular')}</div>}
                <div className="text-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 rounded-full mx-auto shadow-lg flex items-center justify-center" style={{ background: p.gradient }}><Waves className="w-5 h-5 text-white" /></div>
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 mt-1 leading-tight">{t(`land_plan_${p.key}`)}</h3>
                  <p className="text-xs text-gray-500 hidden sm:block">{t(`land_plan_${p.key}_desc`)}</p>
                </div>
                <div className="text-center mb-3 sm:mb-4">
                  <span className="text-xl sm:text-3xl font-bold text-gray-900">{p.price}</span>
                  <span className="text-xs sm:text-sm text-gray-500"> {t('land_price_per_month')}</span>
                  {p.priceAi && (
                    <p className="text-xs text-gray-400">{t('land_price_with_ai')} {p.priceAi} {t('land_price_per_month')}</p>
                  )}
                </div>
                <ul className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
                  {[1,2,3,4,5,6].map(i => {
                    const text = t(`land_plan_${p.key}_${i}`)
                    if (text === `land_plan_${p.key}_${i}`) return null
                    return <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600"><Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" /><span className="leading-tight">{text}</span></li>
                  })}
                </ul>
                {p.trial && <div className="bg-emerald-100 rounded-lg p-1.5 sm:p-2 text-center text-xs text-emerald-700 font-medium mb-3">{t('land_price_trial')}</div>}
                <a href="/register" className="block w-full py-2 sm:py-2.5 text-center text-white rounded-xl font-medium text-xs sm:text-sm shadow-md" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{t('land_price_cta')}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

      {/* FAQ */}
      <section id="faq" className="py-12 sm:py-16" style={{ background: 'linear-gradient(135deg, rgba(12,45,72,0.03), rgba(15,107,122,0.03))' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-10">{t('land_faq_title')}</h2>
          <div className="space-y-3">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="font-medium text-gray-900 text-sm pr-4">{t(`land_faq_${i}_q`)}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600">{t(`land_faq_${i}_a`)}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

      {/* FINAL CTA */}
      <section className="py-12 sm:py-16" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t('land_final_cta')}</h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 px-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('land_final_desc')}</p>
          <a href="/register" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl" style={{ background: 'linear-gradient(135deg, #0f6b7a, #0e9aa7)' }}>
            <span className="text-amber-400">{t('land_final_button')}</span> <ArrowRight className="w-5 h-5 text-amber-400" />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 sm:py-12 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ClientoroLogo size={32} />
          <span className="text-lg font-bold text-white">Clientoro</span>
        </div>
        <p className="text-sm text-gray-500">© 2026 {t('land_footer')}</p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 text-xs text-gray-600 px-4">
          <a href="/privacy" className="hover:text-gray-400">{t('land_footer_privacy')}</a>
          <a href="/terms" className="hover:text-gray-400">{t('land_footer_terms')}</a>
          <a href="mailto:clientoro.app@gmail.com" className="hover:text-gray-400">{t('land_footer_contact')}</a>
        </div>
      </footer>
    </div>
  )
}