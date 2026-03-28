﻿// PATH: src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Waves, Calendar, Users, Brain, TrendingUp, ChevronDown, Shield, Zap, Check, ArrowRight, CreditCard, Banknote, Scissors, Sparkles, Gem, HeartPulse, Dumbbell, BrainCircuit, PawPrint, GraduationCap, MessageSquare } from 'lucide-react'
import { PublicLang, publicTranslations } from '@/lib/publicI18n'

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

const FEATURE_KEYS = [
  { icon: Calendar, color: 'from-emerald-500 to-teal-400', key: 'calendar', prefix: 'cal' },
  { icon: Users, color: 'from-blue-500 to-cyan-400', key: 'crm', prefix: 'crm' },
  { icon: Brain, color: 'from-amber-500 to-yellow-400', key: 'ai', prefix: 'ai' },
  { icon: TrendingUp, color: 'from-rose-500 to-pink-400', key: 'growth', prefix: 'growth' },
]

const PRICING_DATA = [
  { key: 'solo', icon: '🟢', color: 'border-teal-300 bg-teal-50', price: '199', priceAi: '', trial: true },
  { key: 'team', icon: '🔵', color: 'border-blue-300 bg-blue-50', price: '999', priceAi: '', trial: false, popular: true },
  { key: 'inspire', icon: '🏖', color: 'border-amber-300 bg-amber-50', price: '349', priceAi: '499', trial: false },
  { key: 'pro', icon: '🏖✨', color: 'border-yellow-400 bg-yellow-50', price: '1 299', priceAi: '1 799', trial: false },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [calcSlots, setCalcSlots] = useState(4)
  const [calcPrice, setCalcPrice] = useState(800)
  const [calcNoshow, setCalcNoshow] = useState(15)
  const [lang, setLangState] = useState<PublicLang>('cs')

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
    <div className="min-h-screen overflow-x-hidden bg-white">

      {/* Development banner */}
      <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
          <span className="text-amber-600 text-lg">🚧</span>
          <p className="text-sm text-amber-800 font-medium text-center">
            Platforma je v aktivním vývoji. Plný provoz spustíme v průběhu roku 2026.
            <span className="text-amber-600 font-semibold ml-1">Těšíme se na vás!</span>
          </p>
          <span className="text-amber-600 text-lg">🚀</span>
        </div>
      </div>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}><Waves className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold text-gray-900">Clientoro</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#segments" className="hover:text-gray-900">{t('land_nav_for_who')}</a>
            <a href="#features" className="hover:text-gray-900">{t('land_nav_features')}</a>
            <a href="#pricing" className="hover:text-gray-900">{t('land_nav_pricing')}</a>
            <a href="#faq" className="hover:text-gray-900">{t('land_nav_faq')}</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5 mr-2">
              {(['cs', 'sk', 'en'] as PublicLang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-1.5 py-1 rounded text-xs transition-all ${lang === l ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                  {flags[l]}
                </button>
              ))}
            </div>
            <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">{t('land_nav_login')}</a>
            <a href="/register" className="px-4 py-2 text-sm text-white rounded-lg font-semibold shadow-md" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{t('land_nav_register')}</a>
          </div>
        </div>
      </nav>

      {/* HERO — ZMĚNA: text-3xl md:text-5xl místo text-4xl md:text-6xl */}
      <section className="relative pt-32 pb-28 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0c2d48 20%, #0e4d64 40%, #0f6b7a 55%, #0e5460 70%, #0c3a50 85%, #0a1e30 100%)' }}>
        <div className="absolute top-16 right-16 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}><Zap className="w-4 h-4" /> {t('land_badge')}</div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">{t('land_hero_1')} <br /> {t('land_hero_2')}<br /><span style={{ color: '#f59e0b' }}>{t('land_hero_3')}</span></h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('land_hero_desc')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <a href="/register" className="px-8 py-4 text-white rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>{t('land_cta')} <ArrowRight className="w-5 h-5" /></a>
            <a href="#features" className="px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>{t('land_cta2')}</a>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('land_trust')}</p>
        </div>
        {/* Vlnky + zlatí lidé */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '60px' }}>
          <svg viewBox="0 0 1200 60" className="w-full h-full" preserveAspectRatio="none" fill="none">
            <path d="M0 30 Q100 15 200 25 Q300 35 400 20 Q500 5 600 18 Q700 30 800 15 Q900 0 1000 12 Q1100 25 1200 8 L1200 60 L0 60 Z" fill="rgba(255,255,255,0.03)" />
            <path d="M0 38 Q150 22 300 35 Q450 48 600 28 Q750 10 900 25 Q1050 40 1200 22 L1200 60 L0 60 Z" fill="rgba(255,255,255,0.05)" />
            <path d="M0 45 Q120 32 240 42 Q360 52 480 35 Q600 18 720 32 Q840 45 960 28 Q1080 12 1200 25 L1200 60 L0 60 Z" fill="rgba(255,255,255,0.08)" />
            
            
            
            
            
            
            
            
          </svg>
        </div>
      </section>

      {/* SEGMENTS */}
      <section id="segments" className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('land_segments_title')}</h2>
            <p className="text-gray-500">{t('land_segments_desc')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {SEGMENT_KEYS.map(s => { const Icon = SEGMENT_ICONS[s.icon]; return (
              <div key={s.key} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 hover:shadow-lg hover:border-amber-200 transition-all text-center group overflow-hidden">
                <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}><Icon className="w-6 h-6" style={{ color: '#f59e0b' }} /></div>
                <h3 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{t(`land_seg_${s.key}`)}</h3>
                <p className="text-xs text-gray-400 mt-1 hidden sm:block">{t(`land_seg_${s.key}_desc`)}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('land_features_title')}</h2>
            <p className="text-gray-500">{t('land_features_desc')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURE_KEYS.map(f => (
              <div key={f.key} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center`}><f.icon className="w-5 h-5 text-white" /></div>
                  <h3 className="text-lg font-bold text-gray-900">{t(`land_feat_${f.key}`)}</h3>
                </div>
                <ul className="space-y-2 inline-block text-left">
                  {[1,2,3,4,5].map(i => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{t(`land_feat_${f.prefix}_${i}`)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section className="relative py-20" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}><Brain className="w-4 h-4" /> {t('land_ai_badge')}</div>
          <h2 className="text-3xl font-bold text-white mb-4">{t('land_ai_title')}</h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('land_ai_desc')}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-xl p-5 text-left" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 className="font-bold text-white mb-2">{t(`land_ai_${i}_title`)}</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{t(`land_ai_${i}_desc`)}</p>
              </div>
            ))}
          </div>
          <p className="text-sm mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}><Shield className="w-4 h-4 inline mr-1" /> {t('land_ai_note')}</p>
        </div>
      </section>

      {/* ONBOARDING */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('land_onboard_title')}</h2>
            <p className="text-gray-500">{t('land_onboard_desc')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{i}</div>
                <h3 className="font-bold text-gray-900">{t(`land_onboard_${i}`)}</h3>
                <p className="text-xs text-gray-400 mt-1">{t(`land_onboard_${i}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calculator" className="py-16">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('land_calc_title')}</h2>
            <p className="text-gray-500">{t('land_calc_desc')}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-5">
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{t('land_calc_clients')}</span><span className="font-bold">{calcSlots}</span></div><input type="range" min={1} max={20} value={calcSlots} onChange={e => setCalcSlots(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{t('land_calc_price')}</span><span className="font-bold">{calcPrice} Kč</span></div><input type="range" min={200} max={5000} step={100} value={calcPrice} onChange={e => setCalcPrice(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{t('land_calc_noshow')}</span><span className="font-bold">{calcNoshow}%</span></div><input type="range" min={0} max={40} value={calcNoshow} onChange={e => setCalcNoshow(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center">
              <p className="text-sm text-red-600 mb-1">{t('land_calc_result')}</p>
              <p className="text-3xl font-bold text-red-700">{lostRevenue.toLocaleString('cs-CZ')} Kč</p>
              <p className="text-xs text-red-400 mt-1">{t('land_calc_note')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOSITS & CASH */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto"><CreditCard className="w-5 h-5 text-blue-600" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('land_deposit_title')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('land_deposit_desc')}</p>
            <ul className="space-y-2 text-sm text-gray-600 inline-block text-left">
              {[1,2,3].map(i => (<li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> {t(`land_deposit_${i}`)}</li>))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto"><Banknote className="w-5 h-5 text-green-600" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('land_cash_title')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('land_cash_desc')}</p>
            <ul className="space-y-2 text-sm text-gray-600 inline-block text-left">
              {[1,2,3].map(i => (<li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> {t(`land_cash_${i}`)}</li>))}
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING — ZMĚNA: podmíněné zobrazení "S AI" */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('land_pricing_title')}</h2>
            <p className="text-gray-500">{t('land_pricing_desc')}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {PRICING_DATA.map(p => (
              <div key={p.key} className={`rounded-2xl border-2 p-5 relative ${p.color} ${p.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">{t('land_price_popular')}</div>}
                <div className="text-center mb-4">
                  <span className="text-2xl">{p.icon}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">{t(`land_plan_${p.key}`)}</h3>
                  <p className="text-xs text-gray-500">{t(`land_plan_${p.key}_desc`)}</p>
                </div>
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-gray-900">{p.price}</span>
                  <span className="text-sm text-gray-500"> {t('land_price_per_month')}</span>
                  {p.priceAi && (
                    <p className="text-xs text-gray-400">{t('land_price_with_ai')} {p.priceAi} {t('land_price_per_month')}</p>
                  )}
                </div>
                <ul className="space-y-1.5 mb-4">
                  {[1,2,3,4,5,6].map(i => {
                    const text = t(`land_plan_${p.key}_${i}`)
                    if (text === `land_plan_${p.key}_${i}`) return null
                    return <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{text}</li>
                  })}
                </ul>
                {p.trial && <div className="bg-emerald-100 rounded-lg p-2 text-center text-xs text-emerald-700 font-medium mb-3">{t('land_price_trial')}</div>}
                <a href="/register" className="block w-full py-2.5 text-center text-white rounded-xl font-medium text-sm shadow-md" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{t('land_price_cta')}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{t('land_faq_title')}</h2>
          <div className="space-y-3">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="font-medium text-gray-900 text-sm">{t(`land_faq_${i}_q`)}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600">{t(`land_faq_${i}_a`)}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('land_final_cta')}</h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('land_final_desc')}</p>
          <a href="/register" className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-xl font-bold text-lg shadow-xl" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>{t('land_final_button')} <ArrowRight className="w-5 h-5" /></a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}><Waves className="w-4 h-4 text-white" /></div>
          <span className="text-lg font-bold text-white">Clientoro</span>
        </div>
        <p className="text-sm text-gray-500">© 2026 {t('land_footer')}</p>
        <div className="flex justify-center gap-6 mt-4 text-xs text-gray-600">
          <a href="/privacy" className="hover:text-gray-400">{t('land_footer_privacy')}</a>
          <a href="/terms" className="hover:text-gray-400">{t('land_footer_terms')}</a>
          <a href="#" className="hover:text-gray-400">{t('land_footer_contact')}</a>
        </div>
      </footer>
    </div>
  )
}
