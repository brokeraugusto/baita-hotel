"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { systemAuth } from "@/lib/auth/system-auth"
import { Loader2 } from "lucide-react"

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Se estiver na página de login, não verificar autenticação
  const isLoginPage = pathname === "/master/login"

  useEffect(() => {
    // Se for página de login, permitir acesso direto
    if (isLoginPage) {
      setIsLoading(false)
      setIsAuthorized(true)
      return
    }

    const checkAuth = async () => {
      try {
        await systemAuth.initialize()

        if (!systemAuth.isAuthenticated()) {
          console.log("❌ Not authenticated, redirecting to master login")
          router.replace("/master/login")
          return
        }

        if (!systemAuth.isMasterAdmin()) {
          console.log("❌ Not master admin, redirecting to master login")
          router.replace("/master/login")
          return
        }

        console.log("✅ Master admin authorized")
        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check error:", error)
        router.replace("/master/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, isLoginPage, pathname])

  // Se for página de login, renderizar diretamente
  if (isLoginPage) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
