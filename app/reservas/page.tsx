import { ReservationCalendar } from "@/components/reservations/reservation-calendar"
import { ReservationFilters } from "@/components/reservations/reservation-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ReservationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">Gerencie todas as reservas e visualize a ocupação</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      <ReservationFilters />
      <ReservationCalendar />
    </div>
  )
}
