export const dynamic = 'force-dynamic'

// PATH: src/app/api/public/booking/manage/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'
import { sendBookingCancellation, sendOwnerCancellation } from '@/lib/email'
import { isRateLimited } from '@/lib/api/rateLimit'

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
  // Rate limiting
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(clientIP, 10)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { token, action } = body

    if (!token || !action) return NextResponse.json({ error: 'Token and action required' }, { status: 400 })

    // Najdi booking
    const { data: booking, error: findErr } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, start_at, customer_name, customer_email, customer_phone, price, status,
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

      // Email klientovi o zrušení
      const customerEmail = booking.customer_email
      if (customerEmail) {
        sendBookingCancellation({
          to: customerEmail,
          customerName: booking.customer_name,
          serviceName: (booking.services as any)?.name || '',
          date: dateStr,
          time: timeStr,
          orgName: org?.name || '',
          orgPhone: org?.phone || undefined,
          bookingUrl: org?.slug ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://clientoro.pro'}/book/${org.slug}` : undefined,
        }).catch(err => console.error('[Cancel email to client failed]', err))
      }

      // Email majiteli o zrušení
      const ownerEmail = org?.notification_email || org?.email
      if (ownerEmail) {
        sendOwnerCancellation({
          to: ownerEmail,
          customerName: booking.customer_name,
          customerPhone: booking.customer_phone || '',
          serviceName: (booking.services as any)?.name || '',
          date: dateStr,
          time: timeStr,
          orgName: org?.name || '',
        }).catch(err => console.error('[Cancel email to owner failed]', err))
      }

      return NextResponse.json({ success: true, status: 'cancelled' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('[manage-booking]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
