export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()

    const { data, error } = await (supabaseAdmin as any)
      .from('staff_time_off')
      .insert({
        staff_id: params.id,
        organization_id: auth.organizationId,
        type: body.type || 'vacation',
        start_at: body.start_at,
        end_at: body.end_at,
        reason: body.reason || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(request.url)
    const timeOffId = searchParams.get('time_off_id')

    if (!timeOffId) return NextResponse.json({ error: 'time_off_id required' }, { status: 400 })

    const { error } = await (supabaseAdmin as any)
      .from('staff_time_off')
      .delete()
      .eq('id', timeOffId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
