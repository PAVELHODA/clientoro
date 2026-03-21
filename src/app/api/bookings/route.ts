import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

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
      .eq('organization_id', auth.organizationId)
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
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({ ...body, organization_id: auth.organizationId })
      .select(`
        *,
        clients (id, full_name, phone, email),
        services (id, name, color, duration, price),
        staff (id, full_name)
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      const baseUrl = request.headers.get('host') || 'localhost:3000'
      const protocol = baseUrl.includes('localhost') ? 'http' : 'https'
      await fetch(protocol + '://' + baseUrl + '/api/bookings/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'created', booking_id: data.id, organization_id: auth.organizationId }),
      })
    } catch (e) { console.error('[webhook-trigger]', e) }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
