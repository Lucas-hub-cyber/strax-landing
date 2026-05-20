"use client";

import {
  Suspense,
  type FormEvent,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

function RecoveryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/fase-2";
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeNextPath = useMemo(() => {
    return nextPath.startsWith("/") ? nextPath : "/fase-2";
  }, [nextPath]);

  async function handleSendReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      setIsSuccess(false);
      setMessage("Supabase Auth no esta configurado.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setIsSuccess(false);
      setMessage("Escribe tu email para enviarte el enlace de recuperacion.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);

    const redirectTo = `${window.location.origin}/recuperar?next=${encodeURIComponent(
      safeNextPath,
    )}`;
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    if (error) {
      setIsSuccess(false);
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setIsSuccess(true);
    setMessage(
      "Si ese email ya tiene cuenta, te enviaremos un enlace para recuperar la contrasena.",
    );
    setIsSubmitting(false);
  }

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      setIsSuccess(false);
      setMessage("Supabase Auth no esta configurado.");
      return;
    }

    if (password.length < 8) {
      setIsSuccess(false);
      setMessage("La nueva clave debe tener al menos 8 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setIsSuccess(false);
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setIsSuccess(true);
    setMessage("Clave actualizada. Entrando al diagnostico...");
    router.replace(safeNextPath);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1fr]">
        <section className="hidden min-h-[42rem] border border-white/10 bg-white/[0.07] p-10 shadow-[0_50px_160px_-90px_rgba(37,99,235,0.75)] backdrop-blur lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex bg-white p-6 shadow-[0_30px_100px_-60px_rgba(15,23,42,0.9)]">
              <Image
                src="/logos/logo-strax-dark.png"
                alt="STRAX"
                width={320}
                height={90}
                className="h-auto w-72"
                priority
              />
            </div>
            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
              Recuperacion segura
            </p>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold tracking-[-0.04em] text-white">
              Recupera tu acceso sin perder el contexto de Fase 2.
            </h1>
          </div>

          <div className="grid gap-3 text-sm leading-6 text-slate-300">
            <p className="border border-white/10 bg-slate-950/45 p-4">
              El enlace de recuperacion valida tu email antes de permitir una
              nueva clave.
            </p>
            <p className="border border-blue-300/20 bg-blue-400/10 p-4 text-blue-50">
              Despues de actualizarla, volveras al flujo que estabas usando.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.85)] sm:p-8">
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="bg-white p-4">
              <Image
                src="/logos/logo-strax-dark.png"
                alt="STRAX"
                width={220}
                height={64}
                className="h-auto w-44"
                priority
              />
            </div>
          </div>

          <Link
            href={`/login?next=${encodeURIComponent(safeNextPath)}`}
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            {"<-"} Volver a login
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
            Recuperar acceso
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
            {session ? "Crea una nueva clave" : "Envia el enlace"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {session
              ? "Define una clave nueva para seguir con tu cuenta."
              : "Usa el email de tu cuenta para recibir el enlace de recuperacion."}
          </p>

          {message ? (
            <p
              className={`mt-6 border px-4 py-3 text-sm ${
                isSuccess
                  ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-50"
                  : "border-red-300/20 bg-red-400/10 text-red-50"
              }`}
            >
              {message}
            </p>
          ) : null}

          {session ? (
            <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Nueva clave
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                  className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-300/50"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-12 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Actualizando..." : "Actualizar clave"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendReset} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-300/50"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-12 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default function RecoveryPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
          <div className="border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            Cargando recuperacion...
          </div>
        </main>
      }
    >
      <RecoveryForm />
    </Suspense>
  );
}
