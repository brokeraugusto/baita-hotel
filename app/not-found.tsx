import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-baita-50 to-ocean-50 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <Building2 className="h-16 w-16 text-baita-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-baita-900">404</h1>
          <h2 className="text-2xl font-semibold text-baita-800">Página não encontrada</h2>
          <p className="text-baita-600">A página que você está procurando não existe ou foi movida.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/landing">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <Link href="/landing">
            <Button className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Página Inicial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
