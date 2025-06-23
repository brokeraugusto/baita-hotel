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
  debugInfo?: any
}

class DebugAuthService {
  private supabase = createClient()

  async signIn(email: string, password: string): Promise<AuthResult> {
    const debugInfo: any = {
      steps: [],
      authResponse: null,
      profileData: null,
      errors: [],
    }

    try {
      console.log("🔐 Starting login process for:", email)
      debugInfo.steps.push("Starting login process")

      // Step 1: Check if user exists in profiles
      console.log("👤 Checking profiles table...")
      const { data: profileCheck, error: profileError } = await this.supabase
        .from("profiles")
        .select("id, email, full_name, role, hotel_id")
        .eq("email", email)
        .single()

      if (profileError || !profileCheck) {
        console.error("❌ Profile not found:", profileError)
        return {
          success: false,
          error: "User not found in system",
          errorCode: "PROFILE_NOT_FOUND",
          debugInfo,
        }
      }

      console.log("✅ Profile found:", profileCheck)
      debugInfo.profileData = profileCheck
      debugInfo.steps.push("Profile found in database")

      // Step 2: Attempt Supabase auth
      console.log("🔑 Attempting Supabase authentication...")

      const authResult = await this.supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      })

      debugInfo.authResponse = {
        hasUser: !!authResult.data?.user,
        hasSession: !!authResult.data?.session,
        errorMessage: authResult.error?.message,
        errorStatus: authResult.error?.status,
        userEmail: authResult.data?.user?.email,
        userId: authResult.data?.user?.id,
      }

      console.log("📊 Auth response:", debugInfo.authResponse)

      if (authResult.error) {
        console.error("❌ Supabase auth failed:", authResult.error)

        // Provide specific error messages
        let userFriendlyError = "Login failed"
        let errorCode = "AUTH_FAILED"

        if (authResult.error.message.includes("Invalid login credentials")) {
          userFriendlyError = "Invalid email or password. Please check your credentials."
          errorCode = "INVALID_CREDENTIALS"
        } else if (authResult.error.message.includes("Email not confirmed")) {
          userFriendlyError = "Email not confirmed. Please check your inbox."
          errorCode = "EMAIL_NOT_CONFIRMED"
        } else if (authResult.error.message.includes("Too many requests")) {
          userFriendlyError = "Too many login attempts. Please try again later."
          errorCode = "TOO_MANY_REQUESTS"
        }

        return {
          success: false,
          error: userFriendlyError,
          errorCode: errorCode,
          debugInfo,
        }
      }

      if (!authResult.data?.user) {
        console.error("❌ No user data received")
        return {
          success: false,
          error: "Authentication failed - no user data",
          errorCode: "NO_USER_DATA",
          debugInfo,
        }
      }

      console.log("✅ Authentication successful!")
      debugInfo.steps.push("Supabase authentication successful")

      // Step 3: Get hotel name if needed
      let hotel_name = undefined
      if (profileCheck.hotel_id) {
        try {
          const { data: hotel } = await this.supabase
            .from("hotels")
            .select("name")
            .eq("id", profileCheck.hotel_id)
            .single()

          hotel_name = hotel?.name
        } catch (error) {
          console.warn("⚠️ Could not fetch hotel name:", error)
        }
      }

      const authUser: AuthUser = {
        id: profileCheck.id,
        email: profileCheck.email,
        full_name: profileCheck.full_name,
        role: profileCheck.role,
        hotel_id: profileCheck.hotel_id || undefined,
        hotel_name: hotel_name,
      }

      console.log("🎉 Login completed successfully!")
      debugInfo.steps.push("Login completed successfully")

      return {
        success: true,
        user: authUser,
        debugInfo,
      }
    } catch (error: any) {
      console.error("💥 Unexpected error:", error)
      debugInfo.errors.push(error.message)

      return {
        success: false,
        error: "An unexpected error occurred",
        errorCode: "UNEXPECTED_ERROR",
        debugInfo,
      }
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession()

      if (!session?.user) return null

      const { data: profile } = await this.supabase
        .from("profiles")
        .select("id, email, full_name, role, hotel_id")
        .eq("id", session.user.id)
        .single()

      if (!profile) return null

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
      console.error("Error getting current user:", error)
      return null
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
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

  // Debug function to check auth system
  async debugAuthSystem(): Promise<any> {
    const debug = {
      connection: false,
      profiles: [],
      authUsers: [],
      errors: [],
    }

    try {
      // Test connection
      const { data: profiles, error: profileError } = await this.supabase
        .from("profiles")
        .select("id, email, role")
        .in("email", ["admin@baitahotel.com", "hotel@exemplo.com"])

      if (profileError) {
        debug.errors.push(`Profiles error: ${profileError.message}`)
      } else {
        debug.connection = true
        debug.profiles = profiles || []
      }

      // Try to get session info
      const { data: session, error: sessionError } = await this.supabase.auth.getSession()

      if (sessionError) {
        debug.errors.push(`Session error: ${sessionError.message}`)
      }

      console.log("🔍 Debug info:", debug)
      return debug
    } catch (error: any) {
      debug.errors.push(`System error: ${error.message}`)
      return debug
    }
  }
}

export const debugAuthService = new DebugAuthService()
