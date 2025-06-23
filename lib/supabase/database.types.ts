export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          user_role: "client" | "master_admin"
          hotel_name: string | null
          hotel_address: string | null
          subscription_status: "active" | "inactive" | "trial" | null
          subscription_plan: string | null
          subscription_end_date: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          user_role?: "client" | "master_admin"
          hotel_name?: string | null
          hotel_address?: string | null
          subscription_status?: "active" | "inactive" | "trial" | null
          subscription_plan?: string | null
          subscription_end_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          user_role?: "client" | "master_admin"
          hotel_name?: string | null
          hotel_address?: string | null
          subscription_status?: "active" | "inactive" | "trial" | null
          subscription_plan?: string | null
          subscription_end_date?: string | null
        }
      }
      rooms: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          room_number: string
          room_type: string
          capacity: number
          price_per_night: number
          description: string | null
          status: "available" | "occupied" | "maintenance" | "cleaning"
          amenities: Json | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          room_number: string
          room_type: string
          capacity: number
          price_per_night: number
          description?: string | null
          status?: "available" | "occupied" | "maintenance" | "cleaning"
          amenities?: Json | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          room_number?: string
          room_type?: string
          capacity?: number
          price_per_night?: number
          description?: string | null
          status?: "available" | "occupied" | "maintenance" | "cleaning"
          amenities?: Json | null
          image_url?: string | null
        }
      }
      reservations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          room_id: string
          guest_id: string | null
          check_in_date: string
          check_out_date: string
          status: "confirmed" | "cancelled" | "completed" | "no_show"
          total_price: number
          payment_status: "pending" | "paid" | "refunded"
          special_requests: string | null
          booking_source: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          room_id: string
          guest_id?: string | null
          check_in_date: string
          check_out_date: string
          status?: "confirmed" | "cancelled" | "completed" | "no_show"
          total_price: number
          payment_status?: "pending" | "paid" | "refunded"
          special_requests?: string | null
          booking_source?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          room_id?: string
          guest_id?: string | null
          check_in_date?: string
          check_out_date?: string
          status?: "confirmed" | "cancelled" | "completed" | "no_show"
          total_price?: number
          payment_status?: "pending" | "paid" | "refunded"
          special_requests?: string | null
          booking_source?: string | null
        }
      }
      guests: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          full_name: string
          email: string | null
          phone: string | null
          document_type: string | null
          document_number: string | null
          nationality: string | null
          address: string | null
          notes: string | null
          vip_status: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          full_name: string
          email?: string | null
          phone?: string | null
          document_type?: string | null
          document_number?: string | null
          nationality?: string | null
          address?: string | null
          notes?: string | null
          vip_status?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          document_type?: string | null
          document_number?: string | null
          nationality?: string | null
          address?: string | null
          notes?: string | null
          vip_status?: boolean
        }
      }
      maintenance_orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          room_id: string | null
          title: string
          description: string
          priority: "low" | "medium" | "high" | "urgent"
          status: "pending" | "in_progress" | "completed" | "cancelled"
          assigned_to: string | null
          completed_at: string | null
          estimated_cost: number | null
          actual_cost: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          room_id?: string | null
          title: string
          description: string
          priority?: "low" | "medium" | "high" | "urgent"
          status?: "pending" | "in_progress" | "completed" | "cancelled"
          assigned_to?: string | null
          completed_at?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          room_id?: string | null
          title?: string
          description?: string
          priority?: "low" | "medium" | "high" | "urgent"
          status?: "pending" | "in_progress" | "completed" | "cancelled"
          assigned_to?: string | null
          completed_at?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
        }
      }
      cleaning_tasks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          hotel_id: string
          room_id: string
          task_type: "daily" | "deep" | "checkout" | "special"
          status: "pending" | "in_progress" | "completed" | "verified"
          assigned_to: string | null
          scheduled_for: string
          completed_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id: string
          room_id: string
          task_type?: "daily" | "deep" | "checkout" | "special"
          status?: "pending" | "in_progress" | "completed" | "verified"
          assigned_to?: string | null
          scheduled_for: string
          completed_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          hotel_id?: string
          room_id?: string
          task_type?: "daily" | "deep" | "checkout" | "special"
          status?: "pending" | "in_progress" | "completed" | "verified"
          assigned_to?: string | null
          scheduled_for?: string
          completed_at?: string | null
          notes?: string | null
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          price_monthly: number
          price_yearly: number
          features: Json
          max_hotels: number
          max_rooms: number
          max_users: number
          max_integrations: number
          is_active: boolean
          is_featured: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          price_monthly: number
          price_yearly: number
          features: Json
          max_hotels: number
          max_rooms: number
          max_users: number
          max_integrations: number
          is_active?: boolean
          is_featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          price_monthly?: number
          price_yearly?: number
          features?: Json
          max_hotels?: number
          max_rooms?: number
          max_users?: number
          max_integrations?: number
          is_active?: boolean
          is_featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          client_id: string
          plan_id: string
          hotel_id?: string
          status: string
          start_date?: string
          end_date?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string
          billing_cycle: string
          price: number
          payment_method?: string
          payment_details?: Json
          trial_ends_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          plan_id: string
          hotel_id?: string
          status?: string
          start_date?: string
          end_date?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string
          billing_cycle?: string
          price: number
          payment_method?: string
          payment_details?: Json
          trial_ends_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          plan_id?: string
          hotel_id?: string
          status?: string
          start_date?: string
          end_date?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string
          billing_cycle?: string
          price?: number
          payment_method?: string
          payment_details?: Json
          trial_ends_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
