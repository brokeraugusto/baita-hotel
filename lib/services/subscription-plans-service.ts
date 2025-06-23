import { createClient } from "@/lib/supabase/client"
import type { SubscriptionPlan } from "@/lib/types/database"

class SubscriptionPlansService {
  private supabase = createClient()

  async getAll(): Promise<SubscriptionPlan[]> {
    try {
      console.log("📋 Fetching subscription plans...")

      const { data, error } = await this.supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order", { ascending: true })

      if (error) {
        console.error("❌ Error fetching plans:", error)
        throw new Error(`Failed to fetch plans: ${error.message}`)
      }

      console.log(`✅ Found ${data?.length || 0} plans`)
      return data || []
    } catch (error) {
      console.error("💥 Error in getAll:", error)
      throw error
    }
  }

  async getById(id: string): Promise<SubscriptionPlan | null> {
    try {
      console.log(`🔍 Fetching plan ${id}...`)

      const { data, error } = await this.supabase.from("subscription_plans").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return null // Not found
        }
        console.error(`❌ Error fetching plan ${id}:`, error)
        throw new Error(`Failed to fetch plan: ${error.message}`)
      }

      console.log("✅ Plan found:", data?.name)
      return data
    } catch (error) {
      console.error(`💥 Error in getById(${id}):`, error)
      throw error
    }
  }

  async create(planData: Omit<SubscriptionPlan, "id" | "created_at" | "updated_at">): Promise<SubscriptionPlan> {
    try {
      console.log("🆕 Creating new plan:", planData.name)

      // Validate required fields
      if (!planData.name || !planData.price_monthly) {
        throw new Error("Name and monthly price are required")
      }

      if (planData.price_monthly <= 0) {
        throw new Error("Monthly price must be greater than zero")
      }

      // Generate slug if not provided
      const slug =
        planData.slug ||
        planData.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove accents
          .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-") // Remove duplicate hyphens
          .trim()

      const insertData = {
        ...planData,
        slug,
        features: planData.features || [],
        limits: planData.limits || {},
        max_hotels: planData.max_hotels || 1,
        max_rooms: planData.max_rooms || 50,
        max_users: planData.max_users || 5,
        max_integrations: planData.max_integrations || 3,
        is_active: planData.is_active !== undefined ? planData.is_active : true,
        is_featured: planData.is_featured !== undefined ? planData.is_featured : false,
        sort_order: planData.sort_order || 0,
      }

      const { data, error } = await this.supabase.from("subscription_plans").insert(insertData).select().single()

      if (error) {
        console.error("❌ Error creating plan:", error)
        if (error.code === "23505") {
          if (error.message.includes("subscription_plans_slug_key")) {
            throw new Error("A plan with this slug already exists")
          }
        }
        throw new Error(`Failed to create plan: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("💥 Error in create:", error)
      throw error
    }
  }
}
