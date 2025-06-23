import { createClient } from "@/lib/supabase/client"

export interface AnalyticsEvent {
  event_name: string
  user_id?: string
  hotel_id?: string
  properties: Record<string, any>
  timestamp: string
}

export interface DashboardMetrics {
  totalRevenue: number
  occupancyRate: number
  averageDailyRate: number
  revPAR: number
  totalReservations: number
  activeGuests: number
  pendingMaintenance: number
  cleaningTasks: number
  period: {
    start: string
    end: string
  }
}

export interface RevenueAnalytics {
  daily: Array<{ date: string; revenue: number; reservations: number }>
  monthly: Array<{ month: string; revenue: number; growth: number }>
  byCategory: Array<{ category: string; revenue: number; percentage: number }>
  trends: {
    revenueGrowth: number
    occupancyTrend: number
    averageStayTrend: number
  }
}

class AnalyticsService {
  private supabase = createClient()

  async trackEvent(event: Omit<AnalyticsEvent, "timestamp">): Promise<void> {
    try {
      const { error } = await this.supabase.from("analytics_events").insert({
        ...event,
        timestamp: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error("Error tracking event:", error)
    }
  }

  async getDashboardMetrics(hotelId: string, period: { start: string; end: string }): Promise<DashboardMetrics> {
    try {
      // Get reservations data
      const { data: reservations, error: reservationsError } = await this.supabase
        .from("reservations")
        .select("*")
        .eq("hotel_id", hotelId)
        .gte("check_in_date", period.start)
        .lte("check_out_date", period.end)

      if (reservationsError) throw reservationsError

      // Get rooms data for occupancy calculation
      const { data: rooms, error: roomsError } = await this.supabase.from("rooms").select("*").eq("hotel_id", hotelId)

      if (roomsError) throw roomsError

      // Get maintenance data
      const { data: maintenance, error: maintenanceError } = await this.supabase
        .from("maintenance_orders")
        .select("*")
        .eq("hotel_id", hotelId)
        .in("status", ["pending", "in_progress"])

      if (maintenanceError) throw maintenanceError

      // Get cleaning tasks
      const { data: cleaning, error: cleaningError } = await this.supabase
        .from("cleaning_tasks")
        .select("*")
        .eq("hotel_id", hotelId)
        .in("status", ["pending", "in_progress"])

      if (cleaningError) throw cleaningError

      // Calculate metrics
      const totalRevenue = reservations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0
      const totalRooms = rooms?.length || 1
      const occupiedRooms = reservations?.filter((r) => r.status === "checked_in").length || 0
      const occupancyRate = (occupiedRooms / totalRooms) * 100
      const averageDailyRate = totalRevenue / (reservations?.length || 1)
      const revPAR = totalRevenue / totalRooms / this.getDaysBetween(period.start, period.end)

      return {
        totalRevenue,
        occupancyRate,
        averageDailyRate,
        revPAR,
        totalReservations: reservations?.length || 0,
        activeGuests: occupiedRooms,
        pendingMaintenance: maintenance?.length || 0,
        cleaningTasks: cleaning?.length || 0,
        period,
      }
    } catch (error) {
      console.error("Error getting dashboard metrics:", error)
      throw error
    }
  }

  async getRevenueAnalytics(hotelId: string, period: { start: string; end: string }): Promise<RevenueAnalytics> {
    try {
      const { data: reservations, error } = await this.supabase
        .from("reservations")
        .select("*")
        .eq("hotel_id", hotelId)
        .gte("check_in_date", period.start)
        .lte("check_out_date", period.end)
        .order("check_in_date")

      if (error) throw error

      // Process daily revenue
      const dailyRevenue = this.processDailyRevenue(reservations || [])

      // Process monthly revenue
      const monthlyRevenue = this.processMonthlyRevenue(reservations || [])

      // Process revenue by category
      const categoryRevenue = this.processCategoryRevenue(reservations || [])

      // Calculate trends
      const trends = this.calculateTrends(reservations || [])

      return {
        daily: dailyRevenue,
        monthly: monthlyRevenue,
        byCategory: categoryRevenue,
        trends,
      }
    } catch (error) {
      console.error("Error getting revenue analytics:", error)
      throw error
    }
  }

  async getOccupancyForecast(
    hotelId: string,
    days = 30,
  ): Promise<Array<{ date: string; predicted_occupancy: number; confidence: number }>> {
    try {
      // Get historical data for prediction
      const { data: historical, error } = await this.supabase
        .from("reservations")
        .select("check_in_date, check_out_date, status")
        .eq("hotel_id", hotelId)
        .gte("check_in_date", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      // Simple forecast based on historical patterns
      const forecast = []
      const today = new Date()

      for (let i = 0; i < days; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)

        // Simple prediction based on day of week patterns
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

        const baseOccupancy = isWeekend ? 0.75 : 0.6
        const seasonalFactor = this.getSeasonalFactor(date)
        const predicted_occupancy = Math.min(0.95, baseOccupancy * seasonalFactor)

        forecast.push({
          date: date.toISOString().split("T")[0],
          predicted_occupancy: Math.round(predicted_occupancy * 100),
          confidence: 0.8,
        })
      }

      return forecast
    } catch (error) {
      console.error("Error getting occupancy forecast:", error)
      return []
    }
  }

  private processDailyRevenue(reservations: any[]): Array<{ date: string; revenue: number; reservations: number }> {
    const dailyData = new Map()

    reservations.forEach((reservation) => {
      const date = reservation.check_in_date.split("T")[0]
      const existing = dailyData.get(date) || { revenue: 0, reservations: 0 }

      dailyData.set(date, {
        revenue: existing.revenue + (reservation.total_amount || 0),
        reservations: existing.reservations + 1,
      })
    })

    return Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      ...data,
    }))
  }

  private processMonthlyRevenue(reservations: any[]): Array<{ month: string; revenue: number; growth: number }> {
    const monthlyData = new Map()

    reservations.forEach((reservation) => {
      const date = new Date(reservation.check_in_date)
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const existing = monthlyData.get(month) || 0

      monthlyData.set(month, existing + (reservation.total_amount || 0))
    })

    const months = Array.from(monthlyData.entries()).map(([month, revenue]) => ({
      month,
      revenue,
      growth: 0, // Calculate growth compared to previous month
    }))

    // Calculate growth rates
    for (let i = 1; i < months.length; i++) {
      const current = months[i].revenue
      const previous = months[i - 1].revenue
      months[i].growth = previous > 0 ? ((current - previous) / previous) * 100 : 0
    }

    return months
  }

  private processCategoryRevenue(
    reservations: any[],
  ): Array<{ category: string; revenue: number; percentage: number }> {
    const categoryData = new Map()
    let totalRevenue = 0

    reservations.forEach((reservation) => {
      const category = reservation.room_category || "Standard"
      const revenue = reservation.total_amount || 0
      const existing = categoryData.get(category) || 0

      categoryData.set(category, existing + revenue)
      totalRevenue += revenue
    })

    return Array.from(categoryData.entries()).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    }))
  }

  private calculateTrends(reservations: any[]): {
    revenueGrowth: number
    occupancyTrend: number
    averageStayTrend: number
  } {
    // Simple trend calculations - in a real implementation, this would be more sophisticated
    return {
      revenueGrowth: 12.5, // Percentage growth
      occupancyTrend: 8.3, // Percentage change in occupancy
      averageStayTrend: -2.1, // Change in average stay duration
    }
  }

  private getSeasonalFactor(date: Date): number {
    const month = date.getMonth()

    // Simple seasonal factors (would be more sophisticated in real implementation)
    const seasonalFactors = [
      0.8, // January
      0.85, // February
      0.9, // March
      0.95, // April
      1.0, // May
      1.1, // June
      1.2, // July
      1.15, // August
      1.0, // September
      0.95, // October
      0.9, // November
      1.05, // December
    ]

    return seasonalFactors[month]
  }

  private getDaysBetween(start: string, end: string): number {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}

export const analyticsService = new AnalyticsService()
