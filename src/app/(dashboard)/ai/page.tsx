// PATH: src/app/(dashboard)/ai/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Bot, ArrowRight, RefreshCw, Calendar, Users, TrendingUp, AlertTriangle, Star, Lightbulb, Sparkles } from 'lucide-react'
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
  data?: Record<string, any>
}

const TYPE_ICONS: Record<string, any> = {
  empty_slots: Calendar,
  reactivation: Users,
  revenue_trend: TrendingUp,
  top_service: Star,
  weak_day: Lightbulb,
  no_show_risk: AlertTriangle,
}

const PRIORITY_COLORS: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  high: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', label: 'Důležité' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Doporučení' },
  low: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Info' },
}

export default function AiPage() {
  const { organization } = useAuth()
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  const fetchInsights = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/ai/insights')
      if (res.ok) {
        const data = await res.json()
        setInsights(data.insights || [])
        setGeneratedAt(data.generatedAt || null)
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

  const highCount = insights.filter(i => i.priority === 'high').length
  const mediumCount = insights.filter(i => i.priority === 'medium').length

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
            <Bot className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Copilot</h1>
            <p className="text-sm text-gray-500">
              {loading ? 'Analyzuji data...' : `${insights.length} doporučení pro váš business`}
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Obnovit
        </button>
      </div>

      {/* Summary badges */}
      {!loading && insights.length > 0 && (
        <div className="flex gap-3 mb-6">
          {highCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {highCount} důležitých
            </span>
          )}
          {mediumCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {mediumCount} doporučení
            </span>
          )}
          {generatedAt && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs">
              <Sparkles className="w-3 h-3" />
              {new Date(generatedAt).toLocaleTimeString('cs', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && insights.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}>
            <Bot className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Zatím žádná doporučení</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            AI Copilot potřebuje data pro analýzu. Přidejte služby, klienty a začněte přijímat rezervace — doporučení se objeví automaticky.
          </p>
        </div>
      )}

      {/* Insights list */}
      {!loading && insights.length > 0 && (
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = TYPE_ICONS[insight.type] || Lightbulb
            const colors = PRIORITY_COLORS[insight.priority] || PRIORITY_COLORS.low

            return (
              <div key={insight.id} className={`${colors.bg} ${colors.border} border rounded-2xl p-5 transition-all hover:shadow-md`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/80 shadow-sm">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-gray-900">{insight.title}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        insight.priority === 'high' ? 'bg-red-200 text-red-800' :
                        insight.priority === 'medium' ? 'bg-amber-200 text-amber-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {colors.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
                    {insight.action && (
                      <Link
                        href={insight.action}
                        className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:shadow-md"
                        style={{ background: 'linear-gradient(135deg, #134a6a, #1d8898)' }}
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
      )}
    </div>
  )
}

