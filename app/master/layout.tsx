"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await systemAuth.initialize()

        if (!systemAuth.isAuthenticated()) {
          console.log("❌ Not authenticated, redirecting to login")
          router.replace("/login")
          return
        }

        if (!systemAuth.isMasterAdmin()) {
          console.log("❌ Not master admin, redirecting to login")
          router.replace("/login")
          return
        }

        console.log("✅ Master admin authorized")
        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check error:", error)
        router.replace("/login")
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
