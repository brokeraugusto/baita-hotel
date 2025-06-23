"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const platformData = [
  { metric: "Uptime", value: 99.9, target: 99.5, status: "excellent" },
  { metric: "Response Time", value: 245, target: 300, status: "good", unit: "ms" },
  { metric: "Error Rate", value: 0.02, target: 0.1, status: "excellent", unit: "%" },
  { metric: "API Calls", value: 1250000, target: 1000000, status: "good", unit: "/mês" },
  { metric: "Storage Usage", value: 78, target: 85, status: "warning", unit: "%" },
  { metric: "Bandwidth", value: 2.3, target: 5.0, status: "good", unit: "TB" },
]

const statusColors = {
  excellent: "bg-green-500",
  good: "bg-blue-500",
  warning: "bg-yellow-500",
  critical: "bg-red-500",
}

export function PlatformMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas da Plataforma</CardTitle>
        <CardDescription>Performance e saúde do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platformData.map((item) => (
            <div key={item.metric} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.metric}</span>
                <span className="text-muted-foreground">
                  {item.value}
                  {item.unit} / {item.target}
                  {item.unit}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${statusColors[item.status as keyof typeof statusColors]}`}
                  style={{ width: `${Math.min((item.value / item.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
