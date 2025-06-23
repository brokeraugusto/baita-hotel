"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CalendarDays, User, MapPin, CreditCard, FileText, Save, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import type { Reservation, Guest, Room } from "@/lib/services/reservation-service"

interface ReservationEditModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: Reservation
  guest: Guest | null
  room: Room | null
  onUpdate: (reservation: Reservation) => void
}

export function ReservationEditModal({
  isOpen,
  onClose,
  reservation,
  guest,
  room,
  onUpdate,
}: ReservationEditModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    checkInDate: reservation.check_in_date || "",
    checkOutDate: reservation.check_out_date || "",
    status: reservation.status || "confirmed",
    totalAmount: reservation.total_price || 0,
    paidAmount: 0,
    paymentMethod: "pix",
    notes: reservation.special_requests || "",
    guestCount: 2,
  })

  // Initialize form data when reservation changes
  useEffect(() => {
    if (reservation) {
      setFormData({
        checkInDate: reservation.check_in_date || "",
        checkOutDate: reservation.check_out_date || "",
        status: reservation.status || "confirmed",
        totalAmount: reservation.total_price || 0,
        paidAmount: 0,
        paymentMethod: "pix",
        notes: reservation.special_requests || "",
        guestCount: 2,
      })
    }
  }, [reservation])

  // Calculate number of nights
  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 1

    try {
      const checkIn = new Date(formData.checkInDate)
      const checkOut = new Date(formData.checkOutDate)
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return nights > 0 ? nights : 1
    } catch (error) {
      console.error("Error calculating nights:", error)
      return 1
    }
  }

  // Calculate total amount based on dates and room price
  const calculateTotalAmount = () => {
    if (!room || !room.price_per_night) return formData.totalAmount || 0

    try {
      const nights = calculateNights()
      const basePrice = (room.price_per_night || 0) * nights

      // Apply discount for PIX payment
      if (formData.paymentMethod === "pix") {
        return basePrice * 0.95 // 5% discount
      }

      return basePrice
    } catch (error) {
      console.error("Error calculating total amount:", error)
      return formData.totalAmount || 0
    }
  }

  // Update total amount when dates or payment method change
  useEffect(() => {
    const newTotal = calculateTotalAmount()
    setFormData((prev) => ({ ...prev, totalAmount: newTotal }))
  }, [formData.checkInDate, formData.checkOutDate, formData.paymentMethod, room])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    try {
      const updatedReservation: Reservation = {
        ...reservation,
        check_in_date: formData.checkInDate,
        check_out_date: formData.checkOutDate,
        status: formData.status,
        total_price: formData.totalAmount,
        special_requests: formData.notes,
      }

      onUpdate(updatedReservation)

      toast({
        title: "Reserva atualizada",
        description: "As alterações foram salvas com sucesso.",
      })
    } catch (error) {
      console.error("Error saving reservation:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: "bg-blue-100 text-blue-800",
      "checked-in": "bg-green-100 text-green-800",
      "checked-out": "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      confirmed: "Confirmada",
      "checked-in": "Check-in realizado",
      "checked-out": "Check-out realizado",
      cancelled: "Cancelada",
      pending: "Pendente",
    }
    return labels[status as keyof typeof labels] || status
  }

  // Safe number formatting
  const formatCurrency = (value: number | null | undefined): string => {
    const numValue = Number(value) || 0
    return numValue.toFixed(2)
  }

  const remainingBalance = (formData.totalAmount || 0) - (formData.paidAmount || 0)
  const nights = calculateNights()
  const roomPrice = room?.price_per_night || 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Detalhes da Reserva</DialogTitle>
              <p className="text-muted-foreground">
                Reserva #{reservation.id} - {room?.room_number || "Acomodação"}
              </p>
            </div>
            <Badge className={getStatusColor(formData.status)}>{getStatusLabel(formData.status)}</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="guest">Hóspede</TabsTrigger>
              <TabsTrigger value="payment">Pagamento</TabsTrigger>
              <TabsTrigger value="notes">Observações</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Datas da Reserva
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkInDate">Data de Check-in</Label>
                      <Input
                        id="checkInDate"
                        type="date"
                        value={formData.checkInDate}
                        onChange={(e) => handleChange("checkInDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOutDate">Data de Check-out</Label>
                      <Input
                        id="checkOutDate"
                        type="date"
                        value={formData.checkOutDate}
                        onChange={(e) => handleChange("checkOutDate", e.target.value)}
                      />
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium">
                        <CalendarDays className="inline h-4 w-4 mr-1" />
                        {nights} {nights === 1 ? "diária" : "diárias"}
                      </p>
                      {formData.checkInDate && formData.checkOutDate && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(formData.checkInDate), "dd 'de' MMMM", { locale: ptBR })} até{" "}
                          {format(new Date(formData.checkOutDate), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Acomodação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {room ? (
                      <>
                        <div>
                          <p className="font-medium">{room.room_number}</p>
                          <p className="text-sm text-muted-foreground">{room.room_type}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Capacidade</p>
                            <p className="font-medium">{room.capacity || 0} pessoas</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Preço/noite</p>
                            <p className="font-medium">R$ {formatCurrency(roomPrice)}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guestCount">Número de Hóspedes</Label>
                          <Input
                            id="guestCount"
                            type="number"
                            min="1"
                            max={room.capacity || 10}
                            value={formData.guestCount}
                            onChange={(e) => handleChange("guestCount", Number.parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Informações da acomodação não disponíveis</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Status da Reserva</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="checked-in">Check-in realizado</SelectItem>
                      <SelectItem value="checked-out">Check-out realizado</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guest" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações do Hóspede
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {guest ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Nome completo</p>
                          <p className="font-medium">{guest.full_name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">E-mail</p>
                          <p className="font-medium">{guest.email || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Telefone</p>
                          <p className="font-medium">{guest.phone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Documento</p>
                          <p className="font-medium">{guest.document_number || "N/A"}</p>
                        </div>
                      </div>
                      {guest.address && (
                        <div>
                          <p className="text-sm text-muted-foreground">Endereço</p>
                          <p className="font-medium">{guest.address}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Informações do hóspede não disponíveis</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Valores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(value) => handleChange("paymentMethod", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX (5% desconto)</SelectItem>
                          <SelectItem value="credit">Cartão de Crédito</SelectItem>
                          <SelectItem value="debit">Cartão de Débito</SelectItem>
                          <SelectItem value="cash">Dinheiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalAmount">Valor Total</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        value={formData.totalAmount || 0}
                        onChange={(e) => handleChange("totalAmount", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paidAmount">Valor Pago</Label>
                      <Input
                        id="paidAmount"
                        type="number"
                        step="0.01"
                        value={formData.paidAmount || 0}
                        onChange={(e) => handleChange("paidAmount", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Diárias ({nights}x)</span>
                        <span>R$ {formatCurrency(roomPrice * nights)}</span>
                      </div>
                      {formData.paymentMethod === "pix" && (
                        <div className="flex justify-between text-green-600">
                          <span>Desconto PIX (5%)</span>
                          <span>- R$ {formatCurrency(roomPrice * nights * 0.05)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>R$ {formatCurrency(formData.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pago</span>
                        <span>R$ {formatCurrency(formData.paidAmount)}</span>
                      </div>
                      <div
                        className={`flex justify-between font-medium ${remainingBalance > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        <span>{remainingBalance > 0 ? "Saldo devedor" : "Saldo credor"}</span>
                        <span>R$ {formatCurrency(Math.abs(remainingBalance))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Observações
                  </CardTitle>
                  <CardDescription>Adicione observações importantes sobre esta reserva</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Digite observações sobre a reserva, preferências do hóspede, solicitações especiais, etc."
                    rows={6}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="flex justify-end gap-2 px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
