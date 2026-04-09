﻿﻿﻿﻿﻿// PATH: src/app/(dashboard)/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { AiInsightsWidget } from '@/components/AiInsightsWidget'
import { useLang } from '@/lib/LangContext'
import {
  Calendar, TrendingUp, TrendingDown, Users, DollarSign,
  AlertTriangle, ArrowRight, Zap, Coffee, Sun, Moon, Lamp,
} from 'lucide-react'
import { DashboardSkeleton } from '@/components/Skeleton'

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
  const { t, lang, modeGradient, contentTheme: ct } = useLang()
  const { organization } = useAuth()

  const locale = lang === 'sk' ? 'sk-SK' : lang === 'en' ? 'en-US' : 'cs-CZ'
  const currency = t('currency')

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div ><DashboardSkeleton /></div>
  if (!data) return <div className="text-center py-12 text-red-400">{t('dash_error')}</div>

  const formatPrice = (n: number) => n.toLocaleString(locale) + ' ' + currency
  const maxDaily = Math.max(...data.week.daily.map(d => d.count), 1)

  return (
    <div>
            {/* Header s pozdravem */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          {new Date().getHours() >= 6 && new Date().getHours() < 12 && <Coffee className="w-6 h-6 text-amber-500" />}
          {new Date().getHours() >= 12 && new Date().getHours() < 18 && <Sun className="w-6 h-6 text-yellow-500" />}
          {new Date().getHours() >= 18 && new Date().getHours() < 23 && <Moon className="w-6 h-6 text-indigo-400" />}
          {(new Date().getHours() >= 23 || new Date().getHours() < 6) && <Lamp className="w-6 h-6 text-purple-400" />}
          <h1 className="text-2xl font-bold" style={{ color: ct?.textPrimary || '#0f172a' }}>
            {new Date().getHours() >= 6 && new Date().getHours() < 12
              ? (lang === 'en' ? 'Good morning' : lang === 'sk' ? 'Dobré ráno' : 'Dobré ráno')
              : new Date().getHours() >= 12 && new Date().getHours() < 18
                ? (lang === 'en' ? 'Good afternoon' : lang === 'sk' ? 'Dobré popoludnie' : 'Dobré odpoledne')
                : new Date().getHours() >= 18 && new Date().getHours() < 23
                  ? (lang === 'en' ? 'Good evening' : lang === 'sk' ? 'Dobrý večer' : 'Dobrý večer')
                  : (lang === 'en' ? 'Still up?' : lang === 'sk' ? 'Ešte hore?' : 'Ještě vzhůru?')
            }
          </h1>
        </div>
        <p className="text-sm" style={{ color: ct?.textMuted || '#64748b' }}>
          {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {data && data.today.bookings > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              · {lang === 'en' ? 'Today' : 'Dnes'}: {data.today.bookings} {lang === 'en' ? 'bookings' : 'rezervací'}
              {data.today.upcoming && data.today.upcoming.length > 0 && (
                <span className="text-gray-400 font-normal">
                  , {lang === 'en' ? 'first at' : 'první v'} {new Date(data.today.upcoming[0].start_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </span>
          )}
          {data && data.today.bookings === 0 && (
            <span className="ml-2 text-gray-400">· {lang === 'en' ? 'No bookings today' : 'Dnes žádné rezervace'}</span>
          )}
        </p>
      </div>

      {/* Welcome guide pro nové uživatele */}
      {data.totals.clients === 0 && data.month.bookings === 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl border border-blue-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {lang === 'en' ? 'Welcome to Clientoro!' : lang === 'sk' ? 'Vitajte v Clientoro!' : 'Vítejte v Clientoro!'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {lang === 'en' ? 'Set up your business in a few steps:' : lang === 'sk' ? 'Nastavte si podnikanie v pár krokoch:' : 'Nastavte si podnikání v pár krocích:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Krok 1: Služby — vždy */}
            <a href="/services" className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{lang === 'en' ? 'Add services' : lang === 'sk' ? 'Pridajte služby' : 'Přidejte služby'}</p>
                <p className="text-xs text-gray-400">{lang === 'en' ? 'What do you offer?' : lang === 'sk' ? 'Čo ponúkate?' : 'Co nabízíte?'}</p>
              </div>
            </a>

            {/* Krok 2: Tým (team/pro_inspire) NEBO Pracovní doba (solo/solo_inspire) */}
            {(organization?.mode === 'team' || organization?.mode === 'pro_inspire') ? (
              <a href="/staff" className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{lang === 'en' ? 'Set up team' : lang === 'sk' ? 'Nastavte tím' : 'Nastavte tým'}</p>
                  <p className="text-xs text-gray-400">{lang === 'en' ? 'Working hours & staff' : lang === 'sk' ? 'Pracovná doba a tím' : 'Pracovní doba a tým'}</p>
                </div>
              </a>
            ) : (
              <a href="/settings" className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{lang === 'en' ? 'Set working hours' : lang === 'sk' ? 'Nastavte pracovnú dobu' : 'Nastavte pracovní dobu'}</p>
                  <p className="text-xs text-gray-400">{lang === 'en' ? 'When are you available?' : lang === 'sk' ? 'Kedy ste k dispozícii?' : 'Kdy jste k dispozici?'}</p>
                </div>
              </a>
            )}

            {/* Krok 3: AI insighty (solo_inspire/pro_inspire) */}
            {(organization?.mode === 'solo_inspire' || organization?.mode === 'pro_inspire') && (
              <a href="/settings" className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{lang === 'en' ? 'Explore AI insights' : lang === 'sk' ? 'Preskúmajte AI insighty' : 'Prozkoumejte AI insighty'}</p>
                  <p className="text-xs text-gray-400">{lang === 'en' ? 'Smart recommendations' : lang === 'sk' ? 'Chytré odporúčania' : 'Chytrá doporučení'}</p>
                </div>
              </a>
            )}

            {/* Poslední krok: Sdílet link — vždy */}
            <a href="/settings" className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 text-sm font-bold">{(organization?.mode === 'solo_inspire' || organization?.mode === 'pro_inspire') ? 4 : 3}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{lang === 'en' ? 'Share booking link' : lang === 'sk' ? 'Zdieľajte link' : 'Sdílejte booking link'}</p>
                <p className="text-xs text-gray-400">{lang === 'en' ? 'Clients book online' : lang === 'sk' ? 'Klienti rezervujú online' : 'Klienti rezervují online'}</p>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* KPI karty — dnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl p-5" style={{ background: ct?.cardBg || '#fff', border: ct?.cardBorder || '1px solid #e2e8f0' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: ct?.textMuted || '#64748b' }}>{t('dash_today_bookings')}</span>
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold" style={{ color: ct?.textPrimary || '#0f172a' }}>{data.today.bookings}</p>
          <p className="text-xs mt-1" style={{ color: ct?.textMuted || '#94a3b8' }}>{t('dash_this_week')}: {data.week.bookings}</p>
        </div>

        <div className="rounded-xl p-5" style={{ background: ct?.cardBg || '#fff', border: ct?.cardBorder || '1px solid #e2e8f0' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: ct?.textMuted || '#64748b' }}>{t('dash_today_revenue')}</span>
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-green-600">Kč</span>
            </div>
          </div>
          <p className="text-3xl font-bold" style={{ color: ct?.textPrimary || '#0f172a' }}>{formatPrice(data.today.revenue)}</p>
          <p className="text-xs mt-1" style={{ color: ct?.textMuted || '#94a3b8' }}>{t('dash_this_week')}: {formatPrice(data.week.revenue)}</p>
        </div>

        <div className="rounded-xl p-5" style={{ background: ct?.cardBg || '#fff', border: ct?.cardBorder || '1px solid #e2e8f0' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: ct?.textMuted || '#64748b' }}>{t('dash_month_revenue')}</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${data.month.revenueChange >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {data.month.revenueChange >= 0
                ? <TrendingUp className="w-5 h-5 text-green-600" />
                : <TrendingDown className="w-5 h-5 text-red-600" />
              }
            </div>
          </div>
          <p className="text-3xl font-bold" style={{ color: ct?.textPrimary || '#0f172a' }}>{formatPrice(data.month.revenue)}</p>
          <p className={`text-xs mt-1 font-medium ${data.month.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.month.revenueChange >= 0 ? "\u2191" : "\u2193"} {Math.abs(data.month.revenueChange)}% {t('dash_vs_last_month')}
          </p>
        </div>

        <div className="rounded-xl p-5" style={{ background: ct?.cardBg || '#fff', border: ct?.cardBorder || '1px solid #e2e8f0' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: ct?.textMuted || '#64748b' }}>{t('dash_clients')}</span>
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold" style={{ color: ct?.textPrimary || '#0f172a' }}>{data.totals.clients}</p>
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

          {/* Inspire upgrade banner - jen pro solo/team */}
          {(organization?.mode === 'solo' || organization?.mode === 'team') && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✨</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Odemkněte plný potenciál s Inspire</h3>
                  <p className="text-sm text-gray-600 mb-3">AI Business Coach, chytré návrhy, automatizace a více. Nechte AI pracovat za vás.</p>
                  <button onClick={() => router.push('/settings')} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm">
                    Zjistit více o Inspire →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


