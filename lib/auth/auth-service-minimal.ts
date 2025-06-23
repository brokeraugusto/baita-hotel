import { createClient } from "@/lib/supabase/client-bulletproof"

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: "master_admin" | "client"
  hotel_id?: string
  hotel_name?: string
}

export interface AuthResult {
  success: boolean
  error?: string
  user?: AuthUser
}

class MinimalAuthService {
  private supabase = createClient()

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log("🔐 Attempting login for:", email)

      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
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
          error: "Login failed - no user data received",
        }
      }

      console.log("✅ Authentication successful")

      // Get user profile
      const profile = await this.getUserProfile(authData.user.id)
      if (!profile) {
        return {
          success: false,
          error: "User profile not found",
        }
      }

      return {
        success: true,
        user: profile,
      }
    } catch (error: any) {
      console.error("💥 Login error:", error)
      return {
        success: false,
        error: "An unexpected error occurred during login",
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      console.log("🚪 Signing out...")
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        console.error("❌ Logout error:", error)
        throw error
      }
      console.log("✅ Logout successful")
    } catch (error) {
      console.error("💥 Logout error:", error)
      throw error
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await this.supabase.auth.getSession()

      if (sessionError) {
        console.error("❌ Session error:", sessionError)
        return null
      }

      if (!session?.user) {
        console.log("ℹ️ No active session found")
        return null
      }

      console.log("✅ Active session found for user:", session.user.email)
      return await this.getUserProfile(session.user.id)
    } catch (error) {
      console.error("💥 Get current user error:", error)
      return null
    }
  }

  private async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      console.log("👤 Fetching profile for user:", userId)

      const { data: profile, error } = await this.supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          role,
          hotel_id,
          hotels (
            name
          )
        `)
        .eq("id", userId)
        .single()

      if (error) {
        console.error("❌ Profile fetch error:", error)
        return null
      }

      if (!profile) {
        console.error("❌ No profile found for user:", userId)
        return null
      }

      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        hotel_id: profile.hotel_id || undefined,
        hotel_name: profile.hotels?.name || undefined,
      }

      console.log("✅ Profile loaded:", authUser)
      return authUser
    } catch (error) {
      console.error("💥 Profile fetch error:", error)
      return null
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
      console.log("🔄 Auth state changed:", event)

      if (event === "SIGNED_OUT" || !session?.user) {
        callback(null)
        return
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const profile = await this.getUserProfile(session.user.id)
        callback(profile)
      }
    })
  }
}

export const authService = new MinimalAuthService()
