'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Waves, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'Špatný email nebo heslo' : error.message)
      } else { router.push('/dashboard'); router.refresh() }
    } catch (err) { setError('Neočekávaná chyba') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Levá strana — zelená→modrá gradient (Solo + Team = Clientoro základ) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0f766e 0%, #0d9488 20%, #14b8a6 35%, #0369a1 65%, #0c4a6e 85%, #1e3a5f 100%)' }}>

        <div className="absolute top-20 right-20 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl" />
        <div className="absolute top-32 right-32 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl" />

        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
          <svg viewBox="0 0 1440 100" className="w-full h-full fill-white">
            <path d="M0 40 Q180 0 360 40 Q540 80 720 40 Q900 0 1080 40 Q1260 80 1440 40 L1440 100 L0 100 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Clientoro</h1>
              <p className="text-white/60 text-sm">Booking & Growth OS</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Získejte více klientů.<br />
            Zvyšte tržby.<br />
            <span className="text-amber-300">Automaticky.</span>
          </h2>

          <p className="text-white/70 text-lg mb-8 max-w-md">
            Rezervační systém s AI, který vám pomůže růst. Žádné ztracené leady, žádné prázdné sloty.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center"><span className="text-sm">📅</span></div>
              <span className="text-white/80 text-sm">Online booking 24/7</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center"><span className="text-sm">🤖</span></div>
              <span className="text-white/80 text-sm">AI asistent pro růst</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center"><span className="text-sm">📊</span></div>
              <span className="text-white/80 text-sm">Revenue intelligence & KPI</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center"><span className="text-sm">🏆</span></div>
              <span className="text-white/80 text-sm">Vaši klienti jsou zlato</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pravá strana */}
      <div className="flex-1 flex items-center justify-center px-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-3"
              style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}>
              <Waves className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Clientoro</h1>
            <p className="text-gray-400 text-sm">Booking & Growth OS</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Přihlášení</h2>
            <p className="text-sm text-gray-400 mb-6">Vítejte zpět! Přihlaste se do svého účtu.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                    placeholder="vas@email.cz" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Heslo</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                    placeholder="Vaše heslo" required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Přihlašuji...
                  </span>
                ) : (<>Přihlásit se <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Nemáte účet?{' '}
                <a href="/register" className="text-sky-600 hover:text-sky-800 font-semibold">Zaregistrujte se</a>
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-300 mt-6">🏆 Clientoro — Vaši klienti jsou zlato</p>
        </div>
      </div>
    </div>
  )
}
