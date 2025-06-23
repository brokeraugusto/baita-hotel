import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export function PlatformSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
        <CardDescription>Configurações básicas da plataforma</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="platform-name">Nome da Plataforma</Label>
            <Input id="platform-name" defaultValue="BaitaHotel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform-version">Versão</Label>
            <Input id="platform-version" defaultValue="2.1.0" disabled />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform-description">Descrição</Label>
          <Textarea id="platform-description" defaultValue="Sistema completo de gestão hoteleira" rows={3} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo de Manutenção</Label>
              <p className="text-sm text-muted-foreground">Ativar modo de manutenção para todos os clientes</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Novos Cadastros</Label>
              <p className="text-sm text-muted-foreground">Permitir novos cadastros de clientes</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">Enviar notificações automáticas por email</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Salvar Configurações</Button>
        </div>
      </CardContent>
    </Card>
  )
}
