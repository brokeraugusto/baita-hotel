import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client with service role
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Verify master admin from client session
async function verifyMasterAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    return null
  }

  try {
    // Extract user data from authorization header (sent from client)
    const userData = JSON.parse(authHeader.replace("Bearer ", ""))
    if (userData.role === "master_admin" && userData.is_active) {
      return userData
    }
  } catch (error) {
    console.error("Error verifying master admin:", error)
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const masterAdmin = await verifyMasterAdmin(request)
    if (!masterAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso negado",
        },
        { status: 403 },
      )
    }

    const supabase = createServiceClient()

    const { data: clients, error } = await supabase
      .from("user_profiles")
      .select(`
        id,
        email,
        full_name,
        phone,
        is_active,
        created_at,
        updated_at,
        hotels!hotels_owner_id_fkey (
          id,
          name,
          status,
          city,
          state,
          country,
          subscriptions (
            id,
            status,
            current_price,
            trial_ends_at,
            subscription_plans (
              id,
              name,
              price_monthly
            )
          )
        )
      `)
      .eq("user_role", "hotel_owner")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching clients:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao buscar clientes: " + error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: clients || [],
    })
  } catch (error: any) {
    console.error("💥 Get clients error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro inesperado: " + error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const masterAdmin = await verifyMasterAdmin(request)
    if (!masterAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso negado",
        },
        { status: 403 },
      )
    }

    const { email, password, fullName, hotelName, planSlug = "starter" } = await request.json()

    console.log("🏨 Creating client via API:", email)

    if (!email || !password || !fullName || !hotelName) {
      return NextResponse.json(
        {
          success: false,
          error: "Todos os campos são obrigatórios",
        },
        { status: 400 },
      )
    }

    const supabase = createServiceClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .limit(1)

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Email já está em uso",
      })
    }

    // Get starter plan
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("id, price_monthly")
      .eq("slug", planSlug)
      .eq("is_active", true)
      .single()

    if (!plan) {
      return NextResponse.json({
        success: false,
        error: "Plano não encontrado",
      })
    }

    // Create user, hotel, and subscription in a transaction-like approach
    const userId = crypto.randomUUID()
    const hotelId = crypto.randomUUID()

    // Create user
    const { error: userError } = await supabase.from("user_profiles").insert({
      id: userId,
      email: email.toLowerCase().trim(),
      full_name: fullName.trim(),
      user_role: "hotel_owner",
      simple_password: password,
      is_active: true,
      is_email_verified: true,
      timezone: "America/Sao_Paulo",
      language: "pt-BR",
      preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (userError) {
      console.error("❌ Error creating user:", userError)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar usuário: " + userError.message,
        },
        { status: 500 },
      )
    }

    // Create hotel
    const { error: hotelError } = await supabase.from("hotels").insert({
      id: hotelId,
      owner_id: userId,
      name: hotelName.trim(),
      slug: hotelName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      status: "active",
      country: "Brasil",
      settings: {},
      branding: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (hotelError) {
      console.error("❌ Error creating hotel:", hotelError)
      // Cleanup user if hotel creation fails
      await supabase.from("user_profiles").delete().eq("id", userId)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar hotel: " + hotelError.message,
        },
        { status: 500 },
      )
    }

    // Create subscription
    const { error: subscriptionError } = await supabase.from("subscriptions").insert({
      hotel_id: hotelId,
      plan_id: plan.id,
      status: "trial",
      billing_cycle: "monthly",
      current_price: plan.price_monthly,
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (subscriptionError) {
      console.error("❌ Error creating subscription:", subscriptionError)
      // Cleanup user and hotel if subscription creation fails
      await supabase.from("hotels").delete().eq("id", hotelId)
      await supabase.from("user_profiles").delete().eq("id", userId)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar assinatura: " + subscriptionError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Client created successfully")
    return NextResponse.json({
      success: true,
      message: "Cliente criado com sucesso",
    })
  } catch (error: any) {
    console.error("💥 Client creation failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro inesperado: " + error.message,
      },
      { status: 500 },
    )
  }
}
