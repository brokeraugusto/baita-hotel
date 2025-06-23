import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SecuritySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Segurança</CardTitle>
        <CardDescription>Políticas de segurança da plataforma</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password-min-length">Tamanho Mínimo da Senha</Label>
          <Input id="password-min-length" type="number" defaultValue="8" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-login-attempts">Máximo de Tentativas de Login</Label>
          <Input id="max-login-attempts" type="number" defaultValue="5" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Autenticação 2FA</Label>
              <p className="text-sm text-muted-foreground">Exigir autenticação de dois fatores</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Força da Senha</Label>
              <p className="text-sm text-muted-foreground">Exigir senhas complexas</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Log de Auditoria</Label>
              <p className="text-sm text-muted-foreground">Registrar todas as ações dos usuários</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <Button className="w-full">Salvar Segurança</Button>
      </CardContent>
    </Card>
  )
}
