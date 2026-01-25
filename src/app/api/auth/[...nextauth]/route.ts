import NextAuth from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export both GET and POST as named exports
export { handler as GET, handler as POST };