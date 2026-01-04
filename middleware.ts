import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token, req }) {
      const path = req.nextUrl.pathname;

      // Admin-only routes
      if (path.startsWith("/admin")) {
        return token?.role === "ADMIN";
      }

      // Manager or Admin routes
      if (path.startsWith("/manager")) {
        return token?.role === "MANAGER" || token?.role === "ADMIN";
      }

      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*"],
};
