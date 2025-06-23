"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Save, MapPin, Phone, Globe } from "lucide-react"

interface HotelBasicInfo {
  name: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
  website: string
  category: string
  checkInTime: string
  checkOutTime: string
  currency: string
  timezone: string
}

export function HotelBasicSettings() {
  const [hotelInfo, setHotelInfo] = useState<HotelBasicInfo>({
    name: "Hotel Augusto O2 Digital",
    description: "Um hotel moderno com tecnologia de ponta e atendimento excepcional.",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    country: "Brasil",
    phone: "(11) 99999-9999",
    email: "contato@hotelaugusto.com.br",
    website: "https://hotelaugusto.com.br",
    category: "4-stars",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)

    // Simular salvamento
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Configurações salvas",
        description: "As informações básicas do hotel foram atualizadas com sucesso.",
      })
    }, 1000)
  }

  const handleInputChange = (field: keyof HotelBasicInfo, value: string) => {
    setHotelInfo((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Informações Gerais
          </CardTitle>
          <CardDescription>Configure as informações básicas do seu hotel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Hotel *</Label>
              <Input
                id="name"
                value={hotelInfo.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nome do hotel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={hotelInfo.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-star">1 Estrela</SelectItem>
                  <SelectItem value="2-stars">2 Estrelas</SelectItem>
                  <SelectItem value="3-stars">3 Estrelas</SelectItem>
                  <SelectItem value="4-stars">4 Estrelas</SelectItem>
                  <SelectItem value="5-stars">5 Estrelas</SelectItem>
                  <SelectItem value="boutique">Boutique</SelectItem>
                  <SelectItem value="resort">Resort</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={hotelInfo.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descrição do hotel"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
          <CardDescription>Localização física do hotel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={hotelInfo.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Rua, número, complemento"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={hotelInfo.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Cidade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                value={hotelInfo.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Estado"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={hotelInfo.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Select value={hotelInfo.country} onValueChange={(value) => handleInputChange("country", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Brasil">Brasil</SelectItem>
                <SelectItem value="Argentina">Argentina</SelectItem>
                <SelectItem value="Chile">Chile</SelectItem>
                <SelectItem value="Uruguai">Uruguai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Informações de Contato
          </CardTitle>
          <CardDescription>Dados para contato com o hotel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={hotelInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={hotelInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="contato@hotel.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={hotelInfo.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://seuhotel.com.br"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações Operacionais */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Operacionais</CardTitle>
          <CardDescription>Horários e configurações de funcionamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInTime">Horário de Check-in</Label>
              <Input
                id="checkInTime"
                type="time"
                value={hotelInfo.checkInTime}
                onChange={(e) => handleInputChange("checkInTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Horário de Check-out</Label>
              <Input
                id="checkOutTime"
                type="time"
                value={hotelInfo.checkOutTime}
                onChange={(e) => handleInputChange("checkOutTime", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select value={hotelInfo.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (BRL)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select value={hotelInfo.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                  <SelectItem value="America/Santiago">Santiago (GMT-3)</SelectItem>
                  <SelectItem value="America/Montevideo">Montevidéu (GMT-3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  )
}
