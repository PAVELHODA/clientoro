// PATH: middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route permissions: which minimum role is needed
const ROUTE_ROLES: Record<string, string> = {
  '/admin': 'superadmin',
  '/dev': 'superadmin',
  '/settings': 'owner',
  '/staff': 'owner',
  '/services': 'owner',
  '/growth': 'manager',
  '/reports': 'manager',
  '/ai': 'manager',
  '/dashboard': 'staff',
  '/calendar': 'staff',
  '/bookings': 'staff',
  '/clients': 'staff',
}

const ROLE_LEVEL: Record<string, number> = {
  staff: 10,
  manager: 20,
  owner: 30,
  superadmin: 100,
}

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

  // Public pages
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

  // Protected pages
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role check for protected routes
  const matchedRoute = Object.keys(ROUTE_ROLES)
    .sort((a, b) => b.length - a.length)
    .find(route => path === route || path.startsWith(route + '/'))

  if (matchedRoute) {
    const requiredRole = ROUTE_ROLES[matchedRoute]
    const requiredLevel = ROLE_LEVEL[requiredRole] || 10

    // Only check role if route requires more than staff
    if (requiredLevel > ROLE_LEVEL.staff) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, is_superadmin')
          .eq('auth_user_id', session.user.id)
          .single()

        if (!profile) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        let userRole = 'staff'

        if (profile.is_superadmin) {
          userRole = 'superadmin'
        } else {
          const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', profile.id)
            .limit(1)
            .single()

          if (membership) {
            userRole = membership.role || 'staff'
          }

          if (userRole === 'staff') {
            const { data: staffRecord } = await supabase
              .from('staff')
              .select('app_role')
              .eq('user_id', profile.id)
              .limit(1)
              .single()

            if (staffRecord?.app_role === 'manager') {
              userRole = 'manager'
            }
          }
        }

        const userLevel = ROLE_LEVEL[userRole] || 10
        if (userLevel < requiredLevel) {
          return NextResponse.redirect(new URL('/dashboard?access_denied=1', request.url))
        }
      } catch (err) {
        console.error('[Middleware] Role check error:', err)
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|icons|manifest).*)'],
}
