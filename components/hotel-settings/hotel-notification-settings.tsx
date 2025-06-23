"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bell, Mail, MessageSquare, Phone, AlertTriangle, CheckCircle, Info, Save } from "lucide-react"

interface NotificationChannel {
  id: string
  name: string
  icon: any
  enabled: boolean
  config: Record<string, any>
}

interface NotificationCategory {
  id: string
  name: string
  description: string
  channels: string[]
  priority: "low" | "medium" | "high" | "critical"
  enabled: boolean
}

export function HotelNotificationSettings() {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: "email",
      name: "E-mail",
      icon: Mail,
      enabled: true,
      config: {
        smtpServer: "smtp.gmail.com",
        smtpPort: "587",
        username: "hotel@exemplo.com",
        fromName: "Hotel Augusto",
      },
    },
    {
      id: "push",
      name: "Push Notifications",
      icon: Bell,
      enabled: true,
      config: {
        webPush: true,
        mobilePush: true,
      },
    },
    {
      id: "sms",
      name: "SMS",
      icon: MessageSquare,
      enabled: false,
      config: {
        provider: "twilio",
        apiKey: "",
        fromNumber: "",
      },
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: Phone,
      enabled: false,
      config: {
        apiKey: "",
        phoneNumber: "",
      },
    },
  ])

  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: "reservations",
      name: "Reservas",
      description: "Novas reservas, cancelamentos e alterações",
      channels: ["email", "push"],
      priority: "high",
      enabled: true,
    },
    {
      id: "checkin",
      name: "Check-in/Check-out",
      description: "Processos de entrada e saída de hóspedes",
      channels: ["email", "push"],
      priority: "medium",
      enabled: true,
    },
    {
      id: "maintenance",
      name: "Manutenção",
      description: "Ordens de serviço e emergências",
      channels: ["email", "push", "sms"],
      priority: "critical",
      enabled: true,
    },
    {
      id: "financial",
      name: "Financeiro",
      description: "Pagamentos, faturas e relatórios",
      channels: ["email"],
      priority: "medium",
      enabled: true,
    },
    {
      id: "cleaning",
      name: "Limpeza",
      description: "Status de limpeza e governança",
      channels: ["push"],
      priority: "low",
      enabled: true,
    },
    {
      id: "system",
      name: "Sistema",
      description: "Atualizações e manutenção do sistema",
      channels: ["email"],
      priority: "low",
      enabled: false,
    },
  ])

  const [globalSettings, setGlobalSettings] = useState({
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    timezone: "America/Sao_Paulo",
    defaultLanguage: "pt-BR",
    emailSignature: "Atenciosamente,\nEquipe Hotel Augusto",
    maxRetries: 3,
    retryInterval: 5,
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Configurações salvas",
        description: "As configurações de notificação foram atualizadas com sucesso.",
      })
    }, 1000)
  }

  const toggleChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((channel) => (channel.id === channelId ? { ...channel, enabled: !channel.enabled } : channel)),
    )
  }

  const toggleCategory = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((category) => (category.id === categoryId ? { ...category, enabled: !category.enabled } : category)),
    )
  }

  const updateChannelConfig = (channelId: string, key: string, value: any) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === channelId
          ? {
              ...channel,
              config: { ...channel.config, [key]: value },
            }
          : channel,
      ),
    )
  }

  const updateCategoryChannels = (categoryId: string, channelId: string, enabled: boolean) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              channels: enabled ? [...category.channels, channelId] : category.channels.filter((c) => c !== channelId),
            }
          : category,
      ),
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return AlertTriangle
      case "high":
        return AlertTriangle
      case "medium":
        return Info
      case "low":
        return CheckCircle
      default:
        return Info
    }
  }

  return (
    <div className="space-y-6">
      {/* Configurações Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações Globais
          </CardTitle>
          <CardDescription>Configurações gerais para todas as notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quietStart">Início do Período Silencioso</Label>
              <Input
                id="quietStart"
                type="time"
                value={globalSettings.quietHoursStart}
                onChange={(e) =>
                  setGlobalSettings({
                    ...globalSettings,
                    quietHoursStart: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quietEnd">Fim do Período Silencioso</Label>
              <Input
                id="quietEnd"
                type="time"
                value={globalSettings.quietHoursEnd}
                onChange={(e) =>
                  setGlobalSettings({
                    ...globalSettings,
                    quietHoursEnd: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select
                value={globalSettings.timezone}
                onValueChange={(value) =>
                  setGlobalSettings({
                    ...globalSettings,
                    timezone: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Idioma Padrão</Label>
              <Select
                value={globalSettings.defaultLanguage}
                onValueChange={(value) =>
                  setGlobalSettings({
                    ...globalSettings,
                    defaultLanguage: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Assinatura de E-mail</Label>
            <Textarea
              id="signature"
              value={globalSettings.emailSignature}
              onChange={(e) =>
                setGlobalSettings({
                  ...globalSettings,
                  emailSignature: e.target.value,
                })
              }
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Canais de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Canais de Notificação</CardTitle>
          <CardDescription>Configure os canais disponíveis para envio de notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {channels.map((channel) => {
            const IconComponent = channel.icon

            return (
              <div key={channel.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{channel.name}</h3>
                      <p className="text-sm text-muted-foreground">{channel.enabled ? "Ativo" : "Inativo"}</p>
                    </div>
                  </div>
                  <Switch checked={channel.enabled} onCheckedChange={() => toggleChannel(channel.id)} />
                </div>

                {channel.enabled && (
                  <div className="space-y-3 border-t pt-4">
                    {channel.id === "email" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Servidor SMTP</Label>
                          <Input
                            value={channel.config.smtpServer}
                            onChange={(e) => updateChannelConfig(channel.id, "smtpServer", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Porta</Label>
                          <Input
                            value={channel.config.smtpPort}
                            onChange={(e) => updateChannelConfig(channel.id, "smtpPort", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Usuário</Label>
                          <Input
                            value={channel.config.username}
                            onChange={(e) => updateChannelConfig(channel.id, "username", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nome do Remetente</Label>
                          <Input
                            value={channel.config.fromName}
                            onChange={(e) => updateChannelConfig(channel.id, "fromName", e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {channel.id === "sms" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Provedor</Label>
                          <Select
                            value={channel.config.provider}
                            onValueChange={(value) => updateChannelConfig(channel.id, "provider", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="twilio">Twilio</SelectItem>
                              <SelectItem value="nexmo">Nexmo</SelectItem>
                              <SelectItem value="aws-sns">AWS SNS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <Input
                            type="password"
                            value={channel.config.apiKey}
                            onChange={(e) => updateChannelConfig(channel.id, "apiKey", e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {channel.id === "whatsapp" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <Input
                            type="password"
                            value={channel.config.apiKey}
                            onChange={(e) => updateChannelConfig(channel.id, "apiKey", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Número do WhatsApp</Label>
                          <Input
                            value={channel.config.phoneNumber}
                            onChange={(e) => updateChannelConfig(channel.id, "phoneNumber", e.target.value)}
                            placeholder="+55 11 99999-9999"
                          />
                        </div>
                      </div>
                    )}

                    {channel.id === "push" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Notificações Web</Label>
                          <Switch
                            checked={channel.config.webPush}
                            onCheckedChange={(checked) => updateChannelConfig(channel.id, "webPush", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Notificações Mobile</Label>
                          <Switch
                            checked={channel.config.mobilePush}
                            onCheckedChange={(checked) => updateChannelConfig(channel.id, "mobilePush", checked)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Categorias de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Notificação</CardTitle>
          <CardDescription>Configure quais tipos de eventos devem gerar notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => {
            const PriorityIcon = getPriorityIcon(category.priority)

            return (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <PriorityIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(category.priority)}>{category.priority}</Badge>
                    <Switch checked={category.enabled} onCheckedChange={() => toggleCategory(category.id)} />
                  </div>
                </div>

                {category.enabled && (
                  <div className="border-t pt-3">
                    <Label className="text-sm font-medium">Canais ativos:</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {channels
                        .filter((c) => c.enabled)
                        .map((channel) => {
                          const IconComponent = channel.icon
                          const isActive = category.channels.includes(channel.id)

                          return (
                            <div
                              key={channel.id}
                              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                                isActive ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                              }`}
                              onClick={() => updateCategoryChannels(category.id, channel.id, !isActive)}
                            >
                              <IconComponent className="h-4 w-4" />
                              <span className="text-sm">{channel.name}</span>
                              {isActive && <CheckCircle className="h-3 w-3 text-blue-600 ml-auto" />}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Templates de E-mail */}
      <Card>
        <CardHeader>
          <CardTitle>Templates de E-mail</CardTitle>
          <CardDescription>Personalize os templates de e-mail para diferentes tipos de notificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {[
              { id: "new-reservation", name: "Nova Reserva", subject: "Confirmação de Reserva - Hotel Augusto" },
              {
                id: "checkin-reminder",
                name: "Lembrete de Check-in",
                subject: "Lembrete: Check-in hoje - Hotel Augusto",
              },
              { id: "maintenance-alert", name: "Alerta de Manutenção", subject: "Alerta: Ordem de Manutenção Urgente" },
              { id: "payment-received", name: "Pagamento Recebido", subject: "Pagamento Confirmado - Hotel Augusto" },
            ].map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">Assunto: {template.subject}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Editar Template
                  </Button>
                </div>
              </div>
            ))}
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
