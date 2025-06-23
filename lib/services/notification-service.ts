import { createClient } from "@/lib/supabase/client"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  priority: "low" | "medium" | "high" | "urgent"
  user_id?: string
  hotel_id?: string
  read: boolean
  action_url?: string
  created_at: string
  expires_at?: string
}

export interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  notification_types: {
    reservations: boolean
    maintenance: boolean
    cleaning: boolean
    financial: boolean
    system: boolean
  }
}

class NotificationService {
  private supabase = createClient()
  private subscribers = new Map<string, (notification: Notification) => void>()

  async createNotification(notification: Omit<Notification, "id" | "created_at" | "read">): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .insert({
          ...notification,
          read: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Notify subscribers
      this.notifySubscribers(data)

      // Send push notification if enabled
      if (notification.user_id) {
        await this.sendPushNotification(notification.user_id, notification)
      }
    } catch (error) {
      console.error("Error creating notification:", error)
    }
  }

  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting notifications:", error)
      return []
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("notifications").update({ read: true }).eq("id", notificationId)

      if (error) throw error
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)

      if (error) throw error
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error("Error getting unread count:", error)
      return 0
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("notifications").delete().eq("id", notificationId)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  async updatePreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
    try {
      const { error } = await this.supabase.from("user_notification_preferences").upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error("Error updating notification preferences:", error)
    }
  }

  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") throw error

      return (
        data || {
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          notification_types: {
            reservations: true,
            maintenance: true,
            cleaning: true,
            financial: true,
            system: true,
          },
        }
      )
    } catch (error) {
      console.error("Error getting notification preferences:", error)
      return null
    }
  }

  // Real-time subscription
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    this.subscribers.set(userId, callback)

    const channel = this.supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification)
        },
      )
      .subscribe()

    return () => {
      this.subscribers.delete(userId)
      this.supabase.removeChannel(channel)
    }
  }

  private notifySubscribers(notification: Notification): void {
    if (notification.user_id && this.subscribers.has(notification.user_id)) {
      const callback = this.subscribers.get(notification.user_id)!
      callback(notification)
    }
  }

  private async sendPushNotification(
    userId: string,
    notification: Omit<Notification, "id" | "created_at" | "read">,
  ): Promise<void> {
    try {
      // Check if user has push notifications enabled
      const preferences = await this.getPreferences(userId)
      if (!preferences?.push_notifications) return

      // In a real implementation, this would integrate with a push notification service
      // like Firebase Cloud Messaging, OneSignal, etc.
      console.log("Push notification would be sent:", {
        userId,
        title: notification.title,
        message: notification.message,
      })
    } catch (error) {
      console.error("Error sending push notification:", error)
    }
  }

  // Predefined notification templates
  async notifyNewReservation(hotelId: string, reservationId: string, guestName: string): Promise<void> {
    await this.createNotification({
      title: "Nova Reserva",
      message: `Nova reserva recebida de ${guestName}`,
      type: "info",
      priority: "medium",
      hotel_id: hotelId,
      action_url: `/client/reservas/${reservationId}`,
    })
  }

  async notifyMaintenanceUrgent(hotelId: string, userId: string, roomNumber: string, issue: string): Promise<void> {
    await this.createNotification({
      title: "Manutenção Urgente",
      message: `Problema urgente no quarto ${roomNumber}: ${issue}`,
      type: "error",
      priority: "urgent",
      user_id: userId,
      hotel_id: hotelId,
      action_url: "/client/manutencao",
    })
  }

  async notifyCheckInReady(hotelId: string, userId: string, roomNumber: string, guestName: string): Promise<void> {
    await this.createNotification({
      title: "Quarto Pronto para Check-in",
      message: `Quarto ${roomNumber} está pronto para o check-in de ${guestName}`,
      type: "success",
      priority: "medium",
      user_id: userId,
      hotel_id: hotelId,
      action_url: "/client/checkin",
    })
  }

  async notifyPaymentReceived(hotelId: string, userId: string, amount: number, reservationId: string): Promise<void> {
    await this.createNotification({
      title: "Pagamento Recebido",
      message: `Pagamento de R$ ${amount.toFixed(2)} recebido`,
      type: "success",
      priority: "low",
      user_id: userId,
      hotel_id: hotelId,
      action_url: `/client/reservas/${reservationId}`,
    })
  }
}

export const notificationService = new NotificationService()
