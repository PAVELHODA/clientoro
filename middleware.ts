import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Jen landing page / je veřejná
  // Všechno ostatní → 404
  return NextResponse.next()
}