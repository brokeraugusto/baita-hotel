import type { PricingRequest, PricingResult, PriceRule } from "@/lib/types/pricing"
import { pricingDataService } from "./pricing-data-service"

export class PricingService {
  /**
   * Método principal para calcular preços de acomodações
   * Segue o fluxo de execução especificado nas regras de negócio
   */
  calculatePrice(request: PricingRequest): PricingResult {
    try {
      // 1. Validar parâmetros de entrada
      const validation = this.validateRequest(request)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        }
      }

      // 2. Calcular duração da estadia
      const checkInDate = new Date(request.check_in)
      const checkOutDate = new Date(request.check_out)
      const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

      if (totalNights <= 0) {
        return {
          success: false,
          error: "Data de check-out deve ser posterior à data de check-in",
        }
      }

      // 3. Identificar o período tarifário
      const tariffPeriod = pricingDataService.findTariffPeriodByDate(request.check_in)
      if (!tariffPeriod) {
        return {
          success: false,
          error: "Período tarifário não encontrado para as datas selecionadas",
        }
      }

      // 4. Validar mínimo de diárias
      if (totalNights < tariffPeriod.minimum_nights) {
        return {
          success: false,
          error: `Estadia mínima para o período "${tariffPeriod.name}" é de ${tariffPeriod.minimum_nights} diária(s)`,
        }
      }

      // 5. Buscar regra de preço
      const priceRule = pricingDataService.findPriceRule(tariffPeriod.id, request.category_id, request.number_of_guests)

      if (!priceRule) {
        return {
          success: false,
          error: `Regra de preço não encontrada para a categoria e número de hóspedes selecionados no período "${tariffPeriod.name}"`,
        }
      }

      // 6. Calcular preços base (com café da manhã)
      const basePriceCreditCard = priceRule.price_credit_card
      const basePricePix = priceRule.price_pix

      // 7. Calcular preços sem café da manhã
      const discountAmount = this.calculateBreakfastDiscount(priceRule)
      const priceWithoutBreakfastCC = Math.max(0, basePriceCreditCard - discountAmount.creditCard)
      const priceWithoutBreakfastPix = Math.max(0, basePricePix - discountAmount.pix)

      // 8. Determinar preços finais baseados na opção de café
      const finalDailyPriceCC = request.include_breakfast ? basePriceCreditCard : priceWithoutBreakfastCC
      const finalDailyPricePix = request.include_breakfast ? basePricePix : priceWithoutBreakfastPix

      // 9. Calcular totais da estadia
      const totalCreditCard = finalDailyPriceCC * totalNights
      const totalPix = finalDailyPricePix * totalNights

      // 10. Retornar resultado estruturado
      return {
        success: true,
        pricing_details: {
          total_nights: totalNights,
          tariff_period: tariffPeriod,
          daily_rate_with_breakfast: {
            credit_card: basePriceCreditCard,
            pix: basePricePix,
          },
          daily_rate_without_breakfast: {
            credit_card: priceWithoutBreakfastCC,
            pix: priceWithoutBreakfastPix,
          },
          selected_option: {
            includes_breakfast: request.include_breakfast,
            payment_options: {
              total_credit_card: totalCreditCard,
              total_pix: totalPix,
            },
          },
        },
      }
    } catch (error) {
      console.error("Erro no cálculo de preços:", error)
      return {
        success: false,
        error: "Erro interno no cálculo de preços. Tente novamente.",
      }
    }
  }

  /**
   * Calcula o desconto do café da manhã baseado no tipo e valor configurados
   */
  private calculateBreakfastDiscount(priceRule: PriceRule): { creditCard: number; pix: number } {
    const { breakfast_discount_type, breakfast_discount_value } = priceRule

    if (breakfast_discount_type === "FIXED") {
      // Desconto fixo em reais
      return {
        creditCard: breakfast_discount_value,
        pix: breakfast_discount_value,
      }
    } else if (breakfast_discount_type === "PERCENTAGE") {
      // Desconto percentual
      const discountCC = priceRule.price_credit_card * (breakfast_discount_value / 100)
      const discountPix = priceRule.price_pix * (breakfast_discount_value / 100)

      return {
        creditCard: discountCC,
        pix: discountPix,
      }
    }

    return { creditCard: 0, pix: 0 }
  }

  /**
   * Valida os parâmetros da requisição
   */
  private validateRequest(request: PricingRequest): { isValid: boolean; error?: string } {
    if (!request.check_in || !request.check_out) {
      return { isValid: false, error: "Datas de check-in e check-out são obrigatórias" }
    }

    if (!request.category_id) {
      return { isValid: false, error: "Categoria da acomodação é obrigatória" }
    }

    if (!request.number_of_guests || request.number_of_guests < 1) {
      return { isValid: false, error: "Número de hóspedes deve ser maior que zero" }
    }

    // Validar formato das datas
    const checkInDate = new Date(request.check_in)
    const checkOutDate = new Date(request.check_out)

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return { isValid: false, error: "Formato de data inválido" }
    }

    if (checkInDate >= checkOutDate) {
      return { isValid: false, error: "Data de check-out deve ser posterior à data de check-in" }
    }

    return { isValid: true }
  }

  /**
   * Método auxiliar para obter todas as opções de preço (com e sem café)
   */
  getAllPricingOptions(
    check_in: string,
    check_out: string,
    category_id: string,
    number_of_guests: number,
  ): { withBreakfast: PricingResult; withoutBreakfast: PricingResult } {
    const withBreakfast = this.calculatePrice({
      check_in,
      check_out,
      category_id,
      number_of_guests,
      include_breakfast: true,
    })

    const withoutBreakfast = this.calculatePrice({
      check_in,
      check_out,
      category_id,
      number_of_guests,
      include_breakfast: false,
    })

    return { withBreakfast, withoutBreakfast }
  }
}

// Instância singleton do serviço
export const pricingService = new PricingService()
