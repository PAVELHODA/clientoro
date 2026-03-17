import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function DELETE(request: NextRequest) {
  try {
    const { orgId } = await request.json()
    if (!orgId) return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return request.cookies.get(name)?.value }, set() {}, remove() {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('is_superadmin').eq('auth_user_id', user.id).single()
    if (!profile?.is_superadmin) return NextResponse.json({ error: 'Not superadmin' }, { status: 403 })

    const { data: org } = await supabaseAdmin.from('organizations').select('name, email, owner_user_id').eq('id', orgId).single()

    await supabaseAdmin.from('bookings').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('services').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('staff').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('notifications').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('clients').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('waitlist').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('memberships').delete().eq('organization_id', orgId)
    const { error } = await supabaseAdmin.from('organizations').delete().eq('id', orgId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, orgName: org?.name })
  } catch (err) {
    console.error('Admin delete org error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}