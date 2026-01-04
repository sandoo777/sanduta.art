import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Log for debugging
    if (path.startsWith("/admin") || path.startsWith("/manager")) {
      console.log(`[Middleware] Checking access to: ${path}`);
      console.log(`[Middleware] Token role: ${token?.role}`);
      console.log(`[Middleware] Token: ${JSON.stringify(token)}`);
    }

    // Check authorization for admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        console.log(`[Middleware] DENIED - User does not have ADMIN role`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      console.log(`[Middleware] ALLOWED - User has ADMIN role`);
    }

    // Check authorization for manager routes
    if (path.startsWith("/manager")) {
      if (token?.role !== "MANAGER" && token?.role !== "ADMIN") {
        console.log(`[Middleware] DENIED - User does not have MANAGER or ADMIN role`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      console.log(`[Middleware] ALLOWED - User has required role`);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // Allow access if user is authenticated
        const isAuthorized = !!token;
        console.log(`[Middleware] authorized callback - token exists: ${isAuthorized}`);
        return isAuthorized;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin", "/admin/:path*", "/manager", "/manager/:path*"],
};
