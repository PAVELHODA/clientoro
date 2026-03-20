// PATH: src/components/PWARegister.tsx
'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Unregister old service workers first
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
        })
      })

      // Register clean service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] SW registered:', registration.scope)
        })
        .catch((error) => {
          console.log('[PWA] SW registration failed:', error)
        })
    }
  }, [])

  return null
}
