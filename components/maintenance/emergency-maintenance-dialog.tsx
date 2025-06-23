"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Zap, Flame, Skull } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createMaintenanceOrder, getMaintenanceTechnicians } from "@/lib/services/maintenance-service"

interface Room {
  id: string
  room_number: string
  room_type: string
}

interface EmergencyMaintenanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  rooms?: Room[]
  onSuccess?: () => void
}

const EMERGENCY_LEVELS = {
  low: {
    label: "Baixa",
    color: "secondary",
    icon: AlertTriangle,
    description: "Problema menor que pode aguardar",
  },
  medium: {
    label: "Média",
    color: "default",
    icon: Zap,
    description: "Requer atenção em algumas horas",
  },
  high: {
    label: "Alta",
    color: "destructive",
    icon: Flame,
    description: "Requer atenção imediata",
  },
  critical: {
    label: "Crítica",
    color: "destructive",
    icon: Skull,
    description: "Risco de segurança - intervenção urgente",
  },
}

export function EmergencyMaintenanceDialog({
  open,
  onOpenChange,
  hotelId,
  rooms = [],
  onSuccess,
}: EmergencyMaintenanceDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    room_id: "" as string | null, // Pode ser UUID ou null
    location: "" as string | null, // Novo campo para locais genéricos
    emergency_level: "medium" as keyof typeof EMERGENCY_LEVELS,
    assigned_technician_id: "" as string | null,
    estimated_cost: "",
    notes: "",
  })
  const { toast } = useToast()
  const [technicians, setTechnicians] = useState<Array<{ id: string; name: string; specialties: string[] }>>([])

  useEffect(() => {
    if (open) {
      const fetchTechnicians = async () => {
        try {
          const techData = await getMaintenanceTechnicians(true)
          setTechnicians(techData.map((t) => ({ id: t.id, name: t.name, specialties: t.specialties || [] })))
        } catch (error) {
          console.error("Error fetching technicians for emergency dialog:", error)
          // Fallback technicians if API fails
          setTechnicians([
            { id: "tech-1", name: "João Silva", specialties: ["Elétrica", "Hidráulica"] },
            { id: "tech-2", name: "Maria Oliveira", specialties: ["Ar Condicionado"] },
            { id: "tech-3", name: "Carlos Santos", specialties: ["Geral"] },
          ])
        }
      }

      fetchTechnicians()
      // Reset form data when dialog opens
      setFormData({
        title: "",
        description: "",
        room_id: null,
        location: null,
        emergency_level: "medium",
        assigned_technician_id: null,
        estimated_cost: "",
        notes: "",
      })
    }
  }, [open])

  const handleLocationChange = (value: string) => {
    // Check if the value is a known static location or a room ID
    const isStaticLocation = ["lobby", "corridor", "elevator", "parking"].includes(value)
    const isRoomId = rooms.some((room) => room.id === value)

    if (isStaticLocation) {
      setFormData({ ...formData, room_id: null, location: value })
    } else if (isRoomId) {
      setFormData({ ...formData, room_id: value, location: null })
    } else {
      // Default or initial state, or if value is empty
      setFormData({ ...formData, room_id: null, location: null })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive",
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erro",
        description: "A descrição é obrigatória",
        variant: "destructive",
      })
      return
    }

    // Ensure either room_id or location is set, but not both (or at least one)
    if (!formData.room_id && !formData.location) {
      toast({
        title: "Erro",
        description: "Selecione um local ou quarto para a emergência.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const newOrder = {
        hotel_id: hotelId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        room_id: formData.room_id, // Agora pode ser null ou UUID
        location: formData.location, // Novo campo para locais genéricos
        maintenance_type: "emergency",
        is_emergency: true,
        priority: formData.emergency_level === "critical" ? "urgent" : "high",
        status: "pending" as const,
        assigned_technician_id: formData.assigned_technician_id,
        estimated_cost: formData.estimated_cost ? Number.parseFloat(formData.estimated_cost) : null,
        notes: formData.notes.trim() || null,
      }

      const createdOrder = await createMaintenanceOrder(newOrder)

      if (!createdOrder) {
        throw new Error("Failed to create emergency maintenance order.")
      }

      toast({
        title: "Emergência Registrada!",
        description: `Ordem de emergência ${EMERGENCY_LEVELS[formData.emergency_level].label.toLowerCase()} criada com sucesso`,
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        room_id: null,
        location: null,
        emergency_level: "medium",
        assigned_technician_id: null,
        estimated_cost: "",
        notes: "",
      })

      onOpenChange(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating emergency maintenance order:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a ordem de emergência",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const currentLevel = EMERGENCY_LEVELS[formData.emergency_level]
  const IconComponent = currentLevel.icon

  // Determine the currently selected value for the Select component
  const selectedLocationValue = formData.room_id || formData.location || ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Emergência de Manutenção
          </DialogTitle>
          <DialogDescription>
            Registre uma emergência que requer atenção imediata da equipe de manutenção
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Emergência *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Vazamento grave no 3º andar"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_level">Nível de Emergência *</Label>
            <Select
              value={formData.emergency_level}
              onValueChange={(value) =>
                setFormData({ ...formData, emergency_level: value as keyof typeof EMERGENCY_LEVELS })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EMERGENCY_LEVELS).map(([key, level]) => {
                  const LevelIcon = level.icon
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <LevelIcon className="h-4 w-4" />
                        <span>{level.label}</span>
                        {/* Removed Badge component as per previous instructions */}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <IconComponent className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">{currentLevel.description}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva a emergência em detalhes, incluindo localização exata e riscos..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location-or-room">Local/Quarto</Label>
              <Select value={selectedLocationValue} onValueChange={handleLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um local" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lobby">Lobby</SelectItem>
                  <SelectItem value="corridor">Corredor</SelectItem>
                  <SelectItem value="elevator">Elevador</SelectItem>
                  <SelectItem value="parking">Estacionamento</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.room_number} - {room.room_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_technician_id">Técnico Responsável</Label>
              <Select
                value={formData.assigned_technician_id || ""} // Ensure value is string for Select
                onValueChange={(value) => setFormData({ ...formData, assigned_technician_id: value || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Atribuir técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}{" "}
                      {tech.specialties && tech.specialties.length > 0 && `(${tech.specialties.join(", ")})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_cost">Custo Estimado (R$)</Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label>Tempo Estimado</Label>
              <div className="p-2 bg-muted rounded-md text-sm">
                {formData.emergency_level === "critical"
                  ? "Imediato"
                  : formData.emergency_level === "high"
                    ? "< 1 hora"
                    : formData.emergency_level === "medium"
                      ? "< 4 horas"
                      : "< 24 horas"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações Adicionais</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais sobre a emergência..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={formData.emergency_level === "critical" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isLoading ? "Registrando..." : "Registrar Emergência"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
