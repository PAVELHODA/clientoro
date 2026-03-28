// PATH: src/app/(dashboard)/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth, type UserRole } from '@/components/AuthProvider'
import { translations, type Lang } from '@/lib/i18n'
import { LangContext, useLang } from '@/lib/LangContext'
import {
  Calendar, ClipboardList, Users, Scissors, UserCircle,
  BarChart3, Settings, LogOut, Waves, Sun, Megaphone, Bot,
  TrendingUp, Crown, Wrench, Star, QrCode, LayoutDashboard,
  Menu, X, Loader2, Globe, Bell, ChevronDown, Building2,
} from 'lucide-react'

// ============================================
// MODE THEMES
// ============================================
const MODE_THEMES: Record<string, {
  label: string; gradient: string; sunGlow: string; text: string; textMuted: string;
  textHover: string; accent: string; activeBg: string; activeBorder: string;
  activeText: string; activeIcon: string; hoverBg: string; borderColor: string;
  logoBg: string; logoBorder: string; dotColor: string; sunIcon: string;
}> = {
  solo: {
    label: 'solo', gradient: 'linear-gradient(180deg, #011a13 0%, #022c22 20%, #064e3b 45%, #047857 70%, #059669 90%, #10b981 100%)',
    sunGlow: 'rgba(0,0,0,0)', text: '#ffffff', textMuted: 'rgba(255,255,255,0.90)',
    textHover: '#ffffff', accent: '#fde68a', activeBg: 'rgba(255,255,255,0.25)',
    activeBorder: 'rgba(255,255,255,0.22)', activeText: '#ffffff', activeIcon: '#fde68a',
    hoverBg: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)',
    logoBg: 'rgba(255,255,255,0.20)', logoBorder: 'rgba(255,255,255,0.30)',
    dotColor: '#fde68a', sunIcon: '#fde68a',
  },
  team: {
    label: 'team', gradient: 'linear-gradient(180deg, #020617 0%, #0a0f2e 20%, #0c1445 45%, #1e3a8a 70%, #1d4ed8 90%, #2563eb 100%)',
    sunGlow: 'rgba(0,0,0,0)', text: '#ffffff', textMuted: 'rgba(255,255,255,0.90)',
    textHover: '#ffffff', accent: '#fde68a', activeBg: 'rgba(255,255,255,0.25)',
    activeBorder: 'rgba(255,255,255,0.22)', activeText: '#ffffff', activeIcon: '#fde68a',
    hoverBg: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)',
    logoBg: 'rgba(255,255,255,0.20)', logoBorder: 'rgba(255,255,255,0.30)',
    dotColor: '#fde68a', sunIcon: '#fde68a',
  },
  solo_inspire: {
    label: 'solo_inspire', gradient: 'linear-gradient(180deg, #450a0a 0%, #7c2d12 35%, #c2410c 70%, #f59e0b 100%)',
    sunGlow: 'rgba(0,0,0,0)', text: '#fef3c7', textMuted: 'rgba(254,243,199,0.92)',
    textHover: '#ffffff', accent: '#fef3c7', activeBg: 'rgba(255,255,255,0.22)',
    activeBorder: 'rgba(255,255,255,0.18)', activeText: '#ffffff', activeIcon: '#fef3c7',
    hoverBg: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.16)',
    logoBg: 'rgba(255,255,255,0.18)', logoBorder: 'rgba(255,255,255,0.28)',
    dotColor: '#fef3c7', sunIcon: '#fbbf24',
  },
  pro_inspire: {
    label: 'pro_inspire', gradient: 'linear-gradient(180deg, #0d0008 0%, #1a0011 20%, #3b0720 45%, #6b1030 70%, #9f1239 90%, #be123c 100%)',
    sunGlow: 'rgba(0,0,0,0)', text: '#fef2f2', textMuted: 'rgba(254,242,242,0.92)',
    textHover: '#ffffff', accent: '#fecaca', activeBg: 'rgba(255,255,255,0.22)',
    activeBorder: 'rgba(255,255,255,0.18)', activeText: '#ffffff', activeIcon: '#fecaca',
    hoverBg: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.16)',
    logoBg: 'rgba(255,255,255,0.18)', logoBorder: 'rgba(255,255,255,0.28)',
    dotColor: '#fecaca', sunIcon: '#b45454',
  },
  creator: {
    label: 'creator', gradient: 'linear-gradient(180deg, #0c1222 0%, #1e293b 35%, #334155 70%, #475569 100%)',
    sunGlow: 'rgba(0,0,0,0)', text: '#ffffff', textMuted: 'rgba(255,255,255,0.90)',
    textHover: '#ffffff', accent: '#67e8f9', activeBg: 'rgba(255,255,255,0.25)',
    activeBorder: 'rgba(255,255,255,0.20)', activeText: '#ffffff', activeIcon: '#67e8f9',
    hoverBg: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)',
    logoBg: 'rgba(255,255,255,0.20)', logoBorder: 'rgba(255,255,255,0.30)',
    dotColor: '#67e8f9', sunIcon: '#67e8f9',
  },
}

// ============================================
// NAVIGACE
// ============================================
const MODE_NAV_ITEMS: Record<string, { href: string; labelKey: string; icon: any; minRole?: string }[]> = {
  solo: [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, minRole: 'staff' },
    { href: '/calendar', labelKey: 'calendar', icon: Calendar, minRole: 'staff' },
    { href: '/bookings', labelKey: 'bookings', icon: ClipboardList, minRole: 'staff' },
    { href: '/clients', labelKey: 'clients', icon: Users, minRole: 'staff' },
    { href: '/services', labelKey: 'services', icon: Scissors, minRole: 'owner' },
    { href: '/reports', labelKey: 'reports', icon: BarChart3, minRole: 'manager' },
    { href: '/settings', labelKey: 'settings', icon: Settings, minRole: 'owner' },
  ],
  team: [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, minRole: 'staff' },
    { href: '/calendar', labelKey: 'calendar', icon: Calendar, minRole: 'staff' },
    { href: '/bookings', labelKey: 'bookings', icon: ClipboardList, minRole: 'staff' },
    { href: '/clients', labelKey: 'clients', icon: Users, minRole: 'staff' },
    { href: '/services', labelKey: 'services', icon: Scissors, minRole: 'owner' },
    { href: '/staff', labelKey: 'staff', icon: UserCircle, minRole: 'owner' },
    { href: '/reports', labelKey: 'reports', icon: BarChart3, minRole: 'manager' },
    { href: '/settings', labelKey: 'settings', icon: Settings, minRole: 'owner' },
  ],
  solo_inspire: [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, minRole: 'staff' },
    { href: '/calendar', labelKey: 'calendar', icon: Calendar, minRole: 'staff' },
    { href: '/bookings', labelKey: 'bookings', icon: ClipboardList, minRole: 'staff' },
    { href: '/clients', labelKey: 'clients', icon: Users, minRole: 'staff' },
    { href: '/services', labelKey: 'services', icon: Scissors, minRole: 'owner' },
    { href: '/reports', labelKey: 'reports', icon: BarChart3, minRole: 'manager' },
    { href: '/growth/campaigns', labelKey: 'campaigns', icon: Megaphone, minRole: 'manager' },
    { href: '/growth/reviews', labelKey: 'reviews', icon: Star, minRole: 'manager' },
    { href: '/growth/qr', labelKey: 'qr', icon: QrCode, minRole: 'manager' },
    { href: '/ai', labelKey: 'ai', icon: Bot, minRole: 'manager' },
    { href: '/settings', labelKey: 'settings', icon: Settings, minRole: 'owner' },
  ],
  pro_inspire: [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, minRole: 'staff' },
    { href: '/calendar', labelKey: 'calendar', icon: Calendar, minRole: 'staff' },
    { href: '/bookings', labelKey: 'bookings', icon: ClipboardList, minRole: 'staff' },
    { href: '/clients', labelKey: 'clients', icon: Users, minRole: 'staff' },
    { href: '/services', labelKey: 'services', icon: Scissors, minRole: 'owner' },
    { href: '/staff', labelKey: 'staff', icon: UserCircle, minRole: 'owner' },
    { href: '/reports', labelKey: 'reports', icon: BarChart3, minRole: 'manager' },
    { href: '/growth/campaigns', labelKey: 'campaigns', icon: Megaphone, minRole: 'manager' },
    { href: '/growth/reviews', labelKey: 'reviews', icon: Star, minRole: 'manager' },
    { href: '/growth/qr', labelKey: 'qr', icon: QrCode, minRole: 'manager' },
    { href: '/ai', labelKey: 'ai', icon: Bot, minRole: 'manager' },
    { href: '/growth/insights', labelKey: 'insights', icon: TrendingUp, minRole: 'owner' },
    { href: '/settings', labelKey: 'settings', icon: Settings, minRole: 'owner' },
  ],
  creator: [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, minRole: 'staff' },
    { href: '/calendar', labelKey: 'calendar', icon: Calendar, minRole: 'staff' },
    { href: '/bookings', labelKey: 'bookings', icon: ClipboardList, minRole: 'staff' },
    { href: '/clients', labelKey: 'clients', icon: Users, minRole: 'staff' },
    { href: '/services', labelKey: 'services', icon: Scissors, minRole: 'owner' },
    { href: '/staff', labelKey: 'staff', icon: UserCircle, minRole: 'owner' },
    { href: '/reports', labelKey: 'reports', icon: BarChart3, minRole: 'manager' },
    { href: '/growth/campaigns', labelKey: 'campaigns', icon: Megaphone, minRole: 'manager' },
    { href: '/growth/reviews', labelKey: 'reviews', icon: Star, minRole: 'manager' },
    { href: '/growth/qr', labelKey: 'qr', icon: QrCode, minRole: 'manager' },
    { href: '/ai', labelKey: 'ai', icon: Bot, minRole: 'manager' },
    { href: '/growth/insights', labelKey: 'insights', icon: TrendingUp, minRole: 'owner' },
    { href: '/admin', labelKey: 'admin', icon: Crown, minRole: 'superadmin' },
    { href: '/dev', labelKey: 'devtools', icon: Wrench, minRole: 'superadmin' },
    { href: '/settings', labelKey: 'settings', icon: Settings, minRole: 'owner' },
  ],
}

// ============================================
// Motivational Tips
// ============================================
const TIPS: Record<string, string[]> = {
  '/dashboard': [
    'Malé kroky, velké výsledky. Dnes je dobrý den pro růst.',
    'Každý den je šance udělat krok pro nového klienta.',
    'Dnes je perfektní den udělat něco, za co vám klienti poděkují.',
  ],
  '/calendar': [
    'Každý volný termín je příležitost, ne problém.',
    'Za každým termínem v kalendáři je člověk, který vám důvěřuje.',
    'Klient, který se cítí výjimečně, se vždy vrátí.',
  ],
  '/bookings': [
    'Každá rezervace je důvěra klienta ve vaši práci.',
    'Potvrzená rezervace = jistý příjem. Tak jednoduché to je.',
    'Méně nedorazivších (no-show), více tržeb. Připomínky dělají zázraky.',
  ],
  '/clients': [
    'Spokojený klient řekne třem kamarádům. Nespokojený deseti.',
    'Osobní přístup je vaše největší konkurenční výhoda.',
    'Nejlepší marketing? Klient, který o vás mluví u kafe s kamarádkou.',
  ],
  '/services': [
    'Jasná nabídka = méně otázek, více rezervací.',
    'Combo balíčky zvyšují průměrnou útratu o 20-30%.',
    'Správná cena není nejnižší. Je to ta, za kterou stojí vaše práce.',
  ],
  '/staff': [
    'Spokojený zaměstnanec = spokojený klient.',
    'Každý člen týmu je ambasadorem vaší značky.',
    'Vaši lidé jsou vaše superschopnost. Pečujte o ně.',
  ],
  '/reports': [
    'Co měříte, to řídíte. Data nelžou.',
    'Čísla nevyprávějí příběh o penězích. Vyprávějí příběh o lidech, kterým jste pomohli, a o důvěře, kterou jste si zasloužili.',
    'Nejlepší rozhodnutí se dělají na základě dat, ne odhadů.',
  ],
  '/settings': [
    'Dobře nastavený systém šetří hodiny práce týdně.',
    'Váš systém, vaše pravidla. Nastavte si ho přesně podle sebe.',
    'Nejlepší systém je ten, o kterém nepřemýšlíte. Nastavte ho a věnujte se klientům.',
    '5 minut teď = hodiny ušetřeného času každý týden.',
  ],
}

function MotivationalTip() {
  const pathname = usePathname()
  const [tipIndex, setTipIndex] = useState(0)
  const [tips, setTips] = useState<string[]>([])
  const [fade, setFade] = useState(true)
  const [paused, setPaused] = useState(false)
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clientoro_tips') === 'on'
    }
    return false
  })

  const toggleTips = () => {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem('clientoro_tips', next ? 'on' : 'off')
  }

  useEffect(() => {
    const page = Object.keys(TIPS).find(key => pathname === key || pathname?.startsWith(key + '/'))
    const pageTips = page ? TIPS[page] : TIPS['/dashboard']
    if (pageTips) {
      setTips(pageTips)
      setTipIndex(Math.floor(Math.random() * pageTips.length))
      setFade(true)
    }
  }, [pathname])

  useEffect(() => {
    if (!enabled || paused || tips.length <= 1) return
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setTipIndex(prev => (prev + 1) % tips.length)
        setFade(true)
      }, 300)
    }, 8000)
    return () => clearInterval(interval)
  }, [enabled, paused, tips])

  if (tips.length === 0) return null

  if (!enabled) {
    return (
      <div className="mb-4 flex justify-center">
        <button onClick={toggleTips}
          className="px-4 py-1.5 text-xs text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-full border border-gray-200 hover:border-amber-200 transition-all">
          Zapnout motivační tipy
        </button>
      </div>
    )
  }

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
      <p className={`text-sm text-amber-900 font-bold text-center flex-1 transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        {tips[tipIndex] || ''}
      </p>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => setPaused(!paused)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-400 hover:text-amber-600 hover:bg-amber-100 transition-all"
          title={paused ? 'Pokračovat' : 'Pozastavit'}>
          <span className="text-xs">{paused ? '▶' : '⏸'}</span>
        </button>
        <button onClick={toggleTips}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-400 hover:text-amber-600 hover:bg-amber-100 transition-all"
          title="Vypnout tipy">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ============================================
// Notification Bell — 60s interval, user-dependent
// ============================================
function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, availableOrgs: notifAvailOrgs } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user) return

    let isMounted = true

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok && isMounted) {
          const data = await res.json()
          setNotifications(data || [])
          setUnreadCount((data || []).filter((n: any) => !n.read).length)
        }
      } catch (e) {}
    }

    fetchNotifications()
    intervalRef.current = setInterval(fetchNotifications, 60000)

    return () => {
      isMounted = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user?.id])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (e) {}
  }

  return (
    <div className="relative">
      <button onClick={() => { setShowPanel(!showPanel); if (!showPanel && unreadCount > 0) markAllRead() }}
        className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center relative hover:bg-gray-200 transition-all">
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {showPanel && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <span className="font-bold text-sm text-gray-900">Oznámení</span>
            <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">Žádná oznámení</div>
          ) : (
            notifications.slice(0, 20).map((n: any) => (
              <div key={n.id} className={'p-3 border-b border-gray-50 ' + (n.read ? 'bg-white' : 'bg-blue-50/50')}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={'w-2 h-2 rounded-full flex-shrink-0 ' + (n.type === 'new_booking' ? 'bg-green-500' : n.type === 'booking_cancelled' ? 'bg-red-500' : 'bg-amber-500')} />
                  <span className="font-semibold text-xs text-gray-900">{n.title}</span>
                </div>
                <p className="text-xs text-gray-500 ml-4">{n.body}</p>
                <p className="text-[10px] text-gray-300 ml-4 mt-1">{new Date(n.created_at).toLocaleString('cs-CZ')}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// DASHBOARD LAYOUT
// ============================================
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { organization, loading: authLoading, isSuperadmin, role } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lang, setLangState] = useState('cs')

  const setLang = (l: string) => {
    setLangState(l)
    if (typeof window !== 'undefined') localStorage.setItem('clientoro_lang', l)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clientoro_lang')
      if (saved) setLangState(saved)
    }
  }, [])

  const t = (key: string) =>
    translations[lang as Lang]?.[key] || translations.cs[key] || key

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const { availableOrgs, switchOrg } = useAuth()
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
  const orgDropdownRef = useRef<HTMLDivElement>(null)

  // Zavři dropdown při kliknutí mimo
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target as Node)) {
        setOrgDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const orgMode = organization?.mode || 'team'
  const orgName = organization?.name || 'Clientoro'
  const theme = MODE_THEMES[orgMode] || MODE_THEMES.team
  const allNavItems = MODE_NAV_ITEMS[orgMode] || MODE_NAV_ITEMS.team
  const ROLE_LEVEL: Record<string, number> = { staff: 10, manager: 20, owner: 30, superadmin: 100 }
  const userLevel = ROLE_LEVEL[role] || 10
  const navItems = allNavItems.filter((item: any) => userLevel >= (ROLE_LEVEL[item.minRole] || 10))

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

  if (!organization) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Waves className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nastavení není kompletní</h2>
          <p className="text-gray-500 mb-6">Váš účet nemá přiřazenou organizaci. Dokončete nastavení nebo se odhlaste.</p>
          <div className="flex gap-3 justify-center">
            <a href="/onboarding" className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl" style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
              Dokončit nastavení
            </a>
            <button onClick={handleLogout} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
              Odhlásit se
            </button>
          </div>
        </div>
      </div>
    )
  }

  const SidebarContent = () => (
    <>
      {/* clean sidebar - no light effects */}


      <div className="p-5 relative z-10" ref={orgDropdownRef}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => availableOrgs.length > 1 ? setOrgDropdownOpen(!orgDropdownOpen) : null}>
          <div className="w-10 h-10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: theme.logoBg, border: `1px solid ${theme.logoBorder}` }}>
            <Waves className="w-5 h-5" style={{ color: theme.text }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold tracking-tight truncate" style={{ color: theme.text }}>{orgName}</h1>
              {availableOrgs.length > 1 && <ChevronDown className={`w-4 h-4 transition-transform ${orgDropdownOpen ? 'rotate-180' : ''}`} style={{ color: theme.textMuted }} />}
            </div>
            <div className="flex items-center gap-1.5">
              <Sun className="w-3 h-3" style={{ color: theme.sunIcon }} />
              <p className="text-xs font-semibold" style={{ color: theme.textMuted }}>{t(theme.label)}</p>
              {availableOrgs.length > 1 && <span className="text-xs" style={{ color: theme.textMuted }}>· {availableOrgs.length} org</span>}
            </div>
          </div>
        </div>

        {/* Org switcher dropdown */}
        {orgDropdownOpen && availableOrgs.length > 1 && (
          <div className="mt-2 rounded-xl overflow-hidden shadow-xl border" style={{ background: 'rgba(0,0,0,0.85)', borderColor: theme.borderColor }}>
            {availableOrgs.map((org: any) => {
              const isActive = org.id === organization?.id
              const modeLabels: Record<string, string> = { solo: 'OSVČ', team: 'Firma', solo_inspire: 'Solo Inspire', pro_inspire: 'Pro Inspire' }
              return (
                <button
                  key={org.id}
                  onClick={() => { if (!isActive) { switchOrg(org.id); setOrgDropdownOpen(false) } }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                  style={{ background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                >
                  <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? theme.accent : 'rgba(255,255,255,0.5)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.8)' }}>{org.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{modeLabels[org.mode] || org.mode}</p>
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: theme.accent }} />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mx-4 h-px relative z-10" style={{ background: theme.borderColor }} />

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
              style={isActive ? {
                background: theme.activeBg,
                border: `1px solid ${theme.activeBorder}`,
                color: theme.activeText,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                backdropFilter: 'blur(8px)',
              } : {
                color: theme.textMuted,
                border: '1px solid transparent',
              }}
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
              <Icon className="w-[18px] h-[18px] flex-shrink-0"
                style={{ color: isActive ? theme.activeIcon : theme.textMuted }} />
              <span className="text-sm font-semibold">{t(item.labelKey)}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full shadow-sm" style={{ background: theme.dotColor }} />
              )}
            </Link>
          )
        })}
        {isSuperadmin && (
          <Link href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 mt-2 border-t border-white/10 pt-3"
            style={pathname === '/admin' ? {
              background: 'rgba(251,191,36,0.25)',
              border: '1px solid rgba(251,191,36,0.4)',
              color: '#fef3c7',
            } : { color: theme.textMuted }}
          >
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-medium">Superadmin</span>
          </Link>
        )}
      </nav>

      <div className="absolute bottom-20 left-0 right-0 h-8 opacity-[0.07] pointer-events-none">
        <svg viewBox="0 0 256 20" className="w-full h-full fill-white">
          <path d="M0 10 Q32 0 64 10 Q96 20 128 10 Q160 0 192 10 Q224 20 256 10 L256 20 L0 20 Z" />
        </svg>
      </div>

      <div className="p-3 relative z-10 space-y-1" style={{ borderTop: `1px solid ${theme.borderColor}` }}>
        <div className="flex items-center gap-1 px-2 py-1.5">
          <Globe className="w-4 h-4 flex-shrink-0" style={{ color: theme.textMuted }} />
          <div className="flex gap-0.5 ml-1">
            {[{ code: 'cs', label: 'CZ' }, { code: 'sk', label: 'SK' }, { code: 'en', label: 'EN' }].map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className="px-2 py-1 rounded-md text-xs font-bold transition-all"
                style={{
                  background: lang === l.code ? theme.activeBg : 'transparent',
                  color: lang === l.code ? theme.activeText : theme.textMuted,
                  border: lang === l.code ? `1px solid ${theme.activeBorder}` : '1px solid transparent',
                }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-colors"
          style={{ color: theme.textMuted }}
          onMouseEnter={(e) => { e.currentTarget.style.background = theme.hoverBg; e.currentTarget.style.color = theme.textHover }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textMuted }}>
          <LogOut className="w-[18px] h-[18px]" />
          <span className="text-sm font-semibold">{t('logout')}</span>
        </button>
      </div>
    </>
  )

  return (
    <LangContext.Provider value={{ lang, setLang, t, modeGradient: theme.gradient, modeText: theme.text }}>
      <div className="flex h-screen bg-gray-50">
        <aside className="hidden md:flex w-64 flex-col relative overflow-hidden flex-shrink-0"
          style={{ background: theme.gradient }}>
          <SidebarContent />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col overflow-hidden"
              style={{ background: theme.gradient }}>
              <button onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: theme.hoverBg, color: theme.text }}>
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </aside>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
            <button onClick={() => setMobileOpen(true)}
              className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <Waves className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-gray-900">{orgName}</span>
            </div>
            <NotificationBell />
          </header>

          <div className="hidden md:flex items-center justify-end gap-3 px-6 py-2 bg-white border-b border-gray-100">
          </div>
          <main className="flex-1 overflow-auto overflow-x-hidden">
            <div className="p-4 md:p-8 max-w-7xl">
              <MotivationalTip />
              {children}
            </div>
          </main>
        </div>
      </div>
    </LangContext.Provider>
  )
}
