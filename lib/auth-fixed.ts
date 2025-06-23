import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type UserRole = "client" | "master_admin" | "hotel_staff"

export interface User {
  id: string
  email: string
  name: string
  type: UserRole
  hotel_name?: string
  hotel_id?: string
  created_at: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
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
    this.setupAuthListener()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private setupAuthListener() {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state change:", event, session?.user?.email)

      if (event === "SIGNED_IN" && session?.user) {
        await this.loadUserProfile(session.user)
      } else if (event === "SIGNED_OUT") {
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        }
        this.notifyListeners()
      }
    })
  }

  private async loadUserProfile(supabaseUser: SupabaseUser) {
    try {
      console.log("📋 Loading profile for user:", supabaseUser.id, supabaseUser.email)

      // Usar função SQL que ignora RLS
      const { data: profileData, error } = await this.supabase.rpc("get_current_user_profile")

      console.log("📋 Profile data:", profileData, "Error:", error)

      if (error) {
        console.error("❌ Erro ao carregar perfil:", error)

        // Tentar busca direta como fallback
        const { data: directProfile, error: directError } = await this.supabase
          .from("profiles")
          .select("*")
          .eq("id", supabaseUser.id)
          .single()

        if (directError) {
          console.error("❌ Erro na busca direta:", directError)
          await this.createBasicProfile(supabaseUser)
          return
        }

        if (directProfile) {
          this.setAuthState(supabaseUser, directProfile)
        }
        return
      }

      if (profileData && !profileData.error) {
        this.setAuthState(supabaseUser, profileData)
      } else {
        console.log("⚠️ Profile not found, creating basic profile")
        await this.createBasicProfile(supabaseUser)
      }
    } catch (error) {
      console.error("💥 Erro crítico ao carregar perfil:", error)
      this.authState.isLoading = false
      this.notifyListeners()
    }
  }

  private setAuthState(supabaseUser: SupabaseUser, profileData: any) {
    this.authState = {
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: profileData.full_name || profileData.name || "",
        type: profileData.role as UserRole,
        hotel_name: profileData.hotel_name,
        hotel_id: profileData.hotel_id,
        created_at: profileData.created_at,
      },
      isLoading: false,
      isAuthenticated: true,
    }
    console.log("✅ Auth state updated:", this.authState.user)
    this.notifyListeners()
  }

  private async createBasicProfile(supabaseUser: SupabaseUser) {
    try {
      console.log("🆕 Creating basic profile for user:", supabaseUser.id)

      // Determinar role baseado no email
      let role: UserRole = "client"
      if (supabaseUser.email?.includes("admin") || supabaseUser.email?.includes("suporte")) {
        role = "master_admin"
      }

      const { data, error } = await this.supabase
        .from("profiles")
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "",
          role: role,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Erro ao criar perfil básico:", error)
        return
      }

      console.log("✅ Basic profile created:", data)
      this.setAuthState(supabaseUser, data)
    } catch (error) {
      console.error("💥 Erro crítico ao criar perfil básico:", error)
    }
  }

  private async initAuth() {
    try {
      console.log("🚀 Initializing auth...")

      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession()

      if (error) {
        console.error("❌ Erro ao obter sessão:", error)
        throw error
      }

      console.log("📱 Current session:", session?.user?.email)

      if (session?.user) {
        await this.loadUserProfile(session.user)
      } else {
        this.authState.isLoading = false
        this.notifyListeners()
      }
    } catch (error) {
      console.error("💥 Erro ao inicializar autenticação:", error)
      this.authState.isLoading = false
      this.notifyListeners()
    }
  }

  public async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🔑 Attempting sign in for:", email)

      this.authState.isLoading = true
      this.notifyListeners()

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("🔑 Sign in result:", data.user?.email, "Error:", error)

      if (error) {
        console.error("❌ Erro no login:", error)
        throw error
      }

      if (data.user) {
        // O listener vai carregar o perfil automaticamente
        console.log("✅ Login successful, waiting for profile load...")
        return { success: true }
      }

      throw new Error("Não foi possível obter os dados do usuário")
    } catch (error: any) {
      console.error("💥 Erro no login:", error)
      this.authState.isLoading = false
      this.notifyListeners()
      return { success: false, error: error.message }
    }
  }

  public async signUp(userData: {
    email: string
    password: string
    name: string
    hotel_name: string
    user_role: UserRole
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("📝 Attempting sign up for:", userData.email)

      this.authState.isLoading = true
      this.notifyListeners()

      const { data, error } = await this.supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            hotel_name: userData.hotel_name,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Criar perfil do usuário
        const { error: profileError } = await this.supabase.from("profiles").insert({
          id: data.user.id,
          email: userData.email,
          full_name: userData.name,
          hotel_name: userData.hotel_name,
          role: userData.user_role,
          is_active: true,
        })

        if (profileError && profileError.code !== "23505") {
          console.error("❌ Erro ao criar perfil:", profileError)
          throw profileError
        }

        return { success: true }
      }

      throw new Error("Não foi possível criar o usuário")
    } catch (error: any) {
      console.error("💥 Erro no cadastro:", error)
      this.authState.isLoading = false
      this.notifyListeners()
      return { success: false, error: error.message }
    }
  }

  public async signOut(): Promise<void> {
    try {
      console.log("👋 Signing out...")

      this.authState.isLoading = true
      this.notifyListeners()

      const { error } = await this.supabase.auth.signOut()
      if (error) throw error

      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }
      this.notifyListeners()
    } catch (error) {
      console.error("💥 Erro no logout:", error)
      this.authState.isLoading = false
      this.notifyListeners()
    }
  }

  public async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error("💥 Erro na recuperação de senha:", error)
      return { success: false, error: error.message }
    }
  }

  public getAuthState(): AuthState {
    return { ...this.authState }
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.authState }))
  }
}

export const authService = AuthService.getInstance()

// Função para obter usuário armazenado (compatibilidade)
export function getStoredUser() {
  const authState = authService.getAuthState()
  if (authState.isAuthenticated && authState.user) {
    return {
      id: authState.user.id,
      email: authState.user.email,
      name: authState.user.name,
      userRole: authState.user.type,
      hotelName: authState.user.hotel_name,
    }
  }
  return null
}
