'use client'

import { useState, useEffect, useCallback } from 'react'
import { NotebookPen, Plus, Trash2, Edit3, X, Save, Lock } from 'lucide-react'
import { useLang } from '@/lib/LangContext'

interface Note {
  id: string
  content: string
  is_admin_only: boolean
  created_at: string
  updated_at: string
  author_id: string
}

interface NotesDrawerProps {
  targetType: 'day' | 'week' | 'month' | 'client' | 'staff' | 'organization'
  targetId?: string
  targetDate?: string
  label?: string
}

export default function NotesDrawer({ targetType, targetId, targetDate, label }: NotesDrawerProps) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchNotes = useCallback(async () => {
    if (!open) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ targetType })
      if (targetId) params.set('targetId', targetId)
      if (targetDate) params.set('targetDate', targetDate)
      const res = await fetch(`/api/notes?${params}`)
      if (res.ok) {
        const data = await res.json()
        setNotes(Array.isArray(data) ? data : [])
      }
    } catch {}
    setLoading(false)
  }, [open, targetType, targetId, targetDate])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const handleAdd = async () => {
    if (!newContent.trim() || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId: targetId || null,
          targetDate: targetDate || null,
          content: newContent.trim(),
          isAdminOnly: false,
        }),
      })
      if (res.ok) {
        setNewContent('')
        fetchNotes()
      }
    } catch {}
    setSaving(false)
  }

  const handleUpdate = async (id: string) => {
    if (!editContent.trim() || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content: editContent.trim() }),
      })
      if (res.ok) {
        setEditId(null)
        setEditContent('')
        fetchNotes()
      }
    } catch {}
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchNotes()
    } catch {}
  }

  const hasNotes = notes.length > 0

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
        title={label || t('notes') || 'Poznamky'}
      >
        <NotebookPen className={`w-4 h-4 ${hasNotes ? 'text-teal-400' : 'text-gray-400 group-hover:text-gray-200'}`} />
        {hasNotes && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-teal-400 rounded-full" />
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0a1929] border-l border-white/10 h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-teal-400" />
                <h2 className="text-white font-semibold">{label || t('notes') || 'Poznamky'}</h2>
                <span className="text-xs text-gray-500">({notes.length})</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Add new */}
            <div className="p-4 border-b border-white/10">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={t('notes_placeholder') || 'Napiste poznamku...'}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-teal-500/50"
                rows={3}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleAdd() }}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Ctrl+Enter</span>
                <button
                  onClick={handleAdd}
                  disabled={!newContent.trim() || saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('notes_add') || 'Pridat'}
                </button>
              </div>
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center text-gray-500 text-sm py-8">{t('loading') || 'Nacitam...'}</div>
              ) : notes.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">{t('notes_empty') || 'Zadne poznamky'}</div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-white/5 border border-white/10 rounded-lg p-3 group">
                    {editId === note.id ? (
                      <div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white resize-none focus:outline-none focus:border-teal-500/50"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleUpdate(note.id)}
                            disabled={saving}
                            className="flex items-center gap-1 px-2 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs rounded transition-colors"
                          >
                            <Save className="w-3 h-3" /> {t('save') || 'Ulozit'}
                          </button>
                          <button
                            onClick={() => { setEditId(null); setEditContent('') }}
                            className="px-2 py-1 text-gray-400 hover:text-white text-xs rounded transition-colors"
                          >
                            {t('cancel') || 'Zrusit'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-200 whitespace-pre-wrap">{note.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(note.created_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {note.is_admin_only && <Lock className="w-3 h-3 text-amber-400" />}
                            <button
                              onClick={() => { setEditId(note.id); setEditContent(note.content) }}
                              className="p-1 rounded hover:bg-white/10"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                            </button>
                            <button
                              onClick={() => handleDelete(note.id)}
                              className="p-1 rounded hover:bg-red-500/20"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}