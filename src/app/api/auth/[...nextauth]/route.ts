import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT strategy for credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[NextAuth] Missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          console.log(`[NextAuth] User not found or no password: ${credentials.email}`);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          console.log(`[NextAuth] Invalid password for: ${credentials.email}`);
          return null;
        }

        console.log(`[NextAuth] User authenticated: ${user.email}, role: ${user.role}`);
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }: any) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.id = user.id;
        console.log(`[NextAuth] JWT callback - user signed in with role: ${user.role}`);
      }
      
      // Session update
      if (trigger === "update") {
        console.log(`[NextAuth] JWT callback - session update triggered`);
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id || token.sub;
        session.user.role = token.role;
        console.log(`[NextAuth] Session callback - role: ${token.role}`);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;