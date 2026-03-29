// PATH: src/app/api/auth/switch-org/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return request.cookies.get(name)?.value },
          set() {},
          remove() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { organizationId } = await request.json()
    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 })
    }

    // Get profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, is_superadmin')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Superadmin může přepnout na cokoliv
    if (profile.is_superadmin) {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

      if (!org) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
      }

      // Uložit do cookie
      const response = NextResponse.json({ ok: true, organization: org })
      response.cookies.set('clientoro_active_org', organizationId, {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 rok
      })
      return response
    }

    // Ostatní — ověř membership
    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('organization_id, role, organizations(*)')
      .eq('user_id', profile.id)
      .eq('organization_id', organizationId)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No access to this organization' }, { status: 403 })
    }

    // Uložit do cookie
    const response = NextResponse.json({ ok: true, organization: membership.organizations })
    response.cookies.set('clientoro_active_org', organizationId, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
    return response
  } catch (err) {
    console.error('[auth/switch-org]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
