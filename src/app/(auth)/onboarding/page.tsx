﻿﻿﻿﻿﻿'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Scissors, Clock, PartyPopper, ArrowRight, ArrowLeft, Check, Waves, Loader2 } from 'lucide-react'

const STEPS = [
  { icon: Building2, label: 'Základní info', color: 'bg-blue-500' },
  { icon: Scissors, label: 'Služby', color: 'bg-emerald-500' },
  { icon: Clock, label: 'Pracovní doba', color: 'bg-amber-500' },
  { icon: PartyPopper, label: 'Hotovo!', color: 'bg-purple-500' },
]

interface Category { id: string; name: string; slug: string; icon: string; service_templates: Template[] }
interface Template { id: string; name: string; duration: number; price: number; color: string }

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const [orgName, setOrgName] = useState('')
  // Predvyplnit nazev z organizations
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d?.name) setOrgName(d.name)
      if (d?.email) setOrgEmail(d.email)
    }).catch(() => {})
  }, [])
  const [orgAddress, setOrgAddress] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgEmail, setOrgEmail] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set())
  const [customServiceName, setCustomServiceName] = useState('')
  const [customServicePrice, setCustomServicePrice] = useState('')
  const [customServiceDuration, setCustomServiceDuration] = useState('60')

  const [workStart, setWorkStart] = useState(8)
  const [workEnd, setWorkEnd] = useState(17)
  const [slotDuration, setSlotDuration] = useState(30)

  const bookingSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'muj-salon'

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCategories(data)
    }).catch(() => {})
  }, [])

  const currentCategory = categories.find(c => c.id === selectedCategory)

  const toggleTemplate = (id: string) => {
    setSelectedTemplates(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectAllTemplates = () => {
    if (!currentCategory) return
    const allIds = currentCategory.service_templates.map(t => t.id)
    setSelectedTemplates(new Set(allIds))
  }

  const saveStep1 = async () => {
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: orgName, address: orgAddress, phone: orgPhone, email: orgEmail, booking_link: bookingSlug, category: currentCategory?.slug || 'other' }),
    })
    setSaving(false); setStep(1)
    if (currentCategory) selectAllTemplates()
  }

  const saveStep2 = async () => {
    setSaving(true)
    const templates = currentCategory?.service_templates.filter(t => selectedTemplates.has(t.id)) || []
    for (const t of templates) {
      await fetch('/api/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: t.name, price: t.price, duration: t.duration, category: currentCategory?.name || 'Obecné', color: t.color, visibility: 'public', active: true }),
      })
    }
    if (customServiceName && customServicePrice) {
      await fetch('/api/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customServiceName, price: parseFloat(customServicePrice), duration: parseInt(customServiceDuration), category: currentCategory?.name || 'Obecné', color: '#3b82f6', visibility: 'public', active: true }),
      })
    }
    setSaving(false); setStep(2)
  }

  const saveStep3 = async () => {
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ work_start: workStart, work_end: workEnd, slot_duration: slotDuration }),
    })
    setSaving(false); setStep(3)
  }

  const finishOnboarding = async () => {
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding_completed: true }),
    })
    setSaving(false); router.push('/dashboard'); router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #052e16 0%, #065f46 30%, #059669 50%, #0369a1 75%, #1e3a5f 100%)' }} />
      <div className="absolute top-20 right-20 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg mb-3">
            <Waves className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Clientoro</h1>
          <p className="text-white/60 mt-1">Nastavte si svůj účet za 2 minuty</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? 'bg-emerald-400 text-white' : i === step ? 'bg-white text-gray-900' : 'bg-white/20 text-white/50'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-emerald-400' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">

          {step === 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Základní info</h2>
                  <p className="text-sm text-gray-500">Jak se jmenuje váš salon / firma?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Název firmy / salonu *</label>
                  <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Např. Salon Krása" autoFocus />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Obor podnikání *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map(cat => (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          selectedCategory === cat.id
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}>
                        <span className="text-xl block mb-1">{cat.icon}</span>
                        <span className="text-xs font-medium text-gray-700 leading-tight block">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
                  <input type="text" value={orgAddress} onChange={e => setOrgAddress(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ulice 123, Praha 1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input type="tel" value={orgPhone} onChange={e => setOrgPhone(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+420 777 123 456" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="info@salon.cz" />
                  </div>
                </div>

                {orgName && (
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                    <p className="text-xs text-emerald-600">🔗 Váš booking link: <strong>clientoro.pro/{bookingSlug}</strong></p>
                  </div>
                )}
              </div>

              <button onClick={saveStep1} disabled={!orgName || !selectedCategory || saving}
                className="w-full mt-6 py-3 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #052e16, #0369a1)' }}>
                {saving ? 'Ukládám...' : <>Další krok <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Vaše služby</h2>
                  <p className="text-sm text-gray-500">Vyberte služby které nabízíte — můžete je později upravit</p>
                </div>
              </div>

              {currentCategory && currentCategory.service_templates.length > 0 && (
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Doporučené pro {currentCategory.icon} {currentCategory.name}</span>
                    <button onClick={selectAllTemplates} className="text-xs text-blue-600 hover:underline">Vybrat vše</button>
                  </div>
                  {currentCategory.service_templates.map(t => (
                    <label key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTemplates.has(t.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="checkbox" checked={selectedTemplates.has(t.id)} onChange={() => toggleTemplate(t.id)}
                        className="w-4 h-4 text-emerald-600 rounded" />
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{t.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{t.duration} min</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{t.price} Kč</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">➕ Přidat vlastní službu</p>
                <div className="space-y-2">
                  <input type="text" value={customServiceName} onChange={e => setCustomServiceName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Název služby" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={customServicePrice} onChange={e => setCustomServicePrice(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Cena (Kč)" />
                    <select value={customServiceDuration} onChange={e => setCustomServiceDuration(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
                      {[15,30,45,60,75,90,120,150,180].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button onClick={saveStep2} disabled={selectedTemplates.size === 0 && !customServiceName || saving}
                  className="flex-1 py-3 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #052e16, #0369a1)' }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Další krok <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Pracovní doba</h2>
                  <p className="text-sm text-gray-500">Kdy jste k dispozici?</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Začátek dne</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min={5} max={12} value={workStart} onChange={e => setWorkStart(Number(e.target.value))}
                      className="flex-1 accent-amber-500" />
                    <span className="text-lg font-bold text-gray-900 w-16 text-center">{workStart}:00</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konec dne</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min={14} max={23} value={workEnd} onChange={e => setWorkEnd(Number(e.target.value))}
                      className="flex-1 accent-amber-500" />
                    <span className="text-lg font-bold text-gray-900 w-16 text-center">{workEnd}:00</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Délka slotu</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60, 90, 120].map(d => (
                      <button key={d} onClick={() => setSlotDuration(d)}
                        className={`py-2 rounded-xl text-sm font-medium transition-all ${
                          slotDuration === d ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>{d} min</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button onClick={saveStep3} disabled={saving}
                  className="flex-1 py-3 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #052e16, #0369a1)' }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Další krok <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vše je připraveno! 🎉</h2>
              <p className="text-gray-500 mb-6">Váš účet je nastaven. Můžete začít přijímat rezervace.</p>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 mb-6">
                <p className="text-sm text-emerald-700 mb-1">Váš booking link:</p>
                <span className="text-lg font-bold text-emerald-800">clientoro.pro/{bookingSlug}</span>
                <button onClick={() => { navigator.clipboard.writeText(`clientoro.pro/${bookingSlug}`); alert('Zkopírováno!') }}
                  className="ml-2 text-xs text-emerald-600 hover:underline">📋 Kopírovat</button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 text-left">
                <p className="text-sm font-medium text-gray-700 mb-2">✅ Co jsme nastavili:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>🏢 {orgName}</li>
                  {currentCategory && <li>{currentCategory.icon} {currentCategory.name}</li>}
                  <li>📋 {selectedTemplates.size} služeb{customServiceName ? ' + 1 vlastní' : ''}</li>
                  <li>🕐 {workStart}:00 - {workEnd}:00, termíny po {slotDuration} min</li>
                </ul>
              </div>

              <button onClick={finishOnboarding} disabled={saving}
                className="w-full py-3 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #052e16, #0369a1)' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Přejít do aplikace <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
