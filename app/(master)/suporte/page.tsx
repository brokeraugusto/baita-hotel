import { SupportOverview } from "@/components/support/support-overview"
import { TicketsList } from "@/components/support/tickets-list"
import { SupportFilters } from "@/components/support/support-filters"
import { KnowledgeBase } from "@/components/support/knowledge-base"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Suporte</h1>
          <p className="text-muted-foreground">Gerencie tickets e atendimento aos clientes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Ticket
        </Button>
      </div>

      <SupportOverview />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <SupportFilters />
          <div className="mt-6">
            <TicketsList />
          </div>
        </div>
        <div>
          <KnowledgeBase />
        </div>
      </div>
    </div>
  )
}
