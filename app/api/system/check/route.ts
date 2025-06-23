import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variáveis de ambiente
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET,
    }

    // Verificar se o Supabase está disponível
    let supabaseStatus = "unknown"
    try {
      const { createClient } = require("@supabase/supabase-js")
      if (envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

        // Teste simples de conexão
        const { error } = await supabase.from("master_admins").select("count").limit(1)
        supabaseStatus = error ? `error: ${error.message}` : "connected"
      } else {
        supabaseStatus = "missing credentials"
      }
    } catch (error) {
      supabaseStatus = `error: ${error instanceof Error ? error.message : "unknown"}`
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        variables: envVars,
        supabase: supabaseStatus,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
