import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { getOrgId } from '@/lib/api/getOrgId'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orgId = await getOrgId(request)
    if (!orgId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(body)
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .select('*, clients(full_name, phone, email), services(name, color, duration, price), staff(full_name)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (body.status === 'cancelled') {
      try {
        const baseUrl = request.headers.get('host') || 'localhost:3000'
        const protocol = baseUrl.includes('localhost') ? 'http' : 'https'
        await fetch(protocol + '://' + baseUrl + '/api/bookings/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cancelled', booking_id: params.id, organization_id: orgId }),
        })
      } catch (e) { console.error('[webhook-trigger]', e) }
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orgId = await getOrgId(request)
    if (!orgId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { error } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', orgId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deleted: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
