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
  const isAuthPage = path.startsWith('/login') || path.startsWith('/register')
  const isPublicPage = path.match(/^\/[a-z0-9-]+$/) && !path.startsWith('/api')

  if (!session && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/calendar', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
