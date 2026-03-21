import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const orgId = auth.organizationId

    await supabaseAdmin.from('bookings').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('services').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('staff').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('notifications').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('clients').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('waitlist').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('memberships').delete().eq('organization_id', orgId)

    const { error } = await supabaseAdmin.from('organizations').delete().eq('id', orgId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete org error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
