"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Clock, AlertTriangle, Wrench, Users, MoreVertical, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getRooms, updateRoomStatus } from "@/lib/services/cleaning-service-functional"
import { useToast } from "@/hooks/use-toast"
import type { Room } from "@/lib/services/cleaning-service-functional"

interface RoomStatusGridProps {
  selectedRooms: string[]
  onSelectionChange: (selected: string[]) => void
  refreshTrigger: number
  hotelId: string
}

const statusConfig = {
  clean: {
    label: "Limpo",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  "in-progress": {
    label: "Em Limpeza",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
    iconColor: "text-blue-600",
  },
  dirty: {
    label: "Sujo",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: AlertTriangle,
    iconColor: "text-red-600",
  },
  maintenance: {
    label: "Manutenção",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: Wrench,
    iconColor: "text-orange-600",
  },
  inspection: {
    label: "Inspeção",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: AlertTriangle,
    iconColor: "text-purple-600",
  },
  available: {
    label: "Disponível",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: CheckCircle,
    iconColor: "text-gray-600",
  },
}

export function RoomStatusGridFunctional({
  selectedRooms,
  onSelectionChange,
  refreshTrigger,
  hotelId,
}: RoomStatusGridProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadRooms()
  }, [refreshTrigger, hotelId])

  const loadRooms = async () => {
    setLoading(true)
    const { data, error } = await getRooms(hotelId)

    if (error) {
      toast({
        title: "Erro ao carregar quartos",
        description: error,
        variant: "destructive",
      })
    } else {
      setRooms(data)
    }
    setLoading(false)
  }

  const handleRoomSelect = (roomId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedRooms, roomId])
    } else {
      onSelectionChange(selectedRooms.filter((id) => id !== roomId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredRooms.map((room) => room.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    const { error } = await updateRoomStatus(roomId, newStatus)

    if (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Status atualizado",
        description: "O status do quarto foi atualizado com sucesso.",
      })
      loadRooms()
    }
  }

  const filteredRooms = filter === "all" ? rooms : rooms.filter((room) => room.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando quartos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col space-y-4">
        {/* Seleção */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedRooms.length === filteredRooms.length && filteredRooms.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">Selecionar todos ({filteredRooms.length} quartos)</span>
          </div>
          {selectedRooms.length > 0 && (
            <span className="text-sm text-muted-foreground">{selectedRooms.length} selecionado(s)</span>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            Todos ({rooms.length})
          </Button>
          <Button variant={filter === "dirty" ? "default" : "outline"} size="sm" onClick={() => setFilter("dirty")}>
            Sujos ({rooms.filter((r) => r.status === "dirty").length})
          </Button>
          <Button
            variant={filter === "in-progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("in-progress")}
          >
            Em Limpeza ({rooms.filter((r) => r.status === "in-progress").length})
          </Button>
          <Button variant={filter === "clean" ? "default" : "outline"} size="sm" onClick={() => setFilter("clean")}>
            Limpos ({rooms.filter((r) => r.status === "clean").length})
          </Button>
        </div>
      </div>

      {/* Grid de Quartos */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRooms.map((room) => {
          const statusInfo = statusConfig[room.status as keyof typeof statusConfig] || statusConfig.available
          const StatusIcon = statusInfo.icon
          const isSelected = selectedRooms.includes(room.id)

          return (
            <Card
              key={room.id}
              className={`relative transition-all duration-200 hover:shadow-md ${
                isSelected ? "ring-2 ring-primary shadow-md" : ""
              }`}
            >
              {/* Checkbox de Seleção */}
              <div className="absolute top-3 left-3 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => handleRoomSelect(room.id, checked as boolean)}
                />
              </div>

              {/* Menu de Ações */}
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(room.id, "clean")}>
                      Marcar como Limpo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(room.id, "in-progress")}>
                      Iniciar Limpeza
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(room.id, "dirty")}>
                      Marcar como Sujo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(room.id, "maintenance")}>
                      Enviar para Manutenção
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(room.id, "inspection")}>
                      Solicitar Inspeção
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader className="pb-3 pt-12">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Quarto {room.room_number}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {room.room_type}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Status */}
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-4 w-4 ${statusInfo.iconColor}`} />
                  <Badge className={statusInfo.color} variant="secondary">
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Informações */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  {room.floor_number && (
                    <div className="flex items-center justify-between">
                      <span>Andar:</span>
                      <span>{room.floor_number}º</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Capacidade:</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{room.capacity}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Preço/noite:</span>
                    <span>R$ {room.price_per_night}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum quarto encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  )
}
