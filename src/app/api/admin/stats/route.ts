import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return request.cookies.get(name)?.value }, set() {}, remove() {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_superadmin')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile?.is_superadmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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
