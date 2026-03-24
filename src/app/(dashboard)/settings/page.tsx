﻿// PATH: src/app/(dashboard)/settings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/LangContext'
import { useToast } from '@/components/Toast'
import { Bell, Mail, Check } from 'lucide-react'

interface OrgSettings {
  id: string; name: string; mode: string; address: string; phone: string
  email: string; website: string; work_start: number; work_end: number
  slot_duration: number; booking_link: string; timezone: string
  notification_email: string; notify_on_booking: boolean; notify_on_cancel: boolean
}

const EMPTY: OrgSettings = {
  id: '', name: '', mode: 'solo', address: '', phone: '', email: '',
  website: '', work_start: 8, work_end: 18, slot_duration: 30,
  booking_link: '', timezone: 'Europe/Prague',
  notification_email: '', notify_on_booking: true, notify_on_cancel: true,
}

export default function SettingsPage() {
  const [s, setS] = useState<OrgSettings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteFlow, setShowDeleteFlow] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [backupDone, setBackupDone] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [testingSend, setTestingSend] = useState(false)
  const { t, lang, modeGradient } = useLang()
  const toast = useToast()

  const l = {
    title: t('set_title'),
    subtitle: lang === 'en' ? 'Basic settings of your organization' : lang === 'sk' ? 'Zakladne nastavenia vasej organizacie' : 'Zakladni nastaveni vasi organizace',
    save: t('set_save'),
    saving: lang === 'en' ? 'Saving...' : lang === 'sk' ? 'Ukladam...' : 'Ukladam...',
    saved: lang === 'en' ? 'Saved!' : lang === 'sk' ? 'Ulozene!' : 'Ulozeno!',
    basicInfo: lang === 'en' ? 'Basic information' : lang === 'sk' ? 'Zakladne informacie' : 'Zakladni informace',
    companyName: lang === 'en' ? 'Company / salon name' : lang === 'sk' ? 'Nazov firmy / salonu' : 'Nazev firmy / salonu',
    address: lang === 'en' ? 'Address' : 'Adresa',
    contact: lang === 'en' ? 'Contact details' : lang === 'sk' ? 'Kontaktne udaje' : 'Kontaktni udaje',
    phone: lang === 'en' ? 'Phone' : lang === 'sk' ? 'Telefon' : 'Telefon',
    email: 'Email',
    web: 'Web',
    notifications: lang === 'en' ? 'Email notifications' : lang === 'sk' ? 'Emailove notifikacie' : 'Emailove notifikace',
    notifDesc: lang === 'en' ? 'Set up email address for receiving notifications about new bookings and cancellations.' : lang === 'sk' ? 'Nastavte emailovu adresu pre prijimanie notifikacii o novych rezervaciach a zruseniach.' : 'Nastavte emailovou adresu pro prijimani notifikaci o novych rezervacich a zrusenich.',
    notifEmail: lang === 'en' ? 'Notification email' : lang === 'sk' ? 'Notifikacny email' : 'Notifikacni email',
    notifEmailPlaceholder: lang === 'en' ? 'owner@salon.cz (where to send notifications)' : lang === 'sk' ? 'majitel@salon.sk (kam posielat notifikacie)' : 'majitel@salon.cz (kam posilat notifikace)',
    notifOnBooking: lang === 'en' ? 'New booking notification' : lang === 'sk' ? 'Notifikacia o novej rezervacii' : 'Notifikace o nove rezervaci',
    notifOnCancel: lang === 'en' ? 'Cancellation notification' : lang === 'sk' ? 'Notifikacia o zruseni' : 'Notifikace o zruseni',
    notifOnBookingDesc: lang === 'en' ? 'Receive email when a client books' : lang === 'sk' ? 'Dostat email ked si klient zarezervuje' : 'Dostat email kdyz si klient zarezervuje',
    notifOnCancelDesc: lang === 'en' ? 'Receive email when a booking is cancelled' : lang === 'sk' ? 'Dostat email ked sa rezervacia zrusi' : 'Dostat email kdyz se rezervace zrusi',
    notifNotSet: lang === 'en' ? 'Set notification email to enable email alerts' : lang === 'sk' ? 'Nastavte notifikacny email pre aktivaciu upozorneni' : 'Nastavte notifikacni email pro aktivaci upozorneni',
    testEmail: lang === 'en' ? 'Send test email' : lang === 'sk' ? 'Poslat testovaci email' : 'Poslat testovaci email',
    testSent: lang === 'en' ? 'Test email sent!' : lang === 'sk' ? 'Testovaci email odoslany!' : 'Testovaci email odeslan!',
    workingHours: lang === 'en' ? 'Working hours & calendar' : lang === 'sk' ? 'Pracovna doba a kalendar' : 'Pracovni doba a kalendar',
    start: lang === 'en' ? 'Start' : lang === 'sk' ? 'Zaciatok' : 'Zacatek',
    end: lang === 'en' ? 'End' : 'Konec',
    slotDuration: lang === 'en' ? 'Slot duration' : lang === 'sk' ? 'Dlzka slotu' : 'Delka terminu',
    minutes: lang === 'en' ? 'minutes' : 'minut',
    bookingPage: lang === 'en' ? 'Booking page' : 'Booking stranka',
    copy: lang === 'en' ? 'Copy' : lang === 'sk' ? 'Kopirovat' : 'Kopirovat',
    copied: lang === 'en' ? 'Link copied!' : lang === 'sk' ? 'Link skopirovany!' : 'Link zkopirovan!',
    yourPlan: lang === 'en' ? 'Your plan' : lang === 'sk' ? 'Vas plan' : 'Vas plan',
    comparePlans: lang === 'en' ? 'Compare plans. Click "Preview" to try.' : lang === 'sk' ? 'Porovnajte plany. Kliknite na "Nahlad" pre preview.' : 'Porovnejte plany. Kliknete na "Nahled" pro preview.',
    active: lang === 'en' ? 'Active' : lang === 'sk' ? 'Aktivny' : 'Aktivni',
    preview: lang === 'en' ? 'Preview' : lang === 'sk' ? 'Nahlad' : 'Nahled',
    upgrade: lang === 'en' ? 'Upgrade to' : lang === 'sk' ? 'Upgrade na' : 'Upgrade na',
    showFeatures: (n: number) => lang === 'en' ? `Show all features (${n})` : lang === 'sk' ? `Zobrazit vsetky funkcie (${n})` : `Zobrazit vsechny funkce (${n})`,
    perMonth: lang === 'en' ? '/mo' : '/mes',
    yearly: lang === 'en' ? 'yearly' : lang === 'sk' ? 'rocne' : 'rocni',
    save_amount: lang === 'en' ? 'save' : lang === 'sk' ? 'usetrite' : 'usetrite',
    loading: lang === 'en' ? 'Loading settings...' : lang === 'sk' ? 'Nacitavam nastavenia...' : 'Nacitam nastaveni...',
    error: lang === 'en' ? 'Error:' : 'Chyba:',
    trial: lang === 'en' ? '14 days free - full access, no card' : lang === 'sk' ? '14 dni zadarmo - plny pristup, bez karty' : '14 dni zdarma - plny pristup, bez karty',
    freeAfter: lang === 'en' ? 'After trial: 20 bookings/mo, 50 clients free' : lang === 'sk' ? 'Po triale: 20 rez/mes, 50 klientov zadarmo' : 'Po trialu: 20 rez/mes, 50 klientu zdarma',
    namePlaceholder: lang === 'en' ? 'e.g. Beauty Salon' : lang === 'sk' ? 'Napr. Salon Krasa' : 'Napr. Salon Krasa',
    dangerZone: lang === 'en' ? 'Danger zone' : lang === 'sk' ? 'Nebezpecna zona' : 'Nebezpecna zona',
    dangerDesc: lang === 'en' ? 'Permanently delete your account and ALL data (bookings, clients, services, settings). This action is IRREVERSIBLE. Before deletion, you can download a backup.' : lang === 'sk' ? 'Trvalo smazat vas ucet a VSETKY data (rezervacie, klienti, sluzby, nastavenia). Tato akcia je NEVRATNA. Pred smazanim si mozete stiahnut zalohu.' : 'Trvale smazat vas ucet a VSECHNA data (rezervace, klienti, sluzby, nastaveni). Tato akce je NEVRATNA. Pred smazanim si muzete stahnout zalohu.',
    deleteBtn: lang === 'en' ? 'Delete account and all data' : lang === 'sk' ? 'Smazat ucet a vsetky data' : 'Smazat ucet a vsechna data',
    backupTitle: lang === 'en' ? '1. Data backup' : lang === 'sk' ? '1. Zalohovanie dat' : '1. Zalohovani dat',
    backupDesc: lang === 'en' ? 'Before deletion, you can download all your data.' : lang === 'sk' ? 'Pred smazanim si mozete stiahnut vsetky data.' : 'Pred smazanim si muzete stahnout vsechna data.',
    backupBtn: lang === 'en' ? 'Download backup (CSV)' : lang === 'sk' ? 'Stiahnut zalohu (CSV)' : 'Stahnout zalohu (CSV)',
    backupDoneLabel: lang === 'en' ? 'Backup downloaded' : lang === 'sk' ? 'Zaloha stiahnutna' : 'Zaloha stazena',
    confirmTitle: lang === 'en' ? '2. Confirm deletion' : lang === 'sk' ? '2. Potvrdenie smazania' : '2. Potvrzeni smazani',
    confirmDesc: lang === 'en' ? 'To confirm, type the name of your organization:' : lang === 'sk' ? 'Pre potvrdenie napiste nazov vasej organizacie:' : 'Pro potvrzeni napiste nazev vasi organizace:',
    confirmPlaceholder: lang === 'en' ? 'Type organization name here' : lang === 'sk' ? 'Sem napiste nazov organizacie' : 'Zde napiste nazev organizace',
    confirmYes: lang === 'en' ? 'Yes, permanently delete everything' : lang === 'sk' ? 'Ano, trvalo smazat vsetko' : 'Ano, trvale smazat vse',
    confirmNo: lang === 'en' ? 'No, cancel' : lang === 'sk' ? 'Nie, zrusit' : 'Ne, zrusit',
    confirmNote: lang === 'en' ? 'Your account will be deleted within 24 hours.' : lang === 'sk' ? 'Vas ucet bude smazany do 24 hodin.' : 'Vas ucet bude smazan do 24 hodin.',
    deleteSuccess: lang === 'en' ? 'Deletion requested.' : lang === 'sk' ? 'Ziadost o smazanie odoslana.' : 'Zadost o smazani odeslana.',
    deleteError: lang === 'en' ? 'Error requesting deletion.' : lang === 'sk' ? 'Chyba pri ziadosti o smazanie.' : 'Chyba pri zadosti o smazani.',
  }

  const MODE_CARDS = [
    {
      mode: 'solo', label: '🟢 OSVC',
      desc: lang === 'en' ? 'For solo entrepreneurs (1 person)' : lang === 'sk' ? 'Pre podnikatelov (1 osoba)' : 'Pro podnikatele (1 osoba)',
      color: 'from-teal-500 to-cyan-400', border: 'border-teal-300', bg: 'bg-teal-50',
      features: lang === 'en'
        ? ['Calendar + booking link', 'Bookings (max 50/mo)', 'Clients CRM (max 100)', 'Services + basic reports', 'Birthday + No-show SMS (30/mo)', 'Passes (max 3 types)', 'Service bundles (max 2)', 'Discounts + Happy Hours (max 1)', 'First visit + birthday discount', 'Online booking discount', '"Verified profile" badge', 'Data export (GDPR)', 'UTM tracking']
        : lang === 'sk'
        ? ['Kalendar + booking link', 'Rezervacie (max 50/mes)', 'Klienti CRM (max 100)', 'Sluzby + basic reporty', 'Narodeniny + No-show SMS (30/mes)', 'Permanentky (max 3 typy)', 'Balicky sluzieb (max 2)', 'Zlavy + Happy Hours (max 1)', 'First visit + narodeniova zlava', 'Online booking zlava', 'Odznak "Overeny profil"', 'Export dat (GDPR)', 'UTM tracking']
        : ['Kalendar + booking link', 'Rezervace (max 50/mes)', 'Klienti CRM (max 100)', 'Sluzby + basic reporty', 'Narozeniny + No-show SMS (30/mes)', 'Permanentky (max 3 typy)', 'Balicky sluzeb (max 2)', 'Slevy + Happy Hours (max 1)', 'First visit + narozeninova sleva', 'Online booking sleva', 'Odznak "Overeny profil"', 'Export dat (GDPR)', 'UTM tracking'],
      tiers: [
        { label: lang === 'en' ? 'Without AI' : 'Bez AI', price: '49', year: '39', rec: false },
        { label: lang === 'en' ? 'With AI statistics' : lang === 'sk' ? 'S AI statistikami' : 'S AI statistikami', price: '99', year: '79', rec: true },
      ],
      trial: l.trial, free: l.freeAfter, up: 'solo_inspire',
    },
    {
      mode: 'team', label: '🔵 FIRMA',
      desc: lang === 'en' ? 'For businesses (owner + up to 4 staff)' : lang === 'sk' ? 'Pre firmy (majitel + max 4 zamestnanci)' : 'Pro firmy (majitel + max 4 zamestnanci)',
      color: 'from-blue-600 to-sky-400', border: 'border-blue-300', bg: 'bg-blue-50',
      features: lang === 'en'
        ? ['Everything from Solo (unlimited)', '+ Team management + staff calendar', '+ Shifts and notifications', '+ Reports per staff', '+ Weekly email report', '+ Client mini-portal', '+ GA4 / Sklik / FB Pixel', '+ Google Calendar sync', '+ Time-based passes', '+ Unlimited passes + bundles', '+ Seasonal + combo discounts', '+ Recurring bookings', '+ Online payments / deposits', '+ Pre-visit forms', '+ Multiple locations (max 3)']
        : lang === 'sk'
        ? ['Vsetko z OSVC (neobmedzene)', '+ Sprava timu + staff kalendar', '+ Smeny a notifikacie', '+ Reporty per staff', '+ Tyzdenny email report', '+ Klientsky mini-portal', '+ GA4 / Sklik / FB Pixel', '+ Google Calendar sync', '+ Permanentky na cas', '+ Neobmedzene permanentky + balicky', '+ Sezonne + combo zlavy', '+ Opakovane rezervacie', '+ Online platby / depozity', '+ Formulare pred navstevou', '+ Viac pobociek (max 3)']
        : ['Vse z OSVC (neomezene)', '+ Sprava tymu + staff kalendar', '+ Smeny a notifikace', '+ Reporty per staff', '+ Tydenni email report', '+ Klientsky mini-portal', '+ GA4 / Sklik / FB Pixel', '+ Google Calendar sync', '+ Permanentky na cas', '+ Neomezene permanentky + balicky', '+ Sezonni + combo slevy', '+ Opakovane rezervace', '+ Online platby / depozity', '+ Formulare pred navstevou', '+ Vice pobocek (max 3)'],
      tiers: [
        { label: lang === 'en' ? 'Without AI' : 'Bez AI', price: '299', year: '239', rec: false },
        { label: lang === 'en' ? 'With AI statistics' : lang === 'sk' ? 'S AI statistikami' : 'S AI statistikami', price: '499', year: '399', rec: true },
      ],
      trial: null, free: null, up: 'pro_inspire',
    },
    {
      mode: 'solo_inspire', label: '🏖️ Solo Inspire',
      desc: lang === 'en' ? 'Solo + AI & growth tools (1 person)' : lang === 'sk' ? 'OSVC + AI a growth nastroje (1 osoba)' : 'OSVC + AI a growth nastroje (1 osoba)',
      color: 'from-amber-500 to-yellow-400', border: 'border-amber-300', bg: 'bg-amber-50',
      features: lang === 'en'
        ? ['Everything from Solo (unlimited)', '+ Smart AI assistant (unlimited)', '+ AI Business Coach', '+ AI monitors booking trends', '+ AI dead hours detection', '+ AI non-returning clients detection', '+ Campaigns (5/mo)', '+ Google reviews booster', '+ QR codes with tracking', '+ Smart rebooking', '+ Growth reports', '+ Waitlist', '+ Discount codes + loyalty program', '+ Referral program', '+ Rebooking + last minute + review discounts', '+ Subscription / membership', '+ Booking page branding', '+ Gift vouchers']
        : lang === 'sk'
        ? ['Vsetko z OSVC (neobmedzene)', '+ Smart AI asistent (neobmedzene)', '+ AI Business Coach', '+ AI hlida pokles/narast rezervacii', '+ AI detekcia mrtvych hodin', '+ AI detekcia nevracajucich sa klientov', '+ Kampane (5/mes)', '+ Google recenzie booster', '+ QR kody s tracking', '+ Smart rebooking', '+ Growth reporty', '+ Waitlist (cakacia listina)', '+ Zlavove kody + vernostny program', '+ Referral program + prived kamarata', '+ Rebooking + last minute + recenzie zlavy', '+ Predplatne / membership', '+ Brandovanie booking stranky', '+ Darckove poukazy']
        : ['Vse z OSVC (neomezene)', '+ Smart AI asistent (neomezene)', '+ AI Business Coach', '+ AI hlida pokles/narust rezervaci', '+ AI detekce mrtvych hodin', '+ AI detekce nevracejicich se klientu', '+ Kampane (5/mes)', '+ Google recenze booster', '+ QR kody s tracking', '+ Smart rebooking', '+ Growth reporty', '+ Waitlist (cekaci listina)', '+ Slevove kody + vernostni program', '+ Referral program + prived kamarada', '+ Rebooking + last minute + recenze slevy', '+ Predplatne / membership', '+ Brandovani booking stranky', '+ Darkove poukazy'],
      tiers: [
        { label: lang === 'en' ? 'With our AI' : 'S nasim AI', price: '799', year: '639', rec: false },
        { label: lang === 'en' ? 'With your own API key' : lang === 'sk' ? 'S vlastnym API klucom' : 'S vlastnim API klicem', price: '499', year: '399', rec: true, save: '300' },
      ],
      trial: null, free: null, up: 'pro_inspire',
    },
    {
      mode: 'pro_inspire', label: '🏖️✨ Pro Inspire',
      desc: lang === 'en' ? 'Business + AI & growth - max (owner + up to 24 staff)' : lang === 'sk' ? 'Firma + AI a growth - maximum (majitel + max 24 zamestnancov)' : 'Firma + AI a growth - maximum (majitel + max 24 zamestnancu)',
      color: 'from-amber-600 to-yellow-300', border: 'border-yellow-400', bg: 'bg-yellow-50',
      features: lang === 'en'
        ? ['Everything from Team + Solo Inspire', '+ AI Copilot (advanced)', '+ AI Smart Slot Filler', '+ AI Revenue insights', '+ AI weekly report with recommendations', '+ AI reactivation campaigns', '+ AI pass + discount recommendations', '+ Churn prevention AI', '+ Staff leaderboard', '+ JSON-LD SEO (free slots on Google)', '+ Missed call capture', '+ Unlimited campaigns', '+ Marketplace / directory', '+ Unlimited locations']
        : lang === 'sk'
        ? ['Vsetko z Firmy + Solo Inspire', '+ AI Copilot (pokrocily)', '+ AI Smart Slot Filler', '+ AI Revenue insighty', '+ AI tyzdenny report s odporucaniami', '+ AI reaktivacne kampane', '+ AI odporucania permanentiek + zliav', '+ Churn prevention AI', '+ Staff leaderboard', '+ JSON-LD SEO (volne sloty na Googli)', '+ Missed call capture', '+ Neobmedzene kampane', '+ Marketplace / directory', '+ Neobmedzene pobocky']
        : ['Vse z Firmy + Solo Inspire', '+ AI Copilot (pokrocily)', '+ AI Smart Slot Filler', '+ AI Revenue insighty', '+ AI tydenni report s doporucenimi', '+ AI reaktivacni kampane', '+ AI doporuceni permanentek + slev', '+ Churn prevention AI', '+ Staff leaderboard', '+ JSON-LD SEO (volne sloty na Googlu)', '+ Missed call capture', '+ Neomezene kampane', '+ Marketplace / directory', '+ Neomezene pobocky'],
      tiers: [
        { label: lang === 'en' ? 'With our AI' : 'S nasim AI', price: '1 999', year: '1 599', rec: false },
        { label: lang === 'en' ? 'With your own API key' : lang === 'sk' ? 'S vlastnym API klucom' : 'S vlastnim API klicem', price: '1 299', year: '1 039', rec: true, save: '700' },
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
    if (r.ok) {
      setSaved(true); toast.success(l.saved); setTimeout(() => setSaved(false), 3000)
    } else {
      const e = await r.json(); toast.error(`${l.error} ${e.error || 'Unknown'}`)
    }
    setSaving(false)
  }

  const preview = async (mode: string) => {
    await fetch('/api/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    })
    window.location.reload()
  }

  const sendTestEmail = async () => {
    if (!s.notification_email) return
    setTestingSend(true)
    try {
      const r = await fetch('/api/bookings/webhook', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', organization_id: s.id }),
      })
      const data = await r.json()
      if (data.success) toast.success(l.testSent + ' → ' + (data.sent_to || s.notification_email))
      else toast.error('Email test failed: ' + (data.error || 'Unknown'))
    } catch { toast.error('Email test failed') }
    finally { setTestingSend(false) }
  }

  const handleDelete = async () => {
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/settings/delete-account', { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast.success(l.deleteSuccess)
        setTimeout(() => { window.location.href = '/' }, 3000)
      } else {
        toast.error(data.error || l.deleteError)
      }
    } catch {
      toast.error(l.deleteError)
    } finally {
      setDeletingAccount(false)
    }
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
        {/* Zakladni informace */}
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

        {/* Kontakt */}
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

        {/* EMAIL NOTIFIKACE */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">{l.notifications}</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">{l.notifDesc}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.notifEmail}</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={s.notification_email || ''} onChange={e => setS({ ...s, notification_email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder={l.notifEmailPlaceholder} />
                </div>
                {s.notification_email && (
                  <button onClick={sendTestEmail} disabled={testingSend}
                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50 whitespace-nowrap">
                    {testingSend ? '...' : l.testEmail}
                  </button>
                )}
              </div>
            </div>

            {!s.notification_email && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <Bell className="w-4 h-4" /> {l.notifNotSet}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-start gap-3 flex-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <button onClick={() => setS({ ...s, notify_on_booking: !s.notify_on_booking })}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.notify_on_booking ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.notify_on_booking ? 'left-5' : 'left-1'}`} />
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-900">{l.notifOnBooking}</p>
                  <p className="text-xs text-gray-500">{l.notifOnBookingDesc}</p>
                </div>
              </label>

              <label className="flex items-start gap-3 flex-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <button onClick={() => setS({ ...s, notify_on_cancel: !s.notify_on_cancel })}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.notify_on_cancel ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.notify_on_cancel ? 'left-5' : 'left-1'}`} />
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-900">{l.notifOnCancel}</p>
                  <p className="text-xs text-gray-500">{l.notifOnCancelDesc}</p>
                </div>
              </label>
            </div>

            {s.notification_email && s.notify_on_booking && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <Check className="w-4 h-4" /> {lang === 'en' ? 'Notifications active' : lang === 'sk' ? 'Notifikacie aktivne' : 'Notifikace aktivni'} &rarr; {s.notification_email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pracovni doba */}
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
                <option value={45}>45 {l.minutes}</option>
                <option value={60}>60 {l.minutes}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Booking stranka */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{l.bookingPage}</h2>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3">
              <span className="text-gray-400 text-sm">clientoro.pro/book/</span>
              <input type="text" value={s.booking_link}
                onChange={e => setS({ ...s, booking_link: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="flex-1 bg-transparent py-2 px-1 focus:outline-none text-sm" placeholder="salon-krasa" />
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`clientoro.pro/book/${s.booking_link}`); toast.success(l.copied) }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">{l.copy}</button>
          </div>
        </div>

        {/* Plany */}
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
                            {(tier as any).save && <span className="ml-2 text-xs text-amber-600">({l.save_amount} {(tier as any).save} Kc{l.perMonth})</span>}
                          </div>
                          <span className={`text-lg font-bold ${tier.rec ? 'text-amber-800' : 'text-gray-900'}`}>{tier.price} Kc{l.perMonth}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{tier.year} Kc{l.perMonth} ({l.yearly})</p>
                      </div>
                    ))}
                  </div>
                  {c.free && (
                    <div className="bg-blue-50 rounded-lg px-3 py-2 mb-4 border border-blue-200">
                      <p className="text-xs text-blue-700">{c.free}</p>
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
        </div>

        {/* Nebezpecna zona */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ {l.dangerZone}</h3>
          <p className="text-sm text-red-600 mb-4">{l.dangerDesc}</p>

          {!showDeleteFlow ? (
            <button onClick={() => setShowDeleteFlow(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
              {l.deleteBtn}
            </button>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="bg-white rounded-lg border border-red-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{l.backupTitle}</h4>
                <p className="text-sm text-gray-600 mb-3">{l.backupDesc}</p>
                <button onClick={async () => {
                  const r = await fetch('/api/settings/export')
                  if (r.ok) {
                    const blob = await r.blob()
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = 'clientoro-backup.csv'; a.click()
                    setBackupDone(true); toast.success(l.backupDoneLabel)
                  }
                }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  {backupDone ? l.backupDoneLabel : l.backupBtn}
                </button>
              </div>

              <div className="bg-white rounded-lg border border-red-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{l.confirmTitle}</h4>
                <p className="text-sm text-gray-600 mb-3">{l.confirmDesc} <strong>{s.name}</strong></p>
                <input type="text" value={deleteConfirmName} onChange={e => setDeleteConfirmName(e.target.value)}
                  placeholder={l.confirmPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3" />
                <div className="flex gap-3">
                  <button disabled={deleteConfirmName !== s.name || deletingAccount} onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
                    {deletingAccount ? '...' : l.confirmYes}
                  </button>
                  <button onClick={() => { setShowDeleteFlow(false); setDeleteConfirmName(''); setBackupDone(false) }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                    {l.confirmNo}
                  </button>
                </div>
                {deleteConfirmName === s.name && <p className="text-xs text-red-500 mt-2">{l.confirmNote}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
