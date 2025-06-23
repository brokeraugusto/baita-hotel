"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService, type AuthState, type UserRole } from "@/lib/auth/auth-service"

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (userData: {
    email: string
    password: string
    full_name: string
    hotel_name?: string
    role?: UserRole
  }) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => authService.getAuthState())

  useEffect(() => {
    console.log("🔧 Setting up AuthProvider...")

    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((newState) => {
      console.log("🔄 Auth state updated:", {
        isAuthenticated: newState.isAuthenticated,
        isLoading: newState.isLoading,
        userEmail: newState.user?.email,
        userRole: newState.user?.role,
        error: newState.error,
      })
      setAuthState(newState)
    })

    return () => {
      console.log("🧹 Cleaning up AuthProvider...")
      unsubscribe()
    }
  }, [])

  const clearError = () => {
    if (authState.error) {
      setAuthState((prev) => ({ ...prev, error: undefined }))
    }
  }

  const contextValue: AuthContextType = {
    ...authState,
    signIn: authService.signIn.bind(authService),
    signUp: authService.signUp.bind(authService),
    signOut: authService.signOut.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    clearError,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Hook for getting user info (backward compatibility)
export function useUser() {
  const { user, isLoading, isAuthenticated } = useAuth()
  return { user, isLoading, isAuthenticated }
}

// Utility function for role checking
export function useUserRole() {
  const { user } = useAuth()
  return {
    role: user?.role,
    isClient: user?.role === "client",
    isMasterAdmin: user?.role === "master_admin",
    isHotelStaff: user?.role === "hotel_staff",
  }
}
