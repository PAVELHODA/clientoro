// PATH: src/app/api/auth/google/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { data } = await supabaseAdmin
      .from('google_calendar_tokens')
      .select('google_email, calendar_id, updated_at')
      .eq('organization_id', auth.organizationId)
      .single()

    return NextResponse.json({
      connected: !!data,
      google_email: data?.google_email || null,
      calendar_id: data?.calendar_id || null,
      connected_at: data?.updated_at || null,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
