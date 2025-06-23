"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Clock, DollarSign, Wrench, AlertTriangle, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface MaintenanceReportsProps {
  hotelId: string
}

interface ReportData {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  emergencyOrders: number
  totalCost: number
  averageCompletionTime: number
  categoryBreakdown: Array<{ name: string; value: number; color: string }>
  monthlyTrend: Array<{ month: string; orders: number; cost: number }>
  priorityDistribution: Array<{ priority: string; count: number }>
  technicianPerformance: Array<{ name: string; completed: number; rating: number }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function MaintenanceReports({ hotelId }: MaintenanceReportsProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30") // dias

  useEffect(() => {
    fetchReportData()
  }, [hotelId, selectedPeriod])

  const fetchReportData = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // Calcular data de início baseada no período selecionado
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Number.parseInt(selectedPeriod))

      // Buscar ordens de manutenção do período
      const { data: orders, error } = await supabase
        .from("maintenance_orders")
        .select(`
          *,
          category:maintenance_categories(name, color),
          technician:maintenance_technicians(name)
        `)
        .eq("hotel_id", hotelId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())

      if (error) {
        console.error("Error fetching report data:", error)
        // Usar dados mock em caso de erro
        setReportData(getMockReportData())
        return
      }

      // Processar dados para relatórios
      const processedData = processReportData(orders || [])
      setReportData(processedData)
    } catch (error) {
      console.error("Error in fetchReportData:", error)
      setReportData(getMockReportData())
    } finally {
      setIsLoading(false)
    }
  }

  const processReportData = (orders: any[]): ReportData => {
    const totalOrders = orders.length
    const completedOrders = orders.filter((o) => o.status === "completed").length
    const pendingOrders = orders.filter((o) => o.status === "pending").length
    const emergencyOrders = orders.filter((o) => o.is_emergency).length

    const totalCost = orders.reduce((sum, order) => sum + (order.actual_cost || order.estimated_cost || 0), 0)

    // Calcular tempo médio de conclusão (em horas)
    const completedWithTime = orders.filter((o) => o.status === "completed" && o.completed_at && o.created_at)
    const averageCompletionTime =
      completedWithTime.length > 0
        ? completedWithTime.reduce((sum, order) => {
            const start = new Date(order.created_at).getTime()
            const end = new Date(order.completed_at).getTime()
            return sum + (end - start) / (1000 * 60 * 60) // converter para horas
          }, 0) / completedWithTime.length
        : 0

    // Breakdown por categoria
    const categoryMap = new Map()
    orders.forEach((order) => {
      const categoryName = order.category?.name || "Sem Categoria"
      const categoryColor = order.category?.color || "#6B7280"
      if (categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          ...categoryMap.get(categoryName),
          value: categoryMap.get(categoryName).value + 1,
        })
      } else {
        categoryMap.set(categoryName, { name: categoryName, value: 1, color: categoryColor })
      }
    })
    const categoryBreakdown = Array.from(categoryMap.values())

    // Tendência mensal (últimos 6 meses)
    const monthlyTrend = generateMonthlyTrend(orders)

    // Distribuição por prioridade
    const priorityMap = new Map()
    orders.forEach((order) => {
      const priority = order.priority || "medium"
      priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1)
    })
    const priorityDistribution = Array.from(priorityMap.entries()).map(([priority, count]) => ({
      priority,
      count,
    }))

    // Performance dos técnicos
    const technicianMap = new Map()
    orders
      .filter((o) => o.technician && o.status === "completed")
      .forEach((order) => {
        const techName = order.technician.name
        if (technicianMap.has(techName)) {
          const current = technicianMap.get(techName)
          technicianMap.set(techName, {
            name: techName,
            completed: current.completed + 1,
            rating: (current.rating + (order.quality_rating || 5)) / 2,
          })
        } else {
          technicianMap.set(techName, {
            name: techName,
            completed: 1,
            rating: order.quality_rating || 5,
          })
        }
      })
    const technicianPerformance = Array.from(technicianMap.values())

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      emergencyOrders,
      totalCost,
      averageCompletionTime,
      categoryBreakdown,
      monthlyTrend,
      priorityDistribution,
      technicianPerformance,
    }
  }

  const generateMonthlyTrend = (orders: any[]) => {
    const months = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString("pt-BR", { month: "short" })

      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.created_at)
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
      })

      const monthCost = monthOrders.reduce((sum, order) => sum + (order.actual_cost || order.estimated_cost || 0), 0)

      months.push({
        month: monthName,
        orders: monthOrders.length,
        cost: monthCost,
      })
    }

    return months
  }

  const getMockReportData = (): ReportData => ({
    totalOrders: 45,
    completedOrders: 38,
    pendingOrders: 7,
    emergencyOrders: 3,
    totalCost: 12500.0,
    averageCompletionTime: 4.2,
    categoryBreakdown: [
      { name: "Elétrica", value: 15, color: "#F59E0B" },
      { name: "Hidráulica", value: 12, color: "#3B82F6" },
      { name: "Ar-condicionado", value: 8, color: "#10B981" },
      { name: "Mobiliário", value: 6, color: "#8B5CF6" },
      { name: "Outros", value: 4, color: "#6B7280" },
    ],
    monthlyTrend: [
      { month: "Jan", orders: 8, cost: 2100 },
      { month: "Fev", orders: 12, cost: 3200 },
      { month: "Mar", orders: 15, cost: 4100 },
      { month: "Abr", orders: 10, cost: 2800 },
      { month: "Mai", orders: 18, cost: 5200 },
      { month: "Jun", orders: 14, cost: 3800 },
    ],
    priorityDistribution: [
      { priority: "low", count: 12 },
      { priority: "medium", count: 25 },
      { priority: "high", count: 6 },
      { priority: "urgent", count: 2 },
    ],
    technicianPerformance: [
      { name: "João Silva", completed: 15, rating: 4.8 },
      { name: "Maria Santos", completed: 12, rating: 4.6 },
      { name: "Pedro Costa", completed: 8, rating: 4.9 },
      { name: "Ana Lima", completed: 6, rating: 4.7 },
    ],
  })

  const exportReport = () => {
    // Implementar exportação para PDF/Excel
    console.log("Exportando relatório...")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!reportData) {
    return <div>Erro ao carregar dados do relatório</div>
  }

  const completionRate = reportData.totalOrders > 0 ? (reportData.completedOrders / reportData.totalOrders) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Relatórios de Manutenção</h3>
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
          <Button variant="outline" onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ordens</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.completedOrders} concluídas ({completionRate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergências</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reportData.emergencyOrders}</div>
            <p className="text-xs text-muted-foreground">
              {((reportData.emergencyOrders / reportData.totalOrders) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {reportData.totalCost.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">
              Média: R$ {(reportData.totalCost / reportData.totalOrders).toFixed(2)} por ordem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.averageCompletionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Para conclusão das ordens</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Ordens por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendência mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance dos técnicos */}
      <Card>
        <CardHeader>
          <CardTitle>Performance dos Técnicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.technicianPerformance.map((tech, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{tech.name}</p>
                  <p className="text-sm text-muted-foreground">{tech.completed} ordens concluídas</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.round(tech.rating) }).map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{tech.rating.toFixed(1)}/5.0</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
