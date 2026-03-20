// PATH: middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const path = request.nextUrl.pathname

  // Public pages — no auth required
  const isPublicPage =
    path === '/' ||
    path.startsWith('/book/') ||
    path.startsWith('/privacy') ||
    path.startsWith('/terms')

  const isAuthPage =
    path.startsWith('/login') ||
    path.startsWith('/register')

  const isOnboarding = path.startsWith('/onboarding')

  if (isPublicPage) {
    if (session && path === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  if (isAuthPage) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  if (isOnboarding) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // Protected pages — auth required
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|icons|manifest).*)'],
}
