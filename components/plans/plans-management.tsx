"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Plus, Edit, Trash, MoreVertical, Power, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { plansService, type SubscriptionPlan } from "@/lib/services/plans-service"
import { useToast } from "@/hooks/use-toast"

interface PlansManagementProps {
  showToggleStatus?: boolean
}

export function PlansManagement({ showToggleStatus = false }: PlansManagementProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false)
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false)
  const [isDeletePlanOpen, setIsDeletePlanOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tablesExist, setTablesExist] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "disconnected">("unknown")
  const { toast } = useToast()

  // Form state
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    price_monthly: "",
    price_yearly: "",
    features: "",
    max_hotels: "1",
    max_rooms: "50",
    max_users: "5",
    max_integrations: "3",
    is_active: true,
    is_featured: false,
  })

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadPlans()
  }, [])

  const testConnection = async () => {
    try {
      const isConnected = await plansService.testConnection()
      setConnectionStatus(isConnected ? "connected" : "disconnected")
      return isConnected
    } catch (error) {
      setConnectionStatus("disconnected")
      return false
    }
  }

  const loadPlans = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Iniciando carregamento de planos...")

      // Testar conexão primeiro
      const isConnected = await testConnection()
      if (!isConnected) {
        throw new Error("Não foi possível conectar ao banco de dados")
      }

      // Verificar se as tabelas existem
      const exists = await plansService.checkTablesExist()
      setTablesExist(exists)

      if (!exists) {
        throw new Error("As tabelas do banco de dados não foram encontradas. Execute os scripts de criação primeiro.")
      }

      const data = await plansService.getAll()
      setPlans(data)
      console.log("📊 Planos carregados com sucesso:", data.length)

      if (data.length === 0) {
        setError("Nenhum plano encontrado. Crie o primeiro plano.")
      }
    } catch (error) {
      console.error("❌ Erro ao carregar planos:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao carregar planos"
      setError(errorMessage)

      toast({
        title: "Erro ao carregar planos",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!planForm.name.trim()) {
      errors.name = "Nome é obrigatório"
    } else if (planForm.name.trim().length < 2) {
      errors.name = "Nome deve ter pelo menos 2 caracteres"
    }

    if (!planForm.price_monthly || Number(planForm.price_monthly) <= 0) {
      errors.price_monthly = "Preço mensal deve ser maior que zero"
    } else if (Number(planForm.price_monthly) > 999999) {
      errors.price_monthly = "Preço mensal muito alto"
    }

    if (planForm.price_yearly && Number(planForm.price_yearly) <= 0) {
      errors.price_yearly = "Preço anual deve ser maior que zero"
    }

    if (planForm.price_yearly && Number(planForm.price_yearly) >= Number(planForm.price_monthly) * 12) {
      errors.price_yearly = "Preço anual deve ser menor que 12x o preço mensal"
    }

    const validateNumber = (value: string, field: string, min = -1) => {
      const num = Number(value)
      if (isNaN(num) || num < min) {
        errors[field] = `Valor inválido (mínimo: ${min})`
      }
    }

    validateNumber(planForm.max_hotels, "max_hotels")
    validateNumber(planForm.max_rooms, "max_rooms")
    validateNumber(planForm.max_users, "max_users")
    validateNumber(planForm.max_integrations, "max_integrations")

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setPlanForm({
      name: "",
      description: "",
      price_monthly: "",
      price_yearly: "",
      features: "",
      max_hotels: "1",
      max_rooms: "50",
      max_users: "5",
      max_integrations: "3",
      is_active: true,
      is_featured: false,
    })
    setFormErrors({})
  }

  const handleCreatePlan = async () => {
    console.log("🔄 Iniciando criação de plano...")
    console.log("📝 Dados do formulário:", planForm)

    if (!validateForm()) {
      console.log("❌ Formulário inválido:", formErrors)
      toast({
        title: "Formulário inválido",
        description: "Corrija os erros antes de continuar",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar features
      const features = planForm.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean)

      console.log("📝 Features processadas:", features)

      // Preparar dados do plano
      const planData = {
        name: planForm.name.trim(),
        description: planForm.description.trim() || undefined,
        price_monthly: Number(planForm.price_monthly),
        price_yearly: planForm.price_yearly ? Number(planForm.price_yearly) : undefined,
        features,
        max_hotels: Number(planForm.max_hotels),
        max_rooms: Number(planForm.max_rooms),
        max_users: Number(planForm.max_users),
        max_integrations: Number(planForm.max_integrations),
        is_active: planForm.is_active,
        is_featured: planForm.is_featured,
        sort_order: plans.length + 1,
      }

      console.log("📝 Dados preparados para criação:", planData)

      const newPlan = await plansService.create(planData)

      if (newPlan) {
        console.log("✅ Plano criado com sucesso:", newPlan)

        toast({
          title: "Plano criado com sucesso",
          description: `O plano ${planForm.name} foi criado`,
        })

        resetForm()
        setIsNewPlanOpen(false)
        await loadPlans() // Recarregar a lista
      } else {
        throw new Error("Nenhum dado retornado do serviço")
      }
    } catch (error) {
      console.error("❌ Erro ao criar plano:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar plano"

      toast({
        title: "Erro ao criar plano",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditPlan = async () => {
    if (!selectedPlan || !validateForm()) {
      toast({
        title: "Formulário inválido",
        description: "Corrija os erros antes de continuar",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const features = planForm.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean)

      const updatedPlan = await plansService.update(selectedPlan.id, {
        name: planForm.name.trim(),
        description: planForm.description.trim() || undefined,
        price_monthly: Number(planForm.price_monthly),
        price_yearly: planForm.price_yearly ? Number(planForm.price_yearly) : undefined,
        features,
        max_hotels: Number(planForm.max_hotels),
        max_rooms: Number(planForm.max_rooms),
        max_users: Number(planForm.max_users),
        max_integrations: Number(planForm.max_integrations),
        is_active: planForm.is_active,
        is_featured: planForm.is_featured,
      })

      if (updatedPlan) {
        toast({
          title: "Plano atualizado",
          description: `O plano ${planForm.name} foi atualizado com sucesso`,
        })

        setIsEditPlanOpen(false)
        await loadPlans()
      } else {
        throw new Error("Falha ao atualizar plano")
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar plano:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao atualizar plano"

      toast({
        title: "Erro ao atualizar plano",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePlan = async () => {
    if (!selectedPlan) return

    setIsSubmitting(true)

    try {
      const success = await plansService.delete(selectedPlan.id)

      if (success) {
        toast({
          title: "Plano excluído",
          description: `O plano ${selectedPlan.name} foi excluído com sucesso`,
        })

        setIsDeletePlanOpen(false)
        await loadPlans()
      } else {
        throw new Error("Falha ao excluir plano")
      }
    } catch (error) {
      console.error("❌ Erro ao excluir plano:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao excluir plano"

      toast({
        title: "Erro ao excluir plano",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePlanStatus = async (plan: SubscriptionPlan) => {
    try {
      const success = await plansService.toggleActive(plan.id)

      if (success) {
        // Atualizar o estado local para refletir a mudança imediatamente
        setPlans((prevPlans) => prevPlans.map((p) => (p.id === plan.id ? { ...p, is_active: !p.is_active } : p)))

        toast({
          title: plan.is_active ? "Plano desativado" : "Plano ativado",
          description: `O plano ${plan.name} foi ${plan.is_active ? "desativado" : "ativado"} com sucesso`,
        })
      } else {
        throw new Error("Falha ao alterar status")
      }
    } catch (error) {
      console.error("❌ Erro ao alterar status do plano:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao alterar status"

      toast({
        title: "Erro ao alterar status",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setPlanForm({
      name: plan.name,
      description: plan.description || "",
      price_monthly: plan.price_monthly.toString(),
      price_yearly: plan.price_yearly?.toString() || "",
      features: plan.features?.join("\n") || "",
      max_hotels: plan.max_hotels?.toString() || "1",
      max_rooms: plan.max_rooms?.toString() || "50",
      max_users: plan.max_users?.toString() || "5",
      max_integrations: plan.max_integrations?.toString() || "3",
      is_active: plan.is_active,
      is_featured: plan.is_featured || false,
    })
    setFormErrors({})
    setIsEditPlanOpen(true)
  }

  const openDeleteDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setIsDeletePlanOpen(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
          <CardDescription>Carregando planos de assinatura...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !tablesExist || connectionStatus === "disconnected") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
          <CardDescription>Erro ao carregar planos</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Problema de conexão com o banco de dados"}</AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button onClick={loadPlans} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button onClick={testConnection} variant="outline">
              Testar Conexão
            </Button>
          </div>
          {connectionStatus === "disconnected" && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Dica:</strong> Verifique se as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e
                NEXT_PUBLIC_SUPABASE_ANON_KEY estão configuradas corretamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Planos Disponíveis</CardTitle>
          <CardDescription>
            Gerenciar planos de assinatura da plataforma
            {connectionStatus === "connected" && (
              <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                Conectado
              </Badge>
            )}
          </CardDescription>
        </div>
        <Button onClick={() => setIsNewPlanOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhum plano encontrado</p>
            <Button onClick={() => setIsNewPlanOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`overflow-hidden ${!plan.is_active ? "opacity-70" : ""}`}>
                <div
                  className={`p-1 ${plan.is_featured ? "bg-gradient-to-r from-purple-600 to-blue-500" : "bg-gray-100"}`}
                ></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      {plan.is_featured && <Badge className="mt-1">Destaque</Badge>}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Abrir menu de ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(plan)}>
                          <Trash className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                        {showToggleStatus && (
                          <DropdownMenuItem onClick={() => togglePlanStatus(plan)}>
                            <Power className="h-4 w-4 mr-2" />
                            {plan.is_active ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="line-clamp-2 h-10">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-baseline mb-4">
                    <span className="text-3xl font-bold">R$ {plan.price_monthly}</span>
                    <span className="text-gray-500 ml-1">/mês</span>
                  </div>
                  {plan.price_yearly && (
                    <div className="text-sm text-gray-500 mb-4">
                      R$ {plan.price_yearly}/ano (economia de{" "}
                      {Math.round(100 - (plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                    </div>
                  )}
                  <ul className="space-y-2">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="px-6 pb-6 pt-2">
                  {showToggleStatus && (
                    <Button
                      variant={plan.is_active ? "default" : "outline"}
                      className={`w-full ${
                        plan.is_active
                          ? "bg-green-600 hover:bg-green-700 transition-all duration-300"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                      onClick={() => togglePlanStatus(plan)}
                    >
                      {plan.is_active ? "Ativo" : "Inativo"}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Novo Plano Dialog */}
        <Dialog
          open={isNewPlanOpen}
          onOpenChange={(open) => {
            setIsNewPlanOpen(open)
            if (!open && !isSubmitting) {
              resetForm()
            }
          }}
        >
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Plano</DialogTitle>
              <DialogDescription>Preencha as informações do novo plano de assinatura</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Plano *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Plano Básico"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_monthly">Preço Mensal (R$) *</Label>
                  <Input
                    id="price_monthly"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 99.90"
                    value={planForm.price_monthly}
                    onChange={(e) => setPlanForm({ ...planForm, price_monthly: e.target.value })}
                    className={formErrors.price_monthly ? "border-red-500" : ""}
                  />
                  {formErrors.price_monthly && <p className="text-sm text-red-500">{formErrors.price_monthly}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_yearly">Preço Anual (R$)</Label>
                  <Input
                    id="price_yearly"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 999.00"
                    value={planForm.price_yearly}
                    onChange={(e) => setPlanForm({ ...planForm, price_yearly: e.target.value })}
                    className={formErrors.price_yearly ? "border-red-500" : ""}
                  />
                  {formErrors.price_yearly && <p className="text-sm text-red-500">{formErrors.price_yearly}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Configurações</Label>
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={planForm.is_active}
                        onCheckedChange={(checked) => setPlanForm({ ...planForm, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Ativo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_featured"
                        checked={planForm.is_featured}
                        onCheckedChange={(checked) => setPlanForm({ ...planForm, is_featured: checked })}
                      />
                      <Label htmlFor="is_featured">Destaque</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_hotels">Max. Hotéis</Label>
                  <Input
                    id="max_hotels"
                    type="number"
                    min="-1"
                    placeholder="-1 = ilimitado"
                    value={planForm.max_hotels}
                    onChange={(e) => setPlanForm({ ...planForm, max_hotels: e.target.value })}
                    className={formErrors.max_hotels ? "border-red-500" : ""}
                  />
                  {formErrors.max_hotels && <p className="text-sm text-red-500">{formErrors.max_hotels}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_rooms">Max. Quartos</Label>
                  <Input
                    id="max_rooms"
                    type="number"
                    min="-1"
                    placeholder="-1 = ilimitado"
                    value={planForm.max_rooms}
                    onChange={(e) => setPlanForm({ ...planForm, max_rooms: e.target.value })}
                    className={formErrors.max_rooms ? "border-red-500" : ""}
                  />
                  {formErrors.max_rooms && <p className="text-sm text-red-500">{formErrors.max_rooms}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_users">Max. Usuários</Label>
                  <Input
                    id="max_users"
                    type="number"
                    min="-1"
                    placeholder="-1 = ilimitado"
                    value={planForm.max_users}
                    onChange={(e) => setPlanForm({ ...planForm, max_users: e.target.value })}
                    className={formErrors.max_users ? "border-red-500" : ""}
                  />
                  {formErrors.max_users && <p className="text-sm text-red-500">{formErrors.max_users}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_integrations">Max. Integrações</Label>
                  <Input
                    id="max_integrations"
                    type="number"
                    min="-1"
                    placeholder="-1 = ilimitado"
                    value={planForm.max_integrations}
                    onChange={(e) => setPlanForm({ ...planForm, max_integrations: e.target.value })}
                    className={formErrors.max_integrations ? "border-red-500" : ""}
                  />
                  {formErrors.max_integrations && <p className="text-sm text-red-500">{formErrors.max_integrations}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição do plano..."
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Funcionalidades (uma por linha)</Label>
                <Textarea
                  id="features"
                  placeholder="Gestão de reservas&#10;Check-in/Check-out&#10;Relatórios básicos"
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsNewPlanOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePlan} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Plano"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Editar Plano Dialog */}
        <Dialog
          open={isEditPlanOpen}
          onOpenChange={(open) => {
            setIsEditPlanOpen(open)
            if (!open && !isSubmitting) {
              setSelectedPlan(null)
              resetForm()
            }
          }}
        >
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Plano</DialogTitle>
              <DialogDescription>Faça alterações no plano {selectedPlan?.name}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Mesmo conteúdo do formulário de criação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Plano *</Label>
                  <Input
                    id="edit-name"
                    placeholder="Ex: Plano Básico"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price_monthly">Preço Mensal (R$) *</Label>
                  <Input
                    id="edit-price_monthly"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 99.90"
                    value={planForm.price_monthly}
                    onChange={(e) => setPlanForm({ ...planForm, price_monthly: e.target.value })}
                    className={formErrors.price_monthly ? "border-red-500" : ""}
                  />
                  {formErrors.price_monthly && <p className="text-sm text-red-500">{formErrors.price_monthly}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price_yearly">Preço Anual (R$)</Label>
                  <Input
                    id="edit-price_yearly"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 999.00"
                    value={planForm.price_yearly}
                    onChange={(e) => setPlanForm({ ...planForm, price_yearly: e.target.value })}
                    className={formErrors.price_yearly ? "border-red-500" : ""}
                  />
                  {formErrors.price_yearly && <p className="text-sm text-red-500">{formErrors.price_yearly}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Configurações</Label>
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-is_active"
                        checked={planForm.is_active}
                        onCheckedChange={(checked) => setPlanForm({ ...planForm, is_active: checked })}
                      />
                      <Label htmlFor="edit-is_active">Ativo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-is_featured"
                        checked={planForm.is_featured}
                        onCheckedChange={(checked) => setPlanForm({ ...planForm, is_featured: checked })}
                      />
                      <Label htmlFor="edit-is_featured">Destaque</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-max_hotels">Max. Hotéis</Label>
                  <Input
                    id="edit-max_hotels"
                    type="number"
                    min="-1"
                    placeholder="-1 = ilimitado"
                    value={planForm.max_hotels}
                    onChange={(e) => setPlanForm({ ...planForm, max_hotels: e.target.value })}
                    className={formErrors.max_hotels ? "border-red-500" : ""}
                  />
                  {formErrors.max_hotels && <p className="text-sm text-red-500">{formErrors.max_hotels}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-max_rooms">Max. Quartos</Label>
                  <Input
                    id="edit-max_rooms"
                    type="number"
                    min="-1"
                    placeholder="-1 = ilimitado"
                    value={planForm.max_rooms}
                    onChange={(e) => setPlanForm({ ...planForm, max_rooms: e.target.value })}
                    className={formErrors.max_rooms ? "border-red-500" : ""}
                  />
                  {formErrors.max_rooms && <p className="text-sm text-red-500">{formErrors.max_rooms}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-max_users">Max. Usuários</Label>
                  <Input
                    id="edit-max_users"
                    type="number"
                    min="-1"
                    placeholder="-1 = ilimitado"
                    value={planForm.max_users}
                    onChange={(e) => setPlanForm({ ...planForm, max_users: e.target.value })}
                    className={formErrors.max_users ? "border-red-500" : ""}
                  />
                  {formErrors.max_users && <p className="text-sm text-red-500">{formErrors.max_users}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-max_integrations">Max. Integrações</Label>
                  <Input
                    id="edit-max_integrations"
                    type="number"
                    min="-1"
                    placeholder="-1 = ilimitado"
                    value={planForm.max_integrations}
                    onChange={(e) => setPlanForm({ ...planForm, max_integrations: e.target.value })}
                    className={formErrors.max_integrations ? "border-red-500" : ""}
                  />
                  {formErrors.max_integrations && <p className="text-sm text-red-500">{formErrors.max_integrations}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Descrição do plano..."
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-features">Funcionalidades (uma por linha)</Label>
                <Textarea
                  id="edit-features"
                  placeholder="Gestão de reservas&#10;Check-in/Check-out&#10;Relatórios básicos"
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditPlanOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleEditPlan} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Excluir Plano Dialog */}
        <Dialog
          open={isDeletePlanOpen}
          onOpenChange={(open) => {
            setIsDeletePlanOpen(open)
            if (!open && !isSubmitting) {
              setSelectedPlan(null)
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Excluir Plano</DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita. O plano será permanentemente removido.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tem certeza que deseja excluir o plano <strong>{selectedPlan?.name}</strong>?
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter className="sm:justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDeletePlanOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeletePlan} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir Plano"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
