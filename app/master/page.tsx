"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardMetrics } from "@/components/master/dashboard-metrics"
import { ClientsTableWithScroll } from "@/components/master/clients-table-with-scroll"
import { PlansTableWithScroll } from "@/components/master/plans-table-with-scroll"
import { PaymentsTableWithScroll } from "@/components/master/payments-table-with-scroll"
import { SupportTicketsTableWithScroll } from "@/components/master/support-tickets-table-with-scroll"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function MasterAdminPage() {
  const [showAlert, setShowAlert] = useState(true)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Admin</h1>
          <p className="text-muted-foreground">Painel de administração da plataforma Baita Hotel</p>
        </div>
      </div>

      {showAlert && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Modo de demonstração</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              As tabelas do banco de dados ainda não foram criadas. Execute os scripts SQL para criar as tabelas e
              visualizar dados reais.
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowAlert(false)}>
              Fechar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <DashboardMetrics />

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="support">Suporte</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <ClientsTableWithScroll />
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <PlansTableWithScroll />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentsTableWithScroll />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <SupportTicketsTableWithScroll />
        </TabsContent>
      </Tabs>
    </div>
  )
}
