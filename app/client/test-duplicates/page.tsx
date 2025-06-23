"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Shield,
  RefreshCw,
  Play,
  Database,
  AlertCircle,
  Info,
} from "lucide-react"
import { pricingDataService } from "@/lib/services/pricing-data-service"
import type { PriceRule, TariffPeriod } from "@/lib/types/pricing"

interface DuplicateTestCase {
  id: string
  name: string
  description: string
  category: "exact" | "partial" | "edge"
  severity: "critical" | "warning" | "info"
  setup: () => Promise<void>
  test: () => Promise<{ success: boolean; message: string; details?: any }>
  cleanup?: () => Promise<void>
}

interface TestResult {
  testId: string
  status: "pending" | "running" | "passed" | "failed" | "warning"
  message: string
  executionTime: number
  details?: any
  timestamp: Date
}

export default function DuplicatePreventionTestPage() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [existingRules, setExistingRules] = useState<PriceRule[]>([])
  const [periods, setPeriods] = useState<TariffPeriod[]>([])

  // Mock categories for testing
  const categories = [
    { id: "cat-standard", name: "Standard", max_capacity: 4 },
    { id: "cat-super-luxo", name: "Super Luxo", max_capacity: 3 },
    { id: "cat-master", name: "Master", max_capacity: 2 },
  ]

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = () => {
    try {
      const allPeriods = pricingDataService.getTariffPeriods()
      const allRules = pricingDataService.getPriceRules()
      setPeriods(allPeriods)
      setExistingRules(allRules)
    } catch (error) {
      console.error("Error loading initial data:", error)
      // Use fallback data
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
      setExistingRules([])
    }
  }

  const duplicateTests: DuplicateTestCase[] = [
    {
      id: "exact-duplicate",
      name: "Duplicata Exata",
      description: "Tenta criar uma regra idêntica a uma existente",
      category: "exact",
      severity: "critical",
      setup: async () => {
        // Create a base rule first
        const baseRule = {
          tariff_period_id: periods[0]?.id || "1",
          accommodation_category_id: "cat-standard",
          number_of_guests: 2,
          price_credit_card: 200,
          price_pix: 180,
          breakfast_discount_type: "FIXED" as const,
          breakfast_discount_value: 25,
        }
        pricingDataService.createPriceRule(baseRule)
      },
      test: async () => {
        try {
          // Try to create the exact same rule
          const duplicateRule = {
            tariff_period_id: periods[0]?.id || "1",
            accommodation_category_id: "cat-standard",
            number_of_guests: 2,
            price_credit_card: 200,
            price_pix: 180,
            breakfast_discount_type: "FIXED" as const,
            breakfast_discount_value: 25,
          }

          // Check if duplicate exists before creating
          const existingRules = pricingDataService.getPriceRules()
          const isDuplicate = existingRules.some(
            (rule) =>
              rule.tariff_period_id === duplicateRule.tariff_period_id &&
              rule.accommodation_category_id === duplicateRule.accommodation_category_id &&
              rule.number_of_guests === duplicateRule.number_of_guests,
          )

          if (isDuplicate) {
            return {
              success: true,
              message: "✅ Duplicata detectada e prevenida corretamente",
              details: { duplicateRule, existingCount: existingRules.length },
            }
          } else {
            // If no duplicate detected, try to create and see what happens
            pricingDataService.createPriceRule(duplicateRule)
            return {
              success: false,
              message: "❌ Duplicata não foi detectada - regra criada incorretamente",
              details: { duplicateRule },
            }
          }
        } catch (error) {
          return {
            success: true,
            message: "✅ Erro capturado corretamente ao tentar criar duplicata",
            details: { error: error.message },
          }
        }
      },
    },
    {
      id: "same-period-category-different-guests",
      name: "Mesmo Período/Categoria, Hóspedes Diferentes",
      description: "Verifica se permite diferentes números de hóspedes para mesma categoria/período",
      category: "partial",
      severity: "info",
      setup: async () => {
        const baseRule = {
          tariff_period_id: periods[0]?.id || "1",
          accommodation_category_id: "cat-super-luxo",
          number_of_guests: 2,
          price_credit_card: 300,
          price_pix: 270,
          breakfast_discount_type: "PERCENTAGE" as const,
          breakfast_discount_value: 10,
        }
        pricingDataService.createPriceRule(baseRule)
      },
      test: async () => {
        try {
          // Try to create rule with different guest count
          const newRule = {
            tariff_period_id: periods[0]?.id || "1",
            accommodation_category_id: "cat-super-luxo",
            number_of_guests: 3, // Different guest count
            price_credit_card: 350,
            price_pix: 315,
            breakfast_discount_type: "PERCENTAGE" as const,
            breakfast_discount_value: 10,
          }

          const existingRules = pricingDataService.getPriceRules()
          const isDuplicate = existingRules.some(
            (rule) =>
              rule.tariff_period_id === newRule.tariff_period_id &&
              rule.accommodation_category_id === newRule.accommodation_category_id &&
              rule.number_of_guests === newRule.number_of_guests,
          )

          if (!isDuplicate) {
            pricingDataService.createPriceRule(newRule)
            return {
              success: true,
              message: "✅ Regra com número diferente de hóspedes criada corretamente",
              details: { newRule, allowedDifference: "number_of_guests" },
            }
          } else {
            return {
              success: false,
              message: "❌ Regra válida foi incorretamente bloqueada",
              details: { newRule },
            }
          }
        } catch (error) {
          return {
            success: false,
            message: "❌ Erro inesperado ao criar regra válida",
            details: { error: error.message },
          }
        }
      },
    },
    {
      id: "different-period-same-category",
      name: "Período Diferente, Mesma Categoria",
      description: "Verifica se permite mesma categoria em períodos diferentes",
      category: "partial",
      severity: "info",
      setup: async () => {
        const baseRule = {
          tariff_period_id: periods[0]?.id || "1",
          accommodation_category_id: "cat-master",
          number_of_guests: 2,
          price_credit_card: 400,
          price_pix: 360,
          breakfast_discount_type: "FIXED" as const,
          breakfast_discount_value: 30,
        }
        pricingDataService.createPriceRule(baseRule)
      },
      test: async () => {
        try {
          // Try to create rule for different period
          const newRule = {
            tariff_period_id: periods[1]?.id || "2", // Different period
            accommodation_category_id: "cat-master",
            number_of_guests: 2,
            price_credit_card: 500,
            price_pix: 450,
            breakfast_discount_type: "FIXED" as const,
            breakfast_discount_value: 40,
          }

          const existingRules = pricingDataService.getPriceRules()
          const isDuplicate = existingRules.some(
            (rule) =>
              rule.tariff_period_id === newRule.tariff_period_id &&
              rule.accommodation_category_id === newRule.accommodation_category_id &&
              rule.number_of_guests === newRule.number_of_guests,
          )

          if (!isDuplicate) {
            pricingDataService.createPriceRule(newRule)
            return {
              success: true,
              message: "✅ Regra para período diferente criada corretamente",
              details: { newRule, allowedDifference: "tariff_period_id" },
            }
          } else {
            return {
              success: false,
              message: "❌ Regra válida foi incorretamente bloqueada",
              details: { newRule },
            }
          }
        } catch (error) {
          return {
            success: false,
            message: "❌ Erro inesperado ao criar regra válida",
            details: { error: error.message },
          }
        }
      },
    },
    {
      id: "multiple-guests-same-config",
      name: "Múltiplos Hóspedes - Mesma Configuração",
      description: "Testa criação de múltiplas regras para diferentes números de hóspedes",
      category: "partial",
      severity: "warning",
      setup: async () => {
        // Clean slate for this test
      },
      test: async () => {
        try {
          const baseConfig = {
            tariff_period_id: periods[1]?.id || "2",
            accommodation_category_id: "cat-standard",
            breakfast_discount_type: "PERCENTAGE" as const,
            breakfast_discount_value: 15,
          }

          const guestConfigs = [
            { guests: 1, credit: 150, pix: 135 },
            { guests: 2, credit: 200, pix: 180 },
            { guests: 3, credit: 250, pix: 225 },
            { guests: 4, credit: 300, pix: 270 },
          ]

          const createdRules = []
          const errors = []

          for (const config of guestConfigs) {
            try {
              const rule = {
                ...baseConfig,
                number_of_guests: config.guests,
                price_credit_card: config.credit,
                price_pix: config.pix,
              }

              const existingRules = pricingDataService.getPriceRules()
              const isDuplicate = existingRules.some(
                (r) =>
                  r.tariff_period_id === rule.tariff_period_id &&
                  r.accommodation_category_id === rule.accommodation_category_id &&
                  r.number_of_guests === rule.number_of_guests,
              )

              if (!isDuplicate) {
                const newRule = pricingDataService.createPriceRule(rule)
                createdRules.push(newRule)
              } else {
                errors.push(`Duplicata detectada para ${config.guests} hóspedes`)
              }
            } catch (error) {
              errors.push(`Erro ao criar regra para ${config.guests} hóspedes: ${error.message}`)
            }
          }

          return {
            success: createdRules.length > 0 && errors.length === 0,
            message: `✅ ${createdRules.length} regras criadas, ${errors.length} erros`,
            details: { createdRules, errors, totalAttempted: guestConfigs.length },
          }
        } catch (error) {
          return {
            success: false,
            message: "❌ Erro geral no teste de múltiplas regras",
            details: { error: error.message },
          }
        }
      },
    },
    {
      id: "edit-existing-rule",
      name: "Edição de Regra Existente",
      description: "Verifica se a edição de regras existentes funciona corretamente",
      category: "edge",
      severity: "critical",
      setup: async () => {
        const baseRule = {
          tariff_period_id: periods[0]?.id || "1",
          accommodation_category_id: "cat-standard",
          number_of_guests: 1,
          price_credit_card: 120,
          price_pix: 108,
          breakfast_discount_type: "FIXED" as const,
          breakfast_discount_value: 20,
        }
        pricingDataService.createPriceRule(baseRule)
      },
      test: async () => {
        try {
          const existingRules = pricingDataService.getPriceRules()
          const ruleToEdit = existingRules.find(
            (r) =>
              r.tariff_period_id === (periods[0]?.id || "1") &&
              r.accommodation_category_id === "cat-standard" &&
              r.number_of_guests === 1,
          )

          if (!ruleToEdit) {
            return {
              success: false,
              message: "❌ Regra base para edição não encontrada",
              details: { existingRules },
            }
          }

          // Try to update the rule
          const updatedRule = pricingDataService.updatePriceRule(ruleToEdit.id, {
            price_credit_card: 130,
            price_pix: 117,
            breakfast_discount_value: 25,
          })

          if (updatedRule) {
            return {
              success: true,
              message: "✅ Regra editada com sucesso",
              details: { originalRule: ruleToEdit, updatedRule },
            }
          } else {
            return {
              success: false,
              message: "❌ Falha ao editar regra existente",
              details: { ruleToEdit },
            }
          }
        } catch (error) {
          return {
            success: false,
            message: "❌ Erro ao editar regra",
            details: { error: error.message },
          }
        }
      },
    },
    {
      id: "bulk-duplicate-prevention",
      name: "Prevenção em Lote",
      description: "Testa prevenção de duplicatas ao criar múltiplas regras simultaneamente",
      category: "edge",
      severity: "critical",
      setup: async () => {
        // Create some base rules
        const baseRules = [
          {
            tariff_period_id: periods[0]?.id || "1",
            accommodation_category_id: "cat-standard",
            number_of_guests: 1,
            price_credit_card: 100,
            price_pix: 90,
            breakfast_discount_type: "FIXED" as const,
            breakfast_discount_value: 15,
          },
          {
            tariff_period_id: periods[0]?.id || "1",
            accommodation_category_id: "cat-standard",
            number_of_guests: 2,
            price_credit_card: 150,
            price_pix: 135,
            breakfast_discount_type: "FIXED" as const,
            breakfast_discount_value: 15,
          },
        ]

        for (const rule of baseRules) {
          pricingDataService.createPriceRule(rule)
        }
      },
      test: async () => {
        try {
          const duplicateAttempts = [
            {
              tariff_period_id: periods[0]?.id || "1",
              accommodation_category_id: "cat-standard",
              number_of_guests: 1, // Duplicate
              price_credit_card: 110,
              price_pix: 99,
              breakfast_discount_type: "FIXED" as const,
              breakfast_discount_value: 20,
            },
            {
              tariff_period_id: periods[0]?.id || "1",
              accommodation_category_id: "cat-standard",
              number_of_guests: 3, // New - should succeed
              price_credit_card: 200,
              price_pix: 180,
              breakfast_discount_type: "FIXED" as const,
              breakfast_discount_value: 15,
            },
            {
              tariff_period_id: periods[0]?.id || "1",
              accommodation_category_id: "cat-standard",
              number_of_guests: 2, // Duplicate
              price_credit_card: 160,
              price_pix: 144,
              breakfast_discount_type: "FIXED" as const,
              breakfast_discount_value: 20,
            },
          ]

          const results = {
            prevented: 0,
            created: 0,
            errors: [] as string[],
          }

          for (const attempt of duplicateAttempts) {
            try {
              const existingRules = pricingDataService.getPriceRules()
              const isDuplicate = existingRules.some(
                (rule) =>
                  rule.tariff_period_id === attempt.tariff_period_id &&
                  rule.accommodation_category_id === attempt.accommodation_category_id &&
                  rule.number_of_guests === attempt.number_of_guests,
              )

              if (isDuplicate) {
                results.prevented++
              } else {
                pricingDataService.createPriceRule(attempt)
                results.created++
              }
            } catch (error) {
              results.errors.push(`Erro para ${attempt.number_of_guests} hóspedes: ${error.message}`)
            }
          }

          const expectedPrevented = 2 // guests 1 and 2 should be prevented
          const expectedCreated = 1 // guests 3 should be created

          const success = results.prevented === expectedPrevented && results.created === expectedCreated

          return {
            success,
            message: success ? "✅ Prevenção em lote funcionando corretamente" : "❌ Prevenção em lote com problemas",
            details: {
              results,
              expected: { prevented: expectedPrevented, created: expectedCreated },
            },
          }
        } catch (error) {
          return {
            success: false,
            message: "❌ Erro no teste de prevenção em lote",
            details: { error: error.message },
          }
        }
      },
    },
  ]

  const runTest = async (test: DuplicateTestCase): Promise<TestResult> => {
    const startTime = Date.now()
    setCurrentTest(test.id)

    setTestResults((prev) => ({
      ...prev,
      [test.id]: {
        testId: test.id,
        status: "running",
        message: "Executando...",
        executionTime: 0,
        timestamp: new Date(),
      },
    }))

    try {
      // Setup
      if (test.setup) {
        await test.setup()
      }

      // Execute test
      const result = await test.test()
      const executionTime = Date.now() - startTime

      // Cleanup
      if (test.cleanup) {
        await test.cleanup()
      }

      const testResult: TestResult = {
        testId: test.id,
        status: result.success ? "passed" : "failed",
        message: result.message,
        executionTime,
        details: result.details,
        timestamp: new Date(),
      }

      setTestResults((prev) => ({
        ...prev,
        [test.id]: testResult,
      }))

      return testResult
    } catch (error) {
      const executionTime = Date.now() - startTime
      const testResult: TestResult = {
        testId: test.id,
        status: "failed",
        message: `Erro durante execução: ${error.message}`,
        executionTime,
        details: { error },
        timestamp: new Date(),
      }

      setTestResults((prev) => ({
        ...prev,
        [test.id]: testResult,
      }))

      return testResult
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setProgress(0)

    // Clear existing data for clean test
    try {
      const existingRules = pricingDataService.getPriceRules()
      for (const rule of existingRules) {
        pricingDataService.deletePriceRule(rule.id)
      }
    } catch (error) {
      console.warn("Error clearing existing rules:", error)
    }

    for (let i = 0; i < duplicateTests.length; i++) {
      const test = duplicateTests[i]
      await runTest(test)
      setProgress(((i + 1) / duplicateTests.length) * 100)

      // Small delay between tests for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setCurrentTest(null)
    setIsRunning(false)
    setProgress(100)
  }

  const resetTests = () => {
    setTestResults({})
    setProgress(0)
    setCurrentTest(null)

    // Clear all rules for fresh start
    try {
      const existingRules = pricingDataService.getPriceRules()
      for (const rule of existingRules) {
        pricingDataService.deletePriceRule(rule.id)
      }
      setExistingRules([])
    } catch (error) {
      console.warn("Error clearing rules:", error)
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return "border-green-200 bg-green-50"
      case "failed":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "running":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getSeverityColor = (severity: DuplicateTestCase["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const testsByCategory = {
    exact: duplicateTests.filter((t) => t.category === "exact"),
    partial: duplicateTests.filter((t) => t.category === "partial"),
    edge: duplicateTests.filter((t) => t.category === "edge"),
  }

  const totalTests = duplicateTests.length
  const completedTests = Object.keys(testResults).length
  const passedTests = Object.values(testResults).filter((r) => r.status === "passed").length
  const failedTests = Object.values(testResults).filter((r) => r.status === "failed").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teste de Prevenção de Duplicatas</h1>
          <p className="text-muted-foreground">Verificação abrangente do sistema de prevenção de regras duplicadas</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={resetTests} variant="outline" disabled={isRunning}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
          <Button onClick={runAllTests} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? "Executando..." : "Executar Todos"}
          </Button>
        </div>
      </div>

      {/* Progress and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedTests}/{totalTests} testes concluídos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Aprovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{passedTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Falharam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              Regras Existentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{existingRules.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Test Indicator */}
      {currentTest && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="font-medium text-blue-900">
                  Executando: {duplicateTests.find((t) => t.id === currentTest)?.name}
                </p>
                <p className="text-sm text-blue-700">{duplicateTests.find((t) => t.id === currentTest)?.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results by Category */}
      <Tabs defaultValue="exact" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exact" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Duplicatas Exatas ({testsByCategory.exact.length})
          </TabsTrigger>
          <TabsTrigger value="partial" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Duplicatas Parciais ({testsByCategory.partial.length})
          </TabsTrigger>
          <TabsTrigger value="edge" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Casos Extremos ({testsByCategory.edge.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(testsByCategory).map(([category, tests]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {tests.map((test) => {
                const result = testResults[test.id]
                return (
                  <Card
                    key={test.id}
                    className={`transition-all duration-200 ${
                      result ? getStatusColor(result.status) : "border-gray-200"
                    } ${currentTest === test.id ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result ? getStatusIcon(result.status) : getStatusIcon("pending")}
                          <div>
                            <CardTitle className="text-base">{test.name}</CardTitle>
                            <CardDescription>{test.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(test.severity)}>{test.severity}</Badge>
                          {result && (
                            <Badge variant="outline" className="text-xs">
                              {result.executionTime}ms
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {result && (
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{result.message}</p>
                          </div>

                          {result.details && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                                Ver detalhes técnicos
                              </summary>
                              <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Executado em: {result.timestamp.toLocaleTimeString()}</span>
                            <span>Duração: {result.executionTime}ms</span>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Test Summary */}
      {completedTests > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Resumo dos Testes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <p className="text-sm text-gray-600">Testes Aprovados</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <p className="text-sm text-gray-600">Testes Falharam</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {completedTests > 0 ? Math.round((passedTests / completedTests) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
              </div>
            </div>

            {completedTests === totalTests && (
              <div className="mt-4 p-4 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2">Conclusão:</h4>
                <p className="text-sm text-gray-700">
                  {passedTests === totalTests
                    ? "🎉 Todos os testes passaram! O sistema de prevenção de duplicatas está funcionando corretamente."
                    : failedTests > 0
                      ? `⚠️ ${failedTests} teste(s) falharam. Revise a lógica de prevenção de duplicatas.`
                      : "✅ Testes concluídos com sucesso."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
