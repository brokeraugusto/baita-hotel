"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Calendar, TrendingUp, Info } from "lucide-react"
import { financialService, type FinancialTransaction, type FinancialSummary } from "@/lib/services/financial-service"

interface FinancialReportsProps {
  hotelId: string
}

export function FinancialReports({ hotelId }: FinancialReportsProps) {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState("summary")
  const [period, setPeriod] = useState("month")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsData, summaryData] = await Promise.all([
          financialService.getTransactions(hotelId),
          financialService.getFinancialSummary(hotelId),
        ])
        setTransactions(transactionsData)
        setSummary(summaryData)
      } catch (error) {
        console.error("Error fetching reports data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [hotelId, period])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const generateReport = () => {
    // Placeholder para geração de relatório
    alert("Funcionalidade de geração de relatório será implementada")
  }

  const exportData = () => {
    // Placeholder para exportação
    alert("Funcionalidade de exportação será implementada")
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando relatórios...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Financeiros</h2>
          <p className="text-muted-foreground">Análises e relatórios detalhados</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={generateReport}>
            <FileText className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo de Relatório" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summary">Resumo Financeiro</SelectItem>
            <SelectItem value="transactions">Relatório de Transações</SelectItem>
            <SelectItem value="cashflow">Fluxo de Caixa</SelectItem>
            <SelectItem value="categories">Por Categorias</SelectItem>
          </SelectContent>
        </Select>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="quarter">Este Trimestre</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo Executivo
          </CardTitle>
          <CardDescription>Principais indicadores financeiros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary?.totalIncome || 0)}</div>
              <div className="text-sm text-green-600">Receitas Totais</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(summary?.totalExpenses || 0)}</div>
              <div className="text-sm text-red-600">Despesas Totais</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div
                className={`text-2xl font-bold ${(summary?.netIncome || 0) >= 0 ? "text-blue-600" : "text-red-600"}`}
              >
                {formatCurrency(summary?.netIncome || 0)}
              </div>
              <div className="text-sm text-blue-600">Resultado Líquido</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{transactions.length}</div>
              <div className="text-sm text-purple-600">Total de Transações</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise por Tipo de Transação */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Tipo</CardTitle>
          <CardDescription>Distribuição de receitas e despesas</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Nenhuma transação encontrada para análise. Registre transações para visualizar relatórios detalhados.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Receitas por Método de Pagamento</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      transactions
                        .filter((t) => t.transaction_type === "income")
                        .reduce(
                          (acc, t) => {
                            const method = t.payment_method || "Não informado"
                            acc[method] = (acc[method] || 0) + t.amount
                            return acc
                          },
                          {} as Record<string, number>,
                        ),
                    ).map(([method, amount]) => (
                      <div key={method} className="flex justify-between">
                        <span className="text-sm">{method}</span>
                        <span className="font-medium text-green-600">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-red-600 mb-2">Despesas por Método de Pagamento</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      transactions
                        .filter((t) => t.transaction_type === "expense")
                        .reduce(
                          (acc, t) => {
                            const method = t.payment_method || "Não informado"
                            acc[method] = (acc[method] || 0) + t.amount
                            return acc
                          },
                          {} as Record<string, number>,
                        ),
                    ).map(([method, amount]) => (
                      <div key={method} className="flex justify-between">
                        <span className="text-sm">{method}</span>
                        <span className="font-medium text-red-600">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tendências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tendências e Projeções
          </CardTitle>
          <CardDescription>Análise de tendências baseada no histórico</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              As análises de tendências e projeções serão implementadas com base no acúmulo de dados históricos.
              Continue registrando transações para obter insights mais precisos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
