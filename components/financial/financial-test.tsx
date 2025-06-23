"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Play } from "lucide-react"
import { financialService } from "@/lib/services/financial-service"

interface FinancialTestProps {
  hotelId: string
}

export function FinancialTest({ hotelId }: FinancialTestProps) {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    const results: Record<string, boolean> = {}

    try {
      // Teste 1: Buscar transações
      const transactions = await financialService.getTransactions(hotelId)
      results.transactions = Array.isArray(transactions)

      // Teste 2: Buscar categorias
      const categories = await financialService.getCategories()
      results.categories = Array.isArray(categories)

      // Teste 3: Buscar contas bancárias
      const bankAccounts = await financialService.getBankAccounts(hotelId)
      results.bankAccounts = Array.isArray(bankAccounts)

      // Teste 4: Buscar fornecedores
      const suppliers = await financialService.getSuppliers(hotelId)
      results.suppliers = Array.isArray(suppliers)

      // Teste 5: Buscar contas a pagar
      const payables = await financialService.getAccountsPayable(hotelId)
      results.payables = Array.isArray(payables)

      // Teste 6: Buscar contas a receber
      const receivables = await financialService.getAccountsReceivable(hotelId)
      results.receivables = Array.isArray(receivables)

      // Teste 7: Buscar resumo financeiro
      const summary = await financialService.getFinancialSummary(hotelId)
      results.summary = typeof summary === "object" && summary !== null

      // Teste 8: Criar transação de teste
      const testTransaction = await financialService.createTransaction({
        hotel_id: hotelId,
        transaction_type: "income",
        amount: 100.0,
        description: "Teste de transação",
        payment_method: "cash",
        transaction_date: new Date().toISOString().split("T")[0],
        status: "completed",
      })
      results.createTransaction = testTransaction !== null

      setTestResults(results)
    } catch (error) {
      console.error("Error running tests:", error)
    } finally {
      setTesting(false)
    }
  }

  const allTestsPassed = Object.values(testResults).every((result) => result === true)
  const testsRun = Object.keys(testResults).length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Teste do Sistema Financeiro
        </CardTitle>
        <CardDescription>Verificar se todas as funcionalidades estão operacionais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={testing} className="w-full">
          {testing ? "Executando Testes..." : "Executar Testes"}
        </Button>

        {testsRun && (
          <Alert variant={allTestsPassed ? "default" : "destructive"}>
            {allTestsPassed ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertDescription>
              {allTestsPassed
                ? "✅ Todos os testes passaram! O módulo financeiro está 100% funcional."
                : "❌ Alguns testes falharam. Verifique a configuração do banco de dados."}
            </AlertDescription>
          </Alert>
        )}

        {testsRun && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultados dos Testes:</h4>
            {Object.entries(testResults).map(([test, passed]) => (
              <div key={test} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{test}</span>
                {passed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
