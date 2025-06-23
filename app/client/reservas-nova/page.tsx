"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Search, Users, MapPin, Coffee, Plus } from "lucide-react"

interface SearchParams {
  checkIn: string
  checkOut: string
  guests: number
  breakfast: boolean
}

interface AvailableRoom {
  id: string
  name: string
  category: string
  capacity: number
  basePrice: number
  finalPrice: number
  amenities: string[]
  description: string
  available: boolean
  minStay?: number
  image: string
}

const mockRooms: AvailableRoom[] = [
  {
    id: "101",
    name: "Suíte 101",
    category: "Suíte Luxo",
    capacity: 4,
    basePrice: 450,
    finalPrice: 540,
    amenities: ["wifi", "tv", "parking", "coffee", "bath", "minibar"],
    description: "Suíte luxuosa com vista para o mar e comodidades exclusivas",
    available: true,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "201",
    name: "Quarto 201",
    category: "Vista Mar",
    capacity: 3,
    basePrice: 320,
    finalPrice: 350,
    amenities: ["wifi", "tv", "coffee"],
    description: "Quarto confortável com vista panorâmica para o oceano",
    available: true,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "301",
    name: "Chalé 01",
    category: "Chalé Standard",
    capacity: 6,
    basePrice: 280,
    finalPrice: 310,
    amenities: ["wifi", "tv", "parking"],
    description: "Chalé aconchegante em meio ao jardim, ideal para famílias",
    available: true,
    minStay: 2,
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function NewReservationPage() {
  const [step, setStep] = useState(1)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    checkIn: "",
    checkOut: "",
    guests: 1,
    breakfast: false,
  })
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null)
  const [guestData, setGuestData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    paymentMethod: "pix",
    observations: "",
  })
  const { toast } = useToast()

  const calculateDays = () => {
    if (!searchParams.checkIn || !searchParams.checkOut) return 0
    const start = new Date(searchParams.checkIn)
    const end = new Date(searchParams.checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const handleSearch = () => {
    if (!searchParams.checkIn || !searchParams.checkOut || searchParams.guests < 1) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos de busca.",
        variant: "destructive",
      })
      return
    }

    const days = calculateDays()
    if (days < 1) {
      toast({
        title: "Erro",
        description: "A data de saída deve ser posterior à data de entrada.",
        variant: "destructive",
      })
      return
    }

    // Simular busca e aplicação de regras de preço
    const filteredRooms = mockRooms.filter((room) => room.capacity >= searchParams.guests)

    // Verificar estadia mínima
    filteredRooms.forEach((room) => {
      if (room.minStay && days < room.minStay) {
        toast({
          title: "Atenção",
          description: `${room.name} requer estadia mínima de ${room.minStay} dias.`,
          variant: "destructive",
        })
      }
    })

    setAvailableRooms(filteredRooms)
    setStep(2)
  }

  const handleRoomSelect = (room: AvailableRoom) => {
    const days = calculateDays()
    if (room.minStay && days < room.minStay) {
      toast({
        title: "Erro",
        description: `Esta acomodação requer estadia mínima de ${room.minStay} dias.`,
        variant: "destructive",
      })
      return
    }
    setSelectedRoom(room)
    setStep(3)
  }

  const handleCreateReservation = () => {
    if (!selectedRoom || !guestData.name || !guestData.email || !guestData.document) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    // Simular criação da reserva
    toast({
      title: "Reserva criada!",
      description: "Reserva criada com sucesso. Redirecionando para o voucher...",
    })

    // Aqui redirecionaria para a página do voucher
    setTimeout(() => {
      setStep(4)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Reserva</h1>
          <p className="text-muted-foreground">Criar uma nova reserva passo a passo</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={step >= 1 ? "default" : "secondary"}>1. Buscar</Badge>
          <Badge variant={step >= 2 ? "default" : "secondary"}>2. Selecionar</Badge>
          <Badge variant={step >= 3 ? "default" : "secondary"}>3. Dados</Badge>
          <Badge variant={step >= 4 ? "default" : "secondary"}>4. Confirmação</Badge>
        </div>
      </div>

      {/* Step 1: Search */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Buscar Disponibilidade
            </CardTitle>
            <CardDescription>Informe as datas e número de hóspedes para buscar acomodações disponíveis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkin">Check-in</Label>
                <Input
                  id="checkin"
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout">Check-out</Label>
                <Input
                  id="checkout"
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                  min={searchParams.checkIn || new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guests">Hóspedes</Label>
                <Select
                  value={searchParams.guests.toString()}
                  onValueChange={(value) => setSearchParams({ ...searchParams, guests: Number.parseInt(value) })}
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
                <Label>Café da Manhã</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="breakfast"
                    checked={searchParams.breakfast}
                    onChange={(e) => setSearchParams({ ...searchParams, breakfast: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="breakfast" className="text-sm">
                    Incluir café da manhã
                  </Label>
                </div>
              </div>
            </div>

            {searchParams.checkIn && searchParams.checkOut && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  {calculateDays()} {calculateDays() === 1 ? "diária" : "diárias"} | {searchParams.guests}{" "}
                  {searchParams.guests === 1 ? "hóspede" : "hóspedes"}
                  {searchParams.breakfast && " | Com café da manhã"}
                </p>
              </div>
            )}

            <Button onClick={handleSearch} className="w-full" size="lg">
              <Search className="mr-2 h-4 w-4" />
              Buscar Acomodações
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Room */}
      {step === 2 && (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setStep(1)}>
            ← Voltar à busca
          </Button>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <div className="relative">
                  <img src={room.image || "/placeholder.svg"} alt={room.name} className="w-full h-48 object-cover" />
                  <Badge className="absolute top-2 right-2 bg-green-500">Disponível</Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">R$ {room.finalPrice}</div>
                      <div className="text-sm text-muted-foreground">por noite</div>
                    </div>
                  </div>
                  <CardDescription>{room.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{room.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>Até {room.capacity} pessoas</span>
                    </div>
                    {room.minStay && <Badge variant="outline">Mín. {room.minStay} diárias</Badge>}
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Preço base:</span>
                        <span>R$ {room.basePrice}/noite</span>
                      </div>
                      {searchParams.breakfast && (
                        <div className="flex justify-between">
                          <span>Café da manhã:</span>
                          <span>R$ {room.finalPrice - room.basePrice}/noite</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold">
                        <span>
                          Total ({calculateDays()} {calculateDays() === 1 ? "diária" : "diárias"}):
                        </span>
                        <span>R$ {(room.finalPrice * calculateDays()).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleRoomSelect(room)}
                    disabled={room.minStay ? calculateDays() < room.minStay : false}
                  >
                    Selecionar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Guest Data */}
      {step === 3 && selectedRoom && (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setStep(2)}>
            ← Voltar à seleção
          </Button>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Hóspede</CardTitle>
                <CardDescription>Preencha os dados do responsável pela reserva</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={guestData.name}
                      onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">Documento *</Label>
                    <Input
                      id="document"
                      value={guestData.document}
                      onChange={(e) => setGuestData({ ...guestData, document: e.target.value })}
                      placeholder="CPF ou RG"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guestData.email}
                      onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={guestData.phone}
                      onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment">Forma de Pagamento</Label>
                  <Select
                    value={guestData.paymentMethod}
                    onValueChange={(value) => setGuestData({ ...guestData, paymentMethod: value })}
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
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={guestData.observations}
                    onChange={(e) => setGuestData({ ...guestData, observations: e.target.value })}
                    placeholder="Pedidos especiais, alergias, etc..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo da Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{selectedRoom.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedRoom.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {new Date(searchParams.checkIn).toLocaleDateString()} -{" "}
                        {new Date(searchParams.checkOut).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculateDays()} {calculateDays() === 1 ? "diária" : "diárias"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {searchParams.guests} {searchParams.guests === 1 ? "hóspede" : "hóspedes"}
                      </div>
                    </div>
                  </div>

                  {searchParams.breakfast && (
                    <div className="flex items-center space-x-3">
                      <Coffee className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Café da manhã incluído</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {(selectedRoom.finalPrice * calculateDays()).toLocaleString()}</span>
                  </div>
                  {guestData.paymentMethod === "pix" && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto PIX (5%):</span>
                      <span>-R$ {(selectedRoom.finalPrice * calculateDays() * 0.05).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>
                      R${" "}
                      {guestData.paymentMethod === "pix"
                        ? (selectedRoom.finalPrice * calculateDays() * 0.95).toLocaleString()
                        : (selectedRoom.finalPrice * calculateDays()).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button onClick={handleCreateReservation} className="w-full" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Reserva
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Reserva Criada com Sucesso!</CardTitle>
            <CardDescription>Sua reserva foi criada e o voucher foi gerado</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-lg">Reserva #BR{Date.now().toString().slice(-6)}</div>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => window.print()}>Imprimir Voucher</Button>
              <Button variant="outline" onClick={() => setStep(1)}>
                Nova Reserva
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
