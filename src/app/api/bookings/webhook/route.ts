// PATH: src/app/api/bookings/webhook/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { sendBookingNotification } from '@/lib/email/sendNotification'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, booking_id, organization_id } = body

    if (!action || !organization_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // TEST EMAIL — nepotřebuje booking
    if (action === 'test') {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('name, notification_email, notify_on_booking, notify_on_cancel')
        .eq('id', organization_id)
        .single()

      if (!org?.notification_email) {
        return NextResponse.json({ error: 'Notification email not set' }, { status: 400 })
      }

      const now = new Date().toLocaleString('cs-CZ')
      await sendBookingNotification(
        org.notification_email,
        'Testovaci email z Clientoro',
        'Toto je testovaci email. Notifikace funguji spravne! Odeslano: ' + now + '\n\nOrganizace: ' + org.name
      )

      return NextResponse.json({ success: true, sent_to: org.notification_email })
    }

    // Pro ostatní akce potřebujeme booking_id
    if (!booking_id) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 })
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

    const clientName = booking.clients?.full_name || booking.customer_name || 'Klient'
    const serviceName = booking.services?.name || 'Sluzba'
    const dateStr = new Date(booking.start_at).toLocaleString('cs-CZ')

    if (action === 'created') {
      await supabaseAdmin.from('notifications').insert({
        organization_id, type: 'new_booking', title: 'Nova rezervace',
        body: clientName + ' - ' + serviceName + ' (' + dateStr + ')', booking_id,
      })

      if (org?.notify_on_booking && org?.notification_email) {
        await sendBookingNotification(
          org.notification_email,
          'Nova rezervace: ' + serviceName,
          clientName + ' si rezervoval/a ' + serviceName + ' na ' + dateStr
        )
      }
    }

    if (action === 'cancelled') {
      await supabaseAdmin.from('notifications').insert({
        organization_id, type: 'booking_cancelled', title: 'Rezervace zrusena',
        body: clientName + ' zrusil/a ' + serviceName + ' (' + dateStr + ')', booking_id,
      })

      if (org?.notify_on_cancel && org?.notification_email) {
        await sendBookingNotification(
          org.notification_email,
          'Rezervace zrusena: ' + serviceName,
          clientName + ' zrusil/a ' + serviceName + ' na ' + dateStr
        )
      }

      const bookingDate = booking.start_at.split('T')[0]
      const { data: waitlistMatches } = await supabaseAdmin
        .from('waitlist').select('*')
        .eq('organization_id', organization_id).eq('status', 'waiting')
        .or('service_id.eq.' + booking.service_id + ',service_id.is.null')
        .or('preferred_date.eq.' + bookingDate + ',preferred_date.is.null')
        .order('created_at', { ascending: true }).limit(5)

      if (waitlistMatches && waitlistMatches.length > 0) {
        const first = waitlistMatches[0]
        await supabaseAdmin.from('waitlist').update({
          status: 'notified', notified_at: new Date().toISOString(),
        }).eq('id', first.id)

        await supabaseAdmin.from('notifications').insert({
          organization_id, type: 'waitlist_notified', title: 'Waitlist - slot nabidnut',
          body: 'Uvolneny slot nabidnut: ' + (first.customer_name || 'Klient') + ' (' + (first.customer_phone || first.customer_email || '') + ')',
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
