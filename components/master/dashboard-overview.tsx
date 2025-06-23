import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, DollarSign, Users, TrendingUp, CreditCard, AlertTriangle } from "lucide-react"

const masterStats = [
  {
    title: "MRR Total",
    value: "R$ 127.450",
    change: "+18.2%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "Receita Mensal Recorrente",
  },
  {
    title: "Clientes Ativos",
    value: "89",
    change: "+12 novos",
    changeType: "positive" as const,
    icon: Building2,
    description: "hotéis e pousadas",
  },
  {
    title: "Receita Hotéis",
    value: "R$ 2.1M",
    change: "+15.7%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "receita total dos clientes",
  },
  {
    title: "Taxa de Churn",
    value: "2.1%",
    change: "-0.5%",
    changeType: "positive" as const,
    icon: Users,
    description: "vs. mês anterior",
  },
  {
    title: "LTV Médio",
    value: "R$ 8.450",
    change: "+12.3%",
    changeType: "positive" as const,
    icon: CreditCard,
    description: "Lifetime Value",
  },
  {
    title: "Tickets Suporte",
    value: "23",
    change: "5 críticos",
    changeType: "negative" as const,
    icon: AlertTriangle,
    description: "pendentes",
  },
]

export function MasterDashboardOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {masterStats.map((stat) => (
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
