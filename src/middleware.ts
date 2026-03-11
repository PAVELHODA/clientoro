import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) { response.cookies.set({ name, value, ...options }) },
        remove(name: string, options: any) { response.cookies.set({ name, value: '', ...options }) },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const path = request.nextUrl.pathname

  const isAuthPage = path.startsWith('/login') || path.startsWith('/register')
  const isPublicPage = path.startsWith('/book/')

  // Public pages — no auth required
  if (isPublicPage) return response

  // Not logged in — redirect to login
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in on auth page — redirect to dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|icons|manifest).*)'],
}
