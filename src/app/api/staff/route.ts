export const dynamic = 'force-dynamic'

// PATH: src/app/api/staff/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'
import { staffCreateSchema, validateBody } from '@/lib/validations'
import { z } from 'zod'

const staffPostSchema = staffCreateSchema.extend({
  service_ids: z.array(z.string().uuid('Neplatné ID sluĹľby')).optional().default([]),
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

    const validation = validateBody(staffPostSchema, body)
    if (!validation.success) {
      console.warn('[Staff POST] Zod validation failed:', validation.error, 'Body:', JSON.stringify(body).slice(0, 500))
      return NextResponse.json({ error: validation.error || 'Neplatná data' }, { status: 400 })
    }

    const validData = validation.data as any
    const service_ids = validData.service_ids || []

    // Kontrola limitu zaměstnancĹŻ dle mĂłdu
    // Majitel se nepočítá â€” solo = 0 staff, team = 4 staff + majitel, pro = 24 staff + majitel
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
        solo: 0,          // jen majitel, Ĺľádní zaměstnanci
        solo_inspire: 0,  // jen majitel, Ĺľádní zaměstnanci
        team: 4,          // majitel + 4 zaměstnanci = 5 lidí
        pro_inspire: 24,  // majitel + 24 zaměstnancĹŻ = 25 lidí
      }

      const maxStaff = limits[org.mode] ?? 4
      if ((count || 0) >= maxStaff) {
        const planName = org.mode === 'solo' || org.mode === 'solo_inspire' ? 'Solo' : org.mode === 'team' ? 'Firma' : 'Pro Inspire'
        return NextResponse.json({
          error: maxStaff === 0
            ? `Plán ${planName} je pro jednu osobu â€” nepodporuje zaměstnance. Upgradujte na Firma nebo Pro Inspire.`
            : `Dosáhli jste limitu ${maxStaff} zaměstnancĹŻ pro plán ${planName}. Upgradujte pro více.`,
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
          error: `Zaměstnanec s tímto emailem jiĹľ existuje: ${existing.full_name}`,
        }, { status: 409 })
      }
    }

    // VloĹľení zaměstnance â€” jen povolená pole (BEZ role!)
    const insertData: any = {
      organization_id: auth.organizationId,
      full_name: validData.full_name,
      active: validData.active !== undefined ? validData.active : true,
    }
    if (validData.email) insertData.email = validData.email
    if (validData.phone) insertData.phone = validData.phone
    if (validData.color) insertData.color = validData.color
    if (validData.position) insertData.position = validData.position

    const { data: staff, error: staffError } = await supabaseAdmin
      .from('staff')
      .insert(insertData)
      .select()
      .single()

    if (staffError) return NextResponse.json({ error: staffError.message }, { status: 500 })

    // Přiřazení sluĹľeb
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
