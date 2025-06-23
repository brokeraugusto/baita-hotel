import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit, MoreHorizontal, Star, Phone, Mail } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const guests = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "(11) 99999-9999",
    document: "123.456.789-00",
    status: "active",
    room: "Suíte 101",
    checkIn: "2024-01-14",
    checkOut: "2024-01-18",
    totalStays: 3,
    totalSpent: 2450,
    rating: 5,
    vip: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao.santos@email.com",
    phone: "(11) 88888-8888",
    document: "987.654.321-00",
    status: "checkout",
    room: null,
    checkIn: "2024-01-10",
    checkOut: "2024-01-13",
    totalStays: 1,
    totalSpent: 890,
    rating: 4,
    vip: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "(11) 77777-7777",
    document: "456.789.123-00",
    status: "active",
    room: "Chalé 03",
    checkIn: "2024-01-15",
    checkOut: "2024-01-20",
    totalStays: 5,
    totalSpent: 4200,
    rating: 5,
    vip: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Pedro Lima",
    email: "pedro.lima@email.com",
    phone: "(11) 66666-6666",
    document: "789.123.456-00",
    status: "checkout",
    room: null,
    checkIn: "2024-01-08",
    checkOut: "2024-01-12",
    totalStays: 2,
    totalSpent: 1560,
    rating: 4,
    vip: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const statusConfig = {
  active: { label: "No Hotel", variant: "default" as const },
  checkout: { label: "Check-out", variant: "secondary" as const },
  vip: { label: "VIP", variant: "destructive" as const },
  blacklist: { label: "Blacklist", variant: "outline" as const },
}

export function GuestsList() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hóspede</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quarto Atual</TableHead>
              <TableHead>Estadias</TableHead>
              <TableHead>Gasto Total</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={guest.avatar || "/placeholder.svg"} alt={guest.name} />
                      <AvatarFallback>
                        {guest.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center space-x-2">
                        <span>{guest.name}</span>
                        {guest.vip && (
                          <Badge variant="destructive" className="text-xs">
                            VIP
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{guest.document}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-sm">
                      <Mail className="h-3 w-3" />
                      <span>{guest.email}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <Phone className="h-3 w-3" />
                      <span>{guest.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[guest.status as keyof typeof statusConfig].variant}>
                    {statusConfig[guest.status as keyof typeof statusConfig].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {guest.room ? (
                    <div>
                      <div className="font-medium">{guest.room}</div>
                      <div className="text-sm text-muted-foreground">
                        {guest.checkIn} - {guest.checkOut}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-medium">{guest.totalStays}</div>
                    <div className="text-sm text-muted-foreground">estadias</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">R$ {guest.totalSpent.toLocaleString()}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{guest.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Histórico
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Dados
                      </DropdownMenuItem>
                      <DropdownMenuItem>Marcar como VIP</DropdownMenuItem>
                      <DropdownMenuItem>Enviar Mensagem</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
