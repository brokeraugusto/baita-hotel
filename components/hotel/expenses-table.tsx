import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const expenses = [
  {
    category: "Pessoal",
    amount: 12450,
    percentage: 43.8,
    status: "normal",
  },
  {
    category: "Manutenção",
    amount: 5200,
    percentage: 18.3,
    status: "high",
  },
  {
    category: "Suprimentos",
    amount: 3800,
    percentage: 13.4,
    status: "normal",
  },
  {
    category: "Utilidades",
    amount: 4100,
    percentage: 14.4,
    status: "normal",
  },
  {
    category: "Marketing",
    amount: 2900,
    percentage: 10.1,
    status: "low",
  },
]

const statusConfig = {
  high: { label: "Alto", variant: "destructive" as const },
  normal: { label: "Normal", variant: "secondary" as const },
  low: { label: "Baixo", variant: "default" as const },
}

export function ExpensesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Principais Despesas</CardTitle>
        <CardDescription>Distribuição de despesas por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.category} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{expense.category}</div>
                <div className="text-sm text-muted-foreground">{expense.percentage}% do total</div>
              </div>
              <div className="text-right">
                <div className="font-medium">R$ {expense.amount.toLocaleString()}</div>
                <Badge variant={statusConfig[expense.status as keyof typeof statusConfig].variant} className="mt-1">
                  {statusConfig[expense.status as keyof typeof statusConfig].label}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
