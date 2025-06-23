import { HotelBasicSettings } from "@/components/hotel-settings/hotel-basic-settings"
import { HotelBrandingSettings } from "@/components/hotel-settings/hotel-branding-settings"
import { HotelIntegrationSettings } from "@/components/hotel-settings/hotel-integration-settings"
import { HotelUserManagement } from "@/components/hotel-settings/hotel-user-management"
import { HotelNotificationSettings } from "@/components/hotel-settings/hotel-notification-settings"
import { HotelAdvancedSettings } from "@/components/hotel-settings/hotel-advanced-settings"
import { EmailTemplatesSettings } from "@/components/hotel-settings/email-templates-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConfiguracoesHotelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Hotel</h1>
        <p className="text-muted-foreground">Gerencie as configurações específicas do seu hotel</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="branding">Visual</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="email-templates">E-mail</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <HotelBasicSettings />
        </TabsContent>

        <TabsContent value="branding">
          <HotelBrandingSettings />
        </TabsContent>

        <TabsContent value="users">
          <HotelUserManagement />
        </TabsContent>

        <TabsContent value="notifications">
          <HotelNotificationSettings />
        </TabsContent>

        <TabsContent value="email-templates">
          <EmailTemplatesSettings />
        </TabsContent>

        <TabsContent value="integrations">
          <HotelIntegrationSettings />
        </TabsContent>

        <TabsContent value="advanced">
          <HotelAdvancedSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
