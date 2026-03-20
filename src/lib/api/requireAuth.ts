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

/**
 * Ověří uživatele z requestu a zkontroluje minimální roli.
 * Použití: const auth = await requireAuth(request, 'owner')
 * Pokud auth.authorized === false, vrať NextResponse.json({ error: auth.error }, { status: auth.status })
 */
export async function requireAuth(
  request: NextRequest,
  minRole: ApiRole = 'staff'
): Promise<AuthResult> {
  try {
    // 1. Získej session z cookies
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
      return { authorized: false, userId: null, profileId: null, organizationId: null, role: 'staff', error: 'Not authenticated', status: 401 }
    }

    // 2. Získej profil
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, is_superadmin')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return { authorized: false, userId: user.id, profileId: null, organizationId: null, role: 'staff', error: 'No profile found', status: 403 }
    }

    // 3. Urči roli
    let role: ApiRole = 'staff'
    let organizationId: string | null = null

    if (profile.is_superadmin) {
      role = 'superadmin'
      // Superadmin — získej org z membership nebo headeru
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
    } else {
      // Normální uživatel — získej membership
      const { data: membership } = await supabaseAdmin
        .from('memberships')
        .select('organization_id, role')
        .eq('user_id', profile.id)
        .limit(1)
        .single()

      if (membership) {
        organizationId = membership.organization_id
        role = (membership.role as ApiRole) || 'staff'
      }

      // Zkontroluj staff.app_role pro manager
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

    // 4. Zkontroluj minimální roli
    if (ROLE_LEVEL[role] < ROLE_LEVEL[minRole]) {
      return { authorized: false, userId: user.id, profileId: profile.id, organizationId, role, error: 'Insufficient permissions', status: 403 }
    }

    return { authorized: true, userId: user.id, profileId: profile.id, organizationId, role }

  } catch (err) {
    console.error('[requireAuth] Error:', err)
    return { authorized: false, userId: null, profileId: null, organizationId: null, role: 'staff', error: 'Auth check failed', status: 500 }
  }
}
