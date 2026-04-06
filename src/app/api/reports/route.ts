export const dynamic = 'force-dynamic'

// PATH: src/app/api/reports/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const orgId = auth.organizationId
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month' // month | quarter | year

    const now = new Date()
    let startDate: Date, endDate: Date, prevStartDate: Date, prevEndDate: Date

    if (period === 'quarter') {
      const q = Math.floor(now.getMonth() / 3)
      startDate = new Date(now.getFullYear(), q * 3, 1)
      endDate = new Date(now.getFullYear(), q * 3 + 3, 1)
      prevStartDate = new Date(now.getFullYear(), q * 3 - 3, 1)
      prevEndDate = startDate
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1)
      endDate = new Date(now.getFullYear() + 1, 0, 1)
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1)
      prevEndDate = startDate
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      prevEndDate = startDate
    }

    const start = startDate.toISOString()
    const end = endDate.toISOString()
    const prevStart = prevStartDate.toISOString()
    const prevEnd = prevEndDate.toISOString()

    // Current period bookings
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('id, start_at, status, price, service_id, staff_id, client_id, customer_name')
      .eq('organization_id', orgId)
      .gte('start_at', start)
      .lt('start_at', end)

    // Previous period bookings
    const { data: prevBookings } = await supabaseAdmin
      .from('bookings')
      .select('id, status, price')
      .eq('organization_id', orgId)
      .gte('start_at', prevStart)
      .lt('start_at', prevEnd)

    const all = bookings || []
    const prev = prevBookings || []

    // --- KPI ---
    const active = all.filter(b => b.status !== 'cancelled')
    const prevActive = prev.filter(b => b.status !== 'cancelled')
    const completed = active.filter(b => b.status !== 'no_show')
    const prevCompleted = prevActive.filter(b => b.status !== 'no_show')

    const totalRevenue = completed.reduce((s, b) => s + (b.price || 0), 0)
    const prevRevenue = prevCompleted.reduce((s, b) => s + (b.price || 0), 0)
    const revenueChange = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 0

    const totalBookings = active.length
    const prevTotalBookings = prevActive.length
    const bookingsChange = prevTotalBookings > 0 ? Math.round(((totalBookings - prevTotalBookings) / prevTotalBookings) * 100) : 0

    const noShowCount = active.filter(b => b.status === 'no_show').length
    const noShowRate = totalBookings > 0 ? Math.round((noShowCount / totalBookings) * 100) : 0
    const cancelledCount = all.filter(b => b.status === 'cancelled').length

    const avgBookingValue = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0

    // --- Unique clients ---
    const clientIds = new Set(active.map(b => b.client_id || b.customer_name).filter(Boolean))
    const uniqueClients = clientIds.size

    // --- New clients this period ---
    const { count: newClients } = await supabaseAdmin
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('created_at', start)
      .lt('created_at', end)

    // --- Revenue by day ---
    const dailyMap: Record<string, { date: string; revenue: number; bookings: number }> = {}
    for (const b of active) {
      const day = b.start_at.split('T')[0]
      if (!dailyMap[day]) dailyMap[day] = { date: day, revenue: 0, bookings: 0 }
      dailyMap[day].bookings++
      if (b.status !== 'no_show') dailyMap[day].revenue += b.price || 0
    }
    const dailyRevenue = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date))

    // --- Top services ---
    const svcMap: Record<string, { id: string; count: number; revenue: number; noShow: number }> = {}
    for (const b of active) {
      const sid = b.service_id
      if (!sid) continue
      if (!svcMap[sid]) svcMap[sid] = { id: sid, count: 0, revenue: 0, noShow: 0 }
      svcMap[sid].count++
      if (b.status === 'no_show') svcMap[sid].noShow++
      else svcMap[sid].revenue += b.price || 0
    }

    const { data: services } = await supabaseAdmin
      .from('services')
      .select('id, name, color, price')
      .eq('organization_id', orgId)

    const svcLookup: Record<string, any> = {}
    for (const s of (services || [])) svcLookup[s.id] = s

    const topServices = Object.values(svcMap)
      .map(s => ({ ...s, name: svcLookup[s.id]?.name || '?', color: svcLookup[s.id]?.color || '#3b82f6' }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // --- Staff performance ---
    const staffMap: Record<string, { id: string; count: number; revenue: number; noShow: number }> = {}
    for (const b of active) {
      const sid = b.staff_id
      if (!sid) continue
      if (!staffMap[sid]) staffMap[sid] = { id: sid, count: 0, revenue: 0, noShow: 0 }
      staffMap[sid].count++
      if (b.status === 'no_show') staffMap[sid].noShow++
      else staffMap[sid].revenue += b.price || 0
    }

    const { data: staffList } = await supabaseAdmin
      .from('staff')
      .select('id, full_name')
      .eq('organization_id', orgId)

    const staffLookup: Record<string, string> = {}
    for (const s of (staffList || [])) staffLookup[s.id] = s.full_name

    const staffPerformance = Object.values(staffMap)
      .map(s => ({ ...s, name: staffLookup[s.id] || '?', avgValue: s.count > 0 ? Math.round(s.revenue / s.count) : 0 }))
      .sort((a, b) => b.revenue - a.revenue)

    // --- Status breakdown ---
    const statusBreakdown = {
      confirmed: all.filter(b => b.status === 'confirmed').length,
      completed: all.filter(b => b.status === 'completed').length,
      no_show: noShowCount,
      cancelled: cancelledCount,
    }

    // --- Busiest hours ---
    const hourMap: Record<number, number> = {}
    for (const b of active) {
      const h = new Date(b.start_at).getHours()
      hourMap[h] = (hourMap[h] || 0) + 1
    }
    const busiestHours = Object.entries(hourMap)
      .map(([h, count]) => ({ hour: parseInt(h), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // --- Busiest days of week ---
    const dowMap: Record<number, number> = {}
    for (const b of active) {
      const dow = new Date(b.start_at).getDay()
      dowMap[dow] = (dowMap[dow] || 0) + 1
    }
    const dowNames = ['Ne', 'Po', 'Ut', 'St', 'Ct', 'Pa', 'So']
    const busiestDays = Object.entries(dowMap)
      .map(([d, count]) => ({ day: dowNames[parseInt(d)], count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      period,
      kpi: {
        totalRevenue, prevRevenue, revenueChange,
        totalBookings, prevTotalBookings, bookingsChange,
        noShowCount, noShowRate, cancelledCount,
        avgBookingValue, uniqueClients,
        newClients: newClients || 0,
      },
      dailyRevenue,
      topServices,
      staffPerformance,
      statusBreakdown,
      busiestHours,
      busiestDays,
    })
  } catch (err) {
    console.error('[reports]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
