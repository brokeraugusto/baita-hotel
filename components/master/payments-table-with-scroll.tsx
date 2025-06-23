"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, MoreHorizontal, DollarSign, CreditCard, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { paymentsService, type Payment } from "@/lib/services/master-admin-service"
import { useToast } from "@/hooks/use-toast"
import { useHorizontalScroll } from "@/lib/hooks/use-horizontal-scroll"

const statusConfig = {
  paid: { label: "Pago", variant: "default" as const },
  pending: { label: "Pendente", variant: "secondary" as const },
  failed: { label: "Falhou", variant: "destructive" as const },
  refunded: { label: "Reembolsado", variant: "outline" as const },
}

export function PaymentsTableWithScroll() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const scrollRef = useHorizontalScroll()

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const data = await paymentsService.getAll()
      setPayments(data)
    } catch (error) {
      console.error("Error loading payments:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar pagamentos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos Recentes</CardTitle>
          <CardDescription>Carregando pagamentos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamentos Recentes ({payments.length})</CardTitle>
        <CardDescription>Histórico de pagamentos da plataforma</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          ref={scrollRef}
          onMouseEnter={(e) => {
            const handleWheel = (event: WheelEvent) => {
              if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                event.preventDefault()
                e.currentTarget.scrollLeft += event.deltaY
              }
            }
            e.currentTarget.addEventListener("wheel", handleWheel, { passive: false })
            e.currentTarget.setAttribute("data-wheel-listener", "true")
          }}
          onMouseLeave={(e) => {
            if (e.currentTarget.getAttribute("data-wheel-listener")) {
              const listeners = (e.currentTarget as any)._wheelListeners || []
              listeners.forEach((listener: EventListener) => {
                e.currentTarget.removeEventListener("wheel", listener)
              })
              e.currentTarget.removeAttribute("data-wheel-listener")
            }
          }}
        >
          <div className="min-w-[1100px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Cliente</TableHead>
                  <TableHead className="w-[120px]">Valor</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[150px]">Método</TableHead>
                  <TableHead className="w-[120px]">Provedor</TableHead>
                  <TableHead className="w-[140px]">Data Pagamento</TableHead>
                  <TableHead className="w-[140px]">Data Criação</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {payment.client?.hotel_name || "Cliente não encontrado"}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">{payment.client?.email}</div>
                        <div className="text-xs text-muted-foreground truncate">{payment.client?.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {payment.currency} {payment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[payment.status as keyof typeof statusConfig]?.variant || "outline"}>
                        {statusConfig[payment.status as keyof typeof statusConfig]?.label || payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{payment.payment_method || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{payment.payment_provider || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString("pt-BR") : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {payment.invoice_url && (
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ver Fatura
                            </DropdownMenuItem>
                          )}
                          {payment.receipt_url && (
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ver Recibo
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
