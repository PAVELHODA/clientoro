// PATH: src/app/book/[slug]/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import {
  Calendar, Clock, User, Phone, Mail, ChevronRight, ChevronLeft,
  Check, Loader2, MapPin, Waves, Star, MessageSquare,
} from 'lucide-react'
import { PublicLang, publicTranslations } from '@/lib/publicI18n'

const flags: Record<PublicLang, string> = { cs: '🇨🇿', sk: '🇸🇰', en: '🇬🇧' }

interface Organization {
  id: string; name: string; mode: string; work_start: number; work_end: number
  slug: string; description: string | null; phone: string | null
  address: string | null; logo_url: string | null; language?: string; category?: string
}
interface Service {
  id: string; name: string; duration: number; price: number | null
  color: string; category: string | null; description: string | null
}
interface Staff {
  id: string; full_name: string; avatar_url: string | null
  staff_services: { service_id: string }[]
}
interface WorkingHour { staff_id: string; weekday: number; start_time: string; end_time: string }
interface TimeOff { staff_id: string; start_at: string; end_at: string }
interface ExistingBooking { start_at: string; end_at: string; staff_id: string; service_id: string }

type Step = 'service' | 'staff' | 'datetime' | 'contact' | 'done'

export default function PublicBookingPage() {
  const params = useParams()
  const slug = params.slug as string
  const dateScrollRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [org, setOrg] = useState<Organization | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([])
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([])
  const [existingBookings, setExistingBookings] = useState<ExistingBooking[]>([])

  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [anyStaff, setAnyStaff] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [gdprConsent, setGdprConsent] = useState(false)
  const [lang, setLangState] = useState<PublicLang>('cs')

  const t = (key: string) => publicTranslations[lang]?.[key] || publicTranslations.cs[key] || key
  const setLang = (l: PublicLang) => { localStorage.setItem('clientoro_book_lang', l); setLangState(l) }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/public/booking?slug=${slug}`)
        if (!res.ok) { setError('book_not_found'); setLoading(false); return }
        const data = await res.json()
        setOrg(data.organization); setServices(data.services || []); setStaffList(data.staff || [])
        setWorkingHours(data.working_hours || []); setTimeOffs(data.time_off || []); setExistingBookings(data.bookings || [])
        const stored = localStorage.getItem('clientoro_book_lang') as PublicLang | null
        if (stored && ['cs', 'sk', 'en'].includes(stored)) setLangState(stored)
        else if (data.organization?.language && ['cs', 'sk', 'en'].includes(data.organization.language)) setLangState(data.organization.language as PublicLang)
      } catch { setError('book_load_error') }
      finally { setLoading(false) }
    }
    if (slug) fetchData()
  }, [slug])

  // ===== BUSINESS LOGIC =====
  const availableStaff = selectedService ? staffList.filter(s => s.staff_services?.some(ss => ss.service_id === selectedService.id)) : staffList
  const relevantStaff = selectedStaff ? [selectedStaff] : availableStaff
  const jsToDbWeekday = (jsDay: number) => jsDay === 0 ? 6 : jsDay - 1

  const hasAnyStaffWorking = (dateStr: string): boolean => {
    const date = new Date(dateStr + 'T12:00:00'); const weekday = jsToDbWeekday(date.getDay())
    const relevantWH = workingHours.filter(wh => relevantStaff.some(s => s.id === wh.staff_id))
    if (relevantWH.length === 0) return weekday < 5
    return relevantStaff.some(staff => {
      const hasWH = relevantWH.some(wh => wh.staff_id === staff.id && wh.weekday === weekday)
      if (!hasWH) return false
      return !timeOffs.some(to => to.staff_id === staff.id && dateStr >= to.start_at.split('T')[0] && dateStr <= to.end_at.split('T')[0])
    })
  }

  const getAvailableDates = () => {
    const dates: string[] = []; const today = new Date()
    for (let i = 0; i < 21; i++) { const d = new Date(today); d.setDate(today.getDate() + i); const ds = d.toISOString().split('T')[0]; if (hasAnyStaffWorking(ds)) dates.push(ds) }
    return dates
  }

  const getAvailableSlots = () => {
    if (!selectedDate || !selectedService) return []
    const date = new Date(selectedDate + 'T12:00:00'); const weekday = jsToDbWeekday(date.getDay())
    const duration = selectedService.duration; const now = new Date()
    const isToday = selectedDate === now.toISOString().split('T')[0]; const slots: string[] = []
    const relevantWH = workingHours.filter(wh => relevantStaff.some(s => s.id === wh.staff_id) && wh.weekday === weekday)
    const timeRanges: { start: number; end: number; staffId: string | null }[] = []
    if (relevantWH.length === 0) timeRanges.push({ start: (org?.work_start || 8) * 60, end: (org?.work_end || 17) * 60, staffId: null })
    else for (const wh of relevantWH) { const [sh, sm] = wh.start_time.split(':').map(Number); const [eh, em] = wh.end_time.split(':').map(Number); timeRanges.push({ start: sh * 60 + (sm || 0), end: eh * 60 + (em || 0), staffId: wh.staff_id }) }
    const earliestStart = Math.min(...timeRanges.map(r => r.start)); const latestEnd = Math.max(...timeRanges.map(r => r.end))
    for (let mins = earliestStart; mins + duration <= latestEnd; mins += 30) {
      const h = Math.floor(mins / 60); const m = mins % 60
      const slotTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const slotStartDate = new Date(`${selectedDate}T${slotTime}:00`); const slotEndDate = new Date(slotStartDate.getTime() + duration * 60000)
      if (isToday && slotStartDate <= now) continue
      const slotStartISO = slotStartDate.toISOString(); const slotEndISO = slotEndDate.toISOString()
      const ok = relevantStaff.some(staff => {
        const staffWH = timeRanges.find(r => r.staffId === staff.id || r.staffId === null)
        if (!staffWH) return false; if (mins < staffWH.start || mins + duration > staffWH.end) return false
        return !existingBookings.some(b => b.staff_id === staff.id && b.start_at < slotEndISO && b.end_at > slotStartISO)
      })
      if (ok && !slots.includes(slotTime)) slots.push(slotTime)
    }
    return slots
  }

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) { setSubmitError(t('book_error_name_phone')); return }
    if (!gdprConsent) { setSubmitError(t('book_error_gdpr')); return }
    setSubmitting(true); setSubmitError('')
    const startDate = new Date(`${selectedDate}T${selectedTime}:00`)
    const endDate = new Date(startDate.getTime() + (selectedService?.duration || 60) * 60000)
    let staffId = selectedStaff?.id || null
    if (!staffId && availableStaff.length > 0) {
      const slotEndISO = endDate.toISOString(); const weekday = jsToDbWeekday(startDate.getDay())
      const freeStaff = availableStaff.find(staff => {
        const hasWH = workingHours.some(wh => wh.staff_id === staff.id && wh.weekday === weekday)
        if (!hasWH && workingHours.filter(wh => relevantStaff.some(s => s.id === wh.staff_id)).length > 0) return false
        return !existingBookings.some(b => b.staff_id === staff.id && b.start_at < slotEndISO && b.end_at > startDate.toISOString())
      })
      staffId = freeStaff?.id || availableStaff[0]?.id || null
    }
    try {
      const res = await fetch('/api/public/booking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, service_id: selectedService?.id, staff_id: staffId, start_at: startDate.toISOString(), end_at: endDate.toISOString(), customer_name: customerName.trim(), customer_phone: customerPhone.trim(), customer_email: customerEmail.trim() || null, note: customerNote.trim() || null, price: selectedService?.price || null }),
      })
      const result = await res.json()
      if (res.ok) setStep('done'); else setSubmitError(result.error || t('book_load_error'))
    } catch { setSubmitError(t('book_error_connection')) }
    finally { setSubmitting(false) }
  }

  const getLocale = () => lang === 'sk' ? 'sk-SK' : lang === 'en' ? 'en-US' : 'cs-CZ'
  const formatDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString(getLocale(), { weekday: 'short', day: 'numeric', month: 'long' })
  const getDayName = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString(getLocale(), { weekday: 'short' })
  const getDayNum = (d: string) => new Date(d + 'T12:00:00').getDate()
  const getMonthShort = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString(getLocale(), { month: 'short' })
  const isToday = (d: string) => d === new Date().toISOString().split('T')[0]
  const isTomorrow = (d: string) => { const tom = new Date(); tom.setDate(tom.getDate() + 1); return d === tom.toISOString().split('T')[0] }
  const resetAll = () => { setStep('service'); setSelectedService(null); setSelectedStaff(null); setAnyStaff(false); setSelectedDate(''); setSelectedTime(''); setCustomerName(''); setCustomerPhone(''); setCustomerEmail(''); setCustomerNote(''); setSubmitError(''); setGdprConsent(false) }

  const availableDates = getAvailableDates()
  const availableSlots = getAvailableSlots()
  const stepIndex = ['service', 'staff', 'datetime', 'contact', 'done'].indexOf(step)
  const groupSlots = (slots: string[]) => ({ morning: slots.filter(s => parseInt(s) < 12), afternoon: slots.filter(s => parseInt(s) >= 12 && parseInt(s) < 17), evening: slots.filter(s => parseInt(s) >= 17) })
  const slotGroups = groupSlots(availableSlots)

  // ===== LOADING =====
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-poppins" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0c2d48 50%, #0e4d64 100%)' }}>
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-white/40" />
        <p className="text-white/30 text-sm tracking-wide">{t('book_loading')}</p>
      </div>
    </div>
  )

  // ===== ERROR =====
  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4 font-poppins" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0c2d48 50%, #0e4d64 100%)' }}>
      <div className="text-center max-w-sm bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
        <p className="text-white text-lg font-playfair">{t(error)}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative font-poppins" style={{ background: '#f7f8fa' }}>

      {/* ===== GLOW LINE ===== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(14,77,100,0.12) 25%, rgba(15,107,122,0.2) 50%, rgba(14,77,100,0.12) 75%, transparent 100%)' }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'radial-gradient(circle, rgba(15,107,122,0.7) 0%, rgba(14,77,100,0.3) 40%, transparent 70%)', boxShadow: '0 0 15px 6px rgba(15,107,122,0.12), 0 0 50px 18px rgba(14,77,100,0.06)' }} />
        </div>
        <div className="absolute left-1/2 top-0 bottom-0 w-16 -translate-x-1/2" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(14,77,100,0.02) 30%, rgba(15,107,122,0.04) 50%, rgba(14,77,100,0.02) 70%, transparent 100%)' }} />
      </div>

      {/* ===== HEADER ===== */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0c2d48 40%, #0e4d64 70%, #0f6b7a 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-[0.06]">
          <svg viewBox="0 0 1440 48" className="w-full h-full fill-white"><path d="M0 24 Q180 0 360 24 Q540 48 720 24 Q900 0 1080 24 Q1260 48 1440 24 L1440 48 L0 48 Z" /></svg>
        </div>

        <div className="relative max-w-lg mx-auto px-5 pt-5 pb-12 z-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {(['cs', 'sk', 'en'] as PublicLang[]).map(l => (
                <button key={l} onClick={() => setLang(l)} className="px-2.5 py-1.5 rounded-md text-xs transition-all"
                  style={{ background: lang === l ? 'rgba(255,255,255,0.12)' : 'transparent', color: lang === l ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                  {flags[l]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-white/60" />
              <span className="text-white/70 text-xs font-bold" style={{ letterSpacing: '0.2em' }}>CLIENTORO</span>

            </div>
          </div>

          {/* Salon name — Playfair kaligrafie */}
          <h1 className="font-playfair text-white mb-5" style={{ fontSize: '32px', fontWeight: 500, lineHeight: 1.2 }}>
            {org?.name}
          </h1>

          {/* Info — výrazné, čitelné */}
          <div className="space-y-2.5">
            {org?.address && (
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-white/50 flex-shrink-0" />
                <span className="text-white/80 text-[15px]">{org.address}</span>
              </div>
            )}
            {org?.phone && (
              <a href={`tel:${org.phone}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <Phone className="w-4 h-4 text-white/50 flex-shrink-0" />
                <span className="text-white/80 text-[15px] font-medium">{org.phone}</span>
              </a>
            )}
            {org?.description && (
              <p className="text-white/40 text-sm leading-relaxed mt-3 line-clamp-2">{org.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* ===== STEP INDICATOR ===== */}
      {step !== 'done' && (
        <div className="max-w-lg mx-auto px-5 -mt-5 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/40 px-5 py-3.5">
            <div className="flex items-center justify-between">
              {[
                { key: 'service', label: t('book_step_service') },
                { key: 'staff', label: t('book_step_who') },
                { key: 'datetime', label: t('book_step_when') },
                { key: 'contact', label: t('book_step_contact') },
              ].map((s, i) => {
                const isActive = s.key === step; const isDone = i < stepIndex
                return (
                  <div key={s.key} className="flex items-center">
                    {i > 0 && <div className="w-6 h-px mx-1.5" style={{ background: isDone ? '#059669' : '#e5e7eb' }} />}
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={isDone ? { background: '#059669', color: '#fff' } : isActive ? { background: '#0c2d48', color: '#fff' } : { background: '#f3f4f6', color: '#9ca3af' }}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <span className="text-[11px] font-medium hidden sm:inline" style={{ color: isActive ? '#0c2d48' : isDone ? '#059669' : '#9ca3af' }}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      <div className="max-w-lg mx-auto px-5 pt-7 pb-12 relative z-10">

        {/* KROK 1: SLUŽBY */}
        {step === 'service' && (
          <div>
            <h2 className="font-playfair text-gray-900 mb-6" style={{ fontSize: '24px', fontWeight: 500 }}>{t('book_choose_service')}</h2>
            <div className="space-y-2.5">
              {services.map(svc => (
                <button key={svc.id} onClick={() => { setSelectedService(svc); setSelectedStaff(null); setAnyStaff(false); setSelectedDate(''); setSelectedTime(''); setStep('staff') }}
                  className="w-full bg-white rounded-2xl p-5 text-left transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-14 rounded-full flex-shrink-0" style={{ backgroundColor: svc.color || '#0f6b7a' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-[15px]">{svc.name}</p>
                      {svc.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{svc.description}</p>}
                      <span className="text-xs text-gray-500 mt-1.5 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {svc.duration} {t('book_min')}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {svc.price ? (
                        <div>
                          <span className="text-xl font-bold text-gray-900">{svc.price}</span>
                          <span className="text-sm font-medium text-gray-500 ml-1">{t('book_currency')}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">{lang === 'en' ? 'Free' : 'Zdarma'}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* KROK 2: SPECIALISTA */}
        {step === 'staff' && (
          <div>
            <button onClick={() => setStep('service')} className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600 transition-colors mb-4 font-medium">
              <ChevronLeft className="w-3.5 h-3.5" /> {t('book_back')}
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: selectedService?.color || '#0f6b7a' }} />
              <span className="text-sm text-gray-600 font-medium">{selectedService?.name} · {selectedService?.duration} {t('book_min')}</span>
            </div>
            <h2 className="font-playfair text-gray-900 mb-6" style={{ fontSize: '24px', fontWeight: 500 }}>{t('book_choose_specialist')}</h2>
            <div className="space-y-2.5">
              <button onClick={() => { setSelectedStaff(null); setAnyStaff(true); setSelectedDate(''); setSelectedTime(''); setStep('datetime') }}
                className="w-full bg-white rounded-2xl p-5 text-left transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                    <span className="text-gray-300 text-lg font-light">—</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{t('book_anyone')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t('book_anyone_desc') || 'Přiřadíme prvního volného'}</p>
                  </div>
                </div>
              </button>
              {availableStaff.map(s => (
                <button key={s.id} onClick={() => { setSelectedStaff(s); setAnyStaff(false); setSelectedDate(''); setSelectedTime(''); setStep('datetime') }}
                  className="w-full bg-white rounded-2xl p-5 text-left transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80">
                  <div className="flex items-center gap-4">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt={s.full_name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center font-medium text-sm" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                        {s.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    <div className="flex-1"><p className="font-semibold text-gray-900">{s.full_name}</p></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* KROK 3: DATUM A ČAS */}
        {step === 'datetime' && (
          <div>
            <button onClick={() => setStep('staff')} className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600 transition-colors mb-4 font-medium">
              <ChevronLeft className="w-3.5 h-3.5" /> {t('book_back')}
            </button>
            <div className="flex items-center gap-2 flex-wrap mb-5">
              <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border border-gray-100 text-sm text-gray-600 font-medium">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedService?.color || '#0f6b7a' }} />
                {selectedService?.name}
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border border-gray-100 text-sm text-gray-600 font-medium">
                {selectedStaff?.full_name || t('book_anyone')}
              </div>
            </div>
            <h2 className="font-playfair text-gray-900 mb-6" style={{ fontSize: '24px', fontWeight: 500 }}>{t('book_choose_datetime')}</h2>

            {/* Date scroll */}
            <div className="mb-8">
              <div ref={dateScrollRef} className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
                {availableDates.map(d => {
                  const active = selectedDate === d
                  return (
                    <button key={d} onClick={() => { setSelectedDate(d); setSelectedTime('') }}
                      className="flex-shrink-0 w-[68px] py-3 rounded-2xl text-center transition-all duration-200"
                      style={active ? { background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)', color: '#fff', boxShadow: '0 8px 20px rgba(12,45,72,0.25)' } : { background: '#fff', color: '#374151', border: '1px solid #f3f4f6' }}>
                      <span className="block text-[10px] uppercase tracking-wider font-semibold" style={{ opacity: active ? 0.7 : 0.5 }}>
                        {isToday(d) ? (lang === 'en' ? 'Today' : 'Dnes') : isTomorrow(d) ? (lang === 'en' ? 'Tmrw' : 'Zítra') : getDayName(d)}
                      </span>
                      <span className="block text-xl font-bold mt-0.5">{getDayNum(d)}</span>
                      <span className="block text-[10px] font-medium" style={{ opacity: 0.5 }}>{getMonthShort(d)}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                {availableSlots.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <p className="text-sm text-gray-400">{t('book_no_slots')}</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {[
                      { slots: slotGroups.morning, label: lang === 'en' ? 'Morning' : lang === 'sk' ? 'Ráno' : 'Dopoledne' },
                      { slots: slotGroups.afternoon, label: lang === 'en' ? 'Afternoon' : lang === 'sk' ? 'Popoludnie' : 'Odpoledne' },
                      { slots: slotGroups.evening, label: lang === 'en' ? 'Evening' : lang === 'sk' ? 'Večer' : 'Večer' },
                    ].filter(g => g.slots.length > 0).map(group => (
                      <div key={group.label}>
                        <p className="text-xs text-gray-400 mb-2.5 uppercase tracking-wider font-semibold">{group.label}</p>
                        <div className="grid grid-cols-4 gap-2">
                          {group.slots.map(ti => (
                            <button key={ti} onClick={() => { setSelectedTime(ti); setStep('contact') }}
                              className="py-3 bg-white rounded-xl text-sm font-semibold text-gray-700 border border-gray-100 transition-all duration-150 hover:shadow-md"
                              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #0c2d48, #0f6b7a)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent' }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#f3f4f6' }}>
                              {ti}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* KROK 4: KONTAKT */}
        {step === 'contact' && (
          <div>
            <button onClick={() => setStep('datetime')} className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600 transition-colors mb-4 font-medium">
              <ChevronLeft className="w-3.5 h-3.5" /> {t('book_back')}
            </button>

            {/* Summary */}
            <div className="rounded-2xl p-5 mb-7" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48, #0e4d64)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-semibold text-[16px]">{selectedService?.name}</p>
                  <p className="text-white/50 text-sm">{selectedStaff?.full_name || t('book_anyone')}</p>
                </div>
                {selectedService?.price && (
                  <div>
                    <span className="text-white text-2xl font-bold">{selectedService.price}</span>
                    <span className="text-white/50 text-sm ml-1">{t('book_currency')}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-white/50">
                <span>{formatDate(selectedDate)}</span>
                <span>{selectedTime} · {selectedService?.duration} {t('book_min')}</span>
              </div>
            </div>

            <h2 className="font-playfair text-gray-900 mb-6" style={{ fontSize: '24px', fontWeight: 500 }}>{t('book_your_details')}</h2>

            <div className="space-y-3">
              {[
                { label: t('book_name'), value: customerName, set: setCustomerName, type: 'text', ph: t('book_name_placeholder'), req: true },
                { label: t('book_phone'), value: customerPhone, set: setCustomerPhone, type: 'tel', ph: '+420 777 123 456', req: true },
                { label: t('book_email'), value: customerEmail, set: setCustomerEmail, type: 'email', ph: t('book_email_placeholder'), req: false },
              ].map((f, i) => (
                <div key={i}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{f.label} {f.req && <span className="text-red-400">*</span>}</label>
                  <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium transition-all placeholder:text-gray-300 focus:outline-none focus:border-gray-400 focus:shadow-md" placeholder={f.ph} autoFocus={i === 0} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('book_note')}</label>
                <textarea value={customerNote} onChange={e => setCustomerNote(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium transition-all resize-none placeholder:text-gray-300 focus:outline-none focus:border-gray-400 focus:shadow-md" rows={2} placeholder={t('book_note_placeholder')} />
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3">
              <input type="checkbox" id="gdpr" checked={gdprConsent} onChange={e => setGdprConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 border-gray-300 rounded cursor-pointer flex-shrink-0" style={{ accentColor: '#0f6b7a' }} />
              <label htmlFor="gdpr" className="text-[11px] text-gray-400 cursor-pointer leading-relaxed">{t('book_gdpr')}</label>
            </div>

            {submitError && <div className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">{submitError}</div>}

            <button onClick={handleSubmit} disabled={submitting || !gdprConsent}
              className="w-full mt-6 py-4 text-white rounded-2xl font-semibold text-base transition-all duration-200 disabled:opacity-30 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)', boxShadow: '0 8px 25px rgba(12,45,72,0.3)' }}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('book_confirm')}
            </button>
          </div>
        )}

        {/* KROK 5: HOTOVO */}
        {step === 'done' && (
          <div className="text-center pt-10 pb-4">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8" style={{ background: 'linear-gradient(135deg, #059669, #0f6b7a)', boxShadow: '0 15px 40px rgba(5,150,105,0.25)' }}>
              <Check className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>

            <h2 className="font-playfair text-gray-900 mb-1" style={{ fontSize: '28px', fontWeight: 500 }}>{t('book_confirmed')}</h2>
            <p className="text-gray-400 mb-8 text-sm">{t('book_see_you')}</p>

            <div className="bg-white rounded-2xl p-5 mb-8 text-left border border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{t('book_service')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedService?.color || '#0f6b7a' }} />
                    <span className="font-bold text-gray-900">{selectedService?.name}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{t('book_date')}</span>
                  <span className="font-semibold text-gray-900">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{t('book_time')}</span>
                  <span className="font-semibold text-gray-900">{selectedTime}</span>
                </div>
                {selectedStaff && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{t('book_specialist')}</span>
                    <span className="font-medium text-gray-700">{selectedStaff.full_name}</span>
                  </div>
                )}
                {selectedService?.price && (
                  <>
                    <div className="h-px bg-gray-100" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{t('book_price')}</span>
                      <div>
                        <span className="text-xl font-bold text-gray-900">{selectedService.price}</span>
                        <span className="text-sm font-medium text-gray-500 ml-1">{t('book_currency')}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button onClick={resetAll}
              className="px-8 py-3.5 text-white rounded-2xl font-semibold transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)', boxShadow: '0 8px 25px rgba(12,45,72,0.3)' }}>
              {t('book_another')}
            </button>
            <div className="mt-14 flex items-center justify-center gap-2">
              <Waves className="w-4 h-4 text-gray-300" />
              <span className="text-gray-400 text-[11px] font-bold" style={{ letterSpacing: '0.2em' }}>POWERED BY CLIENTORO</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
