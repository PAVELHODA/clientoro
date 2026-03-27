﻿// PATH: src/app/(auth)/register/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Waves, Mail, Lock, ArrowRight, Building2, User, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { PublicLang, publicTranslations } from '@/lib/publicI18n'

const flags: Record<PublicLang, string> = { cs: '🇨🇿', sk: '🇸🇰', en: '🇬🇧' }

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [mode, setMode] = useState('solo')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [lang, setLangState] = useState<PublicLang>('cs')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const stored = localStorage.getItem('clientoro_lang') as PublicLang | null
    if (stored && ['cs', 'sk', 'en'].includes(stored)) setLangState(stored)
  }, [])

  const t = (key: string) => publicTranslations[lang]?.[key] || publicTranslations.cs[key] || key

  const setLang = (l: PublicLang) => {
    localStorage.setItem('clientoro_lang', l)
    setLangState(l)
  }

  const generatePassword = () => {
    const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const special = '!@#$%&*'
    let pwd = ''
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
    pwd += special[Math.floor(Math.random() * special.length)]
    pwd += Math.floor(Math.random() * 10)
    setPassword(pwd)
    setShowPassword(true)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, businessName, mode }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('register_error'))
        setLoading(false)
        return
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) {
        setError(t('register_success'))
        router.push('/login')
        return
      }

      router.push('/onboarding')
      router.refresh()
    } catch (err) {
      setError(t('register_error'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Levá strana — hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0c2d48 20%, #0e4d64 40%, #0f6b7a 55%, #0e5460 70%, #0c3a50 85%, #0a1e30 100%)' }}>

        <div className="absolute top-16 right-16 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }} />
        <div className="absolute top-24 right-24 w-40 h-40 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full blur-3xl -translate-y-1/2" style={{ background: 'radial-gradient(circle, rgba(14,77,100,0.3) 0%, transparent 70%)' }} />

        

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)' }}>
              <Waves className="w-6 h-6" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Clientoro</h1>
              <p className="text-sm" style={{ color: 'rgba(245,158,11,0.5)' }}>Booking & Growth OS</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            {t('register_hero_1')}<br />
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.2)' }}>{t('register_hero_2')}</span>
          </h2>

          <p className="text-lg mb-10 max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {t('register_hero_desc')}
          </p>

          <div className="space-y-3">
            {['register_feature_1', 'register_feature_2', 'register_feature_3', 'register_feature_4'].map((key, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.7)" strokeWidth="2" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{t(key)}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Vlnky + zlatí lidé po celé šířce */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '60px' }}>
          <svg viewBox="0 0 1200 60" className="w-full h-full" preserveAspectRatio="none" fill="none">
            <path d="M0 30 Q100 15 200 25 Q300 35 400 20 Q500 5 600 18 Q700 30 800 15 Q900 0 1000 12 Q1100 25 1200 8 L1200 60 L0 60 Z" fill="rgba(255,255,255,0.03)" />
            <path d="M0 38 Q150 22 300 35 Q450 48 600 28 Q750 10 900 25 Q1050 40 1200 22 L1200 60 L0 60 Z" fill="rgba(255,255,255,0.05)" />
            <path d="M0 45 Q120 32 240 42 Q360 52 480 35 Q600 18 720 32 Q840 45 960 28 Q1080 12 1200 25 L1200 60 L0 60 Z" fill="rgba(255,255,255,0.08)" />
            <g transform="translate(50, 22)" opacity="0.5"><circle cx="0" cy="0" r="3.5" fill="#f59e0b" /><line x1="0" y1="3.5" x2="0" y2="11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="0" y1="6" x2="-4" y2="9" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="6" x2="4" y2="8" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="11" x2="-3" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="11" x2="3" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /></g>
            <g transform="translate(170, 28)" opacity="0.45"><circle cx="0" cy="0" r="3.5" fill="#f59e0b" /><line x1="0" y1="3.5" x2="0" y2="10" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="0" y1="10" x2="-2" y2="15" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="10" x2="2" y2="15" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="-1" r="3.5" fill="#f59e0b" /><line x1="12" y1="2.5" x2="12" y2="9" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="9" x2="10" y2="14" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="12" y1="9" x2="14" y2="14" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /></g>
            <g transform="translate(330, 20)" opacity="0.5"><circle cx="0" cy="0" r="3.5" fill="#f59e0b" /><line x1="0" y1="3.5" x2="0" y2="11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="0" y1="6" x2="-4" y2="3" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="11" x2="-3" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="11" x2="3" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><circle cx="14" cy="-2" r="4" fill="#f59e0b" /><line x1="14" y1="2" x2="14" y2="11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="14" y1="5" x2="8" y2="0" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="14" y1="5" x2="20" y2="0" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="14" y1="11" x2="11" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="14" y1="11" x2="17" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><circle cx="28" cy="0" r="3.5" fill="#f59e0b" /><line x1="28" y1="3.5" x2="28" y2="11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="28" y1="11" x2="25" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="28" y1="11" x2="31" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /></g>
            <g transform="translate(520, 12)" opacity="0.45"><circle cx="0" cy="0" r="4" fill="#f59e0b" /><line x1="0" y1="4" x2="0" y2="13" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="0" y1="13" x2="-3" y2="18" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="13" x2="3" y2="18" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><circle cx="10" cy="4" r="2.5" fill="#f59e0b" /><line x1="10" y1="6.5" x2="10" y2="12" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="10" y1="12" x2="8" y2="16" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" /><line x1="10" y1="12" x2="12" y2="16" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" /><circle cx="22" cy="-1" r="4" fill="#f59e0b" /><line x1="22" y1="3" x2="22" y2="12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="22" y1="12" x2="19" y2="17" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="22" y1="12" x2="25" y2="17" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /></g>
            <g transform="translate(700, 24)" opacity="0.5"><circle cx="0" cy="0" r="3.5" fill="#f59e0b" /><line x1="0" y1="3.5" x2="0" y2="11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="0" y1="11" x2="-3" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="11" x2="3" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><circle cx="13" cy="1" r="3.5" fill="#f59e0b" /><line x1="13" y1="4.5" x2="13" y2="12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="13" y1="12" x2="10" y2="17" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="13" y1="12" x2="16" y2="17" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /></g>
            <g transform="translate(860, 16)" opacity="0.55"><circle cx="0" cy="0" r="3.5" fill="#f59e0b" /><line x1="0" y1="3.5" x2="0" y2="11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="0" y1="6" x2="-4" y2="3" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="11" x2="-3" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="11" x2="3" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><circle cx="14" cy="-2" r="4" fill="#f59e0b" /><line x1="14" y1="2" x2="14" y2="11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="14" y1="5" x2="8" y2="0" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="14" y1="5" x2="20" y2="0" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="14" y1="11" x2="11" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="14" y1="11" x2="17" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><circle cx="28" cy="0" r="3.5" fill="#f59e0b" /><line x1="28" y1="3.5" x2="28" y2="11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="28" y1="11" x2="25" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="28" y1="11" x2="31" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /></g>
            <g transform="translate(1030, 20)" opacity="0.45"><circle cx="0" cy="0" r="3.5" fill="#f59e0b" /><line x1="0" y1="3.5" x2="0" y2="11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="0" y1="11" x2="-3" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="11" x2="3" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /></g>
            <g transform="translate(1120, 26)" opacity="0.4"><circle cx="0" cy="0" r="3.5" fill="#f59e0b" /><line x1="0" y1="3.5" x2="0" y2="10" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="0" y1="10" x2="-2" y2="15" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="0" y1="10" x2="2" y2="15" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="1" r="3.5" fill="#f59e0b" /><line x1="12" y1="4.5" x2="12" y2="11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="11" x2="10" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /><line x1="12" y1="11" x2="14" y2="16" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /></g>
          </svg>
        </div>
      </div>

        
      {/* Pravá strana — formulář */}
      <div className="flex-1 flex items-center justify-center px-6 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Language switcher */}
          <div className="flex justify-end mb-4 gap-1">
            {(['cs', 'sk', 'en'] as PublicLang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-all ${lang === l ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                {flags[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-3"
              style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
              <Waves className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Clientoro</h1>
            <p className="text-gray-400 text-sm">Booking & Growth OS</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('register_title')}</h2>
            <p className="text-sm text-gray-400 mb-6">{t('register_subtitle')}</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Název firmy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register_business_name')}</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                    placeholder={t('register_business_placeholder')} required />
                </div>
              </div>

              {/* Typ podnikání */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register_type')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setMode('solo')}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      mode === 'solo' ? 'text-white shadow-md' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                    style={mode === 'solo' ? { background: 'linear-gradient(135deg, #0e4d64, #0f6b7a)', borderColor: '#0f6b7a' } : {}}>
                    <User className="w-4 h-4" /> {t('register_freelancer')}
                  </button>
                  <button type="button" onClick={() => setMode('team')}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      mode === 'team' ? 'text-white shadow-md' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                    style={mode === 'team' ? { background: 'linear-gradient(135deg, #0c2d48, #0e4d64)', borderColor: '#0e4d64' } : {}}>
                    <Building2 className="w-4 h-4" /> {t('register_company')}
                  </button>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register_email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                    placeholder={t('email_placeholder')} required />
                </div>
              </div>

              {/* Heslo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register_password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-20 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                    placeholder={t('register_password_placeholder')} minLength={6} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button type="button" onClick={generatePassword}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-600"
                    title={t('register_generate_password')}>
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* GDPR */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="gdpr" required
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                <label htmlFor="gdpr" className="text-xs text-gray-500 leading-relaxed">
                  {t('register_gdpr')}
                </label>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('register_loading')}
                  </span>
                ) : (
                  <>{t('register_submit')} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-3 text-center">
              <p className="text-xs text-gray-300">{t('register_trial')}</p>
            </div>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-400">
                {t('register_has_account')}{' '}
                <a href="/login" className="font-semibold" style={{ color: '#0f6b7a' }}>{t('register_login_link')}</a>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-300 mt-6">🏆 Clientoro — {t('login_feature_4')}</p>
        </div>
      </div>
    </div>
  )
}
