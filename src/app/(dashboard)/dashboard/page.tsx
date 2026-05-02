'use client'

import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setData({
          today: { bookings: 0, revenue: 0 },
          week: { bookings: 0, revenue: 0 },
          month: { bookings: 0, revenue: 0 },
          totals: { clients: 0 }
        })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-10 text-center">Načítání dashboardu...</div>
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div>Dnešní rezervace: {data?.today?.bookings ?? 0}</div>
      <div>Dnešní tržby: {data?.today?.revenue ?? 0}</div>

      <div className="mt-4">Měsíc rezervace: {data?.month?.bookings ?? 0}</div>
      <div>Měsíc tržby: {data?.month?.revenue ?? 0}</div>

      <div className="mt-4">Klienti celkem: {data?.totals?.clients ?? 0}</div>
    </div>
  )
}
