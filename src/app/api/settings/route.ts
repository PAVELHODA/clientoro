export const dynamic = 'force-dynamic'

// PATH: src/app/api/settings/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { requireAuth } from '@/lib/api/requireAuth'
import { NextRequest, NextResponse } from 'next/server'
import { settingsUpdateSchema, validateBody } from '@/lib/validations'
import { sendWelcomeEmail, sendAdminNotification } from '@/lib/email'

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

    return NextResponse.json({ ...data, booking_link: data.slug || '' })
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

    const validation = validateBody(settingsUpdateSchema, body)
    if (!validation.success) {
      console.warn('[Settings PUT] Zod validation failed:', validation.error, 'Body:', JSON.stringify(body).slice(0, 500))
      return NextResponse.json({ error: validation.error || 'Neplatná data' }, { status: 400 })
    }

    const allowedFields = [
      'name', 'mode', 'address', 'phone', 'email',
      'website', 'work_start', 'work_end', 'slot_duration',
      'booking_link', 'timezone', 'onboarding_completed',
      'category', 'description', 'city', 'zip', 'logo_url',
      'language', 'ico', 'dic',
      'notification_email', 'notify_on_booking', 'notify_on_cancel',
      'reminder_enabled', 'followup_enabled', 'weekly_report_enabled',
      'work_days',
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const dbField = field === 'booking_link' ? 'slug' : field
        updateData[dbField] = body[field]
      }
    }

    if (updateData.name && !updateData.slug) {
      const newSlug = updateData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

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

    if (updateData.work_start !== undefined && updateData.work_end !== undefined) {
      if (updateData.work_end <= updateData.work_start) {
        return NextResponse.json({ error: 'Konec pracovní doby musí být po začátku' }, { status: 400 })
      }
    }

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

    // Zjistíme jestli onboarding právě končí (pro odeslání emailů)
    const isFinishingOnboarding = body.onboarding_completed === true

    // Pokud dokončujeme onboarding, načteme aktuální data organizace PŘED updatem
    let orgBeforeUpdate: any = null
    if (isFinishingOnboarding) {
      const { data: currentOrg } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('id', auth.organizationId)
        .single()
      orgBeforeUpdate = currentOrg
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

    // === AUTO-CREATE STAFF (majitel) při dokončení onboardingu ===
    if (isFinishingOnboarding && orgBeforeUpdate && !orgBeforeUpdate.onboarding_completed) {
      try {
        // Zkontroluj jestli už staff existuje
        const { count: existingStaff } = await supabaseAdmin
          .from('staff')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', auth.organizationId)

        if (!existingStaff || existingStaff === 0) {
          // Získej profil majitele
          const { data: ownerProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, name, email')
            .eq('auth_user_id', auth.userId)
            .single()

          const staffName = ownerProfile?.name || data.name || 'Majitel'
          const staffEmail = ownerProfile?.email || data.email || ''

          // 1. Vytvoř staff záznam
          const { data: newStaff, error: staffError } = await supabaseAdmin
            .from('staff')
            .insert({
              organization_id: auth.organizationId,
              full_name: staffName,
              email: staffEmail,
                            active: true,
            })
            .select()
            .single()

          if (staffError) {
            console.error('[Auto-create staff] Error:', staffError)
          } else if (newStaff) {
            console.log('[Auto-create staff] Created:', newStaff.id, staffName)

            // 2. Vytvoř working hours (Po-Pá dle org.work_start/work_end)
            const workStart = data.work_start || orgBeforeUpdate.work_start || 8
            const workEnd = data.work_end || orgBeforeUpdate.work_end || 17
            const whRows = []
            for (let day = 0; day < 5; day++) {
              whRows.push({
                staff_id: newStaff.id,
                weekday: day,
                start_time: `${String(workStart).padStart(2, '0')}:00`,
                end_time: `${String(workEnd).padStart(2, '0')}:00`,
              })
            }
            const { error: whError } = await supabaseAdmin
              .from('staff_working_hours')
              .insert(whRows)
            if (whError) console.error('[Auto-create WH] Error:', whError)
            else console.log('[Auto-create WH] Created', whRows.length, 'working hour rows')

            // 3. Přiřaď všechny služby organizace tomuto staff
            const { data: orgServices } = await supabaseAdmin
              .from('services')
              .select('id')
              .eq('organization_id', auth.organizationId)
              .eq('active', true)

            if (orgServices && orgServices.length > 0) {
              const ssRows = orgServices.map((svc: any) => ({
                staff_id: newStaff.id,
                service_id: svc.id,
              }))
              const { error: ssError } = await supabaseAdmin
                .from('staff_services')
                .insert(ssRows)
              if (ssError) console.error('[Auto-create SS] Error:', ssError)
              else console.log('[Auto-create SS] Linked', ssRows.length, 'services')
            }
          }
        } else {
          console.log('[Auto-create staff] Staff already exists, count:', existingStaff)
        }
      } catch (staffErr) {
        console.error('[Auto-create staff] Unexpected error:', staffErr)
      }
    }

    // === EMAILY PO DOKONČENÍ ONBOARDINGU ===
    if (isFinishingOnboarding && orgBeforeUpdate && !orgBeforeUpdate.onboarding_completed) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.clientoro.pro'
      // Načti KOMPLETNÍ org data (update vrací jen změněné sloupce)
      const { data: fullOrg } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('id', auth.organizationId)
        .single()
      const org = fullOrg || data

      // Získej email majitele
      const { data: ownerProf } = await supabaseAdmin.from('profiles').select('email').eq('auth_user_id', auth.userId).single()
      const ownerEmail = org.email || ownerProf?.email || orgBeforeUpdate?.email || ''

      // 1. Welcome email pro zákazníka
      sendWelcomeEmail({
        to: ownerEmail,
        orgName: org.name || 'Váš salon',
        bookingUrl: `${baseUrl}/book/${org.slug}`,
        dashboardUrl: `${baseUrl}/dashboard`,
      }).catch(err => console.error('[Welcome email failed]', err))

      // 2. Admin notifikace pro superadmina
      sendAdminNotification({
        orgName: org.name || 'Neznámá',
        email: org.email || '',
        phone: org.phone || '',
        ico: org.ico || '',
        category: org.category || '',
        mode: org.mode || 'solo',
        slug: org.slug || '',
        address: org.address || '',
      }).catch(err => console.error('[Admin notification failed]', err))

      console.log('[Onboarding completed] Emaily odeslány pro:', org.name)
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
