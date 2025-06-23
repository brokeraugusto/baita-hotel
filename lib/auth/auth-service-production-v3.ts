import { createClient } from "@/lib/supabase/client"

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: "master_admin" | "hotel_owner" | "hotel_staff"
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

class ProductionAuthServiceV3 {
  private supabase = createClient()
  private currentUser: AuthUser | null = null

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      console.log("🔍 Checking system status...")

      const { data, error } = await this.supabase.rpc("get_system_status")

      if (error) {
        console.error("❌ System status RPC error:", error)
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

      const { data: profiles, error: profilesError } = await this.supabase
        .from("user_profiles")
        .select("user_role")
        .eq("user_role", "master_admin")
        .limit(1)

      const masterExists = !profilesError && profiles && profiles.length > 0

      const { count: hotelCount } = await this.supabase.from("hotels").select("*", { count: "exact", head: true })

      const { count: clientCount } = await this.supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_role", "hotel_owner")

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

      // Use our custom authenticate_user function
      const { data: authData, error: authError } = await this.supabase.rpc("authenticate_user", {
        user_email: email.trim().toLowerCase(),
        user_password: password,
      })

      if (authError) {
        console.error("❌ Auth RPC error:", authError)
        return {
          success: false,
          error: "Erro de autenticação: " + authError.message,
        }
      }

      const result = authData as any

      if (!result.success) {
        console.error("❌ Authentication failed:", result.error)
        return {
          success: false,
          error: result.error || "Credenciais inválidas",
        }
      }

      const userData = result.user
      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.user_role,
        hotel_id: userData.hotel_id,
        hotel_name: userData.hotel_name,
        is_active: userData.is_active,
      }

      // Store user in memory and localStorage
      this.currentUser = authUser
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(authUser))
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
        error: "Erro no sistema de autenticação",
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      this.currentUser = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_user")
      }
      console.log("✅ Production auth: Signed out")
    } catch (error) {
      console.error("❌ Production auth signout error:", error)
      throw error
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // First check memory
      if (this.currentUser) {
        return this.currentUser
      }

      // Then check localStorage
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("auth_user")
        if (stored) {
          const user = JSON.parse(stored) as AuthUser
          this.currentUser = user
          return user
        }
      }

      return null
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
    planSlug = "starter",
  ): Promise<AuthResult> {
    try {
      console.log("🏨 Creating client via RPC function:", email)

      const { data, error } = await this.supabase.rpc("create_client_user", {
        client_email: email,
        client_password: password,
        client_name: fullName,
        hotel_name: hotelName,
        plan_slug: planSlug,
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

      console.log("✅ Client created successfully via RPC")
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

  // Mock auth state change for compatibility
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    // Initial call
    this.getCurrentUser().then(callback)

    // Return a cleanup function
    return {
      data: { subscription: { unsubscribe: () => {} } },
    }
  }

  // Legacy compatibility methods
  async signUp(userData: {
    email: string
    password: string
    name: string
    hotel_name: string
    user_role: string
  }): Promise<boolean> {
    try {
      const result = await this.createClient(
        userData.email,
        userData.password,
        userData.name,
        userData.hotel_name,
        "starter",
      )
      return result.success
    } catch (error) {
      console.error("❌ Legacy signUp error:", error)
      return false
    }
  }

  getAuthState() {
    return {
      user: this.currentUser,
      loading: false,
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
}

export const productionAuthService = new ProductionAuthServiceV3()
