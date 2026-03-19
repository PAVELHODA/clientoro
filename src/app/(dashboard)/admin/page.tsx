﻿'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/lib/LangContext'
import { Crown, Users, Calendar, Building2, Eye, Loader2, Shield, Bell, Plus, Trash2, ChevronDown, ChevronUp, Layers } from 'lucide-react'

type Tab = 'dashboard' | 'categories' | 'organizations' | 'golden'

export default function AdminPage() {
  const { t, lang, modeGradient } = useLang()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [orgs, setOrgs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [goldenThoughts, setGoldenThoughts] = useState<any[]>([])
  const [newThought, setNewThought] = useState('')
  const [editThoughtId, setEditThoughtId] = useState<string|null>(null)
  const [editThoughtText, setEditThoughtText] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSuperadmin, setIsSuperadmin] = useState(false)
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('💼')
  const [newTplName, setNewTplName] = useState('')
  const [newTplPrice, setNewTplPrice] = useState('')
  const [newTplDuration, setNewTplDuration] = useState('60')
  const [newTplCatId, setNewTplCatId] = useState('')

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const [statsRes, catsRes, goldenRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/categories'),
          fetch('/api/admin/golden-thoughts'),
        ])
        if (statsRes.ok) {
          const data = await statsRes.json()
          setOrgs(data.organizations || [])
          setStats(data.stats || {})
          setIsSuperadmin(true)
        }
        if (catsRes.ok) {
          const catsData = await catsRes.json()
          const goldenD = goldenRes.ok ? await goldenRes.json().catch(() => []) : []
          setGoldenThoughts(Array.isArray(goldenD) ? goldenD : [])
          setCategories(Array.isArray(catsData) ? catsData : [])
        }
      } catch (e) {
        setIsSuperadmin(false)
      } finally {
        setLoading(false)
      }
    }
    fetchAdmin()
  }, [])

  const addCategory = async () => {
    if (!newCatName) return
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const res = await fetch('/api/admin/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'category', name: newCatName, slug, icon: newCatIcon }),
    })
    if (res.ok) {
      const cat = await res.json()
      setCategories(prev => [...prev, { ...cat, service_templates: [] }])
      setNewCatName(''); setNewCatIcon('💼')
    }
  }

  const addTemplate = async (catId: string) => {
    if (!newTplName || !newTplPrice) return
    const res = await fetch('/api/admin/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'template', category_id: catId, name: newTplName, price: parseFloat(newTplPrice), duration: parseInt(newTplDuration), color: '#3b82f6' }),
    })
    if (res.ok) {
      const tpl = await res.json()
      setCategories(prev => prev.map(c => c.id === catId ? { ...c, service_templates: [...(c.service_templates || []), tpl] } : c))
      setNewTplName(''); setNewTplPrice(''); setNewTplDuration('60'); setNewTplCatId('')
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Smazat kategorii a všechny její šablony?')) return
    await fetch(`/api/admin/categories?id=${id}&type=category`, { method: 'DELETE' })
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const deleteTemplate = async (catId: string, tplId: string) => {
    await fetch(`/api/admin/categories?id=${tplId}&type=template`, { method: 'DELETE' })
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, service_templates: c.service_templates.filter((t: any) => t.id !== tplId) } : c))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  if (!isSuperadmin) return (
    <div className="text-center py-20">
      <Shield className="w-12 h-12 text-red-300 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-gray-900 mb-2">Přístup odepřen</h2>
      <p className="text-gray-500">Tato stránka je pouze pro superadmina.</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-6 h-6 text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-900">Superadmin</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {(['dashboard', 'categories', 'organizations', 'golden'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t === 'dashboard' ? '📊 Dashboard' : t === 'categories' ? '📋 Kategorie' : t === 'organizations' ? '🏢 Organizace' : '💡 Zlaté myšlenky'}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2"><Building2 className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-500">Organizace</span></div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalOrgs || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-500">Uživatelé</span></div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2"><Calendar className="w-4 h-4 text-purple-500" /><span className="text-xs text-gray-500">Rezervace</span></div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2"><Bell className="w-4 h-4 text-amber-500" /><span className="text-xs text-gray-500">Notifikace</span></div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalNotifications || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2"><Layers className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-500">Kategorie</span></div>
            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2"><Layers className="w-4 h-4 text-cyan-500" /><span className="text-xs text-gray-500">Šablony služeb</span></div>
            <p className="text-2xl font-bold text-gray-900">{categories.reduce((sum, c) => sum + (c.service_templates?.length || 0), 0)}</p>
          </div>
        </div>
      )}

      {tab === 'categories' && (
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">➕ Nová kategorie</p>
            <div className="flex gap-2">
              <input type="text" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} className="w-14 px-2 py-2 border border-gray-200 rounded-lg text-center text-lg" placeholder="💼" />
              <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Název kategorie" />
              <button onClick={addCategory} disabled={!newCatName} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-amber-600"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}>
                  <span className="text-xl">{cat.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{cat.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{cat.service_templates?.length || 0} šablon</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteCategory(cat.id) }} className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-gray-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  {expandedCat === cat.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {expandedCat === cat.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    {cat.service_templates?.map((tpl: any) => (
                      <div key={tpl.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: tpl.color || '#3b82f6' }} />
                        <span className="flex-1 text-sm text-gray-700">{tpl.name}</span>
                        <span className="text-xs text-gray-400">{tpl.duration} min</span>
                        <span className="text-sm font-medium text-gray-900">{tpl.price} Kč</span>
                        <button onClick={() => deleteTemplate(cat.id, tpl.id)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-gray-300"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}

                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                      <input type="text" value={newTplCatId === cat.id ? newTplName : ''} onChange={e => { setNewTplCatId(cat.id); setNewTplName(e.target.value) }}
                        className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs" placeholder="Název služby" />
                      <input type="number" value={newTplCatId === cat.id ? newTplPrice : ''} onChange={e => { setNewTplCatId(cat.id); setNewTplPrice(e.target.value) }}
                        className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs" placeholder="Cena" />
                      <select value={newTplCatId === cat.id ? newTplDuration : '60'} onChange={e => { setNewTplCatId(cat.id); setNewTplDuration(e.target.value) }}
                        className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
                        {[15,30,45,60,75,90,120].map(d => <option key={d} value={d}>{d}m</option>)}
                      </select>
                      <button onClick={() => addTemplate(cat.id)} disabled={!newTplName || !newTplPrice || newTplCatId !== cat.id}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'organizations' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Název</th>
                <th className="text-left p-3 font-medium text-gray-600">Mód</th>
                <th className="text-left p-3 font-medium text-gray-600">Kategorie</th>
                <th className="text-center p-3 font-medium text-gray-600">Staff</th>
                <th className="text-center p-3 font-medium text-gray-600">Služby</th>
                <th className="text-center p-3 font-medium text-gray-600">Klienti</th>
                <th className="text-center p-3 font-medium text-gray-600">Rezervace</th>
                <th className="text-center p-3 font-medium text-gray-600">Akce</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org: any) => (
                <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{org.name}</td>
                  <td className="p-3">
                    <span className={'px-2 py-1 rounded-full text-xs font-medium ' +
                      (org.mode === 'solo' ? 'bg-emerald-100 text-emerald-700' :
                       org.mode === 'team' ? 'bg-blue-100 text-blue-700' :
                       org.mode === 'solo_inspire' ? 'bg-amber-100 text-amber-700' :
                       'bg-purple-100 text-purple-700')}>
                      {org.mode}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{org.category || '-'}</td>
                  <td className="p-3 text-center font-medium">{org.staff_count || 0}</td>
                  <td className="p-3 text-center font-medium">{org.services_count || 0}</td>
                  <td className="p-3 text-center font-medium">{org.clients_count || 0}</td>
                  <td className="p-3 text-center font-medium">{org.bookings_count || 0}</td>
                  <td className="p-3 text-center">
                    <button onClick={async () => {
                      if (!confirm('Opravdu smazat organizaci ' + org.name + '?')) return
                      if (!confirm('POZOR: Tato akce je NEVRATNA! Vsechna data budou smazana.')) return
                      const r = await fetch('/api/admin/delete-org', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orgId: org.id }) })
                      if (r.ok) { alert('Organizace ' + org.name + ' smazana.'); setOrgs(orgs.filter((o: any) => o.id !== org.id)) }
                      else { const d = await r.json(); alert('Chyba: ' + (d.error || 'Neznama chyba')) }
                    }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Smazat organizaci">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'golden' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input type="text" value={newThought} onChange={e => setNewThought(e.target.value)} placeholder="Nová zlatá myšlenka..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <button onClick={async () => { if (!newThought.trim()) return; const r = await fetch('/api/admin/golden-thoughts', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text: newThought }) }); if (r.ok) { const d = await r.json(); setGoldenThoughts(prev => [...prev, d]); setNewThought('') } }} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">Přidat</button>
          </div>
          <div className="space-y-2">
            {goldenThoughts.map(gt => (
              <div key={gt.id} className="bg-white rounded-xl border border-gray-200 p-4">
                {editThoughtId === gt.id ? (
                  <div className="space-y-3">
                    <input type="text" value={editThoughtText} onChange={e => setEditThoughtText(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" style={{fontFamily:'Poppins,sans-serif'}} />
                    <div className="flex flex-wrap gap-2">
                      {['solo','team','solo_inspire','pro_inspire'].map(mode => {
                        const active = (gt.modes||[]).includes(mode);
                        return <button key={mode} onClick={() => { const newModes = active ? gt.modes.filter((m: string) => m !== mode) : [...(gt.modes||[]), mode]; setGoldenThoughts(prev => prev.map(g => g.id === gt.id ? {...g, modes: newModes} : g)) }} className={`px-2 py-1 rounded text-xs font-medium border ${active ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>{mode}</button>
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={async () => { const updatedGt = goldenThoughts.find(g => g.id === gt.id); const r = await fetch('/api/admin/golden-thoughts', { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: gt.id, text: editThoughtText, author: updatedGt?.author, modes: updatedGt?.modes, active: updatedGt?.active }) }); if (r.ok) { setGoldenThoughts(prev => prev.map(g => g.id === gt.id ? {...g, text: editThoughtText} : g)); setEditThoughtId(null) } }} className="px-3 py-2 bg-green-500 text-white rounded-lg text-xs">Uložit</button>
                      <button onClick={() => setEditThoughtId(null)} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs">Zrušit</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900" style={{fontFamily:'Poppins,sans-serif'}}>{gt.text}</p>
                      <div className="flex gap-1 mt-1">{(gt.modes||[]).map((m: string) => <span key={m} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">{m}</span>)}</div>
                    </div>
                    <button onClick={() => { setEditThoughtId(gt.id); setEditThoughtText(gt.text) }} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100">Upravit</button>
                    <button onClick={async () => { if (!confirm('Smazat?')) return; await fetch('/api/admin/golden-thoughts?id='+gt.id, { method: 'DELETE' }); setGoldenThoughts(prev => prev.filter(g => g.id !== gt.id)) }} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100">Smazat</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}