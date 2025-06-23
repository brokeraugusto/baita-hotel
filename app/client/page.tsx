"use client"

import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { RecentReservations } from "@/components/dashboard/recent-reservations"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, Building2, AlertCircle, Clock, Plus } from "lucide-react"

export default function ClientDashboardPage() {
  // Dados simulados para o dashboard
  const todayStats = {
    checkins: 3,
    checkouts: 5,
    currentGuests: 12,
    pendingTasks: 4,
  }

  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Manutenção Pendente",
      description: "Quarto 205 - Ar condicionado",
      time: "2h atrás",
    },
    {
      id: 2,
      type: "info",
      title: "Check-in Agendado",
      description: "Maria Silva - Suíte 101 às 15:00",
      time: "30min",
    },
    {
      id: 3,
      type: "success",
      title: "Pagamento Confirmado",
      description: "Reserva #1234 - R$ 450,00",
      time: "1h atrás",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está o resumo das operações do seu hotel.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Reserva
          </Button>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayStats.checkins}</div>
            <p className="text-xs text-muted-foreground">Próximo às 15:00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-outs Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayStats.checkouts}</div>
            <p className="text-xs text-muted-foreground">2 pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hóspedes Atuais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.currentGuests}</div>
            <p className="text-xs text-muted-foreground">Em 8 acomodações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayStats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">2 urgentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats */}
      <DashboardOverview />

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Reservations - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentReservations />
        </div>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas & Notificações
            </CardTitle>
            <CardDescription>Atividades recentes que precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full ${
                      alert.type === "warning"
                        ? "bg-orange-500"
                        : alert.type === "info"
                          ? "bg-blue-500"
                          : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Occupancy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Visão Geral da Ocupação
          </CardTitle>
          <CardDescription>Status atual das acomodações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Ocupadas</span>
                <span className="font-medium">12/20</span>
              </div>
              <Progress value={60} className="h-2" />
              <p className="text-xs text-muted-foreground">60% de ocupação</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Limpeza</span>
                <span className="font-medium">3/20</span>
              </div>
              <Progress value={15} className="h-2" />
              <p className="text-xs text-muted-foreground">15% em limpeza</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Disponíveis</span>
                <span className="font-medium">5/20</span>
              </div>
              <Progress value={25} className="h-2" />
              <p className="text-xs text-muted-foreground">25% disponíveis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
