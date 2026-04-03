// PATH: src/app/(dashboard)/ai/page.tsx
'use client'

import { Bot, BrainCircuit, TrendingUp, Zap } from 'lucide-react'
import { useLang } from '@/lib/LangContext'

export default function AiPage() {
  const { t } = useLang()

  const features = [
    { icon: BrainCircuit, title: 'AI Copilot', desc: 'Inteligentní asistent, který analyzuje vaše data a navrhuje konkrétní kroky pro růst.' },
    { icon: TrendingUp, title: 'Detekce mrtvých hodin', desc: 'AI najde hodiny, kdy nemáte klienty, a navrhne jak je zaplnit.' },
    { icon: Zap, title: 'Reaktivace klientů', desc: 'Automatická identifikace klientů, kteří se dlouho neobjednali.' },
  ]

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
        <Bot className="w-8 h-8 text-amber-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">{t?.('ai_title') || 'AI Asistent'}</h1>
      <p className="text-gray-500 mb-2">{t?.('ai_desc') || 'AI, která pracuje za vás. Žádný chatbot — reálné insighty a doporučení.'}</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mt-4 border border-amber-200">
        🔜 Připravujeme — brzy dostupné
      </div>
      <div className="mt-8 space-y-4">
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4 text-left">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
              <f.icon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
