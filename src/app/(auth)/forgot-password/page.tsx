'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Waves, Mail, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) setError(error.message)
      else setSent(true)
    } catch { setError('Něco se pokazilo. Zkuste to znovu.') }
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
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email odeslán!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Pokud účet s emailem <strong>{email}</strong> existuje, poslali jsme vám odkaz pro obnovení hesla. Zkontrolujte i spam.
              </p>
              <a href="/login" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: '#0f6b7a' }}>
                <ArrowLeft className="w-4 h-4" /> Zpět na přihlášení
              </a>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Zapomenuté heslo</h2>
                <p className="text-sm text-gray-500 mt-1">Zadejte email a pošleme vám odkaz pro obnovení hesla.</p>
              </div>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-gray-50 focus:bg-white transition-colors"
                      placeholder="vas@email.cz" required autoFocus />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #1a6e8a, #2ba0b0)' }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4" /> Odeslat odkaz</>}
                </button>
              </form>
              <div className="mt-6 text-center">
                <a href="/login" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Zpět na přihlášení
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
