// PATH: src/lib/api/getOrgId.ts
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Získá organization_id z requestu.
 * Pořadí: header X-Org-Id → query param org_id → auth session → membership
 */
export async function getOrgId(request?: NextRequest): Promise<string | null> {
  // 1. Z headeru
  if (request) {
    const headerOrgId = request.headers.get('x-org-id')
    if (headerOrgId) return headerOrgId
  }

  // 2. Z query parametru
  if (request) {
    const { searchParams } = new URL(request.url)
    const queryOrgId = searchParams.get('org_id')
    if (queryOrgId) return queryOrgId
  }

  // 3. Z auth session — najdi uživatele a jeho organizaci
  if (request) {
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

      if (user) {
        // Najdi profil
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()

        if (profile) {
          // Najdi membership
          const { data: membership } = await supabaseAdmin
            .from('memberships')
            .select('organization_id')
            .eq('user_id', profile.id)
            .limit(1)
            .single()

          if (membership) {
            return membership.organization_id
          }
        }
      }
    } catch (err) {
      console.error('[getOrgId] Auth session lookup failed:', err)
    }
  }

  // 4. Žádný fallback
  console.warn('[getOrgId] No org_id found — returning null')
  return null
}
