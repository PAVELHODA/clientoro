﻿// PATH: src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Waves, Calendar, Users, Brain, TrendingUp, ChevronDown, Shield, Zap, Check, ArrowRight, CreditCard, Banknote, Scissors, Sparkles, Gem, HeartPulse, Dumbbell, BrainCircuit, PawPrint, GraduationCap, MessageSquare, X } from 'lucide-react'
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
    cs: ['Osobní trénink', 'Skupinový trénink', 'Výživové poradenství', 'Diagnostika', 'Funkční trénink', 'Strečink'],
    sk: ['Osobný tréning', 'Skupinový tréning', 'Výživové poradenstvo', 'Diagnostika', 'Funkčný tréning', 'Strečing'],
    en: ['Personal training', 'Group training', 'Nutrition consulting', 'Diagnostics', 'Functional training', 'Stretching'],
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
}

const FEATURE_KEYS = [
  { icon: Calendar, color: 'from-[#0c2d48] to-[#0f6b7a]', key: 'calendar', prefix: 'cal' },
  { icon: Users, color: 'from-[#0f6b7a] to-[#0e9aa7]', key: 'crm', prefix: 'crm' },
  { icon: Brain, color: 'from-amber-500 to-amber-400', key: 'ai', prefix: 'ai' },
  { icon: TrendingUp, color: 'from-[#0c2d48] to-amber-500', key: 'growth', prefix: 'growth' },
]

const PRICING_DATA = [
  { key: 'solo', icon: '●', color: 'border-teal-300 bg-teal-50', price: '49', priceAi: '99', trial: true },
  { key: 'team', icon: '●●', color: 'border-blue-300 bg-blue-50', price: '299', priceAi: '499', trial: false, popular: true },
  { key: 'inspire', icon: '◆', color: 'border-amber-300 bg-amber-50', price: '499', priceAi: '799', trial: false },
  { key: 'pro', icon: '◆◆', color: 'border-yellow-400 bg-yellow-50', price: '1 299', priceAi: '1 999', trial: false },
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
    <div className="min-h-screen bg-white max-w-5xl mx-auto shadow-sm">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3">
          {/* Radek 1: Logo + vlajky (mobil) | Logo + menu + vlajky + login + register (desktop) */}
          <div className="flex items-center justify-between">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer">
              <ClientoroLogo size={32} />
              <span className="text-xl font-bold text-gray-900">Clientoro</span>
            </button>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <a href="#segments" className="hover:text-gray-900">{t('land_nav_segments')}</a>
              <a href="#features" className="hover:text-gray-900">{t('land_nav_features')}</a>
              <a href="#pricing" className="hover:text-gray-900">{t('land_nav_pricing')}</a>
              <a href="#faq" className="hover:text-gray-900">FAQ</a>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {(Object.keys(flags) as PublicLang[]).map(l => (
                  <button key={l} onClick={() => setLang(l)} className={`text-base px-1 py-0.5 rounded transition-all ${lang === l ? 'scale-125 bg-gray-100' : 'opacity-50 hover:opacity-100'}`}>{flags[l]}</button>
                ))}
              </div>
              <a href="/login" className="hidden md:inline text-sm text-gray-600 hover:text-gray-900 font-medium ml-2">{t('land_nav_login')}</a>
              <a href="/register" className="hidden md:inline px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{t('land_nav_register')}</a>
            </div>
          </div>
          {/* Radek 2+3: Prihlasit se + Zacit zdarma (jen mobil) */}
          <div className="flex flex-col gap-2 mt-2 md:hidden">
            <a href="/login" className="w-full py-2.5 text-center text-sm text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50">{t('land_nav_login')}</a>
          </div>
        </div>
      </nav>

      {/* BANNER 2026 */}
      <div className="pt-[140px] sm:pt-[64px]">
        <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
            <span className="text-amber-600 text-base">🚧</span>
            <p className="text-xs sm:text-sm text-amber-800 font-medium text-center">
              {lang === 'en' ? 'Platform is in active development. Full launch in 2026.' : lang === 'sk' ? 'Platforma je v aktívnom vývoji. Plný prevoz spustíme v priebehu roka 2026.' : 'Platforma je v aktivním vývoji. Plný provoz spustíme v průběhu roku 2026.'}
              <span className="text-amber-600 font-semibold ml-1">{lang === 'en' ? 'Stay tuned!' : lang === 'sk' ? 'Tešíme sa na vás!' : 'Těšíme se na vás!'}</span>
            </p>
            <span className="text-amber-600 text-base">🚀</span>
          </div>
        </div>
      </div>
      {/* SEGMENTS */}
      <section id="segments" className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('land_segments_title')}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{t('land_segments_desc')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {SEGMENT_KEYS.map(s => { const Icon = SEGMENT_ICONS[s.icon]; return (
              <button key={s.key} onClick={() => setOpenSegment(openSegment === s.key ? null : s.key)}
                className={`rounded-xl border p-3 sm:p-5 hover:shadow-lg transition-all text-center group overflow-hidden cursor-pointer ${openSegment === s.key ? 'border-amber-400 shadow-lg ring-2 ring-amber-200 bg-white' : 'border-white/20 hover:border-amber-300'}`} style={openSegment !== s.key ? { background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' } : {}}>
                <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 rounded-xl flex items-center justify-center shadow-md" style={openSegment === s.key ? { background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' } : { background: 'rgba(255,255,255,0.1)' }}><Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#f59e0b' }} /></div>
                <h3 className={`font-bold text-xs sm:text-sm leading-tight ${openSegment === s.key ? 'text-gray-900' : 'text-white'}`}>{t(`land_seg_${s.key}`)}</h3>
                <p className={`text-xs mt-1 hidden sm:block leading-tight ${openSegment === s.key ? 'text-gray-400' : 'text-white/60'}`}>{t(`land_seg_${s.key}_desc`)}</p>
              </button>
            )})}
          </div>

          {/* SEGMENT POPUP - OVERLAY */}
          {openSegment && SEGMENT_SERVICES[openSegment] && (
            <>
            <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setOpenSegment(null)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md bg-white rounded-2xl border-2 border-amber-200 shadow-2xl p-5 sm:p-6">
              <button onClick={() => setOpenSegment(null)} className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <X className="w-4 h-4 text-gray-900 stroke-[3]" />
              </button>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-3">{t(`land_seg_${openSegment}`)} — {lang === 'en' ? 'example services' : lang === 'sk' ? 'príklady služieb' : 'příklady služeb'}:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {(SEGMENT_SERVICES[openSegment][lang] || SEGMENT_SERVICES[openSegment].cs).map((service, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
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


      {/* HERO */}
      <section className="relative pt-8 sm:pt-16 pb-16 sm:pb-20" style={{ background: 'linear-gradient(135deg, #f8fafc, #ecfdf5, #f0f9ff)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm sm:text-base font-semibold mb-6">
            <Zap className="w-3 h-3" /> {t('land_hero_badge')}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6 px-2">{t('land_hero_title')}</h1>
          <div className="grid grid-cols-2 gap-3 mb-6 sm:mb-8 max-w-lg mx-auto px-4">{t('land_hero_desc').split(' · ').map((b: string, i: number) => (<div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-3 text-center"><Check className="w-4 h-4 text-amber-500 mx-auto mb-1" /><span className="text-xs sm:text-sm text-gray-600 font-medium">{b.replace(/^\+ /, '')}</span></div>))}</div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a href="/register" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl font-bold text-base sm:text-lg shadow-xl flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}><span className="text-amber-400">{t('land_hero_cta')}</span> <ArrowRight className="w-5 h-5" /></a>
            <a href="#features" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl font-medium text-center shadow-lg" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{t('land_hero_cta2')}</a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('land_features_title')}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{t('land_features_desc')}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {FEATURE_KEYS.map(f => (
              <div key={f.key} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 hover:shadow-lg transition-all">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3 sm:mb-4 shadow-md`}>
                  <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{t(`land_feat_${f.prefix}_title`)}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3">{t(`land_feat_${f.prefix}_desc`)}</p>
                <ul className="space-y-1.5">
                  {[1,2,3].map(i => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
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
      <section className="relative py-16 sm:py-20" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium mb-6">
            <Brain className="w-3 h-3" /> {t('land_ai_badge')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t('land_ai_title')}</h2>
          <p className="text-sm sm:text-base mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('land_ai_desc')}</p>
          <div className="grid sm:grid-cols-3 gap-0 divide-x-2 divide-white/30">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white/5 backdrop-blur-sm p-4 sm:p-5 border-t-2 border-t-white/40 first:rounded-l-xl last:rounded-r-xl">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 mx-auto" style={{ background: 'linear-gradient(135deg, #0f6b7a, #0c2d48)' }}>{[<BrainCircuit key="a" className="w-5 h-5 text-amber-400" />, <TrendingUp key="b" className="w-5 h-5 text-amber-400" />, <Zap key="c" className="w-5 h-5 text-amber-400" />][i-1]}</div>
                <h3 className="font-bold text-white text-sm sm:text-base mb-1">{t(`land_ai_${i}_title`)}</h3>
                <p className="text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{t(`land_ai_${i}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ONBOARDING STEPS */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('land_onboard_title')}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{t('land_onboard_desc')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{i}</div>
                <h3 className="font-bold text-gray-900 text-xs sm:text-sm">{t(`land_onboard_${i}`)}</h3>
                <p className="text-xs text-gray-400 mt-1 hidden sm:block">{t(`land_onboard_${i}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calculator" className="py-12 sm:py-16">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('land_calc_title')}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{t('land_calc_desc')}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-5">
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{t('land_calc_clients')}</span><span className="font-bold">{calcSlots}</span></div><input type="range" min={1} max={20} value={calcSlots} onChange={e => setCalcSlots(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{t('land_calc_price')}</span><span className="font-bold">{calcPrice} Kč</span></div><input type="range" min={200} max={5000} step={100} value={calcPrice} onChange={e => setCalcPrice(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{t('land_calc_noshow')}</span><span className="font-bold">{calcNoshow}%</span></div><input type="range" min={0} max={40} value={calcNoshow} onChange={e => setCalcNoshow(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center">
              <p className="text-sm text-red-600 mb-1">{t('land_calc_result')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-700">{lostRevenue.toLocaleString('cs-CZ')} Kč</p>
              <p className="text-xs text-red-400 mt-1">{t('land_calc_note')}</p>
            </div>
          </div>
        </div>
      </section>
      {/* DEPOSITS & CASH */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}><CreditCard className="w-5 h-5 text-amber-400" /></div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{t('land_deposit_title')}</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">{t('land_deposit_desc')}</p>
            <ul className="space-y-2 text-sm text-gray-600 inline-block text-left">
              {[1,2,3].map(i => (<li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> <span className="text-xs sm:text-sm">{t(`land_deposit_${i}`)}</span></li>))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #0f6b7a, #0e9aa7)' }}><Banknote className="w-5 h-5 text-amber-400" /></div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{t('land_cash_title')}</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">{t('land_cash_desc')}</p>
            <ul className="space-y-2 text-sm text-gray-600 inline-block text-left">
              {[1,2,3].map(i => (<li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> <span className="text-xs sm:text-sm">{t(`land_cash_${i}`)}</span></li>))}
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('land_pricing_title')}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{t('land_pricing_desc')}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {PRICING_DATA.map(p => (
              <div key={p.key} className={`rounded-2xl border-2 p-4 sm:p-5 relative ${p.color} ${p.popular ? 'ring-2 ring-blue-500 lg:scale-105' : ''}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full whitespace-nowrap">{t('land_price_popular')}</div>}
                <div className="text-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto" style={{ background: p.key === 'solo' ? 'linear-gradient(135deg, #0d9488, #06b6d4)' : p.key === 'team' ? 'linear-gradient(135deg, #2563eb, #0ea5e9)' : p.key === 'inspire' ? 'linear-gradient(135deg, #c2410c, #ea580c)' : 'linear-gradient(135deg, #7c2d12, #9a3412)' }}><Waves className="w-5 h-5 text-white" /></div>
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
                    return <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" /><span className="leading-tight">{text}</span></li>
                  })}
                </ul>
                {p.trial && <div className="bg-emerald-100 rounded-lg p-1.5 sm:p-2 text-center text-xs text-emerald-700 font-medium mb-3">{t('land_price_trial')}</div>}
                <a href="/register" className="block w-full py-2 sm:py-2.5 text-center text-white rounded-xl font-medium text-xs sm:text-sm shadow-md" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{t('land_price_cta')}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-20 bg-gray-50">
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

      {/* FINAL CTA */}
      <section className="py-16 sm:py-20" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t('land_final_cta')}</h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 px-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('land_final_desc')}</p>
          <a href="/register" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl font-bold text-base sm:text-lg shadow-xl" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>{t('land_final_button')} <ArrowRight className="w-5 h-5" /></a>
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
          <a href="#" className="hover:text-gray-400">{t('land_footer_contact')}</a>
        </div>
      </footer>
    </div>
  )
}