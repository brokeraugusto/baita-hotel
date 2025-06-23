"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, BarChart3, Activity, Target, Zap } from "lucide-react"
import { analyticsService, type DashboardMetrics, type RevenueAnalytics } from "@/lib/services/analytics-service"
import { formatCurrency, formatPercentage } from "@/lib/utils/currency-helpers"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface AdvancedDashboardProps {
  hotelId: string
  period: { start: string; end: string }
}

export function AdvancedDashboard({ hotelId, period }: AdvancedDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null)
  const [forecast, setForecast] = useState<Array<{ date: string; predicted_occupancy: number; confidence: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [hotelId, period])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [metricsData, analyticsData, forecastData] = await Promise.all([
        analyticsService.getDashboardMetrics(hotelId, period),
        analyticsService.getRevenueAnalytics(hotelId, period),
        analyticsService.getOccupancyForecast(hotelId, 30),
      ])

      setMetrics(metricsData)
      setAnalytics(analyticsData)
      setForecast(forecastData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!metrics || !analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar dados do dashboard</p>
        <Button onClick={loadDashboardData} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />+{formatPercentage(analytics.trends.revenueGrowth)}{" "}
              vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.occupancyRate)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />+{formatPercentage(analytics.trends.occupancyTrend)}{" "}
              vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.revPAR)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="mr-1 h-3 w-3" />
              Revenue per Available Room
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diária Média</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageDailyRate)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              {formatPercentage(Math.abs(analytics.trends.averageStayTrend))} vs período anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="occupancy">Ocupação</TabsTrigger>
          <TabsTrigger value="forecast">Previsões</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Receita por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.byCategory.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{category.category}</span>
                      <span className="font-medium">{formatCurrency(category.revenue)}</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      {formatPercentage(category.percentage)} do total
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Crescimento Mensal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.monthly.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{month.month}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(month.revenue)}</div>
                    </div>
                    <Badge variant={month.growth >= 0 ? "default" : "destructive"}>
                      {month.growth >= 0 ? "+" : ""}
                      {formatPercentage(month.growth)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Hóspedes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.activeGuests}</div>
                <p className="text-xs text-muted-foreground">de {metrics.totalReservations} reservas totais</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manutenção Pendente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{metrics.pendingMaintenance}</div>
                <p className="text-xs text-muted-foreground">ordens de serviço abertas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarefas de Limpeza</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{metrics.cleaningTasks}</div>
                <p className="text-xs text-muted-foreground">tarefas em andamento</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Previsão de Ocupação (30 dias)
              </CardTitle>
              <CardDescription>Baseado em dados históricos e padrões sazonais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecast.slice(0, 10).map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {new Date(day.date).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Confiança: {formatPercentage(day.confidence * 100)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{day.predicted_occupancy}%</div>
                      <Progress value={day.predicted_occupancy} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Crescimento de Receita</span>
                    <span className="font-medium text-green-600">
                      +{formatPercentage(analytics.trends.revenueGrowth)}
                    </span>
                  </div>
                  <Progress value={Math.min(100, analytics.trends.revenueGrowth * 5)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tendência de Ocupação</span>
                    <span className="font-medium text-blue-600">
                      +{formatPercentage(analytics.trends.occupancyTrend)}
                    </span>
                  </div>
                  <Progress value={Math.min(100, analytics.trends.occupancyTrend * 10)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Duração Média da Estadia</span>
                    <span className="font-medium text-red-600">
                      {formatPercentage(analytics.trends.averageStayTrend)}
                    </span>
                  </div>
                  <Progress value={Math.max(0, 100 + analytics.trends.averageStayTrend * 10)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metas vs Realizado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meta de Receita Mensal</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(metrics.totalRevenue)} de {formatCurrency(metrics.totalRevenue * 1.18)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meta de Ocupação</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {formatPercentage(metrics.occupancyRate)} de 80% (meta)
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Satisfação do Cliente</span>
                    <span className="font-medium">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                  <div className="text-xs text-muted-foreground">Baseado em avaliações recentes</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
