export function formatDate(date: string | Date, format: "short" | "long" | "time" = "short"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return "Data inválida"
  }

  const options: Intl.DateTimeFormatOptions = {
    short: { day: "2-digit", month: "2-digit", year: "numeric" },
    long: { day: "2-digit", month: "long", year: "numeric" },
    time: { hour: "2-digit", minute: "2-digit" },
  }[format]

  return dateObj.toLocaleDateString("pt-BR", options)
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return "Data inválida"
  }

  return dateObj.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "Agora mesmo"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""} atrás`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hora${diffInHours > 1 ? "s" : ""} atrás`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} dia${diffInDays > 1 ? "s" : ""} atrás`
  }

  return formatDate(dateObj, "short")
}

export function calculateDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate
  const end = typeof endDate === "string" ? new Date(endDate) : endDate

  const diffInTime = end.getTime() - start.getTime()
  return Math.ceil(diffInTime / (1000 * 60 * 60 * 24))
}

export function isWeekend(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const dayOfWeek = dateObj.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
}

export function addDays(date: string | Date, days: number): Date {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date)
  dateObj.setDate(dateObj.getDate() + days)
  return dateObj
}

export function startOfDay(date: string | Date): Date {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date)
  dateObj.setHours(0, 0, 0, 0)
  return dateObj
}

export function endOfDay(date: string | Date): Date {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date)
  dateObj.setHours(23, 59, 59, 999)
  return dateObj
}

export function getCurrentWeek(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - dayOfWeek)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export function getCurrentMonth(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  return { start, end }
}
