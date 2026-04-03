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
      const { count: bookings_count } = await supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }).eq('organization_id', org.id)
      const { count: clients_count } = await supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).eq('organization_id', org.id)
      return { ...org, bookings_count, clients_count }
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
