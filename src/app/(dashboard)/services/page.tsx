// PATH: src/app/(dashboard)/services/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useLang } from '../layout'
import { Scissors, Plus, Clock, DollarSign, Eye, EyeOff, Edit2, Trash2, X, Check } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number | null
  category: string | null
  color: string
  visibility: string
  buffer_before_minutes: number
  buffer_after_minutes: number
  active: boolean
  created_at: string
}

interface FormData {
  name: string; description: string; duration: number; price: string
  category: string; color: string; visibility: string
  buffer_before_minutes: number; buffer_after_minutes: number; active: boolean
}

const EMPTY_FORM: FormData = {
  name: '', description: '', duration: 60, price: '', category: '',
  color: '#3b82f6', visibility: 'public', buffer_before_minutes: 0,
  buffer_after_minutes: 0, active: true,
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const { t, lang, modeGradient } = useLang()

  const currency = t('currency')

  const CATEGORIES = lang === 'en'
    ? ['Haircut', 'Coloring', 'Styling', 'Massage', 'Cosmetics', 'Nails', 'Physiotherapy', 'Other']
    : lang === 'sk'
    ? ['Strihanie', 'Farbenie', 'Styling', 'Masáže', 'Kozmetika', 'Nechty', 'Fyzioterapia', 'Ostatné']
    : ['Střihání', 'Barvení', 'Styling', 'Masáže', 'Kosmetika', 'Nehty', 'Fyzioterapie', 'Ostatní']

  const l = {
    title: t('svc_title'),
    subtitle: lang === 'en' ? `Manage services and pricing (${services.length} services)` : lang === 'sk' ? `Správa služieb a cenníka (${services.length} služieb)` : `Správa služeb a ceníku (${services.length} služeb)`,
    newService: t('svc_new'),
    noServices: t('svc_no_services'),
    addFirst: lang === 'en' ? 'Add your first service' : lang === 'sk' ? 'Pridajte svoju prvú službu' : 'Přidejte svou první službu',
    name: t('svc_name'),
    duration: t('svc_duration'),
    price: t('svc_price'),
    color: t('svc_color'),
    active: t('svc_active'),
    save: t('svc_save'),
    cancel: t('cli_cancel'),
    saving: lang === 'en' ? 'Saving...' : lang === 'sk' ? 'Ukladám...' : 'Ukládám...',
    editService: lang === 'en' ? '✏️ Edit service' : lang === 'sk' ? '✏️ Upraviť službu' : '✏️ Upravit službu',
    newServiceForm: lang === 'en' ? '➕ New service' : lang === 'sk' ? '➕ Nová služba' : '➕ Nová služba',
    saveChanges: lang === 'en' ? 'Save changes' : lang === 'sk' ? 'Uložiť zmeny' : 'Uložit změny',
    createService: lang === 'en' ? 'Create service' : lang === 'sk' ? 'Vytvoriť službu' : 'Vytvořit službu',
    description: lang === 'en' ? 'Description' : 'Popis',
    category: lang === 'en' ? 'Category' : lang === 'sk' ? 'Kategória' : 'Kategorie',
    visibility: lang === 'en' ? 'Visibility' : lang === 'sk' ? 'Viditeľnosť' : 'Viditelnost',
    publicVis: lang === 'en' ? '🌐 Public (visible on booking page)' : lang === 'sk' ? '🌐 Verejná (viditeľná na booking stránke)' : '🌐 Veřejná (viditelná na booking stránce)',
    privateVis: lang === 'en' ? '🔒 Private (internal only)' : lang === 'sk' ? '🔒 Súkromná (len interná)' : '🔒 Soukromá (jen interní)',
    bufferBefore: lang === 'en' ? 'Buffer before (min)' : lang === 'sk' ? 'Buffer pred (min)' : 'Buffer před (min)',
    bufferAfter: lang === 'en' ? 'Buffer after (min)' : lang === 'sk' ? 'Buffer po (min)' : 'Buffer po (min)',
    activeService: lang === 'en' ? 'Active service' : lang === 'sk' ? 'Aktívna služba' : 'Aktivní služba',
    inactiveService: lang === 'en' ? 'Inactive service' : lang === 'sk' ? 'Neaktívna služba' : 'Neaktivní služba',
    publicLabel: lang === 'en' ? 'Public' : lang === 'sk' ? 'Verejná' : 'Veřejná',
    privateLabel: lang === 'en' ? 'Private' : lang === 'sk' ? 'Súkromná' : 'Soukromá',
    free: lang === 'en' ? 'Free' : 'Zdarma',
    minutes: 'min',
    select: lang === 'en' ? '-- Select --' : '-- Vyberte --',
    calendarColor: lang === 'en' ? 'Calendar color' : lang === 'sk' ? 'Farba v kalendári' : 'Barva v kalendáři',
    shortDesc: lang === 'en' ? 'Short description...' : lang === 'sk' ? 'Krátky popis služby...' : 'Krátký popis služby...',
    loading: lang === 'en' ? 'Loading services...' : lang === 'sk' ? 'Načítavam služby...' : 'Načítám služby...',
    nameRequired: lang === 'en' ? 'Service name is required' : lang === 'sk' ? 'Názov služby je povinný' : 'Název služby je povinný',
    errorSaving: lang === 'en' ? 'Error saving' : lang === 'sk' ? 'Chyba pri ukladaní' : 'Chyba při ukládání',
    confirmDelete: (name: string) => lang === 'en' ? `Delete service "${name}"?` : lang === 'sk' ? `Zmazať službu "${name}"?` : `Smazat službu "${name}"?`,
    before: lang === 'en' ? 'before' : lang === 'sk' ? 'pred' : 'před',
    after: lang === 'en' ? 'after' : 'po',
    inactive: lang === 'en' ? 'Inactive' : lang === 'sk' ? 'Neaktívna' : 'Neaktivní',
    eg: lang === 'en' ? 'e.g. Massage' : lang === 'sk' ? 'Napr. Masáž' : 'Např. Masáž',
  }

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      if (Array.isArray(data)) setServices(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchServices() }, [])

  const handleNew = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true) }

  const handleEdit = (s: Service) => {
    setForm({
      name: s.name, description: s.description || '', duration: s.duration,
      price: s.price?.toString() || '', category: s.category || '',
      color: s.color || '#3b82f6', visibility: s.visibility || 'public',
      buffer_before_minutes: s.buffer_before_minutes || 0,
      buffer_after_minutes: s.buffer_after_minutes || 0, active: s.active,
    })
    setEditingId(s.id); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { alert(l.nameRequired); return }
    setSaving(true)
    const payload = {
      name: form.name.trim(), description: form.description.trim() || null,
      duration: form.duration, price: form.price ? parseFloat(form.price) : null,
      category: form.category || null, color: form.color, visibility: form.visibility,
      buffer_before_minutes: form.buffer_before_minutes,
      buffer_after_minutes: form.buffer_after_minutes, active: form.active,
    }
    try {
      if (editingId) {
        await fetch(`/api/services/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      }
      setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); fetchServices()
    } catch (err) { console.error(err); alert(l.errorSaving) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(l.confirmDelete(name))) return
    try { await fetch(`/api/services/${id}`, { method: 'DELETE' }); fetchServices() }
    catch (err) { console.error(err) }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Scissors className="w-7 h-7 text-blue-600" /> {l.title}
          </h1>
          <p className="mt-1 text-gray-500">{l.subtitle}</p>
        </div>
        <button onClick={handleNew}
          style={{ background: modeGradient }} className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-xl hover:brightness-110 font-medium text-sm shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> {l.newService}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? l.editService : l.newServiceForm}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.name} *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder={l.eg} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.duration}</label>
              <select value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                {[15, 30, 45, 60, 75, 90, 120, 150, 180].map(m => <option key={m} value={m}>{m} {l.minutes}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.price} ({currency})</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="800" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.category}</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                <option value="">{l.select}</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.description}</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" rows={2} placeholder={l.shortDesc} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{l.calendarColor}</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    className={`w-9 h-9 rounded-xl border-2 transition-all ${form.color === c ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.visibility}</label>
              <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                <option value="public">{l.publicVis}</option>
                <option value="private">{l.privateVis}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.bufferBefore}</label>
              <input type="number" value={form.buffer_before_minutes}
                onChange={e => setForm({ ...form, buffer_before_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" min="0" step="5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.bufferAfter}</label>
              <input type="number" value={form.buffer_after_minutes}
                onChange={e => setForm({ ...form, buffer_after_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" min="0" step="5" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setForm({ ...form, active: !form.active })}
                className={`w-10 h-6 rounded-full transition-colors relative ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${form.active ? 'left-5' : 'left-1'}`} />
              </button>
              <span className="text-sm text-gray-700">{form.active ? l.activeService : l.inactiveService}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving}
              style={{ background: modeGradient }} className="px-5 py-2.5 text-white rounded-xl hover:brightness-110 font-medium text-sm disabled:opacity-50 shadow-sm">
              {saving ? l.saving : editingId ? l.saveChanges : l.createService}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm">
              {l.cancel}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">{l.loading}</div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{l.noServices}</h3>
          <p className="mt-1 text-gray-500">{l.addFirst}</p>
          <button onClick={handleNew}
            style={{ background: modeGradient }} className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-xl hover:brightness-110 font-medium text-sm shadow-sm">
            <Plus className="w-4 h-4" /> {l.newService}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <div key={service.id}
              className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all ${!service.active ? 'opacity-60' : ''}`}>
              <div className="h-2" style={{ backgroundColor: service.color || '#3b82f6' }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">{service.name}</h3>
                    {service.category && <span className="text-xs text-gray-400 font-medium">{service.category}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    {service.visibility === 'public' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium"><Eye className="w-3 h-3" /> {l.publicLabel}</span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium"><EyeOff className="w-3 h-3" /> {l.privateLabel}</span>
                    )}
                  </div>
                </div>
                {service.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{service.description}</p>}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /><span className="text-sm font-semibold text-blue-700">{service.duration} {l.minutes}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
                    <DollarSign className="w-3.5 h-3.5 text-green-500" /><span className="text-sm font-semibold text-green-700">{service.price ? `${service.price} ${currency}` : l.free}</span>
                  </div>
                </div>
                {(service.buffer_before_minutes > 0 || service.buffer_after_minutes > 0) && (
                  <div className="flex gap-2 mb-4">
                    {service.buffer_before_minutes > 0 && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">⏪ {service.buffer_before_minutes} min {l.before}</span>}
                    {service.buffer_after_minutes > 0 && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">⏩ {service.buffer_after_minutes} min {l.after}</span>}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${service.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {service.active ? <><Check className="w-3 h-3" /> {l.active}</> : l.inactive}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(service)} className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(service.id, service.name)} className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

