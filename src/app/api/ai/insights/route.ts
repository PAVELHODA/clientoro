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

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authorized || !auth.organizationId) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
  }

  const orgId = auth.organizationId
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const insights: Insight[] = []

  try {
    // === 1. VOLNÉ TERMÍNY (příštích 7 dní) ===
    const weekFromNow = new Date(now)
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    const weekEnd = weekFromNow.toISOString().split('T')[0]

    const { data: upcomingBookings } = await supabaseAdmin
      .from('bookings')
      .select('start_time, end_time, staff_id')
      .eq('organization_id', orgId)
      .gte('start_time', today)
      .lte('start_time', weekEnd)
      .in('status', ['confirmed', 'pending'])

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('work_start, work_end, work_days')
      .eq('id', orgId)
      .single()

    const { data: staffList } = await supabaseAdmin
      .from('staff')
      .select('id, name')
      .eq('organization_id', orgId)
      .eq('active', true)

    if (org && staffList && staffList.length > 0) {
      const workStart = org.work_start || 8
      const workEnd = org.work_end || 18
      const workDays = (org.work_days as any[]) || []
      const totalSlots = (workEnd - workStart)
      const emptyDays: { date: string; dayName: string; freeHours: number }[] = []

      for (let d = 0; d < 7; d++) {
        const checkDate = new Date(now)
        checkDate.setDate(checkDate.getDate() + d)
        const dateStr = checkDate.toISOString().split('T')[0]
        const dayOfWeek = checkDate.getDay()

        const workDay = workDays.find((wd: any) => wd.day === dayOfWeek)
        if (workDay && !workDay.enabled) continue

        const dayBookings = (upcomingBookings || []).filter(b =>
          b.start_time?.startsWith(dateStr)
        )

        const bookedHours = dayBookings.length
        const freeHours = Math.max(0, totalSlots - bookedHours)

        if (freeHours >= totalSlots * 0.7) {
          const dayNames = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota']
          emptyDays.push({ date: dateStr, dayName: dayNames[dayOfWeek], freeHours })
        }
      }

      if (emptyDays.length > 0) {
        const worst = emptyDays[0]
        insights.push({
          id: 'empty_slots_week',
          type: 'empty_slots',
          priority: emptyDays.length >= 3 ? 'high' : 'medium',
          icon: '📅',
          title: `${emptyDays.length} ${emptyDays.length === 1 ? 'den' : emptyDays.length < 5 ? 'dny' : 'dní'} s volnými termíny`,
          description: `${worst.dayName.charAt(0).toUpperCase() + worst.dayName.slice(1)} (${worst.date.split('-').reverse().join('.')}) má ${worst.freeHours}h volných z ${totalSlots}h.`,
          action: '/calendar',
          actionLabel: 'Zobrazit kalendář',
          data: { emptyDays },
        })
      }
    }

    // === 2. REAKTIVACE KLIENTŮ (30+ dní neaktivní) ===
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysStr = thirtyDaysAgo.toISOString()

    const { data: allClients } = await supabaseAdmin
      .from('clients')
      .select('id, name, email, phone, last_visit')
      .eq('organization_id', orgId)

    if (allClients) {
      const inactive = allClients.filter(c => {
        if (!c.last_visit) return true
        return new Date(c.last_visit) < thirtyDaysAgo
      })

      if (inactive.length > 0) {
        const topInactive = inactive.slice(0, 5).map(c => c.name).join(', ')
        insights.push({
          id: 'reactivation',
          type: 'reactivation',
          priority: inactive.length >= 5 ? 'high' : 'medium',
          icon: '😴',
          title: `${inactive.length} ${inactive.length === 1 ? 'klient' : inactive.length < 5 ? 'klienti' : 'klientů'} se dlouho neobjednal/a`,
          description: `${topInactive}${inactive.length > 5 ? ` a dalších ${inactive.length - 5}` : ''} — poslední návštěva před 30+ dny.`,
          action: '/clients',
          actionLabel: 'Zobrazit klienty',
          data: { count: inactive.length, clients: inactive.slice(0, 10).map(c => ({ id: c.id, name: c.name })) },
        })
      }
    }

    // === 3. TREND TRŽEB (tento vs minulý týden) ===
    const lastWeekStart = new Date(now)
    lastWeekStart.setDate(lastWeekStart.getDate() - 14)
    const lastWeekEnd = new Date(now)
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7)

    const { data: thisWeekBookings } = await supabaseAdmin
      .from('bookings')
      .select('price')
      .eq('organization_id', orgId)
      .gte('start_time', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .lte('start_time', now.toISOString())
      .eq('status', 'completed')

    const { data: lastWeekBookings } = await supabaseAdmin
      .from('bookings')
      .select('price')
      .eq('organization_id', orgId)
      .gte('start_time', lastWeekStart.toISOString())
      .lte('start_time', lastWeekEnd.toISOString())
      .eq('status', 'completed')

    const thisWeekRevenue = (thisWeekBookings || []).reduce((sum, b) => sum + (b.price || 0), 0)
    const lastWeekRevenue = (lastWeekBookings || []).reduce((sum, b) => sum + (b.price || 0), 0)

    if (lastWeekRevenue > 0) {
      const change = ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100
      insights.push({
        id: 'revenue_trend',
        type: 'revenue_trend',
        priority: change < -20 ? 'high' : 'low',
        icon: change >= 0 ? '📈' : '📉',
        title: `Tržby ${change >= 0 ? '+' : ''}${Math.round(change)}% oproti minulému týdnu`,
        description: `Tento týden: ${thisWeekRevenue.toLocaleString('cs')} Kč vs minulý: ${lastWeekRevenue.toLocaleString('cs')} Kč.`,
        action: '/stats',
        actionLabel: 'Zobrazit statistiky',
        data: { thisWeek: thisWeekRevenue, lastWeek: lastWeekRevenue, change: Math.round(change) },
      })
    } else if (thisWeekRevenue > 0) {
      insights.push({
        id: 'revenue_trend',
        type: 'revenue_trend',
        priority: 'low',
        icon: '📈',
        title: `Tržby tento týden: ${thisWeekRevenue.toLocaleString('cs')} Kč`,
        description: 'Minulý týden nemáme data pro srovnání.',
        data: { thisWeek: thisWeekRevenue, lastWeek: 0 },
      })
    }

    // === 4. NEJLEPŠÍ SLUŽBA ===
    const { data: recentBookings } = await supabaseAdmin
      .from('bookings')
      .select('service_id, services(name), price')
      .eq('organization_id', orgId)
      .gte('start_time', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .in('status', ['confirmed', 'completed'])

    if (recentBookings && recentBookings.length >= 3) {
      const serviceStats: Record<string, { name: string; count: number; revenue: number }> = {}
      for (const b of recentBookings) {
        const sid = b.service_id || 'unknown'
        const sname = (b.services as any)?.name || 'Neznámá'
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
          icon: '⭐',
          title: `Nejžádanější služba: ${top.name}`,
          description: `${top.count}x za posledních 30 dní, tržby ${top.revenue.toLocaleString('cs')} Kč.`,
          action: '/services',
          actionLabel: 'Zobrazit služby',
          data: { serviceName: top.name, count: top.count, revenue: top.revenue },
        })
      }
    }

    // === 5. NEJSLABŠÍ DEN ===
    if (recentBookings && recentBookings.length >= 5) {
      const dayStats: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
      for (const b of recentBookings) {
        if ((b as any).start_time) {
          const day = new Date((b as any).start_time).getDay()
          dayStats[day]++
        }
      }
      const dayNames = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota']
      const workDayEntries = Object.entries(dayStats).filter(([d]) => {
        const wd = ((org?.work_days as any[]) || []).find((w: any) => w.day === Number(d))
        return !wd || wd.enabled
      })

      if (workDayEntries.length > 0) {
        const weakest = workDayEntries.sort((a, b) => a[1] - b[1])[0]
        insights.push({
          id: 'weak_day',
          type: 'weak_day',
          priority: 'medium',
          icon: '💡',
          title: `Nejslabší den: ${dayNames[Number(weakest[0])]}`,
          description: `Pouze ${weakest[1]} rezervací za posledních 30 dní. Zvažte promo akci nebo slevu.`,
          data: { day: Number(weakest[0]), dayName: dayNames[Number(weakest[0])], bookings: weakest[1] },
        })
      }
    }

    // === 6. NO-SHOW RIZIKO ===
    const { data: noShows } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('organization_id', orgId)
      .eq('status', 'no_show')
      .gte('start_time', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const { data: totalRecent } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('organization_id', orgId)
      .gte('start_time', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (totalRecent && totalRecent.length > 0 && noShows) {
      const noShowRate = (noShows.length / totalRecent.length) * 100
      if (noShowRate > 10) {
        insights.push({
          id: 'no_show_risk',
          type: 'no_show_risk',
          priority: 'high',
          icon: '⚠️',
          title: `No-show míra: ${Math.round(noShowRate)}%`,
          description: `${noShows.length} z ${totalRecent.length} rezervací za 30 dní. Zvažte zálohy nebo SMS připomínky.`,
          data: { rate: Math.round(noShowRate), noShows: noShows.length, total: totalRecent.length },
        })
      }
    }

    // === SORT: high → medium → low ===
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return NextResponse.json({ insights, generatedAt: now.toISOString() })

  } catch (error) {
    console.error('[AI Insights] Error:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
