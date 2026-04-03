// PATH: src/app/(dashboard)/growth/campaigns/page.tsx
'use client'

import { Megaphone, ArrowRight } from 'lucide-react'
import { useLang } from '@/lib/LangContext'

export default function CampaignsPage() {
  const { t } = useLang()

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
        <Megaphone className="w-8 h-8 text-amber-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">{t?.('campaigns_title') || 'Kampaně'}</h1>
      <p className="text-gray-500 mb-2">{t?.('campaigns_desc') || 'Oslovte klienty cílenými kampaněmi — reaktivace, promo akce, volné termíny.'}</p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mt-4 border border-amber-200">
        🔜 Připravujeme — brzy dostupné
      </div>
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 text-left space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm">Co zde najdete:</h3>
        {['Reaktivační kampaně pro neaktivní klienty', 'Promo akce na volné termíny', 'Narozeninové nabídky', 'Hromadné emaily s personalizací', 'Statistiky otevření a konverzí'].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <ArrowRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
