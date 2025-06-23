import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type UserRole = "client" | "master_admin" | "hotel_staff"

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  hotel_id?: string
  hotel_name?: string
  phone?: string
  is_active: boolean
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

      // Use the secure function that bypasses RLS
      const { data: profileData, error } = await this.supabase.rpc("get_current_user_profile")

      if (error) {
        console.error("❌ Error loading profile:", error)
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: "Failed to load user profile",
        }
        this.notifyListeners()
        return
      }

      if (!profileData || profileData.length === 0) {
        console.log("⚠️ No profile found, creating basic profile")
        await this.createBasicProfile(supabaseUser)
        return
      }

      const profile = Array.isArray(profileData) ? profileData[0] : profileData

      this.authState = {
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role as UserRole,
          hotel_id: profile.hotel_id,
          hotel_name: profile.hotel_name,
          phone: profile.phone,
          is_active: profile.is_active,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        },
        isLoading: false,
        isAuthenticated: true,
      }

      console.log("✅ Profile loaded successfully:", this.authState.user)
      this.notifyListeners()
    } catch (error) {
      console.error("💥 Critical error loading profile:", error)
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: "Critical authentication error",
      }
      this.notifyListeners()
    }
  }

  private async createBasicProfile(supabaseUser: SupabaseUser) {
    try {
      console.log("🆕 Creating basic profile for user:", supabaseUser.id)

      // Determine role based on email
      let role: UserRole = "client"
      if (supabaseUser.email?.includes("admin") || supabaseUser.email === "admin@baitahotel.com") {
        role = "master_admin"
      }

      const { data, error } = await this.supabase
        .from("profiles")
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "User",
          role: role,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Error creating basic profile:", error)
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: "Failed to create user profile",
        }
        this.notifyListeners()
        return
      }

      console.log("✅ Basic profile created:", data)
      await this.loadUserProfile(supabaseUser)
    } catch (error) {
      console.error("💥 Critical error creating profile:", error)
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: "Failed to initialize user account",
      }
      this.notifyListeners()
    }
  }

  private async initAuth() {
    try {
      console.log("🚀 Initializing authentication...")

      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession()

      if (error) {
        console.error("❌ Error getting session:", error)
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: "Session initialization failed",
        }
        this.notifyListeners()
        return
      }

      console.log("📱 Current session:", session?.user?.email || "No session")

      if (session?.user) {
        await this.loadUserProfile(session.user)
      } else {
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        }
        this.notifyListeners()
      }
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

  public async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🔑 Attempting sign in for:", email)

      this.authState = { ...this.authState, isLoading: true, error: undefined }
      this.notifyListeners()

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        console.error("❌ Sign in error:", error)
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: this.getReadableError(error.message),
        }
        this.notifyListeners()
        return { success: false, error: this.getReadableError(error.message) }
      }

      if (!data.user) {
        const errorMsg = "Authentication failed - no user data received"
        this.authState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: errorMsg,
        }
        this.notifyListeners()
        return { success: false, error: errorMsg }
      }

      console.log("✅ Sign in successful, loading profile...")
      // Profile will be loaded by the auth state change listener
      return { success: true }
    } catch (error: any) {
      console.error("💥 Critical sign in error:", error)
      const errorMsg = "Login system temporarily unavailable"
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

  public async signUp(userData: {
    email: string
    password: string
    full_name: string
    hotel_name?: string
    role?: UserRole
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("📝 Attempting sign up for:", userData.email)

      this.authState = { ...this.authState, isLoading: true, error: undefined }
      this.notifyListeners()

      const { data, error } = await this.supabase.auth.signUp({
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            hotel_name: userData.hotel_name,
          },
        },
      })

      if (error) {
        console.error("❌ Sign up error:", error)
        const errorMsg = this.getReadableError(error.message)
        this.authState = { ...this.authState, isLoading: false, error: errorMsg }
        this.notifyListeners()
        return { success: false, error: errorMsg }
      }

      if (!data.user) {
        const errorMsg = "Account creation failed"
        this.authState = { ...this.authState, isLoading: false, error: errorMsg }
        this.notifyListeners()
        return { success: false, error: errorMsg }
      }

      // Create profile
      const { error: profileError } = await this.supabase.from("profiles").insert({
        id: data.user.id,
        email: userData.email.trim().toLowerCase(),
        full_name: userData.full_name,
        role: userData.role || "client",
        hotel_name: userData.hotel_name,
        is_active: true,
      })

      if (profileError && profileError.code !== "23505") {
        console.error("❌ Profile creation error:", profileError)
        return { success: false, error: "Failed to create user profile" }
      }

      console.log("✅ Sign up successful")
      return { success: true }
    } catch (error: any) {
      console.error("💥 Critical sign up error:", error)
      const errorMsg = "Registration system temporarily unavailable"
      this.authState = { ...this.authState, isLoading: false, error: errorMsg }
      this.notifyListeners()
      return { success: false, error: errorMsg }
    }
  }

  public async signOut(): Promise<void> {
    try {
      console.log("👋 Signing out...")

      this.authState = { ...this.authState, isLoading: true }
      this.notifyListeners()

      const { error } = await this.supabase.auth.signOut()
      if (error) {
        console.error("❌ Sign out error:", error)
      }

      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }
      this.notifyListeners()
    } catch (error) {
      console.error("💥 Critical sign out error:", error)
      // Force local logout even if server logout fails
      this.authState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }
      this.notifyListeners()
    }
  }

  public async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      if (error) {
        console.error("❌ Password reset error:", error)
        return { success: false, error: this.getReadableError(error.message) }
      }

      return { success: true }
    } catch (error: any) {
      console.error("💥 Critical password reset error:", error)
      return { success: false, error: "Password reset system temporarily unavailable" }
    }
  }

  private getReadableError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      "Invalid login credentials": "Email ou senha incorretos",
      "Email not confirmed": "Email não confirmado. Verifique sua caixa de entrada.",
      "Too many requests": "Muitas tentativas. Tente novamente em alguns minutos.",
      "User not found": "Usuário não encontrado",
      "Invalid email": "Email inválido",
      "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
    }

    return errorMap[errorMessage] || "Erro de autenticação. Tente novamente."
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
