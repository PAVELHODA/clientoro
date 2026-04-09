// PATH: src/app/api/ai/insights/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'

export const dynamic = 'force-dynamic'

interface Insight {
  id: string
  type: 'empty_slots' | 'reactivation' | 'revenue_trend' | 'top_service' | 'weak_day' | 'no_show_risk' | 'tip'
  priority: 'high' | 'medium' | 'low'
  icon: string
  title: string
  description: string
  action?: string
  actionLabel?: string
  data?: Record<string, any>
}

// Convert JS getDay() (0=Sun) to ISO 8601 weekday (1=Mon, 7=Sun)
function jsToIsoWeekday(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, 'staff')
  if (!auth.authorized || !auth.organizationId) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
  }

  const orgId = auth.organizationId
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const insights: Insight[] = []

  try {
    // Fetch org settings
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('work_start, work_end, work_days, slot_duration, break_duration, break_start')
      .eq('id', orgId)
      .single()

    // Fetch active staff
    const { data: staffList } = await supabaseAdmin
      .from('staff')
      .select('id, full_name, active')
      .eq('organization_id', orgId)
      .eq('active', true)

    // Fetch all clients
    const { data: allClients } = await supabaseAdmin
      .from('clients')
      .select('id, full_name, email, phone, last_visit_at')
      .eq('organization_id', orgId)

    // Fetch upcoming bookings (7 days) — FIXED: start_at/end_at, not start_time/end_time
    const weekFromNow = new Date(now)
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    const weekEnd = weekFromNow.toISOString().split('T')[0]

    const { data: upcomingBookings } = await supabaseAdmin
      .from('bookings')
      .select('start_at, end_at, staff_id')
      .eq('organization_id', orgId)
      .gte('start_at', today)
      .lte('start_at', weekEnd)
      .in('status', ['confirmed', 'pending'])
    console.log('[AI Debug] staff:', staffList?.length, 'clients:', allClients?.length, 'bookings:', upcomingBookings?.length)

    // === 1. VOLNÉ TERMÍNY (příštích 7 dní) ===
    if (org && staffList && staffList.length > 0) {
      const workDays = (org.work_days as any[]) || []

      // Fetch staff working hours for realistic capacity
      const { data: staffWH } = await supabaseAdmin
        .from('staff_working_hours')
        .select('staff_id, weekday, start_time, end_time')
        .in('staff_id', staffList.map(s => s.id))

      const slotDuration = org?.slot_duration || 30

      const emptyDays: { date: string; dayLabel: string; freeHours: string }[] = []

      for (let d = 0; d < 7; d++) {
        const checkDate = new Date()
        checkDate.setDate(checkDate.getDate() + d)
        const dateStr = checkDate.toISOString().split('T')[0]
        const jsDayOfWeek = checkDate.getDay() // 0=Sun, 1=Mon, ...
        const isoWeekday = jsToIsoWeekday(jsDayOfWeek) // 1=Mon, ..., 7=Sun

        // work_days uses 0-based (0=Mon, 6=Sun), convert from ISO
        const workDay = workDays.find((wd: any) => wd.day === isoWeekday - 1)
        if (workDay && !workDay.enabled) continue
        if (!workDay) continue // unknown day = skip

        // staff_working_hours.weekday uses ISO 8601 (1=Mon, 7=Sun)

        const dayStaffHours = (staffWH || []).filter((wh: any) => wh.weekday === isoWeekday)

        let totalAvailableMinutes = 0
        if (dayStaffHours.length > 0) {
          for (const wh of dayStaffHours) {
            const [sh, sm] = wh.start_time.split(':').map(Number)
            const [eh, em] = wh.end_time.split(':').map(Number)
            let staffMinutes = (eh * 60 + em) - (sh * 60 + sm)
            // Subtract org-level break
            const breakMins = org?.break_duration || 0
            if (breakMins > 0) {
              staffMinutes = Math.max(0, staffMinutes - breakMins)
            }
            totalAvailableMinutes += staffMinutes
          }
        } else {
          // No staff_working_hours set — fallback: use work_days start/end
          if (workDay && workDay.start && workDay.end) {
            const [ws, wsm] = workDay.start.split(':').map(Number)
            const [we, wem] = workDay.end.split(':').map(Number)
            totalAvailableMinutes = ((we * 60 + wem) - (ws * 60 + wsm)) * staffList.length
          } else {
            totalAvailableMinutes = 450 // 7.5h default
          }
        }

        // FIXED: bookings use start_at/end_at
        const dayBookings = (upcomingBookings || []).filter((b: any) =>
          b.start_at?.startsWith(dateStr)
        )

        let bookedMinutes = 0
        for (const b of dayBookings) {
          if (b.start_at && b.end_at) {
            const start = new Date(b.start_at).getTime()
            const end = new Date(b.end_at).getTime()
            bookedMinutes += (end - start) / 60000
          } else {
            bookedMinutes += slotDuration
          }
        }

        const freeMinutes = Math.max(0, totalAvailableMinutes - bookedMinutes)

        if (totalAvailableMinutes > 0 && freeMinutes >= totalAvailableMinutes * 0.7) {
          const dayNames = ['ned\u011ble', 'pond\u011bl\u00ed', '\u00fater\u00fd', 'st\u0159eda', '\u010dtvrtek', 'p\u00e1tek', 'sobota']
          const dd = dateStr.split('-').reverse().join('.')
          // FIXED: show decimal hours (7,5h not 8h)
          const freeH = (freeMinutes / 60)
          const freeFormatted = freeH % 1 === 0 ? `${freeH}` : freeH.toFixed(1).replace('.', ',')
          emptyDays.push({
            date: dateStr,
            dayLabel: dayNames[jsDayOfWeek].charAt(0).toUpperCase() + dayNames[jsDayOfWeek].slice(1) + ' ' + dd,
            freeHours: freeFormatted,
          })
        }
      }

      if (emptyDays.length > 0) {
        insights.push({
          id: 'empty_slots_week',
          type: 'empty_slots',
          priority: emptyDays.length >= 3 ? 'high' : 'medium',
          icon: 'calendar',
          title: emptyDays.length + ' ' + (emptyDays.length === 1 ? 'den' : emptyDays.length < 5 ? 'dny' : 'dn\u00ed') + ' s voln\u00fdmi term\u00edny',
          description: emptyDays.map(d => d.dayLabel + ' \u2014 ' + d.freeHours + 'h voln\u00fdch').join('|'),
          action: '/calendar',
          actionLabel: 'Zobrazit kalend\u00e1\u0159',
          data: { emptyDays, slotDuration },
        })
      }
    }

    // === 2. REAKTIVACE KLIENTŮ (30+ dní neaktivní) ===
    if (allClients && allClients.length > 0) {
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const inactive = allClients.filter(c => {
        if (!c.last_visit_at) return true
        return new Date(c.last_visit_at) < thirtyDaysAgo
      })

      if (inactive.length > 0) {
        const topInactive = inactive.slice(0, 5).map(c => c.full_name).join(', ')
        insights.push({
          id: 'reactivation',
          type: 'reactivation',
          priority: inactive.length >= 5 ? 'high' : 'medium',
          icon: 'users',
          title: `${inactive.length} ${inactive.length === 1 ? 'klient' : inactive.length < 5 ? 'klienti' : 'klient\u016f'} se dlouho neobjednal/a`,
          description: `${topInactive}${inactive.length > 5 ? ` a dal\u0161\u00edch ${inactive.length - 5}` : ''} \u2014 posledn\u00ed n\u00e1v\u0161t\u011bva p\u0159ed 30+ dny.`,
          action: '/clients',
          actionLabel: 'Zobrazit klienty',
          data: { count: inactive.length, clients: inactive.slice(0, 10).map(c => ({ id: c.id, name: c.full_name })) },
        })
      }
    }

    // === 3. TREND TRŽEB (tento vs minulý týden) — FIXED: start_at ===
    const { data: thisWeekBookings } = await supabaseAdmin
      .from('bookings')
      .select('price')
      .eq('organization_id', orgId)
      .gte('start_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .lte('start_at', now.toISOString())
      .eq('status', 'completed')

    const lastWeekStart = new Date(now)
    lastWeekStart.setDate(lastWeekStart.getDate() - 14)
    const lastWeekEnd = new Date(now)
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7)

    const { data: lastWeekBookings } = await supabaseAdmin
      .from('bookings')
      .select('price')
      .eq('organization_id', orgId)
      .gte('start_at', lastWeekStart.toISOString())
      .lte('start_at', lastWeekEnd.toISOString())
      .eq('status', 'completed')

    const thisWeekRevenue = (thisWeekBookings || []).reduce((sum, b) => sum + (b.price || 0), 0)
    const lastWeekRevenue = (lastWeekBookings || []).reduce((sum, b) => sum + (b.price || 0), 0)

    if (lastWeekRevenue > 0) {
      const change = ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100
      insights.push({
        id: 'revenue_trend',
        type: 'revenue_trend',
        priority: change < -20 ? 'high' : 'low',
        icon: change >= 0 ? 'trending-up' : 'trending-down',
        title: `Tr\u017eby ${change >= 0 ? '+' : ''}${Math.round(change)}% oproti minul\u00e9mu t\u00fddnu`,
        description: `Tento t\u00fdden: ${thisWeekRevenue.toLocaleString('cs')} K\u010d vs minul\u00fd: ${lastWeekRevenue.toLocaleString('cs')} K\u010d.`,
        action: '/reports',
        actionLabel: 'Zobrazit reporty',
        data: { thisWeek: thisWeekRevenue, lastWeek: lastWeekRevenue, change: Math.round(change) },
      })
    } else if (thisWeekRevenue > 0) {
      insights.push({
        id: 'revenue_trend',
        type: 'revenue_trend',
        priority: 'low',
        icon: 'trending-up',
        title: `Tr\u017eby tento t\u00fdden: ${thisWeekRevenue.toLocaleString('cs')} K\u010d`,
        description: 'Minul\u00fd t\u00fdden nem\u00e1me data pro srovn\u00e1n\u00ed.',
        data: { thisWeek: thisWeekRevenue, lastWeek: 0 },
      })
    }

    // === 4. NEJLEPŠÍ SLUŽBA (30 dní) — FIXED: start_at ===
    const { data: recentBookings } = await supabaseAdmin
      .from('bookings')
      .select('service_id, start_at, price, services(name)')
      .eq('organization_id', orgId)
      .gte('start_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .in('status', ['confirmed', 'completed'])

    if (recentBookings && recentBookings.length >= 3) {
      const serviceStats: Record<string, { name: string; count: number; revenue: number }> = {}
      for (const b of recentBookings) {
        const sid = b.service_id || 'unknown'
        const sname = (b.services as any)?.name || 'Nezn\u00e1m\u00e1'
        if (!serviceStats[sid]) serviceStats[sid] = { name: sname, count: 0, revenue: 0 }
        serviceStats[sid].count++
        serviceStats[sid].revenue += b.price || 0
      }

      const sorted = Object.values(serviceStats).sort((a, b) => b.revenue - a.revenue)
      if (sorted.length > 0) {
        const top = sorted[0]
        insights.push({
          id: 'top_service',
          type: 'top_service',
          priority: 'low',
          icon: 'star',
          title: `Nej\u017e\u00e1dan\u011bj\u0161\u00ed slu\u017eba: ${top.name}`,
          description: `${top.count}x za posledn\u00edch 30 dn\u00ed, tr\u017eby ${top.revenue.toLocaleString('cs')} K\u010d.`,
          action: '/services',
          actionLabel: 'Zobrazit slu\u017eby',
          data: { serviceName: top.name, count: top.count, revenue: top.revenue },
        })
      }

      // === 5. NEJSLABŠÍ DEN — FIXED: start_at + ISO weekday ===
      const dayStats: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
      for (const b of recentBookings) {
        if (b.start_at) {
          const day = new Date(b.start_at).getDay()
          dayStats[day]++
        }
      }
      const dayNames = ['ned\u011ble', 'pond\u011bl\u00ed', '\u00fater\u00fd', 'st\u0159eda', '\u010dtvrtek', 'p\u00e1tek', 'sobota']
      const workDayEntries = Object.entries(dayStats).filter(([d]) => {
        const isoDay = jsToIsoWeekday(Number(d))
        const wd = ((org?.work_days as any[]) || []).find((w: any) => w.day === isoDay - 1)
        return wd && wd.enabled
      })

      if (workDayEntries.length > 0) {
        const weakest = workDayEntries.sort((a, b) => Number(a[1]) - Number(b[1]))[0]
        insights.push({
          id: 'weak_day',
          type: 'weak_day',
          priority: 'medium',
          icon: 'lightbulb',
          title: `Nejslab\u0161\u00ed den: ${dayNames[Number(weakest[0])]}`,
          description: `Pouze ${weakest[1]} rezervac\u00ed za posledn\u00edch 30 dn\u00ed. Zva\u017ete promo akci nebo slevu.`,
          data: { day: Number(weakest[0]), dayName: dayNames[Number(weakest[0])], bookings: Number(weakest[1]) },
        })
      }
    }

    // === 6. NO-SHOW RIZIKO — FIXED: start_at ===
    const { data: noShows } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('organization_id', orgId)
      .eq('status', 'no_show')
      .gte('start_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const { data: totalRecent } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('organization_id', orgId)
      .gte('start_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (totalRecent && totalRecent.length > 0 && noShows) {
      const noShowRate = (noShows.length / totalRecent.length) * 100
      if (noShowRate > 10) {
        insights.push({
          id: 'no_show_risk',
          type: 'no_show_risk',
          priority: 'high',
          icon: 'alert',
          title: `No-show m\u00edra: ${Math.round(noShowRate)}%`,
          description: `${noShows.length} z ${totalRecent.length} rezervac\u00ed za 30 dn\u00ed. Zva\u017ete z\u00e1lohy nebo SMS p\u0159ipom\u00ednky.`,
          data: { rate: Math.round(noShowRate), noShows: noShows.length, total: totalRecent.length },
        })
      }
    }

    // === SORT: high → medium → low ===
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    return NextResponse.json({ insights, generatedAt: now.toISOString() })

  } catch (error) {
    console.error('[AI Insights] Error:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
