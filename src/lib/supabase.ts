import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function createClient() {
  if (DEMO_MODE) {
    // fake client → nic nedělá
    return {
      auth: {
        getUser: async () => ({ data: { user: null } }),
        signInWithPassword: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
      },
    } as any
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
