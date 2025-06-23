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
    isLoading: true,
    isAuthenticated: false,
  }
  private listeners: ((state: AuthState) => void)[] = []

  private constructor() {
    this.initAuth()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private async initAuth() {
    try {
      console.log("🚀 Initializing auth service...")

      // Check for stored user
      const storedUser = localStorage.getItem("baita_hotel_user")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          console.log("👤 Found stored user:", user.email)

          // Verify user is still valid
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
              user: data[0],
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

      this.notifyListeners()
    } catch (error) {
      console.error("💥 Auth initialization error:", error)
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: "Erro na inicialização do sistema de autenticação",
      }
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
        console.error("❌ Sign in error:", error)
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
        console.log("❌ Invalid credentials")
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

      // Update last login
      await this.supabase.rpc("update_last_login", { user_id: userData.user_id })

      // Create user object
      const user: User = {
        id: userData.user_id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        avatar_url: userData.avatar_url,
        user_role: userData.user_role as UserRole,
        is_active: userData.is_active,
        timezone: "America/Sao_Paulo",
        language: "pt-BR",
        preferences: userData.preferences || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Store user in localStorage
      localStorage.setItem("baita_hotel_user", JSON.stringify(user))

      this.authState = {
        user,
        isLoading: false,
        isAuthenticated: true,
      }

      this.notifyListeners()
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

  public async updateProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.authState.user) {
        return { success: false, error: "Usuário não autenticado" }
      }

      console.log("📝 Updating profile for:", this.authState.user.email)

      const { data, error } = await this.supabase.rpc("update_user_profile", {
        user_id: this.authState.user.id,
        new_full_name: updates.full_name,
        new_phone: updates.phone,
        new_avatar_url: updates.avatar_url,
        new_timezone: updates.timezone,
        new_language: updates.language,
        new_preferences: updates.preferences,
      })

      if (error) {
        console.error("❌ Profile update error:", error)
        return { success: false, error: "Erro ao atualizar perfil" }
      }

      // Update local state
      const updatedUser = { ...this.authState.user, ...updates, updated_at: new Date().toISOString() }
      localStorage.setItem("baita_hotel_user", JSON.stringify(updatedUser))

      this.authState = {
        ...this.authState,
        user: updatedUser,
      }
      this.notifyListeners()

      console.log("✅ Profile updated successfully")
      return { success: true }
    } catch (error: any) {
      console.error("💥 Profile update error:", error)
      return { success: false, error: "Erro inesperado ao atualizar perfil" }
    }
  }

  public async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.authState.user) {
        return { success: false, error: "Usuário não autenticado" }
      }

      console.log("🔐 Changing password for:", this.authState.user.email)

      const { data, error } = await this.supabase.rpc("change_user_password", {
        user_id: this.authState.user.id,
        current_password: currentPassword,
        new_password: newPassword,
      })

      if (error) {
        console.error("❌ Password change error:", error)
        return { success: false, error: "Erro ao alterar senha" }
      }

      if (!data || data.length === 0) {
        return { success: false, error: "Erro ao alterar senha" }
      }

      const result = data[0]
      if (!result.success) {
        return { success: false, error: result.message }
      }

      console.log("✅ Password changed successfully")
      return { success: true }
    } catch (error: any) {
      console.error("💥 Password change error:", error)
      return { success: false, error: "Erro inesperado ao alterar senha" }
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
