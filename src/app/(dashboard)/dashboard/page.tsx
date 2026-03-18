﻿﻿﻿// PATH: src/app/(dashboard)/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '../layout'
import {
  Calendar, TrendingUp, TrendingDown, Users, DollarSign,
  Clock, AlertTriangle, Star, ArrowRight, Zap,
} from 'lucide-react'

interface DashboardData {
  today: {
    bookings: number
    revenue: number
    noShow: number
    upcoming: any[]
  }
  week: {
    bookings: number
    revenue: number
    daily: { day: string; count: number; revenue: number }[]
  }
  month: {
    bookings: number
    revenue: number
    noShow: number
    revenueChange: number
    newClients: number
  }
  totals: {
    clients: number
    staff: number
  }
  topServices: { name: string; color: string; count: number; revenue: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { t, lang, modeGradient } = useLang()

  const locale = lang === 'sk' ? 'sk-SK' : lang === 'en' ? 'en-US' : 'cs-CZ'
  const currency = t('currency')

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-400">{t('dash_loading')}</div>
  if (!data) return <div className="text-center py-12 text-red-400">{t('dash_error')}</div>

  const formatPrice = (n: number) => n.toLocaleString(locale) + ' ' + currency
  const maxDaily = Math.max(...data.week.daily.map(d => d.count), 1)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('dash_title')}</h1>
        <p className="mt-1 text-gray-500">
          {t('dash_subtitle')} — {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI karty — dnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">{t('dash_today_bookings')}</span>
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.today.bookings}</p>
          <p className="text-xs text-gray-400 mt-1">{t('dash_this_week')}: {data.week.bookings}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">{t('dash_today_revenue')}</span>
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-green-600">Kc</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatPrice(data.today.revenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{t('dash_this_week')}: {formatPrice(data.week.revenue)}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">{t('dash_month_revenue')}</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${data.month.revenueChange >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {data.month.revenueChange >= 0
                ? <TrendingUp className="w-5 h-5 text-green-600" />
                : <TrendingDown className="w-5 h-5 text-red-600" />
              }
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatPrice(data.month.revenue)}</p>
          <p className={`text-xs mt-1 font-medium ${data.month.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.month.revenueChange >= 0 ? "\u2191" : "\u2193"} {Math.abs(data.month.revenueChange)}% {t('dash_vs_last_month')}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">{t('dash_clients')}</span>
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.totals.clients}</p>
          <p className="text-xs text-green-600 mt-1 font-medium">+{data.month.newClients} {t('dash_new_this_month')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Levy sloupec — 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tydenni graf */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dash_this_week')}</h2>
            <div className="flex items-end gap-3 h-40">
              {data.week.daily.map((d, i) => {
                const height = maxDaily > 0 ? (d.count / maxDaily) * 100 : 0
                const isToday = i === (new Date().getDay() + 6) % 7
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-gray-500">{d.count}</span>
                    <div className="w-full rounded-t-lg relative" style={{ height: `${Math.max(height, 4)}%` }}>
                      <div className={`absolute inset-0 rounded-t-lg ${isToday ? 'bg-blue-500' : 'bg-blue-200'}`} />
                    </div>
                    <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>{d.day}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500">{t('dash_total_bookings')}</p>
                <p className="text-lg font-bold text-gray-900">{data.week.bookings}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{t('dash_total_revenue')}</p>
                <p className="text-lg font-bold text-gray-900">{formatPrice(data.week.revenue)}</p>
              </div>
            </div>
          </div>

          {/* Dnesni rezervace */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('dash_today_reservations')}</h2>
              <button onClick={() => router.push('/calendar')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                {t('dash_calendar')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {data.today.upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">{t('dash_no_bookings_today')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.today.upcoming.map((b: any) => {
                  const time = new Date(b.start_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
                  const endTime = new Date(b.end_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
                  const isPast = new Date(b.end_at) < new Date()
                  const isNow = new Date(b.start_at) <= new Date() && new Date(b.end_at) >= new Date()
                  return (
                    <div key={b.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isNow ? 'border-blue-300 bg-blue-50' : isPast ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200'
                    }`}>
                      <div className="w-1 h-10 rounded-full" style={{ backgroundColor: b.services?.color || '#3b82f6' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm truncate">
                            {b.customer_name || b.clients?.full_name || '—'}
                          </span>
                          {isNow && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{t('dash_now')}</span>}
                          {b.status === 'no_show' && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">No-show</span>}
                        </div>
                        <p className="text-xs text-gray-500">{b.services?.name || '-'} • {b.staff?.full_name || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{time} — {endTime}</p>
                        {b.price && <p className="text-xs text-gray-500">{b.price} {currency}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pravy sloupec — 1/3 */}
        <div className="space-y-6">

          {/* Mesicni statistiky */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dash_this_month')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{t('dash_reservations')}</span>
                </div>
                <span className="font-bold text-gray-900">{data.month.bookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{t('dash_revenue')}</span>
                </div>
                <span className="font-bold text-gray-900">{formatPrice(data.month.revenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{t('dash_noshow')}</span>
                </div>
                <span className={`font-bold ${data.month.noShow > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {data.month.noShow}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{t('dash_new_clients')}</span>
                </div>
                <span className="font-bold text-green-600">+{data.month.newClients}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{t('dash_team_members')}</span>
                </div>
                <span className="font-bold text-gray-900">{data.totals.staff}</span>
              </div>
            </div>
          </div>

          {/* Top sluzby */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dash_top_services')}</h2>
            {data.topServices.length === 0 ? (
              <p className="text-sm text-gray-400">{t('dash_no_data')}</p>
            ) : (
              <div className="space-y-3">
                {data.topServices.map((svc, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: svc.color || '#3b82f6' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{svc.name}</p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                        <div className="h-1.5 rounded-full" style={{
                          backgroundColor: svc.color || '#3b82f6',
                          width: `${(svc.count / (data.topServices[0]?.count || 1)) * 100}%`
                        }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{svc.count}x</p>
                      <p className="text-xs text-gray-400">{formatPrice(svc.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dash_quick_actions')}</h2>
            <div className="space-y-2">
              <button onClick={() => router.push('/calendar')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium">
                <Calendar className="w-4 h-4" /> {t('dash_new_booking')}
              </button>
              <button onClick={() => router.push('/clients')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-sm font-medium">
                <Users className="w-4 h-4" /> {t('dash_add_client')}
              </button>
              <button onClick={() => router.push('/services')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium">
                <Zap className="w-4 h-4" /> {t('dash_add_service')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

