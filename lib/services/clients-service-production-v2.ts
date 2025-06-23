import { createClient } from "@/lib/supabase/client"
import { productionAuthService } from "@/lib/auth/auth-service-production-v3"

const supabase = createClient()

export interface Client {
  id: string
  email: string
  name: string
  phone?: string
  hotel_name: string
  hotel_address?: string
  hotel_city?: string
  hotel_state?: string
  hotel_country?: string
  rooms_count: number
  plan_id?: string
  subscription_status: string
  monthly_revenue?: number
  total_reservations?: number
  status: string
  created_at: string
  updated_at?: string
  plan?: {
    name: string
    price_monthly?: number
  }
}

export const clientsService = {
  async getAll(): Promise<Client[]> {
    try {
      console.log("📋 Fetching all clients...")

      // Get user profiles with hotel_owner role and their hotels
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select(`
          id,
          email,
          full_name,
          user_role,
          phone,
          is_active,
          created_at,
          updated_at,
          hotels (
            id,
            name,
            address,
            city,
            state,
            country,
            status,
            subscriptions (
              id,
              status,
              current_price,
              subscription_plans (
                id,
                name,
                price_monthly
              )
            )
          )
        `)
        .eq("user_role", "hotel_owner")
        .order("created_at", { ascending: false })

      if (profilesError) {
        console.error("❌ Error fetching profiles:", profilesError)
        return []
      }

      // Transform the data to match expected Client structure
      const clients: Client[] = (profiles || []).map((profile) => {
        const hotel = profile.hotels?.[0]
        const subscription = hotel?.subscriptions?.[0]
        const plan = subscription?.subscription_plans

        return {
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
          phone: profile.phone || "",
          hotel_name: hotel?.name || "No Hotel",
          hotel_address: hotel?.address || "",
          hotel_city: hotel?.city || "",
          hotel_state: hotel?.state || "",
          hotel_country: hotel?.country || "Brasil",
          rooms_count: 10, // Default value
          plan_id: plan?.id || "",
          subscription_status: subscription?.status || "trial",
          monthly_revenue: subscription?.current_price || 0,
          total_reservations: 0,
          status: profile.is_active ? "active" : "suspended",
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          plan: {
            name: plan?.name || "No Plan",
            price_monthly: plan?.price_monthly || 0,
          },
        }
      })

      console.log(`✅ Found ${clients.length} clients`)
      return clients
    } catch (error) {
      console.error("💥 Error fetching clients:", error)
      return []
    }
  },

  async getById(id: string): Promise<Client | null> {
    try {
      const clients = await this.getAll()
      return clients.find((client) => client.id === id) || null
    } catch (error) {
      console.error(`❌ Error fetching client ${id}:`, error)
      return null
    }
  },

  async create(clientData: {
    name: string
    email: string
    phone?: string
    hotel_name: string
    hotel_address?: string
    hotel_city?: string
    hotel_state?: string
    hotel_country?: string
    rooms_count?: number
    plan_id?: string
  }): Promise<Client | null> {
    try {
      console.log("🏨 Creating new client:", clientData.email)

      // Generate a temporary password
      const password = this.generateTemporaryPassword()

      // Use the production auth service to create client via RPC
      const result = await productionAuthService.createClient(
        clientData.email,
        password,
        clientData.name,
        clientData.hotel_name,
        "starter", // Default plan slug
      )

      if (!result.success) {
        console.error("❌ Client creation failed:", result.error)
        return null
      }

      console.log("✅ Client created successfully")

      // Wait a moment for the database to update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Fetch the newly created client
      const clients = await this.getAll()
      const newClient = clients.find((c) => c.email === clientData.email)

      return newClient || null
    } catch (error) {
      console.error("💥 Error creating client:", error)
      return null
    }
  },

  async update(id: string, updates: Partial<Client>): Promise<Client | null> {
    try {
      console.log(`📝 Updating client ${id}`)

      // Update profile
      const profileUpdates: any = {}
      if (updates.name) profileUpdates.full_name = updates.name
      if (updates.email) profileUpdates.email = updates.email
      if (updates.phone) profileUpdates.phone = updates.phone

      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString()

        const { error: profileError } = await supabase.from("user_profiles").update(profileUpdates).eq("id", id)

        if (profileError) {
          console.error("❌ Error updating profile:", profileError)
          return null
        }
      }

      // Update hotel if needed
      if (updates.hotel_name || updates.hotel_address || updates.hotel_city) {
        const hotelUpdates: any = {}
        if (updates.hotel_name) hotelUpdates.name = updates.hotel_name
        if (updates.hotel_address) hotelUpdates.address = updates.hotel_address
        if (updates.hotel_city) hotelUpdates.city = updates.hotel_city
        if (updates.hotel_state) hotelUpdates.state = updates.hotel_state
        if (updates.hotel_country) hotelUpdates.country = updates.hotel_country

        if (Object.keys(hotelUpdates).length > 0) {
          hotelUpdates.updated_at = new Date().toISOString()

          const { error: hotelError } = await supabase.from("hotels").update(hotelUpdates).eq("owner_id", id)

          if (hotelError) {
            console.error("❌ Error updating hotel:", hotelError)
          }
        }
      }

      console.log("✅ Client updated successfully")
      return await this.getById(id)
    } catch (error) {
      console.error(`💥 Error updating client ${id}:`, error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting client ${id}`)

      const { error } = await supabase.from("user_profiles").delete().eq("id", id)

      if (error) {
        console.error("❌ Error deleting client:", error)
        return false
      }

      console.log("✅ Client deleted successfully")
      return true
    } catch (error) {
      console.error(`💥 Error deleting client ${id}:`, error)
      return false
    }
  },

  async suspend(id: string): Promise<boolean> {
    try {
      console.log(`⏸️ Suspending client ${id}`)

      const { error } = await supabase
        .from("user_profiles")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("❌ Error suspending client:", error)
        return false
      }

      console.log("✅ Client suspended successfully")
      return true
    } catch (error) {
      console.error(`💥 Error suspending client ${id}:`, error)
      return false
    }
  },

  async activate(id: string): Promise<boolean> {
    try {
      console.log(`▶️ Activating client ${id}`)

      const { error } = await supabase
        .from("user_profiles")
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("❌ Error activating client:", error)
        return false
      }

      console.log("✅ Client activated successfully")
      return true
    } catch (error) {
      console.error(`💥 Error activating client ${id}:`, error)
      return false
    }
  },

  generateTemporaryPassword(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  },
}
