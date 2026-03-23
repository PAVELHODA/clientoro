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

  const accept = () => {
    localStorage.setItem('clientoro_cookie_consent', 'accepted')
    localStorage.setItem('clientoro_cookie_consent_date', new Date().toISOString())
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('clientoro_cookie_consent', 'declined')
    localStorage.setItem('clientoro_cookie_consent_date', new Date().toISOString())
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-white font-medium mb-1">Soukromí a cookies</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Používáme pouze technicky nezbytné cookies pro fungování aplikace (přihlášení, jazyk, nastavení).
                Nepoužíváme žádné reklamní ani sledovací cookies. Vaše data jsou zpracována v souladu s{' '}
                <a href="/privacy" className="text-amber-400 underline hover:text-amber-300">GDPR</a>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={decline}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
              Jen nezbytné
            </button>
            <button onClick={accept}
              className="px-4 py-2 text-xs text-white font-semibold rounded-lg shadow-md transition-colors"
              style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
              Rozumím
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
