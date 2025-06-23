import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const revenueBreakdown = [
  {
    source: "Assinaturas SaaS",
    amount: 127450,
    percentage: 85,
    color: "bg-primary",
  },
  {
    source: "Comissões Reservas",
    amount: 18200,
    percentage: 12,
    color: "bg-green-500",
  },
  {
    source: "Serviços Extras",
    amount: 4500,
    percentage: 3,
    color: "bg-blue-500",
  },
]

const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.amount, 0)

export function RevenueBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown de Receita</CardTitle>
        <CardDescription>Distribuição das fontes de receita (mensal)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold">R$ {totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Receita Total Mensal</div>
        </div>

        <div className="space-y-4">
          {revenueBreakdown.map((item) => (
            <div key={item.source} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.source}</span>
                <span className="text-muted-foreground">
                  R$ {item.amount.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Crescimento MoM</div>
              <div className="font-medium text-green-600">+18.2%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Projeção Anual</div>
              <div className="font-medium">R$ 1.8M</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
