"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  Upload,
  Trash2,
  Settings,
  Clock,
  HardDrive,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { backupService, type BackupRecord, type BackupConfig } from "@/lib/services/backup-service"
import { formatDateTime, getRelativeTime } from "@/lib/utils/date-helpers"
import { useToast } from "@/hooks/use-toast"

interface BackupManagementProps {
  hotelId: string
}

export function BackupManagement({ hotelId }: BackupManagementProps) {
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [config, setConfig] = useState<BackupConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadBackupData()
  }, [hotelId])

  const loadBackupData = async () => {
    try {
      setLoading(true)
      const [backupHistory, backupConfig] = await Promise.all([
        backupService.getBackupHistory(hotelId),
        backupService.getBackupConfig(hotelId),
      ])

      setBackups(backupHistory)
      setConfig(
        backupConfig || {
          hotel_id: hotelId,
          backup_frequency: "weekly",
          backup_time: "02:00",
          include_files: true,
          retention_days: 30,
          auto_backup: false,
        },
      )
    } catch (error) {
      console.error("Error loading backup data:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de backup",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    try {
      setCreating(true)
      const backupId = await backupService.createBackup(hotelId, "manual")

      toast({
        title: "Backup iniciado",
        description: "O backup foi iniciado e será processado em segundo plano",
      })

      // Reload backup history
      setTimeout(loadBackupData, 2000)
    } catch (error) {
      console.error("Error creating backup:", error)
      toast({
        title: "Erro",
        description: "Erro ao criar backup",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateConfig = async (updates: Partial<BackupConfig>) => {
    if (!config) return

    try {
      const updatedConfig = { ...config, ...updates }
      await backupService.updateBackupConfig(updatedConfig)
      setConfig(updatedConfig)

      toast({
        title: "Configuração salva",
        description: "As configurações de backup foram atualizadas",
      })
    } catch (error) {
      console.error("Error updating backup config:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    try {
      await backupService.deleteBackup(backupId)
      setBackups((prev) => prev.filter((b) => b.id !== backupId))

      toast({
        title: "Backup excluído",
        description: "O backup foi excluído com sucesso",
      })
    } catch (error) {
      console.error("Error deleting backup:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir backup",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: BackupRecord["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "in_progress":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: BackupRecord["status"]) => {
    switch (status) {
      case "completed":
        return "default"
      case "failed":
        return "destructive"
      case "in_progress":
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Backup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciamento de Backup
          </CardTitle>
          <CardDescription>Crie backups manuais e configure backups automáticos dos seus dados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={handleCreateBackup} disabled={creating}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Criar Backup Manual
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Restaurar Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Configuration */}
      {config && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">Ativar backups automáticos programados</p>
              </div>
              <Switch
                checked={config.auto_backup}
                onCheckedChange={(checked) => handleUpdateConfig({ auto_backup: checked })}
              />
            </div>

            {config.auto_backup && (
              <>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Frequência</Label>
                    <Select
                      value={config.backup_frequency}
                      onValueChange={(value: BackupConfig["backup_frequency"]) =>
                        handleUpdateConfig({ backup_frequency: value })
                      }
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
                    <Label>Horário</Label>
                    <Input
                      type="time"
                      value={config.backup_time}
                      onChange={(e) => handleUpdateConfig({ backup_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Retenção (dias)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={config.retention_days}
                      onChange={(e) => handleUpdateConfig({ retention_days: Number.parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-files"
                      checked={config.include_files}
                      onCheckedChange={(checked) => handleUpdateConfig({ include_files: checked })}
                    />
                    <Label htmlFor="include-files">Incluir arquivos</Label>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Histórico de Backups
          </CardTitle>
          <CardDescription>
            {backups.length} backup{backups.length !== 1 ? "s" : ""} encontrado{backups.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8">
              <HardDrive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Nenhum backup encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(backup.status)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatDateTime(backup.created_at)}</span>
                        <Badge variant={getStatusColor(backup.status)}>
                          {backup.status === "completed" && "Concluído"}
                          {backup.status === "failed" && "Falhou"}
                          {backup.status === "in_progress" && "Em andamento"}
                          {backup.status === "pending" && "Pendente"}
                        </Badge>
                        <Badge variant="outline">{backup.backup_type === "manual" ? "Manual" : "Automático"}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {backup.file_size > 0 && <span>Tamanho: {formatFileSize(backup.file_size)} • </span>}
                        {backup.completed_at ? (
                          <span>Concluído {getRelativeTime(backup.completed_at)}</span>
                        ) : (
                          <span>Criado {getRelativeTime(backup.created_at)}</span>
                        )}
                      </div>
                      {backup.error_message && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          {backup.error_message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {backup.status === "completed" && backup.download_url && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteBackup(backup.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
