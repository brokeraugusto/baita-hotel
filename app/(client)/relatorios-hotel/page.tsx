import { ReportsOverview } from "@/components/reports/reports-overview"
import { ReportsGrid } from "@/components/reports/reports-grid"
import { QuickReports } from "@/components/reports/quick-reports"

export default function HotelReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Análises e relatórios detalhados do seu hotel</p>
      </div>

      <ReportsOverview />
      <QuickReports />
      <ReportsGrid />
    </div>
  )
}
