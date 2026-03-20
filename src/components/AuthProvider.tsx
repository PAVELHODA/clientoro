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
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [role, setRole] = useState<UserRole>('staff')
  const [loading, setLoading] = useState(true)
  const didInit = useRef(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    const init = async () => {
      try {
        const [meRes, orgRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/settings')
        ])

        if (meRes.ok) {
          const meData = await meRes.json()
          setUser({ id: meData.profileId || '', email: meData.email || '' })
          setRole(meData.role || 'staff')
        }

        if (orgRes.ok) {
          const orgData = await orgRes.json()
          setOrganization(orgData)
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
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setOrganization(data)
      }
    } catch (err) {
      console.error('Failed to fetch organization:', err)
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
    }}>
      {children}
    </AuthContext.Provider>
  )
}
