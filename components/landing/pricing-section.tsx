import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star } from "lucide-react"

const plans = [
  {
    name: "Básico",
    price: "89",
    description: "Ideal para pousadas e hotéis pequenos",
    features: ["Até 20 quartos", "1 usuário", "Reservas básicas", "Relatórios essenciais", "Suporte por email"],
    popular: false,
  },
  {
    name: "Pro",
    price: "189",
    description: "Perfeito para hotéis em crescimento",
    features: [
      "Até 100 quartos",
      "5 usuários",
      "Todas as funcionalidades",
      "Integrações com OTAs",
      "Suporte prioritário",
      "Motor de precificação",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "389",
    description: "Para hotéis e resorts de grande porte",
    features: [
      "Quartos ilimitados",
      "Usuários ilimitados",
      "Funcionalidades avançadas",
      "Integrações ilimitadas",
      "Suporte 24/7",
      "Relatórios personalizados",
      "API completa",
    ],
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 baita-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-baita-900 mb-4">
            Planos que crescem com seu negócio
          </h2>
          <p className="text-xl text-baita-700 max-w-3xl mx-auto">
            Comece com 7 dias grátis. Sem compromisso, sem cartão de crédito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 card-hover ${
                plan.popular ? "border-baita-500 bg-white shadow-baita-lg" : "border-baita-200 bg-white/80"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-baita-600 to-ocean-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-baita-900 mb-2">{plan.name}</h3>
                <p className="text-baita-700 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-baita-900">R$ {plan.price}</span>
                  <span className="text-baita-700 ml-2">/mês</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-500 mr-3 flex-shrink-0" />
                    <span className="text-baita-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/cadastro" className="block">
                <Button
                  className={`w-full py-3 ${
                    plan.popular
                      ? "bg-baita-600 hover:bg-baita-700 text-white"
                      : "bg-baita-100 hover:bg-baita-200 text-baita-900"
                  }`}
                >
                  Começar Teste Grátis
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-baita-700 mb-4">Precisa de algo personalizado? Entre em contato conosco.</p>
          <Button variant="outline" className="border-baita-300 text-baita-700 hover:bg-baita-50">
            Falar com Especialista
          </Button>
        </div>
      </div>
    </section>
  )
}
