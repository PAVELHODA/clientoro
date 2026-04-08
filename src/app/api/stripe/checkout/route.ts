import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth';
import { createClient } from '@supabase/supabase-js';
import { stripe, PLANS, PlanSlug } from '@/lib/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, 'owner')
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const token = req.cookies.get('sb-access-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planSlug, withAI } = await req.json();
    
    if (!planSlug || !PLANS[planSlug as PlanSlug]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const plan = PLANS[planSlug as PlanSlug];
    const price = withAI ? plan.monthlyPriceAI : plan.monthlyPrice;

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, organizations(id, name, stripe_customer_id)')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const org = (membership as any).organizations;
    let customerId = org.stripe_customer_id;

    // Create Stripe customer if not exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.name,
        metadata: {
          org_id: org.id,
          user_id: user.id,
        },
      });
      customerId = customer.id;

      await supabase
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', org.id);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'czk',
            product_data: {
              name: `Clientoro ${plan.name}${withAI ? ' + AI' : ''}`,
              description: `Měsíční předplatné Clientoro ${plan.name}`,
            },
            unit_amount: price * 100, // Stripe uses cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          org_id: org.id,
          plan_slug: planSlug,
          with_ai: withAI ? 'true' : 'false',
        },
        trial_period_days: undefined, // No Stripe trial — we handle it ourselves
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=cancelled`,
      locale: 'cs',
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}