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
    isLoading: false,
    isAuthenticated: false,
  }
  private listeners: ((state: AuthState) => void)[] = []
  private initialized = false

  private constructor() {
    // Não inicializar automaticamente
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      console.log("🚀 Initializing auth service...")
      this.authState.isLoading = true
      this.notifyListeners()

      // Check for stored user
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("baita_hotel_user")
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser)
            console.log("👤 Found stored user:", user.email, "Role:", user.user_role)

            // Validate stored user
            const { data, error } = await this.supabase.rpc("get_user_profile", {
              user_id: user.id,
            })

            if (error || !data || data.length === 0) {
              console.log("⚠️ Stored user is invalid, clearing...")
              localStorage.removeItem("baita_hotel_user")
              this.authState = {
                user: null,
                isLoading: false,
                isAuthenticated: false,
              }
            } else {
              console.log("✅ User validated from storage")
              this.authState = {
                user: user,
                isLoading: false,
                isAuthenticated: true,
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
          this.authState = {
            user: null,
            isLoading: false,
            isAuthenticated: false,
          }
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
      console.log("🔑 Password length:", password.length)

      this.authState = { ...this.authState, isLoading: true, error: undefined }
      this.notifyListeners()

      const { data, error } = await this.supabase.rpc("verify_user_credentials", {
        user_email: email.trim().toLowerCase(),
        user_password: password,
      })

      console.log("🔍 Database response:", { data, error })

      if (error) {
        console.error("❌ Database error:", error)
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
        console.log("❌ No user found with these credentials")
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
      console.log("✅ User found:", userData.email, "Role:", userData.user_role)

      // Update last login
      try {
        await this.supabase.rpc("update_last_login", { user_id: userData.user_id })
      } catch (loginError) {
        console.warn("⚠️ Could not update last login:", loginError)
      }

      // Create user object
      const user: User = {
        id: userData.user_id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone || "",
        avatar_url: userData.avatar_url || "",
        user_role: userData.user_role as UserRole,
        is_active: userData.is_active,
        timezone: "America/Sao_Paulo",
        language: "pt-BR",
        preferences: userData.preferences || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Store user in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("baita_hotel_user", JSON.stringify(user))
        console.log("💾 User stored in localStorage")
      }

      this.authState = {
        user,
        isLoading: false,
        isAuthenticated: true,
      }

      this.notifyListeners()
      console.log("🎉 Sign in successful for:", user.email, "Role:", user.user_role)

      return {
        success: true,
        user,
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("baita_hotel_user")
      }

      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }
      this.notifyListeners()
      console.log("✅ Signed out successfully")
    } catch (error) {
      console.error("💥 Sign out error:", error)
      // Force local logout even if server logout fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("baita_hotel_user")
      }
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
