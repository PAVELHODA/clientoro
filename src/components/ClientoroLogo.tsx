// PATH: src/components/ClientoroLogo.tsx
'use client'

import { Waves } from 'lucide-react'

export default function ClientoroLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="rounded-lg flex items-center justify-center" style={{ width: size, height: size, background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
      <Waves className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} />
    </div>
  )
}

