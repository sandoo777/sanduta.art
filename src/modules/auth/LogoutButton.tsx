"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Button
      onClick={handleLogout}
      className={className}
      variant="outline"
    >
      {children || "Logout"}
    </Button>
  );
}
