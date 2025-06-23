"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react"
import { financialService, type FinancialTransaction } from "@/lib/services/financial-service"

interface TransactionsListProps {
  hotelId: string
  onCreateTransaction?: () => void
}

export function TransactionsList({ hotelId, onCreateTransaction }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await financialService.getTransactions(hotelId)
        setTransactions(data)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [hotelId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getPaymentMethodLabel = (method?: string) => {
    const methods: Record<string, string> = {
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      pix: "PIX",
      cash: "Dinheiro",
      bank_transfer: "Transferência",
      check: "Cheque",
    }
    return method ? methods[method] || method : "-"
  }

  const getStatusLabel = (status?: string) => {
    if (!status) return "-"

    const statuses: Record<string, string> = {
      completed: "Concluído",
      pending: "Pendente",
      cancelled: "Cancelado",
      failed: "Falhou",
    }
    return statuses[status] || status
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando transações...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transações Financeiras</h2>
          <p className="text-muted-foreground">Histórico completo de movimentações</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          {onCreateTransaction && (
            <Button onClick={onCreateTransaction}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
          <CardDescription>Movimentações financeiras recentes</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
              {onCreateTransaction && (
                <Button className="mt-4" onClick={onCreateTransaction}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeira transação
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate" title={transaction.description}>
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.transaction_type === "income" ? "default" : "secondary"}>
                          {transaction.transaction_type === "income" ? (
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-3 w-3" />
                          )}
                          {transaction.transaction_type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPaymentMethodLabel(transaction.payment_method)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : transaction.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.transaction_type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.transaction_type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
