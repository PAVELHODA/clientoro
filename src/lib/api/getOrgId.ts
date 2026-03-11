import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Získá organization_id z requestu.
 * Pořadí: header X-Org-Id → query param org_id → fallback z DB
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

  // 3. Fallback — první organizace v DB (pro development)
  const { data } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single()

  return data?.id || null
}
