"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Eye, Wifi, Tv, Car, Coffee, Bath, Users, MoreVertical, ArrowUpDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { useMemo } from "react"

// Dados mock atualizados para incluir as novas acomodações
const accommodations = [
  {
    id: "101",
    number: "101",
    name: "Suíte 101",
    category: "Suíte Luxo",
    status: "available",
    capacity: 2,
    maxCapacity: 4,
    price: 450,
    amenities: ["wifi", "tv", "parking", "coffee", "bath"],
    description: "Suíte luxuosa com vista para o mar, banheira de hidromassagem e varanda privativa.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "102",
    number: "102",
    name: "Suíte 102",
    category: "Suíte Luxo",
    status: "occupied",
    capacity: 2,
    maxCapacity: 4,
    price: 450,
    amenities: ["wifi", "tv", "parking", "coffee", "bath"],
    description: "Suíte luxuosa com vista para o jardim e sala de estar separada.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "201",
    number: "201",
    name: "Quarto 201",
    category: "Vista Mar",
    status: "maintenance",
    capacity: 2,
    maxCapacity: 3,
    price: 320,
    amenities: ["wifi", "tv", "coffee"],
    description: "Quarto confortável com vista panorâmica para o mar.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "301",
    number: "301",
    name: "Chalé 01",
    category: "Chalé Standard",
    status: "available",
    capacity: 4,
    maxCapacity: 6,
    price: 280,
    amenities: ["wifi", "tv", "parking"],
    description: "Chalé aconchegante em meio ao jardim, ideal para famílias.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "202",
    number: "202",
    name: "Quarto 202",
    category: "Vista Mar",
    status: "cleaning",
    capacity: 2,
    maxCapacity: 3,
    price: 320,
    amenities: ["wifi", "tv", "coffee", "bath"],
    description: "Quarto confortável com vista panorâmica para o mar e banheira.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "302",
    number: "302",
    name: "Chalé 02",
    category: "Chalé Premium",
    status: "available",
    capacity: 4,
    maxCapacity: 6,
    price: 350,
    amenities: ["wifi", "tv", "parking", "coffee", "bath"],
    description: "Chalé premium com jacuzzi privativa e vista para o jardim.",
    image: "/placeholder.svg?height=200&width=300",
  },
  // Simulando uma acomodação criada sem comodidades
  {
    id: "103",
    number: "103",
    name: "Quarto Simples 103",
    category: "Standard",
    status: "available",
    capacity: 1,
    maxCapacity: 2,
    price: 180,
    amenities: [], // Sem comodidades
    description: "Quarto simples e confortável para estadias econômicas.",
    image: "/placeholder.svg?height=200&width=300",
  },
]

const statusConfig = {
  available: { label: "Disponível", variant: "default" as const, color: "bg-green-100 text-green-800" },
  occupied: { label: "Ocupado", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
  maintenance: { label: "Manutenção", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
  cleaning: { label: "Limpeza", variant: "outline" as const, color: "bg-blue-100 text-blue-800" },
}

const amenityIcons = {
  wifi: Wifi,
  tv: Tv,
  parking: Car,
  coffee: Coffee,
  bath: Bath,
}

type SortOption = "number" | "category" | "price" | "status" | "capacity"

interface AccommodationListProps {
  selectedRooms: string[]
  onSelectionChange: (selected: string[]) => void
  viewMode: "grid" | "list"
  showPrices: boolean
  showStatus: boolean
  showAmenities: boolean
  compactMode: boolean
  sortBy: SortOption
  sortDirection: "asc" | "desc"
}

export function AccommodationList({
  selectedRooms,
  onSelectionChange,
  viewMode,
  showPrices,
  showStatus,
  showAmenities,
  compactMode,
  sortBy,
  sortDirection,
}: AccommodationListProps) {
  const handleSelectRoom = (roomId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedRooms, roomId])
    } else {
      onSelectionChange(selectedRooms.filter((id) => id !== roomId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(accommodations.map((acc) => acc.id))
    } else {
      onSelectionChange([])
    }
  }

  // Ordenar acomodações com base nas configurações
  const sortedAccommodations = useMemo(() => {
    return [...accommodations].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "number":
          comparison = a.number.localeCompare(b.number, undefined, { numeric: true })
          break
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
        case "price":
          comparison = a.price - b.price
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
        case "capacity":
          comparison = a.capacity - b.capacity
          break
        default:
          comparison = a.number.localeCompare(b.number, undefined, { numeric: true })
      }

      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [sortBy, sortDirection])

  // Visualização em Lista (Tabela)
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {/* Select All */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedRooms.length === accommodations.length}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Selecionar todas as acomodações ({accommodations.length})
            </label>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <ArrowUpDown className="h-4 w-4 mr-1" />
            <span>Ordenado por: </span>
            <span className="font-medium ml-1">
              {sortBy === "number" && "Número"}
              {sortBy === "category" && "Categoria"}
              {sortBy === "price" && "Preço"}
              {sortBy === "status" && "Status"}
              {sortBy === "capacity" && "Capacidade"}
            </span>
            <span className="ml-1">({sortDirection === "asc" ? "crescente" : "decrescente"})</span>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRooms.length === accommodations.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todas as linhas"
                    />
                  </TableHead>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead>Acomodação</TableHead>
                  <TableHead>Categoria</TableHead>
                  {showStatus && <TableHead>Status</TableHead>}
                  <TableHead>Capacidade</TableHead>
                  {showPrices && <TableHead>Preço</TableHead>}
                  {showAmenities && <TableHead>Comodidades</TableHead>}
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAccommodations.map((accommodation) => (
                  <TableRow key={accommodation.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedRooms.includes(accommodation.id)}
                        onCheckedChange={(checked) => handleSelectRoom(accommodation.id, checked as boolean)}
                        aria-label={`Selecionar ${accommodation.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="relative h-10 w-16 overflow-hidden rounded">
                        <Image
                          src={accommodation.image || "/placeholder.svg"}
                          alt={accommodation.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{accommodation.name}</div>
                        {!compactMode && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">{accommodation.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{accommodation.category}</span>
                    </TableCell>
                    {showStatus && (
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            statusConfig[accommodation.status as keyof typeof statusConfig].color
                          }`}
                        >
                          {statusConfig[accommodation.status as keyof typeof statusConfig].label}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Users className="h-4 w-4" />
                        <span>
                          {accommodation.capacity}-{accommodation.maxCapacity}
                        </span>
                      </div>
                    </TableCell>
                    {showPrices && (
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">R$ {accommodation.price}</div>
                          <div className="text-gray-500">por noite</div>
                        </div>
                      </TableCell>
                    )}
                    {showAmenities && (
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {accommodation.amenities.length > 0 ? (
                            <>
                              {accommodation.amenities.slice(0, 3).map((amenity, index) => {
                                const Icon = amenityIcons[amenity as keyof typeof amenityIcons]
                                return Icon ? (
                                  <div
                                    key={`${accommodation.id}-${amenity}-${index}`}
                                    className="p-1 bg-gray-100 rounded"
                                    title={amenity}
                                  >
                                    <Icon className="h-3 w-3" />
                                  </div>
                                ) : null
                              })}
                              {accommodation.amenities.length > 3 && (
                                <span className="text-xs text-gray-500">+{accommodation.amenities.length - 3}</span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">Nenhuma</span>
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (window.location.href = `/client/acomodacoes/${accommodation.id}`)}
                          aria-label={`Ver ${accommodation.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (window.location.href = `/client/acomodacoes/editar/${accommodation.id}`)}
                          aria-label={`Editar ${accommodation.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" aria-label="Mais opções">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Duplicar</DropdownMenuItem>
                            <DropdownMenuItem>Histórico</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    )
  }

  // Visualização em Grid (Cards)
  return (
    <div className="space-y-4">
      {/* Select All */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedRooms.length === accommodations.length}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
            Selecionar todas as acomodações ({accommodations.length})
          </label>
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <ArrowUpDown className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Ordenado por: </span>
          <span className="font-medium ml-1">
            {sortBy === "number" && "Número"}
            {sortBy === "category" && "Categoria"}
            {sortBy === "price" && "Preço"}
            {sortBy === "status" && "Status"}
            {sortBy === "capacity" && "Capacidade"}
          </span>
          <span className="ml-1">({sortDirection === "asc" ? "↑" : "↓"})</span>
        </div>
      </div>

      {/* Grid responsivo */}
      <div
        className={`grid gap-4 sm:gap-6 grid-cols-1 ${
          compactMode ? "md:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"
        }`}
      >
        {sortedAccommodations.map((accommodation) => (
          <Card
            key={accommodation.id}
            className={`overflow-hidden hover:shadow-lg transition-shadow ${compactMode ? "h-auto" : ""}`}
          >
            <div className="relative">
              <Image
                src={accommodation.image || "/placeholder.svg"}
                alt={accommodation.name}
                width={300}
                height={200}
                className={`w-full object-cover ${compactMode ? "h-32" : "h-40 sm:h-48"}`}
              />
              {showStatus && (
                <Badge
                  className="absolute top-2 right-2"
                  variant={statusConfig[accommodation.status as keyof typeof statusConfig].variant}
                >
                  {statusConfig[accommodation.status as keyof typeof statusConfig].label}
                </Badge>
              )}

              {/* Checkbox de seleção */}
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={selectedRooms.includes(accommodation.id)}
                  onCheckedChange={(checked) => handleSelectRoom(accommodation.id, checked as boolean)}
                  className="bg-white/80 border-white"
                  aria-label={`Selecionar ${accommodation.name}`}
                />
              </div>
            </div>

            <CardHeader className={compactMode ? "pb-2 pt-3" : "pb-3"}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className={`truncate ${compactMode ? "text-base" : "text-lg"}`}>
                    {accommodation.name}
                  </CardTitle>
                  <CardDescription className="truncate">{accommodation.category}</CardDescription>
                </div>
                {showPrices && (
                  <div className="text-right ml-2">
                    <div className={`font-bold text-primary ${compactMode ? "text-base" : "text-lg"}`}>
                      R$ {accommodation.price}
                    </div>
                    <div className="text-xs text-muted-foreground">por noite</div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className={`space-y-${compactMode ? "2" : "4"}`}>
              {!compactMode && (
                <p className="text-sm text-muted-foreground line-clamp-2">{accommodation.description}</p>
              )}

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {accommodation.capacity}-{accommodation.maxCapacity} pessoas
                  </span>
                </div>
              </div>

              {showAmenities && (
                <div className="flex items-center space-x-2">
                  {accommodation.amenities.length > 0 ? (
                    <>
                      {accommodation.amenities.slice(0, compactMode ? 3 : 4).map((amenity, index) => {
                        const Icon = amenityIcons[amenity as keyof typeof amenityIcons]
                        return Icon ? (
                          <div
                            key={`${accommodation.id}-${amenity}-${index}`}
                            className="p-1 bg-muted rounded"
                            title={amenity}
                          >
                            <Icon className="h-3 w-3" />
                          </div>
                        ) : null
                      })}
                      {accommodation.amenities.length > (compactMode ? 3 : 4) && (
                        <div className="p-1 bg-muted rounded">
                          <span className="text-xs">+{accommodation.amenities.length - (compactMode ? 3 : 4)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">Nenhuma comodidade</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => (window.location.href = `/client/acomodacoes/${accommodation.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => (window.location.href = `/client/acomodacoes/editar/${accommodation.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>

                {/* Menu de ações adicional */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Duplicar</DropdownMenuItem>
                    <DropdownMenuItem>Histórico</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
