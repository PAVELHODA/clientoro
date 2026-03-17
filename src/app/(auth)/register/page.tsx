﻿﻿﻿// PATH: src/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Waves, Mail, Lock, ArrowRight, Building2, User, Eye, EyeOff, RefreshCw } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [mode, setMode] = useState('solo')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
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
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Volej server-side API route (obejde RLS)
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, businessName, mode }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Chyba p\u0159i registraci')
        setLoading(false)
        return
      }

      // Prihlasit uzivatele
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) {
        setError('Registrace \u00fasp\u011b\u0161n\u00e1! P\u0159ihlaste se manu\u00e1ln\u011b.')
        router.push('/login')
        return
      }

      router.push('/onboarding')
      router.refresh()
    } catch (err) {
      setError('Neo\u010dek\u00e1van\u00e1 chyba')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Lev\u00e1 strana */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0c2d48 20%, #0e4d64 40%, #0f6b7a 55%, #0e5460 70%, #0c3a50 85%, #0a1e30 100%)' }}>

        <div className="absolute top-16 right-16 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }} />
        <div className="absolute top-24 right-24 w-40 h-40 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full blur-3xl -translate-y-1/2" style={{ background: 'radial-gradient(circle, rgba(14,77,100,0.3) 0%, transparent 70%)' }} />

        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-[0.07]">
          <svg viewBox="0 0 1440 100" className="w-full h-full fill-white">
            <path d="M0 40 Q180 0 360 40 Q540 80 720 40 Q900 0 1080 40 Q1260 80 1440 40 L1440 100 L0 100 Z" />
          </svg>
        </div>

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
            {"Za\u010dn\u011bte r\u016fst"}<br />
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.2)' }}>{"je\u0161t\u011b dnes."}</span>
          </h2>

          <p className="text-lg mb-10 max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {"Vytvo\u0159te si \u00fa\u010det za 30 sekund. \u017d\u00e1dn\u00e1 kreditn\u00ed karta. 14 dn\u00ed pln\u00fd p\u0159\u00edstup zdarma."}
          </p>

          <div className="space-y-3">
            {[
              '\u2705 Kompletn\u00ed booking syst\u00e9m',
              '\u2705 CRM klient\u016f',
              '\u2705 AI asistent & n\u00e1stroje pro r\u016fst',
              '\u2705 Dashboard s KPI & reporty',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-sm">{text.slice(0, 1)}</span>
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{text.slice(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prav\u00e1 strana */}
      <div className="flex-1 flex items-center justify-center px-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-3"
              style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
              <Waves className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Clientoro</h1>
            <p className="text-gray-400 text-sm">Booking & Growth OS</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Registrace</h2>
            <p className="text-sm text-gray-400 mb-6">{"Vytvo\u0159te si \u00fa\u010det zdarma za 30 sekund."}</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                {"\u26a0\ufe0f"} {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{"N\u00e1zev firmy / salonu *"}</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                    placeholder={"Nap\u0159. Beauty Salon"} required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{"Typ podnik\u00e1n\u00ed"}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setMode('solo')}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      mode === 'solo' ? 'text-white shadow-md' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                    style={mode === 'solo' ? { background: 'linear-gradient(135deg, #0e4d64, #0f6b7a)', borderColor: '#0f6b7a' } : {}}>
                    <User className="w-4 h-4" /> Freelancer
                  </button>
                  <button type="button" onClick={() => setMode('team')}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      mode === 'team' ? 'text-white shadow-md' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                    style={mode === 'team' ? { background: 'linear-gradient(135deg, #0c2d48, #0e4d64)', borderColor: '#0e4d64' } : {}}>
                    <Building2 className="w-4 h-4" /> Firma
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                    placeholder="vas@email.cz" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Heslo *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                    placeholder={"Min. 6 znak\u016f"} minLength={6} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button type="button" onClick={generatePassword} className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-600" title="Vygenerovat silne heslo">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* GDPR */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="gdpr" required className="mt-1 w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                <label htmlFor="gdpr" className="text-xs text-gray-500 leading-relaxed">
                  {'Souhlasím se zpracováním osobních údajů a obchodními podmínkami. Data šifrována (AES-256), přenos zabezpečen (TLS 1.2+), přístup chráněn row-level security. GDPR kompatibilní.'}
                </label>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    {"Vytv\u00e1\u0159\u00edm \u00fa\u010det..."}
                  </span>
                ) : (<>{"Vytvo\u0159it \u00fa\u010det zdarma"} <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>

            <div className="mt-3 text-center">
              <p className="text-xs text-gray-300">{"14 dn\u00ed zdarma \u00b7 \u017d\u00e1dn\u00e1 kreditn\u00ed karta"}</p>
            </div>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-400">
                {"U\u017e m\u00e1te \u00fa\u010det?"}{' '}
                <a href="/login" className="font-semibold" style={{ color: '#0f6b7a' }}>{"P\u0159ihlaste se"}</a>
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-300 mt-6">{"\ud83c\udfc6 Clientoro \u2014 Va\u0161i klienti jsou zlato"}</p>
        </div>
      </div>
    </div>
  )
}

