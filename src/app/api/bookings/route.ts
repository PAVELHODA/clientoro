// src/app/api/bookings/route.ts
import { createServerSupabase } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    // 1. Ověř session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Získej org_id z memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1);

    if (membershipError || !memberships?.length) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    const orgId = memberships[0].org_id;

    // 3. Fetch bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(
        `
        id,
        client_id,
        service_id,
        staff_id,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        clients(id, first_name, last_name, email, phone),
        services(id, name, duration),
        staff(id, first_name, last_name)
      `
      )
      .eq('org_id', orgId)
      .order('start_time', { ascending: false });

    if (bookingsError) {
      console.error('[Bookings API] Error:', bookingsError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bookings || [],
      count: bookings?.length || 0,
    });
  } catch (error) {
    console.error('[Bookings API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
