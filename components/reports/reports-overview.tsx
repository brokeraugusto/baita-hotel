import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Calendar, Users } from "lucide-react"

const reportsStats = [
  {
    title: "Relatórios Gerados",
    value: "47",
    change: "+12 este mês",
    changeType: "positive" as const,
    icon: BarChart3,
    description: "total",
  },
  {
    title: "Taxa de Ocupação",
    value: "78%",
    change: "+5.2% vs mês anterior",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "média mensal",
  },
  {
    title: "Diária Média",
    value: "R$ 320",
    change: "+8.1% vs mês anterior",
    changeType: "positive" as const,
    icon: Calendar,
    description: "ADR",
  },
  {
    title: "Satisfação",
    value: "4.7",
    change: "89% recomendam",
    changeType: "positive" as const,
    icon: Users,
    description: "avaliação média",
  },
]

export function ReportsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
