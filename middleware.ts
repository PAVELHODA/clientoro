import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ⚠️ DEMO MODE - JEN ADMIN@CLIENTORO.PRO PROJDE

  // Public pages — všichni vidí
  if (
    pathname === '/' ||
    pathname.startsWith('/book/') ||
    pathname.startsWith('/booking/manage') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/login')
  ) {
    return NextResponse.next()
  }

  // Všechno ostatní — zkontroluj auth cookie
  const authCookie = request.cookies.get('sb-auth-token')?.value
  
  if (!authCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|public|assets).*)',
  ],
}