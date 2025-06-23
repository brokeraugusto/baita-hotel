import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

const availableIntegrations = [
  {
    name: "Booking.com",
    description: "Sincronize reservas e disponibilidade automaticamente",
    status: "connected",
    icon: "🏨",
  },
  {
    name: "Airbnb",
    description: "Gerencie suas propriedades do Airbnb",
    status: "available",
    icon: "🏠",
  },
  {
    name: "WhatsApp Business",
    description: "Comunique-se com hóspedes via WhatsApp",
    status: "connected",
    icon: "💬",
  },
  {
    name: "Google Analytics",
    description: "Acompanhe métricas do seu site",
    status: "available",
    icon: "📊",
  },
  {
    name: "Mercado Pago",
    description: "Processe pagamentos online",
    status: "connected",
    icon: "💳",
  },
]

export function IntegrationManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrações</CardTitle>
        <CardDescription>Conecte seu hotel com outras plataformas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableIntegrations.map((integration, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{integration.icon}</div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{integration.name}</h4>
                  <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                    {integration.status === "connected" ? "Conectado" : "Disponível"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {integration.status === "connected" ? (
                <>
                  <Switch defaultChecked />
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </>
              ) : (
                <Button size="sm">Conectar</Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
