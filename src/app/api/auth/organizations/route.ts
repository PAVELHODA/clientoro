// PATH: src/app/api/auth/organizations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    // Superadmin vidí VŠECHNY organizace
    if (auth.role === 'superadmin') {
      const { data } = await supabaseAdmin
        .from('organizations')
        .select('id, name, mode, slug, logo_url')
        .order('name')

      return NextResponse.json(data || [])
    }

    // Ostatní vidí jen své (přes memberships)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('auth_user_id', auth.userId)
      .single()

    if (!profile) return NextResponse.json([])

    const { data: memberships } = await supabaseAdmin
      .from('memberships')
      .select('organization_id, role, organizations(id, name, mode, slug, logo_url)')
      .eq('user_id', profile.id)
      .order('created_at')

    const orgs = (memberships || []).map((m: any) => ({
      ...m.organizations,
      membership_role: m.role,
    }))

    return NextResponse.json(orgs)
  } catch (err) {
    console.error('[auth/organizations]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
