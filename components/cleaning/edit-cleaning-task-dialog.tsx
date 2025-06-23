"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getCleaningTaskById, updateCleaningTask, getCleaningPersonnel } from "@/lib/services/cleaning-service-complete"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed", "cancelled", "paused"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assigned_personnel_id: z.string().optional(),
  room_id: z.string().optional(),
  location: z.string().optional(),
  scheduled_date: z.date().optional(),
  estimated_duration: z.number().min(1).optional(),
  notes: z.string().optional(),
})

interface EditCleaningTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  taskId?: string
}

export function EditCleaningTaskDialog({ isOpen, onClose, onSuccess, taskId }: EditCleaningTaskDialogProps) {
  const { toast } = useToast()
  const [personnel, setPersonnel] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      assigned_personnel_id: "unassigned", // Updated default value
      room_id: "no-room", // Updated default value
      location: "",
      scheduled_date: undefined,
      estimated_duration: undefined,
      notes: "",
    },
  })

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskData()
      loadPersonnel()
      loadRooms()
    }
  }, [isOpen, taskId])

  const loadTaskData = async () => {
    if (!taskId) return

    setLoading(true)
    const { data, error } = await getCleaningTaskById(taskId)

    if (error) {
      toast({
        title: "Erro ao carregar tarefa",
        description: error,
        variant: "destructive",
      })
      return
    }

    if (data) {
      form.reset({
        title: data.title || "",
        description: data.description || "",
        status: data.status || "pending",
        priority: data.priority || "medium",
        assigned_personnel_id: data.assigned_personnel_id || "unassigned", // Updated default value
        room_id: data.room_id || "no-room", // Updated default value
        location: data.location || "",
        scheduled_date: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
        estimated_duration: data.estimated_duration || undefined,
        notes: data.notes || "",
      })
    }
    setLoading(false)
  }

  const loadPersonnel = async () => {
    // Assumindo que temos o hotel_id disponível
    const { data } = await getCleaningPersonnel("hotel-1") // TODO: usar hotel_id real
    setPersonnel(data || [])
  }

  const loadRooms = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("rooms")
      .select("id, number, type")
      .eq("hotel_id", "hotel-1") // TODO: usar hotel_id real
      .order("number")

    setRooms(data || [])
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!taskId) return

    setIsSubmitting(true)
    try {
      const updateData = {
        ...values,
        scheduled_date: values.scheduled_date?.toISOString() || null,
        location: values.room_id ? null : values.location, // Se tem room_id, não precisa de location manual
      }

      const { error } = await updateCleaningTask(taskId, updateData)

      if (error) {
        toast({
          title: "Erro ao atualizar tarefa",
          description: error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        })
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: error.message || "Ocorreu um erro ao atualizar a tarefa.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Tarefa de Limpeza
          </DialogTitle>
          <DialogDescription>Atualize as informações da tarefa de limpeza.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Limpeza completa do quarto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva os detalhes da tarefa..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in-progress">Em Andamento</SelectItem>
                          <SelectItem value="paused">Pausada</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assigned_personnel_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um funcionário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Não atribuído</SelectItem> {/* Updated value prop */}
                          {personnel.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="room_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quarto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um quarto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-room">Nenhum quarto específico</SelectItem> {/* Updated value prop */}
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.number} - {room.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local (se não for quarto específico)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Lobby, Restaurante, Área da piscina" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduled_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data/Hora Agendada</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP 'às' HH:mm", { locale: ptBR })
                              ) : (
                                <span>Selecione data e hora</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração Estimada (minutos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 60"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observações adicionais sobre a tarefa..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    "Atualizar Tarefa"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
