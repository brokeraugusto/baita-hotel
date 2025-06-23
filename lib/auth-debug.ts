import { createClient } from "./supabase/client-fixed"

export interface AuthUser {
  id: string
  email: string
  role: "master_admin" | "client_admin" | "client_user"
  hotel_id?: string
  profile?: {
    full_name: string
    avatar_url?: string
  }
}

class AuthService {
  private supabase = createClient()
  private currentUser: AuthUser | null = null

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log("🔐 Starting sign in process...")
      console.log("Email:", email)

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Auth response:", { data, error })

      if (error) {
        console.error("❌ Auth error:", error)
        return { user: null, error: error.message }
      }

      if (!data.user) {
        console.error("❌ No user returned from auth")
        return { user: null, error: "No user returned" }
      }

      console.log("✅ Auth successful, fetching profile...")

      // Buscar perfil do usuário
      const profile = await this.getUserProfile(data.user.id)
      console.log("Profile data:", profile)

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        role: profile?.role || "client_user",
        hotel_id: profile?.hotel_id,
        profile: {
          full_name: profile?.full_name || data.user.email!,
          avatar_url: profile?.avatar_url,
        },
      }

      this.currentUser = authUser
      console.log("✅ Sign in complete:", authUser)

      return { user: authUser, error: null }
    } catch (err) {
      console.error("❌ Sign in exception:", err)
      return { user: null, error: err instanceof Error ? err.message : "Unknown error" }
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      console.log("🚪 Signing out...")
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        console.error("❌ Sign out error:", error)
        return { error: error.message }
      }

      this.currentUser = null
      console.log("✅ Sign out successful")
      return { error: null }
    } catch (err) {
      console.error("❌ Sign out exception:", err)
      return { error: err instanceof Error ? err.message : "Unknown error" }
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      console.log("👤 Getting current user...")

      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error) {
        console.error("❌ Get user error:", error)
        return null
      }

      if (!user) {
        console.log("ℹ️ No authenticated user")
        return null
      }

      console.log("✅ Found authenticated user:", user.id)

      // Se já temos o usuário em cache, retorna
      if (this.currentUser && this.currentUser.id === user.id) {
        console.log("✅ Returning cached user")
        return this.currentUser
      }

      // Buscar perfil
      const profile = await this.getUserProfile(user.id)
      console.log("Profile data:", profile)

      const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        role: profile?.role || "client_user",
        hotel_id: profile?.hotel_id,
        profile: {
          full_name: profile?.full_name || user.email!,
          avatar_url: profile?.avatar_url,
        },
      }

      this.currentUser = authUser
      console.log("✅ Current user loaded:", authUser)

      return authUser
    } catch (err) {
      console.error("❌ Get current user exception:", err)
      return null
    }
  }

  private async getUserProfile(userId: string) {
    try {
      console.log("📋 Fetching user profile for:", userId)

      const { data, error } = await this.supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("❌ Profile fetch error:", error)
        return null
      }

      console.log("✅ Profile fetched:", data)
      return data
    } catch (err) {
      console.error("❌ Profile fetch exception:", err)
      return null
    }
  }

  // Método para escutar mudanças de autenticação
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    console.log("👂 Setting up auth state listener...")

    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.id)

      if (event === "SIGNED_IN" && session?.user) {
        const profile = await this.getUserProfile(session.user.id)
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          role: profile?.role || "client_user",
          hotel_id: profile?.hotel_id,
          profile: {
            full_name: profile?.full_name || session.user.email!,
            avatar_url: profile?.avatar_url,
          },
        }
        this.currentUser = authUser
        callback(authUser)
      } else if (event === "SIGNED_OUT") {
        this.currentUser = null
        callback(null)
      }
    })
  }
}

export const authService = new AuthService()
