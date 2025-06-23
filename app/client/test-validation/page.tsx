"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, AlertTriangle, Play, RotateCcw, TestTube, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TestCase {
  id: string
  name: string
  description: string
  category: "validation" | "submission" | "edge-case"
  severity: "critical" | "warning" | "info"
  testData: any
  expectedResult: "pass" | "fail" | "warning"
  actualResult?: "pass" | "fail" | "warning" | "pending"
  errorMessage?: string
  executionTime?: number
}

export default function ValidationTestPage() {
  const [testResults, setTestResults] = useState<TestCase[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [summary, setSummary] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  })
  const { toast } = useToast()

  const testCases: TestCase[] = [
    // Basic Validation Tests
    {
      id: "val-001",
      name: "Empty Form Validation",
      description: "Test validation when all fields are empty",
      category: "validation",
      severity: "critical",
      testData: {
        tariff_period_id: "",
        accommodation_category_id: "",
        guestPrices: [
          { guests: 1, price_credit_card: 0, price_pix: 0 },
          { guests: 2, price_credit_card: 0, price_pix: 0 },
        ],
        breakfast_discount_value: 0,
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "fail",
    },
    {
      id: "val-002",
      name: "Missing Period Validation",
      description: "Test validation when period is not selected",
      category: "validation",
      severity: "critical",
      testData: {
        tariff_period_id: "",
        accommodation_category_id: "cat-standard",
        guestPrices: [
          { guests: 1, price_credit_card: 200, price_pix: 180 },
          { guests: 2, price_credit_card: 250, price_pix: 225 },
        ],
        breakfast_discount_value: 25,
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "fail",
    },
    {
      id: "val-003",
      name: "Missing Category Validation",
      description: "Test validation when category is not selected",
      category: "validation",
      severity: "critical",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "",
        guestPrices: [
          { guests: 1, price_credit_card: 200, price_pix: 180 },
          { guests: 2, price_credit_card: 250, price_pix: 225 },
        ],
        breakfast_discount_value: 25,
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "fail",
    },
    {
      id: "val-004",
      name: "No Valid Prices Validation",
      description: "Test validation when no guest prices are configured",
      category: "validation",
      severity: "critical",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "cat-standard",
        guestPrices: [
          { guests: 1, price_credit_card: 0, price_pix: 0 },
          { guests: 2, price_credit_card: 0, price_pix: 0 },
        ],
        breakfast_discount_value: 25,
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "fail",
    },
    {
      id: "val-005",
      name: "PIX Higher Than Credit Card",
      description: "Test validation when PIX price is higher than credit card",
      category: "validation",
      severity: "critical",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "cat-standard",
        guestPrices: [
          { guests: 1, price_credit_card: 180, price_pix: 200 }, // PIX > Credit Card
          { guests: 2, price_credit_card: 250, price_pix: 225 },
        ],
        breakfast_discount_value: 25,
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "fail",
    },
    {
      id: "val-006",
      name: "Negative Discount Validation",
      description: "Test validation when discount is negative",
      category: "validation",
      severity: "critical",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "cat-standard",
        guestPrices: [
          { guests: 1, price_credit_card: 200, price_pix: 180 },
          { guests: 2, price_credit_card: 250, price_pix: 225 },
        ],
        breakfast_discount_value: -10, // Negative discount
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "fail",
    },
    {
      id: "val-007",
      name: "Percentage Over 100% Validation",
      description: "Test validation when percentage discount is over 100%",
      category: "validation",
      severity: "critical",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "cat-standard",
        guestPrices: [
          { guests: 1, price_credit_card: 200, price_pix: 180 },
          { guests: 2, price_credit_card: 250, price_pix: 225 },
        ],
        breakfast_discount_value: 150, // Over 100%
        breakfast_discount_type: "PERCENTAGE",
      },
      expectedResult: "fail",
    },

    // Successful Validation Tests
    {
      id: "val-008",
      name: "Valid Complete Form",
      description: "Test validation with all fields correctly filled",
      category: "validation",
      severity: "info",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "cat-standard",
        guestPrices: [
          { guests: 1, price_credit_card: 200, price_pix: 180 },
          { guests: 2, price_credit_card: 250, price_pix: 225 },
        ],
        breakfast_discount_value: 25,
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "pass",
    },
    {
      id: "val-009",
      name: "Partial Guest Prices Valid",
      description: "Test validation with only some guest counts configured",
      category: "validation",
      severity: "info",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "cat-standard",
        guestPrices: [
          { guests: 1, price_credit_card: 0, price_pix: 0 }, // Not configured
          { guests: 2, price_credit_card: 250, price_pix: 225 }, // Configured
        ],
        breakfast_discount_value: 25,
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "pass",
    },

    // Submission Tests
    {
      id: "sub-001",
      name: "Successful Rule Creation",
      description: "Test successful creation of new price rules",
      category: "submission",
      severity: "critical",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "cat-standard",
        guestPrices: [
          { guests: 1, price_credit_card: 200, price_pix: 180 },
          { guests: 2, price_credit_card: 250, price_pix: 225 },
        ],
        breakfast_discount_value: 25,
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "pass",
    },
    {
      id: "sub-002",
      name: "Duplicate Rule Prevention",
      description: "Test prevention of duplicate rule creation",
      category: "submission",
      severity: "warning",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "cat-standard",
        guestPrices: [
          { guests: 1, price_credit_card: 200, price_pix: 180 },
          { guests: 2, price_credit_card: 250, price_pix: 225 },
        ],
        breakfast_discount_value: 25,
        breakfast_discount_type: "FIXED",
        isDuplicate: true,
      },
      expectedResult: "warning",
    },

    // Edge Cases
    {
      id: "edge-001",
      name: "Zero Discount Value",
      description: "Test with zero discount value",
      category: "edge-case",
      severity: "info",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "cat-standard",
        guestPrices: [{ guests: 1, price_credit_card: 200, price_pix: 180 }],
        breakfast_discount_value: 0,
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "pass",
    },
    {
      id: "edge-002",
      name: "Very High Prices",
      description: "Test with very high price values",
      category: "edge-case",
      severity: "info",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "cat-standard",
        guestPrices: [{ guests: 1, price_credit_card: 99999.99, price_pix: 89999.99 }],
        breakfast_discount_value: 1000,
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "pass",
    },
    {
      id: "edge-003",
      name: "Minimal Valid Prices",
      description: "Test with minimal valid price values",
      category: "edge-case",
      severity: "info",
      testData: {
        tariff_period_id: "1",
        accommodation_category_id: "cat-standard",
        guestPrices: [{ guests: 1, price_credit_card: 0.02, price_pix: 0.01 }],
        breakfast_discount_value: 0.01,
        breakfast_discount_type: "FIXED",
      },
      expectedResult: "pass",
    },
  ]

  const validateFormData = (testData: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Basic field validation
    if (!testData.tariff_period_id) {
      errors.push("Período tarifário é obrigatório")
    }

    if (!testData.accommodation_category_id) {
      errors.push("Categoria é obrigatória")
    }

    // Price validation
    let hasValidPrices = false
    testData.guestPrices.forEach((price: any, index: number) => {
      if (price.price_credit_card > 0 && price.price_pix > 0) {
        hasValidPrices = true

        if (price.price_credit_card <= 0) {
          errors.push(`Preço do cartão para ${price.guests} hóspede(s) deve ser maior que zero`)
        }

        if (price.price_pix <= 0) {
          errors.push(`Preço PIX para ${price.guests} hóspede(s) deve ser maior que zero`)
        }

        if (price.price_pix >= price.price_credit_card) {
          errors.push(`Preço PIX para ${price.guests} hóspede(s) deve ser menor que o preço do cartão`)
        }
      }
    })

    if (!hasValidPrices) {
      errors.push("Configure pelo menos um preço válido para a categoria selecionada")
    }

    // Discount validation
    if (testData.breakfast_discount_value < 0) {
      errors.push("Desconto não pode ser negativo")
    }

    if (testData.breakfast_discount_type === "PERCENTAGE" && testData.breakfast_discount_value > 100) {
      errors.push("Desconto percentual não pode ser maior que 100%")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  const simulateSubmission = async (testData: any): Promise<{ success: boolean; message: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    try {
      // Check for duplicate if specified
      if (testData.isDuplicate) {
        return {
          success: false,
          message: "Regra já existe para esta configuração",
        }
      }

      // Simulate successful creation
      const validPrices = testData.guestPrices.filter((p: any) => p.price_credit_card > 0 && p.price_pix > 0)

      if (validPrices.length === 0) {
        return {
          success: false,
          message: "Nenhuma regra válida para criar",
        }
      }

      return {
        success: true,
        message: `${validPrices.length} regra(s) criada(s) com sucesso`,
      }
    } catch (error) {
      return {
        success: false,
        message: "Erro interno do servidor",
      }
    }
  }

  const runSingleTest = async (testCase: TestCase): Promise<TestCase> => {
    const startTime = Date.now()
    setCurrentTest(testCase.id)

    try {
      if (testCase.category === "validation") {
        const validation = validateFormData(testCase.testData)
        const actualResult = validation.isValid ? "pass" : "fail"

        return {
          ...testCase,
          actualResult,
          errorMessage: validation.errors.join(", "),
          executionTime: Date.now() - startTime,
        }
      } else if (testCase.category === "submission") {
        // First validate, then submit if valid
        const validation = validateFormData(testCase.testData)
        if (!validation.isValid) {
          return {
            ...testCase,
            actualResult: "fail",
            errorMessage: "Validation failed: " + validation.errors.join(", "),
            executionTime: Date.now() - startTime,
          }
        }

        const submission = await simulateSubmission(testCase.testData)
        let actualResult: "pass" | "fail" | "warning"

        if (submission.success) {
          actualResult = "pass"
        } else if (submission.message.includes("já existe")) {
          actualResult = "warning"
        } else {
          actualResult = "fail"
        }

        return {
          ...testCase,
          actualResult,
          errorMessage: submission.message,
          executionTime: Date.now() - startTime,
        }
      } else {
        // Edge case testing
        const validation = validateFormData(testCase.testData)
        const actualResult = validation.isValid ? "pass" : "fail"

        return {
          ...testCase,
          actualResult,
          errorMessage: validation.errors.join(", "),
          executionTime: Date.now() - startTime,
        }
      }
    } catch (error) {
      return {
        ...testCase,
        actualResult: "fail",
        errorMessage: `Test execution error: ${error}`,
        executionTime: Date.now() - startTime,
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])
    setCurrentTest(null)

    const results: TestCase[] = []
    let passed = 0
    let failed = 0
    let warnings = 0

    for (const testCase of testCases) {
      const result = await runSingleTest(testCase)
      results.push(result)

      if (result.actualResult === "pass") passed++
      else if (result.actualResult === "warning") warnings++
      else failed++

      setTestResults([...results])
    }

    setSummary({
      total: testCases.length,
      passed,
      failed,
      warnings,
    })

    setCurrentTest(null)
    setIsRunning(false)

    toast({
      title: "Testes Concluídos",
      description: `${passed} passou, ${failed} falhou, ${warnings} avisos`,
    })
  }

  const resetTests = () => {
    setTestResults([])
    setCurrentTest(null)
    setSummary({ total: 0, passed: 0, failed: 0, warnings: 0 })
  }

  const getResultIcon = (result?: string) => {
    switch (result) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />
    }
  }

  const getResultColor = (result?: string) => {
    switch (result) {
      case "pass":
        return "border-green-200 bg-green-50"
      case "fail":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "validation":
        return <CheckCircle className="h-4 w-4" />
      case "submission":
        return <DollarSign className="h-4 w-4" />
      case "edge-case":
        return <TestTube className="h-4 w-4" />
      default:
        return <TestTube className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teste de Validação e Submissão</h1>
          <p className="text-muted-foreground">Teste completo do fluxo de validação e submissão das regras de preço</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={resetTests} variant="outline" disabled={isRunning}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
          <Button onClick={runAllTests} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? "Executando..." : "Executar Todos"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{summary.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Passou</p>
                  <p className="text-2xl font-bold text-green-600">{summary.passed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Falhou</p>
                  <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Avisos</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.warnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todos ({testResults.length})</TabsTrigger>
          <TabsTrigger value="validation">
            Validação ({testResults.filter((t) => t.category === "validation").length})
          </TabsTrigger>
          <TabsTrigger value="submission">
            Submissão ({testResults.filter((t) => t.category === "submission").length})
          </TabsTrigger>
          <TabsTrigger value="edge-case">
            Edge Cases ({testResults.filter((t) => t.category === "edge-case").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {testCases.map((testCase) => {
                const result = testResults.find((r) => r.id === testCase.id)
                const isRunning = currentTest === testCase.id

                return (
                  <Card
                    key={testCase.id}
                    className={`transition-all ${getResultColor(result?.actualResult)} ${
                      isRunning ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getResultIcon(result?.actualResult)}
                          <div>
                            <CardTitle className="text-sm font-medium">{testCase.name}</CardTitle>
                            <CardDescription className="text-xs">{testCase.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryIcon(testCase.category)}
                            <span className="ml-1 capitalize">{testCase.category}</span>
                          </Badge>
                          <Badge
                            variant={testCase.severity === "critical" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {testCase.severity}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    {result && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>
                              Esperado: <Badge variant="outline">{testCase.expectedResult}</Badge>
                            </span>
                            <span>
                              Resultado: <Badge variant="outline">{result.actualResult}</Badge>
                            </span>
                            <span>Tempo: {result.executionTime}ms</span>
                          </div>

                          {result.errorMessage && (
                            <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
                              <strong>Detalhes:</strong> {result.errorMessage}
                            </div>
                          )}

                          {/* Test Data Preview */}
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              Ver dados do teste
                            </summary>
                            <pre className="mt-2 bg-white p-2 rounded border overflow-x-auto">
                              {JSON.stringify(testCase.testData, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </CardContent>
                    )}

                    {isRunning && (
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                          Executando teste...
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="validation">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {testCases
                .filter((t) => t.category === "validation")
                .map((testCase) => {
                  const result = testResults.find((r) => r.id === testCase.id)
                  const isRunning = currentTest === testCase.id

                  return (
                    <Card
                      key={testCase.id}
                      className={`transition-all ${getResultColor(result?.actualResult)} ${
                        isRunning ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getResultIcon(result?.actualResult)}
                            <div>
                              <CardTitle className="text-sm font-medium">{testCase.name}</CardTitle>
                              <CardDescription className="text-xs">{testCase.description}</CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={testCase.severity === "critical" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {testCase.severity}
                          </Badge>
                        </div>
                      </CardHeader>

                      {result && (
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>
                                Esperado: <Badge variant="outline">{testCase.expectedResult}</Badge>
                              </span>
                              <span>
                                Resultado: <Badge variant="outline">{result.actualResult}</Badge>
                              </span>
                              <span>Tempo: {result.executionTime}ms</span>
                            </div>

                            {result.errorMessage && (
                              <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
                                <strong>Detalhes:</strong> {result.errorMessage}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="submission">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {testCases
                .filter((t) => t.category === "submission")
                .map((testCase) => {
                  const result = testResults.find((r) => r.id === testCase.id)
                  const isRunning = currentTest === testCase.id

                  return (
                    <Card
                      key={testCase.id}
                      className={`transition-all ${getResultColor(result?.actualResult)} ${
                        isRunning ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getResultIcon(result?.actualResult)}
                            <div>
                              <CardTitle className="text-sm font-medium">{testCase.name}</CardTitle>
                              <CardDescription className="text-xs">{testCase.description}</CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={testCase.severity === "critical" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {testCase.severity}
                          </Badge>
                        </div>
                      </CardHeader>

                      {result && (
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>
                                Esperado: <Badge variant="outline">{testCase.expectedResult}</Badge>
                              </span>
                              <span>
                                Resultado: <Badge variant="outline">{result.actualResult}</Badge>
                              </span>
                              <span>Tempo: {result.executionTime}ms</span>
                            </div>

                            {result.errorMessage && (
                              <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
                                <strong>Detalhes:</strong> {result.errorMessage}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="edge-case">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {testCases
                .filter((t) => t.category === "edge-case")
                .map((testCase) => {
                  const result = testResults.find((r) => r.id === testCase.id)
                  const isRunning = currentTest === testCase.id

                  return (
                    <Card
                      key={testCase.id}
                      className={`transition-all ${getResultColor(result?.actualResult)} ${
                        isRunning ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getResultIcon(result?.actualResult)}
                            <div>
                              <CardTitle className="text-sm font-medium">{testCase.name}</CardTitle>
                              <CardDescription className="text-xs">{testCase.description}</CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={testCase.severity === "critical" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {testCase.severity}
                          </Badge>
                        </div>
                      </CardHeader>

                      {result && (
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>
                                Esperado: <Badge variant="outline">{testCase.expectedResult}</Badge>
                              </span>
                              <span>
                                Resultado: <Badge variant="outline">{result.actualResult}</Badge>
                              </span>
                              <span>Tempo: {result.executionTime}ms</span>
                            </div>

                            {result.errorMessage && (
                              <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
                                <strong>Detalhes:</strong> {result.errorMessage}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
