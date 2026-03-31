// PATH: src/app/(auth)/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Waves, Mail, Lock, ArrowRight, Eye, EyeOff, Globe } from 'lucide-react'
import { publicTranslations, type PublicLang } from '@/lib/publicI18n'

const flags: Record<PublicLang, string> = { cs: '🇨🇿', sk: '🇸🇰', en: '🇬🇧' }

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    setLangState(l)
    localStorage.setItem('clientoro_lang', l)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message === 'Invalid login credentials' ? t('login_error_credentials') : error.message)
      } else { router.push('/dashboard'); router.refresh() }
    } catch (err) { setError(t('login_error_unexpected')) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48, #0f6b7a)' }}>
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0c2d48 20%, #0e4d64 40%, #0f6b7a 55%, #0e5460 70%, #0c3a50 85%, #0a1e30 100%)' }}>

        <div className="absolute top-16 right-16 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }} />
        <div className="absolute top-24 right-24 w-40 h-40 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full blur-3xl -translate-y-1/2" style={{ background: 'radial-gradient(circle, rgba(14,77,100,0.3) 0%, transparent 70%)' }} />

        {/* Tři vlny + zlatí lidé vpravo dole */}
        

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
            {t('login_hero_1')}<br />
            {t('login_hero_2')}<br />
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.2)' }}>{t('login_hero_3')}</span>
          </h2>

          <p className="text-lg mb-10 max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {t('login_hero_desc')}
          </p>

          <div className="space-y-3">
            {[
              { emoji: 'cal', key: 'login_feature_1', highlight: false },
              { emoji: 'ai', key: 'login_feature_2', highlight: false },
              { emoji: 'chart', key: 'login_feature_3', highlight: false },
              { emoji: 'trophy', key: 'login_feature_4', highlight: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {item.emoji === 'cal' ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 10h18M8 2v4M16 2v4" /><circle cx="8" cy="15" r="1" fill="rgba(245,158,11,0.6)" stroke="none" /><circle cx="12" cy="15" r="1" fill="rgba(245,158,11,0.6)" stroke="none" /></svg>
                    ) : item.emoji === 'ai' ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" /><path d="M8 10v1a4 4 0 0 0 8 0v-1" /><path d="M12 14v4" /><path d="M8 22h8" /><circle cx="9" cy="6.5" r="0.8" fill="rgba(245,158,11,0.6)" stroke="none" /><circle cx="15" cy="6.5" r="0.8" fill="rgba(245,158,11,0.6)" stroke="none" /></svg>
                    ) : item.emoji === 'chart' ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"><path d="M3 20h18" /><path d="M6 16v4" /><path d="M10 12v8" /><path d="M14 8v12" /><path d="M18 4v16" /><path d="M3 16 Q7 8 12 10 Q17 12 21 4" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" fill="none" /></svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"><path d="M6 9h12l-1 10H7L6 9z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /><path d="M8 5l4-3 4 3" /><circle cx="12" cy="1.5" r="0.8" fill="rgba(245,158,11,0.6)" stroke="none" /></svg>
                    )}
                </div>
                <span className="text-sm" style={{ color: item.highlight ? '#f59e0b' : 'rgba(255,255,255,0.6)' }}>
                  {item.highlight ? <strong>{t(item.key)}</strong> : t(item.key)}
                </span>
              </div>
            ))}
          </div>
        </div>
{/* Vlnky + zlatí lidé */}
        {/* Vlnky + zlatí lidé */}
        {/* Vlnky + zlatí lidé */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '140px' }}>
          <svg viewBox="0 0 1200 140" className="w-full h-full" preserveAspectRatio="none" fill="none">
            <path d="M0 80 Q100 55 200 70 Q300 85 400 65 Q500 45 600 60 Q700 75 800 55 Q900 35 1000 50 Q1100 65 1200 45 L1200 140 L0 140 Z" fill="rgba(255,255,255,0.03)" />
            <path d="M0 90 Q150 65 300 85 Q450 105 600 75 Q750 45 900 70 Q1050 95 1200 65 L1200 140 L0 140 Z" fill="rgba(255,255,255,0.05)" />
            <path d="M0 100 Q120 80 240 95 Q360 110 480 85 Q600 60 720 80 Q840 100 960 75 Q1080 50 1200 70 L1200 140 L0 140 Z" fill="rgba(255,255,255,0.08)" />
            
            
            
            
          </svg>
          <div className="mt-4 py-2 px-4 rounded-lg text-center">
            <p className="text-xs font-medium" style={{ color: '#f59e0b' }}>Clientoro — klienti jsou to zlato</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:flex-1 flex items-center justify-center px-4 sm:px-6 lg:bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-3"
              style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
              <Waves className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Clientoro</h1>
            
          </div>

          <div className="bg-white rounded-2xl border-2 border-amber-400/50 lg:border-gray-200/80 p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('login_title')}</h2>
              <p className="text-sm text-gray-400">{t('login_subtitle')}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                {"\u26a0\ufe0f"} {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login_email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                    placeholder={t('email_placeholder')} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('login_password')}</label>
                <div className="relative">
                  {showPassword ? <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /> : <EyeOff className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                    placeholder={t('login_password_placeholder')} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    {t('login_loading')}
                  </span>
                ) : (<>{t('login_submit')} <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {t('login_no_account')}{' '}
                <a href="/register" className="font-semibold" style={{ color: '#0f6b7a' }}>{t('login_register_link')}</a>
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-300 mt-6">{"\ud83c\udfc6"} {t('login_footer')}</p>
        </div>
      </div>
    </div>
  )
}