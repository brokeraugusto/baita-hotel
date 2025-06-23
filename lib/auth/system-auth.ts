import { createClient } from "@/lib/supabase/client"

export interface SystemUser {
  id: string
  email: string
  full_name: string
  user_role: "master_admin" | "hotel_owner" | "hotel_staff"
  is_active: boolean
}

class SystemAuth {
  private supabase = createClient()
  private currentUser: SystemUser | null = null
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log("🔄 SystemAuth: Initializing...")

    // Check localStorage for existing user
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("system_auth_user")
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored)
          console.log("✅ SystemAuth: Found stored user:", this.currentUser?.email)
        } catch (error) {
          console.error("❌ SystemAuth: Error parsing stored user:", error)
          localStorage.removeItem("system_auth_user")
        }
      }
    }

    this.isInitialized = true
    console.log("✅ SystemAuth: Initialized")
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; user?: SystemUser; error?: string }> {
    try {
      console.log("🔐 SystemAuth: Attempting login for:", email)

      const normalizedEmail = email.toLowerCase().trim()
      const normalizedPassword = password.trim()

      // Direct database query
      const { data, error } = await this.supabase
        .from("profiles")
        .select("id, email, full_name, user_role, is_active, password_hash")
        .eq("email", normalizedEmail)
        .eq("is_active", true)
        .single()

      if (error || !data) {
        console.log("❌ SystemAuth: User not found or error:", error)
        return { success: false, error: "Credenciais inválidas" }
      }

      // Simple password check
      if (data.password_hash !== normalizedPassword) {
        console.log("❌ SystemAuth: Password mismatch")
        return { success: false, error: "Credenciais inválidas" }
      }

      const user: SystemUser = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        user_role: data.user_role,
        is_active: data.is_active,
      }

      this.currentUser = user

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("system_auth_user", JSON.stringify(user))
      }

      console.log("✅ SystemAuth: Login successful for:", user.email)
      return { success: true, user }
    } catch (error) {
      console.error("💥 SystemAuth: Login error:", error)
      return { success: false, error: "Erro no sistema de login" }
    }
  }

  async signOut(): Promise<void> {
    console.log("👋 SystemAuth: Signing out")
    this.currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("system_auth_user")
    }
  }

  getCurrentUser(): SystemUser | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  isMasterAdmin(): boolean {
    return this.currentUser?.user_role === "master_admin" || false
  }
}

export const systemAuth = new SystemAuth()
