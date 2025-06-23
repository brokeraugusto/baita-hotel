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
import { useToast } from "@/hooks/use-toast"
import {
  getMaintenanceTechnicians,
  getMaintenanceCategories,
  createMaintenanceOrder,
} from "@/lib/services/maintenance-service"

interface Room {
  id: string
  room_number: string
  room_type: string
}

interface CreateMaintenanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  rooms?: Room[]
  onSuccess?: () => void
}

const MAINTENANCE_PRIORITIES = {
  low: { label: "Baixa", color: "secondary" },
  medium: { label: "Média", color: "default" },
  high: { label: "Alta", color: "destructive" },
  urgent: { label: "Urgente", color: "destructive" },
}

export function CreateMaintenanceDialog({
  open,
  onOpenChange,
  hotelId,
  rooms = [],
  onSuccess,
}: CreateMaintenanceDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    room_id: "",
    priority: "medium",
    assigned_technician_id: "",
    category_id: "",
    estimated_cost: "",
    estimated_duration: "",
    notes: "",
  })
  const { toast } = useToast()
  const [technicians, setTechnicians] = useState<Array<{ id: string; name: string; specialties: string[] }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([])

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const techData = await getMaintenanceTechnicians(true)
          setTechnicians(
            techData.map((t) => ({
              id: t.id,
              name: t.name,
              specialties: t.specialties || [],
            })),
          )

          const catData = await getMaintenanceCategories(true)
          setCategories(
            catData.map((c) => ({
              id: c.id,
              name: c.name,
              color: c.color,
            })),
          )
        } catch (error) {
          console.error("Error fetching maintenance data for dialog:", error)
          // Fallback to mock data or empty arrays if service fails
          setTechnicians([
            { id: "tech-1", name: "João Silva", specialties: ["Elétrica", "Hidráulica"] },
            { id: "tech-2", name: "Maria Oliveira", specialties: ["Ar Condicionado"] },
            { id: "tech-3", name: "Carlos Santos", specialties: ["Geral"] },
          ])
          setCategories([
            { id: "cat-1", name: "Elétrica", color: "#FF5733" },
            { id: "cat-2", name: "Hidráulica", color: "#33A1FF" },
            { id: "cat-3", name: "Ar Condicionado", color: "#33FF57" },
            { id: "cat-4", name: "Estrutural", color: "#A133FF" },
          ])
        }
      }

      fetchData()
    }
  }, [open])

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

    setIsLoading(true)

    try {
      // Correção: Garante que room_id seja null se for "all" ou "common"
      const roomIdToSend = formData.room_id === "all" || formData.room_id === "common" ? null : formData.room_id || null

      const newOrder = {
        hotel_id: hotelId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        room_id: roomIdToSend, // Usa o valor corrigido
        category_id: formData.category_id || null,
        priority: formData.priority as "low" | "medium" | "high" | "urgent",
        status: "pending" as const, // Always pending on creation
        assigned_technician_id: formData.assigned_technician_id || null,
        estimated_cost: formData.estimated_cost ? Number.parseFloat(formData.estimated_cost) : null,
        estimated_duration: formData.estimated_duration ? Number.parseInt(formData.estimated_duration) : null,
        notes: formData.notes?.trim() || null,
        // created_at and updated_at are handled by the service or DB default
      }

      const createdOrder = await createMaintenanceOrder(newOrder)

      if (!createdOrder) {
        throw new Error("Failed to create maintenance order.")
      }

      toast({
        title: "Sucesso",
        description: "Ordem de serviço criada com sucesso",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        room_id: "",
        priority: "medium",
        assigned_technician_id: "",
        category_id: "",
        estimated_cost: "",
        estimated_duration: "",
        notes: "",
      })

      onOpenChange(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating maintenance order:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a ordem de serviço",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const safeRooms = Array.isArray(rooms) ? rooms : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          <DialogDescription>Crie uma nova ordem de serviço de manutenção</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Ar condicionado com defeito"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></div>
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-categories" disabled>
                      Nenhuma categoria disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o problema em detalhes..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">Quarto</Label>
              <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um quarto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  <SelectItem value="common">Áreas comuns</SelectItem>
                  {safeRooms.length > 0 ? (
                    safeRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.room_number} - {room.room_type}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-rooms" disabled>
                      Nenhum quarto disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MAINTENANCE_PRIORITIES).map(([key, priority]) => (
                    <SelectItem key={key} value={key}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_technician_id">Responsável</Label>
            <Select
              value={formData.assigned_technician_id}
              onValueChange={(value) => setFormData({ ...formData, assigned_technician_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um técnico" />
              </SelectTrigger>
              <SelectContent>
                {technicians.length > 0 ? (
                  technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}{" "}
                      {tech.specialties && tech.specialties.length > 0 && `(${tech.specialties.join(", ")})`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-techs" disabled>
                    Nenhum técnico disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
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
              <Label htmlFor="estimated_duration">Duração Estimada (horas)</Label>
              <Input
                id="estimated_duration"
                type="number"
                min="1"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                placeholder="Ex: 2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Ordem de Serviço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
