import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

// Singleton pattern to prevent multiple instances
let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // Return existing client if available
  if (client) {
    return client
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase environment variables")
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Set" : "❌ Missing")
    throw new Error("Missing required Supabase environment variables")
  }

  console.log("🔧 Creating Supabase client...")
  console.log("URL:", supabaseUrl)
  console.log("Key (first 20 chars):", supabaseAnonKey.substring(0, 20) + "...")

  try {
    // Create new client instance
    client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {
          "X-Client-Info": "baita-hotel-system",
        },
      },
    })

    console.log("✅ Supabase client created successfully")
    return client
  } catch (error) {
    console.error("💥 Failed to create Supabase client:", error)
    throw new Error("Failed to initialize database connection")
  }
}

// Test connection function
export async function testConnection() {
  try {
    const client = createClient()
    console.log("🔄 Testing database connection...")

    const { data, error } = await client.from("profiles").select("id").limit(1)

    if (error) {
      console.error("❌ Connection test failed:", error)
      return { success: false, error }
    }

    console.log("✅ Database connection successful")
    return { success: true, data }
  } catch (err) {
    console.error("💥 Connection test error:", err)
    return { success: false, error: err }
  }
}
