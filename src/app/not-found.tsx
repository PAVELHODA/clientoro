// PATH: src/app/not-found.tsx
import { Waves } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0f2 100%)' }}>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
          <Waves className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Stránka nenalezena</h2>
        <p className="text-gray-500 mb-8">Tato stránka neexistuje nebo byla přesunuta.</p>
        <div className="flex gap-3 justify-center">
          <a href="/" className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
            Zpět na úvod
          </a>
          <a href="/login" className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
            Přihlásit se
          </a>
        </div>
        <div className="mt-12 flex items-center justify-center gap-2">
          <Waves className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-300 text-[10px] font-semibold" style={{ letterSpacing: '0.2em' }}>CLIENTORO</span>
        </div>
      </div>
    </div>
  )
}
