// PATH: src/app/(dashboard)/growth/insights/page.tsx
'use client'

import { TrendingUp, BarChart3, Users, Calendar } from 'lucide-react'
import { useLang } from '@/lib/LangContext'

export default function InsightsPage() {
  const { t } = useLang()

  const cards = [
    { icon: BarChart3, title: 'Revenue Intelligence', desc: 'Trendy tržeb, nejlepší služby, srovnání měsíců.' },
    { icon: Users, title: 'Klientské kohorty', desc: 'Retence, churn rate, návratnost po segmentech.' },
    { icon: Calendar, title: 'Využití kapacity', desc: 'Obsazenost per zaměstnanec, den v týdnu, hodina.' },
    { icon: TrendingUp, title: 'Growth metriky', desc: 'Lead-to-booking conversion, zdroje klientů, referraly.' },
  ]

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
        <TrendingUp className="w-8 h-8 text-amber-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">{t?.('insights_title') || 'Growth Insights'}</h1>
      <p className="text-gray-500 mb-2">{t?.('insights_desc') || 'Pokročilá analytika a AI doporučení pro růst vašeho businessu.'}</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mt-4 border border-amber-200">
        🔜 Připravujeme — brzy dostupné
      </div>
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 text-left">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
              <c.icon className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">{c.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
