// PATH: src/app/book/[slug]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Calendar, Clock, User, Phone, Mail, ChevronRight, ChevronLeft,
  Check, Loader2, MapPin, Waves,
} from 'lucide-react'

interface Organization {
  id: string; name: string; mode: string; work_start: number; work_end: number
  slug: string; description: string | null; phone: string | null
  address: string | null; logo_url: string | null
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/public/booking?slug=${slug}`)
        if (!res.ok) { setError('Salon not found'); setLoading(false); return }
        const data = await res.json()
        setOrg(data.organization)
        setServices(data.services || [])
        setStaffList(data.staff || [])
        setWorkingHours(data.working_hours || [])
        setTimeOffs(data.time_off || [])
        setExistingBookings(data.bookings || [])
      } catch { setError('Loading error') }
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
    if (!customerName.trim() || !customerPhone.trim()) { setSubmitError('Please fill in name and phone'); return }
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
      else setSubmitError(result.error || 'Error')
    } catch { setSubmitError('Connection error') }
    finally { setSubmitting(false) }
  }

  const formatDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' })

  const resetAll = () => {
    setStep('service'); setSelectedService(null); setSelectedStaff(null); setAnyStaff(false)
    setSelectedDate(''); setSelectedTime(''); setCustomerName(''); setCustomerPhone('')
    setCustomerEmail(''); setCustomerNote(''); setSubmitError('')
  }

  const availableDates = getAvailableDates()
  const availableSlots = getAvailableSlots()

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" /><p className="text-gray-500">Loading...</p></div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl p-8 shadow-lg"><p className="text-red-500 text-lg font-medium">{error}</p></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{org?.name}</h1>
              {org?.address && <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {org.address}</p>}
            </div>
          </div>
        </div>
      </div>

      {step !== 'done' && (
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-1">
            {['service', 'staff', 'datetime', 'contact'].map((s, i) => {
              const steps: Step[] = ['service', 'staff', 'datetime', 'contact']
              return <div key={s} className="flex-1"><div className={`h-1.5 rounded-full transition-all ${i <= steps.indexOf(step) ? 'bg-blue-500' : 'bg-gray-200'}`} /></div>
            })}
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>Service</span><span>Who</span><span>When</span><span>Contact</span>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pb-8">
        {step === 'service' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Choose a service</h2>
            <div className="space-y-3">
              {services.map(svc => (
                <button key={svc.id} onClick={() => { setSelectedService(svc); setSelectedStaff(null); setAnyStaff(false); setSelectedDate(''); setSelectedTime(''); setStep('staff') }}
                  className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: svc.color }} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{svc.name}</h3>
                      {svc.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{svc.description}</p>}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.duration} min</span>
                        {svc.price && <span className="text-sm font-bold text-blue-600">{svc.price} CZK</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                  </div>
                </button>
              ))}
              {services.length === 0 && <div className="bg-white rounded-xl p-8 text-center"><p className="text-gray-500">No available services</p></div>}
            </div>
          </div>
        )}

        {step === 'staff' && (
          <div>
            <button onClick={() => setStep('service')} className="flex items-center gap-1 text-sm text-blue-600 mb-4 hover:text-blue-700">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Choose a specialist</h2>
            <p className="text-sm text-gray-500 mb-4">For service: <strong>{selectedService?.name}</strong></p>
            <button onClick={() => { setSelectedStaff(null); setAnyStaff(true); setSelectedDate(''); setSelectedTime(''); setStep('datetime') }}
              className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-md transition-all mb-3 group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><User className="w-6 h-6 text-gray-400" /></div>
                <div className="flex-1"><h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Anyone available</h3><p className="text-sm text-gray-500">We will assign a free specialist</p></div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
              </div>
            </button>
            {availableStaff.map(s => (
              <button key={s.id} onClick={() => { setSelectedStaff(s); setAnyStaff(false); setSelectedDate(''); setSelectedTime(''); setStep('datetime') }}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-md transition-all mb-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                    {s.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1"><h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{s.full_name}</h3></div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'datetime' && (
          <div>
            <button onClick={() => setStep('staff')} className="flex items-center gap-1 text-sm text-blue-600 mb-4 hover:text-blue-700">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Choose date & time</h2>
            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><Calendar className="w-4 h-4 text-blue-500" /> Date</h3>
              <div className="flex flex-wrap gap-2">
                {availableDates.map(d => (
                  <button key={d} onClick={() => { setSelectedDate(d); setSelectedTime('') }}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedDate === d ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'}`}>
                    {formatDate(d)}
                  </button>
                ))}
              </div>
              {availableDates.length === 0 && <p className="text-sm text-gray-400 mt-2">No available dates.</p>}
            </div>
            {selectedDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" /> Time</h3>
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map(t => (
                    <button key={t} onClick={() => { setSelectedTime(t); setStep('contact') }}
                      className="py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50">
                      {t}
                    </button>
                  ))}
                </div>
                {availableSlots.length === 0 && <p className="text-sm text-gray-400 mt-2">No available times</p>}
              </div>
            )}
          </div>
        )}

        {step === 'contact' && (
          <div>
            <button onClick={() => setStep('datetime')} className="flex items-center gap-1 text-sm text-blue-600 mb-4 hover:text-blue-700">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your details</h2>
            <div className="bg-blue-50 rounded-xl p-4 mb-5 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-blue-600">Service:</span><span className="font-medium text-gray-900">{selectedService?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-blue-600">Specialist:</span><span className="font-medium text-gray-900">{selectedStaff?.full_name || 'Anyone available'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-blue-600">Date & time:</span><span className="font-medium text-gray-900">{formatDate(selectedDate)} at {selectedTime}</span></div>
              <div className="flex justify-between text-sm"><span className="text-blue-600">Duration:</span><span className="font-medium text-gray-900">{selectedService?.duration} min</span></div>
              {selectedService?.price && <div className="flex justify-between text-sm"><span className="text-blue-600">Price:</span><span className="font-medium text-gray-900">{selectedService.price} CZK</span></div>}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="John Smith" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="+420 777 123 456" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="john@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                <textarea value={customerNote} onChange={e => setCustomerNote(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Special requests..." />
              </div>
            </div>
            {submitError && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{submitError}</p>}
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full mt-5 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm booking'}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking confirmed!</h2>
            <p className="text-gray-500 mb-5">Everything is set. We look forward to seeing you!</p>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-left space-y-3 mb-6 shadow-sm">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Service</span><span className="text-gray-900">{selectedService?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Date & time</span><span className="font-semibold text-gray-900">{formatDate(selectedDate)} at {selectedTime}</span></div>
              {selectedStaff && <div className="flex justify-between text-sm"><span className="text-gray-500">Specialist</span><span className="text-gray-900">{selectedStaff.full_name}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-500">Client</span><span className="font-semibold text-gray-900">{customerName}</span></div>
              {selectedService?.price && <div className="flex justify-between text-sm border-t border-gray-100 pt-3"><span className="text-gray-500">Price</span><span className="text-gray-900">{selectedService.price} CZK</span></div>}
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-sm text-emerald-700 mb-6 flex items-center gap-2 justify-center">
              <Check className="w-4 h-4 flex-shrink-0" /> Confirmation sent to {customerPhone}
            </div>
            <button onClick={resetAll} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium">
              Book another appointment
            </button>
          </div>
        )}
      </div>

      <div className="text-center py-4 text-xs text-gray-400">
        Powered by <span className="font-medium text-gray-500">Clientoro</span>
      </div>
    </div>
  )
}
