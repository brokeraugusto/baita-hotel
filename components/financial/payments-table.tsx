"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Download, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useHorizontalScroll } from "@/lib/hooks/use-horizontal-scroll"

const payments = [
  {
    id: "1",
    client: "Hotel Vista Mar",
    invoice: "INV-2024-001",
    amount: 189,
    dueDate: "2024-02-15",
    status: "paid",
    paymentDate: "2024-02-14",
    method: "Cartão de Crédito",
  },
  {
    id: "2",
    client: "Resort Paradise",
    invoice: "INV-2024-002",
    amount: 389,
    dueDate: "2024-02-08",
    status: "paid",
    paymentDate: "2024-02-07",
    method: "PIX",
  },
  {
    id: "3",
    client: "Hotel Central",
    invoice: "INV-2024-003",
    amount: 189,
    dueDate: "2024-01-10",
    status: "overdue",
    paymentDate: null,
    method: "Cartão de Crédito",
  },
  {
    id: "4",
    client: "Chalés da Montanha",
    invoice: "INV-2024-004",
    amount: 89,
    dueDate: "2024-02-01",
    status: "pending",
    paymentDate: null,
    method: "Boleto",
  },
  {
    id: "5",
    client: "Pousada Recanto",
    invoice: "INV-2024-005",
    amount: 189,
    dueDate: "2024-02-20",
    status: "pending",
    paymentDate: null,
    method: "PIX",
  },
]

const statusConfig = {
  paid: { label: "Pago", variant: "default" as const },
  pending: { label: "Pendente", variant: "secondary" as const },
  overdue: { label: "Em Atraso", variant: "destructive" as const },
  cancelled: { label: "Cancelado", variant: "outline" as const },
}

export function PaymentsTable() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pagamentos Recentes</CardTitle>
            <CardDescription>Histórico de pagamentos e faturas dos clientes</CardDescription>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          ref={useHorizontalScroll()}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.client}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{payment.invoice}</code>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">R$ {payment.amount}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {payment.status === "overdue" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      <span>{new Date(payment.dueDate).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[payment.status as keyof typeof statusConfig].variant}>
                      {statusConfig[payment.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.paymentDate ? (
                      <span className="text-sm">{new Date(payment.paymentDate).toLocaleDateString("pt-BR")}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{payment.method}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver Fatura</DropdownMenuItem>
                        <DropdownMenuItem>Reenviar Cobrança</DropdownMenuItem>
                        <DropdownMenuItem>Marcar como Pago</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Cancelar Fatura</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
