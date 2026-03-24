// PATH: src/app/(dashboard)/reports/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/LangContext'
import { BarChart3, TrendingUp, TrendingDown, Users, Calendar, DollarSign, Clock, AlertTriangle, Star, Minus } from 'lucide-react'

interface KPI {
  totalRevenue: number; prevRevenue: number; revenueChange: number
  totalBookings: number; prevTotalBookings: number; bookingsChange: number
  noShowCount: number; noShowRate: number; cancelledCount: number
  avgBookingValue: number; uniqueClients: number; newClients: number
}

interface DailyRevenue { date: string; revenue: number; bookings: number }
interface TopService { id: string; name: string; color: string; count: number; revenue: number; noShow: number }
interface StaffPerf { id: string; name: string; count: number; revenue: number; noShow: number; avgValue: number }
interface StatusBreakdown { confirmed: number; completed: number; no_show: number; cancelled: number }
interface BusiestHour { hour: number; count: number }
interface BusiestDay { day: string; count: number }

interface ReportsData {
  period: string; kpi: KPI; dailyRevenue: DailyRevenue[]
  topServices: TopService[]; staffPerformance: StaffPerf[]
  statusBreakdown: StatusBreakdown; busiestHours: BusiestHour[]
  busiestDays: BusiestDay[]
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const { lang, modeGradient } = useLang()

  const currency = lang === 'en' ? 'CZK' : 'Kc'

  const l = {
    title: lang === 'en' ? 'Reports' : lang === 'sk' ? 'Reporty' : 'Reporty',
    subtitle: lang === 'en' ? 'Business performance overview' : lang === 'sk' ? 'Prehlad vykonnosti' : 'Prehled vykonnosti',
    month: lang === 'en' ? 'Month' : lang === 'sk' ? 'Mesiac' : 'Mesic',
    quarter: lang === 'en' ? 'Quarter' : lang === 'sk' ? 'Kvartal' : 'Kvartal',
    year: lang === 'en' ? 'Year' : 'Rok',
    revenue: lang === 'en' ? 'Revenue' : lang === 'sk' ? 'Trzby' : 'Trzby',
    bookings: lang === 'en' ? 'Bookings' : lang === 'sk' ? 'Rezervacie' : 'Rezervace',
    noShow: 'No-show',
    cancelled: lang === 'en' ? 'Cancelled' : lang === 'sk' ? 'Zrusene' : 'Zrusene',
    avgValue: lang === 'en' ? 'Avg. value' : lang === 'sk' ? 'Prum. hodnota' : 'Prum. hodnota',
    clients: lang === 'en' ? 'Unique clients' : lang === 'sk' ? 'Unikatni klienti' : 'Unikatni klienti',
    newClients: lang === 'en' ? 'New clients' : lang === 'sk' ? 'Novi klienti' : 'Novi klienti',
    topServices: lang === 'en' ? 'Top services' : lang === 'sk' ? 'Top sluzby' : 'Top sluzby',
    staffPerf: lang === 'en' ? 'Staff performance' : lang === 'sk' ? 'Vykonnost zamestnancov' : 'Vykonnost zamestnancu',
    dailyRevenue: lang === 'en' ? 'Daily revenue' : lang === 'sk' ? 'Denne trzby' : 'Denni trzby',
    statusBreakdown: lang === 'en' ? 'Status breakdown' : lang === 'sk' ? 'Rozdelenie statusov' : 'Rozdeleni statusu',
    busiestHours: lang === 'en' ? 'Busiest hours' : lang === 'sk' ? 'Najvytazenejsie hodiny' : 'Nejvytizenejsi hodiny',
    busiestDays: lang === 'en' ? 'Busiest days' : lang === 'sk' ? 'Najvytazenejsie dni' : 'Nejvytizenejsi dny',
    loading: lang === 'en' ? 'Loading reports...' : lang === 'sk' ? 'Nacitavam reporty...' : 'Nacitam reporty...',
    noData: lang === 'en' ? 'No data for this period' : lang === 'sk' ? 'Ziadne data za toto obdobie' : 'Zadna data za toto obdobi',
    vsPrev: lang === 'en' ? 'vs previous' : lang === 'sk' ? 'vs predchadzajuce' : 'vs predchozi',
    confirmed: lang === 'en' ? 'Confirmed' : lang === 'sk' ? 'Potvrdene' : 'Potvrzene',
    completed: lang === 'en' ? 'Completed' : lang === 'sk' ? 'Dokoncene' : 'Dokoncene',
  }

  useEffect(() => {
    setLoading(true)
    fetch(`/api/reports?period=${period}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d) })
      .finally(() => setLoading(false))
  }, [period])

  const fmt = (n: number) => n.toLocaleString('cs-CZ')
  const pct = (n: number) => (n > 0 ? '+' : '') + n + '%'

  const ChangeIndicator = ({ value }: { value: number }) => (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${value > 0 ? 'bg-green-100 text-green-700' : value < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
      {value > 0 ? <TrendingUp className="w-3 h-3" /> : value < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {pct(value)}
    </span>
  )

  if (loading) return <div className="text-center py-12 text-gray-400">{l.loading}</div>
  if (!data) return <div className="text-center py-12 text-gray-400">{l.noData}</div>

  const { kpi, dailyRevenue, topServices, staffPerformance, statusBreakdown, busiestHours, busiestDays } = data
  const maxDailyRev = Math.max(...dailyRevenue.map(d => d.revenue), 1)
  const maxDailyBook = Math.max(...dailyRevenue.map(d => d.bookings), 1)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7" style={{ color: '#0369a1' }} /> {l.title}
          </h1>
          <p className="mt-1 text-gray-500">{l.subtitle}</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['month', 'quarter', 'year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${period === p ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {l[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{l.revenue}</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(kpi.totalRevenue)} {currency}</p>
          <div className="flex items-center gap-2 mt-1">
            <ChangeIndicator value={kpi.revenueChange} />
            <span className="text-xs text-gray-400">{l.vsPrev}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{l.bookings}</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(kpi.totalBookings)}</p>
          <div className="flex items-center gap-2 mt-1">
            <ChangeIndicator value={kpi.bookingsChange} />
            <span className="text-xs text-gray-400">{l.vsPrev}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{l.avgValue}</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(kpi.avgBookingValue)} {currency}</p>
          <p className="text-xs text-gray-400 mt-1">{kpi.uniqueClients} {l.clients.toLowerCase()}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{l.noShow}</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.noShowRate}%</p>
          <p className="text-xs text-gray-400 mt-1">{kpi.noShowCount}x no-show, {kpi.cancelledCount}x {l.cancelled.toLowerCase()}</p>
        </div>
      </div>

      {/* New clients + unique */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{l.newClients}</span>
          </div>
          <p className="text-xl font-bold text-blue-900">{kpi.newClients}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">{l.clients}</span>
          </div>
          <p className="text-xl font-bold text-green-900">{kpi.uniqueClients}</p>
        </div>

        {/* Status breakdown inline */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">{l.statusBreakdown}</p>
          <div className="flex gap-3 text-sm">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> {l.completed}: {statusBreakdown.completed}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> {l.confirmed}: {statusBreakdown.confirmed}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> No-show: {statusBreakdown.no_show}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> {l.cancelled}: {statusBreakdown.cancelled}</span>
          </div>
          {kpi.totalBookings > 0 && (
            <div className="flex h-2 rounded-full overflow-hidden mt-2 bg-gray-100">
              <div className="bg-green-500" style={{ width: `${(statusBreakdown.completed / (kpi.totalBookings + kpi.cancelledCount)) * 100}%` }} />
              <div className="bg-blue-500" style={{ width: `${(statusBreakdown.confirmed / (kpi.totalBookings + kpi.cancelledCount)) * 100}%` }} />
              <div className="bg-red-500" style={{ width: `${(statusBreakdown.no_show / (kpi.totalBookings + kpi.cancelledCount)) * 100}%` }} />
              <div className="bg-gray-400" style={{ width: `${(kpi.cancelledCount / (kpi.totalBookings + kpi.cancelledCount)) * 100}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Daily Revenue Chart */}
      {dailyRevenue.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{l.dailyRevenue}</h3>
          <div className="flex items-end gap-1 h-40">
            {dailyRevenue.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {d.date.slice(5)}: {fmt(d.revenue)} {currency} ({d.bookings}x)
                </div>
                <div className="w-full rounded-t-sm transition-all hover:brightness-90"
                  style={{ height: `${(d.revenue / maxDailyRev) * 100}%`, minHeight: d.revenue > 0 ? '4px' : '1px', background: d.revenue > 0 ? modeGradient : '#e5e7eb' }} />
                {dailyRevenue.length <= 31 && (
                  <span className="text-[9px] text-gray-400">{d.date.slice(8)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Services */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{l.topServices}</h3>
          {topServices.length === 0 ? (
            <p className="text-sm text-gray-400">{l.noData}</p>
          ) : (
            <div className="space-y-3">
              {topServices.map((s, i) => {
                const maxRev = topServices[0]?.revenue || 1
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">{s.name}</span>
                        <span className="text-sm font-bold text-gray-900 ml-2">{fmt(s.revenue)} {currency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(s.revenue / maxRev) * 100}%`, backgroundColor: s.color }} />
                        </div>
                        <span className="text-xs text-gray-400">{s.count}x</span>
                        {s.noShow > 0 && <span className="text-xs text-red-400">{s.noShow} ns</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{l.staffPerf}</h3>
          {staffPerformance.length === 0 ? (
            <p className="text-sm text-gray-400">{l.noData}</p>
          ) : (
            <div className="space-y-3">
              {staffPerformance.map((s, i) => {
                const maxRev = staffPerformance[0]?.revenue || 1
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-300'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{s.name}</span>
                        <span className="text-sm font-bold text-gray-900">{fmt(s.revenue)} {currency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${(s.revenue / maxRev) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{s.count}x</span>
                        <span className="text-xs text-gray-400">~{fmt(s.avgValue)} {currency}</span>
                        {s.noShow > 0 && <span className="text-xs text-red-400">{s.noShow} ns</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Busiest hours + days */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" /> {l.busiestHours}
          </h3>
          {busiestHours.length === 0 ? (
            <p className="text-sm text-gray-400">{l.noData}</p>
          ) : (
            <div className="space-y-2">
              {busiestHours.map(h => {
                const max = busiestHours[0]?.count || 1
                return (
                  <div key={h.hour} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-12">{h.hour}:00</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-sky-400" style={{ width: `${(h.count / max) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-8 text-right">{h.count}x</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" /> {l.busiestDays}
          </h3>
          {busiestDays.length === 0 ? (
            <p className="text-sm text-gray-400">{l.noData}</p>
          ) : (
            <div className="space-y-2">
              {busiestDays.map(d => {
                const max = busiestDays[0]?.count || 1
                return (
                  <div key={d.day} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-8">{d.day}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-400" style={{ width: `${(d.count / max) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-8 text-right">{d.count}x</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
