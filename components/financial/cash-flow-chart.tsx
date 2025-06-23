"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Calendar, Info } from "lucide-react"
import { financialService, type CashFlowData } from "@/lib/services/financial-service"

interface CashFlowChartProps {
  hotelId: string
}

export function CashFlowChart({ hotelId }: CashFlowChartProps) {
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCashFlow = async () => {
      try {
        const data = await financialService.getCashFlow(hotelId, 30)
        setCashFlowData(data)
      } catch (error) {
        console.error("Error fetching cash flow:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCashFlow()
  }, [hotelId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const totalIncome = cashFlowData.reduce((sum, day) => sum + day.income, 0)
  const totalExpenses = cashFlowData.reduce((sum, day) => sum + day.expenses, 0)
  const currentBalance = cashFlowData.length > 0 ? cashFlowData[cashFlowData.length - 1].balance : 0

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando fluxo de caixa...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fluxo de Caixa</h2>
          <p className="text-muted-foreground">Análise do movimento financeiro dos últimos 30 dias</p>
        </div>
      </div>

      {/* Resumo do Fluxo de Caixa */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Saldo acumulado</p>
          </CardContent>
        </Card>
      </div>

      {/* Dados Diários */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentação Diária</CardTitle>
          <CardDescription>Entradas e saídas por dia</CardDescription>
        </CardHeader>
        <CardContent>
          {cashFlowData.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Nenhuma movimentação encontrada nos últimos 30 dias. Registre transações para visualizar o fluxo de
                caixa.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {cashFlowData
                .filter((day) => day.income > 0 || day.expenses > 0)
                .slice(-10)
                .map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString("pt-BR")}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("pt-BR", { weekday: "long" })}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-4">
                        <span className="text-green-600 font-medium">+{formatCurrency(day.income)}</span>
                        <span className="text-red-600 font-medium">-{formatCurrency(day.expenses)}</span>
                      </div>
                      <p className="text-sm font-bold">{formatCurrency(day.balance)}</p>
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
