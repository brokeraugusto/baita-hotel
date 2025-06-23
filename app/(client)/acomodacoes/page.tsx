"use client"

import { AccommodationList } from "@/components/accommodations/accommodation-list"
import { AccommodationFilters } from "@/components/accommodations/accommodation-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AccommodationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acomodações</h1>
          <p className="text-muted-foreground">Gerencie quartos, suítes e chalés do seu hotel</p>
        </div>
        <Button onClick={() => (window.location.href = "/client/acomodacoes/nova")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Acomodação
        </Button>
      </div>

      <AccommodationFilters />
      <AccommodationList />
    </div>
  )
}
