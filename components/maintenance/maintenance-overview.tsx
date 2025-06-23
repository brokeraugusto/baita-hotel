"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Clock, CheckCircle, AlertTriangle, Timer, DollarSign } from "lucide-react"
import { getMaintenanceStats } from "@/lib/services/maintenance-service"

interface MaintenanceOverviewProps {
  hotelId: string
}

export function MaintenanceOverview({ hotelId }: MaintenanceOverviewProps) {
  const [stats, setStats] = useState({
    openOrders: 0,
    inProgressOrders: 0,
    completedToday: 0,
    criticalOrders: 0,
    averageResolutionTime: "N/A",
    totalCost: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!hotelId) return

    try {
      setIsLoading(true)
      const data = await getMaintenanceStats(hotelId)
      setStats(data)
    } catch (error) {
      console.error("Error fetching maintenance stats:", error)
    } finally {
      setIsLoading(false)
    }
  }, [hotelId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const statsCards = [
    {
      title: "Ordens Pendentes",
      value: stats.openOrders,
      icon: ClipboardList,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Em Andamento",
      value: stats.inProgressOrders,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Concluídas Hoje",
      value: stats.completedToday,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Urgentes",
      value: stats.criticalOrders,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      badge: stats.criticalOrders > 0 ? "Atenção" : undefined,
    },
    {
      title: "Tempo Médio",
      value: stats.averageResolutionTime,
      icon: Timer,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      isText: true,
    },
    {
      title: "Custo Total",
      value: `R$ ${stats.totalCost.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      isText: true,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stat.isText ? stat.value : stat.value}</div>
                {stat.badge && (
                  <Badge variant="destructive" className="text-xs">
                    {stat.badge}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
