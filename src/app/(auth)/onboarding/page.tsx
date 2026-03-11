'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Scissors, Clock, PartyPopper, ArrowRight, ArrowLeft, Check, Waves } from 'lucide-react'

const STEPS = [
  { icon: Building2, label: 'Základní info', color: 'bg-blue-500' },
  { icon: Scissors, label: 'První služba', color: 'bg-emerald-500' },
  { icon: Clock, label: 'Pracovní doba', color: 'bg-amber-500' },
  { icon: PartyPopper, label: 'Hotovo!', color: 'bg-purple-500' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const [orgName, setOrgName] = useState('')
  const [orgAddress, setOrgAddress] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgEmail, setOrgEmail] = useState('')

  const [serviceName, setServiceName] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [serviceDuration, setServiceDuration] = useState('60')

  const [workStart, setWorkStart] = useState(8)
  const [workEnd, setWorkEnd] = useState(17)
  const [slotDuration, setSlotDuration] = useState(30)

  const bookingSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'muj-salon'

  const saveStep1 = async () => {
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: orgName, address: orgAddress, phone: orgPhone, email: orgEmail, booking_link: bookingSlug }),
    })
    setSaving(false); setStep(1)
  }

  const saveStep2 = async () => {
    setSaving(true)
    await fetch('/api/services', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: serviceName, price: parseFloat(servicePrice) || 0, duration: parseInt(serviceDuration) || 60, category: 'Obecne', color: '#3b82f6', visibility: 'public', active: true }),
    })
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
      {/* Pozadí — smaragdová→oceánová */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #052e16 0%, #065f46 30%, #059669 50%, #0369a1 75%, #1e3a5f 100%)' }} />
      <div className="absolute top-20 right-20 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
        <svg viewBox="0 0 1440 100" className="w-full h-full fill-white">
          <path d="M0 40 Q180 0 360 40 Q540 80 720 40 Q900 0 1080 40 Q1260 80 1440 40 L1440 100 L0 100 Z" />
        </svg>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg mb-3">
            <Waves className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Clientoro</h1>
          <p className="text-white/60 mt-1">Nastavte si svůj účet za 2 minuty</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? 'bg-emerald-400 text-white' :
                i === step ? 'bg-white text-gray-900' :
                'bg-white/20 text-white/50'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-emerald-400' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">

          {/* KROK 1 — Základní info */}
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

              <button onClick={saveStep1} disabled={!orgName || saving}
                className="w-full mt-6 py-3 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #052e16, #0369a1)' }}>
                {saving ? 'Ukládám...' : <>Další krok <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          {/* KROK 2 — První služba */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Přidejte první službu</h2>
                  <p className="text-sm text-gray-500">Co nabízíte klientům?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Název služby *</label>
                  <input type="text" value={serviceName} onChange={e => setServiceName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Např. Masáž, Stříhání, Manikúra..." autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cena (Kč) *</label>
                    <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doba trvání</label>
                    <select value={serviceDuration} onChange={e => setServiceDuration(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option value="15">15 minut</option>
                      <option value="30">30 minut</option>
                      <option value="45">45 minut</option>
                      <option value="60">60 minut</option>
                      <option value="90">90 minut</option>
                      <option value="120">120 minut</option>
                    </select>
                  </div>
                </div>

                {serviceName && servicePrice && (
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                    <p className="text-sm text-emerald-700">
                      ✅ <strong>{serviceName}</strong> — {servicePrice} Kč / {serviceDuration} min
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Zpět
                </button>
                <button onClick={saveStep2} disabled={!serviceName || !servicePrice || saving}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? 'Ukládám...' : <>Další krok <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>

              <button onClick={() => setStep(2)}
                className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600">
                Přeskočit — přidám později
              </button>
            </div>
          )}

          {/* KROK 3 — Pracovní doba */}
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

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Začátek</label>
                    <select value={workStart} onChange={e => setWorkStart(parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                      {Array.from({ length: 14 }, (_, i) => i + 5).map(h => (
                        <option key={h} value={h}>{h}:00</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konec</label>
                    <select value={workEnd} onChange={e => setWorkEnd(parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                      {Array.from({ length: 14 }, (_, i) => i + 10).map(h => (
                        <option key={h} value={h}>{h}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Délka slotu</label>
                  <select value={slotDuration} onChange={e => setSlotDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value={15}>15 minut</option>
                    <option value={30}>30 minut</option>
                    <option value={60}>60 minut</option>
                  </select>
                </div>

                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                  <p className="text-sm text-amber-700">
                    ⏰ Pracovní doba: <strong>{workStart}:00 — {workEnd}:00</strong> ({workEnd - workStart} hodin)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Zpět
                </button>
                <button onClick={saveStep3} disabled={saving}
                  className="flex-1 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? 'Ukládám...' : <>Další krok <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* KROK 4 — Hotovo! */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="w-8 h-8 text-purple-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Vše je připraveno!</h2>
              <p className="text-gray-500 mb-6">Váš účet je nastavený. Můžete přijímat rezervace!</p>

              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-5 border border-emerald-200 mb-6">
                <p className="text-sm text-emerald-600 mb-2">Váš booking link:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-bold text-emerald-800">clientoro.pro/{bookingSlug}</span>
                  <button onClick={() => { navigator.clipboard.writeText(`clientoro.pro/${bookingSlug}`); alert('Zkopírováno!') }}
                    className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200">
                    Kopírovat
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-medium text-gray-700 mb-3">✅ Co jste nastavili:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-600">Firma: <strong>{orgName}</strong></span>
                  </div>
                  {serviceName && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-gray-600">Služba: <strong>{serviceName}</strong> — {servicePrice} Kč</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-600">Pracovní doba: <strong>{workStart}:00 — {workEnd}:00</strong></span>
                  </div>
                </div>
              </div>

              <button onClick={finishOnboarding} disabled={saving}
                className="w-full py-3 text-white rounded-xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #052e16, #0369a1)' }}>
                {saving ? 'Dokončuji...' : <>🚀 Přejít do dashboardu</>}
              </button>

              <p className="text-xs text-gray-400 mt-4">Vše můžete kdykoliv změnit v Nastavení.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
