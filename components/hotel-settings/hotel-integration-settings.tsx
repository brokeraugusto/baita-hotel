"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Link, Calendar, Globe, Smartphone, CreditCard, Mail, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  enabled: boolean
  status: "connected" | "disconnected" | "error"
  apiKey?: string
  apiSecret?: string
  webhookUrl?: string
  lastSync?: string
}

export function HotelIntegrationSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "booking",
      name: "Booking.com",
      description: "Sincronize reservas e disponibilidade com Booking.com",
      icon: Globe,
      enabled: true,
      status: "connected",
      apiKey: "bk_live_***************",
      lastSync: "2024-01-15 14:30:00",
    },
    {
      id: "airbnb",
      name: "Airbnb",
      description: "Gerencie suas listagens do Airbnb",
      icon: Smartphone,
      enabled: false,
      status: "disconnected",
      apiKey: "",
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sincronize eventos e bloqueios de calendário",
      icon: Calendar,
      enabled: true,
      status: "connected",
      apiKey: "gc_***************",
      lastSync: "2024-01-15 15:45:00",
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Processamento de pagamentos online",
      icon: CreditCard,
      enabled: true,
      status: "error",
      apiKey: "sk_live_***************",
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Marketing por email e automação",
      icon: Mail,
      enabled: false,
      status: "disconnected",
      apiKey: "",
    },
  ])

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleToggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id ? { ...integration, enabled: !integration.enabled } : integration,
      ),
    )
  }

  const handleSaveIntegration = (id: string, data: Partial<Integration>) => {
    setIntegrations((prev) =>
      prev.map((integration) => (integration.id === id ? { ...integration, ...data } : integration)),
    )

    toast({
      title: "Integração atualizada",
      description: "As configurações da integração foram salvas com sucesso.",
    })
  }

  const handleTestConnection = async (id: string) => {
    setIsLoading(true)

    // Simular teste de conexão
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% de chance de sucesso

      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === id
            ? {
                ...integration,
                status: success ? "connected" : "error",
                lastSync: success ? new Date().toLocaleString("pt-BR") : undefined,
              }
            : integration,
        ),
      )

      setIsLoading(false)

      toast({
        title: success ? "Conexão bem-sucedida" : "Erro na conexão",
        description: success
          ? "A integração está funcionando corretamente."
          : "Verifique suas credenciais e tente novamente.",
        variant: success ? "default" : "destructive",
      })
    }, 2000)
  }

  const getStatusIcon = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Conectado
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Erro</Badge>
      default:
        return <Badge variant="secondary">Desconectado</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Integrações Externas
          </CardTitle>
          <CardDescription>Configure integrações com plataformas externas para automatizar processos</CardDescription>
        </CardHeader>
      </Card>

      {/* Lista de Integrações */}
      <div className="space-y-4">
        {integrations.map((integration) => {
          const IconComponent = integration.icon

          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integration.status)}
                    {getStatusBadge(integration.status)}
                    <Switch
                      checked={integration.enabled}
                      onCheckedChange={() => handleToggleIntegration(integration.id)}
                    />
                  </div>
                </div>
              </CardHeader>

              {integration.enabled && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${integration.id}-api-key`}>API Key</Label>
                      <Input
                        id={`${integration.id}-api-key`}
                        type="password"
                        value={integration.apiKey || ""}
                        onChange={(e) => handleSaveIntegration(integration.id, { apiKey: e.target.value })}
                        placeholder="Insira sua API Key"
                      />
                    </div>

                    {integration.id === "stripe" && (
                      <div className="space-y-2">
                        <Label htmlFor={`${integration.id}-api-secret`}>API Secret</Label>
                        <Input
                          id={`${integration.id}-api-secret`}
                          type="password"
                          value={integration.apiSecret || ""}
                          onChange={(e) => handleSaveIntegration(integration.id, { apiSecret: e.target.value })}
                          placeholder="Insira sua API Secret"
                        />
                      </div>
                    )}
                  </div>

                  {(integration.id === "booking" || integration.id === "airbnb") && (
                    <div className="space-y-2">
                      <Label htmlFor={`${integration.id}-webhook`}>Webhook URL</Label>
                      <Input
                        id={`${integration.id}-webhook`}
                        value={integration.webhookUrl || ""}
                        onChange={(e) => handleSaveIntegration(integration.id, { webhookUrl: e.target.value })}
                        placeholder="https://seuhotel.com/webhook/booking"
                      />
                    </div>
                  )}

                  {integration.lastSync && (
                    <div className="text-sm text-muted-foreground">Última sincronização: {integration.lastSync}</div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleTestConnection(integration.id)} disabled={isLoading}>
                      {isLoading ? "Testando..." : "Testar Conexão"}
                    </Button>

                    {integration.status === "connected" && <Button variant="outline">Sincronizar Agora</Button>}
                  </div>

                  {/* Configurações específicas por integração */}
                  {integration.id === "booking" && integration.status === "connected" && (
                    <div className="border-t pt-4 space-y-4">
                      <h4 className="font-medium">Configurações do Booking.com</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <Label>Sincronizar preços</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Sincronizar disponibilidade</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Importar reservas</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Notificações automáticas</Label>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  )}

                  {integration.id === "google-calendar" && integration.status === "connected" && (
                    <div className="border-t pt-4 space-y-4">
                      <h4 className="font-medium">Configurações do Google Calendar</h4>
                      <div className="space-y-2">
                        <Label>ID do Calendário</Label>
                        <Input placeholder="hotel@gmail.com" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Criar eventos para check-in/check-out</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Configurações Globais de Webhook */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Webhook</CardTitle>
          <CardDescription>Configure endpoints para receber notificações de eventos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-endpoint">Endpoint Principal</Label>
            <Input
              id="webhook-endpoint"
              placeholder="https://seuhotel.com/api/webhook"
              defaultValue="https://hotelaugusto.com.br/api/webhook"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-secret">Secret Key</Label>
            <Input id="webhook-secret" type="password" placeholder="Chave secreta para validação" />
          </div>

          <div className="space-y-2">
            <Label>Eventos para Notificar</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Nova reserva",
                "Cancelamento",
                "Check-in realizado",
                "Check-out realizado",
                "Pagamento recebido",
                "Alteração de reserva",
              ].map((event) => (
                <div key={event} className="flex items-center justify-between">
                  <Label className="text-sm">{event}</Label>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs de Integração */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Integração</CardTitle>
          <CardDescription>Últimas atividades das integrações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "14:30", integration: "Booking.com", action: "Sincronização de preços", status: "success" },
              { time: "14:25", integration: "Google Calendar", action: "Evento criado", status: "success" },
              { time: "14:20", integration: "Stripe", action: "Pagamento processado", status: "success" },
              { time: "14:15", integration: "Booking.com", action: "Nova reserva importada", status: "success" },
              { time: "14:10", integration: "Airbnb", action: "Falha na conexão", status: "error" },
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">{log.time}</div>
                  <div className="font-medium">{log.integration}</div>
                  <div className="text-sm">{log.action}</div>
                </div>
                <Badge variant={log.status === "success" ? "default" : "destructive"}>
                  {log.status === "success" ? "Sucesso" : "Erro"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
