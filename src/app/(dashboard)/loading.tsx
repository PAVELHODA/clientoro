import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
        <div className="h-7 w-48 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-1" />
                <div className="h-3 w-48 bg-gray-50 rounded animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
