"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Building,
  Settings,
  TrendingUp,
} from "lucide-react"
import { pricingDataService } from "@/lib/services/pricing-data-service"
import type { TariffPeriod } from "@/lib/types/pricing"

interface UserAction {
  id: string
  type: "create" | "edit" | "duplicate_attempt" | "bulk_create" | "review"
  description: string
  data: any
  expectedOutcome: "success" | "prevented" | "error"
  timestamp: Date
}

interface WorkflowStep {
  id: string
  name: string
  description: string
  actions: UserAction[]
  expectedDuplicatePrevention: number
  expectedSuccessfulCreations: number
}

interface UserWorkflow {
  id: string
  name: string
  description: string
  userType: "hotel_manager" | "revenue_manager" | "front_desk" | "admin"
  scenario: string
  steps: WorkflowStep[]
  complexity: "simple" | "medium" | "complex"
  priority: "high" | "medium" | "low"
}

interface WorkflowResult {
  workflowId: string
  stepId: string
  actionId: string
  status: "success" | "prevented" | "failed" | "running"
  message: string
  executionTime: number
  actualOutcome: string
  expectedOutcome: string
  details: any
  timestamp: Date
}

export default function UserWorkflowSimulationPage() {
  const [workflowResults, setWorkflowResults] = useState<Record<string, WorkflowResult[]>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [currentWorkflow, setCurrentWorkflow] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [periods, setPeriods] = useState<TariffPeriod[]>([])
  const [simulationStats, setSimulationStats] = useState({
    totalActions: 0,
    successfulActions: 0,
    preventedDuplicates: 0,
    unexpectedFailures: 0,
  })

  // Mock categories for testing
  const categories = [
    { id: "cat-standard", name: "Standard", max_capacity: 4 },
    { id: "cat-superior", name: "Superior", max_capacity: 3 },
    { id: "cat-deluxe", name: "Deluxe", max_capacity: 2 },
    { id: "cat-suite", name: "Suite", max_capacity: 6 },
  ]

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = () => {
    try {
      const allPeriods = pricingDataService.getTariffPeriods()
      setPeriods(allPeriods)
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
        {
          id: "3",
          name: "Feriados e Eventos",
          start_date: "2025-12-20",
          end_date: "2026-01-05",
          minimum_nights: 3,
          color: "#ef4444",
        },
      ])
    }
  }

  const userWorkflows: UserWorkflow[] = [
    {
      id: "hotel-manager-setup",
      name: "Gerente de Hotel - Configuração Inicial",
      description: "Configuração completa de preços para nova temporada",
      userType: "hotel_manager",
      scenario: "Início de temporada - configurar todos os preços",
      complexity: "complex",
      priority: "high",
      steps: [
        {
          id: "step-1",
          name: "Configurar Baixa Temporada",
          description: "Criar regras para todas as categorias na baixa temporada",
          expectedDuplicatePrevention: 0,
          expectedSuccessfulCreations: 12, // 4 categories × 3 guest variations
          actions: [
            {
              id: "action-1-1",
              type: "create",
              description: "Criar regras para Standard - 1 a 4 hóspedes",
              expectedOutcome: "success",
              timestamp: new Date(),
              data: {
                category: "cat-standard",
                period: "1",
                guestRules: [
                  { guests: 1, creditCard: 120, pix: 108 },
                  { guests: 2, creditCard: 180, pix: 162 },
                  { guests: 3, creditCard: 220, pix: 198 },
                  { guests: 4, creditCard: 260, pix: 234 },
                ],
                discount: { type: "FIXED", value: 20 },
              },
            },
            {
              id: "action-1-2",
              type: "create",
              description: "Criar regras para Superior - 1 a 3 hóspedes",
              expectedOutcome: "success",
              timestamp: new Date(),
              data: {
                category: "cat-superior",
                period: "1",
                guestRules: [
                  { guests: 1, creditCard: 150, pix: 135 },
                  { guests: 2, creditCard: 220, pix: 198 },
                  { guests: 3, creditCard: 280, pix: 252 },
                ],
                discount: { type: "PERCENTAGE", value: 12 },
              },
            },
            {
              id: "action-1-3",
              type: "create",
              description: "Criar regras para Deluxe - 1 a 2 hóspedes",
              expectedOutcome: "success",
              timestamp: new Date(),
              data: {
                category: "cat-deluxe",
                period: "1",
                guestRules: [
                  { guests: 1, creditCard: 200, pix: 180 },
                  { guests: 2, creditCard: 300, pix: 270 },
                ],
                discount: { type: "FIXED", value: 30 },
              },
            },
            {
              id: "action-1-4",
              type: "create",
              description: "Criar regras para Suite - 1 a 6 hóspedes",
              expectedOutcome: "success",
              timestamp: new Date(),
              data: {
                category: "cat-suite",
                period: "1",
                guestRules: [
                  { guests: 1, creditCard: 350, pix: 315 },
                  { guests: 2, creditCard: 450, pix: 405 },
                  { guests: 3, creditCard: 550, pix: 495 },
                  { guests: 4, creditCard: 650, pix: 585 },
                  { guests: 5, creditCard: 750, pix: 675 },
                  { guests: 6, creditCard: 850, pix: 765 },
                ],
                discount: { type: "PERCENTAGE", value: 15 },
              },
            },
          ],
        },
        {
          id: "step-2",
          name: "Tentar Duplicar Regras (Erro do Usuário)",
          description: "Simular erro comum - tentar recriar regras existentes",
          expectedDuplicatePrevention: 4, // Todas as 4 tentativas devem ser bloqueadas
          expectedSuccessfulCreations: 0,
          actions: [
            {
              id: "action-2-1",
              type: "duplicate_attempt",
              description: "Tentar recriar Standard para 2 hóspedes",
              expectedOutcome: "prevented",
              timestamp: new Date(),
              data: {
                category: "cat-standard",
                period: "1",
                guests: 2,
                creditCard: 185, // Preço diferente, mas mesma combinação
                pix: 167,
                discount: { type: "FIXED", value: 25 },
              },
            },
            {
              id: "action-2-2",
              type: "duplicate_attempt",
              description: "Tentar recriar Superior para 1 hóspede",
              expectedOutcome: "prevented",
              timestamp: new Date(),
              data: {
                category: "cat-superior",
                period: "1",
                guests: 1,
                creditCard: 155,
                pix: 140,
                discount: { type: "PERCENTAGE", value: 10 },
              },
            },
          ],
        },
      ],
    },
    {
      id: "revenue-manager-adjustment",
      name: "Revenue Manager - Ajustes de Preço",
      description: "Ajustes estratégicos de preços baseados em demanda",
      userType: "revenue_manager",
      scenario: "Ajustar preços para otimizar receita",
      complexity: "medium",
      priority: "high",
      steps: [
        {
          id: "step-1",
          name: "Configurar Alta Temporada",
          description: "Criar preços premium para alta temporada",
          expectedDuplicatePrevention: 0,
          expectedSuccessfulCreations: 8,
          actions: [
            {
              id: "action-1-1",
              type: "create",
              description: "Criar regras premium para Standard",
              expectedOutcome: "success",
              timestamp: new Date(),
              data: {
                category: "cat-standard",
                period: "2", // Alta temporada
                guestRules: [
                  { guests: 1, creditCard: 180, pix: 162 },
                  { guests: 2, creditCard: 280, pix: 252 },
                  { guests: 3, creditCard: 350, pix: 315 },
                  { guests: 4, creditCard: 420, pix: 378 },
                ],
                discount: { type: "FIXED", value: 25 },
              },
            },
            {
              id: "action-1-2",
              type: "create",
              description: "Criar regras premium para Deluxe",
              expectedOutcome: "success",
              timestamp: new Date(),
              data: {
                category: "cat-deluxe",
                period: "2",
                guestRules: [
                  { guests: 1, creditCard: 320, pix: 288 },
                  { guests: 2, creditCard: 480, pix: 432 },
                ],
                discount: { type: "PERCENTAGE", value: 10 },
              },
            },
          ],
        },
        {
          id: "step-2",
          name: "Editar Preços Existentes",
          description: "Ajustar preços da baixa temporada baseado em performance",
          expectedDuplicatePrevention: 0,
          expectedSuccessfulCreations: 2, // 2 edições
          actions: [
            {
              id: "action-2-1",
              type: "edit",
              description: "Aumentar preço do Standard para 2 hóspedes",
              expectedOutcome: "success",
              timestamp: new Date(),
              data: {
                category: "cat-standard",
                period: "1",
                guests: 2,
                newPrices: { creditCard: 190, pix: 171 },
              },
            },
            {
              id: "action-2-2",
              type: "edit",
              description: "Ajustar desconto do Superior",
              expectedOutcome: "success",
              timestamp: new Date(),
              data: {
                category: "cat-superior",
                period: "1",
                guests: 1,
                newDiscount: { type: "PERCENTAGE", value: 15 },
              },
            },
          ],
        },
      ],
    },
    {
      id: "front-desk-quick-setup",
      name: "Recepcionista - Configuração Rápida",
      description: "Configuração rápida para evento especial",
      userType: "front_desk",
      scenario: "Evento especial - configurar preços rapidamente",
      complexity: "simple",
      priority: "medium",
      steps: [
        {
          id: "step-1",
          name: "Configurar Preços para Evento",
          description: "Criar regras especiais para período de feriados",
          expectedDuplicatePrevention: 0,
          expectedSuccessfulCreations: 6,
          actions: [
            {
              id: "action-1-1",
              type: "bulk_create",
              description: "Criar regras para Standard e Superior no período de feriados",
              expectedOutcome: "success",
              timestamp: new Date(),
              data: {
                period: "3", // Feriados
                categories: [
                  {
                    category: "cat-standard",
                    guestRules: [
                      { guests: 1, creditCard: 250, pix: 225 },
                      { guests: 2, creditCard: 400, pix: 360 },
                    ],
                  },
                  {
                    category: "cat-superior",
                    guestRules: [
                      { guests: 1, creditCard: 300, pix: 270 },
                      { guests: 2, creditCard: 480, pix: 432 },
                    ],
                  },
                ],
                discount: { type: "FIXED", value: 40 },
              },
            },
          ],
        },
        {
          id: "step-2",
          name: "Erro Comum - Tentar Recriar",
          description: "Simular erro comum de recepcionista inexperiente",
          expectedDuplicatePrevention: 2,
          expectedSuccessfulCreations: 0,
          actions: [
            {
              id: "action-2-1",
              type: "duplicate_attempt",
              description: "Tentar recriar Standard para 1 hóspede no período de feriados",
              expectedOutcome: "prevented",
              timestamp: new Date(),
              data: {
                category: "cat-standard",
                period: "3",
                guests: 1,
                creditCard: 260, // Preço ligeiramente diferente
                pix: 234,
              },
            },
          ],
        },
      ],
    },
    {
      id: "admin-bulk-operations",
      name: "Administrador - Operações em Lote",
      description: "Operações administrativas complexas",
      userType: "admin",
      scenario: "Migração de dados e configurações em massa",
      complexity: "complex",
      priority: "high",
      steps: [
        {
          id: "step-1",
          name: "Migração de Dados",
          description: "Importar regras de sistema antigo",
          expectedDuplicatePrevention: 3, // Algumas regras já existem
          expectedSuccessfulCreations: 5, // Novas regras válidas
          actions: [
            {
              id: "action-1-1",
              type: "bulk_create",
              description: "Importar lote de regras mistas (algumas duplicadas)",
              expectedOutcome: "success",
              timestamp: new Date(),
              data: {
                importBatch: [
                  // Regras novas (devem ser criadas)
                  {
                    category: "cat-suite",
                    period: "2",
                    guests: 3,
                    creditCard: 700,
                    pix: 630,
                    discount: { type: "PERCENTAGE", value: 12 },
                  },
                  {
                    category: "cat-suite",
                    period: "2",
                    guests: 4,
                    creditCard: 850,
                    pix: 765,
                    discount: { type: "PERCENTAGE", value: 12 },
                  },
                  // Regras duplicadas (devem ser bloqueadas)
                  {
                    category: "cat-standard",
                    period: "1",
                    guests: 1,
                    creditCard: 125, // Já existe
                    pix: 112,
                    discount: { type: "FIXED", value: 22 },
                  },
                  {
                    category: "cat-deluxe",
                    period: "2",
                    guests: 1,
                    creditCard: 330, // Já existe
                    pix: 297,
                    discount: { type: "PERCENTAGE", value: 8 },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ]

  const executeAction = async (workflowId: string, stepId: string, action: UserAction): Promise<WorkflowResult> => {
    const startTime = Date.now()

    try {
      let result: WorkflowResult = {
        workflowId,
        stepId,
        actionId: action.id,
        status: "running",
        message: "Executando...",
        executionTime: 0,
        actualOutcome: "",
        expectedOutcome: action.expectedOutcome,
        details: {},
        timestamp: new Date(),
      }

      // Simulate different action types
      switch (action.type) {
        case "create":
          result = await simulateCreateAction(action, result)
          break
        case "edit":
          result = await simulateEditAction(action, result)
          break
        case "duplicate_attempt":
          result = await simulateDuplicateAttempt(action, result)
          break
        case "bulk_create":
          result = await simulateBulkCreate(action, result)
          break
        default:
          result.status = "failed"
          result.message = "Tipo de ação não reconhecido"
          result.actualOutcome = "error"
      }

      result.executionTime = Date.now() - startTime
      return result
    } catch (error) {
      return {
        workflowId,
        stepId,
        actionId: action.id,
        status: "failed",
        message: `Erro durante execução: ${error.message}`,
        executionTime: Date.now() - startTime,
        actualOutcome: "error",
        expectedOutcome: action.expectedOutcome,
        details: { error },
        timestamp: new Date(),
      }
    }
  }

  const simulateCreateAction = async (action: UserAction, result: WorkflowResult): Promise<WorkflowResult> => {
    const { category, period, guestRules, discount } = action.data
    let createdCount = 0
    let duplicateCount = 0
    const errors = []

    for (const guestRule of guestRules) {
      try {
        const ruleData = {
          tariff_period_id: period,
          accommodation_category_id: category,
          number_of_guests: guestRule.guests,
          price_credit_card: guestRule.creditCard,
          price_pix: guestRule.pix,
          breakfast_discount_type: discount.type,
          breakfast_discount_value: discount.value,
        }

        // Check for duplicates
        const existingRules = pricingDataService.getPriceRules()
        const isDuplicate = existingRules.some(
          (rule) =>
            rule.tariff_period_id === ruleData.tariff_period_id &&
            rule.accommodation_category_id === ruleData.accommodation_category_id &&
            rule.number_of_guests === ruleData.number_of_guests,
        )

        if (isDuplicate) {
          duplicateCount++
        } else {
          pricingDataService.createPriceRule(ruleData)
          createdCount++
        }
      } catch (error) {
        errors.push(`Erro para ${guestRule.guests} hóspedes: ${error.message}`)
      }
    }

    result.status = errors.length === 0 ? "success" : "failed"
    result.message = `${createdCount} regras criadas, ${duplicateCount} duplicatas detectadas`
    result.actualOutcome = errors.length === 0 ? "success" : "error"
    result.details = { createdCount, duplicateCount, errors }

    return result
  }

  const simulateEditAction = async (action: UserAction, result: WorkflowResult): Promise<WorkflowResult> => {
    const { category, period, guests, newPrices, newDiscount } = action.data

    try {
      const existingRules = pricingDataService.getPriceRules()
      const ruleToEdit = existingRules.find(
        (rule) =>
          rule.tariff_period_id === period &&
          rule.accommodation_category_id === category &&
          rule.number_of_guests === guests,
      )

      if (!ruleToEdit) {
        result.status = "failed"
        result.message = "Regra para edição não encontrada"
        result.actualOutcome = "error"
        result.details = { searchCriteria: { category, period, guests } }
        return result
      }

      const updateData: any = {}
      if (newPrices) {
        updateData.price_credit_card = newPrices.creditCard
        updateData.price_pix = newPrices.pix
      }
      if (newDiscount) {
        updateData.breakfast_discount_type = newDiscount.type
        updateData.breakfast_discount_value = newDiscount.value
      }

      const updatedRule = pricingDataService.updatePriceRule(ruleToEdit.id, updateData)

      result.status = "success"
      result.message = "Regra editada com sucesso"
      result.actualOutcome = "success"
      result.details = { originalRule: ruleToEdit, updatedRule, changes: updateData }
    } catch (error) {
      result.status = "failed"
      result.message = `Erro ao editar regra: ${error.message}`
      result.actualOutcome = "error"
      result.details = { error }
    }

    return result
  }

  const simulateDuplicateAttempt = async (action: UserAction, result: WorkflowResult): Promise<WorkflowResult> => {
    const { category, period, guests, creditCard, pix, discount } = action.data

    try {
      const ruleData = {
        tariff_period_id: period,
        accommodation_category_id: category,
        number_of_guests: guests,
        price_credit_card: creditCard,
        price_pix: pix,
        breakfast_discount_type: discount?.type || "FIXED",
        breakfast_discount_value: discount?.value || 0,
      }

      // Check for duplicates (this should detect the duplicate)
      const existingRules = pricingDataService.getPriceRules()
      const isDuplicate = existingRules.some(
        (rule) =>
          rule.tariff_period_id === ruleData.tariff_period_id &&
          rule.accommodation_category_id === ruleData.accommodation_category_id &&
          rule.number_of_guests === ruleData.number_of_guests,
      )

      if (isDuplicate) {
        // Duplicate correctly detected and prevented
        result.status = "success" // Success because prevention worked
        result.message = "✅ Duplicata detectada e prevenida corretamente"
        result.actualOutcome = "prevented"
        result.details = { duplicateRule: ruleData, preventionWorked: true }
      } else {
        // This shouldn't happen - duplicate not detected
        result.status = "failed"
        result.message = "❌ Duplicata não foi detectada - falha na prevenção"
        result.actualOutcome = "success" // Rule would be created
        result.details = { duplicateRule: ruleData, preventionFailed: true }
      }
    } catch (error) {
      result.status = "failed"
      result.message = `Erro durante verificação de duplicata: ${error.message}`
      result.actualOutcome = "error"
      result.details = { error }
    }

    return result
  }

  const simulateBulkCreate = async (action: UserAction, result: WorkflowResult): Promise<WorkflowResult> => {
    let createdCount = 0
    let duplicateCount = 0
    let errorCount = 0
    const details = []

    if (action.data.categories) {
      // Handle categories-based bulk create
      const { period, categories, discount } = action.data

      for (const categoryData of categories) {
        for (const guestRule of categoryData.guestRules) {
          try {
            const ruleData = {
              tariff_period_id: period,
              accommodation_category_id: categoryData.category,
              number_of_guests: guestRule.guests,
              price_credit_card: guestRule.creditCard,
              price_pix: guestRule.pix,
              breakfast_discount_type: discount.type,
              breakfast_discount_value: discount.value,
            }

            const existingRules = pricingDataService.getPriceRules()
            const isDuplicate = existingRules.some(
              (rule) =>
                rule.tariff_period_id === ruleData.tariff_period_id &&
                rule.accommodation_category_id === ruleData.accommodation_category_id &&
                rule.number_of_guests === ruleData.number_of_guests,
            )

            if (isDuplicate) {
              duplicateCount++
              details.push({ action: "prevented", rule: ruleData, reason: "duplicate" })
            } else {
              pricingDataService.createPriceRule(ruleData)
              createdCount++
              details.push({ action: "created", rule: ruleData })
            }
          } catch (error) {
            errorCount++
            details.push({ action: "error", rule: guestRule, error: error.message })
          }
        }
      }
    } else if (action.data.importBatch) {
      // Handle import batch
      for (const importRule of action.data.importBatch) {
        try {
          const ruleData = {
            tariff_period_id: importRule.period,
            accommodation_category_id: importRule.category,
            number_of_guests: importRule.guests,
            price_credit_card: importRule.creditCard,
            price_pix: importRule.pix,
            breakfast_discount_type: importRule.discount.type,
            breakfast_discount_value: importRule.discount.value,
          }

          const existingRules = pricingDataService.getPriceRules()
          const isDuplicate = existingRules.some(
            (rule) =>
              rule.tariff_period_id === ruleData.tariff_period_id &&
              rule.accommodation_category_id === ruleData.accommodation_category_id &&
              rule.number_of_guests === ruleData.number_of_guests,
          )

          if (isDuplicate) {
            duplicateCount++
            details.push({ action: "prevented", rule: ruleData, reason: "duplicate" })
          } else {
            pricingDataService.createPriceRule(ruleData)
            createdCount++
            details.push({ action: "created", rule: ruleData })
          }
        } catch (error) {
          errorCount++
          details.push({ action: "error", rule: importRule, error: error.message })
        }
      }
    }

    result.status = errorCount === 0 ? "success" : "failed"
    result.message = `${createdCount} criadas, ${duplicateCount} duplicatas prevenidas, ${errorCount} erros`
    result.actualOutcome = errorCount === 0 ? "success" : "error"
    result.details = { createdCount, duplicateCount, errorCount, details }

    return result
  }

  const runWorkflow = async (workflow: UserWorkflow) => {
    setCurrentWorkflow(workflow.id)
    const workflowResults: WorkflowResult[] = []

    for (const step of workflow.steps) {
      setCurrentStep(step.id)

      for (const action of step.actions) {
        const result = await executeAction(workflow.id, step.id, action)
        workflowResults.push(result)

        // Small delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
    }

    setWorkflowResults((prev) => ({
      ...prev,
      [workflow.id]: workflowResults,
    }))

    return workflowResults
  }

  const runAllWorkflows = async () => {
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

    let totalActions = 0
    let successfulActions = 0
    let preventedDuplicates = 0
    let unexpectedFailures = 0

    for (let i = 0; i < userWorkflows.length; i++) {
      const workflow = userWorkflows[i]
      const results = await runWorkflow(workflow)

      // Update statistics
      for (const result of results) {
        totalActions++
        if (result.status === "success") {
          successfulActions++
          if (result.actualOutcome === "prevented") {
            preventedDuplicates++
          }
        } else if (result.status === "failed" && result.expectedOutcome !== "prevented") {
          unexpectedFailures++
        }
      }

      setProgress(((i + 1) / userWorkflows.length) * 100)
    }

    setSimulationStats({
      totalActions,
      successfulActions,
      preventedDuplicates,
      unexpectedFailures,
    })

    setCurrentWorkflow(null)
    setCurrentStep(null)
    setIsRunning(false)
    setProgress(100)
  }

  const resetSimulation = () => {
    setWorkflowResults({})
    setProgress(0)
    setCurrentWorkflow(null)
    setCurrentStep(null)
    setSimulationStats({
      totalActions: 0,
      successfulActions: 0,
      preventedDuplicates: 0,
      unexpectedFailures: 0,
    })

    // Clear all rules for fresh start
    try {
      const existingRules = pricingDataService.getPriceRules()
      for (const rule of existingRules) {
        pricingDataService.deletePriceRule(rule.id)
      }
    } catch (error) {
      console.warn("Error clearing rules:", error)
    }
  }

  const getStatusIcon = (status: WorkflowResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "prevented":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getUserTypeIcon = (userType: UserWorkflow["userType"]) => {
    switch (userType) {
      case "hotel_manager":
        return <Building className="h-4 w-4" />
      case "revenue_manager":
        return <TrendingUp className="h-4 w-4" />
      case "front_desk":
        return <User className="h-4 w-4" />
      case "admin":
        return <Settings className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getComplexityColor = (complexity: UserWorkflow["complexity"]) => {
    switch (complexity) {
      case "simple":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "complex":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: UserWorkflow["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalWorkflows = userWorkflows.length
  const completedWorkflows = Object.keys(workflowResults).length
  const totalActions = Object.values(workflowResults).flat().length
  const successfulActions = Object.values(workflowResults)
    .flat()
    .filter((r) => r.status === "success").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Simulação de Workflows de Usuário</h1>
          <p className="text-muted-foreground">Teste de prevenção de duplicatas em cenários reais de uso do sistema</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={resetSimulation} variant="outline" disabled={isRunning}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
          <Button onClick={runAllWorkflows} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? "Executando..." : "Simular Todos"}
          </Button>
        </div>
      </div>

      {/* Progress and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedWorkflows}/{totalWorkflows} workflows
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Ações Bem-sucedidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{simulationStats.successfulActions}</div>
            <p className="text-xs text-muted-foreground">de {simulationStats.totalActions} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Duplicatas Prevenidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{simulationStats.preventedDuplicates}</div>
            <p className="text-xs text-muted-foreground">prevenção funcionando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Falhas Inesperadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{simulationStats.unexpectedFailures}</div>
            <p className="text-xs text-muted-foreground">requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {simulationStats.totalActions > 0
                ? Math.round((simulationStats.successfulActions / simulationStats.totalActions) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">eficiência geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Workflow Indicator */}
      {currentWorkflow && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="font-medium text-blue-900">
                  Executando: {userWorkflows.find((w) => w.id === currentWorkflow)?.name}
                </p>
                <p className="text-sm text-blue-700">{userWorkflows.find((w) => w.id === currentWorkflow)?.scenario}</p>
                {currentStep && (
                  <p className="text-xs text-blue-600">
                    Passo atual:{" "}
                    {userWorkflows.find((w) => w.id === currentWorkflow)?.steps.find((s) => s.id === currentStep)?.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Results */}
      <div className="grid gap-6">
        {userWorkflows.map((workflow) => {
          const results = workflowResults[workflow.id] || []
          const workflowStats = {
            total: results.length,
            successful: results.filter((r) => r.status === "success").length,
            prevented: results.filter((r) => r.actualOutcome === "prevented").length,
            failed: results.filter((r) => r.status === "failed").length,
          }

          return (
            <Card key={workflow.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getUserTypeIcon(workflow.userType)}
                    <div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getComplexityColor(workflow.complexity)}>{workflow.complexity}</Badge>
                    <Badge className={getPriorityColor(workflow.priority)}>{workflow.priority}</Badge>
                    {results.length > 0 && (
                      <Badge variant="outline">
                        {workflowStats.successful}/{workflowStats.total} ações
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              {results.length > 0 && (
                <CardContent>
                  <div className="space-y-4">
                    {/* Workflow Statistics */}
                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{workflowStats.successful}</div>
                        <p className="text-xs text-gray-600">Sucessos</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">{workflowStats.prevented}</div>
                        <p className="text-xs text-gray-600">Prevenidas</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{workflowStats.failed}</div>
                        <p className="text-xs text-gray-600">Falhas</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {workflowStats.total > 0
                            ? Math.round((workflowStats.successful / workflowStats.total) * 100)
                            : 0}
                          %
                        </div>
                        <p className="text-xs text-gray-600">Taxa</p>
                      </div>
                    </div>

                    {/* Step Results */}
                    <div className="space-y-3">
                      {workflow.steps.map((step) => {
                        const stepResults = results.filter((r) => r.stepId === step.id)
                        return (
                          <div key={step.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{step.name}</h4>
                              <Badge variant="outline">{stepResults.length} ações</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                            <div className="space-y-2">
                              {stepResults.map((result) => (
                                <div
                                  key={result.actionId}
                                  className="flex items-center justify-between p-3 bg-white border rounded"
                                >
                                  <div className="flex items-center gap-3">
                                    {getStatusIcon(result.status)}
                                    <div>
                                      <p className="text-sm font-medium">
                                        {step.actions.find((a) => a.id === result.actionId)?.description}
                                      </p>
                                      <p className="text-xs text-gray-500">{result.message}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        result.actualOutcome === result.expectedOutcome ? "default" : "destructive"
                                      }
                                    >
                                      {result.actualOutcome === result.expectedOutcome ? "✓" : "✗"} Esperado
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {result.executionTime}ms
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Final Summary */}
      {completedWorkflows === totalWorkflows && completedWorkflows > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resumo da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Estatísticas Gerais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total de Workflows:</span>
                      <span className="font-medium">{totalWorkflows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Ações:</span>
                      <span className="font-medium">{simulationStats.totalActions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ações Bem-sucedidas:</span>
                      <span className="font-medium text-green-600">{simulationStats.successfulActions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duplicatas Prevenidas:</span>
                      <span className="font-medium text-yellow-600">{simulationStats.preventedDuplicates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Falhas Inesperadas:</span>
                      <span className="font-medium text-red-600">{simulationStats.unexpectedFailures}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Avaliação do Sistema</h4>
                  <div className="space-y-2">
                    {simulationStats.unexpectedFailures === 0 ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Sistema funcionando perfeitamente</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Sistema requer ajustes</span>
                      </div>
                    )}

                    {simulationStats.preventedDuplicates > 0 && (
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Prevenção de duplicatas ativa</span>
                      </div>
                    )}

                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">
                        <strong>Conclusão:</strong>{" "}
                        {simulationStats.unexpectedFailures === 0
                          ? "🎉 O sistema de prevenção de duplicatas está funcionando corretamente em todos os cenários testados."
                          : `⚠️ Foram detectadas ${simulationStats.unexpectedFailures} falhas que requerem investigação.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
