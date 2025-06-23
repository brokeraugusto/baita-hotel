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

class DetailedAuthService {
  private supabase = createClient()

  async signIn(email: string, password: string): Promise<AuthResult> {
    const diagnostics: any = {
      steps: [],
      errors: [],
      warnings: [],
      authDetails: {},
    }

    try {
      // Step 1: Test basic connection
      diagnostics.steps.push("1. Testing database connection...")
      console.log("🔄 Step 1: Testing database connection...")

      try {
        const { data, error } = await this.supabase.from("profiles").select("count").limit(0)
        if (error) throw error
        diagnostics.steps.push("✅ Database connection OK")
        console.log("✅ Database connection OK")
      } catch (connError: any) {
        diagnostics.errors.push(`Connection failed: ${connError.message}`)
        return { success: false, error: "Database connection failed", diagnostics }
      }

      // Step 2: Check auth users table directly
      diagnostics.steps.push("2. Checking auth users...")
      console.log("🔄 Step 2: Checking auth users...")

      try {
        // Try to check if the user exists in auth.users
        const { data: authUsers, error: authUsersError } = await this.supabase
          .from("profiles")
          .select("id, email")
          .eq("email", email)
          .limit(1)

        if (authUsersError) {
          diagnostics.errors.push(`Auth users check failed: ${authUsersError.message}`)
          return { success: false, error: "Auth users check failed", diagnostics }
        }

        if (!authUsers || authUsers.length === 0) {
          diagnostics.errors.push(`User ${email} not found in profiles table`)
          return {
            success: false,
            error: "User not found. Please ensure the user exists in the database.",
            diagnostics,
          }
        }

        diagnostics.authDetails.profileExists = true
        diagnostics.authDetails.userId = authUsers[0].id
        diagnostics.steps.push(`✅ User found in profiles: ${authUsers[0].id}`)
        console.log(`✅ User found in profiles: ${authUsers[0].id}`)
      } catch (error: any) {
        diagnostics.errors.push(`Profile check error: ${error.message}`)
        return { success: false, error: "Profile check failed", diagnostics }
      }

      // Step 3: Test auth configuration
      diagnostics.steps.push("3. Testing auth configuration...")
      console.log("🔄 Step 3: Testing auth configuration...")

      try {
        // Get current session to test auth system
        const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession()

        if (sessionError) {
          diagnostics.errors.push(`Session check failed: ${sessionError.message}`)
          diagnostics.warnings.push("Auth system may have configuration issues")
        } else {
          diagnostics.steps.push("✅ Auth system accessible")
          console.log("✅ Auth system accessible")
        }
      } catch (error: any) {
        diagnostics.warnings.push(`Auth system check warning: ${error.message}`)
      }

      // Step 4: Attempt authentication with detailed error handling
      diagnostics.steps.push("4. Attempting authentication...")
      console.log("🔄 Step 4: Attempting authentication...")

      let authData, authError

      try {
        const authResult = await this.supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password,
        })

        authData = authResult.data
        authError = authResult.error

        // Log detailed auth response
        diagnostics.authDetails.authResponse = {
          hasUser: !!authData?.user,
          hasSession: !!authData?.session,
          errorMessage: authError?.message,
          errorCode: authError?.status,
        }

        console.log("📊 Auth response details:", diagnostics.authDetails.authResponse)
      } catch (authException: any) {
        diagnostics.errors.push(`Auth exception: ${authException.message}`)
        console.error("💥 Auth exception:", authException)
        return {
          success: false,
          error: `Authentication system error: ${authException.message}`,
          diagnostics,
        }
      }

      if (authError) {
        diagnostics.errors.push(`Auth failed: ${authError.message}`)
        console.error("❌ Auth failed:", authError)

        // Provide specific error messages based on auth error
        let userFriendlyError = "Login failed"
        let errorCode = authError.message

        if (authError.message.includes("Invalid login credentials")) {
          userFriendlyError =
            "Credenciais inválidas. Verifique se o usuário foi criado corretamente no sistema de autenticação."
          errorCode = "INVALID_CREDENTIALS"
        } else if (authError.message.includes("Email not confirmed")) {
          userFriendlyError = "Email não confirmado. Verifique sua caixa de entrada."
          errorCode = "EMAIL_NOT_CONFIRMED"
        } else if (authError.message.includes("Too many requests")) {
          userFriendlyError = "Muitas tentativas de login. Tente novamente em alguns minutos."
          errorCode = "TOO_MANY_REQUESTS"
        } else if (authError.message.includes("Database error")) {
          userFriendlyError = "Erro no banco de dados. Verifique a configuração do sistema."
          errorCode = "DATABASE_ERROR"
        }

        return {
          success: false,
          error: userFriendlyError,
          errorCode: errorCode,
          diagnostics,
        }
      }

      if (!authData?.user) {
        diagnostics.errors.push("No user data received from auth")
        return {
          success: false,
          error: "Authentication failed - no user data received",
          errorCode: "NO_USER_DATA",
          diagnostics,
        }
      }

      diagnostics.steps.push("✅ Authentication successful")
      console.log("✅ Authentication successful")

      // Step 5: Get user profile
      diagnostics.steps.push("5. Fetching user profile...")
      console.log("🔄 Step 5: Fetching user profile...")

      try {
        const { data: profile, error: profileError } = await this.supabase
          .from("profiles")
          .select("id, email, full_name, role, hotel_id")
          .eq("id", authData.user.id)
          .single()

        if (profileError) {
          diagnostics.errors.push(`Profile fetch error: ${profileError.message}`)
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

        // Step 6: Get hotel name if needed
        let hotel_name = undefined
        if (profile.hotel_id) {
          try {
            const { data: hotel } = await this.supabase
              .from("hotels")
              .select("name")
              .eq("id", profile.hotel_id)
              .single()

            hotel_name = hotel?.name
            if (hotel_name) {
              diagnostics.steps.push("✅ Hotel information fetched")
            }
          } catch (hotelError: any) {
            diagnostics.warnings.push(`Hotel fetch warning: ${hotelError.message}`)
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

      const { data: profile, error } = await this.supabase
        .from("profiles")
        .select("id, email, full_name, role, hotel_id")
        .eq("id", session.user.id)
        .single()

      if (error || !profile) {
        console.error("❌ Profile fetch error:", error)
        return null
      }

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

  // Enhanced database diagnostic
  async diagnoseDatabase(): Promise<any> {
    const diagnosis = {
      connection: false,
      profiles: false,
      hotels: false,
      authSystem: false,
      testUsers: [] as any[],
      errors: [] as string[],
      details: {} as any,
    }

    try {
      // Test connection
      const { error: connError } = await this.supabase.from("profiles").select("count").limit(0)
      diagnosis.connection = !connError
      if (connError) diagnosis.errors.push(`Connection: ${connError.message}`)

      // Test profiles table and get test users
      const { data: profiles, error: profilesError } = await this.supabase
        .from("profiles")
        .select("id, email, role, full_name")
        .in("email", ["admin@baitahotel.com", "hotel@exemplo.com"])

      diagnosis.profiles = !profilesError
      if (profilesError) {
        diagnosis.errors.push(`Profiles: ${profilesError.message}`)
      } else {
        diagnosis.testUsers = profiles || []
      }

      // Test hotels table
      const { error: hotelsError } = await this.supabase.from("hotels").select("id").limit(1)
      diagnosis.hotels = !hotelsError
      if (hotelsError) diagnosis.errors.push(`Hotels: ${hotelsError.message}`)

      // Test auth system
      const { error: authError } = await this.supabase.auth.getSession()
      diagnosis.authSystem = !authError
      if (authError) diagnosis.errors.push(`Auth System: ${authError.message}`)

      // Get Supabase configuration details
      diagnosis.details = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
        testUsersFound: diagnosis.testUsers.length,
      }
    } catch (error: any) {
      diagnosis.errors.push(`System: ${error.message}`)
    }

    return diagnosis
  }

  // Test specific auth credentials
  async testAuthCredentials(email: string, password: string): Promise<any> {
    const result = {
      userExists: false,
      authWorks: false,
      error: null as string | null,
      details: {} as any,
    }

    try {
      // Check if user exists in profiles
      const { data: profile, error: profileError } = await this.supabase
        .from("profiles")
        .select("id, email, role")
        .eq("email", email)
        .single()

      if (profileError || !profile) {
        result.error = `User ${email} not found in profiles table`
        return result
      }

      result.userExists = true
      result.details.profile = profile

      // Test auth
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        result.error = authError.message
        result.details.authError = authError
        return result
      }

      result.authWorks = true
      result.details.authSuccess = true

      // Sign out immediately
      await this.supabase.auth.signOut()
    } catch (error: any) {
      result.error = error.message
    }

    return result
  }
}

export const authService = new DetailedAuthService()
