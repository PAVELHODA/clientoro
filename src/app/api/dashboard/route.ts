export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const orgId = auth.organizationId

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const prevMonthEnd = monthStart

    const { data: todayBookings } = await supabaseAdmin
      .from('bookings')
      .select('id, start_at, end_at, status, price, service_id, staff_id, customer_name, client_id, services(name, color, duration), staff(full_name)')
      .eq('organization_id', orgId)
      .gte('start_at', todayStart)
      .lt('start_at', todayEnd)
      .neq('status', 'cancelled')
      .order('start_at')

    const todayRevenue = (todayBookings || [])
      .filter(b => b.status !== 'no_show')
      .reduce((sum, b) => sum + (b.price || 0), 0)

    const todayNoShow = (todayBookings || []).filter(b => b.status === 'no_show').length

    const { data: weekBookings } = await supabaseAdmin
      .from('bookings')
      .select('id, start_at, status, price, service_id, staff_id')
      .eq('organization_id', orgId)
      .gte('start_at', weekStart.toISOString())
      .lt('start_at', weekEnd.toISOString())
      .neq('status', 'cancelled')

    const weekRevenue = (weekBookings || [])
      .filter(b => b.status !== 'no_show')
      .reduce((sum, b) => sum + (b.price || 0), 0)

    const { data: monthBookings } = await supabaseAdmin
      .from('bookings')
      .select('id, start_at, status, price, service_id, staff_id')
      .eq('organization_id', orgId)
      .gte('start_at', monthStart)
      .lt('start_at', monthEnd)
      .neq('status', 'cancelled')

    const monthRevenue = (monthBookings || [])
      .filter(b => b.status !== 'no_show')
      .reduce((sum, b) => sum + (b.price || 0), 0)

    const monthNoShow = (monthBookings || []).filter(b => b.status === 'no_show').length

    const { data: prevMonthBookings } = await supabaseAdmin
      .from('bookings')
      .select('id, price, status')
      .eq('organization_id', orgId)
      .gte('start_at', prevMonthStart)
      .lt('start_at', prevMonthEnd)
      .neq('status', 'cancelled')

    const prevMonthRevenue = (prevMonthBookings || [])
      .filter(b => b.status !== 'no_show')
      .reduce((sum, b) => sum + (b.price || 0), 0)

    const { count: newClientsMonth } = await supabaseAdmin
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('created_at', monthStart)
      .lt('created_at', monthEnd)

    const { count: totalClients } = await supabaseAdmin
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)

    const { count: totalStaff } = await supabaseAdmin
      .from('staff')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('active', true)

    const serviceCount: Record<string, { name: string; color: string; count: number; revenue: number }> = {}
    for (const b of (monthBookings || [])) {
      const sid = b.service_id
      if (!serviceCount[sid]) serviceCount[sid] = { name: '', color: '', count: 0, revenue: 0 }
      serviceCount[sid].count++
      serviceCount[sid].revenue += b.price || 0
    }

    const { data: allServices } = await supabaseAdmin
      .from('services')
      .select('id, name, color')
      .eq('organization_id', orgId)

    for (const svc of (allServices || [])) {
      if (serviceCount[svc.id]) {
        serviceCount[svc.id].name = svc.name
        serviceCount[svc.id].color = svc.color
      }
    }

    const topServices = Object.values(serviceCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const weekDays = ['Po', 'Ut', 'St', 'Ct', 'Pa', 'So', 'Ne']
    const dailyBookings = weekDays.map((day, i) => {
      const dayDate = new Date(weekStart)
      dayDate.setDate(weekStart.getDate() + i)
      const dayStr = dayDate.toISOString().split('T')[0]
      const count = (weekBookings || []).filter(b => b.start_at.startsWith(dayStr)).length
      const rev = (weekBookings || [])
        .filter(b => b.start_at.startsWith(dayStr) && b.status !== 'no_show')
        .reduce((s, b) => s + (b.price || 0), 0)
      return { day, count, revenue: rev }
    })

    const revenueChange = prevMonthRevenue > 0
      ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : 0

    return NextResponse.json({
      today: {
        bookings: (todayBookings || []).length,
        revenue: todayRevenue,
        noShow: todayNoShow,
        upcoming: todayBookings || [],
      },
      week: {
        bookings: (weekBookings || []).length,
        revenue: weekRevenue,
        daily: dailyBookings,
      },
      month: {
        bookings: (monthBookings || []).length,
        revenue: monthRevenue,
        noShow: monthNoShow,
        revenueChange,
        newClients: newClientsMonth || 0,
      },
      totals: {
        clients: totalClients || 0,
        staff: totalStaff || 0,
      },
      topServices,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
