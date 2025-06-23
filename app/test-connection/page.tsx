"use client"

import { useState } from "react"

export default function TestConnectionPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Importação dinâmica para evitar problemas de SSR
      const { testConnection } = await import("@/lib/supabase/client-fixed")
      const testResult = await testConnection()
      setResult(testResult)
    } catch (error) {
      console.error("Erro ao importar ou executar teste:", error)
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Teste de Conexão Supabase</h1>

          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testando..." : "Testar Conexão"}
          </button>

          {result && (
            <div className="mt-6 p-4 rounded-lg bg-gray-100">
              <h3 className="font-semibold mb-2">{result.success ? "✅ Sucesso" : "❌ Erro"}</h3>
              <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
