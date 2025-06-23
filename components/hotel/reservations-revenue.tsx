"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const revenueData = [
  { month: "Jan", value: 32000 },
  { month: "Fev", value: 35000 },
  { month: "Mar", value: 38000 },
  { month: "Abr", value: 42000 },
  { month: "Mai", value: 40000 },
  { month: "Jun", value: 45231 },
]

export function ReservationsRevenue() {
  const maxValue = Math.max(...revenueData.map((d) => d.value))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita de Reservas</CardTitle>
        <CardDescription>Receita mensal dos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {revenueData.map((data) => (
            <div key={data.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{data.month}</span>
                <span className="text-muted-foreground">R$ {data.value.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary" style={{ width: `${(data.value / maxValue) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
