import Link from "next/link";

import {
  CriticalAlert,
  DashboardFrame,
  EconomicImpact,
  FounderModule,
  MetricCards,
  Recommendations,
  StructuralRadar,
  type CriticalAlertData,
  type EconomicImpactData,
  type FounderData,
  type MetricCardData,
  type RecommendationData,
  type StructuralLayer,
} from "@/components/workspace/DashboardShell";
import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabaseAdmin";
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

type DashboardModel = {
  metrics: MetricCardData[];
  layers: StructuralLayer[];
  alert: CriticalAlertData;
  founder: FounderData;
  economicImpact: EconomicImpactData;
  recommendation: RecommendationData;
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
  iia: 62,
  ira: 71,
  mie_percent: 8.4,
  founder_dependency: "high",
  process_level: "partial",
  raw_result: {
    result: {
      layers: {
        strategy: 72,
        governance: 65,
        operations: 70,
        data: 38,
        technology: 80,
      },
      founder: 58,
      CEA: 126000000,
      MIE_percent: 8.4,
    },
  },
  created_at: "2026-05-02T15:00:00.000Z",
};

const demoRoadmapItems: RoadmapItem[] = [
  {
    id: "roadmap-1",
    client_id: demoClient.id,
    phase: "Fase 1 Diagnostico",
    title: "Validar fractura estructural principal",
    description:
      "Contrastar dependencia del fundador, control operativo y calidad de datos.",
    status: "done",
    priority: "high",
    created_at: "2026-04-28T15:05:00.000Z",
  },
  {
    id: "roadmap-2",
    client_id: demoClient.id,
    phase: "Fase 2 Arquitectura",
    title: "Definir arquitectura objetivo",
    description:
      "Disenar gobierno, roles, flujo operativo ideal y modelo de datos.",
    status: "in_progress",
    priority: "critical",
    created_at: "2026-04-28T15:10:00.000Z",
  },
  {
    id: "roadmap-3",
    client_id: demoClient.id,
    phase: "Fase 3 Integracion",
    title: "Construir roadmap 0-90 dias",
    description: "Ordenar prioridades por impacto y responsables.",
    status: "pending",
    priority: "high",
    created_at: "2026-04-28T15:15:00.000Z",
  },
];

const demoSessions: Session[] = [
  {
    id: "session-1",
    client_id: demoClient.id,
    session_type: "Lectura estructural",
    session_date: "2026-05-02T15:00:00.000Z",
    status: "scheduled",
    notes: "Revisar hipotesis y priorizar arquitectura objetivo.",
    created_at: "2026-04-28T15:30:00.000Z",
  },
];

const demoDecisions: Decision[] = [
  {
    id: "decision-1",
    client_id: demoClient.id,
    title: "Separar decisiones operativas de decisiones estrategicas",
    description: "Reducir carga del fundador y ordenar gobernanza semanal.",
    impact: "Alto",
    created_at: "2026-04-28T15:35:00.000Z",
  },
];

const demoRisks: Risk[] = [
  {
    id: "risk-1",
    client_id: demoClient.id,
    title: "Dependencia critica del fundador",
    severity: "critical",
    impact: "Riesgo de cuello de botella en ejecucion y margen.",
    status: "open",
    created_at: "2026-04-28T15:40:00.000Z",
  },
];

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

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

function getRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getNumber(value: unknown, fallback = 0) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDemoWorkspaceData(
  searchParams: WorkspaceSearchParams = {},
): WorkspaceData {
  const iia = getNumberParam(searchParams.iia);
  const ira = getNumberParam(searchParams.ira);
  const mie = getNumberParam(searchParams.mie);
  const founderDependency = getFirstParam(searchParams.founder_dependency);
  const processLevel = getFirstParam(searchParams.process_level);

  return {
    client: demoClient,
    latestAssessment: {
      ...demoAssessment,
      iia: iia ?? demoAssessment.iia,
      ira: ira ?? demoAssessment.ira,
      mie_percent: mie ?? demoAssessment.mie_percent,
      founder_dependency:
        founderDependency ?? demoAssessment.founder_dependency,
      process_level: processLevel ?? demoAssessment.process_level,
    },
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

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return {
      client: null,
      latestAssessment: null,
      roadmapItems: [],
      sessions: [],
      decisions: [],
      risks: [],
      error:
        "Supabase admin no esta configurado. Define NEXT_SUPABASE_SERVICE_ROLE_KEY para cargar clientes reales.",
    };
  }

  const { data: client, error: clientError } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle<Client>();

  if (clientError || !client) {
    return {
      client: null,
      latestAssessment: null,
      roadmapItems: [],
      sessions: [],
      decisions: [],
      risks: [],
      error: clientError?.message ?? "Cliente no encontrado.",
    };
  }

  const [
    assessmentResult,
    roadmapResult,
    sessionsResult,
    decisionsResult,
    risksResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("assessments")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<Assessment>(),
    supabaseAdmin
      .from("roadmap_items")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("sessions")
      .select("*")
      .eq("client_id", client.id)
      .order("session_date", { ascending: false }),
    supabaseAdmin
      .from("decisions")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
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
}

function getRawResult(assessment: Assessment | null) {
  const raw = getRecord(assessment?.raw_result);
  return getRecord(raw.result).IIA !== undefined ? getRecord(raw.result) : raw;
}

function getLayerScore(
  layers: Record<string, unknown>,
  key: string,
  fallback: number,
) {
  return clamp(Math.round(getNumber(layers[key], fallback)));
}

function buildLayerFallbacks(assessment: Assessment | null) {
  const iia = getNumber(assessment?.iia, 62);
  const mie = getNumber(assessment?.mie_percent, 8.4);
  const founderDependency = assessment?.founder_dependency;
  const processLevel = assessment?.process_level;

  return {
    strategy: clamp(iia + 10),
    governance:
      founderDependency === "high"
        ? 48
        : founderDependency === "medium"
          ? 64
          : 78,
    operations:
      processLevel === "none" ? 42 : processLevel === "partial" ? 63 : 78,
    data: mie >= 15 ? 38 : mie >= 8 ? 52 : 72,
    technology: processLevel === "defined" ? 80 : 68,
  };
}

function buildDashboardModel(assessment: Assessment | null): DashboardModel {
  const result = getRawResult(assessment);
  const resultLayers = getRecord(result.layers);
  const fallbacks = buildLayerFallbacks(assessment);
  const iia = Math.round(getNumber(result.IIA, getNumber(assessment?.iia, 0)));
  const ira = Math.round(getNumber(result.IRA, getNumber(assessment?.ira, 0)));
  const mie = getNumber(
    result.MIE_percent,
    getNumber(assessment?.mie_percent, 0),
  );
  const annualLoss = getNumber(result.CEA, 0) || 126000000;
  const revenue = mie > 0 ? annualLoss / (mie / 100) : 1500000000;
  const founderValue = Math.round(
    getNumber(
      result.founder,
      assessment?.founder_dependency === "high"
        ? 58
        : assessment?.founder_dependency === "medium"
          ? 70
          : 82,
    ),
  );
  const layers: StructuralLayer[] = [
    {
      key: "strategy",
      label: "Estrategia",
      value: getLayerScore(resultLayers, "strategy", fallbacks.strategy),
    },
    {
      key: "governance",
      label: "Gobierno",
      value: getLayerScore(resultLayers, "governance", fallbacks.governance),
    },
    {
      key: "operations",
      label: "Operacion",
      value: getLayerScore(resultLayers, "operations", fallbacks.operations),
    },
    {
      key: "data",
      label: "Datos",
      value: getLayerScore(resultLayers, "data", fallbacks.data),
    },
    {
      key: "technology",
      label: "Tecnologia",
      value: getLayerScore(resultLayers, "technology", fallbacks.technology),
    },
  ];
  const weakestLayer = [...layers].sort((a, b) => a.value - b.value)[0];
  const founderStatus =
    founderValue >= 76 ? "Estable" : founderValue >= 56 ? "Condicional" : "Critico";

  return {
    metrics: [
      {
        label: "IIA",
        title: "Indice de Integridad Arquitectonica",
        value: iia ? String(iia) : "N/A",
        detail: iia >= 76 ? "Estable" : iia >= 56 ? "Inestable" : "Critico",
        tone: iia >= 76 ? "green" : iia >= 56 ? "yellow" : "red",
      },
      {
        label: "IRA",
        title: "Indice de Riesgo Arquitectonico",
        value: ira ? String(ira) : "N/A",
        detail: ira >= 70 ? "Riesgo alto" : ira >= 50 ? "Riesgo medio" : "Riesgo bajo",
        tone: ira >= 70 ? "red" : ira >= 50 ? "yellow" : "green",
      },
      {
        label: "MIE",
        title: "Margen Invisible Estructural",
        value: `${mie.toFixed(1)}%`,
        detail: "Fuga estimada",
        tone: mie >= 10 ? "red" : mie >= 5 ? "yellow" : "green",
        footer: `${formatMoney(annualLoss)} / ano`,
      },
    ],
    layers,
    alert: {
      layer: weakestLayer,
      iiaImpact: `-${Math.max(4, 76 - weakestLayer.value)} puntos`,
      iraImpact: `+${Math.max(6, 100 - weakestLayer.value)} puntos`,
      economicImpact: formatMoney(annualLoss),
    },
    founder: {
      value: founderValue,
      status: founderStatus,
      risks:
        assessment?.founder_dependency === "high"
          ? [
              "Alta centralizacion",
              "Baja delegacion estructurada",
              "Decisiones no trazables",
            ]
          : [
              "Delegacion parcial",
              "Gobierno dependiente de rutina",
              "Riesgo de escalamiento informal",
            ],
    },
    economicImpact: {
      revenue: formatMoney(revenue),
      annualLoss: formatMoney(annualLoss),
      causes: [
        weakestLayer.label === "Datos" ? "Mala calidad de datos" : "Retrabajo operativo",
        "Decisiones no trazables",
        "Dependencia del fundador",
      ],
    },
    recommendation: {
      actions: [
        "Redisenar arquitectura de datos",
        "Definir gobierno de informacion",
        "Separar decisiones operativas y estrategicas",
      ],
      projectedIia: `+${Math.max(12, 82 - iia)} puntos`,
      projectedIra: `-${Math.max(14, ira - 42)} puntos`,
      recovery: `+${Math.max(4, Math.round(mie * 0.65))}%`,
    },
  };
}

function RoadmapSummary({ items }: { items: RoadmapItem[] }) {
  const topItems = items.slice(0, 4);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <p className="text-sm font-semibold text-white">Siguiente paso</p>
      <div className="mt-4 space-y-3">
        {topItems.length ? (
          topItems.map((item) => (
            <div key={item.id} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
              <p className="text-sm font-semibold text-white/88">{item.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/45">
                {item.phase} | {item.status}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-white/55">
            Sin roadmap registrado para este cliente.
          </p>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <ContinueArchitectureButton />
        <NewSessionButton />
      </div>
    </section>
  );
}

function EvidencePanel({
  decisions,
  risks,
}: {
  decisions: Decision[];
  risks: Risk[];
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <p className="text-sm font-semibold text-white">Evidencia operativa</p>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/45">
            Decisiones
          </p>
          <div className="mt-3 space-y-3">
            {decisions.slice(0, 3).map((decision) => (
              <div key={decision.id} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                <p className="text-sm font-medium text-white/82">
                  {decision.title}
                </p>
                {decision.impact ? (
                  <p className="mt-1 text-xs text-white/45">
                    Impacto: {decision.impact}
                  </p>
                ) : null}
              </div>
            ))}
            {!decisions.length ? (
              <p className="text-sm text-white/55">Sin decisiones registradas.</p>
            ) : null}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/45">
            Riesgos
          </p>
          <div className="mt-3 space-y-3">
            {risks.slice(0, 3).map((risk) => (
              <div key={risk.id} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                <p className="text-sm font-medium text-white/82">{risk.title}</p>
                <p className="mt-1 text-xs text-white/45">
                  {risk.severity} | {risk.status}
                </p>
              </div>
            ))}
            {!risks.length ? (
              <p className="text-sm text-white/55">Sin riesgos registrados.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
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
  const model = buildDashboardModel(latestAssessment);
  const evaluationDate = formatDate(
    latestAssessment?.created_at ??
      workspace.sessions[0]?.session_date ??
      client?.created_at,
  );

  return (
    <DashboardFrame
      clientName={client?.name ?? "Cliente no encontrado"}
      evaluationDate={evaluationDate}
    >
      {workspace.error ? (
        <div className="mb-5 rounded-lg border border-[#C9A227]/40 bg-[#C9A227]/10 p-4 text-sm leading-6 text-white/78">
          {workspace.error} Puedes seguir usando{" "}
          <Link href="/workspace/demo-client" className="font-semibold underline">
            demo-client
          </Link>
          .
        </div>
      ) : null}

      <section id="resumen-ejecutivo" className="space-y-5">
        <MetricCards metrics={model.metrics} />

        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <StructuralRadar layers={model.layers} />
          <div className="grid gap-5">
            <CriticalAlert alert={model.alert} />
            <FounderModule founder={model.founder} />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.8fr_1fr]">
          <EconomicImpact impact={model.economicImpact} />
          <Recommendations recommendation={model.recommendation} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <RoadmapSummary items={workspace.roadmapItems} />
          <EvidencePanel
            decisions={workspace.decisions}
            risks={workspace.risks}
          />
        </div>
      </section>
    </DashboardFrame>
  );
}
