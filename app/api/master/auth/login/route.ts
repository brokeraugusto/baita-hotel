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

    console.log("Creating Supabase client with:")
    console.log("- URL:", url.substring(0, 30) + "...")
    console.log("- Key:", key.substring(0, 20) + "...")

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
            hint: "Configure Supabase environment variables",
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
      console.error("Database error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      let errorMessage = "Database error"
      let hint = ""
      let setupScript = ""

      switch (error.code) {
        case "42P01":
          errorMessage = "Table 'master_admins' does not exist"
          hint = "Database tables need to be created"
          setupScript = "scripts/auth-separation/00-complete-system-setup.sql"
          break
        case "42501":
          errorMessage = "Permission denied for table master_admins"
          hint = "Database permissions need to be configured"
          setupScript = "scripts/auth-separation/04-fix-permissions-and-rls.sql"
          break
        default:
          errorMessage = `Database error: ${error.message}`
          hint = error.hint || "Check database configuration"
          setupScript = "scripts/auth-separation/00-complete-system-setup.sql"
      }

      return NextResponse.json(
        {
          status: "error",
          message: errorMessage,
          details: {
            code: error.code,
            message: error.message,
            hint: hint,
            setupScript: setupScript,
            instructions: [
              "1. Go to your Supabase dashboard",
              "2. Open the SQL Editor",
              `3. Run the script: ${setupScript}`,
              "4. Refresh this page to test again",
            ],
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
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          hint: "Run the complete system setup script",
          setupScript: "scripts/auth-separation/00-complete-system-setup.sql",
          stack: error instanceof Error && process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
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

    // Primeiro, verificar se a tabela existe
    console.log("Checking if master_admins table exists...")
    const { data: tableCheck, error: tableError } = await supabase.from("master_admins").select("count").limit(1)

    if (tableError && tableError.code === "42P01") {
      console.log("❌ Table master_admins does not exist")
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
          details: {
            message: "Table 'master_admins' does not exist",
            hint: "Run the complete system setup script",
            setupScript: "scripts/auth-separation/00-complete-system-setup.sql",
            instructions: [
              "1. Go to your Supabase dashboard",
              "2. Open the SQL Editor",
              "3. Run the script: scripts/auth-separation/00-complete-system-setup.sql",
              "4. Try logging in again",
            ],
          },
        },
        { status: 500 },
      )
    }

    // Buscar usuário específico (ativo)
    console.log("Searching for active user in database...")
    const { data: user, error } = await supabase
      .from("master_admins")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("is_active", true)
      .maybeSingle()

    if (error) {
      console.error("Database query error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      if (error.code === "42501") {
        console.log("❌ Permission denied - RLS issue")
        return NextResponse.json(
          {
            success: false,
            error: "Database permission error",
            details: {
              message: "Permission denied for table master_admins",
              hint: "Run permissions script",
              setupScript: "scripts/auth-separation/04-fix-permissions-and-rls.sql",
            },
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: {
            message: error.message,
            hint: "Check database configuration",
            setupScript: "scripts/auth-separation/00-complete-system-setup.sql",
          },
        },
        { status: 500 },
      )
    }

    if (!user) {
      console.log("❌ No active user found:", email)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
          details: {
            hint: "Check email and password, or create a master admin",
            defaultCredentials: {
              email: "admin@baitahotel.com",
              password: "MasterAdmin2024!",
            },
          },
        },
        { status: 401 },
      )
    }

    console.log("✓ User found:", user.email, "ID:", user.id)

    // Verificar senha (comparação simples)
    console.log("Verifying password...")
    const isValidPassword = password === user.password_hash

    if (!isValidPassword) {
      console.log("❌ Invalid password for:", email)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
          details: {
            hint: "Check your password",
            defaultCredentials: {
              email: "admin@baitahotel.com",
              password: "MasterAdmin2024!",
            },
          },
        },
        { status: 401 },
      )
    }

    console.log("✓ Password verified")

    // Atualizar último login
    try {
      console.log("Updating last login...")
      const { error: updateError } = await supabase
        .from("master_admins")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", user.id)

      if (updateError) {
        console.warn("Failed to update last login:", updateError)
      } else {
        console.log("✓ Last login updated")
      }
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
        details: {
          message: error instanceof Error ? error.message : "Unknown error",
          hint: "Run the complete system setup script",
          setupScript: "scripts/auth-separation/00-complete-system-setup.sql",
          stack: error instanceof Error && process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
