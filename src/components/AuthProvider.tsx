// PATH: src/components/AuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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
  role: UserRole
  loading: boolean
  isSuperadmin: boolean
  isOwner: boolean
  isManager: boolean
  isStaff: boolean
  isAtLeastManager: boolean
  isAtLeastOwner: boolean
  refreshOrg: () => Promise<void>
  switchOrg: (orgId: string) => Promise<void>
  availableOrgs: { id: string; name: string; mode: string; slug: string }[]
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 100,
  owner: 80,
  manager: 60,
  staff: 40,
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
  switchOrg: async () => {},
  availableOrgs: [],
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [role, setRole] = useState<UserRole>('staff')
  const [loading, setLoading] = useState(true)
  const [availableOrgs, setAvailableOrgs] = useState<{ id: string; name: string; mode: string; slug: string }[]>([])
  const didInit = useRef(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    const init = async () => {
      try {
        const res = await fetch('/api/auth/init')
        if (!res.ok) {
          setLoading(false)
          return
        }

        const data = await res.json()

        setUser(data.user ? { id: data.user.id, email: data.user.email } : null)
        setRole((data.role as UserRole) || 'staff')
        setOrganization(data.organization || data.availableOrgs?.[0] || null)
        setAvailableOrgs(data.availableOrgs || [])

        // Uložit aktivní org do cookie
        if (data.activeOrgId && typeof document !== 'undefined') {
          document.cookie = `clientoro_active_org=${data.activeOrgId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const refreshOrg = async () => {
    try {
      const res = await fetch('/api/auth/init')
      if (res.ok) {
        const data = await res.json()
        setOrganization(data.organization || data.availableOrgs?.[0] || null)
        setAvailableOrgs(data.availableOrgs || [])
      }
    } catch (err) {
      console.error('Failed to refresh org:', err)
    }
  }

  const switchOrg = async (orgId: string) => {
    try {
      // 1. Nastav cookie PŘED API voláním
      document.cookie = `clientoro_active_org=${orgId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`

      // 2. Zavolej API (nastaví i server-side cookie)
      await fetch('/api/auth/switch-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      })

      // 3. Hard reload — AuthProvider se reinicializuje s novou cookie
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Switch org error:', err)
    }
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
      switchOrg,
      availableOrgs,
    }}>
      {children}
    </AuthContext.Provider>
  )
}


