"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  AlertTriangle,
  Building2,
  Check,
  Database,
  Globe,
  Key,
  Mail,
  MoreHorizontal,
  Plus,
  Save,
  Settings,
  Shield,
  Trash2,
  Users,
  Webhook,
  X,
} from "lucide-react"

interface SystemConfig {
  maintenanceMode: boolean
  allowNewRegistrations: boolean
  maxClientsPerPlan: {
    basic: number
    professional: number
    enterprise: number
  }
  emailNotifications: boolean
  smsNotifications: boolean
  backupFrequency: "daily" | "weekly" | "monthly"
  sessionTimeout: number
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
  }
}

interface Integration {
  id: string
  name: string
  type: "payment" | "email" | "sms" | "analytics" | "backup"
  status: "active" | "inactive" | "error"
  description: string
  lastSync: string
  config: Record<string, any>
}

const initialConfig: SystemConfig = {
  maintenanceMode: false,
  allowNewRegistrations: true,
  maxClientsPerPlan: {
    basic: 100,
    professional: 500,
    enterprise: 1000,
  },
  emailNotifications: true,
  smsNotifications: false,
  backupFrequency: "daily",
  sessionTimeout: 30,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: false,
  },
}

const initialIntegrations: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    type: "payment",
    status: "active",
    description: "Processamento de pagamentos",
    lastSync: "2024-06-10T14:30:00Z",
    config: { publicKey: "pk_test_...", webhookUrl: "https://api.baitahotel.com/webhooks/stripe" },
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    type: "email",
    status: "active",
    description: "Envio de emails transacionais",
    lastSync: "2024-06-10T12:15:00Z",
    config: { apiKey: "SG.xxx...", fromEmail: "noreply@baitahotel.com" },
  },
  {
    id: "twilio",
    name: "Twilio",
    type: "sms",
    status: "inactive",
    description: "Envio de SMS",
    lastSync: "2024-06-08T09:20:00Z",
    config: { accountSid: "AC...", authToken: "xxx...", fromNumber: "+5511999999999" },
  },
  {
    id: "analytics",
    name: "Google Analytics",
    type: "analytics",
    status: "active",
    description: "Análise de uso da plataforma",
    lastSync: "2024-06-10T16:45:00Z",
    config: { trackingId: "GA-XXXXXXXXX", apiKey: "xxx..." },
  },
  {
    id: "aws-s3",
    name: "AWS S3",
    type: "backup",
    status: "error",
    description: "Backup automático de dados",
    lastSync: "2024-06-09T02:00:00Z",
    config: { bucket: "baitahotel-backups", region: "us-east-1", accessKey: "AKIA..." },
  },
]

export default function ConfigurationsPage() {
  const [config, setConfig] = useState<SystemConfig>(initialConfig)
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const handleSaveConfig = () => {
    setIsEditing(false)
    toast({
      title: "Configurações salvas",
      description: "As configurações da plataforma foram atualizadas com sucesso.",
    })
  }

  const handleToggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? {
              ...integration,
              status: integration.status === "active" ? "inactive" : "active",
              lastSync: new Date().toISOString(),
            }
          : integration,
      ),
    )
    toast({
      title: "Integração atualizada",
      description: "O status da integração foi alterado.",
    })
  }

  const handleTestIntegration = (id: string) => {
    toast({
      title: "Teste iniciado",
      description: "Testando conexão com a integração...",
    })
    // Simular teste
    setTimeout(() => {
      toast({
        title: "Teste concluído",
        description: "A integração está funcionando corretamente.",
      })
    }, 2000)
  }

  const getStatusIcon = (status: Integration["status"]) => {
    switch (status) {
      case "active":
        return <Check className="h-4 w-4 text-green-500" />
      case "inactive":
        return <X className="h-4 w-4 text-gray-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Ativo</Badge>
      case "inactive":
        return <Badge variant="secondary">Inativo</Badge>
      case "error":
        return <Badge variant="destructive">Erro</Badge>
    }
  }

  const getTypeIcon = (type: Integration["type"]) => {
    switch (type) {
      case "payment":
        return <Building2 className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "sms":
        return <Users className="h-4 w-4" />
      case "analytics":
        return <Globe className="h-4 w-4" />
      case "backup":
        return <Database className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Configurações da Plataforma</h2>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveConfig}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configurações básicas da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">Impede novos logins e exibe página de manutenção</p>
                  </div>
                  <Switch
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, maintenanceMode: checked }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Novos Cadastros</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que novos clientes se cadastrem na plataforma
                    </p>
                  </div>
                  <Switch
                    checked={config.allowNewRegistrations}
                    onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, allowNewRegistrations: checked }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeout de Sessão (minutos)</Label>
                  <Input
                    type="number"
                    value={config.sessionTimeout}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, sessionTimeout: Number.parseInt(e.target.value) || 30 }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limites por Plano</CardTitle>
                <CardDescription>Número máximo de clientes por tipo de plano</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Plano Básico</Label>
                  <Input
                    type="number"
                    value={config.maxClientsPerPlan.basic}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        maxClientsPerPlan: {
                          ...prev.maxClientsPerPlan,
                          basic: Number.parseInt(e.target.value) || 100,
                        },
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plano Profissional</Label>
                  <Input
                    type="number"
                    value={config.maxClientsPerPlan.professional}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        maxClientsPerPlan: {
                          ...prev.maxClientsPerPlan,
                          professional: Number.parseInt(e.target.value) || 500,
                        },
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plano Enterprise</Label>
                  <Input
                    type="number"
                    value={config.maxClientsPerPlan.enterprise}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        maxClientsPerPlan: {
                          ...prev.maxClientsPerPlan,
                          enterprise: Number.parseInt(e.target.value) || 1000,
                        },
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Política de Senhas</CardTitle>
              <CardDescription>Configurações de segurança para senhas de usuários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Comprimento Mínimo</Label>
                  <Input
                    type="number"
                    value={config.passwordPolicy.minLength}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          minLength: Number.parseInt(e.target.value) || 8,
                        },
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Exigir Letras Maiúsculas</Label>
                    <Switch
                      checked={config.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          passwordPolicy: { ...prev.passwordPolicy, requireUppercase: checked },
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Exigir Números</Label>
                    <Switch
                      checked={config.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          passwordPolicy: { ...prev.passwordPolicy, requireNumbers: checked },
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Exigir Símbolos</Label>
                    <Switch
                      checked={config.passwordPolicy.requireSymbols}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          passwordPolicy: { ...prev.passwordPolicy, requireSymbols: checked },
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chaves de API</CardTitle>
              <CardDescription>Gerenciar chaves de API para integrações</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">API Principal</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">••••••••••••••••</span>
                        <Button variant="ghost" size="sm">
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>10/05/2024</TableCell>
                    <TableCell>Hoje, 14:30</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Renovar
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Webhook</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">••••••••••••••••</span>
                        <Button variant="ghost" size="sm">
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>01/06/2024</TableCell>
                    <TableCell>Ontem, 18:45</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Renovar
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Chave API
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>Gerenciar como as notificações são enviadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">Enviar notificações importantes por email</p>
                </div>
                <Switch
                  checked={config.emailNotifications}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, emailNotifications: checked }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por SMS</Label>
                  <p className="text-sm text-muted-foreground">Enviar notificações urgentes por SMS</p>
                </div>
                <Switch
                  checked={config.smsNotifications}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, smsNotifications: checked }))}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Templates de Email</CardTitle>
              <CardDescription>Personalizar templates de email enviados pela plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template de Boas-vindas</Label>
                <Select defaultValue="default" disabled={!isEditing}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="minimal">Minimalista</SelectItem>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Template de Recuperação de Senha</Label>
                <Select defaultValue="default" disabled={!isEditing}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="minimal">Minimalista</SelectItem>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Template de Notificação</Label>
                <Select defaultValue="default" disabled={!isEditing}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="minimal">Minimalista</SelectItem>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2">
                <Button variant="outline" disabled={!isEditing}>
                  Personalizar Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrações Ativas</CardTitle>
              <CardDescription>Gerenciar integrações com serviços externos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Sincronização</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                            {getTypeIcon(integration.type)}
                          </div>
                          <div>
                            <div className="font-medium">{integration.name}</div>
                            <div className="text-sm text-muted-foreground">{integration.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{integration.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(integration.status)}
                          <span>{getStatusBadge(integration.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(integration.lastSync).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant={integration.status === "active" ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleIntegration(integration.id)}
                          >
                            {integration.status === "active" ? "Desativar" : "Ativar"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleTestIntegration(integration.id)}>
                            Testar
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Integração
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Configurar webhooks para eventos da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL do Webhook</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="https://seu-servidor.com/webhook"
                    defaultValue="https://api.cliente.com/webhooks/baita-hotel"
                    disabled={!isEditing}
                  />
                  <Button variant="outline" disabled={!isEditing}>
                    <Webhook className="mr-2 h-4 w-4" />
                    Testar
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Eventos</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="event-client-created"
                      defaultChecked
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="event-client-created">Cliente Criado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="event-client-updated"
                      defaultChecked
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="event-client-updated">Cliente Atualizado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="event-payment-received"
                      defaultChecked
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="event-payment-received">Pagamento Recebido</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="event-plan-changed"
                      defaultChecked
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="event-plan-changed">Plano Alterado</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Segredo do Webhook</Label>
                <div className="flex space-x-2">
                  <Input type="password" defaultValue="whsec_abcdefghijklmnopqrstuvwxyz" disabled={!isEditing} />
                  <Button variant="outline" disabled={!isEditing}>
                    <Shield className="mr-2 h-4 w-4" />
                    Gerar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Backup</CardTitle>
              <CardDescription>Gerenciar backups automáticos da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Frequência de Backup</Label>
                <Select
                  value={config.backupFrequency}
                  onValueChange={(value) =>
                    setConfig((prev) => ({
                      ...prev,
                      backupFrequency: value as "daily" | "weekly" | "monthly",
                    }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Retenção de Backup</Label>
                <Select defaultValue="30" disabled={!isEditing}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="365">365 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2">
                <Button variant="outline">Fazer Backup Manual</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backups Recentes</CardTitle>
              <CardDescription>Histórico de backups realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>10/06/2024 02:00</TableCell>
                    <TableCell>Automático</TableCell>
                    <TableCell>1.2 GB</TableCell>
                    <TableCell>
                      <Badge variant="default">Concluído</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Restaurar
                        </Button>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>09/06/2024 02:00</TableCell>
                    <TableCell>Automático</TableCell>
                    <TableCell>1.2 GB</TableCell>
                    <TableCell>
                      <Badge variant="default">Concluído</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Restaurar
                        </Button>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>08/06/2024 02:00</TableCell>
                    <TableCell>Automático</TableCell>
                    <TableCell>1.1 GB</TableCell>
                    <TableCell>
                      <Badge variant="default">Concluído</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Restaurar
                        </Button>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>07/06/2024 15:30</TableCell>
                    <TableCell>Manual</TableCell>
                    <TableCell>1.1 GB</TableCell>
                    <TableCell>
                      <Badge variant="default">Concluído</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Restaurar
                        </Button>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
