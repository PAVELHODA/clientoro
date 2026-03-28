// PATH: src/app/(dashboard)/services/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useLang } from '@/lib/LangContext'
import { useToast } from '@/components/Toast'
import { getServiceCategories } from '@/lib/serviceCategories'
import { Scissors, Plus, Clock, DollarSign, Eye, EyeOff, Edit2, Trash2, X, Check, Search, ChevronDown } from 'lucide-react'

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
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
]


export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<string>('name_asc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const { organization } = useAuth()
  const { t, lang, modeGradient } = useLang()
  const toast = useToast()

  const toggleCat = (cat: string) => {
    setCollapsedCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const currency = t('currency')
  const CATEGORIES = getServiceCategories(organization?.category, lang)


  const l = {
    title: t('svc_title'),
    subtitle: lang === 'en' ? 'Manage services and pricing' : lang === 'sk' ? 'Sprava sluzieb a cennika' : 'Sprava sluzeb a ceniku',
    newService: t('svc_new'),
    noServices: t('svc_no_services'),
    addFirst: lang === 'en' ? 'Add your first service' : lang === 'sk' ? 'Pridajte svoju prvu sluzbu' : 'Pridejte svou prvni sluzbu',
    name: t('svc_name'),
    duration: t('svc_duration'),
    price: t('svc_price'),
    color: t('svc_color'),
    active: t('svc_active'),
    save: t('svc_save'),
    cancel: t('cli_cancel'),
    saving: lang === 'en' ? 'Saving...' : lang === 'sk' ? 'Ukladam...' : 'Ukladam...',
    editService: lang === 'en' ? 'Edit service' : lang === 'sk' ? 'Upravit sluzbu' : 'Upravit sluzbu',
    newServiceForm: lang === 'en' ? 'New service' : lang === 'sk' ? 'Nova sluzba' : 'Nova sluzba',
    saveChanges: lang === 'en' ? 'Save changes' : lang === 'sk' ? 'Ulozit zmeny' : 'Ulozit zmeny',
    createService: lang === 'en' ? 'Create service' : lang === 'sk' ? 'Vytvorit sluzbu' : 'Vytvorit sluzbu',
    description: lang === 'en' ? 'Description' : 'Popis',
    category: lang === 'en' ? 'Category' : lang === 'sk' ? 'Kategoria' : 'Kategorie',
    visibility: lang === 'en' ? 'Visibility' : lang === 'sk' ? 'Viditelnost' : 'Viditelnost',
    publicVis: lang === 'en' ? 'Public (visible on booking page)' : lang === 'sk' ? 'Verejna (viditelna na booking stranke)' : 'Verejna (viditelna na booking strance)',
    privateVis: lang === 'en' ? 'Private (internal only)' : lang === 'sk' ? 'Sukromna (len interna)' : 'Soukroma (jen interni)',
    bufferBefore: lang === 'en' ? 'Buffer before (min)' : lang === 'sk' ? 'Buffer pred (min)' : 'Buffer pred (min)',
    bufferAfter: lang === 'en' ? 'Buffer after (min)' : lang === 'sk' ? 'Buffer po (min)' : 'Buffer po (min)',
    activeService: lang === 'en' ? 'Active service' : lang === 'sk' ? 'Aktivna sluzba' : 'Aktivni sluzba',
    inactiveService: lang === 'en' ? 'Inactive service' : lang === 'sk' ? 'Neaktivna sluzba' : 'Neaktivni sluzba',
    publicLabel: lang === 'en' ? 'Public' : lang === 'sk' ? 'Verejna' : 'Verejna',
    privateLabel: lang === 'en' ? 'Private' : lang === 'sk' ? 'Sukromna' : 'Soukroma',
    free: lang === 'en' ? 'Free' : 'Zdarma',
    minutes: 'min',
    select: lang === 'en' ? '-- Select --' : '-- Vyberte --',
    calendarColor: lang === 'en' ? 'Calendar color' : lang === 'sk' ? 'Farba v kalendari' : 'Barva v kalendari',
    shortDesc: lang === 'en' ? 'Short description...' : lang === 'sk' ? 'Kratky popis sluzby...' : 'Kratky popis sluzby...',
    loading: lang === 'en' ? 'Loading services...' : lang === 'sk' ? 'Nacitavam sluzby...' : 'Nacitam sluzby...',
    nameRequired: lang === 'en' ? 'Service name is required' : lang === 'sk' ? 'Nazov sluzby je povinny' : 'Nazev sluzby je povinny',
    errorSaving: lang === 'en' ? 'Error saving' : lang === 'sk' ? 'Chyba pri ukladani' : 'Chyba pri ukladani',
    confirmDelete: (name: string) => lang === 'en' ? `Delete service "${name}"?` : lang === 'sk' ? `Zmazat sluzbu "${name}"?` : `Smazat sluzbu "${name}"?`,
    before: lang === 'en' ? 'before' : lang === 'sk' ? 'pred' : 'pred',
    after: lang === 'en' ? 'after' : 'po',
    inactive: lang === 'en' ? 'Inactive' : lang === 'sk' ? 'Neaktivna' : 'Neaktivni',
    eg: lang === 'en' ? 'e.g. Massage' : lang === 'sk' ? 'Napr. Masaz' : 'Napr. Masaz',
    search: lang === 'en' ? 'Search services...' : lang === 'sk' ? 'Hladat sluzby...' : 'Hledat sluzby...',
    allCategories: lang === 'en' ? 'All categories' : lang === 'sk' ? 'Vsetky kategorie' : 'Vsechny kategorie',
    noResults: lang === 'en' ? 'No services found' : lang === 'sk' ? 'Ziadne sluzby nenajdene' : 'Zadne sluzby nenalezeny',
    tryOther: lang === 'en' ? 'Try different search' : lang === 'sk' ? 'Skuste iny vyraz' : 'Zkuste jiny vyraz',
    created: lang === 'en' ? 'Service created!' : lang === 'sk' ? 'Sluzba vytvorena!' : 'Sluzba vytvorena!',
    saved: lang === 'en' ? 'Service saved!' : lang === 'sk' ? 'Sluzba ulozena!' : 'Sluzba ulozena!',
    deleted: lang === 'en' ? 'Service deleted' : lang === 'sk' ? 'Sluzba zmazana' : 'Sluzba smazana',
    uncategorized: lang === 'en' ? 'Uncategorized' : lang === 'sk' ? 'Bez kategorie' : 'Bez kategorie',
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
    if (!form.name.trim()) { toast.warning(l.nameRequired); return }
    setSaving(true)
    const payload = {
      name: form.name.trim(), description: form.description.trim() || null,
      duration: form.duration, price: form.price ? parseFloat(form.price) : null,
      category: form.category || null, color: form.color, visibility: form.visibility,
      buffer_before_minutes: form.buffer_before_minutes,
      buffer_after_minutes: form.buffer_after_minutes, active: form.active,
    }
    try {
      const url = editingId ? `/api/services/${editingId}` : '/api/services'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        toast.success(editingId ? l.saved : l.created)
        setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); fetchServices()
      } else {
        const err = await res.json()
        toast.error(err.error || l.errorSaving)
      }
    } catch (err) { console.error(err); toast.error(l.errorSaving) }
    finally { setSaving(false) }
  }

  const handleDeleteCategory = async (category: string) => {
    const catServices = services.filter(s => s.category === category)
    const msg = lang === 'en' 
      ? `Delete category "${category}" and all ${catServices.length} services in it?`
      : lang === 'sk'
        ? `Zmazať kategóriu "${category}" a všetkých ${catServices.length} služieb v nej?`
        : `Smazat kategorii "${category}" a všech ${catServices.length} služeb v ní?`
    if (!confirm(msg)) return
    let deleted = 0
    for (const svc of catServices) {
      const res = await fetch(`/api/services/${svc.id}`, { method: 'DELETE' })
      if (res.ok) deleted++
    }
    setServices(prev => prev.filter(s => s.category !== category))
    toast.success(lang === 'en' ? `Deleted ${deleted} services` : `Smazáno ${deleted} služeb`)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(l.confirmDelete(name))) return
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(l.deleted)
        fetchServices()
      }
    } catch (err) { console.error(err) }
  }

  const getFilteredServices = () => {
    let filtered = [...services]
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(svc =>
        svc.name.toLowerCase().includes(s) ||
        svc.description?.toLowerCase().includes(s) ||
        svc.category?.toLowerCase().includes(s)
      )
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter(svc => svc.category === filterCategory)
    }
    switch (sortBy) {
      case 'name_asc': return filtered.sort((a, b) => a.name.localeCompare(b.name))
      case 'name_desc': return filtered.sort((a, b) => b.name.localeCompare(a.name))
      
      case 'duration_asc': return filtered.sort((a, b) => a.duration - b.duration)
      case 'duration_desc': return filtered.sort((a, b) => b.duration - a.duration)
      case 'newest': return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      default: return filtered
    }
  }

  const filteredServices = getFilteredServices()
  const usedCategories = [...new Set(services.map(s => s.category).filter(Boolean))] as string[]

  // Group services by category
  const getGroupedServices = () => {
    const grouped: Record<string, Service[]> = {}
    const uncategorized: Service[] = []
    filteredServices.forEach(s => {
      if (s.category) {
        if (!grouped[s.category]) grouped[s.category] = []
        grouped[s.category].push(s)
      } else {
        uncategorized.push(s)
      }
    })
    const categoryOrder = Object.keys(grouped).sort()
    return [
      ...categoryOrder.map(cat => ({ label: cat, services: grouped[cat] })),
      ...(uncategorized.length > 0 ? [{ label: l.uncategorized, services: uncategorized }] : []),
    ]
  }

  const sections = getGroupedServices()
  const showHeaders = sections.length > 1 && filterCategory === 'all'

  const getCategoryBg = (category: string | null) => {
    const map: Record<string, { bg: string; border: string }> = {
      'Kadeřnictví': { bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.15)' },
      'Masáže': { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)' },
      'Nehty': { bg: 'rgba(236,72,153,0.06)', border: 'rgba(236,72,153,0.15)' },
      'Kosmetika': { bg: 'rgba(244,63,94,0.06)', border: 'rgba(244,63,94,0.15)' },
      'Fitness': { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)' },
      'Fyzioterapie': { bg: 'rgba(14,165,233,0.06)', border: 'rgba(14,165,233,0.15)' },
      'Psychologie': { bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.15)' },
      'Tetování': { bg: 'rgba(75,85,99,0.06)', border: 'rgba(75,85,99,0.15)' },
      'Vzdělávání': { bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.15)' },
      'Wellness': { bg: 'rgba(20,184,166,0.06)', border: 'rgba(20,184,166,0.15)' },
    }
    if (!category) return { bg: 'white', border: 'rgb(229,231,235)' }
    return map[category] || { bg: 'white', border: 'rgb(229,231,235)' }
  }

  const ServiceCard = ({ service }: { service: Service }) => {
    const catStyle = getCategoryBg(service.category)
    return (
    <div className={`group flex items-center gap-3 rounded-xl border px-4 py-3 hover:shadow-sm transition-all ${!service.active ? 'opacity-50' : ''}`}
      style={{ backgroundColor: catStyle.bg, borderColor: catStyle.border }}>
      {/* Barva */}
      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: service.color || '#3b82f6' }} />
      
      {/* Název + popis */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{service.name}</h3>
          {!service.active && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] font-medium">{l.inactive}</span>}
          {service.visibility === 'private' && <EyeOff className="w-3 h-3 text-gray-300 flex-shrink-0" />}
        </div>
        {service.description && <p className="text-xs text-gray-400 truncate mt-0.5">{service.description}</p>}
      </div>

      {/* Čas */}
      <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-sm font-medium">{service.duration} {l.minutes}</span>
      </div>

      {/* Cena */}
      <div className="flex-shrink-0 min-w-[80px] text-right">
        <span className="text-sm font-bold text-gray-900">{service.price ? `${service.price.toLocaleString('cs-CZ')} ${currency}` : l.free}</span>
      </div>

      {/* Akce — viditelné na hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => handleEdit(service)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => handleDelete(service.id, service.name)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  )}

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Scissors className="w-7 h-7 text-blue-600" /> {l.title}
          </h1>
          <p className="mt-1 text-gray-500">{l.subtitle} ({filteredServices.length}/{services.length})</p>
        </div>
        <button onClick={handleNew}
          style={{ background: modeGradient }} className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-xl hover:brightness-110 font-medium text-sm shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> {l.newService}
        </button>
      </div>

      {/* Search + Sort + Filter */}
      {services.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder={l.search} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500">
            <option value="name_asc">{lang === 'en' ? 'Name A-Z' : 'Nazev A-Z'}</option>
            <option value="name_desc">{lang === 'en' ? 'Name Z-A' : 'Nazev Z-A'}</option>
            
            <option value="duration_asc">{lang === 'en' ? 'Shortest' : 'Nejkratsi'}</option>
            <option value="duration_desc">{lang === 'en' ? 'Longest' : 'Nejdelsi'}</option>
            <option value="newest">{lang === 'en' ? 'Newest' : 'Nejnovejsi'}</option>
          </select>
          {usedCategories.length > 0 && (
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500">
              <option value="all">{l.allCategories}</option>
              {usedCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      )}

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
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder={l.eg} autoFocus />
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
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${form.color === c ? 'border-gray-900 scale-110 shadow-lg ring-2 ring-offset-1 ring-gray-400' : 'border-transparent hover:scale-110 hover:shadow-md'}`}
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
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{search || filterCategory !== 'all' ? l.noResults : l.noServices}</h3>
          <p className="mt-1 text-gray-500">{search || filterCategory !== 'all' ? l.tryOther : l.addFirst}</p>
          {!search && filterCategory === 'all' && (
            <button onClick={handleNew}
              style={{ background: modeGradient }} className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-xl hover:brightness-110 font-medium text-sm shadow-sm">
              <Plus className="w-4 h-4" /> {l.newService}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map(section => (
            <div key={section.label}>
              {showHeaders && (
                <div className="flex items-center gap-3 mb-2 cursor-pointer select-none group/cat" onClick={() => toggleCat(section.label)}>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${collapsedCats.has(section.label) ? '-rotate-90' : ''}`} />
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{section.label}</h2>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[11px] font-medium">{section.services.length}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                  {section.label !== l.uncategorized && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(section.label) }}
                      className="opacity-0 group-hover/cat:opacity-100 w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-gray-300 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              {!collapsedCats.has(section.label) && (
                <div className="space-y-1.5">
                  {section.services.map(service => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
