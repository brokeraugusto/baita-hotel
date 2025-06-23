import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const integrations = [
  {
    name: "Booking.com",
    status: "active",
    description: "Sincronização de reservas e disponibilidade",
  },
  {
    name: "Airbnb",
    status: "active",
    description: "Gestão de propriedades e reservas",
  },
  {
    name: "Expedia",
    status: "inactive",
    description: "Canal de distribuição global",
  },
  {
    name: "WhatsApp Business",
    status: "active",
    description: "Comunicação com hóspedes",
  },
]

export function IntegrationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Integrações</CardTitle>
        <CardDescription>Gerencie integrações disponíveis para os clientes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="api-rate-limit">Limite de API (req/min)</Label>
            <Input id="api-rate-limit" type="number" defaultValue="1000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-timeout">Timeout de Webhook (seg)</Label>
            <Input id="webhook-timeout" type="number" defaultValue="30" />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Integrações Disponíveis</h4>
          {integrations.map((integration, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{integration.name}</span>
                  <Badge variant={integration.status === "active" ? "default" : "secondary"}>
                    {integration.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
              <Switch defaultChecked={integration.status === "active"} />
            </div>
          ))}
        </div>

        <Button className="w-full">Salvar Integrações</Button>
      </CardContent>
    </Card>
  )
}
