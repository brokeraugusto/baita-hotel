"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, MoreHorizontal, DollarSign, Trash2, Eye, ToggleLeft, ToggleRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { subscriptionPlansService, type SubscriptionPlan } from "@/lib/services/master-admin-service"
import { useToast } from "@/hooks/use-toast"
import { useHorizontalScroll } from "@/lib/hooks/use-horizontal-scroll"

export function PlansTableWithScroll() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const scrollRef = useHorizontalScroll()

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const data = await subscriptionPlansService.getAll()
      setPlans(data)
    } catch (error) {
      console.error("Error loading plans:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar planos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await subscriptionPlansService.update(id, { is_active: !currentStatus })
      toast({
        title: "Sucesso",
        description: `Plano ${!currentStatus ? "ativado" : "desativado"} com sucesso`,
      })
      loadPlans()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do plano",
        variant: "destructive",
      })
    }
  }

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await subscriptionPlansService.update(id, { is_featured: !currentStatus })
      toast({
        title: "Sucesso",
        description: `Plano ${!currentStatus ? "destacado" : "removido do destaque"} com sucesso`,
      })
      loadPlans()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar destaque do plano",
        variant: "destructive",
      })
    }
  }

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return

    try {
      await subscriptionPlansService.delete(id)
      toast({
        title: "Sucesso",
        description: "Plano excluído com sucesso",
      })
      loadPlans()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir plano",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Planos de Assinatura</CardTitle>
          <CardDescription>Carregando planos...</CardDescription>
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
        <CardTitle>Planos de Assinatura ({plans.length})</CardTitle>
        <CardDescription>Gerencie os planos disponíveis na plataforma</CardDescription>
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
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Plano</TableHead>
                  <TableHead className="w-[150px]">Preço Mensal</TableHead>
                  <TableHead className="w-[150px]">Preço Anual</TableHead>
                  <TableHead className="w-[120px]">Limites</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Destaque</TableHead>
                  <TableHead className="w-[300px]">Funcionalidades</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[180px]">{plan.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          R$ {plan.price_monthly.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {plan.price_yearly
                            ? `R$ ${plan.price_yearly.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div>Quartos: {plan.limits?.rooms === -1 ? "∞" : plan.limits?.rooms || 0}</div>
                        <div>Usuários: {plan.limits?.users === -1 ? "∞" : plan.limits?.users || 0}</div>
                        <div>
                          Integrações: {plan.limits?.integrations === -1 ? "∞" : plan.limits?.integrations || 0}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.is_featured ? "default" : "outline"}>
                        {plan.is_featured ? "Destacado" : "Normal"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[280px]">
                        <div className="text-xs space-y-1">
                          {plan.features?.slice(0, 3).map((feature, index) => (
                            <div key={index} className="truncate">
                              • {feature}
                            </div>
                          ))}
                          {plan.features?.length > 3 && (
                            <div className="text-muted-foreground">+{plan.features.length - 3} mais...</div>
                          )}
                        </div>
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
                          <DropdownMenuItem onClick={() => handleToggleActive(plan.id, plan.is_active)}>
                            {plan.is_active ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFeatured(plan.id, plan.is_featured)}>
                            {plan.is_featured ? "Remover Destaque" : "Destacar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePlan(plan.id)} className="text-red-600">
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
