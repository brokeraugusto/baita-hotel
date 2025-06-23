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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import {
  createMaintenanceOrder,
  getMaintenanceTechnicians,
  getMaintenanceCategories,
} from "@/lib/services/maintenance-service"

interface Room {
  id: string
  room_number: string
  room_type: string
}

interface PreventiveMaintenanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  rooms?: Room[]
  onSuccess?: () => void
}

const RECURRENCE_OPTIONS = {
  weekly: { label: "Semanal", description: "A cada 7 dias" },
  biweekly: { label: "Quinzenal", description: "A cada 14 dias" },
  monthly: { label: "Mensal", description: "A cada 30 dias" },
  quarterly: { label: "Trimestral", description: "A cada 90 dias" },
  semiannual: { label: "Semestral", description: "A cada 180 dias" },
  annual: { label: "Anual", description: "A cada 365 dias" },
}

export function PreventiveMaintenanceDialog({
  open,
  onOpenChange,
  hotelId,
  rooms = [],
  onSuccess,
}: PreventiveMaintenanceDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    room_id: "",
    category_id: "",
    assigned_technician_id: "",
    estimated_cost: "",
    estimated_duration: "",
    recurrence: "monthly" as keyof typeof RECURRENCE_OPTIONS,
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
          console.error("Error fetching data for preventive maintenance dialog:", error)
          // Usar dados de fallback
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

    if (!selectedDate) {
      toast({
        title: "Erro",
        description: "A data é obrigatória",
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
        maintenance_type: "preventive",
        is_emergency: false,
        priority: "medium" as const,
        status: "pending" as const,
        assigned_technician_id: formData.assigned_technician_id || null,
        scheduled_date: selectedDate.toISOString(),
        estimated_cost: formData.estimated_cost ? Number.parseFloat(formData.estimated_cost) : null,
        estimated_duration: formData.estimated_duration ? Number.parseInt(formData.estimated_duration) : null,
        notes: `Manutenção preventiva - Recorrência: ${RECURRENCE_OPTIONS[formData.recurrence].label}. ${formData.notes?.trim() || ""}`,
      }

      const createdOrder = await createMaintenanceOrder(newOrder)

      if (!createdOrder) {
        throw new Error("Failed to create preventive maintenance order.")
      }

      toast({
        title: "Manutenção Preventiva Agendada!",
        description: `Manutenção ${RECURRENCE_OPTIONS[formData.recurrence].label.toLowerCase()} criada com sucesso`,
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        room_id: "",
        category_id: "",
        assigned_technician_id: "",
        estimated_cost: "",
        estimated_duration: "",
        recurrence: "monthly",
        notes: "",
      })
      setSelectedDate(new Date())

      onOpenChange(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating preventive maintenance order:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a manutenção preventiva",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            Manutenção Preventiva
          </DialogTitle>
          <DialogDescription>
            Agende uma manutenção preventiva recorrente para evitar problemas futuros
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Manutenção *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Limpeza de filtros de ar condicionado"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrence">Recorrência *</Label>
              <Select
                value={formData.recurrence}
                onValueChange={(value) =>
                  setFormData({ ...formData, recurrence: value as keyof typeof RECURRENCE_OPTIONS })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RECURRENCE_OPTIONS).map(([key, option]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva os procedimentos da manutenção preventiva..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">Local/Quarto</Label>
              <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um local" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  <SelectItem value="common">Áreas comuns</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.room_number} - {room.room_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_technician_id">Técnico Responsável</Label>
            <Select
              value={formData.assigned_technician_id}
              onValueChange={(value) => setFormData({ ...formData, assigned_technician_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um técnico" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name} {tech.specialties.length > 0 && `(${tech.specialties.join(", ")})`}
                  </SelectItem>
                ))}
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
              <Label htmlFor="estimated_duration">Duração Estimada (min)</Label>
              <Input
                id="estimated_duration"
                type="number"
                min="1"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                placeholder="60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione observações sobre a manutenção preventiva..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Agendando..." : "Agendar Manutenção"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
