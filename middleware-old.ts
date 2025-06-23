import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client for server-side operations
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  try {
    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("❌ Middleware session error:", sessionError)
    }

    const { pathname } = request.nextUrl
    const user = session?.user

    console.log("🛡️ Middleware check:", {
      pathname,
      hasUser: !!user,
      userEmail: user?.email,
    })

    // Public routes that don't require authentication
    const publicRoutes = [
      "/",
      "/landing",
      "/login",
      "/cadastro",
      "/recuperar-senha",
      "/redefinir-senha",
      "/contato",
      "/test-connection",
      "/debug",
      "/test-auth",
      "/system-health",
    ]

    // Check if current path is public
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

    // Redirect root to landing page
    if (pathname === "/") {
      console.log("➡️ Redirecting root to landing")
      return NextResponse.redirect(new URL("/landing", request.url))
    }

    // Handle authentication routes
    if (["/login", "/cadastro", "/recuperar-senha"].includes(pathname)) {
      if (user) {
        console.log("👤 Authenticated user accessing auth page, checking role...")

        // Get user profile to determine redirect
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile?.role === "master_admin") {
          console.log("➡️ Redirecting master admin to dashboard")
          return NextResponse.redirect(new URL("/master/dashboard", request.url))
        } else {
          console.log("➡️ Redirecting client to dashboard")
          return NextResponse.redirect(new URL("/client", request.url))
        }
      }
      // Allow access to auth pages for non-authenticated users
      return response
    }

    // Protect master admin routes
    if (pathname.startsWith("/master") || pathname.startsWith("/(master)")) {
      if (!user) {
        console.log("🚫 Unauthenticated access to master route")
        return NextResponse.redirect(new URL("/login?type=master", request.url))
      }

      // Check if user is master admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("❌ Error checking master admin role:", profileError)
        return NextResponse.redirect(new URL("/login?error=profile_error", request.url))
      }

      if (profile?.role !== "master_admin") {
        console.log("🚫 Non-master admin accessing master route")
        return NextResponse.redirect(new URL("/client", request.url))
      }

      console.log("✅ Master admin access granted")
      return response
    }

    // Protect client routes
    if (pathname.startsWith("/client") || pathname.startsWith("/(client)")) {
      if (!user) {
        console.log("🚫 Unauthenticated access to client route")
        return NextResponse.redirect(new URL("/login?type=client", request.url))
      }

      // Check user role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("❌ Error checking client role:", profileError)
        return NextResponse.redirect(new URL("/login?error=profile_error", request.url))
      }

      // Redirect master admin to their dashboard
      if (profile?.role === "master_admin") {
        console.log("➡️ Master admin accessing client route, redirecting")
        return NextResponse.redirect(new URL("/master/dashboard", request.url))
      }

      console.log("✅ Client access granted")
      return response
    }

    // Allow access to public routes
    if (isPublicRoute) {
      console.log("✅ Public route access")
      return response
    }

    // For any other protected route, require authentication
    if (!user) {
      console.log("🚫 Unauthenticated access to protected route")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    console.log("✅ Default access granted")
    return response
  } catch (error) {
    console.error("💥 Middleware error:", error)
    // On error, redirect to login to be safe
    return NextResponse.redirect(new URL("/login?error=middleware_error", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
