// PATH: src/app/api/auth/switch-org/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { organizationId } = await request.json()
    if (!organizationId) return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 })

    // Superadmin může přepnout na cokoliv
    if (auth.role === 'superadmin') {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('id, name, mode, slug')
        .eq('id', organizationId)
        .single()

      if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
      return NextResponse.json({ ok: true, organization: org })
    }

    // Ostatní — ověř membership
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('auth_user_id', auth.userId)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('organization_id, role, organizations(id, name, mode, slug)')
      .eq('user_id', profile.id)
      .eq('organization_id', organizationId)
      .single()

    if (!membership) return NextResponse.json({ error: 'No access to this organization' }, { status: 403 })

    return NextResponse.json({ ok: true, organization: membership.organizations })
  } catch (err) {
    console.error('[auth/switch-org]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
