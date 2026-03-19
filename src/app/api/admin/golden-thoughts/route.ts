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
      .from('golden_thoughts')
      .select('*')
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
    const { data, error } = await supabaseAdmin.from('golden_thoughts').insert({
      text: body.text, author: body.author || 'Clientoro', modes: body.modes || ['solo','team','solo_inspire','pro_inspire'], active: true
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!await checkSuperadmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await request.json()
    const { data, error } = await supabaseAdmin.from('golden_thoughts').update({
      text: body.text, author: body.author, modes: body.modes, active: body.active
    }).eq('id', body.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!await checkSuperadmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await supabaseAdmin.from('golden_thoughts').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
