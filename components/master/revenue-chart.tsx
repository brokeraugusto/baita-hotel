"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const revenueData = [
  { month: "Jan", saas: 98000, hotels: 1800000 },
  { month: "Fev", saas: 105000, hotels: 1950000 },
  { month: "Mar", saas: 112000, hotels: 2100000 },
  { month: "Abr", saas: 118000, hotels: 1850000 },
  { month: "Mai", saas: 125000, hotels: 2200000 },
  { month: "Jun", saas: 127450, hotels: 2100000 },
]

export function RevenueChart() {
  const maxValue = Math.max(...revenueData.map((d) => d.saas + d.hotels))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita Consolidada</CardTitle>
        <CardDescription>Receita SaaS vs Receita dos Hotéis (últimos 6 meses)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {revenueData.map((data, index) => (
            <div key={data.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{data.month}</span>
                <span className="text-muted-foreground">R$ {((data.saas + data.hotels) / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex space-x-1 h-2">
                <div className="bg-primary rounded-sm" style={{ width: `${(data.saas / maxValue) * 100}%` }} />
                <div className="bg-secondary rounded-sm" style={{ width: `${(data.hotels / maxValue) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-4 mt-6 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span className="text-sm">Receita SaaS</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-secondary rounded"></div>
            <span className="text-sm">Receita Hotéis</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
