import { PlatformSettings } from "@/components/platform-settings/platform-settings"
import { SystemConfiguration } from "@/components/platform-settings/system-configuration"
import { SecuritySettings } from "@/components/platform-settings/security-settings"
import { IntegrationSettings } from "@/components/platform-settings/integration-settings"

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações da Plataforma</h1>
        <p className="text-muted-foreground">Gerencie configurações globais do sistema BaitaHotel</p>
      </div>

      <div className="grid gap-6">
        <PlatformSettings />
        <div className="grid gap-6 md:grid-cols-2">
          <SystemConfiguration />
          <SecuritySettings />
        </div>
        <IntegrationSettings />
      </div>
    </div>
  )
}
