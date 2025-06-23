import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, BarChart3, Building2, AlertTriangle } from "lucide-react"

const reportsStats = [
  {
    title: "Clientes Ativos",
    value: "89",
    change: "+12 este mês",
    changeType: "positive" as const,
    icon: Users,
    description: "hotéis operando",
  },
  {
    title: "Receita Total",
    value: "R$ 2.2M",
    change: "+18.5%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "receita consolidada",
  },
  {
    title: "Taxa de Crescimento",
    value: "15.7%",
    change: "+2.3% vs trimestre",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "crescimento mensal",
  },
  {
    title: "Ocupação Média",
    value: "73.2%",
    change: "+5.1% vs mês anterior",
    changeType: "positive" as const,
    icon: Building2,
    description: "dos clientes",
  },
  {
    title: "Relatórios Gerados",
    value: "1.247",
    change: "+89 esta semana",
    changeType: "positive" as const,
    icon: BarChart3,
    description: "total do mês",
  },
  {
    title: "Alertas Críticos",
    value: "3",
    change: "2 resolvidos hoje",
    changeType: "negative" as const,
    icon: AlertTriangle,
    description: "requerem atenção",
  },
]

export function MasterReportsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reportsStats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge
                variant={
                  stat.changeType === "positive"
                    ? "default"
                    : stat.changeType === "negative"
                      ? "destructive"
                      : "secondary"
                }
                className="text-xs"
              >
                {stat.change}
              </Badge>
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
