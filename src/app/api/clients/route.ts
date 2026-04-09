export const dynamic = 'force-dynamic'

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
  const sanitizedSearch = search.slice(0, 100).replace(/[%_\\(),.]/g, '')

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
    // Owner může taky přidávat klienty (ne jen manager)
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()

    // Zod validace — BEZ organization_id (přidáme sami)
    const validation = validateBody(clientCreateSchema, body)
    if (!validation.success) {
      console.warn('[Clients POST] Zod validation failed:', validation.error, 'Body:', JSON.stringify(body).slice(0, 500))
      return NextResponse.json({ error: validation.error || 'Neplatná data' }, { status: 400 })
    }

    const validData = validation.data as any

    // Musí mít alespoň jméno nebo telefon
    if (!validData.full_name && !validData.phone) {
      return NextResponse.json({ error: 'Vyplňte jméno nebo telefon' }, { status: 400 })
    }

    // Kontrola duplicity telefonu ve stejné organizaci
    if (validData.phone) {
      const { data: existing } = await supabaseAdmin
        .from('clients')
        .select('id, full_name')
        .eq('organization_id', auth.organizationId)
        .eq('phone', validData.phone)
        .single()

      if (existing) {
        return NextResponse.json({
          error: `Klient s tímto telefonem již existuje: ${existing.full_name}`,
          existing_client_id: existing.id,
        }, { status: 409 })
      }
    }

    // Vložení — jen povolená pole
    const insertData: any = {
      organization_id: auth.organizationId,
    }
    if (validData.full_name) insertData.full_name = validData.full_name
    if (validData.phone) insertData.phone = validData.phone
    if (validData.email) insertData.email = validData.email
    if (validData.note) insertData.note = validData.note
    if (validData.source) insertData.source = validData.source
    if (validData.tags && Array.isArray(validData.tags)) insertData.tags = validData.tags
    if (validData.birthday) insertData.birthday = validData.birthday

    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert(insertData)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
