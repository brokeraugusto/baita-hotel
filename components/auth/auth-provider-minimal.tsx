"use client"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService, type AuthUser, type AuthResult } from "@/lib/auth/auth-service-detailed"

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  clearError: () => void
  diagnoseSystem: () => Promise<any>
  testCredentials: (email: string, password: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("🚀 AuthProvider initializing (non-blocking)...")

    let mounted = true

    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()

        if (mounted) {
          setUser(currentUser)
          console.log("👤 Initial user:", currentUser)
        }
      } catch (err) {
        console.error("💥 Auth initialization error:", err)
        if (mounted) {
          setError("Failed to initialize authentication")
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = authService.onAuthStateChange((newUser) => {
      if (mounted) {
        console.log("🔄 Auth state updated:", newUser)
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
      const result = await authService.signIn(email, password)

      if (result.success && result.user) {
        setUser(result.user)
      } else {
        setError(result.error || "Login failed")
      }

      return result
    } catch (err: any) {
      const errorMessage = "An unexpected error occurred"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.signOut()
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
    return await authService.diagnoseDatabase()
  }

  const testCredentials = async (email: string, password: string) => {
    return await authService.testAuthCredentials(email, password)
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
    testCredentials,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
