"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  FileText,
  TrendingUp,
  Clock,
  DollarSign,
  Wrench,
  AlertTriangle,
  BarChart3,
  PieChart,
  Users,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MaintenanceStats {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  emergencyOrders: number
  totalCost: number
  averageCompletionTime: number
  completionRate: number
}

interface CategoryData {
  name: string
  count: number
  percentage: number
  color: string
}

interface TechnicianPerformance {
  name: string
  completedTasks: number
  averageRating: number
  efficiency: number
}

interface MonthlyTrend {
  month: string
  orders: number
  cost: number
  completionRate: number
}

export default function MaintenanceReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<MaintenanceStats>({
    totalOrders: 45,
    completedOrders: 38,
    pendingOrders: 7,
    emergencyOrders: 3,
    totalCost: 12500,
    averageCompletionTime: 4.2,
    completionRate: 84.4,
  })

  const [categoryData] = useState<CategoryData[]>([
    { name: "Elétrica", count: 15, percentage: 33.3, color: "bg-yellow-500" },
    { name: "Hidráulica", count: 12, percentage: 26.7, color: "bg-blue-500" },
    { name: "Ar-condicionado", count: 8, percentage: 17.8, color: "bg-green-500" },
    { name: "Mobiliário", count: 6, percentage: 13.3, color: "bg-purple-500" },
    { name: "Outros", count: 4, percentage: 8.9, color: "bg-gray-500" },
  ])

  const [technicianData] = useState<TechnicianPerformance[]>([
    { name: "João Silva", completedTasks: 15, averageRating: 4.8, efficiency: 92 },
    { name: "Maria Santos", completedTasks: 12, averageRating: 4.6, efficiency: 88 },
    { name: "Pedro Costa", completedTasks: 8, averageRating: 4.9, efficiency: 95 },
    { name: "Ana Lima", completedTasks: 6, averageRating: 4.7, efficiency: 90 },
  ])

  const [monthlyTrend] = useState<MonthlyTrend[]>([
    { month: "Jan", orders: 8, cost: 2100, completionRate: 87.5 },
    { month: "Fev", orders: 12, cost: 3200, completionRate: 83.3 },
    { month: "Mar", orders: 15, cost: 4100, completionRate: 86.7 },
    { month: "Abr", orders: 10, cost: 2800, completionRate: 90.0 },
    { month: "Mai", orders: 18, cost: 5200, completionRate: 77.8 },
    { month: "Jun", orders: 14, cost: 3800, completionRate: 85.7 },
  ])

  const { toast } = useToast()

  const handleExport = (format: "pdf" | "excel") => {
    setIsLoading(true)
    // Simular exportação
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Relatório exportado",
        description: `Relatório exportado em formato ${format.toUpperCase()} com sucesso.`,
      })
    }, 2000)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios de Manutenção</h1>
          <p className="text-muted-foreground">Análise completa das atividades de manutenção e performance da equipe</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport("pdf")} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")} disabled={isLoading}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ordens</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedOrders} concluídas ({stats.completionRate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergências</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.emergencyOrders}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.emergencyOrders / stats.totalOrders) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Média: {formatCurrency(stats.totalCost / stats.totalOrders)} por ordem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCompletionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Para conclusão das ordens</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="technicians">Técnicos</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status das Ordens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Status das Ordens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Concluídas</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stats.completedOrders}</div>
                      <div className="text-xs text-muted-foreground">
                        {((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Pendentes</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stats.pendingOrders}</div>
                      <div className="text-xs text-muted-foreground">
                        {((stats.pendingOrders / stats.totalOrders) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Emergências</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stats.emergencyOrders}</div>
                      <div className="text-xs text-muted-foreground">
                        {((stats.emergencyOrders / stats.totalOrders) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eficiência da Equipe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Eficiência da Equipe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.completionRate.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">Taxa de conclusão</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tempo médio de resposta</span>
                    <span className="font-medium">2.1h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Satisfação média</span>
                    <span className="font-medium">4.7/5.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Retrabalho</span>
                    <span className="font-medium">3.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ordens por Categoria</CardTitle>
              <CardDescription>Distribuição das ordens de manutenção por tipo de serviço</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${category.color}`}></div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{category.count} ordens</div>
                        <div className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Performance dos Técnicos
              </CardTitle>
              <CardDescription>Análise individual da performance da equipe técnica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technicianData.map((tech, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{tech.name}</p>
                        <p className="text-sm text-muted-foreground">{tech.completedTasks} tarefas concluídas</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{tech.efficiency}% eficiência</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.round(tech.averageRating) }).map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">{tech.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tendências Mensais
              </CardTitle>
              <CardDescription>Evolução das métricas de manutenção ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {monthlyTrend.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{month.month}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{month.orders} ordens</span>
                        <span>{formatCurrency(month.cost)}</span>
                        <Badge variant={month.completionRate >= 85 ? "default" : "secondary"}>
                          {month.completionRate.toFixed(1)}% conclusão
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-200 h-2 rounded" style={{ width: `${(month.orders / 20) * 100}%` }}></div>
                      <div
                        className="bg-green-200 h-2 rounded"
                        style={{ width: `${(month.cost / 6000) * 100}%` }}
                      ></div>
                      <div className="bg-purple-200 h-2 rounded" style={{ width: `${month.completionRate}%` }}></div>
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
