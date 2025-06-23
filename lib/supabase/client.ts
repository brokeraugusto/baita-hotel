import { createBrowserClient } from "@supabase/ssr"
import { testConnection } from "./client-bulletproof"

// Singleton pattern to ensure we only create one client instance
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase environment variables")
    throw new Error("Missing Supabase configuration")
  }

  console.log("🔧 Creating Supabase client...")

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  console.log("✅ Supabase client created successfully")
  return supabaseClient
}

export { testConnection }
