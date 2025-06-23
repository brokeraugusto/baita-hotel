"use client"
import { useState } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2, LogIn, User, Shield } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider-simple"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const { signIn, error: authError, clearError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get("type")

  const error = localError || authError

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLocalError(null)
    clearError()

    if (!email || !password) {
      setLocalError("Por favor, preencha todos os campos")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn(email, password)

      if (result.success && result.user) {
        console.log("✅ Login successful, redirecting...")

        // Redirect based on user role
        if (result.user.role === "master_admin") {
          router.push("/master/dashboard")
        } else {
          router.push("/client")
        }
      } else {
        setLocalError(result.error || "Falha no login")
      }
    } catch (err: any) {
      console.error("💥 Login error:", err)
      setLocalError("Erro inesperado durante o login")
    } finally {
      setIsLoading(false)
    }
  }

  const fillCredentials = (userType: "master" | "client") => {
    if (userType === "master") {
      setEmail("admin@baitahotel.com")
      setPassword("admin123")
    } else {
      setEmail("hotel@exemplo.com")
      setPassword("hotel123")
    }
    setLocalError(null)
    clearError()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            Login
          </CardTitle>
          <CardDescription className="text-center">
            {userType === "master"
              ? "Acesso para administradores master"
              : userType === "client"
                ? "Acesso para clientes"
                : "Entre com suas credenciais"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">Credenciais de teste:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillCredentials("master")}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  Master Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillCredentials("client")}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <User className="h-3 w-3" />
                  Cliente
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
