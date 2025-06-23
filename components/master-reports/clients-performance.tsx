import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown } from "lucide-react"

const clientsData = [
  {
    name: "Hotel Vista Mar",
    plan: "Pro",
    revenue: 45231,
    growth: 12.5,
    occupancy: 78,
    satisfaction: 4.7,
    status: "excellent",
  },
  {
    name: "Resort Paradise",
    plan: "Premium",
    revenue: 89450,
    growth: 18.2,
    occupancy: 85,
    satisfaction: 4.9,
    status: "excellent",
  },
  {
    name: "Pousada do Sol",
    plan: "Básico",
    revenue: 12800,
    growth: -2.1,
    occupancy: 65,
    satisfaction: 4.2,
    status: "warning",
  },
  {
    name: "Hotel Central",
    plan: "Pro",
    revenue: 32100,
    growth: 8.7,
    occupancy: 72,
    satisfaction: 4.5,
    status: "good",
  },
  {
    name: "Chalés da Montanha",
    plan: "Básico",
    revenue: 18900,
    growth: 15.3,
    occupancy: 90,
    satisfaction: 4.8,
    status: "excellent",
  },
]

const statusConfig = {
  excellent: { label: "Excelente", variant: "default" as const },
  good: { label: "Bom", variant: "secondary" as const },
  warning: { label: "Atenção", variant: "destructive" as const },
}

export function ClientsPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance dos Clientes</CardTitle>
        <CardDescription>Top clientes por receita e crescimento</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Receita Mensal</TableHead>
              <TableHead>Crescimento</TableHead>
              <TableHead>Ocupação</TableHead>
              <TableHead>Satisfação</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientsData.map((client) => (
              <TableRow key={client.name}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{client.plan}</Badge>
                </TableCell>
                <TableCell>R$ {client.revenue.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {client.growth > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={client.growth > 0 ? "text-green-600" : "text-red-600"}>
                      {client.growth > 0 ? "+" : ""}
                      {client.growth}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>{client.occupancy}%</TableCell>
                <TableCell>{client.satisfaction}/5</TableCell>
                <TableCell>
                  <Badge variant={statusConfig[client.status as keyof typeof statusConfig].variant}>
                    {statusConfig[client.status as keyof typeof statusConfig].label}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
