import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log(`[Middleware] Path: ${path}, Role: ${token?.role || 'NO ROLE'}`);

    // Admin routes - only ADMIN
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        console.log(`[Middleware] DENIED - Admin requires ADMIN role`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Manager routes - ADMIN + MANAGER
    if (path.startsWith("/manager")) {
      if (token?.role !== "MANAGER" && token?.role !== "ADMIN") {
        console.log(`[Middleware] DENIED - Manager requires MANAGER or ADMIN role`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Operator routes - ADMIN + OPERATOR
    if (path.startsWith("/operator")) {
      if (token?.role !== "OPERATOR" && token?.role !== "ADMIN") {
        console.log(`[Middleware] DENIED - Operator requires OPERATOR or ADMIN role`);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Client account routes - only CLIENT (or logged in users)
    if (path.startsWith("/account")) {
      if (!token) {
        console.log(`[Middleware] DENIED - Account requires authentication`);
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/operator/:path*",
    "/account/:path*",
  ],
};
