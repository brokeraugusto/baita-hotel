"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  getMaintenanceTechnicians,
  getMaintenanceOrderById,
  type MaintenanceOrder,
  type MaintenanceTechnician, // Importar o tipo para técnicos
} from "@/lib/services/maintenance-service"
import { Calendar, DollarSign, User, MapPin, FileText, Edit } from "lucide-react"
import { EditMaintenanceDialog } from "./edit-maintenance-dialog"

interface Room {
  id: string
  room_number: string
  room_type: string
}

interface MaintenanceDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string | null
  rooms: Room[]
  onUpdate?: () => void // Callback to refresh parent list after edit
}

export function MaintenanceDetailsDialog({
  open,
  onOpenChange,
  orderId,
  rooms,
  onUpdate,
}: MaintenanceDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [order, setOrder] = useState<MaintenanceOrder | null>(null)
  const [technicians, setTechnicians] = useState<MaintenanceTechnician[]>([]) // Estado para técnicos
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (open && orderId) {
      fetchOrder()
      fetchTechnicians() // Chamar a busca de técnicos quando o dialog abre
    }
  }, [open, orderId])

  const fetchOrder = async () => {
    if (!orderId) return

    setIsLoading(true)
    try {
      const data = await getMaintenanceOrderById(orderId)
      setOrder(data)
    } catch (error) {
      console.error("Error fetching maintenance order details:", error)
      setOrder(null)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const data = await getMaintenanceTechnicians()
      setTechnicians(data)
    } catch (error) {
      console.error("Error fetching technicians:", error)
      setTechnicians([])
    }
  }

  const getRoomInfo = (roomId: string | null) => {
    if (!roomId) return "N/A"
    const room = rooms.find((r) => r.id === roomId)
    return room ? `${room.room_number} - ${room.room_type}` : "N/A"
  }

  const getTechnicianName = (techId: string | null) => {
    if (!techId) return "Não atribuído"
    // Garantir que o array de técnicos esteja disponível antes de chamar find
    const tech = technicians.find((t) => t.id === techId)
    if (!tech) return techId // Se o técnico não for encontrado, retorna o ID

    const specialtiesText = tech.specialties && tech.specialties.length > 0 ? ` (${tech.specialties.join(", ")})` : ""

    return `${tech.name}${specialtiesText}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("pt-BR")
  }

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "N/A"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleEditSuccess = () => {
    fetchOrder() // Atualiza os detalhes após a edição
    if (onUpdate) {
      onUpdate() // Notifica o componente pai para atualizar a lista
    }
    setIsEditDialogOpen(false)
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Carregando...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!order) {
    return null
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Ordem de Serviço
              <code className="text-sm bg-muted px-2 py-1 rounded">OS-{order.id.substring(0, 4)}</code>
            </DialogTitle>
            <DialogDescription>Detalhes completos da ordem de serviço</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={(MAINTENANCE_STATUSES[order.status]?.color as any) || "secondary"}>
                  {MAINTENANCE_STATUSES[order.status]?.label || "Pendente"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Prioridade:</span>
                <Badge variant={(MAINTENANCE_PRIORITIES[order.priority]?.color as any) || "secondary"}>
                  {MAINTENANCE_PRIORITIES[order.priority]?.label || "Média"}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{order.title}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Local:</span>
                  <span>{getRoomInfo(order.room_id)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Responsável:</span>
                  <span>{getTechnicianName(order.assigned_technician_id)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Descrição:
                </div>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{order.description}</p>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Datas
              </h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criada em:</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                {order.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Atualizada em:</span>
                    <span>{formatDate(order.updated_at)}</span>
                  </div>
                )}
                {order.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Concluída em:</span>
                    <span>{formatDate(order.completed_at)}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Costs and Duration */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Custos e Tempo
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custo Estimado:</span>
                    <span>{formatCurrency(order.estimated_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custo Real:</span>
                    <span>{formatCurrency(order.actual_cost)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração Estimada:</span>
                    <span>{order.estimated_duration ? `${order.estimated_duration}h` : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração Real:</span>
                    <span>{order.actual_duration ? `${order.actual_duration}h` : "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && ( // Verificar se order.notes existe
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Observações</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{order.notes}</p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isEditDialogOpen && (
        <EditMaintenanceDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          orderId={orderId}
          rooms={rooms}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
}
