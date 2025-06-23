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
  diagnostics?: any
}

class DiagnosticAuthService {
  private supabase = createClient()

  async signIn(email: string, password: string): Promise<AuthResult> {
    const diagnostics: any = {
      steps: [],
      errors: [],
      warnings: [],
    }

    try {
      // Step 1: Test basic Supabase connection
      diagnostics.steps.push("1. Testing Supabase connection...")
      console.log("🔄 Step 1: Testing Supabase connection...")

      try {
        const { data: connectionTest } = await this.supabase.from("profiles").select("count").limit(0)
        diagnostics.steps.push("✅ Supabase connection OK")
        console.log("✅ Supabase connection OK")
      } catch (connError: any) {
        diagnostics.errors.push(`Connection failed: ${connError.message}`)
        console.error("❌ Connection failed:", connError)
        return {
          success: false,
          error: "Database connection failed",
          errorCode: "CONNECTION_FAILED",
          diagnostics,
        }
      }

      // Step 2: Check if profiles table exists
      diagnostics.steps.push("2. Checking profiles table...")
      console.log("🔄 Step 2: Checking profiles table...")

      try {
        const { data, error } = await this.supabase.from("profiles").select("id").limit(1)

        if (error) {
          diagnostics.errors.push(`Profiles table error: ${error.message}`)
          console.error("❌ Profiles table error:", error)

          if (error.message.includes("relation") && error.message.includes("does not exist")) {
            return {
              success: false,
              error: "Profiles table does not exist. Please run the database setup scripts.",
              errorCode: "PROFILES_TABLE_MISSING",
              diagnostics,
            }
          }

          return {
            success: false,
            error: `Database schema error: ${error.message}`,
            errorCode: "SCHEMA_ERROR",
            diagnostics,
          }
        }

        diagnostics.steps.push("✅ Profiles table accessible")
        console.log("✅ Profiles table accessible")
      } catch (tableError: any) {
        diagnostics.errors.push(`Table check failed: ${tableError.message}`)
        console.error("❌ Table check failed:", tableError)
        return {
          success: false,
          error: "Database table check failed",
          errorCode: "TABLE_CHECK_FAILED",
          diagnostics,
        }
      }

      // Step 3: Attempt authentication
      diagnostics.steps.push("3. Attempting authentication...")
      console.log("🔄 Step 3: Attempting authentication...")

      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        diagnostics.errors.push(`Auth failed: ${authError.message}`)
        console.error("❌ Auth failed:", authError)

        let userFriendlyError = "Login failed"
        if (authError.message.includes("Invalid login credentials")) {
          userFriendlyError = "Email ou senha incorretos. Verifique se os usuários foram criados corretamente."
        } else if (authError.message.includes("Email not confirmed")) {
          userFriendlyError = "Email não confirmado"
        }

        return {
          success: false,
          error: userFriendlyError,
          errorCode: authError.message,
          diagnostics,
        }
      }

      if (!authData.user) {
        diagnostics.errors.push("No user data received from auth")
        return {
          success: false,
          error: "Authentication failed - no user data",
          errorCode: "NO_USER_DATA",
          diagnostics,
        }
      }

      diagnostics.steps.push("✅ Authentication successful")
      console.log("✅ Authentication successful")

      // Step 4: Get user profile with minimal query first
      diagnostics.steps.push("4. Fetching user profile...")
      console.log("🔄 Step 4: Fetching user profile...")

      try {
        // First try a simple query without joins
        const { data: profile, error: profileError } = await this.supabase
          .from("profiles")
          .select("id, email, full_name, role, hotel_id")
          .eq("id", authData.user.id)
          .single()

        if (profileError) {
          diagnostics.errors.push(`Profile fetch error: ${profileError.message}`)
          console.error("❌ Profile fetch error:", profileError)

          if (profileError.code === "PGRST116") {
            return {
              success: false,
              error: "User profile not found. Please contact support.",
              errorCode: "PROFILE_NOT_FOUND",
              diagnostics,
            }
          }

          return {
            success: false,
            error: `Profile error: ${profileError.message}`,
            errorCode: "PROFILE_ERROR",
            diagnostics,
          }
        }

        if (!profile) {
          diagnostics.errors.push("Profile not found")
          return {
            success: false,
            error: "User profile not found",
            errorCode: "PROFILE_MISSING",
            diagnostics,
          }
        }

        diagnostics.steps.push("✅ Profile fetched successfully")
        console.log("✅ Profile fetched successfully")

        // Step 5: Try to get hotel name if hotel_id exists
        let hotel_name = undefined
        if (profile.hotel_id) {
          diagnostics.steps.push("5. Fetching hotel information...")
          console.log("🔄 Step 5: Fetching hotel information...")

          try {
            const { data: hotel, error: hotelError } = await this.supabase
              .from("hotels")
              .select("name")
              .eq("id", profile.hotel_id)
              .single()

            if (hotelError) {
              diagnostics.warnings.push(`Hotel fetch warning: ${hotelError.message}`)
              console.warn("⚠️ Hotel fetch warning:", hotelError)
            } else if (hotel) {
              hotel_name = hotel.name
              diagnostics.steps.push("✅ Hotel information fetched")
              console.log("✅ Hotel information fetched")
            }
          } catch (hotelError: any) {
            diagnostics.warnings.push(`Hotel fetch failed: ${hotelError.message}`)
            console.warn("⚠️ Hotel fetch failed:", hotelError)
          }
        }

        const authUser: AuthUser = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          hotel_id: profile.hotel_id || undefined,
          hotel_name: hotel_name,
        }

        diagnostics.steps.push("✅ Login completed successfully")
        console.log("✅ Login completed successfully")

        return {
          success: true,
          user: authUser,
          diagnostics,
        }
      } catch (profileError: any) {
        diagnostics.errors.push(`Profile fetch exception: ${profileError.message}`)
        console.error("💥 Profile fetch exception:", profileError)
        return {
          success: false,
          error: `Profile fetch failed: ${profileError.message}`,
          errorCode: "PROFILE_FETCH_EXCEPTION",
          diagnostics,
        }
      }
    } catch (error: any) {
      diagnostics.errors.push(`Unexpected error: ${error.message}`)
      console.error("💥 Unexpected login error:", error)
      return {
        success: false,
        error: "An unexpected error occurred during login",
        errorCode: "UNEXPECTED_ERROR",
        diagnostics,
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

      // Simple profile fetch without complex joins
      const { data: profile, error } = await this.supabase
        .from("profiles")
        .select("id, email, full_name, role, hotel_id")
        .eq("id", session.user.id)
        .single()

      if (error || !profile) {
        console.error("❌ Profile fetch error:", error)
        return null
      }

      // Try to get hotel name
      let hotel_name = undefined
      if (profile.hotel_id) {
        const { data: hotel } = await this.supabase.from("hotels").select("name").eq("id", profile.hotel_id).single()

        hotel_name = hotel?.name
      }

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        hotel_id: profile.hotel_id || undefined,
        hotel_name: hotel_name,
      }
    } catch (error) {
      console.error("💥 Get current user error:", error)
      return null
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event)

      if (event === "SIGNED_OUT" || !session?.user) {
        callback(null)
        return
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const user = await this.getCurrentUser()
        callback(user)
      }
    })
  }

  // Simple database diagnostic
  async diagnoseDatabase(): Promise<any> {
    const diagnosis = {
      connection: false,
      profiles: false,
      hotels: false,
      authUsers: false,
      userRole: false,
      errors: [] as string[],
    }

    try {
      // Test connection
      const { error: connError } = await this.supabase.from("profiles").select("count").limit(0)
      diagnosis.connection = !connError
      if (connError) diagnosis.errors.push(`Connection: ${connError.message}`)

      // Test profiles table
      const { error: profilesError } = await this.supabase.from("profiles").select("id").limit(1)
      diagnosis.profiles = !profilesError
      if (profilesError) diagnosis.errors.push(`Profiles: ${profilesError.message}`)

      // Test hotels table
      const { error: hotelsError } = await this.supabase.from("hotels").select("id").limit(1)
      diagnosis.hotels = !hotelsError
      if (hotelsError) diagnosis.errors.push(`Hotels: ${hotelsError.message}`)

      // Test auth
      const { error: authError } = await this.supabase.auth.getSession()
      diagnosis.authUsers = !authError
      if (authError) diagnosis.errors.push(`Auth: ${authError.message}`)
    } catch (error: any) {
      diagnosis.errors.push(`System: ${error.message}`)
    }

    return diagnosis
  }
}

export const authService = new DiagnosticAuthService()
