"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2, Plus } from "lucide-react"

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
import { createCleaningTask, getRooms, getCleaningPersonnel } from "@/lib/services/cleaning-service-functional"
import { cn } from "@/lib/utils"
import type { Room, CleaningPersonnel } from "@/lib/services/cleaning-service-functional"

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  task_type: z.string().min(1, "Tipo de tarefa é obrigatório"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  room_id: z.string().optional(),
  location: z.string().optional(),
  assigned_personnel_id: z.string().optional(),
  scheduled_for: z.date().optional(),
  estimated_duration: z.number().min(1).optional(),
  notes: z.string().optional(),
})

interface CreateTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  hotelId: string
}

export function CreateTaskDialogFunctional({ isOpen, onClose, onSuccess, hotelId }: CreateTaskDialogProps) {
  const { toast } = useToast()
  const [rooms, setRooms] = useState<Room[]>([])
  const [personnel, setPersonnel] = useState<CleaningPersonnel[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      task_type: "regular",
      priority: "medium",
      room_id: "",
      location: "",
      assigned_personnel_id: "",
      scheduled_for: undefined,
      estimated_duration: undefined,
      notes: "",
    },
  })

  useEffect(() => {
    if (isOpen && hotelId) {
      loadData()
    }
  }, [isOpen, hotelId])

  const loadData = async () => {
    // Carregar quartos
    const { data: roomsData, error: roomsError } = await getRooms(hotelId)
    if (roomsError) {
      toast({
        title: "Erro ao carregar quartos",
        description: roomsError,
        variant: "destructive",
      })
    } else {
      setRooms(roomsData)
    }

    // Carregar pessoal
    const { data: personnelData, error: personnelError } = await getCleaningPersonnel(hotelId)
    if (personnelError) {
      toast({
        title: "Erro ao carregar pessoal",
        description: personnelError,
        variant: "destructive",
      })
    } else {
      setPersonnel(personnelData)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const taskData = {
        hotel_id: hotelId,
        title: values.title,
        description: values.description,
        task_type: values.task_type,
        priority: values.priority,
        room_id: values.room_id || undefined,
        location: values.room_id ? undefined : values.location,
        assigned_personnel_id: values.assigned_personnel_id || undefined,
        scheduled_for: values.scheduled_for?.toISOString(),
        estimated_duration: values.estimated_duration,
        notes: values.notes,
        status: "pending" as const,
      }

      const { error } = await createCleaningTask(taskData)

      if (error) {
        toast({
          title: "Erro ao criar tarefa",
          description: error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Tarefa criada com sucesso",
          description: "A nova tarefa de limpeza foi adicionada.",
        })
        form.reset()
        onSuccess()
        onClose()
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: error.message || "Ocorreu um erro ao criar a tarefa.",
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
            <Plus className="h-5 w-5" />
            Nova Tarefa de Limpeza
          </DialogTitle>
          <DialogDescription>Crie uma nova tarefa de limpeza para um quarto ou área específica.</DialogDescription>
        </DialogHeader>
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
                name="task_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Tarefa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="regular">Limpeza Regular</SelectItem>
                        <SelectItem value="deep">Limpeza Profunda</SelectItem>
                        <SelectItem value="checkout">Pós Check-out</SelectItem>
                        <SelectItem value="inspection">Inspeção</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
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
                        <SelectItem value="none">Não atribuído</SelectItem>
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
                        <SelectItem value="none">Nenhum quarto específico</SelectItem>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.room_number} - {room.room_type}
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
                name="scheduled_for"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data/Hora Agendada</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                    Criando...
                  </>
                ) : (
                  "Criar Tarefa"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
