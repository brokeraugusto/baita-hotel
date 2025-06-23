import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, Clock, CheckCircle, AlertTriangle, Users, TrendingDown } from "lucide-react"

const supportStats = [
  {
    title: "Tickets Abertos",
    value: "23",
    change: "5 críticos",
    changeType: "negative" as const,
    icon: Ticket,
    description: "pendentes",
  },
  {
    title: "Tempo Médio Resposta",
    value: "2.3h",
    change: "-15min vs ontem",
    changeType: "positive" as const,
    icon: Clock,
    description: "primeira resposta",
  },
  {
    title: "Resolvidos Hoje",
    value: "18",
    change: "+6 vs ontem",
    changeType: "positive" as const,
    icon: CheckCircle,
    description: "tickets fechados",
  },
  {
    title: "Satisfação",
    value: "4.8",
    change: "94% positivas",
    changeType: "positive" as const,
    icon: Users,
    description: "avaliação média",
  },
  {
    title: "SLA Cumprido",
    value: "96.2%",
    change: "+2.1% vs mês",
    changeType: "positive" as const,
    icon: TrendingDown,
    description: "dentro do prazo",
  },
  {
    title: "Escalações",
    value: "3",
    change: "2 resolvidas",
    changeType: "negative" as const,
    icon: AlertTriangle,
    description: "para supervisão",
  },
]

export function SupportOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {supportStats.map((stat) => (
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
