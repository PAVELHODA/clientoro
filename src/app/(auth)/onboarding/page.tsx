// PATH: src/app/(auth)/onboarding/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'
import { Building2, Scissors, Clock, Sparkles, ArrowRight, ArrowLeft, Check, Waves, Loader2, Plus, X } from 'lucide-react'
import { getAllIndustries, getServiceCategories } from '@/lib/serviceCategories'

const INDUSTRY_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f59e0b','#6366f1','#d946ef','#0ea5e9','#10b981','#f43f5e','#a855f7','#0891b2','#65a30d','#737373']

function buildLocalCategories(): Category[] {
  const industries = getAllIndustries('cs')
  return industries
    .filter(ind => ind.value !== 'general')
    .map((ind, idx) => {
      const services = getServiceCategories(ind.value, 'cs')
      return {
        id: ind.value,
        name: ind.label,
        slug: ind.value,
        icon: ind.label.split(' ')[0].charAt(0).toUpperCase(),
        service_templates: services
          .filter((s: string) => s !== 'Ostatn' + String.fromCharCode(237))
          .map((s: string, si: number) => ({
            id: ind.value + '_' + si,
            name: s,
            duration: ['consulting','psychology'].includes(ind.value) ? 60 : ['tattoo'].includes(ind.value) ? 120 : ['weddings'].includes(ind.value) ? 480 : ['photo'].includes(ind.value) ? 90 : 60,
            price: ['consulting'].includes(ind.value) ? 1500 : ['tattoo'].includes(ind.value) ? 2000 : ['weddings'].includes(ind.value) ? 5000 : ['photo'].includes(ind.value) ? 2000 : ['physiotherapy'].includes(ind.value) ? 800 : ['aesthetic_clinic'].includes(ind.value) ? 3000 : ['psychology'].includes(ind.value) ? 1200 : 500,
            color: INDUSTRY_COLORS[idx % INDUSTRY_COLORS.length],
          })),
      }
    })
}

const STEPS = [
  { icon: Building2, label: 'Info', color: 'bg-blue-500' },
  { icon: Scissors, label: 'Služby', color: 'bg-emerald-500' },
  { icon: Clock, label: 'Doba', color: 'bg-amber-500' },
  { icon: Sparkles, label: 'Hotovo', color: 'bg-purple-500' },
]

const SLOT_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hod' },
  { value: 90, label: '1.5 hod' },
  { value: 120, label: '2 hod' },
  { value: 150, label: '2.5 hod' },
  { value: 180, label: '3 hod' },
  { value: 240, label: '4 hod' },
  { value: 480, label: 'Celý den' },
]

interface Category { id: string; name: string; slug: string; icon: string; service_templates: Template[] }
interface Template { id: string; name: string; duration: number; price: number; color: string; category_id?: string }
interface CustomService { name: string; price: string; duration: string; category: string }

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [maxStep, setMaxStep] = useState(0)
  const router = useRouter()
  const toast = useToast()

  const [orgName, setOrgName] = useState('')
  const [orgIco, setOrgIco] = useState('')
  const [orgDic, setOrgDic] = useState('')
  const [icoLoading, setIcoLoading] = useState(false)
  const [icoValid, setIcoValid] = useState(false)
  const [icoError, setIcoError] = useState('')
  const [isDphPayer, setIsDphPayer] = useState(false)
  const [orgAddress, setOrgAddress] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgEmail, setOrgEmail] = useState('')

  const [categories] = useState<Category[]>(() => buildLocalCategories())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set())
  const [customServiceName, setCustomServiceName] = useState('')
  const [customServicePrice, setCustomServicePrice] = useState('')
  const [customServiceDuration, setCustomServiceDuration] = useState('60')
  const [customServiceCategory, setCustomServiceCategory] = useState('')
  const [customServices, setCustomServices] = useState<CustomService[]>([])

  const [workStart, setWorkStart] = useState(8)
  const [workEnd, setWorkEnd] = useState(17)
  const [slotDuration, setSlotDuration] = useState(30)

  useEffect(() => {
    if (step > maxStep) setMaxStep(step)
  }, [step])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d?.email && !orgEmail) setOrgEmail(d.email)
    }).catch(() => {})
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d?.name) setOrgName(d.name)
      if (d?.email) setOrgEmail(d.email)
      if (d?.phone) setOrgPhone(d.phone)
      if (d?.address) setOrgAddress(d.address)
    }).catch(() => {})
  }, [])

  // Kategorie jsou lokální z serviceCategories.ts

  const formatPhone = (val: string) => {
    let digits = val.replace(/[^\d+]/g, '').slice(0, 16)
    if (digits.startsWith('00420')) digits = '+420' + digits.slice(5)
    else if (digits.startsWith('00421')) digits = '+421' + digits.slice(5)
    else if (digits.startsWith('420') && !digits.startsWith('+')) digits = '+420' + digits.slice(3)
    else if (digits.startsWith('421') && !digits.startsWith('+')) digits = '+421' + digits.slice(3)
    else if (/^\d{9}$/.test(digits)) digits = '+420' + digits
    if (digits.startsWith('+420') && digits.length > 4) {
      const num = digits.slice(4).replace(/\D/g, '')
      return '+420 ' + num.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
    }
    if (digits.startsWith('+421') && digits.length > 4) {
      const num = digits.slice(4).replace(/\D/g, '')
      return '+421 ' + num.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
    }
    return val
  }

  const lookupIco = async (ico: string) => {
    setOrgIco(ico)
    setIcoError('')
    if (ico.length !== 8 || !/^\d{8}$/.test(ico)) return
    setIcoLoading(true)
    try {
      const r = await fetch('/api/ares?ico=' + ico)
      if (r.ok) {
        const d = await r.json()
        if (d.name && !orgName) setOrgName(d.name)
        if (d.address && !orgAddress) setOrgAddress(d.address)
        if (d.dic) setOrgDic(d.dic)
        setIcoValid(true)
      } else {
        setIcoError('IČO nenalezeno v ARES')
        setIcoValid(false)
      }
    } catch { setIcoError('Chyba při ověření IČO'); setIcoValid(false) }
    setIcoLoading(false)
  }

  const bookingSlug = orgName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'muj-salon'

  const selectedCategoryList = categories.filter(c => selectedCategories.has(c.id))

  const getCategoryForTemplate = (templateId: string) => {
    for (const cat of selectedCategoryList) {
      if (cat.service_templates.some(t => t.id === templateId)) return cat
    }
    return selectedCategoryList[0]
  }

  const toggleTemplate = (id: string) => {
    setSelectedTemplates(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectAllTemplates = () => {
    const allIds = selectedCategoryList.flatMap(c => c.service_templates.map(t => t.id))
    setSelectedTemplates(new Set(allIds))
  }

  const addCustomService = () => {
    if (!customServiceName || !customServicePrice) return
    setCustomServices(prev => [...prev, {
      name: customServiceName,
      price: customServicePrice,
      duration: customServiceDuration,
      category: customServiceCategory || selectedCategoryList[0]?.name || 'Obecné'
    }])
    setCustomServiceName('')
    setCustomServicePrice('')
    setCustomServiceDuration('60')
  }

  const removeCustomService = (idx: number) => {
    setCustomServices(prev => prev.filter((_, i) => i !== idx))
  }

  const formatDuration = (d: number) => {
    if (d >= 480) return (d / 60) + ' hod (celý den)'
    if (d >= 240) return (d / 60) + ' hod (půl dne)'
    if (d >= 60) return (d / 60) + ' hod'
    return d + ' min'
  }

  const goToStep = (targetStep: number) => {
    if (targetStep <= maxStep) setStep(targetStep)
  }

  const saveStep1 = async () => {
    setSaving(true)
    const payload = { name: orgName, address: orgAddress, phone: orgPhone, email: orgEmail, ico: orgIco, dic: orgDic, booking_link: bookingSlug, category: selectedCategoryList.map(c => c.slug).join(',') || 'other' }
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { const err = await res.json().catch(() => ({})); toast.error(err.error || 'Chyba při ukládání'); setSaving(false); return }
    setSaving(false); setStep(1)
    if (selectedCategories.size > 0) selectAllTemplates()
    if (selectedCategoryList.length > 0 && !customServiceCategory) {
      setCustomServiceCategory(selectedCategoryList[0].name)
    }
  }

  const saveStep2 = async () => {
    setSaving(true)
    const templates = selectedCategoryList.flatMap(c => c.service_templates).filter(t => selectedTemplates.has(t.id))
    for (const t of templates) {
      const cat = getCategoryForTemplate(t.id)
      const svcRes = await fetch('/api/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: t.name, price: t.price, duration: t.duration, category: cat?.name || 'Obecné', color: t.color, visibility: 'public', active: true }),
      })
      if (svcRes.status === 409) continue // duplikát — skip
    }
    for (const cs of customServices) {
      await fetch('/api/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cs.name, price: parseFloat(cs.price), duration: parseInt(cs.duration), category: cs.category || 'Obecné', color: '#3b82f6', visibility: 'public', active: true }),
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
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding_completed: true }),
      })
      if (res.ok) {
        window.location.href = '/dashboard'
      } else {
        toast.error('Chyba při dokončení nastavení')
        setSaving(false)
      }
    } catch {
      toast.error('Chyba při dokončení nastavení')
      setSaving(false)
    }
  }

  const totalServices = selectedTemplates.size + customServices.length

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-12 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a5276 0%, #2980b9 35%, #48b1bf 65%, #6dd5c8 100%)' }} />
      <div className="absolute top-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-amber-300/8 rounded-full blur-3xl" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg mb-2">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Clientoro</h1>
          <p className="text-white/70 mt-1 text-sm">Nastavte si svůj účet za 2 minuty</p>
        </div>

        {/* KLIKACÍ KROKY */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => goToStep(i)}
                disabled={i > maxStep}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all text-xs sm:text-sm font-medium ${
                  i < step
                    ? 'bg-emerald-400/90 text-white cursor-pointer hover:bg-emerald-500'
                    : i === step
                    ? 'bg-white text-gray-900 shadow-lg'
                    : i <= maxStep
                    ? 'bg-white/30 text-white/80 cursor-pointer hover:bg-white/40'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                  i < step ? 'bg-white/30' : i === step ? 'bg-gray-900 text-white' : 'bg-white/20'
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-4 sm:w-6 h-0.5 rounded ${i < step ? 'bg-emerald-400' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-5 sm:p-8 max-h-[75vh] overflow-y-auto">

          {/* STEP 0 — Základní info */}
          {step === 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Základní info</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Jak se jmenuje váš salon / firma?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Název firmy / salonu *</label>
                  <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Např. Salon Krása" autoFocus />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Obor podnikání * <span className="text-xs text-gray-400 font-normal">(vyberte jeden či více)</span></label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    {categories.map(cat => (
                      <button key={cat.id} onClick={() => { setSelectedCategories(prev => { const next = new Set(prev); if (next.has(cat.id)) next.delete(cat.id); else next.add(cat.id); return next }) }}
                        className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all ${
                          selectedCategories.has(cat.id)
                            ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}>
                        <span className="text-lg sm:text-xl block mb-0.5">{cat.icon}</span>
                        <span className="text-[10px] sm:text-xs font-medium text-gray-700 leading-tight block truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                  {selectedCategories.size > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-blue-600 font-medium">✓ Vybráno: {selectedCategoryList.map(c => c.name).join(', ')}</p>
                      {selectedCategoryList.map(cat => (
                        cat.service_templates && cat.service_templates.length > 0 && (
                          <div key={cat.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-1.5">{cat.icon} {cat.name} — příklady služeb:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.service_templates.slice(0, 6).map((t: any) => (
                                <span key={t.id} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">{t.name}</span>
                              ))}
                              {cat.service_templates.length > 6 && <span className="text-[10px] text-gray-400">+{cat.service_templates.length - 6} dalších</span>}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IČO</label>
                    <div className="relative">
                      <input type="text" value={orgIco} onChange={e => lookupIco(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${icoValid ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'}`}
                        placeholder="12345678" maxLength={8} />
                      {icoLoading && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-blue-500" />}
                      {icoValid && <Check className="absolute right-3 top-3 w-4 h-4 text-emerald-500" />}
                    </div>
                    {icoError && <p className="text-xs text-red-500 mt-1">{icoError}</p>}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">DPH</span>
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" checked={isDphPayer} onChange={e => { setIsDphPayer(e.target.checked); if (!e.target.checked) setOrgDic('') }} className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                      <span className="text-sm text-gray-600">Plátce DPH</span>
                    </label>
                    {isDphPayer && <input type="text" value={orgDic} onChange={e => setOrgDic(e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-xl text-sm" placeholder="CZ12345678" />}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
                  <input type="text" value={orgAddress} onChange={e => setOrgAddress(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Ulice 123, Praha 1" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input type="tel" value={orgPhone} onChange={e => setOrgPhone(formatPhone(e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="+420 777 123 456" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="info@salon.cz" />
                  </div>
                </div>

                {orgName && (
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                    <p className="text-xs text-emerald-600">🔗 Váš booking link: <strong>clientoro.pro/{bookingSlug}</strong></p>
                  </div>
                )}
              </div>

              <button onClick={saveStep1} disabled={!orgName || selectedCategories.size === 0 || (orgIco.length > 0 && orgIco.length === 8 && !icoValid) || saving}
                className="w-full mt-5 py-3 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg text-sm"
                style={{ background: 'linear-gradient(135deg, #1a5276, #48b1bf)' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Další krok <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          {/* STEP 1 — Služby */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Scissors className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Vaše služby</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Vyberte služby — můžete je později upravit</p>
                </div>
              </div>

              {selectedCategoryList.map(cat => (
                cat.service_templates.length > 0 && (
                  <div key={cat.id} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{cat.icon} {cat.name}</span>
                      <button onClick={selectAllTemplates} className="text-xs text-blue-600 hover:underline">Vybrat vše</button>
                    </div>
                    <div className="space-y-1.5">
                      {cat.service_templates.map(t => (
                        <label key={t.id} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedTemplates.has(t.id) ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input type="checkbox" checked={selectedTemplates.has(t.id)} onChange={() => toggleTemplate(t.id)}
                            className="w-4 h-4 text-emerald-600 rounded flex-shrink-0" />
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-gray-900 truncate block">{t.name}</span>
                          </div>
                          <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">{t.duration}m</span>
                          <span className="text-xs sm:text-sm font-bold text-gray-900 flex-shrink-0">{t.price} Kč</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              ))}

              {/* PŘIDÁNÍ VLASTNÍCH SLUŽEB */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">➕ Přidat vlastní službu</p>

                {/* Seznam již přidaných */}
                {customServices.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    {customServices.map((cs, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-gray-800 font-medium truncate">{cs.name}</span>
                          <span className="text-xs text-gray-500">{cs.price} Kč / {formatDuration(parseInt(cs.duration))}</span>
                          {selectedCategoryList.length > 1 && <span className="text-[10px] text-gray-400">→ {cs.category}</span>}
                        </div>
                        <button onClick={() => removeCustomService(idx)} className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulář pro novou službu */}
                <div className="space-y-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <input type="text" value={customServiceName} onChange={e => setCustomServiceName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" placeholder="Název služby" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={customServicePrice} onChange={e => setCustomServicePrice(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white" placeholder="Cena (Kč)" />
                    <select value={customServiceDuration} onChange={e => setCustomServiceDuration(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                      {[15,30,45,60,75,90,120,150,180,240,300,360,480].map(d => (
                        <option key={d} value={d}>{formatDuration(d)}</option>
                      ))}
                    </select>
                  </div>
                  {selectedCategoryList.length > 1 && (
                    <select value={customServiceCategory} onChange={e => setCustomServiceCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                      {selectedCategoryList.map(c => (
                        <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  )}
                  <button type="button" onClick={addCustomService}
                    disabled={!customServiceName || !customServicePrice}
                    className="w-full py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> Přidat službu
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep(0)} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button onClick={saveStep2} disabled={(selectedTemplates.size === 0 && customServices.length === 0) || saving}
                  className="flex-1 py-3 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg text-sm"
                  style={{ background: 'linear-gradient(135deg, #1a5276, #48b1bf)' }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Další krok <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Pracovní doba */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Pracovní doba</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Kdy jste k dispozici?</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Začátek dne</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min={6} max={14} value={workStart} onChange={e => setWorkStart(Number(e.target.value))}
                      className="flex-1 accent-amber-500" />
                    <span className="text-lg font-bold text-gray-900 w-16 text-center">{workStart}:00</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konec dne</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min={12} max={22} value={workEnd} onChange={e => setWorkEnd(Number(e.target.value))}
                      className="flex-1 accent-amber-500" />
                    <span className="text-lg font-bold text-gray-900 w-16 text-center">{workEnd}:00</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Délka slotu v kalendáři</label>
                  <p className="text-xs text-gray-400 mb-3">Jak jemně chcete dělit kalendář? Služby mohou trvat libovolně dlouho.</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {SLOT_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setSlotDuration(opt.value)}
                        className={`py-2 rounded-xl text-sm font-medium transition-all ${
                          slotDuration === opt.value ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep(1)} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button onClick={saveStep3} disabled={saving}
                  className="flex-1 py-3 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg text-sm"
                  style={{ background: 'linear-gradient(135deg, #1a5276, #48b1bf)' }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Další krok <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Hotovo */}
          {step === 3 && (
            <div className="text-center">
              <div className="mb-5">
                <div className="text-5xl mb-2">🏆</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                  Výborně, vše je připraveno!
                </h2>
                <p className="text-sm text-gray-500 mt-1">Váš účet je nastaven. Můžete začít přijímat rezervace.</p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 mb-5">
                <p className="text-xs text-emerald-600 mb-1">Váš booking link</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-emerald-800">clientoro.pro/{bookingSlug}</span>
                  <button onClick={() => { navigator.clipboard.writeText(`https://www.clientoro.pro/book/${bookingSlug}`); toast.success('Zkopírováno!') }}
                    className="text-xs text-emerald-600 hover:text-emerald-800 bg-white px-2 py-1 rounded-lg border border-emerald-200 transition-colors">Kopírovat</button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 text-left">
                <p className="text-sm font-medium text-gray-700 mb-3">Co jsme nastavili:</p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-blue-600" /></span>
                    {orgName}
                  </li>
                  {selectedCategoryList.map(c => (
                    <li key={c.id} className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-emerald-600" /></span>
                      {c.icon} {c.name}
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-purple-600" /></span>
                    {totalServices} služeb{customServices.length > 0 ? ` (z toho ${customServices.length} vlastních)` : ''}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-amber-100 rounded flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-amber-600" /></span>
                    Otevírací doba {workStart}:00 – {workEnd}:00
                  </li>
                </ul>
              </div>

              <button onClick={finishOnboarding} disabled={saving}
                className="w-full py-3.5 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg text-sm transition-all hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #1a5276, #48b1bf)' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Přejít do aplikace <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
