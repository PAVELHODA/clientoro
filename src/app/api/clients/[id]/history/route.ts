export const dynamic = 'force-dynamic'

// PATH: src/app/api/clients/[id]/history/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const clientId = params.id

    // Verify client belongs to org
    const { data: client } = await (supabaseAdmin as any)
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('organization_id', auth.organizationId)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Get bookings for this client
    const { data: bookings } = await (supabaseAdmin as any)
      .from('bookings')
      .select('id, start_at, end_at, status, price, customer_name, services(name, color, duration), staff(full_name)')
      .eq('client_id', clientId)
      .eq('organization_id', auth.organizationId)
      .order('start_at', { ascending: false })
      .limit(50)

    return NextResponse.json(bookings || [])
  } catch (err) {
    console.error('[client-history]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
