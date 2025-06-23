import { createClient } from "@/lib/supabase/client"

export type UserRole = "master_admin" | "hotel_owner" | "hotel_staff"

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  user_role: UserRole
  is_active: boolean
  timezone: string
  language: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error?: string
}

class AuthService {
  private static instance: AuthService
  private supabase = createClient()
  private authState: AuthState = {
    user: null,
    isLoading: false, // Start as false to prevent initial loading loops
    isAuthenticated: false,
  }
  private listeners: ((state: AuthState) => void)[] = []
  private initialized = false

  private constructor() {
    // Don't auto-initialize to prevent loops
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.log("🔄 Auth service already initialized")
      return
    }

    try {
      console.log("🚀 Initializing auth service...")
      this.authState.isLoading = true
      this.notifyListeners()

      // Check for stored user
      const storedUser = localStorage.getItem("baita_hotel_user")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          console.log("👤 Found stored user:", user.email, "Role:", user.user_role)

          // Simple validation - just check if user object has required fields
          if (user.id && user.email && user.user_role) {
            console.log("✅ Using stored user session")
            this.authState = {
              user: user,
              isLoading: false,
              isAuthenticated: true,
            }
          } else {
            console.log("⚠️ Invalid stored user, clearing...")
            localStorage.removeItem("baita_hotel_user")
            this.authState = {
              user: null,
              isLoading: false,
              isAuthenticated: false,
            }
          }
        } catch (error) {
          console.error("❌ Error parsing stored user:", error)
          localStorage.removeItem("baita_hotel_user")
          this.authState = {
            user: null,
            isLoading: false,
            isAuthenticated: false,
          }
        }
      } else {
        console.log("ℹ️ No stored user found")
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        }
      }

      this.initialized = true
      this.notifyListeners()
    } catch (error) {
      console.error("💥 Auth initialization error:", error)
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: "Erro na inicialização do sistema de autenticação",
      }
      this.initialized = true
      this.notifyListeners()
    }
  }

  public async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      console.log("🔑 Attempting sign in for:", email)

      this.authState = { ...this.authState, isLoading: true, error: undefined }
      this.notifyListeners()

      const { data, error } = await this.supabase.rpc("verify_user_credentials", {
        user_email: email.trim().toLowerCase(),
        user_password: password,
      })

      if (error) {
        console.error("❌ Sign in RPC error:", error)
        const errorMsg = "Erro no sistema de autenticação"
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: errorMsg,
        }
        this.notifyListeners()
        return { success: false, error: errorMsg }
      }

      if (!data || data.length === 0) {
        console.log("❌ Invalid credentials - no data returned")
        const errorMsg = "Email ou senha incorretos"
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: errorMsg,
        }
        this.notifyListeners()
        return { success: false, error: errorMsg }
      }

      const userData = data[0]
      console.log("✅ Sign in successful for:", userData.email, "Role:", userData.user_role)

      const user: User = {
        id: userData.user_id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone || "",
        avatar_url: userData.avatar_url || "",
        user_role: userData.user_role as UserRole,
        is_active: userData.is_active,
        timezone: userData.timezone || "America/Sao_Paulo",
        language: userData.language || "pt-BR",
        preferences: userData.preferences || {},
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: userData.updated_at || new Date().toISOString(),
      }

      // Store user in localStorage
      localStorage.setItem("baita_hotel_user", JSON.stringify(user))

      // Update last login (don't wait for it)
      this.supabase.rpc("update_last_login", { user_id: user.id }).catch(console.error)

      this.authState = {
        user: user,
        isLoading: false,
        isAuthenticated: true,
      }

      this.notifyListeners()
      return {
        success: true,
        user: user,
      }
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
      localStorage.removeItem("baita_hotel_user")

      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }
      this.notifyListeners()
    } catch (error) {
      console.error("💥 Sign out error:", error)
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
