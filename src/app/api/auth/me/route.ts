// PATH: src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    // 1. Get session
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

    // 2. Get profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, name, is_superadmin, avatar_url, phone')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'No profile found' }, { status: 404 })
    }

    // 3. Determine role
    let role = 'staff'
    let organizationId: string | null = null
    let staffId: string | null = null
    let permissions: Record<string, boolean> = {}

    // Check superadmin first
    if (profile.is_superadmin) {
      role = 'superadmin'

      // Superadmin — get first membership for org context
      const { data: membership } = await supabaseAdmin
        .from('memberships')
        .select('organization_id, role')
        .eq('user_id', profile.id)
        .limit(1)
        .single()

      if (membership) {
        organizationId = membership.organization_id
      }
    } else {
      // Get membership
      const { data: membership } = await supabaseAdmin
        .from('memberships')
        .select('organization_id, role')
        .eq('user_id', profile.id)
        .limit(1)
        .single()

      if (membership) {
        organizationId = membership.organization_id
        role = membership.role || 'staff'
      }

      // If role is staff, check if they're a manager via staff.app_role
      if (role === 'staff' && organizationId) {
        const { data: staffRecord } = await supabaseAdmin
          .from('staff')
          .select('id, app_role, permissions')
          .eq('user_id', profile.id)
          .eq('organization_id', organizationId)
          .limit(1)
          .single()

        if (staffRecord) {
          staffId = staffRecord.id
          if (staffRecord.app_role === 'manager') {
            role = 'manager'
          }
          permissions = staffRecord.permissions || {}
        }
      }
    }

    // 4. Return complete auth data
    return NextResponse.json({
      profileId: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatar_url,
      phone: profile.phone,
      isSuperadmin: profile.is_superadmin,
      role,
      organizationId,
      staffId,
      permissions,
    })

  } catch (error) {
    console.error('[/api/auth/me] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
