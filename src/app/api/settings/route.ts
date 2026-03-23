﻿// PATH: src/app/api/settings/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'
import { settingsUpdateSchema, validateBody } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'staff')
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', auth.organizationId)
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
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()

    // Zod validace
    const validation = validateBody(settingsUpdateSchema, body)
    if (!validation.success || !validation.data) {
      return NextResponse.json({ error: validation.error || 'Neplatná data' }, { status: 400 })
    }

    const validData = validation.data

    // Povolená pole — pouze tato se mohou aktualizovat
    const allowedFields = [
      'name', 'mode', 'address', 'phone', 'email',
      'website', 'work_start', 'work_end', 'slot_duration',
      'booking_link', 'timezone', 'onboarding_completed',
      'category', 'description', 'city', 'zip', 'logo_url',
      'language', 'ico', 'dic',
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      const value = (validData as any)[field] ?? (body as any)[field]
      if (value !== undefined) {
        const dbField = field === 'booking_link' ? 'slug' : field
        updateData[dbField] = value
      }
    }

    // Auto-generování slugu z názvu (pokud se mění název a slug není explicitně zadán)
    if (updateData.name && !updateData.slug) {
      const newSlug = updateData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Kontrola unikátnosti slugu
      const { data: existingSlug } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', auth.organizationId)
        .single()

      if (existingSlug) {
        updateData.slug = `${newSlug}-${Date.now().toString(36).slice(-4)}`
      } else {
        updateData.slug = newSlug
      }
    }

    // Validace: work_end > work_start
    if (updateData.work_start !== undefined && updateData.work_end !== undefined) {
      if (updateData.work_end <= updateData.work_start) {
        return NextResponse.json({ error: 'Konec pracovní doby musí být po začátku' }, { status: 400 })
      }
    }

    // Validace: slug unikátnost (pokud se mění explicitně)
    if (body.booking_link) {
      const explicitSlug = body.booking_link
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data: existingSlug } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('slug', explicitSlug)
        .neq('id', auth.organizationId)
        .single()

      if (existingSlug) {
        return NextResponse.json({ error: 'Tento booking link je již obsazený' }, { status: 409 })
      }

      updateData.slug = explicitSlug
    }

    // Validace: změna módu — kontrola limitů
    if (updateData.mode) {
      const soloModes = ['solo', 'solo_inspire']
      if (soloModes.includes(updateData.mode)) {
        const { count } = await supabaseAdmin
          .from('staff')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', auth.organizationId)
          .eq('active', true)

        if ((count || 0) > 1) {
          return NextResponse.json({
            error: `Nelze přejít na plán pro jednu osobu — máte ${count} aktivních zaměstnanců. Nejdříve deaktivujte přebytečné.`,
          }, { status: 400 })
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('organizations')
      .update(updateData)
      .eq('id', auth.organizationId)
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
