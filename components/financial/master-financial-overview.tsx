import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, CreditCard, Building2, Users, AlertCircle } from "lucide-react"

const financialStats = [
  {
    title: "Receita SaaS (MRR)",
    value: "R$ 127.450",
    change: "+18.2%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "Receita Mensal Recorrente",
  },
  {
    title: "Receita Total Hotéis",
    value: "R$ 2.1M",
    change: "+15.7%",
    changeType: "positive" as const,
    icon: Building2,
    description: "Receita consolidada dos clientes",
  },
  {
    title: "Comissão Média",
    value: "6.1%",
    change: "+0.3%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "Sobre receita dos hotéis",
  },
  {
    title: "Pagamentos Pendentes",
    value: "R$ 8.450",
    change: "12 faturas",
    changeType: "negative" as const,
    icon: AlertCircle,
    description: "Em atraso",
  },
  {
    title: "CAC Médio",
    value: "R$ 245",
    change: "-12.5%",
    changeType: "positive" as const,
    icon: Users,
    description: "Custo de Aquisição",
  },
  {
    title: "LTV/CAC Ratio",
    value: "34.5x",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: CreditCard,
    description: "Retorno sobre investimento",
  },
]

export function MasterFinancialOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
