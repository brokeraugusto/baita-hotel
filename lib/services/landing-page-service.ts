import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface LandingPageSetting {
  id?: string
  section: string
  key: string
  value: string
  value_type: "text" | "textarea" | "image" | "number" | "email" | "url"
  label?: string
  description?: string
  created_at?: string
  updated_at?: string
}

// Dados iniciais para demonstração
const defaultSettings: Record<string, Record<string, LandingPageSetting>> = {
  hero: {
    title: {
      section: "hero",
      key: "title",
      value: "Transforme a gestão do seu hotel",
      value_type: "text",
      label: "Título Principal",
      description: "Título principal exibido na seção hero",
    },
    subtitle: {
      section: "hero",
      key: "subtitle",
      value:
        "O BaitaHotel é a plataforma completa para hotéis e pousadas que querem automatizar operações, aumentar a receita e oferecer uma experiência excepcional aos hóspedes.",
      value_type: "textarea",
      label: "Subtítulo",
      description: "Texto descritivo exibido abaixo do título principal",
    },
    cta_primary: {
      section: "hero",
      key: "cta_primary",
      value: "Começar Teste Grátis",
      value_type: "text",
      label: "Texto do Botão Principal",
      description: "Texto do botão de call-to-action principal",
    },
    cta_secondary: {
      section: "hero",
      key: "cta_secondary",
      value: "Ver Demonstração",
      value_type: "text",
      label: "Texto do Botão Secundário",
      description: "Texto do botão de call-to-action secundário",
    },
    background_image: {
      section: "hero",
      key: "background_image",
      value: "/images/hero-bg.jpg",
      value_type: "image",
      label: "Imagem de Fundo",
      description: "Imagem de fundo da seção hero (opcional)",
    },
  },
  stats: {
    hotels_count: {
      section: "stats",
      key: "hotels_count",
      value: "500+",
      value_type: "text",
      label: "Número de Hotéis",
      description: "Quantidade de hotéis ativos na plataforma",
    },
    reservations_count: {
      section: "stats",
      key: "reservations_count",
      value: "50k+",
      value_type: "text",
      label: "Número de Reservas",
      description: "Quantidade de reservas processadas",
    },
    rating: {
      section: "stats",
      key: "rating",
      value: "4.9/5",
      value_type: "text",
      label: "Avaliação",
      description: "Avaliação média dos clientes",
    },
  },
  features: {
    section_title: {
      section: "features",
      key: "section_title",
      value: "Tudo que seu hotel precisa em uma plataforma",
      value_type: "text",
      label: "Título da Seção",
      description: "Título principal da seção de funcionalidades",
    },
    section_description: {
      section: "features",
      key: "section_description",
      value: "Módulos integrados que trabalham juntos para automatizar suas operações e maximizar sua receita.",
      value_type: "textarea",
      label: "Descrição da Seção",
      description: "Texto descritivo da seção de funcionalidades",
    },
  },
  pricing: {
    section_title: {
      section: "pricing",
      key: "section_title",
      value: "Planos que crescem com seu negócio",
      value_type: "text",
      label: "Título da Seção",
      description: "Título principal da seção de preços",
    },
    section_description: {
      section: "pricing",
      key: "section_description",
      value: "Comece com 7 dias grátis. Sem compromisso, sem cartão de crédito.",
      value_type: "textarea",
      label: "Descrição da Seção",
      description: "Texto descritivo da seção de preços",
    },
    basic_plan_name: {
      section: "pricing",
      key: "basic_plan_name",
      value: "Básico",
      value_type: "text",
      label: "Nome do Plano Básico",
      description: "Nome do plano básico",
    },
    basic_plan_price: {
      section: "pricing",
      key: "basic_plan_price",
      value: "89",
      value_type: "text",
      label: "Preço do Plano Básico",
      description: "Preço mensal do plano básico",
    },
    pro_plan_name: {
      section: "pricing",
      key: "pro_plan_name",
      value: "Pro",
      value_type: "text",
      label: "Nome do Plano Pro",
      description: "Nome do plano profissional",
    },
    pro_plan_price: {
      section: "pricing",
      key: "pro_plan_price",
      value: "189",
      value_type: "text",
      label: "Preço do Plano Pro",
      description: "Preço mensal do plano profissional",
    },
    premium_plan_name: {
      section: "pricing",
      key: "premium_plan_name",
      value: "Premium",
      value_type: "text",
      label: "Nome do Plano Premium",
      description: "Nome do plano premium",
    },
    premium_plan_price: {
      section: "pricing",
      key: "premium_plan_price",
      value: "389",
      value_type: "text",
      label: "Preço do Plano Premium",
      description: "Preço mensal do plano premium",
    },
  },
  testimonials: {
    section_title: {
      section: "testimonials",
      key: "section_title",
      value: "Mais de 500 hotéis confiam no BaitaHotel",
      value_type: "text",
      label: "Título da Seção",
      description: "Título principal da seção de depoimentos",
    },
    section_description: {
      section: "testimonials",
      key: "section_description",
      value: "Veja o que nossos clientes estão dizendo sobre a transformação em seus negócios.",
      value_type: "textarea",
      label: "Descrição da Seção",
      description: "Texto descritivo da seção de depoimentos",
    },
  },
  company: {
    name: {
      section: "company",
      key: "name",
      value: "BaitaHotel Tecnologia Ltda",
      value_type: "text",
      label: "Nome da Empresa",
      description: "Nome completo da empresa",
    },
    address: {
      section: "company",
      key: "address",
      value: "Av. Paulista, 1000 - São Paulo, SP",
      value_type: "text",
      label: "Endereço",
      description: "Endereço completo da empresa",
    },
    email: {
      section: "company",
      key: "email",
      value: "contato@baitahotel.com",
      value_type: "email",
      label: "Email de Contato",
      description: "Email principal de contato",
    },
    phone: {
      section: "company",
      key: "phone",
      value: "(11) 3000-1000",
      value_type: "text",
      label: "Telefone",
      description: "Telefone principal de contato",
    },
  },
  cta: {
    title: {
      section: "cta",
      key: "title",
      value: "Pronto para transformar seu hotel?",
      value_type: "text",
      label: "Título do CTA",
      description: "Título da seção final de call-to-action",
    },
    description: {
      section: "cta",
      key: "description",
      value:
        "Junte-se a centenas de hotéis que já automatizaram suas operações e aumentaram sua receita com o BaitaHotel.",
      value_type: "textarea",
      label: "Descrição do CTA",
      description: "Texto descritivo da seção final de call-to-action",
    },
    button_text: {
      section: "cta",
      key: "button_text",
      value: "Começar Teste Grátis",
      value_type: "text",
      label: "Texto do Botão",
      description: "Texto do botão de call-to-action",
    },
    secondary_button_text: {
      section: "cta",
      key: "secondary_button_text",
      value: "Agendar Demonstração",
      value_type: "text",
      label: "Texto do Botão Secundário",
      description: "Texto do botão secundário de call-to-action",
    },
  },
}

// Verificar se a tabela existe e criar se necessário
async function ensureLandingPageSettingsTable() {
  try {
    const { error } = await supabase.from("landing_page_settings").select("id").limit(1)

    if (error && error.code === "42P01") {
      // Tabela não existe, criar
      console.log("Tabela landing_page_settings não existe, criando...")
      // Em um ambiente real, isso seria feito via migração ou script SQL
    }
  } catch (error) {
    console.error("Erro ao verificar tabela:", error)
  }
}

// Inicializar dados padrão
async function initializeDefaultSettings() {
  try {
    const { data: existingSettings, error } = await supabase.from("landing_page_settings").select("id").limit(1)

    if (!error && (!existingSettings || existingSettings.length === 0)) {
      console.log("Inicializando configurações padrão da landing page...")
      // Em um ambiente real, isso seria feito via migração ou script SQL
    }
  } catch (error) {
    console.error("Erro ao inicializar configurações:", error)
  }
}

export const landingPageService = {
  async getLandingPageSettings(): Promise<Record<string, Record<string, LandingPageSetting>>> {
    try {
      // Em um ambiente real, buscaríamos do Supabase
      // const { data, error } = await supabase.from("landing_page_settings").select("*")
      // if (error) throw error

      // Agrupar por seção e chave
      // const groupedSettings: Record<string, Record<string, LandingPageSetting>> = {}
      // data.forEach(setting => {
      //   if (!groupedSettings[setting.section]) {
      //     groupedSettings[setting.section] = {}
      //   }
      //   groupedSettings[setting.section][setting.key] = setting
      // })
      // return groupedSettings

      // Por enquanto, retornamos os dados mockados
      return defaultSettings
    } catch (error) {
      console.error("Erro ao buscar configurações da landing page:", error)
      return defaultSettings
    }
  },

  async updateLandingPageSetting(section: string, key: string, value: string): Promise<boolean> {
    try {
      // Em um ambiente real, atualizaríamos no Supabase
      // const { error } = await supabase
      //   .from("landing_page_settings")
      //   .update({ value, updated_at: new Date().toISOString() })
      //   .eq("section", section)
      //   .eq("key", key)

      // if (error) throw error

      // Por enquanto, apenas atualizamos os dados mockados
      if (defaultSettings[section] && defaultSettings[section][key]) {
        defaultSettings[section][key].value = value
        defaultSettings[section][key].updated_at = new Date().toISOString()
      }

      return true
    } catch (error) {
      console.error(`Erro ao atualizar configuração ${section}.${key}:`, error)
      return false
    }
  },

  async createLandingPageSetting(
    setting: Omit<LandingPageSetting, "id" | "created_at" | "updated_at">,
  ): Promise<LandingPageSetting | null> {
    try {
      // Em um ambiente real, inseriríamos no Supabase
      // const { data, error } = await supabase
      //   .from("landing_page_settings")
      //   .insert({
      //     ...setting,
      //     created_at: new Date().toISOString(),
      //     updated_at: new Date().toISOString()
      //   })
      //   .select()
      //   .single()

      // if (error) throw error
      // return data

      // Por enquanto, apenas atualizamos os dados mockados
      if (!defaultSettings[setting.section]) {
        defaultSettings[setting.section] = {}
      }

      const newSetting: LandingPageSetting = {
        ...setting,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      defaultSettings[setting.section][setting.key] = newSetting
      return newSetting
    } catch (error) {
      console.error("Erro ao criar configuração:", error)
      return null
    }
  },

  async deleteLandingPageSetting(section: string, key: string): Promise<boolean> {
    try {
      // Em um ambiente real, excluiríamos do Supabase
      // const { error } = await supabase
      //   .from("landing_page_settings")
      //   .delete()
      //   .eq("section", section)
      //   .eq("key", key)

      // if (error) throw error

      // Por enquanto, apenas removemos dos dados mockados
      if (defaultSettings[section] && defaultSettings[section][key]) {
        delete defaultSettings[section][key]
      }

      return true
    } catch (error) {
      console.error(`Erro ao excluir configuração ${section}.${key}:`, error)
      return false
    }
  },

  // Inicializar o serviço
  async initialize() {
    await ensureLandingPageSettingsTable()
    await initializeDefaultSettings()
  },
}

// Inicializar o serviço quando importado
landingPageService.initialize().catch(console.error)
