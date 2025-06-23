"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit, MoreHorizontal, Building2, Users, Pause, Play, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { clientsService, type Client } from "@/lib/services/master-admin-service"
import { useToast } from "@/hooks/use-toast"
import { useHorizontalScroll } from "@/lib/hooks/use-horizontal-scroll"

const statusConfig = {
  active: { label: "Ativo", variant: "default" as const },
  trial: { label: "Trial", variant: "secondary" as const },
  suspended: { label: "Suspenso", variant: "destructive" as const },
  inactive: { label: "Inativo", variant: "outline" as const },
}

export function ClientsTableWithScroll() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const scrollRef = useHorizontalScroll()

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await clientsService.getAll()
      setClients(data)
    } catch (error) {
      console.error("Error loading clients:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes. Usando dados de exemplo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendClient = async (id: string) => {
    try {
      await clientsService.suspend(id)
      toast({
        title: "Sucesso",
        description: "Cliente suspenso com sucesso",
      })
      loadClients()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao suspender cliente",
        variant: "destructive",
      })
    }
  }

  const handleActivateClient = async (id: string) => {
    try {
      await clientsService.activate(id)
      toast({
        title: "Sucesso",
        description: "Cliente ativado com sucesso",
      })
      loadClients()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao ativar cliente",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return

    try {
      await clientsService.delete(id)
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso",
      })
      loadClients()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>Carregando clientes...</CardDescription>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Clientes ({clients.length})</CardTitle>
          <CardDescription>Gerencie todos os clientes da plataforma</CardDescription>
        </div>
        <Button variant="outline" onClick={loadClients}>
          Atualizar
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="overflow-x-auto"
          ref={scrollRef}
          onMouseEnter={(e) => {
            const element = e.currentTarget
            const handleWheel = (wheelEvent: WheelEvent) => {
              if (Math.abs(wheelEvent.deltaX) > Math.abs(wheelEvent.deltaY)) {
                return // Let horizontal scroll work naturally
              }

              if (wheelEvent.deltaY !== 0) {
                wheelEvent.preventDefault()
                element.scrollLeft += wheelEvent.deltaY
              }
            }

            element.addEventListener("wheel", handleWheel, { passive: false })
            element.setAttribute("data-wheel-listener", "true")
          }}
          onMouseLeave={(e) => {
            const element = e.currentTarget
            if (element.getAttribute("data-wheel-listener")) {
              const listeners = (element as any)._wheelListeners || []
              listeners.forEach((listener: EventListener) => {
                element.removeEventListener("wheel", listener)
              })
              element.removeAttribute("data-wheel-listener")
            }
          }}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgb(203 213 225) transparent",
          }}
        >
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Cliente</TableHead>
                  <TableHead className="w-[120px]">Plano</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[140px]">Receita Mensal</TableHead>
                  <TableHead className="w-[100px]">Quartos</TableHead>
                  <TableHead className="w-[120px]">Reservas</TableHead>
                  <TableHead className="w-[140px]">Último Login</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg" alt={client.name} />
                          <AvatarFallback>
                            {client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{client.hotel_name}</div>
                          <div className="text-sm text-muted-foreground truncate">{client.email}</div>
                          <div className="text-xs text-muted-foreground truncate">{client.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.plan?.name || "Sem plano"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[client.status as keyof typeof statusConfig]?.variant || "outline"}>
                        {statusConfig[client.status as keyof typeof statusConfig]?.label || client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        R$ {client.monthly_revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{client.rooms_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{client.total_reservations}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {client.last_payment_at
                          ? new Date(client.last_payment_at).toLocaleDateString("pt-BR")
                          : "Nunca"}
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
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {client.status === "active" ? (
                            <DropdownMenuItem onClick={() => handleSuspendClient(client.id)}>
                              <Pause className="mr-2 h-4 w-4" />
                              Suspender
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleActivateClient(client.id)}>
                              <Play className="mr-2 h-4 w-4" />
                              Ativar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteClient(client.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
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
