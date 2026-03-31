// PATH: src/app/contact/page.tsx
'use client'

import { Waves, Mail, ArrowLeft } from 'lucide-react'
import ClientoroLogo from '@/components/ClientoroLogo'

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ClientoroLogo size={40} />
            <span className="text-2xl font-bold text-white">Clientoro</span>
          </div>
          <p className="text-white/60 text-sm">Klienti jsou to zlato.</p>
        </div>

        <div className="rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-amber-400/70" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
          <h1 className="text-xl font-bold text-white mb-6 text-center">Kontakt</h1>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
              <Mail className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/50">E-mail</p>
                <a href="mailto:clientoro.app@gmail.com" className="text-sm font-medium text-white hover:text-amber-400">clientoro.app@gmail.com</a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
              <Waves className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/50">Web</p>
                <a href="https://clientoro.pro" className="text-sm font-medium text-white hover:text-amber-400">clientoro.pro</a>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-xs text-white/60 text-center mb-4">
              Clientoro je ambiciózní projekt jednoho muže a AI.<br />
              Děláme s láskou pro lidi, co pracují pro lidi.
            </p>
            <p className="text-xs text-amber-400/80 text-center">
              WIN-WIN · Fér play · Žádné skryté poplatky
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <a href="/" className="flex-1 py-2.5 text-center text-sm text-white/70 font-medium border border-white/30 rounded-lg hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Zpět
            </a>
            <a href="/login" className="flex-1 py-2.5 text-center text-sm text-white font-medium rounded-lg" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
              Přihlásit se
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}