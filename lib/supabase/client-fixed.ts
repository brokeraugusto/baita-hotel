import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

// Credenciais diretas para debug
const SUPABASE_URL = "https://bbqjnepppoqlkodrgmpb.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicWpuZXBwcG9xbGtvZHJnbXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NjIxNzgsImV4cCI6MjA2NTQzODE3OH0.zh3MRrc2FBA_hEFXoTcO-UUd5oj6YZa1WzEDkxfoz-I"

console.log("🔍 Testando conexão com Supabase...")
console.log("URL:", SUPABASE_URL)
console.log("Key (primeiros 50 chars):", SUPABASE_ANON_KEY.substring(0, 50) + "...")

export const supabase = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

// Função de teste
export async function testConnection() {
  try {
    console.log("🔄 Testando conexão...")

    const { data, error } = await supabase.from("profiles").select("id").limit(1)

    if (error) {
      console.error("❌ Erro na conexão:", error)
      return { success: false, error }
    }

    console.log("✅ Conexão bem-sucedida!")
    return { success: true, data }
  } catch (err) {
    console.error("❌ Erro inesperado:", err)
    return { success: false, error: err }
  }
}
