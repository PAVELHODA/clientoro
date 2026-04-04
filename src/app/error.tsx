'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #fef2f2, #fff1f2)' }}>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Něco se pokazilo</h1>
        <p className="text-gray-500 mb-6">Omlouváme se za komplikace. Zkuste to prosím znovu.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #1a6e8a, #2ba0b0)' }}>
            <RefreshCw className="w-4 h-4" /> Zkusit znovu
          </button>
          <a href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all">
            <Home className="w-4 h-4" /> Dashboard
          </a>
        </div>
        {error.digest && <p className="mt-6 text-xs text-gray-300">Kód: {error.digest}</p>}
      </div>
    </div>
  )
}
