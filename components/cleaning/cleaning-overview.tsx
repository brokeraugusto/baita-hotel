"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/cleaning/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertTriangle, Users, Bed, ClipboardList, TrendingUp, RefreshCw } from "lucide-react"
import { getCleaningDashboardData } from "@/lib/services/cleaning-service"
import { useToast } from "@/hooks/use-toast"

interface CleaningOverviewProps {
  hotelId: string
  refreshTrigger: number
}

export function CleaningOverview({ hotelId, refreshTrigger }: CleaningOverviewProps) {
  const [stats, setStats] = useState({
    totalRooms: 8,
    cleanRooms: 3,
    dirtyRooms: 2,
    inProgressRooms: 2,
    maintenanceRooms: 1,
    activeTasks: 4,
    completedToday: 6,
    pendingTasks: 3,
    availableStaff: 4,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [refreshTrigger, hotelId])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const { data, error } = await getCleaningDashboardData(hotelId)
      if (error) {
        console.log("Usando dados mock devido ao erro:", error)
        // Manter dados mock atuais
      } else if (data) {
        setStats({
          totalRooms: data.rooms.total,
          cleanRooms: data.rooms.byStatus.clean || 0,
          dirtyRooms: data.rooms.byStatus.dirty || 0,
          inProgressRooms: data.rooms.byStatus["in-progress"] || 0,
          maintenanceRooms: data.rooms.byStatus.maintenance || 0,
          activeTasks: data.tasks.byStatus["in-progress"] || 0,
          completedToday: data.tasks.byStatus.completed || 0,
          pendingTasks: data.tasks.byStatus.pending || 0,
          availableStaff: data.personnel.active,
        })
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const cleanPercentage = stats.totalRooms > 0 ? Math.round((stats.cleanRooms / stats.totalRooms) * 100) : 0
  const efficiency =
    stats.totalRooms > 0 ? Math.round(((stats.cleanRooms + stats.inProgressRooms) / stats.totalRooms) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header com botão de refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visão Geral</h2>
          <p className="text-muted-foreground">Status atual do módulo de limpeza</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Status dos Quartos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
            <CardTitle className="text-sm font-medium">Status dos Quartos</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4 pt-0">
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">Total de quartos</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Limpos
                </span>
                <span className="font-medium">{stats.cleanRooms}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Em Limpeza
                </span>
                <span className="font-medium">{stats.inProgressRooms}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Sujos
                </span>
                <span className="font-medium">{stats.dirtyRooms}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarefas Ativas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
            <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4 pt-0">
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Pendentes</span>
                <span className="font-medium">{stats.pendingTasks}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Concluídas hoje</span>
                <span className="font-medium">{stats.completedToday}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipe */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
            <CardTitle className="text-sm font-medium">Equipe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4 pt-0">
            <div className="text-2xl font-bold">{stats.availableStaff}</div>
            <p className="text-xs text-muted-foreground">Funcionários ativos</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Disponíveis</span>
                <span className="font-medium">{Math.max(0, stats.availableStaff - stats.activeTasks)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Ocupados</span>
                <span className="font-medium">{Math.min(stats.activeTasks, stats.availableStaff)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eficiência */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4 pt-0">
            <div className="text-2xl font-bold">{efficiency}%</div>
            <p className="text-xs text-muted-foreground">Quartos prontos</p>
            <div className="mt-4">
              <Progress value={efficiency} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Rápido */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Quartos Limpos</p>
                <p className="text-2xl font-bold text-green-700">{stats.cleanRooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Em Limpeza</p>
                <p className="text-2xl font-bold text-blue-700">{stats.inProgressRooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">Precisam Limpeza</p>
                <p className="text-2xl font-bold text-red-700">{stats.dirtyRooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
