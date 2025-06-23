"use client"

import { useState, useEffect } from "react"
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
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react"

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
  guests: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "partial" | "cancelled"
  status: "confirmed" | "pending" | "checked_in" | "checked_out" | "cancelled"
  createdAt: string
  breakfast: boolean
  observations?: string
}

const mockReservations: Reservation[] = [
  {
    id: "BR240115001",
    guestName: "Maria Silva",
    guestEmail: "maria@email.com",
    guestPhone: "(11) 99999-9999",
    guestDocument: "123.456.789-00",
    roomNumber: "101",
    roomCategory: "Suíte Luxo",
    checkInDate: "2024-01-20",
    checkOutDate: "2024-01-23",
    guests: 2,
    totalAmount: 1620,
    paymentMethod: "PIX",
    paymentStatus: "paid",
    status: "confirmed",
    createdAt: "2024-01-15T10:30:00",
    breakfast: true,
    observations: "Lua de mel",
  },
  {
    id: "BR240115002",
    guestName: "João Santos",
    guestEmail: "joao@email.com",
    guestPhone: "(21) 88888-8888",
    guestDocument: "987.654.321-00",
    roomNumber: "201",
    roomCategory: "Vista Mar",
    checkInDate: "2024-01-22",
    checkOutDate: "2024-01-25",
    guests: 3,
    totalAmount: 1050,
    paymentMethod: "Cartão",
    paymentStatus: "pending",
    status: "pending",
    createdAt: "2024-01-16T14:20:00",
    breakfast: false,
  },
  {
    id: "BR240115003",
    guestName: "Ana Costa",
    guestEmail: "ana@email.com",
    guestPhone: "(31) 77777-7777",
    guestDocument: "456.789.123-00",
    roomNumber: "301",
    roomCategory: "Chalé Standard",
    checkInDate: "2024-01-18",
    checkOutDate: "2024-01-21",
    guests: 4,
    totalAmount: 840,
    paymentMethod: "PIX",
    paymentStatus: "paid",
    status: "checked_in",
    createdAt: "2024-01-12T09:15:00",
    breakfast: true,
  },
]

const statusConfig = {
  confirmed: { label: "Confirmada", variant: "default" as const, icon: CheckCircle },
  pending: { label: "Pendente", variant: "secondary" as const, icon: Clock },
  checked_in: { label: "Check-in", variant: "default" as const, icon: CheckCircle },
  checked_out: { label: "Check-out", variant: "outline" as const, icon: CheckCircle },
  cancelled: { label: "Cancelada", variant: "destructive" as const, icon: XCircle },
}

const paymentStatusConfig = {
  paid: { label: "Pago", variant: "default" as const },
  pending: { label: "Pendente", variant: "destructive" as const },
  partial: { label: "Parcial", variant: "secondary" as const },
  cancelled: { label: "Cancelado", variant: "outline" as const },
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState<Partial<Reservation>>({})
  const { toast } = useToast()

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        const container = e.currentTarget as HTMLElement
        container.scrollLeft += e.deltaY
      }
    }

    const reservationsContainer = document.getElementById("reservations-container")
    if (reservationsContainer) {
      reservationsContainer.addEventListener("wheel", handleWheel, { passive: false })
      return () => reservationsContainer.removeEventListener("wheel", handleWheel)
    }
  }, [])

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.roomNumber.includes(searchTerm) ||
      reservation.id.includes(searchTerm) ||
      reservation.guestDocument.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter
    const matchesPayment = paymentFilter === "all" || reservation.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const handleView = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsViewOpen(true)
  }

  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setEditData(reservation)
    setIsEditOpen(true)
  }

  const handleUpdateReservation = () => {
    if (!selectedReservation) return

    const updatedReservations = reservations.map((reservation) =>
      reservation.id === selectedReservation.id ? { ...reservation, ...editData } : reservation,
    )

    setReservations(updatedReservations)
    setIsEditOpen(false)
    setSelectedReservation(null)
    setEditData({})

    toast({
      title: "Reserva atualizada",
      description: "As informações da reserva foram atualizadas com sucesso.",
    })
  }

  const handleCancelReservation = (id: string) => {
    const updatedReservations = reservations.map((reservation) =>
      reservation.id === id
        ? { ...reservation, status: "cancelled" as const, paymentStatus: "cancelled" as const }
        : reservation,
    )

    setReservations(updatedReservations)
    toast({
      title: "Reserva cancelada",
      description: "A reserva foi cancelada com sucesso.",
    })
  }

  const handleDeleteReservation = (id: string) => {
    setReservations(reservations.filter((reservation) => reservation.id !== id))
    toast({
      title: "Reserva excluída",
      description: "A reserva foi removida permanentemente.",
    })
  }

  const calculateDays = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const totalReservations = reservations.length
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed").length
  const pendingPayments = reservations.filter((r) => r.paymentStatus === "pending").length
  const totalRevenue = reservations.filter((r) => r.paymentStatus === "paid").reduce((sum, r) => sum + r.totalAmount, 0)

  return (
    <div id="reservations-container" className="overflow-x-auto min-w-full">
      <div className="min-w-[1200px]">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
              <p className="text-muted-foreground">Gerencie todas as reservas do hotel</p>
            </div>
            <Button onClick={() => (window.location.href = "/client/reservas-nova")}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Reserva
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReservations}</div>
                <p className="text-xs text-muted-foreground">+2 este mês</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{confirmedReservations}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((confirmedReservations / totalReservations) * 100)}% do total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPayments}</div>
                <p className="text-xs text-muted-foreground">Requer atenção</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Confirmada</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Pagamentos recebidos</p>
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
                    placeholder="Buscar por hóspede, quarto, documento ou ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="checked_in">Check-in</SelectItem>
                    <SelectItem value="checked_out">Check-out</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="partial">Parcial</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Mais Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reservations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Reservas</CardTitle>
              <CardDescription>Visualize e gerencie todas as reservas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID / Hóspede</TableHead>
                    <TableHead>Acomodação</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Hóspedes</TableHead>
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
                            <div className="font-medium text-blue-600">#{reservation.id}</div>
                            <div className="font-medium">{reservation.guestName}</div>
                            <div className="text-sm text-muted-foreground">{reservation.guestEmail}</div>
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
                            <div className="text-sm">
                              {new Date(reservation.checkInDate).toLocaleDateString("pt-BR")} -{" "}
                              {new Date(reservation.checkOutDate).toLocaleDateString("pt-BR")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {calculateDays(reservation.checkInDate, reservation.checkOutDate)}{" "}
                              {calculateDays(reservation.checkInDate, reservation.checkOutDate) === 1
                                ? "diária"
                                : "diárias"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                            {reservation.guests}
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
                        <TableCell className="font-medium">
                          R$ {reservation.totalAmount.toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleView(reservation)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(reservation)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {reservation.status !== "cancelled" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelReservation(reservation.id)}
                              >
                                <XCircle className="h-4 w-4" />
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

          {/* View Reservation Dialog */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Detalhes da Reserva</DialogTitle>
                <DialogDescription>#{selectedReservation?.id}</DialogDescription>
              </DialogHeader>
              {selectedReservation && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Hóspede</Label>
                      <div className="font-medium">{selectedReservation.guestName}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Documento</Label>
                      <div>{selectedReservation.guestDocument}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">E-mail</Label>
                      <div>{selectedReservation.guestEmail}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Telefone</Label>
                      <div>{selectedReservation.guestPhone}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Acomodação</Label>
                      <div className="font-medium">
                        {selectedReservation.roomNumber} - {selectedReservation.roomCategory}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Hóspedes</Label>
                      <div>{selectedReservation.guests} pessoas</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Check-in</Label>
                      <div>{new Date(selectedReservation.checkInDate).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Check-out</Label>
                      <div>{new Date(selectedReservation.checkOutDate).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Café da Manhã</Label>
                      <div>{selectedReservation.breakfast ? "Incluído" : "Não incluído"}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Forma de Pagamento</Label>
                      <div>{selectedReservation.paymentMethod}</div>
                    </div>
                  </div>

                  {selectedReservation.observations && (
                    <div>
                      <Label className="text-muted-foreground">Observações</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded">{selectedReservation.observations}</div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>R$ {selectedReservation.totalAmount.toLocaleString("pt-BR")}</span>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => window.open(`/client/voucher/${selectedReservation?.id}`, "_blank")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Voucher
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Reservation Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Editar Reserva</DialogTitle>
                <DialogDescription>Modifique as informações da reserva</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-guest-name">Nome do Hóspede</Label>
                    <Input
                      id="edit-guest-name"
                      value={editData.guestName || ""}
                      onChange={(e) => setEditData({ ...editData, guestName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-guest-phone">Telefone</Label>
                    <Input
                      id="edit-guest-phone"
                      value={editData.guestPhone || ""}
                      onChange={(e) => setEditData({ ...editData, guestPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-checkin">Check-in</Label>
                    <Input
                      id="edit-checkin"
                      type="date"
                      value={editData.checkInDate || ""}
                      onChange={(e) => setEditData({ ...editData, checkInDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-checkout">Check-out</Label>
                    <Input
                      id="edit-checkout"
                      type="date"
                      value={editData.checkOutDate || ""}
                      onChange={(e) => setEditData({ ...editData, checkOutDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-guests">Número de Hóspedes</Label>
                    <Select
                      value={editData.guests?.toString() || ""}
                      onValueChange={(value) => setEditData({ ...editData, guests: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "pessoa" : "pessoas"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-payment-status">Status do Pagamento</Label>
                    <Select
                      value={editData.paymentStatus || ""}
                      onValueChange={(value: any) => setEditData({ ...editData, paymentStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="partial">Parcial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-observations">Observações</Label>
                  <Textarea
                    id="edit-observations"
                    value={editData.observations || ""}
                    onChange={(e) => setEditData({ ...editData, observations: e.target.value })}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateReservation}>Salvar Alterações</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
