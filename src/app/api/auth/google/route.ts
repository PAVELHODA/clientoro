// PATH: src/app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { getGoogleAuthUrl } from '@/lib/googleCalendar'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'owner')
    if (!auth.authorized) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // State = organizationId (pro callback)
    const state = auth.organizationId
    console.log('[google-auth] GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI ? 'SET' : 'UNDEFINED')
    const authUrl = getGoogleAuthUrl(state)
    return NextResponse.redirect(authUrl)
  } catch (err) {
    console.error('[google-auth]', err)
    return NextResponse.redirect(new URL('/settings?gcal=error', request.url))
  }
}
