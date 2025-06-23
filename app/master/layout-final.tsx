"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth/auth-service-final"
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
    const checkAuth = async () => {
      try {
        console.log("🔍 Master layout checking auth...")

        // Initialize auth service
        await authService.initialize()

        const authState = authService.getAuthState()
        console.log("🔍 Auth state in master layout:", authState)

        if (!authState.isAuthenticated || !authState.user) {
          console.log("❌ Not authenticated, redirecting to login")
          router.replace("/login")
          return
        }

        if (authState.user.user_role !== "master_admin") {
          console.log("❌ Not master admin, redirecting to login")
          setError("Acesso negado: apenas administradores master podem acessar esta área")
          setTimeout(() => {
            router.replace("/login")
          }, 2000)
          return
        }

        console.log("✅ Master admin authorized")
        setIsAuthorized(true)
      } catch (error) {
        console.error("💥 Auth check error:", error)
        setError("Erro na verificação de autenticação")
        setTimeout(() => {
          router.replace("/login")
        }, 2000)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
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
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Acesso não autorizado</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
