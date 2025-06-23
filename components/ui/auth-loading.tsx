import { Loader2 } from "lucide-react"

export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Carregando...</h2>
        <p className="text-sm text-gray-600">Inicializando sistema de autenticação</p>
      </div>
    </div>
  )
}
