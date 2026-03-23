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

const optionalEmail = z.string()
  .email('Neplatný email')
  .nullable()
  .optional()
  .or(z.literal(''))

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
  organization_id: uuid,
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
})

export const bookingUpdateSchema = bookingCreateSchema.partial().extend({
  id: uuid,
})

// ============================================================
// CLIENTS
// ============================================================

export const clientCreateSchema = z.object({
  organization_id: uuid,
  full_name: sanitizedString(100).pipe(z.string().min(1, 'Jméno je povinné')),
  phone: phone.optional().or(z.literal('')),
  email: optionalEmail,
  note: optionalSanitizedString(2000),
  tags: z.array(z.string().max(50)).max(20).optional(),
  birthday: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Neplatný formát data')
    .nullable()
    .optional(),
  source: optionalSanitizedString(50),
})

export const clientUpdateSchema = clientCreateSchema.partial().extend({
  id: uuid,
})

// ============================================================
// SERVICES
// ============================================================

export const serviceCreateSchema = z.object({
  organization_id: uuid,
  name: sanitizedString(100).pipe(z.string().min(1, 'Název je povinný')),
  duration: duration,
  price: price,
  color: color,
  category: optionalSanitizedString(100),
  description: optionalSanitizedString(1000),
  visibility: z.enum(['public', 'private']).optional().default('public'),
  active: z.boolean().optional().default(true),
  sort_order: z.number().int().min(0).max(9999).optional(),
})

export const serviceUpdateSchema = serviceCreateSchema.partial().extend({
  id: uuid,
})

// ============================================================
// STAFF
// ============================================================

export const staffCreateSchema = z.object({
  organization_id: uuid,
  full_name: sanitizedString(100).pipe(z.string().min(1, 'Jméno je povinné')),
  email: optionalEmail,
  phone: phone.optional().or(z.literal('')),
  role: z.enum(['staff', 'manager']).optional().default('staff'),
  color: color,
  position: optionalSanitizedString(100),
  active: z.boolean().optional().default(true),
})

export const staffUpdateSchema = staffCreateSchema.partial().extend({
  id: uuid,
})

// ============================================================
// STAFF WORKING HOURS
// ============================================================

export const staffWorkingHoursSchema = z.object({
  staff_id: uuid,
  weekday: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Neplatný formát času'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Neplatný formát času'),
})

// ============================================================
// SETTINGS
// ============================================================

export const settingsUpdateSchema = z.object({
  name: sanitizedString(200).optional(),
  slug: slug.optional(),
  phone: phone.optional().or(z.literal('')),
  email: optionalEmail,
  address: optionalSanitizedString(300),
  website: optionalSanitizedString(200),
  description: optionalSanitizedString(2000),
  work_start: z.number().int().min(0).max(23).optional(),
  work_end: z.number().int().min(1).max(24).optional(),
  ico: z.string().max(20).optional().or(z.literal('')),
  dic: z.string().max(20).optional().or(z.literal('')),
  mode: z.enum(['solo', 'team', 'solo_inspire', 'pro_inspire']).optional(),
})

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
})

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
  const errorMsg = 'error' in result
    ? (result as any).error?.issues?.map((i: any) => i.message).join(', ') || 'Neplatná data'
    : 'Neplatná data'
  return { success: false, data: null, error: errorMsg }
}
