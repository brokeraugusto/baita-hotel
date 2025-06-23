import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Eye, Calendar } from "lucide-react"

const recentReports = [
  {
    id: "REL-001",
    name: "Relatório Mensal - Janeiro 2024",
    type: "Financeiro",
    generatedAt: "2024-01-31",
    generatedBy: "Admin",
    size: "2.3 MB",
    status: "completed",
  },
  {
    id: "REL-002",
    name: "Análise de Ocupação - Q4 2023",
    type: "Performance",
    generatedAt: "2024-01-15",
    generatedBy: "Manager",
    size: "1.8 MB",
    status: "completed",
  },
  {
    id: "REL-003",
    name: "Relatório de Hóspedes VIP",
    type: "Hóspedes",
    generatedAt: "2024-01-10",
    generatedBy: "Admin",
    size: "945 KB",
    status: "completed",
  },
  {
    id: "REL-004",
    name: "Relatório Diário - 14/01/2024",
    type: "Operacional",
    generatedAt: "2024-01-14",
    generatedBy: "Recepção",
    size: "567 KB",
    status: "completed",
  },
]

const statusConfig = {
  completed: { label: "Concluído", variant: "default" as const },
  processing: { label: "Processando", variant: "secondary" as const },
  failed: { label: "Erro", variant: "destructive" as const },
}

const typeConfig = {
  Financeiro: "bg-green-100 text-green-800",
  Performance: "bg-blue-100 text-blue-800",
  Hóspedes: "bg-purple-100 text-purple-800",
  Operacional: "bg-orange-100 text-orange-800",
}

export function ReportsGrid() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios Recentes</CardTitle>
        <CardDescription>Histórico de relatórios gerados</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Relatório</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Gerado em</TableHead>
              <TableHead>Por</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">{report.id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={typeConfig[report.type as keyof typeof typeConfig]} variant="secondary">
                    {report.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(report.generatedAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </TableCell>
                <TableCell>{report.generatedBy}</TableCell>
                <TableCell>{report.size}</TableCell>
                <TableCell>
                  <Badge variant={statusConfig[report.status as keyof typeof statusConfig].variant}>
                    {statusConfig[report.status as keyof typeof statusConfig].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
