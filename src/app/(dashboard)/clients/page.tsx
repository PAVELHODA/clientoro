'use client'

import { useEffect, useState } from 'react'
import { Users, Search, Plus, Phone, Mail, Tag, Calendar, DollarSign, Edit2, Trash2, X, ChevronRight } from 'lucide-react'

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

const EMPTY_FORM: FormData = {
  full_name: '', phone: '', email: '', note: '', source: 'manual', tags: '',
}

const SOURCES = [
  { value: 'manual', label: 'Ručně přidaný', icon: '✏️' },
  { value: 'booking_page', label: 'Booking stránka', icon: '🌐' },
  { value: 'qr', label: 'QR kód', icon: '📱' },
  { value: 'directory', label: 'Katalog', icon: '📋' },
  { value: 'referral', label: 'Doporučení', icon: '👫' },
  { value: 'import', label: 'Import', icon: '📥' },
  { value: 'other', label: 'Jiný', icon: '📌' },
]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

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
    if (!form.full_name.trim() && !form.phone.trim()) { alert('Vyplňte jméno nebo telefon'); return }
    setSaving(true)
    const payload = {
      full_name: form.full_name.trim() || null, phone: form.phone.trim() || null,
      email: form.email.trim() || null, note: form.note.trim() || null, source: form.source,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    try {
      if (editingId) {
        await fetch(`/api/clients/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload) })
      }
      setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); fetchClients()
    } catch (err) { console.error(err); alert('Chyba při ukládání') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Opravdu smazat klienta "${name || 'Bez jména'}"?`)) return
    try { await fetch(`/api/clients/${id}`, { method: 'DELETE' }); setSelectedClient(null); fetchClients() }
    catch (err) { console.error(err) }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (d: string | null) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" /> Klienti
          </h1>
          <p className="mt-1 text-gray-500">Správa klientů ({clients.length} klientů)</p>
        </div>
        <button onClick={handleNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Nový klient
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Hledat klienta (jméno, telefon, email)..." />
      </div>

      {/* Formulář */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? '✏️ Upravit klienta' : '➕ Nový klient'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celé jméno</label>
              <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Např. Jana Nováková" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="+420 777 123 456" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="jana@email.cz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zdroj</label>
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                {SOURCES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Štítky (oddělené čárkou)</label>
              <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="VIP, stálý klient" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poznámka</label>
              <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Interní poznámka..." />
            </div>
          </div>
          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm disabled:opacity-50 shadow-sm">
              {saving ? 'Ukládám...' : editingId ? 'Uložit změny' : 'Vytvořit klienta'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm">
              Zrušit
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
                <h2 className="text-lg font-bold text-gray-900">{selectedClient.full_name || 'Bez jména'}</h2>
                <p className="text-sm text-gray-500">Klient od {new Date(selectedClient.created_at).toLocaleDateString('cs-CZ')}</p>
              </div>
            </div>
            <button onClick={() => setSelectedClient(null)}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Návštěvy</p>
              <p className="text-lg font-bold text-gray-900">{selectedClient.total_visits}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Utraceno</p>
              <p className="text-lg font-bold text-gray-900">{selectedClient.total_spent > 0 ? `${selectedClient.total_spent} Kč` : '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Poslední návštěva</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(selectedClient.last_visit_at)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Zdroj</p>
              <p className="text-lg font-bold text-gray-900">{SOURCES.find(s => s.value === selectedClient.source)?.icon || '📌'} {SOURCES.find(s => s.value === selectedClient.source)?.label || selectedClient.source}</p>
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
              <Edit2 className="w-3.5 h-3.5 inline mr-1" /> Upravit
            </button>
            <button onClick={() => handleDelete(selectedClient.id, selectedClient.full_name || '')}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100">
              <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Smazat
            </button>
          </div>
        </div>
      )}

      {/* Seznam klientů */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Načítám klienty...</div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {search ? 'Žádní klienti nenalezeni' : 'Žádní klienti'}
          </h3>
          <p className="mt-1 text-gray-500">{search ? 'Zkuste jiný výraz' : 'Přidejte svého prvního klienta'}</p>
          {!search && (
            <button onClick={handleNew}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm shadow-sm">
              <Plus className="w-4 h-4" /> Nový klient
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map(client => (
            <div key={client.id}
              onClick={() => setSelectedClient(client)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-sm">
                {getInitials(client.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 truncate">{client.full_name || 'Bez jména'}</span>
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
                  <p className="text-xs text-gray-400">návštěv</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{client.total_spent > 0 ? `${client.total_spent} Kč` : '-'}</p>
                  <p className="text-xs text-gray-400">utraceno</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{formatDate(client.last_visit_at)}</p>
                  <p className="text-xs text-gray-400">poslední</p>
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
          ))}
        </div>
      )}
    </div>
  )
}
