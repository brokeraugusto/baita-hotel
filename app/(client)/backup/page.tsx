import { BackupManagement } from "@/components/backup/backup-management"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Database, Clock, AlertTriangle } from "lucide-react"

export default function BackupPage() {
  const hotelId = "sample-hotel-id" // This would come from auth context

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup & Segurança</h1>
          <p className="text-muted-foreground">Gerencie backups e mantenha seus dados seguros</p>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 dias atrás</div>
            <p className="text-xs text-muted-foreground">Backup automático concluído</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 dias</div>
            <p className="text-xs text-muted-foreground">Backup semanal programado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status de Segurança</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Seguro</div>
            <p className="text-xs text-muted-foreground">Todos os sistemas funcionando</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Recomendações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700">
          <ul className="space-y-2 text-sm">
            <li>• Configure backups automáticos para garantir proteção contínua</li>
            <li>• Teste a restauração de backups regularmente</li>
            <li>• Mantenha pelo menos 3 backups de diferentes períodos</li>
            <li>• Configure notificações para falhas de backup</li>
          </ul>
        </CardContent>
      </Card>

      {/* Backup Management Component */}
      <BackupManagement hotelId={hotelId} />
    </div>
  )
}
