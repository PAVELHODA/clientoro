export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const orgId = auth.organizationId

    const [clients, bookings, services, staff] = await Promise.all([
      supabaseAdmin.from('clients').select('*').eq('organization_id', orgId),
      supabaseAdmin.from('bookings').select('*').eq('organization_id', orgId),
      supabaseAdmin.from('services').select('*').eq('organization_id', orgId),
      supabaseAdmin.from('staff').select('*').eq('organization_id', orgId),
    ])

    const lines = ['=== CLIENTORO BACKUP ===', '']
    lines.push('--- KLIENTI ---')
    lines.push('Jmeno;Telefon;Email;Navstevy;Utrata')
    ;(clients.data || []).forEach((c: any) => lines.push(`${c.full_name};${c.phone || ''};${c.email || ''};${c.total_visits || 0};${c.total_spent || 0}`))
    lines.push('')
    lines.push('--- REZERVACE ---')
    lines.push('Datum;Cas;Sluzba;Klient;Status;Cena')
    ;(bookings.data || []).forEach((b: any) => lines.push(`${b.start_at};${b.end_at};${b.service_id};${b.customer_name || ''};${b.status};${b.price || 0}`))
    lines.push('')
    lines.push('--- SLUZBY ---')
    lines.push('Nazev;Cena;Delka')
    ;(services.data || []).forEach((s: any) => lines.push(`${s.name};${s.price || 0};${s.duration || 0}`))
    lines.push('')
    lines.push('--- ZAMESTNANCI ---')
    lines.push('Jmeno;Email;Telefon')
    ;(staff.data || []).forEach((s: any) => lines.push(`${s.full_name};${s.email || ''};${s.phone || ''}`))

    const csv = lines.join('\n')
    return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename=clientoro-backup.csv' } })
  } catch (err) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
