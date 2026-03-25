// PATH: src/app/api/public/booking/manage/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'
import { sendBookingCancellation } from '@/lib/email'

// GET — detail rezervace podle manage_token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 })

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, start_at, end_at, customer_name, customer_phone, customer_email,
        status, price, note, manage_token, created_at,
        services:service_id(name, duration, color),
        staff:staff_id(full_name),
        organizations:organization_id(name, phone, address, slug)
      `)
      .eq('manage_token', token)
      .single()

    if (error || !booking) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })

    return NextResponse.json(booking)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH — zrušit nebo změnit rezervaci
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, action } = body

    if (!token || !action) return NextResponse.json({ error: 'Token and action required' }, { status: 400 })

    // Najdi booking
    const { data: booking, error: findErr } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, start_at, customer_name, customer_email, price, status,
        service_id, staff_id, organization_id,
        services:service_id(name),
        staff:staff_id(full_name),
        organizations:organization_id(name, phone, email, notification_email, slug)
      `)
      .eq('manage_token', token)
      .single()

    if (findErr || !booking) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Reservation is already cancelled' }, { status: 400 })
    }

    if (action === 'cancel') {
      // Zrušit
      const { error: updateErr } = await supabaseAdmin
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id)

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

      // Odeslat email o zrušení
      const org = booking.organizations as any
      const startDate = new Date(booking.start_at)
      const dateStr = startDate.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      const timeStr = startDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })

      if (booking.customer_email) {
        sendBookingCancellation({
          to: booking.customer_email,
          customerName: booking.customer_name,
          serviceName: (booking.services as any)?.name || '',
          date: dateStr,
          time: timeStr,
          orgName: org?.name || '',
          orgPhone: org?.phone || undefined,
        }).catch(err => console.error('[Cancel email failed]', err))
      }

      return NextResponse.json({ success: true, status: 'cancelled' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('[manage-booking]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
