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
import { authService } from "@/lib/auth/auth-service-no-loop"

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  // Check if user is already authenticated
  useEffect(() => {
    let mounted = true

    const checkExistingAuth = async () => {
      try {
        console.log("🔍 Login page: Checking existing auth...")
        await authService.initialize()

        if (!mounted) return

        const authState = authService.getAuthState()
        console.log("🔍 Login page: Auth state:", {
          isAuthenticated: authState.isAuthenticated,
          userRole: authState.user?.user_role,
        })

        if (authState.isAuthenticated && authState.user) {
          console.log("✅ Already authenticated, redirecting...")

          if (authState.user.user_role === "master_admin") {
            router.push("/master/dashboard")
          } else if (authState.user.user_role === "hotel_owner") {
            router.push("/client/dashboard")
          } else {
            router.push("/dashboard")
          }
          return
        }

        setIsCheckingAuth(false)
      } catch (error) {
        console.error("💥 Auth check error:", error)
        if (mounted) {
          setIsCheckingAuth(false)
        }
      }
    }

    checkExistingAuth()

    return () => {
      mounted = false
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("🔐 Attempting login for:", email)

      const result = await authService.signIn(email, password)

      if (result.success && result.user) {
        console.log("✅ Login successful, redirecting...", result.user.user_role)

        // Small delay to ensure state is updated
        setTimeout(() => {
          if (result.user!.user_role === "master_admin") {
            console.log("🔄 Redirecting to master dashboard")
            router.push("/master/dashboard")
          } else if (result.user!.user_role === "hotel_owner") {
            console.log("🔄 Redirecting to client dashboard")
            router.push("/client/dashboard")
          } else {
            console.log("🔄 Redirecting to default dashboard")
            router.push("/dashboard")
          }
        }, 100)
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

  const fillTestCredentials = () => {
    setEmail("admin@baitahotel.com")
    setPassword("admin123")
  }

  if (isCheckingAuth) {
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

          <Button type="button" variant="outline" onClick={fillTestCredentials} className="w-full text-sm">
            Usar credenciais de teste (Master Admin)
          </Button>

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

          <div className="text-center text-sm text-muted-foreground">
            <p className="font-medium">Credenciais de teste:</p>
            <p>Email: admin@baitahotel.com</p>
            <p>Senha: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
