// PATH: src/lib/googleCalendar.ts
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'

function getEnv() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
  }
}

// ===== OAuth URL =====
export function getGoogleAuthUrl(state: string) {
  const env = getEnv()
  const params = new URLSearchParams({
    client_id: env.clientId,
    redirect_uri: env.redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email',
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// ===== Exchange code for tokens =====
export async function exchangeCodeForTokens(code: string) {
  const env = getEnv()
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.clientId,
      client_secret: env.clientSecret,
      redirect_uri: env.redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Google token exchange failed: ${JSON.stringify(err)}`)
  }
  return res.json() as Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
  }>
}

// ===== Refresh token =====
async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const env = getEnv()
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: env.clientId,
      client_secret: env.clientSecret,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error('Failed to refresh Google token')
  return res.json()
}

// ===== Get valid access token for org =====
async function getAccessToken(organizationId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('google_calendar_tokens')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (!data) return null

  const now = new Date()
  const expiresAt = new Date(data.token_expires_at)

  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return data.access_token
  }

  try {
    const refreshed = await refreshAccessToken(data.refresh_token)
    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000)

    await supabaseAdmin
      .from('google_calendar_tokens')
      .update({
        access_token: refreshed.access_token,
        token_expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', organizationId)

    return refreshed.access_token
  } catch (err) {
    console.error('[gcal] Token refresh failed:', err)
    return null
  }
}

// ===== Get Google email =====
export async function getGoogleEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.email || null
  } catch {
    return null
  }
}

// ===== Create calendar event =====
export async function createCalendarEvent(organizationId: string, booking: {
  id: string
  serviceName: string
  staffName?: string
  customerName: string
  customerPhone?: string
  startAt: string
  endAt: string
  orgName: string
  address?: string
}): Promise<string | null> {
  const accessToken = await getAccessToken(organizationId)
  if (!accessToken) return null

  const { data: tokenData } = await supabaseAdmin
    .from('google_calendar_tokens')
    .select('calendar_id')
    .eq('organization_id', organizationId)
    .single()

  const calendarId = tokenData?.calendar_id || 'primary'

  const event = {
    summary: `${booking.serviceName} — ${booking.customerName}`,
    description: [
      `Klient: ${booking.customerName}`,
      booking.customerPhone ? `Telefon: ${booking.customerPhone}` : null,
      booking.staffName ? `Specialista: ${booking.staffName}` : null,
      `Rezervace přes Clientoro`,
    ].filter(Boolean).join('\n'),
    location: booking.address || undefined,
    start: {
      dateTime: booking.startAt,
      timeZone: 'Europe/Prague',
    },
    end: {
      dateTime: booking.endAt,
      timeZone: 'Europe/Prague',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
      ],
    },
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      console.error('[gcal] Create event failed:', err)
      return null
    }

    const data = await res.json()
    console.log('[gcal] Event created:', data.id)

    await supabaseAdmin
      .from('bookings')
      .update({ gcal_event_id: data.id })
      .eq('id', booking.id)

    return data.id
  } catch (err) {
    console.error('[gcal] Create event error:', err)
    return null
  }
}

// ===== Delete calendar event =====
export async function deleteCalendarEvent(organizationId: string, gcalEventId: string): Promise<boolean> {
  const accessToken = await getAccessToken(organizationId)
  if (!accessToken) return false

  const { data: tokenData } = await supabaseAdmin
    .from('google_calendar_tokens')
    .select('calendar_id')
    .eq('organization_id', organizationId)
    .single()

  const calendarId = tokenData?.calendar_id || 'primary'

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(gcalEventId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (res.ok || res.status === 404) {
      console.log('[gcal] Event deleted:', gcalEventId)
      return true
    }

    console.error('[gcal] Delete event failed:', res.status)
    return false
  } catch (err) {
    console.error('[gcal] Delete event error:', err)
    return false
  }
}

// ===== Check if org has Google Calendar connected =====
export async function isGcalConnected(organizationId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('google_calendar_tokens')
    .select('id')
    .eq('organization_id', organizationId)
    .single()
  return !!data
}

// ===== Disconnect =====
export async function disconnectGcal(organizationId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('google_calendar_tokens')
    .delete()
    .eq('organization_id', organizationId)
  return !error
}
