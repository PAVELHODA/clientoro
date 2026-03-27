// PATH: src/app/api/bookings/webhook/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import {
  sendBookingConfirmation, sendOwnerNotification,
  sendBookingCancellation, sendOwnerCancellation, sendTestEmail,
} from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, booking_id, organization_id } = body

    if (!action || !organization_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // ========== TEST ==========
    if (action === 'test') {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('name, notification_email')
        .eq('id', organization_id)
        .single()

      if (!org?.notification_email) {
        return NextResponse.json({ error: 'Notification email not set' }, { status: 400 })
      }

      await sendTestEmail({ to: org.notification_email, orgName: org.name })
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
      .select('name, phone, address, notification_email, notify_on_booking, notify_on_cancel')
      .eq('id', organization_id)
      .single()

    const clientName = booking.clients?.full_name || booking.customer_name || 'Klient'
    const clientPhone = booking.clients?.phone || booking.customer_phone || ''
    const clientEmail = booking.clients?.email || booking.customer_email
    const serviceName = booking.services?.name || 'Služba'
    const staffName = booking.staff?.full_name || undefined
    const orgName = org?.name || 'Salon'
    const orgPhone = org?.phone || undefined

    const startDate = new Date(booking.start_at)
    const date = startDate.toLocaleDateString('cs-CZ', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const time = startDate.toLocaleTimeString('cs-CZ', {
      hour: '2-digit', minute: '2-digit',
    })

    // ========== CREATED ==========
    if (action === 'created') {
      // In-app notifikace
      await supabaseAdmin.from('notifications').insert({
        organization_id,
        type: 'new_booking',
        title: 'Nová rezervace',
        body: `${clientName} — ${serviceName} (${date}, ${time})`,
        booking_id,
      })

      // Email majiteli
      if (org?.notify_on_booking && org?.notification_email) {
        await sendOwnerNotification({
          to: org.notification_email,
          customerName: clientName,
          customerPhone: clientPhone,
          customerEmail: clientEmail || undefined,
          serviceName,
          staffName,
          date,
          time,
          price: booking.price || undefined,
          orgName,
        })
      }

      // Email klientovi
      if (clientEmail) {
        await sendBookingConfirmation({
          to: clientEmail,
          customerName: clientName,
          serviceName,
          staffName,
          date,
          time,
          price: booking.price || undefined,
          orgName,
          orgPhone,
        })
      }
    }

    // ========== CANCELLED ==========
    if (action === 'cancelled') {
      // In-app notifikace
      await supabaseAdmin.from('notifications').insert({
        organization_id,
        type: 'booking_cancelled',
        title: 'Rezervace zrušena',
        body: `${clientName} zrušil/a ${serviceName} (${date}, ${time})`,
        booking_id,
      })

      // Email majiteli
      if (org?.notify_on_cancel && org?.notification_email) {
        await sendOwnerCancellation({
          to: org.notification_email,
          customerName: clientName,
          customerPhone: clientPhone,
          serviceName,
          date,
          time,
          orgName,
          dashboardUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/calendar` : 'https://clientoro.pro/calendar',
        })
      }

      // Email klientovi
      if (clientEmail) {
        await sendBookingCancellation({
          to: clientEmail,
          customerName: clientName,
          serviceName,
          date,
          time,
          orgName,
          orgPhone,
        })
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
          organization_id,
          type: 'waitlist_notified',
          title: 'Waitlist — slot nabídnut',
          body: `Uvolněný slot nabídnut: ${first.customer_name || 'Klient'} (${first.customer_phone || first.customer_email || ''})`,
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
