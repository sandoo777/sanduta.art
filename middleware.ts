import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Log for debugging
    console.log(`[Middleware] Path: ${path}, Role: ${token?.role || 'NO ROLE'}, Email: ${token?.email || 'NO EMAIL'}`);

    // Check authorization for admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        console.log(`[Middleware] DENIED - Admin access requires ADMIN role, got: ${token?.role || 'none'}`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      console.log(`[Middleware] ALLOWED - Admin access granted`);
    }

    // Check authorization for manager routes
    if (path.startsWith("/manager")) {
      if (token?.role !== "MANAGER" && token?.role !== "ADMIN") {
        console.log(`[Middleware] DENIED - Manager access requires MANAGER or ADMIN role, got: ${token?.role || 'none'}`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      console.log(`[Middleware] ALLOWED - Manager access granted`);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // Allow access if user is authenticated (has a token)
        const isAuthorized = !!token;
        if (!isAuthorized) {
          console.log(`[Middleware] No token - redirecting to login`);
        }
        return isAuthorized;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/manager",
    "/manager/:path*",
  ],
};
