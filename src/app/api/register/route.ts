﻿// PATH: src/app/api/register/route.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessName, mode } = await request.json()

    if (!email || !password || !businessName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Vytvor auth usera
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    const userId = authData.user.id
    let slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { data: existingSlug } = await supabaseAdmin.from('organizations').select('id').eq('slug', slug).single()
    if (existingSlug) { slug = slug + '-' + Math.random().toString(36).substring(2, 6) }

    // 2. Vytvor profil (name, NE full_name; BEZ role)
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      auth_user_id: userId,
      email,
      name: businessName,
    })

    if (profileError) {
      console.error('Profile insert error:', profileError)
    }

    // 3. Vytvor organizaci
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
      return NextResponse.json({ error: 'Account created but org failed: ' + orgError.message }, { status: 500 })
    }

    // 4. Vytvor membership
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

        if (memberError) {
          console.error('Membership insert error:', memberError)
        }
      } else {
        console.error('Profile not found for membership creation')
      }
    }

    return NextResponse.json({ success: true, userId })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
