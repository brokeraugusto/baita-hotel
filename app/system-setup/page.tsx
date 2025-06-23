"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Server, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

interface SystemStatus {
  system_initialized: boolean
  database_ready: boolean
  has_master_admin: boolean
  subscription_plans_count: number
  version: string
  requires_setup: boolean
  statistics?: {
    total_hotels: number
    total_clients: number
    master_admin_exists: boolean
  }
  error?: string
}

interface FormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

interface ValidationErrors {
  email?: string
  password?: string
  confirmPassword?: string
  fullName?: string
}

export default function SystemSetupPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("🔍 Checking system status...")

      const response = await fetch("/api/system/setup", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("📊 System status received:", result)

      // Even if there's an error, we might have partial data
      if (result.data) {
        setSystemStatus(result.data)
      }

      if (!result.success && result.error) {
        setError(`Aviso: ${result.error}`)
      }

      // If system is already initialized, redirect to login after a delay
      if (result.data?.system_initialized && !result.data?.requires_setup) {
        console.log("✅ System already initialized, redirecting to login...")
        setSuccess("Sistema já inicializado! Redirecionando para login...")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (error: any) {
      console.error("💥 Error checking system status:", error)
      setError("Falha ao verificar status do sistema. Tentando continuar...")

      // Set a default status to allow setup to continue
      setSystemStatus({
        system_initialized: false,
        database_ready: true,
        has_master_admin: false,
        subscription_plans_count: 0,
        version: "2.0.0",
        requires_setup: true,
        statistics: {
          total_hotels: 0,
          total_clients: 0,
          master_admin_exists: false,
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear validation errors when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    setError(null)
    setSuccess(null)
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email inválido"
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = "Nome completo é obrigatório"
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Nome deve ter pelo menos 2 caracteres"
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Senha é obrigatória"
    } else if (formData.password.length < 6) {
      errors.password = "Senha deve ter pelo menos 6 caracteres"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirmação de senha é obrigatória"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Senhas não coincidem"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInitialize = async () => {
    if (!validateForm()) {
      setError("Por favor, corrija os erros no formulário")
      return
    }

    setIsInitializing(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("🚀 Initializing master user...")

      const response = await fetch("/api/system/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("Sistema inicializado com sucesso! Redirecionando para login...")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(result.error || "Falha na inicialização do sistema")
      }
    } catch (error: any) {
      console.error("💥 Initialization error:", error)
      setError("Erro inesperado na inicialização. Tente novamente.")
    } finally {
      setIsInitializing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Verificando status do sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Crown className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">BaitaHotel</span>
            <Badge variant="secondary" className="ml-2">
              v2.0
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Configuração Inicial do Sistema</h1>
          <p className="text-gray-600">Configure o administrador master para começar a usar a plataforma</p>
        </div>

        {/* System Status Card */}
        {systemStatus && (
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Server className="h-4 w-4 text-blue-600" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database:</span>
                    <Badge
                      variant="outline"
                      className={systemStatus.database_ready ? "text-green-600" : "text-red-600"}
                    >
                      {systemStatus.database_ready ? "Ready" : "Not Ready"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plans:</span>
                    <Badge variant="outline">{systemStatus.subscription_plans_count} plans</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Master Admin:</span>
                    <Badge variant={systemStatus.has_master_admin ? "default" : "destructive"}>
                      {systemStatus.has_master_admin ? "Configured" : "Required"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <Badge variant="secondary">{systemStatus.version}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning if there are issues */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Setup Form */}
        {(!systemStatus || systemStatus.requires_setup) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-600" />
                Criar Administrador Master
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Seu nome completo"
                  disabled={isInitializing}
                />
                {validationErrors.fullName && <p className="text-sm text-red-600">{validationErrors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="admin@exemplo.com"
                  disabled={isInitializing}
                />
                {validationErrors.email && <p className="text-sm text-red-600">{validationErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Senha segura"
                    disabled={isInitializing}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isInitializing}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.password && <p className="text-sm text-red-600">{validationErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirme sua senha"
                    disabled={isInitializing}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isInitializing}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Success message */}
              {success && (
                <Alert>
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}

              {/* Submit button */}
              <Button onClick={handleInitialize} disabled={isInitializing} className="w-full">
                {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inicializando...
                  </>
                ) : (
                  "Inicializar Sistema"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Already initialized message */}
        {systemStatus && !systemStatus.requires_setup && (
          <Card className="border-green-200">
            <CardContent className="text-center py-8">
              <div className="text-green-600 mb-4">
                <Crown className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistema Já Inicializado</h3>
              <p className="text-gray-600 mb-4">O sistema já foi configurado e está pronto para uso.</p>
              <Button onClick={() => router.push("/login")}>Ir para Login</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
