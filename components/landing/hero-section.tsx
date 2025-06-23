import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 baita-gradient relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-baita-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-ocean-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-baita-100 text-baita-800 text-sm font-medium mb-8">
            <Star className="h-4 w-4 mr-2 text-gold-500" />
            Teste grátis por 7 dias - Sem cartão de crédito
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl font-display font-bold text-baita-900 mb-6 leading-tight">
            Transforme a gestão do seu{" "}
            <span className="bg-gradient-to-r from-baita-600 to-ocean-600 bg-clip-text text-transparent">hotel</span>
          </h1>

          <p className="text-xl text-baita-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            O BaitaHotel é a plataforma completa para hotéis e pousadas que querem automatizar operações, aumentar a
            receita e oferecer uma experiência excepcional aos hóspedes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/cadastro">
              <Button size="lg" className="bg-baita-600 hover:bg-baita-700 text-white px-8 py-4 text-lg font-medium">
                Começar Teste Grátis
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-baita-300 text-baita-700 hover:bg-baita-50 px-8 py-4 text-lg"
            >
              Ver Demonstração
            </Button>
          </div>

          {/* Features list */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-baita-700">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
              Configuração em 5 minutos
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
              Suporte 24/7 em português
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
              Dados seguros e protegidos
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-baita-900">500+</div>
              <div className="text-baita-700">Hotéis ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-baita-900">50k+</div>
              <div className="text-baita-700">Reservas processadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-baita-900">4.9/5</div>
              <div className="text-baita-700">Avaliação dos clientes</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
