"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Building2, RefreshCw, AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <Building2 className="h-16 w-16 text-red-600" />
            <AlertTriangle className="h-6 w-6 text-red-500 absolute -top-1 -right-1" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-red-900">Ops! Algo deu errado</h1>
          <p className="text-red-700">
            Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
          </p>
          {error.digest && (
            <p className="text-sm text-red-600 font-mono bg-red-100 p-2 rounded">ID do erro: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
          <Button onClick={() => (window.location.href = "/landing")}>
            <Building2 className="mr-2 h-4 w-4" />
            Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  )
}
