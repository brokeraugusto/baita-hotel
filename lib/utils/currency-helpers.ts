export function formatCurrency(amount: number, currency = "BRL", locale = "pt-BR"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    console.error("Error formatting currency:", error)
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal separators
  const cleanValue = value.replace(/[^\d,.-]/g, "")

  // Handle different decimal separators
  const normalizedValue = cleanValue.replace(",", ".")

  const parsed = Number.parseFloat(normalizedValue)
  return isNaN(parsed) ? 0 : parsed
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0
  return (part / total) * 100
}

export function calculateDiscount(originalPrice: number, discountPercent: number): number {
  return originalPrice * (1 - discountPercent / 100)
}

export function calculateTax(amount: number, taxRate: number): number {
  return amount * (taxRate / 100)
}

export function formatNumber(
  value: number,
  options: {
    decimals?: number
    thousandsSeparator?: string
    decimalSeparator?: string
  } = {},
): string {
  const { decimals = 2, thousandsSeparator = ".", decimalSeparator = "," } = options

  const parts = value.toFixed(decimals).split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)

  return parts.join(decimalSeparator)
}
