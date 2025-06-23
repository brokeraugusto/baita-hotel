import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { pathname } = request.nextUrl

  // Skip middleware for static files, API routes, and system setup
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    pathname === "/system-setup" ||
    pathname === "/landing"
  ) {
    return response
  }

  try {
    // Simple redirect rules
    if (pathname === "/") {
      console.log("➡️ Redirecting root to landing")
      return NextResponse.redirect(new URL("/landing", request.url))
    }

    // Allow all other routes to pass through
    console.log("✅ Allowing request to:", pathname)
    return response
  } catch (error) {
    console.error("💥 Middleware error:", error)
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|system-setup|landing).*)"],
}
