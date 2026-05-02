import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pokud jdeš na public stránky → OK
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/book') ||
    pathname.startsWith('/booking/manage') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  ) {
    return NextResponse.next()
  }

  // Všechno ostatní — zkontroluj auth cookie
  const authCookie = request.cookies.get('sb-auth-token')

  if (!authCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
