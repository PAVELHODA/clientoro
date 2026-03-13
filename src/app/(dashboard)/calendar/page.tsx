// PATH: src/app/(dashboard)/calendar/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useLang } from '../layout'
import {
  Calendar, ChevronLeft, ChevronRight, Clock, Plus,
  X, User, Phone, Loader2, Filter,
} from 'lucide-react'

interface Booking {
  id: string
  client_id: string | null
  service_id: string
  staff_id: string | null
  start_at: string
  end_at: string
  status: string
  price: number | null
  customer_name: string | null
  customer_phone: string | null
  clients: { full_name: string; phone: string | null } | null
  services: { name: string; color: string; duration: number } | null
  staff: { full_name: string } | null
}

interface Service { id: string; name: string; color: string; duration: number; price: number | null }
interface StaffMember { id: string; full_name: string }
type ViewMode = 'day' | 'week' | 'month'

export default function CalendarPage() {
  const { organization } = useAuth()
  const { t, lang } = useLang()
  const locale = lang === 'sk' ? 'sk-SK' : lang === 'en' ? 'en-US' : 'cs-CZ'
  const currency = t('currency')

  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [filterStaff, setFilterStaff] = useState<string>('all')
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null)
  const [showDetail, setShowDetail] = useState<Booking | null>(null)
  const [qbService, setQbService] = useState('')
  const [qbStaff, setQbStaff] = useState('')
  const [qbName, setQbName] = useState('')
  const [qbPhone, setQbPhone] = useState('')
  const [qbSaving, setQbSaving] = useState(false)

  const workStart = organization?.work_start || 8
  const workEnd = organization?.work_end || 17
  
  // Handle booking status change
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      
      // Update local state
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
      setShowDetail(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (e) {
      alert(lang === 'en' ? 'Error updating status' : 'Chyba při aktualizaci stavu')
    }
  }
  const dayNames = lang === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : lang === 'sk'
    ? ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']
    : ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

  const l = {
    title: t('cal_title'),
    today: lang === 'en' ? 'Today' : lang === 'sk' ? 'Dnes' : 'Dnes',
    day: lang === 'en' ? 'Day' : 'Den',
    week: lang === 'en' ? 'Week' : lang === 'sk' ? 'Týždeň' : 'Týden',
    month: lang === 'en' ? 'Month' : lang === 'sk' ? 'Mesiac' : 'Měsíc',
    all: lang === 'en' ? 'All' : lang === 'sk' ? 'Všetci' : 'Všichni',
    bookings: lang === 'en' ? 'Bookings' : lang === 'sk' ? 'Rezervácií' : 'Rezervací',
    revenue: lang === 'en' ? 'Revenue' : lang === 'sk' ? 'Tržby' : 'Tržby',
    freeSlots: lang === 'en' ? 'Free slots' : lang === 'sk' ? 'Voľných slotov' : 'Volných slotů',
    newBooking: t('cal_new_booking'),
    booking: lang === 'en' ? 'Booking' : lang === 'sk' ? 'Rezervácia' : 'Rezervace',
    client: lang === 'en' ? 'Client' : 'Klient',
    service: t('cal_service'),
    specialist: lang === 'en' ? 'Specialist' : lang === 'sk' ? 'Špecialista' : 'Specialista',
    clientName: lang === 'en' ? 'Client name *' : lang === 'sk' ? 'Meno klienta *' : 'Jméno klienta *',
    phone: lang === 'en' ? 'Phone *' : lang === 'sk' ? 'Telefón *' : 'Telefon *',
    anyone: lang === 'en' ? 'Anyone' : lang === 'sk' ? 'Ktokoľvek' : 'Kdokoliv',
    select: lang === 'en' ? 'Select...' : lang === 'sk' ? 'Vyberte...' : 'Vyberte...',
    createBooking: lang === 'en' ? '✅ Create booking' : lang === 'sk' ? '✅ Vytvoriť rezerváciu' : '✅ Vytvořit rezervaci',
    bookingDetail: lang === 'en' ? 'Booking detail' : lang === 'sk' ? 'Detail rezervácie' : 'Detail rezervace',
    time: lang === 'en' ? 'Time' : 'Čas',
    price: t('cal_price'),
    status: lang === 'en' ? 'Status' : 'Stav',
    confirmed: lang === 'en' ? 'Confirmed' : lang === 'sk' ? 'Potvrdená' : 'Potvrzena',
    completed: lang === 'en' ? 'Completed' : lang === 'sk' ? 'Dokončená' : 'Dokončena',
    close: lang === 'en' ? 'Close' : lang === 'sk' ? 'Zavrieť' : 'Zavřít',
    unknown: lang === 'en' ? 'Unknown' : lang === 'sk' ? 'Neznámy' : 'Neznámý',
    rez: lang === 'en' ? 'book.' : 'rez.',
    at: lang === 'en' ? 'at' : 'v',
  }

  // Date helpers
  const toDateStr = (d: Date) => d.toISOString().split('T')[0]
  const todayStr = toDateStr(new Date())
  const dateStr = toDateStr(currentDate)

  const getMonday = (d: Date) => {
    const date = new Date(d)
    const day = date.getDay()
    const diff = day === 0 ? -6 : 1 - day
    date.setDate(date.getDate() + diff)
    return date
  }

  const getWeekDays = () => {
    const monday = getMonday(currentDate)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d
    })
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDay = firstDay.getDay() === 0 ? -5 : 2 - firstDay.getDay()
    const days: Date[] = []
    for (let i = startDay; i <= lastDay.getDate() + (7 - lastDay.getDay()); i++) {
      days.push(new Date(year, month, i))
    }
    return days.slice(0, 42)
  }

  const getDateRange = () => {
    if (viewMode === 'day') return { start: dateStr, end: dateStr }
    if (viewMode === 'week') {
      const days = getWeekDays()
      return { start: toDateStr(days[0]), end: toDateStr(days[6]) }
    }
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return { start: toDateStr(new Date(year, month, 1)), end: toDateStr(new Date(year, month + 1, 0)) }
  }

  const fetchData = async () => {
    try {
      const range = getDateRange()
      const [bRes, sRes, stRes] = await Promise.all([
        fetch(`/api/bookings?start=${range.start}&end=${range.end}`),
        fetch('/api/services'),
        fetch('/api/staff'),
      ])
      const [bData, sData, stData] = await Promise.all([bRes.json(), sRes.json(), stRes.json()])
      if (Array.isArray(bData)) setBookings(bData)
      if (Array.isArray(sData)) setServices(sData)
      if (Array.isArray(stData)) setStaffList(stData)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { setLoading(true); fetchData() }, [currentDate, viewMode])

  const goToday = () => setCurrentDate(new Date())
  const goPrev = () => {
    const d = new Date(currentDate)
    if (viewMode === 'day') d.setDate(d.getDate() - 1)
    else if (viewMode === 'week') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1)
    setCurrentDate(d)
  }
  const goNext = () => {
    const d = new Date(currentDate)
    if (viewMode === 'day') d.setDate(d.getDate() + 1)
    else if (viewMode === 'week') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
    setCurrentDate(d)
  }

  const formatHeader = () => {
    if (viewMode === 'day') return currentDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (viewMode === 'week') {
      const days = getWeekDays()
      return `${days[0].toLocaleDateString(locale, { day: 'numeric', month: 'short' })} — ${days[6].toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`
    }
    return currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  }

  const timeSlots: string[] = []
  for (let h = workStart; h < workEnd; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`)
    timeSlots.push(`${String(h).padStart(2, '0')}:30`)
  }

  const filteredBookings = bookings.filter(b => {
    if (b.status === 'cancelled') return false
    if (filterStaff !== 'all' && b.staff_id !== filterStaff) return false
    return true
  })

  const getBookingsForDateSlot = (date: string, time: string) => {
    const slotStart = new Date(`${date}T${time}:00`)
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000)
    return filteredBookings.filter(b => {
      const bDate = b.start_at.split('T')[0]
      if (bDate !== date) return false
      const bStart = new Date(b.start_at)
      const bEnd = new Date(b.end_at)
      return bStart < slotEnd && bEnd > slotStart
    })
  }

  const isBookingStart = (date: string, time: string, booking: Booking) => {
    const bStart = new Date(booking.start_at)
    const bDate = booking.start_at.split('T')[0]
    if (bDate !== date) return false
    const bTime = `${String(bStart.getHours()).padStart(2, '0')}:${String(bStart.getMinutes()).padStart(2, '0')}`
    return bTime === time
  }

  const getBookingSlotCount = (booking: Booking) => {
    const start = new Date(booking.start_at)
    const end = new Date(booking.end_at)
    return Math.ceil((end.getTime() - start.getTime()) / (30 * 60000))
  }

  const getBookingsForDate = (date: string) =>
    filteredBookings.filter(b => b.start_at.split('T')[0] === date)

  const handleQuickBook = async () => {
    if (!selectedSlot || !qbService || !qbName || !qbPhone) return
    setQbSaving(true)
    const svc = services.find(s => s.id === qbService)
    const startDate = new Date(`${selectedSlot.date}T${selectedSlot.time}:00`)
    const endDate = new Date(startDate.getTime() + (svc?.duration || 60) * 60000)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: qbService, staff_id: qbStaff || null,
          start_at: startDate.toISOString(), end_at: endDate.toISOString(),
          customer_name: qbName, customer_phone: qbPhone,
          price: svc?.price || null, status: 'confirmed', source: 'manual',
        }),
      })
      if (res.ok) { setSelectedSlot(null); setQbService(''); setQbStaff(''); setQbName(''); setQbPhone(''); fetchData() }
    } catch (err) { console.error(err) }
    finally { setQbSaving(false) }
  }

  const dayBookingsCount = getBookingsForDate(dateStr).length
  const dayRevenue = getBookingsForDate(dateStr).reduce((s, b) => s + (b.price || 0), 0)

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    </div>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" /> {l.title}
          </h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goToday} className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${dateStr === todayStr ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
            {l.today}
          </button>
          <button onClick={goNext} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 ml-2 capitalize">{formatHeader()}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {mode === 'day' ? l.day : mode === 'week' ? l.week : l.month}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="all">{l.all}</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-2xl font-bold text-rose-700">{dayBookingsCount}</p>
              <p className="text-xs text-gray-500">{l.bookings}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{dayRevenue.toLocaleString(locale)} {currency}</p>
              <p className="text-xs text-gray-500">{l.revenue}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-2xl font-bold text-rose-700">{timeSlots.length - new Set(filteredBookings.filter(b => b.start_at.split('T')[0] === dateStr).flatMap(b => {
                const slots: string[] = []; const start = new Date(b.start_at); const end = new Date(b.end_at)
                for (let t = start.getTime(); t < end.getTime(); t += 30 * 60000) { const d = new Date(t); slots.push(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`) }
                return slots
              })).size}</p>
              <p className="text-xs text-gray-500">{l.freeSlots}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {timeSlots.map(time => {
              const slotBookings = getBookingsForDateSlot(dateStr, time)
              const booking = slotBookings[0]
              const isStart = booking ? isBookingStart(dateStr, time, booking) : false
              const slotCount = booking ? getBookingSlotCount(booking) : 0
              const isHour = time.endsWith(':00')
              const now = new Date()
              const slotTime = new Date(`${dateStr}T${time}:00`)
              const isPast = dateStr === todayStr && slotTime < now
              const isNow = dateStr === todayStr && slotTime <= now && new Date(slotTime.getTime() + 30 * 60000) > now
              if (booking && !isStart) return null
              return (
                <div key={time} className={`flex border-b border-gray-100 last:border-b-0 ${isPast && !booking ? 'opacity-40' : ''} ${isNow ? 'bg-blue-50/30' : ''}`}>
                  <div className={`w-16 flex-shrink-0 py-3 px-2 text-right ${isHour ? 'text-sm font-semibold text-rose-700' : 'text-xs text-rose-500'}`}>
                    {time}
                    {isNow && <div className="w-2 h-2 bg-red-500 rounded-full inline-block ml-1" />}
                  </div>
                  <div className="flex-1 border-l border-gray-100 min-h-[3rem]">
                    {booking && isStart ? (
                      <button onClick={() => setShowDetail(booking)} className="w-full text-left p-2 hover:brightness-95 transition-all" style={{ minHeight: `${slotCount * 3}rem` }}>
                        <div className="rounded-lg p-2.5 h-full text-white shadow-sm" style={{ backgroundColor: booking.services?.color || '#3b82f6' }}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{booking.services?.name || l.booking}</span>
                            <span className="text-xs opacity-80">{booking.services?.duration} min</span>
                          </div>
                          <p className="text-sm opacity-90 mt-0.5">{booking.clients?.full_name || booking.customer_name || l.client}</p>
                          {booking.staff && <p className="text-xs opacity-75 mt-0.5">{booking.staff.full_name}</p>}
                        </div>
                      </button>
                    ) : !booking ? (
                      <button onClick={() => { if (!isPast) setSelectedSlot({ date: dateStr, time }) }} disabled={isPast}
                        className={`w-full h-full min-h-[3rem] flex items-center px-3 ${isPast ? 'cursor-not-allowed' : 'hover:bg-emerald-50 cursor-pointer group'}`}>
                        {!isPast && <span className="text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"><Plus className="w-3 h-3" /> {l.newBooking}</span>}
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-16 p-2 text-xs text-gray-400"></th>
                {getWeekDays().map((day, i) => {
                  const ds = toDateStr(day)
                  const isT = ds === todayStr
                  const count = getBookingsForDate(ds).length
                  return (
                    <th key={i} className={`p-2 text-center ${isT ? 'bg-blue-50' : ''}`}>
                      <p className="text-xs text-gray-500">{dayNames[i]}</p>
                      <p className={`text-lg font-bold ${isT ? 'text-blue-600' : 'text-rose-700'}`}>{day.getDate()}</p>
                      {count > 0 && <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{count}</span>}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {timeSlots.filter(t => t.endsWith(':00')).map(time => (
                <tr key={time} className="border-b border-gray-50">
                  <td className="p-1 text-right text-xs font-semibold text-rose-700 align-top pt-2">{time}</td>
                  {getWeekDays().map((day, i) => {
                    const ds = toDateStr(day)
                    const isT = ds === todayStr
                    const bookingsHour = getBookingsForDateSlot(ds, time)
                    const bookingsHalf = getBookingsForDateSlot(ds, time.replace(':00', ':30'))
                    const allBookings = [...new Map([...bookingsHour, ...bookingsHalf].map(b => [b.id, b])).values()]
                    const isPast = ds < todayStr
                    return (
                      <td key={i} className={`p-0.5 align-top ${isT ? 'bg-blue-50/30' : ''} ${isPast ? 'opacity-40' : ''}`} style={{ minHeight: '3.5rem' }}>
                        {allBookings.length > 0 ? (
                          <div className="space-y-0.5">
                            {allBookings.map(b => (
                              <button key={b.id} onClick={() => setShowDetail(b)}
                                className="w-full text-left rounded-md p-1.5 text-white text-xs hover:brightness-90 transition-all"
                                style={{ backgroundColor: b.services?.color || '#3b82f6' }}>
                                <p className="font-semibold truncate">{b.services?.name}</p>
                                <p className="opacity-80 truncate">{b.clients?.full_name || b.customer_name}</p>
                              </button>
                            ))}
                          </div>
                        ) : !isPast ? (
                          <button onClick={() => setSelectedSlot({ date: ds, time })}
                            className="w-full h-full min-h-[3.5rem] rounded-md hover:bg-emerald-50 transition-all group flex items-center justify-center">
                            <Plus className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100" />
                          </button>
                        ) : <div className="min-h-[3.5rem]" />}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {dayNames.map(d => (
              <div key={d} className="p-2 text-center text-xs font-medium text-gray-500">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {getMonthDays().map((day, i) => {
              const ds = toDateStr(day)
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const isT = ds === todayStr
              const dayB = getBookingsForDate(ds)
              const revenue = dayB.reduce((s, b) => s + (b.price || 0), 0)
              return (
                <button key={i} onClick={() => { setCurrentDate(day); setViewMode('day') }}
                  className={`p-2 min-h-[5rem] border-b border-r border-gray-100 text-left hover:bg-gray-50 transition-all ${!isCurrentMonth ? 'opacity-30' : ''} ${isT ? 'bg-blue-50' : ''}`}>
                  <p className={`text-sm font-bold ${isT ? 'text-blue-600' : 'text-rose-700'}`}>{day.getDate()}</p>
                  {dayB.length > 0 && (
                    <div className="mt-1">
                      <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{dayB.length} {l.rez}</span>
                      {revenue > 0 && <p className="text-xs text-gray-500 mt-0.5">{revenue.toLocaleString(locale)} {currency}</p>}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick booking modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{l.newBooking}</h3>
              <button onClick={() => setSelectedSlot(null)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 mb-4 text-sm">
              <span className="text-blue-600 font-medium">
                {new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long' })} {l.at} {selectedSlot.time}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l.service} *</label>
                <select value={qbService} onChange={e => setQbService(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
                  <option value="">{l.select}</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} min — {s.price} {currency})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l.specialist}</label>
                <select value={qbStaff} onChange={e => setQbStaff(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm">
                  <option value="">{l.anyone}</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l.clientName}</label>
                <input type="text" value={qbName} onChange={e => setQbName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Jan Novák" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l.phone}</label>
                <input type="tel" value={qbPhone} onChange={e => setQbPhone(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="+420 777 123 456" />
              </div>
            </div>
            <button onClick={handleQuickBook} disabled={qbSaving || !qbService || !qbName || !qbPhone}
              className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
              {qbSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : l.createBooking}
            </button>
          </div>
        </div>
      )}

            {/* Booking detail modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{l.bookingDetail}</h3>
              <button onClick={() => setShowDetail(null)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: showDetail.services?.color || '#3b82f6' }}>
                  {(showDetail.clients?.full_name || showDetail.customer_name || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{showDetail.clients?.full_name || showDetail.customer_name || l.unknown}</p>
                  <p className="text-sm text-gray-500">{showDetail.clients?.phone || showDetail.customer_phone || ''}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">{l.service}</span><span className="font-medium">{showDetail.services?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{l.time}</span><span className="font-medium">{new Date(showDetail.start_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} — {new Date(showDetail.end_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span></div>
                {showDetail.staff && <div className="flex justify-between"><span className="text-gray-500">{l.specialist}</span><span className="font-medium">{showDetail.staff.full_name}</span></div>}
                {showDetail.price && <div className="flex justify-between"><span className="text-gray-500">{l.price}</span><span className="font-medium">{showDetail.price} {currency}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">{l.status}</span><span className={`font-medium ${
                  showDetail.status === 'confirmed' ? 'text-blue-600' :
                  showDetail.status === 'completed' ? 'text-green-600' :
                  showDetail.status === 'cancelled' ? 'text-red-600' :
                  showDetail.status === 'no_show' ? 'text-purple-600' :
                  showDetail.status === 'rescheduled' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>{
                  showDetail.status === 'confirmed' ? (lang === 'en' ? 'Confirmed' : 'Potvrzeno') :
                  showDetail.status === 'completed' ? (lang === 'en' ? 'Completed' : 'Dokončeno') :
                  showDetail.status === 'cancelled' ? (lang === 'en' ? 'Cancelled' : 'Zrušeno') :
                  showDetail.status === 'no_show' ? (lang === 'en' ? 'No-show' : 'Nedostavil/a se') :
                  showDetail.status === 'rescheduled' ? (lang === 'en' ? 'Rescheduled' : 'Přeobjednáno') :
                  showDetail.status
                }</span></div>
              </div>

              {/* Status change buttons */}
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">{lang === 'en' ? 'Change status:' : 'Změnit stav:'}</p>
                <div className="grid grid-cols-2 gap-2">
                  {showDetail.status !== 'completed' && (
                    <button onClick={() => handleStatusChange(showDetail.id, 'completed')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 border border-green-200 transition-all">
                      ✅ {lang === 'en' ? 'Completed' : 'Dokončeno'}
                    </button>
                  )}
                  {showDetail.status !== 'cancelled' && (
                    <button onClick={() => handleStatusChange(showDetail.id, 'cancelled')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100 border border-red-200 transition-all">
                      ❌ {lang === 'en' ? 'Cancelled' : 'Zrušeno'}
                    </button>
                  )}
                  {showDetail.status !== 'no_show' && (
                    <button onClick={() => handleStatusChange(showDetail.id, 'no_show')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-100 border border-purple-200 transition-all">
                      ⏳ {lang === 'en' ? 'No-show' : 'Nedostavil/a se'}
                    </button>
                  )}
                  {showDetail.status !== 'confirmed' && (
                    <button onClick={() => handleStatusChange(showDetail.id, 'confirmed')}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 border border-blue-200 transition-all">
                      📋 {lang === 'en' ? 'Confirmed' : 'Potvrzeno'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setShowDetail(null)} className="w-full mt-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">{l.close}</button>
          </div>
        </div>
      )}
    </div>
  )
}

