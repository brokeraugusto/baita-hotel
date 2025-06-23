"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Clock, LogIn, LogOut, Calendar, XCircle, Search } from "lucide-react"

interface Reservation {
  id: string
  guestName: string
  guestEmail: string
  guestPhone: string
  guestDocument: string
  roomNumber: string
  roomCategory: string
  checkInDate: string
  checkOutDate: string
  status: "pending" | "checked_in" | "checked_out" | "cancelled"
  totalAmount: number
  paymentStatus: "pending" | "paid" | "partial"
  notes?: string
  checkInTime?: string
  checkOutTime?: string
  companions?: number
}

const initialReservations: Reservation[] = [
  {
    id: "1",
    guestName: "Maria Silva",
    guestEmail: "maria@email.com",
    guestPhone: "(11) 99999-9999",
    guestDocument: "123.456.789-00",
    roomNumber: "101",
    roomCategory: "Suíte Luxo",
    checkInDate: "2024-01-15",
    checkOutDate: "2024-01-18",
    status: "pending",
    totalAmount: 1350,
    paymentStatus: "paid",
    companions: 1,
  },
  {
    id: "2",
    guestName: "João Santos",
    guestEmail: "joao@email.com",
    guestPhone: "(21) 88888-8888",
    guestDocument: "987.654.321-00",
    roomNumber: "201",
    roomCategory: "Quarto Vista Mar",
    checkInDate: "2024-01-16",
    checkOutDate: "2024-01-19",
    status: "checked_in",
    totalAmount: 960,
    paymentStatus: "paid",
    checkInTime: "14:30",
    companions: 0,
  },
  {
    id: "3",
    guestName: "Ana Costa",
    guestEmail: "ana@email.com",
    guestPhone: "(31) 77777-7777",
    guestDocument: "456.789.123-00",
    roomNumber: "303",
    roomCategory: "Chalé Standard",
    checkInDate: "2024-01-17",
    checkOutDate: "2024-01-20",
    status: "checked_out",
    totalAmount: 840,
    paymentStatus: "paid",
    checkInTime: "15:00",
    checkOutTime: "11:30",
    companions: 2,
  },
]

const statusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
  checked_in: { label: "Check-in", variant: "default" as const, icon: LogIn },
  checked_out: { label: "Check-out", variant: "outline" as const, icon: LogOut },
  cancelled: { label: "Cancelada", variant: "destructive" as const, icon: XCircle },
}

const paymentStatusConfig = {
  pending: { label: "Pendente", variant: "destructive" as const },
  paid: { label: "Pago", variant: "default" as const },
  partial: { label: "Parcial", variant: "secondary" as const },
}

export default function CheckInPage() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [checkInNotes, setCheckInNotes] = useState("")
  const [checkOutNotes, setCheckOutNotes] = useState("")
  const { toast } = useToast()

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.roomNumber.includes(searchTerm) ||
      reservation.guestDocument.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleCheckIn = () => {
    if (!selectedReservation) return

    const now = new Date()
    const currentTime = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

    const updatedReservations = reservations.map((reservation) =>
      reservation.id === selectedReservation.id
        ? {
            ...reservation,
            status: "checked_in" as const,
            checkInTime: currentTime,
            notes: checkInNotes,
          }
        : reservation,
    )

    setReservations(updatedReservations)
    setIsCheckInOpen(false)
    setSelectedReservation(null)
    setCheckInNotes("")

    toast({
      title: "Check-in realizado",
      description: `${selectedReservation.guestName} fez check-in no quarto ${selectedReservation.roomNumber}`,
    })
  }

  const handleCheckOut = () => {
    if (!selectedReservation) return

    const now = new Date()
    const currentTime = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

    const updatedReservations = reservations.map((reservation) =>
      reservation.id === selectedReservation.id
        ? {
            ...reservation,
            status: "checked_out" as const,
            checkOutTime: currentTime,
            notes: checkOutNotes,
          }
        : reservation,
    )

    setReservations(updatedReservations)
    setIsCheckOutOpen(false)
    setSelectedReservation(null)
    setCheckOutNotes("")

    toast({
      title: "Check-out realizado",
      description: `${selectedReservation.guestName} fez check-out do quarto ${selectedReservation.roomNumber}`,
    })
  }

  const openCheckIn = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsCheckInOpen(true)
  }

  const openCheckOut = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsCheckOutOpen(true)
  }

  const todayReservations = reservations.filter((r) => {
    const today = new Date().toISOString().split("T")[0]
    return r.checkInDate === today || r.checkOutDate === today
  })

  const pendingCheckIns = reservations.filter((r) => r.status === "pending").length
  const currentGuests = reservations.filter((r) => r.status === "checked_in").length
  const todayCheckOuts = reservations.filter((r) => {
    const today = new Date().toISOString().split("T")[0]
    return r.checkOutDate === today && r.status === "checked_in"
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check-in / Check-out</h1>
          <p className="text-muted-foreground">Gerencie a entrada e saída de hóspedes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCheckIns}</div>
            <p className="text-xs text-muted-foreground">Aguardando chegada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hóspedes Atuais</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentGuests}</div>
            <p className="text-xs text-muted-foreground">No hotel agora</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-outs Hoje</CardTitle>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCheckOuts}</div>
            <p className="text-xs text-muted-foreground">Saídas previstas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentação Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayReservations.length}</div>
            <p className="text-xs text-muted-foreground">Total de atividades</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por hóspede, quarto ou documento..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="checked_in">Check-in</SelectItem>
                <SelectItem value="checked_out">Check-out</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas</CardTitle>
          <CardDescription>Lista de todas as reservas com opções de check-in e check-out</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hóspede</TableHead>
                <TableHead>Quarto</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => {
                const StatusIcon = statusConfig[reservation.status].icon
                return (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{reservation.guestName}</div>
                        <div className="text-sm text-muted-foreground">{reservation.guestEmail}</div>
                        <div className="text-sm text-muted-foreground">{reservation.guestPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{reservation.roomNumber}</div>
                        <div className="text-sm text-muted-foreground">{reservation.roomCategory}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{new Date(reservation.checkInDate).toLocaleDateString("pt-BR")}</div>
                        {reservation.checkInTime && (
                          <div className="text-sm text-muted-foreground">{reservation.checkInTime}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{new Date(reservation.checkOutDate).toLocaleDateString("pt-BR")}</div>
                        {reservation.checkOutTime && (
                          <div className="text-sm text-muted-foreground">{reservation.checkOutTime}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[reservation.status].variant}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig[reservation.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusConfig[reservation.paymentStatus].variant}>
                        {paymentStatusConfig[reservation.paymentStatus].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">R$ {reservation.totalAmount.toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {reservation.status === "pending" && (
                          <Button size="sm" onClick={() => openCheckIn(reservation)}>
                            <LogIn className="mr-1 h-4 w-4" />
                            Check-in
                          </Button>
                        )}
                        {reservation.status === "checked_in" && (
                          <Button size="sm" variant="outline" onClick={() => openCheckOut(reservation)}>
                            <LogOut className="mr-1 h-4 w-4" />
                            Check-out
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Check-in Dialog */}
      <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Realizar Check-in</DialogTitle>
            <DialogDescription>Confirme os dados do hóspede e realize o check-in</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Hóspede</Label>
                  <div className="font-medium">{selectedReservation.guestName}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Documento</Label>
                  <div className="font-medium">{selectedReservation.guestDocument}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quarto</Label>
                  <div className="font-medium">
                    {selectedReservation.roomNumber} - {selectedReservation.roomCategory}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Acompanhantes</Label>
                  <div className="font-medium">{selectedReservation.companions || 0} pessoa(s)</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkin-notes">Observações (opcional)</Label>
                <Textarea
                  id="checkin-notes"
                  placeholder="Adicione observações sobre o check-in..."
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckInOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCheckIn}>
              <LogIn className="mr-2 h-4 w-4" />
              Confirmar Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Realizar Check-out</DialogTitle>
            <DialogDescription>Finalize a estadia do hóspede</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Hóspede</Label>
                  <div className="font-medium">{selectedReservation.guestName}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quarto</Label>
                  <div className="font-medium">
                    {selectedReservation.roomNumber} - {selectedReservation.roomCategory}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Check-in</Label>
                  <div className="font-medium">
                    {new Date(selectedReservation.checkInDate).toLocaleDateString("pt-BR")} às{" "}
                    {selectedReservation.checkInTime}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total da Estadia</Label>
                  <div className="font-medium">R$ {selectedReservation.totalAmount.toLocaleString("pt-BR")}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-notes">Observações (opcional)</Label>
                <Textarea
                  id="checkout-notes"
                  placeholder="Adicione observações sobre o check-out..."
                  value={checkOutNotes}
                  onChange={(e) => setCheckOutNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckOutOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCheckOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Confirmar Check-out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
