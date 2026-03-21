import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

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

    const insertData = {
      organization_id: auth.organizationId,
      name: body.name,
      description: body.description || null,
      duration: body.duration || 60,
      price: body.price || null,
      category: body.category || null,
      color: body.color || '#3b82f6',
      visibility: body.visibility || 'public',
      buffer_before_minutes: body.buffer_before_minutes || 0,
      buffer_after_minutes: body.buffer_after_minutes || 0,
      sort_order: body.sort_order || 0,
      active: body.active !== undefined ? body.active : true,
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
