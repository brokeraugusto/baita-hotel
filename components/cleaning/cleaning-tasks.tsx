"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, User, MapPin, Play, Check, X, Plus } from "lucide-react"
import { getCleaningTasks, startCleaningTask, completeCleaningTask } from "@/lib/services/cleaning-service"
import { useToast } from "@/hooks/use-toast"

interface CleaningTask {
  id: string
  hotel_id: string
  room_id?: string
  title: string
  description?: string
  task_type: string
  status: string
  priority: string
  assigned_personnel_id?: string
  scheduled_for?: string
  started_at?: string
  completed_at?: string
  estimated_duration?: number
  location?: string
  room?: {
    room_number: string
    room_type: string
  }
  assigned_personnel?: {
    name: string
  }
}

interface CleaningTasksProps {
  hotelId: string
  refreshTrigger: number
  onTaskUpdate?: () => void
}

const statusConfig = {
  pending: {
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  "in-progress": {
    label: "Em Andamento",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Play,
  },
  completed: {
    label: "Concluída",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: X,
  },
}

const priorityConfig = {
  low: { label: "Baixa", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Média", color: "bg-blue-100 text-blue-800" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-800" },
}

export function CleaningTasks({ hotelId, refreshTrigger, onTaskUpdate }: CleaningTasksProps) {
  const [tasks, setTasks] = useState<CleaningTask[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadTasks()
  }, [refreshTrigger, hotelId])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const { data, error } = await getCleaningTasks(hotelId)
      if (error) {
        console.log("Usando dados mock devido ao erro:", error)
        // Dados mock para demonstração
        setTasks([
          {
            id: "1",
            hotel_id: hotelId,
            title: "Limpeza Quarto 102",
            description: "Limpeza completa após checkout",
            task_type: "checkout",
            status: "pending",
            priority: "high",
            estimated_duration: 45,
            room: { room_number: "102", room_type: "Standard" },
            assigned_personnel: { name: "Maria Silva" },
          },
          {
            id: "2",
            hotel_id: hotelId,
            title: "Limpeza do Lobby",
            description: "Limpeza completa do lobby principal",
            task_type: "regular",
            status: "in-progress",
            priority: "medium",
            estimated_duration: 90,
            location: "Lobby Principal",
            assigned_personnel: { name: "João Santos" },
          },
          {
            id: "3",
            hotel_id: hotelId,
            title: "Limpeza Quarto 301",
            description: "Limpeza profunda da suíte",
            task_type: "deep",
            status: "completed",
            priority: "medium",
            estimated_duration: 120,
            room: { room_number: "301", room_type: "Suite" },
            assigned_personnel: { name: "Ana Oliveira" },
          },
        ])
      } else {
        setTasks(data || [])
      }
    } catch (error) {
      console.error("Error loading tasks:", error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar as tarefas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartTask = async (taskId: string) => {
    setUpdatingTask(taskId)
    try {
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

        // Atualizar o estado local
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: "in-progress", started_at: new Date().toISOString() } : task,
          ),
        )

        // Chamar callback se existir
        if (onTaskUpdate && typeof onTaskUpdate === "function") {
          onTaskUpdate()
        }
      }
    } catch (error) {
      console.error("Error starting task:", error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao iniciar a tarefa",
        variant: "destructive",
      })
    } finally {
      setUpdatingTask(null)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    setUpdatingTask(taskId)
    try {
      const { error } = await completeCleaningTask(taskId, "Tarefa concluída com sucesso")
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

        // Atualizar o estado local
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: "completed", completed_at: new Date().toISOString() } : task,
          ),
        )

        // Chamar callback se existir
        if (onTaskUpdate && typeof onTaskUpdate === "function") {
          onTaskUpdate()
        }
      }
    } catch (error) {
      console.error("Error completing task:", error)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao concluir a tarefa",
        variant: "destructive",
      })
    } finally {
      setUpdatingTask(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tarefas de Limpeza</h2>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tarefas de Limpeza</h2>
          <p className="text-sm text-muted-foreground">Gerencie e acompanhe as tarefas da equipe</p>
        </div>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Lista de Tarefas */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-muted-foreground text-center">Não há tarefas de limpeza cadastradas para este hotel.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const statusInfo = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending
            const priorityInfo = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium
            const StatusIcon = statusInfo.icon
            const isUpdating = updatingTask === task.id

            return (
              <Card
                key={task.id}
                className={`transition-all duration-200 ${isUpdating ? "opacity-50" : ""} overflow-hidden`}
              >
                <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={priorityInfo.color}>
                        {priorityInfo.label}
                      </Badge>
                      <Badge variant="outline" className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="space-y-4">
                    {/* Informações da Tarefa */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">
                          {task.room ? `Quarto ${task.room.room_number}` : task.location || "Local não especificado"}
                        </span>
                      </div>
                      {task.assigned_personnel && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{task.assigned_personnel.name}</span>
                        </div>
                      )}
                      {task.estimated_duration && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>{task.estimated_duration} min</span>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2">
                      {task.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleStartTask(task.id)}
                          disabled={isUpdating}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Iniciar
                        </Button>
                      )}
                      {task.status === "in-progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={isUpdating}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Concluir
                        </Button>
                      )}
                      {task.status === "completed" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluída
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
