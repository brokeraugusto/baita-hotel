import { createClient } from "@/lib/supabase/client"
import type { AuthUser, AuthResult, SystemStatus } from "@/lib/types/database"

const supabase = createClient()

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error?: string
}

class AuthService {
  private static instance: AuthService
  private authState: AuthState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  }
  private listeners: ((state: AuthState) => void)[] = []

  private constructor() {
    this.initializeAuth()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private async initializeAuth() {
    try {
      console.log("🚀 Initializing authentication...")

      // Check if we have a stored user session
      const storedUser = localStorage.getItem("baita_hotel_user")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          this.authState = {
            user,
            isLoading: false,
            isAuthenticated: true,
          }
          this.notifyListeners()
          return
        } catch (e) {
          localStorage.removeItem("baita_hotel_user")
        }
      }

      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }
      this.notifyListeners()
    } catch (error) {
      console.error("💥 Critical error initializing auth:", error)
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: "Authentication system unavailable",
      }
      this.notifyListeners()
    }
  }

  public async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log("🔑 Attempting sign in for:", email)

      this.authState = { ...this.authState, isLoading: true, error: undefined }
      this.notifyListeners()

      // Use our custom authentication function
      const { data, error } = await supabase.rpc("authenticate_user", {
        user_email: email.trim().toLowerCase(),
        user_password: password,
      })

      if (error) {
        console.error("❌ Sign in RPC error:", error)
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: "Erro de conexão com o servidor",
        }
        this.notifyListeners()
        return { success: false, error: "Erro de conexão com o servidor" }
      }

      console.log("📊 Authentication response:", data)

      if (!data || !data.success) {
        const errorMsg = data?.error || "Credenciais inválidas"
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: errorMsg,
        }
        this.notifyListeners()
        return { success: false, error: errorMsg }
      }

      // Store user in localStorage for persistence
      localStorage.setItem("baita_hotel_user", JSON.stringify(data.user))

      // Set authenticated user
      this.authState = {
        user: data.user,
        isLoading: false,
        isAuthenticated: true,
      }

      console.log("✅ Sign in successful:", this.authState.user)
      this.notifyListeners()
      return { success: true }
    } catch (error: any) {
      console.error("💥 Critical sign in error:", error)
      const errorMsg = "Sistema de login temporariamente indisponível"
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: errorMsg,
      }
      this.notifyListeners()
      return { success: false, error: errorMsg }
    }
  }

  public async signOut(): Promise<void> {
    try {
      console.log("👋 Signing out...")

      // Remove from localStorage
      localStorage.removeItem("baita_hotel_user")

      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }
      this.notifyListeners()
    } catch (error) {
      console.error("💥 Critical sign out error:", error)
      // Force local logout even if server logout fails
      localStorage.removeItem("baita_hotel_user")
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }
      this.notifyListeners()
    }
  }

  public async resetPassword(email: string): Promise<AuthResult> {
    try {
      // For now, just return success - implement later
      return { success: true }
    } catch (error: any) {
      console.error("💥 Critical password reset error:", error)
      return { success: false, error: "Password reset system temporarily unavailable" }
    }
  }

  // System Setup Functions
  public async getSystemStatus(): Promise<SystemStatus> {
    try {
      const { data, error } = await supabase.rpc("get_system_status")

      if (error) {
        console.error("❌ Error getting system status:", error)
        throw new Error("Failed to get system status")
      }

      return data as SystemStatus
    } catch (error) {
      console.error("💥 Critical error getting system status:", error)
      throw error
    }
  }

  public async initializeMasterUser(email: string, password: string, fullName: string): Promise<AuthResult> {
    try {
      console.log("🔧 Initializing master user:", email)

      const { data, error } = await supabase.rpc("initialize_master_user", {
        master_email: email.trim().toLowerCase(),
        master_password: password,
        master_name: fullName.trim(),
      })

      if (error) {
        console.error("❌ Error initializing master user:", error)
        return { success: false, error: "Failed to initialize system" }
      }

      if (!data.success) {
        return { success: false, error: data.error }
      }

      console.log("✅ Master user initialized successfully")
      return { success: true }
    } catch (error: any) {
      console.error("💥 Critical error initializing master user:", error)
      return { success: false, error: "System initialization failed" }
    }
  }

  // Client Management Functions (Master Admin only)
  public async createClientUser(
    email: string,
    password: string,
    fullName: string,
    hotelName: string,
    planSlug = "starter",
  ): Promise<AuthResult> {
    try {
      console.log("👤 Creating client user:", email)

      const { data, error } = await supabase.rpc("create_client_user", {
        client_email: email.trim().toLowerCase(),
        client_password: password,
        client_name: fullName.trim(),
        hotel_name: hotelName.trim(),
        plan_slug: planSlug,
      })

      if (error) {
        console.error("❌ Error creating client user:", error)
        return { success: false, error: "Failed to create client user" }
      }

      if (!data.success) {
        return { success: false, error: data.error }
      }

      console.log("✅ Client user created successfully")
      return { success: true }
    } catch (error: any) {
      console.error("💥 Critical error creating client user:", error)
      return { success: false, error: "Client creation failed" }
    }
  }

  public getAuthState(): AuthState {
    return { ...this.authState }
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener)
    // Send current state immediately
    listener({ ...this.authState })
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.authState }))
  }
}

export const authService = AuthService.getInstance()
