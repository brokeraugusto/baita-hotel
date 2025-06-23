"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para a landing page após o componente montar
    router.push("/landing")
  }, [router])

  // Renderiza uma tela de loading enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">BaitaHotel</h2>
        <p className="text-gray-500">Redirecionando...</p>
      </div>
    </div>
  )
}
