// PATH: src/lib/validations.ts
import { z } from 'zod'

// ============================================================
// SPOLEČNÉ VALIDÁTORY
// ============================================================

const phone = z.string()
  .min(1, 'Telefon je povinný')
  .regex(/^[\+]?[\d\s\-\(\)]{6,20}$/, 'Neplatný formát telefonu')

const email = z.string()
  .email('Neplatný email')

const optionalEmail = z.string().email('Neplatný email').optional().or(z.literal('')).or(z.null())
const uuid = z.string().uuid('Neplatné ID')

const optionalUuid = z.string().uuid('Neplatné ID').nullable().optional()

const isoDatetime = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'Neplatný formát data')

const slug = z.string()
  .min(1, 'Slug je povinný')
  .max(100, 'Slug je příliš dlouhý')
  .regex(/^[a-z0-9\-]+$/, 'Slug může obsahovat jen malá písmena, čísla a pomlčky')

const price = z.number()
  .min(0, 'Cena nemůže být záporná')
  .max(999999, 'Cena je příliš vysoká')
  .nullable()
  .optional()

const duration = z.number()
  .int('Délka musí být celé číslo')
  .min(5, 'Minimální délka je 5 minut')
  .max(480, 'Maximální délka je 8 hodin')

const color = z.string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Neplatná barva')
  .optional()
  .nullable()

const sanitizedString = (maxLength: number = 500) =>
  z.string()
    .max(maxLength, `Text je příliš dlouhý (max ${maxLength} znaků)`)
    .transform(val => val.trim())

const optionalSanitizedString = (maxLength: number = 500) =>
  z.string()
    .max(maxLength, `Text je příliš dlouhý (max ${maxLength} znaků)`)
    .transform(val => val.trim())
    .nullable()
    .optional()
    .or(z.literal(''))

// ============================================================
// PUBLIC BOOKING (veřejný endpoint — nejkritičtější)
// ============================================================

export const publicBookingGetSchema = z.object({
  slug: slug,
})

export const publicBookingPostSchema = z.object({
  slug: slug,
  service_id: uuid,
  staff_id: optionalUuid,
  start_at: isoDatetime,
  end_at: isoDatetime,
  customer_name: sanitizedString(100).pipe(z.string().min(1, 'Jméno je povinné')),
  customer_phone: phone,
  customer_email: optionalEmail,
  note: optionalSanitizedString(1000),
  price: price,
})

// ============================================================
// BOOKINGS (dashboard)
// ============================================================

export const bookingCreateSchema = z.object({
  service_id: uuid,
  staff_id: optionalUuid,
  client_id: optionalUuid,
  start_at: isoDatetime,
  end_at: isoDatetime,
  customer_name: sanitizedString(100).pipe(z.string().min(1, 'Jméno je povinné')),
  customer_phone: phone,
  customer_email: optionalEmail,
  note: optionalSanitizedString(1000),
  internal_note: optionalSanitizedString(1000),
  price: price,
  status: z.enum(['confirmed', 'completed', 'cancelled', 'no_show']).optional().default('confirmed'),
  source: z.enum(['manual', 'online', 'phone', 'walk_in', 'backfill']).optional().default('manual'),
  is_backfill: z.boolean().optional().default(false),
  backfill_note: optionalSanitizedString(500),
}).passthrough()

export const bookingUpdateSchema = bookingCreateSchema.partial().extend({
  id: uuid.optional(),
}).passthrough()

// ============================================================
// CLIENTS
// ============================================================

export const clientCreateSchema = z.object({
  full_name: sanitizedString(100).pipe(z.string().min(1, 'Jméno je povinné')).optional().or(z.literal('')).or(z.null()),
  phone: phone.optional().or(z.literal('')).or(z.null()),
  email: optionalEmail.or(z.null()),
  note: optionalSanitizedString(2000).or(z.null()),
  tags: z.array(z.string().max(50)).max(20).optional().nullable(),
  birthday: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Neplatný formát data')
    .nullable()
    .optional(),
  source: optionalSanitizedString(50).or(z.null()),
}).passthrough()

export const clientUpdateSchema = clientCreateSchema.partial().passthrough()

// ============================================================
// SERVICES
// ============================================================

export const serviceCreateSchema = z.object({
  name: sanitizedString(100).pipe(z.string().min(1, 'Název je povinný')),
  duration: duration.optional().default(60),
  price: price,
  color: color,
  category: optionalSanitizedString(100).or(z.null()),
  description: optionalSanitizedString(1000).or(z.null()),
  visibility: z.enum(['public', 'private']).optional().default('public'),
  active: z.boolean().optional().default(true),
  sort_order: z.number().int().min(0).max(9999).optional(),
  buffer_before_minutes: z.number().int().min(0).max(120).optional(),
  buffer_after_minutes: z.number().int().min(0).max(120).optional(),
}).passthrough()

export const serviceUpdateSchema = serviceCreateSchema.partial().passthrough()

// ============================================================
// STAFF (BEZ role — tabulka nemá sloupec role)
// ============================================================

export const staffCreateSchema = z.object({
  full_name: sanitizedString(100).pipe(z.string().min(1, 'Jméno je povinné')),
  email: optionalEmail.or(z.null()),
  phone: phone.optional().or(z.literal('')).or(z.null()),
  color: color,
  position: optionalSanitizedString(100).or(z.null()),
  active: z.boolean().optional().default(true),
}).passthrough()

export const staffUpdateSchema = staffCreateSchema.partial().passthrough()

// ============================================================
// STAFF WORKING HOURS
// ============================================================

export const staffWorkingHoursSchema = z.object({
  staff_id: uuid,
  weekday: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Neplatný formát času'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Neplatný formát času'),
}).passthrough()

// ============================================================
// SETTINGS — velmi flexibilní, frontend posílá různá pole
// ============================================================

export const settingsUpdateSchema = z.object({
  name: sanitizedString(200).optional(),
  slug: slug.optional(),
  phone: z.string().max(30).optional().or(z.literal('')).or(z.null()),
  email: optionalEmail.or(z.null()),
  address: optionalSanitizedString(300).or(z.null()),
  website: optionalSanitizedString(200).or(z.null()),
  description: optionalSanitizedString(2000).or(z.null()),
  work_start: z.number().int().min(0).max(23).optional(),
  work_end: z.number().int().min(1).max(24).optional(),
  slot_duration: z.number().int().min(5).max(240).optional(),
  ico: z.string().max(20).optional().or(z.literal('')).or(z.null()),
  dic: z.string().max(20).optional().or(z.literal('')).or(z.null()),
  mode: z.enum(['solo', 'team', 'solo_inspire', 'pro_inspire']).optional(),
  booking_link: z.string().max(100).optional().or(z.literal('')),
  category: z.string().max(200).optional().or(z.literal('')),
  onboarding_completed: z.boolean().optional(),
  timezone: z.string().max(50).optional(),
  city: optionalSanitizedString(100).or(z.null()),
  zip: z.string().max(20).optional().or(z.literal('')).or(z.null()),
  logo_url: z.string().max(500).optional().or(z.literal('')).or(z.null()),
  language: z.string().max(5).optional(),
    notification_email: z.string().max(200).optional().or(z.literal('')).or(z.null()),
  notify_on_booking: z.boolean().optional(),
  notify_on_cancel: z.boolean().optional(),
  reminder_enabled: z.boolean().optional(),
  reminder_hours_before: z.number().int().min(1).max(72).optional(),
  followup_enabled: z.boolean().optional(),
  review_request_enabled: z.boolean().optional(),
  google_review_url: z.string().max(500).optional().or(z.literal('')).or(z.null()),
  weekly_report_enabled: z.boolean().optional(),
  break_duration: z.number().int().min(0).max(120).optional(),
  break_start: z.string().max(10).optional().or(z.literal('')),
  work_days: z.any().optional(),
}).passthrough()

// ============================================================
// WAITLIST
// ============================================================

export const waitlistCreateSchema = z.object({
  organization_id: uuid,
  client_name: sanitizedString(100).pipe(z.string().min(1, 'Jméno je povinné')),
  phone: phone,
  service_id: optionalUuid,
  preferred_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Neplatný formát data')
    .nullable()
    .optional(),
}).passthrough()

// ============================================================
// HELPER: Validační funkce pro API routes
// ============================================================

export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data: T | null
  error: string | null
} {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data as T, error: null }
  }
  const errorMsg = result.error?.issues?.map((i: any) => {
    const path = i.path?.join('.') || ''
    return path ? `${path}: ${i.message}` : i.message
  }).join(', ') || 'Neplatná data'
  return { success: false, data: null, error: errorMsg }
}
