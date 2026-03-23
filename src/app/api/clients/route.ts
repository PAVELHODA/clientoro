// PATH: src/app/api/clients/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'
import { clientCreateSchema, validateBody } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    // Sanitizace search parametru — max 100 znaků, odstranění nebezpečných znaků
    const sanitizedSearch = search.slice(0, 100).replace(/[%_\\]/g, '')

    let query = supabaseAdmin
      .from('clients')
      .select('*')
      .eq('organization_id', auth.organizationId)
      .order('created_at', { ascending: false })

    if (sanitizedSearch) {
      query = query.or(`full_name.ilike.%${sanitizedSearch}%,phone.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%`)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'manager')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()

    // Zod validace
    const validation = validateBody(clientCreateSchema, {
      ...body,
      organization_id: auth.organizationId,
    })
    if (!validation.success || !validation.data) {
      return NextResponse.json({ error: validation.error || 'Neplatná data' }, { status: 400 })
    }

    // Kontrola duplicity telefonu ve stejné organizaci
    if (validation.data.phone) {
      const { data: existing } = await supabaseAdmin
        .from('clients')
        .select('id, full_name')
        .eq('organization_id', auth.organizationId)
        .eq('phone', validation.data.phone)
        .single()

      if (existing) {
        return NextResponse.json({
          error: `Klient s tímto telefonem již existuje: ${existing.full_name}`,
          existing_client_id: existing.id,
        }, { status: 409 })
      }
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({ ...validation.data, organization_id: auth.organizationId })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
