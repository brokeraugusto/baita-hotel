"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Bed, CheckCircle, Clock, AlertTriangle, Wrench, Search, Users, MapPin } from "lucide-react"
import { getRooms, updateRoomStatus } from "@/lib/services/cleaning-service"
import { useToast } from "@/hooks/use-toast"

interface Room {
  id: string
  hotel_id: string
  room_number: string
  room_type: string
  floor_number: number
  status: string
  capacity: number
  price_per_night?: number
  description?: string
}

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
  dirty: {
    label: "Sujo",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
    iconColor: "text-red-600",
  },
  "in-progress": {
    label: "Em Limpeza",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
    iconColor: "text-blue-600",
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
    icon: Search,
    iconColor: "text-purple-600",
  },
}

export function RoomStatusGrid({
  selectedRooms = [],
  onSelectionChange = () => {},
  refreshTrigger = 0,
  hotelId,
}: RoomStatusGridProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingRoom, setUpdatingRoom] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadRooms()
  }, [refreshTrigger, hotelId])

  const loadRooms = async () => {
    setLoading(true)
    try {
      const { data, error } = await getRooms(hotelId)
      if (error) {
        toast({
          title: "Erro ao carregar quartos",
          description: error,
          variant: "destructive",
        })
      }
      setRooms(data || [])
    } catch (error) {
      console.error("Error loading rooms:", error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os quartos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRoomSelection = (roomId: string, checked: boolean) => {
    if (!onSelectionChange) return

    const currentSelection = selectedRooms || []
    if (checked) {
      onSelectionChange([...currentSelection, roomId])
    } else {
      onSelectionChange(currentSelection.filter((id) => id !== roomId))
    }
  }

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    setUpdatingRoom(roomId)
    try {
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
        loadRooms() // Recarregar dados
      }
    } catch (error) {
      console.error("Error updating room status:", error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao atualizar o status do quarto",
        variant: "destructive",
      })
    } finally {
      setUpdatingRoom(null)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <Bed className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum quarto encontrado</h3>
        <p className="text-muted-foreground">Não há quartos cadastrados para este hotel.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grid de Quartos */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {rooms.map((room) => {
          const config = statusConfig[room.status as keyof typeof statusConfig] || statusConfig.dirty
          const Icon = config.icon
          const isSelected = (selectedRooms || []).includes(room.id)
          const isUpdating = updatingRoom === room.id

          return (
            <Card
              key={room.id}
              className={`relative transition-all duration-200 hover:shadow-md ${
                isSelected ? "ring-2 ring-primary" : ""
              } ${isUpdating ? "opacity-50" : ""}`}
            >
              <CardContent className="p-4 space-y-4">
                {/* Checkbox de Seleção */}
                <div className="absolute top-3 right-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleRoomSelection(room.id, checked as boolean)}
                    disabled={isUpdating}
                  />
                </div>

                {/* Header do Quarto */}
                <div className="flex items-center justify-between pr-8">
                  <div className="flex items-center space-x-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <span className="font-bold text-xl">{room.room_number}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center">
                  <Badge variant="outline" className={`${config.color} px-3 py-1`}>
                    <Icon className={`h-4 w-4 mr-2 ${config.iconColor}`} />
                    {config.label}
                  </Badge>
                </div>

                {/* Informações do Quarto */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{room.room_type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-muted px-2 py-1 rounded">{room.floor_number}º andar</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{room.capacity} pessoas</span>
                  </div>
                  {room.price_per_night && (
                    <div className="text-sm font-medium text-primary">R$ {room.price_per_night}/noite</div>
                  )}
                </div>

                {/* Ações Rápidas */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Alterar Status:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(statusConfig).map(([status, statusInfo]) => (
                      <Button
                        key={status}
                        variant={room.status === status ? "default" : "outline"}
                        size="sm"
                        className="text-xs px-2 py-1 h-8"
                        onClick={() => handleStatusChange(room.id, status)}
                        disabled={isUpdating || room.status === status}
                      >
                        <statusInfo.icon className="h-3 w-3 mr-1" />
                        <span className="truncate">{statusInfo.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
