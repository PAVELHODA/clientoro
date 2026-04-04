import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const orgId = subscription.metadata.org_id;
          const planSlug = subscription.metadata.plan_slug;
          const withAI = subscription.metadata.with_ai === 'true';

          await supabase
            .from('organizations')
            .update({
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              plan_slug: planSlug,
              plan_with_ai: withAI,
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('id', orgId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata.org_id;

        if (orgId) {
          await supabase
            .from('organizations')
            .update({
              subscription_status: subscription.status,
              plan_slug: subscription.metadata.plan_slug,
              plan_with_ai: subscription.metadata.with_ai === 'true',
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('id', orgId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata.org_id;

        if (orgId) {
          await supabase
            .from('organizations')
            .update({
              subscription_status: 'canceled',
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('id', orgId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const orgId = subscription.metadata.org_id;

          if (orgId) {
            await supabase
              .from('organizations')
              .update({ subscription_status: 'past_due' })
              .eq('id', orgId);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Disable body parsing â€” Stripe needs raw body
export const runtime = 'nodejs';


