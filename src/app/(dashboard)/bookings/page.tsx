// PATH: src/app/(dashboard)/bookings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/LangContext'
import { useToast } from '@/components/Toast'
import {
  ClipboardList, Search, Calendar, DollarSign, AlertTriangle,
  CheckCircle, XCircle, Clock, X, Trash2, ChevronRight, Phone,
  Mail, Plus, Filter, ArrowUpDown,
} from 'lucide-react'

interface Booking {
  id: string
  client_id: string | null
  service_id: string
  staff_id: string | null
  start_at: string
  end_at: string
  status: string
  note: string | null
  price: number | null
  source: string | null
  customer_name: string | null
  customer_phone: string | null
  clients: { id: string; full_name: string; phone: string | null; email: string | null } | null
  services: { id: string; name: string; color: string; duration: number; price: number | null } | null
  staff: { id: string; full_name: string } | null
}

type DateRange = 'today' | 'week' | 'month' | 'all'
type SortBy = 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc' | 'name_asc'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [staffFilter, setStaffFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortBy>('date_desc')
  const [search, setSearch] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const { t, lang, modeGradient, modeText } = useLang()
  const toast = useToast()

  const locale = lang === 'sk' ? 'sk-SK' : lang === 'en' ? 'en-US' : 'cs-CZ'
  const currency = t('currency')

  const STATUS_OPTIONS = [
    { value: 'all', label: lang === 'en' ? 'All' : lang === 'sk' ? 'Všetky' : 'Všechny', bg: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
    { value: 'confirmed', label: lang === 'en' ? 'Confirmed' : lang === 'sk' ? 'Potvrdené' : 'Potvrzené', bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    { value: 'completed', label: lang === 'en' ? 'Completed' : lang === 'sk' ? 'Dokončené' : 'Dokončené', bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    { value: 'cancelled', label: lang === 'en' ? 'Cancelled' : lang === 'sk' ? 'Zrušené' : 'Zrušené', bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    { value: 'no_show', label: 'No-show', bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  ]

  const DATE_OPTIONS: { value: DateRange; label: string }[] = [
    { value: 'today', label: lang === 'en' ? 'Today' : 'Dnes' },
    { value: 'week', label: lang === 'en' ? 'This week' : lang === 'sk' ? 'Tento týždeň' : 'Tento týden' },
    { value: 'month', label: lang === 'en' ? 'This month' : lang === 'sk' ? 'Tento mesiac' : 'Tento měsíc' },
    { value: 'all', label: lang === 'en' ? 'All time' : lang === 'sk' ? 'Všetko' : 'Vše' },
  ]

  const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: 'date_desc', label: lang === 'en' ? '↓ Newest' : '↓ Nejnovější' },
    { value: 'date_asc', label: lang === 'en' ? '↑ Oldest' : '↑ Nejstarší' },
    { value: 'price_desc', label: lang === 'en' ? '↓ Price' : '↓ Cena' },
    { value: 'price_asc', label: lang === 'en' ? '↑ Price' : '↑ Cena' },
    { value: 'name_asc', label: lang === 'en' ? '↑ Name' : '↑ Jméno' },
  ]

  const l = {
    title: t('book_title'),
    openCalendar: t('book_open_calendar'),
    newBooking: lang === 'en' ? 'New booking' : lang === 'sk' ? 'Nová rezervácia' : 'Nová rezervace',
    service: t('cal_service'),
    dateTime: lang === 'en' ? 'Date & time' : lang === 'sk' ? 'Dátum a čas' : 'Datum a čas',
    specialist: lang === 'en' ? 'Specialist' : 'Specialista',
    price: t('cal_price'),
    note: t('cal_note'),
    complete: t('cal_complete'),
    confirm: lang === 'en' ? 'Confirm' : lang === 'sk' ? 'Potvrdiť' : 'Potvrdit',
    cancel: lang === 'en' ? 'Cancel' : lang === 'sk' ? 'Zrušiť' : 'Zrušit',
    noShow: 'No-show',
    delete: t('cal_delete'),
    noBookings: t('book_no_bookings'),
    noResults: lang === 'en' ? 'No bookings found' : lang === 'sk' ? 'Žiadne rezervácie' : 'Žádné rezervace',
    changeFilters: lang === 'en' ? 'Try changing filters' : lang === 'sk' ? 'Skúste zmeniť filtre' : 'Zkuste změnit filtry',
    createFirst: lang === 'en' ? 'Create your first booking' : lang === 'sk' ? 'Vytvorte prvú rezerváciu' : 'Vytvořte první rezervaci',
    loading: lang === 'en' ? 'Loading...' : lang === 'sk' ? 'Načítavam...' : 'Načítám...',
    total: lang === 'en' ? 'Total' : 'Celkem',
    revenue: lang === 'en' ? 'Revenue' : 'Tržby',
    filters: lang === 'en' ? 'Filters' : 'Filtry',
    allServices: lang === 'en' ? 'All services' : lang === 'sk' ? 'Všetky služby' : 'Všechny služby',
    allStaff: lang === 'en' ? 'All staff' : lang === 'sk' ? 'Všetci' : 'Všichni',
    statusChanged: lang === 'en' ? 'Status updated' : lang === 'sk' ? 'Stav aktualizovaný' : 'Stav aktualizován',
    deleted: lang === 'en' ? 'Booking deleted' : lang === 'sk' ? 'Rezervácia zmazaná' : 'Rezervace smazána',
    results: lang === 'en' ? 'results' : lang === 'sk' ? 'výsledkov' : 'výsledků',
  }

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (Array.isArray(data)) setBookings(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBookings() }, [])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/bookings/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(l.statusChanged)
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
        setSelectedBooking(prev => prev?.id === id ? { ...prev, status } : prev)
        // Email notifikace klientovi při změně statusu
        if (status === 'cancelled' || status === 'completed' || status === 'no_show') {
          fetch('/api/bookings/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: status, booking_id: id }),
          }).catch(err => console.error('[webhook]', err))
        }
      }
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'en' ? 'Delete booking?' : 'Smazat rezervaci?')) return
    try {
      const res = await fetch('/api/bookings/' + id, { method: 'DELETE' })
      if (res.ok) {
        toast.success(l.deleted)
        setSelectedBooking(null)
        setBookings(prev => prev.filter(b => b.id !== id))
      }
    } catch (err) { console.error(err) }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'numeric' })
  const formatTime = (d: string) => new Date(d).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const getStatus = (s: string) => STATUS_OPTIONS.find(o => o.value === s) || STATUS_OPTIONS[0]
  const getName = (b: Booking) => b.clients?.full_name || b.customer_name || '?'
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Unique services & staff for filters
  const uniqueServices = [...new Map(bookings.filter(b => b.services).map(b => [b.services!.id, b.services!])).values()]
  const uniqueStaff = [...new Map(bookings.filter(b => b.staff).map(b => [b.staff!.id, b.staff!])).values()]

  // Date filtering
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1); weekStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const filtered = bookings
    .filter(b => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false
      if (serviceFilter !== 'all' && b.service_id !== serviceFilter) return false
      if (staffFilter !== 'all' && b.staff_id !== staffFilter) return false
      if (dateRange === 'today' && !b.start_at.startsWith(todayStr)) return false
      if (dateRange === 'week' && new Date(b.start_at) < weekStart) return false
      if (dateRange === 'month' && new Date(b.start_at) < monthStart) return false
      if (search) {
        const q = search.toLowerCase()
        if (!getName(b).toLowerCase().includes(q) && !(b.services?.name || '').toLowerCase().includes(q) && !(b.staff?.full_name || '').toLowerCase().includes(q)) return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc': return new Date(b.start_at).getTime() - new Date(a.start_at).getTime()
        case 'date_asc': return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
        case 'price_desc': return (b.price || 0) - (a.price || 0)
        case 'price_asc': return (a.price || 0) - (b.price || 0)
        case 'name_asc': return getName(a).localeCompare(getName(b), locale)
        default: return 0
      }
    })

  const total = bookings.length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const completed = bookings.filter(b => b.status === 'completed').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length
  const noShow = bookings.filter(b => b.status === 'no_show').length
  const revenue = filtered.filter(b => b.status !== 'cancelled' && b.status !== 'no_show').reduce((s, b) => s + (b.price || 0), 0)
  const activeFilters = [statusFilter !== 'all', dateRange !== 'all', serviceFilter !== 'all', staffFilter !== 'all', search].filter(Boolean).length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-blue-600" /> {l.title}
          </h1>
          <p className="mt-1 text-gray-500">{filtered.length} {l.results} {activeFilters > 0 ? `(${activeFilters} ${l.filters.toLowerCase()})` : `(${total} ${l.total.toLowerCase()})`}</p>
        </div>
        <div className="flex gap-2">
          <a href="/calendar"
            style={{ background: modeGradient, color: modeText }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm hover:brightness-110 transition-all">
            <Plus className="w-4 h-4" /> {l.newBooking}
          </a>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
        <button onClick={() => setStatusFilter('all')} className={`rounded-xl border p-3 text-center transition-all ${statusFilter === 'all' ? 'border-gray-400 bg-gray-50 ring-1 ring-gray-300' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
          <p className="text-xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500">{l.total}</p>
        </button>
        <button onClick={() => setStatusFilter('confirmed')} className={`rounded-xl border p-3 text-center transition-all ${statusFilter === 'confirmed' ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300' : 'border-gray-200 bg-white hover:bg-blue-50'}`}>
          <p className="text-xl font-bold text-blue-700">{confirmed}</p>
          <p className="text-xs text-blue-600">{STATUS_OPTIONS[1].label}</p>
        </button>
        <button onClick={() => setStatusFilter('completed')} className={`rounded-xl border p-3 text-center transition-all ${statusFilter === 'completed' ? 'border-green-400 bg-green-50 ring-1 ring-green-300' : 'border-gray-200 bg-white hover:bg-green-50'}`}>
          <p className="text-xl font-bold text-green-700">{completed}</p>
          <p className="text-xs text-green-600">{STATUS_OPTIONS[2].label}</p>
        </button>
        <button onClick={() => setStatusFilter('cancelled')} className={`rounded-xl border p-3 text-center transition-all ${statusFilter === 'cancelled' ? 'border-red-400 bg-red-50 ring-1 ring-red-300' : 'border-gray-200 bg-white hover:bg-red-50'}`}>
          <p className="text-xl font-bold text-red-700">{cancelled}</p>
          <p className="text-xs text-red-600">{STATUS_OPTIONS[3].label}</p>
        </button>
        <button onClick={() => setStatusFilter('no_show')} className={`rounded-xl border p-3 text-center transition-all ${statusFilter === 'no_show' ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-300' : 'border-gray-200 bg-white hover:bg-orange-50'}`}>
          <p className="text-xl font-bold text-orange-700">{noShow}</p>
          <p className="text-xs text-orange-600">No-show</p>
        </button>
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
          <p className="text-xl font-bold text-emerald-700">{revenue.toLocaleString(locale)}</p>
          <p className="text-xs text-gray-500">{currency}</p>
        </div>
      </div>

      {/* Search + Filters toggle */}
      <div className="flex gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            placeholder={lang === 'en' ? 'Search by name, service, staff...' : 'Hledat podle jména, služby, specialisty...'} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${showFilters || activeFilters > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Filter className="w-4 h-4" /> {l.filters}
          {activeFilters > 0 && <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">{activeFilters}</span>}
        </button>
      </div>

      {/* Extended filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === 'en' ? 'Period' : 'Období'}</label>
            <select value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              {DATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{l.service}</label>
            <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="all">{l.allServices}</option>
              {uniqueServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{l.specialist}</label>
            <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="all">{l.allStaff}</option>
              {uniqueStaff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> {lang === 'en' ? 'Sort' : 'Řazení'}</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {activeFilters > 0 && (
            <button onClick={() => { setStatusFilter('all'); setDateRange('all'); setServiceFilter('all'); setStaffFilter('all'); setSearch(''); setSortBy('date_desc') }}
              className="col-span-2 md:col-span-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
              ✕ {lang === 'en' ? 'Clear all filters' : lang === 'sk' ? 'Zrušiť všetky filtre' : 'Zrušit všechny filtry'}
            </button>
          )}
        </div>
      )}

      {/* Detail */}
      {selectedBooking && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-bold text-sm shadow-md"
                style={{ backgroundColor: selectedBooking.services?.color || '#3b82f6' }}>
                {getInitials(getName(selectedBooking))}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{getName(selectedBooking)}</h2>
                <div className="flex gap-3 mt-1 text-sm text-gray-500">
                  {(selectedBooking.clients?.phone || selectedBooking.customer_phone) && (
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selectedBooking.clients?.phone || selectedBooking.customer_phone}</span>
                  )}
                  {selectedBooking.clients?.email && (
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedBooking.clients.email}</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">{l.service}</p>
              <p className="font-semibold text-gray-900 mt-1">{selectedBooking.services?.name || '-'}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-xs text-amber-600 font-medium">{l.dateTime}</p>
              <p className="font-semibold text-gray-900 mt-1">{formatDate(selectedBooking.start_at)}</p>
              <p className="text-sm text-gray-600">{formatTime(selectedBooking.start_at)} – {formatTime(selectedBooking.end_at)}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
              <p className="text-xs text-purple-600 font-medium">{l.specialist}</p>
              <p className="font-semibold text-gray-900 mt-1">{selectedBooking.staff?.full_name || '-'}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <p className="text-xs text-green-600 font-medium">{l.price}</p>
              <p className="font-semibold text-gray-900 mt-1">{selectedBooking.price ? `${selectedBooking.price} ${currency}` : '-'}</p>
            </div>
          </div>

          {selectedBooking.note && (
            <div className="bg-amber-50 rounded-xl p-3 mb-4 border border-amber-100">
              <p className="text-xs text-amber-600 font-medium mb-1">📝 {l.note}</p>
              <p className="text-sm text-gray-700">{selectedBooking.note}</p>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">{lang === 'en' ? 'Status:' : 'Stav:'}</span>
            {(() => { const s = getStatus(selectedBooking.status); return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${s.bg}`}><span className={`w-2 h-2 rounded-full ${s.dot}`} />{s.label}</span> })()}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {selectedBooking.status !== 'completed' && (
              <button onClick={() => handleStatusChange(selectedBooking.id, 'completed')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 border border-green-200">
                <CheckCircle className="w-3.5 h-3.5" /> {l.complete}
              </button>
            )}
            {selectedBooking.status !== 'confirmed' && selectedBooking.status !== 'completed' && (
              <button onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 border border-blue-200">
                <CheckCircle className="w-3.5 h-3.5" /> {l.confirm}
              </button>
            )}
            {selectedBooking.status !== 'cancelled' && (
              <button onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100 border border-red-200">
                <XCircle className="w-3.5 h-3.5" /> {l.cancel}
              </button>
            )}
            {selectedBooking.status !== 'no_show' && (
              <button onClick={() => handleStatusChange(selectedBooking.id, 'no_show')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-100 border border-orange-200">
                <AlertTriangle className="w-3.5 h-3.5" /> {l.noShow}
              </button>
            )}
            <button onClick={() => handleDelete(selectedBooking.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 border border-gray-200 ml-auto">
              <Trash2 className="w-3.5 h-3.5" /> {l.delete}
            </button>
          </div>
        </div>
      )}

      {/* Seznam */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">{l.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{activeFilters > 0 ? l.noResults : l.noBookings}</h3>
          <p className="mt-1 text-gray-500">{activeFilters > 0 ? l.changeFilters : l.createFirst}</p>
          {activeFilters === 0 && (
            <a href="/calendar" style={{ background: modeGradient, color: modeText }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl hover:brightness-110 font-medium text-sm shadow-sm">
              <Calendar className="w-4 h-4" /> {l.openCalendar}
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => {
            const status = getStatus(b.status)
            const isPast = new Date(b.start_at) < now
            return (
              <div key={b.id} onClick={() => setSelectedBooking(b)}
                className={`bg-white rounded-xl border p-4 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all flex items-center gap-4 ${isPast && b.status === 'confirmed' ? 'border-amber-200' : 'border-gray-200'}`}>
                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: b.services?.color || '#3b82f6' }} />
                <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: b.services?.color || '#3b82f6' }}>
                  {getInitials(getName(b))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 truncate">{getName(b)}</span>
                    <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${status.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    {isPast && b.status === 'confirmed' && (
                      <span className="hidden sm:inline text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">⚠️</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-gray-400">
                    <span>{b.services?.name || '-'}</span>
                    {b.staff?.full_name && <span>• {b.staff.full_name}</span>}
                  </div>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{formatDate(b.start_at)}</p>
                  <p className="text-xs text-gray-400">{formatTime(b.start_at)} – {formatTime(b.end_at)}</p>
                </div>
                <div className="hidden md:block text-right min-w-[80px]">
                  <p className="text-sm font-bold text-gray-900">{b.price ? `${b.price} ${currency}` : '-'}</p>
                </div>
                <span className={`sm:hidden w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.dot}`} />
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
