export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('targetType')
    const targetId = searchParams.get('targetId')
    const targetDate = searchParams.get('targetDate')

    if (!targetType) return NextResponse.json({ error: 'Missing targetType' }, { status: 400 })

    let query = supabaseAdmin
      .from('notes')
      .select('*')
      .eq('organization_id', auth.organizationId)
      .eq('target_type', targetType)
      .order('created_at', { ascending: false })

    if (targetId) query = query.eq('target_id', targetId)
    if (targetDate) query = query.eq('target_date', targetDate)

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
    const { targetType, targetId, targetDate, content, isAdminOnly } = body

    if (!targetType || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('notes')
      .insert({
        organization_id: auth.organizationId,
        author_id: auth.userId,
        target_type: targetType,
        target_id: targetId || null,
        target_date: targetDate || null,
        content: content.trim(),
        is_admin_only: isAdminOnly || false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { id, content, isAdminOnly } = body

    if (!id || !content?.trim()) {
      return NextResponse.json({ error: 'Missing id or content' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('notes')
      .update({
        content: content.trim(),
        is_admin_only: isAdminOnly ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', auth.organizationId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('organization_id', auth.organizationId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}