"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const revenueData = [
  { month: "Jul", saas: 85000, commission: 12000 },
  { month: "Ago", saas: 92000, commission: 14500 },
  { month: "Set", saas: 98000, commission: 15800 },
  { month: "Out", saas: 105000, commission: 17200 },
  { month: "Nov", saas: 118000, commission: 19500 },
  { month: "Dez", saas: 127450, commission: 21800 },
]

export function RevenueAnalytics() {
  const maxValue = Math.max(...revenueData.map((d) => d.saas + d.commission))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Receita</CardTitle>
        <CardDescription>SaaS vs Comissões (últimos 6 meses)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {revenueData.map((data) => (
            <div key={data.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{data.month}</span>
                <span className="text-muted-foreground">R$ {((data.saas + data.commission) / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex space-x-1 h-3">
                <div className="bg-primary rounded-sm" style={{ width: `${(data.saas / maxValue) * 100}%` }} />
                <div className="bg-green-500 rounded-sm" style={{ width: `${(data.commission / maxValue) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span className="text-sm">Receita SaaS</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm">Comissões</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
