'use client'
// PATH: src/app/booking/manage/page.tsx
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, X, Calendar as CalendarIcon, Clock, User, MapPin, Phone, Loader2, AlertTriangle, Waves } from 'lucide-react'

function ManageBookingContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (!token) { setError('Chybí token'); setLoading(false); return }
    fetch(`/api/public/booking/manage?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setBooking(data)
        setLoading(false)
      })
      .catch(() => { setError('Nepodařilo se načíst rezervaci'); setLoading(false) })
  }, [token])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const r = await fetch('/api/public/booking/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'cancel' }),
      })
      const data = await r.json()
      if (data.success) setCancelled(true)
      else setError(data.error || 'Nepodařilo se zrušit')
    } catch { setError('Chyba při rušení') }
    setCancelling(false)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0f2 100%)' }}>
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  )

  if (error && !booking) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0f2 100%)' }}>
      <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-lg">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Rezervace nenalezena</h2>
        <p className="text-gray-500 text-sm">Odkaz je neplatný nebo vypršel.</p>
      </div>
    </div>
  )

  const org = booking?.organizations as any
  const service = booking?.services as any
  const staff = booking?.staff as any
  const isCancelled = booking?.status === 'cancelled' || cancelled

  return (
    <div className="min-h-screen p-4 flex items-start justify-center pt-12" style={{ fontFamily: "'Poppins', sans-serif", background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0f2 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold text-gray-900">{org?.name || 'Rezervace'}</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Správa rezervace</p>
        </div>

        {isCancelled ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
            <X className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-red-800 mb-1">Rezervace zrušena</h2>
            <p className="text-sm text-red-600">Vaše rezervace byla úspěšně zrušena.</p>
            {org?.slug && (
              <a href={`/book/${org.slug}`} className="inline-block mt-4 px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
                Vytvořit novou rezervaci
              </a>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">Rezervace potvrzena</span>
            </div>
          </div>
        )}

        <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #0a1628, #0c2d48, #0e4d64)' }}>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-white/30" />
              <span className="text-white/50 text-sm">Klient</span>
              <span className="text-white font-semibold text-sm ml-auto">{booking.customer_name}</span>
            </div>
            {service && (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: service.color || '#0f6b7a' }} />
                </div>
                <span className="text-white/50 text-sm">Služba</span>
                <span className="text-white font-semibold text-sm ml-auto">{service.name}</span>
              </div>
            )}
            {staff && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-white/30" />
                <span className="text-white/50 text-sm">Specialista</span>
                <span className="text-white font-semibold text-sm ml-auto">{staff.full_name}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-4 h-4 text-white/30" />
              <span className="text-white/50 text-sm">Datum</span>
              <span className="text-white font-semibold text-sm ml-auto">{formatDate(booking.start_at)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-white/30" />
              <span className="text-white/50 text-sm">Čas</span>
              <span className="text-white font-semibold text-sm ml-auto">{formatTime(booking.start_at)}</span>
            </div>
            {booking.price && (
              <>
                <div className="h-px bg-white/10" />
                <div className="flex items-center gap-3">
                  <span className="text-white/50 text-sm ml-7">Cena</span>
                  <span className="text-white font-bold text-lg ml-auto">{booking.price} <span className="text-white/40 text-sm font-normal">Kč</span></span>
                </div>
              </>
            )}
          </div>
        </div>

        {!isCancelled && (
          <div className="space-y-3">
            {org?.address && (
              <a href={`https://maps.google.com/?q=${encodeURIComponent(org.address)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Zobrazit na mapě</p>
                  <p className="text-sm text-gray-700 font-medium">{org.address}</p>
                </div>
              </a>
            )}
            {org?.phone && (
              <a href={`tel:${org.phone}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Zavolat</p>
                  <p className="text-sm text-gray-700 font-medium">{org.phone}</p>
                </div>
              </a>
            )}
            {/* Změnit termín */}
            <a href={`/book/${org?.slug}?reschedule=${token}&service=${(booking.services as any)?.name || ''}&staff=${(booking.staff as any)?.full_name || ''}`}
              className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:bg-blue-50 transition-colors text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Změnit termín</p>
                <p className="text-xs text-gray-400">Vyberte nový datum a čas</p>
              </div>
            </a>

            {/* Zrušit rezervaci */}
            {!showConfirm ? (
              <button onClick={() => setShowConfirm(true)}
                className="w-full flex items-center gap-3 bg-white rounded-2xl border border-red-100 p-4 hover:bg-red-50 transition-colors text-left">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-700">Zrušit rezervaci</p>
                  <p className="text-xs text-red-400">Uvolníme termín pro ostatní</p>
                </div>
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <p className="text-sm font-semibold text-red-800 mb-1">Opravdu chcete zrušit?</p>
                <p className="text-xs text-red-600 mb-4">Tato akce je nevratná.</p>
                <div className="flex gap-3">
                  <button onClick={handleCancel} disabled={cancelling}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Ano, zrušit'}
                  </button>
                  <button onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2.5 bg-white text-gray-700 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50">
                    Ne, ponechat
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 flex items-center justify-center gap-2">
          <Waves className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-300 text-[10px] font-semibold" style={{ letterSpacing: '0.2em' }}>POWERED BY CLIENTORO</span>
        </div>
      </div>
    </div>
  )
}

export default function ManageBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0f2 100%)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <ManageBookingContent />
    </Suspense>
  )
}
