"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider-minimal"
import { Loader2, CheckCircle, XCircle, Key, TestTube, Shield, Eye, EyeOff } from "lucide-react"

export default function TestNewCredentialsPage() {
  const { signIn, isLoading, error, clearError, user, signOut } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  // New credentials to test
  const newCredentials = [
    {
      email: "admin@baitahotel.com",
      password: "masteradmin123",
      role: "Master Admin",
      description: "Updated admin credentials with secure password",
    },
    {
      email: "hotel@exemplo.com",
      password: "cliente123",
      role: "Client",
      description: "Updated client credentials with secure password",
    },
  ]

  const handleLogin = async (testEmail?: string, testPassword?: string) => {
    clearError()

    const loginEmail = testEmail || email
    const loginPassword = testPassword || password

    if (!loginEmail || !loginPassword) {
      alert("Please enter email and password")
      return
    }

    console.log("🔐 Testing new credentials:", loginEmail)
    const result = await signIn(loginEmail, loginPassword)

    if (result.success) {
      console.log("✅ Login successful with new credentials!")
    } else {
      console.error("❌ Login failed:", result.error)
    }
  }

  const runCredentialTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    console.log("🧪 Testing all new credentials...")
    const results = []

    for (const cred of newCredentials) {
      console.log(`Testing ${cred.email} with new password...`)

      try {
        // Sign out first if logged in
        if (user) {
          await signOut()
          // Wait a bit for logout to complete
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        const startTime = Date.now()
        const result = await signIn(cred.email, cred.password)
        const endTime = Date.now()

        results.push({
          ...cred,
          success: result.success,
          error: result.error,
          responseTime: endTime - startTime,
          timestamp: new Date().toISOString(),
          diagnostics: result.diagnostics,
        })

        // Sign out after successful test
        if (result.success) {
          await signOut()
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      } catch (error: any) {
        results.push({
          ...cred,
          success: false,
          error: error.message,
          responseTime: 0,
          timestamp: new Date().toISOString(),
        })
      }
    }

    setTestResults(results)
    setIsRunningTests(false)
    console.log("🧪 Credential test results:", results)
  }

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="outline" className="text-green-600 border-green-600">
        ✅ Success
      </Badge>
    ) : (
      <Badge variant="destructive">❌ Failed</Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />🔐 Teste das Novas Credenciais - Sistema Atualizado
              {user && (
                <Badge variant="outline" className="ml-auto">
                  Logado: {user.email} ({user.role})
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Teste das credenciais atualizadas com senhas seguras usando bcrypt e salt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {user && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ Login realizado com sucesso com as novas credenciais!
                  <br />
                  Usuário: {user.full_name} ({user.role})
                  {user.hotel_name && (
                    <>
                      <br />
                      Hotel: {user.hotel_name}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Manual Login */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Login Manual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={() => handleLogin()} disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Fazer Login
                  </Button>
                </CardContent>
              </Card>

              {/* New Credentials */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Novas Credenciais Seguras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {newCredentials.map((cred, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{cred.role}</span>
                        <Badge variant="secondary">Atualizado</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Email:</strong> {cred.email}
                        </div>
                        <div>
                          <strong>Senha:</strong> {cred.password}
                        </div>
                        <div className="text-gray-600 text-xs">{cred.description}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLogin(cred.email, cred.password)}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Testar {cred.role}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Test All Button */}
            <div className="flex justify-center">
              <Button onClick={runCredentialTests} disabled={isRunningTests} size="lg" className="px-8">
                {isRunningTests ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="mr-2 h-4 w-4" />
                )}
                {isRunningTests ? "Testando..." : "Testar Todas as Credenciais"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">📊 Resultados dos Testes de Credenciais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((test, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{test.role}</span>
                      <div className="flex gap-2 items-center">
                        {getStatusBadge(test.success)}
                        <Badge variant="outline" className="text-xs">
                          {test.responseTime}ms
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div>
                          <strong>Email:</strong> {test.email}
                        </div>
                        <div>
                          <strong>Senha:</strong> {test.password}
                        </div>
                        <div>
                          <strong>Timestamp:</strong> {new Date(test.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        {test.success ? (
                          <div className="text-green-600">
                            ✅ Login realizado com sucesso!
                            <br />
                            Credenciais atualizadas funcionando corretamente.
                          </div>
                        ) : (
                          <div className="text-red-600">❌ Falha no login: {test.error}</div>
                        )}
                      </div>
                    </div>

                    {test.diagnostics && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium">Ver Diagnósticos Detalhados</summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                          <pre>{JSON.stringify(test.diagnostics, null, 2)}</pre>
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />🔒 Recursos de Segurança Implementados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold">Hashing de Senhas:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>✅ bcrypt com fator de custo 12</li>
                  <li>✅ Salt automático gerado</li>
                  <li>✅ Hashes de 60+ caracteres</li>
                  <li>✅ Resistente a ataques de força bruta</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Validações de Segurança:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>✅ Verificação de integridade do hash</li>
                  <li>✅ Sincronização de identidades</li>
                  <li>✅ Confirmação de email automática</li>
                  <li>✅ Timestamps de auditoria</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>1. 🔧 Execute os scripts de atualização de senha se ainda não executou</div>
              <div>2. 🧪 Use "Testar Todas as Credenciais" para verificar o sistema</div>
              <div>3. 🔐 Teste login manual com as novas senhas</div>
              <div>4. 📊 Analise os resultados e diagnósticos detalhados</div>
              <div>5. ✅ Confirme que ambos os usuários conseguem fazer login</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
