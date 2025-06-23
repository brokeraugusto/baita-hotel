"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, CheckCircle, Clock, AlertTriangle, Users, Calendar, Play, UserPlus, Loader2 } from "lucide-react"
import {
  getCleaningTasks,
  startCleaningTask,
  completeCleaningTask,
  assignTaskToPersonnel,
  getCleaningPersonnel,
} from "@/lib/services/cleaning-service-functional"
import { useToast } from "@/hooks/use-toast"
import type { CleaningTask, CleaningPersonnel } from "@/lib/services/cleaning-service-functional"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CleaningTasksProps {
  refreshTrigger: number
  onTaskUpdate: () => void
  hotelId: string
}

const statusConfig = {
  pending: {
    label: "Pendente",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  "in-progress": {
    label: "Em Andamento",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
  },
  completed: {
    label: "Concluída",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: AlertTriangle,
  },
}

const priorityConfig = {
  low: { color: "bg-gray-50 text-gray-600", label: "Baixa" },
  medium: { color: "bg-blue-50 text-blue-600", label: "Média" },
  high: { color: "bg-orange-50 text-orange-600", label: "Alta" },
  urgent: { color: "bg-red-50 text-red-600", label: "Urgente" },
}

export function CleaningTasksFunctional({ refreshTrigger, onTaskUpdate, hotelId }: CleaningTasksProps) {
  const [tasks, setTasks] = useState<CleaningTask[]>([])
  const [personnel, setPersonnel] = useState<CleaningPersonnel[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; taskId: string }>({ open: false, taskId: "" })
  const [completeDialog, setCompleteDialog] = useState<{ open: boolean; taskId: string; notes: string }>({
    open: false,
    taskId: "",
    notes: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [refreshTrigger, hotelId])

  const loadData = async () => {
    setLoading(true)

    // Carregar tarefas
    const { data: tasksData, error: tasksError } = await getCleaningTasks(
      hotelId,
      filter !== "all" ? { status: filter } : undefined,
    )
    if (tasksError) {
      toast({
        title: "Erro ao carregar tarefas",
        description: tasksError,
        variant: "destructive",
      })
    } else {
      setTasks(tasksData)
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

    setLoading(false)
  }

  const handleStartTask = async (taskId: string) => {
    const { error } = await startCleaningTask(taskId)
    if (error) {
      toast({
        title: "Erro ao iniciar tarefa",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Tarefa iniciada",
        description: "A tarefa foi iniciada com sucesso.",
      })
      loadData()
      onTaskUpdate()
    }
  }

  const handleCompleteTask = async () => {
    const { error } = await completeCleaningTask(completeDialog.taskId, completeDialog.notes)
    if (error) {
      toast({
        title: "Erro ao concluir tarefa",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Tarefa concluída",
        description: "A tarefa foi concluída com sucesso.",
      })
      setCompleteDialog({ open: false, taskId: "", notes: "" })
      loadData()
      onTaskUpdate()
    }
  }

  const handleAssignTask = async (personnelId: string) => {
    const { error } = await assignTaskToPersonnel(assignDialog.taskId, personnelId)
    if (error) {
      toast({
        title: "Erro ao atribuir tarefa",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Tarefa atribuída",
        description: "A tarefa foi atribuída com sucesso.",
      })
      setAssignDialog({ open: false, taskId: "" })
      loadData()
      onTaskUpdate()
    }
  }

  const filteredTasks = filter === "all" ? tasks : tasks.filter((task) => task.status === filter)

  const formatTime = (timeString?: string) => {
    if (!timeString) return "-"
    const date = new Date(timeString)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timeString?: string) => {
    if (!timeString) return "-"
    const date = new Date(timeString)
    const today = new Date()

    if (date.toDateString() === today.toDateString()) {
      return "Hoje"
    } else {
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando tarefas...</span>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Tarefas de Limpeza</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              Todas ({tasks.length})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              Pendentes ({tasks.filter((t) => t.status === "pending").length})
            </Button>
            <Button
              variant={filter === "in-progress" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("in-progress")}
            >
              Em Andamento ({tasks.filter((t) => t.status === "in-progress").length})
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
            >
              Concluídas ({tasks.filter((t) => t.status === "completed").length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarefa</TableHead>
                  <TableHead>Quarto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Agendado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const StatusIcon = statusConfig[task.status as keyof typeof statusConfig]?.icon || Clock
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs text-muted-foreground capitalize">{task.task_type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.room ? (
                          <div>
                            <div className="font-medium">{task.room.room_number}</div>
                            <div className="text-xs text-muted-foreground">{task.room.room_type}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{task.location || "Área comum"}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge
                            className={statusConfig[task.status as keyof typeof statusConfig]?.color}
                            variant="secondary"
                          >
                            {statusConfig[task.status as keyof typeof statusConfig]?.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={priorityConfig[task.priority as keyof typeof priorityConfig]?.color}
                          variant="secondary"
                        >
                          {priorityConfig[task.priority as keyof typeof priorityConfig]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.assigned_personnel ? (
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{task.assigned_personnel.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Não atribuído</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(task.scheduled_for)} {task.scheduled_for && formatTime(task.scheduled_for)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {task.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleStartTask(task.id)}>
                                <Play className="h-4 w-4 mr-2" />
                                Iniciar Tarefa
                              </DropdownMenuItem>
                            )}
                            {task.status === "in-progress" && (
                              <DropdownMenuItem
                                onClick={() => setCompleteDialog({ open: true, taskId: task.id, notes: "" })}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Concluir Tarefa
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setAssignDialog({ open: true, taskId: task.id })}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Atribuir Funcionário
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma tarefa encontrada com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Atribuir Funcionário */}
      <Dialog open={assignDialog.open} onOpenChange={(open) => setAssignDialog({ open, taskId: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Funcionário</DialogTitle>
            <DialogDescription>Selecione um funcionário para esta tarefa.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select onValueChange={handleAssignTask}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                {personnel.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.specialties && `(${p.specialties.join(", ")})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Concluir Tarefa */}
      <Dialog open={completeDialog.open} onOpenChange={(open) => setCompleteDialog({ open, taskId: "", notes: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir Tarefa</DialogTitle>
            <DialogDescription>Adicione observações sobre a conclusão da tarefa.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={completeDialog.notes}
                onChange={(e) => setCompleteDialog((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Adicione observações sobre a tarefa..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialog({ open: false, taskId: "", notes: "" })}>
              Cancelar
            </Button>
            <Button onClick={handleCompleteTask}>Concluir Tarefa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
