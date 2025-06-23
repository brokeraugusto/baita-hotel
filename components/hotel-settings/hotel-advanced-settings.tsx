"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Cog,
  Database,
  Shield,
  Palette,
  HardDrive,
  Server,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
} from "lucide-react"

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  activeConnections: number
  uptime: string
}

export function HotelAdvancedSettings() {
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    compressionEnabled: true,
    logLevel: "info",
    sessionTimeout: 30,
    maxFileSize: 10,
    allowedFileTypes: "jpg,jpeg,png,pdf,doc,docx",
  })

  const [databaseSettings, setDatabaseSettings] = useState({
    maxConnections: 100,
    connectionTimeout: 30,
    queryTimeout: 60,
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: 30,
  })

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    twoFactorAuth: false,
    sessionSecurity: "high",
    ipWhitelist: "",
    auditLog: true,
    loginAttempts: 5,
    lockoutDuration: 15,
  })

  const [customizationSettings, setCustomizationSettings] = useState({
    customTheme: false,
    customCss: "",
    customJs: "",
    dashboardLayout: "default",
    defaultPageSize: 25,
    dateFormat: "dd/MM/yyyy",
    timeFormat: "24h",
    currency: "BRL",
  })

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    backupTime: "02:00",
    includeFiles: true,
    compression: true,
    encryption: true,
    cloudStorage: false,
    cloudProvider: "aws",
    retentionDays: 30,
  })

  const [metrics] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    activeConnections: 23,
    uptime: "15 dias, 8 horas",
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Configurações salvas",
        description: "As configurações avançadas foram atualizadas com sucesso.",
      })
    }, 1000)
  }

  const handleBackup = async () => {
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Backup iniciado",
        description: "O backup do sistema foi iniciado e será processado em segundo plano.",
      })
    }, 2000)
  }

  const handleRestore = () => {
    toast({
      title: "Restauração de backup",
      description: "Funcionalidade em desenvolvimento. Entre em contato com o suporte.",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      {/* Métricas do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
          <CardDescription>Monitoramento em tempo real do desempenho</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU</span>
                <span>{metrics.cpuUsage}%</span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memória</span>
                <span>{metrics.memoryUsage}%</span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Disco</span>
                <span>{metrics.diskUsage}%</span>
              </div>
              <Progress value={metrics.diskUsage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <div>Conexões: {metrics.activeConnections}</div>
                <div>Uptime: {metrics.uptime}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog className="h-5 w-5" />
            Sistema
          </CardTitle>
          <CardDescription>Configurações gerais de funcionamento do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo Manutenção</Label>
                  <p className="text-sm text-muted-foreground">Bloqueia acesso ao sistema</p>
                </div>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo Debug</Label>
                  <p className="text-sm text-muted-foreground">Exibe informações de debug</p>
                </div>
                <Switch
                  checked={systemSettings.debugMode}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, debugMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Cache Habilitado</Label>
                  <p className="text-sm text-muted-foreground">Melhora performance</p>
                </div>
                <Switch
                  checked={systemSettings.cacheEnabled}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, cacheEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Compressão</Label>
                  <p className="text-sm text-muted-foreground">Reduz uso de banda</p>
                </div>
                <Switch
                  checked={systemSettings.compressionEnabled}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, compressionEnabled: checked })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nível de Log</Label>
                <Select
                  value={systemSettings.logLevel}
                  onValueChange={(value) => setSystemSettings({ ...systemSettings, logLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timeout de Sessão (minutos)</Label>
                <Input
                  type="number"
                  value={systemSettings.sessionTimeout}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      sessionTimeout: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tamanho Máximo de Arquivo (MB)</Label>
                <Input
                  type="number"
                  value={systemSettings.maxFileSize}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      maxFileSize: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tipos de Arquivo Permitidos</Label>
                <Input
                  value={systemSettings.allowedFileTypes}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      allowedFileTypes: e.target.value,
                    })
                  }
                  placeholder="jpg,png,pdf,doc"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Banco de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Banco de Dados
          </CardTitle>
          <CardDescription>Configurações de performance e backup do banco</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Máximo de Conexões</Label>
              <Input
                type="number"
                value={databaseSettings.maxConnections}
                onChange={(e) =>
                  setDatabaseSettings({
                    ...databaseSettings,
                    maxConnections: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Timeout de Conexão (s)</Label>
              <Input
                type="number"
                value={databaseSettings.connectionTimeout}
                onChange={(e) =>
                  setDatabaseSettings({
                    ...databaseSettings,
                    connectionTimeout: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Timeout de Query (s)</Label>
              <Input
                type="number"
                value={databaseSettings.queryTimeout}
                onChange={(e) =>
                  setDatabaseSettings({
                    ...databaseSettings,
                    queryTimeout: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">Backup diário</p>
              </div>
              <Switch
                checked={databaseSettings.autoBackup}
                onCheckedChange={(checked) => setDatabaseSettings({ ...databaseSettings, autoBackup: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select
                value={databaseSettings.backupFrequency}
                onValueChange={(value) => setDatabaseSettings({ ...databaseSettings, backupFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Retenção (dias)</Label>
              <Input
                type="number"
                value={databaseSettings.retentionDays}
                onChange={(e) =>
                  setDatabaseSettings({
                    ...databaseSettings,
                    retentionDays: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>Políticas de segurança e autenticação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Políticas de Senha</h4>

              <div className="space-y-2">
                <Label>Comprimento Mínimo</Label>
                <Input
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      passwordMinLength: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Caracteres Especiais</Label>
                  <Switch
                    checked={securitySettings.passwordRequireSpecial}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, passwordRequireSpecial: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Números Obrigatórios</Label>
                  <Switch
                    checked={securitySettings.passwordRequireNumbers}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, passwordRequireNumbers: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Maiúsculas Obrigatórias</Label>
                  <Switch
                    checked={securitySettings.passwordRequireUppercase}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, passwordRequireUppercase: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Autenticação</h4>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticação 2FA</Label>
                  <p className="text-sm text-muted-foreground">Dois fatores</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Nível de Segurança da Sessão</Label>
                <Select
                  value={securitySettings.sessionSecurity}
                  onValueChange={(value) => setSecuritySettings({ ...securitySettings, sessionSecurity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tentativas de Login</Label>
                <Input
                  type="number"
                  value={securitySettings.loginAttempts}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      loginAttempts: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Duração do Bloqueio (min)</Label>
                <Input
                  type="number"
                  value={securitySettings.lockoutDuration}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      lockoutDuration: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lista de IPs Permitidos</Label>
            <Textarea
              value={securitySettings.ipWhitelist}
              onChange={(e) =>
                setSecuritySettings({
                  ...securitySettings,
                  ipWhitelist: e.target.value,
                })
              }
              placeholder="192.168.1.1&#10;10.0.0.1&#10;..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Log de Auditoria</Label>
              <p className="text-sm text-muted-foreground">Registra todas as ações</p>
            </div>
            <Switch
              checked={securitySettings.auditLog}
              onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, auditLog: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Personalização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalização
          </CardTitle>
          <CardDescription>Customizações da interface e comportamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Tema Personalizado</Label>
                  <p className="text-sm text-muted-foreground">CSS customizado</p>
                </div>
                <Switch
                  checked={customizationSettings.customTheme}
                  onCheckedChange={(checked) =>
                    setCustomizationSettings({ ...customizationSettings, customTheme: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Layout do Dashboard</Label>
                <Select
                  value={customizationSettings.dashboardLayout}
                  onValueChange={(value) =>
                    setCustomizationSettings({ ...customizationSettings, dashboardLayout: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="compact">Compacto</SelectItem>
                    <SelectItem value="expanded">Expandido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Itens por Página</Label>
                <Select
                  value={customizationSettings.defaultPageSize.toString()}
                  onValueChange={(value) =>
                    setCustomizationSettings({
                      ...customizationSettings,
                      defaultPageSize: Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Formato de Data</Label>
                <Select
                  value={customizationSettings.dateFormat}
                  onValueChange={(value) => setCustomizationSettings({ ...customizationSettings, dateFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                    <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Formato de Hora</Label>
                <Select
                  value={customizationSettings.timeFormat}
                  onValueChange={(value) => setCustomizationSettings({ ...customizationSettings, timeFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Moeda Padrão</Label>
                <Select
                  value={customizationSettings.currency}
                  onValueChange={(value) => setCustomizationSettings({ ...customizationSettings, currency: value })}
                >
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
            </div>
          </div>

          {customizationSettings.customTheme && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>CSS Personalizado</Label>
                <Textarea
                  value={customizationSettings.customCss}
                  onChange={(e) =>
                    setCustomizationSettings({
                      ...customizationSettings,
                      customCss: e.target.value,
                    })
                  }
                  placeholder="/* Seu CSS personalizado aqui */"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>JavaScript Personalizado</Label>
                <Textarea
                  value={customizationSettings.customJs}
                  onChange={(e) =>
                    setCustomizationSettings({
                      ...customizationSettings,
                      customJs: e.target.value,
                    })
                  }
                  placeholder="// Seu JavaScript personalizado aqui"
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup e Restauração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup e Restauração
          </CardTitle>
          <CardDescription>Configurações de backup automático e restauração</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">Backup programado</p>
                </div>
                <Switch
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) => setBackupSettings({ ...backupSettings, autoBackup: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select
                  value={backupSettings.backupFrequency}
                  onValueChange={(value) => setBackupSettings({ ...backupSettings, backupFrequency: value })}
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
                <Label>Horário do Backup</Label>
                <Input
                  type="time"
                  value={backupSettings.backupTime}
                  onChange={(e) =>
                    setBackupSettings({
                      ...backupSettings,
                      backupTime: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Retenção (dias)</Label>
                <Input
                  type="number"
                  value={backupSettings.retentionDays}
                  onChange={(e) =>
                    setBackupSettings({
                      ...backupSettings,
                      retentionDays: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Incluir Arquivos</Label>
                  <Switch
                    checked={backupSettings.includeFiles}
                    onCheckedChange={(checked) => setBackupSettings({ ...backupSettings, includeFiles: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Compressão</Label>
                  <Switch
                    checked={backupSettings.compression}
                    onCheckedChange={(checked) => setBackupSettings({ ...backupSettings, compression: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Criptografia</Label>
                  <Switch
                    checked={backupSettings.encryption}
                    onCheckedChange={(checked) => setBackupSettings({ ...backupSettings, encryption: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Armazenamento na Nuvem</Label>
                  <Switch
                    checked={backupSettings.cloudStorage}
                    onCheckedChange={(checked) => setBackupSettings({ ...backupSettings, cloudStorage: checked })}
                  />
                </div>
              </div>

              {backupSettings.cloudStorage && (
                <div className="space-y-2">
                  <Label>Provedor de Nuvem</Label>
                  <Select
                    value={backupSettings.cloudProvider}
                    onValueChange={(value) => setBackupSettings({ ...backupSettings, cloudProvider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">Amazon S3</SelectItem>
                      <SelectItem value="google">Google Cloud</SelectItem>
                      <SelectItem value="azure">Microsoft Azure</SelectItem>
                      <SelectItem value="dropbox">Dropbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex gap-4">
              <Button onClick={handleBackup} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                {isLoading ? "Criando Backup..." : "Criar Backup Agora"}
              </Button>
              <Button variant="outline" onClick={handleRestore}>
                <Upload className="mr-2 h-4 w-4" />
                Restaurar Backup
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Últimos Backups</Label>
            <div className="space-y-2">
              {[
                { date: "2024-01-15 02:00", size: "245 MB", status: "success" },
                { date: "2024-01-14 02:00", size: "243 MB", status: "success" },
                { date: "2024-01-13 02:00", size: "241 MB", status: "success" },
                { date: "2024-01-12 02:00", size: "238 MB", status: "error" },
              ].map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {backup.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{backup.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{backup.size}</span>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Resetar Configurações
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  )
}
