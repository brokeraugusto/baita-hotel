"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth/auth-service-no-loop"
import { Loader2 } from "lucide-react"

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState<string>()
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log("🔍 Master layout: Initializing auth...")

        // Initialize auth service
        await authService.initialize()

        if (!mounted) return

        const authState = authService.getAuthState()
        console.log("🔍 Master layout: Auth state:", {
          isAuthenticated: authState.isAuthenticated,
          userRole: authState.user?.user_role,
          isLoading: authState.isLoading,
        })

        if (authState.isLoading) {
          console.log("⏳ Auth still loading...")
          return
        }

        if (!authState.isAuthenticated || !authState.user) {
          console.log("❌ Not authenticated, redirecting to login")
          router.push("/login")
          return
        }

        if (authState.user.user_role !== "master_admin") {
          console.log("❌ Not master admin, redirecting to login")
          router.push("/login")
          return
        }

        console.log("✅ Master admin authorized")
        setIsAuthorized(true)
        setIsLoading(false)
      } catch (error) {
        console.error("💥 Master layout auth error:", error)
        if (mounted) {
          setError("Erro na autenticação")
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((authState) => {
      if (!mounted) return

      console.log("🔄 Master layout: Auth state changed:", {
        isAuthenticated: authState.isAuthenticated,
        userRole: authState.user?.user_role,
        isLoading: authState.isLoading,
      })

      if (authState.isLoading) {
        return
      }

      if (!authState.isAuthenticated || !authState.user) {
        console.log("❌ Auth lost, redirecting to login")
        router.push("/login")
        return
      }

      if (authState.user.user_role !== "master_admin") {
        console.log("❌ Not master admin, redirecting to login")
        router.push("/login")
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ir para Login
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Acesso não autorizado</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ir para Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
