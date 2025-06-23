import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function HotelSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Hotel</CardTitle>
        <CardDescription>Dados básicos e configurações gerais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hotel-name">Nome do Hotel</Label>
            <Input id="hotel-name" defaultValue="Hotel Vista Mar" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotel-type">Tipo de Estabelecimento</Label>
            <Select defaultValue="hotel">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="pousada">Pousada</SelectItem>
                <SelectItem value="resort">Resort</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hotel-description">Descrição</Label>
          <Textarea
            id="hotel-description"
            defaultValue="Hotel com vista para o mar, localizado no centro da cidade"
            rows={3}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="check-in-time">Horário Check-in</Label>
            <Input id="check-in-time" type="time" defaultValue="14:00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check-out-time">Horário Check-out</Label>
            <Input id="check-out-time" type="time" defaultValue="12:00" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="total-rooms">Total de Quartos</Label>
            <Input id="total-rooms" type="number" defaultValue="45" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Moeda</Label>
            <Select defaultValue="BRL">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real (R$)</SelectItem>
                <SelectItem value="USD">Dólar ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Fuso Horário</Label>
            <Select defaultValue="America/Sao_Paulo">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Salvar Configurações</Button>
        </div>
      </CardContent>
    </Card>
  )
}
