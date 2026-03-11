export interface Service {
  id: string
  organization_id: string
  name: string
  description: string | null
  duration: number
  price: number | null
  category: string | null
  color: string
  visibility: 'public' | 'private'
  buffer_before_minutes: number
  buffer_after_minutes: number
  sort_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceFormData {
  name: string
  description: string
  duration: number
  price: number | null
  category: string
  color: string
  visibility: 'public' | 'private'
  buffer_before_minutes: number
  buffer_after_minutes: number
  active: boolean
}

export const DEFAULT_SERVICE: ServiceFormData = {
  name: '',
  description: '',
  duration: 60,
  price: null,
  category: '',
  color: '#3b82f6',
  visibility: 'public',
  buffer_before_minutes: 0,
  buffer_after_minutes: 0,
  active: true,
}
