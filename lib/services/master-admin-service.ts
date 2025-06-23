import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

// Helper function to generate UUID
function generateUUID(): string {
  // Simple UUID v4 implementation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Types
export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string
  price_monthly: number
  price_yearly: number
  features: string[]
  limits: Record<string, number>
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  hotel_name: string
  hotel_address: string
  hotel_city: string
  hotel_state: string
  hotel_country: string
  rooms_count: number
  plan_id: string
  plan?: SubscriptionPlan
  subscription_status: string
  monthly_revenue: number
  total_reservations: number
  status: string
  created_at?: string
  updated_at?: string
  last_payment_at?: string
}

export interface Payment {
  id: string
  client_id: string
  client?: Client
  amount: number
  currency: string
  status: string
  payment_method: string
  payment_provider: string
  paid_at?: string
  created_at?: string
  updated_at?: string
}

export interface SupportTicket {
  id: string
  client_id: string
  client?: Client
  title: string
  description: string
  priority: string
  status: string
  category: string
  client_email: string
  client_name: string
  created_at?: string
  updated_at?: string
  resolved_at?: string
}

export interface PlatformAnalytics {
  id: string
  metric_name: string
  metric_value: number
  metric_date: string
  client_id?: string
  created_at?: string
  updated_at?: string
}

// Mock data for development
const mockPlans: SubscriptionPlan[] = [
  {
    id: "1",
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
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
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
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "3",
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
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
]

const mockClients: Client[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@hotelpousada.com",
    phone: "(11) 99999-1111",
    hotel_name: "Pousada do Vale",
    hotel_address: "Rua das Flores, 123",
    hotel_city: "Campos do Jordão",
    hotel_state: "SP",
    hotel_country: "Brasil",
    rooms_count: 15,
    plan_id: "1",
    plan: mockPlans[0],
    subscription_status: "active",
    monthly_revenue: 12500,
    total_reservations: 45,
    status: "active",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    last_payment_at: "2023-05-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@hotelcentral.com",
    phone: "(21) 88888-2222",
    hotel_name: "Hotel Central",
    hotel_address: "Av. Copacabana, 456",
    hotel_city: "Rio de Janeiro",
    hotel_state: "RJ",
    hotel_country: "Brasil",
    rooms_count: 80,
    plan_id: "2",
    plan: mockPlans[1],
    subscription_status: "active",
    monthly_revenue: 85000,
    total_reservations: 320,
    status: "active",
    created_at: "2023-02-01T00:00:00Z",
    updated_at: "2023-02-01T00:00:00Z",
    last_payment_at: "2023-05-15T00:00:00Z",
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    email: "carlos@redehoteis.com",
    phone: "(11) 77777-3333",
    hotel_name: "Rede Hotéis Premium",
    hotel_address: "Rua Augusta, 789",
    hotel_city: "São Paulo",
    hotel_state: "SP",
    hotel_country: "Brasil",
    rooms_count: 250,
    plan_id: "3",
    plan: mockPlans[2],
    subscription_status: "active",
    monthly_revenue: 450000,
    total_reservations: 1200,
    status: "active",
    created_at: "2023-03-01T00:00:00Z",
    updated_at: "2023-03-01T00:00:00Z",
    last_payment_at: "2023-05-20T00:00:00Z",
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana@pousadapraia.com",
    phone: "(85) 66666-4444",
    hotel_name: "Pousada da Praia",
    hotel_address: "Av. Beira Mar, 321",
    hotel_city: "Fortaleza",
    hotel_state: "CE",
    hotel_country: "Brasil",
    rooms_count: 12,
    plan_id: "1",
    plan: mockPlans[0],
    subscription_status: "trial",
    monthly_revenue: 0,
    total_reservations: 0,
    status: "trial",
    created_at: "2023-04-01T00:00:00Z",
    updated_at: "2023-04-01T00:00:00Z",
    last_payment_at: null,
  },
  {
    id: "5",
    name: "Pedro Almeida",
    email: "pedro@hotelresort.com",
    phone: "(47) 55555-5555",
    hotel_name: "Resort Paradise",
    hotel_address: "Estrada da Praia, 1000",
    hotel_city: "Florianópolis",
    hotel_state: "SC",
    hotel_country: "Brasil",
    rooms_count: 150,
    plan_id: "2",
    plan: mockPlans[1],
    subscription_status: "active",
    monthly_revenue: 180000,
    total_reservations: 850,
    status: "active",
    created_at: "2023-05-01T00:00:00Z",
    updated_at: "2023-05-01T00:00:00Z",
    last_payment_at: "2023-05-10T00:00:00Z",
  },
]

const mockPayments: Payment[] = [
  {
    id: "1",
    client_id: "1",
    amount: 99,
    currency: "BRL",
    status: "paid",
    payment_method: "credit_card",
    payment_provider: "stripe",
    paid_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      name: "João Silva",
      email: "joao@hotelpousada.com",
      hotel_name: "Pousada do Vale",
    },
  },
  {
    id: "2",
    client_id: "2",
    amount: 199,
    currency: "BRL",
    status: "paid",
    payment_method: "credit_card",
    payment_provider: "stripe",
    paid_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      name: "Maria Santos",
      email: "maria@hotelcentral.com",
      hotel_name: "Hotel Central",
    },
  },
  {
    id: "3",
    client_id: "3",
    amount: 399,
    currency: "BRL",
    status: "paid",
    payment_method: "bank_transfer",
    payment_provider: "stripe",
    paid_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      name: "Carlos Oliveira",
      email: "carlos@redehoteis.com",
      hotel_name: "Rede Hotéis Premium",
    },
  },
  {
    id: "4",
    client_id: "4",
    amount: 99,
    currency: "BRL",
    status: "pending",
    payment_method: "credit_card",
    payment_provider: "stripe",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      name: "Ana Costa",
      email: "ana@pousadapraia.com",
      hotel_name: "Pousada da Praia",
    },
  },
]

const mockTickets: SupportTicket[] = [
  {
    id: "1",
    client_id: "1",
    title: "Dúvida sobre relatórios",
    description: "Como gerar relatório de ocupação mensal?",
    priority: "low",
    status: "resolved",
    category: "Dúvida",
    client_email: "joao@hotelpousada.com",
    client_name: "João Silva",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      name: "João Silva",
      email: "joao@hotelpousada.com",
      hotel_name: "Pousada do Vale",
    },
  },
  {
    id: "2",
    client_id: "2",
    title: "Problema na integração",
    description: "Reservas do Booking.com não estão sincronizando",
    priority: "high",
    status: "open",
    category: "Técnico",
    client_email: "maria@hotelcentral.com",
    client_name: "Maria Santos",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      name: "Maria Santos",
      email: "maria@hotelcentral.com",
      hotel_name: "Hotel Central",
    },
  },
  {
    id: "3",
    client_id: "4",
    title: "Solicitação de funcionalidade",
    description: "Gostaria de ter relatório de limpeza personalizado",
    priority: "medium",
    status: "in_progress",
    category: "Melhoria",
    client_email: "ana@pousadapraia.com",
    client_name: "Ana Costa",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      name: "Ana Costa",
      email: "ana@pousadapraia.com",
      hotel_name: "Pousada da Praia",
    },
  },
]

// Helper function to check if a table exists
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select("id").limit(1)
    return !error
  } catch (error) {
    return false
  }
}

// Subscription Plans Service
export const subscriptionPlansService = {
  async getAll(): Promise<SubscriptionPlan[]> {
    // Always return mock data for now since tables don't exist yet
    return mockPlans
  },

  async getById(id: string): Promise<SubscriptionPlan | null> {
    // Always return mock data for now since tables don't exist yet
    return mockPlans.find((p) => p.id === id) || null
  },

  async create(plan: Omit<SubscriptionPlan, "id" | "created_at" | "updated_at">): Promise<SubscriptionPlan | null> {
    // Always return mock data for now since tables don't exist yet
    return {
      ...plan,
      id: (mockPlans.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },

  async update(id: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    // Always return mock data for now since tables don't exist yet
    const existingPlan = mockPlans.find((p) => p.id === id)
    if (!existingPlan) return null
    return { ...existingPlan, ...plan, updated_at: new Date().toISOString() }
  },

  async delete(id: string): Promise<boolean> {
    // Always return success for now since tables don't exist yet
    return true
  },
}

// Clients Service
export const clientsService = {
  getAll: async (): Promise<Client[]> => {
    try {
      // In a real app, we would fetch from Supabase
      // const supabase = createClient()
      // const { data, error } = await supabase.from('clients').select('*, plan:plan_id(*)')
      // if (error) throw error
      // return data

      // For now, return mock data
      return mockClients
    } catch (error) {
      console.error("Error fetching clients:", error)
      return mockClients
    }
  },

  getById: async (id: string): Promise<Client | null> => {
    try {
      // In a real app, we would fetch from Supabase
      // const supabase = createClient()
      // const { data, error } = await supabase.from('clients').select('*, plan:plan_id(*)').eq('id', id).single()
      // if (error) throw error
      // return data

      // For now, return mock data
      const client = mockClients.find((c) => c.id === id)
      return client || null
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error)
      return null
    }
  },

  create: async (client: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> => {
    try {
      // In a real app, we would insert into Supabase
      // const supabase = createClient()
      // const { data, error } = await supabase.from('clients').insert(client).select().single()
      // if (error) throw error
      // return data

      // For now, create a new mock client
      const newClient: Client = {
        ...client,
        id: generateUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Add the plan details
      const plan = mockPlans.find((p) => p.id === client.plan_id || p.slug === client.plan_id)
      if (plan) {
        newClient.plan = plan
      }

      // Add to mock data
      mockClients.push(newClient)

      return newClient
    } catch (error) {
      console.error("Error creating client:", error)
      throw error
    }
  },

  update: async (id: string, client: Partial<Client>): Promise<Client> => {
    try {
      // In a real app, we would update in Supabase
      // const supabase = createClient()
      // const { data, error } = await supabase.from('clients').update(client).eq('id', id).select().single()
      // if (error) throw error
      // return data

      // For now, update mock data
      const index = mockClients.findIndex((c) => c.id === id)
      if (index === -1) throw new Error(`Client with id ${id} not found`)

      mockClients[index] = {
        ...mockClients[index],
        ...client,
        updated_at: new Date().toISOString(),
      }

      return mockClients[index]
    } catch (error) {
      console.error(`Error updating client ${id}:`, error)
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      // In a real app, we would delete from Supabase
      // const supabase = createClient()
      // const { error } = await supabase.from('clients').delete().eq('id', id)
      // if (error) throw error

      // For now, delete from mock data
      const index = mockClients.findIndex((c) => c.id === id)
      if (index === -1) throw new Error(`Client with id ${id} not found`)

      mockClients.splice(index, 1)
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error)
      throw error
    }
  },

  suspend: async (id: string): Promise<Client> => {
    try {
      // In a real app, we would update in Supabase
      // const supabase = createClient()
      // const { data, error } = await supabase.from('clients').update({ status: 'suspended' }).eq('id', id).select().single()
      // if (error) throw error
      // return data

      // For now, update mock data
      const index = mockClients.findIndex((c) => c.id === id)
      if (index === -1) throw new Error(`Client with id ${id} not found`)

      mockClients[index] = {
        ...mockClients[index],
        status: "suspended",
        updated_at: new Date().toISOString(),
      }

      return mockClients[index]
    } catch (error) {
      console.error(`Error suspending client ${id}:`, error)
      throw error
    }
  },

  activate: async (id: string): Promise<Client> => {
    try {
      // In a real app, we would update in Supabase
      // const supabase = createClient()
      // const { data, error } = await supabase.from('clients').update({ status: 'active' }).eq('id', id).select().single()
      // if (error) throw error
      // return data

      // For now, update mock data
      const index = mockClients.findIndex((c) => c.id === id)
      if (index === -1) throw new Error(`Client with id ${id} not found`)

      mockClients[index] = {
        ...mockClients[index],
        status: "active",
        updated_at: new Date().toISOString(),
      }

      return mockClients[index]
    } catch (error) {
      console.error(`Error activating client ${id}:`, error)
      throw error
    }
  },
}

// Plans service
export const plansService = {
  getAll: async (): Promise<SubscriptionPlan[]> => {
    try {
      // In a real app, we would fetch from Supabase
      // const supabase = createClient()
      // const { data, error } = await supabase.from('subscription_plans').select('*').order('sort_order')
      // if (error) throw error
      // return data

      // For now, return mock data
      return mockPlans
    } catch (error) {
      console.error("Error fetching plans:", error)
      return mockPlans
    }
  },
}

// Payments Service
export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    // Always return mock data for now since tables don't exist yet
    return mockPayments
  },

  async getById(id: string): Promise<Payment | null> {
    // Always return mock data for now since tables don't exist yet
    return mockPayments.find((p) => p.id === id) || null
  },
}

// Support Tickets Service
export const supportTicketsService = {
  async getAll(): Promise<SupportTicket[]> {
    // Always return mock data for now since tables don't exist yet
    return mockTickets
  },

  async getById(id: string): Promise<SupportTicket | null> {
    // Always return mock data for now since tables don't exist yet
    return mockTickets.find((t) => t.id === id) || null
  },

  async update(id: string, ticket: Partial<SupportTicket>): Promise<SupportTicket | null> {
    // Always return mock data for now since tables don't exist yet
    const existingTicket = mockTickets.find((t) => t.id === id)
    if (!existingTicket) return null
    return { ...existingTicket, ...ticket, updated_at: new Date().toISOString() }
  },

  async resolve(id: string, resolution: string): Promise<SupportTicket | null> {
    return this.update(id, {
      status: "resolved",
      resolution,
      resolved_at: new Date().toISOString(),
    })
  },

  async close(id: string): Promise<SupportTicket | null> {
    return this.update(id, { status: "closed" })
  },
}

// Analytics Service
export const analyticsService = {
  async getDashboardMetrics() {
    // Always return mock data for now since tables don't exist yet
    return {
      totalClients: mockClients.length,
      activeClients: mockClients.filter((c) => c.status === "active").length,
      totalRevenue: mockClients.reduce((sum, client) => sum + client.monthly_revenue, 0),
      monthlyRevenue: mockPayments.filter((p) => p.status === "paid").reduce((sum, payment) => sum + payment.amount, 0),
      openTickets: mockTickets.filter((t) => ["open", "in_progress"].includes(t.status)).length,
      conversionRate: 80.0,
    }
  },
}
