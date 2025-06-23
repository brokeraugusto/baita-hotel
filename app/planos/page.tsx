import { PlansOverview } from "@/components/plans/plans-overview"
import { PlansManagement } from "@/components/plans/plans-management"
import { SubscriptionsTable } from "@/components/plans/subscriptions-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos & Assinaturas</h1>
          <p className="text-muted-foreground">Gerencie os planos da plataforma e assinaturas dos clientes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <PlansOverview />
      <PlansManagement />
      <SubscriptionsTable />
    </div>
  )
}
