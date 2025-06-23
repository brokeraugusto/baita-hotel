import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, Wrench, Sparkles, FileText } from "lucide-react"

const actions = [
  {
    title: "Nova Reserva",
    description: "Criar uma nova reserva",
    icon: Plus,
    href: "/reservas/nova",
  },
  {
    title: "Ver Calendário",
    description: "Visualizar ocupação",
    icon: Calendar,
    href: "/reservas",
  },
  {
    title: "Cadastrar Hóspede",
    description: "Adicionar novo hóspede",
    icon: Users,
    href: "/hospedes/novo",
  },
  {
    title: "Ordem de Serviço",
    description: "Abrir chamado de manutenção",
    icon: Wrench,
    href: "/manutencao/nova",
  },
  {
    title: "Status Limpeza",
    description: "Verificar governança",
    icon: Sparkles,
    href: "/limpeza",
  },
  {
    title: "Relatório Diário",
    description: "Gerar relatório do dia",
    icon: FileText,
    href: "/relatorios/diario",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              asChild
            >
              <a href={action.href}>
                <action.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
