// PATH: src/app/book/[slug]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Calendar, Clock, User, Phone, Mail, ChevronRight, ChevronLeft,
  Check, Loader2, MapPin, Waves,
} from 'lucide-react'
import { PublicLang, publicTranslations } from '@/lib/publicI18n'

const flags: Record<PublicLang, string> = { cs: '🇨🇿', sk: '🇸🇰', en: '🇬🇧' }

interface Organization {
  id: string; name: string; mode: string; work_start: number; work_end: number
  slug: string; description: string | null; phone: string | null
  address: string | null; logo_url: string | null; language?: string
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

  const setLang = (l: PublicLang) => {
    localStorage.setItem('clientoro_book_lang', l)
    setLangState(l)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/public/booking?slug=${slug}`)
        if (!res.ok) { setError('book_not_found'); setLoading(false); return }
        const data = await res.json()
        setOrg(data.organization)
        setServices(data.services || [])
        setStaffList(data.staff || [])
        setWorkingHours(data.working_hours || [])
        setTimeOffs(data.time_off || [])
        setExistingBookings(data.bookings || [])

        // Jazyk: 1) localStorage override, 2) jazyk organizace, 3) cs
        const stored = localStorage.getItem('clientoro_book_lang') as PublicLang | null
        if (stored && ['cs', 'sk', 'en'].includes(stored)) {
          setLangState(stored)
        } else if (data.organization?.language && ['cs', 'sk', 'en'].includes(data.organization.language)) {
          setLangState(data.organization.language as PublicLang)
        }
      } catch { setError('book_load_error') }
      finally { setLoading(false) }
    }
    if (slug) fetchData()
  }, [slug])

  const availableStaff = selectedService
    ? staffList.filter(s => s.staff_services?.some(ss => ss.service_id === selectedService.id))
    : staffList

  const relevantStaff = selectedStaff ? [selectedStaff] : availableStaff

  const jsToDbWeekday = (jsDay: number) => jsDay === 0 ? 6 : jsDay - 1

  const hasAnyStaffWorking = (dateStr: string): boolean => {
    const date = new Date(dateStr + 'T12:00:00')
    const weekday = jsToDbWeekday(date.getDay())
    const relevantWH = workingHours.filter(wh => relevantStaff.some(s => s.id === wh.staff_id))
    if (relevantWH.length === 0) return weekday < 5
    return relevantStaff.some(staff => {
      const hasWH = relevantWH.some(wh => wh.staff_id === staff.id && wh.weekday === weekday)
      if (!hasWH) return false
      return !timeOffs.some(to => to.staff_id === staff.id && dateStr >= to.start_at.split('T')[0] && dateStr <= to.end_at.split('T')[0])
    })
  }

  const getAvailableDates = () => {
    const dates: string[] = []
    const today = new Date()
    for (let i = 0; i < 21; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      if (hasAnyStaffWorking(dateStr)) dates.push(dateStr)
    }
    return dates
  }

  const getAvailableSlots = () => {
    if (!selectedDate || !selectedService) return []
    const date = new Date(selectedDate + 'T12:00:00')
    const weekday = jsToDbWeekday(date.getDay())
    const duration = selectedService.duration
    const now = new Date()
    const isToday = selectedDate === now.toISOString().split('T')[0]
    const slots: string[] = []
    const relevantWH = workingHours.filter(wh => relevantStaff.some(s => s.id === wh.staff_id) && wh.weekday === weekday)
    const timeRanges: { start: number; end: number; staffId: string | null }[] = []
    if (relevantWH.length === 0) {
      timeRanges.push({ start: (org?.work_start || 8) * 60, end: (org?.work_end || 17) * 60, staffId: null })
    } else {
      for (const wh of relevantWH) {
        const [sh, sm] = wh.start_time.split(':').map(Number)
        const [eh, em] = wh.end_time.split(':').map(Number)
        timeRanges.push({ start: sh * 60 + (sm || 0), end: eh * 60 + (em || 0), staffId: wh.staff_id })
      }
    }
    const earliestStart = Math.min(...timeRanges.map(r => r.start))
    const latestEnd = Math.max(...timeRanges.map(r => r.end))
    for (let mins = earliestStart; mins + duration <= latestEnd; mins += 30) {
      const h = Math.floor(mins / 60); const m = mins % 60
      const slotTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const slotStartDate = new Date(`${selectedDate}T${slotTime}:00`)
      const slotEndDate = new Date(slotStartDate.getTime() + duration * 60000)
      if (isToday && slotStartDate <= now) continue
      const slotStartISO = slotStartDate.toISOString()
      const slotEndISO = slotEndDate.toISOString()
      const hasAvailableStaff = relevantStaff.some(staff => {
        const staffWH = timeRanges.find(r => r.staffId === staff.id || r.staffId === null)
        if (!staffWH) return false
        if (mins < staffWH.start || mins + duration > staffWH.end) return false
        return !existingBookings.some(b => b.staff_id === staff.id && b.start_at < slotEndISO && b.end_at > slotStartISO)
      })
      if (hasAvailableStaff && !slots.includes(slotTime)) slots.push(slotTime)
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
      const slotEndISO = endDate.toISOString()
      const weekday = jsToDbWeekday(startDate.getDay())
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
        body: JSON.stringify({
          slug, service_id: selectedService?.id, staff_id: staffId,
          start_at: startDate.toISOString(), end_at: endDate.toISOString(),
          customer_name: customerName.trim(), customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim() || null, note: customerNote.trim() || null,
          price: selectedService?.price || null,
        }),
      })
      const result = await res.json()
      if (res.ok) setStep('done')
      else setSubmitError(result.error || t('book_load_error'))
    } catch { setSubmitError(t('book_error_connection')) }
    finally { setSubmitting(false) }
  }

  const getLocale = () => lang === 'sk' ? 'sk-SK' : lang === 'en' ? 'en-US' : 'cs-CZ'

  const formatDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString(getLocale(), { weekday: 'short', day: 'numeric', month: 'long' })

  const resetAll = () => {
    setStep('service'); setSelectedService(null); setSelectedStaff(null); setAnyStaff(false)
    setSelectedDate(''); setSelectedTime(''); setCustomerName(''); setCustomerPhone('')
    setCustomerEmail(''); setCustomerNote(''); setSubmitError(''); setGdprConsent(false)
  }

  const availableDates = getAvailableDates()
  const availableSlots = getAvailableSlots()

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" /><p className="text-gray-500">{t('book_loading')}</p></div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl p-8 shadow-lg"><p className="text-red-500 text-lg font-medium">{t(error)}</p></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{org?.name}</h1>
                {org?.address && <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {org.address}</p>}
              </div>
            </div>
            {/* Language switcher */}
            <div className="flex gap-1">
              {(['cs', 'sk', 'en'] as PublicLang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${lang === l ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-400 hover:text-gray-600'}`}>
                  {flags[l]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {step !== 'done' && (
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-1">
            {['service', 'staff', 'datetime', 'contact'].map((s, i) => {
              const steps: Step[] = ['service', 'staff', 'datetime', 'contact']
              return <div key={s} className="flex-1"><div className={`h-1.5 rounded-full transition-all ${i <= steps.indexOf(step) ? 'bg-blue-500' : 'bg-gray-200'}`} /></div>
            })}
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>{t('book_step_service')}</span><span>{t('book_step_who')}</span><span>{t('book_step_when')}</span><span>{t('book_step_contact')}</span>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pb-8">

        {/* KROK 1: Výběr služby */}
        {step === 'service' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('book_choose_service')}</h2>
            <div className="space-y-3">
              {services.map(svc => (
                <button key={svc.id} onClick={() => { setSelectedService(svc); setSelectedStaff(null); setAnyStaff(false); setSelectedDate(''); setSelectedTime(''); setStep('staff') }}
                  className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: svc.color || '#3b82f6' }}>
                      {svc.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{svc.name}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.duration} {t('book_min')}</span>
                        {svc.price && <span className="font-medium text-gray-700">{svc.price} {t('book_currency')}</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* KROK 2: Výběr specialisty */}
        {step === 'staff' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('book_choose_specialist')}</h2>
            <button onClick={() => { setSelectedStaff(null); setAnyStaff(true); setSelectedDate(''); setSelectedTime(''); setStep('datetime') }}
              className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-md transition-all mb-3">
              <p className="font-semibold text-gray-900">{t('book_anyone')}</p>
            </button>
            {availableStaff.map(s => (
              <button key={s.id} onClick={() => { setSelectedStaff(s); setAnyStaff(false); setSelectedDate(''); setSelectedTime(''); setStep('datetime') }}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-md transition-all mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-sm">
                    {s.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <p className="font-semibold text-gray-900">{s.full_name}</p>
                  <ChevronRight className="w-5 h-5 text-gray-300 ml-auto" />
                </div>
              </button>
            ))}
            <button onClick={() => setStep('service')} className="mt-3 text-sm text-gray-500 flex items-center gap-1 hover:text-blue-600">
              <ChevronLeft className="w-4 h-4" /> {t('book_back')}
            </button>
          </div>
        )}

        {/* KROK 3: Výběr data a času */}
        {step === 'datetime' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('book_choose_datetime')}</h2>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">{t('book_date')}</p>
              <div className="grid grid-cols-3 gap-2">
                {availableDates.map(d => (
                  <button key={d} onClick={() => { setSelectedDate(d); setSelectedTime('') }}
                    className={`p-2.5 rounded-xl text-sm font-medium border transition-all ${selectedDate === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}>
                    {formatDate(d)}
                  </button>
                ))}
              </div>
            </div>
            {selectedDate && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t('book_time')}</p>
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map(ti => (
                    <button key={ti} onClick={() => { setSelectedTime(ti); setStep('contact') }}
                      className={`p-2.5 rounded-xl text-sm font-medium border transition-all ${selectedTime === ti ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}>
                      {ti}
                    </button>
                  ))}
                </div>
                {availableSlots.length === 0 && <p className="text-sm text-gray-400 text-center py-4">{t('book_no_slots')}</p>}
              </div>
            )}
            <button onClick={() => setStep('staff')} className="mt-4 text-sm text-gray-500 flex items-center gap-1 hover:text-blue-600">
              <ChevronLeft className="w-4 h-4" /> {t('book_back')}
            </button>
          </div>
        )}

        {/* KROK 4: Kontaktní údaje */}
        {step === 'contact' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('book_your_details')}</h2>

            {/* Shrnutí rezervace */}
            <div className="bg-blue-50 rounded-xl p-3 mb-4 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-blue-600">{t('book_service')}</span><span className="font-medium text-gray-900">{selectedService?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-blue-600">{t('book_specialist')}</span><span className="font-medium text-gray-900">{selectedStaff?.full_name || t('book_anyone')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-blue-600">{t('book_datetime')}</span><span className="font-medium text-gray-900">{formatDate(selectedDate)}, {selectedTime}</span></div>
              <div className="flex justify-between text-sm"><span className="text-blue-600">{t('book_duration')}</span><span className="font-medium text-gray-900">{selectedService?.duration} {t('book_min')}</span></div>
              {selectedService?.price && <div className="flex justify-between text-sm"><span className="text-blue-600">{t('book_price')}</span><span className="font-medium text-gray-900">{selectedService.price} {t('book_currency')}</span></div>}
            </div>

            {/* Formulář */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('book_name')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder={t('book_name_placeholder')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('book_phone')}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="+420 777 123 456" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('book_email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder={t('book_email_placeholder')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('book_note')}</label>
                <textarea value={customerNote} onChange={e => setCustomerNote(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" rows={2} placeholder={t('book_note_placeholder')} />
              </div>
            </div>

            {/* GDPR souhlas */}
            <div className="mt-4 flex items-start gap-3">
              <input type="checkbox" id="gdpr" checked={gdprConsent} onChange={e => setGdprConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="gdpr" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
                {t('book_gdpr')}
              </label>
            </div>

            {submitError && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{submitError}</p>}

            <button onClick={handleSubmit} disabled={submitting || !gdprConsent}
              className="w-full mt-5 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('book_confirm')}
            </button>
            <button onClick={() => setStep('datetime')} className="w-full mt-2 text-sm text-gray-500 flex items-center justify-center gap-1 hover:text-blue-600">
              <ChevronLeft className="w-4 h-4" /> {t('book_back')}
            </button>
          </div>
        )}

        {/* KROK 5: Potvrzení */}
        {step === 'done' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('book_confirmed')}</h2>
            <p className="text-gray-500 mb-6">{t('book_see_you')}</p>
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('book_service')}</span><span className="font-medium">{selectedService?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('book_date')}:</span><span className="font-medium">{formatDate(selectedDate)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('book_time')}:</span><span className="font-medium">{selectedTime}</span></div>
              {selectedStaff && <div className="flex justify-between text-sm"><span className="text-gray-500">{t('book_specialist')}</span><span className="font-medium">{selectedStaff.full_name}</span></div>}
            </div>
            <button onClick={resetAll} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              {t('book_another')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
