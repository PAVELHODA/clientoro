import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, booking_id, organization_id } = body

    if (!action || !booking_id || !organization_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('*, services(name, duration, price), staff(full_name), clients(full_name, phone)')
      .eq('id', booking_id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name, notification_email, notify_on_booking, notify_on_cancel')
      .eq('id', organization_id)
      .single()

    if (action === 'created') {
      await supabaseAdmin.from('notifications').insert({
        organization_id,
        type: 'new_booking',
        title: 'Nova rezervace',
        body: `${booking.clients?.full_name || booking.customer_name || 'Klient'} - ${booking.services?.name || 'Sluzba'} (${new Date(booking.start_at).toLocaleString('cs-CZ')})`,
        booking_id,
      })
    }

    if (action === 'cancelled') {
      await supabaseAdmin.from('notifications').insert({
        organization_id,
        type: 'booking_cancelled',
        title: 'Rezervace zrusena',
        body: `${booking.clients?.full_name || booking.customer_name || 'Klient'} zrusil/a ${booking.services?.name || 'sluzbu'} (${new Date(booking.start_at).toLocaleString('cs-CZ')})`,
        booking_id,
      })

      const bookingDate = booking.start_at.split('T')[0]

      const { data: waitlistMatches } = await supabaseAdmin
        .from('waitlist')
        .select('*')
        .eq('organization_id', organization_id)
        .eq('status', 'waiting')
        .or(`service_id.eq.${booking.service_id},service_id.is.null`)
        .or(`preferred_date.eq.${bookingDate},preferred_date.is.null`)
        .order('created_at', { ascending: true })
        .limit(5)

      if (waitlistMatches && waitlistMatches.length > 0) {
        const first = waitlistMatches[0]

        await supabaseAdmin.from('waitlist').update({
          status: 'notified',
          notified_at: new Date().toISOString(),
        }).eq('id', first.id)

        await supabaseAdmin.from('notifications').insert({
          organization_id,
          type: 'waitlist_notified',
          title: 'Waitlist - slot nabidnut',
          body: `Uvolneny slot nabidnut: ${first.customer_name || 'Klient'} (${first.customer_phone || first.customer_email || ''})`,
          booking_id,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[booking-webhook]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
