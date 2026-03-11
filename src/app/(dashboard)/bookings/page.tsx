'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, Search, Calendar, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock, X, Trash2, ChevronRight, Phone, Mail } from 'lucide-react'

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

const STATUS_OPTIONS = [
  { value: 'all', label: 'Všechny', color: '', icon: ClipboardList },
  { value: 'confirmed', label: 'Potvrzené', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: CheckCircle },
  { value: 'completed', label: 'Dokončené', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', icon: CheckCircle },
  { value: 'cancelled', label: 'Zrušené', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', icon: XCircle },
  { value: 'pending', label: 'Čekající', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: Clock },
  { value: 'no_show', label: 'Nepřišel', color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', icon: AlertTriangle },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

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
      await fetch('/api/bookings/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      setSelectedBooking(null); fetchBookings()
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Smazat rezervaci?')) return
    try { await fetch('/api/bookings/' + id, { method: 'DELETE' }); setSelectedBooking(null); fetchBookings() }
    catch (err) { console.error(err) }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' })
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
  const getStatus = (s: string) => STATUS_OPTIONS.find(o => o.value === s) || { label: s, color: 'bg-gray-50 text-gray-700 border-gray-200', dot: 'bg-gray-500' }
  const getName = (b: Booking) => b.clients?.full_name || b.customer_name || 'Neznámý klient'
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!getName(b).toLowerCase().includes(q) && !(b.services?.name || '').toLowerCase().includes(q) && !(b.staff?.full_name || '').toLowerCase().includes(q)) return false
    }
    return true
  })

  const total = bookings.length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const completed = bookings.filter(b => b.status === 'completed').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length
  const revenue = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').reduce((s, b) => s + (b.price || 0), 0)
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-blue-600" /> Rezervace
          </h1>
          <p className="mt-1 text-gray-500">Přehled všech rezervací ({total} celkem)</p>
        </div>
        <a href="/calendar"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm shadow-sm transition-colors">
          <Calendar className="w-4 h-4" /> Otevřít kalendář
        </a>
      </div>

      {/* KPI karty */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Celkem</span>
            <ClipboardList className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-600">Potvrzené</span>
            <CheckCircle className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-700">{confirmed}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-green-600">Dokončené</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-700">{completed}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-red-600">Zrušené</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-700">{cancelled}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Tržby</span>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{revenue.toLocaleString('cs-CZ')} Kč</p>
        </div>
      </div>

      {/* Filtry */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="Hledat klienta, službu..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setStatusFilter(o.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === o.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Detail rezervace */}
      {selectedBooking && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
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
            <button onClick={() => setSelectedBooking(null)}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">Služba</p>
              <p className="font-semibold text-gray-900 mt-1">{selectedBooking.services?.name || '-'}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-xs text-amber-600 font-medium">Datum a čas</p>
              <p className="font-semibold text-gray-900 mt-1">{formatDate(selectedBooking.start_at)}</p>
              <p className="text-sm text-gray-600">{formatTime(selectedBooking.start_at)} — {formatTime(selectedBooking.end_at)}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
              <p className="text-xs text-purple-600 font-medium">Specialista</p>
              <p className="font-semibold text-gray-900 mt-1">{selectedBooking.staff?.full_name || '-'}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <p className="text-xs text-green-600 font-medium">Cena</p>
              <p className="font-semibold text-gray-900 mt-1">{selectedBooking.price ? `${selectedBooking.price} Kč` : '-'}</p>
            </div>
          </div>

          {selectedBooking.note && (
            <div className="bg-amber-50 rounded-xl p-3 mb-4 border border-amber-100">
              <p className="text-xs text-amber-600 font-medium mb-1">📝 Poznámka</p>
              <p className="text-sm text-gray-700">{selectedBooking.note}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {selectedBooking.status !== 'completed' && (
              <button onClick={() => handleStatusChange(selectedBooking.id, 'completed')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 border border-green-200">
                <CheckCircle className="w-3.5 h-3.5" /> Dokončit
              </button>
            )}
            {selectedBooking.status !== 'confirmed' && selectedBooking.status !== 'completed' && (
              <button onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 border border-blue-200">
                <CheckCircle className="w-3.5 h-3.5" /> Potvrdit
              </button>
            )}
            {selectedBooking.status !== 'cancelled' && (
              <button onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100 border border-red-200">
                <XCircle className="w-3.5 h-3.5" /> Zrušit
              </button>
            )}
            {selectedBooking.status !== 'no_show' && (
              <button onClick={() => handleStatusChange(selectedBooking.id, 'no_show')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-100 border border-orange-200">
                <AlertTriangle className="w-3.5 h-3.5" /> Nepřišel
              </button>
            )}
            <button onClick={() => handleDelete(selectedBooking.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 border border-gray-200">
              <Trash2 className="w-3.5 h-3.5" /> Smazat
            </button>
          </div>
        </div>
      )}

      {/* Seznam */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Načítám rezervace...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {search || statusFilter !== 'all' ? 'Žádné rezervace nenalezeny' : 'Žádné rezervace'}
          </h3>
          <p className="mt-1 text-gray-500">{search || statusFilter !== 'all' ? 'Zkuste změnit filtry' : 'Vytvořte první rezervaci v kalendáři'}</p>
          {!search && statusFilter === 'all' && (
            <a href="/calendar" className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm shadow-sm">
              <Calendar className="w-4 h-4" /> Otevřít kalendář
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => {
            const status = getStatus(b.status)
            return (
              <div key={b.id} onClick={() => setSelectedBooking(b)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all flex items-center gap-4">

                {/* Barevný proužek */}
                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: b.services?.color || '#3b82f6' }} />

                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: b.services?.color || '#3b82f6' }}>
                  {getInitials(getName(b))}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 truncate">{getName(b)}</span>
                    <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${(status as any).dot}`} />
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-gray-400">
                    <span>{b.services?.name || '-'}</span>
                    <span>{b.staff?.full_name || '-'}</span>
                  </div>
                </div>

                {/* Datum + čas */}
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{formatDate(b.start_at)}</p>
                  <p className="text-xs text-gray-400">{formatTime(b.start_at)} — {formatTime(b.end_at)}</p>
                </div>

                {/* Cena */}
                <div className="hidden md:block text-right min-w-[80px]">
                  <p className="text-sm font-bold text-gray-900">{b.price ? `${b.price} Kč` : '-'}</p>
                </div>

                {/* Mobilní status */}
                <span className={`sm:hidden w-2.5 h-2.5 rounded-full flex-shrink-0 ${(status as any).dot}`} />

                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
