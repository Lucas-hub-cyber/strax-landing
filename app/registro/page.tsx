"use client";

import {
  Suspense,
  type FormEvent,
  useEffect,
  useMemo,
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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/fase-2";
  const { session, user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const safeNextPath = useMemo(() => {
    return nextPath.startsWith("/") ? nextPath : "/fase-2";
  }, [nextPath]);
  const canUseDemoAccess = useSyncExternalStore(
    subscribeToLocalhost,
    getLocalhostSnapshot,
    () => false,
  );

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }

    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile?.full_name, user?.email]);

  async function createProfile(userId: string, targetEmail: string) {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.from("user_profiles").upsert(
      {
        user_id: userId,
        email: targetEmail,
        full_name: fullName.trim(),
        role: "architect",
        status: "active",
      },
      { onConflict: "user_id" },
    );

    if (error) {
      throw error;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      setIsSuccess(false);
      setMessage("Supabase Auth no esta configurado.");
      return;
    }

    const cleanName = fullName.trim();
    const cleanCompany = company.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setIsSuccess(false);
      setMessage("Completa tu nombre y correo para crear el perfil.");
      return;
    }

    if (!session && password.length < 8) {
      setIsSuccess(false);
      setMessage("La clave debe tener al menos 8 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);

    try {
      if (session?.user) {
        await createProfile(session.user.id, session.user.email ?? cleanEmail);
        await refreshProfile();
        router.replace(safeNextPath);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            company: cleanCompany || null,
            role: "architect",
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/login?next=${encodeURIComponent(
                  safeNextPath,
                )}`
              : undefined,
        },
      });

      if (error) {
        throw error;
      }

      if (data.session?.user) {
        await createProfile(data.session.user.id, data.user?.email ?? cleanEmail);
        await refreshProfile();
        router.replace(safeNextPath);
        return;
      }

      setIsSuccess(true);
      setMessage(
        "Cuenta creada. Revisa tu correo para confirmar el acceso y luego entra con tu email y clave.",
      );
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo crear el acceso. Intenta de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
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

    setIsResettingPassword(true);
    setMessage("");
    setIsSuccess(false);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/recuperar?next=${encodeURIComponent(
            safeNextPath,
          )}`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    if (error) {
      setIsSuccess(false);
      setMessage(error.message);
      setIsResettingPassword(false);
      return;
    }

    setIsSuccess(true);
    setMessage(
      "Si ese email ya tiene cuenta, te enviaremos un enlace para recuperar la contrasena.",
    );
    setIsResettingPassword(false);
  }

  function handleDemoAccess() {
    window.sessionStorage.setItem(demoAccessKey, "enabled");
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
              Perfil STRAX
            </p>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold tracking-[-0.04em] text-white">
              Crea tu acceso y entra a Fase 2 con contexto propio.
            </h1>
          </div>

          <div className="grid gap-3 text-sm leading-6 text-slate-300">
            <p className="border border-white/10 bg-slate-950/45 p-4">
              El perfil queda conectado al diagnostico, las sesiones y las
              herramientas de arquitectura.
            </p>
            <p className="border border-blue-300/20 bg-blue-400/10 p-4 text-blue-50">
              Si ya tenias una cuenta sin perfil, esta pantalla completa el
              acceso sin perder tu sesion.
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
            href="/"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            {"<-"} Volver
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
            Solicitar acceso
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
            Construye tu perfil
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Crea una cuenta para entrar a Fase 2. Si ya iniciaste sesion, solo
            completaremos el perfil que falta.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Nombre
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-300/50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Empresa
              </span>
              <input
                type="text"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-300/50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={Boolean(session)}
                required
                className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-300/50 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            {!session ? (
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Clave
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
            ) : null}

            {message ? (
              <p
                className={`border px-4 py-3 text-sm ${
                  isSuccess
                    ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-50"
                    : "border-red-300/20 bg-red-400/10 text-red-50"
                }`}
              >
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-12 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creando acceso..." : "Crear acceso"}
            </button>
          </form>

          {canUseDemoAccess ? (
            <button
              type="button"
              onClick={handleDemoAccess}
              className="mt-4 min-h-12 w-full rounded-full border border-blue-300/25 bg-blue-400/10 px-6 py-3 text-sm font-semibold text-blue-50 transition hover:bg-blue-400/15"
            >
              Continuar al diagnostico ahora
            </button>
          ) : null}

          <p className="mt-5 text-sm leading-6 text-slate-300">
            Ya tienes usuario?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(safeNextPath)}`}
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              Entrar con mi cuenta
            </Link>
          </p>
          <button
            type="button"
            onClick={() => void handlePasswordReset()}
            disabled={isResettingPassword || isSubmitting}
            className="mt-3 text-sm font-semibold text-blue-100 underline-offset-4 transition hover:text-white hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResettingPassword
              ? "Enviando recuperacion..."
              : "Recuperar contrasena"}
          </button>
        </section>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
          <div className="border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            Cargando registro...
          </div>
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
