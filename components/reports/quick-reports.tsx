import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, DollarSign, Users, BarChart3 } from "lucide-react"

const quickReports = [
  {
    title: "Relatório Diário",
    description: "Ocupação, receita e check-ins/outs do dia",
    icon: Calendar,
    action: "Gerar Hoje",
  },
  {
    title: "Relatório Financeiro",
    description: "Receitas, despesas e fluxo de caixa mensal",
    icon: DollarSign,
    action: "Gerar Mês",
  },
  {
    title: "Relatório de Hóspedes",
    description: "Perfil, satisfação e histórico dos hóspedes",
    icon: Users,
    action: "Gerar Lista",
  },
  {
    title: "Análise de Performance",
    description: "KPIs, ocupação e comparativos mensais",
    icon: BarChart3,
    action: "Gerar Análise",
  },
]

export function QuickReports() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios Rápidos</CardTitle>
        <CardDescription>Gere relatórios instantâneos com um clique</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickReports.map((report) => (
            <div key={report.title} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center space-x-2">
                <report.icon className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{report.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{report.description}</p>
              <Button size="sm" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                {report.action}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
