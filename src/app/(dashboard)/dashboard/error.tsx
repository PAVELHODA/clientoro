'use client'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-8 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Nepodařilo se načíst dashboard</h2>
      <p className="text-sm text-gray-500 mb-4">Zkontrolujte připojení k internetu a zkuste to znovu.</p>
      <button onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl font-medium text-sm"
        style={{ background: 'linear-gradient(135deg, #1a6e8a, #2ba0b0)' }}>
        <RefreshCw className="w-4 h-4" /> Zkusit znovu
      </button>
    </div>
  )
}
