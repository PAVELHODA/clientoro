'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, createContext, useContext } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import {
  Calendar, ClipboardList, Users, Scissors, UserCircle,
  BarChart3, Settings, LogOut, Waves, Sun, Megaphone, Bot,
  TrendingUp, Crown, Wrench, Star, QrCode, LayoutDashboard,
  Menu, X, Loader2, Globe,
} from 'lucide-react'

// ============================================
// 🌐 i18n
// ============================================
const translations: Record<string, Record<string, string>> = {
  cs: {
    dashboard: 'Dashboard', calendar: 'Kalendář', bookings: 'Rezervace',
    clients: 'Klienti', services: 'Služby', staff: 'Tým',
    reports: 'Reporty', campaigns: 'Kampaně', reviews: 'Recenze',
    qr: 'QR kódy', ai: 'AI Asistent', insights: 'Insighty',
    admin: 'Admin', devtools: 'Dev Tools', settings: 'Nastavení',
    logout: 'Odhlásit se', loading: 'Načítám Clientoro...',
    solo: 'OSVČ', team: 'Firma', solo_inspire: 'Solo Inspire',
    pro_inspire: 'Pro Inspire', creator: 'Tvůrce',
  },
  sk: {
    dashboard: 'Dashboard', calendar: 'Kalendár', bookings: 'Rezervácie',
    clients: 'Klienti', services: 'Služby', staff: 'Tím',
    reports: 'Reporty', campaigns: 'Kampane', reviews: 'Recenzie',
    qr: 'QR kódy', ai: 'AI Asistent', insights: 'Insighty',
    admin: 'Admin', devtools: 'Dev Tools', settings: 'Nastavenia',
    logout: 'Odhlásiť sa', loading: 'Načítavam Clientoro...',
    solo: 'SZČO', team: 'Firma', solo_inspire: 'Solo Inspire',
    pro_inspire: 'Pro Inspire', creator: 'Tvorca',
  },
  en: {
    dashboard: 'Dashboard', calendar: 'Calendar', bookings: 'Bookings',
    clients: 'Clients', services: 'Services', staff: 'Team',
    reports: 'Reports', campaigns: 'Campaigns', reviews: 'Reviews',
    qr: 'QR Codes', ai: 'AI Assistant', insights: 'Insights',
    admin: 'Admin', devtools: 'Dev Tools', settings: 'Settings',
    logout: 'Log out', loading: 'Loading Clientoro...',
    solo: 'Solo', team: 'Team', solo_inspire: 'Solo Inspire',
    pro_inspire: 'Pro Inspire', creator: 'Creator',
  },
}

const LangContext = createContext<{
  lang: string
  setLang: (l: string) => void
  t: (key: string) => string
}>({ lang: 'cs', setLang: () => {}, t: (k) => k })

export const useLang = () => useContext(LangContext)

// ============================================
// 🎨 MODE THEMES — 4 plynulé přechody
// ============================================
const MODE_THEMES: Record<string, {
  label: string
  gradient: string
  sunGlow: string
  text: string
  textMuted: string
  textHover: string
  accent: string
  activeBg: string
  activeBorder: string
  activeText: string
  activeIcon: string
  hoverBg: string
  borderColor: string
  logoBg: string
  logoBorder: string
  dotColor: string
  sunIcon: string
}> = {
  // 🟢 ZELENÁ — Solo (OSVČ)
  solo: {
    label: 'solo',
    gradient: 'linear-gradient(180deg, #052e16 0%, #065f46 35%, #059669 70%, #34d399 100%)',
    sunGlow: 'rgba(253, 230, 138, 0.18)',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.90)',
    textHover: '#ffffff',
    accent: '#fde68a',
    activeBg: 'rgba(255,255,255,0.25)',
    activeBorder: 'rgba(255,255,255,0.22)',
    activeText: '#ffffff',
    activeIcon: '#fde68a',
    hoverBg: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
    logoBg: 'rgba(255,255,255,0.20)',
    logoBorder: 'rgba(255,255,255,0.30)',
    dotColor: '#fde68a',
    sunIcon: '#fde68a',
  },
  // 🔵 MODRÁ — Firma (Team)
  team: {
    label: 'team',
    gradient: 'linear-gradient(180deg, #0c1445 0%, #1e3a8a 35%, #2563eb 70%, #60a5fa 100%)',
    sunGlow: 'rgba(253, 230, 138, 0.15)',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.90)',
    textHover: '#ffffff',
    accent: '#fde68a',
    activeBg: 'rgba(255,255,255,0.25)',
    activeBorder: 'rgba(255,255,255,0.22)',
    activeText: '#ffffff',
    activeIcon: '#fde68a',
    hoverBg: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
    logoBg: 'rgba(255,255,255,0.20)',
    logoBorder: 'rgba(255,255,255,0.30)',
    dotColor: '#fde68a',
    sunIcon: '#fde68a',
  },
  // 🟠 ORANŽOVO-ZLATÁ — Solo Inspire
  solo_inspire: {
    label: 'solo_inspire',
    gradient: 'linear-gradient(180deg, #450a0a 0%, #7c2d12 35%, #c2410c 70%, #f59e0b 100%)',
    sunGlow: 'rgba(251, 191, 36, 0.20)',
    text: '#fef3c7',
    textMuted: 'rgba(254,243,199,0.92)',
    textHover: '#ffffff',
    accent: '#fef3c7',
    activeBg: 'rgba(255,255,255,0.22)',
    activeBorder: 'rgba(255,255,255,0.18)',
    activeText: '#ffffff',
    activeIcon: '#fef3c7',
    hoverBg: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.16)',
    logoBg: 'rgba(255,255,255,0.18)',
    logoBorder: 'rgba(255,255,255,0.28)',
    dotColor: '#fef3c7',
    sunIcon: '#fbbf24',
  },
  // 🍷 BORDÓ — Pro Inspire
  pro_inspire: {
    label: 'pro_inspire',
    gradient: 'linear-gradient(180deg, #1a0005 0%, #4a0011 35%, #7f1d1d 70%, #b45454 100%)',
    sunGlow: 'rgba(212, 160, 160, 0.12)',
    text: '#fef2f2',
    textMuted: 'rgba(254,242,242,0.92)',
    textHover: '#ffffff',
    accent: '#fecaca',
    activeBg: 'rgba(255,255,255,0.22)',
    activeBorder: 'rgba(255,255,255,0.18)',
    activeText: '#ffffff',
    activeIcon: '#fecaca',
    hoverBg: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.16)',
    logoBg: 'rgba(255,255,255,0.18)',
    logoBorder: 'rgba(255,255,255,0.28)',
    dotColor: '#fecaca',
    sunIcon: '#b45454',
  },
  // 🌙 CREATOR
  creator: {
    label: 'creator',
    gradient: 'linear-gradient(180deg, #0c1222 0%, #1e293b 35%, #334155 70%, #475569 100%)',
    sunGlow: 'rgba(34, 211, 238, 0.08)',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.90)',
    textHover: '#ffffff',
    accent: '#67e8f9',
    activeBg: 'rgba(255,255,255,0.25)',
    activeBorder: 'rgba(255,255,255,0.20)',
    activeText: '#ffffff',
    activeIcon: '#67e8f9',
    hoverBg: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
    logoBg: 'rgba(255,255,255,0.20)',
    logoBorder: 'rgba(255,255,255,0.30)',
    dotColor: '#67e8f9',
    sunIcon: '#67e8f9',
  },
}

// ============================================
// 📋 NAVIGACE
// ============================================
const MODE_NAV_ITEMS: Record<string, { href: string; labelKey: string; icon: any }[]> = {
  solo: [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { href: '/calendar', labelKey: 'calendar', icon: Calendar },
    { href: '/bookings', labelKey: 'bookings', icon: ClipboardList },
    { href: '/clients', labelKey: 'clients', icon: Users },
    { href: '/services', labelKey: 'services', icon: Scissors },
    { href: '/reports', labelKey: 'reports', icon: BarChart3 },
    { href: '/settings', labelKey: 'settings', icon: Settings },
  ],
  team: [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { href: '/calendar', labelKey: 'calendar', icon: Calendar },
    { href: '/bookings', labelKey: 'bookings', icon: ClipboardList },
    { href: '/clients', labelKey: 'clients', icon: Users },
    { href: '/services', labelKey: 'services', icon: Scissors },
    { href: '/staff', labelKey: 'staff', icon: UserCircle },
    { href: '/reports', labelKey: 'reports', icon: BarChart3 },
    { href: '/settings', labelKey: 'settings', icon: Settings },
  ],
  solo_inspire: [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { href: '/calendar', labelKey: 'calendar', icon: Calendar },
    { href: '/bookings', labelKey: 'bookings', icon: ClipboardList },
    { href: '/clients', labelKey: 'clients', icon: Users },
    { href: '/services', labelKey: 'services', icon: Scissors },
    { href: '/reports', labelKey: 'reports', icon: BarChart3 },
    { href: '/growth/campaigns', labelKey: 'campaigns', icon: Megaphone },
    { href: '/growth/reviews', labelKey: 'reviews', icon: Star },
    { href: '/growth/qr', labelKey: 'qr', icon: QrCode },
    { href: '/ai', labelKey: 'ai', icon: Bot },
    { href: '/settings', labelKey: 'settings', icon: Settings },
  ],
  pro_inspire: [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { href: '/calendar', labelKey: 'calendar', icon: Calendar },
    { href: '/bookings', labelKey: 'bookings', icon: ClipboardList },
    { href: '/clients', labelKey: 'clients', icon: Users },
    { href: '/services', labelKey: 'services', icon: Scissors },
    { href: '/staff', labelKey: 'staff', icon: UserCircle },
    { href: '/reports', labelKey: 'reports', icon: BarChart3 },
    { href: '/growth/campaigns', labelKey: 'campaigns', icon: Megaphone },
    { href: '/growth/reviews', labelKey: 'reviews', icon: Star },
    { href: '/growth/qr', labelKey: 'qr', icon: QrCode },
    { href: '/ai', labelKey: 'ai', icon: Bot },
    { href: '/growth/insights', labelKey: 'insights', icon: TrendingUp },
    { href: '/settings', labelKey: 'settings', icon: Settings },
  ],
  creator: [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { href: '/calendar', labelKey: 'calendar', icon: Calendar },
    { href: '/bookings', labelKey: 'bookings', icon: ClipboardList },
    { href: '/clients', labelKey: 'clients', icon: Users },
    { href: '/services', labelKey: 'services', icon: Scissors },
    { href: '/staff', labelKey: 'staff', icon: UserCircle },
    { href: '/reports', labelKey: 'reports', icon: BarChart3 },
    { href: '/growth/campaigns', labelKey: 'campaigns', icon: Megaphone },
    { href: '/growth/reviews', labelKey: 'reviews', icon: Star },
    { href: '/growth/qr', labelKey: 'qr', icon: QrCode },
    { href: '/ai', labelKey: 'ai', icon: Bot },
    { href: '/growth/insights', labelKey: 'insights', icon: TrendingUp },
    { href: '/admin', labelKey: 'admin', icon: Crown },
    { href: '/dev', labelKey: 'devtools', icon: Wrench },
    { href: '/settings', labelKey: 'settings', icon: Settings },
  ],
}

// ============================================
// 🏗️ DASHBOARD LAYOUT
// ============================================
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { organization, loading: authLoading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lang, setLangState] = useState('cs')

  useEffect(() => { setMobileOpen(false) }, [pathname])
  useEffect(() => {
    const saved = localStorage.getItem('clientoro-lang')
    if (saved && ['cs', 'sk', 'en'].includes(saved)) setLangState(saved)
  }, [])

  const setLang = (l: string) => {
    setLangState(l)
    localStorage.setItem('clientoro-lang', l)
  }

  const t = (key: string) =>
    translations[lang]?.[key] || translations.cs[key] || key

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const orgMode = organization?.mode || 'team'
  const orgName = organization?.name || 'Clientoro'
  const theme = MODE_THEMES[orgMode] || MODE_THEMES.team
  const navItems = MODE_NAV_ITEMS[orgMode] || MODE_NAV_ITEMS.team

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{t('loading')}</p>
        </div>
      </div>
    )
  }

  // ============================================
  // 🎨 SIDEBAR CONTENT
  // ============================================
  const SidebarContent = () => (
    <>
      {/* Glow effects */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: theme.sunGlow }}
      />
      <div
        className="absolute top-24 right-[-20px] w-28 h-28 rounded-full blur-2xl pointer-events-none"
        style={{ background: theme.sunGlow }}
      />

      {/* Logo + org name */}
      <div className="p-5 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: theme.logoBg,
              border: `1px solid ${theme.logoBorder}`,
            }}
          >
            <Waves className="w-5 h-5" style={{ color: theme.text }} />
          </div>
          <div>
            <h1
              className="text-lg font-bold tracking-tight"
              style={{ color: theme.text }}
            >
              {orgName}
            </h1>
            <div className="flex items-center gap-1.5">
              <Sun className="w-3 h-3" style={{ color: theme.sunIcon }} />
              <p
                className="text-xs font-semibold"
                style={{ color: theme.textMuted }}
              >
                {t(theme.label)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-4 h-px relative z-10"
        style={{ background: theme.borderColor }}
      />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
              style={
                isActive
                  ? {
                      background: theme.activeBg,
                      border: `1px solid ${theme.activeBorder}`,
                      color: theme.activeText,
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                      backdropFilter: 'blur(8px)',
                    }
                  : {
                      color: theme.textMuted,
                      border: '1px solid transparent',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = theme.hoverBg
                  e.currentTarget.style.color = theme.textHover
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.textMuted
                }
              }}
            >
              <Icon
                className="w-[18px] h-[18px] flex-shrink-0"
                style={{
                  color: isActive ? theme.activeIcon : theme.textMuted,
                }}
              />
              <span className="text-sm font-semibold">
                {t(item.labelKey)}
              </span>
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full shadow-sm"
                  style={{ background: theme.dotColor }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Wave decoration */}
      <div className="absolute bottom-20 left-0 right-0 h-8 opacity-[0.07] pointer-events-none">
        <svg viewBox="0 0 256 20" className="w-full h-full fill-white">
          <path d="M0 10 Q32 0 64 10 Q96 20 128 10 Q160 0 192 10 Q224 20 256 10 L256 20 L0 20 Z" />
        </svg>
      </div>

      {/* Language switcher + Logout */}
      <div
        className="p-3 relative z-10 space-y-1"
        style={{ borderTop: `1px solid ${theme.borderColor}` }}
      >
        {/* Language switcher */}
        <div className="flex items-center gap-1 px-2 py-1.5">
          <Globe
            className="w-4 h-4 flex-shrink-0"
            style={{ color: theme.textMuted }}
          />
          <div className="flex gap-0.5 ml-1">
            {[
              { code: 'cs', label: 'CZ' },
              { code: 'sk', label: 'SK' },
              { code: 'en', label: 'EN' },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className="px-2 py-1 rounded-md text-xs font-bold transition-all"
                style={{
                  background:
                    lang === l.code ? theme.activeBg : 'transparent',
                  color:
                    lang === l.code ? theme.activeText : theme.textMuted,
                  border:
                    lang === l.code
                      ? `1px solid ${theme.activeBorder}`
                      : '1px solid transparent',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-colors"
          style={{ color: theme.textMuted }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.hoverBg
            e.currentTarget.style.color = theme.textHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = theme.textMuted
          }}
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span className="text-sm font-semibold">{t('logout')}</span>
        </button>
      </div>
    </>
  )

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <div className="flex h-screen bg-gray-50">
        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex w-64 flex-col relative overflow-hidden flex-shrink-0"
          style={{ background: theme.gradient }}
        >
          <SidebarContent />
        </aside>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className="absolute left-0 top-0 bottom-0 w-72 flex flex-col overflow-hidden"
              style={{ background: theme.gradient }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: theme.hoverBg,
                  color: theme.text,
                }}
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-gray-900">{orgName}</span>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8 max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </LangContext.Provider>
  )
}
