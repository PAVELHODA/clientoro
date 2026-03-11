'use client'

import { useEffect, useState } from 'react'

interface OrgSettings {
  id: string
  name: string
  mode: string
  address: string
  phone: string
  email: string
  website: string
  work_start: number
  work_end: number
  slot_duration: number
  booking_link: string
  timezone: string
}

const EMPTY: OrgSettings = {
  id: '', name: '', mode: 'solo', address: '', phone: '', email: '',
  website: '', work_start: 8, work_end: 18, slot_duration: 30,
  booking_link: '', timezone: 'Europe/Prague',
}

const MODE_CARDS = [
  {
    mode: 'solo',
    label: '🟢 OSVČ Start',
    desc: 'Pro podnikatele, kteří pracují sami',
    color: 'from-teal-500 to-cyan-400',
    border: 'border-teal-300',
    bg: 'bg-teal-50',
    features: [
      'Kalendář + booking link',
      'Rezervace (max 50/měs)',
      'Klienti CRM (max 100)',
      'Služby + basic reporty',
      'Narozeniny + No-show SMS (30/měs)',
      'Permanentky (max 3 typy)',
      'Balíčky služeb (max 2 typy)',
      'Slevy + Happy Hours (max 1)',
      'First visit + narozeninová sleva',
      'Online booking sleva',
      'Odznak "Ověřený profil"',
      'Export dat (GDPR)',
      'UTM tracking',
    ],
    tiers: [
      { label: 'Bez AI', price: '49', year: '39', rec: false },
      { label: 'S naším AI (5 dotazů/den)', price: '99', year: '79', rec: true },
    ],
    trial: '14 dní zdarma — plný přístup, bez karty',
    free: 'Po trialu: 20 rez/měs, 50 klientů zdarma',
    up: 'solo_inspire',
  },
  {
    mode: 'team',
    label: '🔵 Firma Start',
    desc: 'Pro firmy se zaměstnanci',
    color: 'from-blue-600 to-sky-400',
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    features: [
      'Vše z OSVČ (neomezené)',
      '+ Správa týmu + staff kalendář',
      '+ Směny a notifikace',
      '+ Reporty per staff',
      '+ Týdenní email report',
      '+ Klientský mini-portál',
      '+ GA4 / Sklik / FB Pixel',
      '+ Google Calendar sync',
      '+ Permanentky na čas',
      '+ Neomezené permanentky + balíčky',
      '+ Sezónní + combo slevy',
      '+ Opakované rezervace',
      '+ Online platby / depozity',
      '+ Formuláře před návštěvou',
      '+ Více poboček (max 3)',
    ],
    tiers: [
      { label: 'Bez AI', price: '299', year: '239', rec: false },
      { label: 'S naším AI (10 dotazů/den)', price: '499', year: '399', rec: true },
    ],
    trial: null,
    free: null,
    up: 'pro_inspire',
  },
  {
    mode: 'solo_inspire',
    label: '🏖️ Solo Inspire',
    desc: 'OSVČ s AI a growth nástroji',
    color: 'from-amber-500 to-yellow-400',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    features: [
      'Vše z OSVČ (neomezené)',
      '+ Smart AI asistent (neomezené)',
      '+ AI Business Coach',
      '+ AI hlídá pokles/nárůst rezervací',
      '+ AI detekce mrtvých hodin',
      '+ AI detekce nevracejících se klientů',
      '+ Kampaně (5/měs)',
      '+ Google recenze booster',
      '+ QR kódy s tracking',
      '+ Smart rebooking',
      '+ Growth reporty',
      '+ Waitlist (čekací listina)',
      '+ Slevové kódy + věrnostní program',
      '+ Referral program + přiveď kamaráda',
      '+ Rebooking + last minute + recenze slevy',
      '+ Předplatné / membership',
      '+ Brandování booking stránky',
      '+ Dárkové poukazy',
    ],
    tiers: [
      { label: 'S naším AI', price: '799', year: '639', rec: false },
      { label: 'S vlastním API klíčem', price: '499', year: '399', rec: true, save: '300' },
    ],
    trial: null,
    free: null,
    up: 'pro_inspire',
  },
  {
    mode: 'pro_inspire',
    label: '🏖️✨ Pro Inspire',
    desc: 'Firma s AI a growth nástroji — maximum',
    color: 'from-amber-600 to-yellow-300',
    border: 'border-yellow-400',
    bg: 'bg-yellow-50',
    features: [
      'Vše z Firmy + Solo Inspire',
      '+ AI Copilot (pokročilý)',
      '+ AI Smart Slot Filler',
      '+ AI Revenue insighty',
      '+ AI týdenní report s doporučeními',
      '+ AI reaktivační kampaně',
      '+ AI doporučení permanentek + slev',
      '+ Churn prevention AI',
      '+ Staff leaderboard',
      '+ JSON-LD SEO (volné sloty na Googlu)',
      '+ Missed call capture',
      '+ Neomezené kampaně',
      '+ Marketplace / directory',
      '+ Neomezené pobočky',
    ],
    tiers: [
      { label: 'S naším AI', price: '1 999', year: '1 599', rec: false },
      { label: 'S vlastním API klíčem', price: '1 299', year: '1 039', rec: true, save: '700' },
    ],
    trial: null,
    free: null,
    up: null,
  },
]

export default function SettingsPage() {
  const [s, setS] = useState<OrgSettings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d && !d.error) setS({ ...EMPTY, ...d })
    }).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true); setSaved(false)
    const r = await fetch('/api/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    })
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else { const e = await r.json(); alert('Chyba: ' + (e.error || 'Neznama')) }
    setSaving(false)
  }

  const preview = async (mode: string) => {
    await fetch('/api/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    })
    window.location.reload()
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Nacitam nastaveni...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nastaveni</h1>
          <p className="mt-1 text-gray-500">Zakladni nastaveni vasi organizace</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600 font-medium">✅ Ulozeno!</span>}
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50">
            {saving ? 'Ukladam...' : 'Ulozit nastaveni'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Základní info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Zakladni informace</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nazev firmy / salonu</label>
              <input type="text" value={s.name} onChange={e => setS({ ...s, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Napr. Salon Krasa" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
              <input type="text" value={s.address} onChange={e => setS({ ...s, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ulice 123, Praha 1" />
            </div>
          </div>
        </div>

        {/* Kontakt */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontaktni udaje</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input type="tel" value={s.phone} onChange={e => setS({ ...s, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="+420 777 123 456" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={s.email} onChange={e => setS({ ...s, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="info@salon.cz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Web</label>
              <input type="url" value={s.website} onChange={e => setS({ ...s, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://www.salon.cz" />
            </div>
          </div>
        </div>

        {/* Pracovní doba */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pracovni doba a kalendar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zacatek</label>
              <select value={s.work_start} onChange={e => setS({ ...s, work_start: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {Array.from({ length: 14 }, (_, i) => i + 5).map(h => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konec</label>
              <select value={s.work_end} onChange={e => setS({ ...s, work_end: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {Array.from({ length: 14 }, (_, i) => i + 10).map(h => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delka slotu</label>
              <select value={s.slot_duration} onChange={e => setS({ ...s, slot_duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value={15}>15 minut</option>
                <option value={30}>30 minut</option>
                <option value={60}>60 minut</option>
              </select>
            </div>
          </div>
        </div>

        {/* Booking link */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking stranka</h2>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3">
              <span className="text-gray-400 text-sm">winwin.app/</span>
              <input type="text" value={s.booking_link}
                onChange={e => setS({ ...s, booking_link: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="flex-1 bg-transparent py-2 px-1 focus:outline-none text-sm" placeholder="salon-krasa" />
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`winwin.app/${s.booking_link}`); alert('Link zkopirovan!') }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Kopirovat</button>
          </div>
        </div>

        {/* PLÁNY */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Vas plan</h2>
          <p className="text-sm text-gray-500 mb-6">Porovnejte plany. Kliknete na "Nahled" pro preview.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MODE_CARDS.map(c => {
              const cur = s.mode === c.mode
              const isUp = c.mode === MODE_CARDS.find(x => x.mode === s.mode)?.up

              return (
                <div key={c.mode} className={`rounded-xl border-2 p-5 relative overflow-hidden transition-all ${
                  cur ? c.border + ' ' + c.bg : 'border-gray-200 hover:border-gray-300'}`}>

                  {cur && <div className="absolute top-3 right-3 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✅ Aktivni</div>}

                  <div className={`w-full h-2 rounded-full bg-gradient-to-r ${c.color} mb-4`} />
                  <h3 className="text-lg font-bold text-gray-900">{c.label}</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">{c.desc}</p>

                  {c.trial && (
                    <div className="bg-green-50 rounded-lg px-3 py-2 mb-3 border border-green-200">
                      <p className="text-xs text-green-700 font-medium">🎁 {c.trial}</p>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {c.tiers.map((t, i) => (
                      <div key={i} className={`rounded-lg p-3 ${t.rec ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-sm font-medium ${t.rec ? 'text-amber-700' : 'text-gray-600'}`}>
                              {t.rec ? '⭐ ' : ''}{t.label}
                            </span>
                            {(t as any).save && <span className="ml-2 text-xs text-amber-600">(ušetříte {(t as any).save} Kč/měs)</span>}
                          </div>
                          <span className={`text-lg font-bold ${t.rec ? 'text-amber-800' : 'text-gray-900'}`}>{t.price} Kč/měs</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">📅 {t.year} Kč/měs při roční platbě</p>
                      </div>
                    ))}
                  </div>

                  {c.free && (
                    <div className="bg-blue-50 rounded-lg px-3 py-2 mb-4 border border-blue-200">
                      <p className="text-xs text-blue-700">💡 {c.free}</p>
                    </div>
                  )}

                  <details className="mb-4">
                    <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 font-medium">
                      Zobrazit vsechny funkce ({c.features.length})
                    </summary>
                    <div className="mt-2 space-y-1">
                      {c.features.map(f => (
                        <div key={f} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                          <span className="text-gray-600">{f}</span>
                        </div>
                      ))}
                    </div>
                  </details>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {!cur && (
                      <button onClick={() => preview(c.mode)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                        👁 Nahled
                      </button>
                    )}
                    {isUp && (
                      <button className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-lg text-sm font-bold hover:from-amber-600 hover:to-yellow-500 shadow-sm">
                        ⬆ Upgrade na {c.label}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              💡 1 nový klient měsíčně = plán se zaplatí 5×. WIN-WIN vám pomůže získat nové klienty, udržet stávající a zvýšit tržby.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
