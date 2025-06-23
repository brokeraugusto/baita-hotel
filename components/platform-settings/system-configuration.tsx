import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SystemConfiguration() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Sistema</CardTitle>
        <CardDescription>Parâmetros técnicos da plataforma</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="max-clients">Máximo de Clientes</Label>
          <Input id="max-clients" type="number" defaultValue="1000" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
          <Input id="session-timeout" type="number" defaultValue="60" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="backup-frequency">Frequência de Backup</Label>
          <Select defaultValue="daily">
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
          <Label htmlFor="log-level">Nível de Log</Label>
          <Select defaultValue="info">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debug">Debug</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full">Aplicar Configurações</Button>
      </CardContent>
    </Card>
  )
}
