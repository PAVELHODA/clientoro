// PATH: src/components/CookieConsent.tsx
'use client'

import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('clientoro_cookie_consent')
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('clientoro_cookie_consent', 'all')
    localStorage.setItem('clientoro_cookie_consent_date', new Date().toISOString())
    setVisible(false)
  }

  const acceptNecessary = () => {
    localStorage.setItem('clientoro_cookie_consent', 'necessary')
    localStorage.setItem('clientoro_cookie_consent_date', new Date().toISOString())
    setVisible(false)
  }

  const declineAll = () => {
    localStorage.setItem('clientoro_cookie_consent', 'declined')
    localStorage.setItem('clientoro_cookie_consent_date', new Date().toISOString())
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-4">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-white font-medium mb-1">Ochrana soukromí a cookies</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Používáme pouze technicky nezbytné cookies pro fungování aplikace (přihlášení, jazyk, nastavení).
                Nepoužíváme žádné reklamní ani sledovací cookies. Vaše data zpracováváme v souladu s{' '}
                <a href="/privacy" className="text-amber-400 underline hover:text-amber-300">GDPR</a>.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <button onClick={declineAll}
              className="px-4 py-2 text-xs text-amber-400 hover:text-amber-300 rounded-lg border border-amber-700 hover:border-amber-500 transition-colors">
              Odmítnout vše
            </button>
            <button onClick={acceptNecessary}
              className="px-4 py-2 text-xs text-green-600 hover:text-green-500 rounded-lg border border-green-800 hover:border-green-600 transition-colors font-medium">
              Pouze nezbytné
            </button>
            <button onClick={acceptAll}
              className="px-4 py-2 text-xs text-white font-semibold rounded-lg shadow-md transition-colors"
              style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
              Přijmout vše
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}