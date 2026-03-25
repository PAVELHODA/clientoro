// PATH: src/app/api/clients/[id]/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_CLIENT_FIELDS = [
  'full_name', 'phone', 'email', 'note', 'tags',
  'birthday', 'source', 'total_visits', 'last_visit_at',
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
    const auth = await requireAuth(request, 'manager')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    if (!params.id || !/^[0-9a-f-]{36}$/.test(params.id)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 })
    }

    const body = await request.json()
    const updateData = sanitizeUpdate(body, ALLOWED_CLIENT_FIELDS)

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Žádná data k aktualizaci' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(updateData)
      .eq('id', params.id)
      .eq('organization_id', auth.organizationId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    if (!params.id || !/^[0-9a-f-]{36}$/.test(params.id)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', auth.organizationId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
