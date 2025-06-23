import { createClient } from "@/lib/supabase/client"

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
  errorCode?: string
}

class RobustAuthService {
  private supabase = createClient()

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log("🔐 Attempting login for:", email)

      // First, test database connectivity
      const dbTest = await this.testDatabaseConnection()
      if (!dbTest.success) {
        return {
          success: false,
          error: "Database connection failed. Please check your setup.",
          errorCode: "DB_CONNECTION_FAILED",
        }
      }

      // Attempt authentication
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("❌ Auth error:", authError)
        return {
          success: false,
          error: this.getErrorMessage(authError.message),
          errorCode: authError.message,
        }
      }

      if (!authData.user) {
        return {
          success: false,
          error: "Login failed - no user data received",
          errorCode: "NO_USER_DATA",
        }
      }

      console.log("✅ Authentication successful")

      // Get user profile with error handling
      const profile = await this.getUserProfile(authData.user.id)
      if (!profile.success) {
        return {
          success: false,
          error: profile.error || "User profile not found",
          errorCode: "PROFILE_NOT_FOUND",
        }
      }

      return {
        success: true,
        user: profile.user,
      }
    } catch (error: any) {
      console.error("💥 Login error:", error)
      return {
        success: false,
        error: "An unexpected error occurred during login",
        errorCode: "UNEXPECTED_ERROR",
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
      const profile = await this.getUserProfile(session.user.id)
      return profile.success ? profile.user : null
    } catch (error) {
      console.error("💥 Get current user error:", error)
      return null
    }
  }

  private async testDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🔄 Testing database connection...")

      // Try a simple query first
      const { data, error } = await this.supabase.from("profiles").select("id").limit(1)

      if (error) {
        console.error("❌ Database connection test failed:", error)

        // Check if it's a table not found error
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          return {
            success: false,
            error: "Database tables not found. Please run the setup scripts first.",
          }
        }

        return {
          success: false,
          error: `Database error: ${error.message}`,
        }
      }

      console.log("✅ Database connection successful")
      return { success: true }
    } catch (error: any) {
      console.error("💥 Database connection test error:", error)
      return {
        success: false,
        error: `Database connection failed: ${error.message}`,
      }
    }
  }

  private async getUserProfile(userId: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      console.log("👤 Fetching profile for user:", userId)

      // First check if profiles table exists
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

        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          return {
            success: false,
            error: "Profiles table not found. Please run the database setup scripts.",
          }
        }

        if (error.code === "PGRST116") {
          return {
            success: false,
            error: "User profile not found in database. Please contact support.",
          }
        }

        return {
          success: false,
          error: `Profile fetch error: ${error.message}`,
        }
      }

      if (!profile) {
        console.error("❌ No profile found for user:", userId)
        return {
          success: false,
          error: "User profile not found",
        }
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
      return { success: true, user: authUser }
    } catch (error: any) {
      console.error("💥 Profile fetch error:", error)
      return {
        success: false,
        error: `Profile fetch failed: ${error.message}`,
      }
    }
  }

  private getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      "Invalid login credentials": "Email ou senha incorretos. Verifique se os usuários de teste foram criados.",
      "Email not confirmed": "Email não confirmado",
      "Too many requests": "Muitas tentativas. Tente novamente mais tarde",
      "User not found": "Usuário não encontrado",
      "Invalid email": "Email inválido",
      "Database error querying schema": "Erro no banco de dados. Verifique se as tabelas foram criadas.",
    }

    return errorMessages[error] || `Erro no login: ${error}`
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
        callback(profile.success ? profile.user : null)
      }
    })
  }

  // Diagnostic method to check system health
  async diagnoseSystem(): Promise<{
    database: boolean
    profiles: boolean
    hotels: boolean
    authUsers: boolean
    errors: string[]
  }> {
    const errors: string[] = []
    let database = false
    let profiles = false
    let hotels = false
    let authUsers = false

    try {
      // Test basic connection
      const dbTest = await this.testDatabaseConnection()
      database = dbTest.success
      if (!dbTest.success) {
        errors.push(`Database: ${dbTest.error}`)
      }

      // Test profiles table
      try {
        const { data, error } = await this.supabase.from("profiles").select("id").limit(1)
        profiles = !error
        if (error) {
          errors.push(`Profiles: ${error.message}`)
        }
      } catch (err: any) {
        errors.push(`Profiles: ${err.message}`)
      }

      // Test hotels table
      try {
        const { data, error } = await this.supabase.from("hotels").select("id").limit(1)
        hotels = !error
        if (error) {
          errors.push(`Hotels: ${error.message}`)
        }
      } catch (err: any) {
        errors.push(`Hotels: ${err.message}`)
      }

      // Test auth users (indirect)
      try {
        const { data, error } = await this.supabase.auth.getSession()
        authUsers = !error
        if (error) {
          errors.push(`Auth: ${error.message}`)
        }
      } catch (err: any) {
        errors.push(`Auth: ${err.message}`)
      }
    } catch (err: any) {
      errors.push(`System: ${err.message}`)
    }

    return { database, profiles, hotels, authUsers, errors }
  }
}

export const authService = new RobustAuthService()
