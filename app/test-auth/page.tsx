"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAuthPage() {
  const [email, setEmail] = useState("admin@baitahotel.com")
  const [password, setPassword] = useState("123456")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  const testConnection = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log("🔄 Testando conexão com Supabase...")

      // Teste 1: Verificar conexão básica
      const { data: testData, error: testError } = await supabase.from("profiles").select("count").limit(1)

      console.log("Teste conexão:", { testData, testError })

      setResult({
        type: "connection",
        success: !testError,
        data: testData,
        error: testError?.message,
      })
    } catch (error: any) {
      console.error("Erro no teste:", error)
      setResult({
        type: "connection",
        success: false,
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log("🔄 Testando login...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Resultado login:", { data, error })

      if (data.user) {
        setUser(data.user)

        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        console.log("Perfil:", { profile, profileError })

        setResult({
          type: "login",
          success: true,
          user: data.user,
          profile,
          profileError: profileError?.message,
        })
      } else {
        setResult({
          type: "login",
          success: false,
          error: error?.message || "Login falhou",
        })
      }
    } catch (error: any) {
      console.error("Erro no login:", error)
      setResult({
        type: "login",
        success: false,
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const testLogout = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signOut()
      console.log("Logout:", { error })

      setUser(null)
      setResult({
        type: "logout",
        success: !error,
        error: error?.message,
      })
    } catch (error: any) {
      console.error("Erro no logout:", error)
      setResult({
        type: "logout",
        success: false,
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentUser = async () => {
    setLoading(true)

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      console.log("Usuário atual:", { user, error })

      setUser(user)
      setResult({
        type: "current_user",
        success: !error,
        user,
        error: error?.message,
      })
    } catch (error: any) {
      console.error("Erro ao buscar usuário:", error)
      setResult({
        type: "current_user",
        success: false,
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Teste de Autenticação Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status do usuário */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Status Atual:</h3>
              <p className="text-sm">
                {user ? (
                  <span className="text-green-600">✅ Logado como: {user.email}</span>
                ) : (
                  <span className="text-gray-600">❌ Não logado</span>
                )}
              </p>
            </div>

            {/* Teste de Conexão */}
            <div className="space-y-2">
              <Button onClick={testConnection} disabled={loading} className="w-full" variant="outline">
                {loading ? "Testando..." : "1. Testar Conexão"}
              </Button>
            </div>

            {/* Campos de Login */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email:</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@baitahotel.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha:</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456"
                />
              </div>
            </div>

            {/* Botões de Teste */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={testLogin} disabled={loading} className="w-full">
                {loading ? "Testando..." : "2. Testar Login"}
              </Button>

              <Button onClick={getCurrentUser} disabled={loading} variant="outline" className="w-full">
                {loading ? "Testando..." : "3. Usuário Atual"}
              </Button>

              <Button onClick={testLogout} disabled={loading} variant="destructive" className="w-full">
                {loading ? "Testando..." : "4. Logout"}
              </Button>
            </div>

            {/* Resultado */}
            {result && (
              <div
                className={`p-4 rounded-lg ${
                  result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <h3 className="font-semibold mb-2">
                  {result.success ? "✅ Sucesso" : "❌ Erro"} - {result.type}
                </h3>
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-64">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            {/* Informações de Debug */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}
              </p>
              <p>
                <strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50)}...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
