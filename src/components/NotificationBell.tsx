// src/components/NotificationBell.tsx
'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useLang } from '@/lib/LangContext'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLang()

  const notifications = [
    {
      id: 1,
      title: 'Nová rezervace',
      message: 'Klientka Anna Nováková si zarezervovala termín na zítra 14:00',
      time: 'před 8 minutami',
      read: false,
    },
    {
      id: 2,
      title: 'No-show upozornění',
      message: 'Klient Martin Svoboda nedorazil na termín v 10:00',
      time: 'před 2 hodinami',
      read: true,
    },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">{t('notifications') || 'Upozornění'}</h3>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                  !notif.read ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                }`}
              >
                <div className="flex justify-between">
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{notif.title}</p>
                  <span className="text-[10px] text-slate-400">{notif.time}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {notif.message}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Zobrazit všechny upozornění
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
