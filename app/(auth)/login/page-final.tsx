"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { authService } from "@/lib/auth/auth-service-final"

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth on login page...")
        await authService.initialize()

        const authState = authService.getAuthState()
        console.log("🔍 Current auth state:", authState)

        if (authState.isAuthenticated && authState.user) {
          console.log("👤 User already authenticated, redirecting...")

          // Redirect based on user role
          if (authState.user.user_role === "master_admin") {
            console.log("🔄 Redirecting to master dashboard")
            router.replace("/master/dashboard")
          } else if (authState.user.user_role === "hotel_owner") {
            console.log("🔄 Redirecting to client dashboard")
            router.replace("/client/dashboard")
          } else {
            console.log("🔄 Redirecting to default dashboard")
            router.replace("/dashboard")
          }
          return
        }
      } catch (error) {
        console.error("💥 Auth initialization error:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("🔐 Attempting login for:", email)
      console.log("🔐 Password provided:", password ? "Yes" : "No")

      const result = await authService.signIn(email, password)
      console.log("🔍 Login result:", result)

      if (result.success && result.user) {
        console.log("✅ Login successful, user role:", result.user.user_role)

        // Small delay to ensure state is updated
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Redirect based on user role
        if (result.user.user_role === "master_admin") {
          console.log("🔄 Redirecting to master dashboard")
          router.replace("/master/dashboard")
        } else if (result.user.user_role === "hotel_owner") {
          console.log("🔄 Redirecting to client dashboard")
          router.replace("/client/dashboard")
        } else {
          console.log("🔄 Redirecting to default dashboard")
          router.replace("/dashboard")
        }
      } else {
        console.error("❌ Login failed:", result.error)
        setError(result.error || "Credenciais inválidas. Verifique seu email e senha.")
      }
    } catch (error) {
      console.error("💥 Login error:", error)
      setError("Erro no sistema de login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Credenciais de teste
  const fillTestCredentials = (type: "admin" | "suporte" | "hotel") => {
    if (type === "admin") {
      setEmail("admin@baitahotel.com")
      setPassword("admin123")
    } else if (type === "suporte") {
      setEmail("suporte@o2digital.com.br")
      setPassword("LaVi121888!")
    } else if (type === "hotel") {
      setEmail("hotel@exemplo.com")
      setPassword("hotel123")
    }
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">Entre com suas credenciais</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botões de teste para desenvolvimento */}
          <div className="grid gap-2">
            <p className="text-sm font-medium">Credenciais de teste:</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillTestCredentials("admin")}
                className="text-xs"
              >
                Master Admin (admin@baitahotel.com / admin123)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillTestCredentials("suporte")}
                className="text-xs"
              >
                Suporte (suporte@o2digital.com.br / LaVi121888!)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillTestCredentials("hotel")}
                className="text-xs"
              >
                Hotel (hotel@exemplo.com / hotel123)
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">Mostrar senha</span>
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Acessando...
                </>
              ) : (
                "Acessar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
