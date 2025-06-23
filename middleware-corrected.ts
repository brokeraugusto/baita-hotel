import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("🔍 Middleware checking:", pathname)

  // Skip middleware for static files, API routes, and auth pages
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    pathname === "/system-setup" ||
    pathname === "/landing" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth")
  ) {
    console.log("⏭️ Skipping middleware for:", pathname)
    return NextResponse.next()
  }

  // Allow all routes to pass through - authentication will be handled by client-side
  console.log("✅ Allowing request to:", pathname)
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
