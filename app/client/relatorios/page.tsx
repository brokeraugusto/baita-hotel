import { ReportsOverview } from "@/components/reports/reports-overview"
import { QuickReports } from "@/components/reports/quick-reports"
import { ReportsGrid } from "@/components/reports/reports-grid"

export default function ClientReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Relatórios e análises do seu hotel</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">🏨 Cliente</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <ReportsOverview />
        <QuickReports />
        <ReportsGrid />
      </div>
    </div>
  )
}
