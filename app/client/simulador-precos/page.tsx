"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calculator, CreditCard, Wallet, Coffee, Users, AlertCircle, Check, Calendar } from "lucide-react"
import { pricingService } from "@/lib/services/pricing-service"
import type { PricingRequest, PricingResult, AccommodationCategory } from "@/lib/types/pricing"
import { useToast } from "@/hooks/use-toast"

export default function PriceSimulatorPage() {
  const [categories, setCategories] = useState<AccommodationCategory[]>([
    { id: "cat-standard", name: "Standard", description: "Quarto Standard", max_guests: 4 },
    { id: "cat-super-luxo", name: "Super Luxo", description: "Quarto Super Luxo", max_guests: 3 },
    { id: "cat-master", name: "Master", description: "Quarto Master", max_guests: 2 },
  ])
  const [simulationRequest, setSimulationRequest] = useState<PricingRequest>({
    check_in: "",
    check_out: "",
    category_id: "",
    number_of_guests: 2,
    include_breakfast: true,
  })
  const [simulationResult, setSimulationResult] = useState<PricingResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [activePaymentTab, setActivePaymentTab] = useState<"credit_card" | "pix">("credit_card")
  const { toast } = useToast()

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!simulationRequest.check_in) {
      errors.check_in = "Data de check-in é obrigatória"
    }

    if (!simulationRequest.check_out) {
      errors.check_out = "Data de check-out é obrigatória"
    }

    if (simulationRequest.check_in && simulationRequest.check_out) {
      const checkIn = new Date(simulationRequest.check_in)
      const checkOut = new Date(simulationRequest.check_out)

      if (checkOut <= checkIn) {
        errors.check_out = "Data de check-out deve ser posterior à data de check-in"
      }
    }

    if (!simulationRequest.category_id) {
      errors.category_id = "Categoria é obrigatória"
    }

    if (simulationRequest.number_of_guests < 1) {
      errors.number_of_guests = "Número de hóspedes deve ser pelo menos 1"
    }

    const selectedCategory = categories.find((c) => c.id === simulationRequest.category_id)
    if (selectedCategory && simulationRequest.number_of_guests > selectedCategory.max_guests) {
      errors.number_of_guests = `Máximo de ${selectedCategory.max_guests} hóspedes para esta categoria`
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSimulate = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSimulationResult(null)

    try {
      const result = await pricingService.calculatePrice(simulationRequest)
      setSimulationResult(result)

      if (!result.success) {
        toast({
          title: "Erro na simulação",
          description: result.error || "Não foi possível calcular o preço para o período selecionado.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao simular o preço.",
        variant: "destructive",
      })
      setSimulationResult(null)
    } finally {
      setIsLoading(false)
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

  const calculateNights = () => {
    if (!simulationRequest.check_in || !simulationRequest.check_out) return 0

    const checkIn = new Date(simulationRequest.check_in)
    const checkOut = new Date(simulationRequest.check_out)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Simulador de Preços</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Simule os preços das acomodações para diferentes períodos e configurações. Compare valores entre formas de
          pagamento e visualize o breakdown completo.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className={`grid grid-cols-1 gap-6 ${simulationResult?.success ? "lg:grid-cols-5" : "lg:grid-cols-1"}`}>
          <div className={simulationResult?.success ? "lg:col-span-2" : "lg:col-span-1"}>
            <Card className={simulationResult?.success ? "sticky top-6" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Dados da Simulação
                </CardTitle>
                <CardDescription>Preencha os dados para calcular o preço</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="check_in">Check-in</Label>
                    <Input
                      id="check_in"
                      type="date"
                      value={simulationRequest.check_in}
                      onChange={(e) => setSimulationRequest({ ...simulationRequest, check_in: e.target.value })}
                      className={formErrors.check_in ? "border-red-500" : ""}
                    />
                    {formErrors.check_in && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.check_in}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="check_out">Check-out</Label>
                    <Input
                      id="check_out"
                      type="date"
                      value={simulationRequest.check_out}
                      onChange={(e) => setSimulationRequest({ ...simulationRequest, check_out: e.target.value })}
                      className={formErrors.check_out ? "border-red-500" : ""}
                    />
                    {formErrors.check_out && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {formErrors.check_out}
                      </div>
                    )}
                  </div>
                </div>

                {simulationRequest.check_in && simulationRequest.check_out && calculateNights() > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-900">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">{calculateNights()} noites</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      De {formatDate(simulationRequest.check_in)} até {formatDate(simulationRequest.check_out)}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="category_id">Categoria da Acomodação</Label>
                  <Select
                    value={simulationRequest.category_id}
                    onValueChange={(value) => {
                      const category = categories.find((c) => c.id === value)
                      setSimulationRequest({
                        ...simulationRequest,
                        category_id: value,
                        number_of_guests: Math.min(simulationRequest.number_of_guests, category?.max_guests || 1),
                      })
                    }}
                  >
                    <SelectTrigger className={formErrors.category_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-sm text-muted-foreground">Até {category.max_guests} hóspedes</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category_id && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.category_id}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number_of_guests">Número de Hóspedes</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSimulationRequest({
                          ...simulationRequest,
                          number_of_guests: Math.max(1, simulationRequest.number_of_guests - 1),
                        })
                      }
                      disabled={simulationRequest.number_of_guests <= 1}
                    >
                      -
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{simulationRequest.number_of_guests}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const selectedCategory = categories.find((c) => c.id === simulationRequest.category_id)
                        const maxGuests = selectedCategory?.max_guests || 10
                        setSimulationRequest({
                          ...simulationRequest,
                          number_of_guests: Math.min(maxGuests, simulationRequest.number_of_guests + 1),
                        })
                      }}
                      disabled={
                        !simulationRequest.category_id ||
                        simulationRequest.number_of_guests >=
                          (categories.find((c) => c.id === simulationRequest.category_id)?.max_guests || 10)
                      }
                    >
                      +
                    </Button>
                  </div>
                  {formErrors.number_of_guests && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {formErrors.number_of_guests}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Incluir Café da Manhã</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include_breakfast"
                        checked={simulationRequest.include_breakfast}
                        onChange={(e) =>
                          setSimulationRequest({ ...simulationRequest, include_breakfast: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Coffee className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <Button type="button" className="w-full" onClick={handleSimulate} disabled={isLoading} size="lg">
                  {isLoading ? "Calculando..." : "Simular Preço"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {simulationResult?.success && simulationResult.pricing_details ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Resultado da Simulação</span>
                      <Badge variant="outline" className="text-sm">
                        {simulationResult.pricing_details.tariff_period.name}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {formatDate(simulationRequest.check_in)} até {formatDate(simulationRequest.check_out)} •{" "}
                      {simulationResult.pricing_details.total_nights} noites • {simulationRequest.number_of_guests}{" "}
                      hóspede{simulationRequest.number_of_guests > 1 ? "s" : ""}
                      {simulationRequest.include_breakfast && " • Com café da manhã"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Formas de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      value={activePaymentTab}
                      onValueChange={(v) => setActivePaymentTab(v as "credit_card" | "pix")}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="credit_card" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Cartão de Crédito
                        </TabsTrigger>
                        <TabsTrigger value="pix" className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          PIX
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="credit_card" className="space-y-4 mt-6">
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Valor da diária:</span>
                            <span className="font-semibold">
                              {formatCurrency(
                                simulationRequest.include_breakfast
                                  ? simulationResult.pricing_details.daily_rate_with_breakfast.credit_card
                                  : simulationResult.pricing_details.daily_rate_without_breakfast.credit_card,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Número de diárias:</span>
                            <span className="font-semibold">{simulationResult.pricing_details.total_nights}</span>
                          </div>
                          <div className="border-t pt-4 flex justify-between items-center">
                            <span className="text-lg font-bold">Valor total:</span>
                            <span className="text-2xl font-bold text-primary">
                              {formatCurrency(
                                simulationResult.pricing_details.selected_option.payment_options.total_credit_card,
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                          <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Pagamento com Cartão de Crédito</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Você pode parcelar em até 12x (sujeito a juros da operadora do cartão)
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="pix" className="space-y-4 mt-6">
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Valor da diária:</span>
                            <span className="font-semibold">
                              {formatCurrency(
                                simulationRequest.include_breakfast
                                  ? simulationResult.pricing_details.daily_rate_with_breakfast.pix
                                  : simulationResult.pricing_details.daily_rate_without_breakfast.pix,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Número de diárias:</span>
                            <span className="font-semibold">{simulationResult.pricing_details.total_nights}</span>
                          </div>
                          <div className="border-t pt-4 flex justify-between items-center">
                            <span className="text-lg font-bold">Valor total:</span>
                            <span className="text-2xl font-bold text-green-600">
                              {formatCurrency(
                                simulationResult.pricing_details.selected_option.payment_options.total_pix,
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-900">Economize com PIX</p>
                            <p className="text-xs text-green-700 mt-1">
                              Economia de{" "}
                              {formatCurrency(
                                simulationResult.pricing_details.selected_option.payment_options.total_credit_card -
                                  simulationResult.pricing_details.selected_option.payment_options.total_pix,
                              )}{" "}
                              em relação ao pagamento com cartão
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes da Simulação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Período tarifário:</span>
                          <div className="font-medium">{simulationResult.pricing_details.tariff_period.name}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Categoria:</span>
                          <div className="font-medium">
                            {categories.find((c) => c.id === simulationRequest.category_id)?.name}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Número de hóspedes:</span>
                          <div className="font-medium">{simulationRequest.number_of_guests}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Café da manhã:</span>
                          <div className="font-medium">
                            {simulationRequest.include_breakfast ? "Incluído" : "Não incluído"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : simulationResult && !simulationResult.success ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Não foi possível calcular o preço</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {simulationResult.error || "Não há regras de preço configuradas para o período selecionado."}
                  </p>
                  <Button onClick={() => (window.location.href = "/client/regras-precos")}>
                    Configurar Regras de Preço
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
