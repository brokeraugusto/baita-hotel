"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Settings, Database, RefreshCw, TestTube } from "lucide-react"

import { FinancialDashboard } from "@/components/financial/financial-dashboard"
import { TransactionsList } from "@/components/financial/transactions-list"
import { AccountsPayableList } from "@/components/financial/accounts-payable-list"
import { AccountsReceivableList } from "@/components/financial/accounts-receivable-list"
import { CashFlowChart } from "@/components/financial/cash-flow-chart"
import { FinancialReports } from "@/components/financial/financial-reports"
import { CreateTransactionDialog } from "@/components/financial/create-transaction-dialog"
import { FinancialSettingsDialog } from "@/components/financial/financial-settings-dialog"
import { FinancialTest } from "@/components/financial/financial-test"

// ID fixo do hotel para demonstração
const HOTEL_ID = "550e8400-e29b-41d4-a716-446655440000"

export default function FinanceiroHotelPage() {
  const [createTransactionOpen, setCreateTransactionOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTransactionSuccess = () => {
    // Força refresh dos componentes
    setRefreshKey((prev) => prev + 1)
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão Financeira</h1>
          <p className="text-muted-foreground">Controle completo das finanças do hotel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={() => setCreateTransactionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Status do Sistema */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema Financeiro Operacional:</strong> Todas as tabelas foram criadas e o RLS foi desabilitado. O
          módulo está pronto para uso com dados de exemplo já inseridos.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="test">
            <TestTube className="mr-1 h-3 w-3" />
            Teste
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FinancialDashboard key={`dashboard-${refreshKey}`} hotelId={HOTEL_ID} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsList
            key={`transactions-${refreshKey}`}
            hotelId={HOTEL_ID}
            onCreateTransaction={() => setCreateTransactionOpen(true)}
          />
        </TabsContent>

        <TabsContent value="payable">
          <AccountsPayableList key={`payable-${refreshKey}`} hotelId={HOTEL_ID} />
        </TabsContent>

        <TabsContent value="receivable">
          <AccountsReceivableList key={`receivable-${refreshKey}`} hotelId={HOTEL_ID} />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowChart key={`cashflow-${refreshKey}`} hotelId={HOTEL_ID} />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReports key={`reports-${refreshKey}`} hotelId={HOTEL_ID} />
        </TabsContent>

        <TabsContent value="test">
          <FinancialTest hotelId={HOTEL_ID} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateTransactionDialog
        open={createTransactionOpen}
        onOpenChange={setCreateTransactionOpen}
        hotelId={HOTEL_ID}
        onSuccess={handleTransactionSuccess}
      />

      <FinancialSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} hotelId={HOTEL_ID} />
    </div>
  )
}
