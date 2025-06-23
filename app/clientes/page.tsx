import { ClientsList } from "@/components/clients/clients-list"
import { ClientsFilters } from "@/components/clients/clients-filters"
import { ClientsStats } from "@/components/clients/clients-stats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie todos os hotéis e pousadas cadastrados na plataforma</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <ClientsStats />
      <ClientsFilters />
      <ClientsList />
    </div>
  )
}
