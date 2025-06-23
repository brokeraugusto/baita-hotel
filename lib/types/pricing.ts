export interface TariffPeriod {
  id: string
  name: string
  start_date: string
  end_date: string
  minimum_nights: number
  description?: string
  is_special?: boolean
  priority?: number
  color?: string
}

export interface PriceRule {
  id: string
  tariff_period_id: string
  accommodation_category_id: string
  number_of_guests: number
  price_credit_card: number
  price_pix: number
  breakfast_discount_type: "FIXED" | "PERCENTAGE"
  breakfast_discount_value: number
}

export interface AccommodationCategory {
  id: string
  name: string
  description?: string
  max_capacity: number
}
