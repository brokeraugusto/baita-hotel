import { Building2, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-baita-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-baita-400" />
              <span className="text-2xl font-display font-bold">BaitaHotel</span>
            </div>
            <p className="text-baita-300 mb-6 max-w-md">
              A plataforma completa para gestão hoteleira que automatiza operações e maximiza receitas.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-baita-300">
                <Mail className="h-4 w-4 mr-2" />
                contato@baitahotel.com
              </div>
              <div className="flex items-center text-baita-300">
                <Phone className="h-4 w-4 mr-2" />
                (11) 9999-9999
              </div>
              <div className="flex items-center text-baita-300">
                <MapPin className="h-4 w-4 mr-2" />
                São Paulo, SP
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-4">Produto</h3>
            <ul className="space-y-2 text-baita-300">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Integrações
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Suporte</h3>
            <ul className="space-y-2 text-baita-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Status do Sistema
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-baita-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-baita-400 text-sm">© 2024 BaitaHotel. Todos os direitos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-baita-400 hover:text-white text-sm transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-baita-400 hover:text-white text-sm transition-colors">
              Termos
            </a>
            <a href="#" className="text-baita-400 hover:text-white text-sm transition-colors">
              LGPD
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
