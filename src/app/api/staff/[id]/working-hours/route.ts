export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const staffId = params.id

    const { data: workingHours, error: whError } = await supabaseAdmin
      .from('staff_working_hours')
      .select('*')
      .eq('staff_id', staffId)
      .order('weekday', { ascending: true })

    if (whError) return NextResponse.json({ error: whError.message }, { status: 500 })

    const { data: exceptions, error: exError } = await supabaseAdmin
      .from('staff_exceptions')
      .select('*')
      .eq('staff_id', staffId)
      .order('date', { ascending: true })

    if (exError) return NextResponse.json({ error: exError.message }, { status: 500 })

    const { data: timeOff, error: toError } = await supabaseAdmin
      .from('staff_time_off')
      .select('*')
      .eq('staff_id', staffId)
      .order('start_at', { ascending: true })

    if (toError) return NextResponse.json({ error: toError.message }, { status: 500 })

    return NextResponse.json({
      working_hours: workingHours || [],
      exceptions: exceptions || [],
      time_off: timeOff || [],
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const staffId = params.id
    const body = await request.json()
    const { working_hours } = body

    if (!Array.isArray(working_hours)) {
      return NextResponse.json({ error: 'working_hours must be an array' }, { status: 400 })
    }

    const { error: deleteError } = await supabaseAdmin
      .from('staff_working_hours')
      .delete()
      .eq('staff_id', staffId)

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

    const rows = working_hours
      .filter((wh: any) => wh.enabled)
      .map((wh: any) => ({
        staff_id: staffId,
        organization_id: wh.organization_id || null,
        weekday: wh.weekday,
        start_time: wh.start_time,
        end_time: wh.end_time,
        break_start: wh.break_start || null,
        break_end: wh.break_end || null,
      }))

    if (rows.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('staff_working_hours')
        .insert(rows)

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const { data } = await supabaseAdmin
      .from('staff_working_hours')
      .select('*')
      .eq('staff_id', staffId)
      .order('weekday', { ascending: true })

    return NextResponse.json({ working_hours: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
