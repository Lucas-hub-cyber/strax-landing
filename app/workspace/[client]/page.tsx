import Link from "next/link";

import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import type {
  Assessment,
  Client,
  Decision,
  Risk,
  RoadmapItem,
  Session,
} from "@/types/straxWorkspace";

import {
  ContinueArchitectureButton,
  NewSessionButton,
} from "./WorkspaceActions";
import { WorkspaceIdentity } from "@/components/workspace/WorkspaceIdentity";

type WorkspaceData = {
  client: Client | null;
  latestAssessment: Assessment | null;
  roadmapItems: RoadmapItem[];
  sessions: Session[];
  decisions: Decision[];
  risks: Risk[];
  error?: string;
};

type WorkspaceSearchParams = {
  iia?: string | string[];
  ira?: string | string[];
  mie?: string | string[];
  founder_dependency?: string | string[];
  process_level?: string | string[];
};

const demoClient: Client = {
  id: "demo-client",
  name: "Cliente Demo STRAX",
  industry: "Servicios B2B",
  status: "Arquitectura activa",
  created_at: "2026-04-28T00:00:00.000Z",
};

const demoAssessment: Assessment = {
  id: "assessment-demo",
  client_id: demoClient.id,
  iia: 58,
  ira: 74,
  mie_percent: 16,
  founder_dependency: "high",
  process_level: "partial",
  raw_result: null,
  created_at: "2026-04-28T15:00:00.000Z",
};

const demoRoadmapItems: RoadmapItem[] = [
  {
    id: "roadmap-1",
    client_id: demoClient.id,
    phase: "Fase 1 Diagnóstico",
    title: "Validar fractura estructural principal",
    description: "Contrastar dependencia del fundador, control operativo y calidad de datos.",
    status: "done",
    priority: "high",
    created_at: "2026-04-28T15:05:00.000Z",
  },
  {
    id: "roadmap-2",
    client_id: demoClient.id,
    phase: "Fase 2 Arquitectura",
    title: "Definir arquitectura objetivo",
    description: "Diseñar gobierno, roles, flujo operativo ideal y modelo de datos.",
    status: "in_progress",
    priority: "critical",
    created_at: "2026-04-28T15:10:00.000Z",
  },
  {
    id: "roadmap-3",
    client_id: demoClient.id,
    phase: "Fase 3 Integración",
    title: "Construir roadmap 0-90 días",
    description: "Ordenar prioridades por impacto y responsables de implementación.",
    status: "pending",
    priority: "high",
    created_at: "2026-04-28T15:15:00.000Z",
  },
  {
    id: "roadmap-4",
    client_id: demoClient.id,
    phase: "Fase 4 Control",
    title: "Diseñar tablero de seguimiento",
    description: "Definir KPIs, control de avance y revisión de madurez.",
    status: "pending",
    priority: "medium",
    created_at: "2026-04-28T15:20:00.000Z",
  },
];

const demoSessions: Session[] = [
  {
    id: "session-1",
    client_id: demoClient.id,
    session_type: "Lectura estructural",
    session_date: "2026-04-29T15:00:00.000Z",
    status: "scheduled",
    notes: "Revisar hipótesis y priorizar arquitectura objetivo.",
    created_at: "2026-04-28T15:30:00.000Z",
  },
];

const demoDecisions: Decision[] = [
  {
    id: "decision-1",
    client_id: demoClient.id,
    title: "Separar decisiones operativas de decisiones estratégicas",
    description: "Reducir carga del fundador y ordenar gobernanza semanal.",
    impact: "Alto",
    created_at: "2026-04-28T15:35:00.000Z",
  },
];

const demoRisks: Risk[] = [
  {
    id: "risk-1",
    client_id: demoClient.id,
    title: "Dependencia crítica del fundador",
    severity: "critical",
    impact: "Riesgo de cuello de botella en ejecución y margen.",
    status: "open",
    created_at: "2026-04-28T15:40:00.000Z",
  },
];

const roadmapPhases = [
  "Fase 1 Diagnóstico",
  "Fase 2 Arquitectura",
  "Fase 3 Integración",
  "Fase 4 Control",
];

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getNumberParam(value: string | string[] | undefined) {
  const rawValue = getFirstParam(value);

  if (!rawValue) {
    return null;
  }

  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function getDemoWorkspaceData(
  searchParams: WorkspaceSearchParams = {},
): WorkspaceData {
  const iia = getNumberParam(searchParams.iia);
  const ira = getNumberParam(searchParams.ira);
  const mie = getNumberParam(searchParams.mie);
  const founderDependency = getFirstParam(searchParams.founder_dependency);
  const processLevel = getFirstParam(searchParams.process_level);
  const latestAssessment = {
    ...demoAssessment,
    iia: iia ?? demoAssessment.iia,
    ira: ira ?? demoAssessment.ira,
    mie_percent: mie ?? demoAssessment.mie_percent,
    founder_dependency:
      founderDependency ?? demoAssessment.founder_dependency,
    process_level: processLevel ?? demoAssessment.process_level,
    raw_result: searchParams,
    created_at: new Date().toISOString(),
  };

  return {
    client: demoClient,
    latestAssessment,
    roadmapItems: demoRoadmapItems,
    sessions: demoSessions,
    decisions: demoDecisions,
    risks: demoRisks,
  };
}

async function getWorkspaceData(
  clientId: string,
  searchParams: WorkspaceSearchParams = {},
): Promise<WorkspaceData> {
  if (clientId === "demo-client") {
    return getDemoWorkspaceData(searchParams);
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      client: null,
      latestAssessment: null,
      roadmapItems: [],
      sessions: [],
      decisions: [],
      risks: [],
      error:
        "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para cargar clientes reales.",
    };
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle<Client>();

  if (clientError) {
    return {
      client: null,
      latestAssessment: null,
      roadmapItems: [],
      sessions: [],
      decisions: [],
      risks: [],
      error: `No se pudo cargar el cliente: ${clientError.message}`,
    };
  }

  if (!client) {
    return {
      client: null,
      latestAssessment: null,
      roadmapItems: [],
      sessions: [],
      decisions: [],
      risks: [],
    };
  }

  try {
    const [
      assessmentResult,
      roadmapResult,
      sessionsResult,
      decisionsResult,
      risksResult,
    ] = await Promise.all([
      supabase
        .from("assessments")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<Assessment>(),
      supabase
        .from("roadmap_items")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("sessions")
        .select("*")
        .eq("client_id", client.id)
        .order("session_date", { ascending: false }),
      supabase
        .from("decisions")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("risks")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false }),
    ]);

    const firstError =
      assessmentResult.error ??
      roadmapResult.error ??
      sessionsResult.error ??
      decisionsResult.error ??
      risksResult.error;

    return {
      client,
      latestAssessment: assessmentResult.data ?? null,
      roadmapItems: (roadmapResult.data ?? []) as RoadmapItem[],
      sessions: (sessionsResult.data ?? []) as Session[],
      decisions: (decisionsResult.data ?? []) as Decision[],
      risks: (risksResult.data ?? []) as Risk[],
      error: firstError
        ? `Algunos datos no se pudieron cargar: ${firstError.message}`
        : undefined,
    };
  } catch (error) {
    return {
      client,
      latestAssessment: null,
      roadmapItems: [],
      sessions: [],
      decisions: [],
      risks: [],
      error:
        error instanceof Error
          ? error.message
          : "Supabase falló al cargar el workspace.",
    };
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getStatusTone(status: string) {
  const normalized = status.toLowerCase();

  if (["done", "completed", "closed"].includes(normalized)) {
    return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  }

  if (["in_progress", "active", "scheduled"].includes(normalized)) {
    return "border-blue-300/20 bg-blue-400/10 text-blue-100";
  }

  return "border-white/10 bg-white/5 text-slate-300";
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-white/15 bg-white/5 p-5 text-sm leading-6 text-slate-400">
      {label}
    </div>
  );
}

export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ client: string }>;
  searchParams: Promise<WorkspaceSearchParams>;
}) {
  const { client: clientParam } = await params;
  const resolvedSearchParams = await searchParams;
  const workspace = await getWorkspaceData(clientParam, resolvedSearchParams);
  const client = workspace.client;
  const latestAssessment = workspace.latestAssessment;
  const priorityRisks = workspace.risks.filter((risk) =>
    ["critical", "high"].includes(risk.severity.toLowerCase()),
  );
  const priorityItems = workspace.roadmapItems.filter((item) =>
    ["critical", "high"].includes(item.priority.toLowerCase()),
  );
  const lastReview =
    latestAssessment?.created_at ??
    workspace.sessions[0]?.session_date ??
    client?.created_at;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_46%,#020617_100%)] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-slate-300 transition hover:text-white"
        >
          {"<-"} Volver al landing
        </Link>

        {workspace.error ? (
          <div className="mt-6 rounded-[1.25rem] border border-amber-300/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
            {workspace.error} Puedes seguir usando{" "}
            <Link href="/workspace/demo-client" className="font-semibold underline">
              demo-client
            </Link>
            .
          </div>
        ) : null}

        <div className="mt-6">
          <WorkspaceIdentity
            clientName={client?.name ?? "Cliente no encontrado"}
            clientDetail={`${client?.industry ?? "Industria sin registrar"} · ${client?.status ?? "Sin estado"} · Ultima revision: ${formatDate(lastReview)}`}
            context="Workspace del cliente"
          />
        </div>

        <header className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.75)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
                Lectura ejecutiva
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                Estado estructural del sistema
              </h1>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span
                  className={`rounded-full border px-4 py-2 ${getStatusTone(
                    client?.status ?? "Sin estado",
                  )}`}
                >
                  {client?.status ?? "Sin estado"}
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-slate-300">
                  Última revisión: {formatDate(lastReview)}
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-slate-300">
                  {client?.industry ?? "Industria sin registrar"}
                </span>
              </div>
            </div>
            <NewSessionButton />
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["IIA", latestAssessment?.iia ?? "N/A"],
            ["IRA", latestAssessment?.ira ?? "N/A"],
            ["MIE", latestAssessment?.mie_percent !== null && latestAssessment?.mie_percent !== undefined ? `${latestAssessment.mie_percent}%` : "N/A"],
            ["Founder dependency", latestAssessment?.founder_dependency ?? "N/A"],
            ["Process level", latestAssessment?.process_level ?? "N/A"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                {label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Roadmap STRAX
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {roadmapPhases.map((phase) => {
                const items = workspace.roadmapItems.filter(
                  (item) => item.phase === phase,
                );

                return (
                  <article
                    id={phase === "Fase 2 Arquitectura" ? "fase-2-arquitectura" : undefined}
                    key={phase}
                    className={`scroll-mt-8 rounded-[1.5rem] border p-5 ${
                      phase === "Fase 2 Arquitectura"
                        ? "border-blue-300/30 bg-blue-400/10"
                        : "border-white/10 bg-slate-950/50"
                    }`}
                  >
                    <h2 className="text-lg font-semibold text-white">{phase}</h2>
                    <div className="mt-4 space-y-3">
                      {items.length ? (
                        items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-[1.1rem] border border-white/10 bg-white/5 p-4"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-white">
                                {item.title}
                              </p>
                              <span
                                className={`rounded-full border px-3 py-1 text-xs ${getStatusTone(
                                  item.status,
                                )}`}
                              >
                                {item.status}
                              </span>
                            </div>
                            {item.description ? (
                              <p className="mt-2 text-sm leading-6 text-slate-300">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <EmptyState label="Sin acciones registradas para esta fase." />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                Prioridades
              </p>
              <div className="mt-5 space-y-3">
                {[...priorityRisks, ...priorityItems].length ? (
                  <>
                    {priorityRisks.map((risk) => (
                      <div
                        key={risk.id}
                        className="rounded-[1.1rem] border border-red-300/20 bg-red-400/10 p-4"
                      >
                        <p className="font-semibold text-red-50">{risk.title}</p>
                        <p className="mt-2 text-sm leading-6 text-red-50/80">
                          {risk.impact ?? "Impacto sin registrar"}
                        </p>
                      </div>
                    ))}
                    {priorityItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[1.1rem] border border-blue-300/20 bg-blue-400/10 p-4"
                      >
                        <p className="font-semibold text-blue-50">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-blue-50/80">
                          {item.phase} · prioridad {item.priority}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <EmptyState label="Sin prioridades críticas registradas." />
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                Sesiones
              </p>
              <div className="mt-5 space-y-3">
                {workspace.sessions.length ? (
                  workspace.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-[1.1rem] border border-white/10 bg-white/5 p-4"
                    >
                      <p className="font-semibold text-white">
                        {session.session_type}
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        {formatDate(session.session_date)} · {session.status}
                      </p>
                      {session.notes ? (
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {session.notes}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <EmptyState label="Sin sesiones registradas." />
                )}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Decisiones arquitectónicas
            </p>
            <div className="mt-5 space-y-3">
              {workspace.decisions.length ? (
                workspace.decisions.map((decision) => (
                  <div
                    key={decision.id}
                    className="rounded-[1.1rem] border border-white/10 bg-slate-950/40 p-4"
                  >
                    <p className="font-semibold text-white">{decision.title}</p>
                    {decision.description ? (
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {decision.description}
                      </p>
                    ) : null}
                    {decision.impact ? (
                      <p className="mt-2 text-sm text-blue-100">
                        Impacto: {decision.impact}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyState label="Sin decisiones registradas." />
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Riesgos abiertos
            </p>
            <div className="mt-5 space-y-3">
              {workspace.risks.length ? (
                workspace.risks.map((risk) => (
                  <div
                    key={risk.id}
                    className="rounded-[1.1rem] border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{risk.title}</p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        {risk.severity}
                      </span>
                    </div>
                    {risk.impact ? (
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {risk.impact}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyState label="Sin riesgos registrados." />
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-blue-300/20 bg-blue-400/10 p-6 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
            STRAX LIVE
          </p>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-[-0.03em] text-white">
            Mantén la arquitectura viva después del diagnóstico.
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-blue-50/85">
            Este workspace reúne el seguimiento del cliente: lectura, arquitectura,
            integración, control, decisiones y riesgos en un solo punto operativo.
          </p>
          <div className="mt-5">
            <ContinueArchitectureButton />
          </div>
        </section>
      </div>
    </main>
  );
}
