'use client'

import { useState } from 'react'
import { Waves, Calendar, Users, Brain, TrendingUp, ChevronDown, Shield, Zap, Check, ArrowRight, CreditCard, Banknote, Scissors, Sparkles, Gem, HeartPulse, Dumbbell, BrainCircuit, PawPrint, GraduationCap, MessageSquare } from 'lucide-react'

const SEGMENT_ICONS: Record<string, any> = {
  scissors: Scissors, sparkles: Sparkles, gem: Gem, heartPulse: HeartPulse,
  dumbbell: Dumbbell, brainCircuit: BrainCircuit, messageSquare: MessageSquare,
  pawPrint: PawPrint, graduationCap: GraduationCap,
}

const SEGMENTS = [
  { icon: 'scissors', title: 'Kadernicky & barber', desc: 'Strihy, barveni, meliry, foukana' },
  { icon: 'sparkles', title: 'Masaze & wellness', desc: 'Klasicke, sportovni, relaxacni masaze' },
  { icon: 'gem', title: 'Kosmetika & estetika', desc: 'Osetreni pleti, nehty, permanentni make-up' },
  { icon: 'heartPulse', title: 'Fyzioterapie & zdravi', desc: 'Rehabilitace, terapie, logopedie' },
  { icon: 'dumbbell', title: 'Fitness & vyziva', desc: 'Osobni treninky, vyzivove poradenstvi' },
  { icon: 'brainCircuit', title: 'Psychologie & koucink', desc: 'Terapie, koucink, mentoring' },
  { icon: 'messageSquare', title: 'Tetovani & piercing', desc: 'Navrhy, tetovani, piercing' },
  { icon: 'pawPrint', title: 'Pece o zvirata', desc: 'Grooming, trenink, hlidani' },
  { icon: 'graduationCap', title: 'Vzdelavani & lekce', desc: 'Doucovani, jazyky, hudba, workshopy' },
]

const FEATURES = [
  { icon: Calendar, color: 'from-blue-500 to-cyan-400', title: 'Chytry kalendar', items: ['Online rezervace 24/7', 'Denni / tydenni / mesicni zobrazeni', 'Zalohy a predplatby (volitelne)', 'Automaticke pripominky', 'Sledovani nedorazivsi (no-show)'] },
  { icon: Users, color: 'from-emerald-500 to-teal-400', title: 'CRM klientu', items: ['Karty klientu s kompletni historii', 'Razeni a filtry (A-Z, utrata, navstevy)', 'Stitky a segmenty', 'Export CSV / JSON / PDF', 'Narozeninove prani a nabidky'] },
  { icon: Brain, color: 'from-amber-500 to-yellow-400', title: 'AI asistent', items: ['AI insighty a doporuceni', 'Detekce mrtvych hodin', 'Navrhy na reaktivaci klientu', 'Prehledy trzeb', 'Vse ZAP/VYP - rozhodujete vy'] },
  { icon: TrendingUp, color: 'from-rose-500 to-pink-400', title: 'Nastroje pro rust', items: ['Referral program', 'Vernostni body a odmeny', 'Slevove kody a vouchery', 'QR kody s trackingem', 'Darkove poukazy'] },
]

const PRICING = [
  { name: 'OSVC', icon: '\u{1F7E2}', color: 'border-teal-300 bg-teal-50', price: '49', priceAi: '99', desc: 'Pro podnikatele (1 osoba)', features: ['Kalendar + rezervacni link', 'Az 50 rezervaci/mesic', 'CRM klientu (az 100)', 'Zakladni reporty', 'Narozeninove SMS (volitelne)', 'Platba jen hotove'], trial: true },
  { name: 'FIRMA', icon: '\u{1F535}', color: 'border-blue-300 bg-blue-50', price: '299', priceAi: '499', desc: 'Majitel + max 4 zamestnanci', features: ['Vse z OSVC (neomezene)', 'Sprava tymu + kalendar smen', 'Reporty per zamestnanec', 'Online platby a zalohy', 'Klientsky mini-portal', 'Az 3 pobocky'], trial: false, popular: true },
  { name: 'SOLO INSPIRE', icon: '\u{1F3D6}', color: 'border-amber-300 bg-amber-50', price: '499', priceAi: '799', desc: 'OSVC + AI a nastroje pro rust', features: ['Vse z OSVC (neomezene)', 'AI insighty a doporuceni', 'Kampane (5/mesic)', 'Referral + vernostni program', 'Smart rebooking', 'Darkove poukazy'], trial: false },
  { name: 'PRO INSPIRE', icon: '\u{1F3D6}\u{2728}', color: 'border-yellow-400 bg-yellow-50', price: '1 299', priceAi: '1 999', desc: 'Majitel + max 24 zamestnancu', features: ['Vse z FIRMA + SOLO INSPIRE', 'AI Copilot (pokrocily)', 'AI Smart Slot Filler', 'Neomezene kampane', 'Neomezene pobocky'], trial: false },
]

const FAQ = [
  { q: 'Je Clientoro opravdu zdarma k vyzkouseni?', a: 'Ano! 14 dni plny pristup, bez kreditni karty. Po trialu muzete pokracovat s free planem (20 rezervaci/mesic) nebo si vybrat placeny plan.' },
  { q: 'Cim se Clientoro lisi od Reservia nebo Reenia?', a: 'Clientoro neni jen rezervacni system. Obsahuje AI insighty, nastroje pro rust, referral programy a prehledy trzeb. Pomahame vam ZISKAVAT nove klienty.' },
  { q: 'Mohu exportovat data pro ucetni?', a: 'Ano! Export klientu, rezervaci a trzeb v CSV, JSON nebo PDF formatu.' },
  { q: 'Musim mit platebni branu?', a: 'Ne! Muzete fungovat ciste na hotovosti. Online platby pres Stripe Connect jsou volitelne.' },
  { q: 'Mohu vypnout AI funkce?', a: 'Rozhodne! Kazda AI funkce ma prepinac ZAP/VYP. Nic se nedeje bez vaseho souhlasu.' },
  { q: 'Jsou moje data v bezpeci?', a: 'Ano. Pouzivame Supabase (PostgreSQL) s row-level security a GDPR-kompatibilnim zpracovanim dat.' },
  { q: 'Potrebuji technicke znalosti?', a: 'Vubec ne. Nas pruvodce krok za krokem vas provede nastavenim za 5 minut.' },
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
            <a href="#pricing" className="hover:text-gray-900">Cenik</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Prihlasit se</a>
            <a href="/register" className="px-4 py-2 text-sm text-white rounded-lg font-semibold shadow-md" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>Zacit zdarma</a>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0c2d48 20%, #0e4d64 40%, #0f6b7a 55%, #0e5460 70%, #0c3a50 85%, #0a1e30 100%)' }}>
        <div className="absolute top-16 right-16 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}><Zap className="w-4 h-4" /> Pro lidi, co pracuji s lidmi</div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">Plny kalendar.<br />Spokojeni klienti.<br /><span style={{ color: '#f59e0b' }}>Vy mate prehled.</span></h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>Rezervace, CRM a nastroje pro rust - vse na jednom miste. Ferovy cenik, zadne skryte poplatky.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <a href="/register" className="px-8 py-4 text-white rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Vyzkouset 14 dni zdarma <ArrowRight className="w-5 h-5" /></a>
            <a href="#features" className="px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>Co vam prineseme?</a>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Bez kreditni karty - Zruseni kdykoliv - Vase data, vase kontrola</p>
        </div>
      </section>

      <section id="segments" className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Vytvoreno pro poskytovatele sluzeb</h2>
            <p className="text-gray-500">Pracujete s lidmi? Pak je Clientoro pro vas.</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Vse co potrebujete na jednom miste</h2>
            <p className="text-gray-500">Zadne prepinani mezi aplikacemi. Zadne ztracene informace.</p>
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}><Brain className="w-4 h-4" /> AI, ktere pracuje za vas</div>
          <h2 className="text-3xl font-bold text-white mb-4">Chytrejsi rozhodovani bez namahy</h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>AI analyzuje vase data a navrhuje konkretni kroky. Zadny chatbot - realne insighty.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[{ title: 'Detekce mrtvych hodin', desc: 'AI najde hodiny kdy nemate klienty a navrhne jak je zaplnit' },
              { title: 'Reaktivace klientu', desc: 'AI identifikuje klienty kteri se dlouho neobjednali' },
              { title: 'Prehledy trzeb', desc: 'AI ukaze trendy, nejlepsi sluzby a doporuci kde rust' }
            ].map(a => (<div key={a.title} className="rounded-xl p-5 text-left" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}><h3 className="font-bold text-white mb-2">{a.title}</h3><p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{a.desc}</p></div>))}
          </div>
          <p className="text-sm mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}><Shield className="w-4 h-4 inline mr-1" /> Vsechny AI funkce maji prepinac ZAP/VYP. Rozhodujete vy.</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Pripraveni za 5 minut</h2>
            <p className="text-gray-500">Zadne technicke znalosti. Pruvodce vas provede krok za krokem.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ step: '1', title: 'Vytvorte ucet', desc: '30 sekund, bez karty' },{ step: '2', title: 'Vyberte obor', desc: 'Sluzby se predvyplni' },{ step: '3', title: 'Sdilejte link', desc: 'Klienti rezervuji online' },{ step: '4', title: 'Sledujte rust', desc: 'AI vam pomuze zlepsovat' }].map(s => (
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">O kolik mesicne prichazite?</h2>
            <p className="text-gray-500">Posunete posuvniky a uvidite kolik vas stoji nedorazivsi klienti (no-show).</p>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-5">
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Klientu denne</span><span className="font-bold">{calcSlots}</span></div><input type="range" min={1} max={20} value={calcSlots} onChange={e => setCalcSlots(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Prumerna cena sluzby</span><span className="font-bold">{calcPrice} Kc</span></div><input type="range" min={200} max={5000} step={100} value={calcPrice} onChange={e => setCalcPrice(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Mira nedorazivsi (no-show)</span><span className="font-bold">{calcNoshow}%</span></div><input type="range" min={0} max={40} value={calcNoshow} onChange={e => setCalcNoshow(Number(e.target.value))} className="w-full accent-amber-500" /></div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center">
              <p className="text-sm text-red-600 mb-1">Mesicne prichazite o</p>
              <p className="text-3xl font-bold text-red-700">{lostRevenue.toLocaleString('cs-CZ')} Kc</p>
              <p className="text-xs text-red-400 mt-1">S Clientoro muzete tuto ztratu snizit az o 70 %</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4"><CreditCard className="w-5 h-5 text-blue-600" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Zalohy a predplatby</h3>
            <p className="text-sm text-gray-500 mb-4">Snizte nedorazivsi (no-show) o 60-80 %. Klient zaplati zalohu pri rezervaci.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Nastavite % zalohy per sluzba</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> VIP klienti mohou byt osvobozeni</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Volitelne - zapnete jen pokud chcete</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4"><Banknote className="w-5 h-5 text-green-600" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hotovostni bonus</h3>
            <p className="text-sm text-gray-500 mb-4">Nabidnete klientum bonus za platbu hotove. Usetrite na poplatcich za platebni branu.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Sleva nebo vernostni body za hotovost</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Platebni brana neni povinna</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Fungujete i ciste na hotovosti</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ferovy cenik bez prekvapeni</h2>
            <p className="text-gray-500">Zacnete zdarma. Platte jen za to co vyuzivate.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {PRICING.map(p => (
              <div key={p.name} className={`rounded-2xl border-2 p-5 relative ${p.color} ${p.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">Nejoblibenejsi</div>}
                <div className="text-center mb-4"><span className="text-2xl">{p.icon}</span><h3 className="text-lg font-bold text-gray-900 mt-1">{p.name}</h3><p className="text-xs text-gray-500">{p.desc}</p></div>
                <div className="text-center mb-4"><span className="text-3xl font-bold text-gray-900">{p.price}</span><span className="text-sm text-gray-500"> Kc/mes</span><p className="text-xs text-gray-400">S AI: {p.priceAi} Kc/mes</p></div>
                <ul className="space-y-1.5 mb-4">{p.features.map(f => (<li key={f} className="flex items-start gap-1.5 text-xs text-gray-600"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{f}</li>))}</ul>
                {p.trial && <div className="bg-emerald-100 rounded-lg p-2 text-center text-xs text-emerald-700 font-medium mb-3">14 dni zdarma</div>}
                <a href="/register" className="block w-full py-2.5 text-center text-white rounded-xl font-medium text-sm shadow-md" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>Zacit zdarma</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Caste otazky</h2>
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
          <h2 className="text-3xl font-bold text-white mb-4">Pripraveni na plny kalendar?</h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>14 dni zdarma. Bez kreditni karty. Nastaveni za 5 minut.</p>
          <a href="/register" className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-xl font-bold text-lg shadow-xl" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Zacit zdarma <ArrowRight className="w-5 h-5" /></a>
        </div>
      </section>

      <footer className="py-12 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}><Waves className="w-4 h-4 text-white" /></div>
          <span className="text-lg font-bold text-white">Clientoro</span>
        </div>
        <p className="text-sm text-gray-500">2026 Clientoro. Vsechna prava vyhrazena.</p>
        <div className="flex justify-center gap-6 mt-4 text-xs text-gray-600">
          <a href="#" className="hover:text-gray-400">Ochrana osobnich udaju</a>
          <a href="#" className="hover:text-gray-400">Obchodni podminky</a>
          <a href="#" className="hover:text-gray-400">Kontakt</a>
        </div>
      </footer>
    </div>
  )
}
