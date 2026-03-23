// PATH: src/app/(dashboard)/clients/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/LangContext'
import { useToast } from '@/components/Toast'
import { Users, Search, Plus, Phone, Mail, Edit2, Trash2, X, ChevronRight } from 'lucide-react'

interface Client {
  id: string
  full_name: string | null
  phone: string | null
  email: string | null
  note: string | null
  source: string
  tags: string[]
  total_visits: number
  total_spent: number
  last_visit_at: string | null
  created_at: string
}

interface FormData {
  full_name: string; phone: string; email: string; note: string; source: string; tags: string
}

const EMPTY_FORM: FormData = { full_name: '', phone: '', email: '', note: '', source: 'manual', tags: '' }

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [sortBy, setSortBy] = useState<string>('name_asc')
  const [filterSource, setFilterSource] = useState<string>('all')
  const { t, lang, modeGradient } = useLang()
  const toast = useToast()

  const locale = lang === 'sk' ? 'sk-SK' : lang === 'en' ? 'en-US' : 'cs-CZ'
  const currency = t('currency')

  const SOURCES = [
    { value: 'manual', label: lang === 'en' ? 'Manual' : lang === 'sk' ? 'Ručne pridaný' : 'Ručně přidaný', icon: '✏️' },
    { value: 'booking_page', label: lang === 'en' ? 'Booking page' : 'Booking stránka', icon: '🌐' },
    { value: 'qr', label: lang === 'en' ? 'QR code' : 'QR kód', icon: '📱' },
    { value: 'directory', label: lang === 'en' ? 'Directory' : lang === 'sk' ? 'Katalóg' : 'Katalog', icon: '📋' },
    { value: 'referral', label: lang === 'en' ? 'Referral' : lang === 'sk' ? 'Odporúčanie' : 'Doporučení', icon: '👫' },
    { value: 'import', label: 'Import', icon: '📥' },
    { value: 'other', label: lang === 'en' ? 'Other' : lang === 'sk' ? 'Iný' : 'Jiný', icon: '📌' },
  ]

  const l = {
    title: t('cli_title'),
    subtitle: lang === 'en' ? 'Client management' : lang === 'sk' ? 'Správa klientov' : 'Správa klientů',
    newClient: t('cli_new'),
    search: t('cli_search'),
    noClients: t('cli_no_clients'),
    addFirst: t('cli_add_first'),
    noResults: lang === 'en' ? 'No clients found' : lang === 'sk' ? 'Žiadni klienti nenájdení' : 'Žádní klienti nenalezeni',
    tryOther: lang === 'en' ? 'Try different search' : lang === 'sk' ? 'Skúste iný výraz' : 'Zkuste jiný výraz',
    visits: t('cli_visits'),
    spent: t('cli_spent'),
    lastVisit: t('cli_last_visit'),
    source: t('cli_source'),
    edit: t('cli_edit'),
    delete: t('cli_delete'),
    name: t('cli_name'),
    phone: t('cli_phone'),
    email: t('cli_email'),
    note: t('cli_note'),
    save: t('cli_save'),
    cancel: t('cli_cancel'),
    saving: lang === 'en' ? 'Saving...' : lang === 'sk' ? 'Ukladám...' : 'Ukládám...',
    editClient: lang === 'en' ? '✏️ Edit client' : lang === 'sk' ? '✏️ Upraviť klienta' : '✏️ Upravit klienta',
    newClientForm: lang === 'en' ? '➕ New client' : lang === 'sk' ? '➕ Nový klient' : '➕ Nový klient',
    saveChanges: lang === 'en' ? 'Save changes' : lang === 'sk' ? 'Uložiť zmeny' : 'Uložit změny',
    createClient: lang === 'en' ? 'Create client' : lang === 'sk' ? 'Vytvoriť klienta' : 'Vytvořit klienta',
    fullName: lang === 'en' ? 'Full name' : lang === 'sk' ? 'Celé meno' : 'Celé jméno',
    tags: lang === 'en' ? 'Tags (comma separated)' : lang === 'sk' ? 'Štítky (oddelené čiarkou)' : 'Štítky (oddělené čárkou)',
    internalNote: lang === 'en' ? 'Internal note' : lang === 'sk' ? 'Interná poznámka' : 'Interní poznámka',
    clientSince: lang === 'en' ? 'Client since' : lang === 'sk' ? 'Klient od' : 'Klient od',
    noName: lang === 'en' ? 'No name' : lang === 'sk' ? 'Bez mena' : 'Bez jména',
    last: lang === 'en' ? 'last' : lang === 'sk' ? 'posledná' : 'poslední',
    loading: lang === 'en' ? 'Loading clients...' : lang === 'sk' ? 'Načítavam klientov...' : 'Načítám klienty...',
    confirmDelete: (name: string) => lang === 'en' ? `Delete client "${name}"?` : lang === 'sk' ? `Zmazať klienta "${name}"?` : `Smazat klienta "${name}"?`,
    fillRequired: lang === 'en' ? 'Fill in name or phone' : lang === 'sk' ? 'Vyplňte meno alebo telefón' : 'Vyplňte jméno nebo telefon',
    errorSaving: lang === 'en' ? 'Error saving' : lang === 'sk' ? 'Chyba pri ukladaní' : 'Chyba při ukládání',
    saved: lang === 'en' ? 'Client saved!' : lang === 'sk' ? 'Klient uložený!' : 'Klient uložen!',
    created: lang === 'en' ? 'Client created!' : lang === 'sk' ? 'Klient vytvorený!' : 'Klient vytvořen!',
    deleted: lang === 'en' ? 'Client deleted' : lang === 'sk' ? 'Klient zmazaný' : 'Klient smazán',
    namePlaceholder: lang === 'en' ? 'e.g. Jane Smith' : lang === 'sk' ? 'Napr. Jana Nováková' : 'Např. Jana Nováková',
    close: lang === 'en' ? 'Close' : lang === 'sk' ? 'Zavrieť' : 'Zavřít',
  }

  const fetchClients = async () => {
    try {
      const url = search ? `/api/clients?search=${encodeURIComponent(search)}` : '/api/clients'
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data)) setClients(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchClients() }, [search])

  const handleNew = () => { setForm(EMPTY_FORM); setEditingId(null); setSelectedClient(null); setShowForm(true) }

  const handleEdit = (client: Client) => {
    setForm({
      full_name: client.full_name || '', phone: client.phone || '', email: client.email || '',
      note: client.note || '', source: client.source || 'manual', tags: client.tags?.join(', ') || '',
    })
    setEditingId(client.id); setSelectedClient(null); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.full_name.trim() && !form.phone.trim()) { toast.warning(l.fillRequired); return }
    setSaving(true)
    const payload = {
      full_name: form.full_name.trim() || null, phone: form.phone.trim() || null,
      email: form.email.trim() || null, note: form.note.trim() || null, source: form.source,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    try {
      const url = editingId ? `/api/clients/${editingId}` : '/api/clients'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

      if (res.ok) {
        toast.success(editingId ? l.saved : l.created)
        setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); fetchClients()
      } else {
        const err = await res.json()
        toast.error(err.error || l.errorSaving)
      }
    } catch (err) { console.error(err); toast.error(l.errorSaving) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(l.confirmDelete(name || l.noName))) return
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(l.deleted)
        setSelectedClient(null); fetchClients()
      }
    } catch (err) { console.error(err) }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (d: string | null) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  }

  const getSortedClients = () => {
    let filtered = [...clients]
    if (filterSource !== 'all') {
      filtered = filtered.filter(c => c.source === filterSource)
    }
    switch (sortBy) {
      case 'name_asc': return filtered.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', locale))
      case 'name_desc': return filtered.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || '', locale))
      case 'visits_desc': return filtered.sort((a, b) => b.total_visits - a.total_visits)
      case 'visits_asc': return filtered.sort((a, b) => a.total_visits - b.total_visits)
      case 'spent_desc': return filtered.sort((a, b) => b.total_spent - a.total_spent)
      case 'spent_asc': return filtered.sort((a, b) => a.total_spent - b.total_spent)
      case 'recent': return filtered.sort((a, b) => new Date(b.last_visit_at || 0).getTime() - new Date(a.last_visit_at || 0).getTime())
      case 'newest': return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'oldest': return filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      default: return filtered
    }
  }

  const sortedClients = getSortedClients()

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" /> {l.title}
          </h1>
          <p className="mt-1 text-gray-500">{l.subtitle} ({sortedClients.length}/{clients.length})</p>
        </div>
        <button onClick={handleNew}
          style={{ background: modeGradient }} className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-xl hover:brightness-110 font-medium text-sm shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> {l.newClient}
        </button>
      </div>

      {/* Search + Sort + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder={l.search} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500">
          <option value="name_asc">{lang === 'en' ? '↑ Name A-Z' : '↑ Jméno A-Z'}</option>
          <option value="name_desc">{lang === 'en' ? '↓ Name Z-A' : '↓ Jméno Z-A'}</option>
          <option value="visits_desc">{lang === 'en' ? '↓ Most visits' : '↓ Nejvíce návštěv'}</option>
          <option value="visits_asc">{lang === 'en' ? '↑ Least visits' : '↑ Nejméně návštěv'}</option>
          <option value="spent_desc">{lang === 'en' ? '↓ Most spent' : '↓ Nejvíce utraceno'}</option>
          <option value="spent_asc">{lang === 'en' ? '↑ Least spent' : '↑ Nejméně utraceno'}</option>
          <option value="recent">{lang === 'en' ? '↓ Last visit' : '↓ Poslední návštěva'}</option>
          <option value="newest">{lang === 'en' ? '↓ Newest' : '↓ Nejnovější'}</option>
          <option value="oldest">{lang === 'en' ? '↑ Oldest' : '↑ Nejstarší'}</option>
        </select>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500">
          <option value="all">{lang === 'en' ? 'All sources' : 'Všechny zdroje'}</option>
          {SOURCES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
        </select>
      </div>

      {/* Formulář — nový klient / editace */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? l.editClient : l.newClientForm}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.fullName}</label>
              <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder={l.namePlaceholder} autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.phone}</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="+420 777 123 456" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.email}</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="jana@email.cz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.source}</label>
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                {SOURCES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.tags}</label>
              <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="VIP, stálý klient" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l.internalNote}</label>
              <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder={lang === 'en' ? 'Internal note...' : 'Interní poznámka...'} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving}
              style={{ background: modeGradient }} className="px-5 py-2.5 text-white rounded-xl hover:brightness-110 font-medium text-sm disabled:opacity-50">
              {saving ? l.saving : editingId ? l.saveChanges : l.createClient}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm">
              {l.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Detail klienta */}
      {selectedClient && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {getInitials(selectedClient.full_name)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedClient.full_name || l.noName}</h2>
                <p className="text-sm text-gray-500">{l.clientSince} {new Date(selectedClient.created_at).toLocaleDateString(locale)}</p>
              </div>
            </div>
            <button onClick={() => setSelectedClient(null)}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">{l.visits}</p>
              <p className="text-lg font-bold text-gray-900">{selectedClient.total_visits}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">{l.spent}</p>
              <p className="text-lg font-bold text-gray-900">{selectedClient.total_spent > 0 ? `${selectedClient.total_spent} ${currency}` : '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">{l.lastVisit}</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(selectedClient.last_visit_at)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">{l.source}</p>
              <p className="text-sm font-bold text-gray-900">{SOURCES.find(s => s.value === selectedClient.source)?.icon || '📌'} {SOURCES.find(s => s.value === selectedClient.source)?.label || selectedClient.source}</p>
            </div>
          </div>
          {selectedClient.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedClient.tags.map((tag, i) => (
                <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">{tag}</span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            {selectedClient.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selectedClient.phone}</span>}
            {selectedClient.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedClient.email}</span>}
          </div>
          {selectedClient.note && <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">📝 {selectedClient.note}</p>}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <button onClick={() => handleEdit(selectedClient)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100">
              <Edit2 className="w-3.5 h-3.5 inline mr-1" /> {l.edit}
            </button>
            <button onClick={() => handleDelete(selectedClient.id, selectedClient.full_name || '')}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100">
              <Trash2 className="w-3.5 h-3.5 inline mr-1" /> {l.delete}
            </button>
          </div>
        </div>
      )}

      {/* Seznam klientů */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">{l.loading}</div>
      ) : sortedClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{search || filterSource !== 'all' ? l.noResults : l.noClients}</h3>
          <p className="mt-1 text-gray-500">{search || filterSource !== 'all' ? l.tryOther : l.addFirst}</p>
          {!search && filterSource === 'all' && (
            <button onClick={handleNew}
              style={{ background: modeGradient }} className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-xl hover:brightness-110 font-medium text-sm shadow-sm">
              <Plus className="w-4 h-4" /> {l.newClient}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedClients.map(client => (
            <div key={client.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all">
              <div onClick={() => setSelectedClient(client)}
                className="p-4 cursor-pointer flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-sm">
                  {getInitials(client.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 truncate">{client.full_name || l.noName}</span>
                    {client.tags?.slice(0, 2).map((tag, i) => (
                      <span key={i} className="hidden sm:inline px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">{tag}</span>
                    ))}
                    {client.tags?.length > 2 && <span className="hidden sm:inline text-xs text-gray-400">+{client.tags.length - 2}</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-gray-400">
                    {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</span>}
                    {client.email && <span className="hidden sm:flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>}
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{client.total_visits}</p>
                    <p className="text-xs text-gray-400">{l.visits}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{client.total_spent > 0 ? `${client.total_spent} ${currency}` : '-'}</p>
                    <p className="text-xs text-gray-400">{l.spent}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{formatDate(client.last_visit_at)}</p>
                    <p className="text-xs text-gray-400">{l.last}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleEdit(client)}
                    className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(client.id, client.full_name || '')}
                    className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
