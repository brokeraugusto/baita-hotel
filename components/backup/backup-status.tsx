"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Download, Shield, Clock, CheckCircle, AlertTriangle, Settings } from "lucide-react"

interface BackupStatusProps {
  hotelId: string
}

export function BackupStatus({ hotelId }: BackupStatusProps) {
  const [backupConfig, setBackupConfig] = useState({
    autoBackup: true,
    frequency: "weekly",
    lastBackup: "2024-01-13T02:00:00Z",
    nextBackup: "2024-01-20T02:00:00Z",
    status: "healthy",
  })

  const [recentBackups] = useState([
    {
      id: "1",
      date: "2024-01-13T02:00:00Z",
      type: "automatic",
      status: "completed",
      size: "2.4 GB",
    },
    {
      id: "2",
      date: "2024-01-06T02:00:00Z",
      type: "automatic",
      status: "completed",
      size: "2.3 GB",
    },
    {
      id: "3",
      date: "2024-01-01T14:30:00Z",
      type: "manual",
      status: "completed",
      size: "2.5 GB",
    },
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysUntilNext = () => {
    const nextBackup = new Date(backupConfig.nextBackup)
    const now = new Date()
    const diffTime = nextBackup.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-lg font-semibold text-green-600">Seguro</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Todos os sistemas funcionando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">2 dias atrás</div>
            <p className="text-xs text-muted-foreground">{formatDate(backupConfig.lastBackup)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Backup</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{getDaysUntilNext()} dias</div>
            <p className="text-xs text-muted-foreground">{formatDate(backupConfig.nextBackup)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Backup Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Backup
          </CardTitle>
          <CardDescription>Configure backups automáticos e políticas de retenção</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Backup Automático</Label>
              <p className="text-sm text-muted-foreground">Ativar backups automáticos programados</p>
            </div>
            <Switch
              checked={backupConfig.autoBackup}
              onCheckedChange={(checked) => setBackupConfig((prev) => ({ ...prev, autoBackup: checked }))}
            />
          </div>

          {backupConfig.autoBackup && (
            <div className="space-y-4 pl-4 border-l-2 border-blue-200">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Frequência</Label>
                  <p className="text-sm text-muted-foreground">Semanal (Domingos às 02:00)</p>
                </div>
                <div>
                  <Label>Retenção</Label>
                  <p className="text-sm text-muted-foreground">30 dias</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Criar Backup Manual
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configurações Avançadas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
          <CardDescription>Últimos backups realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBackups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(backup.status)}
                  <div>
                    <div className="font-medium">{formatDate(backup.date)}</div>
                    <div className="text-sm text-muted-foreground">
                      {backup.type === "automatic" ? "Automático" : "Manual"} • {backup.size}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(backup.status)}>
                    {backup.status === "completed" ? "Concluído" : backup.status}
                  </Badge>
                  {backup.status === "completed" && (
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
