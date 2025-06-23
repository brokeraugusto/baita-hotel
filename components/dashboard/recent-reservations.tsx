import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const reservations = [
  {
    id: "1",
    guest: "Maria Silva",
    room: "Suíte 101",
    checkIn: "2024-01-15",
    checkOut: "2024-01-18",
    status: "confirmed",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "2",
    guest: "João Santos",
    room: "Quarto 205",
    checkIn: "2024-01-16",
    checkOut: "2024-01-19",
    status: "pending",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "3",
    guest: "Ana Costa",
    room: "Chalé 03",
    checkIn: "2024-01-17",
    checkOut: "2024-01-20",
    status: "confirmed",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "4",
    guest: "Pedro Lima",
    room: "Suíte 102",
    checkIn: "2024-01-18",
    checkOut: "2024-01-21",
    status: "checkedin",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const statusConfig = {
  confirmed: { label: "Confirmada", variant: "default" as const },
  pending: { label: "Pendente", variant: "secondary" as const },
  checkedin: { label: "Check-in", variant: "destructive" as const },
  checkedout: { label: "Check-out", variant: "outline" as const },
}

export function RecentReservations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservas Recentes</CardTitle>
        <CardDescription>Últimas reservas do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="flex items-center space-x-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={reservation.avatar || "/placeholder.svg"} alt={reservation.guest} />
                <AvatarFallback>
                  {reservation.guest
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{reservation.guest}</p>
                <p className="text-sm text-muted-foreground">
                  {reservation.room} • {reservation.checkIn} - {reservation.checkOut}
                </p>
              </div>
              <Badge variant={statusConfig[reservation.status as keyof typeof statusConfig].variant}>
                {statusConfig[reservation.status as keyof typeof statusConfig].label}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
