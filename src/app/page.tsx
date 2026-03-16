'use client'

import { useState } from 'react'
import { Waves, Calendar, Users, Brain, TrendingUp, ChevronDown, Shield, Zap, Check, ArrowRight, CreditCard, Banknote, Scissors, Sparkles, Gem, HeartPulse, Dumbbell, BrainCircuit, PawPrint, GraduationCap, MessageSquare } from 'lucide-react'

const SEGMENT_ICONS: Record<string, any> = {
  scissors: Scissors, sparkles: Sparkles, gem: Gem, heartPulse: HeartPulse,
  dumbbell: Dumbbell, brainCircuit: BrainCircuit, messageSquare: MessageSquare,
  pawPrint: PawPrint, graduationCap: GraduationCap,
}

const SEGMENTS = [
  { icon: 'scissors', title: 'Kadeřnictví & barber', desc: 'Střihy, barvení, melíry, foukaná' },
  { icon: 'sparkles', title: 'Masáže & wellness', desc: 'Klasické, sportovní, relaxační masáže' },
  { icon: 'gem', title: 'Kosmetika & estetika', desc: 'Ošetření pleti, nehty, permanentní make-up' },
  { icon: 'heartPulse', title: 'Fyzioterapie & zdraví', desc: 'Rehabilitace, terapie, logopedie' },
  { icon: 'dumbbell', title: 'Fitness & výživa', desc: 'Osobní tréninky, výživové poradenství' },
  { icon: 'brainCircuit', title: 'Psychologie & koučink', desc: 'Terapie, koučink, mentoring' },
  { icon: 'messageSquare', title: 'Tetování & piercing', desc: 'Návrhy, tetování, piercing' },
  { icon: 'pawPrint', title: 'Péče o zvířata', desc: 'Grooming, trénink, hlídání' },
  { icon: 'graduationCap', title: 'Vzdělávání & lekce', desc: 'Doučování, jazyky, hudba, workshopy' },
]

const FEATURES = [
  { icon: Calendar, color: 'from-blue-500 to-cyan-400', title: 'Chytrý kalendář', items: ['Online rezervace 24/7', 'Denní / týdenní / měsíční zobrazení', 'Zálohy a předplatby (volitelné)', 'Automatické připomínky', 'Sledování nedorazivších (no-show)'] },
  { icon: Users, color: 'from-emerald-500 to-teal-400', title: 'CRM klientů', items: ['Karty klientů s kompletní historií', 'Řazení a filtry (A-Z, útrata, návštěvy)', 'Štítky a segmenty', 'Export CSV / JSON / PDF', 'Narozeninové přání a nabídky'] },
  { icon: Brain, color: 'from-amber-500 to-yellow-400', title: 'AI asistent', items: ['AI insighty a doporučení', 'Detekce mrtvých hodin', 'Návrhy na reaktivaci klientů', 'Přehledy tržeb', 'Vše ZAP/VYP — rozhodujete vy'] },
  { icon: TrendingUp, color: 'from-rose-500 to-pink-400', title: 'Nástroje pro růst', items: ['Referral program', 'Věrnostní body a odměny', 'Slevové kódy a vouchery', 'QR kódy s trackingem', 'Dárkové poukazy'] },
]

const PRICING = [
  { name: 'OSVC', icon: '\u{1F7E2}', color: 'border-teal-300 bg-teal-50', price: '49', priceAi: '99', desc: 'Pro podnikatele (1 osoba)', features: ['Kalendář + rezervační link', 'Až 50 rezervací/měsíc', 'CRM klientů (až 100)', 'Základní reporty', 'Narozeninové SMS (volitelné)', 'Platba jen hotově'], trial: true },
  { name: 'FIRMA', icon: '\u{1F535}', color: 'border-blue-300 bg-blue-50', price: '299', priceAi: '499', desc: 'Majitel + max 4 zaměstnanci', features: ['Vše z OSVČ (neomezeně)', 'Správa týmu + kalendář směn', 'Reporty per zaměstnanec', 'Online platby a zálohy', 'Klientský mini-portál', 'Až 3 pobočky'], trial: false, popular: true },
  { name: 'SOLO INSPIRE', icon: '\u{1F3D6}', color: 'border-amber-300 bg-amber-50', price: '499', priceAi: '799', desc: 'OSVČ + AI a nástroje pro růst', features: ['Vše z OSVČ (neomezeně)', 'AI insighty a doporučení', 'Kampaně (5/měsíc)', 'Referral + věrnostní program', 'Smart rebooking', 'Dárkové poukazy'], trial: false },
  { name: 'PRO INSPIRE', icon: '\u{1F3D6}\u{2728}', color: 'border-yellow-400 bg-yellow-50', price: '1 299', priceAi: '1 999', desc: 'Majitel + max 24 zaměstnanců', features: ['Vše z FIRMA + SOLO INSPIRE', 'AI Copilot (pokročilý)', 'AI Smart Slot Filler', 'Neomezené kampaně', 'Neomezené pobočky'], trial: false },
]

const FAQ = [
  { q: 'Je Clientoro opravdu zdarma k vyzkoušení?', a: 'Ano! 14 dní plný přístup, bez kreditní karty. Po trialu můžete pokračovat s free plánem (20 rezervací/měsíc) nebo si vybrat placený plán.' },
  { q: 'Čím se Clientoro liší od rezervačních systémů na českém a slovenském trhu?', a: 'Clientoro není jen rezervační systém. Obsahuje AI insighty, nástroje pro růst, referral programy a přehledy tržeb. Pomáháme vám ZÍSKÁVAT nové klienty, ne jen spravovat stávající.' },
  { q: 'Mohu exportovat data pro účetní?', a: 'Ano! Export klientů, rezervací a tržeb v CSV, JSON nebo PDF formátu.' },
  { q: 'Musím mít platební bránu?', a: 'Ne! Můžete fungovat čistě na hotovosti. Online platby přes Stripe Connect jsou volitelné.' },
  { q: 'Mohu vypnout AI funkce?', a: 'Rozhodně! Každá AI funkce má přepínač ZAP/VYP. Nic se neděje bez vašeho souhlasu.' },
  { q: 'Jsou moje data v bezpečí?', a: 'Ano. Používáme Supabase (PostgreSQL) s row-level security a GDPR-kompatibilním zpracováním dat.' },
  { q: 'Potřebuji technické znalosti?', a: 'Vůbec ne. Náš průvodce krok za krokem vás provede nastavením za 5 minut.' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [calcSlots, setCalcSlots] = useState(4)
  const [calcPrice, setCalcPrice] = useState(800)
  const [calcNoshow, setCalcNoshow] = useState(15)
  const lostRevenue = Math.round(calcSlots * calcPrice * (calcNoshow / 100) * 22)

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}><Waves className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold text-gray-900">Clientoro</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#segments" className="hover:text-gray-900">Pro koho</a>
            <a href="#features" className="hover:text-gray-900">Funkce</a>
            <a href="#pricing" className="hover:text-gray-900">Ceník</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Přihlásit se</a>
            <a href="/register" className="px-4 py-2 text-sm text-white rounded-lg font-semibold shadow-md" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>Začít zdarma</a>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0c2d48 20%, #0e4d64 40%, #0f6b7a 55%, #0e5460 70%, #0c3a50 85%, #0a1e30 100%)' }}>
        <div className="absolute top-16 right-16 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}><Zap className="w-4 h-4" /> Pro lidi, co pracují s lidmi</div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">Plný kalendář.<br />Spokojení klienti.<br /><span style={{ color: '#f59e0b' }}>Vy máte přehled.</span></h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>Rezervace, CRM a nástroje pro růst — vše na jednom místě. Férový ceník, žádné skryté poplatky.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <a href="/register" className="px-8 py-4 text-white rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Vyzkoušet 14 dní zdarma <ArrowRight className="w-5 h-5" /></a>
            <a href="#features" className="px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>Co vám přineseme?</a>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Bez kreditní karty · Zrušení kdykoliv · Vaše data, vaše kontrola</p>
        </div>
      </section>

      <section id="segments" className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Vytvořeno pro poskytovatele služeb</h2>
            <p className="text-gray-500">Pracujete s lidmi? Pak je Clientoro pro vás.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {SEGMENTS.map(s => { const Icon = SEGMENT_ICONS[s.icon]; return (
              <div key={s.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-amber-200 transition-all text-center group">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}><Icon className="w-6 h-6" style={{ color: '#f59e0b' }} /></div>
                <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Vše co potřebujete na jednom místě</h2>
            <p className="text-gray-500">Žádné přepínání mezi aplikacemi. Žádné ztracené informace.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center`}><f.icon className="w-5 h-5 text-white" /></div>
                  <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
                </div>
                <ul className="space-y-2">{f.items.map(item => (<li key={item} className="flex items-start gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{item}</li>))}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}><Brain className="w-4 h-4" /> AI, které pracuje za vás</div>
          <h2 className="text-3xl font-bold text-white mb-4">Chytřejší rozhodování bez námahy</h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>AI analyzuje vaše data a navrhuje konkrétní kroky. Žádný chatbot — reálné insighty.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[{ title: 'Detekce mrtvých hodin', desc: 'AI najde hodiny kdy nemáte klienty a navrhne jak je zaplnit' },
              { title: 'Reaktivace klientu', desc: 'AI identifikuje klienty kteří se dlouho neobjednali' },
              { title: 'Přehledy tržeb', desc: 'AI ukáže trendy, nejlepší služby a doporučí kde růst' }
            ].map(a => (<div key={a.title} className="rounded-xl p-5 text-left" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}><h3 className="font-bold text-white mb-2">{a.title}</h3><p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{a.desc}</p></div>))}
          </div>
          <p className="text-sm mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}><Shield className="w-4 h-4 inline mr-1" /> Všechny AI funkce mají přepínač ZAP/VYP. Rozhodujete vy.</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Připraveni za 5 minut</h2>
            <p className="text-gray-500">Žádné technické znalosti. Průvodce vás provede krok za krokem.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ step: '1', title: 'Vytvořte účet', desc: '30 sekund, bez karty' },{ step: '2', title: 'Vyberte obor', desc: 'Služby se předvyplní' },{ step: '3', title: 'Sdílejte link', desc: 'Klienti rezervují online' },{ step: '4', title: 'Sledujte růst', desc: 'AI vám pomůže zlepšovat' }].map(s => (
              <div key={s.step} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{s.step}</div>
                <h3 className="font-bold text-gray-900">{s.title}</h3><p className="text-xs text-gray-400 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="calculator" className="py-16">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">O kolik měsíčně přicházíte?</h2>
            <p className="text-gray-500">Posuňte posuvníky a uvidíte kolik vás stojí nedorazivší klienti (no-show).</p>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-5">
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Klientů denně</span><span className="font-bold">{calcSlots}</span></div><input type="range" min={1} max={20} value={calcSlots} onChange={e => setCalcSlots(Number(e.target.value))} aria-label="Klientů denně" className="w-full accent-amber-500" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Průměrná cena služby</span><span className="font-bold">{calcPrice} Kc</span></div><input type="range" min={200} max={5000} step={100} value={calcPrice} onChange={e => setCalcPrice(Number(e.target.value))} aria-label="Průměrná cena služby" className="w-full accent-amber-500" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Míra nedorazivších (no-show)</span><span className="font-bold">{calcNoshow}%</span></div><input type="range" min={0} max={40} value={calcNoshow} onChange={e => setCalcNoshow(Number(e.target.value))} aria-label="Míra nedorazivších" className="w-full accent-amber-500" /></div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center">
              <p className="text-sm text-red-600 mb-1">Měsíčně přicházíte o</p>
              <p className="text-3xl font-bold text-red-700">{lostRevenue.toLocaleString('cs-CZ')} Kc</p>
              <p className="text-xs text-red-400 mt-1">S Clientoro můžete tuto ztrátu snížit až o 70 %</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4"><CreditCard className="w-5 h-5 text-blue-600" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Zálohy a předplatby</h3>
            <p className="text-sm text-gray-500 mb-4">Snižte nedorazivší (no-show) o 60–80 %. Klient zaplatí zálohu při rezervaci.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Nastavíte % zálohy per služba</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> VIP klienti mohou být osvobozeni</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Volitelné — zapnete jen pokud chcete</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4"><Banknote className="w-5 h-5 text-green-600" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hotovostní bonus</h3>
            <p className="text-sm text-gray-500 mb-4">Nabídněte klientům bonus za platbu hotově. Ušetříte na poplatcích za platební bránu.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Sleva nebo věrnostní body za hotovost</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Platební brána není povinná</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Fungujete i čistě na hotovosti</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Férový ceník bez překvapení</h2>
            <p className="text-gray-500">Začněte zdarma. Plaťte jen za to co využíváte.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {PRICING.map(p => (
              <div key={p.name} className={`rounded-2xl border-2 p-5 relative ${p.color} ${p.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">Nejoblíbenější</div>}
                <div className="text-center mb-4"><span className="text-2xl">{p.icon}</span><h3 className="text-lg font-bold text-gray-900 mt-1">{p.name}</h3><p className="text-xs text-gray-500">{p.desc}</p></div>
                <div className="text-center mb-4"><span className="text-3xl font-bold text-gray-900">{p.price}</span><span className="text-sm text-gray-500"> Kc/mes</span><p className="text-xs text-gray-400">S AI: {p.priceAi} Kc/mes</p></div>
                <ul className="space-y-1.5 mb-4">{p.features.map(f => (<li key={f} className="flex items-start gap-1.5 text-xs text-gray-600"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{f}</li>))}</ul>
                {p.trial && <div className="bg-emerald-100 rounded-lg p-2 text-center text-xs text-emerald-700 font-medium mb-3">14 dní zdarma</div>}
                <a href="/register" className="block w-full py-2.5 text-center text-white rounded-xl font-medium text-sm shadow-md" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>Začít zdarma</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Časté otázky</h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="font-medium text-gray-900 text-sm">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Připraveni na plný kalendář?</h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>14 dní zdarma. Bez kreditní karty. Nastavení za 5 minut.</p>
          <a href="/register" className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-xl font-bold text-lg shadow-xl" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Zacit zdarma <ArrowRight className="w-5 h-5" /></a>
        </div>
      </section>

      <footer className="py-12 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}><Waves className="w-4 h-4 text-white" /></div>
          <span className="text-lg font-bold text-white">Clientoro</span>
        </div>
        <p className="text-sm text-gray-500">2026 Clientoro. Všechna práva vyhrazena.</p>
        <div className="flex justify-center gap-6 mt-4 text-xs text-gray-600">
          <a href="#" className="hover:text-gray-400">Ochrana osobních údajů</a>
          <a href="#" className="hover:text-gray-400">Obchodní podmínky</a>
          <a href="#" className="hover:text-gray-400">Kontakt</a>
        </div>
      </footer>
    </div>
  )
}






