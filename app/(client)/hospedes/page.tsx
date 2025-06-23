import { GuestsOverview } from "@/components/guests/guests-overview"
import { GuestsList } from "@/components/guests/guests-list"
import { GuestsFilters } from "@/components/guests/guests-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function GuestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hóspedes</h1>
          <p className="text-muted-foreground">Gerencie o cadastro e histórico dos hóspedes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Hóspede
        </Button>
      </div>

      <GuestsOverview />
      <GuestsFilters />
      <GuestsList />
    </div>
  )
}
