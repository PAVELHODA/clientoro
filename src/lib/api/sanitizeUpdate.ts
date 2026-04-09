// PATH: src/lib/api/sanitizeUpdate.ts

const FORBIDDEN_FIELDS = ['id', 'created_at', 'org_id', 'organization_id', 'owner_user_id', 'user_id']

export function sanitizeUpdate(data: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (!FORBIDDEN_FIELDS.includes(key) && !key.startsWith('_')) {
      clean[key] = value
    }
  }
  return clean
}
