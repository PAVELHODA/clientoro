import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
});

// Clientoro pricing plans
export const PLANS = {
  osvc: {
    name: 'OSVČ',
    slug: 'osvc',
    monthlyPrice: 49,
    monthlyPriceAI: 99,
    limits: {
      bookingsPerMonth: 50,
      clients: 100,
      staff: 1,
      campaigns: 0,
    },
    features: ['calendar', 'booking_page', 'crm_basic', 'email_notifications'],
  },
  firma: {
    name: 'FIRMA',
    slug: 'firma',
    monthlyPrice: 299,
    monthlyPriceAI: 499,
    limits: {
      bookingsPerMonth: -1, // unlimited
      clients: -1,
      staff: 5, // owner + 4
      campaigns: 0,
    },
    features: ['calendar', 'booking_page', 'crm_basic', 'email_notifications', 'staff_management', 'google_calendar', 'reports_basic'],
  },
  solo_inspire: {
    name: 'SOLO INSPIRE',
    slug: 'solo_inspire',
    monthlyPrice: 499,
    monthlyPriceAI: 799,
    limits: {
      bookingsPerMonth: -1,
      clients: -1,
      staff: 1,
      campaigns: 5,
    },
    features: ['calendar', 'booking_page', 'crm_basic', 'email_notifications', 'ai_insights', 'ai_dead_hours', 'growth_reports', 'campaigns', 'referral'],
  },
  pro_inspire: {
    name: 'PRO INSPIRE',
    slug: 'pro_inspire',
    monthlyPrice: 1299,
    monthlyPriceAI: 1999,
    limits: {
      bookingsPerMonth: -1,
      clients: -1,
      staff: 25, // owner + 24
      campaigns: -1,
    },
    features: ['calendar', 'booking_page', 'crm_basic', 'email_notifications', 'staff_management', 'google_calendar', 'reports_basic', 'ai_insights', 'ai_dead_hours', 'ai_copilot', 'growth_reports', 'campaigns', 'referral', 'reports_staff'],
  },
} as const;

export type PlanSlug = keyof typeof PLANS;

export const TRIAL_DAYS = 14;

// Check if org has active subscription or trial
export function getSubscriptionStatus(org: {
  subscription_status?: string | null;
  trial_ends_at?: string | null;
  plan_slug?: string | null;
}): {
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  plan: PlanSlug;
  daysLeft: number | null;
} {
  const now = new Date();
  const trialEnd = org.trial_ends_at ? new Date(org.trial_ends_at) : null;
  const status = org.subscription_status;
  const plan = (org.plan_slug as PlanSlug) || 'osvc';

  // Active paid subscription
  if (status === 'active' || status === 'trialing') {
    return { isActive: true, isTrial: status === 'trialing', isExpired: false, plan, daysLeft: null };
  }

  // Free trial (no Stripe subscription yet)
  if (!status && trialEnd) {
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0) {
      return { isActive: true, isTrial: true, isExpired: false, plan, daysLeft };
    }
    return { isActive: false, isTrial: false, isExpired: true, plan, daysLeft: 0 };
  }

  // Past due, canceled, etc.
  if (status === 'past_due') {
    return { isActive: true, isTrial: false, isExpired: false, plan, daysLeft: null }; // grace period
  }

  return { isActive: false, isTrial: false, isExpired: true, plan, daysLeft: 0 };
}

// Check if org can use a specific feature
export function canUseFeature(
  org: { plan_slug?: string | null; subscription_status?: string | null; trial_ends_at?: string | null },
  feature: string
): boolean {
  const { isActive, plan } = getSubscriptionStatus(org);
  if (!isActive) return false;
  
  const planConfig = PLANS[plan];
  if (!planConfig) return false;
  
  return (planConfig.features as readonly string[]).includes(feature);
}

// Check if org is within limits
export function checkLimit(
  org: { plan_slug?: string | null; subscription_status?: string | null; trial_ends_at?: string | null },
  limitKey: 'bookingsPerMonth' | 'clients' | 'staff' | 'campaigns',
  currentCount: number
): { allowed: boolean; limit: number; current: number } {
  const { isActive, plan } = getSubscriptionStatus(org);
  if (!isActive) return { allowed: false, limit: 0, current: currentCount };
  
  const planConfig = PLANS[plan];
  if (!planConfig) return { allowed: false, limit: 0, current: currentCount };
  
  const limit = planConfig.limits[limitKey];
  if (limit === -1) return { allowed: true, limit: -1, current: currentCount }; // unlimited
  
  return { allowed: currentCount < limit, limit, current: currentCount };
}
