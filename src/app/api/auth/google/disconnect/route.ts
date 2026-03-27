// PATH: src/app/api/auth/google/disconnect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { disconnectGcal } from '@/lib/googleCalendar'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const success = await disconnectGcal(auth.organizationId)
    if (!success) return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
