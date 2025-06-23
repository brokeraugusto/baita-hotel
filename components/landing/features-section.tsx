import { Calendar, Building2, DollarSign, BarChart3, Wrench, Sparkles, Users, Shield } from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "Gestão de Reservas",
    description: "Calendário intuitivo, motor de reservas online e sincronização com OTAs principais.",
  },
  {
    icon: Building2,
    title: "Controle de Acomodações",
    description: "Gerencie quartos, suítes e chalés com sistema avançado de precificação dinâmica.",
  },
  {
    icon: DollarSign,
    title: "Financeiro Completo",
    description: "Controle de receitas, despesas, fluxo de caixa e relatórios financeiros detalhados.",
  },
  {
    icon: Wrench,
    title: "Manutenção",
    description: "Ordens de serviço, controle de equipamentos e manutenção preventiva.",
  },
  {
    icon: Sparkles,
    title: "Governança",
    description: "Gestão de limpeza com checklists digitais e controle de status dos quartos.",
  },
  {
    icon: Users,
    title: "CRM de Hóspedes",
    description: "Histórico completo, preferências e programa de fidelidade integrado.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Avançados",
    description: "Dashboards em tempo real com KPIs essenciais para tomada de decisão.",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Dados protegidos com criptografia e conformidade com LGPD.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-baita-900 mb-4">
            Tudo que seu hotel precisa em uma plataforma
          </h2>
          <p className="text-xl text-baita-700 max-w-3xl mx-auto">
            Módulos integrados que trabalham juntos para automatizar suas operações e maximizar sua receita.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-baita-200 hover:shadow-baita-lg transition-all duration-300 card-hover bg-white"
            >
              <div className="w-12 h-12 bg-baita-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-baita-600" />
              </div>
              <h3 className="text-lg font-semibold text-baita-900 mb-2">{feature.title}</h3>
              <p className="text-baita-700 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
