import { createClient } from "@/lib/supabase/client"

export interface AnalyticsEvent {
  id?: string
  event_name: string
  user_id?: string
  hotel_id: string
  properties: Record<string, any>
  timestamp?: string
  created_at?: string
}

export interface NotificationData {
  id?: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  priority: "low" | "medium" | "high" | "urgent"
  user_id?: string
  hotel_id: string
  read?: boolean
  action_url?: string
  expires_at?: string
  created_at?: string
}

export interface BackupConfig {
  id?: string
  hotel_id: string
  backup_frequency: "daily" | "weekly" | "monthly"
  backup_time: string
  include_files: boolean
  retention_days: number
  auto_backup: boolean
  created_at?: string
  updated_at?: string
}

class DatabaseService {
  private supabase = createClient()

  // Analytics Events
  async trackEvent(event: Omit<AnalyticsEvent, "id" | "timestamp" | "created_at">): Promise<void> {
    try {
      const { error } = await this.supabase.from("analytics_events").insert({
        ...event,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error("Error tracking event:", error)
    }
  }

  async getAnalyticsEvents(hotelId: string, limit = 100): Promise<AnalyticsEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from("analytics_events")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting analytics events:", error)
      return []
    }
  }

  // Notifications
  async createNotification(notification: Omit<NotificationData, "id" | "created_at" | "read">): Promise<void> {
    try {
      const { error } = await this.supabase.from("notifications").insert({
        ...notification,
        read: false,
        created_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error("Error creating notification:", error)
    }
  }

  async getNotifications(userId?: string, hotelId?: string, limit = 50): Promise<NotificationData[]> {
    try {
      let query = this.supabase.from("notifications").select("*")

      if (userId) query = query.eq("user_id", userId)
      if (hotelId) query = query.eq("hotel_id", hotelId)

      const { data, error } = await query.order("created_at", { ascending: false }).limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting notifications:", error)
      return []
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("notifications").update({ read: true }).eq("id", notificationId)

      if (error) throw error
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Backup Configuration
  async getBackupConfig(hotelId: string): Promise<BackupConfig | null> {
    try {
      const { data, error } = await this.supabase.from("backup_configs").select("*").eq("hotel_id", hotelId).single()

      if (error && error.code !== "PGRST116") throw error
      return data
    } catch (error) {
      console.error("Error getting backup config:", error)
      return null
    }
  }

  async updateBackupConfig(config: BackupConfig): Promise<void> {
    try {
      const { error } = await this.supabase.from("backup_configs").upsert({
        ...config,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error("Error updating backup config:", error)
    }
  }

  async getBackupRecords(hotelId: string, limit = 20): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from("backup_records")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting backup records:", error)
      return []
    }
  }

  // Dashboard Metrics
  async getDashboardMetrics(hotelId: string): Promise<any> {
    try {
      // This would typically aggregate data from multiple tables
      // For now, returning mock data that would come from the database
      return {
        totalRevenue: 125000,
        occupancyRate: 85,
        activeGuests: 42,
        totalRooms: 50,
        pendingMaintenance: 3,
        cleaningTasks: 8,
        recentReservations: 15,
        checkInsToday: 8,
        checkOutsToday: 6,
      }
    } catch (error) {
      console.error("Error getting dashboard metrics:", error)
      return null
    }
  }
}

export const databaseService = new DatabaseService()
