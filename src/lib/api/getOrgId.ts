// PATH: src/lib/api/getOrgId.ts
import { NextRequest } from 'next/server'

/**
 * Získá organization_id z requestu.
 * Pořadí: header X-Org-Id → query param org_id
 * BEZ fallbacku — pokud chybí, vrátí null (bezpečné)
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

  // 3. ŽÁDNÝ FALLBACK — bezpečné
  // V produkci musí být org_id vždy explicitně předán
  console.warn('[getOrgId] No org_id found in request — returning null')
  return null
}
