"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { Calendar, Download, FileText, Percent, TrendingDown, TrendingUp, Users } from "lucide-react"

// Dados de exemplo para os gráficos
const occupancyData = [
  { name: "Jan", ocupacao: 65, receita: 45000 },
  { name: "Fev", ocupacao: 59, receita: 42000 },
  { name: "Mar", ocupacao: 80, receita: 58000 },
  { name: "Abr", ocupacao: 81, receita: 61000 },
  { name: "Mai", ocupacao: 90, receita: 68000 },
  { name: "Jun", ocupacao: 85, receita: 65000 },
]

const roomTypeData = [
  { name: "Standard", value: 35, receita: 25000 },
  { name: "Deluxe", value: 45, receita: 35000 },
  { name: "Suite", value: 20, receita: 28000 },
]

const dailyOccupancyData = [
  { day: "Seg", ocupacao: 45 },
  { day: "Ter", ocupacao: 52 },
  { day: "Qua", ocupacao: 49 },
  { day: "Qui", ocupacao: 60 },
  { day: "Sex", ocupacao: 85 },
  { day: "Sáb", ocupacao: 95 },
  { day: "Dom", ocupacao: 78 },
]

const guestOriginData = [
  { origem: "São Paulo", hospedes: 45, receita: 28000 },
  { origem: "Rio de Janeiro", hospedes: 32, receita: 22000 },
  { origem: "Belo Horizonte", hospedes: 28, receita: 18000 },
  { origem: "Brasília", hospedes: 22, receita: 15000 },
  { origem: "Outros", hospedes: 38, receita: 25000 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface Report {
  id: string
  name: string
  description: string
  type: "occupancy" | "revenue" | "guests" | "financial" | "custom"
  period: string
  generatedAt: string
  status: "ready" | "generating" | "error"
}

const predefinedReports: Report[] = [
  {
    id: "R-001",
    name: "Relatório de Ocupação Mensal",
    description: "Taxa de ocupação por categoria de quarto nos últimos 6 meses",
    type: "occupancy",
    period: "Últimos 6 meses",
    generatedAt: "2024-06-10T14:30:00Z",
    status: "ready",
  },
  {
    id: "R-002",
    name: "Análise de Receita por Período",
    description: "Receita detalhada por mês com comparativo do ano anterior",
    type: "revenue",
    period: "Ano atual",
    generatedAt: "2024-06-10T10:15:00Z",
    status: "ready",
  },
  {
    id: "R-003",
    name: "Perfil dos Hóspedes",
    description: "Análise demográfica e comportamental dos hóspedes",
    type: "guests",
    period: "Últimos 3 meses",
    generatedAt: "2024-06-09T16:45:00Z",
    status: "ready",
  },
  {
    id: "R-004",
    name: "Relatório Financeiro Completo",
    description: "Demonstrativo financeiro com receitas, custos e margem",
    type: "financial",
    period: "Último trimestre",
    generatedAt: "2024-06-08T09:20:00Z",
    status: "generating",
  },
]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedReport, setSelectedReport] = useState("occupancy")
  const [reports, setReports] = useState<Report[]>(predefinedReports)
  const { toast } = useToast()

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Relatório sendo gerado",
      description: "Seu relatório será processado e estará disponível em breve.",
    })
  }

  const handleDownloadReport = (reportId: string) => {
    toast({
      title: "Download iniciado",
      description: "O download do relatório foi iniciado.",
    })
  }

  const currentOccupancy = 85
  const currentRevenue = 65000
  const totalGuests = 165
  const avgDailyRate = 394

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Tudo
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentOccupancy}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +5.2% vs mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {currentRevenue.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +12.3% vs mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Hóspedes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              -2.1% vs mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diária Média</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {avgDailyRate}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +8.7% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="occupancy">Ocupação</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="guests">Hóspedes</TabsTrigger>
          <TabsTrigger value="rooms">Quartos</TabsTrigger>
        </TabsList>

        <TabsContent value="occupancy" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Ocupação Mensal</CardTitle>
                <CardDescription>Evolução da ocupação nos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={occupancyData}>
                    <defs>
                      <linearGradient id="colorOcupacao" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Area
                      type="monotone"
                      dataKey="ocupacao"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorOcupacao)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ocupação por Dia da Semana</CardTitle>
                <CardDescription>Padrão de ocupação semanal</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyOccupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="ocupacao" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Receita vs Ocupação</CardTitle>
                <CardDescription>Correlação entre ocupação e receita</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="receita" fill="#8884d8" name="Receita (R$)" />
                    <Line yAxisId="right" type="monotone" dataKey="ocupacao" stroke="#ff7300" name="Ocupação (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita por Tipo de Quarto</CardTitle>
                <CardDescription>Distribuição da receita por categoria</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roomTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="receita"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {roomTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guests" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Origem dos Hóspedes</CardTitle>
                <CardDescription>Distribuição geográfica dos hóspedes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={guestOriginData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="origem" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="hospedes" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita por Origem</CardTitle>
                <CardDescription>Receita gerada por região</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guestOriginData.map((item, index) => (
                    <div key={item.origem} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{item.origem}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">R$ {item.receita.toLocaleString("pt-BR")}</div>
                        <div className="text-sm text-muted-foreground">{item.hospedes} hóspedes</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Tipo de Quarto</CardTitle>
              <CardDescription>Análise detalhada de cada categoria de acomodação</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Quarto</TableHead>
                    <TableHead>Quartos Disponíveis</TableHead>
                    <TableHead>Taxa de Ocupação</TableHead>
                    <TableHead>Diária Média</TableHead>
                    <TableHead>Receita Total</TableHead>
                    <TableHead>RevPAR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Standard</TableCell>
                    <TableCell>20</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>78%</span>
                        <Badge variant="secondary">+5%</Badge>
                      </div>
                    </TableCell>
                    <TableCell>R$ 280</TableCell>
                    <TableCell>R$ 25.000</TableCell>
                    <TableCell>R$ 218</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Deluxe</TableCell>
                    <TableCell>15</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>85%</span>
                        <Badge variant="default">+8%</Badge>
                      </div>
                    </TableCell>
                    <TableCell>R$ 420</TableCell>
                    <TableCell>R$ 35.000</TableCell>
                    <TableCell>R$ 357</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Suite</TableCell>
                    <TableCell>8</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>92%</span>
                        <Badge variant="default">+12%</Badge>
                      </div>
                    </TableCell>
                    <TableCell>R$ 680</TableCell>
                    <TableCell>R$ 28.000</TableCell>
                    <TableCell>R$ 626</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Predefined Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Predefinidos</CardTitle>
          <CardDescription>Relatórios prontos para download e análise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    <Badge
                      variant={
                        report.status === "ready"
                          ? "default"
                          : report.status === "generating"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {report.status === "ready" && "Pronto"}
                      {report.status === "generating" && "Gerando"}
                      {report.status === "error" && "Erro"}
                    </Badge>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Período: {report.period}</span>
                    <span>Gerado: {new Date(report.generatedAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex space-x-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleGenerateReport(report.type)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Regenerar
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={report.status !== "ready"}
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
