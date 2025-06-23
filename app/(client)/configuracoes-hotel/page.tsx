"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HotelBasicSettings } from "@/components/hotel-settings/hotel-basic-settings"
import { HotelBrandingSettings } from "@/components/hotel-settings/hotel-branding-settings"
import { HotelIntegrationSettings } from "@/components/hotel-settings/hotel-integration-settings"
import { HotelUserManagement } from "@/components/hotel-settings/hotel-user-management"
import { HotelAdvancedSettings } from "@/components/hotel-settings/hotel-advanced-settings"
import { HotelNotificationSettings } from "@/components/hotel-settings/hotel-notification-settings"
import { Settings, Palette, Link, Users, Cog, Bell } from "lucide-react"

export default function ConfiguracoesHotelPage() {
  const [activeTab, setActiveTab] = useState("basic")

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Hotel</h1>
        <p className="text-muted-foreground">Gerencie as configurações, personalizações e integrações do seu hotel</p>
      </div>

      {/* Tabs de Configurações */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Básico</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Visual</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            <span className="hidden sm:inline">Avançado</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <HotelBasicSettings />
        </TabsContent>

        <TabsContent value="branding">
          <HotelBrandingSettings />
        </TabsContent>

        <TabsContent value="integrations">
          <HotelIntegrationSettings />
        </TabsContent>

        <TabsContent value="users">
          <HotelUserManagement />
        </TabsContent>

        <TabsContent value="notifications">
          <HotelNotificationSettings />
        </TabsContent>

        <TabsContent value="advanced">
          <HotelAdvancedSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
