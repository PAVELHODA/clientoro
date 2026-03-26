﻿// PATH: src/app/api/register/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'
import { z } from 'zod'
import { validateBody } from '@/lib/validations'

const registerSchema = z.object({
  email: z.string().email('Neplatný formát emailu'),
  password: z.string()
    .min(8, 'Heslo musí mít alespoň 8 znaků')
    .regex(/\d/, 'Heslo musí obsahovat alespoň 1 číslici')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Heslo musí obsahovat alespoň 1 speciální znak (!@#$%...)'),
  businessName: z.string()
    .min(2, 'Název firmy musí mít alespoň 2 znaky')
    .max(200, 'Název firmy je příliš dlouhý')
    .transform(val => val.trim()),
  mode: z.enum(['solo', 'team']).optional().default('solo'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Zod validace
    const validation = validateBody(registerSchema, body)
    if (!validation.success || !validation.data) {
      return NextResponse.json({ error: validation.error || 'Neplatná data' }, { status: 400 })
    }

    const { email, password, businessName, mode } = validation.data

    // Vytvoření uživatele v Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        return NextResponse.json({ error: 'Tento email je již registrován' }, { status: 400 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Nepodařilo se vytvořit účet' }, { status: 500 })
    }

    const userId = authData.user.id

    // Generování slugu
    let slug = businessName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data: existingSlug } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingSlug) {
      slug = slug + '-' + Math.random().toString(36).substring(2, 6)
    }

    // Vytvoření profilu
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      auth_user_id: userId,
      email,
      name: businessName,
    })
    if (profileError) console.error('Profile insert error:', profileError)

    // Vytvoření organizace
    const { data: orgData, error: orgError } = await supabaseAdmin.from('organizations').insert({
      name: businessName,
      slug,
      owner_user_id: userId,
      mode: mode || 'solo',
      category: 'other',
      work_start: 8,
      work_end: 17,
      timezone: 'Europe/Prague',
      language: 'cs',
      onboarding_completed: false,
    }).select().single()

    if (orgError) {
      console.error('Org insert error:', orgError)
      return NextResponse.json({ error: 'Účet vytvořen, ale organizace selhala: ' + orgError.message }, { status: 500 })
    }

    // Vytvoření membership
    if (orgData) {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('auth_user_id', userId)
        .single()

      if (profileData) {
        const { error: memberError } = await supabaseAdmin.from('memberships').insert({
          user_id: profileData.id,
          organization_id: orgData.id,
          role: 'owner',
        })
        if (memberError) console.error('Membership insert error:', memberError)
      }
    }

    // Notifikace pro admina
    try {
      if (orgData) {
        await supabaseAdmin.from('notifications').insert({
          organization_id: orgData.id,
          type: 'new_organization',
          channel: 'system',
          recipient: 'admin@clientoro.pro',
          subject: 'Nová organizace: ' + businessName,
          body: 'Email: ' + email + ', Mód: ' + (mode || 'solo') + ', Slug: ' + slug,
          status: 'pending',
        })
      }
    } catch (notifErr) {
      console.error('Notification error:', notifErr)
    }

    // Odeslat welcome email s booking linkem
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clientoro.pro'
    sendWelcomeEmail({
      to: email,
      orgName: businessName || 'Váš salon',
      bookingUrl: `${baseUrl}/book/${slug}`,
      dashboardUrl: `${baseUrl}/dashboard`,
    }).catch(err => console.error('[Welcome email failed]', err))

    return NextResponse.json({ success: true, userId })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Neočekávaná chyba' }, { status: 500 })
  }
}
