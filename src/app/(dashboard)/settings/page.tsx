﻿// PATH: src/app/(dashboard)/settings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useLang } from '../layout'

interface OrgSettings {
  id: string; name: string; mode: string; address: string; phone: string
  email: string; website: string; work_start: number; work_end: number
  slot_duration: number; booking_link: string; timezone: string
}

const EMPTY: OrgSettings = {
  id: '', name: '', mode: 'solo', address: '', phone: '', email: '',
  website: '', work_start: 8, work_end: 18, slot_duration: 30,
  booking_link: '', timezone: 'Europe/Prague',
}

export default function SettingsPage() {
  const [s, setS] = useState<OrgSettings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { t, lang, modeGradient } = useLang()

  const l = {
    title: t('set_title'),
    subtitle: lang === 'en' ? 'Basic settings of your organization' : lang === 'sk' ? 'Základné nastavenia vašej organizácie' : 'Základní nastavení vaší organizace',
    save: t('set_save'),
    saving: lang === 'en' ? 'Saving...' : lang === 'sk' ? 'Ukladám...' : 'Ukládám...',
    saved: lang === 'en' ? '✅ Saved!' : lang === 'sk' ? '✅ Uložené!' : '✅ Uloženo!',
    basicInfo: lang === 'en' ? 'Basic information' : lang === 'sk' ? 'Základné informácie' : 'Základní informace',
    companyName: lang === 'en' ? 'Company / salon name' : lang === 'sk' ? 'Názov firmy / salónu' : 'Název firmy / salonu',
    address: lang === 'en' ? 'Address' : 'Adresa',
    contact: lang === 'en' ? 'Contact details' : lang === 'sk' ? 'Kontaktné údaje' : 'Kontaktní údaje',
    phone: lang === 'en' ? 'Phone' : lang === 'sk' ? 'Telefón' : 'Telefon',
    email: 'Email',
    web: 'Web',
    workingHours: lang === 'en' ? 'Working hours & calendar' : lang === 'sk' ? 'Pracovná doba a kalendár' : 'Pracovní doba a kalendář',
    start: lang === 'en' ? 'Start' : lang === 'sk' ? 'Začiatok' : 'Začátek',
    end: lang === 'en' ? 'End' : 'Konec',
    slotDuration: lang === 'en' ? 'Slot duration' : lang === 'sk' ? 'Dĺžka slotu' : 'Délka termínu',
    minutes: lang === 'en' ? 'minutes' : 'minut',
    bookingPage: lang === 'en' ? 'Booking page' : 'Booking stránka',
    copy: lang === 'en' ? 'Copy' : lang === 'sk' ? 'Kopírovať' : 'Kopírovat',
    copied: lang === 'en' ? 'Link copied!' : lang === 'sk' ? 'Link skopírovaný!' : 'Link zkopírován!',
    yourPlan: lang === 'en' ? 'Your plan' : lang === 'sk' ? 'Váš plán' : 'Váš plán',
    comparePlans: lang === 'en' ? 'Compare plans. Click "Preview" to try.' : lang === 'sk' ? 'Porovnajte plány. Kliknite na "Náhľad" pre preview.' : 'Porovnejte plány. Klikněte na "Náhled" pro preview.',
    active: lang === 'en' ? '✅ Active' : lang === 'sk' ? '✅ Aktívny' : '✅ Aktivní',
    preview: lang === 'en' ? '👁 Preview' : lang === 'sk' ? '👁 Náhľad' : '👁 Náhled',
    upgrade: lang === 'en' ? '⬆ Upgrade to' : lang === 'sk' ? '⬆ Upgrade na' : '⬆ Upgrade na',
    showFeatures: (n: number) => lang === 'en' ? `Show all features (${n})` : lang === 'sk' ? `Zobraziť všetky funkcie (${n})` : `Zobrazit všechny funkce (${n})`,
    perMonth: lang === 'en' ? '/mo' : '/měs',
    yearly: lang === 'en' ? 'yearly' : lang === 'sk' ? 'ročne' : 'roční',
    save_amount: lang === 'en' ? 'save' : lang === 'sk' ? 'ušetríte' : 'ušetříte',
    loading: lang === 'en' ? 'Loading settings...' : lang === 'sk' ? 'Načítavam nastavenia...' : 'Načítám nastavení...',
    error: lang === 'en' ? 'Error:' : 'Chyba:',
    tipText: lang === 'en' ? '💡 1 new client per month = the plan pays for itself 5×. Clientoro helps you get new clients, retain existing ones and increase revenue.' : lang === 'sk' ? '💡 1 nový klient mesačne = plán sa zaplatí 5×. Clientoro vám pomôže získať nových klientov, udržať existujúcich a zvýšiť tržby.' : '💡 1 nový klient měsíčně = plán se zaplatí 5×. Clientoro vám pomůže získat nové klienty, udržet stávající a zvýšit tržby.',
    trial: lang === 'en' ? '14 days free — full access, no card' : lang === 'sk' ? '14 dní zadarmo — plný prístup, bez karty' : '14 dní zdarma — plný přístup, bez karty',
    freeAfter: lang === 'en' ? 'After trial: 20 bookings/mo, 50 clients free' : lang === 'sk' ? 'Po triale: 20 rez/mes, 50 klientov zadarmo' : 'Po trialu: 20 rez/měs, 50 klientů zdarma',
    namePlaceholder: lang === 'en' ? 'e.g. Beauty Salon' : lang === 'sk' ? 'Napr. Salón Krása' : 'Např. Salon Krása',
  }

  const MODE_CARDS = [
    {
      mode: 'solo', label: '🟢 OSVČ',
      desc: lang === 'en' ? 'For solo entrepreneurs (1 person)' : lang === 'sk' ? 'Pre podnikateľov (1 osoba)' : 'Pro podnikatele (1 osoba)',
      color: 'from-teal-500 to-cyan-400', border: 'border-teal-300', bg: 'bg-teal-50',
      features: lang === 'en'
        ? ['Calendar + booking link', 'Bookings (max 50/mo)', 'Clients CRM (max 100)', 'Services + basic reports', 'Birthday + No-show SMS (30/mo)', 'Passes (max 3 types)', 'Service bundles (max 2)', 'Discounts + Happy Hours (max 1)', 'First visit + birthday discount', 'Online booking discount', '"Verified profile" badge', 'Data export (GDPR)', 'UTM tracking']
        : lang === 'sk'
        ? ['Kalendár + booking link', 'Rezervácie (max 50/mes)', 'Klienti CRM (max 100)', 'Služby + basic reporty', 'Narodeniny + No-show SMS (30/mes)', 'Permanentky (max 3 typy)', 'Balíčky služieb (max 2)', 'Zľavy + Happy Hours (max 1)', 'First visit + narodeninová zľava', 'Online booking zľava', 'Odznak "Overený profil"', 'Export dát (GDPR)', 'UTM tracking']
        : ['Kalendář + booking link', 'Rezervace (max 50/měs)', 'Klienti CRM (max 100)', 'Služby + basic reporty', 'Narozeniny + No-show SMS (30/měs)', 'Permanentky (max 3 typy)', 'Balíčky služeb (max 2)', 'Slevy + Happy Hours (max 1)', 'First visit + narozeninová sleva', 'Online booking sleva', 'Odznak "Ověřený profil"', 'Export dat (GDPR)', 'UTM tracking'],
      tiers: [
        { label: lang === 'en' ? 'Without AI' : 'Bez AI', price: '49', year: '39', rec: false },
        { label: lang === 'en' ? 'With AI insights' : lang === 'sk' ? 'S AI insighty' : 'S AI insighty', price: '99', year: '79', rec: true },
      ],
      trial: l.trial, free: l.freeAfter, up: 'solo_inspire',
    },
    {
      mode: 'team', label: '🔵 FIRMA',
      desc: lang === 'en' ? 'For businesses (owner + up to 4 staff)' : lang === 'sk' ? 'Pre firmy (majiteľ + max 4 zamestnanci)' : 'Pro firmy (majitel + max 4 zaměstnanci)',
      color: 'from-blue-600 to-sky-400', border: 'border-blue-300', bg: 'bg-blue-50',
      features: lang === 'en'
        ? ['Everything from Solo (unlimited)', '+ Team management + staff calendar', '+ Shifts and notifications', '+ Reports per staff', '+ Weekly email report', '+ Client mini-portal', '+ GA4 / Sklik / FB Pixel', '+ Google Calendar sync', '+ Time-based passes', '+ Unlimited passes + bundles', '+ Seasonal + combo discounts', '+ Recurring bookings', '+ Online payments / deposits', '+ Pre-visit forms', '+ Multiple locations (max 3)']
        : lang === 'sk'
        ? ['Všetko z OSVČ (neobmedzené)', '+ Správa tímu + staff kalendár', '+ Smeny a notifikácie', '+ Reporty per staff', '+ Týždenný email report', '+ Klientský mini-portál', '+ GA4 / Sklik / FB Pixel', '+ Google Calendar sync', '+ Permanentky na čas', '+ Neobmedzené permanentky + balíčky', '+ Sezónne + combo zľavy', '+ Opakované rezervácie', '+ Online platby / depozity', '+ Formuláre pred návštevou', '+ Viac pobočiek (max 3)']
        : ['Vše z OSVČ (neomezené)', '+ Správa týmu + staff kalendář', '+ Směny a notifikace', '+ Reporty per staff', '+ Týdenní email report', '+ Klientský mini-portál', '+ GA4 / Sklik / FB Pixel', '+ Google Calendar sync', '+ Permanentky na čas', '+ Neomezené permanentky + balíčky', '+ Sezónní + combo slevy', '+ Opakované rezervace', '+ Online platby / depozity', '+ Formuláře před návštěvou', '+ Více poboček (max 3)'],
      tiers: [
        { label: lang === 'en' ? 'Without AI' : 'Bez AI', price: '299', year: '239', rec: false },
        { label: lang === 'en' ? 'With AI insights' : lang === 'sk' ? 'S AI insighty' : 'S AI insighty', price: '499', year: '399', rec: true },
      ],
      trial: null, free: null, up: 'pro_inspire',
    },
    {
      mode: 'solo_inspire', label: '🏖️ Solo Inspire',
      desc: lang === 'en' ? 'Solo + AI & growth tools (1 person)' : lang === 'sk' ? 'OSVČ + AI a growth nástroje (1 osoba)' : 'OSVČ + AI a growth nástroje (1 osoba)',
      color: 'from-amber-500 to-yellow-400', border: 'border-amber-300', bg: 'bg-amber-50',
      features: lang === 'en'
        ? ['Everything from Solo (unlimited)', '+ Smart AI assistant (unlimited)', '+ AI Business Coach', '+ AI monitors booking trends', '+ AI dead hours detection', '+ AI non-returning clients detection', '+ Campaigns (5/mo)', '+ Google reviews booster', '+ QR codes with tracking', '+ Smart rebooking', '+ Growth reports', '+ Waitlist', '+ Discount codes + loyalty program', '+ Referral program', '+ Rebooking + last minute + review discounts', '+ Subscription / membership', '+ Booking page branding', '+ Gift vouchers']
        : lang === 'sk'
        ? ['Všetko z OSVČ (neobmedzené)', '+ Smart AI asistent (neobmedzené)', '+ AI Business Coach', '+ AI hlída pokles/nárast rezervácií', '+ AI detekcia mŕtvych hodín', '+ AI detekcia nevracajúcich sa klientov', '+ Kampane (5/mes)', '+ Google recenzie booster', '+ QR kódy s tracking', '+ Smart rebooking', '+ Growth reporty', '+ Waitlist (čakacia listina)', '+ Zľavové kódy + vernostný program', '+ Referral program + priveď kamaráta', '+ Rebooking + last minute + recenzie zľavy', '+ Predplatné / membership', '+ Brandovanie booking stránky', '+ Darčekové poukazy']
        : ['Vše z OSVČ (neomezené)', '+ Smart AI asistent (neomezené)', '+ AI Business Coach', '+ AI hlídá pokles/nárůst rezervací', '+ AI detekce mrtvých hodin', '+ AI detekce nevracejících se klientů', '+ Kampaně (5/měs)', '+ Google recenze booster', '+ QR kódy s tracking', '+ Smart rebooking', '+ Growth reporty', '+ Waitlist (čekací listina)', '+ Slevové kódy + věrnostní program', '+ Referral program + přiveď kamaráda', '+ Rebooking + last minute + recenze slevy', '+ Předplatné / membership', '+ Brandování booking stránky', '+ Dárkové poukazy'],
      tiers: [
        { label: lang === 'en' ? 'With our AI' : 'S naším AI', price: '799', year: '639', rec: false },
        { label: lang === 'en' ? 'With your own API key' : lang === 'sk' ? 'S vlastným API kľúčom' : 'S vlastním API klíčem', price: '499', year: '399', rec: true, save: '300' },
      ],
      trial: null, free: null, up: 'pro_inspire',
    },
    {
      mode: 'pro_inspire', label: '🏖️✨ Pro Inspire',
      desc: lang === 'en' ? 'Business + AI & growth — max (owner + up to 24 staff)' : lang === 'sk' ? 'Firma + AI a growth — maximum (majiteľ + max 24 zamestnancov)' : 'Firma + AI a growth — maximum (majitel + max 24 zaměstnanců)',
      color: 'from-amber-600 to-yellow-300', border: 'border-yellow-400', bg: 'bg-yellow-50',
      features: lang === 'en'
        ? ['Everything from Team + Solo Inspire', '+ AI Copilot (advanced)', '+ AI Smart Slot Filler', '+ AI Revenue insights', '+ AI weekly report with recommendations', '+ AI reactivation campaigns', '+ AI pass + discount recommendations', '+ Churn prevention AI', '+ Staff leaderboard', '+ JSON-LD SEO (free slots on Google)', '+ Missed call capture', '+ Unlimited campaigns', '+ Marketplace / directory', '+ Unlimited locations']
        : lang === 'sk'
        ? ['Všetko z Firmy + Solo Inspire', '+ AI Copilot (pokročilý)', '+ AI Smart Slot Filler', '+ AI Revenue insighty', '+ AI týždenný report s odporúčaniami', '+ AI reaktivačné kampane', '+ AI odporúčania permanentiek + zliav', '+ Churn prevention AI', '+ Staff leaderboard', '+ JSON-LD SEO (voľné sloty na Googli)', '+ Missed call capture', '+ Neobmedzené kampane', '+ Marketplace / directory', '+ Neobmedzené pobočky']
        : ['Vše z Firmy + Solo Inspire', '+ AI Copilot (pokročilý)', '+ AI Smart Slot Filler', '+ AI Revenue insighty', '+ AI týdenní report s doporučeními', '+ AI reaktivační kampaně', '+ AI doporučení permanentek + slev', '+ Churn prevention AI', '+ Staff leaderboard', '+ JSON-LD SEO (volné sloty na Googlu)', '+ Missed call capture', '+ Neomezené kampaně', '+ Marketplace / directory', '+ Neomezené pobočky'],
      tiers: [
        { label: lang === 'en' ? 'With our AI' : 'S naším AI', price: '1 999', year: '1 599', rec: false },
        { label: lang === 'en' ? 'With your own API key' : lang === 'sk' ? 'S vlastným API kľúčom' : 'S vlastním API klíčem', price: '1 299', year: '1 039', rec: true, save: '700' },
      ],
      trial: null, free: null, up: null,
    },
  ]

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
    else { const e = await r.json(); alert(`${l.error} ${e.error || 'Unknown'}`) }
    setSaving(false)
  }

  const preview = async (mode: string) => {
    await fetch('/api/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    })
    window.location.reload()
  }

  if (loading) return <div className="text-center py-12 text-gray-400">{l.loading}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{l.title}</h1>
          <p className="mt-1 text-gray-500">{l.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600 font-medium">{l.saved}</span>}
          <button onClick={save} disabled={saving}
            style={{ background: modeGradient }} className="px-4 py-2 text-white rounded-lg hover:brightness-110 font-medium text-sm disabled:opacity-50">
            {saving ? l.saving : l.save}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{l.basicInfo}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.companyName}</label>
              <input type="text" value={s.name} onChange={e => setS({ ...s, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder={l.namePlaceholder} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.address}</label>
              <input type="text" value={s.address} onChange={e => setS({ ...s, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ulice 123, Praha 1" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{l.contact}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.phone}</label>
              <input type="tel" value={s.phone} onChange={e => setS({ ...s, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="+420 777 123 456" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.email}</label>
              <input type="email" value={s.email} onChange={e => setS({ ...s, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="info@salon.cz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.web}</label>
              <input type="url" value={s.website} onChange={e => setS({ ...s, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://www.salon.cz" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{l.workingHours}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.start}</label>
              <select value={s.work_start} onChange={e => setS({ ...s, work_start: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {Array.from({ length: 14 }, (_, i) => i + 5).map(h => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.end}</label>
              <select value={s.work_end} onChange={e => setS({ ...s, work_end: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {Array.from({ length: 14 }, (_, i) => i + 10).map(h => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.slotDuration}</label>
              <select value={s.slot_duration} onChange={e => setS({ ...s, slot_duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value={15}>15 {l.minutes}</option>
                <option value={30}>30 {l.minutes}</option>
                <option value={60}>60 {l.minutes}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{l.bookingPage}</h2>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3">
              <span className="text-gray-400 text-sm">clientoro.pro/book/</span>
              <input type="text" value={s.booking_link}
                onChange={e => setS({ ...s, booking_link: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="flex-1 bg-transparent py-2 px-1 focus:outline-none text-sm" placeholder="salon-krasa" />
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`clientoro.pro/book/${s.booking_link}`); alert(l.copied) }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">{l.copy}</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{l.yourPlan}</h2>
          <p className="text-sm text-gray-500 mb-6">{l.comparePlans}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MODE_CARDS.map(c => {
              const cur = s.mode === c.mode
              const isUp = c.mode === MODE_CARDS.find(x => x.mode === s.mode)?.up
              return (
                <div key={c.mode} className={`rounded-xl border-2 p-5 relative overflow-hidden transition-all ${cur ? c.border + ' ' + c.bg : 'border-gray-200 hover:border-gray-300'}`}>
                  {cur && <div className="absolute top-3 right-3 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">{l.active}</div>}
                  <div className={`w-full h-2 rounded-full bg-gradient-to-r ${c.color} mb-4`} />
                  <h3 className="text-lg font-bold text-gray-900">{c.label}</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">{c.desc}</p>
                  {c.trial && (
                    <div className="bg-green-50 rounded-lg px-3 py-2 mb-3 border border-green-200">
                      <p className="text-xs text-green-700 font-medium">🎁 {c.trial}</p>
                    </div>
                  )}
                  <div className="space-y-2 mb-4">
                    {c.tiers.map((tier, i) => (
                      <div key={i} className={`rounded-lg p-3 ${tier.rec ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-sm font-medium ${tier.rec ? 'text-amber-700' : 'text-gray-600'}`}>
                              {tier.rec ? '⭐ ' : ''}{tier.label}
                            </span>
                            {(tier as any).save && <span className="ml-2 text-xs text-amber-600">({l.save_amount} {(tier as any).save} Kč{l.perMonth})</span>}
                          </div>
                          <span className={`text-lg font-bold ${tier.rec ? 'text-amber-800' : 'text-gray-900'}`}>{tier.price} Kč{l.perMonth}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">📅 {tier.year} Kč{l.perMonth} ({l.yearly})</p>
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
                      {l.showFeatures(c.features.length)}
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
                        {l.preview}
                      </button>
                    )}
                    {isUp && (
                      <button className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-lg text-sm font-bold hover:from-amber-600 hover:to-yellow-500 shadow-sm">
                        {l.upgrade} {c.label}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">{l.tipText}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


