import { MasterFinancialOverview } from "@/components/financial/master-financial-overview"
import { RevenueBreakdown } from "@/components/financial/revenue-breakdown"
import { FinancialCharts } from "@/components/financial/financial-charts"
import { PaymentsTable } from "@/components/financial/payments-table"

export default function MasterFinancialPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Financeiro Master</h1>
            <p className="text-gray-600">Visão geral financeira da plataforma</p>
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
        <MasterFinancialOverview />
        <div className="grid gap-6 md:grid-cols-2">
          <RevenueBreakdown />
          <FinancialCharts />
        </div>
        <PaymentsTable />
      </div>
    </div>
  )
}
