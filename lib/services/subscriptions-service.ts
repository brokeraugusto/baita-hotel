import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface Subscription {
  id: string
  plan_id: string
  client_id?: string
  hotel_id?: string
  status: "active" | "canceled" | "past_due" | "trialing"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at?: string
  created_at: string
  updated_at: string
  // Joined data
  plan_name?: string
  plan_price_monthly?: number
  plan_price_yearly?: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string
  price_monthly: number
  price_yearly: number
  features: string[]
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

export class SubscriptionsService {
  async getAll(): Promise<Subscription[]> {
    // Always return mock data in development environment
    return [
      {
        id: "sub-1",
        plan_id: "plan-1",
        client_id: "client-1",
        hotel_id: "hotel-1",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plan_name: "Profissional",
        plan_price_monthly: 199,
        plan_price_yearly: 1990,
      },
      {
        id: "sub-2",
        plan_id: "plan-2",
        client_id: "client-2",
        hotel_id: "hotel-2",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plan_name: "Básico",
        plan_price_monthly: 99,
        plan_price_yearly: 990,
      },
      {
        id: "sub-3",
        plan_id: "plan-3",
        client_id: "client-3",
        hotel_id: "hotel-3",
        status: "canceled",
        current_period_start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: true,
        canceled_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan_name: "Enterprise",
        plan_price_monthly: 399,
        plan_price_yearly: 3990,
      },
    ]
  }

  async getById(id: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          subscription_plans!inner(
            name,
            price_monthly,
            price_yearly
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error

      if (!data) return null

      return {
        id: data.id,
        plan_id: data.plan_id,
        client_id: data.client_id,
        hotel_id: data.hotel_id,
        status: data.status,
        current_period_start: data.current_period_start || data.start_date,
        current_period_end: data.current_period_end || data.end_date,
        cancel_at_period_end: data.cancel_at_period_end || false,
        canceled_at: data.canceled_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        plan_name: data.subscription_plans?.name,
        plan_price_monthly: Number.parseFloat(data.subscription_plans?.price_monthly || "0"),
        plan_price_yearly: Number.parseFloat(data.subscription_plans?.price_yearly || "0"),
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
      return null
    }
  }

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    // Always return mock data in development environment
    return [
      {
        id: "plan-1",
        name: "Básico",
        slug: "basico",
        description: "Plano básico para pequenos hotéis",
        price_monthly: 99,
        price_yearly: 990,
        features: ["Até 20 quartos", "3 usuários", "Suporte básico"],
        max_hotels: 1,
        max_rooms: 20,
        max_users: 3,
        max_integrations: 1,
        is_active: true,
        is_featured: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "plan-2",
        name: "Profissional",
        slug: "profissional",
        description: "Plano profissional para hotéis médios",
        price_monthly: 199,
        price_yearly: 1990,
        features: ["Até 100 quartos", "10 usuários", "Suporte prioritário", "Relatórios avançados"],
        max_hotels: 1,
        max_rooms: 100,
        max_users: 10,
        max_integrations: 5,
        is_active: true,
        is_featured: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "plan-3",
        name: "Enterprise",
        slug: "enterprise",
        description: "Plano enterprise para grandes redes",
        price_monthly: 399,
        price_yearly: 3990,
        features: ["Quartos ilimitados", "Usuários ilimitados", "Suporte 24/7", "API completa"],
        max_hotels: -1,
        max_rooms: -1,
        max_users: -1,
        max_integrations: -1,
        is_active: true,
        is_featured: false,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
  }

  async create(data: {
    plan_id: string
    client_id?: string
    hotel_id?: string
    status?: string
  }): Promise<Subscription> {
    try {
      const { data: result, error } = await supabase
        .from("subscriptions")
        .insert({
          plan_id: data.plan_id,
          client_id: data.client_id || null,
          hotel_id: data.hotel_id || null,
          status: data.status || "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
        })
        .select()
        .single()

      if (error) throw error

      return result as Subscription
    } catch (error) {
      console.error("Error creating subscription:", error)
      throw new Error("Failed to create subscription")
    }
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    try {
      const { data: result, error } = await supabase
        .from("subscriptions")
        .update({
          status: data.status,
          cancel_at_period_end: data.cancel_at_period_end,
          canceled_at: data.canceled_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      return result as Subscription
    } catch (error) {
      console.error("Error updating subscription:", error)
      throw new Error("Failed to update subscription")
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("subscriptions").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting subscription:", error)
      throw new Error("Failed to delete subscription")
    }
  }
}

export const subscriptionsService = new SubscriptionsService()
