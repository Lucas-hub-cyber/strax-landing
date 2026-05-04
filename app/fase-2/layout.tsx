"use client";

import { AuthGate } from "@/components/auth/AuthGate";

export default function FaseDosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate allowedRoles={["admin", "architect"]}>{children}</AuthGate>
  );
}
