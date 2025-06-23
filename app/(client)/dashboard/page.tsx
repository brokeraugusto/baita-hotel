import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { RecentReservations } from "@/components/dashboard/recent-reservations"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das operações do seu hotel</p>
      </div>

      <DashboardOverview />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentReservations />
        <QuickActions />
      </div>
    </div>
  )
}
