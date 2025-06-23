"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2, Users } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getCleaningPersonnel, createCleaningTask } from "@/lib/services/cleaning-service"
import type { CleaningPersonnel } from "@/types"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  personnel_id: z.string().min(1, "Selecione um funcionário"),
  task_type: z.string().min(1, "Selecione o tipo de tarefa"),
  scheduled_for: z.date().optional(),
  notes: z.string().optional(),
})

interface AssignPersonnelDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  hotelId: string
  roomId?: string
  roomNumber?: string
}

export function AssignPersonnelDialog({
  isOpen,
  onClose,
  onSuccess,
  hotelId,
  roomId,
  roomNumber,
}: AssignPersonnelDialogProps) {
  const { toast } = useToast()
  const [personnel, setPersonnel] = useState<CleaningPersonnel[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personnel_id: "",
      task_type: "Limpeza Diária",
      scheduled_for: new Date(),
      notes: "",
    },
  })

  useEffect(() => {
    if (isOpen && hotelId) {
      const fetchPersonnel = async () => {
        const { data, error } = await getCleaningPersonnel(hotelId)
        if (error) {
          toast({
            title: "Erro ao carregar pessoal",
            description: error,
            variant: "destructive",
          })
        } else {
          setPersonnel(data || [])
        }
      }
      fetchPersonnel()
    }
  }, [isOpen, hotelId, toast])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const taskData = {
        hotel_id: hotelId,
        room_id: roomId || null,
        location: roomId ? null : `Quarto ${roomNumber}`,
        assigned_personnel_id: values.personnel_id,
        task_type: values.task_type,
        description: `${values.task_type} - Quarto ${roomNumber}${values.notes ? `\n\nObservações: ${values.notes}` : ""}`,
        priority: "medium" as const,
        status: "pending" as const,
        scheduled_for: values.scheduled_for?.toISOString() || null,
      }

      const { error } = await createCleaningTask(taskData)

      if (error) {
        toast({
          title: "Erro ao atribuir tarefa",
          description: error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Tarefa atribuída com sucesso",
          description: `${values.task_type} atribuída para quarto ${roomNumber}`,
        })
        form.reset()
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: error.message || "Ocorreu um erro ao atribuir a tarefa.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Atribuir Pessoal - Quarto {roomNumber}
          </DialogTitle>
          <DialogDescription>Atribua um funcionário para realizar a limpeza deste quarto.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="personnel_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funcionário</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um funcionário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {personnel.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex flex-col">
                            <span>{p.name}</span>
                            {p.specialties && p.specialties.length > 0 && (
                              <span className="text-xs text-muted-foreground">{p.specialties.join(", ")}</span>
                            )}
                          </div>
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
              name="task_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Tarefa</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de tarefa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Limpeza Diária">Limpeza Diária</SelectItem>
                      <SelectItem value="Limpeza Completa">Limpeza Completa</SelectItem>
                      <SelectItem value="Limpeza Pós Check-out">Limpeza Pós Check-out</SelectItem>
                      <SelectItem value="Inspeção">Inspeção</SelectItem>
                      <SelectItem value="Manutenção Preventiva">Manutenção Preventiva</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_for"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Agendado para</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Instruções especiais ou observações..." {...field} />
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
                    Atribuindo...
                  </>
                ) : (
                  "Atribuir Tarefa"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
