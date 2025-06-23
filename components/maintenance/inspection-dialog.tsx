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
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Search, Plus, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
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

interface InspectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  rooms?: Room[]
  onSuccess?: () => void
}

// Interface simplificada para templates de inspeção
interface InspectionTemplate {
  id: string
  name: string
  description: string
}

export function InspectionDialog({ open, onOpenChange, hotelId, rooms = [], onSuccess }: InspectionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState({
    template_id: "",
    title: "",
    description: "",
    room_id: "",
    category_id: "",
    inspector_id: "",
    notes: "",
  })
  const [checklist, setChecklist] = useState<string[]>([])
  const [newChecklistItem, setNewChecklistItem] = useState("")

  const { toast } = useToast()
  const [technicians, setTechnicians] = useState<Array<{ id: string; name: string; specialties: string[] }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([])
  const [templates, setTemplates] = useState<InspectionTemplate[]>([])

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          // Buscar técnicos
          const techData = await getMaintenanceTechnicians(true)
          setTechnicians(
            techData.map((t) => ({
              id: t.id,
              name: t.name,
              specialties: t.specialties || [],
            })),
          )

          // Buscar categorias
          const catData = await getMaintenanceCategories(true)
          setCategories(
            catData.map((c) => ({
              id: c.id,
              name: c.name,
              color: c.color,
            })),
          )

          // Buscar templates de inspeção - adaptado para não depender da coluna checklist
          try {
            const supabase = createClient()
            const { data: templateData, error: templateError } = await supabase
              .from("maintenance_templates")
              .select("id, name, description")
              .eq("maintenance_type", "inspection")
              .eq("is_active", true)
              .order("name")

            if (templateError) {
              console.error("Error fetching templates:", templateError)
              // Usar dados de fallback
              setTemplates([
                {
                  id: "template-1",
                  name: "Inspeção Elétrica Mensal",
                  description: "Verificação de sistemas elétricos",
                },
                {
                  id: "template-2",
                  name: "Inspeção Hidráulica Trimestral",
                  description: "Verificação de sistemas hidráulicos",
                },
              ])
            } else {
              setTemplates(templateData || [])
            }
          } catch (error) {
            console.error("Error fetching templates:", error)
            // Usar dados de fallback
            setTemplates([
              {
                id: "template-1",
                name: "Inspeção Elétrica Mensal",
                description: "Verificação de sistemas elétricos",
              },
              {
                id: "template-2",
                name: "Inspeção Hidráulica Trimestral",
                description: "Verificação de sistemas hidráulicos",
              },
            ])
          }
        } catch (error) {
          console.error("Error fetching data for inspection dialog:", error)
          // Usar dados de fallback para categorias e técnicos
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

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setFormData((prev) => ({
        ...prev,
        template_id: templateId,
        title: template.name,
        description: template.description,
      }))

      // Definir uma lista de verificação padrão com base no tipo de template
      if (template.name.toLowerCase().includes("elétrica")) {
        setChecklist(["Verificar quadro elétrico", "Testar disjuntores", "Verificar tomadas", "Medir voltagem"])
      } else if (template.name.toLowerCase().includes("hidráulica")) {
        setChecklist([
          "Verificar vazamentos",
          "Testar pressão da água",
          "Inspecionar registros",
          "Verificar estado das tubulações",
        ])
      } else {
        setChecklist([])
      }
    }
  }

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist((prev) => [...prev, newChecklistItem.trim()])
      setNewChecklistItem("")
    }
  }

  const removeChecklistItem = (index: number) => {
    setChecklist((prev) => prev.filter((_, i) => i !== index))
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
      // Adaptado para usar apenas campos que sabemos que existem no banco de dados
      const newOrder = {
        hotel_id: hotelId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        // Modificação aqui: se room_id for 'all' ou 'common', envie null
        room_id: formData.room_id === "all" || formData.room_id === "common" ? null : formData.room_id || null,
        category_id: formData.category_id || null,
        maintenance_type: "inspection",
        is_emergency: false,
        priority: "low" as const,
        status: "pending" as const,
        assigned_technician_id: formData.inspector_id || null,
        scheduled_date: selectedDate.toISOString(),
        notes: checklist.length > 0 ? `Checklist: ${checklist.join(", ")}` : formData.notes?.trim() || null,
      }

      const createdOrder = await createMaintenanceOrder(newOrder)

      if (!createdOrder) {
        throw new Error("Failed to create inspection order.")
      }

      toast({
        title: "Inspeção Agendada!",
        description: "Inspeção criada com sucesso",
      })

      // Reset form
      setFormData({
        template_id: "",
        title: "",
        description: "",
        room_id: "",
        category_id: "",
        inspector_id: "",
        notes: "",
      })
      setChecklist([])
      setSelectedDate(new Date())

      onOpenChange(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating inspection order:", error)

      // Handle RLS errors gracefully
      if (error instanceof Error && error.message.includes("row-level security policy")) {
        toast({
          title: "Acesso Restrito",
          description: "Você não tem permissão para criar inspeções. Contate o administrador do sistema.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao criar a inspeção",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-green-500" />
            Agendamento de Inspeção
          </DialogTitle>
          <DialogDescription>
            Agende uma inspeção de rotina para verificar o estado dos equipamentos e instalações
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template">Template de Inspeção (Opcional)</Label>
              <Select value={formData.template_id} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template pré-definido" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Inspeção *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Inspeção elétrica mensal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data da Inspeção *</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o que será inspecionado..."
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
            <Label htmlFor="inspector_id">Inspetor Responsável</Label>
            <Select
              value={formData.inspector_id}
              onValueChange={(value) => setFormData({ ...formData, inspector_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um inspetor" />
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

          <div className="space-y-2">
            <Label>Lista de Verificação</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Adicionar item à lista de verificação..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChecklistItem())}
                />
                <Button type="button" onClick={addChecklistItem} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {checklist.length > 0 && (
                <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto">
                  {checklist.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="flex-1 justify-start">
                        {item}
                      </Badge>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeChecklistItem(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione suas observações aqui..."
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Carregando..." : "Agendar Inspeção"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
