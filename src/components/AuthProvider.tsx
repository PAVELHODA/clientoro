// PATH: src/components/AuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'superadmin' | 'owner' | 'manager' | 'staff'

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
  phone: string
  email: string
  website: string
  address: string
  city: string
  zip: string
  ico: string
  dic: string
  logo_url: string | null
  description: string
  work_start: number
  work_end: number
  timezone: string
  language: string
  onboarding_completed: boolean
  default_staff_id: string | null
  slot_duration: number
  notification_email: string | null
  notify_on_booking: boolean
  notify_on_cancel: boolean
}

interface AuthContextType {
  user: User | null
  organization: Organization | null
  orgId: string | null
  role: UserRole
  loading: boolean
  isSuperadmin: boolean
  isOwner: boolean
  isManager: boolean
  isStaff: boolean
  isAtLeastManager: boolean
  isAtLeastOwner: boolean
  refreshOrg: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  organization: null,
  orgId: null,
  role: 'staff',
  loading: true,
  isSuperadmin: false,
  isOwner: false,
  isManager: false,
  isStaff: true,
  isAtLeastManager: false,
  isAtLeastOwner: false,
  refreshOrg: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 100,
  owner: 80,
  manager: 60,
  staff: 40,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [role, setRole] = useState<UserRole>('staff')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

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

  const fetchRole = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setRole(data.role || 'staff')
      }
    } catch (err) {
      console.error('Failed to fetch role:', err)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
          })
          await Promise.all([fetchOrganization(), fetchRole()])
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          })
          await Promise.all([fetchOrganization(), fetchRole()])
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setOrganization(null)
          setRole('staff')
        }
      }
    )

    return () => { subscription.unsubscribe() }
  }, [])

  const refreshOrg = async () => {
    await fetchOrganization()
  }

  const isSuperadmin = role === 'superadmin'
  const isOwner = role === 'owner'
  const isManager = role === 'manager'
  const isStaffRole = role === 'staff'
  const isAtLeastManager = ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.manager
  const isAtLeastOwner = ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.owner

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      orgId: organization?.id || null,
      role,
      loading,
      isSuperadmin,
      isOwner,
      isManager,
      isStaff: isStaffRole,
      isAtLeastManager,
      isAtLeastOwner,
      refreshOrg,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
