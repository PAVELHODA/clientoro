import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { name, mode, category } = await request.json()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('organizations')
      .insert({ name, mode: mode || 'solo', category: category || 'other', work_start: 6, work_end: 22 })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
