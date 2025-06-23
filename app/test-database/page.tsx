"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, ArrowLeft, Database } from "lucide-react"
import { createClient } from "@/lib/supabase/client-bulletproof"
import Link from "next/link"

interface TestResult {
  name: string
  status: "running" | "success" | "error"
  message: string
  data?: any
}

export default function TestDatabasePage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDatabaseTests = async () => {
    setIsRunning(true)
    const supabase = createClient()

    const testResults: TestResult[] = [
      { name: "Database Connection", status: "running", message: "Testing connection..." },
      { name: "Hotels Table", status: "running", message: "Checking hotels table..." },
      { name: "Profiles Table", status: "running", message: "Checking profiles table..." },
      { name: "Test Data", status: "running", message: "Verifying test data..." },
    ]

    setTests([...testResults])

    // Test 1: Database Connection
    try {
      const { data, error } = await supabase.from("profiles").select("count").single()
      if (error) throw error
      updateTest("Database Connection", "success", "Connection successful")
    } catch (error: any) {
      updateTest("Database Connection", "error", `Connection failed: ${error.message}`)
    }

    // Test 2: Hotels Table
    try {
      const { data, error } = await supabase.from("hotels").select("*").limit(5)
      if (error) throw error
      updateTest("Hotels Table", "success", `Found ${data.length} hotels`, data)
    } catch (error: any) {
      updateTest("Hotels Table", "error", `Hotels table error: ${error.message}`)
    }

    // Test 3: Profiles Table
    try {
      const { data, error } = await supabase.from("profiles").select("*").limit(5)
      if (error) throw error
      updateTest("Profiles Table", "success", `Found ${data.length} profiles`, data)
    } catch (error: any) {
      updateTest("Profiles Table", "error", `Profiles table error: ${error.message}`)
    }

    // Test 4: Test Data
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          email,
          full_name,
          role,
          hotels (name)
        `)
        .in("email", ["admin@baitahotel.com", "hotel@exemplo.com"])

      if (error) throw error
      updateTest("Test Data", "success", `Found ${data.length} test users`, data)
    } catch (error: any) {
      updateTest("Test Data", "error", `Test data error: ${error.message}`)
    }

    setIsRunning(false)
  }

  const updateTest = (name: string, status: "success" | "error", message: string, data?: any) => {
    setTests((prev) => prev.map((test) => (test.name === name ? { ...test, status, message, data } : test)))
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">SUCCESS</Badge>
      case "error":
        return <Badge variant="destructive">ERROR</Badge>
      case "running":
        return <Badge variant="secondary">RUNNING</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/landing">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Teste de Database</h1>
            <p className="text-gray-600">Verificação da estrutura e dados do banco</p>
          </div>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Testes de Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={runDatabaseTests} disabled={isRunning} className="mb-4">
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executando Testes...
                </>
              ) : (
                "Executar Testes de Database"
              )}
            </Button>

            {tests.length > 0 && (
              <div className="space-y-3">
                {tests.map((test, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      {getStatusBadge(test.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{test.message}</p>
                    {test.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          Ver dados (clique para expandir)
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sistema de Saúde</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/system-health">Verificar Sistema</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Testes de Login</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/test-login">Testar Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
