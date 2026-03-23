// PATH: src/app/api/services/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'
import { serviceCreateSchema, validateBody } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
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
    const validation = validateBody(serviceCreateSchema, {
      ...body,
      organization_id: auth.organizationId,
    })
    if (!validation.success || !validation.data) {
      return NextResponse.json({ error: validation.error || 'Neplatná data' }, { status: 400 })
    }

    const validData = validation.data

    // Kontrola duplicity názvu služby ve stejné organizaci
    const { data: existing } = await supabaseAdmin
      .from('services')
      .select('id')
      .eq('organization_id', auth.organizationId)
      .eq('name', validData.name)
      .single()

    if (existing) {
      return NextResponse.json({ error: `Služba "${validData.name}" již existuje` }, { status: 409 })
    }

    const insertData = {
      organization_id: auth.organizationId,
      name: validData.name,
      description: validData.description || null,
      duration: validData.duration,
      price: validData.price || null,
      category: validData.category || null,
      color: validData.color || '#3b82f6',
      visibility: validData.visibility || 'public',
      sort_order: validData.sort_order || 0,
      active: validData.active !== undefined ? validData.active : true,
    }

    const { data, error } = await supabaseAdmin
      .from('services')
      .insert(insertData)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
