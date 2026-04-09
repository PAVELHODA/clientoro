﻿// PATH: src/app/(dashboard)/settings/page.tsx
'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useLang } from '@/lib/LangContext'
import { useToast } from '@/components/Toast'
import { Bell, Mail, Check, Lock, Eye, EyeOff } from 'lucide-react'
import SubscriptionSettings from '@/components/SubscriptionSettings'

interface OrgSettings {
  id: string; name: string; mode: string; address: string; phone: string
  email: string; website: string; work_start: number; work_end: number
  slot_duration: number; break_duration: number; break_start: string; booking_link: string; timezone: string
  notification_email: string; notify_on_booking: boolean; notify_on_cancel: boolean
  reminder_enabled: boolean; reminder_hours_before: number
  followup_enabled: boolean; review_request_enabled: boolean; google_review_url: string
  work_days: any[]
}

const DEFAULT_WORK_DAYS = [
  { day: 0, enabled: true, start: '06:00', end: '22:00' },
  { day: 1, enabled: true, start: '06:00', end: '22:00' },
  { day: 2, enabled: true, start: '06:00', end: '22:00' },
  { day: 3, enabled: true, start: '06:00', end: '22:00' },
  { day: 4, enabled: true, start: '06:00', end: '22:00' },
  { day: 5, enabled: false, start: '06:00', end: '22:00' },
  { day: 6, enabled: false, start: '06:00', end: '22:00' },
]

const EMPTY: OrgSettings = {
  id: '', name: '', mode: 'solo', address: '', phone: '', email: '',
  website: '', work_start: 8, work_end: 18, slot_duration: 30,
  booking_link: '', timezone: 'Europe/Prague',
  break_duration: 30, break_start: '12:00',
  notification_email: '', notify_on_booking: true, notify_on_cancel: true,
  reminder_enabled: true, reminder_hours_before: 24,
  followup_enabled: false, review_request_enabled: false, google_review_url: '',
  work_days: DEFAULT_WORK_DAYS,
}

export default function SettingsPage() {
  const [s, setS] = useState<OrgSettings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteFlow, setShowDeleteFlow] = useState(false)
  const [gcalConnected, setGcalConnected] = useState(false)
  const [gcalEmail, setGcalEmail] = useState('')
  const [gcalLoading, setGcalLoading] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [backupDone, setBackupDone] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [testingSend, setTestingSend] = useState(false)
  const { t, lang, modeGradient } = useLang()
  const supabase = createClient()
  const toast = useToast()

  const l = {
    title: t('set_title'),
    subtitle: lang === 'en' ? 'Basic settings of your organization' : lang === 'sk' ? 'Základné nastavenia vašej organizácie' : 'Základní nastavení vaší organizace',
    save: t('set_save'),
    saving: lang === 'en' ? 'Saving...' : lang === 'sk' ? 'Ukladám...' : 'Ukládám...',
    saved: lang === 'en' ? 'Saved!' : lang === 'sk' ? 'Uložené!' : 'Uloženo!',
    basicInfo: lang === 'en' ? 'Basic information' : lang === 'sk' ? 'Základné informácie' : 'Základní informace',
    companyName: lang === 'en' ? 'Company / salon name' : lang === 'sk' ? 'Názov firmy / salónu' : 'Název firmy / salonu',
    address: lang === 'en' ? 'Address' : 'Adresa',
    contact: lang === 'en' ? 'Contact details' : lang === 'sk' ? 'Kontaktné údaje' : 'Kontaktní údaje',
    phone: lang === 'en' ? 'Phone' : 'Telefon',
    email: 'Email',
    web: 'Web',
    notifications: lang === 'en' ? 'Email notifications' : lang === 'sk' ? 'Emailové notifikácie' : 'Emailové notifikace',
    notifDesc: lang === 'en' ? 'Set up email address for receiving notifications about new bookings and cancellations.' : lang === 'sk' ? 'Nastavte emailovú adresu pre prijímanie notifikácií o nových rezerváciách a zrušeniach.' : 'Nastavte emailovou adresu pro přijímání notifikací o nových rezervacích a zrušeních.',
    notifEmail: lang === 'en' ? 'Notification email' : lang === 'sk' ? 'Notifikačný email' : 'Notifikační email',
    notifEmailPlaceholder: lang === 'en' ? 'owner@salon.cz (where to send notifications)' : lang === 'sk' ? 'majitel@salon.sk (kam posielať notifikácie)' : 'majitel@salon.cz (kam posílat notifikace)',
    notifOnBooking: lang === 'en' ? 'New booking notification' : lang === 'sk' ? 'Notifikácia o novej rezervácii' : 'Notifikace o nové rezervaci',
    notifOnCancel: lang === 'en' ? 'Cancellation notification' : lang === 'sk' ? 'Notifikácia o zrušení' : 'Notifikace o zrušení',
    notifOnBookingDesc: lang === 'en' ? 'Receive email when a client books' : lang === 'sk' ? 'Dostať email keď si klient zarezervuje' : 'Dostat email když si klient zarezervuje',
    notifOnCancelDesc: lang === 'en' ? 'When a client cancels a booking' : lang === 'sk' ? 'Keď klient zruší rezerváciu' : 'Když klient zruší rezervaci',
    reminderTitle: lang === 'en' ? 'Automated emails to clients' : lang === 'sk' ? 'Automatické emaily klientom' : 'Automatické emaily klientům',
    reminderDesc: lang === 'en' ? 'Set up automatic emails that are sent to your clients.' : lang === 'sk' ? 'Nastavte automatické emaily, ktoré sa posielajú vašim klientom.' : 'Nastavte automatické emaily, které se posílají vašim klientům.',
    reminderToggle: lang === 'en' ? 'Reminder day before' : lang === 'sk' ? 'Pripomienka deň vopred' : 'Připomínka den předem',
    reminderToggleDesc: lang === 'en' ? 'Client receives an email reminder the day before the appointment' : lang === 'sk' ? 'Klient dostane emailovú pripomienku deň pred návštevou' : 'Klient dostane emailovou připomínku den před návštěvou',
    followupToggle: lang === 'en' ? 'Follow-up day after' : lang === 'sk' ? 'Follow-up deň po návšteve' : 'Follow-up den po návštěvě',
    followupToggleDesc: lang === 'en' ? 'Thank you email with rebooking option sent the day after the visit' : lang === 'sk' ? 'Ďakujeme email s možnosťou znovu rezervovať deň po návšteve' : 'Děkujeme email s možností znovu rezervovat den po návštěvě',
    weeklyToggle: lang === 'en' ? 'Weekly report' : lang === 'sk' ? 'Týždenný report' : 'Týdenní report',
    weeklyToggleDesc: lang === 'en' ? 'Summary of bookings, revenue and statistics every Monday' : lang === 'sk' ? 'Súhrn rezervácií, tržby a štatistiky každý pondelok' : 'Souhrn rezervací, tržby a statistiky každé pondělí',
    notifNotSet: lang === 'en' ? 'Set notification email to enable email alerts' : lang === 'sk' ? 'Nastavte notifikačný email pre aktiváciu upozornení' : 'Nastavte notifikační email pro aktivaci upozornění',
    testEmail: lang === 'en' ? 'Send test email' : lang === 'sk' ? 'Poslať testovací email' : 'Poslat testovací email',
    testSent: lang === 'en' ? 'Test email sent!' : lang === 'sk' ? 'Testovací email odoslaný!' : 'Testovací email odeslán!',
    workingHours: lang === 'en' ? 'Working hours & calendar' : lang === 'sk' ? 'Pracovná doba a kalendár' : 'Pracovní doba a kalendář',
    breakDuration: lang === 'en' ? 'Break duration' : lang === 'sk' ? 'Dĺžka prestávky' : 'Délka pauzy',
    breakStart: lang === 'en' ? 'Break start' : lang === 'sk' ? 'Začiatok prestávky' : 'Začátek pauzy',
    noBreak: lang === 'en' ? 'No break' : lang === 'sk' ? 'Žiadna' : 'Žádná',
    slotDuration: lang === 'en' ? 'Slot duration' : lang === 'sk' ? 'Dĺžka slotu' : 'Délka termínu',
    minutes: lang === 'en' ? 'minutes' : 'minut',
    bookingPage: lang === 'en' ? 'Booking page' : 'Booking stránka',
    copy: lang === 'en' ? 'Copy' : lang === 'sk' ? 'Kopírovať' : 'Kopírovat',
    copied: lang === 'en' ? 'Link copied!' : lang === 'sk' ? 'Link skopírovaný!' : 'Link zkopírován!',
    yourPlan: lang === 'en' ? 'Your plan' : lang === 'sk' ? 'Váš plán' : 'Váš plán',
    comparePlans: lang === 'en' ? 'Compare plans. Click "Preview" to try.' : lang === 'sk' ? 'Porovnajte plány. Kliknite na "Náhľad" pre preview.' : 'Porovnejte plány. Klikněte na "Náhled" pro preview.',
    active: lang === 'en' ? 'Active' : lang === 'sk' ? 'Aktívny' : 'Aktivní',
    preview: lang === 'en' ? 'Preview' : lang === 'sk' ? 'Náhľad' : 'Náhled',
    upgrade: lang === 'en' ? 'Upgrade to' : 'Upgrade na',
    showFeatures: (n: number) => lang === 'en' ? `Show all features (${n})` : lang === 'sk' ? `Zobraziť všetky funkcie (${n})` : `Zobrazit všechny funkce (${n})`,
    perMonth: lang === 'en' ? '/mo' : '/měs',
    yearly: lang === 'en' ? 'yearly' : lang === 'sk' ? 'ročne' : 'roční',
    save_amount: lang === 'en' ? 'save' : lang === 'sk' ? 'ušetríte' : 'ušetříte',
    loading: lang === 'en' ? 'Loading settings...' : lang === 'sk' ? 'Načítavam nastavenia...' : 'Načítám nastavení...',
    error: lang === 'en' ? 'Error:' : 'Chyba:',
    trial: lang === 'en' ? '14 days free - full access, no card' : lang === 'sk' ? '14 dní zadarmo - plný prístup, bez karty' : '14 dní zdarma - plný přístup, bez karty',
    freeAfter: lang === 'en' ? 'After trial: 20 bookings/mo, 50 clients free' : lang === 'sk' ? 'Po triale: 20 rez/mes, 50 klientov zadarmo' : 'Po trialu: 20 rez/měs, 50 klientů zdarma',
    namePlaceholder: lang === 'en' ? 'e.g. Beauty Salon' : lang === 'sk' ? 'Napr. Salón Krása' : 'Např. Salon Krása',
    gcalTitle: lang === 'en' ? 'Google Calendar' : lang === 'sk' ? 'Google Kalendár' : 'Google Kalendář',
    gcalDesc: lang === 'en' ? 'Connect your Google Calendar to automatically sync bookings. New reservations will appear in your calendar.' : lang === 'sk' ? 'Prepojte Google Kalendár pre automatickú synchronizáciu rezervácií. Nové rezervácie sa automaticky zobrazia vo vašom kalendári.' : 'Propojte Google Kalendář pro automatickou synchronizaci rezervací. Nové rezervace se automaticky zobrazí ve vašem kalendáři.',
    gcalConnect: lang === 'en' ? 'Connect Google Calendar' : lang === 'sk' ? 'Prepojiť Google Kalendár' : 'Propojit Google Kalendář',
    gcalDisconnect: lang === 'en' ? 'Disconnect' : lang === 'sk' ? 'Odpojiť' : 'Odpojit',
    gcalConnected: lang === 'en' ? 'Connected' : lang === 'sk' ? 'Prepojené' : 'Propojeno',
    gcalFeatures: lang === 'en' ? ['Auto-sync new bookings', 'Cancellations update calendar', 'Staff sees events in their calendar'] : lang === 'sk' ? ['Auto-sync nových rezervácií', 'Zrušenia aktualizujú kalendár', 'Staff vidí udalosti vo svojom kalendári'] : ['Auto-sync nových rezervací', 'Zrušení aktualizují kalendář', 'Staff vidí události ve svém kalendáři'],
    gcalSoon: lang === 'en' ? 'Two-way sync coming soon' : lang === 'sk' ? 'Obojsmerná synchronizácia čoskoro' : 'Obousměrná synchronizace brzy',
    changePassword: lang === 'en' ? 'Change password' : lang === 'sk' ? 'Zmena hesla' : 'Změna hesla',
    changePasswordDesc: lang === 'en' ? 'Change your login password. After changing, you will need to log in again.' : lang === 'sk' ? 'Zmeňte si prihlasovacie heslo. Po zmene sa budete musieť znovu prihlásiť.' : 'Změňte si přihlašovací heslo. Po změně se budete muset znovu přihlásit.',
    currentPassword: lang === 'en' ? 'Current password' : lang === 'sk' ? 'Súčasné heslo' : 'Současné heslo',
    newPasswordLabel: lang === 'en' ? 'New password' : lang === 'sk' ? 'Nové heslo' : 'Nové heslo',
    confirmPasswordLabel: lang === 'en' ? 'Confirm new password' : lang === 'sk' ? 'Potvrdiť nové heslo' : 'Potvrdit nové heslo',
    changePasswordBtn: lang === 'en' ? 'Change password' : lang === 'sk' ? 'Zmeniť heslo' : 'Změnit heslo',
    passwordChanged: lang === 'en' ? 'Password changed! Logging out...' : lang === 'sk' ? 'Heslo zmenené! Odhlasujeme...' : 'Heslo změněno! Odhlašujeme...',
    passwordMismatch: lang === 'en' ? 'Passwords do not match' : lang === 'sk' ? 'Heslá sa nezhodujú' : 'Hesla se neshodují',
    passwordTooShort: lang === 'en' ? 'Password must be at least 6 characters' : lang === 'sk' ? 'Heslo musí mať aspoň 6 znakov' : 'Heslo musí mít alespoň 6 znaků',
    passwordError: lang === 'en' ? 'Error changing password' : lang === 'sk' ? 'Chyba pri zmene hesla' : 'Chyba při změně hesla',
    showPassword: lang === 'en' ? 'Show' : 'Zobrazit',
    hidePassword: lang === 'en' ? 'Hide' : 'Skrýt',
    dangerZone: lang === 'en' ? 'Danger zone' : lang === 'sk' ? 'Nebezpečná zóna' : 'Nebezpečná zóna',
    dangerDesc: lang === 'en' ? 'Permanently delete your account and ALL data (bookings, clients, services, settings). This action is IRREVERSIBLE. Before deletion, you can download a backup.' : lang === 'sk' ? 'Trvalo zmazať váš účet a VŠETKY dáta (rezervácie, klienti, služby, nastavenia). Táto akcia je NEVRATNÁ. Pred zmazaním si môžete stiahnuť zálohu.' : 'Trvale smazat váš účet a VŠECHNA data (rezervace, klienti, služby, nastavení). Tato akce je NEVRATNÁ. Před smazáním si můžete stáhnout zálohu.',
    deleteBtn: lang === 'en' ? 'Delete account and all data' : lang === 'sk' ? 'Zmazať účet a všetky dáta' : 'Smazat účet a všechna data',
    backupTitle: lang === 'en' ? '1. Data backup' : lang === 'sk' ? '1. Zálohovanie dát' : '1. Zálohování dat',
    backupDesc: lang === 'en' ? 'Before deletion, you can download all your data.' : lang === 'sk' ? 'Pred zmazaním si môžete stiahnuť všetky dáta.' : 'Před smazáním si můžete stáhnout všechna data.',
    backupBtn: lang === 'en' ? 'Download backup (CSV)' : lang === 'sk' ? 'Stiahnuť zálohu (CSV)' : 'Stáhnout zálohu (CSV)',
    backupDoneLabel: lang === 'en' ? 'Backup downloaded' : lang === 'sk' ? 'Záloha stiahnutá' : 'Záloha stažena',
    confirmTitle: lang === 'en' ? '2. Confirm deletion' : lang === 'sk' ? '2. Potvrdenie zmazania' : '2. Potvrzení smazání',
    confirmDesc: lang === 'en' ? 'To confirm, type the name of your organization:' : lang === 'sk' ? 'Pre potvrdenie napíšte názov vašej organizácie:' : 'Pro potvrzení napište název vaší organizace:',
    confirmPlaceholder: lang === 'en' ? 'Type organization name here' : lang === 'sk' ? 'Sem napíšte názov organizácie' : 'Zde napište název organizace',
    confirmYes: lang === 'en' ? 'Yes, permanently delete everything' : lang === 'sk' ? 'Áno, trvalo zmazať všetko' : 'Ano, trvale smazat vše',
    confirmNo: lang === 'en' ? 'No, cancel' : lang === 'sk' ? 'Nie, zrušiť' : 'Ne, zrušit',
    confirmNote: lang === 'en' ? 'Your account will be deleted within 24 hours.' : lang === 'sk' ? 'Váš účet bude zmazaný do 24 hodín.' : 'Váš účet bude smazán do 24 hodin.',
    deleteSuccess: lang === 'en' ? 'Deletion requested.' : lang === 'sk' ? 'Žiadosť o zmazanie odoslaná.' : 'Žádost o smazání odeslána.',
    deleteError: lang === 'en' ? 'Error requesting deletion.' : lang === 'sk' ? 'Chyba pri žiadosti o zmazanie.' : 'Chyba při žádosti o smazání.',
  }

  const MODE_CARDS = [
    {
      mode: 'solo', label: '🟢 OSVČ',
      desc: lang === 'en' ? 'For solo entrepreneurs (1 person)' : lang === 'sk' ? 'Pre podnikateľov (1 osoba)' : 'Pro podnikatele (1 osoba)',
      color: 'from-teal-500 to-cyan-400', border: 'border-teal-300', bg: 'bg-teal-50',
      features: lang === 'en'
        ? ['✅ Calendar + online booking page', '✅ Bookings (max 50/mo)', '✅ Clients CRM (max 100)', '✅ Services + categories', '✅ Working hours per day (Mon-Sun)', '✅ Email notifications (new/cancel)', '✅ Dashboard with KPI', '✅ Data export (GDPR)', '✅ Multilingual CZ/SK/EN', '🔜 Basic reports (revenue, bookings)', '🔜 UTM tracking', '📋 Discounts + Happy Hours (max 1)', '📋 SMS notifications (30/mo)']
        : lang === 'sk'
        ? ['✅ Kalendár + online booking stránka', '✅ Rezervácie (max 50/mes)', '✅ Klienti CRM (max 100)', '✅ Služby + kategórie', '✅ Pracovná doba per deň (Po-Ne)', '✅ Email notifikácie (nová/zrušenie)', '✅ Dashboard s KPI', '✅ Export dát (GDPR)', '✅ Multijazyčnosť CZ/SK/EN', '🔜 Základné reporty (tržby, rezervácie)', '🔜 UTM tracking', '📋 Zľavy + Happy Hours (max 1)', '📋 SMS notifikácie (30/mes)']
        : ['✅ Kalendář + online booking stránka', '✅ Rezervace (max 50/měs)', '✅ Klienti CRM (max 100)', '✅ Služby + kategorie', '✅ Pracovní doba per den (Po-Ne)', '✅ Email notifikace (nová/zrušení)', '✅ Dashboard s KPI', '✅ Export dat (GDPR)', '✅ Multijazyčnost CZ/SK/EN', '🔜 Základní reporty (tržby, rezervace)', '🔜 UTM tracking', '📋 Slevy + Happy Hours (max 1)', '📋 SMS notifikace (30/měs)'],
      tiers: [
        { label: lang === 'en' ? 'Without AI' : 'Bez AI', price: '49', year: '39', rec: false },
        { label: lang === 'en' ? 'With AI statistics' : 'S AI statistikami', price: '99', year: '79', rec: true },
      ],
      trial: l.trial, free: l.freeAfter, up: 'solo_inspire',
    },
    {
      mode: 'team', label: '🔵 FIRMA',
      desc: lang === 'en' ? 'For businesses (owner + up to 4 staff)' : lang === 'sk' ? 'Pre firmy (majiteľ + max 4 zamestnanci)' : 'Pro firmy (majitel + max 4 zaměstnanci)',
      color: 'from-blue-600 to-sky-400', border: 'border-blue-300', bg: 'bg-blue-50',
      features: lang === 'en'
        ? ['✅ Everything from Solo (unlimited)', '✅ Team management + staff calendar', '✅ Google Calendar sync', '🔜 Reports per staff', '🔜 Weekly email report', '📋 Shifts and notifications', '📋 Client mini-portal', '📋 GA4 / Sklik / FB Pixel', '📋 Recurring bookings', '📋 Online payments / deposits', '📋 Pre-visit forms', '📋 Multiple locations (max 3)', '📋 Unlimited passes + bundles', '📋 Seasonal + combo discounts']
        : lang === 'sk'
        ? ['✅ Všetko z OSVČ (neobmedzene)', '✅ Správa tímu + staff kalendár', '✅ Google Calendar sync', '🔜 Reporty per staff', '🔜 Týždenný email report', '📋 Zmeny a notifikácie', '📋 Klientský mini-portál', '📋 GA4 / Sklik / FB Pixel', '📋 Opakované rezervácie', '📋 Online platby / depozity', '📋 Formuláre pred návštevou', '📋 Viac pobočiek (max 3)', '📋 Neobmedzené permanentky + balíčky', '📋 Sezónne + combo zľavy']
        : ['✅ Vše z OSVČ (neomezeně)', '✅ Správa týmu + staff kalendář', '✅ Google Calendar sync', '🔜 Reporty per staff', '🔜 Týdenní email report', '📋 Směny a notifikace', '📋 Klientský mini-portál', '📋 GA4 / Sklik / FB Pixel', '📋 Opakované rezervace', '📋 Online platby / depozity', '📋 Formuláře před návštěvou', '📋 Více poboček (max 3)', '📋 Neomezené permanentky + balíčky', '📋 Sezónní + combo slevy'],
      tiers: [
        { label: lang === 'en' ? 'Without AI' : 'Bez AI', price: '299', year: '239', rec: false },
        { label: lang === 'en' ? 'With AI statistics' : 'S AI statistikami', price: '499', year: '399', rec: true },
      ],
      trial: null, free: null, up: 'pro_inspire',
    },
    {
      mode: 'solo_inspire', label: '🏖️ Solo Inspire',
      desc: lang === 'en' ? 'Solo + AI & growth tools (1 person)' : lang === 'sk' ? 'OSVČ + AI a growth nástroje (1 osoba)' : 'OSVČ + AI a growth nástroje (1 osoba)',
      color: 'from-amber-500 to-yellow-400', border: 'border-amber-300', bg: 'bg-amber-50',
      features: lang === 'en'
        ? ['✅ Everything from Solo (unlimited)', '🔜 AI statistics + insights', '🔜 AI dead hours detection', '🔜 AI non-returning clients detection', '🔜 Growth reports', '🔜 Waitlist', '🔜 QR codes with tracking', '🔜 Booking page branding', '📋 Smart AI assistant (unlimited)', '📋 AI Business Coach', '📋 Campaigns (5/mo)', '📋 Google reviews booster', '📋 Smart rebooking', '📋 Discount codes + loyalty program', '📋 Referral program', '📋 Subscription / membership', '📋 Gift vouchers']
        : lang === 'sk'
        ? ['✅ Všetko z OSVČ (neobmedzene)', '🔜 AI štatistiky + insighty', '🔜 AI detekcia mŕtvych hodín', '🔜 AI detekcia nevracajúcich sa klientov', '🔜 Growth reporty', '🔜 Waitlist', '🔜 QR kódy s tracking', '🔜 Brandovanie booking stránky', '📋 Smart AI asistent (neobmedzene)', '📋 AI Business Coach', '📋 Kampane (5/mes)', '📋 Google recenzie booster', '📋 Smart rebooking', '📋 Zľavové kódy + vernostný program', '📋 Referral program', '📋 Predplatné / membership', '📋 Darčekové poukazy']
        : ['✅ Vše z OSVČ (neomezeně)', '🔜 AI statistiky + insighty', '🔜 AI detekce mrtvých hodin', '🔜 AI detekce nevracejících se klientů', '🔜 Growth reporty', '🔜 Waitlist', '🔜 QR kódy s tracking', '🔜 Brandování booking stránky', '📋 Smart AI asistent (neomezeně)', '📋 AI Business Coach', '📋 Kampaně (5/měs)', '📋 Google recenze booster', '📋 Smart rebooking', '📋 Slevové kódy + věrnostní program', '📋 Referral program', '📋 Předplatné / membership', '📋 Dárkové poukazy'],
      tiers: [
        { label: lang === 'en' ? 'With our AI' : 'S naším AI', price: '799', year: '639', rec: false },
        { label: lang === 'en' ? 'With your own API key' : lang === 'sk' ? 'S vlastným API kľúčom' : 'S vlastním API klíčem', price: '499', year: '399', rec: true, save: '300' },
      ],
      trial: null, free: null, up: 'pro_inspire',
    },
    {
      mode: 'pro_inspire', label: '🏖️✨ Pro Inspire',
      desc: lang === 'en' ? 'Business + AI & growth - max (owner + up to 24 staff)' : lang === 'sk' ? 'Firma + AI a growth - maximum (majiteľ + max 24 zamestnancov)' : 'Firma + AI a growth - maximum (majitel + max 24 zaměstnanců)',
      color: 'from-amber-600 to-yellow-300', border: 'border-yellow-400', bg: 'bg-yellow-50',
      features: lang === 'en'
        ? ['✅ Everything from Team + Solo Inspire', '🔜 AI statistics + insights', '🔜 Reports per staff', '🔜 Weekly email report', '📋 AI Copilot (advanced)', '📋 AI Smart Slot Filler', '📋 AI Revenue insights', '📋 AI weekly report with recommendations', '📋 AI reactivation campaigns', '📋 Churn prevention AI', '📋 Staff leaderboard', '📋 JSON-LD SEO (free slots on Google)', '📋 Missed call capture', '📋 Unlimited campaigns', '📋 Marketplace / directory', '📋 Unlimited locations']
        : lang === 'sk'
        ? ['✅ Všetko z Firmy + Solo Inspire', '🔜 AI štatistiky + insighty', '🔜 Reporty per staff', '🔜 Týždenný email report', '📋 AI Copilot (pokročilý)', '📋 AI Smart Slot Filler', '📋 AI Revenue insighty', '📋 AI týždenný report s odporúčaniami', '📋 AI reaktivačné kampane', '📋 Churn prevention AI', '📋 Staff leaderboard', '📋 JSON-LD SEO (voľné sloty na Googli)', '📋 Missed call capture', '📋 Neobmedzené kampane', '📋 Marketplace / directory', '📋 Neobmedzené pobočky']
        : ['✅ Vše z Firmy + Solo Inspire', '🔜 AI statistiky + insighty', '🔜 Reporty per staff', '🔜 Týdenní email report', '📋 AI Copilot (pokročilý)', '📋 AI Smart Slot Filler', '📋 AI Revenue insighty', '📋 AI týdenní report s doporučeními', '📋 AI reaktivační kampaně', '📋 Churn prevention AI', '📋 Staff leaderboard', '📋 JSON-LD SEO (volné sloty na Googlu)', '📋 Missed call capture', '📋 Neomezené kampaně', '📋 Marketplace / directory', '📋 Neomezené pobočky'],
      tiers: [
        { label: lang === 'en' ? 'With our AI' : 'S naším AI', price: '1 999', year: '1 599', rec: false },
        { label: lang === 'en' ? 'With your own API key' : lang === 'sk' ? 'S vlastným API kľúčom' : 'S vlastním API klíčem', price: '1 299', year: '1 039', rec: true, save: '700' },
      ],
      trial: null, free: null, up: null,
    },
  ]
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d && !d.error) setS({ ...EMPTY, ...d, work_days: d.work_days || DEFAULT_WORK_DAYS, break_duration: d.break_duration ?? 0, break_start: d.break_start || '12:00' })
    }).finally(() => setLoading(false))

    fetch('/api/auth/google/status').then(r => r.json()).then(d => {
      if (d.connected) {
        setGcalConnected(true)
        setGcalEmail(d.google_email || '')
      }
    }).catch(() => {})

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const gcalParam = params.get('gcal')
      if (gcalParam === 'connected') {
        setGcalConnected(true)
        toast.success('Google Calendar propojen!')
        window.history.replaceState({}, '', '/settings')
      } else if (gcalParam === 'denied') {
        toast.error('Google Calendar zamítnuto')
        window.history.replaceState({}, '', '/settings')
      } else if (gcalParam === 'error') {
        toast.error('Chyba Google Calendar')
        window.history.replaceState({}, '', '/settings')
      }
    }
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

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.warning(l.passwordTooShort); return }
    if (newPassword !== confirmPassword) { toast.warning(l.passwordMismatch); return }
    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        toast.error(l.passwordError + ': ' + error.message)
      } else {
        toast.success(l.passwordChanged)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(async () => {
          await supabase.auth.signOut()
          window.location.href = '/login'
        }, 2000)
      }
    } catch (err) {
      toast.error(l.passwordError)
    } finally {
      setChangingPassword(false)
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
        {/* Základní informace */}
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
            {/* === AUTOMATICKÉ EMAILY KLIENTŮM === */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {lang === 'en' ? 'Automatic emails to clients' : lang === 'sk' ? 'Automatické emaily klientom' : 'Automatické emaily klientům'}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {lang === 'en' ? 'Sent automatically based on booking events.' : lang === 'sk' ? 'Odosielané automaticky podľa udalostí rezervácií.' : 'Odesílané automaticky podle událostí rezervací.'}
              </p>

              <div className="space-y-3">
                {/* Připomínka den předem */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <button onClick={() => setS({ ...s, reminder_enabled: !s.reminder_enabled })}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.reminder_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.reminder_enabled ? 'left-5' : 'left-1'}`} />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      📅 {lang === 'en' ? 'Reminder before appointment' : lang === 'sk' ? 'Pripomienka pred návštevou' : 'Připomínka před návštěvou'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lang === 'en' ? 'Client receives a reminder email before their appointment.' : lang === 'sk' ? 'Klient dostane pripomienku emailom pred termínom.' : 'Klient dostane připomínku emailem před termínem.'}
                    </p>
                    {s.reminder_enabled && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {lang === 'en' ? 'Send' : lang === 'sk' ? 'Odoslať' : 'Odeslat'}
                        </span>
                        <select value={s.reminder_hours_before || 24}
                          onChange={e => setS({ ...s, reminder_hours_before: parseInt(e.target.value) })}
                          className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white">
                          <option value={3}>3h</option>
                          <option value={6}>6h</option>
                          <option value={12}>12h</option>
                          <option value={24}>24h</option>
                          <option value={48}>48h</option>
                        </select>
                        <span className="text-xs text-gray-500">
                          {lang === 'en' ? 'before' : lang === 'sk' ? 'pred termínom' : 'před termínem'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Poděkování po návštěvě */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <button onClick={() => setS({ ...s, followup_enabled: !s.followup_enabled })}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.followup_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.followup_enabled ? 'left-5' : 'left-1'}`} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      🙏 {lang === 'en' ? 'Thank you after visit' : lang === 'sk' ? 'Poďakovanie po návšteve' : 'Poděkování po návštěvě'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lang === 'en' ? 'Client receives a thank you email after their visit.' : lang === 'sk' ? 'Klient dostane ďakovný email po návšteve.' : 'Klient dostane děkovný email po návštěvě.'}
                    </p>
                  </div>
                </div>

                {/* Žádost o recenzi */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <button onClick={() => setS({ ...s, review_request_enabled: !s.review_request_enabled })}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.review_request_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.review_request_enabled ? 'left-5' : 'left-1'}`} />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      ⭐ {lang === 'en' ? 'Google review request' : lang === 'sk' ? 'Žiadosť o Google recenziu' : 'Žádost o Google recenzi'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lang === 'en' ? 'Client receives a review request after their visit.' : lang === 'sk' ? 'Klient dostane žiadosť o recenziu po návšteve.' : 'Klient dostane žádost o recenzi po návštěvě.'}
                    </p>
                    {s.review_request_enabled && (
                      <div className="mt-2">
                        <input type="url" value={s.google_review_url || ''}
                          onChange={e => setS({ ...s, google_review_url: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                          placeholder={lang === 'en' ? 'Google review link (optional)' : 'Odkaz na Google recenze (nepovinné)'} />
                        <p className="text-xs text-gray-400 mt-1">
                          {lang === 'en' ? 'Paste your Google Maps review URL' : lang === 'sk' ? 'Vložte odkaz na Google Maps recenzie' : 'Vložte odkaz na Google Maps recenze'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {s.notification_email && s.notify_on_booking && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <Check className="w-4 h-4" /> {lang === 'en' ? 'Notifications active' : lang === 'sk' ? 'Notifikácie aktívne' : 'Notifikace aktivní'} &rarr; {s.notification_email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pracovní doba */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{l.workingHours}</h2>
          <p className="text-sm text-gray-500 mb-4">{lang === 'en' ? <>Schedule applies to every week. <strong>Each day can be disabled or set to custom hours.</strong> <em>Set up odd/even weeks and vacation periods — coming soon on Clientoro.pro.</em></> : lang === 'sk' ? <>Rozvrh platí pre každý týždeň. <strong>Každý deň možno vypnúť alebo nastaviť vlastné hodiny.</strong> <em>Nastaviť si lichý/sudý týždeň a obdobie voľna — už čoskoro na Clientoro.pro.</em></> : <>Rozvrh platí pro každý týden. <strong>Každý den lze vypnout nebo nastavit vlastní hodiny.</strong> <em>Nastavit si lichý/sudý týden a období volna — již brzy na Clientoro.pro.</em></>}</p>
          
          <div className="space-y-2 mb-4">
            {(lang === 'en' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : lang === 'sk' ? ['Po','Ut','St','Št','Pi','So','Ne'] : ['Po','Út','St','Čt','Pá','So','Ne']).map((dayName, i) => {
              const wd = (s.work_days || DEFAULT_WORK_DAYS)[i] || DEFAULT_WORK_DAYS[i]
              const hours: string[] = []
              for (let h = 5; h <= 23; h++) {
                hours.push(`${h.toString().padStart(2, '0')}:00`)
                hours.push(`${h.toString().padStart(2, '0')}:30`)
              }
              return (
                <div key={i} className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-all ${wd.enabled ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-gray-50'}`}>
                  <button
                    onClick={() => {
                      const newDays = [...(s.work_days || DEFAULT_WORK_DAYS)]
                      newDays[i] = { ...newDays[i], enabled: !newDays[i].enabled }
                      setS({ ...s, work_days: newDays })
                    }}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${wd.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${wd.enabled ? 'left-5' : 'left-1'}`} />
                  </button>
                  <span className={`w-8 text-sm font-bold flex-shrink-0 ${wd.enabled ? 'text-gray-900' : 'text-gray-400'}`}>{dayName}</span>
                  {wd.enabled ? (
                    <div className="flex items-center gap-1 sm:gap-2 flex-1">
                      <select value={wd.start} onChange={e => {
                        const newDays = [...(s.work_days || DEFAULT_WORK_DAYS)]
                        newDays[i] = { ...newDays[i], start: e.target.value }
                        setS({ ...s, work_days: newDays })
                      }} className="px-1.5 sm:px-2 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm bg-white">
                        {hours.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-gray-400 text-xs">—</span>
                      <select value={wd.end} onChange={e => {
                        const newDays = [...(s.work_days || DEFAULT_WORK_DAYS)]
                        newDays[i] = { ...newDays[i], end: e.target.value }
                        setS({ ...s, work_days: newDays })
                      }} className="px-1.5 sm:px-2 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm bg-white">
                        {hours.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <div className="hidden sm:block flex-1 mx-2">
                        <div className="h-2 bg-gray-100 rounded-full relative">
                          <div className="h-2 bg-emerald-300 rounded-full absolute" style={{
                            left: `${((parseInt(wd.start) - 5) / 18) * 100}%`,
                            width: `${Math.max(((parseInt(wd.end) - parseInt(wd.start)) / 18) * 100, 5)}%`
                          }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">{lang === 'en' ? 'Closed' : lang === 'sk' ? 'Zatvorené' : 'Zavřeno'}</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.slotDuration}</label>
              <select value={s.slot_duration} onChange={e => setS({ ...s, slot_duration: parseInt(e.target.value) })}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value={15}>15 {l.minutes}</option>
                <option value={30}>30 {l.minutes}</option>
                <option value={45}>45 {l.minutes}</option>
                <option value={60}>60 {l.minutes}</option>
              </select>
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.breakDuration}</label>
              <select value={s.break_duration} onChange={e => setS({ ...s, break_duration: parseInt(e.target.value) })}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value={0}>{l.noBreak}</option>
                <option value={15}>15 {l.minutes}</option>
                <option value={30}>30 {l.minutes}</option>
                <option value={45}>45 {l.minutes}</option>
                <option value={60}>60 {l.minutes}</option>
              </select>
            </div>
            {s.break_duration > 0 && (
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">{l.breakStart}</label>
                <select value={s.break_start} onChange={e => setS({ ...s, break_start: e.target.value })}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="11:00">11:00</option>
                  <option value="11:30">11:30</option>
                  <option value="12:00">12:00</option>
                  <option value="12:30">12:30</option>
                  <option value="13:00">13:00</option>
                  <option value="13:30">13:30</option>
                </select>
              </div>
            )}
            <div className="flex-1 bg-amber-50 rounded-xl p-3 border border-amber-200">
              <p className="text-xs text-amber-700">💡 {lang === 'en' ? 'Odd/even week — coming soon' : lang === 'sk' ? 'Lichý/sudý týždeň — čoskoro' : 'Lichý/sudý týden — brzy'}</p>
            </div>
          </div>
        </div>
        {/* Booking stránka */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{l.bookingPage}</h2>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3">
              <a href={`https://clientoro.pro/book/${s.booking_link}`} target="_blank" className="text-gray-400 text-sm hover:text-blue-600 transition-colors">clientoro.pro/book/</a>
              <input type="text" value={s.booking_link}
                onChange={e => setS({ ...s, booking_link: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="flex-1 bg-transparent py-2 px-1 focus:outline-none text-sm" placeholder="vas-salon" />
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`https://clientoro.pro/book/${s.booking_link}`); toast.success(l.copied) }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">{l.copy}</button>
          </div>
        </div>


        {/* Předplatné */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{l.yourPlan}</h2>
          <SubscriptionSettings />
        </div>

        {/* Google Calendar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{l.gcalTitle}</h3>
              <p className="text-sm text-gray-500">{l.gcalDesc}</p>
            </div>
          </div>

          <div className="space-y-2 mb-5">
            {l.gcalFeatures.map((f: string) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">{f}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-amber-400">◷</span>
              <span className="text-gray-400 italic">{l.gcalSoon}</span>
            </div>
          </div>

          {gcalConnected ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium border border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {l.gcalConnected}{gcalEmail ? ` · ${gcalEmail}` : ''}
              </div>
              <button onClick={async () => {
                setGcalLoading(true)
                try {
                  const r = await fetch('/api/auth/google/disconnect', { method: 'POST' })
                  if (r.ok) { setGcalConnected(false); setGcalEmail(''); toast.success('Google Calendar odpojen') }
                  else toast.error('Chyba při odpojování')
                } catch { toast.error('Chyba při odpojování') }
                finally { setGcalLoading(false) }
              }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
                {l.gcalDisconnect}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setGcalLoading(true)
                window.location.href = '/api/auth/google?redirect=/settings'
              }}
              disabled={gcalLoading}
              className="flex items-center gap-3 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {gcalLoading ? '...' : l.gcalConnect}
            </button>
          )}
        </div>

        {/* Změna hesla */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">{l.changePassword}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">{l.changePasswordDesc}</p>
          <div className="space-y-3 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.newPasswordLabel}</label>
              <div className="relative">
                <input type={showPasswords ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-24"
                  placeholder="Min. 6 znaků" minLength={6} />
                <button type="button" onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  {showPasswords ? <><EyeOff className="w-3.5 h-3.5" /> {l.hidePassword}</> : <><Eye className="w-3.5 h-3.5" /> {l.showPassword}</>}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.confirmPasswordLabel}</label>
              <input type={showPasswords ? 'text' : 'password'} value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Zopakujte nové heslo" minLength={6} />
            </div>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500">{l.passwordMismatch}</p>
            )}
            <button onClick={handleChangePassword}
              disabled={changingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
              style={{ background: modeGradient }}
              className="px-4 py-2 text-white rounded-lg hover:brightness-110 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed">
              {changingPassword ? '...' : l.changePasswordBtn}
            </button>
          </div>
        </div>

        {/* Nebezpečná zóna */}
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

