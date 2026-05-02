import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      today: { bookings: 0, revenue: 0 },
      week: { bookings: 0, revenue: 0 },
      month: { bookings: 0, revenue: 0 },
      totals: { clients: 0 }
    })
  } catch (err) {
    return NextResponse.json({
      today: { bookings: 0, revenue: 0 },
      week: { bookings: 0, revenue: 0 },
      month: { bookings: 0, revenue: 0 },
      totals: { clients: 0 }
    })
  }
}
