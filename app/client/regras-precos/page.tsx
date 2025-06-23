"use client"

import { Calendar } from "@/components/ui/calendar"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Users,
  Coffee,
  AlertCircle,
  Info,
  CreditCard,
  Wallet,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Save,
  Eye,
  Calculator,
} from "lucide-react"
import { pricingDataService } from "@/lib/services/pricing-data-service"
import type { TariffPeriod, PriceRule } from "@/lib/types/pricing"
import { useToast } from "@/hooks/use-toast"

export default function PriceRulesPage() {
  const [periods, setPeriods] = useState<TariffPeriod[]>([])
  const [rules, setRules] = useState<PriceRule[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<PriceRule | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeGuestTab, setActiveGuestTab] = useState("1")
  const [currentStep, setCurrentStep] = useState(1)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    tariff_period_id: "",
    accommodation_category_id: "",
    number_of_guests: 1,
    price_credit_card: 0,
    price_pix: 0,
    breakfast_discount_type: "FIXED" as "FIXED" | "PERCENTAGE",
    breakfast_discount_value: 0,
  })

  const [guestPrices, setGuestPrices] = useState<
    Array<{
      guests: number
      price_credit_card: number
      price_pix: number
    }>
  >([
    { guests: 1, price_credit_card: 0, price_pix: 0 },
    { guests: 2, price_credit_card: 0, price_pix: 0 },
    { guests: 3, price_credit_card: 0, price_pix: 0 },
    { guests: 4, price_credit_card: 0, price_pix: 0 },
  ])

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [previewData, setPreviewData] = useState<any>(null)
  const { toast } = useToast()

  // Categorias mockadas
  const categories = [
    { id: "cat-standard", name: "Standard", max_capacity: 4 },
    { id: "cat-super-luxo", name: "Super Luxo", max_capacity: 3 },
    { id: "cat-master", name: "Master", max_capacity: 2 },
  ]

  useEffect(() => {
    loadData()
  }, [])

  // Calculate form completion progress
  useEffect(() => {
    const steps = []

    // Step 1: Basic info
    if (formData.tariff_period_id && formData.accommodation_category_id) {
      steps.push(1)
    }

    // Step 2: Prices
    if (guestPrices.some((p) => p.price_credit_card > 0 && p.price_pix > 0)) {
      steps.push(2)
    }

    // Step 3: Discount
    if (formData.breakfast_discount_value >= 0) {
      steps.push(3)
    }

    // Step 4: Complete
    if (steps.length === 3) {
      steps.push(4)
    }

    setCompletedSteps(steps)

    // Update preview data
    if (steps.length >= 2) {
      updatePreviewData()
    }
  }, [formData, guestPrices])

  const loadData = () => {
    try {
      const allPeriods = pricingDataService.getTariffPeriods()
      const allRules = pricingDataService.getPriceRules()
      setPeriods(allPeriods)
      setRules(allRules)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados. Usando dados padrão.",
        variant: "destructive",
      })

      // Fallback data
      setPeriods([
        {
          id: "1",
          name: "Baixa Temporada 2025",
          start_date: "2025-03-01",
          end_date: "2025-06-30",
          minimum_nights: 1,
          color: "#4ade80",
        },
        {
          id: "2",
          name: "Alta Temporada 2025",
          start_date: "2025-07-01",
          end_date: "2025-08-31",
          minimum_nights: 2,
          color: "#f97316",
        },
      ])
      setRules([])
    }
  }

  const resetForm = () => {
    setFormData({
      tariff_period_id: "",
      accommodation_category_id: "",
      number_of_guests: 1,
      price_credit_card: 0,
      price_pix: 0,
      breakfast_discount_type: "FIXED",
      breakfast_discount_value: 0,
    })
    setGuestPrices([
      { guests: 1, price_credit_card: 0, price_pix: 0 },
      { guests: 2, price_credit_card: 0, price_pix: 0 },
      { guests: 3, price_credit_card: 0, price_pix: 0 },
      { guests: 4, price_credit_card: 0, price_pix: 0 },
    ])
    setActiveGuestTab("1")
    setCurrentStep(1)
    setScrollProgress(0)
    setCompletedSteps([])
    setEditingRule(null)
    setFormErrors({})
    setPreviewData(null)
  }

  const updatePreviewData = () => {
    const selectedCategory = categories.find((c) => c.id === formData.accommodation_category_id)
    const selectedPeriod = periods.find((p) => p.id === formData.tariff_period_id)

    if (!selectedCategory || !selectedPeriod) return

    const preview = {
      period: selectedPeriod.name,
      category: selectedCategory.name,
      maxCapacity: selectedCategory.max_capacity,
      prices: guestPrices
        .filter((p) => p.price_credit_card > 0)
        .map((price) => ({
          guests: price.guests,
          withBreakfast: {
            creditCard: price.price_credit_card,
            pix: price.price_pix,
          },
          withoutBreakfast: {
            creditCard:
              formData.breakfast_discount_type === "FIXED"
                ? Math.max(0, price.price_credit_card - formData.breakfast_discount_value)
                : price.price_credit_card * (1 - formData.breakfast_discount_value / 100),
            pix:
              formData.breakfast_discount_type === "FIXED"
                ? Math.max(0, price.price_pix - formData.breakfast_discount_value)
                : price.price_pix * (1 - formData.breakfast_discount_value / 100),
          },
        })),
      discount: {
        type: formData.breakfast_discount_type,
        value: formData.breakfast_discount_value,
      },
    }

    setPreviewData(preview)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.tariff_period_id) {
      errors.tariff_period_id = "Período tarifário é obrigatório"
    }

    if (!formData.accommodation_category_id) {
      errors.accommodation_category_id = "Categoria é obrigatória"
    }

    // Validar preços para cada número de hóspedes
    const selectedCategory = categories.find((c) => c.id === formData.accommodation_category_id)
    if (selectedCategory) {
      const maxCapacity = selectedCategory.max_capacity
      let hasValidPrices = false

      for (let i = 0; i < maxCapacity; i++) {
        const guestCount = i + 1
        const guestPrice = guestPrices.find((p) => p.guests === guestCount)

        if (!guestPrice) continue

        if (guestPrice.price_credit_card > 0 && guestPrice.price_pix > 0) {
          hasValidPrices = true

          if (guestPrice.price_credit_card <= 0) {
            errors[`price_credit_card_${guestCount}`] =
              `Preço do cartão para ${guestCount} hóspede(s) deve ser maior que zero`
          }

          if (guestPrice.price_pix <= 0) {
            errors[`price_pix_${guestCount}`] = `Preço PIX para ${guestCount} hóspede(s) deve ser maior que zero`
          }

          if (guestPrice.price_pix >= guestPrice.price_credit_card) {
            errors[`price_pix_${guestCount}`] =
              `Preço PIX para ${guestCount} hóspede(s) deve ser menor que o preço do cartão`
          }
        }
      }

      if (!hasValidPrices) {
        errors.general_prices = "Configure pelo menos um preço válido para a categoria selecionada"
      }
    }

    if (formData.breakfast_discount_value < 0) {
      errors.breakfast_discount_value = "Desconto não pode ser negativo"
    }

    if (formData.breakfast_discount_type === "PERCENTAGE" && formData.breakfast_discount_value > 100) {
      errors.breakfast_discount_value = "Desconto percentual não pode ser maior que 100%"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorKey = Object.keys(formErrors)[0]
      if (firstErrorKey) {
        const errorElement = document.querySelector(`[data-error="${firstErrorKey}"]`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }

      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const selectedCategory = categories.find((c) => c.id === formData.accommodation_category_id)
      if (!selectedCategory) {
        throw new Error("Categoria não encontrada")
      }

      const maxCapacity = selectedCategory.max_capacity
      const savedRules = []

      // Only save rules for guest counts that have valid prices
      for (let i = 0; i < maxCapacity; i++) {
        const guestCount = i + 1
        const guestPrice = guestPrices.find((p) => p.guests === guestCount)

        if (!guestPrice || guestPrice.price_credit_card <= 0 || guestPrice.price_pix <= 0) {
          continue // Skip this guest count if no valid prices
        }

        const ruleData = {
          tariff_period_id: formData.tariff_period_id,
          accommodation_category_id: formData.accommodation_category_id,
          number_of_guests: guestCount,
          price_credit_card: guestPrice.price_credit_card,
          price_pix: guestPrice.price_pix,
          breakfast_discount_type: formData.breakfast_discount_type,
          breakfast_discount_value: formData.breakfast_discount_value,
        }

        // Check if rule already exists for this combination
        const existingRule = rules.find(
          (rule) =>
            rule.tariff_period_id === ruleData.tariff_period_id &&
            rule.accommodation_category_id === ruleData.accommodation_category_id &&
            rule.number_of_guests === ruleData.number_of_guests &&
            (editingRule ? rule.id !== editingRule.id : true),
        )

        try {
          if (existingRule && editingRule) {
            // Update existing rule when editing
            const updatedRule = pricingDataService.updatePriceRule(existingRule.id, ruleData)
            if (updatedRule) {
              savedRules.push(updatedRule)
            }
          } else if (!existingRule) {
            // Create new rule only if it doesn't exist
            const newRule = pricingDataService.createPriceRule(ruleData)
            savedRules.push(newRule)
          } else {
            // Rule already exists and we're not editing - show warning
            toast({
              title: "Regra já existe",
              description: `Já existe uma regra para ${getCategoryName(ruleData.accommodation_category_id)} com ${guestCount} hóspede(s) no período ${getPeriodName(ruleData.tariff_period_id)}.`,
              variant: "destructive",
            })
            continue
          }
        } catch (ruleError) {
          console.error(`Error saving rule for ${guestCount} guests:`, ruleError)
          continue
        }
      }

      if (savedRules.length === 0) {
        toast({
          title: "Nenhuma regra salva",
          description: "Nenhuma regra nova foi criada. Verifique se já existem regras para esta configuração.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: editingRule ? "Regras atualizadas" : "Regras criadas",
        description: `${savedRules.length} regra(s) de preço foram ${editingRule ? "atualizadas" : "criadas"} com sucesso.`,
      })

      loadData()
      resetForm()
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as regras de preço. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (rule: PriceRule) => {
    setEditingRule(rule)

    const categoryRules = rules.filter(
      (r) =>
        r.tariff_period_id === rule.tariff_period_id && r.accommodation_category_id === rule.accommodation_category_id,
    )

    const updatedGuestPrices = [...guestPrices]
    categoryRules.forEach((r) => {
      const index = updatedGuestPrices.findIndex((p) => p.guests === r.number_of_guests)
      if (index >= 0) {
        updatedGuestPrices[index] = {
          guests: r.number_of_guests,
          price_credit_card: r.price_credit_card,
          price_pix: r.price_pix,
        }
      }
    })

    setGuestPrices(updatedGuestPrices)
    setActiveGuestTab(rule.number_of_guests.toString())

    setFormData({
      tariff_period_id: rule.tariff_period_id,
      accommodation_category_id: rule.accommodation_category_id,
      number_of_guests: rule.number_of_guests,
      price_credit_card: rule.price_credit_card,
      price_pix: rule.price_pix,
      breakfast_discount_type: rule.breakfast_discount_type,
      breakfast_discount_value: rule.breakfast_discount_value,
    })

    setFormErrors({})
    setIsCreateModalOpen(true)
  }

  const handleDelete = (rule: PriceRule) => {
    const period = periods.find((p) => p.id === rule.tariff_period_id)
    const category = categories.find((c) => c.id === rule.accommodation_category_id)

    if (
      confirm(
        `Tem certeza que deseja excluir a regra para "${category?.name}" - ${rule.number_of_guests} hóspede(s) no período "${period?.name}"?`,
      )
    ) {
      try {
        pricingDataService.deletePriceRule(rule.id)
        loadData()
        toast({
          title: "Regra excluída",
          description: "A regra de preço foi excluída com sucesso.",
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a regra de preço.",
          variant: "destructive",
        })
      }
    }
  }

  const handleNewRule = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, accommodation_category_id: categoryId })

    const selectedCategory = categories.find((c) => c.id === categoryId)
    if (selectedCategory) {
      const maxCapacity = selectedCategory.max_capacity
      const newGuestPrices = []

      for (let i = 0; i < maxCapacity; i++) {
        const guestCount = i + 1
        newGuestPrices.push({
          guests: guestCount,
          price_credit_card: 0,
          price_pix: 0,
        })
      }

      setGuestPrices(newGuestPrices)
      setActiveGuestTab("1")
    }
  }

  const updateGuestPrice = (guestCount: number, field: "price_credit_card" | "price_pix", value: number) => {
    const updatedPrices = guestPrices.map((price) => {
      if (price.guests === guestCount) {
        return { ...price, [field]: value }
      }
      return price
    })

    setGuestPrices(updatedPrices)
  }

  const scrollToSection = (sectionId: string, step: number) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setCurrentStep(step)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const scrollPercentage = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100
    setScrollProgress(Math.min(100, Math.max(0, scrollPercentage)))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getPeriodName = (periodId: string) => {
    return periods.find((p) => p.id === periodId)?.name || "Período não encontrado"
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Categoria não encontrada"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getStepStatus = (step: number) => {
    if (completedSteps.includes(step)) return "completed"
    if (currentStep === step) return "current"
    return "pending"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regras de Preços</h1>
          <p className="text-muted-foreground">Configure os preços por período, categoria e número de hóspedes</p>
        </div>

        <Button onClick={handleNewRule} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Regra
        </Button>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[900px] h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              {editingRule ? "Editar Regras de Preço" : "Novas Regras de Preço"}
              <Badge variant="outline" className="text-xs">
                Passo {currentStep} de 4
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Configure os preços e descontos para uma combinação específica de período, categoria e hóspedes.
            </DialogDescription>
          </DialogHeader>

          {/* Progress Section */}
          <div className="flex-shrink-0 px-6 pb-4 border-b bg-gray-50/50">
            <div className="space-y-3">
              {/* Overall Progress */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Progresso:</span>
                <div className="flex-1">
                  <Progress value={(completedSteps.length / 4) * 100} className="h-2" />
                </div>
                <span className="text-sm text-muted-foreground">{completedSteps.length}/4 concluído</span>
              </div>

              {/* Step Navigation */}
              <div className="flex gap-2">
                {[
                  { id: 1, label: "Básico", section: "basic-info" },
                  { id: 2, label: "Preços", section: "prices" },
                  { id: 3, label: "Desconto", section: "discount" },
                  { id: 4, label: "Resumo", section: "summary" },
                ].map((step) => {
                  const status = getStepStatus(step.id)
                  return (
                    <Button
                      key={step.id}
                      variant={status === "current" ? "default" : status === "completed" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => scrollToSection(step.section, step.id)}
                      className="flex items-center gap-1"
                    >
                      {status === "completed" && <CheckCircle className="h-3 w-3" />}
                      {status === "current" && <ArrowRight className="h-3 w-3" />}
                      <span>{step.label}</span>
                    </Button>
                  )
                })}
              </div>

              {/* Scroll Progress */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Scroll:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>
                <span>{Math.round(scrollProgress)}%</span>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-6" onScrollCapture={handleScroll} ref={scrollAreaRef}>
              <div className="space-y-8 pb-6">
                {/* Step 1: Basic Information */}
                <div data-section="basic-info" className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50/50 rounded-r">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-500 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center">
                        1
                      </span>
                      <h3 className="text-base font-semibold text-gray-900">Informações Básicas</h3>
                      <Badge variant="outline" className="text-xs">
                        Obrigatório
                      </Badge>
                      {completedSteps.includes(1) && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2" data-error="tariff_period_id">
                      <Label htmlFor="tariff_period_id" className="text-sm font-medium">
                        Período Tarifário *
                      </Label>
                      <Select
                        value={formData.tariff_period_id}
                        onValueChange={(value) => {
                          setFormData({ ...formData, tariff_period_id: value })
                          // Auto-scroll to next section if this completes step 1
                          setTimeout(() => {
                            if (value && formData.accommodation_category_id) {
                              scrollToSection("prices", 2)
                            }
                          }, 500)
                        }}
                      >
                        <SelectTrigger className={formErrors.tariff_period_id ? "border-red-500" : ""}>
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          {periods.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500">
                              Nenhum período cadastrado. Crie um período primeiro.
                            </div>
                          ) : (
                            periods.map((period) => (
                              <SelectItem key={period.id} value={period.id}>
                                {period.name} ({formatDate(period.start_date)} - {formatDate(period.end_date)})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {formErrors.tariff_period_id && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.tariff_period_id}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2" data-error="accommodation_category_id">
                      <Label htmlFor="accommodation_category_id" className="text-sm font-medium">
                        Categoria de Acomodação *
                      </Label>
                      <Select
                        value={formData.accommodation_category_id}
                        onValueChange={(value) => {
                          handleCategoryChange(value)
                          // Auto-scroll to next section if this completes step 1
                          setTimeout(() => {
                            if (value && formData.tariff_period_id) {
                              scrollToSection("prices", 2)
                            }
                          }, 500)
                        }}
                      >
                        <SelectTrigger className={formErrors.accommodation_category_id ? "border-red-500" : ""}>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name} (até {category.max_capacity} hóspedes)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.accommodation_category_id && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.accommodation_category_id}
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.tariff_period_id && formData.accommodation_category_id && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Configuração Selecionada</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Configurando preços para <strong>{getCategoryName(formData.accommodation_category_id)}</strong>{" "}
                        no período <strong>{getPeriodName(formData.tariff_period_id)}</strong>.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <ArrowDown className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">Continue para configurar os preços por hóspede</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Prices by Guest Count */}
                {formData.accommodation_category_id && (
                  <div data-section="prices" className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50/50 rounded-r">
                      <div className="flex items-center gap-2">
                        <span className="bg-green-500 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center">
                          2
                        </span>
                        <h3 className="text-base font-semibold text-gray-900">Preços por Número de Hóspedes</h3>
                        <Badge variant="outline" className="text-xs">
                          Obrigatório
                        </Badge>
                        {completedSteps.includes(2) && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-900">Configuração por Ocupação</span>
                      </div>
                      <p className="text-sm text-amber-700">
                        Configure os preços para cada quantidade de hóspedes. O preço PIX deve ser menor que o cartão.
                      </p>
                    </div>

                    <Tabs
                      value={activeGuestTab}
                      onValueChange={(value) => {
                        setActiveGuestTab(value)
                        setTimeout(() => {
                          const element = document.querySelector(`[data-state="active"][data-value="${value}"]`)
                          if (element) {
                            element.scrollIntoView({ behavior: "smooth", block: "nearest" })
                          }
                        }, 100)
                      }}
                      className="w-full"
                    >
                      <TabsList className="mb-4 w-full justify-start">
                        {guestPrices.map((price) => (
                          <TabsTrigger key={price.guests} value={price.guests.toString()} className="flex-1">
                            <Users className="mr-1 h-3 w-3" />
                            {price.guests} {price.guests === 1 ? "Hóspede" : "Hóspedes"}
                            {price.price_credit_card > 0 && price.price_pix > 0 && (
                              <CheckCircle className="ml-1 h-3 w-3 text-green-600" />
                            )}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {guestPrices.map((price) => (
                        <TabsContent key={price.guests} value={price.guests.toString()} className="space-y-4">
                          <div className="p-4 border rounded-lg bg-white">
                            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Preços para {price.guests} {price.guests === 1 ? "Hóspede" : "Hóspedes"}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2" data-error={`price_credit_card_${price.guests}`}>
                                <Label className="text-sm font-medium flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-gray-500" />
                                  Preço Cartão (R$) *
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={price.price_credit_card}
                                  onChange={(e) => {
                                    const value = Number.parseFloat(e.target.value) || 0
                                    updateGuestPrice(price.guests, "price_credit_card", value)

                                    // Auto-advance if both prices are filled
                                    setTimeout(() => {
                                      if (value > 0 && price.price_pix > 0 && value > price.price_pix) {
                                        const allPricesSet = guestPrices.every(
                                          (p) => p.price_credit_card > 0 && p.price_pix > 0,
                                        )
                                        if (allPricesSet) {
                                          scrollToSection("discount", 3)
                                        }
                                      }
                                    }, 500)
                                  }}
                                  className={formErrors[`price_credit_card_${price.guests}`] ? "border-red-500" : ""}
                                  placeholder="Ex: 250.00"
                                />
                                {formErrors[`price_credit_card_${price.guests}`] && (
                                  <div className="flex items-center gap-2 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    {formErrors[`price_credit_card_${price.guests}`]}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2" data-error={`price_pix_${price.guests}`}>
                                <Label className="text-sm font-medium flex items-center gap-2">
                                  <Wallet className="h-4 w-4 text-gray-500" />
                                  Preço PIX (R$) *
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={price.price_pix}
                                  onChange={(e) => {
                                    const value = Number.parseFloat(e.target.value) || 0
                                    updateGuestPrice(price.guests, "price_pix", value)

                                    // Auto-advance if both prices are filled
                                    setTimeout(() => {
                                      if (value > 0 && price.price_credit_card > 0 && price.price_credit_card > value) {
                                        const allPricesSet = guestPrices.every(
                                          (p) => p.price_credit_card > 0 && p.price_pix > 0,
                                        )
                                        if (allPricesSet) {
                                          scrollToSection("discount", 3)
                                        }
                                      }
                                    }, 500)
                                  }}
                                  className={formErrors[`price_pix_${price.guests}`] ? "border-red-500" : ""}
                                  placeholder="Ex: 225.00"
                                />
                                {formErrors[`price_pix_${price.guests}`] && (
                                  <div className="flex items-center gap-2 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    {formErrors[`price_pix_${price.guests}`]}
                                  </div>
                                )}
                                <p className="text-xs text-gray-500">
                                  Deve ser menor que o preço do cartão (desconto à vista)
                                </p>
                              </div>
                            </div>

                            {/* Real-time Preview */}
                            {price.price_credit_card > 0 && price.price_pix > 0 && (
                              <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <h5 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Preview para {price.guests} {price.guests === 1 ? "Hóspede" : "Hóspedes"}
                                </h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <h6 className="text-xs font-medium text-blue-800 mb-1">Com Café da Manhã</h6>
                                    <div className="space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-xs">Cartão:</span>
                                        <span className="text-xs font-medium">
                                          {formatCurrency(price.price_credit_card)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-xs">PIX:</span>
                                        <span className="text-xs font-medium text-green-600">
                                          {formatCurrency(price.price_pix)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h6 className="text-xs font-medium text-blue-800 mb-1">Sem Café da Manhã</h6>
                                    <div className="space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-xs">Cartão:</span>
                                        <span className="text-xs font-medium">
                                          {formatCurrency(
                                            Math.max(0, price.price_credit_card - formData.breakfast_discount_value),
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-xs">PIX:</span>
                                        <span className="text-xs font-medium text-green-600">
                                          {formatCurrency(
                                            Math.max(0, price.price_pix - formData.breakfast_discount_value),
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}

                {/* Step 3: Breakfast Discount */}
                <div data-section="discount" className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50/50 rounded-r">
                    <div className="flex items-center gap-2">
                      <span className="bg-orange-500 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center">
                        3
                      </span>
                      <h3 className="text-base font-semibold text-gray-900">Desconto Café da Manhã</h3>
                      <Badge variant="outline" className="text-xs">
                        Obrigatório
                      </Badge>
                      {completedSteps.includes(3) && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Coffee className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Configuração de Desconto</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Configure o desconto aplicado quando o hóspede não incluir café da manhã.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tipo de Desconto</Label>
                      <Select
                        value={formData.breakfast_discount_type}
                        onValueChange={(value: "FIXED" | "PERCENTAGE") => {
                          setFormData({ ...formData, breakfast_discount_type: value })
                          // Auto-scroll to summary if discount is configured
                          setTimeout(() => {
                            if (formData.breakfast_discount_value > 0) {
                              scrollToSection("summary", 4)
                            }
                          }, 500)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIXED">Valor Fixo (R$)</SelectItem>
                          <SelectItem value="PERCENTAGE">Percentual (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2" data-error="breakfast_discount_value">
                      <Label className="text-sm font-medium">
                        Valor do Desconto {formData.breakfast_discount_type === "PERCENTAGE" ? "(%)" : "(R$)"}
                      </Label>
                      <Input
                        type="number"
                        step={formData.breakfast_discount_type === "PERCENTAGE" ? "0.1" : "0.01"}
                        min="0"
                        max={formData.breakfast_discount_type === "PERCENTAGE" ? "100" : undefined}
                        value={formData.breakfast_discount_value}
                        onChange={(e) => {
                          const value = Number.parseFloat(e.target.value) || 0
                          setFormData({ ...formData, breakfast_discount_value: value })

                          // Auto-scroll to summary when discount is set
                          setTimeout(() => {
                            if (value > 0) {
                              scrollToSection("summary", 4)
                            }
                          }, 500)
                        }}
                        className={formErrors.breakfast_discount_value ? "border-red-500" : ""}
                        placeholder={formData.breakfast_discount_type === "PERCENTAGE" ? "Ex: 10" : "Ex: 25.00"}
                      />
                      {formErrors.breakfast_discount_value && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.breakfast_discount_value}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {formErrors.general_prices && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Erro de Validação</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{formErrors.general_prices}</p>
                  </div>
                )}

                {/* Step 4: Summary */}
                {previewData && (
                  <div data-section="summary" className="space-y-4">
                    <div className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50/50 rounded-r">
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-500 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center">
                          4
                        </span>
                        <h3 className="text-base font-semibold text-gray-900">Resumo das Regras</h3>
                        <Badge variant="outline" className="text-xs">
                          Revisão Final
                        </Badge>
                        {completedSteps.includes(4) && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-4 w-4 text-gray-600" />
                        <h4 className="text-sm font-medium">Configuração Final</h4>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">Período:</span>
                            <span>{previewData.period}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Categoria:</span>
                            <span>{previewData.category}</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Desconto Café:</span>
                          <span>
                            {previewData.discount.type === "FIXED"
                              ? formatCurrency(previewData.discount.value)
                              : `${previewData.discount.value}%`}
                          </span>
                        </div>

                        <div className="border-t pt-3">
                          <h5 className="text-xs font-medium mb-3">Preços por Ocupação:</h5>
                          <div className="space-y-3">
                            {previewData.prices.map((price: any) => (
                              <div key={price.guests} className="bg-white p-3 rounded border">
                                <h6 className="text-sm font-medium mb-2">
                                  {price.guests} {price.guests === 1 ? "Hóspede" : "Hóspedes"}
                                </h6>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <div className="font-medium text-gray-700 mb-1">Com Café</div>
                                    <div className="space-y-1">
                                      <div className="flex justify-between">
                                        <span>Cartão:</span>
                                        <span className="font-medium">
                                          {formatCurrency(price.withBreakfast.creditCard)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>PIX:</span>
                                        <span className="font-medium text-green-600">
                                          {formatCurrency(price.withBreakfast.pix)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-700 mb-1">Sem Café</div>
                                    <div className="space-y-1">
                                      <div className="flex justify-between">
                                        <span>Cartão:</span>
                                        <span className="font-medium">
                                          {formatCurrency(price.withoutBreakfast.creditCard)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>PIX:</span>
                                        <span className="font-medium text-green-600">
                                          {formatCurrency(price.withoutBreakfast.pix)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Pronto para Salvar</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Todas as informações foram preenchidas. Clique em "Criar Regras" para finalizar.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4 bg-white">
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-muted-foreground">{completedSteps.length}/4 etapas concluídas</div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || completedSteps.length < 3}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingRule ? "Atualizar" : "Criar"} Regras
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rules List */}
      <div className="grid gap-4">
        {periods.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum período cadastrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Você precisa criar pelo menos um período tarifário antes de definir regras de preço.
              </p>
              <Button onClick={() => (window.location.href = "/client/periodos-tarifarios")}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Período Tarifário
              </Button>
            </CardContent>
          </Card>
        ) : rules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma regra cadastrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece criando sua primeira regra de preço para definir as tarifas por período e categoria.
              </p>
              <Button onClick={handleNewRule} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Regra
              </Button>
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => {
            const discountPreview = {
              creditCard:
                rule.breakfast_discount_type === "FIXED"
                  ? Math.max(0, rule.price_credit_card - rule.breakfast_discount_value)
                  : rule.price_credit_card * (1 - rule.breakfast_discount_value / 100),
              pix:
                rule.breakfast_discount_type === "FIXED"
                  ? Math.max(0, rule.price_pix - rule.breakfast_discount_value)
                  : rule.price_pix * (1 - rule.breakfast_discount_value / 100),
            }

            return (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryName(rule.accommodation_category_id)}
                        <Badge variant="secondary">
                          <Users className="mr-1 h-3 w-3" />
                          {rule.number_of_guests} hóspede{rule.number_of_guests > 1 ? "s" : ""}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{getPeriodName(rule.tariff_period_id)}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(rule)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Coffee className="h-4 w-4" />
                        Com Café da Manhã
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Cartão:</span>
                          <span className="font-medium">{formatCurrency(rule.price_credit_card)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">PIX:</span>
                          <span className="font-medium text-green-600">{formatCurrency(rule.price_pix)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Sem Café da Manhã</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Cartão:</span>
                          <span className="font-medium">{formatCurrency(discountPreview.creditCard)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">PIX:</span>
                          <span className="font-medium text-green-600">{formatCurrency(discountPreview.pix)}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Desconto:{" "}
                        {rule.breakfast_discount_type === "FIXED"
                          ? formatCurrency(rule.breakfast_discount_value)
                          : `${rule.breakfast_discount_value}%`}
                      </div>
                    </div>
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
