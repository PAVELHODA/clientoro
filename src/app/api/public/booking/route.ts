// PATH: src/app/api/public/booking/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmation, sendOwnerNotification } from '@/lib/email'
import { rateLimit } from '@/lib/rateLimit'
import { publicBookingPostSchema, publicBookingGetSchema, validateBody } from '@/lib/validations'

// GET — veřejné služby, staff a working hours pro booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    // Zod validace
    const validation = validateBody(publicBookingGetSchema, { slug })
    if (!validation.success || !validation.data) {
      return NextResponse.json({ error: validation.error || 'Neplatná data' }, { status: 400 })
    }

    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name, mode, work_start, work_end, slug, description, phone, address, logo_url')
      .eq('slug', validation.data.slug)
      .single()

    if (orgError || !org) return NextResponse.json({ error: 'Organizace nenalezena' }, { status: 404 })

    // Služby (jen public + active)
    const { data: services } = await supabaseAdmin
      .from('services')
      .select('id, name, duration, price, color, category, description')
      .eq('organization_id', org.id)
      .eq('active', true)
      .eq('visibility', 'public')
      .order('sort_order', { ascending: true })

    // Staff (jen active)
    const { data: staff } = await supabaseAdmin
      .from('staff')
      .select('id, full_name, avatar_url, staff_services(service_id)')
      .eq('organization_id', org.id)
      .eq('active', true)

    // Working hours pro všechny staff
    const staffIds = (staff || []).map((s: any) => s.id)
    let workingHours: any[] = []
    if (staffIds.length > 0) {
      const { data: wh } = await supabaseAdmin
        .from('staff_working_hours')
        .select('*')
        .in('staff_id', staffIds)
      workingHours = wh || []
    }

    // Time off
    let timeOffs: any[] = []
    if (staffIds.length > 0) {
      const today = new Date().toISOString()
      const { data: to } = await supabaseAdmin
        .from('staff_time_off')
        .select('*')
        .in('staff_id', staffIds)
        .gte('end_at', today)
      timeOffs = to || []
    }

    // Existující bookings (pro obsazené sloty)
    const today = new Date().toISOString().split('T')[0]
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('start_at, end_at, staff_id, service_id')
      .eq('organization_id', org.id)
      .gte('start_at', today)
      .neq('status', 'cancelled')

    return NextResponse.json({
      organization: org,
      services: services || [],
      staff: staff || [],
      working_hours: workingHours,
      time_off: timeOffs,
      bookings: bookings || [],
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — vytvořit novou veřejnou rezervaci + odeslat emaily
export async function POST(request: NextRequest) {
  try {
    // Rate limiting — max 5 rezervací za minutu z jedné IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const { allowed } = rateLimit(ip, 5)
    if (!allowed) {
      return NextResponse.json({ error: 'Příliš mnoho požadavků. Zkuste to za minutu.' }, { status: 429 })
    }

    // Zod validace
    const body = await request.json()
    const validation = validateBody(publicBookingPostSchema, body)
    if (!validation.success || !validation.data) {
      return NextResponse.json({ error: validation.error || 'Neplatná data' }, { status: 400 })
    }

    const { slug, service_id, staff_id, start_at, end_at, customer_name, customer_phone, customer_email, note, price } = validation.data

    // Validace: end_at musí být po start_at
    if (new Date(end_at) <= new Date(start_at)) {
      return NextResponse.json({ error: 'Konec rezervace musí být po začátku' }, { status: 400 })
    }

    // Validace: rezervace nesmí být v minulosti
    if (new Date(start_at) < new Date()) {
      return NextResponse.json({ error: 'Nelze vytvořit rezervaci v minulosti' }, { status: 400 })
    }

    // Validace: maximální délka rezervace 8 hodin
    const durationMs = new Date(end_at).getTime() - new Date(start_at).getTime()
    if (durationMs > 8 * 60 * 60 * 1000) {
      return NextResponse.json({ error: 'Maximální délka rezervace je 8 hodin' }, { status: 400 })
    }

    // Najdi organizaci + email majitele + telefon
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id, name, email, phone, notification_email, notify_on_booking')
      .eq('slug', slug)
      .single()

    if (!org) return NextResponse.json({ error: 'Organizace nenalezena' }, { status: 404 })

    // Kontrola kolize — POUZE u stejného zaměstnance
    if (staff_id) {
      const { data: conflicts } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('organization_id', org.id)
        .eq('staff_id', staff_id)
        .neq('status', 'cancelled')
        .lt('start_at', end_at)
        .gt('end_at', start_at)

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json({ error: 'Tento termín je již obsazený' }, { status: 409 })
      }
    }

    // Najdi nebo vytvoř klienta
    let clientId = null
    const { data: existingClient } = await supabaseAdmin
      .from('clients')
      .select('id, total_visits')
      .eq('organization_id', org.id)
      .eq('phone', customer_phone)
      .single()

    if (existingClient) {
      clientId = existingClient.id
      await supabaseAdmin.from('clients').update({
        total_visits: (existingClient.total_visits || 0) + 1,
        last_visit_at: start_at,
      }).eq('id', clientId)
    } else {
      const { data: newClient } = await supabaseAdmin
        .from('clients')
        .insert({
          organization_id: org.id,
          full_name: customer_name,
          phone: customer_phone,
          email: customer_email || null,
          source: 'booking_page',
          total_visits: 1,
          last_visit_at: start_at,
        })
        .select('id')
        .single()
      clientId = newClient?.id || null
    }

    // Najdi název služby a staff
    const { data: service } = await supabaseAdmin
      .from('services')
      .select('name')
      .eq('id', service_id)
      .single()

    let staffName = ''
    if (staff_id) {
      const { data: staffData } = await supabaseAdmin
        .from('staff')
        .select('full_name')
        .eq('id', staff_id)
        .single()
      staffName = staffData?.full_name || ''
    }

    // Vytvoř rezervaci
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        organization_id: org.id,
        service_id,
        staff_id: staff_id || null,
        client_id: clientId,
        start_at,
        end_at,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        note: note || null,
        price: price || null,
        status: 'confirmed',
        source: 'online',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Odeslat emaily (na pozadí — nečekáme na výsledek)
    const startDate = new Date(start_at)
    const dateStr = startDate.toLocaleDateString('cs-CZ', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
    const timeStr = startDate.toLocaleTimeString('cs-CZ', {
      hour: '2-digit', minute: '2-digit'
    })

    // Email klientovi — potvrzení
    if (customer_email) {
      sendBookingConfirmation({
        to: customer_email,
        customerName: customer_name,
        serviceName: service?.name || 'Služba',
        staffName: staffName || undefined,
        date: dateStr,
        time: timeStr,
        price: price || undefined,
        orgName: org.name,
        orgPhone: org.phone || undefined,
      }).catch(err => console.error('[Email to client failed]', err))
    }

    // Email majiteli — notifikace
    const ownerEmail = org.notification_email || org.email
    if (ownerEmail && org.notify_on_booking !== false) {
      sendOwnerNotification({
        to: ownerEmail,
        customerName: customer_name,
        customerPhone: customer_phone,
        customerEmail: customer_email || undefined,
        serviceName: service?.name || 'Služba',
        staffName: staffName || undefined,
        date: dateStr,
        time: timeStr,
        price: price || undefined,
        orgName: org.name,
      }).catch(err => console.error('[Email to owner failed]', err))
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[public-booking]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
