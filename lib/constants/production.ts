// Constantes essenciais para produção com Supabase
export const PRODUCTION_CONFIG = {
  // Supabase - ÚNICAS VARIÁVEIS OBRIGATÓRIAS
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!, // Para operações server-side

  // Configurações opcionais (podem ser adicionadas depois)
  OPTIONAL: {
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    SUPPORT_EMAIL: "suporte@baitahotel.com",
  },

  // Feature flags - controla quais módulos estão ativos
  FEATURES: {
    MAINTENANCE_MODULE: true,
    CLEANING_MODULE: true,
    FINANCIAL_MODULE: true,
    ANALYTICS_MODULE: true,
    EMAIL_TEMPLATES: true,
  },

  // Configurações de segurança
  SECURITY: {
    SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 horas
    PASSWORD_MIN_LENGTH: 8,
  },
}

// Validação APENAS das variáveis obrigatórias
export function validateEnvironmentVariables() {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`❌ Variáveis obrigatórias não encontradas: ${missing.join(", ")}`)
  }

  console.log("✅ Todas as variáveis de ambiente obrigatórias estão configuradas")
}

export const isProduction = process.env.NODE_ENV === "production"
export const isDevelopment = process.env.NODE_ENV === "development"
