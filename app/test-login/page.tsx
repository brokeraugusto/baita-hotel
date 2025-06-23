"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider-minimal"
import { Loader2, CheckCircle, XCircle, Info, TestTube } from "lucide-react"

export default function TestLoginPage() {
  const { signIn, isLoading, error, clearError, user, diagnoseSystem, testCredentials } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [lastResult, setLastResult] = useState<any>(null)
  const [systemDiagnosis, setSystemDiagnosis] = useState<any>(null)
  const [credentialTests, setCredentialTests] = useState<any>(null)

  const testCredentialsList = [
    { email: "admin@baitahotel.com", password: "123456789", role: "Master Admin" },
    { email: "hotel@exemplo.com", password: "123456789", role: "Client" },
  ]

  const handleLogin = async (testEmail?: string, testPassword?: string) => {
    clearError()
    setLastResult(null)

    const loginEmail = testEmail || email
    const loginPassword = testPassword || password

    if (!loginEmail || !loginPassword) {
      alert("Please enter email and password")
      return
    }

    console.log("🔐 Attempting login with:", loginEmail)
    const result = await signIn(loginEmail, loginPassword)

    setLastResult(result)

    if (result.success) {
      console.log("✅ Login successful!")
    } else {
      console.error("❌ Login failed:", result.error)
      console.log("📊 Diagnostics:", result.diagnostics)
    }
  }

  const runSystemDiagnosis = async () => {
    console.log("🔍 Running system diagnosis...")
    try {
      const diagnosis = await diagnoseSystem()
      setSystemDiagnosis(diagnosis)
      console.log("📊 System diagnosis:", diagnosis)
    } catch (err) {
      console.error("💥 Diagnosis error:", err)
      setSystemDiagnosis({ error: "Failed to run diagnosis" })
    }
  }

  const runCredentialTests = async () => {
    console.log("🧪 Testing all credentials...")
    const results = []

    for (const cred of testCredentialsList) {
      console.log(`Testing ${cred.email}...`)
      try {
        const result = await testCredentials(cred.email, cred.password)
        results.push({
          ...cred,
          ...result,
        })
      } catch (error: any) {
        results.push({
          ...cred,
          userExists: false,
          authWorks: false,
          error: error.message,
        })
      }
    }

    setCredentialTests(results)
    console.log("🧪 Credential test results:", results)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧪 Sistema de Teste de Login - Diagnóstico Avançado
              {user && (
                <Badge variant="outline" className="ml-auto">
                  Logado: {user.email} ({user.role})
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Diagnóstico detalhado do sistema de autenticação com teste de credenciais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  ✅ Login realizado com sucesso!
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

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Login Manual</h3>
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={() => handleLogin()} disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Fazer Login
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Credenciais de Teste</h3>
                {testCredentialsList.map((cred, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="text-sm">
                      <strong>{cred.role}</strong>
                      <br />
                      Email: {cred.email}
                      <br />
                      Senha: {cred.password}
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
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={runSystemDiagnosis} disabled={isLoading} variant="outline">
                🔍 Diagnóstico do Sistema
              </Button>
              <Button onClick={runCredentialTests} disabled={isLoading} variant="secondary">
                <TestTube className="mr-2 h-4 w-4" />
                Testar Credenciais
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credential Test Results */}
        {credentialTests && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🧪 Resultados do Teste de Credenciais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {credentialTests.map((test: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{test.role}</span>
                      <div className="flex gap-2">
                        <Badge variant={test.userExists ? "outline" : "destructive"}>
                          {test.userExists ? "✅ Usuário Existe" : "❌ Usuário Não Existe"}
                        </Badge>
                        <Badge variant={test.authWorks ? "outline" : "destructive"}>
                          {test.authWorks ? "✅ Auth OK" : "❌ Auth Falhou"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Email: {test.email}</div>
                      {test.error && <div className="text-red-600">Erro: {test.error}</div>}
                      {test.details && test.details.profile && (
                        <div className="text-green-600">
                          Profile ID: {test.details.profile.id} | Role: {test.details.profile.role}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Login Diagnostics */}
        {lastResult && lastResult.diagnostics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔍 Diagnóstico Detalhado do Login
                {lastResult.success ? (
                  <Badge variant="outline" className="text-green-600">
                    Sucesso
                  </Badge>
                ) : (
                  <Badge variant="destructive">Falhou</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Steps */}
                <div>
                  <h4 className="font-semibold mb-2">Passos Executados:</h4>
                  <div className="space-y-1">
                    {lastResult.diagnostics.steps.map((step: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {step.includes("✅") ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Info className="h-3 w-3 text-blue-500" />
                        )}
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auth Details */}
                {lastResult.diagnostics.authDetails && (
                  <div>
                    <h4 className="font-semibold mb-2">Detalhes da Autenticação:</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <pre>{JSON.stringify(lastResult.diagnostics.authDetails, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {/* Errors */}
                {lastResult.diagnostics.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">Erros Encontrados:</h4>
                    <div className="space-y-1">
                      {lastResult.diagnostics.errors.map((error: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                          <XCircle className="h-3 w-3" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Code */}
                {lastResult.errorCode && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="text-sm">
                      <strong>Código do Erro:</strong> {lastResult.errorCode}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Diagnosis */}
        {systemDiagnosis && (
          <Card>
            <CardHeader>
              <CardTitle>🔍 Diagnóstico do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span>Database Connection:</span>
                    {systemDiagnosis.connection ? (
                      <Badge variant="outline" className="text-green-600">
                        ✅ OK
                      </Badge>
                    ) : (
                      <Badge variant="destructive">❌ Error</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Profiles Table:</span>
                    {systemDiagnosis.profiles ? (
                      <Badge variant="outline" className="text-green-600">
                        ✅ OK
                      </Badge>
                    ) : (
                      <Badge variant="destructive">❌ Error</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Hotels Table:</span>
                    {systemDiagnosis.hotels ? (
                      <Badge variant="outline" className="text-green-600">
                        ✅ OK
                      </Badge>
                    ) : (
                      <Badge variant="destructive">❌ Error</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Auth System:</span>
                    {systemDiagnosis.authSystem ? (
                      <Badge variant="outline" className="text-green-600">
                        ✅ OK
                      </Badge>
                    ) : (
                      <Badge variant="destructive">❌ Error</Badge>
                    )}
                  </div>
                </div>

                {systemDiagnosis.testUsers && systemDiagnosis.testUsers.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Usuários de Teste Encontrados:</h4>
                    <div className="space-y-1">
                      {systemDiagnosis.testUsers.map((user: any, index: number) => (
                        <div key={index} className="text-sm">
                          ✅ {user.email} ({user.role}) - ID: {user.id}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {systemDiagnosis.details && (
                  <div>
                    <h4 className="font-semibold mb-2">Detalhes da Configuração:</h4>
                    <div className="space-y-1 text-sm">
                      <div>Supabase URL: {systemDiagnosis.details.supabaseUrl}</div>
                      <div>Supabase Anon Key: {systemDiagnosis.details.supabaseAnonKey}</div>
                      <div>Usuários de Teste: {systemDiagnosis.details.testUsersFound}</div>
                    </div>
                  </div>
                )}

                {systemDiagnosis.errors && systemDiagnosis.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600">Erros Detalhados:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {systemDiagnosis.errors.map((error: string, index: number) => (
                        <li key={index} className="text-red-600">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>📚 Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>1. 🧪 Execute "Testar Credenciais" para verificar se os usuários existem</div>
              <div>2. 🔍 Execute "Diagnóstico do Sistema" para verificar a configuração</div>
              <div>3. 📊 Analise os detalhes da autenticação para identificar o problema específico</div>
              <div>4. 🔧 Se necessário, execute os scripts de correção baseados nos erros encontrados</div>
              <div>5. 🔑 Verifique se as senhas dos usuários estão corretas no sistema de auth</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
