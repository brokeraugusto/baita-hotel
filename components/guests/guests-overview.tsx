import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Star, Calendar } from "lucide-react"

const guestsStats = [
  {
    title: "Total de Hóspedes",
    value: "1.247",
    change: "+89 este mês",
    changeType: "positive" as const,
    icon: Users,
    description: "cadastrados",
  },
  {
    title: "Hóspedes Ativos",
    value: "34",
    change: "12 check-ins hoje",
    changeType: "positive" as const,
    icon: UserCheck,
    description: "no hotel",
  },
  {
    title: "Avaliação Média",
    value: "4.7",
    change: "+0.2 vs mês anterior",
    changeType: "positive" as const,
    icon: Star,
    description: "satisfação",
  },
  {
    title: "Retorno",
    value: "23%",
    change: "Taxa de retorno",
    changeType: "neutral" as const,
    icon: Calendar,
    description: "hóspedes recorrentes",
  },
]

export function GuestsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {guestsStats.map((stat) => (
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
