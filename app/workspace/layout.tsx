"use client";

import { AuthGate } from "@/components/auth/AuthGate";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate allowedRoles={["admin", "architect", "client", "viewer"]}>
      {children}
    </AuthGate>
  );
}
