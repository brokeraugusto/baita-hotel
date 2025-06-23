"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const monthlyData = [
  { month: "Jul", saas: 85000, hotels: 1600000 },
  { month: "Ago", saas: 92000, hotels: 1750000 },
  { month: "Set", saas: 98000, hotels: 1800000 },
  { month: "Out", saas: 105000, hotels: 1950000 },
  { month: "Nov", saas: 118000, hotels: 1850000 },
  { month: "Dez", saas: 127450, hotels: 2100000 },
]

export function FinancialCharts() {
  const maxValue = Math.max(...monthlyData.map((d) => d.saas + d.hotels))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução da Receita</CardTitle>
        <CardDescription>Comparativo SaaS vs Receita dos Hotéis (últimos 6 meses)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {monthlyData.map((data, index) => (
            <div key={data.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{data.month}</span>
                <div className="flex space-x-4 text-muted-foreground">
                  <span>SaaS: R$ {(data.saas / 1000).toFixed(0)}k</span>
                  <span>Hotéis: R$ {(data.hotels / 1000).toFixed(0)}k</span>
                </div>
              </div>
              <div className="flex space-x-1 h-3">
                <div className="bg-primary rounded-sm" style={{ width: `${(data.saas / maxValue) * 100}%` }} />
                <div className="bg-green-500 rounded-sm" style={{ width: `${(data.hotels / maxValue) * 100}%` }} />
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
            <span className="text-sm">Receita Hotéis</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
