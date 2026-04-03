// PATH: src/app/(dashboard)/dev/page.tsx
'use client'

import { Wrench, Send } from 'lucide-react'
import { useState } from 'react'
import { useLang } from '@/lib/LangContext'

export default function DevToolsPage() {
  const { t } = useLang()
  const [testResult, setTestResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const sendTestEmail = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test' }),
      })
      const data = await res.json()
      setTestResult(data.ok ? '✅ Testovací email odeslán!' : `❌ Chyba: ${data.error}`)
    } catch (e: any) {
      setTestResult(`❌ ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
          <Wrench className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dev Tools</h1>
          <p className="text-sm text-gray-500">Superadmin nástroje pro vývoj a testování</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">📧 Test emailů</h3>
          <button
            onClick={sendTestEmail}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}
          >
            <Send className="w-4 h-4" />
            {loading ? 'Odesílám...' : 'Odeslat testovací email'}
          </button>
          {testResult && <p className="mt-3 text-sm">{testResult}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-2">📊 Build info</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Verze:</strong> MVP 1.0</p>
            <p><strong>Stack:</strong> Next.js + Supabase + Resend</p>
            <p><strong>Email funkcí:</strong> 27</p>
            <p><strong>API routes:</strong> 38</p>
            <p><strong>Dashboard stránek:</strong> 14</p>
          </div>
        </div>
      </div>
    </div>
  )
}
