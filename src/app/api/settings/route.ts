import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { getOrgId } from '@/lib/api/getOrgId'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const orgId = await getOrgId(request)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const orgId = await getOrgId(request)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const body = await request.json()

    const allowedFields = [
      'name', 'mode', 'address', 'phone', 'email',
      'website', 'work_start', 'work_end', 'slot_duration',
      'booking_link', 'timezone', 'onboarding_completed',
      'category', 'description', 'city', 'zip', 'logo_url',
      'language', 'slug',
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }

    const { data, error } = await supabaseAdmin
      .from('organizations')
      .update(updateData)
      .eq('id', orgId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
