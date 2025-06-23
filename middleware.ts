import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  try {
    // Redirect root to landing page
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/landing", request.url))
    }

    // Master admin routes protection
    if (pathname.startsWith("/master") && pathname !== "/master/login") {
      const masterSession = request.cookies.get("master_session")?.value

      if (!masterSession) {
        return NextResponse.redirect(new URL("/master/login", request.url))
      }
    }

    // Client routes protection
    if (pathname.startsWith("/client")) {
      const clientSession = request.cookies.get("client_session")?.value

      if (!clientSession) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("💥 Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
