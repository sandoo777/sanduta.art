import NextAuth from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";

const handler = NextAuth(authOptions);

export { authOptions };
export const GET = handler;
export const POST = handler;