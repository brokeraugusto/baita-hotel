"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { landingPageService, type LandingPageSetting } from "@/lib/services/landing-page-service"
import { Loader2, Edit } from "lucide-react"

interface LandingPagePreviewProps {
  onEdit: () => void
}

export function LandingPagePreview({ onEdit }: LandingPagePreviewProps) {
  const [settings, setSettings] = useState<Record<string, Record<string, LandingPageSetting>>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await landingPageService.getLandingPageSettings()
        setSettings(data)
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Helper para obter valor de configuração
  const getValue = (section: string, key: string) => {
    return settings[section]?.[key]?.value || ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview da Landing Page</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Preview do Hero */}
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{getValue("hero", "title")}</h1>
            <p className="text-xl">{getValue("hero", "subtitle")}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                {getValue("hero", "cta_primary")}
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {getValue("hero", "cta_secondary")}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview das Estatísticas */}
        <div className="grid grid-cols-1 gap-6 rounded-lg bg-gray-50 p-6 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{getValue("stats", "hotels_count")}</p>
            <p className="text-sm text-gray-600">Hotéis Ativos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{getValue("stats", "reservations_count")}</p>
            <p className="text-sm text-gray-600">Reservas Processadas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{getValue("stats", "rating")}</p>
            <p className="text-sm text-gray-600">Avaliação dos Clientes</p>
          </div>
        </div>

        {/* Preview das Funcionalidades */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">{getValue("features", "section_title")}</h2>
            <p className="mt-2 text-gray-600">{getValue("features", "section_description")}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {/* Exemplos de funcionalidades */}
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium">Reservas Simplificadas</h3>
              <p className="text-gray-600">Sistema intuitivo para gerenciar todas as suas reservas.</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium">Gestão de Quartos</h3>
              <p className="text-gray-600">Controle completo sobre a disponibilidade e status dos quartos.</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium">Relatórios Detalhados</h3>
              <p className="text-gray-600">Análises e insights para melhorar seu negócio.</p>
            </div>
          </div>
        </div>

        {/* Preview dos Preços */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">{getValue("pricing", "section_title")}</h2>
            <p className="mt-2 text-gray-600">{getValue("pricing", "section_description")}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg border p-6">
              <h3 className="text-xl font-medium">{getValue("pricing", "basic_plan_name")}</h3>
              <div className="my-4">
                <span className="text-3xl font-bold">R$ {getValue("pricing", "basic_plan_price")}</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <Button className="w-full">Começar Agora</Button>
            </div>
            <div className="rounded-lg border border-blue-500 p-6 shadow-md">
              <h3 className="text-xl font-medium">{getValue("pricing", "pro_plan_name")}</h3>
              <div className="my-4">
                <span className="text-3xl font-bold">R$ {getValue("pricing", "pro_plan_price")}</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <Button className="w-full">Começar Agora</Button>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="text-xl font-medium">{getValue("pricing", "premium_plan_name")}</h3>
              <div className="my-4">
                <span className="text-3xl font-bold">R$ {getValue("pricing", "premium_plan_price")}</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <Button className="w-full">Começar Agora</Button>
            </div>
          </div>
        </div>

        {/* Preview dos Depoimentos */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">{getValue("testimonials", "section_title")}</h2>
            <p className="mt-2 text-gray-600">{getValue("testimonials", "section_description")}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-lg border p-6">
              <p className="italic text-gray-600">
                "O BaitaHotel transformou completamente a gestão do nosso hotel. Economizamos tempo e aumentamos nossa
                receita em 30%."
              </p>
              <div className="mt-4">
                <p className="font-medium">Maria Silva</p>
                <p className="text-sm text-gray-600">Gerente, Hotel Estrela</p>
              </div>
            </div>
            <div className="rounded-lg border p-6">
              <p className="italic text-gray-600">
                "A facilidade de uso e o suporte excepcional fazem do BaitaHotel a melhor escolha para qualquer hotel."
              </p>
              <div className="mt-4">
                <p className="font-medium">João Santos</p>
                <p className="text-sm text-gray-600">Proprietário, Pousada Mar Azul</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview do CTA Final */}
        <div className="rounded-lg bg-blue-50 p-8 text-center">
          <h2 className="text-3xl font-bold">{getValue("cta", "title")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-600">{getValue("cta", "description")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button size="lg">{getValue("cta", "button_text")}</Button>
            <Button size="lg" variant="outline">
              {getValue("cta", "secondary_button_text")}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onEdit} className="ml-auto">
          <Edit className="mr-2 h-4 w-4" />
          Voltar ao Editor
        </Button>
      </CardFooter>
    </Card>
  )
}
