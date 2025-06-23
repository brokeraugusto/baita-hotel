import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const supabase = serviceClient()

    // Buscar cliente (hotel)
    const { data: user, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("is_active", true)
      .single()

    if (error || !user) {
      console.log("❌ Client not found:", email)
      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      console.log("❌ Invalid password for:", email)
      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    // Atualizar último login
    await supabase.from("hotels").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)

    // Gerar JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: "client",
        hotel_id: user.id,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" },
    )

    console.log("✅ Client login successful:", email)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        hotel_name: user.hotel_name,
        role: "client",
        created_at: user.created_at,
      },
      token,
    })
  } catch (error: any) {
    console.error("💥 Client login error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
