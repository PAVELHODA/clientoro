// PATH: src/app/page.tsx
'use client'

import { useState } from 'react'
import { Waves, Calendar, Users, Brain, TrendingUp, ChevronDown, Shield, Zap, Check, ArrowRight, CreditCard, Banknote, Scissors, Sparkles, Gem, HeartPulse, Dumbbell, BrainCircuit, Camera, PawPrint, GraduationCap } from 'lucide-react'

const SEGMENT_ICONS: Record<string, any> = {
  scissors: Scissors, sparkles: Sparkles, gem: Gem, heartPulse: HeartPulse,
  dumbbell: Dumbbell, brainCircuit: BrainCircuit, camera: Camera,
  pawPrint: PawPrint, graduationCap: GraduationCap,
}

const SEGMENTS = [
  { icon: 'scissors', title: 'Krása & vlasy', desc: 'Kadeřnictví, barber, nehtová studia, vizážistky' },
  { icon: 'sparkles', title: 'Wellness & masáže', desc: 'Masérky, lymfodrenáž, spa, sauny' },
  { icon: 'gem', title: 'Estetika & kosmetika', desc: 'Kosmetičky, permanentní make-up, tattoo, piercing' },
  { icon: 'heartPulse', title: 'Zdraví & fyzioterapie', desc: 'Fyzioterapeuti, chiropraktici, osteopati, logopedi' },
  { icon: 'dumbbell', title: 'Fitness & sport', desc: 'Osobní trenéři, instruktoři jógy, výživoví poradci' },
  { icon: 'brainCircuit', title: 'Poradenství & terapie', desc: 'Psychologové, koučové, terapeuti, mentoři' },
  { icon: 'camera', title: 'Arte & kreativa', desc: 'Fotografové, kameramani, grafici, malíři, designéři' },
  { icon: 'pawPrint', title: 'Péče o zvířata', desc: 'Grooming, veterinární poradci, psí trenéři, chovatelé' },
  { icon: 'graduationCap', title: 'Vzdělávání & lekce', desc: 'Doučování, jazykové lekce, hudební lekce, workshopy' },
]

const FEATURES = [
  { icon: Calendar, color: 'from-blue-500 to-cyan-400', title: 'Chytrý booking', items: ['Online rezervace 24/7', 'Kalendář s denním/týdenním/měsíčním zobrazením', 'Zálohy a předplatby (volitelné)', 'Automatické připomínky (volitelné)', 'Sledování no-show'] },
  { icon: Users, color: 'from-emerald-500 to-teal-400', title: 'CRM klientů', items: ['Karty klientů s kompletní historií', 'Řazení a filtry (A-Z, útrata, návštěvy)', 'Štítky a segmenty', 'Export CSV / JSON / PDF', 'Narozeninové přání a nabídky (volitelné)'] },
  { icon: Brain, color: 'from-amber-500 to-yellow-400', title: 'AI asistent', items: ['AI Business Coach s reálnými tipy', 'Smart Slot Filler (volitelný)', 'Návrhy na reaktivaci klientů', 'Přehledy tržeb', 'Všechny AI funkce ZAP/VYP — rozhodujete vy'] },
  { icon: TrendingUp, color: 'from-rose-500 to-pink-400', title: 'Nástroje pro růst', items: ['Referral program — přiveďte kamaráda', 'Věrnostní body a odměny', 'Slevové kódy a vouchery', 'QR kódy s trackingem', 'Dárkové poukazy'] },
]

const PRICING = [
  { name: 'FREELANCER', icon: '🟢', color: 'border-teal-300 bg-teal-50', price: '49', priceAi: '99', desc: 'Pro podnikatele, kteří pracují sami', features: ['Kalendář + booking link', 'Až 50 rezervací/měsíc', 'CRM klientů (až 100)', 'Základní reporty', 'Narozeninové SMS (volitelné)', 'Platba jen hotově — bez brány ✅'], trial: true },
  { name: 'FIRMA', icon: '🔵', color: 'border-blue-300 bg-blue-50', price: '299', priceAi: '499', desc: 'Pro firmy s týmem', features: ['Vše z FREELANCER (neomezeně)', 'Správa týmu', 'Kalendář zaměstnanců a směny', 'Reporty per zaměstnanec', 'Online platby a zálohy (volitelné)', 'Až 3 pobočky'], trial: false, popular: true },
  { name: 'SOLO INSPIRE', icon: '🏖️', color: 'border-amber-300 bg-amber-50', price: '499', priceAi: '799', desc: 'Freelancer + AI a nástroje pro růst', features: ['Vše z FREELANCER (neomezeně)', 'AI Business Coach', 'Kampaně (5/měsíc)', 'Referral program', 'Věrnostní program', 'Smart rebooking', 'Dárkové poukazy'], trial: false },
  { name: 'PRO INSPIRE', icon: '🏖️✨', color: 'border-yellow-400 bg-yellow-50', price: '1 299', priceAi: '1 999', desc: 'Firma + AI a nástroje pro růst — maximum', features: ['Vše z FIRMA + SOLO INSPIRE', 'AI Copilot (pokročilý)', 'AI Smart Slot Filler', 'Neomezené kampaně', 'Neomezené pobočky'], trial: false },
]

const FAQ = [
  { q: 'Je Clientoro opravdu zdarma k vyzkoušení?', a: 'Ano! 14 dní plný přístup, bez kreditní karty. Po trialu můžete pokračovat s free plánem (20 rezervací/měsíc) nebo si vybrat placený plán.' },
  { q: 'Čím se Clientoro liší od Reservia nebo Reenia?', a: 'Clientoro není jen rezervační systém. Obsahuje AI asistenta, nástroje pro růst, referral programy a přehledy tržeb. Pomáháme vám ZÍSKÁVAT nové klienty, ne jen spravovat stávající.' },
  { q: 'Mohu exportovat data pro účetní?', a: 'Ano! Export klientů, rezervací a tržeb v CSV, JSON nebo PDF formátu. Kompatibilní s jakýmkoliv účetním systémem.' },
  { q: 'Musím mít platební bránu?', a: 'Ne! Můžete fungovat čistě na hotovosti. Online platby přes Stripe Connect jsou volitelné — zapnete jen pokud chcete.' },
  { q: 'Co je hotovostní bonus?', a: 'Můžete nabídnout klientům malý bonus (slevu nebo věrnostní body) za platbu hotově. Ušetříte na poplatcích za platební bránu a podpoříte českou korunu.' },
  { q: 'Mohu vypnout AI funkce?', a: 'Rozhodně! Každá AI funkce má přepínač ZAP/VYP. Nic se neděje bez vašeho souhlasu. Žádný spam, žádné nechtěné zprávy vašim klientům.' },
  { q: 'Jsou moje data v bezpečí?', a: 'Ano. Používáme Supabase (PostgreSQL) s row-level security, šifrovaným připojením a GDPR-kompatibilním zpracováním dat. Data si můžete kdykoliv stáhnout nebo smazat.' },
  { q: 'Potřebuji technické znalosti?', a: 'Vůbec ne. Náš průvodce krok za krokem vás provede nastavením za 5 minut. A náš tým podpory je tu vždy pro vás.' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [calcSlots, setCalcSlots] = useState(4)
  const [calcDuration, setCalcDuration] = useState(60)
  const [calcPrice, setCalcPrice] = useState(800)
  const [calcNoshow, setCalcNoshow] = useState(15)
  const lostRevenue = Math.round(calcSlots * calcPrice * (calcNoshow / 100) * 22)

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}><Waves className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold text-gray-900">Clientoro</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">Funkce</a>
            <a href="#ai" className="hover:text-gray-900">AI</a>
            <a href="#pricing" className="hover:text-gray-900">Ceník</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Přihlásit se</a>
            <a href="/register" className="px-4 py-2 text-sm text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>Začít zdarma</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0c2d48 20%, #0e4d64 40%, #0f6b7a 55%, #0e5460 70%, #0c3a50 85%, #0a1e30 100%)' }}>
        <div className="absolute top-16 right-16 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full blur-3xl -translate-y-1/2" style={{ background: 'radial-gradient(circle, rgba(14,77,100,0.3) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 opacity-[0.07]">
          <svg viewBox="0 0 1440 100" className="w-full h-full fill-white"><path d="M0 40 Q180 0 360 40 Q540 80 720 40 Q900 0 1080 40 Q1260 80 1440 40 L1440 100 L0 100 Z" /></svg>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
            <Zap className="w-4 h-4" /> Více než rezervační systém
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Získávejte s námi více klientů.<br />Plný kalendář. Spokojení klienti. Vy máte přehled.<br />
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.2)' }}>S AI po Vašem boku.</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Booking, CRM a růstová platforma pro poskytovatele služeb. Férový ceník, žádné skryté poplatky, žádné falešné sliby.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <a href="/register" className="px-8 py-4 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              Vyzkoušet 14 dní zdarma <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#calculator" className="px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>
              O kolik přicházíte? ↓
            </a>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Bez kreditní karty · Zrušení kdykoliv · Vaše data, vaše kontrola</p>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calculator" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">O kolik přicházíte kvůli prázdným časovým oknům?</h2>
            <p className="text-gray-500">Posuňte posuvníky a uvidíte svou potenciální měsíční ztrátu</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Časových oken za den</span><span className="font-bold text-gray-900">{calcSlots}</span></div>
                <input type="range" min={1} max={20} value={calcSlots} onChange={e => setCalcSlots(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Délka časového okna</span><span className="font-bold text-gray-900">{calcDuration} min</span></div>
                <input type="range" min={15} max={180} step={15} value={calcDuration} onChange={e => setCalcDuration(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Průměrná cena služby</span><span className="font-bold text-gray-900">{calcPrice} Kč</span></div>
                <input type="range" min={200} max={5000} step={100} value={calcPrice} onChange={e => setCalcPrice(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">No-show / storno rate</span><span className="font-bold text-gray-900">{calcNoshow}%</span></div>
                <input type="range" min={0} max={40} value={calcNoshow} onChange={e => setCalcNoshow(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Oken za den:</span> <strong>{calcSlots}× {calcDuration} min</strong></div>
                <div><span className="text-gray-500">Pracovní den:</span> <strong>{calcSlots * calcDuration} min ({Math.round(calcSlots * calcDuration / 60 * 10) / 10} hod)</strong></div>
                <div><span className="text-gray-500">Potenciální denní tržba:</span> <strong>{(calcSlots * calcPrice).toLocaleString('cs-CZ')} Kč</strong></div>
                <div><span className="text-gray-500">Ztracených oken/den:</span> <strong className="text-red-600">{Math.round(calcSlots * calcNoshow / 100 * 10) / 10}</strong></div>
              </div>
            </div>
            <div className="mt-6 p-6 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #fef2f2, #fff7ed)' }}>
              <p className="text-sm text-gray-500 mb-1">Potenciálně přicházíte o</p>
              <p className="text-4xl font-bold text-red-600 mb-1">{lostRevenue.toLocaleString('cs-CZ')} Kč / měsíc</p>
              <p className="text-sm text-gray-400">To je {(lostRevenue * 12).toLocaleString('cs-CZ')} Kč za rok</p>
            </div>
            <div className="mt-4 p-4 bg-emerald-50 rounded-xl text-center border border-emerald-200">
              <p className="text-sm text-emerald-700"><strong>Zálohy + připomínky + smart rebooking</strong> pomáhají snížit storna. Clientoro vám dá nástroje — výsledky závisí na vašem podnikání.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Vše co potřebujete pro provoz i růst</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Čtyři propojené pilíře. Jedna platforma. Žádné přepínání mezi nástroji.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-md`}><f.icon className="w-6 h-6 text-white" /></div>
                  <h3 className="text-xl font-bold text-gray-900">{f.title}</h3>
                </div>
                <div className="space-y-2">
                  {f.items.map(item => (<div key={item} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span className="text-gray-600">{item}</span></div>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="py-20" style={{ background: 'linear-gradient(180deg, #0a1628, #0c2d48, #0a1e30)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}><Brain className="w-4 h-4" /> Co konkurence nemá</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">AI, které opravdu pracuje za vás</h2>
          <p className="text-lg mb-12" style={{ color: 'rgba(255,255,255,0.5)' }}>Žádný gimmick. Reálné nástroje, které šetří čas a pomáhají růst. Každá funkce má přepínač ZAP/VYP — vždy máte kontrolu.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🧠', title: 'AI Business Coach', desc: 'Praktické tipy na základě VAŠICH dat. Ne obecné rady.' },
              { icon: '📅', title: 'Smart Slot Filler', desc: 'Zrušená rezervace? Volitelně upozorní zájemce. (Rozhodujete vy!)' },
              { icon: '🔄', title: 'Reaktivace klientů', desc: 'Navrhne oslovit klienty, kteří dlouho nebyli.' },
              { icon: '📊', title: 'Přehledy tržeb', desc: 'Pochopte své nejlepší dny, služby a členy týmu.' },
              { icon: '⭐', title: 'Review Booster', desc: 'Volitelně požádá spokojené klienty o Google recenzi.' },
              { icon: '🔮', title: 'Smart Rebooking', desc: '"Zarezervovat příští návštěvu?" — hned po schůzce.' },
            ].map(ai => (
              <div key={ai.title} className="rounded-xl p-5 text-left" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-2xl">{ai.icon}</span>
                <h3 className="text-white font-bold mt-2 mb-1">{ai.title}</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{ai.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-sm" style={{ color: '#f59e0b' }}><Shield className="w-4 h-4 inline mr-1" /><strong>Vaše kontrola, vždy.</strong> Každou AI funkci můžete zapnout nebo vypnout. Nic se neděje bez vašeho souhlasu. Žádný spam. Žádné nechtěné zprávy.</p>
          </div>
        </div>
      </section>

      {/* DEPOSITS + CASH BONUS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Zálohy a hotovostní bonus</h2>
            <p className="text-gray-500">Dva chytré nástroje, které spolupracují. Snižte storna A ušetřete na poplatcích.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md mb-4"><CreditCard className="w-6 h-6 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Zálohy (volitelné)</h3>
              <p className="text-gray-500 text-sm mb-4">Klient zaplatí malou zálohu online. Dorazí. Vy si udržíte tržby.</p>
              <div className="space-y-2 text-sm">
                {['Vyberte u kterých služeb chcete zálohu', 'Nastavte vlastní procento', 'Výjimka pro VIP / stálé klienty', 'Storno podmínky — rozhodujete vy', 'Možnost jen pro nové klienty'].map(f => (
                  <div key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span className="text-gray-600">{f}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-md mb-4"><Banknote className="w-6 h-6 text-white" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hotovostní bonus 🇨🇿</h3>
              <p className="text-gray-500 text-sm mb-4">Odměňte klienty, kteří platí hotově. Ušetřete na poplatcích. Podpořte českou korunu.</p>
              <div className="space-y-2 text-sm">
                {['Bonusová sleva nebo věrnostní body za hotovost', 'Ušetříte 2-3% poplatků za bránu', 'Klient se cítí odměněný', 'Podpora české koruny v oběhu', 'Plně volitelné — rozhodujete vy'].map(f => (
                  <div key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span className="text-gray-600">{f}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEGMENTS */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Vytvořeno pro poskytovatele služeb</h2>
            <p className="text-gray-500">Lidé, kteří pracují s lidmi. To je náš svět.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SEGMENTS.map(s => {
              const Icon = SEGMENT_ICONS[s.icon]
              return (
                <div key={s.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-amber-200 transition-all text-center group">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                    <Icon className="w-6 h-6" style={{ color: '#f59e0b' }} />
                  </div>
                  <h3 className="font-bold text-gray-900">{s.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* GUIDE */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Připraveni za 5 minut</h2>
            <p className="text-gray-500">Průvodce krok za krokem přímo v aplikaci. Žádné technické znalosti.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Vytvořte účet', desc: '30 sekund, bez karty' },
              { step: '2', title: 'Přidejte služby', desc: 'Název, cena, délka' },
              { step: '3', title: 'Sdílejte booking link', desc: 'Klienti rezervují online' },
              { step: '4', title: 'Sledujte růst', desc: 'AI vám pomůže zlepšovat' },
            ].map(s => (
              <div key={s.step} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{s.step}</div>
                <h3 className="font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Férový ceník. Žádné skryté poplatky.</h2>
            <p className="text-gray-500">Žádné procento z vašich tržeb. Žádná překvapení. Co vidíte, to platíte.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING.map(p => (
              <div key={p.name} className={`rounded-2xl border-2 p-5 relative ${p.color} ${p.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">Nejoblíbenější</div>}
                <div className="text-2xl mb-1">{p.icon}</div>
                <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{p.desc}</p>
                <div className="space-y-1 mb-4">
                  <div className="text-sm"><span className="text-gray-500">Bez AI:</span> <strong>{p.price} Kč/měs</strong></div>
                  <div className="text-sm"><span className="text-gray-500">S AI:</span> <strong>{p.priceAi} Kč/měs</strong></div>
                </div>
                {p.trial && <div className="bg-green-50 rounded-lg px-2 py-1 mb-3 border border-green-200"><p className="text-xs text-green-700 font-medium">🎁 14 dní zdarma — plný přístup</p></div>}
                <div className="space-y-1.5">
                  {p.features.map(f => (<div key={f} className="flex items-start gap-1.5 text-xs"><Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600">{f}</span></div>))}
                </div>
                <a href="/register" className="block mt-4 py-2.5 text-center rounded-xl font-semibold text-sm transition-all" style={p.popular ? { background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)', color: 'white' } : { background: '#f3f4f6', color: '#374151' }}>Začít zdarma</a>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center"><p className="text-sm text-gray-400">💡 Použijte vlastní OpenAI API klíč u Inspire plánů a ušetřete až 700 Kč/měsíc</p></div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-900 mb-3">Často kladené otázky</h2></div>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-semibold text-gray-900 pr-4">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-gray-600 -mt-2">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #0a1628, #0c2d48, #0a1e30)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Vaši klienti jsou <span style={{ color: '#f59e0b' }}>zlato</span>.<br />Začněte s nimi tak i zacházet.</h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>14 dní zdarma. Bez kreditní karty. Žádné skryté poplatky. Jen férové nástroje, které vám pomáhají růst.</p>
          <a href="/register" className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Vytvořit účet zdarma <ArrowRight className="w-5 h-5" /></a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><Waves className="w-5 h-5" style={{ color: '#f59e0b' }} /><span className="text-white font-bold">Clientoro</span></div>
              <p className="text-sm max-w-xs">AI-powered Booking & Growth OS pro poskytovatele služeb. Postaveno s poctivostí a péčí.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="text-white font-semibold mb-3">Produkt</h4>
                <div className="space-y-2"><a href="#features" className="block hover:text-white">Funkce</a><a href="#pricing" className="block hover:text-white">Ceník</a><a href="#faq" className="block hover:text-white">FAQ</a></div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Společnost</h4>
                <div className="space-y-2"><a href="#" className="block hover:text-white">O nás</a><a href="#" className="block hover:text-white">Kontakt</a><a href="#" className="block hover:text-white">Ochrana soukromí</a></div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">© 2026 Clientoro. Všechna práva vyhrazena. 🏆 Vaši klienti jsou zlato.</div>
        </div>
      </footer>
    </div>
  )
}
