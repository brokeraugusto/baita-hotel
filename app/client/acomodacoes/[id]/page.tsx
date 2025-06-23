"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bath, Car, Coffee, Edit, Tv, Users, Wifi } from "lucide-react"
import Image from "next/image"

// Mock data for a single accommodation
const accommodationData = {
  id: "101",
  name: "Suíte 101",
  category: "Suíte Luxo",
  status: "available",
  capacity: 2,
  maxCapacity: 4,
  price: 450,
  amenities: ["wifi", "tv", "parking", "coffee", "bath"],
  description:
    "Suíte luxuosa com vista para o mar, banheira de hidromassagem e varanda privativa. Oferece uma experiência de hospedagem premium com decoração elegante e conforto excepcional. Ideal para casais em lua de mel ou viajantes que buscam uma estadia especial.",
  image: "/placeholder.svg?height=400&width=600",
  features: [
    "Cama king size",
    "Banheira de hidromassagem",
    "Varanda privativa",
    "Vista para o mar",
    "Ar-condicionado",
    "Frigobar",
    "TV 50 polegadas",
    "Wi-Fi de alta velocidade",
    "Cofre digital",
    "Secador de cabelo",
  ],
}

const statusConfig = {
  available: { label: "Disponível", variant: "default" as const },
  occupied: { label: "Ocupado", variant: "destructive" as const },
  maintenance: { label: "Manutenção", variant: "secondary" as const },
  cleaning: { label: "Limpeza", variant: "outline" as const },
}

const amenityIcons = {
  wifi: Wifi,
  tv: Tv,
  parking: Car,
  coffee: Coffee,
  bath: Bath,
}

export default function AccommodationDetailPage() {
  const params = useParams()
  const id = params.id as string

  // In a real app, you would fetch the accommodation data based on the ID
  const accommodation = accommodationData

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{accommodation.name}</h1>
            <p className="text-muted-foreground">{accommodation.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={statusConfig[accommodation.status as keyof typeof statusConfig].variant}>
            {statusConfig[accommodation.status as keyof typeof statusConfig].label}
          </Badge>
          <Button onClick={() => (window.location.href = `/client/acomodacoes/editar/${id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <div className="relative aspect-video">
            <Image
              src={accommodation.image || "/placeholder.svg"}
              alt={accommodation.name}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Descrição</h2>
            <p className="text-muted-foreground mb-6">{accommodation.description}</p>

            <h2 className="text-xl font-semibold mb-2">Comodidades</h2>
            <div className="grid grid-cols-2 gap-2">
              {accommodation.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Capacidade</span>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>
                    {accommodation.capacity}-{accommodation.maxCapacity} pessoas
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Diária</span>
                <span className="font-bold">R$ {accommodation.price},00</span>
              </div>

              <div className="pt-2 border-t">
                <h3 className="font-medium mb-2">Amenidades</h3>
                <div className="flex flex-wrap gap-2">
                  {accommodation.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity as keyof typeof amenityIcons]
                    return Icon ? (
                      <div key={amenity} className="p-2 bg-muted rounded flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        <span className="capitalize">{amenity}</span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disponibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Consulte o mapa de reservas para verificar a disponibilidade desta acomodação.
              </p>
              <Button className="w-full mt-4" onClick={() => (window.location.href = "/client/mapa-reservas")}>
                Ver Mapa de Reservas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
