'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import {
  UserCircle, Plus, Phone, Mail, Edit2, Trash2, X, Check,
  Clock, Palmtree, AlertTriangle,
} from 'lucide-react'

interface StaffMember {
  id: string; full_name: string; email: string | null; phone: string | null
  avatar_url: string | null; active: boolean; sort_order: number; created_at: string
  staff_services: { service_id: string }[]
}
interface Service { id: string; name: string; color: string }
interface WorkingHour { weekday: number; start_time: string; end_time: string; enabled: boolean }
interface TimeOff { id: string; type: string; start_at: string; end_at: string; reason: string | null }

interface FormData { full_name: string; email: string; phone: string; active: boolean; service_ids: string[] }
const EMPTY_FORM: FormData = { full_name: '', email: '', phone: '', active: true, service_ids: [] }

const WEEKDAYS = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle']
const WEEKDAYS_SHORT = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
const TIME_OFF_TYPES = [
  { value: 'vacation', label: 'Dovolená', icon: '🏖️' },
  { value: 'sick', label: 'Nemocenská', icon: '🤒' },
  { value: 'personal', label: 'Osobní volno', icon: '🏠' },
  { value: 'other', label: 'Jiné', icon: '📌' },
]

const AVATAR_COLORS = [
  'from-blue-500 to-cyan-400', 'from-purple-500 to-pink-400', 'from-amber-500 to-orange-400',
  'from-green-500 to-emerald-400', 'from-red-500 to-rose-400', 'from-indigo-500 to-violet-400',
]

const DEFAULT_HOURS: WorkingHour[] = WEEKDAYS.map((_, i) => ({
  weekday: i, start_time: '08:00', end_time: '17:00', enabled: i < 5,
}))

export default function StaffPage() {
  const { organization } = useAuth()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Working hours state
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null)
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(DEFAULT_HOURS)
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([])
  const [whLoading, setWhLoading] = useState(false)
  const [whSaving, setWhSaving] = useState(false)
  const [showTimeOffForm, setShowTimeOffForm] = useState(false)
  const [toForm, setToForm] = useState({ type: 'vacation', start_at: '', end_at: '', reason: '' })

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteTimer, setDeleteTimer] = useState<NodeJS.Timeout | null>(null)

  const fetchStaff = async () => {
    try { const res = await fetch('/api/staff'); const data = await res.json(); if (Array.isArray(data)) setStaff(data) }
    catch (err) { console.error(err) } finally { setLoading(false) }
  }
  const fetchServices = async () => {
    try { const res = await fetch('/api/services'); const data = await res.json(); if (Array.isArray(data)) setServices(data) }
    catch (err) { console.error(err) }
  }

  useEffect(() => { fetchStaff(); fetchServices() }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (deleteTimer) clearTimeout(deleteTimer) }
  }, [deleteTimer])

  // Fetch working hours
  const fetchWorkingHours = async (staffId: string) => {
    setWhLoading(true)
    try {
      const res = await fetch(`/api/staff/${staffId}/working-hours`)
      const data = await res.json()
      const merged = DEFAULT_HOURS.map(dh => {
        const existing = (data.working_hours || []).find((wh: any) => wh.weekday === dh.weekday)
        return existing
          ? { weekday: existing.weekday, start_time: existing.start_time.substring(0, 5), end_time: existing.end_time.substring(0, 5), enabled: true }
          : { ...dh, enabled: false }
      })
      setWorkingHours(merged)
      setTimeOffs(data.time_off || [])
    } catch (err) { console.error(err) }
    finally { setWhLoading(false) }
  }

  const toggleExpand = (staffId: string) => {
    if (expandedStaff === staffId) { setExpandedStaff(null) }
    else { setExpandedStaff(staffId); fetchWorkingHours(staffId) }
  }

  const saveWorkingHours = async () => {
    if (!expandedStaff) return
    setWhSaving(true)
    try {
      await fetch(`/api/staff/${expandedStaff}/working-hours`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          working_hours: workingHours.map(wh => ({ ...wh, organization_id: organization?.id || null })),
        }),
      })
      alert('Pracovní doba uložena!')
    } catch (err) { console.error(err); alert('Chyba při ukládání') }
    finally { setWhSaving(false) }
  }

  const addTimeOff = async () => {
    if (!expandedStaff || !toForm.start_at || !toForm.end_at) { alert('Vyplňte datum od a do'); return }
    try {
      await fetch(`/api/staff/${expandedStaff}/time-off`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toForm),
      })
      setShowTimeOffForm(false)
      setToForm({ type: 'vacation', start_at: '', end_at: '', reason: '' })
      fetchWorkingHours(expandedStaff)
    } catch (err) { console.error(err) }
  }

  const deleteTimeOff = async (timeOffId: string) => {
    if (!expandedStaff || !confirm('Smazat volno?')) return
    try {
      await fetch(`/api/staff/${expandedStaff}/time-off?time_off_id=${timeOffId}`, { method: 'DELETE' })
      fetchWorkingHours(expandedStaff)
    } catch (err) { console.error(err) }
  }

  const updateWH = (weekday: number, field: string, value: any) => {
    setWorkingHours(prev => prev.map(wh => wh.weekday === weekday ? { ...wh, [field]: value } : wh))
  }

  // Staff CRUD
  const handleNew = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true) }
  const handleEdit = (m: StaffMember) => {
    setForm({ full_name: m.full_name, email: m.email || '', phone: m.phone || '', active: m.active, service_ids: m.staff_services?.map(ss => ss.service_id) || [] })
    setEditingId(m.id); setShowForm(true)
  }
  const handleSave = async () => {
    if (!form.full_name.trim()) { alert('Jméno je povinné'); return }
    setSaving(true)
    const payload = { full_name: form.full_name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null, active: form.active, service_ids: form.service_ids }
    try {
      if (editingId) { await fetch(`/api/staff/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) }
      else { await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) }
      setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); fetchStaff()
    } catch (err) { console.error(err); alert('Chyba při ukládání') }
    finally { setSaving(false) }
  }

  // 🛡️ Dvoustupňové smazání
  const handleDeleteClick = (memberId: string, memberName: string) => {
    if (deleteConfirmId === memberId) {
      // 2. klik — skutečně smazat
      if (deleteTimer) clearTimeout(deleteTimer)
      setDeleteConfirmId(null)
      setDeleteTimer(null)
      handleDeleteConfirmed(memberId, memberName)
    } else {
      // 1. klik — armed state
      if (deleteTimer) clearTimeout(deleteTimer)
      setDeleteConfirmId(memberId)
      const timer = setTimeout(() => {
        setDeleteConfirmId(null)
        setDeleteTimer(null)
      }, 3000)
      setDeleteTimer(timer)
    }
  }

  const handleDeleteConfirmed = async (id: string, name: string) => {
    if (!confirm(`Opravdu smazat "${name}" z týmu? Tato akce je nevratná.`)) return
    try { await fetch(`/api/staff/${id}`, { method: 'DELETE' }); fetchStaff() }
    catch (err) { console.error(err) }
  }

  const toggleService = (id: string) => {
    setForm(prev => ({ ...prev, service_ids: prev.service_ids.includes(id) ? prev.service_ids.filter(x => x !== id) : [...prev.service_ids, id] }))
  }
  const getServiceNames = (m: StaffMember) => {
    if (!m.staff_services?.length) return []
    return m.staff_services.map(ss => services.find(s => s.id === ss.service_id)).filter(Boolean) as Service[]
  }
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const getColor = (i: number) => AVATAR_COLORS[i % AVATAR_COLORS.length]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCircle className="w-7 h-7 text-blue-600" /> Tým
          </h1>
          <p className="mt-1 text-gray-500">Správa členů týmu, pracovní doby a volna ({staff.length} členů)</p>
        </div>
        <button onClick={handleNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Nový člen
        </button>
      </div>

      {/* Formulář nový/edit */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? '✏️ Upravit člena' : '➕ Nový člen týmu'}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celé jméno *</label>
              <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Např. Jana Nováková" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="jana@salon.cz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="+420 777 123 456" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <button onClick={() => setForm({ ...form, active: !form.active })} className={`w-10 h-6 rounded-full transition-colors relative ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${form.active ? 'left-5' : 'left-1'}`} />
              </button>
              <span className="text-sm text-gray-700">{form.active ? 'Aktivní člen' : 'Neaktivní člen'}</span>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Přiřazené služby</label>
              {services.length === 0 ? <p className="text-sm text-gray-400">Žádné služby.</p> : (
                <div className="flex flex-wrap gap-2">
                  {services.map(svc => {
                    const sel = form.service_ids.includes(svc.id)
                    return (
                      <button key={svc.id} onClick={() => toggleService(svc.id)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${sel ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                        style={sel ? { backgroundColor: svc.color, borderColor: svc.color } : {}}>
                        {sel && <Check className="w-3 h-3 inline mr-1" />}{svc.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm disabled:opacity-50 shadow-sm">
              {saving ? 'Ukládám...' : editingId ? 'Uložit změny' : 'Přidat do týmu'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm">Zrušit</button>
          </div>
        </div>
      )}

      {/* Seznam */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Načítám tým...</div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><UserCircle className="w-8 h-8 text-blue-400" /></div>
          <h3 className="text-lg font-semibold text-gray-900">Žádní členové týmu</h3>
          <p className="mt-1 text-gray-500">Přidejte prvního člena týmu</p>
          <button onClick={handleNew} className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm shadow-sm"><Plus className="w-4 h-4" /> Nový člen</button>
        </div>
      ) : (
        <div className="space-y-4">
          {staff.map((member, i) => {
            const memberServices = getServiceNames(member)
            const isExpanded = expandedStaff === member.id
            const isDeleteArmed = deleteConfirmId === member.id
            return (
              <div key={member.id} className={`bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all ${!member.active ? 'opacity-60' : ''}`}>
                {/* Karta člena */}
                <div className="flex items-center gap-4 p-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getColor(i)} text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0`}>
                    {getInitials(member.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{member.full_name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${member.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {member.active ? <><Check className="w-3 h-3" /> Aktivní</> : 'Neaktivní'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                      {member.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</span>}
                      {member.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {member.phone}</span>}
                    </div>
                    {memberServices.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {memberServices.map(svc => (
                          <span key={svc.id} className="px-2 py-0.5 rounded-lg text-xs text-white font-medium" style={{ backgroundColor: svc.color }}>{svc.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleExpand(member.id)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}
                      title="Pracovní doba">
                      <Clock className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(member)} className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors" title="Upravit">
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* 🛡️ Chráněné tlačítko smazat */}
                    <button
                      onClick={() => handleDeleteClick(member.id, member.full_name)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        isDeleteArmed
                          ? 'bg-red-500 text-white shadow-md animate-pulse'
                          : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600'
                      }`}
                      title={isDeleteArmed ? '⚠️ Klikněte znovu pro smazání!' : 'Smazat'}>
                      {isDeleteArmed ? <AlertTriangle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 🛡️ Varování pod kartou */}
                {isDeleteArmed && (
                  <div className="mx-5 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700 animate-pulse">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Klikněte znovu na červené tlačítko pro smazání <strong>{member.full_name}</strong>. Automaticky se zruší za 3s.</span>
                  </div>
                )}

                {/* Rozbalená pracovní doba */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                    {whLoading ? (
                      <div className="text-center py-6 text-gray-400">Načítám pracovní dobu...</div>
                    ) : (
                      <>
                        {/* Pracovní doba tabulka */}
                        <div className="mb-5">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" /> Pracovní doba
                          </h4>
                          <div className="space-y-2">
                            {workingHours.map(wh => (
                              <div key={wh.weekday} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${wh.enabled ? 'bg-white border border-gray-200' : 'bg-gray-100/50'}`}>
                                <button onClick={() => updateWH(wh.weekday, 'enabled', !wh.enabled)}
                                  className={`w-9 h-6 rounded-full transition-colors relative flex-shrink-0 ${wh.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${wh.enabled ? 'left-4' : 'left-1'}`} />
                                </button>
                                <span className={`w-16 text-sm font-medium ${wh.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {WEEKDAYS_SHORT[wh.weekday]}
                                </span>
                                {wh.enabled ? (
                                  <div className="flex items-center gap-2">
                                    <input type="time" value={wh.start_time} onChange={e => updateWH(wh.weekday, 'start_time', e.target.value)}
                                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-28" />
                                    <span className="text-gray-400">—</span>
                                    <input type="time" value={wh.end_time} onChange={e => updateWH(wh.weekday, 'end_time', e.target.value)}
                                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-28" />
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">Volno</span>
                                )}
                              </div>
                            ))}
                          </div>
                          <button onClick={saveWorkingHours} disabled={whSaving}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm">
                            {whSaving ? 'Ukládám...' : '💾 Uložit pracovní dobu'}
                          </button>
                        </div>

                        {/* Volna */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <Palmtree className="w-4 h-4 text-amber-500" /> Volna a absence
                            </h4>
                            <button onClick={() => setShowTimeOffForm(!showTimeOffForm)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                              {showTimeOffForm ? 'Zrušit' : '+ Přidat volno'}
                            </button>
                          </div>

                          {showTimeOffForm && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Typ</label>
                                  <select value={toForm.type} onChange={e => setToForm({ ...toForm, type: e.target.value })}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm">
                                    {TIME_OFF_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Důvod</label>
                                  <input type="text" value={toForm.reason} onChange={e => setToForm({ ...toForm, reason: e.target.value })}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder="Volitelné..." />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Od</label>
                                  <input type="datetime-local" value={toForm.start_at} onChange={e => setToForm({ ...toForm, start_at: e.target.value })}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Do</label>
                                  <input type="datetime-local" value={toForm.end_at} onChange={e => setToForm({ ...toForm, end_at: e.target.value })}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                                </div>
                              </div>
                              <button onClick={addTimeOff} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 shadow-sm">
                                Přidat volno
                              </button>
                            </div>
                          )}

                          {timeOffs.length === 0 ? (
                            <p className="text-xs text-gray-400">Žádná naplánovaná volna</p>
                          ) : (
                            <div className="space-y-2">
                              {timeOffs.map(to => (
                                <div key={to.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5">
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg">{TIME_OFF_TYPES.find(t => t.value === to.type)?.icon || '📌'}</span>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {TIME_OFF_TYPES.find(t => t.value === to.type)?.label || to.type}
                                        {to.reason && <span className="text-gray-400 font-normal"> — {to.reason}</span>}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(to.start_at).toLocaleDateString('cs-CZ')} — {new Date(to.end_at).toLocaleDateString('cs-CZ')}
                                      </p>
                                    </div>
                                  </div>
                                  <button onClick={() => deleteTimeOff(to.id)} className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-gray-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
