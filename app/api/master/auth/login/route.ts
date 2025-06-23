import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Função para criar cliente Supabase
function createSupabaseClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error("Missing Supabase credentials")
    }

    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    throw error
  }
}

export async function GET() {
  try {
    console.log("🔍 Testing Master Admin API...")

    // Verificar variáveis de ambiente
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("Environment check:", {
      NEXT_PUBLIC_SUPABASE_URL: hasUrl ? "✓ Set" : "✗ Missing",
      SUPABASE_SERVICE_ROLE_KEY: hasKey ? "✓ Set" : "✗ Missing",
    })

    if (!hasUrl || !hasKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing environment variables",
          details: {
            NEXT_PUBLIC_SUPABASE_URL: hasUrl ? "✓" : "✗",
            SUPABASE_SERVICE_ROLE_KEY: hasKey ? "✓" : "✗",
          },
        },
        { status: 500 },
      )
    }

    // Testar conexão com Supabase
    console.log("Creating Supabase client...")
    const supabase = createSupabaseClient()
    console.log("✓ Supabase client created")

    // Verificar se a tabela existe
    console.log("Testing database connection...")
    const { data, error } = await supabase
      .from("master_admins")
      .select("id, email, full_name, is_active, created_at")
      .limit(5)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Database error",
          details: {
            code: error.code,
            message: error.message,
            hint: error.code === "42P01" ? "Run setup scripts first" : error.hint,
          },
        },
        { status: 500 },
      )
    }

    console.log("✓ Database connection successful")
    console.log("Found master admins:", data?.length || 0)

    return NextResponse.json({
      status: "success",
      message: "Master Admin API is working",
      data: {
        master_admins_count: data?.length || 0,
        has_admins: (data?.length || 0) > 0,
        admins: data?.map((admin) => ({
          id: admin.id,
          email: admin.email,
          full_name: admin.full_name,
          is_active: admin.is_active,
        })),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error && process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Master Admin login attempt...")

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log("Request body parsed successfully")
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 },
      )
    }

    const { email, password } = body

    // Validar entrada
    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    if (typeof email !== "string" || typeof password !== "string") {
      console.log("Invalid data types for email or password")
      return NextResponse.json(
        {
          success: false,
          error: "Email and password must be strings",
        },
        { status: 400 },
      )
    }

    console.log("📧 Login attempt for:", email)

    // Criar cliente Supabase
    console.log("Creating Supabase client for login...")
    const supabase = createSupabaseClient()
    console.log("✓ Supabase client created for login")

    // Buscar usuário
    console.log("Searching for user in database...")
    const { data: user, error } = await supabase
      .from("master_admins")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Database query error:", error)

      if (error.code === "PGRST116") {
        // No rows returned
        console.log("❌ User not found in database")
        return NextResponse.json(
          {
            success: false,
            error: "Invalid credentials",
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: error.message,
        },
        { status: 500 },
      )
    }

    if (!user) {
      console.log("❌ User not found:", email)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    console.log("✓ User found:", user.email)

    // Verificar senha (comparação simples)
    console.log("Verifying password...")
    const isValidPassword = password === user.password_hash

    if (!isValidPassword) {
      console.log("❌ Invalid password for:", email)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    console.log("✓ Password verified")

    // Atualizar último login
    try {
      console.log("Updating last login...")
      await supabase.from("master_admins").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)
      console.log("✓ Last login updated")
    } catch (updateError) {
      console.warn("Failed to update last login:", updateError)
      // Não falhar o login por causa disso
    }

    console.log("✅ Login successful for:", email)

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: "master_admin",
        created_at: user.created_at,
      },
      token: `master_${user.id}_${Date.now()}`,
    })
  } catch (error) {
    console.error("💥 Login error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error && process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
