"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, MoreHorizontal, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supportTicketsService, type SupportTicket } from "@/lib/services/master-admin-service"
import { useToast } from "@/hooks/use-toast"
import { useHorizontalScroll } from "@/lib/hooks/use-horizontal-scroll"

const statusConfig = {
  open: { label: "Aberto", variant: "destructive" as const },
  in_progress: { label: "Em Andamento", variant: "secondary" as const },
  waiting: { label: "Aguardando", variant: "outline" as const },
  resolved: { label: "Resolvido", variant: "default" as const },
  closed: { label: "Fechado", variant: "outline" as const },
}

const priorityConfig = {
  low: { label: "Baixa", variant: "outline" as const },
  medium: { label: "Média", variant: "secondary" as const },
  high: { label: "Alta", variant: "destructive" as const },
  critical: { label: "Crítica", variant: "destructive" as const },
}

export function SupportTicketsTableWithScroll() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const scrollRef = useHorizontalScroll()

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const data = await supportTicketsService.getAll()
      setTickets(data)
    } catch (error) {
      console.error("Error loading tickets:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar tickets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResolveTicket = async (id: string) => {
    const resolution = prompt("Digite a resolução do ticket:")
    if (!resolution) return

    try {
      await supportTicketsService.resolve(id, resolution)
      toast({
        title: "Sucesso",
        description: "Ticket resolvido com sucesso",
      })
      loadTickets()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao resolver ticket",
        variant: "destructive",
      })
    }
  }

  const handleCloseTicket = async (id: string) => {
    if (!confirm("Tem certeza que deseja fechar este ticket?")) return

    try {
      await supportTicketsService.close(id)
      toast({
        title: "Sucesso",
        description: "Ticket fechado com sucesso",
      })
      loadTickets()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fechar ticket",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets de Suporte</CardTitle>
          <CardDescription>Carregando tickets...</CardDescription>
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
        <CardTitle>Tickets de Suporte ({tickets.length})</CardTitle>
        <CardDescription>Gerencie todos os tickets de suporte</CardDescription>
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
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Ticket</TableHead>
                  <TableHead className="w-[200px]">Cliente</TableHead>
                  <TableHead className="w-[100px]">Prioridade</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[120px]">Categoria</TableHead>
                  <TableHead className="w-[150px]">Responsável</TableHead>
                  <TableHead className="w-[140px]">Criado em</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{ticket.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[280px]">{ticket.description}</div>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {ticket.client?.hotel_name || ticket.client_name || "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {ticket.client?.email || ticket.client_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={priorityConfig[ticket.priority as keyof typeof priorityConfig]?.variant || "outline"}
                      >
                        {priorityConfig[ticket.priority as keyof typeof priorityConfig]?.label || ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[ticket.status as keyof typeof statusConfig]?.variant || "outline"}>
                        {statusConfig[ticket.status as keyof typeof statusConfig]?.label || ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{ticket.category || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{ticket.assigned_to || "Não atribuído"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
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
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Responder
                          </DropdownMenuItem>
                          {ticket.status !== "resolved" && (
                            <DropdownMenuItem onClick={() => handleResolveTicket(ticket.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Resolver
                            </DropdownMenuItem>
                          )}
                          {ticket.status !== "closed" && (
                            <DropdownMenuItem onClick={() => handleCloseTicket(ticket.id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Fechar
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
