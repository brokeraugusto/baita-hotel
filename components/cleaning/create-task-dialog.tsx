"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createCleaningTask, getRooms, getCleaningPersonnel } from "@/lib/services/cleaning-service"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated: () => void
  hotelId: string
}

export function CreateTaskDialog({ open, onOpenChange, onTaskCreated, hotelId }: CreateTaskDialogProps) {
  const [loading, setLoading] = useState(false)
  const [rooms, setRooms] = useState<any[]>([])
  const [personnel, setPersonnel] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    task_type: "regular",
    priority: "medium",
    room_id: "",
    assigned_personnel_id: "",
    location: "",
    estimated_duration: "",
    scheduled_for: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadData()
      // Reset form when dialog opens
      setFormData({
        title: "",
        description: "",
        task_type: "regular",
        priority: "medium",
        room_id: "",
        assigned_personnel_id: "",
        location: "",
        estimated_duration: "",
        scheduled_for: "",
      })
    }
  }, [open, hotelId])

  const loadData = async () => {
    try {
      const [roomsResult, personnelResult] = await Promise.all([getRooms(hotelId), getCleaningPersonnel(hotelId)])

      setRooms(roomsResult.data || [])
      setPersonnel(personnelResult.data || [])
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Erro de validação",
        description: "O título da tarefa é obrigatório.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const taskData = {
        ...formData,
        hotel_id: hotelId,
        estimated_duration: formData.estimated_duration ? Number.parseInt(formData.estimated_duration) : undefined,
        scheduled_for: formData.scheduled_for || new Date().toISOString(),
      }

      // Remove campos vazios
      Object.keys(taskData).forEach((key) => {
        if (taskData[key as keyof typeof taskData] === "") {
          delete taskData[key as keyof typeof taskData]
        }
      })

      console.log("Criando tarefa com dados:", taskData)

      const { data, error } = await createCleaningTask(taskData)

      if (error) {
        throw new Error(error)
      }

      toast({
        title: "Tarefa criada com sucesso!",
        description: `A tarefa "${formData.title}" foi criada.`,
      })

      onTaskCreated()
    } catch (error: any) {
      console.error("Error creating task:", error)
      toast({
        title: "Erro ao criar tarefa",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const taskTypes = [
    { value: "regular", label: "Limpeza Regular" },
    { value: "deep", label: "Limpeza Profunda" },
    { value: "checkout", label: "Pós Check-out" },
    { value: "checkin", label: "Pré Check-in" },
    { value: "inspection", label: "Inspeção" },
    { value: "maintenance", label: "Manutenção" },
  ]

  const priorities = [
    { value: "low", label: "Baixa" },
    { value: "medium", label: "Média" },
    { value: "high", label: "Alta" },
    { value: "urgent", label: "Urgente" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Tarefa de Limpeza</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Limpeza do Quarto 101"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva os detalhes da tarefa..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task_type">Tipo de Tarefa</Label>
              <Select
                value={formData.task_type}
                onValueChange={(value) => setFormData({ ...formData, task_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
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
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_id">Quarto (Opcional)</Label>
            <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um quarto..." />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.room_number} - {room.room_type} ({room.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_personnel_id">Funcionário Responsável</Label>
            <Select
              value={formData.assigned_personnel_id}
              onValueChange={(value) => setFormData({ ...formData, assigned_personnel_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um funcionário..." />
              </SelectTrigger>
              <SelectContent>
                {personnel.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name} {!person.is_active && "(Inativo)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Local (se não for quarto específico)</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Lobby, Piscina, Restaurante..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_duration">Duração Estimada (min)</Label>
              <Input
                id="estimated_duration"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                placeholder="Ex: 45"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_for">Agendado Para</Label>
              <Input
                id="scheduled_for"
                type="datetime-local"
                value={formData.scheduled_for}
                onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
