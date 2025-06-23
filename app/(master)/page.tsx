import { MasterDashboardOverview } from "@/components/master/dashboard-overview"
import { ClientsOverview } from "@/components/master/clients-overview"
import { RevenueChart } from "@/components/master/revenue-chart"
import { RecentActivity } from "@/components/master/recent-activity"

export default function MasterDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master Admin Dashboard</h1>
        <p className="text-muted-foreground">Visão geral completa da plataforma BaitaHotel SaaS</p>
      </div>

      <MasterDashboardOverview />

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart />
        <ClientsOverview />
      </div>

      <RecentActivity />
    </div>
  )
}
