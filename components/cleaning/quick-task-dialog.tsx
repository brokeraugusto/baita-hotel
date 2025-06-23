"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Zap } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createCleaningTask } from "@/lib/services/cleaning-service"

const formSchema = z.object({
  task_type: z.string().min(1, "Selecione o tipo de tarefa"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  description: z.string().min(1, "Descrição é obrigatória"),
})

interface QuickTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  hotelId: string
  roomId?: string
  roomNumber?: string
}

export function QuickTaskDialog({ isOpen, onClose, onSuccess, hotelId, roomId, roomNumber }: QuickTaskDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task_type: "",
      priority: "medium",
      description: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const taskData = {
        hotel_id: hotelId,
        room_id: roomId || null,
        location: roomId ? null : `Quarto ${roomNumber}`,
        task_type: values.task_type,
        description: values.description,
        priority: values.priority,
        status: "pending" as const,
        scheduled_for: new Date().toISOString(), // Tarefa imediata
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
          description: `${values.task_type} criada para quarto ${roomNumber}`,
        })
        form.reset()
        onSuccess()
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Tarefa Rápida - Quarto {roomNumber}
          </DialogTitle>
          <DialogDescription>Crie uma tarefa de limpeza rápida para execução imediata.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectItem value="Limpeza Rápida">Limpeza Rápida</SelectItem>
                      <SelectItem value="Reposição de Amenities">Reposição de Amenities</SelectItem>
                      <SelectItem value="Troca de Roupa de Cama">Troca de Roupa de Cama</SelectItem>
                      <SelectItem value="Limpeza de Banheiro">Limpeza de Banheiro</SelectItem>
                      <SelectItem value="Aspirar Carpete">Aspirar Carpete</SelectItem>
                      <SelectItem value="Verificação Geral">Verificação Geral</SelectItem>
                    </SelectContent>
                  </Select>
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o que precisa ser feito..." {...field} />
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
