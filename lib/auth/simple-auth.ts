import { createClient } from "@/lib/supabase/client"

export interface SimpleUser {
  id: string
  email: string
  full_name: string
  user_role: "master_admin" | "hotel_owner" | "hotel_staff"
  is_active: boolean
}

class SimpleAuth {
  private supabase = createClient()
  private currentUser: SimpleUser | null = null
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🔄 SimpleAuth: Initializing...")

    // Check localStorage for existing user
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("simple_auth_user")
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored)
          console.log("✅ SimpleAuth: Found stored user:", this.currentUser?.email)
        } catch (error) {
          console.error("❌ SimpleAuth: Error parsing stored user:", error)
          localStorage.removeItem("simple_auth_user")
        }
      }
    }

    this.isInitialized = true
    console.log("✅ SimpleAuth: Initialized")
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; user?: SimpleUser; error?: string }> {
    try {
      console.log("🔐 SimpleAuth: Attempting login for:", email)

      // Direct database query
      const { data, error } = await this.supabase
        .from("profiles")
        .select("id, email, full_name, user_role, is_active, password_hash")
        .eq("email", email.toLowerCase().trim())
        .eq("is_active", true)
        .single()

      if (error || !data) {
        console.log("❌ SimpleAuth: User not found or inactive")
        return { success: false, error: "Email ou senha incorretos" }
      }

      // Simple password check (in production, use proper hashing)
      if (data.password_hash !== password) {
        console.log("❌ SimpleAuth: Invalid password")
        return { success: false, error: "Email ou senha incorretos" }
      }

      const user: SimpleUser = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        user_role: data.user_role,
        is_active: data.is_active,
      }

      this.currentUser = user

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("simple_auth_user", JSON.stringify(user))
      }

      console.log("✅ SimpleAuth: Login successful for:", user.email, "Role:", user.user_role)
      return { success: true, user }
    } catch (error) {
      console.error("💥 SimpleAuth: Login error:", error)
      return { success: false, error: "Erro no sistema de login" }
    }
  }

  async signOut(): Promise<void> {
    console.log("👋 SimpleAuth: Signing out")
    this.currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("simple_auth_user")
    }
  }

  getCurrentUser(): SimpleUser | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  isMasterAdmin(): boolean {
    return this.currentUser?.user_role === "master_admin" || false
  }
}

export const simpleAuth = new SimpleAuth()
