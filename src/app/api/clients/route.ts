import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { getOrgId } from '@/lib/api/getOrgId'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const orgId = await getOrgId(request)
    if (!orgId) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('clients')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = await getOrgId(request)
    if (!orgId) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({ ...body, organization_id: orgId })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
