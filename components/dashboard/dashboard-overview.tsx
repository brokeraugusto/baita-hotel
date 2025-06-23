import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Users, TrendingUp, Building2, Clock } from "lucide-react"

const stats = [
  {
    title: "Receita Mensal",
    value: "R$ 45.231",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "vs. mês anterior",
  },
  {
    title: "Taxa de Ocupação",
    value: "78%",
    change: "+5.2%",
    changeType: "positive" as const,
    icon: Building2,
    description: "média mensal",
  },
  {
    title: "Reservas Hoje",
    value: "12",
    change: "3 check-ins",
    changeType: "neutral" as const,
    icon: Calendar,
    description: "5 check-outs",
  },
  {
    title: "Hóspedes Ativos",
    value: "34",
    change: "89% satisfação",
    changeType: "positive" as const,
    icon: Users,
    description: "avaliação média",
  },
  {
    title: "RevPAR",
    value: "R$ 156",
    change: "+8.1%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "receita por quarto",
  },
  {
    title: "Tempo Médio Estadia",
    value: "2.3 dias",
    change: "+0.2 dias",
    changeType: "positive" as const,
    icon: Clock,
    description: "vs. mês anterior",
  },
]

export function DashboardOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
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
