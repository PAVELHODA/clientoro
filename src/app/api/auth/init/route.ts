// PATH: src/app/api/auth/init/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
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

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, name, is_superadmin, avatar_url, phone')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'No profile found' }, { status: 404 })
    }

    let role = 'staff'
    let staffId: string | null = null
    let permissions: Record<string, boolean> = {}
    let availableOrgs: any[] = []

    if (profile.is_superadmin) {
      role = 'superadmin'
      const { data: allOrgs } = await supabaseAdmin
        .from('organizations')
        .select('id, name, mode, slug, logo_url')
        .order('name')
      availableOrgs = allOrgs || []
    } else {
      const { data: memberships } = await supabaseAdmin
        .from('memberships')
        .select('organization_id, role, organizations(id, name, mode, slug, logo_url)')
        .eq('user_id', profile.id)
        .order('created_at')

      if (memberships && memberships.length > 0) {
        role = memberships[0].role || 'staff'
        availableOrgs = memberships.map((m: any) => ({
          ...m.organizations,
          membership_role: m.role,
        }))
      }
    }

    // KLÍČOVÉ: Přečti cookie pro aktivní org
    const activeOrgCookie = request.cookies.get('clientoro_active_org')?.value
    let activeOrgId = activeOrgCookie || availableOrgs[0]?.id || null

    // Ověř přístup
    if (activeOrgId && !profile.is_superadmin) {
      const hasAccess = availableOrgs.some((o: any) => o.id === activeOrgId)
      if (!hasAccess) activeOrgId = availableOrgs[0]?.id || null
    }

    // Superadmin — ověř že org existuje
    if (activeOrgId && profile.is_superadmin) {
      const exists = availableOrgs.some((o: any) => o.id === activeOrgId)
      if (!exists) activeOrgId = availableOrgs[0]?.id || null
    }

    let organization = null
    if (activeOrgId) {
      const { data: orgData } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('id', activeOrgId)
        .single()
      organization = orgData

      if (role === 'staff' && activeOrgId && !profile.is_superadmin) {
        const { data: staffRecord } = await supabaseAdmin
          .from('staff')
          .select('id, app_role, permissions')
          .eq('user_id', profile.id)
          .eq('organization_id', activeOrgId)
          .limit(1)
          .single()

        if (staffRecord) {
          staffId = staffRecord.id
          if (staffRecord.app_role === 'manager') role = 'manager'
          permissions = staffRecord.permissions || {}
        }
      }
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        phone: profile.phone,
      },
      role,
      isSuperadmin: profile.is_superadmin,
      staffId,
      permissions,
      organization,
      availableOrgs,
      activeOrgId,
    })

  } catch (error) {
    console.error('[/api/auth/init] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
