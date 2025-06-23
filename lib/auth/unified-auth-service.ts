import { createClient } from "@/lib/supabase/client"

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: "master_admin" | "hotel_owner" | "hotel_staff" | "guest"
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
  database_ready: boolean
  has_master_admin: boolean
  subscription_plans_count: number
  version: string
  requires_setup: boolean
  statistics?: {
    total_hotels: number
    total_clients: number
    master_admin_exists: boolean
  }
  error?: string
}

class UnifiedAuthService {
  private supabase = createClient()
  private currentUser: AuthUser | null = null

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      console.log("🔍 Checking system status via API...")

      const response = await fetch("/api/system/setup", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!result.success) {
        console.warn("⚠️ System status check had issues:", result.error)
        // Return the data even if there was an error
        return (
          result.data || {
            system_initialized: false,
            database_ready: false,
            has_master_admin: false,
            subscription_plans_count: 0,
            version: "2.0.0",
            requires_setup: true,
            error: result.error,
          }
        )
      }

      console.log("✅ System status:", result.data)
      return result.data
    } catch (error) {
      console.error("💥 System status check failed:", error)
      return {
        system_initialized: false,
        database_ready: false,
        has_master_admin: false,
        subscription_plans_count: 0,
        version: "2.0.0",
        requires_setup: true,
        error: "Failed to check system status",
      }
    }
  }

  async initializeMasterUser(email: string, password: string, fullName: string): Promise<AuthResult> {
    try {
      console.log("👑 Initializing master user via API...")

      const response = await fetch("/api/system/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        }
      }

      console.log("✅ Master user created successfully")
      return {
        success: true,
      }
    } catch (error: any) {
      console.error("💥 Master user initialization failed:", error)
      return {
        success: false,
        error: "Falha na inicialização: " + error.message,
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log("🔐 Signing in:", email)

      // Get user from database with hotel information
      const { data: user, error: userError } = await this.supabase
        .from("user_profiles")
        .select(`
          id,
          email,
          full_name,
          user_role,
          simple_password,
          is_active,
          hotels!hotels_owner_id_fkey (
            id,
            name
          )
        `)
        .eq("email", email.toLowerCase().trim())
        .eq("is_active", true)
        .single()

      if (userError || !user) {
        console.error("❌ User not found:", userError)
        return {
          success: false,
          error: "Email não encontrado ou usuário inativo",
        }
      }

      // Check password
      if (!user.simple_password || user.simple_password !== password) {
        console.error("❌ Invalid password")
        return {
          success: false,
          error: "Senha incorreta",
        }
      }

      // Create auth user object
      const hotel = Array.isArray(user.hotels) ? user.hotels[0] : null
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.user_role as AuthUser["role"],
        hotel_id: hotel?.id,
        hotel_name: hotel?.name,
        is_active: user.is_active,
      }

      // Store user in memory and localStorage
      this.currentUser = authUser
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(authUser))
      }

      console.log("✅ Sign in successful:", authUser.email)
      return {
        success: true,
        user: authUser,
      }
    } catch (error: any) {
      console.error("💥 Sign in error:", error)
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
      console.log("✅ Signed out")
    } catch (error) {
      console.error("❌ Sign out error:", error)
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

  // Legacy compatibility
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    this.getCurrentUser().then(callback)
    return {
      data: { subscription: { unsubscribe: () => {} } },
    }
  }

  getAuthState() {
    return {
      user: this.currentUser,
      loading: false,
    }
  }
}

export const unifiedAuthService = new UnifiedAuthService()

// Export as default for compatibility
export const authService = unifiedAuthService
export const productionAuthService = unifiedAuthService
