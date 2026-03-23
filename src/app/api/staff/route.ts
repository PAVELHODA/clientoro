// PATH: src/app/api/staff/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'
import { staffCreateSchema, validateBody } from '@/lib/validations'
import { z } from 'zod'

// Schema pro POST body včetně service_ids
const staffPostSchema = staffCreateSchema.extend({
  service_ids: z.array(z.string().uuid('Neplatné ID služby')).optional().default([]),
}).passthrough()

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data, error } = await supabaseAdmin
      .from('staff')
      .select(`*, staff_services (service_id)`)
      .eq('organization_id', auth.organizationId)
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
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()

    // Zod validace
    const validation = validateBody(staffPostSchema, body)
    if (!validation.success) {
      console.warn('[Staff POST] Zod validation failed:', validation.error, 'Body:', JSON.stringify(body).slice(0, 500))
      return NextResponse.json({ error: validation.error || 'Neplatná data' }, { status: 400 })
    }

    const validData = validation.data as any
    const service_ids = validData.service_ids || []

    // Kontrola limitu zaměstnanců dle módu
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('mode')
      .eq('id', auth.organizationId)
      .single()

    if (org) {
      const { count } = await supabaseAdmin
        .from('staff')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.organizationId)
        .eq('active', true)

      const limits: Record<string, number> = {
        solo: 1,
        solo_inspire: 1,
        team: 5,
        pro_inspire: 25,
      }

      const maxStaff = limits[org.mode] || 5
      if ((count || 0) >= maxStaff) {
        return NextResponse.json({
          error: `Dosáhli jste limitu zaměstnanců pro váš plán (${maxStaff}). Upgradujte pro více.`,
        }, { status: 403 })
      }
    }

    // Kontrola duplicity emailu ve stejné organizaci
    if (validData.email) {
      const { data: existing } = await supabaseAdmin
        .from('staff')
        .select('id, full_name')
        .eq('organization_id', auth.organizationId)
        .eq('email', validData.email)
        .single()

      if (existing) {
        return NextResponse.json({
          error: `Zaměstnanec s tímto emailem již existuje: ${existing.full_name}`,
        }, { status: 409 })
      }
    }

    // Vložení zaměstnance — jen povolená pole
    const insertData: any = {
      organization_id: auth.organizationId,
      full_name: validData.full_name,
      active: validData.active !== undefined ? validData.active : true,
    }
    if (validData.email) insertData.email = validData.email
    if (validData.phone) insertData.phone = validData.phone
    if (validData.role) insertData.role = validData.role
    if (validData.color) insertData.color = validData.color
    if (validData.position) insertData.position = validData.position

    const { data: staff, error: staffError } = await supabaseAdmin
      .from('staff')
      .insert(insertData)
      .select()
      .single()

    if (staffError) return NextResponse.json({ error: staffError.message }, { status: 500 })

    // Přiřazení služeb
    if (service_ids && service_ids.length > 0) {
      const staffServices = service_ids.map((serviceId: string) => ({
        staff_id: staff.id,
        service_id: serviceId,
      }))

      const { error: ssError } = await supabaseAdmin
        .from('staff_services')
        .insert(staffServices)

      if (ssError) console.error('Error assigning services:', ssError)
    }

    return NextResponse.json(staff, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
