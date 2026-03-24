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

    // TEST EMAIL
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
      .select('*, services(name, duration, price), staff(full_name), clients(full_name, phone, email)')
      .eq('id', booking_id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name, notification_email, notify_on_booking, notify_on_cancel')
      .eq('id', organization_id)
      .single()

    const clientName = booking.clients?.full_name || booking.customer_name || 'Klient'
    const clientEmail = booking.clients?.email || booking.customer_email
    const serviceName = booking.services?.name || 'Sluzba'
    const staffName = booking.staff?.full_name || ''
    const dateStr = new Date(booking.start_at).toLocaleString('cs-CZ', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    const orgName = org?.name || 'Salon'

    // ========== CREATED ==========
    if (action === 'created') {
      // In-app notifikace
      await supabaseAdmin.from('notifications').insert({
        organization_id, type: 'new_booking', title: 'Nova rezervace',
        body: clientName + ' - ' + serviceName + ' (' + dateStr + ')', booking_id,
      })

      // Email majiteli
      if (org?.notify_on_booking && org?.notification_email) {
        await sendBookingNotification(
          org.notification_email,
          'Nova rezervace: ' + serviceName,
          'Klient: ' + clientName + '\nSluzba: ' + serviceName + (staffName ? '\nSpecialista: ' + staffName : '') + '\nDatum: ' + dateStr + (booking.price ? '\nCena: ' + booking.price + ' Kc' : '')
        )
      }

      // Email klientovi (potvrzení)
      if (clientEmail) {
        await sendBookingNotification(
          clientEmail,
          'Potvrzeni rezervace - ' + orgName,
          'Dobry den ' + clientName + ',\n\nvase rezervace byla uspesne vytvorena.\n\nSluzba: ' + serviceName + (staffName ? '\nSpecialista: ' + staffName : '') + '\nDatum: ' + dateStr + (booking.price ? '\nCena: ' + booking.price + ' Kc' : '') + '\n\nProvozovatel: ' + orgName + '\n\nTesime se na Vas!'
        )
      }
    }

    // ========== CANCELLED ==========
    if (action === 'cancelled') {
      // In-app notifikace
      await supabaseAdmin.from('notifications').insert({
        organization_id, type: 'booking_cancelled', title: 'Rezervace zrusena',
        body: clientName + ' zrusil/a ' + serviceName + ' (' + dateStr + ')', booking_id,
      })

      // Email majiteli
      if (org?.notify_on_cancel && org?.notification_email) {
        await sendBookingNotification(
          org.notification_email,
          'Rezervace zrusena: ' + serviceName,
          'Klient: ' + clientName + '\nSluzba: ' + serviceName + '\nDatum: ' + dateStr + '\n\nRezervace byla zrusena.'
        )
      }

      // Email klientovi (zrušení)
      if (clientEmail) {
        await sendBookingNotification(
          clientEmail,
          'Rezervace zrusena - ' + orgName,
          'Dobry den ' + clientName + ',\n\nvase rezervace byla zrusena.\n\nSluzba: ' + serviceName + '\nDatum: ' + dateStr + '\n\nPokud chcete novy termin, zarezervujte si prosim znovu.\n\nProvozovatel: ' + orgName
        )
      }

      // Waitlist
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

        // Email waitlist klientovi
        if (first.customer_email) {
          await sendBookingNotification(
            first.customer_email,
            'Uvolnil se termin - ' + orgName,
            'Dobry den ' + (first.customer_name || '') + ',\n\nuvolnil se termin, o ktery jste meli zajem.\n\nSluzba: ' + serviceName + '\nDatum: ' + dateStr + '\n\nZarezervujte si ho co nejdrive!\n\nProvozovatel: ' + orgName
          )
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[booking-webhook]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
