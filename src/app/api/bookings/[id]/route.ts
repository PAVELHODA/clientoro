export const dynamic = 'force-dynamic'

// PATH: src/app/api/bookings/[id]/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeUpdate } from '@/lib/api/sanitizeUpdate'

const ALLOWED_BOOKING_FIELDS = [
  'service_id', 'staff_id', 'client_id', 'start_at', 'end_at',
  'customer_name', 'customer_phone', 'customer_email',
  'note', 'internal_note', 'price', 'status', 'source',
  'is_backfill', 'backfill_note',
]
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    if (!params.id || !/^[0-9a-f-]{36}$/.test(params.id)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 })
    }

    const body = await request.json()
    const updateData = sanitizeUpdate(body, ALLOWED_BOOKING_FIELDS)

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Žádná data k aktualizaci' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', params.id)
      .eq('organization_id', auth.organizationId)
      .select('*, clients(full_name, phone, email), services(name, color, duration, price), staff(full_name)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })

    if (updateData.status === 'cancelled') {
      try {
        const baseUrl = request.headers.get('host') || 'localhost:3000'
        const protocol = baseUrl.includes('localhost') ? 'http' : 'https'
        await fetch(`${protocol}://${baseUrl}/api/bookings/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-webhook-secret': process.env.INTERNAL_WEBHOOK_SECRET || '' },
          body: JSON.stringify({ action: 'cancelled', booking_id: params.id, organization_id: auth.organizationId }),
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
    const auth = await requireAuth(request, 'manager')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    if (!params.id || !/^[0-9a-f-]{36}$/.test(params.id)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', auth.organizationId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deleted: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
