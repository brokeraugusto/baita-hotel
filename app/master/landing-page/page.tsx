import { LandingPageManager } from "@/components/master/landing-page-manager"

export default function LandingPageManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento da Landing Page</h1>
        <p className="text-muted-foreground">
          Personalize o conteúdo da página inicial do BaitaHotel para atrair mais clientes
        </p>
      </div>

      <LandingPageManager />
    </div>
  )
}
