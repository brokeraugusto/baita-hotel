import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

// Types
export interface SubscriptionPlan {
  id: string
  name: string
  slug?: string
  description?: string
  price_monthly: number
  price_yearly?: number
  features?: string[]
  limits?: {
    rooms?: number
    users?: number
    integrations?: number
  }
  is_active: boolean
  is_featured?: boolean
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  hotel_name: string
  hotel_address?: string
  hotel_city?: string
  hotel_state?: string
  hotel_country?: string
  hotel_website?: string
  rooms_count: number
  plan_id?: string
  subscription_status: string
  trial_ends_at?: string
  subscription_starts_at?: string
  subscription_ends_at?: string
  last_payment_at?: string
  next_payment_at?: string
  monthly_revenue: number
  total_reservations: number
  status: string
  notes?: string
  created_at: string
  updated_at: string
  plan?: SubscriptionPlan
}

export interface Payment {
  id: string
  client_id: string
  subscription_id?: string
  amount: number
  currency: string
  status: string
  payment_method?: string
  payment_provider?: string
  external_payment_id?: string
  invoice_url?: string
  receipt_url?: string
  paid_at?: string
  failed_at?: string
  refunded_at?: string
  failure_reason?: string
  metadata?: any
  created_at: string
  updated_at: string
  client?: {
    name: string
    email: string
    hotel_name: string
  }
}

export interface SupportTicket {
  id: string
  client_id?: string
  title: string
  description: string
  priority: string
  status: string
  category?: string
  assigned_to?: string
  client_email?: string
  client_name?: string
  resolution?: string
  resolved_at?: string
  created_at: string
  updated_at: string
  client?: {
    name: string
    email: string
    hotel_name: string
  }
}

// Subscription Plans Service
export const subscriptionPlansService = {
  async getAll(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order", { ascending: true })

      if (error) {
        console.error("Error fetching plans:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getAll plans:", error)
      return []
    }
  },

  async getById(id: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase.from("subscription_plans").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching plan:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getById plan:", error)
      return null
    }
  },

  async create(plan: Omit<SubscriptionPlan, "id" | "created_at" | "updated_at">): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase.from("subscription_plans").insert([plan]).select().single()

      if (error) {
        console.error("Error creating plan:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in create plan:", error)
      return null
    }
  },

  async update(id: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase.from("subscription_plans").update(plan).eq("id", id).select().single()

      if (error) {
        console.error("Error updating plan:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in update plan:", error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("subscription_plans").delete().eq("id", id)

      if (error) {
        console.error("Error deleting plan:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in delete plan:", error)
      return false
    }
  },
}

// Clients Service
export const clientsService = {
  async getAll(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching clients:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getAll clients:", error)
      return []
    }
  },

  async getById(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching client:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getById client:", error)
      return null
    }
  },

  async create(client: Omit<Client, "id" | "created_at" | "updated_at" | "plan">): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .insert([client])
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single()

      if (error) {
        console.error("Error creating client:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in create client:", error)
      return null
    }
  },

  async update(id: string, client: Partial<Client>): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .update(client)
        .eq("id", id)
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single()

      if (error) {
        console.error("Error updating client:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in update client:", error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id)

      if (error) {
        console.error("Error deleting client:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in delete client:", error)
      return false
    }
  },

  async suspend(id: string): Promise<Client | null> {
    return this.update(id, { status: "suspended" })
  },

  async activate(id: string): Promise<Client | null> {
    return this.update(id, { status: "active" })
  },
}

// Payments Service
export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          client:clients(name, email, hotel_name)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching payments:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getAll payments:", error)
      return []
    }
  },

  async getById(id: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          client:clients(*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching payment:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getById payment:", error)
      return null
    }
  },
}

// Support Tickets Service
export const supportTicketsService = {
  async getAll(): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(`
          *,
          client:clients(name, email, hotel_name)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tickets:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getAll tickets:", error)
      return []
    }
  },

  async getById(id: string): Promise<SupportTicket | null> {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(`
          *,
          client:clients(*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching ticket:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getById ticket:", error)
      return null
    }
  },

  async update(id: string, ticket: Partial<SupportTicket>): Promise<SupportTicket | null> {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .update(ticket)
        .eq("id", id)
        .select(`
          *,
          client:clients(name, email, hotel_name)
        `)
        .single()

      if (error) {
        console.error("Error updating ticket:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in update ticket:", error)
      return null
    }
  },

  async resolve(id: string, resolution: string): Promise<SupportTicket | null> {
    return this.update(id, {
      status: "resolved",
      resolution,
      resolved_at: new Date().toISOString(),
    })
  },

  async close(id: string): Promise<SupportTicket | null> {
    return this.update(id, { status: "closed" })
  },
}

// Analytics Service
export const analyticsService = {
  async getDashboardMetrics() {
    try {
      // Get clients count
      const { count: totalClients } = await supabase.from("clients").select("*", { count: "exact", head: true })

      // Get active clients
      const { count: activeClients } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")

      // Get total revenue
      const { data: revenueData } = await supabase.from("clients").select("monthly_revenue")

      const totalRevenue = revenueData?.reduce((sum, client) => sum + (client.monthly_revenue || 0), 0) || 0

      // Get recent payments
      const { data: recentPayments } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "paid")
        .gte("paid_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const monthlyRevenue = recentPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      // Get open tickets
      const { count: openTickets } = await supabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "in_progress"])

      return {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        totalRevenue,
        monthlyRevenue,
        openTickets: openTickets || 0,
        conversionRate: totalClients ? (activeClients / totalClients) * 100 : 0,
      }
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error)
      return {
        totalClients: 0,
        activeClients: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        openTickets: 0,
        conversionRate: 0,
      }
    }
  },
}
