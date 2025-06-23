import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const notificationTypes = [
  {
    id: "new-reservations",
    title: "Novas Reservas",
    description: "Notificar sobre novas reservas recebidas",
    enabled: true,
  },
  {
    id: "check-in-reminder",
    title: "Lembrete de Check-in",
    description: "Lembrar sobre check-ins do dia",
    enabled: true,
  },
  {
    id: "maintenance-alerts",
    title: "Alertas de Manutenção",
    description: "Notificar sobre ordens de serviço críticas",
    enabled: true,
  },
  {
    id: "financial-reports",
    title: "Relatórios Financeiros",
    description: "Enviar relatórios financeiros diários",
    enabled: false,
  },
  {
    id: "system-updates",
    title: "Atualizações do Sistema",
    description: "Notificar sobre atualizações e novidades",
    enabled: true,
  },
]

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Notificação</CardTitle>
        <CardDescription>Gerencie como e quando receber notificações</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {notificationTypes.map((notification) => (
            <div key={notification.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={notification.id}>{notification.title}</Label>
                <p className="text-sm text-muted-foreground">{notification.description}</p>
              </div>
              <Switch id={notification.id} defaultChecked={notification.enabled} />
            </div>
          ))}
        </div>

        <Button className="w-full">Salvar Preferências</Button>
      </CardContent>
    </Card>
  )
}
