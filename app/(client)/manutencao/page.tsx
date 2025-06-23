"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, AlertTriangle, RefreshCw, Search, Wrench } from "lucide-react"
import { MaintenanceOverview } from "@/components/maintenance/maintenance-overview"
import { MaintenanceFilters } from "@/components/maintenance/maintenance-filters"
import { ServiceOrdersList } from "@/components/maintenance/service-orders-list"
import { CreateMaintenanceDialog } from "@/components/maintenance/create-maintenance-dialog"
import { EmergencyMaintenanceDialog } from "@/components/maintenance/emergency-maintenance-dialog"
import { PreventiveMaintenanceDialog } from "@/components/maintenance/preventive-maintenance-dialog"
import { InspectionDialog } from "@/components/maintenance/inspection-dialog"
import { createClient } from "@/lib/supabase/client"

interface Room {
  id: string
  room_number: string
  room_type: string
}

export default function MaintenancePage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false)
  const [isPreventiveDialogOpen, setIsPreventiveDialogOpen] = useState(false)
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false)

  const [rooms, setRooms] = useState<Room[]>([])
  const [filters, setFilters] = useState({
    searchQuery: "",
    status: "all",
    priority: "all",
  })
  const [refreshKey, setRefreshKey] = useState(0)

  // Mock hotel ID - in a real app, this would come from auth context
  const hotelId = "hotel-1"

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        const container = e.currentTarget as HTMLElement
        container.scrollLeft += e.deltaY
      }
    }

    const maintenanceContainer = document.getElementById("maintenance-container")
    if (maintenanceContainer) {
      maintenanceContainer.addEventListener("wheel", handleWheel, { passive: false })
      return () => maintenanceContainer.removeEventListener("wheel", handleWheel)
    }
  }, [])

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from("rooms")
          .select("id, room_number, room_type")
          .eq("hotel_id", hotelId)
          .order("room_number")

        if (error) {
          console.error("Error fetching rooms:", error)
          // Set mock data on error
          setRooms([
            { id: "room-1", room_number: "101", room_type: "Standard" },
            { id: "room-2", room_number: "102", room_type: "Standard" },
            { id: "room-3", room_number: "201", room_type: "Deluxe" },
            { id: "room-4", room_number: "301", room_type: "Suíte" },
          ])
        } else {
          setRooms(data || [])
        }
      } catch (error) {
        console.error("Error fetching rooms:", error)
        setRooms([
          { id: "room-1", room_number: "101", room_type: "Standard" },
          { id: "room-2", room_number: "102", room_type: "Standard" },
          { id: "room-3", room_number: "201", room_type: "Deluxe" },
          { id: "room-4", room_number: "301", room_type: "Suíte" },
        ])
      }
    }

    fetchRooms()
  }, [hotelId])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleSuccess = () => {
    handleRefresh()
  }

  return (
    <div id="maintenance-container" className="overflow-x-auto min-w-full">
      <div className="min-w-[1200px]">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Manutenção</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setIsInspectionDialogOpen(true)} className="hidden sm:flex">
                <Search className="mr-2 h-4 w-4" />
                Nova Inspeção
              </Button>
              <Button variant="outline" onClick={() => setIsPreventiveDialogOpen(true)} className="hidden sm:flex">
                <RefreshCw className="mr-2 h-4 w-4" />
                Manutenção Preventiva
              </Button>
              <Button variant="destructive" onClick={() => setIsEmergencyDialogOpen(true)}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Emergência
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova OS
              </Button>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ordem de Serviço</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Corretiva</div>
                <p className="text-xs text-muted-foreground">Problema identificado que precisa reparo</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-red-200"
              onClick={() => setIsEmergencyDialogOpen(true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-600">Emergência</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">Urgente</div>
                <p className="text-xs text-muted-foreground">Situação que requer atenção imediata</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-blue-200"
              onClick={() => setIsPreventiveDialogOpen(true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">Preventiva</CardTitle>
                <RefreshCw className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">Agendada</div>
                <p className="text-xs text-muted-foreground">Manutenção programada recorrente</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-green-200"
              onClick={() => setIsInspectionDialogOpen(true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Inspeção</CardTitle>
                <Search className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Verificação</div>
                <p className="text-xs text-muted-foreground">Inspeção de rotina e auditoria</p>
              </CardContent>
            </Card>
          </div>

          <MaintenanceOverview hotelId={hotelId} key={refreshKey} />

          <MaintenanceFilters onFilterChange={handleFilterChange} />

          <ServiceOrdersList hotelId={hotelId} rooms={rooms} filters={filters} onRefreshNeeded={handleRefresh} />

          {/* Dialogs */}
          <CreateMaintenanceDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            hotelId={hotelId}
            rooms={rooms}
            onSuccess={handleSuccess}
          />

          <EmergencyMaintenanceDialog
            open={isEmergencyDialogOpen}
            onOpenChange={setIsEmergencyDialogOpen}
            hotelId={hotelId}
            rooms={rooms}
            onSuccess={handleSuccess}
          />

          <PreventiveMaintenanceDialog
            open={isPreventiveDialogOpen}
            onOpenChange={setIsPreventiveDialogOpen}
            hotelId={hotelId}
            rooms={rooms}
            onSuccess={handleSuccess}
          />

          <InspectionDialog
            open={isInspectionDialogOpen}
            onOpenChange={setIsInspectionDialogOpen}
            hotelId={hotelId}
            rooms={rooms}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  )
}
