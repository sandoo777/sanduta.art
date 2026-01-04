"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user as CurrentUser | undefined,
    loading: status === "loading",
    authenticated: status === "authenticated",
  };
}
