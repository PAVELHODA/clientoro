import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { getOrgId } from '@/lib/api/getOrgId'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const orgId = await getOrgId(request)
    if (!orgId) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        clients (id, full_name, phone, email),
        services (id, name, color, duration, price),
        staff (id, full_name)
      `)
      .eq('organization_id', orgId)
      .order('start_at', { ascending: true })

    if (start) query = query.gte('start_at', start)
    if (end) query = query.lte('start_at', end)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = await getOrgId(request)
    if (!orgId) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({ ...body, organization_id: orgId })
      .select(`
        *,
        clients (id, full_name, phone, email),
        services (id, name, color, duration, price),
        staff (id, full_name)
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
