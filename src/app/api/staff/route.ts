import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { getOrgId } from '@/lib/api/getOrgId'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const orgId = await getOrgId(request)
    if (!orgId) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

    const { data, error } = await supabaseAdmin
      .from('staff')
      .select(`*, staff_services (service_id)`)
      .eq('organization_id', orgId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = await getOrgId(request)
    if (!orgId) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

    const body = await request.json()
    const { service_ids, ...staffData } = body

    const { data: staff, error: staffError } = await supabaseAdmin
      .from('staff')
      .insert({ ...staffData, organization_id: orgId })
      .select()
      .single()

    if (staffError) return NextResponse.json({ error: staffError.message }, { status: 500 })

    if (service_ids && service_ids.length > 0) {
      const staffServices = service_ids.map((serviceId: string) => ({
        staff_id: staff.id,
        service_id: serviceId,
      }))

      const { error: ssError } = await supabaseAdmin
        .from('staff_services')
        .insert(staffServices)

      if (ssError) console.error('Chyba při přiřazení služeb:', ssError)
    }

    return NextResponse.json(staff, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
