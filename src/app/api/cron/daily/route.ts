// PATH: src/app/api/cron/daily/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import {
  sendBookingReminder,
  sendBookingFollowup,
  sendOwnerDailySummary,
  sendWeeklyReport,
  sendSuperadminCronSummary,
  sendReviewRequest,
} from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
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
    reviews: { sent: 0, skipped: 0, errors: 0, details: [] as string[] },
    weeklyReports: { sent: 0, skipped: 0, errors: 0, details: [] as string[] },
  }

  try {
    // ========================================
    // 1. PRIPOMINKY (dynamicke reminder_hours)
    // ========================================
    // Najdi vĹˇechny organizace s reminders
    const { data: reminderOrgs } = await supabaseAdmin
      .from('organizations')
      .select('id, name, phone, address, slug, reminder_enabled, reminder_hours')
      .eq('reminder_enabled', true)

    const allReminderBookings: any[] = []

    if (reminderOrgs) {
      for (const org of reminderOrgs) {
        const hours = org.reminder_hours || 24
        const windowStart = new Date(now.getTime() + (hours - 0.5) * 60 * 60 * 1000)
        const windowEnd = new Date(now.getTime() + (hours + 0.5) * 60 * 60 * 1000)

        const { data: bookings } = await supabaseAdmin
          .from('bookings')
          .select(`
            id, start_at, end_at, customer_name, customer_email, customer_phone, price,
            reminder_sent, organization_id,
            services (id, name, duration, price),
            staff (id, full_name)
          `)
          .eq('organization_id', org.id)
          .eq('status', 'confirmed')
          .eq('reminder_sent', false)
          .gte('start_at', windowStart.toISOString())
          .lte('start_at', windowEnd.toISOString())

        if (bookings && bookings.length > 0) {
          for (const booking of bookings) {
            const email = booking.customer_email
            if (!email) { results.reminders.skipped++; continue }

            const startDate = new Date(booking.start_at)
            const date = startDate.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            const time = startDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })

            try {
              await sendBookingReminder({
                to: email,
                customerName: booking.customer_name || 'Klient',
                serviceName: (booking.services as any)?.name || 'SluĹľba',
                staffName: (booking.staff as any)?.full_name,
                date, time,
                orgName: org.name,
                orgPhone: org.phone,
                orgAddress: org.address,
              })

              await supabaseAdmin
                .from('bookings')
                .update({ reminder_sent: true })
                .eq('id', booking.id)

              results.reminders.sent++
              results.reminders.details.push(`${org.name}: ${booking.customer_name} (${email})`)
              allReminderBookings.push({ ...booking, organizations: org })
            } catch (err) {
              results.reminders.errors++
              console.error('[cron/reminder]', booking.id, err)
            }
          }
        }
      }
    }

    // ========================================
    // Otevrene + teprve dokoncene rezervace
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
        if (!org?.followup_enabled) { results.followups.skipped++; continue }

        const email = booking.customer_email
        if (!email) { results.followups.skipped++; continue }

        const bookingUrl = `https://clientoro.pro/book/${org.slug}`

        try {
          await sendBookingFollowup({
            to: email,
            customerName: booking.customer_name || 'Klient',
            serviceName: (booking.services as any)?.name || 'SluĹľba',
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
    // 2 dny po navsteve
    // ========================================
    const twoDaysAgo = new Date(now)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const twoDaysAgoStart = new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 0, 0, 0).toISOString()
    const twoDaysAgoEnd = new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 23, 59, 59).toISOString()

    const { data: reviewBookings } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, start_at, customer_name, customer_email, organization_id,
        review_sent, followup_sent,
        services (id, name),
        staff (id, full_name),
        organizations!inner (id, name, slug, review_request_enabled, google_review_url)
      `)
      .in('status', ['confirmed', 'completed'])
      .eq('review_sent', false)
      .eq('followup_sent', true)
      .gte('start_at', twoDaysAgoStart)
      .lte('start_at', twoDaysAgoEnd)

    if (reviewBookings && reviewBookings.length > 0) {
      for (const booking of reviewBookings) {
        const org = booking.organizations as any
        if (!org?.review_request_enabled) { results.reviews.skipped++; continue }

        const email = booking.customer_email
        if (!email) { results.reviews.skipped++; continue }

        const reviewUrl = org.google_review_url || `https://clientoro.pro/book/${org.slug}`

        try {
          await sendReviewRequest({
            to: email,
            customerName: booking.customer_name || 'Klient',
            orgName: org.name,
            staffName: (booking.staff as any)?.full_name,
            googleReviewUrl: reviewUrl,
            bookingUrl: `https://clientoro.pro/book/${org.slug}`,
          })

          await supabaseAdmin
            .from('bookings')
            .update({ review_sent: true })
            .eq('id', booking.id)

          results.reviews.sent++
          results.reviews.details.push(`${org.name}: ${booking.customer_name} (${email})`)
        } catch (err) {
          results.reviews.errors++
          console.error('[cron/review]', booking.id, err)
        }
      }
    }

    // ========================================
    // 4. DENNI SOUHRN PRO MAJITELE -- co je zitra
    // ========================================
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0).toISOString()
    const tomorrowEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59).toISOString()

    // Najdi zitrejsi bookings pro kazdou org
    const { data: tomorrowBookings } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, start_at, customer_name, price, organization_id,
        services (id, name, price),
        staff (id, full_name),
        organizations!inner (id, name, reminder_enabled)
      `)
      .eq('status', 'confirmed')
      .gte('start_at', tomorrowStart)
      .lte('start_at', tomorrowEnd)

    if (tomorrowBookings && tomorrowBookings.length > 0) {
      const orgMap = new Map<string, { org: any; bookings: any[] }>()

      for (const booking of tomorrowBookings) {
        const org = booking.organizations as any
        if (!org?.reminder_enabled) continue
        if (!orgMap.has(org.id)) {
          orgMap.set(org.id, { org, bookings: [] })
        }
        orgMap.get(org.id)!.bookings.push(booking)
      }

      for (const [orgId, { org, bookings }] of orgMap) {
        const { data: owner } = await supabaseAdmin
          .from('profiles')
          .select('email')
          .eq('organization_id', orgId)
          .eq('role', 'owner')
          .single()

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
            firstTime, lastTime, totalRevenue,
            bookings: sortedBookings.map((b: any) => ({
              time: new Date(b.start_at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
              customerName: b.customer_name || 'Klient',
              serviceName: (b.services as any)?.name || 'SluĹľba',
              staffName: (b.staff as any)?.full_name,
            })),
          })
        } catch (err) {
          console.error('[cron/owner-summary]', orgId, err)
        }
      }
    }

    // ========================================
    // 5. TYDENNI REPORT (pondeli)
    // ========================================
    const dayOfWeek = now.getUTCDay()
    if (dayOfWeek === 1) {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data: orgs } = await supabaseAdmin
        .from('organizations')
        .select('id, name, email, slug')
        .eq('weekly_report_enabled', true)

      if (orgs) {
        for (const org of orgs) {
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

          const { data: owner } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('organization_id', org.id)
            .eq('role', 'owner')
            .single()

          const ownerEmail = owner?.email || org.email
          if (!ownerEmail) { results.weeklyReports.skipped++; continue }

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
            results.weeklyReports.details.push(`${org.name} â†’ ${ownerEmail}`)
          } catch (err) {
            results.weeklyReports.errors++
            console.error('[cron/weekly]', org.id, err)
          }
        }
      }
    }

    // ========================================
    // 6. SUPERADMIN SOUHRN
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
        reviews: { sent: results.reviews.sent, skipped: results.reviews.skipped, errors: results.reviews.errors },
        weeklyReports: { sent: results.weeklyReports.sent, skipped: results.weeklyReports.skipped, errors: results.weeklyReports.errors },
      },
    })
  } catch (err) {
    console.error('[cron/daily] Fatal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
