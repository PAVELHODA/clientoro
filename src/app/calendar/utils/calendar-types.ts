// src/app/calendar/utils/calendar-types.ts
'use client'

// Re-exporty z database typů
export type { Booking, Service, Staff, Client } from '@/lib/types'

// Kalendář-specifické typy (rozšíření)
export type ViewMode = 'day' | 'week' | 'month'

export interface CalendarStats {
  totalBookings: number
  totalRevenue: number
  freeSlots: number
  workingStaff: number
}

export interface StaffSummary {
  id: string
  full_name: string
  count: number
  revenue: number
}

export interface BookingFormState {
  service: string
  staff: string
  name: string
  phone: string
  phonePrefix: string
  email: string
  note: string
}

export interface ModalStack {
  quickBook: { date: string; time: string } | null
  slotBookings: { date: string; time?: string; bookings: any[] } | null
  bookingDetail: any | null
  cancelConfirm: { id: string; name: string } | null
}

// Typy specifické pro kalendářové views
export interface TimeSlotState {
  date: string
  time: string
  bookings: any[]
  isAvailable: boolean
}
