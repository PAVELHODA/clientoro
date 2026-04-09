// PATH: src/components/settings/DangerZone.tsx
'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast'

interface Props {
  orgName: string
  l: Record<string, any>
  onDeleted: () => void
}

export default function DangerZone({ orgName, l, onDeleted }: Props) {
  const [showDeleteFlow, setShowDeleteFlow] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [backupDone, setBackupDone] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const toast = useToast()

  const handleDelete = async () => {
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/settings/delete-account', { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast.success(l.deleteSuccess)
        setTimeout(() => onDeleted(), 3000)
      } else {
        toast.error(data.error || l.deleteError)
      }
    } catch {
      toast.error(l.deleteError)
    } finally {
      setDeletingAccount(false)
    }
  }

  return (
    <div className="bg-red-50 rounded-xl border border-red-200 p-6">
      <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ {l.dangerZone}</h3>
      <p className="text-sm text-red-600 mb-4">{l.dangerDesc}</p>

      {!showDeleteFlow ? (
        <button onClick={() => setShowDeleteFlow(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
          {l.deleteBtn}
        </button>
      ) : (
        <div className="space-y-4 mt-4">
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-2">{l.backupTitle}</h4>
            <p className="text-sm text-gray-600 mb-3">{l.backupDesc}</p>
            <button onClick={async () => {
              const r = await fetch('/api/settings/export')
              if (r.ok) {
                const blob = await r.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href = url; a.download = 'clientoro-backup.csv'; a.click()
                setBackupDone(true); toast.success(l.backupDoneLabel)
              }
            }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {backupDone ? l.backupDoneLabel : l.backupBtn}
            </button>
          </div>

          <div className="bg-white rounded-lg border border-red-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-2">{l.confirmTitle}</h4>
            <p className="text-sm text-gray-600 mb-3">{l.confirmDesc} <strong>{orgName}</strong></p>
            <input type="text" value={deleteConfirmName} onChange={e => setDeleteConfirmName(e.target.value)}
              placeholder={l.confirmPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3" />
            <div className="flex gap-3">
              <button disabled={deleteConfirmName !== orgName || deletingAccount} onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
                {deletingAccount ? '...' : l.confirmYes}
              </button>
              <button onClick={() => { setShowDeleteFlow(false); setDeleteConfirmName(''); setBackupDone(false) }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                {l.confirmNo}
              </button>
            </div>
            {deleteConfirmName === orgName && <p className="text-xs text-red-500 mt-2">{l.confirmNote}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
