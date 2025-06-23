import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-baita-600 to-ocean-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Pronto para transformar seu hotel?</h2>
        <p className="text-xl text-baita-100 mb-8 max-w-2xl mx-auto">
          Junte-se a centenas de hotéis que já automatizaram suas operações e aumentaram sua receita com o BaitaHotel.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/cadastro">
            <Button size="lg" className="bg-white text-baita-600 hover:bg-baita-50 px-8 py-4 text-lg font-medium">
              Começar Teste Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
            Agendar Demonstração
          </Button>
        </div>

        <p className="text-baita-200 text-sm mt-6">7 dias grátis • Sem cartão de crédito • Suporte em português</p>
      </div>
    </section>
  )
}
