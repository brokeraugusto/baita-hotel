import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const planDistribution = [
  { plan: "Básico", count: 34, percentage: 38, color: "bg-blue-500" },
  { plan: "Pro", count: 41, percentage: 46, color: "bg-green-500" },
  { plan: "Premium", count: 14, percentage: 16, color: "bg-purple-500" },
]

const recentClients = [
  {
    name: "Hotel Vista Mar",
    plan: "Pro",
    status: "active",
    revenue: "R$ 2.450",
    joinDate: "2024-01-10",
  },
  {
    name: "Pousada do Sol",
    plan: "Básico",
    status: "trial",
    revenue: "R$ 0",
    joinDate: "2024-01-12",
  },
  {
    name: "Resort Paradise",
    plan: "Premium",
    status: "active",
    revenue: "R$ 4.890",
    joinDate: "2024-01-08",
  },
]

export function ClientsOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visão Geral dos Clientes</CardTitle>
        <CardDescription>Distribuição por planos e clientes recentes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Distribuição por Planos</h4>
          {planDistribution.map((item) => (
            <div key={item.plan} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{item.plan}</span>
                <span className="text-muted-foreground">{item.count} clientes</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Clientes Recentes</h4>
          {recentClients.map((client) => (
            <div key={client.name} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{client.name}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {client.plan}
                  </Badge>
                  <Badge variant={client.status === "active" ? "default" : "secondary"} className="text-xs">
                    {client.status === "active" ? "Ativo" : "Trial"}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{client.revenue}</p>
                <p className="text-xs text-muted-foreground">/mês</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
