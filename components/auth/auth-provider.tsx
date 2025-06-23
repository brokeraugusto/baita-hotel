"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService, type AuthState } from "@/lib/auth-fixed"

type UserType = "client" | "master_admin" | "hotel_staff"

type User = {
  id: string
  email: string
  name: string
  type: UserType
  hotel_name?: string
  created_at: string
}

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (userData: {
    email: string
    password: string
    name: string
    hotel_name: string
    user_role: "client" | "master_admin" | "hotel_staff"
  }) => Promise<boolean>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
  resetPassword: async () => false,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState())

  useEffect(() => {
    // Inscrever-se para atualizações do estado de autenticação
    const unsubscribe = authService.subscribe(setAuthState)
    return unsubscribe
  }, [])

  const value: AuthContextType = {
    ...authState,
    signIn: authService.signIn.bind(authService),
    signUp: authService.signUp.bind(authService),
    signOut: authService.signOut.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
