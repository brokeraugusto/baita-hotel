"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Eye, Edit, Trash, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { subscriptionsService, type Subscription } from "@/lib/services/subscriptions-service"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SubscriptionsTable() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Carregando assinaturas...")
      const data = await subscriptionsService.getAll()
      setSubscriptions(data)
      console.log("✅ Assinaturas carregadas:", data.length)
    } catch (error) {
      console.error("❌ Erro ao carregar assinaturas:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao carregar assinaturas"
      setError(errorMessage)

      toast({
        title: "Erro ao carregar assinaturas",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativo", variant: "default" as const, className: "bg-green-100 text-green-800" },
      inactive: { label: "Inativo", variant: "secondary" as const, className: "bg-gray-100 text-gray-800" },
      canceled: { label: "Cancelado", variant: "destructive" as const, className: "bg-red-100 text-red-800" },
      trial: { label: "Trial", variant: "outline" as const, className: "bg-blue-100 text-blue-800" },
      suspended: { label: "Suspenso", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"

    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return "Data inválida"
    }
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A"

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      subscription.client_name?.toLowerCase().includes(searchLower) ||
      subscription.plan_name?.toLowerCase().includes(searchLower) ||
      subscription.status.toLowerCase().includes(searchLower) ||
      subscription.id.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinaturas Ativas</CardTitle>
          <CardDescription>Carregando assinaturas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinaturas Ativas</CardTitle>
          <CardDescription>Erro ao carregar assinaturas</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadSubscriptions} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assinaturas Ativas</CardTitle>
            <CardDescription>
              Gerencie todas as assinaturas da plataforma ({subscriptions.length} total)
            </CardDescription>
          </div>
          <Button onClick={loadSubscriptions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar assinaturas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhuma assinatura encontrada</p>
            <p className="text-sm text-gray-400">
              As assinaturas aparecerão aqui quando os clientes se inscreverem nos planos
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Próximo Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{subscription.client_name || "Cliente não identificado"}</div>
                        <div className="text-sm text-gray-500">ID: {subscription.id.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.plan_name || "Plano não identificado"}</div>
                        {subscription.hotel_name && (
                          <div className="text-sm text-gray-500">Hotel: {subscription.hotel_name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{formatCurrency(subscription.price)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {subscription.billing_cycle === "monthly"
                          ? "Mensal"
                          : subscription.billing_cycle === "yearly"
                            ? "Anual"
                            : subscription.billing_cycle || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(subscription.start_date)}</TableCell>
                    <TableCell>
                      <div>
                        <div>{formatDate(subscription.next_payment_date)}</div>
                        {subscription.trial_ends_at && (
                          <div className="text-sm text-blue-600">
                            Trial até: {formatDate(subscription.trial_ends_at)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredSubscriptions.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma assinatura encontrada para "{searchTerm}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
