"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function NewSessionButton() {
  const router = useRouter();
  const pathname = usePathname();
  const workspacePath = pathname.split("/").slice(0, 3).join("/");

  return (
    <button
      type="button"
      onClick={() => router.push(`${workspacePath}/intervention`)}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
    >
      Nueva sesión STRAX
    </button>
  );
}

export function ContinueArchitectureButton() {
  const [requestSent, setRequestSent] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const workspacePath = pathname.split("/").slice(0, 3).join("/");

  function handleContinueArchitecture() {
    console.log("continuar arquitectura STRAX");

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "strax-architecture-request",
        JSON.stringify({
          requestedAt: new Date().toISOString(),
          source: "workspace_cta",
        }),
      );

      window.requestAnimationFrame(() => {
        document
          .getElementById("fase-2-arquitectura")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    setRequestSent(true);
    router.push(`${workspacePath}/intervention`);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleContinueArchitecture}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 sm:w-auto"
      >
        {requestSent ? "Arquitectura STRAX solicitada" : "Continuar arquitectura STRAX"}
      </button>

      {requestSent ? (
        <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50/85">
          Solicitud registrada para continuar con Arquitectura Objetivo. El
          siguiente paso es abrir una sesión STRAX y convertir el diagnóstico en
          ruta de implementación.
        </p>
      ) : null}
    </div>
  );
}
