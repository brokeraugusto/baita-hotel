"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Users,
  Copy,
  ExternalLink,
  Wifi,
  Tv,
  Car,
  Coffee,
  Bath,
  Snowflake,
  Shield,
  ChefHat,
  Utensils,
} from "lucide-react"

interface SearchParams {
  checkIn: string
  checkOut: string
  guests: number
  breakfast: boolean
}

interface Room {
  id: string
  name: string
  category: string
  capacity: number
  basePrice: number
  description: string
  amenities: string[]
  images: string[]
  available: boolean
  minStay?: number
  photoAlbumUrl?: string
}

// Mock data for rooms
const mockRooms: Room[] = [
  {
    id: "101",
    name: "Suíte 101",
    category: "Suíte Luxo",
    capacity: 4,
    basePrice: 450,
    description:
      "Suíte luxuosa com vista para o mar e comodidades exclusivas. Possui cama king size, banheira de hidromassagem e varanda privativa com vista panorâmica. O ambiente é decorado com móveis de alta qualidade e oferece máximo conforto para uma estadia inesquecível.",
    amenities: ["wifi", "tv", "parking", "coffee", "bath", "minibar", "air-conditioning", "safe"],
    images: ["/placeholder.svg?height=300&width=400"],
    available: true,
    photoAlbumUrl: "https://photos.example.com/suite-101",
  },
  {
    id: "102",
    name: "Suíte 102",
    category: "Suíte Luxo",
    capacity: 4,
    basePrice: 450,
    description:
      "Suíte luxuosa com vista para o jardim e comodidades exclusivas. Possui cama king size, banheira de hidromassagem e varanda privativa com vista para os jardins tropicais. Ambiente sofisticado com decoração contemporânea.",
    amenities: ["wifi", "tv", "parking", "coffee", "bath", "minibar", "air-conditioning", "safe"],
    images: ["/placeholder.svg?height=300&width=400"],
    available: true,
    photoAlbumUrl: "https://photos.example.com/suite-102",
  },
  {
    id: "201",
    name: "Quarto 201",
    category: "Vista Mar",
    capacity: 3,
    basePrice: 320,
    description:
      "Quarto confortável com vista panorâmica para o oceano. Possui cama queen size e varanda com vista para o mar. Ideal para casais que buscam tranquilidade e uma vista espetacular do nascer do sol.",
    amenities: ["wifi", "tv", "coffee", "air-conditioning", "safe"],
    images: ["/placeholder.svg?height=300&width=400"],
    available: true,
    photoAlbumUrl: "https://photos.example.com/quarto-201",
  },
  {
    id: "202",
    name: "Quarto 202",
    category: "Vista Mar",
    capacity: 3,
    basePrice: 320,
    description:
      "Quarto confortável com vista panorâmica para o oceano. Possui cama queen size e varanda com vista para o mar. Decoração moderna e ambiente aconchegante para uma estadia relaxante.",
    amenities: ["wifi", "tv", "coffee", "air-conditioning", "safe"],
    images: ["/placeholder.svg?height=300&width=400"],
    available: true,
    photoAlbumUrl: "https://photos.example.com/quarto-202",
  },
  {
    id: "301",
    name: "Chalé 01",
    category: "Chalé Standard",
    capacity: 6,
    basePrice: 280,
    description:
      "Chalé aconchegante em meio ao jardim, ideal para famílias. Possui dois quartos, sala de estar e cozinha compacta. Ambiente rústico e charmoso, perfeito para quem busca contato com a natureza e privacidade.",
    amenities: ["wifi", "tv", "parking", "kitchen", "air-conditioning"],
    images: ["/placeholder.svg?height=300&width=400"],
    available: true,
    minStay: 2,
    photoAlbumUrl: "https://photos.example.com/chale-01",
  },
  {
    id: "302",
    name: "Chalé 02",
    category: "Chalé Standard",
    capacity: 6,
    basePrice: 280,
    description:
      "Chalé aconchegante em meio ao jardim, ideal para famílias. Possui dois quartos, sala de estar e cozinha compacta. Decoração rústica com toques modernos, oferecendo conforto e funcionalidade.",
    amenities: ["wifi", "tv", "parking", "kitchen", "air-conditioning"],
    images: ["/placeholder.svg?height=300&width=400"],
    available: true,
    minStay: 2,
    photoAlbumUrl: "https://photos.example.com/chale-02",
  },
  {
    id: "303",
    name: "Chalé 03",
    category: "Chalé Premium",
    capacity: 8,
    basePrice: 380,
    description:
      "Chalé premium com vista para o lago, ideal para grupos grandes. Possui três quartos, sala de estar ampla e cozinha completa. Ambiente luxuoso com área de churrasqueira e deck privativo com vista para o lago.",
    amenities: ["wifi", "tv", "parking", "kitchen", "air-conditioning", "bath", "barbecue"],
    images: ["/placeholder.svg?height=300&width=400"],
    available: true,
    minStay: 2,
    photoAlbumUrl: "https://photos.example.com/chale-03",
  },
]

// Amenity icons mapping
const amenityIcons: Record<string, { label: string; icon: React.ReactNode }> = {
  wifi: { label: "Wi-Fi", icon: <Wifi className="h-4 w-4" /> },
  tv: { label: "TV", icon: <Tv className="h-4 w-4" /> },
  parking: { label: "Estacionamento", icon: <Car className="h-4 w-4" /> },
  coffee: { label: "Café da manhã", icon: <Coffee className="h-4 w-4" /> },
  bath: { label: "Banheira", icon: <Bath className="h-4 w-4" /> },
  minibar: { label: "Frigobar", icon: <Utensils className="h-4 w-4" /> },
  "air-conditioning": { label: "Ar-condicionado", icon: <Snowflake className="h-4 w-4" /> },
  safe: { label: "Cofre", icon: <Shield className="h-4 w-4" /> },
  kitchen: { label: "Cozinha", icon: <ChefHat className="h-4 w-4" /> },
  barbecue: { label: "Churrasqueira", icon: <Utensils className="h-4 w-4" /> },
}

export function QuickSearch() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    checkIn: "",
    checkOut: "",
    guests: 2,
    breakfast: false,
  })
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const { toast } = useToast()

  const handleSearch = () => {
    if (!searchParams.checkIn || !searchParams.checkOut) {
      toast({
        title: "Erro",
        description: "Por favor, selecione as datas de check-in e check-out.",
        variant: "destructive",
      })
      return
    }

    // Filter rooms based on search criteria
    const filtered = mockRooms.filter((room) => {
      // Check capacity
      if (room.capacity < searchParams.guests) return false

      // Check minimum stay
      if (room.minStay) {
        const checkIn = new Date(searchParams.checkIn)
        const checkOut = new Date(searchParams.checkOut)
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        if (days < room.minStay) return false
      }

      return room.available
    })

    setAvailableRooms(filtered)
    setHasSearched(true)
  }

  const calculateDays = () => {
    if (!searchParams.checkIn || !searchParams.checkOut) return 0
    const checkIn = new Date(searchParams.checkIn)
    const checkOut = new Date(searchParams.checkOut)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateTotalPrice = (basePrice: number) => {
    const days = calculateDays()
    let total = basePrice * days

    // Add breakfast if selected
    if (searchParams.breakfast) {
      total += 40 * searchParams.guests * days // R$40 per person per day
    }

    return total
  }

  const calculatePIXPrice = (basePrice: number) => {
    // 5% discount for PIX payments
    return calculateTotalPrice(basePrice) * 0.95
  }

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room)
    setIsDetailOpen(true)
  }

  const copyToClipboard = () => {
    if (!selectedRoom) return

    const days = calculateDays()
    const totalPrice = calculateTotalPrice(selectedRoom.basePrice)
    const pixPrice = calculatePIXPrice(selectedRoom.basePrice)

    const amenitiesList = selectedRoom.amenities.map((amenity) => amenityIcons[amenity]?.label || amenity).join(", ")

    const text =
      `*${selectedRoom.category} - ${selectedRoom.name}*\n\n` +
      `📅 Check-in: ${new Date(searchParams.checkIn).toLocaleDateString("pt-BR")}\n` +
      `📅 Check-out: ${new Date(searchParams.checkOut).toLocaleDateString("pt-BR")}\n` +
      `🗓️ ${days} ${days === 1 ? "diária" : "diárias"}\n` +
      `👥 ${searchParams.guests} ${searchParams.guests === 1 ? "hóspede" : "hóspedes"}\n` +
      `${searchParams.breakfast ? "☕ Café da manhã incluído\n" : ""}\n` +
      `*Descrição:*\n${selectedRoom.description}\n\n` +
      `*Comodidades:*\n${amenitiesList}\n\n` +
      `*Valores:*\n` +
      `💳 Cartão: R$ ${totalPrice.toFixed(2)}\n` +
      `💰 PIX (5% desconto): R$ ${pixPrice.toFixed(2)}\n\n` +
      `${selectedRoom.photoAlbumUrl ? `🔗 Fotos: ${selectedRoom.photoAlbumUrl}\n\n` : ""}` +
      `Para mais informações, entre em contato conosco!`

    navigator.clipboard.writeText(text)

    toast({
      title: "Copiado!",
      description: "Informações copiadas para a área de transferência.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Busca Rápida de Acomodações
          </CardTitle>
          <CardDescription>Encontre acomodações disponíveis para suas datas</CardDescription>
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
                <SelectTrigger id="guests">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
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

      {/* Results */}
      {hasSearched && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Resultados da Busca</h2>

          {availableRooms.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-lg text-muted-foreground">
                  Nenhuma acomodação disponível para os critérios selecionados.
                </p>
                <p className="mt-2">Tente alterar as datas ou o número de hóspedes.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={room.images[0] || "/placeholder.svg"}
                      alt={room.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{room.name}</CardTitle>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">R$ {room.basePrice}</div>
                        <div className="text-sm text-muted-foreground">por noite</div>
                      </div>
                    </div>
                    <CardDescription>{room.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Até {room.capacity} pessoas</span>
                      </div>
                      {room.minStay && (
                        <span className="text-xs text-muted-foreground">Mín. {room.minStay} diárias</span>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Cartão ({calculateDays()} diárias):</span>
                          <span className="font-medium">R$ {calculateTotalPrice(room.basePrice).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>PIX (5% desconto):</span>
                          <span className="font-medium">R$ {calculatePIXPrice(room.basePrice).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => handleViewDetails(room)} className="w-full">
                      Ver Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Room Detail Modal with Scroll */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">{selectedRoom?.name}</DialogTitle>
            <DialogDescription className="text-base">{selectedRoom?.category}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-140px)] px-6">
            {selectedRoom && (
              <div className="space-y-6 pb-6">
                {/* Image */}
                <div className="relative">
                  <img
                    src={selectedRoom.images[0] || "/placeholder.svg"}
                    alt={selectedRoom.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-3 text-lg">Descrição</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedRoom.description}</p>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="font-semibold mb-3 text-lg">Comodidades</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedRoom.amenities.map((amenity) => {
                      const amenityInfo = amenityIcons[amenity]
                      return (
                        <div key={amenity} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          {amenityInfo?.icon}
                          <span className="text-sm font-medium">{amenityInfo?.label || amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Room Info */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Informações do Quarto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Capacidade:</span>
                        <span className="font-medium">Até {selectedRoom.capacity} pessoas</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Diária base:</span>
                        <span className="font-medium">R$ {selectedRoom.basePrice.toFixed(2)}</span>
                      </div>
                      {selectedRoom.minStay && (
                        <div className="flex justify-between text-sm">
                          <span>Estadia mínima:</span>
                          <span className="font-medium">{selectedRoom.minStay} diárias</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Detalhes da Reserva</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Check-in:</span>
                        <span className="font-medium">
                          {new Date(searchParams.checkIn).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Check-out:</span>
                        <span className="font-medium">
                          {new Date(searchParams.checkOut).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Diárias:</span>
                        <span className="font-medium">{calculateDays()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Hóspedes:</span>
                        <span className="font-medium">{searchParams.guests}</span>
                      </div>
                      {searchParams.breakfast && (
                        <div className="flex justify-between text-sm">
                          <span>Café da manhã:</span>
                          <span className="font-medium text-green-600">Incluído</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Pricing Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Resumo Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Acomodação ({calculateDays()} diárias):</span>
                        <span>R$ {(selectedRoom.basePrice * calculateDays()).toFixed(2)}</span>
                      </div>
                      {searchParams.breakfast && (
                        <div className="flex justify-between text-sm">
                          <span>
                            Café da manhã ({searchParams.guests} pessoas x {calculateDays()} dias):
                          </span>
                          <span>R$ {(40 * searchParams.guests * calculateDays()).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total (Cartão):</span>
                        <span className="text-lg">R$ {calculateTotalPrice(selectedRoom.basePrice).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-green-600">
                        <span>Total (PIX - 5% desconto):</span>
                        <span className="text-lg">R$ {calculatePIXPrice(selectedRoom.basePrice).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Photo Album Link */}
                {selectedRoom.photoAlbumUrl && (
                  <Card>
                    <CardContent className="pt-6">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={selectedRoom.photoAlbumUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver Álbum Completo de Fotos
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-6 pt-0 flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="w-full sm:w-auto">
              Fechar
            </Button>
            <Button onClick={copyToClipboard} className="w-full sm:w-auto">
              <Copy className="mr-2 h-4 w-4" />
              Copiar para WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
