import { MasterReportsOverview } from "@/components/master-reports/master-reports-overview"
import { PlatformMetrics } from "@/components/master-reports/platform-metrics"
import { ClientsPerformance } from "@/components/master-reports/clients-performance"
import { RevenueAnalytics } from "@/components/master-reports/revenue-analytics"

export default function MasterReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios Master</h1>
        <p className="text-muted-foreground">Análises avançadas da plataforma e performance dos clientes</p>
      </div>

      <MasterReportsOverview />

      <div className="grid gap-6 md:grid-cols-2">
        <PlatformMetrics />
        <RevenueAnalytics />
      </div>

      <ClientsPerformance />
    </div>
  )
}
