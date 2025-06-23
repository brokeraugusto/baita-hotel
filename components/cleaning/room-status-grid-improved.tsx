"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Clock, AlertTriangle, Wrench, Users, Calendar, MoreVertical, Eye, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getRooms, updateRoomStatus } from "@/lib/services/cleaning-service-complete"
import { useToast } from "@/hooks/use-toast"
import type { Room } from "@/types/cleaning"

interface RoomStatusGridProps {
  selectedRooms?: string[]
  onSelectionChange?: (selected: string[]) => void
  refreshTrigger?: number
  hotelId: string
}

const statusConfig = {
  clean: {
    label: "Limpo",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  "in-progress": {
    label: "Em Limpeza",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
    iconColor: "text-blue-600",
  },
  dirty: {
    label: "Sujo",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
    iconColor: "text-red-600",
  },
  maintenance: {
    label: "Manutenção",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Wrench,
    iconColor: "text-orange-600",
  },
  inspection: {
    label: "Inspeção",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Eye,
    iconColor: "text-purple-600",
  },
  "out-of-order": {
    label: "Fora de Serviço",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: AlertTriangle,
    iconColor: "text-gray-600",
  },
}

export function RoomStatusGridImproved({
  selectedRooms = [],
  onSelectionChange,
  refreshTrigger = 0,
  hotelId,
}: RoomStatusGridProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [localSelectedRooms, setLocalSelectedRooms] = useState<string[]>(selectedRooms)
  const { toast } = useToast()

  // Load rooms data
  useEffect(() => {
    loadRooms()
  }, [refreshTrigger, hotelId])

  // Sync selection with parent
  useEffect(() => {
    if (JSON.stringify(localSelectedRooms) !== JSON.stringify(selectedRooms)) {
      setLocalSelectedRooms(selectedRooms)
    }
  }, [selectedRooms])

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

  const updateSelection = (newSelection: string[]) => {
    setLocalSelectedRooms(newSelection)
    if (typeof onSelectionChange === "function") {
      onSelectionChange(newSelection)
    }
  }

  const handleRoomSelect = (roomId: string, checked: boolean) => {
    const currentSelected = [...localSelectedRooms]
    if (checked) {
      updateSelection([...currentSelected, roomId])
    } else {
      updateSelection(currentSelected.filter((id) => id !== roomId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      updateSelection(filteredRooms.map((room) => room.id))
    } else {
      updateSelection([])
    }
  }

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    const { error } = await updateRoomStatus(roomId, newStatus, hotelId)

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
      loadRooms() // Reload data
    }
  }

  const filteredRooms = filter === "all" ? rooms : rooms.filter((room) => room.status === filter)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando quartos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros e Seleção */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={localSelectedRooms.length === filteredRooms.length && filteredRooms.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">Selecionar todos ({filteredRooms.length} quartos)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          const statusInfo = statusConfig[room.status as keyof typeof statusConfig]
          const StatusIcon = statusInfo?.icon || AlertTriangle
          const isSelected = localSelectedRooms.includes(room.id)

          return (
            <Card
              key={room.id}
              className={`relative transition-all hover:shadow-md ${
                isSelected ? "ring-2 ring-primary" : ""
              } ${statusInfo?.color || "bg-gray-100"}`}
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
                    <Button variant="ghost" size="sm">
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
                  <CardTitle className="text-lg">Quarto {room.number}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {room.type}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Status */}
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-4 w-4 ${statusInfo?.iconColor || "text-gray-600"}`} />
                  <span className={`text-sm font-medium ${statusInfo?.iconColor || "text-gray-600"}`}>
                    {statusInfo?.label || "Desconhecido"}
                  </span>
                </div>

                {/* Informações Adicionais */}
                {room.floor && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{room.floor}º andar</span>
                  </div>
                )}

                {room.capacity && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Capacidade: {room.capacity}</span>
                  </div>
                )}

                {/* Última Atualização */}
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Atualizado: {formatDate(room.updated_at)}</span>
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
