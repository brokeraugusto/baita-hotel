import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Maria Silva",
    role: "Proprietária",
    hotel: "Pousada Vista Mar",
    content: "O BaitaHotel revolucionou nossa operação. Aumentamos nossa receita em 35% no primeiro ano.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "João Santos",
    role: "Gerente Geral",
    hotel: "Hotel Central",
    content: "A automação dos processos nos permitiu focar no que realmente importa: a experiência do hóspede.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Ana Costa",
    role: "Diretora",
    hotel: "Resort Paradise",
    content: "Relatórios em tempo real e integração com OTAs. Exatamente o que precisávamos para crescer.",
    rating: 5,
    avatar: "/placeholder.svg?height=60&width=60",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-baita-900 mb-4">
            Mais de 500 hotéis confiam no BaitaHotel
          </h2>
          <p className="text-xl text-baita-700 max-w-3xl mx-auto">
            Veja o que nossos clientes estão dizendo sobre a transformação em seus negócios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 rounded-xl border border-baita-200 bg-white card-hover">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold-500 fill-current" />
                ))}
              </div>

              <p className="text-baita-700 mb-6 leading-relaxed">"{testimonial.content}"</p>

              <div className="flex items-center">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-baita-900">{testimonial.name}</div>
                  <div className="text-sm text-baita-600">
                    {testimonial.role}, {testimonial.hotel}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
