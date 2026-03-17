// PATH: src/app/api/settings/delete-org/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { getOrgId } from '@/lib/api/getOrgId'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const orgId = await getOrgId(request)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Smazat v poradi: bookings, services, staff, notifications, memberships, org
    await supabaseAdmin.from('bookings').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('services').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('staff').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('notifications').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('clients').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('waitlist').delete().eq('organization_id', orgId)
    await supabaseAdmin.from('memberships').delete().eq('organization_id', orgId)

    // Smazat organizaci
    const { error } = await supabaseAdmin.from('organizations').delete().eq('id', orgId)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete org error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}