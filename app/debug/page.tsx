"use client"

export default function DebugPage() {
  const testBasicConnection = async () => {
    try {
      console.log("🔄 Testando conexão básica...")

      // Teste direto com fetch
      const response = await fetch("https://bbqjnepppoqlkodrgmpb.supabase.co/rest/v1/", {
        headers: {
          apikey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicWpuZXBwcG9xbGtvZHJnbXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NjIxNzgsImV4cCI6MjA2NTQzODE3OH0.zh3MRrc2FBA_hEFXoTcO-UUd5oj6YZa1WzEDkxfoz-I",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicWpuZXBwcG9xbGtvZHJnbXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NjIxNzgsImV4cCI6MjA2NTQzODE3OH0.zh3MRrc2FBA_hEFXoTcO-UUd5oj6YZa1WzEDkxfoz-I",
        },
      })

      console.log("Status:", response.status)
      console.log("Response:", await response.text())
    } catch (error) {
      console.error("Erro:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Debug Supabase</h1>

          <div className="space-y-4">
            <button
              onClick={testBasicConnection}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Teste Básico (Fetch)
            </button>

            <div className="text-sm text-gray-600">
              <p>
                <strong>URL:</strong> https://bbqjnepppoqlkodrgmpb.supabase.co
              </p>
              <p>
                <strong>Key:</strong> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
