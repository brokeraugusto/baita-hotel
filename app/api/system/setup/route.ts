import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/* ---------- GET  /api/system/setup ---------- */
export async function GET() {
  try {
    console.log("🔍 GET /api/system/setup - Checking system status...")

    const supabase = serviceClient()

    // Try the function first
    const { data, error } = await supabase.rpc("get_system_status")

    if (error) {
      console.error("❌ Function error:", error)

      // Fallback: manual check
      console.log("🔄 Trying manual check...")

      try {
        const { count: profilesCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

        const { count: plansCount } = await supabase
          .from("subscription_plans")
          .select("*", { count: "exact", head: true })

        const fallbackData = {
          database_ready: true,
          subscription_plans_count: plansCount || 0,
          master_admin_configured: (profilesCount || 0) > 0,
          system_version: "1.0.0",
          requires_setup: (profilesCount || 0) === 0,
        }

        console.log("✅ Manual check successful:", fallbackData)
        return NextResponse.json({ success: true, data: fallbackData })
      } catch (fallbackError: any) {
        console.error("❌ Manual check also failed:", fallbackError)
        return NextResponse.json(
          { success: false, error: `Database access error: ${fallbackError.message}` },
          { status: 500 },
        )
      }
    }

    console.log("✅ Function call successful:", data)
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error("💥 GET error:", err)
    return NextResponse.json({ success: false, error: `Internal error: ${err.message}` }, { status: 500 })
  }
}

/* ---------- POST  /api/system/setup ---------- */
export async function POST(req: NextRequest) {
  try {
    console.log("🔍 POST /api/system/setup - Creating master admin...")

    const { email, password, fullName } = await req.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ success: false, error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const supabase = serviceClient()

    // Try the function first
    const { data, error } = await supabase.rpc("create_master_admin", {
      admin_email: email.toLowerCase().trim(),
      admin_password: password.trim(),
      admin_name: fullName.trim(),
    })

    if (error) {
      console.error("❌ Function error:", error)

      // Fallback: manual creation
      console.log("🔄 Trying manual creation...")

      try {
        // Check if user exists
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email.toLowerCase().trim())
          .single()

        if (existingUser) {
          return NextResponse.json({
            success: false,
            error: "Email já está em uso",
          })
        }

        // Create user manually
        const { error: insertError } = await supabase.from("profiles").insert({
          email: email.toLowerCase().trim(),
          full_name: fullName.trim(),
          password_hash: password.trim(),
          user_role: "master_admin",
          is_active: true,
          is_email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("❌ Manual creation failed:", insertError)
          return NextResponse.json({
            success: false,
            error: `Erro ao criar usuário: ${insertError.message}`,
          })
        }

        console.log("✅ Manual creation successful")
        return NextResponse.json({
          success: true,
          message: "Administrador master criado com sucesso!",
        })
      } catch (fallbackError: any) {
        console.error("❌ Manual creation also failed:", fallbackError)
        return NextResponse.json({
          success: false,
          error: `Erro ao criar usuário: ${fallbackError.message}`,
        })
      }
    }

    if (!data?.success) {
      return NextResponse.json({
        success: false,
        error: data?.error || "Erro desconhecido",
      })
    }

    console.log("✅ Function creation successful")
    return NextResponse.json({
      success: true,
      message: data.message || "Administrador criado com sucesso!",
    })
  } catch (err: any) {
    console.error("💥 POST error:", err)
    return NextResponse.json({ success: false, error: `Erro interno: ${err.message}` }, { status: 500 })
  }
}
