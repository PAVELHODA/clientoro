import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

async function checkSuperadmin(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return request.cookies.get(name)?.value }, set() {}, remove() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabaseAdmin.from('profiles').select('is_superadmin').eq('auth_user_id', user.id).single()
  return profile?.is_superadmin === true
}

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
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
    if (!await checkSuperadmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await request.json()

    if (body.type === 'category') {
      const { data, error } = await supabaseAdmin.from('service_categories').insert({
        name: body.name, slug: body.slug, icon: body.icon, description: body.description, sort_order: body.sort_order || 99,
      }).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data, { status: 201 })
    }

    if (body.type === 'template') {
      const { data, error } = await supabaseAdmin.from('service_templates').insert({
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
    if (!await checkSuperadmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id || !type) return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })

    if (type === 'category') {
      await supabaseAdmin.from('service_templates').delete().eq('category_id', id)
      await supabaseAdmin.from('service_categories').delete().eq('id', id)
    } else if (type === 'template') {
      await supabaseAdmin.from('service_templates').delete().eq('id', id)
    }

    return NextResponse.json({ deleted: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
