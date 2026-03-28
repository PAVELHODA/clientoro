// PATH: src/components/Skeleton.tsx
'use client'

export function SkeletonLine({ width = '100%', height = '16px', className = '' }: { width?: string; height?: string; className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      style={{ width, height }}
    />
  )
}

export function SkeletonCircle({ size = '40px', className = '' }: { size?: string; className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-gray-200 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonCircle size="40px" />
        <div className="flex-1">
          <SkeletonLine width="60%" height="14px" className="mb-2" />
          <SkeletonLine width="40%" height="10px" />
        </div>
      </div>
      <SkeletonLine width="100%" height="12px" className="mb-2" />
      <SkeletonLine width="80%" height="12px" />
    </div>
  )
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <SkeletonLine width="200px" height="28px" className="mb-2" />
          <SkeletonLine width="300px" height="14px" />
        </div>
      </div>

      {/* KPI karty */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <SkeletonLine width="80px" height="10px" className="mb-3" />
            <SkeletonLine width="60px" height="28px" className="mb-1" />
            <SkeletonLine width="100px" height="10px" />
          </div>
        ))}
      </div>

      {/* Motivační věta */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <SkeletonLine width="90%" height="14px" className="mb-2" />
        <SkeletonLine width="60%" height="14px" />
      </div>

      {/* Dnešní přehled */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <SkeletonLine width="150px" height="16px" className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonLine width="50px" height="12px" />
              <SkeletonLine width="60%" height="12px" />
              <SkeletonLine width="80px" height="12px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Služby skeleton
export function ServicesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <SkeletonLine width="150px" height="28px" className="mb-2" />
          <SkeletonLine width="200px" height="14px" />
        </div>
        <SkeletonLine width="120px" height="40px" />
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <SkeletonLine width="100%" height="42px" />
        <SkeletonLine width="150px" height="42px" />
      </div>

      {/* Kategorie + služby */}
      {[1, 2].map(cat => (
        <div key={cat}>
          <div className="flex items-center gap-3 mb-3">
            <SkeletonLine width="120px" height="16px" />
            <SkeletonLine width="30px" height="16px" />
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="space-y-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
                <SkeletonLine width="4px" height="40px" />
                <div className="flex-1">
                  <SkeletonLine width="40%" height="14px" className="mb-1" />
                  <SkeletonLine width="60%" height="10px" />
                </div>
                <SkeletonLine width="60px" height="14px" />
                <SkeletonLine width="80px" height="14px" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Klienti skeleton
export function ClientsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <SkeletonLine width="120px" height="28px" className="mb-2" />
          <SkeletonLine width="180px" height="14px" />
        </div>
        <SkeletonLine width="120px" height="40px" />
      </div>
      <SkeletonLine width="100%" height="42px" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
            <SkeletonCircle size="36px" />
            <div className="flex-1">
              <SkeletonLine width="30%" height="14px" className="mb-1" />
              <SkeletonLine width="50%" height="10px" />
            </div>
            <SkeletonLine width="80px" height="12px" />
            <SkeletonLine width="60px" height="12px" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Rezervace skeleton
export function BookingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <SkeletonLine width="140px" height="28px" className="mb-2" />
          <SkeletonLine width="200px" height="14px" />
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
            <SkeletonLine width="60px" height="14px" />
            <div className="flex-1">
              <SkeletonLine width="35%" height="14px" className="mb-1" />
              <SkeletonLine width="25%" height="10px" />
            </div>
            <SkeletonLine width="100px" height="12px" />
            <SkeletonLine width="70px" height="24px" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Kalendář skeleton
export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLine width="200px" height="28px" />
        <div className="flex gap-2">
          <SkeletonLine width="80px" height="36px" />
          <SkeletonLine width="80px" height="36px" />
          <SkeletonLine width="80px" height="36px" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <SkeletonLine key={i} width="100%" height="14px" />
          ))}
        </div>
        <div className="space-y-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="flex gap-2">
              <SkeletonLine width="50px" height="40px" />
              <SkeletonLine width="100%" height="40px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
