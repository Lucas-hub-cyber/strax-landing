"use client";

import {
  Suspense,
  type FormEvent,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

const demoAccessKey = "strax_demo_access";
const subscribeToLocalhost = () => () => {};

function getLocalhostSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/workspace/demo-client";
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace(nextPath);
    }
  }, [nextPath, router, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      setMessage("Supabase Auth no esta configurado.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(nextPath);
  }

  async function handleGoogleSignIn() {
    if (!isSupabaseConfigured || !supabase) {
      setMessage("Supabase Auth no esta configurado.");
      return;
    }

    setIsGoogleSubmitting(true);
    setMessage("");

    const redirectTo = `${window.location.origin}/login?next=${encodeURIComponent(
      nextPath,
    )}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setMessage(error.message);
      setIsGoogleSubmitting(false);
    }
  }

  function handleDemoAccess() {
    window.sessionStorage.setItem(demoAccessKey, "enabled");
    router.replace(nextPath);
  }

  const canUseDemoAccess = useSyncExternalStore(
    subscribeToLocalhost,
    getLocalhostSnapshot,
    () => false,
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_48%,#020617_100%)] px-5 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1fr]">
        <section className="hidden min-h-[42rem] rounded-[2.5rem] border border-white/10 bg-white/[0.07] p-10 shadow-[0_50px_160px_-90px_rgba(37,99,235,0.75)] backdrop-blur lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex rounded-[2rem] bg-white p-6 shadow-[0_30px_100px_-60px_rgba(15,23,42,0.9)]">
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
              Sistema seguro
            </p>
            <h2 className="mt-5 max-w-xl text-5xl font-semibold tracking-[-0.05em] text-white">
              Diagnostico, arquitectura e intervencion en un solo lugar.
            </h2>
          </div>

          <div className="grid gap-3 text-sm leading-6 text-slate-300">
            <p className="rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4">
              Acceso controlado para arquitectos, administradores y clientes.
            </p>
            <p className="rounded-[1.25rem] border border-blue-300/20 bg-blue-400/10 p-4 text-blue-50">
              Cada sesion queda conectada con decisiones, roadmap y seguimiento.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.85)] sm:p-8">
        <div className="mb-8 flex justify-center lg:hidden">
          <div className="rounded-[1.5rem] bg-white p-4">
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
        <Link href="/" className="text-sm font-medium text-slate-300 transition hover:text-white">
          {"<-"} Volver
        </Link>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
          STRAX Secure
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
          Acceso a workspace
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Inicia sesion para ver clientes, intervenciones y herramientas internas.
        </p>
        <p className="mt-4 rounded-2xl border border-blue-300/20 bg-blue-400/10 px-4 py-3 text-sm leading-6 text-blue-50">
          Si aun no tienes usuario, puedes crear tu perfil y pedir acceso a
          Fase 2 desde{" "}
          <Link
            href={`/registro?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-white underline-offset-4 hover:underline"
          >
            registro
          </Link>
          .
        </p>

        <button
          type="button"
          onClick={() => void handleGoogleSignIn()}
          disabled={isGoogleSubmitting || isSubmitting}
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="grid size-5 place-items-center rounded-full border border-slate-200 text-xs font-bold text-blue-600">
            G
          </span>
          {isGoogleSubmitting ? "Conectando..." : "Continuar con Google"}
        </button>

        <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span className="h-px flex-1 bg-white/10" />
          o
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {message ? (
          <p className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-50">
            {message}
          </p>
        ) : null}

        {canUseDemoAccess ? (
          <button
            type="button"
            onClick={handleDemoAccess}
            className="mt-4 min-h-12 w-full rounded-full border border-blue-300/25 bg-blue-400/10 px-6 py-3 text-sm font-semibold text-blue-50 transition hover:bg-blue-400/15"
          >
            Entrar en modo demo
          </button>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-300/50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-300/50"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="mt-5 text-sm leading-6 text-slate-300">
          No tienes acceso todavia?{" "}
          <Link
            href={`/registro?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-white underline-offset-4 hover:underline"
          >
            Crear perfil
          </Link>
        </p>
      </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            Cargando acceso...
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
