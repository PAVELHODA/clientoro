// PATH: src/app/api/register/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessName, mode } = await request.json()

    if (!email || !password || !businessName) {
      return NextResponse.json({ error: 'Vyplnte vsechna povinna pole' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Neplatny format emailu' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Heslo musi mit alespon 8 znaku' }, { status: 400 })
    }
    if (!/\d/.test(password)) {
      return NextResponse.json({ error: 'Heslo musi obsahovat alespon 1 cislici' }, { status: 400 })
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return NextResponse.json({ error: 'Heslo musi obsahovat alespon 1 specialni znak (!@#$%...)' }, { status: 400 })
    }

    if (businessName.length < 2) {
      return NextResponse.json({ error: 'Nazev firmy musi mit alespon 2 znaky' }, { status: 400 })
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        return NextResponse.json({ error: 'Tento email je jiz registrovan' }, { status: 400 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Nepodarilo se vytvorit ucet' }, { status: 500 })
    }

    const userId = authData.user.id
    let slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { data: existingSlug } = await supabaseAdmin.from('organizations').select('id').eq('slug', slug).single()
    if (existingSlug) { slug = slug + '-' + Math.random().toString(36).substring(2, 6) }

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      auth_user_id: userId,
      email,
      name: businessName,
    })
    if (profileError) console.error('Profile insert error:', profileError)

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
      return NextResponse.json({ error: 'Ucet vytvoren, ale organizace selhala: ' + orgError.message }, { status: 500 })
    }

    if (orgData) {
      const { data: profileData } = await supabaseAdmin
        .from('profiles').select('id').eq('auth_user_id', userId).single()

      if (profileData) {
        const { error: memberError } = await supabaseAdmin.from('memberships').insert({
          user_id: profileData.id,
          organization_id: orgData.id,
          role: 'owner',
        })
        if (memberError) console.error('Membership insert error:', memberError)
      }
    }

    try {
      await supabaseAdmin.from('notifications').insert({
        user_id: null,
        type: 'new_organization',
        title: 'Nova organizace: ' + businessName,
        message: 'Email: ' + email + ', Mod: ' + (mode || 'solo') + ', Slug: ' + slug,
        read: false,
      })
    } catch (notifErr) {
      console.error('Notification error:', notifErr)
    }

    return NextResponse.json({ success: true, userId })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Neocekavana chyba' }, { status: 500 })
  }
}