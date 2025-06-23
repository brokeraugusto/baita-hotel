import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, CreditCard, Calendar } from "lucide-react"

const financialStats = [
  {
    title: "Receita Mensal",
    value: "R$ 45.231",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "vs. mês anterior",
  },
  {
    title: "Diária Média",
    value: "R$ 320",
    change: "+5.2%",
    changeType: "positive" as const,
    icon: Calendar,
    description: "vs. mês anterior",
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
    title: "Despesas",
    value: "R$ 28.450",
    change: "-3.2%",
    changeType: "positive" as const,
    icon: CreditCard,
    description: "vs. mês anterior",
  },
]

export function HotelFinancialOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {financialStats.map((stat) => (
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
