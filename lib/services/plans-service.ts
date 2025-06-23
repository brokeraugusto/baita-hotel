import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface SubscriptionPlan {
  id: string
  name: string
  slug?: string
  description?: string
  price_monthly: number
  price_yearly?: number
  features?: string[]
  limits?: Record<string, any>
  is_active: boolean
  is_featured?: boolean
  sort_order?: number
  max_hotels?: number
  max_rooms?: number
  max_users?: number
  max_integrations?: number
  created_at?: string
  updated_at?: string
}

export const plansService = {
  async getAll(): Promise<SubscriptionPlan[]> {
    try {
      console.log("🔍 Iniciando busca de planos...")
      console.log("🔗 URL Supabase:", process.env.NEXT_PUBLIC_SUPABASE_URL)

      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order", { ascending: true })

      if (error) {
        console.error("❌ Erro detalhado ao buscar planos:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw error
      }

      console.log("✅ Planos encontrados:", data?.length || 0)
      console.log("📊 Dados dos planos:", data)
      return data || []
    } catch (error) {
      console.error("❌ Erro no serviço de planos:", error)

      // Dados de fallback para desenvolvimento
      const fallbackPlans: SubscriptionPlan[] = [
        {
          id: "fallback-1",
          name: "Básico",
          slug: "basico",
          description: "Ideal para hotéis pequenos com até 20 quartos",
          price_monthly: 99,
          price_yearly: 990,
          features: ["Gestão de reservas", "Check-in/Check-out", "Relatórios básicos", "Suporte por email"],
          limits: { rooms: 20, users: 3, integrations: 1 },
          is_active: true,
          is_featured: false,
          sort_order: 1,
          max_hotels: 1,
          max_rooms: 20,
          max_users: 3,
          max_integrations: 1,
        },
        {
          id: "fallback-2",
          name: "Profissional",
          slug: "profissional",
          description: "Para hotéis em crescimento com até 100 quartos",
          price_monthly: 199,
          price_yearly: 1990,
          features: [
            "Todas as funcionalidades do Básico",
            "Gestão financeira",
            "Manutenção",
            "Limpeza",
            "Relatórios avançados",
            "Integrações",
            "Suporte prioritário",
          ],
          limits: { rooms: 100, users: 10, integrations: 5 },
          is_active: true,
          is_featured: true,
          sort_order: 2,
          max_hotels: 1,
          max_rooms: 100,
          max_users: 10,
          max_integrations: 5,
        },
        {
          id: "fallback-3",
          name: "Enterprise",
          slug: "enterprise",
          description: "Para grandes redes hoteleiras sem limites",
          price_monthly: 399,
          price_yearly: 3990,
          features: [
            "Todas as funcionalidades",
            "Multi-propriedades",
            "API completa",
            "Customizações",
            "Suporte 24/7",
            "Treinamento",
          ],
          limits: { rooms: -1, users: -1, integrations: -1 },
          is_active: true,
          is_featured: false,
          sort_order: 3,
          max_hotels: -1,
          max_rooms: -1,
          max_users: -1,
          max_integrations: -1,
        },
      ]

      console.log("⚠️ Usando dados de fallback")
      return fallbackPlans
    }
  },

  async getById(id: string): Promise<SubscriptionPlan | null> {
    try {
      console.log(`🔍 Buscando plano ${id}...`)

      const { data, error } = await supabase.from("subscription_plans").select("*").eq("id", id).single()

      if (error) {
        console.error(`❌ Erro ao buscar plano ${id}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw error
      }

      console.log("✅ Plano encontrado:", data?.name)
      return data
    } catch (error) {
      console.error(`❌ Erro no serviço ao buscar plano ${id}:`, error)
      return null
    }
  },

  async create(plan: Omit<SubscriptionPlan, "id" | "created_at" | "updated_at">): Promise<SubscriptionPlan | null> {
    try {
      console.log("🔄 Iniciando criação de plano...")
      console.log("📝 Dados recebidos:", plan)

      // Validações básicas
      if (!plan.name || plan.name.trim().length === 0) {
        throw new Error("Nome do plano é obrigatório")
      }

      if (!plan.price_monthly || plan.price_monthly <= 0) {
        throw new Error("Preço mensal deve ser maior que zero")
      }

      // Gerar slug se não fornecido
      const slug =
        plan.slug ||
        plan.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove acentos
          .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
          .replace(/\s+/g, "-") // Substitui espaços por hífens
          .replace(/-+/g, "-") // Remove hífens duplicados
          .trim()

      // Preparar dados para inserção
      const planData = {
        name: plan.name.trim(),
        slug,
        description: plan.description?.trim() || null,
        price_monthly: Number(plan.price_monthly),
        price_yearly: plan.price_yearly ? Number(plan.price_yearly) : null,
        features: plan.features || [],
        limits: plan.limits || {},
        max_hotels: plan.max_hotels || 1,
        max_rooms: plan.max_rooms || 50,
        max_users: plan.max_users || 5,
        max_integrations: plan.max_integrations || 3,
        is_active: plan.is_active !== undefined ? plan.is_active : true,
        is_featured: plan.is_featured !== undefined ? plan.is_featured : false,
        sort_order: plan.sort_order || 0,
      }

      console.log("📝 Dados preparados para inserção:", planData)

      // Verificar se o cliente Supabase está configurado
      if (!supabase) {
        throw new Error("Cliente Supabase não configurado")
      }

      // Tentar inserir no banco
      const { data, error } = await supabase.from("subscription_plans").insert(planData).select().single()

      if (error) {
        console.error("❌ Erro detalhado ao inserir plano:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          planData,
        })

        // Tratamento específico para erros comuns
        if (error.code === "23505") {
          // Unique constraint violation
          if (error.message.includes("name")) {
            throw new Error("Já existe um plano com este nome")
          }
          if (error.message.includes("slug")) {
            throw new Error("Já existe um plano com este identificador")
          }
          throw new Error("Já existe um plano com estes dados")
        }

        if (error.code === "42P01") {
          throw new Error("Tabela 'subscription_plans' não encontrada. Execute os scripts de criação do banco.")
        }

        if (error.code === "42703") {
          throw new Error("Estrutura da tabela incorreta. Verifique se todas as colunas existem.")
        }

        throw new Error(`Erro do banco de dados: ${error.message}`)
      }

      if (!data) {
        throw new Error("Nenhum dado retornado após inserção")
      }

      console.log("✅ Plano criado com sucesso:", data.name)
      console.log("📊 Dados do plano criado:", data)
      return data
    } catch (error) {
      console.error("❌ Erro completo no serviço ao criar plano:", error)

      // Re-throw com mensagem mais específica
      if (error instanceof Error) {
        throw error
      }

      throw new Error("Erro interno desconhecido ao criar plano")
    }
  },

  async update(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    try {
      console.log(`🔄 Atualizando plano ${id}...`)
      console.log("📝 Atualizações:", updates)

      // Gerar slug se o nome foi alterado
      if (updates.name && !updates.slug) {
        updates.slug = updates.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim()
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("subscription_plans")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error(`❌ Erro detalhado ao atualizar plano ${id}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw new Error(`Erro ao atualizar plano: ${error.message}`)
      }

      console.log("✅ Plano atualizado com sucesso:", data?.name)
      return data
    } catch (error) {
      console.error(`❌ Erro no serviço ao atualizar plano ${id}:`, error)

      if (error instanceof Error) {
        throw error
      }

      throw new Error("Erro interno ao atualizar plano")
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      console.log(`🗑️ Excluindo plano ${id}...`)

      const { error } = await supabase.from("subscription_plans").delete().eq("id", id)

      if (error) {
        console.error(`❌ Erro detalhado ao excluir plano ${id}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw new Error(`Erro ao excluir plano: ${error.message}`)
      }

      console.log("✅ Plano excluído com sucesso")
      return true
    } catch (error) {
      console.error(`❌ Erro no serviço ao excluir plano ${id}:`, error)

      if (error instanceof Error) {
        throw error
      }

      return false
    }
  },

  async toggleActive(id: string): Promise<boolean> {
    try {
      console.log(`🔄 Alternando status do plano ${id}...`)

      // Primeiro, buscar o plano para saber o status atual
      const { data: plan, error: fetchError } = await supabase
        .from("subscription_plans")
        .select("is_active, name")
        .eq("id", id)
        .single()

      if (fetchError) {
        console.error("❌ Erro ao buscar plano:", {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code,
        })
        throw new Error(`Erro ao buscar plano: ${fetchError.message}`)
      }

      if (!plan) {
        throw new Error("Plano não encontrado")
      }

      // Inverter o status
      const { error: updateError } = await supabase
        .from("subscription_plans")
        .update({
          is_active: !plan.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (updateError) {
        console.error("❌ Erro ao atualizar status:", {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code,
        })
        throw new Error(`Erro ao atualizar status: ${updateError.message}`)
      }

      console.log(`✅ Status do plano ${plan.name} alterado para ${!plan.is_active ? "ativo" : "inativo"}`)
      return true
    } catch (error) {
      console.error(`❌ Erro no serviço ao alternar status do plano ${id}:`, error)

      if (error instanceof Error) {
        throw error
      }

      return false
    }
  },

  // Método para validar se as tabelas existem
  async checkTablesExist(): Promise<boolean> {
    try {
      console.log("🔍 Verificando se as tabelas existem...")

      const { data, error } = await supabase.from("subscription_plans").select("id").limit(1)

      if (error) {
        console.error("❌ Erro ao verificar tabelas:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        return false
      }

      console.log("✅ Tabelas existem e são acessíveis")
      return true
    } catch (error) {
      console.error("❌ Tabelas não existem ou não são acessíveis:", error)
      return false
    }
  },

  // Método para testar a conexão
  async testConnection(): Promise<boolean> {
    try {
      console.log("🔍 Testando conexão com Supabase...")

      const { data, error } = await supabase.from("subscription_plans").select("count", { count: "exact", head: true })

      if (error) {
        console.error("❌ Erro na conexão:", error)
        return false
      }

      console.log("✅ Conexão com Supabase funcionando")
      return true
    } catch (error) {
      console.error("❌ Falha na conexão:", error)
      return false
    }
  },
}
