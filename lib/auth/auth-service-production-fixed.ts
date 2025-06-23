import { createClient } from "@/lib/supabase/client"

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: "master_admin" | "client" | "hotel_staff"
  hotel_id?: string
  hotel_name?: string
  is_active: boolean
}

export interface AuthResult {
  success: boolean
  error?: string
  user?: AuthUser
  requiresSetup?: boolean
}

export interface SystemStatus {
  system_initialized: boolean
  version: string
  requires_setup: boolean
  statistics: {
    total_hotels: number
    total_clients: number
    master_admin_exists: boolean
  }
  error?: string
}

class ProductionAuthService {
  private supabase = createClient()

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      console.log("🔍 Checking system status...")

      // Try to call the function
      const { data, error } = await this.supabase.rpc("get_system_status")

      if (error) {
        console.error("❌ System status RPC error:", error)

        // If function doesn't exist, try to check manually
        return await this.getSystemStatusManually()
      }

      console.log("✅ System status retrieved:", data)
      return data as SystemStatus
    } catch (error) {
      console.error("💥 System status check failed:", error)
      return await this.getSystemStatusManually()
    }
  }

  private async getSystemStatusManually(): Promise<SystemStatus> {
    try {
      console.log("🔧 Getting system status manually...")

      // Check if profiles table exists and has master admin
      const { data: profiles, error: profilesError } = await this.supabase
        .from("profiles")
        .select("role")
        .eq("role", "master_admin")
        .limit(1)

      const masterExists = !profilesError && profiles && profiles.length > 0

      // Get hotel count
      const { count: hotelCount } = await this.supabase.from("hotels").select("*", { count: "exact", head: true })

      // Get client count
      const { count: clientCount } = await this.supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "client")

      return {
        system_initialized: masterExists,
        version: "1.0.0",
        requires_setup: !masterExists,
        statistics: {
          total_hotels: hotelCount || 0,
          total_clients: clientCount || 0,
          master_admin_exists: masterExists,
        },
      }
    } catch (error) {
      console.error("💥 Manual system status check failed:", error)
      return {
        system_initialized: false,
        version: "1.0.0",
        requires_setup: true,
        statistics: {
          total_hotels: 0,
          total_clients: 0,
          master_admin_exists: false,
        },
        error: "Failed to check system status",
      }
    }
  }

  async initializeMasterUser(email: string, password: string, fullName: string): Promise<AuthResult> {
    try {
      console.log("👑 Initializing master user...")

      const { data, error } = await this.supabase.rpc("initialize_master_user", {
        master_email: email,
        master_password: password,
        master_name: fullName,
      })

      if (error) {
        console.error("❌ Master user initialization RPC error:", error)
        return {
          success: false,
          error: "Failed to initialize master user: " + error.message,
        }
      }

      const result = data as any

      if (!result.success) {
        console.error("❌ Master user initialization failed:", result.error)
        return {
          success: false,
          error: result.error,
        }
      }

      console.log("✅ Master user initialized successfully")
      return {
        success: true,
      }
    } catch (error: any) {
      console.error("💥 Master user initialization failed:", error)
      return {
        success: false,
        error: "System initialization failed: " + error.message,
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log("🔐 Production auth: Signing in", email)

      // Check system status first
      const systemStatus = await this.getSystemStatus()
      if (systemStatus.requires_setup) {
        return {
          success: false,
          error: "System requires initial setup",
          requiresSetup: true,
        }
      }

      // Attempt authentication
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        console.error("❌ Auth error:", authError)
        return {
          success: false,
          error: this.getErrorMessage(authError.message),
        }
      }

      if (!authData.user) {
        return {
          success: false,
          error: "Authentication failed",
        }
      }

      // Get user profile
      const { data: profile, error: profileError } = await this.supabase
        .from("profiles")
        .select(
          `
          id,
          email,
          full_name,
          role,
          is_active,
          hotels (
            id,
            name
          )
        `,
        )
        .eq("id", authData.user.id)
        .single()

      if (profileError || !profile) {
        console.error("❌ Profile error:", profileError)
        return {
          success: false,
          error: "User profile not found",
        }
      }

      if (!profile.is_active) {
        return {
          success: false,
          error: "Account is suspended",
        }
      }

      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        hotel_id: profile.hotels?.[0]?.id,
        hotel_name: profile.hotels?.[0]?.name,
        is_active: profile.is_active,
      }

      console.log("✅ Production auth successful:", authUser.email)
      return {
        success: true,
        user: authUser,
      }
    } catch (error: any) {
      console.error("💥 Production auth error:", error)
      return {
        success: false,
        error: "Authentication system error",
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
      console.log("✅ Production auth: Signed out")
    } catch (error) {
      console.error("❌ Production auth signout error:", error)
      throw error
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession()

      if (!session?.user) return null

      const { data: profile } = await this.supabase
        .from("profiles")
        .select(
          `
          id,
          email,
          full_name,
          role,
          is_active,
          hotels (
            id,
            name
          )
        `,
        )
        .eq("id", session.user.id)
        .single()

      if (!profile || !profile.is_active) return null

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        hotel_id: profile.hotels?.[0]?.id,
        hotel_name: profile.hotels?.[0]?.name,
        is_active: profile.is_active,
      }
    } catch (error) {
      console.error("❌ Get current user error:", error)
      return null
    }
  }

  async createClient(
    email: string,
    password: string,
    fullName: string,
    hotelName: string,
    planName = "Starter",
  ): Promise<AuthResult> {
    try {
      console.log("🏨 Creating client:", email)

      const { data, error } = await this.supabase.rpc("create_client_user", {
        client_email: email,
        client_password: password,
        client_name: fullName,
        hotel_name: hotelName,
        plan_name: planName,
      })

      if (error) {
        console.error("❌ Client creation RPC error:", error)
        return {
          success: false,
          error: "Failed to create client: " + error.message,
        }
      }

      const result = data as any

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        }
      }

      console.log("✅ Client created successfully")
      return {
        success: true,
      }
    } catch (error: any) {
      console.error("💥 Client creation failed:", error)
      return {
        success: false,
        error: "Client creation failed: " + error.message,
      }
    }
  }

  private getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      "Invalid login credentials": "Email ou senha incorretos",
      "Email not confirmed": "Email não confirmado",
      "Too many requests": "Muitas tentativas. Tente novamente mais tarde",
      "User not found": "Usuário não encontrado",
      "Invalid email": "Email inválido",
    }

    return errorMessages[error] || "Erro no login. Tente novamente"
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Production auth state changed:", event)

      if (event === "SIGNED_OUT" || !session?.user) {
        callback(null)
        return
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const user = await this.getCurrentUser()
        callback(user)
      }
    })
  }
}

export const productionAuthService = new ProductionAuthService()
