// PATH: src/app/api/settings/delete-account/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const userId = auth.userId
    const orgId = auth.organizationId

    // 1. Smazat waitlist
    await supabaseAdmin
      .from('waitlist')
      .delete()
      .eq('organization_id', orgId)

    // 2. Smazat notifikace
    await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('organization_id', orgId)

    // 3. Smazat rezervace
    await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('organization_id', orgId)

    // 4. Smazat klienty
    await supabaseAdmin
      .from('clients')
      .delete()
      .eq('organization_id', orgId)

    // 5. Smazat staff data (working hours, time off, staff_services)
    const { data: staffData } = await supabaseAdmin
      .from('staff')
      .select('id')
      .eq('organization_id', orgId)

    if (staffData && staffData.length > 0) {
      const staffIds = staffData.map(s => s.id)

      await supabaseAdmin
        .from('staff_working_hours')
        .delete()
        .in('staff_id', staffIds)

      await supabaseAdmin
        .from('staff_time_off')
        .delete()
        .in('staff_id', staffIds)
    }

    // 6. Smazat staff
    await supabaseAdmin
      .from('staff')
      .delete()
      .eq('organization_id', orgId)

    // 7. Smazat služby
    await supabaseAdmin
      .from('services')
      .delete()
      .eq('organization_id', orgId)

    // 8. Smazat memberships
    await supabaseAdmin
      .from('memberships')
      .delete()
      .eq('organization_id', orgId)

    // 9. Smazat organizaci
    await supabaseAdmin
      .from('organizations')
      .delete()
      .eq('id', orgId)

    // 10. Smazat profil
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('auth_user_id', userId)

    // 11. Smazat auth uživatele
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId!)
    if (authDeleteError) {
      console.error('Auth delete error:', authDeleteError)
      return NextResponse.json(
        { error: 'Data smazána, ale auth účet se nepodařilo odstranit: ' + authDeleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Účet a všechna data byla trvale smazána' })
  } catch (err) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: 'Chyba při mazání účtu' }, { status: 500 })
  }
}
