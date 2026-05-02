import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerSupabase()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        user: null,
        organization: null,
        availableOrgs: [],
        role: 'staff',
      })
    }

    const { data: memberships } = await supabase
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', user.id)

    let availableOrgs = []
    let organization = null
    let role = 'staff'

    if (memberships && memberships.length > 0) {
      const orgIds = memberships.map((m) => m.organization_id)

      const { data: orgs } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds)

      availableOrgs = orgs || []
      organization = availableOrgs[0] || null
      role = memberships[0].role || 'staff'
    }

    return NextResponse.json({
      user,
      organization,
      availableOrgs,
      role,
    })
  } catch (err) {
    console.error('[/api/auth/init] Error:', err)
    return NextResponse.json({
      user: null,
      organization: null,
      availableOrgs: [],
      role: 'staff',
    })
  }
}
