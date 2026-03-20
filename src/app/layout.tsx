// PATH: src/app/(dashboard)/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PWARegister } from '@/components/PWARegister'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'Clientoro | Booking & Growth OS',
  description: 'AI Booking, CRM & Growth OS pro služby. Získejte více klientů, zvyšte tržby automaticky.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Clientoro',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#0369a1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <PWARegister />
      </body>
    </html>
  )
}
