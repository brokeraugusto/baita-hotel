// Sistema de permissões baseado em planos e roles
export type UserRole =
  | "master_admin" // Administrador da plataforma
  | "admin" // Administrador da plataforma (nível inferior)
  | "hotel_admin" // Administrador do hotel
  | "manager" // Gerente do hotel
  | "reception" // Recepção
  | "housekeeping" // Governança/Limpeza
  | "maintenance" // Manutenção

export type PlanType = "basic" | "intermediate" | "advanced" | "enterprise"

export type ModuleName =
  | "accommodations" // Gestão de Acomodações
  | "reservations" // Reservas
  | "financial" // Financeiro
  | "reports" // Relatórios
  | "guests" // Hóspedes
  | "maintenance" // Manutenção
  | "housekeeping" // Limpeza/Governança
  | "analytics" // Analytics Avançado
  | "integrations" // Integrações
  | "api_access" // Acesso à API

export interface PlanPermissions {
  plan: PlanType
  modules: ModuleName[]
  limits: {
    rooms: number | "unlimited"
    users: number | "unlimited"
    reservations_per_month: number | "unlimited"
    api_calls_per_month: number | "unlimited"
  }
  features: {
    advanced_reports: boolean
    custom_integrations: boolean
    priority_support: boolean
    white_label: boolean
  }
}

export interface RolePermissions {
  role: UserRole
  modules: {
    [key in ModuleName]?: {
      read: boolean
      write: boolean
      delete: boolean
      admin: boolean
    }
  }
}

// Configuração de planos
export const PLAN_PERMISSIONS: Record<PlanType, PlanPermissions> = {
  basic: {
    plan: "basic",
    modules: ["accommodations", "reservations"],
    limits: {
      rooms: 20,
      users: 3,
      reservations_per_month: 500,
      api_calls_per_month: 1000,
    },
    features: {
      advanced_reports: false,
      custom_integrations: false,
      priority_support: false,
      white_label: false,
    },
  },
  intermediate: {
    plan: "intermediate",
    modules: ["accommodations", "reservations", "financial", "guests", "reports"],
    limits: {
      rooms: 100,
      users: 10,
      reservations_per_month: 2000,
      api_calls_per_month: 5000,
    },
    features: {
      advanced_reports: true,
      custom_integrations: false,
      priority_support: true,
      white_label: false,
    },
  },
  advanced: {
    plan: "advanced",
    modules: [
      "accommodations",
      "reservations",
      "financial",
      "guests",
      "reports",
      "maintenance",
      "housekeeping",
      "analytics",
    ],
    limits: {
      rooms: 500,
      users: 25,
      reservations_per_month: 10000,
      api_calls_per_month: 25000,
    },
    features: {
      advanced_reports: true,
      custom_integrations: true,
      priority_support: true,
      white_label: true,
    },
  },
  enterprise: {
    plan: "enterprise",
    modules: [
      "accommodations",
      "reservations",
      "financial",
      "guests",
      "reports",
      "maintenance",
      "housekeeping",
      "analytics",
      "integrations",
      "api_access",
    ],
    limits: {
      rooms: "unlimited",
      users: "unlimited",
      reservations_per_month: "unlimited",
      api_calls_per_month: "unlimited",
    },
    features: {
      advanced_reports: true,
      custom_integrations: true,
      priority_support: true,
      white_label: true,
    },
  },
}

// Configuração de permissões por role
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  master_admin: {
    role: "master_admin",
    modules: {
      accommodations: { read: true, write: true, delete: true, admin: true },
      reservations: { read: true, write: true, delete: true, admin: true },
      financial: { read: true, write: true, delete: true, admin: true },
      reports: { read: true, write: true, delete: true, admin: true },
      guests: { read: true, write: true, delete: true, admin: true },
      maintenance: { read: true, write: true, delete: true, admin: true },
      housekeeping: { read: true, write: true, delete: true, admin: true },
      analytics: { read: true, write: true, delete: true, admin: true },
      integrations: { read: true, write: true, delete: true, admin: true },
      api_access: { read: true, write: true, delete: true, admin: true },
    },
  },
  admin: {
    role: "admin",
    modules: {
      accommodations: { read: true, write: true, delete: true, admin: true },
      reservations: { read: true, write: true, delete: true, admin: true },
      financial: { read: true, write: true, delete: true, admin: true },
      reports: { read: true, write: true, delete: true, admin: true },
      guests: { read: true, write: true, delete: true, admin: true },
      maintenance: { read: true, write: true, delete: true, admin: true },
      housekeeping: { read: true, write: true, delete: true, admin: true },
      analytics: { read: true, write: true, delete: false, admin: false },
    },
  },
  hotel_admin: {
    role: "hotel_admin",
    modules: {
      accommodations: { read: true, write: true, delete: true, admin: true },
      reservations: { read: true, write: true, delete: true, admin: true },
      financial: { read: true, write: true, delete: true, admin: true },
      reports: { read: true, write: true, delete: false, admin: true },
      guests: { read: true, write: true, delete: true, admin: true },
      maintenance: { read: true, write: true, delete: true, admin: true },
      housekeeping: { read: true, write: true, delete: true, admin: true },
      analytics: { read: true, write: false, delete: false, admin: false },
    },
  },
  manager: {
    role: "manager",
    modules: {
      accommodations: { read: true, write: true, delete: false, admin: false },
      reservations: { read: true, write: true, delete: false, admin: false },
      financial: { read: true, write: false, delete: false, admin: false },
      reports: { read: true, write: false, delete: false, admin: false },
      guests: { read: true, write: true, delete: false, admin: false },
      maintenance: { read: true, write: true, delete: false, admin: false },
      housekeeping: { read: true, write: true, delete: false, admin: false },
    },
  },
  reception: {
    role: "reception",
    modules: {
      accommodations: { read: true, write: false, delete: false, admin: false },
      reservations: { read: true, write: true, delete: false, admin: false },
      guests: { read: true, write: true, delete: false, admin: false },
      reports: { read: true, write: false, delete: false, admin: false },
    },
  },
  housekeeping: {
    role: "housekeeping",
    modules: {
      accommodations: { read: true, write: false, delete: false, admin: false },
      housekeeping: { read: true, write: true, delete: false, admin: false },
      maintenance: { read: true, write: false, delete: false, admin: false },
    },
  },
  maintenance: {
    role: "maintenance",
    modules: {
      accommodations: { read: true, write: false, delete: false, admin: false },
      maintenance: { read: true, write: true, delete: false, admin: false },
      housekeeping: { read: true, write: false, delete: false, admin: false },
    },
  },
}
