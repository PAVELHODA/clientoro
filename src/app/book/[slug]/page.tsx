// PATH: src/app/book/[slug]/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import {
  Calendar, Clock, User, Phone, Mail, ChevronRight, ChevronLeft, ChevronDown,
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
  const [phoneError, setPhoneError] = useState('')

  const formatPhone = (val: string) => {
    // Odstraníme vše kromě číslic a +
    let clean = val.replace(/[^\d+]/g, '')
    // Automaticky přidáme +420 pokud začíná číslem
    if (clean && !clean.startsWith('+') && !clean.startsWith('00')) {
      if (clean.startsWith('420') || clean.startsWith('421')) clean = '+' + clean
      else if (clean.length <= 9) clean = '+420' + clean
    }
    if (clean.startsWith('00')) clean = '+' + clean.substring(2)
    return clean
  }

  const validatePhone = (val: string): boolean => {
    const clean = val.replace(/[^\d+]/g, '')
    // +420 nebo +421 + 9 číslic
    return /^\+42[01]\d{9}$/.test(clean) || /^\+\d{10,14}$/.test(clean)
  }
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [gdprConsent, setGdprConsent] = useState(false)
  const [lang, setLangState] = useState<PublicLang>('cs')
  const [reminderChecked, setReminderChecked] = useState(true)
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() } })
  const [weekOffset, setWeekOffset] = useState(0)
  const [showMonthly, setShowMonthly] = useState(false)
  const [entryMode, setEntryMode] = useState<'service' | 'specialist' | null>(null)
  const [expandedSpecialist, setExpandedSpecialist] = useState<string | null>(null)

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

  useEffect(() => {
    if (!document.querySelector('link[href*="Poppins"]')) {
      const l = document.createElement('link')
      l.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
      l.rel = 'stylesheet'
      document.head.appendChild(l)
    }
  }, [])


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


  const getLocale = () => lang === 'sk' ? 'sk-SK' : lang === 'en' ? 'en-US' : 'cs-CZ'

  const getCalendarDays = (year: number, month: number) => {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1 // Po=0
    const days: (string | null)[] = []
    for (let i = 0; i < startDay; i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push(ds)
    }
    return days
  }

  const calMonthName = (y: number, m: number) => {
    const d = new Date(y, m, 1)
    return d.toLocaleDateString(getLocale(), { month: 'long', year: 'numeric' })
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const isPast = (d: string) => d < todayStr
  const isFarFuture = (d: string) => {
    const max = new Date(); max.setDate(max.getDate() + 21)
    return d > max.toISOString().split('T')[0]
  }

  const dayNames = lang === 'en' ? ['Mo','Tu','We','Th','Fr','Sa','Su'] : lang === 'sk' ? ['Po','Ut','St','Št','Pi','So','Ne'] : ['Po','Út','St','Čt','Pá','So','Ne']


  const getWeekDays = (offset: number) => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset * 7)
    const days: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      days.push(d.toISOString().split('T')[0])
    }
    return days
  }

  const weekDays = getWeekDays(weekOffset)
  const weekLabel = (() => {
    const first = new Date(weekDays[0])
    const last = new Date(weekDays[6])
    if (first.getMonth() === last.getMonth()) return first.toLocaleDateString(getLocale(), { day: 'numeric' }) + '–' + last.toLocaleDateString(getLocale(), { day: 'numeric', month: 'long' })
    return first.toLocaleDateString(getLocale(), { day: 'numeric', month: 'short' }) + ' – ' + last.toLocaleDateString(getLocale(), { day: 'numeric', month: 'short' })
  })()


  // Kontrola zda je den dostupný (staff pracuje + není time off)
  const isDayAvailable = (dateStr: string) => {
    if (dateStr < todayStr) return false
    const d = new Date(dateStr + 'T12:00:00')
    const dbWeekday = jsToDbWeekday(d.getDay()) // 0=Po...6=Ne

    // Najdi relevantní staff (podle vybrané služby)
    const relevantStaff = selectedStaff
      ? [selectedStaff]
      : staffList.filter(s => {
          const ss = (s as any).staff_services || []
          return ss.length === 0 || ss.some((svc: any) => svc.service_id === selectedService?.id)
        })

    // Aspoň jeden staff musí mít working hours pro tento den
    const anyStaffWorks = relevantStaff.some(s => {
      // Kontrola working hours
      const staffWH = workingHours.filter(wh => wh.staff_id === s.id && wh.weekday === dbWeekday)
      if (staffWH.length === 0 && workingHours.filter(wh => wh.staff_id === s.id).length > 0) return false
      // Kontrola time off
      const hasTimeOff = timeOffs.some(to =>
        to.staff_id === s.id && to.start_at.split('T')[0] <= dateStr && to.end_at.split('T')[0] >= dateStr
      )
      return !hasTimeOff
    })

    return anyStaffWorks
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
    if (!validatePhone(customerPhone)) { setSubmitError(lang === 'en' ? 'Please enter a valid phone number (+420...)' : lang === 'sk' ? 'Zadajte platné telefónne číslo (+420...)' : 'Zadejte platné telefonní číslo (+420...)'); return }
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

  const formatDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString(getLocale(), { weekday: 'short', day: 'numeric', month: 'long' })
  const getDayName = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString(getLocale(), { weekday: 'short' })
  const getDayNum = (d: string) => new Date(d + 'T12:00:00').getDate()
  const getMonthShort = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString(getLocale(), { month: 'short' })
  const isToday = (d: string) => d === new Date().toISOString().split('T')[0]
  const isTomorrow = (d: string) => { const tom = new Date(); tom.setDate(tom.getDate() + 1); return d === tom.toISOString().split('T')[0] }
  const resetAll = () => { setStep('service'); setEntryMode(null); setExpandedSpecialist(null); setSelectedService(null); setSelectedStaff(null); setAnyStaff(false); setSelectedDate(''); setSelectedTime(''); setCustomerName(''); setCustomerPhone(''); setCustomerEmail(''); setCustomerNote(''); setSubmitError(''); setGdprConsent(false) }

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
                const isActive = s.key === step; const isDone = i < stepIndex; const canClick = isDone
                return (
                  <div key={s.key} className="flex items-center">
                    {i > 0 && <div className="w-6 h-px mx-1.5" style={{ background: isDone ? '#059669' : '#e5e7eb' }} />}
                    <button onClick={() => { if (canClick) setStep(s.key as Step) }}
                      className="flex items-center gap-1.5 transition-all" style={{ cursor: canClick ? 'pointer' : 'default' }}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform ${canClick ? 'hover:scale-110' : ''}`}
                        style={isDone ? { background: '#059669', color: '#fff' } : isActive ? { background: '#0c2d48', color: '#fff' } : { background: '#f3f4f6', color: '#9ca3af' }}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <span className="text-[11px] font-medium hidden sm:inline" style={{ color: isActive ? '#0c2d48' : isDone ? '#059669' : '#9ca3af' }}>
                        {s.label}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== GLOW LINE — pod step indicator ===== */}
      {step !== 'done' && (
        <div className="max-w-lg mx-auto px-5 relative z-10 -mt-0.5">
          <div className="relative h-4">
            <div className="absolute left-5 right-5 top-1/2 h-px" style={{ background: 'linear-gradient(90deg, rgba(14,77,100,0.06) 0%, rgba(15,107,122,0.12) 50%, rgba(14,77,100,0.06) 100%)' }} />
            <div className="absolute left-5 top-1/2 h-px transition-all duration-1000 ease-in-out"
              style={{
                width: step === 'service' ? '12.5%' : step === 'staff' ? '37.5%' : step === 'datetime' ? '62.5%' : '87.5%',
                background: 'linear-gradient(90deg, rgba(15,107,122,0.08) 0%, rgba(15,107,122,0.4) 100%)',
              }} />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out"
              style={{ left: `calc(20px + ${step === 'service' ? 12.5 : step === 'staff' ? 37.5 : step === 'datetime' ? 62.5 : 87.5}%)` }}>
              <div className="w-2 h-2 rounded-full" style={{
                background: 'radial-gradient(circle, rgba(15,107,122,0.85) 0%, rgba(14,77,100,0.35) 40%, transparent 70%)',
                boxShadow: '0 0 10px 4px rgba(15,107,122,0.18), 0 0 30px 12px rgba(14,77,100,0.06)',
              }} />
            </div>
          </div>
        </div>
      )}


      {/* ===== KOMPAKTNÍ SUMMARY PANEL ===== */}
      {step !== 'service' && step !== 'done' && (
        <div className="max-w-lg mx-auto px-5 mt-3 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            {selectedService && (
              <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100 text-xs font-medium text-gray-600 shadow-sm">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedService.color || '#0f6b7a' }} />
                {selectedService.name}
                {selectedService.price ? ` · ${selectedService.price} ${lang === 'en' ? 'CZK' : 'Kč'}` : ''}
              </div>
            )}
            {step !== 'staff' && selectedStaff && (
              <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100 text-xs font-medium text-gray-600 shadow-sm">
                <User className="w-3 h-3 text-gray-400" />
                {selectedStaff.full_name}
              </div>
            )}
            {step === 'contact' && selectedDate && (
              <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100 text-xs font-medium text-gray-600 shadow-sm">
                <Calendar className="w-3 h-3 text-gray-400" />
                {formatDate(selectedDate)} · {selectedTime}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ANIMACE ===== */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeSlideIn 0.3s ease-out; }
      `}</style>

      {/* ===== CONTENT ===== */}
      <div className="max-w-lg mx-auto px-5 pt-7 pb-24 relative z-10 animate-fade-in" key={step}>

        {/* KROK 1: SLUŽBY NEBO SPECIALISTA */}
        {step === 'service' && (
          <div>
            <h2 className="font-playfair text-gray-900 mb-5" style={{ fontSize: '24px', fontWeight: 500 }}>
              {entryMode === 'specialist'
                ? (lang === 'en' ? 'Choose a specialist' : lang === 'sk' ? 'Vyberte špecialistu' : 'Vyberte specialistu')
                : entryMode === 'service'
                  ? t('book_choose_service')
                  : (lang === 'en' ? 'How would you like to book?' : lang === 'sk' ? 'Ako sa chcete rezervovať?' : 'Jak se chcete rezervovat?')
              }
            </h2>

            {/* Výběr vstupu — služba nebo specialista */}
            {!entryMode && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => setEntryMode('service')}
                  className="bg-white rounded-2xl p-5 text-center border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {lang === 'en' ? 'Choose service' : lang === 'sk' ? 'Podľa služby' : 'Podle služby'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'en' ? 'I know what I need' : lang === 'sk' ? 'Viem čo potrebujem' : 'Vím co potřebuji'}
                  </p>
                </button>
                <button onClick={() => setEntryMode('specialist')}
                  className="bg-white rounded-2xl p-5 text-center border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {lang === 'en' ? 'Choose specialist' : lang === 'sk' ? 'Podľa špecialistu' : 'Podle specialisty'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'en' ? 'I know who I want' : lang === 'sk' ? 'Viem ku komu chcem' : 'Vím ke komu chci'}
                  </p>
                </button>
              </div>
            )}

            {/* VSTUP A: Podle služby — seskupené podle kategorie */}
            {entryMode === 'service' && (
              <div>
                <button onClick={() => setEntryMode(null)} className="text-sm text-gray-500 flex items-center gap-1.5 hover:text-gray-700 transition-colors mb-5 font-medium">
                  <ChevronLeft className="w-4 h-4" /> {t('book_back')}
                </button>
                <div className="space-y-2.5">
                  {(() => {
                    const categories = new Map<string, typeof services>()
                    services.forEach(svc => {
                      const cat = svc.category || (lang === 'en' ? 'Other' : 'Ostatní')
                      if (!categories.has(cat)) categories.set(cat, [])
                      categories.get(cat)!.push(svc)
                    })
                    const catArray = Array.from(categories.entries())
                    const showHeaders = catArray.length > 1
                    return catArray.map(([cat, catServices]) => (
                      <div key={cat} className={showHeaders ? 'mb-4' : ''}>
                        {showHeaders && <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{cat}</p>}
                        <div className="space-y-2">
                          {catServices.map(svc => (
                            <button key={svc.id} onClick={() => { setSelectedService(svc); setSelectedStaff(null); setAnyStaff(false); setSelectedDate(''); setSelectedTime(''); setStep('staff') }}
                              className="w-full bg-white rounded-2xl p-5 text-left transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80">
                              <div className="flex items-center gap-4">
                                <div className="w-1.5 h-14 rounded-full flex-shrink-0" style={{ backgroundColor: svc.color || '#0f6b7a' }} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-[15px]">{svc.name}</p>
                                  {svc.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{svc.description}</p>}
                                  <span className="text-xs text-gray-500 mt-1.5 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.duration} {t('book_min')}</span>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  {svc.price ? (<div><span className="text-xl font-bold text-gray-900">{svc.price}</span><span className="text-sm font-medium text-gray-500 ml-1.5">{t('book_currency')}</span></div>) : (<span className="text-sm text-gray-400">{lang === 'en' ? 'Free' : 'Zdarma'}</span>)}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            )}

            {/* VSTUP B: Podle specialisty */}
            {entryMode === 'specialist' && (
              <div>
                <button onClick={() => { setEntryMode(null); setExpandedSpecialist(null) }} className="text-sm text-gray-500 flex items-center gap-1.5 hover:text-gray-700 transition-colors mb-5 font-medium">
                  <ChevronLeft className="w-4 h-4" /> {t('book_back')}
                </button>
                <div className="space-y-3">
                  {staffList.filter(s => s.staff_services && s.staff_services.length > 0).map(s => {
                    const isExpanded = expandedSpecialist === s.id
                    const staffServices = services.filter(svc => s.staff_services?.some(ss => ss.service_id === svc.id))
                    return (
                      <div key={s.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all">
                        <button onClick={() => setExpandedSpecialist(isExpanded ? null : s.id)}
                          className="w-full p-5 text-left flex items-center gap-4 hover:bg-gray-50 transition-colors">
                          {s.avatar_url ? (
                            <img src={s.avatar_url} alt={s.full_name} className="w-14 h-14 rounded-xl object-cover" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl text-white flex items-center justify-center font-medium text-sm" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                              {s.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{s.full_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{staffServices.length} {lang === 'en' ? 'services' : lang === 'sk' ? 'služieb' : 'služeb'}</p>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {isExpanded && (
                          <div className="px-5 pb-4 space-y-2 border-t border-gray-50 pt-3">
                            {staffServices.map(svc => (
                              <button key={svc.id} onClick={() => {
                                setSelectedService(svc); setSelectedStaff(s); setAnyStaff(false)
                                setSelectedDate(''); setSelectedTime(''); setStep('datetime')
                              }}
                                className="w-full bg-gray-50 rounded-xl p-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-3">
                                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: svc.color || '#0f6b7a' }} />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 text-sm">{svc.name}</p>
                                  <span className="text-xs text-gray-400">{svc.duration} {t('book_min')}</span>
                                </div>
                                <span className="font-bold text-gray-900 text-sm">{svc.price ? svc.price + ' ' + t('book_currency') : ''}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* KROK 2: SPECIALISTA */}
        {step === 'staff' && (
          <div>
            <button onClick={() => setStep('service')} className="text-sm text-gray-500 flex items-center gap-1.5 hover:text-gray-700 transition-colors mb-5 font-medium">
              <ChevronLeft className="w-4 h-4" /> {t('book_back')}
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
                    <p className="text-xs text-gray-400 mt-0.5">{lang === 'en' ? 'We\'ll assign the first available' : lang === 'sk' ? 'Priradíme prvého voľného' : 'Přiřadíme prvního volného'}</p>
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
            <button onClick={() => setStep('staff')} className="text-sm text-gray-500 flex items-center gap-1.5 hover:text-gray-700 transition-colors mb-5 font-medium">
              <ChevronLeft className="w-4 h-4" /> {t('book_back')}
            </button>
            <h2 className="font-playfair text-gray-900 mb-5" style={{ fontSize: '24px', fontWeight: 500 }}>{t('book_choose_datetime')}</h2>

            {/* ===== TÝDENNÍ KALENDÁŘ ===== */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => { if (weekOffset > 0) setWeekOffset(weekOffset - 1) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-30"
                  disabled={weekOffset === 0}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-gray-700 capitalize">{weekLabel}</span>
                <button onClick={() => { if (weekOffset < 3) setWeekOffset(weekOffset + 1) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-30"
                  disabled={weekOffset >= 3}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDays.map((d, i) => {
                  const available = isDayAvailable(d)
                  const past = d < todayStr
                  const isWeekend = i >= 5
                  const active = selectedDate === d
                  const today = d === todayStr
                  const dayNum = parseInt(d.split('-')[2])
                  const dayLabel = dayNames[i]

                  return (
                    <button key={d} disabled={!available}
                      onClick={() => { if (available) { setSelectedDate(d); setSelectedTime(''); setShowMonthly(false) } }}
                      className="flex flex-col items-center py-2 rounded-xl transition-all duration-200"
                      style={active
                        ? { background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)', color: '#fff', boxShadow: '0 4px 12px rgba(12,45,72,0.25)' }
                        : past
                          ? { opacity: 0.35 }
                          : isWeekend
                            ? { background: 'rgba(14,77,100,0.04)' }
                            : {}
                      }>
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ opacity: active ? 0.7 : 0.5 }}>{dayLabel}</span>
                      <span className={`text-lg font-bold mt-0.5 ${today && !active ? 'text-[#0f6b7a]' : ''}`}>{dayNum}</span>
                      {today && !active && <div className="w-4 h-0.5 rounded-full mt-0.5" style={{ background: '#0f6b7a', opacity: 0.4 }} />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ===== TIME SLOTY ===== */}
            {selectedDate && (
              <div className="mb-4">
                {availableSlots.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                    <p className="text-sm text-gray-400">{t('book_no_slots')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { slots: slotGroups.morning, label: lang === 'en' ? 'Morning' : lang === 'sk' ? 'Ráno' : 'Dopoledne' },
                      { slots: slotGroups.afternoon, label: lang === 'en' ? 'Afternoon' : lang === 'sk' ? 'Popoludnie' : 'Odpoledne' },
                      { slots: slotGroups.evening, label: lang === 'en' ? 'Evening' : lang === 'sk' ? 'Večer' : 'Večer' },
                    ].filter(g => g.slots.length > 0).map(group => (
                      <div key={group.label}>
                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">{group.label}</p>
                        <div className="grid grid-cols-4 gap-2">
                          {group.slots.map(ti => (
                            <button key={ti} onClick={() => { setSelectedTime(ti); setStep('contact') }}
                              className="py-2.5 bg-white rounded-xl text-sm font-semibold text-gray-700 border border-gray-100 transition-all duration-150 hover:shadow-md"
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

            {/* ===== MĚSÍČNÍ KALENDÁŘ — rozbalovací ===== */}
            <button onClick={() => setShowMonthly(!showMonthly)}
              className="w-full py-2.5 bg-white rounded-xl border border-gray-100 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              {showMonthly
                ? (lang === 'en' ? 'Hide month view' : lang === 'sk' ? 'Skryť mesačný pohľad' : 'Skrýt měsíční pohled')
                : (lang === 'en' ? 'Show full month' : lang === 'sk' ? 'Zobraziť celý mesiac' : 'Zobrazit celý měsíc')
              }
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMonthly ? 'rotate-180' : ''}`} />
            </button>

            {showMonthly && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mt-3 transition-all">
                {/* Navigace měsíce */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => {
                    const prev = calMonth.month === 0 ? { year: calMonth.year - 1, month: 11 } : { year: calMonth.year, month: calMonth.month - 1 }
                    const now = new Date(); if (prev.year > now.getFullYear() || (prev.year === now.getFullYear() && prev.month >= now.getMonth())) setCalMonth(prev)
                  }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold text-gray-800 capitalize">{calMonthName(calMonth.year, calMonth.month)}</span>
                  <button onClick={() => {
                    const next = calMonth.month === 11 ? { year: calMonth.year + 1, month: 0 } : { year: calMonth.year, month: calMonth.month + 1 }
                    const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 60)
                    if (next.year < maxDate.getFullYear() || (next.year === maxDate.getFullYear() && next.month <= maxDate.getMonth())) setCalMonth(next)
                  }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Hlavička dnů */}
                <div className="grid grid-cols-7 gap-0">
                  {dayNames.map((d, i) => (
                    <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-2 border-b border-gray-100"
                      style={i >= 5 ? { background: 'rgba(14,77,100,0.03)' } : {}}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grid dnů */}
                <div className="grid grid-cols-7 gap-0">
                  {getCalendarDays(calMonth.year, calMonth.month).map((d, i) => {
                    if (!d) return <div key={'e' + i} className="aspect-square border-b border-r border-gray-50" style={i % 7 >= 5 ? { background: 'rgba(14,77,100,0.03)' } : {}} />
                    const past = isPast(d)
                    const far = isFarFuture(d)
                    const available = !past && !far && isDayAvailable(d)
                    const active = selectedDate === d
                    const today = d === todayStr
                    const isWeekend = i % 7 >= 5
                    const dayNum = parseInt(d.split('-')[2])

                    return (
                      <button key={d} disabled={!available}
                        onClick={() => { if (available) { setSelectedDate(d); setSelectedTime(''); setShowMonthly(false) } }}
                        className="aspect-square flex items-center justify-center border-b border-r border-gray-50 transition-all duration-150 relative"
                        style={{
                          ...(isWeekend && !active ? { background: 'rgba(14,77,100,0.03)' } : {}),
                          ...(active ? { background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)', color: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(12,45,72,0.2)' } : {}),
                          ...(past || far ? { opacity: 0.3 } : {}),
                        }}>
                        <span className={`text-sm font-bold ${today && !active ? 'text-[#0f6b7a]' : ''} ${active ? 'text-white' : ''}`}>{dayNum}</span>
                        {today && !active && <div className="absolute bottom-1 w-4 h-0.5 rounded-full" style={{ background: '#0f6b7a', opacity: 0.5 }} />}
                        {available && !active && !past && <div className="absolute bottom-1.5 w-1 h-1 rounded-full" style={{ background: '#0f6b7a', opacity: 0.3 }} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* KROK 4: KONTAKT */}
        {step === 'contact' && (
          <div>
            <button onClick={() => setStep('datetime')} className="text-sm text-gray-500 flex items-center gap-1.5 hover:text-gray-700 transition-colors mb-5 font-medium">
              <ChevronLeft className="w-4 h-4" /> {t('book_back')}
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
                { label: t('book_phone'), value: customerPhone, set: (v: string) => { setCustomerPhone(formatPhone(v)); setPhoneError('') }, type: 'tel', ph: '+420 777 123 456', req: true },
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
        {step === 'done' && (() => {
          // Konfetti efekt
          if (typeof window !== 'undefined' && !document.getElementById('confetti-style')) {
            const style = document.createElement('style')
            style.id = 'confetti-style'
            style.textContent = `
              @keyframes confetti-fall { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
              .confetti-piece { position: fixed; top: -10px; z-index: 9999; pointer-events: none; animation: confetti-fall 3s ease-in forwards; }
            `
            document.head.appendChild(style)
            const colors = ['#0f6b7a', '#059669', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']
            for (let i = 0; i < 40; i++) {
              const el = document.createElement('div')
              el.className = 'confetti-piece'
              el.style.left = Math.random() * 100 + 'vw'
              el.style.width = (Math.random() * 8 + 4) + 'px'
              el.style.height = (Math.random() * 8 + 4) + 'px'
              el.style.background = colors[Math.floor(Math.random() * colors.length)]
              el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
              el.style.animationDelay = (Math.random() * 2) + 's'
              el.style.animationDuration = (Math.random() * 2 + 2) + 's'
              document.body.appendChild(el)
              setTimeout(() => el.remove(), 5000)
            }
          }
          return null
        })()}
        {step === 'done' && (
          <div className="pt-6 pb-4">
            {/* Poděkování */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #059669, #0f6b7a)', boxShadow: '0 12px 30px rgba(5,150,105,0.25)' }}>
                <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="font-poppins text-gray-900 mb-2" style={{ fontSize: '22px', fontWeight: 600 }}>
                {lang === 'en' ? 'Reservation confirmed!' : lang === 'sk' ? 'Rezervácia potvrdená!' : 'Rezervace potvrzena!'}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                {lang === 'en'
                  ? 'Thank you! We look forward to meeting you.'
                  : lang === 'sk'
                    ? 'Ďakujeme! Tešíme sa na stretnutie s Vami.'
                    : 'Děkujeme! Těšíme se na společný čas.'}
              </p>
            </div>

            {/* Shrnutí rezervace */}
            <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48, #0e4d64)' }}>
              <div className="p-5">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">
                  {lang === 'en' ? 'Reservation summary' : lang === 'sk' ? 'Zhrnutie rezervácie' : 'Shrnutí rezervace'}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <span className="text-white/50 text-sm">{lang === 'en' ? 'Client' : 'Klient'}</span>
                    <span className="text-white font-semibold text-sm ml-auto">{customerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedService?.color || '#0f6b7a' }} />
                    </div>
                    <span className="text-white/50 text-sm">{lang === 'en' ? 'Service' : 'Služba'}</span>
                    <span className="text-white font-semibold text-sm ml-auto">{selectedService?.name}</span>
                  </div>
                  {selectedStaff && (
                    <div className="flex items-center gap-3">
                      <Star className="w-4 h-4 text-white/30 flex-shrink-0" />
                      <span className="text-white/50 text-sm">{lang === 'en' ? 'Specialist' : 'Specialista'}</span>
                      <span className="text-white font-semibold text-sm ml-auto">{selectedStaff.full_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <span className="text-white/50 text-sm">{lang === 'en' ? 'Date' : 'Datum'}</span>
                    <span className="text-white font-semibold text-sm ml-auto">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <span className="text-white/50 text-sm">{lang === 'en' ? 'Time' : 'Čas'}</span>
                    <span className="text-white font-semibold text-sm ml-auto">{selectedTime}</span>
                  </div>
                  {selectedService?.price && (
                    <>
                      <div className="h-px bg-white/10 my-1" />
                      <div className="flex items-center gap-3">
                        <span className="text-white/50 text-sm ml-7">{lang === 'en' ? 'Price' : 'Cena'}</span>
                        <span className="text-white font-bold text-lg ml-auto">{selectedService.price} <span className="text-white/40 text-sm font-normal">{t('book_currency')}</span></span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Co bude dál */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-5 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                {lang === 'en' ? 'What happens next?' : lang === 'sk' ? 'Čo bude nasledovať?' : 'Co bude následovat?'}
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                    <Mail className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {lang === 'en' ? 'Confirmation email' : lang === 'sk' ? 'Potvrdzovací e-mail' : 'Potvrzovací e-mail'}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {lang === 'en'
                        ? 'You will receive a confirmation with all the details to your email shortly.'
                        : lang === 'sk'
                          ? 'Čoskoro Vám príde e-mail s potvrdením a všetkými detailmi.'
                          : 'Brzy Vám přijde e-mail s potvrzením a všemi detaily.'}
                    </p>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${reminderChecked ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 group-hover:border-emerald-400'}`}
                      onClick={() => setReminderChecked(!reminderChecked)}>
                      {reminderChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div onClick={() => setReminderChecked(!reminderChecked)}>
                    <p className="text-sm font-semibold text-gray-800">
                      {lang === 'en' ? 'Send me a reminder the day before' : lang === 'sk' ? 'Pošlite mi pripomienku deň vopred' : 'Pošlete mi připomínku den předem'}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {lang === 'en'
                        ? 'We\'ll email you a reminder so you don\'t forget.'
                        : lang === 'sk'
                          ? 'Pošleme Vám e-mail, aby ste nezabudli.'
                          : 'Pošleme Vám e-mail, abyste nezapomněli.'}
                    </p>
                  </div>
                </label>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-amber-50">
                    <MessageSquare className="w-3 h-3 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {lang === 'en' ? 'Need to change or cancel?' : lang === 'sk' ? 'Potrebujete zmeniť alebo zrušiť?' : 'Potřebujete změnit nebo zrušit?'}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {lang === 'en'
                        ? 'You can easily change or cancel your reservation via the link in the confirmation email.'
                        : lang === 'sk'
                          ? 'Rezerváciu môžete jednoducho zmeniť alebo zrušiť cez odkaz v potvrdzujúcom e-maile.'
                          : 'Rezervaci můžete jednoduše změnit nebo zrušit přes odkaz v potvrzovacím e-mailu.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa */}
            {org?.address && (
              <a href={`https://maps.google.com/?q=${encodeURIComponent(org.address)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 mb-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{lang === 'en' ? 'Show on map' : lang === 'sk' ? 'Zobraziť na mape' : 'Zobrazit na mapě'}</p>
                  <p className="text-sm text-gray-700 font-medium truncate">{org.address}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </a>
            )}

            {/* Přidat do kalendáře */}
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent((selectedService?.name || '') + ' — ' + (org?.name || ''))}&dates=${selectedDate.replace(/-/g, '')}T${selectedTime.replace(':', '')}00/${selectedDate.replace(/-/g, '')}T${(() => { const [h, m] = selectedTime.split(':').map(Number); const end = h * 60 + m + (selectedService?.duration || 60); return String(Math.floor(end / 60)).padStart(2, '0') + String(end % 60).padStart(2, '0'); })()}00&location=${encodeURIComponent(org?.address || '')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 mb-3 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{lang === 'en' ? 'Add to calendar' : lang === 'sk' ? 'Pridať do kalendára' : 'Přidat do kalendáře'}</p>
                <p className="text-sm text-gray-700 font-medium">Google Calendar</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </a>

            {/* Kontakt na salon */}

            {/* Další rezervace */}
            <button onClick={resetAll}
              className="w-full py-3.5 text-white rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)', boxShadow: '0 8px 25px rgba(12,45,72,0.3)' }}>
              {lang === 'en' ? 'Book another appointment' : lang === 'sk' ? 'Rezervovať ďalší termín' : 'Rezervovat další termín'}
            </button>

            <div className="mt-10 flex items-center justify-center gap-2">
              <Waves className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-gray-300 text-[10px] font-semibold" style={{ letterSpacing: '0.2em' }}>POWERED BY CLIENTORORO</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
