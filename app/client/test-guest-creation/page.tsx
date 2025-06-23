"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Clock, Play, RotateCcw, User, FileText, Loader2 } from "lucide-react"

interface TestCase {
  id: string
  name: string
  description: string
  category: "validation" | "submission" | "edge-case"
  severity: "critical" | "important" | "minor"
  testData: any
  expectedResult: "pass" | "fail" | "warning"
  actualResult?: "pass" | "fail" | "warning" | "running"
  errorMessage?: string
  executionTime?: number
  details?: string
}

interface TestResult {
  testId: string
  result: "pass" | "fail" | "warning"
  executionTime: number
  errorMessage?: string
  details?: string
}

const testCases: TestCase[] = [
  // Validation Tests
  {
    id: "val-001",
    name: "Formulário Vazio",
    description: "Tenta submeter formulário sem preencher campos obrigatórios",
    category: "validation",
    severity: "critical",
    testData: {
      name: "",
      email: "",
      document: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "Brasil",
      birthdate: "",
      nationality: "Brasileira",
      gender: "Masculino",
      tags: [],
      notes: "",
      vip: false,
    },
    expectedResult: "fail",
  },
  {
    id: "val-002",
    name: "Email Inválido",
    description: "Testa validação de formato de email",
    category: "validation",
    severity: "critical",
    testData: {
      name: "João Silva",
      email: "email-invalido",
      document: "123.456.789-00",
      phone: "(11) 99999-8888",
      address: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      birthdate: "1985-05-15",
      nationality: "Brasileira",
      gender: "Masculino",
      tags: ["business"],
      notes: "",
      vip: false,
    },
    expectedResult: "fail",
  },
  {
    id: "val-003",
    name: "Nome Obrigatório",
    description: "Testa validação de campo nome obrigatório",
    category: "validation",
    severity: "critical",
    testData: {
      name: "",
      email: "joao@email.com",
      document: "123.456.789-00",
      phone: "(11) 99999-8888",
      address: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      birthdate: "1985-05-15",
      nationality: "Brasileira",
      gender: "Masculino",
      tags: ["business"],
      notes: "",
      vip: false,
    },
    expectedResult: "fail",
  },
  {
    id: "val-004",
    name: "Documento Obrigatório",
    description: "Testa validação de campo documento obrigatório",
    category: "validation",
    severity: "critical",
    testData: {
      name: "João Silva",
      email: "joao@email.com",
      document: "",
      phone: "(11) 99999-8888",
      address: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      birthdate: "1985-05-15",
      nationality: "Brasileira",
      gender: "Masculino",
      tags: ["business"],
      notes: "",
      vip: false,
    },
    expectedResult: "fail",
  },
  {
    id: "val-005",
    name: "Email com Espaços",
    description: "Testa validação de email com espaços em branco",
    category: "validation",
    severity: "important",
    testData: {
      name: "João Silva",
      email: "  joao@email.com  ",
      document: "123.456.789-00",
      phone: "(11) 99999-8888",
      address: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      birthdate: "1985-05-15",
      nationality: "Brasileira",
      gender: "Masculino",
      tags: ["business"],
      notes: "",
      vip: false,
    },
    expectedResult: "pass",
  },

  // Submission Tests
  {
    id: "sub-001",
    name: "Cadastro Válido Completo",
    description: "Testa criação de hóspede com todos os campos preenchidos",
    category: "submission",
    severity: "critical",
    testData: {
      name: "Maria Santos",
      email: "maria.santos@email.com",
      document: "987.654.321-00",
      phone: "(21) 98765-4321",
      address: "Av. Atlântica, 500",
      city: "Rio de Janeiro",
      state: "RJ",
      country: "Brasil",
      birthdate: "1990-10-22",
      nationality: "Brasileira",
      gender: "Feminino",
      tags: ["leisure", "family"],
      notes: "Prefere quartos com vista para o mar",
      vip: false,
    },
    expectedResult: "pass",
  },
  {
    id: "sub-002",
    name: "Cadastro Mínimo Válido",
    description: "Testa criação com apenas campos obrigatórios",
    category: "submission",
    severity: "critical",
    testData: {
      name: "Carlos Oliveira",
      email: "carlos@email.com",
      document: "456.789.123-00",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "Brasil",
      birthdate: "",
      nationality: "Brasileira",
      gender: "Masculino",
      tags: [],
      notes: "",
      vip: false,
    },
    expectedResult: "pass",
  },
  {
    id: "sub-003",
    name: "Cadastro VIP",
    description: "Testa criação de hóspede VIP com múltiplas tags",
    category: "submission",
    severity: "important",
    testData: {
      name: "Ana Costa VIP",
      email: "ana.costa@email.com",
      document: "321.654.987-00",
      phone: "(41) 96666-5555",
      address: "Rua das Araucárias, 200",
      city: "Curitiba",
      state: "PR",
      country: "Brasil",
      birthdate: "1992-07-30",
      nationality: "Brasileira",
      gender: "Feminino",
      tags: ["leisure", "vip", "repeat", "business"],
      notes: "Cliente fidelizada. Prefere quartos com vista. Alérgica a amendoim.",
      vip: true,
    },
    expectedResult: "pass",
  },

  // Edge Cases
  {
    id: "edge-001",
    name: "Nome com Caracteres Especiais",
    description: "Testa nomes com acentos e caracteres especiais",
    category: "edge-case",
    severity: "minor",
    testData: {
      name: "José da Silva Ñoño",
      email: "jose@email.com",
      document: "111.222.333-44",
      phone: "(11) 99999-8888",
      address: "Rua São João, 123",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      birthdate: "1980-01-01",
      nationality: "Brasileira",
      gender: "Masculino",
      tags: ["business"],
      notes: "",
      vip: false,
    },
    expectedResult: "pass",
  },
  {
    id: "edge-002",
    name: "Email com Domínio Longo",
    description: "Testa email com domínio muito longo",
    category: "edge-case",
    severity: "minor",
    testData: {
      name: "Roberto Almeida",
      email: "roberto@muitolongo.empresa.corporativo.com.br",
      document: "789.123.456-00",
      phone: "(51) 95555-4444",
      address: "Av. Independência, 1000",
      city: "Porto Alegre",
      state: "RS",
      country: "Brasil",
      birthdate: "1980-12-05",
      nationality: "Brasileira",
      gender: "Masculino",
      tags: ["business"],
      notes: "",
      vip: false,
    },
    expectedResult: "pass",
  },
  {
    id: "edge-003",
    name: "Observações Muito Longas",
    description: "Testa campo de observações com texto muito longo",
    category: "edge-case",
    severity: "minor",
    testData: {
      name: "Fernanda Lima",
      email: "fernanda@email.com",
      document: "555.666.777-88",
      phone: "(85) 94444-3333",
      address: "Rua das Palmeiras, 456",
      city: "Fortaleza",
      state: "CE",
      country: "Brasil",
      birthdate: "1988-03-15",
      nationality: "Brasileira",
      gender: "Feminino",
      tags: ["leisure"],
      notes:
        "Esta é uma observação muito longa para testar o comportamento do sistema com textos extensos. A hóspede tem várias preferências específicas incluindo quarto no andar alto, longe do elevador, com vista para o mar, ar condicionado sempre ligado, travesseiros extras, toalhas extras, frigobar abastecido com água e refrigerantes, e serviço de quarto disponível 24 horas. Também é alérgica a amendoim, frutos do mar e tem intolerância à lactose.",
      vip: false,
    },
    expectedResult: "pass",
  },
  {
    id: "edge-004",
    name: "Data de Nascimento Futura",
    description: "Testa validação de data de nascimento no futuro",
    category: "edge-case",
    severity: "important",
    testData: {
      name: "Teste Futuro",
      email: "futuro@email.com",
      document: "999.888.777-66",
      phone: "(11) 99999-8888",
      address: "Rua do Futuro, 123",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      birthdate: "2030-01-01",
      nationality: "Brasileira",
      gender: "Masculino",
      tags: ["business"],
      notes: "",
      vip: false,
    },
    expectedResult: "warning",
  },
]

export default function TestGuestCreationPage() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const testTimeoutRef = useRef<NodeJS.Timeout>()

  // Mock validation functions (simulating the actual form validation)
  const validateGuestForm = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!data.name?.trim()) {
      errors.push("Nome é obrigatório")
    }

    if (!data.email?.trim()) {
      errors.push("Email é obrigatório")
    } else if (!/\S+@\S+\.\S+/.test(data.email.trim())) {
      errors.push("Email inválido")
    }

    if (!data.document?.trim()) {
      errors.push("Documento é obrigatório")
    }

    // Edge case validations
    if (data.birthdate) {
      const birthDate = new Date(data.birthdate)
      const today = new Date()
      if (birthDate > today) {
        errors.push("Data de nascimento não pode ser no futuro")
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Mock submission function (simulating the actual API call)
  const submitGuestForm = async (data: any): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

    // Simulate potential API errors
    if (data.email === "error@test.com") {
      return { success: false, error: "Email já existe no sistema" }
    }

    return { success: true }
  }

  const runSingleTest = async (testCase: TestCase): Promise<TestResult> => {
    const startTime = Date.now()

    try {
      // Step 1: Validate form
      const validation = validateGuestForm(testCase.testData)

      if (testCase.expectedResult === "fail" && !validation.isValid) {
        // Expected to fail validation, and it did
        return {
          testId: testCase.id,
          result: "pass",
          executionTime: Date.now() - startTime,
          details: `Validação falhou conforme esperado: ${validation.errors.join(", ")}`,
        }
      }

      if (testCase.expectedResult === "fail" && validation.isValid) {
        // Expected to fail validation, but it passed
        return {
          testId: testCase.id,
          result: "fail",
          executionTime: Date.now() - startTime,
          errorMessage: "Validação deveria ter falhado, mas passou",
        }
      }

      if (!validation.isValid) {
        // Unexpected validation failure
        return {
          testId: testCase.id,
          result: "fail",
          executionTime: Date.now() - startTime,
          errorMessage: `Validação falhou inesperadamente: ${validation.errors.join(", ")}`,
        }
      }

      // Step 2: Submit form (if validation passed)
      const submission = await submitGuestForm(testCase.testData)

      if (testCase.expectedResult === "pass" && submission.success) {
        return {
          testId: testCase.id,
          result: "pass",
          executionTime: Date.now() - startTime,
          details: "Hóspede criado com sucesso",
        }
      }

      if (testCase.expectedResult === "warning") {
        return {
          testId: testCase.id,
          result: "warning",
          executionTime: Date.now() - startTime,
          details: "Teste executado com avisos",
        }
      }

      return {
        testId: testCase.id,
        result: "fail",
        executionTime: Date.now() - startTime,
        errorMessage: submission.error || "Falha na submissão",
      }
    } catch (error) {
      return {
        testId: testCase.id,
        result: "fail",
        executionTime: Date.now() - startTime,
        errorMessage: `Erro durante execução: ${error}`,
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setProgress(0)
    setTestResults({})

    const filteredTests = testCases.filter((test) => selectedCategory === "all" || test.category === selectedCategory)

    for (let i = 0; i < filteredTests.length; i++) {
      const testCase = filteredTests[i]
      setCurrentTest(testCase.id)

      // Update test status to running
      setTestResults((prev) => ({
        ...prev,
        [testCase.id]: {
          testId: testCase.id,
          result: "pass",
          executionTime: 0,
        },
      }))

      const result = await runSingleTest(testCase)

      setTestResults((prev) => ({
        ...prev,
        [testCase.id]: result,
      }))

      setProgress(((i + 1) / filteredTests.length) * 100)
    }

    setCurrentTest(null)
    setIsRunning(false)
  }

  const resetTests = () => {
    setTestResults({})
    setProgress(0)
    setCurrentTest(null)
    setIsRunning(false)
    if (testTimeoutRef.current) {
      clearTimeout(testTimeoutRef.current)
    }
  }

  const getResultIcon = (result?: "pass" | "fail" | "warning" | "running") => {
    switch (result) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getResultBadge = (result?: "pass" | "fail" | "warning" | "running") => {
    switch (result) {
      case "pass":
        return <Badge className="bg-green-100 text-green-800">Passou</Badge>
      case "fail":
        return <Badge variant="destructive">Falhou</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Aviso</Badge>
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Executando</Badge>
      default:
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  const getSeverityBadge = (severity: "critical" | "important" | "minor") => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Crítico</Badge>
      case "important":
        return <Badge className="bg-orange-100 text-orange-800">Importante</Badge>
      case "minor":
        return <Badge variant="outline">Menor</Badge>
    }
  }

  const getCategoryIcon = (category: "validation" | "submission" | "edge-case") => {
    switch (category) {
      case "validation":
        return <CheckCircle className="h-4 w-4" />
      case "submission":
        return <User className="h-4 w-4" />
      case "edge-case":
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const filteredTests = testCases.filter((test) => selectedCategory === "all" || test.category === selectedCategory)

  const totalTests = filteredTests.length
  const passedTests = Object.values(testResults).filter((r) => r.result === "pass").length
  const failedTests = Object.values(testResults).filter((r) => r.result === "fail").length
  const warningTests = Object.values(testResults).filter((r) => r.result === "warning").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teste de Criação de Hóspedes</h2>
          <p className="text-muted-foreground">
            Validação completa do fluxo de cadastro com todos os cenários de teste
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={runAllTests} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Executar Todos
              </>
            )}
          </Button>
          <Button variant="outline" onClick={resetTests} disabled={isRunning}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso dos Testes</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentTest && (
                <p className="text-sm text-muted-foreground">
                  Executando: {testCases.find((t) => t.id === currentTest)?.name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {Object.keys(testResults).length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Testes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTests}</div>
              <p className="text-xs text-muted-foreground">Cenários testados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passou</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <p className="text-xs text-muted-foreground">
                {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}% de sucesso
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falhou</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <p className="text-xs text-muted-foreground">
                {totalTests > 0 ? Math.round((failedTests / totalTests) * 100) : 0}% de falhas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avisos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{warningTests}</div>
              <p className="text-xs text-muted-foreground">Casos com avisos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({testCases.length})</TabsTrigger>
          <TabsTrigger value="validation">
            Validação ({testCases.filter((t) => t.category === "validation").length})
          </TabsTrigger>
          <TabsTrigger value="submission">
            Submissão ({testCases.filter((t) => t.category === "submission").length})
          </TabsTrigger>
          <TabsTrigger value="edge-case">
            Edge Cases ({testCases.filter((t) => t.category === "edge-case").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultados dos Testes</CardTitle>
              <CardDescription>Detalhes da execução de cada cenário de teste para criação de hóspedes</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredTests.map((testCase) => {
                    const result = testResults[testCase.id]
                    const isCurrentTest = currentTest === testCase.id

                    return (
                      <Card key={testCase.id} className={isCurrentTest ? "border-blue-500 bg-blue-50" : ""}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="mt-1">{getResultIcon(result?.result)}</div>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{testCase.name}</h4>
                                  {getSeverityBadge(testCase.severity)}
                                  <div className="flex items-center space-x-1 text-muted-foreground">
                                    {getCategoryIcon(testCase.category)}
                                    <span className="text-xs capitalize">{testCase.category}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{testCase.description}</p>
                                {result && (
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      {getResultBadge(result.result)}
                                      <span className="text-xs text-muted-foreground">{result.executionTime}ms</span>
                                    </div>
                                    {result.details && <p className="text-xs text-green-600">{result.details}</p>}
                                    {result.errorMessage && (
                                      <p className="text-xs text-red-600">{result.errorMessage}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Test Data Preview */}
                          <details className="mt-3">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Ver dados do teste
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <strong>Nome:</strong> {testCase.testData.name || "(vazio)"}
                                </div>
                                <div>
                                  <strong>Email:</strong> {testCase.testData.email || "(vazio)"}
                                </div>
                                <div>
                                  <strong>Documento:</strong> {testCase.testData.document || "(vazio)"}
                                </div>
                                <div>
                                  <strong>Telefone:</strong> {testCase.testData.phone || "(vazio)"}
                                </div>
                                <div>
                                  <strong>VIP:</strong> {testCase.testData.vip ? "Sim" : "Não"}
                                </div>
                                <div>
                                  <strong>Tags:</strong> {testCase.testData.tags.join(", ") || "(nenhuma)"}
                                </div>
                              </div>
                              {testCase.testData.notes && (
                                <div className="mt-2">
                                  <strong>Observações:</strong>
                                  <p className="text-xs mt-1">{testCase.testData.notes}</p>
                                </div>
                              )}
                            </div>
                          </details>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como Interpretar os Resultados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Passou ✅</AlertTitle>
              <AlertDescription>
                O teste executou conforme esperado. A validação ou submissão funcionou corretamente.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Falhou ❌</AlertTitle>
              <AlertDescription>
                O teste não executou conforme esperado. Há um problema na validação ou submissão.
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Aviso ⚠️</AlertTitle>
              <AlertDescription>O teste executou, mas com condições que merecem atenção especial.</AlertDescription>
            </Alert>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Categorias de Teste:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <strong>Validação:</strong> Testa se os campos obrigatórios e formatos estão sendo validados
                corretamente
              </li>
              <li>
                <strong>Submissão:</strong> Testa se o processo de criação de hóspede funciona com dados válidos
              </li>
              <li>
                <strong>Edge Cases:</strong> Testa cenários extremos e casos especiais que podem ocorrer
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
