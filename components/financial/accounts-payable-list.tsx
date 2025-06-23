"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, CreditCard, AlertTriangle, Calendar, Info } from "lucide-react"
import { financialService, type AccountPayable } from "@/lib/services/financial-service"

interface AccountsPayableListProps {
  hotelId: string
}

export function AccountsPayableList({ hotelId }: AccountsPayableListProps) {
  const [accounts, setAccounts] = useState<AccountPayable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAccounts()
  }, [hotelId])

  const loadAccounts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await financialService.getAccountsPayable(hotelId)
      setAccounts(data)
    } catch (error) {
      console.error("Error loading accounts payable:", error)
      setError("Erro ao carregar contas a pagar")
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

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === "pending"

    if (isOverdue) {
      return <Badge variant="destructive">Em Atraso</Badge>
    }

    const variants: Record<string, any> = {
      pending: "secondary",
      paid: "default",
      cancelled: "outline",
    }

    const labels: Record<string, string> = {
      pending: "Pendente",
      paid: "Pago",
      cancelled: "Cancelado",
    }

    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const totalPending = accounts.filter((a) => a.status === "pending").reduce((sum, a) => sum + a.amount, 0)
  const overdue = accounts.filter((a) => a.status === "pending" && new Date(a.due_date) < new Date())
  const totalOverdue = overdue.reduce((sum, a) => sum + a.amount, 0)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando contas a pagar...</div>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contas a Pagar</h2>
          <p className="text-muted-foreground">Gestão de pagamentos pendentes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Total Pendente</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Em Atraso</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total de Contas</p>
                <p className="text-lg font-bold text-blue-600">{accounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contas Pendentes</CardTitle>
          <CardDescription>Lista de contas aguardando pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma conta a pagar encontrada. As contas a pagar são criadas automaticamente quando você registra
                  despesas com fornecedores ou quando ordens de manutenção são concluídas.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => {
                const daysUntilDue = getDaysUntilDue(account.due_date)
                const isOverdue = daysUntilDue < 0 && account.status === "pending"
                const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0 && account.status === "pending"

                return (
                  <div
                    key={account.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      isOverdue ? "border-red-200 bg-red-50" : isDueSoon ? "border-yellow-200 bg-yellow-50" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {isDueSoon && <Calendar className="h-4 w-4 text-yellow-500" />}
                        <h4 className="font-medium">{account.description}</h4>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Vencimento: {formatDate(account.due_date)}</p>
                        {account.supplier && <p>Fornecedor: {account.supplier.name}</p>}
                        {account.invoice_number && <p>Fatura: {account.invoice_number}</p>}
                        {account.status === "pending" && (
                          <p
                            className={`font-medium ${
                              isOverdue ? "text-red-600" : isDueSoon ? "text-yellow-600" : "text-muted-foreground"
                            }`}
                          >
                            {isOverdue
                              ? `${Math.abs(daysUntilDue)} dias em atraso`
                              : isDueSoon
                                ? `Vence em ${daysUntilDue} dias`
                                : `${daysUntilDue} dias para vencimento`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-red-600 text-lg">{formatCurrency(account.amount)}</p>
                      {getStatusBadge(account.status, account.due_date)}
                      {account.status === "pending" && (
                        <div>
                          <Button size="sm" variant="outline">
                            Registrar Pagamento
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
