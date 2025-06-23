"use client"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { enhancedAuthService, type AuthUser, type AuthResult } from "@/lib/auth/auth-service-enhanced"

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  clearError: () => void
  diagnoseSystem: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function EnhancedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("🚀 Enhanced AuthProvider initializing...")

    let mounted = true

    const initializeAuth = async () => {
      try {
        const currentUser = await enhancedAuthService.getCurrentUser()
        if (mounted) {
          setUser(currentUser)
          console.log("👤 Enhanced auth initial user:", currentUser)
        }
      } catch (err) {
        console.error("💥 Enhanced auth initialization error:", err)
        if (mounted) {
          setError("Failed to initialize authentication")
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = enhancedAuthService.onAuthStateChange((newUser) => {
      if (mounted) {
        console.log("🔄 Enhanced auth state updated:", newUser)
        setUser(newUser)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("🔐 Enhanced auth: Starting sign in for", email)
      const result = await enhancedAuthService.signIn(email, password)

      if (result.success && result.user) {
        setUser(result.user)
        console.log("✅ Enhanced auth: Sign in successful")
      } else {
        setError(result.error || "Login failed")
        console.error("❌ Enhanced auth: Sign in failed", result.error)
      }

      return result
    } catch (err: any) {
      const errorMessage = "An unexpected error occurred"
      setError(errorMessage)
      console.error("💥 Enhanced auth: Sign in exception", err)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await enhancedAuthService.signOut()
      setUser(null)
    } catch (err: any) {
      setError("Failed to sign out")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const diagnoseSystem = async () => {
    return await enhancedAuthService.diagnoseAuthSystem()
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signIn,
    signOut,
    clearError,
    diagnoseSystem,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useEnhancedAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useEnhancedAuth must be used within an EnhancedAuthProvider")
  }
  return context
}
