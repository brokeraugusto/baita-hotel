import { MasterReportsOverview } from "@/components/master-reports/master-reports-overview"
import { PlatformMetrics } from "@/components/master-reports/platform-metrics"
import { RevenueAnalytics } from "@/components/master-reports/revenue-analytics"
import { ClientsPerformance } from "@/components/master-reports/clients-performance"

export default function MasterReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Relatórios Master</h1>
            <p className="text-gray-600">Análise detalhada da plataforma</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              👑 Master Admin
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <MasterReportsOverview />
        <div className="grid gap-6 md:grid-cols-2">
          <PlatformMetrics />
          <RevenueAnalytics />
        </div>
        <ClientsPerformance />
      </div>
    </div>
  )
}
