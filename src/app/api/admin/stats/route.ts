export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'superadmin')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data: organizations } = await supabaseAdmin.from('organizations').select('*').order('created_at')
    const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
    const { count: totalBookings } = await supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true })
    const { count: totalNotifications } = await supabaseAdmin.from('notifications').select('*', { count: 'exact', head: true })

    const orgsWithCounts = await Promise.all((organizations || []).map(async (org: any) => {
      const [bookingsRes, clientsRes, staffRes, servicesRes] = await Promise.all([
        supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
        supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
        supabaseAdmin.from('staff').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
        supabaseAdmin.from('services').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
      ])
      return {
        ...org,
        bookings_count: bookingsRes.count || 0,
        clients_count: clientsRes.count || 0,
        staff_count: staffRes.count || 0,
        services_count: servicesRes.count || 0,
      }
    }))

    return NextResponse.json({
      organizations: orgsWithCounts,
      stats: {
        totalOrgs: organizations?.length || 0,
        totalUsers: totalUsers || 0,
        totalBookings: totalBookings || 0,
        totalNotifications: totalNotifications || 0,
      }
    })
  } catch (err) {
    console.error('[admin-stats]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
