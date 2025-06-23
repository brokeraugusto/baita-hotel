"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"

interface AnalyticsDashboardProps {
  hotelId: string
}

export function AnalyticsDashboard({ hotelId }: AnalyticsDashboardProps) {
  const [analytics] = useState({
    revenue: {
      total: 125000,
      growth: 12.5,
      byCategory: [
        { category: "Standard", revenue: 45000, percentage: 36 },
        { category: "Deluxe", revenue: 50000, percentage: 40 },
        { category: "Suite", revenue: 30000, percentage: 24 },
      ],
    },
    occupancy: {
      current: 85,
      trend: 8.3,
      forecast: [
        { date: "2024-01-16", predicted: 88 },
        { date: "2024-01-17", predicted: 92 },
        { date: "2024-01-18", predicted: 85 },
        { date: "2024-01-19", predicted: 78 },
        { date: "2024-01-20", predicted: 95 },
      ],
    },
    performance: {
      revPAR: 245.5,
      adr: 288.24,
      satisfaction: 4.7,
    },
  })

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {analytics.performance.revPAR}</div>
            <p className="text-xs text-muted-foreground">Revenue per Available Room</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ADR</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {analytics.performance.adr}</div>
            <p className="text-xs text-muted-foreground">Average Daily Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.satisfaction}/5</div>
            <p className="text-xs text-muted-foreground">Avaliação média dos hóspedes</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="occupancy">Ocupação</TabsTrigger>
          <TabsTrigger value="forecast">Previsões</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Receita por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.revenue.byCategory.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{category.category}</span>
                      <span className="font-medium">R$ {category.revenue.toLocaleString()}</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">{category.percentage}% do total</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance de Receita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Receita Total</span>
                    <span className="font-medium">R$ {analytics.revenue.total.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+{analytics.revenue.growth}% vs mês anterior</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meta Mensal</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    R$ {analytics.revenue.total.toLocaleString()} de R$ 147.000 (meta)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Ocupação Atual</CardTitle>
              <CardDescription>Performance de ocupação em tempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold">{analytics.occupancy.current}%</div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+{analytics.occupancy.trend}% vs período anterior</span>
                </div>
              </div>
              <Progress value={analytics.occupancy.current} className="h-4" />
              <div className="text-sm text-muted-foreground text-center">42 de 50 quartos ocupados</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Ocupação</CardTitle>
              <CardDescription>Próximos 5 dias baseado em dados históricos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.occupancy.forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {new Date(day.date).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{day.predicted}%</div>
                      <Progress value={day.predicted} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
