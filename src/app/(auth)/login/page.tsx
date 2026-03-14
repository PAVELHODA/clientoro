// PATH: src/app/(auth)/login/page.tsx
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
      {/* Levá strana — Deep Ocean + Gold */}
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
            {"Z\u00edsk\u00e1vejte v\u00edce klient\u016f."}<br />
            {"Pln\u00fd kalend\u00e1\u0159. Spokojen\u00ed klienti."}<br />
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.2)' }}>{"S AI po Va\u0161em boku."}</span>
          </h2>

          <p className="text-lg mb-10 max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {"Rezerva\u010dn\u00ed syst\u00e9m s AI, kter\u00fd v\u00e1m pom\u016f\u017ee r\u016fst. \u017d\u00e1dn\u00e9 ztracen\u00e9 leady, \u017e\u00e1dn\u00e1 pr\u00e1zdn\u00e1 \u010dasov\u00e1 okna."}
          </p>

          <div className="space-y-3">
            {[
              '\ud83d\udcc5 Online booking 24/7',
              '\ud83e\udd16 AI asistent pro r\u016fst',
              '\ud83d\udcca P\u0159ehledy tr\u017eeb & KPI',
              '\ud83c\udfc6 Va\u0161i klienti jsou zlato',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-sm">{text.slice(0, 2)}</span>
                </div>
                <span className="text-sm" style={{ color: i === 3 ? '#f59e0b' : 'rgba(255,255,255,0.6)' }}>
                  {i === 3 ? <strong>{text.slice(2)}</strong> : text.slice(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pravá strana — Formulář */}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{"\u0050\u0159ihl\u00e1\u0161en\u00ed"}</h2>
            <p className="text-sm text-gray-400 mb-6">{"\u0056\u00edtejte zp\u011bt! P\u0159ihlaste se do sv\u00e9ho \u00fa\u010dtu."}</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                {"\u26a0\ufe0f"} {error}
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
                    placeholder={"Va\u0161e heslo"} required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    {"\u0050\u0159ihla\u0161uji..."}
                  </span>
                ) : (<>{"\u0050\u0159ihl\u00e1sit se"} <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {"Nem\u00e1te \u00fa\u010det?"}{' '}
                <a href="/register" className="font-semibold" style={{ color: '#0f6b7a' }}>{"Zaregistrujte se"}</a>
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-300 mt-6">{"\ud83c\udfc6 Clientoro \u2014 Va\u0161i klienti jsou zlato"}</p>
        </div>
      </div>
    </div>
  )
}
