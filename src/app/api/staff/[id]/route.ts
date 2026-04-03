export const dynamic = 'force-dynamic'

// PATH: src/app/api/staff/[id]/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_STAFF_FIELDS = [
  'full_name', 'email', 'phone', 'color', 'position', 'active', 'sort_order',
]

function sanitizeUpdate(body: any, allowedFields: string[]) {
  const clean: any = {}
  for (const key of allowedFields) {
    if (body[key] !== undefined) clean[key] = body[key]
  }
  return clean
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    if (!params.id || !/^[0-9a-f-]{36}$/.test(params.id)) {
      return NextResponse.json({ error: 'NeplatnĂ© ID' }, { status: 400 })
    }

    const body = await request.json()
    const { service_ids, ...rest } = body
    const updateData = sanitizeUpdate(rest, ALLOWED_STAFF_FIELDS)

    if (Object.keys(updateData).length === 0 && service_ids === undefined) {
      return NextResponse.json({ error: 'Ĺ˝ĂˇdnĂˇ data k aktualizaci' }, { status: 400 })
    }

    let staffData = null

    if (Object.keys(updateData).length > 0) {
      const { data, error } = await supabaseAdmin
        .from('staff')
        .update(updateData)
        .eq('id', params.id)
        .eq('organization_id', auth.organizationId)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      if (!data) return NextResponse.json({ error: 'ZamÄ›stnanec nenalezen' }, { status: 404 })
      staffData = data
    }

    if (service_ids !== undefined) {
      // OvÄ›Ĺ™ Ĺľe staff patĹ™Ă­ do organizace
      if (!staffData) {
        const { data: check } = await supabaseAdmin
          .from('staff')
          .select('id')
          .eq('id', params.id)
          .eq('organization_id', auth.organizationId)
          .single()
        if (!check) return NextResponse.json({ error: 'ZamÄ›stnanec nenalezen' }, { status: 404 })
      }

      await supabaseAdmin
        .from('staff_services')
        .delete()
        .eq('staff_id', params.id)

      if (Array.isArray(service_ids) && service_ids.length > 0) {
        const staffServices = service_ids
          .filter((id: any) => typeof id === 'string' && /^[0-9a-f-]{36}$/.test(id))
          .map((serviceId: string) => ({
            staff_id: params.id,
            service_id: serviceId,
          }))

        if (staffServices.length > 0) {
          await supabaseAdmin
            .from('staff_services')
            .insert(staffServices)
        }
      }
    }

    return NextResponse.json(staffData || { success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    if (!params.id || !/^[0-9a-f-]{36}$/.test(params.id)) {
      return NextResponse.json({ error: 'NeplatnĂ© ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('staff')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', auth.organizationId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
