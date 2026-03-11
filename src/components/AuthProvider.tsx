'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
}

interface Organization {
  id: string
  name: string
  slug: string
  mode: string
  category: string
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  zip: string | null
  logo_url: string | null
  description: string | null
  work_start: number
  work_end: number
  timezone: string
  language: string
  onboarding_completed: boolean
  default_staff_id: string | null
}

interface AuthContextType {
  user: User | null
  organization: Organization | null
  orgId: string | null
  loading: boolean
  refreshOrg: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  organization: null,
  orgId: null,
  loading: true,
  refreshOrg: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const fetchOrganization = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setOrganization(data)
      }
    } catch (err) {
      console.error('Failed to fetch organization:', err)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Získej aktuálního uživatele
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
          })

          // 2. Načti organizaci
          await fetchOrganization()
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        setLoading(false)
      }
    }

    init()

    // 3. Poslouchej změny auth stavu
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          })
          await fetchOrganization()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setOrganization(null)
        }
      }
    )

    return () => { subscription.unsubscribe() }
  }, [])

  const refreshOrg = async () => {
    await fetchOrganization()
  }

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      orgId: organization?.id || null,
      loading,
      refreshOrg,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
