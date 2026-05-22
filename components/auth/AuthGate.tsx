"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import type { UserRole } from "@/types/auth";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  architect: "Arquitecto",
  client: "Cliente",
  viewer: "Lectura",
};

const demoAccessKey = "strax_demo_access";
const demoRole: UserRole = "architect";
const subscribeToDemoAccess = () => () => {};

function getDemoAccessSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  const isLocalhost = ["localhost", "127.0.0.1"].includes(
    window.location.hostname,
  );

  return isLocalhost && window.sessionStorage.getItem(demoAccessKey) === "enabled";
}

function canAccess(role: UserRole | null, allowedRoles?: UserRole[]) {
  if (!allowedRoles?.length) {
    return Boolean(role);
  }

  return role ? allowedRoles.includes(role) : false;
}

export function AuthGate({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: UserRole[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isConfigured, isLoading, session, user, role, signOut } = useAuth();
  const hasDemoAccess = useSyncExternalStore(
    subscribeToDemoAccess,
    getDemoAccessSnapshot,
    () => false,
  );
  const hasMockWorkspaceAccess = pathname.startsWith("/workspace/demo-client");
  const canUseLocalDemo =
    (hasDemoAccess || hasMockWorkspaceAccess) && canAccess(demoRole, allowedRoles);

  useEffect(() => {
    if (!isLoading && isConfigured && !session && !canUseLocalDemo) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [canUseLocalDemo, isConfigured, isLoading, pathname, router, session]);

  if (canUseLocalDemo) {
    return (
      <>
        <div className="border-b border-blue-300/20 bg-slate-950 px-4 py-3 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="font-semibold text-blue-100">STRAX Secure</span>
              <span className="ml-2 text-slate-500">
                {hasMockWorkspaceAccess ? "Mockup local" : "Modo demo local"}
              </span>{" "}
              <span className="text-slate-400">{roleLabels[demoRole]}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                window.sessionStorage.removeItem(demoAccessKey);
                router.replace("/login");
              }}
              className="w-fit rounded-full bg-white px-4 py-2 font-semibold text-slate-950"
            >
              Salir demo
            </button>
          </div>
        </div>
        {children}
      </>
    );
  }

  if (!isConfigured) {
    return (
      <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
        <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-100">
            Auth pendiente
          </p>
          <h1 className="mt-3 text-2xl font-semibold">
            Configura Supabase para activar acceso seguro.
          </h1>
          <p className="mt-3 text-sm leading-6 text-amber-50/85">
            Faltan `NEXT_PUBLIC_SUPABASE_URL` y
            `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Cuando esten listas, esta ruta
            pedira login y validara roles.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Volver al landing
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading || !session) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          Verificando acceso...
        </div>
      </main>
    );
  }

  if (!canAccess(role, allowedRoles)) {
    return (
      <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
        <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-red-300/20 bg-red-400/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-100">
            Acceso restringido
          </p>
          <h1 className="mt-3 text-2xl font-semibold">
            Tu usuario no tiene permisos para esta seccion.
          </h1>
          <p className="mt-3 text-sm leading-6 text-red-50/85">
            Rol actual: {role ? roleLabels[role] : "sin rol asignado"}. El
            panel de administracion requiere rol Administrador.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/registro?next=${encodeURIComponent(pathname)}`}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Completar perfil
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="border-b border-white/10 bg-slate-950 px-4 py-3 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="font-semibold text-blue-100">STRAX Secure</span>
            <span className="ml-2 text-slate-500">Cuenta interna</span>{" "}
            <span className="text-slate-400">
              {user?.email} | {role ? roleLabels[role] : "sin rol"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/workspace/${user?.id ?? ""}`}
              className="rounded-full border border-white/10 px-4 py-2 text-slate-200 transition hover:bg-white/5"
            >
              Workspace
            </Link>
            <Link
              href="/admin"
              className={`rounded-full border px-4 py-2 transition ${
                role === "admin"
                  ? "border-blue-300/35 bg-blue-400/10 text-blue-50 hover:bg-blue-400/15"
                  : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
              title={
                role === "admin"
                  ? "Abrir panel de administracion"
                  : "Panel visible, requiere rol Administrador"
              }
            >
              Panel admin{role === "admin" ? "" : " (solo admin)"}
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-full bg-white px-4 py-2 font-semibold text-slate-950"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
