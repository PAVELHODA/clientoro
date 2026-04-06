// PATH: src/lib/api/requireAuth.ts
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from './supabaseAdmin'

export type ApiRole = 'superadmin' | 'owner' | 'manager' | 'staff'

const ROLE_LEVEL: Record<ApiRole, number> = {
  staff: 10,
  manager: 20,
  owner: 30,
  superadmin: 100,
}

interface AuthResult {
  authorized: boolean
  userId: string | null
  profileId: string | null
  organizationId: string | null
  role: ApiRole
  error?: string
  status?: number
}

export async function requireAuth(
  request: NextRequest,
  minRole: ApiRole = 'staff'
): Promise<AuthResult> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { authorized: false, userId: null, profileId: null, organizationId: null, role: 'staff', error: 'Not authenticated', status: 401 }
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, is_superadmin')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return { authorized: false, userId: user.id, profileId: null, organizationId: null, role: 'staff', error: 'No profile found', status: 403 }
    }

    const activeOrgCookie = request.cookies.get('clientoro_active_org')?.value || null

    let role: ApiRole = 'staff'
    let organizationId: string | null = null

    if (profile.is_superadmin) {
      role = 'superadmin'

      if (activeOrgCookie) {
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('id', activeOrgCookie)
          .single()
        organizationId = org ? activeOrgCookie : null
      }

      if (!organizationId) {
        const headerOrgId = request.headers.get('x-org-id')
        if (headerOrgId) {
          organizationId = headerOrgId
        } else {
          const { data: membership } = await supabaseAdmin
            .from('memberships')
            .select('organization_id')
            .eq('user_id', profile.id)
            .limit(1)
            .single()
          organizationId = membership?.organization_id || null
        }
      }
    } else {
      const { data: memberships } = await supabaseAdmin
        .from('memberships')
        .select('organization_id, role')
        .eq('user_id', profile.id)
        .order('created_at')

      if (memberships && memberships.length > 0) {
        if (activeOrgCookie) {
          const matchedMembership = memberships.find(m => m.organization_id === activeOrgCookie)
          if (matchedMembership) {
            organizationId = matchedMembership.organization_id
            role = (matchedMembership.role as ApiRole) || 'staff'
          } else {
            organizationId = memberships[0].organization_id
            role = (memberships[0].role as ApiRole) || 'staff'
          }
        } else {
          organizationId = memberships[0].organization_id
          role = (memberships[0].role as ApiRole) || 'staff'
        }
      }

      if (role === 'staff' && organizationId) {
        const { data: staffRecord } = await supabaseAdmin
          .from('staff')
          .select('app_role')
          .eq('user_id', profile.id)
          .eq('organization_id', organizationId)
          .limit(1)
          .single()

        if (staffRecord?.app_role === 'manager') {
          role = 'manager'
        }
      }
    }

    if (ROLE_LEVEL[role] < ROLE_LEVEL[minRole]) {
      return { authorized: false, userId: user.id, profileId: profile.id, organizationId, role, error: 'Insufficient permissions', status: 403 }
    }

    return { authorized: true, userId: user.id, profileId: profile.id, organizationId, role }

  } catch (err) {
    console.error('[requireAuth] Error:', err)
    return { authorized: false, userId: null, profileId: null, organizationId: null, role: 'staff', error: 'Auth check failed', status: 500 }
  }
}
