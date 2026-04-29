export const dynamic = 'force-dynamic'

// PATH: src/app/api/bookings/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'
import { bookingCreateSchema, validateBody } from '@/lib/validations'
import { sendBookingConfirmation, sendOwnerNotification } from '@/lib/email'

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
    if (end) query = query.lte('start_at', end + 'T23:59:59.999Z')

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

    // Zod validace
    const validation = validateBody(bookingCreateSchema, {
      ...body,
      organization_id: auth.organizationId,
    })
    if (!validation.success || !validation.data) {
      return NextResponse.json({ error: validation.error || 'Neplatná data' }, { status: 400 })
    }

    const validData = validation.data

    // Validace: end_at musí být po start_at
    if (new Date(validData.end_at) <= new Date(validData.start_at)) {
      return NextResponse.json({ error: 'Konec rezervace musí být po začátku' }, { status: 400 })
    }

    // Rezervace v minulosti:
    // - Backfill (6× klik): kdokoliv může (is_backfill = true)
    // - Owner / Superadmin: může vždy
    // - Staff / Manager: NEMŮŽE (pokud není backfill)
    if (!validData.is_backfill && new Date(validData.start_at) < new Date()) {
      if (auth.role !== 'owner' && auth.role !== 'superadmin') {
        return NextResponse.json({ error: 'Pouze majitel může vytvořit rezervaci v minulosti' }, { status: 403 })
      }
    }

    // Kontrola kolize — POUZE u stejného zaměstnance na stejný čas
    if (validData.staff_id && !validData.is_backfill) {
      const { data: conflicts } = await (supabaseAdmin as any)
        .from('bookings')
        .select('id')
        .eq('organization_id', auth.organizationId)
        .eq('staff_id', validData.staff_id)
        .neq('status', 'cancelled')
        .lt('start_at', validData.end_at)
        .gt('end_at', validData.start_at)

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json({ error: 'Tento zaměstnanec má v daném čase již rezervaci' }, { status: 409 })
      }
    }

    // Auto-create klienta pokud má telefon a nemá client_id
    let clientId = validData.client_id || null
    if (!clientId && validData.customer_phone) {
      // Hledej existujícího klienta podle telefonu
      const { data: existingClient } = await (supabaseAdmin as any)
        .from('clients')
        .select('id, total_visits, full_name')
        .eq('organization_id', auth.organizationId)
        .eq('phone', validData.customer_phone)
        .single()

      if (existingClient) {
        clientId = existingClient.id
        // Aktualizuj počet návštěv
        await (supabaseAdmin as any).from('clients').update({
          total_visits: (existingClient.total_visits || 0) + 1,
          last_visit_at: validData.start_at,
          full_name: validData.customer_name || existingClient.full_name,
        }).eq('id', clientId)
      } else if (validData.customer_name) {
        // Vytvoř nového klienta
        const { data: newClient } = await (supabaseAdmin as any)
          .from('clients')
          .insert({
            organization_id: auth.organizationId,
            full_name: validData.customer_name,
            phone: validData.customer_phone,
            email: validData.customer_email || null,
            source: validData.source === 'online' ? 'online' : 'manual',
            total_visits: 1,
            last_visit_at: validData.start_at,
          })
          .select('id')
          .single()
        clientId = newClient?.id || null
      }
    }

    // Vložení rezervace
    const { data, error } = await (supabaseAdmin as any)
      .from('bookings')
      .insert({
        ...validData,
        organization_id: auth.organizationId,
        client_id: clientId,
      })
      .select(`
        *,
        clients (id, full_name, phone, email),
        services (id, name, color, duration, price),
        staff (id, full_name)
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Přímé posílání emailů (bez webhook self-fetch)
    try {
      const startDate = new Date(data.start_at)
      const dateStr = startDate.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      const timeStr = startDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
      const clientEmail = data.clients?.email || data.customer_email
      const clientName = data.clients?.full_name || data.customer_name || 'Klient'
      const serviceName = data.services?.name || 'Služba'
      const staffName = data.staff?.full_name || undefined

      // Org data pro emaily
      const { data: org } = await supabaseAdmin.from('organizations')
        .select('name, phone, address, logo_url, notification_email, notify_on_booking, slug')
        .eq('id', auth.organizationId).single()

      // Email klientovi
      if (clientEmail) {
        sendBookingConfirmation({
          to: clientEmail, customerName: clientName, serviceName, staffName,
          date: dateStr, time: timeStr, price: data.price || undefined,
          orgName: org?.name || 'Salon', orgPhone: org?.phone || undefined,
          logoUrl: org?.logo_url || undefined, address: org?.address || undefined,
          startAt: data.start_at, duration: data.services?.duration || 60,
          bookingId: 'CLT-' + new Date().getFullYear() + '-' + String(data.id).substring(0, 6).toUpperCase(),
        }).catch(err => console.error('[Email to client]', err))
      }

      // Email majiteli
      const ownerEmail = org?.notification_email
      if (ownerEmail && org?.notify_on_booking !== false) {
        sendOwnerNotification({
          to: ownerEmail, customerName: clientName, customerPhone: data.customer_phone || '',
          customerEmail: clientEmail || undefined, serviceName, staffName,
          date: dateStr, time: timeStr, price: data.price || undefined,
          orgName: org?.name || 'Salon',
        }).catch(err => console.error('[Email to owner]', err))
      }

      // In-app notifikace
      await supabaseAdmin.from('notifications').insert({
        organization_id: auth.organizationId, type: 'new_booking', channel: 'system',
        recipient: ownerEmail || 'system', subject: 'Nová rezervace', status: 'sent',
        body: clientName + ' — ' + serviceName + ' (' + dateStr + ', ' + timeStr + ')',
        booking_id: data.id,
      })
    } catch (e) { console.error('[email-notify]', e) }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}