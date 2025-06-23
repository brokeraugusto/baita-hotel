import { MasterFinancialOverview } from "@/components/financial/master-financial-overview"
import { RevenueBreakdown } from "@/components/financial/revenue-breakdown"
import { PaymentsTable } from "@/components/financial/payments-table"
import { FinancialCharts } from "@/components/financial/financial-charts"

export default function FinancialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro Master</h1>
        <p className="text-muted-foreground">Visão consolidada das finanças da plataforma e dos clientes</p>
      </div>

      <MasterFinancialOverview />

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueBreakdown />
        <FinancialCharts />
      </div>

      <PaymentsTable />
    </div>
  )
}
