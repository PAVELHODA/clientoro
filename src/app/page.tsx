// PATH: src/app/page.tsx
'use client'

import { useState } from 'react'
import { Waves, Calendar, Users, Brain, TrendingUp, ChevronDown, ChevronRight, Shield, Zap, Heart, Star, Check, ArrowRight, CreditCard, Banknote, Gift, Phone, Mail } from 'lucide-react'

const SEGMENTS = [
  { icon: '💇', title: 'Beauty & hair', desc: 'Hair salons, barbers, nail studios, makeup artists' },
  { icon: '🧖', title: 'Wellness & massage', desc: 'Massage therapists, lymphatic drainage, spa, sauna' },
  { icon: '💉', title: 'Aesthetics & cosmetics', desc: 'Cosmeticians, permanent makeup, tattoo, piercing' },
  { icon: '🏥', title: 'Health & physiotherapy', desc: 'Physiotherapists, chiropractors, osteopaths, speech therapists' },
  { icon: '🏋️', title: 'Fitness & sport', desc: 'Personal trainers, yoga instructors, ZTV instructors, nutrition coaches' },
  { icon: '🧠', title: 'Counseling & therapy', desc: 'Psychologists, coaches, therapists, mentors' },
]

const FEATURES = [
  {
    icon: Calendar, color: 'from-blue-500 to-cyan-400', title: 'Smart Booking',
    items: ['Online booking 24/7', 'Calendar with day/week/month view', 'Deposits & prepayments', 'Automatic reminders', 'No-show tracking'],
  },
  {
    icon: Users, color: 'from-emerald-500 to-teal-400', title: 'Client CRM',
    items: ['Client cards with full history', 'Sorting & filtering (A-Z, spend, visits)', 'Tags & segments', 'Export CSV / JSON / PDF', 'Birthday greetings & offers'],
  },
  {
    icon: Brain, color: 'from-amber-500 to-yellow-400', title: 'AI Assistant',
    items: ['AI Business Coach with real tips', 'Smart Slot Filler (optional)', 'Client reactivation suggestions', 'Revenue insights', 'All AI features ON/OFF — you decide'],
  },
  {
    icon: TrendingUp, color: 'from-rose-500 to-pink-400', title: 'Growth Tools',
    items: ['Referral program — bring a friend', 'Loyalty points & rewards', 'Discount codes & vouchers', 'QR codes with tracking', 'Gift certificates'],
  },
]

const PRICING = [
  {
    name: 'Solo Start', icon: '🟢', color: 'border-teal-300 bg-teal-50',
    price: '49', priceAi: '99', desc: 'For solo entrepreneurs',
    features: ['Calendar + booking link', 'Up to 50 bookings/mo', 'Client CRM (up to 100)', 'Basic reports', 'Birthday SMS'],
    trial: true,
  },
  {
    name: 'Team Start', icon: '🔵', color: 'border-blue-300 bg-blue-50',
    price: '299', priceAi: '499', desc: 'For businesses with a team',
    features: ['Everything from Solo (unlimited)', 'Team management', 'Staff calendar & shifts', 'Per-staff reports', 'Online payments & deposits', 'Up to 3 locations'],
    trial: false, popular: true,
  },
  {
    name: 'Solo Inspire', icon: '🏖️', color: 'border-amber-300 bg-amber-50',
    price: '499', priceAi: '799', desc: 'Solo + AI & growth tools',
    features: ['Everything from Solo (unlimited)', 'AI Business Coach', 'Campaigns (5/mo)', 'Referral program', 'Loyalty program', 'Smart rebooking', 'Gift vouchers'],
    trial: false,
  },
  {
    name: 'Pro Inspire', icon: '🏖️✨', color: 'border-yellow-400 bg-yellow-50',
    price: '1 299', priceAi: '1 999', desc: 'Team + AI & growth — maximum',
    features: ['Everything from Team + Solo Inspire', 'AI Copilot (advanced)', 'AI Smart Slot Filler', 'Unlimited campaigns', 'Staff leaderboard', 'Unlimited locations'],
    trial: false,
  },
]

const FAQ = [
  { q: 'Is Clientoro really free to try?', a: 'Yes! 14 days full access, no credit card required. After the trial, you can continue with a free plan (20 bookings/month) or choose a paid plan.' },
  { q: 'What makes Clientoro different from Reservio or Reenio?', a: 'Clientoro is not just a booking system. It includes AI assistant, growth tools, referral programs, and revenue intelligence. We help you GET more clients, not just manage existing ones.' },
  { q: 'Can I export data for my accountant?', a: 'Yes! Export clients, bookings, and revenue in CSV, JSON, or PDF format. Compatible with any accounting system.' },
  { q: 'How do deposits work?', a: 'You choose which services require a deposit, set the percentage, and optionally exempt VIP clients. Deposits dramatically reduce last-minute cancellations.' },
  { q: 'What is the cash payment bonus?', a: 'You can offer clients a small bonus (discount or loyalty points) for paying in cash. This saves you payment gateway fees and supports the local economy.' },
  { q: 'Can I turn off AI features?', a: 'Absolutely! Every AI feature has an ON/OFF switch. Nothing happens without your consent. No spam, no unwanted messages to your clients.' },
  { q: 'Is my data safe?', a: 'Yes. We use Supabase (PostgreSQL) with row-level security, encrypted connections, and GDPR-compliant data handling. You can export or delete your data anytime.' },
  { q: 'Do I need technical skills?', a: 'Not at all. Our step-by-step guide will have you up and running in 5 minutes. And our support team is always here to help.' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [calcSlots, setCalcSlots] = useState(4)
  const [calcPrice, setCalcPrice] = useState(800)
  const [calcNoshow, setCalcNoshow] = useState(15)

  const lostRevenue = Math.round(calcSlots * calcPrice * (calcNoshow / 100) * 22)

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
              <Waves className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Clientoro</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#ai" className="hover:text-gray-900">AI</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Sign in</a>
            <a href="/register" className="px-4 py-2 text-sm text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
              Start free
            </a>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0c2d48 20%, #0e4d64 40%, #0f6b7a 55%, #0e5460 70%, #0c3a50 85%, #0a1e30 100%)' }}>
        <div className="absolute top-16 right-16 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full blur-3xl -translate-y-1/2" style={{ background: 'radial-gradient(circle, rgba(14,77,100,0.3) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 opacity-[0.07]">
          <svg viewBox="0 0 1440 100" className="w-full h-full fill-white"><path d="M0 40 Q180 0 360 40 Q540 80 720 40 Q900 0 1080 40 Q1260 80 1440 40 L1440 100 L0 100 Z" /></svg>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
            <Zap className="w-4 h-4" /> More than a booking system
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Get more clients.<br />Increase revenue.<br />
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.2)' }}>With AI by your side.</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Booking, CRM & growth platform for service professionals. Honest pricing, no hidden fees, no false promises.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <a href="/register" className="px-8 py-4 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              Try 14 days free <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#calculator" className="px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>
              How much are you losing? ↓
            </a>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>No credit card · Cancel anytime · Your data, your control</p>
        </div>
      </section>

      {/* ═══════════ CALCULATOR ═══════════ */}
      <section id="calculator" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">How much are empty slots costing you?</h2>
            <p className="text-gray-500">Adjust the sliders to see your potential monthly loss</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Slots per day</span><span className="font-bold text-gray-900">{calcSlots}</span></div>
                <input type="range" min={1} max={20} value={calcSlots} onChange={e => setCalcSlots(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Average service price (CZK)</span><span className="font-bold text-gray-900">{calcPrice} CZK</span></div>
                <input type="range" min={200} max={5000} step={100} value={calcPrice} onChange={e => setCalcPrice(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">No-show / cancellation rate</span><span className="font-bold text-gray-900">{calcNoshow}%</span></div>
                <input type="range" min={0} max={40} value={calcNoshow} onChange={e => setCalcNoshow(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
            </div>
            <div className="mt-8 p-6 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #fef2f2, #fff7ed)' }}>
              <p className="text-sm text-gray-500 mb-1">You are potentially losing</p>
              <p className="text-4xl font-bold text-red-600 mb-1">{lostRevenue.toLocaleString('cs-CZ')} CZK / month</p>
              <p className="text-sm text-gray-400">That is {(lostRevenue * 12).toLocaleString('cs-CZ')} CZK per year</p>
            </div>
            <div className="mt-4 p-4 bg-emerald-50 rounded-xl text-center border border-emerald-200">
              <p className="text-sm text-emerald-700">
                <strong>Deposits + reminders + smart rebooking</strong> help reduce cancellations. Clientoro gives you the tools — results depend on your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to run & grow</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Four integrated pillars. One platform. No switching between tools.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-md`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{f.title}</h3>
                </div>
                <div className="space-y-2">
                  {f.items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ AI SECTION ═══════════ */}
      <section id="ai" className="py-20" style={{ background: 'linear-gradient(180deg, #0a1628, #0c2d48, #0a1e30)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
            <Brain className="w-4 h-4" /> What competitors don't have
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">AI that actually works for you</h2>
          <p className="text-lg mb-12" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Not a gimmick. Real tools that save time and help grow your business. Every feature has an ON/OFF switch — you are always in control.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🧠', title: 'AI Business Coach', desc: 'Practical tips based on YOUR data. Not generic advice.' },
              { icon: '📅', title: 'Smart Slot Filler', desc: 'Cancelled booking? Optionally notify interested clients. (You decide!)' },
              { icon: '🔄', title: 'Client Reactivation', desc: 'Suggests reaching out to clients who haven\'t visited in a while.' },
              { icon: '📊', title: 'Revenue Insights', desc: 'Understand your best days, services, and team members.' },
              { icon: '⭐', title: 'Review Booster', desc: 'Optionally ask happy clients for a Google review.' },
              { icon: '🔮', title: 'Smart Rebooking', desc: '"Book your next visit?" — right after the appointment.' },
            ].map(ai => (
              <div key={ai.title} className="rounded-xl p-5 text-left" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-2xl">{ai.icon}</span>
                <h3 className="text-white font-bold mt-2 mb-1">{ai.title}</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{ai.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-sm" style={{ color: '#f59e0b' }}>
              <Shield className="w-4 h-4 inline mr-1" />
              <strong>Your control, always.</strong> Every AI feature can be turned ON or OFF. Nothing happens without your consent. No spam. No unwanted messages.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ DEPOSITS + CASH BONUS ═══════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Deposits & Cash Bonus</h2>
            <p className="text-gray-500">Two smart tools that work together. Reduce no-shows AND save on fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md mb-4">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Deposits</h3>
              <p className="text-gray-500 text-sm mb-4">Client pays a small deposit online. Shows up. You keep your revenue.</p>
              <div className="space-y-2 text-sm">
                {['Choose which services require deposit', 'Set your own percentage', 'Exempt VIP / loyal clients', 'Refund policy — you decide', 'New clients only option'].map(f => (
                  <div key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span className="text-gray-600">{f}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-md mb-4">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cash Bonus 🇨🇿</h3>
              <p className="text-gray-500 text-sm mb-4">Reward clients who pay in cash. Save on gateway fees. Support the local economy.</p>
              <div className="space-y-2 text-sm">
                {['Bonus discount or loyalty points for cash', 'You save 2-3% gateway fees', 'Client feels rewarded', 'Supports Czech koruna in circulation', 'Fully optional — you decide'].map(f => (
                  <div key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span className="text-gray-600">{f}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SEGMENTS ═══════════ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Built for service professionals</h2>
            <p className="text-gray-500">People who work with people. That's who we serve.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SEGMENTS.map(s => (
              <div key={s.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all text-center">
                <span className="text-3xl">{s.icon}</span>
                <h3 className="font-bold text-gray-900 mt-2">{s.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ GUIDE ═══════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Up and running in 5 minutes</h2>
            <p className="text-gray-500">Step-by-step guide built into the app. No tech skills needed.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Create account', desc: '30 seconds, no card' },
              { step: '2', title: 'Add services', desc: 'Name, price, duration' },
              { step: '3', title: 'Share booking link', desc: 'Clients book online' },
              { step: '4', title: 'Watch it grow', desc: 'AI helps you improve' },
            ].map(s => (
              <div key={s.step} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold"
                  style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>{s.step}</div>
                <h3 className="font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Honest pricing. No hidden fees.</h2>
            <p className="text-gray-500">No percentage of your revenue. No surprise charges. What you see is what you pay.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING.map(p => (
              <div key={p.name} className={`rounded-2xl border-2 p-5 relative ${p.color} ${p.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">Most popular</div>}
                <div className="text-2xl mb-1">{p.icon}</div>
                <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{p.desc}</p>
                <div className="space-y-1 mb-4">
                  <div className="text-sm"><span className="text-gray-500">Without AI:</span> <strong>{p.price} CZK/mo</strong></div>
                  <div className="text-sm"><span className="text-gray-500">With AI:</span> <strong>{p.priceAi} CZK/mo</strong></div>
                </div>
                {p.trial && <div className="bg-green-50 rounded-lg px-2 py-1 mb-3 border border-green-200"><p className="text-xs text-green-700 font-medium">🎁 14 days free — full access</p></div>}
                <div className="space-y-1.5">
                  {p.features.map(f => (
                    <div key={f} className="flex items-start gap-1.5 text-xs"><Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600">{f}</span></div>
                  ))}
                </div>
                <a href="/register" className="block mt-4 py-2.5 text-center rounded-xl font-semibold text-sm transition-all"
                  style={p.popular ? { background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)', color: 'white' } : { background: '#f3f4f6', color: '#374151' }}>
                  Start free
                </a>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">💡 Use your own OpenAI API key with Inspire plans and save up to 700 CZK/month</p>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-semibold text-gray-900 pr-4">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-gray-600 -mt-2">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-20" style={{ background: 'linear-gradient(180deg, #0a1628, #0c2d48, #0a1e30)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your clients are <span style={{ color: '#f59e0b' }}>gold</span>.<br />Start treating them that way.
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            14 days free. No credit card. No hidden fees. Just honest tools that help you grow.
          </p>
          <a href="/register" className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            Create free account <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Waves className="w-5 h-5" style={{ color: '#f59e0b' }} />
                <span className="text-white font-bold">Clientoro</span>
              </div>
              <p className="text-sm max-w-xs">AI-powered Booking & Growth OS for service professionals. Built with honesty and care.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="text-white font-semibold mb-3">Product</h4>
                <div className="space-y-2">
                  <a href="#features" className="block hover:text-white">Features</a>
                  <a href="#pricing" className="block hover:text-white">Pricing</a>
                  <a href="#faq" className="block hover:text-white">FAQ</a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Company</h4>
                <div className="space-y-2">
                  <a href="#" className="block hover:text-white">About</a>
                  <a href="#" className="block hover:text-white">Contact</a>
                  <a href="#" className="block hover:text-white">Privacy</a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
            © 2026 Clientoro. All rights reserved. 🏆 Your clients are gold.
          </div>
        </div>
      </footer>
    </div>
  )
}
