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

class EnhancedAuthService {
  private supabase = createClient()

  async signIn(email: string, password: string): Promise<AuthResult> {
    const diagnostics: any = {
      steps: [],
      errors: [],
      warnings: [],
      authDetails: {},
      rawResponse: null,
    }

    try {
      diagnostics.steps.push("🔄 Starting enhanced authentication process...")
      console.log("🔄 Enhanced Auth: Starting authentication for", email)

      // Step 1: Verify database connection
      diagnostics.steps.push("1. Testing database connection...")
      try {
        const { error: connError } = await this.supabase.from("profiles").select("count").limit(0)
        if (connError) throw connError
        diagnostics.steps.push("✅ Database connection OK")
      } catch (error: any) {
        diagnostics.errors.push(`Database connection failed: ${error.message}`)
        return { success: false, error: "Database connection failed", diagnostics }
      }

      // Step 2: Check if user exists in profiles
      diagnostics.steps.push("2. Checking user profile...")
      try {
        const { data: profile, error: profileError } = await this.supabase
          .from("profiles")
          .select("id, email, full_name, role, hotel_id")
          .eq("email", email.trim().toLowerCase())
          .single()

        if (profileError || !profile) {
          diagnostics.errors.push(`Profile not found: ${profileError?.message || "No profile"}`)
          return { success: false, error: "User profile not found", diagnostics }
        }

        diagnostics.authDetails.profile = profile
        diagnostics.steps.push(`✅ Profile found: ${profile.id}`)
      } catch (error: any) {
        diagnostics.errors.push(`Profile check failed: ${error.message}`)
        return { success: false, error: "Profile check failed", diagnostics }
      }

      // Step 3: Check auth.users directly (diagnostic)
      diagnostics.steps.push("3. Checking auth.users table...")
      try {
        const { data: authCheck, error: authCheckError } = await this.supabase.rpc("check_auth_user", {
          user_email: email.trim().toLowerCase(),
        })

        if (!authCheckError && authCheck) {
          diagnostics.authDetails.authUserExists = true
          diagnostics.steps.push("✅ User found in auth.users")
        } else {
          diagnostics.warnings.push("User may not exist in auth.users table")
          diagnostics.authDetails.authUserExists = false
        }
      } catch (error: any) {
        diagnostics.warnings.push(`Auth user check failed: ${error.message}`)
      }

      // Step 4: Attempt authentication with detailed logging
      diagnostics.steps.push("4. Attempting Supabase authentication...")
      console.log("🔐 Attempting auth with:", { email: email.trim().toLowerCase(), passwordLength: password.length })

      let authResult
      try {
        authResult = await this.supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password,
        })

        // Store raw response for debugging
        diagnostics.rawResponse = {
          hasData: !!authResult.data,
          hasUser: !!authResult.data?.user,
          hasSession: !!authResult.data?.session,
          hasError: !!authResult.error,
          errorMessage: authResult.error?.message,
          errorStatus: authResult.error?.status,
          userId: authResult.data?.user?.id,
          userEmail: authResult.data?.user?.email,
        }

        console.log("📊 Raw auth response:", diagnostics.rawResponse)
      } catch (authException: any) {
        diagnostics.errors.push(`Auth exception: ${authException.message}`)
        console.error("💥 Auth exception:", authException)
        return {
          success: false,
          error: `Authentication system error: ${authException.message}`,
          diagnostics,
        }
      }

      if (authResult.error) {
        diagnostics.errors.push(`Auth error: ${authResult.error.message}`)
        console.error("❌ Auth error:", authResult.error)

        // Enhanced error handling
        let userFriendlyError = "Login failed"
        let errorCode = "AUTH_ERROR"

        if (authResult.error.message.includes("Invalid login credentials")) {
          userFriendlyError = "Credenciais inválidas. O usuário pode não existir no sistema de autenticação."
          errorCode = "INVALID_CREDENTIALS"
          diagnostics.warnings.push("This usually means the user doesn't exist in auth.users table")
        } else if (authResult.error.message.includes("Email not confirmed")) {
          userFriendlyError = "Email não confirmado."
          errorCode = "EMAIL_NOT_CONFIRMED"
        } else if (authResult.error.message.includes("Too many requests")) {
          userFriendlyError = "Muitas tentativas. Tente novamente em alguns minutos."
          errorCode = "TOO_MANY_REQUESTS"
        }

        return {
          success: false,
          error: userFriendlyError,
          errorCode: errorCode,
          diagnostics,
        }
      }

      if (!authResult.data?.user) {
        diagnostics.errors.push("No user data received from auth")
        return {
          success: false,
          error: "Authentication failed - no user data",
          errorCode: "NO_USER_DATA",
          diagnostics,
        }
      }

      diagnostics.steps.push("✅ Authentication successful")
      console.log("✅ Auth successful for:", authResult.data.user.email)

      // Step 5: Get complete user profile
      diagnostics.steps.push("5. Fetching complete user profile...")
      try {
        const { data: profile, error: profileError } = await this.supabase
          .from("profiles")
          .select("id, email, full_name, role, hotel_id")
          .eq("id", authResult.data.user.id)
          .single()

        if (profileError || !profile) {
          diagnostics.errors.push(`Profile fetch error: ${profileError?.message || "No profile"}`)
          return {
            success: false,
            error: "User profile not found after authentication",
            errorCode: "PROFILE_MISSING",
            diagnostics,
          }
        }

        // Get hotel name if needed
        let hotel_name = undefined
        if (profile.hotel_id) {
          try {
            const { data: hotel } = await this.supabase
              .from("hotels")
              .select("name")
              .eq("id", profile.hotel_id)
              .single()
            hotel_name = hotel?.name
          } catch (error: any) {
            diagnostics.warnings.push(`Hotel fetch warning: ${error.message}`)
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
        console.log("✅ Enhanced auth completed for:", authUser.email)

        return {
          success: true,
          user: authUser,
          diagnostics,
        }
      } catch (error: any) {
        diagnostics.errors.push(`Profile fetch exception: ${error.message}`)
        return {
          success: false,
          error: `Profile fetch failed: ${error.message}`,
          errorCode: "PROFILE_FETCH_ERROR",
          diagnostics,
        }
      }
    } catch (error: any) {
      diagnostics.errors.push(`Unexpected error: ${error.message}`)
      console.error("💥 Unexpected enhanced auth error:", error)
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
      console.log("🚪 Enhanced auth: Signing out...")
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
      console.log("✅ Enhanced auth: Logout successful")
    } catch (error) {
      console.error("💥 Enhanced auth logout error:", error)
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
        console.error("❌ Enhanced auth session error:", sessionError)
        return null
      }

      if (!session?.user) {
        console.log("ℹ️ Enhanced auth: No active session")
        return null
      }

      const { data: profile, error } = await this.supabase
        .from("profiles")
        .select("id, email, full_name, role, hotel_id")
        .eq("id", session.user.id)
        .single()

      if (error || !profile) {
        console.error("❌ Enhanced auth profile error:", error)
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
      console.error("💥 Enhanced auth getCurrentUser error:", error)
      return null
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Enhanced auth state changed:", event)

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

  // Enhanced diagnostic functions
  async diagnoseAuthSystem(): Promise<any> {
    const diagnosis = {
      connection: false,
      profiles: false,
      hotels: false,
      authSystem: false,
      authUsers: [] as any[],
      testUsers: [] as any[],
      errors: [] as string[],
      details: {} as any,
    }

    try {
      // Test connection
      const { error: connError } = await this.supabase.from("profiles").select("count").limit(0)
      diagnosis.connection = !connError
      if (connError) diagnosis.errors.push(`Connection: ${connError.message}`)

      // Test profiles table
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

      // Try to check auth users (this might fail due to RLS)
      try {
        const { data: authUsers, error: authUsersError } = await this.supabase.rpc("get_auth_users_info")
        if (!authUsersError && authUsers) {
          diagnosis.authUsers = authUsers
        }
      } catch (error: any) {
        diagnosis.errors.push(`Auth Users Check: ${error.message}`)
      }

      diagnosis.details = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
        testUsersFound: diagnosis.testUsers.length,
        authUsersFound: diagnosis.authUsers.length,
      }
    } catch (error: any) {
      diagnosis.errors.push(`System: ${error.message}`)
    }

    return diagnosis
  }
}

export const enhancedAuthService = new EnhancedAuthService()
