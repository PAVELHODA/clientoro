'use client'

import { useState, useEffect } from 'react'
import { Crown, Zap, Check, ArrowRight, Loader2, Clock, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react'
import { useToast } from '@/components/Toast'

const PLANS = [
  {
    slug: 'osvc',
    name: 'OSVÄŚ',
    desc: 'Pro podnikatele (1 osoba)',
    price: 49,
    priceAI: 99,
    popular: false,
    features: [
      'KalendĂˇĹ™ + booking strĂˇnka',
      'Rezervace (max 50/mÄ›s)',
      'Klienti CRM (max 100)',
      'Email notifikace',
    ],
    limits: '50 rezervacĂ­/mÄ›s Â· 100 klientĹŻ Â· 1 osoba',
  },
  {
    slug: 'firma',
    name: 'FIRMA',
    desc: 'Majitel + max 4 zamÄ›stnanci',
    price: 299,
    priceAI: 499,
    popular: true,
    features: [
      'VĹˇe z OSVÄŚ (neomezenÄ›)',
      'SprĂˇva tĂ˝mu + staff kalendĂˇĹ™',
      'Google Calendar sync',
      'Reporty per zamÄ›stnanec',
    ],
    limits: 'NeomezenĂ© rezervace Â· NeomezenĂ­ klienti Â· 5 osob',
  },
  {
    slug: 'solo_inspire',
    name: 'SOLO INSPIRE',
    desc: 'OSVÄŚ + AI a nĂˇstroje pro rĹŻst',
    price: 499,
    priceAI: 799,
    popular: false,
    features: [
      'VĹˇe z OSVÄŚ (neomezenÄ›)',
      'AI statistiky + insighty',
      'AI detekce mrtvĂ˝ch hodin',
      'Growth reporty',
      'KampanÄ› (5/mÄ›s)',
    ],
    limits: 'NeomezenĂ© Â· 1 osoba Â· 5 kampanĂ­/mÄ›s',
  },
  {
    slug: 'pro_inspire',
    name: 'PRO INSPIRE',
    desc: 'Majitel + max 24 zamÄ›stnancĹŻ',
    price: 1299,
    priceAI: 1999,
    popular: false,
    features: [
      'VĹˇe z Firmy + Solo Inspire',
      'AI Copilot (pokroÄŤilĂ˝)',
      'NeomezenĂ© kampanÄ›',
      'Reporty per staff',
    ],
    limits: 'NeomezenĂ© Â· 25 osob Â· NeomezenĂ© kampanÄ›',
  },
]

interface SubscriptionInfo {
  plan_slug: string
  plan_with_ai: boolean
  subscription_status: string | null
  trial_ends_at: string | null
  current_period_end: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

export default function SubscriptionSettings() {
  const toast = useToast()
  const [info, setInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [withAI, setWithAI] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setInfo({
          plan_slug: data.plan_slug || 'osvc',
          plan_with_ai: data.plan_with_ai || false,
          subscription_status: data.subscription_status,
          trial_ends_at: data.trial_ends_at,
          current_period_end: data.current_period_end,
          stripe_customer_id: data.stripe_customer_id,
          stripe_subscription_id: data.stripe_subscription_id,
        })
        setWithAI(data.plan_with_ai || false)
      }
    } catch {
      toast.error('NepodaĹ™ilo se naÄŤĂ­st informace o pĹ™edplatnĂ©m')
    } finally {
      setLoading(false)
    }
  }

  const getTrialDaysLeft = () => {
    if (!info?.trial_ends_at) return 0
    const now = new Date()
    const end = new Date(info.trial_ends_at)
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const handleCheckout = async (planSlug: string) => {
    setCheckoutLoading(planSlug)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug, withAI }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Chyba pĹ™i vytvĂˇĹ™enĂ­ platby')
      }
    } catch {
      toast.error('Chyba pĹ™i vytvĂˇĹ™enĂ­ platby')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Nejprve je potĹ™eba aktivovat pĹ™edplatnĂ©')
      }
    } catch {
      toast.error('Chyba pĹ™i otevĂ­rĂˇnĂ­ portĂˇlu')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const trialDays = getTrialDaysLeft()
  const isTrial = !info?.subscription_status && trialDays > 0
  const isActive = info?.subscription_status === 'active'
  const isPastDue = info?.subscription_status === 'past_due'
  const isCanceled = info?.subscription_status === 'canceled'
  const isExpired = !info?.subscription_status && trialDays <= 0
  const currentPlan = info?.plan_slug || 'osvc'

  return (
    <div className="space-y-6">
      {/* Status banner */}
      {isTrial && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              ZkuĹˇebnĂ­ obdobĂ­ â€” zbĂ˝vĂˇ {trialDays} {trialDays === 1 ? 'den' : trialDays < 5 ? 'dny' : 'dnĂ­'}
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              MĂˇte plnĂ˝ pĹ™Ă­stup ke vĹˇem funkcĂ­m. Po skonÄŤenĂ­ trialu vyberte plĂˇn.
            </p>
          </div>
        </div>
      )}

      {isActive && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">
              AktivnĂ­ pĹ™edplatnĂ© â€” {PLANS.find(p => p.slug === currentPlan)?.name}{info?.plan_with_ai ? ' + AI' : ''}
            </p>
            {info?.current_period_end && (
              <p className="text-xs text-emerald-700 mt-0.5">
                DalĹˇĂ­ platba: {new Date(info.current_period_end).toLocaleDateString('cs-CZ')}
              </p>
            )}
          </div>
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="ml-auto text-xs text-emerald-700 hover:text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
          >
            {portalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><ExternalLink className="w-3 h-3" /> Spravovat</>}
          </button>
        </div>
      )}

      {isPastDue && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Platba se nezdaĹ™ila</p>
            <p className="text-xs text-amber-700 mt-0.5">Aktualizujte platebnĂ­ Ăşdaje, jinak bude ĂşÄŤet pozastaven.</p>
          </div>
          <button onClick={handlePortal} disabled={portalLoading}
            className="ml-auto text-xs text-amber-700 hover:text-amber-900 bg-white px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1">
            {portalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Aktualizovat platbu'}
          </button>
        </div>
      )}

      {(isExpired || isCanceled) && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-900">
              {isCanceled ? 'PĹ™edplatnĂ© bylo zruĹˇeno' : 'ZkuĹˇebnĂ­ obdobĂ­ vyprĹˇelo'}
            </p>
            <p className="text-xs text-red-700 mt-0.5">Vyberte plĂˇn pro pokraÄŤovĂˇnĂ­.</p>
          </div>
        </div>
      )}

      {/* AI toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <div>
            <p className="text-sm font-semibold text-purple-900">AI funkce</p>
            <p className="text-xs text-purple-700">Insighty, detekce mrtvĂ˝ch hodin, AI copilot</p>
          </div>
        </div>
        <button
          onClick={() => setWithAI(!withAI)}
          className={`relative w-12 h-6 rounded-full transition-colors ${withAI ? 'bg-purple-600' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${withAI ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.slug && isActive
          const price = withAI ? plan.priceAI : plan.price

          return (
            <div
              key={plan.slug}
              className={`relative rounded-xl border p-5 transition-all ${
                plan.popular
                  ? 'border-blue-300 bg-blue-50/50 shadow-md'
                  : isCurrent
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-4 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  NejoblĂ­benÄ›jĹˇĂ­
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> AktivnĂ­
                </div>
              )}

              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-500">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold text-gray-900">{price}</span>
                <span className="text-sm text-gray-500">KÄŤ/mÄ›s</span>
                {withAI && (
                  <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                    + AI
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-400 mb-3">{plan.limits}</p>

              <ul className="space-y-1.5 mb-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="w-full py-2.5 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors flex items-center justify-center gap-1"
                >
                  {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ExternalLink className="w-3.5 h-3.5" /> Spravovat pĹ™edplatnĂ©</>}
                </button>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.slug)}
                  disabled={checkoutLoading !== null}
                  className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    plan.popular
                      ? 'text-white shadow-md hover:shadow-lg'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={{ background: 'linear-gradient(135deg, #1a5276, #48b1bf)' }}
                >
                  {checkoutLoading === plan.slug ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isTrial || isExpired || isCanceled ? 'Vybrat plĂˇn' : 'Upgradovat'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-gray-400 space-y-1">
        <p>VĹˇechny ceny jsou bez DPH. Platba kartou pĹ™es zabezpeÄŤenĂ˝ Stripe checkout.</p>
        <p>PĹ™edplatnĂ© mĹŻĹľete kdykoliv zruĹˇit. Ĺ˝ĂˇdnĂ© skrytĂ© poplatky.</p>
      </div>
    </div>
  )
}
