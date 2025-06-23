"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Wifi, Tv, Car, Coffee, Bath, Fan, RefrigeratorIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAmenities, type Amenity } from "@/components/accommodations/amenities-service"

// Função para obter o componente de ícone correspondente
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    wifi: <Wifi className="h-4 w-4" />,
    tv: <Tv className="h-4 w-4" />,
    car: <Car className="h-4 w-4" />,
    coffee: <Coffee className="h-4 w-4" />,
    bath: <Bath className="h-4 w-4" />,
    fan: <Fan className="h-4 w-4" />,
    refrigerator: <RefrigeratorIcon className="h-4 w-4" />,
  }

  return iconMap[iconName] || <div className="h-4 w-4" />
}

export default function NewAccommodationPage() {
  const { toast } = useToast()
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    status: "available",
    capacity: 2,
    maxCapacity: 4,
    price: 0,
    priceCredit: 0,
    description: "",
    photoAlbumUrl: "",
  })

  // Carregar comodidades uma única vez
  useEffect(() => {
    let mounted = true

    const loadAmenities = async () => {
      try {
        const data = await getAmenities()
        if (mounted) {
          setAmenities(data)
        }
      } catch (error) {
        console.error("Erro ao carregar comodidades:", error)
        if (mounted) {
          toast({
            title: "Erro",
            description: "Não foi possível carregar as comodidades.",
            variant: "destructive",
          })
        }
      }
    }

    loadAmenities()

    return () => {
      mounted = false
    }
  }, [toast])

  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleAmenityToggle = useCallback((amenityId: string) => {
    setSelectedAmenities((prev) => {
      if (prev.includes(amenityId)) {
        return prev.filter((id) => id !== amenityId)
      } else {
        return [...prev, amenityId]
      }
    })
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      // Simular salvamento
      const accommodationData = {
        ...formData,
        amenities: selectedAmenities,
        id: Date.now().toString(), // ID temporário
      }

      console.log("Dados da acomodação:", accommodationData)

      toast({
        title: "Acomodação criada",
        description: "A nova acomodação foi criada com sucesso.",
      })

      // Redirect após sucesso
      setTimeout(() => {
        window.location.href = "/client/acomodacoes"
      }, 1500)
    },
    [formData, selectedAmenities, toast],
  )

  // Agrupar comodidades por categoria
  const amenitiesByCategory = amenities.reduce(
    (acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = []
      }
      acc[amenity.category].push(amenity)
      return acc
    },
    {} as Record<string, Amenity[]>,
  )

  const categories = Object.keys(amenitiesByCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Acomodação</h1>
          <p className="text-muted-foreground">Adicione uma nova acomodação ao seu hotel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Acomodação</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  placeholder="Ex: Suíte 101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suite-luxo">Suíte Luxo</SelectItem>
                    <SelectItem value="vista-mar">Vista Mar</SelectItem>
                    <SelectItem value="chale-standard">Chalé Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="occupied">Ocupado</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="cleaning">Limpeza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade Padrão</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleChange("capacity", Number.parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">Capacidade Máxima</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    min="1"
                    value={formData.maxCapacity}
                    onChange={(e) => handleChange("maxCapacity", Number.parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (PIX)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange("price", Number.parseFloat(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceCredit">Preço (Crédito)</Label>
                  <Input
                    id="priceCredit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.priceCredit}
                    onChange={(e) => handleChange("priceCredit", Number.parseFloat(e.target.value))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  placeholder="Descreva as características da acomodação..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoAlbumUrl">Link do Álbum de Fotos</Label>
                <Input
                  id="photoAlbumUrl"
                  type="url"
                  value={formData.photoAlbumUrl}
                  onChange={(e) => handleChange("photoAlbumUrl", e.target.value)}
                  placeholder="https://photos.example.com/album"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comodidades - Versão Simplificada */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Comodidades</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {amenitiesByCategory[category].map((amenity) => (
                        <div
                          key={amenity.id}
                          className={`flex items-center gap-2 p-3 border rounded-md transition-colors ${
                            selectedAmenities.includes(amenity.id)
                              ? "bg-primary/10 border-primary/30"
                              : "hover:bg-muted"
                          }`}
                        >
                          <Checkbox
                            checked={selectedAmenities.includes(amenity.id)}
                            onCheckedChange={(checked) => handleAmenityToggle(amenity.id)}
                          />
                          <div className="flex items-center gap-2">
                            {getIconComponent(amenity.icon)}
                            <span className="text-sm">{amenity.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">Carregando comodidades...</div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Criar Acomodação
          </Button>
        </div>
      </form>
    </div>
  )
}
