// PATH: src/app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/api/supabaseAdmin'
import { exchangeCodeForTokens, getGoogleEmail } from '@/lib/googleCalendar'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // organizationId
    const error = searchParams.get('error')

    if (error) {
      console.error('[gcal-callback] OAuth error:', error)
      return NextResponse.redirect(new URL('/settings?gcal=denied', request.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/settings?gcal=error', request.url))
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    if (!tokens.refresh_token) {
      console.error('[gcal-callback] No refresh token received')
      return NextResponse.redirect(new URL('/settings?gcal=error', request.url))
    }

    // Get Google email
    const googleEmail = await getGoogleEmail(tokens.access_token)

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Upsert token (pokud už existuje, přepiš)
    const { error: dbError } = await supabaseAdmin
      .from('google_calendar_tokens')
      .upsert({
        organization_id: state,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        google_email: googleEmail,
        calendar_id: 'primary',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id',
      })

    if (dbError) {
      console.error('[gcal-callback] DB error:', dbError)
      return NextResponse.redirect(new URL('/settings?gcal=error', request.url))
    }

    console.log('[gcal-callback] Connected:', googleEmail, 'for org:', state)
    return NextResponse.redirect(new URL('/settings?gcal=connected', request.url))
  } catch (err) {
    console.error('[gcal-callback] Error:', err)
    return NextResponse.redirect(new URL('/settings?gcal=error', request.url))
  }
}
