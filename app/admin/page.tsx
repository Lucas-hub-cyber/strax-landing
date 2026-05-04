"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AuthGate } from "@/components/auth/AuthGate";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import type { UserProfile } from "@/types/auth";
import type { Client } from "@/types/straxWorkspace";

const clientStatuses = [
  "Lead recibido",
  "Diagnostico pendiente",
  "Arquitectura solicitada",
  "Arquitectura activa",
  "Intervencion activa",
  "Cerrado",
];

function AdminContent() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [message, setMessage] = useState("Cargando consola admin...");
  const [clientName, setClientName] = useState("");
  const [clientIndustry, setClientIndustry] = useState("");
  const [clientStatus, setClientStatus] = useState(clientStatuses[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  async function loadAdminData() {
    if (!isSupabaseConfigured || !supabase) {
      setMessage("Supabase no esta configurado.");
      return;
    }

    const [profileResult, clientResult] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (profileResult.error || clientResult.error) {
      setMessage(
        profileResult.error?.message ??
          clientResult.error?.message ??
          "No se pudo cargar admin.",
      );
      return;
    }

    setProfiles((profileResult.data ?? []) as UserProfile[]);
    setClients((clientResult.data ?? []) as Client[]);
    setMessage("Consola admin lista.");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAdminData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(clients.map((client) => client.status))).sort();
  }, [clients]);

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        client.name.toLowerCase().includes(normalizedSearch) ||
        (client.industry ?? "").toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [clients, searchTerm, statusFilter]);

  const activeClients = clients.filter((client) =>
    ["Arquitectura activa", "Arquitectura solicitada", "Intervencion activa"].includes(
      client.status,
    ),
  ).length;

  const pendingClients = clients.filter((client) =>
    ["Lead recibido", "Diagnostico pendiente", "Arquitectura solicitada"].includes(
      client.status,
    ),
  ).length;

  async function handleCreateClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      setMessage("Supabase no esta configurado.");
      return;
    }

    const normalizedName = clientName.trim();

    if (!normalizedName) {
      setMessage("Escribe el nombre del cliente antes de crearlo.");
      return;
    }

    setIsCreatingClient(true);
    setMessage("Creando cliente...");

    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: normalizedName,
        industry: clientIndustry.trim() || "Sin clasificar",
        status: clientStatus,
      })
      .select("*")
      .single<Client>();

    setIsCreatingClient(false);

    if (error || !data) {
      setMessage(error?.message ?? "No se pudo crear el cliente.");
      return;
    }

    setClients((currentClients) => [data, ...currentClients]);
    setClientName("");
    setClientIndustry("");
    setClientStatus(clientStatuses[0]);
    setMessage(`Cliente creado: ${data.name}.`);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_46%,#020617_100%)] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/workspace/demo-client"
          className="text-sm font-medium text-slate-300 transition hover:text-white"
        >
          {"<-"} Workspace
        </Link>

        <header className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
            STRAX Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            Consola de clientes
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
            Panel operativo para registrar clientes, priorizar la cola y entrar
            al workspace de arquitectura o intervencion sin perder tiempo.
          </p>
          <p className="mt-4 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-50">
            {message}
          </p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Usuarios", profiles.length],
            ["Clientes", clients.length],
            ["Activos", activeClients],
            ["Pendientes", pendingClients],
          ].map(([label, value]) => (
            <article
              key={label}
              className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            </article>
          ))}
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Usuarios y roles
            </p>
            <div className="mt-5 space-y-3">
              {profiles.length ? (
                profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {profile.full_name || profile.email || profile.user_id}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {profile.email}
                        </p>
                      </div>
                      <span className="w-fit rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-100">
                        {profile.role}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.25rem] border border-dashed border-white/15 bg-slate-950/30 p-5 text-sm leading-6 text-slate-400">
                  No hay perfiles. Crea usuarios en Supabase Auth y agrega filas
                  en `user_profiles`.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                  Clientes
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                  Cola operativa
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void loadAdminData()}
                className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Actualizar
              </button>
            </div>

            <form
              onSubmit={handleCreateClient}
              className="mt-5 grid gap-3 rounded-[1.25rem] border border-blue-300/15 bg-blue-400/10 p-4"
            >
              <div className="grid gap-3 lg:grid-cols-[1fr_0.8fr_0.8fr]">
                <label className="grid gap-2 text-sm font-semibold text-blue-50">
                  Cliente
                  <input
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="Nombre de empresa"
                    className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-200/50"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-blue-50">
                  Industria
                  <input
                    value={clientIndustry}
                    onChange={(event) => setClientIndustry(event.target.value)}
                    placeholder="Servicios, retail..."
                    className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-200/50"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-blue-50">
                  Estado
                  <select
                    value={clientStatus}
                    onChange={(event) => setClientStatus(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-blue-200/50"
                  >
                    {clientStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="submit"
                disabled={isCreatingClient}
                className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingClient ? "Creando..." : "Crear cliente"}
              </button>
            </form>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_0.65fr]">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar cliente o industria"
                className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-200/50"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-blue-200/50"
              >
                <option value="all">Todos los estados</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {filteredClients.length ? (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="font-semibold text-white">{client.name}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {client.industry ?? "Sin industria"} | {client.status}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/workspace/${client.id}`}
                          className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
                        >
                          Workspace
                        </Link>
                        <Link
                          href={`/workspace/${client.id}/architecture`}
                          className="rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-2 text-xs font-semibold text-blue-100 transition hover:bg-blue-400/20"
                        >
                          Arquitectura
                        </Link>
                        <Link
                          href={`/workspace/${client.id}/intervention`}
                          className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
                        >
                          Intervencion
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.25rem] border border-dashed border-white/15 bg-slate-950/30 p-5 text-sm leading-6 text-slate-400">
                  No hay clientes para ese filtro.
                </p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-100">
            Siguiente seguridad
          </p>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-amber-50/90 md:grid-cols-2">
            <p>Activar RLS en Supabase para clientes, sesiones e intervenciones.</p>
            <p>Asignar arquitectos a clientes con `client_memberships`.</p>
            <p>Crear auditoria de cambios por usuario.</p>
            <p>Agregar envio de resumen al cerrar una intervencion.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <AuthGate allowedRoles={["admin"]}>
      <AdminContent />
    </AuthGate>
  );
}
