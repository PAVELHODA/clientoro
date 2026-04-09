export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await (supabaseAdmin as any)
      .from('service_categories')
      .select('*, service_templates(*)')
      .eq('active', true)
      .order('sort_order')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'superadmin')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()

    if (body.type === 'category') {
      const { data, error } = await (supabaseAdmin as any).from('service_categories').insert({
        name: body.name, slug: body.slug, icon: body.icon, description: body.description, sort_order: body.sort_order || 99,
      }).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data, { status: 201 })
    }

    if (body.type === 'template') {
      const { data, error } = await (supabaseAdmin as any).from('service_templates').insert({
        category_id: body.category_id, name: body.name, duration: body.duration, price: body.price, color: body.color, sort_order: body.sort_order || 99,
      }).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'superadmin')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id || !type) return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })

    if (type === 'category') {
      await (supabaseAdmin as any).from('service_templates').delete().eq('category_id', id)
      await (supabaseAdmin as any).from('service_categories').delete().eq('id', id)
    } else if (type === 'template') {
      await (supabaseAdmin as any).from('service_templates').delete().eq('id', id)
    }

    return NextResponse.json({ deleted: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
