import { createBrowserClient } from "@supabase/ssr"

// Environment validation
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("🚨 CRITICAL: Missing Supabase environment variables")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✅ Set" : "❌ Missing")
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
}

// Create client with error handling
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return existing client if available
  if (supabaseClient) {
    return supabaseClient
  }

  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables. Please check your .env.local file.")
  }

  try {
    console.log("🔧 Creating Supabase client...")

    supabaseClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Disable to prevent URL issues
      },
      global: {
        headers: {
          "X-Client-Info": "baita-hotel-system",
        },
      },
    })

    console.log("✅ Supabase client created successfully")
    return supabaseClient
  } catch (error) {
    console.error("💥 Failed to create Supabase client:", error)
    throw new Error("Failed to initialize database connection")
  }
}

// Simple connection test
export async function testConnection() {
  try {
    const client = createClient()
    const { data, error } = await client.from("profiles").select("id").limit(1)

    if (error) {
      console.error("❌ Connection test failed:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Database connection successful")
    return { success: true, data }
  } catch (err: any) {
    console.error("💥 Connection test error:", err)
    return { success: false, error: err.message }
  }
}
