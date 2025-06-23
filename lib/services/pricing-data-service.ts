import { v4 as uuidv4 } from "uuid"
import type { TariffPeriod, PriceRule, AccommodationCategory } from "../types/pricing"

// Substituir os arrays existentes no início do arquivo:

let tariffPeriods: TariffPeriod[] = [
  {
    id: "1",
    name: "Baixa Temporada 2025",
    start_date: "2025-01-01",
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
    is_special: false,
    color: "#f97316",
  },
  {
    id: "3",
    name: "Natal e Ano Novo",
    start_date: "2025-12-20",
    end_date: "2026-01-05",
    minimum_nights: 3,
    is_special: true,
    priority: 10,
    color: "#ef4444",
  },
  {
    id: "4",
    name: "Temporada Regular",
    start_date: "2025-09-01",
    end_date: "2025-12-19",
    minimum_nights: 1,
    color: "#3b82f6",
  },
]

let priceRules: PriceRule[] = [
  // Baixa Temporada - Standard
  {
    id: "1",
    tariff_period_id: "1",
    accommodation_category_id: "cat-standard",
    number_of_guests: 1,
    price_credit_card: 150,
    price_pix: 135,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 20,
  },
  {
    id: "2",
    tariff_period_id: "1",
    accommodation_category_id: "cat-standard",
    number_of_guests: 2,
    price_credit_card: 200,
    price_pix: 180,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 25,
  },
  {
    id: "3",
    tariff_period_id: "1",
    accommodation_category_id: "cat-standard",
    number_of_guests: 3,
    price_credit_card: 250,
    price_pix: 225,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 30,
  },
  {
    id: "4",
    tariff_period_id: "1",
    accommodation_category_id: "cat-standard",
    number_of_guests: 4,
    price_credit_card: 300,
    price_pix: 270,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 35,
  },
  // Baixa Temporada - Super Luxo
  {
    id: "5",
    tariff_period_id: "1",
    accommodation_category_id: "cat-super-luxo",
    number_of_guests: 1,
    price_credit_card: 250,
    price_pix: 225,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 25,
  },
  {
    id: "6",
    tariff_period_id: "1",
    accommodation_category_id: "cat-super-luxo",
    number_of_guests: 2,
    price_credit_card: 350,
    price_pix: 315,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 30,
  },
  {
    id: "7",
    tariff_period_id: "1",
    accommodation_category_id: "cat-super-luxo",
    number_of_guests: 3,
    price_credit_card: 450,
    price_pix: 405,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 35,
  },
  // Baixa Temporada - Master
  {
    id: "8",
    tariff_period_id: "1",
    accommodation_category_id: "cat-master",
    number_of_guests: 1,
    price_credit_card: 400,
    price_pix: 360,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 30,
  },
  {
    id: "9",
    tariff_period_id: "1",
    accommodation_category_id: "cat-master",
    number_of_guests: 2,
    price_credit_card: 500,
    price_pix: 450,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 35,
  },
  // Alta Temporada - Standard
  {
    id: "10",
    tariff_period_id: "2",
    accommodation_category_id: "cat-standard",
    number_of_guests: 1,
    price_credit_card: 200,
    price_pix: 180,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 25,
  },
  {
    id: "11",
    tariff_period_id: "2",
    accommodation_category_id: "cat-standard",
    number_of_guests: 2,
    price_credit_card: 280,
    price_pix: 252,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 30,
  },
  {
    id: "12",
    tariff_period_id: "2",
    accommodation_category_id: "cat-standard",
    number_of_guests: 3,
    price_credit_card: 350,
    price_pix: 315,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 35,
  },
  {
    id: "13",
    tariff_period_id: "2",
    accommodation_category_id: "cat-standard",
    number_of_guests: 4,
    price_credit_card: 420,
    price_pix: 378,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 40,
  },
  // Alta Temporada - Super Luxo
  {
    id: "14",
    tariff_period_id: "2",
    accommodation_category_id: "cat-super-luxo",
    number_of_guests: 1,
    price_credit_card: 350,
    price_pix: 315,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 30,
  },
  {
    id: "15",
    tariff_period_id: "2",
    accommodation_category_id: "cat-super-luxo",
    number_of_guests: 2,
    price_credit_card: 480,
    price_pix: 432,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 35,
  },
  {
    id: "16",
    tariff_period_id: "2",
    accommodation_category_id: "cat-super-luxo",
    number_of_guests: 3,
    price_credit_card: 600,
    price_pix: 540,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 40,
  },
  // Alta Temporada - Master
  {
    id: "17",
    tariff_period_id: "2",
    accommodation_category_id: "cat-master",
    number_of_guests: 1,
    price_credit_card: 550,
    price_pix: 495,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 35,
  },
  {
    id: "18",
    tariff_period_id: "2",
    accommodation_category_id: "cat-master",
    number_of_guests: 2,
    price_credit_card: 700,
    price_pix: 630,
    breakfast_discount_type: "FIXED",
    breakfast_discount_value: 40,
  },
]

const accommodationCategories: AccommodationCategory[] = [
  {
    id: "1",
    name: "Standard",
    description: "Quarto standard com cama de casal",
    max_capacity: 2,
  },
  {
    id: "2",
    name: "Superior",
    description: "Quarto superior com cama de casal e vista para o mar",
    max_capacity: 2,
  },
  {
    id: "3",
    name: "Família",
    description: "Quarto amplo com cama de casal e duas camas de solteiro",
    max_capacity: 4,
  },
]

export const pricingDataService = {
  // Tariff Periods
  getTariffPeriods: (): TariffPeriod[] => {
    return [...tariffPeriods]
  },

  getTariffPeriodById: (id: string): TariffPeriod | undefined => {
    return tariffPeriods.find((period) => period.id === id)
  },

  createTariffPeriod: (periodData: Omit<TariffPeriod, "id">): TariffPeriod => {
    const newPeriod = {
      id: uuidv4(),
      ...periodData,
    }
    tariffPeriods.push(newPeriod)
    return newPeriod
  },

  updateTariffPeriod: (id: string, periodData: Partial<TariffPeriod>): TariffPeriod => {
    const index = tariffPeriods.findIndex((period) => period.id === id)
    if (index === -1) {
      throw new Error("Período não encontrado")
    }

    const updatedPeriod = {
      ...tariffPeriods[index],
      ...periodData,
    }
    tariffPeriods[index] = updatedPeriod
    return updatedPeriod
  },

  deleteTariffPeriod: (id: string): void => {
    // Check if there are price rules associated with this period
    const hasRules = priceRules.some((rule) => rule.tariff_period_id === id)
    if (hasRules) {
      throw new Error("Não é possível excluir um período com regras de preço associadas")
    }

    tariffPeriods = tariffPeriods.filter((period) => period.id !== id)
  },

  // Price Rules
  getPriceRules: (): PriceRule[] => {
    return [...priceRules]
  },

  getPriceRulesByPeriod: (periodId: string): PriceRule[] => {
    return priceRules.filter((rule) => rule.tariff_period_id === periodId)
  },

  getPriceRulesByCategory: (categoryId: string): PriceRule[] => {
    return priceRules.filter((rule) => rule.accommodation_category_id === categoryId)
  },

  getPriceRulesByCategoryAndPeriod: (categoryId: string, periodId: string): PriceRule[] => {
    return priceRules.filter(
      (rule) => rule.accommodation_category_id === categoryId && rule.tariff_period_id === periodId,
    )
  },

  createPriceRule: (ruleData: Omit<PriceRule, "id">): PriceRule => {
    const newRule = {
      id: uuidv4(),
      ...ruleData,
    }
    priceRules.push(newRule)
    return newRule
  },

  updatePriceRule: (id: string, ruleData: Partial<PriceRule>): PriceRule => {
    const index = priceRules.findIndex((rule) => rule.id === id)
    if (index === -1) {
      throw new Error("Regra não encontrada")
    }

    const updatedRule = {
      ...priceRules[index],
      ...ruleData,
    }
    priceRules[index] = updatedRule
    return updatedRule
  },

  deletePriceRule: (id: string): void => {
    priceRules = priceRules.filter((rule) => rule.id !== id)
  },

  // Accommodation Categories
  getAccommodationCategories: (): AccommodationCategory[] => {
    return [...accommodationCategories]
  },

  getAccommodationCategoryById: (id: string): AccommodationCategory | undefined => {
    return accommodationCategories.find((category) => category.id === id)
  },

  // Utility functions for pricing calculations
  findTariffPeriodByDate: (date: string): TariffPeriod | undefined => {
    const targetDate = new Date(date)

    return tariffPeriods.find((period) => {
      const startDate = new Date(period.start_date)
      const endDate = new Date(period.end_date)

      return targetDate >= startDate && targetDate <= endDate
    })
  },

  findPriceRule: (tariffPeriodId: string, categoryId: string, numberOfGuests: number): PriceRule | undefined => {
    return priceRules.find(
      (rule) =>
        rule.tariff_period_id === tariffPeriodId &&
        rule.accommodation_category_id === categoryId &&
        rule.number_of_guests === numberOfGuests,
    )
  },

  // Helper function to get all tariff periods sorted by priority and date
  getTariffPeriodsSorted: (): TariffPeriod[] => {
    return [...tariffPeriods].sort((a, b) => {
      // First sort by priority (higher priority first)
      if (a.priority && b.priority) {
        return b.priority - a.priority
      }
      if (a.priority && !b.priority) return -1
      if (!a.priority && b.priority) return 1

      // Then sort by start date
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    })
  },
}
