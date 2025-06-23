"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/services/auth-service"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = authService.subscribe((authState) => {
      if (!authState.isLoading) {
        if (!authState.isAuthenticated) {
          router.push("/login")
        } else if (authState.user) {
          // Redirect based on user role
          if (authState.user.user_role === "master_admin") {
            router.push("/master/dashboard")
          } else if (authState.user.user_role === "hotel_owner") {
            router.push("/client/dashboard")
          } else {
            router.push("/login")
          }
        }
      }
    })

    return unsubscribe
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
