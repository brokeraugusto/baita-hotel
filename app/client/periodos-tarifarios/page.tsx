"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Edit, Trash2, DollarSign, AlertCircle, Info } from "lucide-react"
import { pricingDataService } from "@/lib/services/pricing-data-service"
import type { TariffPeriod } from "@/lib/types/pricing"
import { useToast } from "@/hooks/use-toast"

export default function TariffPeriodsPage() {
  const [periods, setPeriods] = useState<TariffPeriod[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<TariffPeriod | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    minimum_nights: 1,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    loadPeriods()
  }, [])

  const loadPeriods = () => {
    const allPeriods = pricingDataService.getTariffPeriods()
    setPeriods(allPeriods.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      start_date: "",
      end_date: "",
      minimum_nights: 1,
    })
    setEditingPeriod(null)
    setFormErrors({})
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Nome é obrigatório"
    }

    if (!formData.start_date) {
      errors.start_date = "Data de início é obrigatória"
    }

    if (!formData.end_date) {
      errors.end_date = "Data de fim é obrigatória"
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)

      if (endDate <= startDate) {
        errors.end_date = "Data de fim deve ser posterior à data de início"
      }

      // Verificar sobreposição com outros períodos
      const overlapping = periods.find((period) => {
        if (editingPeriod && period.id === editingPeriod.id) return false

        const periodStart = new Date(period.start_date)
        const periodEnd = new Date(period.end_date)

        return startDate <= periodEnd && endDate >= periodStart
      })

      if (overlapping) {
        errors.start_date = `Período sobrepõe com "${overlapping.name}"`
      }
    }

    if (formData.minimum_nights < 1 || formData.minimum_nights > 30) {
      errors.minimum_nights = "Estadia mínima deve ser entre 1 e 30 noites"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (editingPeriod) {
        // Atualizar período existente
        pricingDataService.updateTariffPeriod(editingPeriod.id, formData)
        toast({
          title: "Período atualizado",
          description: "O período tarifário foi atualizado com sucesso.",
        })
      } else {
        // Criar novo período
        pricingDataService.createTariffPeriod(formData)
        toast({
          title: "Período criado",
          description: "O período tarifário foi criado com sucesso.",
        })
      }

      loadPeriods()
      resetForm()
      setIsCreateModalOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o período tarifário.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (period: TariffPeriod) => {
    setEditingPeriod(period)
    setFormData({
      name: period.name,
      start_date: period.start_date,
      end_date: period.end_date,
      minimum_nights: period.minimum_nights,
    })
    setFormErrors({})
    setIsCreateModalOpen(true)
  }

  const handleDelete = (period: TariffPeriod) => {
    if (confirm(`Tem certeza que deseja excluir o período "${period.name}"?`)) {
      try {
        pricingDataService.deleteTariffPeriod(period.id)
        loadPeriods()
        toast({
          title: "Período excluído",
          description: "O período tarifário foi excluído com sucesso.",
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o período. Verifique se não há regras de preço associadas.",
          variant: "destructive",
        })
      }
    }
  }

  const handleNewPeriod = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getPeriodStatus = (period: TariffPeriod) => {
    const now = new Date()
    const start = new Date(period.start_date)
    const end = new Date(period.end_date)

    if (now < start) return { label: "Futuro", variant: "secondary" as const }
    if (now > end) return { label: "Passado", variant: "outline" as const }
    return { label: "Ativo", variant: "default" as const }
  }

  const getDurationInDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }
    return 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Períodos Tarifários</h1>
          <p className="text-muted-foreground">
            Gerencie os períodos de temporada e suas configurações de estadia mínima
          </p>
        </div>

        <Button onClick={handleNewPeriod}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Período
        </Button>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{editingPeriod ? "Editar Período Tarifário" : "Novo Período Tarifário"}</DialogTitle>
            <DialogDescription>
              Configure as datas e regras para este período de temporada. Todos os campos são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            <ScrollArea className="h-full max-h-[calc(90vh-180px)] pr-4">
              <form onSubmit={handleSubmit} className="py-4 space-y-6">
                {/* Seção 1: Nome do Período */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">1. Identificação do Período</h3>
                    <Badge variant="outline" className="text-xs">
                      Obrigatório
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nome do Período *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Alta Temporada Verão 2025"
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.name}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Escolha um nome descritivo que identifique claramente o período (ex: "Carnaval 2025", "Férias de
                      Julho")
                    </p>
                  </div>
                </div>

                {/* Seção 2: Datas do Período */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">2. Datas do Período</h3>
                    <Badge variant="outline" className="text-xs">
                      Obrigatório
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date" className="text-sm font-medium">
                        Data de Início *
                      </Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className={formErrors.start_date ? "border-red-500" : ""}
                      />
                      {formErrors.start_date && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.start_date}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date" className="text-sm font-medium">
                        Data de Fim *
                      </Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className={formErrors.end_date ? "border-red-500" : ""}
                      />
                      {formErrors.end_date && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.end_date}
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.start_date && formData.end_date && getDurationInDays() > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Duração: {getDurationInDays()} dias</span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        De {formatDate(formData.start_date)} até {formatDate(formData.end_date)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Seção 3: Regras de Estadia */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">3. Regras de Estadia</h3>
                    <Badge variant="outline" className="text-xs">
                      Obrigatório
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimum_nights" className="text-sm font-medium">
                      Estadia Mínima (noites) *
                    </Label>
                    <Input
                      id="minimum_nights"
                      type="number"
                      min="1"
                      max="30"
                      value={formData.minimum_nights}
                      onChange={(e) =>
                        setFormData({ ...formData, minimum_nights: Number.parseInt(e.target.value) || 1 })
                      }
                      className={formErrors.minimum_nights ? "border-red-500" : ""}
                    />
                    {formErrors.minimum_nights && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.minimum_nights}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Número mínimo de noites que o hóspede deve ficar durante este período (entre 1 e 30 noites)
                    </p>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">
                        Estadia configurada: {formData.minimum_nights} noite{formData.minimum_nights > 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      {formData.minimum_nights === 1
                        ? "Permite reservas de apenas 1 noite"
                        : `Reservas devem ter pelo menos ${formData.minimum_nights} noites`}
                    </p>
                  </div>
                </div>

                {/* Seção 4: Resumo */}
                {formData.name && formData.start_date && formData.end_date && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">4. Resumo do Período</h3>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-900">Nome:</span>
                          <span className="text-sm text-green-800">{formData.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-900">Período:</span>
                          <span className="text-sm text-green-800">
                            {formatDate(formData.start_date)} - {formatDate(formData.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-900">Duração:</span>
                          <span className="text-sm text-green-800">{getDurationInDays()} dias</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-900">Estadia mínima:</span>
                          <span className="text-sm text-green-800">
                            {formData.minimum_nights} noite{formData.minimum_nights > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seção 5: Próximos Passos */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Próximos Passos</h4>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                    <li>Após criar o período, você poderá configurar as regras de preço específicas</li>
                    <li>Defina preços diferentes para cada categoria de acomodação</li>
                    <li>Configure descontos para café da manhã e formas de pagamento</li>
                    <li>Use o simulador de preços para testar as configurações</li>
                  </ul>
                </div>
              </form>
            </ScrollArea>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.name || !formData.start_date || !formData.end_date}
            >
              {isLoading ? "Salvando..." : editingPeriod ? "Atualizar" : "Criar"} Período
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {periods.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum período cadastrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece criando seu primeiro período tarifário para definir as regras de temporada.
              </p>
              <Button onClick={handleNewPeriod}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Período
              </Button>
            </CardContent>
          </Card>
        ) : (
          periods.map((period) => {
            const status = getPeriodStatus(period)
            return (
              <Card key={period.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {period.name}
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {formatDate(period.start_date)} até {formatDate(period.end_date)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(period)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(period)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Estadia mínima: {period.minimum_nights} noite{period.minimum_nights > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Ver Preços
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
