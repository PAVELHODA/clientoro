import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { service_ids, ...staffData } = body

    const { data, error } = await supabaseAdmin
      .from('staff')
      .update(staffData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (service_ids !== undefined) {
      await supabaseAdmin
        .from('staff_services')
        .delete()
        .eq('staff_id', params.id)

      if (service_ids.length > 0) {
        const staffServices = service_ids.map((serviceId: string) => ({
          staff_id: params.id,
          service_id: serviceId,
        }))

        await supabaseAdmin
          .from('staff_services')
          .insert(staffServices)
      }
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('staff')
      .delete()
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
