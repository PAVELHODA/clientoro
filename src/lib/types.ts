// PATH: src/lib/types.ts
// Auto-derived types from database.types.ts
// Usage: import type { Booking, Client, Service } from '@/lib/types'

import type { Database } from './database.types'

// ============================================
// Table Row types (what you GET from DB)
// ============================================
type Tables = Database['public']['Tables']

export type AuditLog = Tables['audit_log']['Row']
export type Booking = Tables['bookings']['Row']
export type BookingService = Tables['booking_services']['Row']
export type BookingSource = Tables['booking_sources']['Row']
export type BookingStaff = Tables['booking_staff']['Row']
export type Campaign = Tables['campaigns']['Row']
export type Client = Tables['clients']['Row']
export type ClientNote = Tables['client_notes']['Row']
export type GoldenThought = Tables['golden_thoughts']['Row']
export type GoogleCalendarToken = Tables['google_calendar_tokens']['Row']
export type Lead = Tables['leads']['Row']
export type ManagerPin = Tables['manager_pins']['Row']
export type Membership = Tables['memberships']['Row']
export type Note = Tables['notes']['Row']
export type Notification = Tables['notifications']['Row']
export type Organization = Tables['organizations']['Row']
export type Profile = Tables['profiles']['Row']
export type QrCode = Tables['qr_codes']['Row']
export type Review = Tables['reviews']['Row']
export type ServiceCategory = Tables['service_categories']['Row']
export type ServiceTemplate = Tables['service_templates']['Row']
export type Service = Tables['services']['Row']
export type Settings = Tables['settings']['Row']
export type Staff = Tables['staff']['Row']
export type StaffAvailability = Tables['staff_availability']['Row']
export type StaffException = Tables['staff_exceptions']['Row']
export type StaffService = Tables['staff_services']['Row']
export type StaffTimeOff = Tables['staff_time_off']['Row']
export type StaffWorkingHours = Tables['staff_working_hours']['Row']
export type Waitlist = Tables['waitlist']['Row']

// ============================================
// Insert types (what you POST to DB)
// ============================================
export type BookingInsert = Tables['bookings']['Insert']
export type ClientInsert = Tables['clients']['Insert']
export type ServiceInsert = Tables['services']['Insert']
export type StaffInsert = Tables['staff']['Insert']
export type NotificationInsert = Tables['notifications']['Insert']
export type NoteInsert = Tables['notes']['Insert']

// ============================================
// Update types (what you PATCH to DB)
// ============================================
export type BookingUpdate = Tables['bookings']['Update']
export type ClientUpdate = Tables['clients']['Update']
export type ServiceUpdate = Tables['services']['Update']
export type StaffUpdate = Tables['staff']['Update']
export type OrganizationUpdate = Tables['organizations']['Update']

// ============================================
// Composite / extended types (for JOINs)
// ============================================
export type BookingWithRelations = Booking & {
  services?: Service | null
  staff?: Staff | null
  clients?: Client | null
  organizations?: Organization | null
}

export type StaffWithServices = Staff & {
  staff_services?: StaffService[]
}

export type ServiceWithCategory = Service & {
  service_categories?: ServiceCategory | null
}

export type MembershipWithOrg = Membership & {
  organizations?: Organization | null
}
