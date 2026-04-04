'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Waves, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase automaticky zpracuje hash fragment z emailu
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true)
    })
    // Fallback — pokud už je session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Heslo musí mít alespoň 6 znaků.'); return }
    if (password !== confirmPassword) { setError('Hesla se neshodují.'); return }
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) setError(error.message)
      else setDone(true)
    } catch { setError('Něco se pokazilo.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e0f2fe)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-3"
            style={{ background: 'linear-gradient(135deg, #1a6e8a, #2ba0b0)' }}>
            <Waves className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Clientoro</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {done ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Heslo změněno!</h2>
              <p className="text-gray-500 text-sm mb-6">Vaše heslo bylo úspěšně aktualizováno.</p>
              <a href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1a6e8a, #2ba0b0)' }}>
                Přejít do aplikace <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : !sessionReady ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Ověřuji odkaz...</p>
              <p className="text-gray-400 text-xs mt-2">Pokud to trvá příliš dlouho, zkuste odkaz z emailu znovu.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nové heslo</h2>
                <p className="text-sm text-gray-500 mt-1">Zadejte nové heslo pro váš účet.</p>
              </div>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nové heslo</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Minimálně 6 znaků" required autoFocus />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Potvrzení hesla</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Zopakujte heslo" required />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #1a6e8a, #2ba0b0)' }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Nastavit nové heslo <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
