// PATH: src/components/AiInsightsWidget.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Bot, ArrowRight, RefreshCw, Calendar, Users, TrendingUp, AlertTriangle, Star, Lightbulb } from 'lucide-react'
import Link from 'next/link'

interface Insight {
  id: string
  type: string
  priority: 'high' | 'medium' | 'low'
  icon: string
  title: string
  description: string
  action?: string
  actionLabel?: string
}

const TYPE_ICONS: Record<string, any> = {
  empty_slots: Calendar,
  reactivation: Users,
  revenue_trend: TrendingUp,
  top_service: Star,
  weak_day: Lightbulb,
  no_show_risk: AlertTriangle,
}

const PRIORITY_COLORS: Record<string, { bg: string; border: string; dot: string }> = {
  high: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  low: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
}

export function AiInsightsWidget({ maxItems = 3 }: { maxItems?: number }) {
  const { organization } = useAuth()
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchInsights = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/ai/insights')
      if (res.ok) {
        const data = await res.json()
        setInsights(data.insights || [])
      }
    } catch (e) {
      console.error('Failed to fetch insights:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (organization) fetchInsights()
  }, [organization?.id])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
            <Bot className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Copilot</h3>
            <p className="text-xs text-gray-400">Analyzuji data...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
            <Bot className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Copilot</h3>
            <p className="text-xs text-gray-400">Vše vypadá v pořádku</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">Zatím nemám dostatek dat pro doporučení. Přidejte služby, klienty a rezervace.</p>
      </div>
    )
  }

  const displayed = insights.slice(0, maxItems)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
            <Bot className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Copilot</h3>
            <p className="text-xs text-gray-400">{insights.length} {insights.length === 1 ? 'doporučení' : insights.length < 5 ? 'doporučení' : 'doporučení'}</p>
          </div>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Obnovit"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {displayed.map((insight) => {
          const Icon = TYPE_ICONS[insight.type] || Lightbulb
          const colors = PRIORITY_COLORS[insight.priority] || PRIORITY_COLORS.low

          return (
            <div key={insight.id} className={`${colors.bg} ${colors.border} border rounded-xl p-4 transition-all hover:shadow-sm`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{insight.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
                  {insight.action && (
                    <Link
                      href={insight.action}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-medium hover:underline"
                      style={{ color: '#1d8898' }}
                    >
                      {insight.actionLabel || 'Zobrazit'}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {insights.length > maxItems && (
        <Link
          href="/ai"
          className="flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-sm"
          style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)', color: '#fde68a' }}
        >
          <Bot className="w-4 h-4" />
          Zobrazit všechna doporučení ({insights.length})
        </Link>
      )}
    </div>
  )
}

