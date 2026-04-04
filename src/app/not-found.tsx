import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e0f2fe)' }}>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-500 mb-6">Tato stránka neexistuje nebo byla přesunuta.</p>
        <div className="flex items-center justify-center gap-3">
          <a href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1a6e8a, #2ba0b0)' }}>
            <Home className="w-4 h-4" /> Dashboard
          </a>
          <a href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4" /> Domů
          </a>
        </div>
      </div>
    </div>
  )
}
