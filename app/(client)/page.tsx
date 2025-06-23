import {
  ResponsiveCard,
  ResponsiveCardHeader,
  ResponsiveCardTitle,
  ResponsiveCardContent,
} from "@/components/ui/responsive-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Hotel, Users, DollarSign, Clock, Plus } from "lucide-react"

export default function ClientDashboard() {
  // Dados simulados
  const stats = [
    {
      title: "Reservas Hoje",
      value: "12",
      change: "+2 desde ontem",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Ocupação",
      value: "85%",
      change: "+5% esta semana",
      icon: Hotel,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Hóspedes",
      value: "34",
      change: "8 check-ins hoje",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Receita Hoje",
      value: "R$ 2.450",
      change: "+12% vs ontem",
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ]

  const recentReservations = [
    {
      id: "1",
      guest: "Maria Silva",
      room: "Quarto 101",
      checkin: "Hoje",
      status: "confirmed",
      amount: "R$ 280",
    },
    {
      id: "2",
      guest: "João Santos",
      room: "Suíte 205",
      checkin: "Amanhã",
      status: "pending",
      amount: "R$ 450",
    },
    {
      id: "3",
      guest: "Ana Costa",
      room: "Quarto 103",
      checkin: "15/06",
      status: "confirmed",
      amount: "R$ 320",
    },
  ]

  const quickActions = [
    { label: "Nova Reserva", href: "/client/reservas-nova", icon: Plus, color: "bg-blue-600" },
    { label: "Check-in", href: "/client/checkin", icon: Clock, color: "bg-green-600" },
    { label: "Ver Mapa", href: "/client/mapa-reservas", icon: Calendar, color: "bg-purple-600" },
    { label: "Buscar Quarto", href: "/client/busca-rapida", icon: Hotel, color: "bg-orange-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Bem-vindo de volta! Aqui está o resumo do seu hotel hoje.
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <ResponsiveCard key={index}>
            <ResponsiveCardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </div>
            </ResponsiveCardContent>
          </ResponsiveCard>
        ))}
      </div>

      {/* Quick Actions */}
      <ResponsiveCard>
        <ResponsiveCardHeader>
          <ResponsiveCardTitle>Ações Rápidas</ResponsiveCardTitle>
        </ResponsiveCardHeader>
        <ResponsiveCardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <Button key={index} variant="outline" className="h-16 sm:h-20 flex-col gap-2 p-3 sm:p-4" asChild>
                <a href={action.href}>
                  <div className={`p-2 rounded-full ${action.color} text-white`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-center">{action.label}</span>
                </a>
              </Button>
            ))}
          </div>
        </ResponsiveCardContent>
      </ResponsiveCard>

      {/* Recent Reservations */}
      <ResponsiveCard>
        <ResponsiveCardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <ResponsiveCardTitle>Reservas Recentes</ResponsiveCardTitle>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Ver Todas
            </Button>
          </div>
        </ResponsiveCardHeader>
        <ResponsiveCardContent>
          <div className="space-y-3 sm:space-y-4">
            {recentReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2 sm:gap-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm">
                    {reservation.guest
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium">{reservation.guest}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {reservation.room} • {reservation.checkin}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <Badge variant={reservation.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                    {reservation.status === "confirmed" ? "Confirmado" : "Pendente"}
                  </Badge>
                  <span className="text-sm sm:text-base font-semibold">{reservation.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </ResponsiveCardContent>
      </ResponsiveCard>
    </div>
  )
}
