import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

console.log("[Middleware File] Loaded!");

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  console.log(`[Middleware] ==================`);
  console.log(`[Middleware] Path: ${path}`);
  
  // Get token using getToken
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  console.log(`[Middleware] Token:`, JSON.stringify(token, null, 2));
  console.log(`[Middleware] Role: ${token?.role || 'NO ROLE'}`);
  console.log(`[Middleware] ==================`);

  // Admin routes - only ADMIN
  if (path.startsWith("/admin")) {
    if (!token) {
      console.log(`[Middleware] DENIED - No token, redirecting to login`);
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "ADMIN") {
      console.log(`[Middleware] DENIED - Admin requires ADMIN role, got: ${token.role}`);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    console.log(`[Middleware] ALLOWED - User has ADMIN role`);
  }

  // Manager routes - ADMIN + MANAGER
  if (path.startsWith("/manager")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "MANAGER" && token.role !== "ADMIN") {
      console.log(`[Middleware] DENIED - Manager requires MANAGER or ADMIN role`);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Operator routes - ADMIN + OPERATOR
  if (path.startsWith("/operator")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "OPERATOR" && token.role !== "ADMIN") {
      console.log(`[Middleware] DENIED - Operator requires OPERATOR or ADMIN role`);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Client account routes - authenticated users only
  if (path.startsWith("/account")) {
    if (!token) {
      console.log(`[Middleware] DENIED - Account requires authentication`);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/operator/:path*",
    "/account/:path*",
  ],
};
