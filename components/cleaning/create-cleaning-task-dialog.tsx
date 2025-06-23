"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Clock, CheckCircle } from "lucide-react"

interface CreateCleaningTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated?: () => void
}

export function CreateCleaningTaskDialog({ open, onOpenChange, onTaskCreated }: CreateCleaningTaskDialogProps) {
  const [formData, setFormData] = useState({
    roomId: "",
    taskType: "regular",
    priority: "normal",
    assignedTo: "",
    scheduledDate: new Date(),
    notes: "",
    requireInspection: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simular envio para API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setSuccess(true)

    // Resetar após mostrar sucesso
    setTimeout(() => {
      setSuccess(false)
      onOpenChange(false)
      setFormData({
        roomId: "",
        taskType: "regular",
        priority: "normal",
        assignedTo: "",
        scheduledDate: new Date(),
        notes: "",
        requireInspection: false,
      })

      if (typeof onTaskCreated === "function") {
        onTaskCreated()
      }
    }, 1500)
  }

  // Mock data para quartos e funcionários
  const rooms = [
    { id: "101", name: "101 - Suíte Standard" },
    { id: "102", name: "102 - Suíte Standard" },
    { id: "103", name: "103 - Quarto Standard" },
    { id: "201", name: "201 - Suíte Luxo" },
    { id: "202", name: "202 - Suíte Luxo" },
    { id: "301", name: "301 - Chalé" },
  ]

  const staff = [
    { id: "staff-1", name: "Maria Silva" },
    { id: "staff-2", name: "João Santos" },
    { id: "staff-4", name: "Carlos Pereira" },
    { id: "staff-5", name: "Fernanda Lima" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Tarefa de Limpeza</DialogTitle>
          <DialogDescription>Crie uma nova tarefa de limpeza para um quarto específico.</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium">Tarefa criada com sucesso!</h3>
            <p className="text-muted-foreground mt-2">A tarefa foi adicionada à lista de limpeza.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="room">Quarto</Label>
                <Select value={formData.roomId} onValueChange={(value) => handleChange("roomId", value)}>
                  <SelectTrigger id="room">
                    <SelectValue placeholder="Selecione um quarto" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="taskType">Tipo de Limpeza</Label>
                  <Select value={formData.taskType} onValueChange={(value) => handleChange("taskType", value)}>
                    <SelectTrigger id="taskType">
                      <SelectValue placeholder="Tipo de limpeza" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Padrão</SelectItem>
                      <SelectItem value="deep">Profunda</SelectItem>
                      <SelectItem value="checkout">Pós Check-out</SelectItem>
                      <SelectItem value="inspection">Inspeção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assignedTo">Funcionário Responsável</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleChange("assignedTo", value)}>
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Data e Hora Agendada</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledDate ? (
                        format(formData.scheduledDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledDate}
                      onSelect={(date) => handleChange("scheduledDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Instruções Especiais</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione instruções especiais para a limpeza..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inspection"
                  checked={formData.requireInspection}
                  onCheckedChange={(checked) => handleChange("requireInspection", checked)}
                />
                <Label htmlFor="inspection" className="text-sm font-normal">
                  Requer inspeção de qualidade após conclusão
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !formData.roomId}>
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Tarefa"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
