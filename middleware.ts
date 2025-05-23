import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "unoform-kitchen-design-secret-key-2024"
);

// Routes that require authentication
const PROTECTED_ROUTES = ["/dream", "/saved", "/admin"];

// Routes that should redirect authenticated users
const AUTH_ROUTES = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if this is an auth route
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  
  // Get token from Authorization header or cookie
  const authHeader = request.headers.get("authorization");
  const tokenFromHeader = authHeader?.replace("Bearer ", "");
  const tokenFromCookie = request.cookies.get("auth_token")?.value;
  const token = tokenFromHeader || tokenFromCookie;
  
  // Verify token if present
  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch (error) {
      // Token is invalid
      isAuthenticated = false;
    }
  }
  
  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  if (isAuthRoute && isAuthenticated) {
    // Redirect to dream page if already authenticated and trying to access login
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const redirectUrl = new URL(redirectParam || "/dream", request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Add auth status to headers for API routes
  const response = NextResponse.next();
  if (isAuthenticated && token) {
    response.headers.set("x-auth-token", token);
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};