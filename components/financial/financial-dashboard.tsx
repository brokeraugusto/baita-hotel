"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Calendar,
  AlertTriangle,
  Info,
  RefreshCw,
} from "lucide-react"
import { financialService, type FinancialSummary, type FinancialTransaction } from "@/lib/services/financial-service"

interface FinancialDashboardProps {
  hotelId: string
}

export function FinancialDashboard({ hotelId }: FinancialDashboardProps) {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<FinancialTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("month")

  useEffect(() => {
    loadData()
  }, [hotelId, period])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [summaryData, transactionsData] = await Promise.all([
        financialService.getFinancialSummary(hotelId),
        financialService.getTransactions(hotelId),
      ])

      setSummary(summaryData)
      setRecentTransactions(transactionsData.slice(0, 5))
    } catch (error) {
      console.error("Error loading financial dashboard:", error)
      setError("Erro ao carregar dados financeiros")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando dashboard financeiro...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Período */}
      <div className="flex items-center justify-between">
        <Tabs value={period} onValueChange={setPeriod} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="week">Esta Semana</TabsTrigger>
            <TabsTrigger value="month">Este Mês</TabsTrigger>
            <TabsTrigger value="quarter">Este Trimestre</TabsTrigger>
            <TabsTrigger value="year">Este Ano</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary?.totalIncome || 0)}</div>
            <p className="text-xs text-muted-foreground">Total de entradas no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary?.totalExpenses || 0)}</div>
            <p className="text-xs text-muted-foreground">Total de saídas no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultado</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.netIncome || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(summary?.netIncome || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo em Contas</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary?.bankAccountsTotal || 0)}</div>
            <p className="text-xs text-muted-foreground">Total disponível em contas bancárias</p>
          </CardContent>
        </Card>
      </div>

      {/* Contas a Pagar e Receber */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary?.accountsPayableTotal || 0)}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Em atraso</span>
                <span className="font-medium text-red-600">{formatCurrency(summary?.overduePayables || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Próximos 7 dias</span>
                <span className="font-medium">{formatCurrency(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary?.accountsReceivableTotal || 0)}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Em atraso</span>
                <span className="font-medium text-red-600">{formatCurrency(summary?.overdueReceivables || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Próximos 7 dias</span>
                <span className="font-medium">{formatCurrency(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas movimentações financeiras</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Nenhuma transação encontrada. Clique em "Nova Transação" para registrar a primeira movimentação
                financeira.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.transaction_date)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.transaction_type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.transaction_type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.payment_method ? getPaymentMethodLabel(transaction.payment_method) : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function getPaymentMethodLabel(method: string): string {
  const methods: Record<string, string> = {
    credit_card: "Cartão de Crédito",
    debit_card: "Cartão de Débito",
    pix: "PIX",
    cash: "Dinheiro",
    bank_transfer: "Transferência",
    check: "Cheque",
  }
  return methods[method] || method
}
