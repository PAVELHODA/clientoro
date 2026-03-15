'use client'

import { useState, useEffect } from 'react'
import { useLang } from '../layout'
import { Crown, Users, Calendar, DollarSign, Building2, Eye, Loader2, Shield, Bell, TrendingUp } from 'lucide-react'

export default function AdminPage() {
  const { t, lang, modeGradient } = useLang()
  const [orgs, setOrgs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSuperadmin, setIsSuperadmin] = useState(false)

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setOrgs(data.organizations || [])
          setStats(data.stats || {})
          setIsSuperadmin(true)
        } else {
          setIsSuperadmin(false)
        }
      } catch (e) {
        setIsSuperadmin(false)
      } finally {
        setLoading(false)
      }
    }
    fetchAdmin()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
    </div>
  )

  if (!isSuperadmin) return (
    <div className="text-center py-20">
      <Shield className="w-12 h-12 text-red-300 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-gray-900 mb-2">Pristup odepren</h2>
      <p className="text-gray-500">Tato stranka je pouze pro superadmina.</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-6 h-6 text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-900">Superadmin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Organizace</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalOrgs || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500">Uzivatele</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">Rezervace celkem</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-gray-500">Notifikace</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalNotifications || 0}</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">Vsechny organizace</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Nazev</th>
              <th className="text-left p-3 font-medium text-gray-600">Mod</th>
              <th className="text-left p-3 font-medium text-gray-600">Slug</th>
              <th className="text-center p-3 font-medium text-gray-600">Rezervace</th>
              <th className="text-center p-3 font-medium text-gray-600">Klienti</th>
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
                     'bg-amber-100 text-amber-700')}>
                    {org.mode}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{org.slug}</td>
                <td className="p-3 text-center font-medium">{org.bookings_count || 0}</td>
                <td className="p-3 text-center font-medium">{org.clients_count || 0}</td>
                <td className="p-3 text-center">
                  <button className="text-xs text-blue-600 hover:underline flex items-center gap-1 mx-auto">
                    <Eye className="w-3 h-3" /> Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
