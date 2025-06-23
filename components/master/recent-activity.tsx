import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: "1",
    type: "new_client",
    client: "Hotel Beira Mar",
    description: "Novo cliente cadastrado - Plano Pro",
    time: "2 horas atrás",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "2",
    type: "upgrade",
    client: "Pousada Recanto",
    description: "Upgrade de Básico para Premium",
    time: "4 horas atrás",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "3",
    type: "payment",
    client: "Resort Tropical",
    description: "Pagamento recebido - R$ 890,00",
    time: "6 horas atrás",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "4",
    type: "support",
    client: "Hotel Central",
    description: "Ticket de suporte crítico aberto",
    time: "8 horas atrás",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "5",
    type: "churn",
    client: "Pousada Antiga",
    description: "Cliente cancelou assinatura",
    time: "1 dia atrás",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const activityConfig = {
  new_client: { label: "Novo Cliente", variant: "default" as const },
  upgrade: { label: "Upgrade", variant: "default" as const },
  payment: { label: "Pagamento", variant: "default" as const },
  support: { label: "Suporte", variant: "destructive" as const },
  churn: { label: "Cancelamento", variant: "secondary" as const },
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>Últimas atividades na plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.client} />
                <AvatarFallback>
                  {activity.client
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.client}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant={activityConfig[activity.type as keyof typeof activityConfig].variant}>
                  {activityConfig[activity.type as keyof typeof activityConfig].label}
                </Badge>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
