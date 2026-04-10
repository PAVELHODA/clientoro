﻿// PATH: src/app/(dashboard)/calendar/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useLang } from '@/lib/LangContext'
import { useToast } from '@/components/Toast'
import {
  Calendar, ChevronLeft, ChevronRight, Plus,
  X, Loader2, Filter, AlertTriangle,
  Users, Clock, DollarSign,
} from 'lucide-react'

import NotesDrawer from '@/components/NotesDrawer'

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
  is_backfill: boolean | null
  clients: { full_name: string; phone: string | null } | null
  services: { name: string; color: string; duration: number } | null
  staff: { full_name: string } | null
}

interface Service { id: string; name: string; color: string; duration: number; price: number | null }
interface StaffMember { id: string; full_name: string; staff_services?: { service_id: string }[] }
type ViewMode = 'day' | 'week' | 'month'

export default function CalendarPage() {
  const { organization } = useAuth()
  const { t, lang } = useLang()
  const toast = useToast()
  const locale = lang === 'sk' ? 'sk-SK' : lang === 'en' ? 'en-US' : 'cs-CZ'
  const currency = 'Kč'
  const isTeam = organization?.mode === 'team'

  const modeColors: Record<string, { gradient: string; text: string }> = {
    solo: { gradient: 'linear-gradient(135deg, #059669, #10b981)', text: 'white' },
    team: { gradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)', text: 'white' },
    solo_inspire: { gradient: 'linear-gradient(135deg, #92400e, #b45309)', text: 'white' },
    pro_inspire: { gradient: 'linear-gradient(135deg, #881337, #e11d48)', text: 'white' },
  }
  const mc = modeColors[organization?.mode || 'team'] || modeColors.team

  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [filterStaff, setFilterStaff] = useState<string>('all')
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null)
  const [cancelConfirm, setCancelConfirm] = useState<{id: string, name: string} | null>(null)
  const [showDetail, setShowDetail] = useState<Booking | null>(null)
  const [showSlotBookings, setShowSlotBookings] = useState<{ date: string; time: string; bookings: Booking[] } | null>(null)
  const [qbService, setQbService] = useState('')
  const [qbStaff, setQbStaff] = useState('')
  const [qbName, setQbName] = useState('')
  const [qbPhone, setQbPhone] = useState('+420 ')
  const [qbEmail, setQbEmail] = useState('')
  const [qbPhonePrefix, setQbPhonePrefix] = useState('+420')

  const formatPhone = (p: string | null | undefined): string => {
    if (!p) return ''
    let raw = p.replace(/\D/g, '')
    if (raw.length === 12 && raw.startsWith('420')) raw = raw.slice(3)
    if (raw.length === 13 && raw.startsWith('421')) { return `+421 ${raw.slice(3, 6)} ${raw.slice(6, 9)} ${raw.slice(9)}` }
    if (raw.length === 9) return `+420 ${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`
    if (raw.length >= 4 && raw.length < 9) return `+420 ${raw.replace(/(\d{3})(?=\d)/g, '$1 ').trim()}`
    if (p.startsWith('+')) return p
    return p
  }

  const [qbNote, setQbNote] = useState('')
  const [qbSaving, setQbSaving] = useState(false)

  const [backfillMode, setBackfillMode] = useState(false)
  const [backfillCount, setBackfillCount] = useState(0)
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const handleTitleClick = () => {
    clickCountRef.current += 1
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0 }, 600)
    if (clickCountRef.current >= 6) {
      setBackfillMode(prev => !prev)
      clickCountRef.current = 0
      if (!backfillMode) setBackfillCount(0)
    }
  }

  const workStart = organization?.work_start || 6
  const workEnd = organization?.work_end || 22

  // Auto-scroll to current time (red line)
  useEffect(() => {
    setTimeout(() => {
      if (!calendarRef.current) return
      const now = new Date()
      const h = now.getHours()
      const m = now.getMinutes()
      if (h < workStart || h >= workEnd) {
        calendarRef.current.scrollTop = 0
        return
      }
      const minutesSinceStart = (h - workStart) * 60 + m
      const totalMinutes = (workEnd - workStart) * 60
      const ratio = Math.max(0, (minutesSinceStart - 60) / totalMinutes)
      const maxScroll = calendarRef.current.scrollHeight - calendarRef.current.clientHeight
      calendarRef.current.scrollTop = maxScroll * ratio
    }, 100)
  }, [viewMode, currentDate, loading])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 't' || e.key === 'T') goToday()
      if (e.key === 'd' || e.key === 'D') setViewMode('day')
      if (e.key === 'w' || e.key === 'W') setViewMode('week')
      if (e.key === 'm' || e.key === 'M') setViewMode('month')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentDate, viewMode])

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed')
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
      setShowDetail(prev => prev ? { ...prev, status: newStatus } : null)
      toast.success(lang === 'en' ? 'Status updated' : 'Stav aktualizován')
      setTimeout(() => setShowDetail(null), 1200)
    } catch (e) {
      toast.error(lang === 'en' ? 'Error updating status' : 'Chyba pri aktualizaci stavu')
    }
  }

  const dayNames = lang === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : lang === 'sk'
    ? ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']
    : ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

  const l = {
    title: t('cal_title'),
    today: lang === 'en' ? 'Today' : 'Dnes',
    day: lang === 'en' ? 'Day' : 'Den',
    week: lang === 'en' ? 'Week' : lang === 'sk' ? 'Tyzden' : 'Tyden',
    month: lang === 'en' ? 'Month' : lang === 'sk' ? 'Mesiac' : 'Mesic',
    all: lang === 'en' ? 'All' : lang === 'sk' ? 'Vsetci' : 'Vsichni',
    bookings: lang === 'en' ? 'Bookings' : lang === 'sk' ? 'Rezervacii' : 'Rezervaci',
    revenue: lang === 'en' ? 'Revenue' : 'Trzby',
    freeSlots: lang === 'en' ? 'Free slots' : lang === 'sk' ? 'Volnych terminov' : 'Volnych terminu',
    newBooking: t('cal_new_booking'),
    booking: lang === 'en' ? 'Booking' : lang === 'sk' ? 'Rezervacia' : 'Rezervace',
    client: lang === 'en' ? 'Client' : 'Klient',
    service: t('cal_service'),
    specialist: lang === 'en' ? 'Specialist' : 'Specialista',
    clientName: lang === 'en' ? 'Client name *' : lang === 'sk' ? 'Meno klienta *' : 'Jméno klienta *',
    phone: lang === 'en' ? 'Phone *' : 'Telefon *',
    anyone: lang === 'en' ? 'Anyone available' : lang === 'sk' ? 'Ktokolvek volny' : 'Kdokoliv volny',
    select: lang === 'en' ? 'Select...' : 'Vyberte...',
    createBooking: lang === 'en' ? 'Create booking' : lang === 'sk' ? 'Vytvoriť rezerváciu' : 'Vytvořit rezervaci',
    bookingDetail: lang === 'en' ? 'Booking detail' : lang === 'sk' ? 'Detail rezervácie' : 'Detail rezervace',
    time: lang === 'en' ? 'Time' : 'Čas',
    date: lang === "en" ? "Date" : lang === "sk" ? "Dátum" : "Datum",
    price: t('cal_price'),
    status: lang === 'en' ? 'Status' : 'Stav',
    close: lang === 'en' ? 'Close' : 'Zavrit',
    unknown: lang === 'en' ? 'Unknown' : 'Neznámý',
    rez: lang === 'en' ? 'B' : 'R',
    at: lang === 'en' ? 'at' : 'v',
    slotBookings: lang === 'en' ? 'Bookings in this slot' : lang === 'sk' ? 'Rezervácie v tomto termíne' : 'Rezervace v tomto termínu',
    noBookings: lang === 'en' ? 'No bookings' : lang === 'sk' ? 'Žiadne rezervácie' : 'Žádné rezervace',
    working: lang === 'en' ? 'Working' : lang === 'sk' ? 'Pracuju' : 'Pracuji',
    backfillBanner: lang === 'en' ? 'Backfill mode - you can add bookings to past (max 90 days)' : lang === 'sk' ? 'Zpetny zapis - moznost pridat rezervacie do minulosti (max 90 dni)' : 'Zpetny zapis - moznost pridat rezervace do minulosti (max 90 dni)',
    backfillAdded: lang === 'en' ? 'added' : lang === 'sk' ? 'pridanych' : 'pridano',
    backfillNote: lang === 'en' ? 'Reason for backfill *' : lang === 'sk' ? 'Dôvod spätného zápisu *' : 'Důvod zpětného zápisu *',
    freeSlotsBanner: lang === 'en' ? 'free slots! Offer them with AI' : lang === 'sk' ? 'volnych terminov! Ponuknite ich s AI' : 'volnych terminu! Nabidnete je s AI',
    backfillLabel: lang === 'en' ? 'Backfill' : 'Zpětný zápis',
    emptyServices: lang === 'en' ? 'Add your first service to start booking' : lang === 'sk' ? 'Pridajte prvú službu pre rezervácie' : 'Přidejte první službu pro rezervace',
    emptyStaff: lang === 'en' ? 'Add team members to see staff columns' : lang === 'sk' ? 'Pridajte clenov timu' : 'Pridejte cleny tymu',
    conflict: lang === 'en' ? 'Conflict!' : 'Konflikt!',
  }

  const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
  const todayStr = toDateStr(new Date())
  const dateStr = toDateStr(currentDate)
  const maxBackfillDate = toDateStr(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))

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

  const getNotesTarget = () => {
    if (viewMode === 'day') return { type: 'day' as const, date: toDateStr(currentDate) }
    if (viewMode === 'week') {
      const monday = getMonday(currentDate)
      return { type: 'week' as const, date: toDateStr(monday) }
    }
    return { type: 'month' as const, date: toDateStr(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) }
  }

  const formatHeader = () => {
    if (viewMode === 'day') return currentDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (viewMode === 'week') {
      const days = getWeekDays()
      return `${days[0].toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - ${days[6].toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`
    }
    return currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  }

  const timeSlots: string[] = []
  for (let h = workStart; h < workEnd; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`)
    timeSlots.push(`${String(h).padStart(2, '0')}:15`)
    timeSlots.push(`${String(h).padStart(2, '0')}:30`)
    timeSlots.push(`${String(h).padStart(2, '0')}:45`)
  }

  const filteredBookings = bookings.filter(b => {
    if (b.status === 'cancelled' || b.status === 'no_show') return false
    if (filterStaff !== 'all' && b.staff_id !== filterStaff) return false
    return true
  })

  const getBookingsForSlot = (date: string, time: string, staffId?: string) => {
    const slotStart = new Date(`${date}T${time}:00`)
    const slotEnd = new Date(slotStart.getTime() + 15 * 60000)
    return filteredBookings.filter(b => {
      if (b.start_at.split('T')[0] !== date) return false
      if (staffId && b.staff_id !== staffId) return false
      const bStart = new Date(b.start_at)
      const bEnd = new Date(b.end_at)
      return bStart < slotEnd && bEnd > slotStart
    })
  }

  const isBookingStart = (date: string, time: string, booking: Booking) => {
    const bStart = new Date(booking.start_at)
    if (booking.start_at.split('T')[0] !== date) return false
    const bTime = `${String(bStart.getHours()).padStart(2, '0')}:${String(bStart.getMinutes()).padStart(2, '0')}`
    return bTime === time
  }

  const getBookingSlotCount = (booking: Booking) => {
    const start = new Date(booking.start_at)
    const end = new Date(booking.end_at)
    return Math.ceil((end.getTime() - start.getTime()) / (15 * 60000))
  }

  const getBookingsForDate = (date: string) =>
    filteredBookings.filter(b => b.start_at.split('T')[0] === date)

  const hasConflict = (booking: Booking) => {
    if (!booking.staff_id) return false
    return filteredBookings.some(b =>
      b.id !== booking.id && b.staff_id === booking.staff_id &&
      new Date(b.start_at) < new Date(booking.end_at) &&
      new Date(b.end_at) > new Date(booking.start_at)
    )
  }

  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

  const handleSlotClick = (date: string, time: string) => {
    const isDayPast = date < todayStr
    const now = new Date()
    const slotTime = new Date(`${date}T${time}:00`)
    const isPast = (date === todayStr && slotTime < now) || isDayPast
    const slotBookings = getBookingsForSlot(date, time)

    if (slotBookings.length > 0) {
      setShowSlotBookings({ date, time, bookings: slotBookings })
    } else if (!isPast || backfillMode || date === todayStr) {
      setSelectedSlot({ date, time })
    } else if (isPast) {
      const dayBookings = getBookingsForDate(date)
      if (dayBookings.length > 0) {
        setShowSlotBookings({ date, time: '', bookings: dayBookings })
      }
    }
  }

  const getCurrentTimePosition = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    if (hours < workStart || hours >= workEnd) return null
    const totalMinutes = (hours - workStart) * 60 + minutes
    const totalWorkMinutes = (workEnd - workStart) * 60
    return (totalMinutes / totalWorkMinutes) * 100
  }

  const getAvailableStaff = () => {
    if (!qbService) return staffList.filter(s => !!s.staff_services?.length)
    return staffList.filter(s => s.staff_services?.length && s.staff_services.some(ss => ss.service_id === qbService))
  }

  const handleQuickBook = async () => {
    if (!selectedSlot || !qbService || !qbName || !qbPhone) return
    const isDayPast = selectedSlot.date < todayStr
    const now = new Date()
    const slotTime = new Date(`${selectedSlot.date}T${selectedSlot.time}:00`)
    const isPast = (selectedSlot.date === todayStr && slotTime < now) || isDayPast
    if (isPast && !backfillMode) return
    if (isPast && backfillMode && !qbNote) return
    if (isPast && selectedSlot.date < maxBackfillDate) return

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
          customer_name: qbName, customer_phone: formatPhone(qbPhone), customer_email: qbEmail || undefined,
          price: svc?.price || null,
          status: isPast ? 'completed' : 'confirmed',
        }),
      })
      if (res.ok) {
        if (isPast) setBackfillCount(prev => prev + 1)
        setSelectedSlot(null); setQbService(''); setQbStaff(''); setQbName(''); setQbPhone(qbPhonePrefix + ' '); setQbNote(''); setQbEmail(''); fetchData()
      }
    } catch (err) { console.error(err) }
    finally { setQbSaving(false) }
  }

  const getStatsForRange = (start: string, end: string) => {
    const rb = filteredBookings.filter(b => { const d = b.start_at.split('T')[0]; return d >= start && d <= end })
    const totalBookings = rb.length
    const totalRevenue = rb.reduce((s, b) => s + (b.price || 0), 0)
    const days = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (24 * 60 * 60 * 1000)) + 1)
    const slotsPerDay = isTeam ? timeSlots.length * Math.max(staffList.length, 1) : timeSlots.length
    const totalSlots = slotsPerDay * days
    const usedSlots = new Set(rb.map(b => `${b.start_at.split('T')[0]}-${new Date(b.start_at).getHours()}:${new Date(b.start_at).getMinutes()}-${b.staff_id || 'solo'}`)).size
    const freeSlots = Math.max(totalSlots - usedSlots, 0)
    const workingStaff = isTeam ? new Set(rb.map(b => b.staff_id).filter(Boolean)).size : 0
    return { totalBookings, totalRevenue, freeSlots, workingStaff }
  }

  const currentStats = viewMode === 'day'
    ? getStatsForRange(dateStr, dateStr)
    : viewMode === 'week'
    ? getStatsForRange(toDateStr(getWeekDays()[0]), toDateStr(getWeekDays()[6]))
    : getStatsForRange(toDateStr(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)), toDateStr(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)))

  const staffSummary = isTeam ? staffList.map(staff => {
    const range = viewMode === 'day' ? { s: dateStr, e: dateStr }
      : viewMode === 'week' ? { s: toDateStr(getWeekDays()[0]), e: toDateStr(getWeekDays()[6]) }
      : { s: toDateStr(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)), e: toDateStr(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)) }
    const sb = filteredBookings.filter(b => b.staff_id === staff.id && b.start_at.split('T')[0] >= range.s && b.start_at.split('T')[0] <= range.e)
    return { ...staff, count: sb.length, revenue: sb.reduce((s, b) => s + (b.price || 0), 0) }
  }).filter(s => s.count > 0).sort((a, b) => b.revenue - a.revenue) : []

  const statusLabel = (status: string) => {
    const m: Record<string, Record<string, string>> = {
      confirmed: { cs: 'Potvrzeno', sk: 'Potvrdená', en: 'Confirmed' },
      completed: { cs: 'Dokončeno', sk: 'Dokončená', en: 'Completed' },
      cancelled: { cs: 'Zrušeno', sk: 'Zrušená', en: 'Cancelled' },
      no_show: { cs: 'Nedorazil/a (no-show)', sk: 'Nedostavil/a sa', en: 'No-show' },
    }
    return m[status]?.[lang] || status
  }

  const statusColor = (s: string) =>
    s === 'confirmed' ? 'text-blue-600 bg-blue-50' :
    s === 'completed' ? 'text-green-600 bg-green-50' :
    s === 'cancelled' ? 'text-red-600 bg-red-50' :
    s === 'no_show' ? 'text-purple-600 bg-purple-50' :
    'text-gray-600 bg-gray-50'

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    </div>
  )

  if (services.length === 0) return (
    <div className="text-center py-20">
      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-gray-900 mb-2">{l.title}</h2>
      <p className="text-gray-500 mb-4">{l.emptyServices}</p>
      <a href="/services" className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-medium" style={{ background: mc.gradient }}>
        <Plus className="w-4 h-4" /> {l.service}
      </a>
    </div>
  )

  return (
    <div>
      {backfillMode && (
        <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">{l.backfillBanner}</span>
            {backfillCount > 0 && <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-bold">{backfillCount} {l.backfillAdded}</span>}
          </div>
          <button onClick={() => setBackfillMode(false)} className="text-amber-600 hover:text-amber-800"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 onClick={handleTitleClick} className="text-2xl font-bold text-gray-900 flex items-center gap-2 cursor-default select-none">
            <Calendar className="w-7 h-7 text-blue-600" /> {l.title}
          </h1>
        </div>
        <div>
          <button onClick={() => setSelectedSlot({ date: dateStr >= todayStr ? dateStr : todayStr, time: `${String(Math.min(Math.max(new Date().getHours(), workStart), workEnd - 1)).padStart(2, '0')}:00` })}
            className="px-4 py-2.5 text-white rounded-xl font-semibold hover:brightness-110 transition-all flex items-center gap-2 shadow-sm"
            style={{ background: mc.gradient, color: mc.text }}>
            <Plus className="w-4 h-4" /> {l.newBooking}
          </button>
        </div>
      </div>

      <div className={`grid ${isTeam ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-2 sm:gap-3 mb-4`}>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1"><Calendar className="w-4 h-4 text-blue-600" /></div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{currentStats.totalBookings}</p>
          <p className="text-xs text-gray-500">{l.bookings}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1"><DollarSign className="w-4 h-4 text-emerald-600" /></div>
          <p className="text-sm sm:text-2xl font-bold text-emerald-600 truncate">{currentStats.totalRevenue.toLocaleString(locale)} {currency}</p>
          <p className="text-xs text-gray-500">{l.revenue}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1"><Clock className="w-4 h-4 text-rose-600" /></div>
          <p className="text-lg sm:text-2xl font-bold text-rose-700">{currentStats.freeSlots}</p>
          <p className="text-xs text-gray-500">{l.freeSlots}</p>
        </div>
        {isTeam && (
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1"><Users className="w-4 h-4 text-violet-600" /></div>
            <p className="text-lg sm:text-2xl font-bold text-violet-700">{currentStats.workingStaff}</p>
            <p className="text-xs text-gray-500">{l.working}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="w-9 h-9 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goToday} className="px-3 py-1.5 rounded-lg text-sm font-medium border text-white hover:brightness-110"
            style={{ background: dateStr === todayStr ? mc.gradient : 'white', color: dateStr === todayStr ? mc.text : '#374151', borderColor: dateStr === todayStr ? 'transparent' : '#d1d5db' }}>
            {l.today}
          </button>
          <button onClick={goNext} className="w-9 h-9 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
          <h2 className="text-sm sm:text-lg font-semibold text-gray-900 ml-2 capitalize">{formatHeader()}</h2>
          <NotesDrawer targetType={getNotesTarget().type} targetDate={getNotesTarget().date} label={formatHeader()} />
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
          {isTeam && (
            <div className="flex items-center gap-1">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="all">{l.all}</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* DAY VIEW - SOLO */}
      {viewMode === 'day' && !isTeam && (
        <div ref={calendarRef} className="bg-white rounded-2xl border-2 border-gray-300 overflow-auto shadow-sm relative" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {dateStr === todayStr && getCurrentTimePosition() !== null && (
            <div className="absolute left-20 right-0 z-10 flex items-center" style={{ top: `${getCurrentTimePosition()}%` }}>
              <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5" />
              <div className="flex-1 h-0.5 bg-red-500" />
            </div>
          )}
          {timeSlots.map(time => {
            const slotBookings = getBookingsForSlot(dateStr, time)
            const booking = slotBookings[0]
            const isStart = booking ? isBookingStart(dateStr, time, booking) : false
            const slotCount = booking ? getBookingSlotCount(booking) : 0
            const isHour = time.endsWith(':00')
            const isHalf = time.endsWith(':30')
            const now = new Date()
            const slotTime = new Date(`${dateStr}T${time}:00`)
            const isDayPast = dateStr < todayStr
            const isPast = (dateStr === todayStr && slotTime < now) || isDayPast
            const isNow = dateStr === todayStr && slotTime <= now && new Date(slotTime.getTime() + 15 * 60000) > now
            if (booking && !isStart) return null
            return (
              <div key={time} className={`flex ${isHour ? 'border-t-2 border-gray-400' : isHalf ? 'border-t border-gray-300' : 'border-t border-gray-200/60'} ${isPast && !booking ? 'bg-gray-100/70' : ''} ${isNow ? 'bg-blue-50/40' : ''}`}>
                <div className={`w-16 sm:w-20 flex-shrink-0 py-2 px-2 sm:px-3 text-right border-r-2 border-gray-500 sticky left-0 bg-white z-10 ${isHour ? 'text-sm font-bold text-gray-700' : isHalf ? 'text-xs font-medium text-gray-500' : 'text-[10px] text-gray-300'} ${isPast ? 'opacity-50' : ''}`}>
                  {(isHour || isHalf) ? time : ''}
                  {isNow && <div className="w-2 h-2 bg-red-500 rounded-full inline-block ml-1 animate-pulse" />}
                </div>
                <div className="flex-1 min-h-[2rem]">
                  {booking && isStart ? (
                    <button onClick={() => setShowDetail(booking)} className={`w-full text-left p-1.5 hover:brightness-95 transition-all ${isPast ? 'opacity-75' : ''}`}
                      style={{ minHeight: `${slotCount * 2}rem` }}>
                      <div className={`rounded-lg p-2 h-full text-white shadow-sm ${booking.status === "completed" ? "opacity-60 ring-2 ring-green-400" : ""} ${hasConflict(booking) ? 'ring-2 ring-red-500' : ''}`}
                        style={{ backgroundColor: booking.services?.color || '#3b82f6' }} data-status={booking.status}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{booking.services?.name || l.booking}</span>
                          <span className="text-xs opacity-80">{booking.services?.duration} min</span>
                        </div>
                        <p className="text-sm opacity-90 mt-0.5">{booking.customer_name || booking.clients?.full_name || l.client}</p>
                        {booking.staff && <p className="text-xs opacity-75 mt-0.5">👤 {booking.staff.full_name}</p>}
                        {booking.is_backfill && <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded text-[10px] font-bold">&#9201;</span>}
                        {hasConflict(booking) && <span className="inline-block mt-1 ml-1 px-1.5 py-0.5 bg-red-200 text-red-800 rounded text-[10px] font-bold">{l.conflict}</span>}
                        {booking.status !== "confirmed" && <span className={`inline-block mt-1 ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(booking.status)}`}>{statusLabel(booking.status)}</span>}
                      </div>
                    </button>
                  ) : !booking ? (
                    <button onClick={() => handleSlotClick(dateStr, time)}
                      className={`w-full h-full min-h-[2rem] flex items-center px-3 transition-all ${isPast && !backfillMode ? 'hover:bg-gray-200/50 cursor-pointer opacity-40' : isPast && backfillMode ? 'hover:bg-amber-50 cursor-pointer' : 'hover:bg-emerald-50 cursor-pointer group'}`}>
                      {!isPast && isHour && <span className="text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"><Plus className="w-3 h-3" /> {l.newBooking}</span>}
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* DAY VIEW - TEAM */}
      {viewMode === 'day' && isTeam && (
        <div ref={calendarRef} className="bg-white rounded-2xl border-2 border-gray-300 overflow-auto shadow-sm relative" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {dateStr === todayStr && getCurrentTimePosition() !== null && (
            <div className="absolute left-20 right-0 z-10 flex items-center" style={{ top: `calc(3rem + ${getCurrentTimePosition()}% * 0.85)` }}>
              <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5" />
              <div className="flex-1 h-0.5 bg-red-500" />
            </div>
          )}
          <table className="w-full" style={{ minWidth: Math.max(600, staffList.length * 180 + 80) + 'px' }}>
            <thead className="sticky top-0 z-20 bg-white shadow-sm">
              <tr className="border-b-2 border-gray-400">
                <th className="w-16 sm:w-20 p-2 text-xs text-gray-400 border-r-2 border-gray-500 bg-gray-50 sticky left-0 z-20"></th>
                {staffList.map(staff => {
                  const staffDayBookings = getBookingsForDate(dateStr).filter(b => b.staff_id === staff.id)
                  const isFiltered = filterStaff === staff.id
                  return (
                    <th key={staff.id} className="p-2 text-center border-r border-gray-400 last:border-r-0 bg-gray-50">
                      <button onClick={() => setFilterStaff(isFiltered ? 'all' : staff.id)}
                        className={`text-sm font-bold transition-all ${isFiltered ? 'text-blue-600 underline' : 'text-gray-800 hover:text-blue-600'}`}>
                        {staff.full_name}
                      </button>
                      {staffDayBookings.length > 0 && <span className="inline-block ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{staffDayBookings.length}</span>}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => {
                const isHour = time.endsWith(':00')
                const isHalf = time.endsWith(':30')
                const now = new Date()
                const slotTime = new Date(`${dateStr}T${time}:00`)
                const isDayPast = dateStr < todayStr
                const isPast = (dateStr === todayStr && slotTime < now) || isDayPast
                return (
                  <tr key={time} className={`${isHour ? 'border-t-2 border-gray-400' : isHalf ? 'border-t border-gray-300' : 'border-t border-gray-200/60'}`}>
                    <td className={`w-20 py-1.5 px-2 text-right border-r-2 border-gray-400 bg-gray-50 ${isHour ? 'text-sm font-bold text-gray-700' : isHalf ? 'text-xs font-medium text-gray-500' : 'text-[10px] text-gray-300'} ${isPast ? 'opacity-50' : ''}`}>
                      {(isHour || isHalf) ? time : ''}
                    </td>
                    {staffList.map(staff => {
                      const slotBookings = getBookingsForSlot(dateStr, time, staff.id)
                      const booking = slotBookings[0]
                      const isStart = booking ? isBookingStart(dateStr, time, booking) : false
                      const slotCount = booking ? getBookingSlotCount(booking) : 0
                      if (booking && !isStart) return <td key={staff.id} className="border-r border-gray-400 last:border-r-0" />
                      return (
                        <td key={staff.id} className={`p-0.5 border-r border-gray-400 last:border-r-0 ${isPast ? 'bg-gray-50/70' : ''}`}>
                          {booking && isStart ? (
                            <button onClick={() => setShowDetail(booking)} className={`w-full text-left p-1 hover:brightness-95 transition-all ${isPast ? 'opacity-75' : ''}`}
                              style={{ minHeight: `${slotCount * 2}rem` }}>
                              <div className={`rounded-md p-1.5 h-full text-white text-xs shadow-sm ${booking.status === "completed" ? "opacity-60 ring-2 ring-green-400" : ""} ${hasConflict(booking) ? 'ring-2 ring-red-500' : ''}`}
                                style={{ backgroundColor: booking.services?.color || '#3b82f6' }} data-status={booking.status}>
                                <p className="font-semibold truncate">{booking.services?.name}</p>
                                <p className="opacity-80 truncate">{booking.customer_name || booking.clients?.full_name}</p>
                          {booking.staff && <span className="text-xs opacity-70 block truncate">👤 {booking.staff.full_name}</span>}
                                {booking.is_backfill && <span className="text-[9px] bg-amber-200 text-amber-800 px-1 rounded">&#9201;</span>}
                                {booking.status !== "confirmed" && <span className={`inline-block mt-0.5 px-1 py-0.5 rounded text-[10px] font-medium ${statusColor(booking.status)}`}>{statusLabel(booking.status)}</span>}
                              </div>
                            </button>
                          ) : !booking ? (
                            <button onClick={() => { setQbStaff(staff.id); handleSlotClick(dateStr, time) }}
                              className={`w-full h-full min-h-[2rem] rounded transition-all group flex items-center justify-center ${isPast && !backfillMode ? 'hover:bg-gray-100' : isPast && backfillMode ? 'hover:bg-amber-50' : 'hover:bg-emerald-50'}`}>
                              {!isPast && isHour && <Plus className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100" />}
                            </button>
                          ) : null}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {staffList.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">{l.emptyStaff}</p>
              <a href="/staff" className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ background: mc.gradient }}>
                <Plus className="w-4 h-4" /> {l.specialist}
              </a>
            </div>
          )}
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div ref={calendarRef} className="bg-white rounded-2xl border-2 border-gray-300 overflow-auto shadow-sm" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <table className="w-full min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="border-b-2 border-gray-400">
                <th className="w-20 p-2 text-xs text-gray-400 border-r-2 border-gray-400 bg-gray-50"></th>
                {getWeekDays().map((day, i) => {
                  const ds = toDateStr(day)
                  const isT = ds === todayStr
                  const isPast = ds < todayStr
                  const isWknd = isWeekend(day)
                  const count = getBookingsForDate(ds).length
                  return (
                    <th key={i} className={`p-2 text-center border-r border-gray-400 last:border-r-0 ${isT ? 'bg-blue-50' : ''} ${isWknd ? 'bg-sky-50/60' : ''} ${isPast && !isWknd && !isT ? 'bg-gray-50' : ''}`}>
                      <p className={`text-xs font-medium ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>{dayNames[i]}</p>
                      <p className={`text-lg font-bold ${isT ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-900'}`}>{day.getDate()}</p>
                      {count > 0 && <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{count}</span>}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {timeSlots.filter(t => t.endsWith(':00') || t.endsWith(':30')).map(time => {
                const isHour = time.endsWith(':00')
                return (
                <tr key={time} className={`${isHour ? 'border-t-2 border-gray-400' : 'border-t border-gray-300'}`}>
                  <td className={`p-1 text-right border-r-2 border-gray-500 bg-gray-50 align-top pt-1.5 sticky left-0 z-10 ${isHour ? 'text-xs font-bold text-gray-600' : 'text-[10px] text-gray-400'}`}>{isHour ? time : ''}</td>
                  {getWeekDays().map((day, i) => {
                    const ds = toDateStr(day)
                    const isT = ds === todayStr
                    const isWknd = isWeekend(day)
                    const slotBookings = getBookingsForSlot(ds, time)
                    const isPast = ds < todayStr
                    return (
                      <td key={i} className={`p-0.5 align-top border-r border-gray-400 last:border-r-0 ${isT ? 'bg-blue-50/30' : ''} ${isWknd ? 'bg-sky-50/40' : ''} ${isPast && !isWknd && !isT ? 'bg-gray-50/60' : ''}`} style={{ minHeight: '2rem' }}>
                        {slotBookings.length > 0 ? (
                          <div className="space-y-0.5">
                            {slotBookings.filter(b => isBookingStart(ds, time, b)).map(b => (
                              <button key={b.id} onClick={() => setShowDetail(b)}
                                className={`w-full text-left rounded-md p-1 text-white text-[11px] hover:brightness-90 transition-all ${b.status === "completed" ? "opacity-60 ring-2 ring-green-400" : ""} ${isPast ? 'opacity-70' : ''} ${hasConflict(b) ? 'ring-2 ring-red-500' : ''}`}
                                style={{ backgroundColor: b.services?.color || '#3b82f6' }}>
                                <p className="font-semibold truncate">{b.services?.name}</p>
                                <p className="opacity-80 truncate">{b.customer_name || b.clients?.full_name}</p>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <button onClick={() => handleSlotClick(ds, time)}
                            className={`w-full h-full min-h-[2rem] rounded transition-all group flex items-center justify-center ${isPast && !backfillMode ? 'hover:bg-gray-100' : 'hover:bg-emerald-50'}`}>
                            {!isPast && isHour && <Plus className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100" />}
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 border-b-2 border-gray-400">
            {dayNames.map((d, i) => (
              <div key={d} className={`p-2 text-center text-xs font-bold text-gray-600 border-r border-gray-400 last:border-r-0 ${i >= 5 ? 'bg-sky-50/60' : ''}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {getMonthDays().map((day, i) => {
              const ds = toDateStr(day)
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const isT = ds === todayStr
              const isPast = ds < todayStr
              const isWknd = isWeekend(day)
              const dayB = getBookingsForDate(ds)
              const revenue = dayB.reduce((s, b) => s + (b.price || 0), 0)
              return (
                <button key={i} onClick={() => { setCurrentDate(day); setViewMode('day') }}
                  className={`p-2 min-h-[5rem] border-b border-r border-gray-300 text-left hover:bg-gray-50 transition-all ${!isCurrentMonth ? 'opacity-30' : ''} ${isT ? 'bg-blue-50 border-blue-300' : ''} ${isWknd && isCurrentMonth ? 'bg-sky-50/40' : ''} ${isPast && isCurrentMonth && !isT ? 'bg-gray-50/60' : ''}`}>
                  <p className={`text-sm font-bold ${isT ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-900'}`}>{day.getDate()}</p>
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

      {/* Staff summary */}
      {isTeam && staffSummary.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-violet-600" /> {l.specialist}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {staffSummary.map(s => (
              <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold">
                  {s.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">{s.full_name}</p>
                  <p className="text-xs text-gray-500">{s.count} {l.rez} | {s.revenue.toLocaleString(locale)} {currency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick booking modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{l.newBooking}</h3>
              <button onClick={() => setSelectedSlot(null)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4" /></button>
            </div>
            {(() => {
              const isDayPast = selectedSlot.date < todayStr
              const slotTime = new Date(`${selectedSlot.date}T${selectedSlot.time}:00`)
              const isPast = (selectedSlot.date === todayStr && slotTime < new Date()) || isDayPast
              return isPast && backfillMode ? (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-xs text-amber-700 font-medium">{l.backfillBanner}</span>
                </div>
              ) : null
            })()}
            <div className="bg-blue-50 rounded-xl p-3 mb-4 text-sm">
              <span className="text-blue-600 font-medium">
                {new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long' })} {l.at} {selectedSlot.time}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l.service} *</label>
                <select value={qbService} onChange={e => { setQbService(e.target.value); setQbStaff('') }} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" id="qb-service" name="qb-service">
                  <option value="">{l.select}</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} min - {s.price} {currency})</option>)}
                </select>
              </div>
              {isTeam && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{l.specialist}</label>
                  <select value={qbStaff} onChange={e => setQbStaff(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" id="qb-staff" name="qb-staff">
                    <option value="">{l.anyone}</option>
                    {getAvailableStaff().map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                  {qbService && getAvailableStaff().length === 0 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {lang === 'en' ? 'No staff assigned to this service' : lang === 'sk' ? 'Žiadny zamestnanec pre túto službu' : 'Žádný zaměstnanec pro tuto službu'}
                    </p>
                  )}
                  {qbService && selectedSlot && getAvailableStaff().length > 0 && getAvailableStaff().every(s => getBookingsForSlot(selectedSlot.date, selectedSlot.time, s.id).length > 0) && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {lang === 'en' ? 'All staff busy at this time' : lang === 'sk' ? 'Všetci zamestnanci sú v tomto čase obsadení' : 'Všichni zaměstnanci jsou v tomto čase obsazeni'}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l.clientName}</label>
                <input type="text" id="qb-name" name="qb-name" value={qbName} onChange={e => setQbName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Jan Novak" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l.phone}</label>
                <div className="flex gap-2">
                  <select value={qbPhonePrefix} onChange={e => {
                    setQbPhonePrefix(e.target.value)
                    const digits = qbPhone.replace(/\D/g, '').replace(/^420|^421/, '')
                    setQbPhone(e.target.value + ' ' + digits)
                  }} className="w-[110px] px-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-gray-50">
                    <option value="+420">🇨🇿 +420</option>
                    <option value="+421">🇸🇰 +421</option>
                  </select>
                  <input type="tel" id="qb-phone" name="qb-phone"
                    value={qbPhone.replace(/^\+42[01]\s?/, '')}
                    onChange={e => {
                      const digits = e.target.value.replace(/[^\d\s]/g, '')
                      setQbPhone(qbPhonePrefix + ' ' + digits)
                    }}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="777 123 456" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'Email (optional)' : 'Email (nepovinný)'}</label>
                <input type="email" id="qb-email" name="qb-email" value={qbEmail} onChange={e => setQbEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="jan@email.cz" />
                <p className="text-xs text-gray-400 mt-1">{lang === 'en' ? 'Client will receive booking confirmation' : 'Klient obdrží potvrzení rezervace'}</p>
              </div>
              {(() => {
                const isDayPast = selectedSlot.date < todayStr
                const slotTime = new Date(`${selectedSlot.date}T${selectedSlot.time}:00`)
                const isPast = (selectedSlot.date === todayStr && slotTime < new Date()) || isDayPast
                return isPast && backfillMode ? (
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-1">{l.backfillNote}</label>
                    <input type="text" id="qb-note" name="qb-note" value={qbNote} onChange={e => setQbNote(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-amber-300 rounded-xl text-sm bg-amber-50"
                      placeholder={lang === 'en' ? 'e.g. Client joined mid-month' : 'např. Klient nastoupil v půlce měsíce'} />
                  </div>
                ) : null
              })()}
            </div>
            <button onClick={handleQuickBook} disabled={qbSaving || !qbService || !qbName || !qbPhone.replace(/^\+42[01]\s?/, '').trim() || ((() => {
              const isDayPast = selectedSlot.date < todayStr
              const slotTime = new Date(`${selectedSlot.date}T${selectedSlot.time}:00`)
              const isPast = (selectedSlot.date === todayStr && slotTime < new Date()) || isDayPast
              return isPast && backfillMode && !qbNote
            })())}
              className="w-full mt-4 py-3 text-white rounded-xl font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
              style={{ background: mc.gradient, color: mc.text }}>
              {qbSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : l.createBooking}
            </button>
          </div>
        </div>
      )}

      {/* Slot bookings modal */}
      {showSlotBookings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{l.slotBookings}</h3>
              <button onClick={() => setShowSlotBookings(null)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <span className="text-gray-700 font-medium">
                {new Date(showSlotBookings.date + 'T12:00:00').toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {showSlotBookings.time && ` ${l.at} ${showSlotBookings.time}`}
              </span>
            </div>
            {showSlotBookings.bookings.length === 0 ? (
              <p className="text-center text-gray-400 py-8">{l.noBookings}</p>
            ) : (
              <div className="space-y-2">
                {showSlotBookings.bookings.map(b => (
                  <button key={b.id} onClick={() => { setShowSlotBookings(null); setShowDetail(b) }}
                    className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">{b.services?.name || l.booking}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(b.status)}`}>{statusLabel(b.status)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{b.customer_name || b.clients?.full_name || l.unknown}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-xs text-gray-400">
                        {new Date(b.start_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        {b.price ? ` | ${b.price} ${currency}` : ''}
                      </p>
                      {isTeam && b.staff && <span className="text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{b.staff.full_name}</span>}
                      {b.is_backfill && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">⏱ {l.backfillLabel}</span>}
                      {hasConflict(b) && <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{l.conflict}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {(() => {
              const isDayPast = showSlotBookings.date < todayStr
              const canAdd = !isDayPast || backfillMode
              return canAdd ? (
                <button onClick={() => { const d = showSlotBookings.date; const t = showSlotBookings.time || `${String(workStart).padStart(2, '0')}:00`; setShowSlotBookings(null); setSelectedSlot({ date: d, time: t }) }}
                  className="w-full mt-3 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 border-2 hover:brightness-110 transition-all"
                  style={{ background: mc.gradient, color: mc.text }}>
                  <Plus className="w-4 h-4" /> {l.newBooking}
                </button>
              ) : null
            })()}
          </div>
        </div>
      )}

      {/* Booking detail modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{l.bookingDetail}</h3>
              <button onClick={() => setShowDetail(null)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: showDetail.services?.color || '#3b82f6' }}>
                  {(showDetail.customer_name || showDetail.clients?.full_name || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{showDetail.customer_name || showDetail.clients?.full_name || l.unknown}</p>
                  <p className="text-sm text-gray-500">{formatPhone(showDetail.clients?.phone || showDetail.customer_phone)}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">{l.service}</span><span className="font-medium">{showDetail.services?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{l.date || "Datum"}</span><span className="font-medium">{new Date(showDetail.start_at).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></div><div className="flex justify-between"><span className="text-gray-500">{l.time}</span><span className="font-medium">{new Date(showDetail.start_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} - {new Date(showDetail.end_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span></div>
                {showDetail.staff && <div className="flex justify-between"><span className="text-gray-500">{l.specialist}</span><span className="font-medium">{showDetail.staff.full_name}</span></div>}
                {showDetail.price && <div className="flex justify-between"><span className="text-gray-500">{l.price}</span><span className="font-medium">{showDetail.price} {currency}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">{l.status}</span><span className={`font-medium px-2 py-0.5 rounded-full text-xs ${statusColor(showDetail.status)}`}>{statusLabel(showDetail.status)}</span></div>
                {showDetail.is_backfill && (
                  <div className="flex justify-between"><span className="text-gray-500">{l.backfillLabel}</span><span className="font-medium text-amber-600 px-2 py-0.5 bg-amber-50 rounded-full text-xs">⏱</span></div>
                )}
                {hasConflict(showDetail) && (
                  <div className="flex justify-between"><span className="text-gray-500">{l.conflict}</span><span className="font-medium text-red-600 px-2 py-0.5 bg-red-50 rounded-full text-xs">{l.conflict}</span></div>
                )}
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">{lang === 'en' ? 'Change status:' : 'Zmenit stav:'}</p>
                <div className="grid grid-cols-2 gap-2">
                  {showDetail.status !== 'completed' && (
                    <button onClick={() => handleStatusChange(showDetail.id, 'completed')}
                      className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100">{lang === 'en' ? 'Completed' : 'Dokončeno'}</button>
                  )}
                  {showDetail.status !== 'cancelled' && (
                    <button onClick={() => setCancelConfirm({id: showDetail.id, name: showDetail.customer_name || showDetail.clients?.full_name || ''})}
                      className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100">{lang === 'en' ? 'Cancel' : 'Zrusit'}</button>
                  )}
                  {showDetail.status !== 'no_show' && (
                    <button onClick={() => handleStatusChange(showDetail.id, 'no_show')}
                      className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100">{lang === 'en' ? 'No-show' : 'Nedostavil/a se'}</button>
                  )}
                  {showDetail.status !== 'confirmed' && (
                    <button onClick={() => handleStatusChange(showDetail.id, 'confirmed')}
                      className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">{lang === 'en' ? 'Confirm' : 'Potvrdit'}</button>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setShowDetail(null)} className="w-full mt-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">{l.close}</button>
          </div>
        </div>
      )}

      {cancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setCancelConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">✕</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {lang === 'en' ? 'Cancel booking?' : 'Zrušit rezervaci?'}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {cancelConfirm.name && <><strong>{cancelConfirm.name}</strong> — </>}
                {lang === 'en' ? 'The slot will be freed and the client notified.' : 'Slot se uvolní a klient bude informován.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setCancelConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {lang === 'en' ? 'Keep' : 'Ponechat'}
                </button>
                <button onClick={() => { handleStatusChange(cancelConfirm.id, 'cancelled'); setCancelConfirm(null); }}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">
                  {lang === 'en' ? 'Cancel booking' : 'Zrušit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}