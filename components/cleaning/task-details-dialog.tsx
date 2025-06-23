"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Clock, User, MapPin, Calendar, CheckCircle, AlertCircle, FileText, Save, Loader2 } from "lucide-react"
import { getCleaningTaskById, updateTaskProgress } from "@/lib/services/cleaning-service-complete"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TaskDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  taskId?: string
}

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  "in-progress": { label: "Em Andamento", color: "bg-blue-100 text-blue-800", icon: Clock },
  completed: { label: "Concluída", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800", icon: AlertCircle },
  paused: { label: "Pausada", color: "bg-gray-100 text-gray-800", icon: Clock },
}

const priorityConfig = {
  low: { label: "Baixa", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Média", color: "bg-blue-100 text-blue-800" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-800" },
}

export function TaskDetailsDialog({ isOpen, onClose, taskId }: TaskDetailsDialogProps) {
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskDetails()
    }
  }, [isOpen, taskId])

  const loadTaskDetails = async () => {
    if (!taskId) return

    setLoading(true)
    const { data, error } = await getCleaningTaskById(taskId)

    if (error) {
      toast({
        title: "Erro ao carregar detalhes",
        description: error,
        variant: "destructive",
      })
    } else if (data) {
      setTask(data)
      setChecklist(data.checklist_items || {})
      setNotes(data.notes || "")
    }
    setLoading(false)
  }

  const handleChecklistChange = (item: string, checked: boolean) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: checked,
    }))
  }

  const handleSaveProgress = async () => {
    if (!taskId) return

    setSaving(true)
    const { error } = await updateTaskProgress(taskId, {
      checklist_progress: checklist,
      notes,
    })

    if (error) {
      toast({
        title: "Erro ao salvar progresso",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Progresso salvo",
        description: "O progresso da tarefa foi atualizado.",
      })
      loadTaskDetails() // Recarregar dados
    }
    setSaving(false)
  }

  const getProgressPercentage = () => {
    if (!checklist || Object.keys(checklist).length === 0) return 0
    const completed = Object.values(checklist).filter(Boolean).length
    return Math.round((completed / Object.keys(checklist).length) * 100)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Tarefa
          </DialogTitle>
          <DialogDescription>Visualize e atualize o progresso da tarefa de limpeza.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : task ? (
          <div className="space-y-6">
            {/* Header da Tarefa */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              {task.description && <p className="text-muted-foreground">{task.description}</p>}

              <div className="flex flex-wrap gap-2">
                <Badge className={statusConfig[task.status as keyof typeof statusConfig]?.color}>
                  {statusConfig[task.status as keyof typeof statusConfig]?.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={priorityConfig[task.priority as keyof typeof priorityConfig]?.color}
                >
                  {priorityConfig[task.priority as keyof typeof priorityConfig]?.label}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Informações da Tarefa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {task.room && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Quarto {task.room.number} ({task.room.type}){task.room.floor && ` - ${task.room.floor}º andar`}
                    </span>
                  </div>
                )}

                {task.location && !task.room && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{task.location}</span>
                  </div>
                )}

                {task.assigned_personnel && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{task.assigned_personnel.name}</span>
                  </div>
                )}

                {task.scheduled_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(task.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {task.estimated_duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Duração estimada: {formatDuration(task.estimated_duration)}</span>
                  </div>
                )}

                {task.actual_duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Duração real: {formatDuration(task.actual_duration)}</span>
                  </div>
                )}

                {task.completed_date && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Concluída em {format(new Date(task.completed_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Progresso e Checklist */}
            {Object.keys(checklist).length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Progresso da Tarefa</Label>
                      <span className="text-sm text-muted-foreground">{getProgressPercentage()}% concluído</span>
                    </div>
                    <Progress value={getProgressPercentage()} className="w-full" />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium">Checklist</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(checklist).map(([item, checked]) => (
                        <div key={item} className="flex items-center space-x-2">
                          <Checkbox
                            id={item}
                            checked={checked}
                            onCheckedChange={(checked) => handleChecklistChange(item, checked as boolean)}
                            disabled={task.status === "completed"}
                          />
                          <Label htmlFor={item} className="text-sm capitalize">
                            {item.replace(/_/g, " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Observações */}
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-medium">
                Observações
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre a tarefa..."
                disabled={task.status === "completed"}
                rows={3}
              />
            </div>

            {/* Botões de Ação */}
            {task.status !== "completed" && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                <Button onClick={handleSaveProgress} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Progresso
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Tarefa não encontrada.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
