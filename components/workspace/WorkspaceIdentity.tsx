"use client";

import Image from "next/image";

import { useAuth } from "@/components/auth/AuthProvider";

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function WorkspaceIdentity({
  clientName,
  clientDetail,
  context,
}: {
  clientName: string;
  clientDetail?: string;
  context: string;
}) {
  const { profile, user } = useAuth();
  const architectName =
    profile?.full_name ?? user?.email?.split("@")[0] ?? "Arquitecto STRAX";
  const architectRole =
    profile?.role === "admin"
      ? "Administrador STRAX"
      : profile?.role === "client"
        ? "Cliente invitado"
        : "Arquitecto STRAX";
  const photoUrl = process.env.NEXT_PUBLIC_STRAX_ARCHITECT_PHOTO_URL;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_34px_120px_-75px_rgba(15,23,42,0.95)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white px-3">
            <Image
              src="/logos/logo-strax-dark.png"
              alt="STRAX"
              width={120}
              height={32}
              className="h-auto w-20"
              priority
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
              Cliente actual
            </p>
            <h1 className="mt-2 break-words text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              {clientName}
            </h1>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {context}
            </p>
            {clientDetail ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {clientDetail}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-3 sm:min-w-[18rem]">
          {photoUrl ? (
            <div
              aria-label={architectName}
              className="h-14 w-14 shrink-0 rounded-2xl bg-cover bg-center"
              style={{ backgroundImage: `url(${photoUrl})` }}
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-300/25 bg-blue-400/10 text-lg font-semibold text-blue-100">
              {getInitials(architectName) || "SX"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Usuario interno
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-white">
              {architectName}
            </p>
            <p className="mt-1 text-xs text-slate-400">{architectRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
