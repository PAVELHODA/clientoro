// PATH: src/app/api/cron/daily/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import {
  sendBookingReminder,
  sendBookingFollowup,
  sendOwnerDailySummary,
  sendWeeklyReport,
  sendSuperadminCronSummary,
} from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // Vercel timeout 30s

export async function GET(request: NextRequest) {
  // 1. Bezpečnost — ověř CRON_SECRET nebo superadmin
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Vercel posílá Bearer token, nebo můžeš volat ručně s ?secret=xxx
  const urlSecret = new URL(request.url).searchParams.get('secret')

  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && urlSecret === cronSecret)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const results = {
    reminders: { sent: 0, skipped: 0, errors: 0, details: [] as string[] },
    followups: { sent: 0, skipped: 0, errors: 0, details: [] as string[] },
    weeklyReports: { sent: 0, skipped: 0, errors: 0, details: [] as string[] },
  }

  try {
    // ========================================
    // 2. PŘIPOMÍNKY — zítřejší rezervace
    // ========================================
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0).toISOString()
    const tomorrowEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59).toISOString()

    const { data: reminderBookings } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, start_at, end_at, customer_name, customer_email, customer_phone, price,
        reminder_sent, organization_id,
        services (id, name, duration, price),
        staff (id, full_name),
        organizations!inner (id, name, phone, address, reminder_enabled, slug)
      `)
      .eq('status', 'confirmed')
      .eq('reminder_sent', false)
      .gte('start_at', tomorrowStart)
      .lte('start_at', tomorrowEnd)

    if (reminderBookings && reminderBookings.length > 0) {
      for (const booking of reminderBookings) {
        const org = booking.organizations as any
        if (!org?.reminder_enabled) {
          results.reminders.skipped++
          continue
        }

        const email = booking.customer_email
        if (!email) {
          results.reminders.skipped++
          continue
        }

        const startDate = new Date(booking.start_at)
        const date = startDate.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        const time = startDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })

        try {
          await sendBookingReminder({
            to: email,
            customerName: booking.customer_name || 'Klient',
            serviceName: (booking.services as any)?.name || 'Služba',
            staffName: (booking.staff as any)?.full_name,
            date,
            time,
            orgName: org.name,
            orgPhone: org.phone,
            orgAddress: org.address,
          })

          // Označ jako odesláno
          await supabaseAdmin
            .from('bookings')
            .update({ reminder_sent: true })
            .eq('id', booking.id)

          results.reminders.sent++
          results.reminders.details.push(`${org.name}: ${booking.customer_name} (${email})`)
        } catch (err) {
          results.reminders.errors++
          console.error('[cron/reminder]', booking.id, err)
        }
      }
    }

    // ========================================
    // 3. FOLLOW-UP — včerejší dokončené rezervace
    // ========================================
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0).toISOString()
    const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59).toISOString()

    const { data: followupBookings } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, start_at, end_at, customer_name, customer_email, customer_phone, price,
        followup_sent, organization_id,
        services (id, name, duration, price),
        staff (id, full_name),
        organizations!inner (id, name, phone, address, followup_enabled, slug)
      `)
      .in('status', ['confirmed', 'completed'])
      .eq('followup_sent', false)
      .gte('start_at', yesterdayStart)
      .lte('start_at', yesterdayEnd)

    if (followupBookings && followupBookings.length > 0) {
      for (const booking of followupBookings) {
        const org = booking.organizations as any
        if (!org?.followup_enabled) {
          results.followups.skipped++
          continue
        }

        const email = booking.customer_email
        if (!email) {
          results.followups.skipped++
          continue
        }

        const bookingUrl = `https://clientoro.pro/book/${org.slug}`

        try {
          await sendBookingFollowup({
            to: email,
            customerName: booking.customer_name || 'Klient',
            serviceName: (booking.services as any)?.name || 'Služba',
            staffName: (booking.staff as any)?.full_name,
            orgName: org.name,
            orgPhone: org.phone,
            bookingUrl,
          })

          await supabaseAdmin
            .from('bookings')
            .update({ followup_sent: true })
            .eq('id', booking.id)

          results.followups.sent++
          results.followups.details.push(`${org.name}: ${booking.customer_name} (${email})`)
        } catch (err) {
          results.followups.errors++
          console.error('[cron/followup]', booking.id, err)
        }
      }
    }

    // ========================================
    // 4. DENNÍ SOUHRN PRO MAJITELE — co je zítra
    // ========================================
    // Seskupíme zítřejší rezervace per organizace a pošleme majiteli
    if (reminderBookings && reminderBookings.length > 0) {
      const orgMap = new Map<string, { org: any; bookings: any[] }>()

      for (const booking of reminderBookings) {
        const org = booking.organizations as any
        if (!org?.reminder_enabled) continue
        if (!orgMap.has(org.id)) {
          orgMap.set(org.id, { org, bookings: [] })
        }
        orgMap.get(org.id)!.bookings.push(booking)
      }

      for (const [orgId, { org, bookings }] of orgMap) {
        // Najdi majitele
        const { data: owner } = await supabaseAdmin
          .from('profiles')
          .select('email')
          .eq('organization_id', orgId)
          .eq('role', 'owner')
          .single()

        // Fallback: email z organizations
        const { data: orgData } = await supabaseAdmin
          .from('organizations')
          .select('email')
          .eq('id', orgId)
          .single()

        const ownerEmail = owner?.email || orgData?.email
        if (!ownerEmail) continue

        const sortedBookings = bookings.sort(
          (a: any, b: any) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
        )
        const firstTime = new Date(sortedBookings[0].start_at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
        const lastTime = new Date(sortedBookings[sortedBookings.length - 1].start_at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
        const totalRevenue = sortedBookings.reduce((sum: number, b: any) => sum + ((b.services as any)?.price || b.price || 0), 0)

        try {
          await sendOwnerDailySummary({
            to: ownerEmail,
            orgName: org.name,
            tomorrowDate: tomorrow.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' }),
            bookingsCount: sortedBookings.length,
            firstTime,
            lastTime,
            totalRevenue,
            bookings: sortedBookings.map((b: any) => ({
              time: new Date(b.start_at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
              customerName: b.customer_name || 'Klient',
              serviceName: (b.services as any)?.name || 'Služba',
              staffName: (b.staff as any)?.full_name,
            })),
          })
        } catch (err) {
          console.error('[cron/owner-summary]', orgId, err)
        }
      }
    }

    // ========================================
    // 5. TÝDENNÍ REPORT — jen v pondělí
    // ========================================
    const dayOfWeek = now.getUTCDay() // 0=neděle, 1=pondělí
    if (dayOfWeek === 1) {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)

      // Najdi všechny organizace s weekly_report_enabled
      const { data: orgs } = await supabaseAdmin
        .from('organizations')
        .select('id, name, email, slug')
        .eq('weekly_report_enabled', true)

      if (orgs) {
        for (const org of orgs) {
          // Statistiky za minulý týden
          const { data: weekBookings } = await supabaseAdmin
            .from('bookings')
            .select('id, status, price, start_at, services(price)')
            .eq('organization_id', org.id)
            .gte('start_at', weekAgo.toISOString())
            .lte('start_at', now.toISOString())

          if (!weekBookings || weekBookings.length === 0) {
            results.weeklyReports.skipped++
            continue
          }

          const total = weekBookings.length
          const completed = weekBookings.filter((b: any) => b.status === 'completed' || b.status === 'confirmed').length
          const cancelled = weekBookings.filter((b: any) => b.status === 'cancelled').length
          const noShow = weekBookings.filter((b: any) => b.status === 'no_show').length
          const revenue = weekBookings
            .filter((b: any) => b.status !== 'cancelled' && b.status !== 'no_show')
            .reduce((sum: number, b: any) => sum + ((b.services as any)?.price || b.price || 0), 0)

          // Najdi majitele
          const { data: owner } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('organization_id', org.id)
            .eq('role', 'owner')
            .single()

          const ownerEmail = owner?.email || org.email
          if (!ownerEmail) {
            results.weeklyReports.skipped++
            continue
          }

          try {
            await sendWeeklyReport({
              to: ownerEmail,
              orgName: org.name,
              weekStart: weekAgo.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }),
              weekEnd: now.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }),
              totalBookings: total,
              completedBookings: completed,
              cancelledBookings: cancelled,
              noShowBookings: noShow,
              revenue,
              dashboardUrl: `https://clientoro.pro/dashboard`,
            })

            results.weeklyReports.sent++
            results.weeklyReports.details.push(`${org.name} → ${ownerEmail}`)
          } catch (err) {
            results.weeklyReports.errors++
            console.error('[cron/weekly]', org.id, err)
          }
        }
      }
    }

    // ========================================
    // 6. SUPERADMIN SOUHRN — vždy
    // ========================================
    const superadminEmail = process.env.SUPERADMIN_EMAIL || 'atom369@centrum.cz'
    try {
      await sendSuperadminCronSummary({
        to: superadminEmail,
        timestamp: now.toLocaleString('cs-CZ'),
        results,
      })
    } catch (err) {
      console.error('[cron/superadmin-summary]', err)
    }

    return NextResponse.json({
      ok: true,
      timestamp: now.toISOString(),
      results: {
        reminders: { sent: results.reminders.sent, skipped: results.reminders.skipped, errors: results.reminders.errors },
        followups: { sent: results.followups.sent, skipped: results.followups.skipped, errors: results.followups.errors },
        weeklyReports: { sent: results.weeklyReports.sent, skipped: results.weeklyReports.skipped, errors: results.weeklyReports.errors },
      },
    })
  } catch (err) {
    console.error('[cron/daily] Fatal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
