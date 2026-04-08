import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('key') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // INK Masters booking flow check
  const orgId = 'c65aa56b-eeb8-4d01-870b-e7a225aeff0f'
  
  const [services, staff, wh] = await Promise.all([
    supabase.from('services').select('id,name,duration,active,visibility').eq('organization_id', orgId),
    supabase.from('staff').select('id,full_name,active').eq('organization_id', orgId),
    supabase.from('staff_working_hours').select('*').eq('organization_id', orgId),
  ])

  // Taky zkus public booking API - simuluj GET request
  const bookingApiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/public/booking?slug=ink-masters-studio`
  let bookingApiResult: any = null
  try {
    const res = await fetch(bookingApiUrl)
    bookingApiResult = await res.json()
  } catch (e: any) {
    bookingApiResult = { error: e.message }
  }

  return NextResponse.json({
    ink_masters: {
      services: services.data,
      staff: staff.data,
      working_hours: wh.data,
    },
    booking_api_response: bookingApiResult,
  })
}
