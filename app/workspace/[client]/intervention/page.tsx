"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";

import { WorkspaceIdentity } from "@/components/workspace/WorkspaceIdentity";

type FounderProfile = {
  name: string;
  purpose: string;
  vision: string;
  frustration: string;
  bottleneck: string;
  operationalDependency: string;
  clarityLevel: string;
  delegationCapacity: string;
  governanceLevel: string;
};

type Finding = {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
};

type ProcessItem = {
  id: string;
  process: string;
  exists: string;
  documented: string;
  owner: string;
  risk: string;
};

type FinanceState = {
  monthlyRevenue: string;
  margin: string;
  profit: string;
  payroll: string;
  expenses: string;
  cac: string;
  cashflow: string;
  ebitda: string;
};

type FinanceFieldConfig = {
  label: string;
  key: keyof FinanceState;
  unit: string;
  placeholder: string;
  helper: string;
};

type BusinessCore = {
  offer: string;
  customer: string;
  coreProblem: string;
  revenueModel: string;
  criticalPromise: string;
  operatingModel: string;
};

type Decision = {
  id: string;
  title: string;
  priority: string;
  impact: string;
  owner: string;
  status: string;
};

type RoadmapTask = {
  id: string;
  title: string;
  owner: string;
  status: string;
  impact: string;
};

type GeneratedIntervention = {
  executiveSummary: string;
  structuralFractures: string[];
  priorities: string[];
  targetArchitecture: string[];
  roadmapSummary: string[];
};

type InterventionState = {
  interventionSessionId: string | null;
  founder: FounderProfile;
  businessCore: BusinessCore;
  transcript: string;
  findings: Finding[];
  processes: ProcessItem[];
  finances: FinanceState;
  decisions: Decision[];
  roadmap: {
    "30": RoadmapTask[];
    "60": RoadmapTask[];
    "90": RoadmapTask[];
  };
  generated: GeneratedIntervention | null;
  savedAt: string | null;
};

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const categories = [
  "estrategia",
  "gobernanza",
  "operacion",
  "datos",
  "tecnologia",
  "finanzas",
];

const severities = ["baja", "media", "alta", "critica"];
const statuses = ["pendiente", "en_progreso", "bloqueado", "hecho"];
const binaryStates = ["si", "no", "parcial"];

const financeFields: FinanceFieldConfig[] = [
  {
    label: "facturacion mensual",
    key: "monthlyRevenue",
    unit: "moneda / mes",
    placeholder: "ej. 120000000",
    helper: "Ingreso mensual aproximado antes de gastos.",
  },
  {
    label: "margen estimado",
    key: "margin",
    unit: "%",
    placeholder: "ej. 25",
    helper: "Porcentaje de margen. Escribe 25, no 0.25.",
  },
  {
    label: "utilidad estimada",
    key: "profit",
    unit: "moneda / mes",
    placeholder: "se puede estimar",
    helper: "Resultado mensual aproximado despues de costos principales.",
  },
  {
    label: "nomina",
    key: "payroll",
    unit: "moneda / mes",
    placeholder: "ej. 50000000",
    helper: "Costo mensual total de equipo y contratistas.",
  },
  {
    label: "gastos",
    key: "expenses",
    unit: "moneda / mes",
    placeholder: "ej. 12000000",
    helper: "Gastos operativos mensuales fuera de nomina.",
  },
  {
    label: "CAC si existe",
    key: "cac",
    unit: "moneda / cliente",
    placeholder: "no disponible",
    helper: "Costo de adquirir un cliente. Si no lo tienen, deja no disponible.",
  },
  {
    label: "flujo de caja estimado",
    key: "cashflow",
    unit: "moneda / mes",
    placeholder: "se puede estimar",
    helper: "Caja neta mensual aproximada. No exige precision contable.",
  },
  {
    label: "EBITDA estimado",
    key: "ebitda",
    unit: "moneda / mes",
    placeholder: "se puede estimar",
    helper: "Indicador operativo estimado antes de intereses, impuestos y depreciaciones.",
  },
];

const findingTemplates: Array<Omit<Finding, "id">> = [
  {
    title: "Founder concentra decisiones criticas",
    description: "La operacion depende de aprobaciones, criterio y memoria del founder.",
    severity: "critica",
    category: "gobernanza",
  },
  {
    title: "Proceso comercial sin trazabilidad",
    description: "No hay claridad suficiente sobre etapas, responsables, conversion y seguimiento.",
    severity: "alta",
    category: "operacion",
  },
  {
    title: "Finanzas sin lectura ejecutiva semanal",
    description: "La empresa no tiene una rutina simple para margen, caja, gastos y decisiones.",
    severity: "alta",
    category: "finanzas",
  },
  {
    title: "Datos dispersos entre herramientas",
    description: "La informacion clave vive en varias fuentes y dificulta decidir con velocidad.",
    severity: "alta",
    category: "datos",
  },
  {
    title: "Core del negocio no documentado",
    description: "La promesa, cliente ideal, modelo de ingreso y operacion critica no estan claros.",
    severity: "alta",
    category: "estrategia",
  },
];

const decisionTemplates: Array<Omit<Decision, "id">> = [
  {
    title: "Definir arquitectura comercial minima",
    priority: "alta",
    impact: "pipeline visible, responsables y seguimiento semanal",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Asignar ownership financiero",
    priority: "alta",
    impact: "lectura semanal de margen, caja y gastos",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Crear comite operativo semanal",
    priority: "media",
    impact: "ritmo de ejecucion, desbloqueos y accountability",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Documentar core del negocio",
    priority: "alta",
    impact: "alineacion sobre oferta, cliente, promesa y operacion critica",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Centralizar tablero ejecutivo",
    priority: "media",
    impact: "control de ventas, operacion, finanzas y riesgos",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Redefinir propuesta de valor",
    priority: "alta",
    impact: "claridad comercial y mejor conversion",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Priorizar segmento de cliente ideal",
    priority: "alta",
    impact: "enfoque comercial y menor dispersion operativa",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Crear score de oportunidades comerciales",
    priority: "media",
    impact: "mejor priorizacion de ventas y tiempo del equipo",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Estandarizar handoff ventas-operacion",
    priority: "alta",
    impact: "menos retrabajo entre venta, entrega y soporte",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Definir SLAs operativos",
    priority: "media",
    impact: "expectativas claras de respuesta, calidad y seguimiento",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Documentar procesos criticos",
    priority: "alta",
    impact: "operacion replicable y menor dependencia de memoria informal",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Crear matriz de roles y responsabilidades",
    priority: "alta",
    impact: "menos ambiguedad, duplicidad y decisiones frenadas",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Instalar reunion semanal de prioridades",
    priority: "media",
    impact: "foco, desbloqueo y seguimiento ejecutivo",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Separar decisiones estrategicas y operativas",
    priority: "alta",
    impact: "menos carga del founder y mejor gobierno",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Definir indicadores minimos por area",
    priority: "alta",
    impact: "control de ventas, margen, operacion y servicio",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Crear tablero de caja y margen",
    priority: "alta",
    impact: "visibilidad financiera para decisiones semanales",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Construir modelo basico de costos",
    priority: "media",
    impact: "entender rentabilidad por cliente, servicio o unidad",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Definir politica de precios y descuentos",
    priority: "media",
    impact: "proteger margen y evitar excepciones comerciales",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Unificar fuente de datos operativos",
    priority: "alta",
    impact: "menos versiones de la verdad y mayor trazabilidad",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Limpiar stack tecnologico",
    priority: "media",
    impact: "menos herramientas duplicadas y menor friccion del equipo",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Automatizar tareas repetitivas prioritarias",
    priority: "media",
    impact: "ahorro de tiempo sin automatizar caos",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Crear repositorio documental operativo",
    priority: "media",
    impact: "conocimiento centralizado y onboarding mas rapido",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Definir ritual de revision mensual",
    priority: "media",
    impact: "aprendizaje continuo y ajuste del sistema",
    owner: "",
    status: "pendiente",
  },
  {
    title: "Crear plan de sucesion operativa del founder",
    priority: "alta",
    impact: "reducir dependencia critica y habilitar escala",
    owner: "",
    status: "pendiente",
  },
];

const roadmapTemplates: Record<"30" | "60" | "90", Array<Omit<RoadmapTask, "id">>> = {
  "30": [
    {
      title: "Documentar core del negocio",
      owner: "",
      status: "pendiente",
      impact: "alineacion estrategica",
    },
    {
      title: "Mapear proceso comercial actual",
      owner: "",
      status: "pendiente",
      impact: "trazabilidad",
    },
    {
      title: "Definir tablero financiero minimo",
      owner: "",
      status: "pendiente",
      impact: "control de caja y margen",
    },
  ],
  "60": [
    {
      title: "Activar dashboard ejecutivo",
      owner: "",
      status: "pendiente",
      impact: "control semanal",
    },
    {
      title: "Formalizar responsables por proceso",
      owner: "",
      status: "pendiente",
      impact: "ownership operativo",
    },
    {
      title: "Instalar cadencia de comite operativo",
      owner: "",
      status: "pendiente",
      impact: "ritmo de ejecucion",
    },
  ],
  "90": [
    {
      title: "Estabilizar STRAX LIVE",
      owner: "",
      status: "pendiente",
      impact: "seguimiento continuo",
    },
    {
      title: "Auditar cumplimiento del roadmap",
      owner: "",
      status: "pendiente",
      impact: "control y ajustes",
    },
    {
      title: "Priorizar automatizaciones con evidencia",
      owner: "",
      status: "pendiente",
      impact: "mejora sin improvisar",
    },
  ],
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const initialState: InterventionState = {
  interventionSessionId: null,
  founder: {
    name: "",
    purpose: "",
    vision: "",
    frustration: "",
    bottleneck: "",
    operationalDependency: "alta",
    clarityLevel: "media",
    delegationCapacity: "media",
    governanceLevel: "debil",
  },
  businessCore: {
    offer: "",
    customer: "",
    coreProblem: "",
    revenueModel: "",
    criticalPromise: "",
    operatingModel: "",
  },
  transcript: "",
  findings: [
    {
      id: createId(),
      title: "Founder concentra decisiones criticas",
      description: "La operacion depende de aprobaciones y criterio del founder.",
      severity: "critica",
      category: "gobernanza",
    },
  ],
  processes: [
    "ventas",
    "operacion",
    "soporte",
    "compras",
    "finanzas",
    "proyectos",
    "marketing",
  ].map((process) => ({
    id: createId(),
    process,
    exists: "parcial",
    documented: "no",
    owner: "",
    risk: "",
  })),
  finances: {
    monthlyRevenue: "",
    margin: "",
    profit: "",
    payroll: "",
    expenses: "",
    cac: "",
    cashflow: "",
    ebitda: "",
  },
  decisions: [
    {
      id: createId(),
      title: "implementar CRM",
      priority: "alta",
      impact: "trazabilidad comercial",
      owner: "",
      status: "pendiente",
    },
    {
      id: createId(),
      title: "ownership financiero",
      priority: "alta",
      impact: "control semanal de margen",
      owner: "",
      status: "pendiente",
    },
    {
      id: createId(),
      title: "comite operativo",
      priority: "media",
      impact: "ritmo de ejecucion",
      owner: "",
      status: "pendiente",
    },
  ],
  roadmap: {
    "30": [
      {
        id: createId(),
        title: "documentar pipeline comercial",
        owner: "",
        status: "pendiente",
        impact: "trazabilidad",
      },
    ],
    "60": [
      {
        id: createId(),
        title: "activar dashboard ejecutivo",
        owner: "",
        status: "pendiente",
        impact: "control",
      },
    ],
    "90": [
      {
        id: createId(),
        title: "estabilizar STRAX LIVE",
        owner: "",
        status: "pendiente",
        impact: "seguimiento continuo",
      },
    ],
  },
  generated: null,
  savedAt: null,
};

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.9)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/50"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-300/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function getTranscriptMatches(transcript: string) {
  const normalized = transcript.toLowerCase();

  return {
    founder:
      normalized.includes("founder") ||
      normalized.includes("fundador") ||
      normalized.includes("aprobacion") ||
      normalized.includes("aprobaciones"),
    sales:
      normalized.includes("ventas") ||
      normalized.includes("comercial") ||
      normalized.includes("pipeline") ||
      normalized.includes("crm"),
    finance:
      normalized.includes("finanzas") ||
      normalized.includes("caja") ||
      normalized.includes("margen") ||
      normalized.includes("ebitda") ||
      normalized.includes("gastos"),
    data:
      normalized.includes("datos") ||
      normalized.includes("indicador") ||
      normalized.includes("kpi") ||
      normalized.includes("dashboard") ||
      normalized.includes("tablero"),
    process:
      normalized.includes("proceso") ||
      normalized.includes("operacion") ||
      normalized.includes("retrabajo") ||
      normalized.includes("whatsapp"),
    tech:
      normalized.includes("tecnologia") ||
      normalized.includes("herramienta") ||
      normalized.includes("software") ||
      normalized.includes("automatizar"),
  };
}

function buildGeneratedIntervention(state: InterventionState): GeneratedIntervention {
  const criticalFindings = state.findings.filter((finding) =>
    ["alta", "critica"].includes(finding.severity),
  );
  const riskyProcesses = state.processes.filter(
    (process) => process.exists !== "si" || process.documented !== "si" || process.risk,
  );
  const highDecisions = state.decisions.filter((decision) =>
    ["alta", "critica"].includes(decision.priority),
  );

  return {
    executiveSummary:
      `La intervencion detecta ${criticalFindings.length} fracturas de alta prioridad y ${riskyProcesses.length} procesos con riesgo operativo. ` +
      `El core del negocio queda definido alrededor de "${state.businessCore.offer || "la oferta principal"}". ` +
      "El foco inmediato es convertir dependencia, informalidad y baja trazabilidad en ownership, cadencia y control.",
    structuralFractures: criticalFindings.length
      ? criticalFindings.map(
          (finding) => `${finding.category}: ${finding.title} (${finding.severity})`,
        )
      : ["No hay fracturas criticas marcadas; validar evidencia antes de avanzar."],
    priorities: [
      state.founder.operationalDependency === "alta"
        ? "Reducir dependencia operativa del founder."
        : "Mantener gobierno activo sin perder velocidad.",
      riskyProcesses.length
        ? "Documentar y asignar ownership a procesos con riesgo."
        : "Auditar procesos documentados para asegurar ejecucion.",
      highDecisions[0]?.title
        ? `Ejecutar primero: ${highDecisions[0].title}.`
        : "Definir decision arquitectonica prioritaria.",
    ],
    targetArchitecture: [
      "Founder fuera de la operacion diaria repetible.",
      "Responsables por area con reuniones operativas semanales.",
      "Procesos criticos documentados y medidos.",
      "Indicadores minimos para ventas, margen, caja y ejecucion.",
      "Trazabilidad comercial y operativa en un sistema central.",
    ],
    roadmapSummary: [
      `30 dias: ${state.roadmap["30"].map((task) => task.title).join(", ") || "estabilizacion inicial"}.`,
      `60 dias: ${state.roadmap["60"].map((task) => task.title).join(", ") || "control operativo"}.`,
      `90 dias: ${state.roadmap["90"].map((task) => task.title).join(", ") || "evolucion STRAX LIVE"}.`,
    ],
  };
}

export default function InterventionPage() {
  const params = useParams<{ client: string }>();
  const clientId = params.client ?? "demo-client";
  const fallbackClientName =
    clientId === "demo-client" ? "Cliente Demo STRAX" : `Cliente ${clientId.slice(0, 8)}`;
  const storageKey = useMemo(() => `strax-intervention:${clientId}`, [clientId]);
  const [clientName, setClientName] = useState(fallbackClientName);
  const [state, setState] = useState<InterventionState>(initialState);
  const [newFinding, setNewFinding] = useState<Finding>({
    id: "",
    title: "",
    description: "",
    severity: "alta",
    category: "operacion",
  });
  const [newDecision, setNewDecision] = useState<Decision>({
    id: "",
    title: "",
    priority: "alta",
    impact: "",
    owner: "",
    status: "pendiente",
  });
  const [selectedFindingTemplate, setSelectedFindingTemplate] = useState("");
  const [selectedDecisionTemplate, setSelectedDecisionTemplate] = useState("");
  const [selectedRoadmapTemplate, setSelectedRoadmapTemplate] = useState<
    Record<"30" | "60" | "90", string>
  >({ "30": "", "60": "", "90": "" });
  const [newRoadmapTask, setNewRoadmapTask] = useState<
    Record<"30" | "60" | "90", RoadmapTask>
  >({
    "30": { id: "", title: "", owner: "", status: "pendiente", impact: "" },
    "60": { id: "", title: "", owner: "", status: "pendiente", impact: "" },
    "90": { id: "", title: "", owner: "", status: "pendiente", impact: "" },
  });
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    let cancelled = false;

    setClientName(fallbackClientName);

    async function loadClientName() {
      if (clientId === "demo-client") {
        return;
      }

      const response = await fetch(
        `/api/interventions?clientId=${encodeURIComponent(clientId)}`,
      );
      const data = (await response.json()) as {
        ok?: boolean;
        clientName?: string | null;
      };

      if (!cancelled && response.ok && data.ok && data.clientName) {
        setClientName(data.clientName);
      }
    }

    void loadClientName();

    return () => {
      cancelled = true;
    };
  }, [clientId, fallbackClientName]);

  useEffect(() => {
    let cancelled = false;

    const storedValue = window.localStorage.getItem(storageKey);

    if (storedValue) {
      try {
        const parsedState = JSON.parse(storedValue) as InterventionState;
        window.queueMicrotask(() => {
          if (!cancelled) {
            setState({
              ...initialState,
              ...parsedState,
              founder: { ...initialState.founder, ...parsedState.founder },
              businessCore: {
                ...initialState.businessCore,
                ...parsedState.businessCore,
              },
              finances: { ...initialState.finances, ...parsedState.finances },
              roadmap: { ...initialState.roadmap, ...parsedState.roadmap },
            });
          }
        });
      } catch {
        window.queueMicrotask(() => {
          if (!cancelled) {
            setSaveMessage("No se pudo cargar la intervencion guardada.");
          }
        });
      }
    }

    async function loadLatestIntervention() {
      if (clientId === "demo-client") {
        return;
      }

      const response = await fetch(
        `/api/interventions?clientId=${encodeURIComponent(clientId)}`,
      );
      const data = (await response.json()) as {
        ok?: boolean;
        clientName?: string | null;
        session?: Record<string, unknown> | null;
        findings?: {
          id: string;
          title?: string | null;
          description?: string | null;
          severity?: string | null;
          category?: string | null;
        }[];
      };

      if (!response.ok || !data.ok || !data.session) {
        return;
      }

      if (!cancelled && data.clientName) {
        setClientName(data.clientName);
      }

      const savedSession = data.session;
      const rawState =
        savedSession.raw_state && typeof savedSession.raw_state === "object"
          ? (savedSession.raw_state as Partial<InterventionState>)
          : {};
      const findings =
        data.findings?.map((finding) => ({
          id: finding.id as string,
          title: (finding.title as string) ?? "",
          description: (finding.description as string | null) ?? "",
          severity: (finding.severity as string | null) ?? "media",
          category: (finding.category as string | null) ?? "operacion",
        })) ??
        rawState.findings ??
        initialState.findings;

      const nextState: InterventionState = {
        ...initialState,
        ...rawState,
        interventionSessionId: savedSession.id as string,
        founder:
          (savedSession.founder_profile as FounderProfile | null) ??
          rawState.founder ??
          initialState.founder,
        businessCore: rawState.businessCore ?? initialState.businessCore,
        transcript:
          (savedSession.transcript as string | null) ??
          rawState.transcript ??
          "",
        finances:
          (savedSession.finances as FinanceState | null) ??
          rawState.finances ??
          initialState.finances,
        processes:
          (savedSession.processes as ProcessItem[] | null) ??
          rawState.processes ??
          initialState.processes,
        roadmap:
          (savedSession.roadmap as InterventionState["roadmap"] | null) ??
          rawState.roadmap ??
          initialState.roadmap,
        generated:
          (savedSession.generated_output as GeneratedIntervention | null) ??
          rawState.generated ??
          null,
        findings,
        savedAt:
          (savedSession.saved_at as string | null) ?? rawState.savedAt ?? null,
      };

      window.queueMicrotask(() => {
        if (!cancelled) {
          setState(nextState);
          window.localStorage.setItem(storageKey, JSON.stringify(nextState));
          setSaveMessage("Ultima intervencion STRAX cargada desde Supabase.");
        }
      });
    }

    void loadLatestIntervention();

    return () => {
      cancelled = true;
    };
  }, [clientId, storageKey]);

  function updateFounder(key: keyof FounderProfile, value: string) {
    setState((current) => ({
      ...current,
      founder: { ...current.founder, [key]: value },
    }));
  }

  function updateBusinessCore(key: keyof BusinessCore, value: string) {
    setState((current) => ({
      ...current,
      businessCore: { ...current.businessCore, [key]: value },
    }));
  }

  function updateFinance(key: keyof FinanceState, value: string) {
    setState((current) => ({
      ...current,
      finances: { ...current.finances, [key]: value },
    }));
  }

  function updateFinding(index: number, key: keyof Finding, value: string) {
    setState((current) => ({
      ...current,
      findings: current.findings.map((finding, findingIndex) =>
        findingIndex === index ? { ...finding, [key]: value } : finding,
      ),
    }));
  }

  function addFinding() {
    if (!newFinding.title.trim()) {
      return;
    }

    setState((current) => ({
      ...current,
      findings: [...current.findings, { ...newFinding, id: createId() }],
    }));
    setNewFinding({
      id: "",
      title: "",
      description: "",
      severity: "alta",
      category: "operacion",
    });
  }

  function addFindingFromTemplate(templateTitle: string) {
    const template = findingTemplates.find((item) => item.title === templateTitle);

    if (!template) {
      return;
    }

    setState((current) => ({
      ...current,
      findings: [...current.findings, { ...template, id: createId() }],
    }));
    setSelectedFindingTemplate("");
  }

  function removeFinding(id: string) {
    setState((current) => ({
      ...current,
      findings: current.findings.filter((finding) => finding.id !== id),
    }));
  }

  function updateProcess(index: number, key: keyof ProcessItem, value: string) {
    setState((current) => ({
      ...current,
      processes: current.processes.map((process, processIndex) =>
        processIndex === index ? { ...process, [key]: value } : process,
      ),
    }));
  }

  function updateDecision(index: number, key: keyof Decision, value: string) {
    setState((current) => ({
      ...current,
      decisions: current.decisions.map((decision, decisionIndex) =>
        decisionIndex === index ? { ...decision, [key]: value } : decision,
      ),
    }));
  }

  function addDecision() {
    if (!newDecision.title.trim()) {
      return;
    }

    setState((current) => ({
      ...current,
      decisions: [...current.decisions, { ...newDecision, id: createId() }],
    }));
    setNewDecision({
      id: "",
      title: "",
      priority: "alta",
      impact: "",
      owner: "",
      status: "pendiente",
    });
  }

  function addDecisionFromTemplate(templateTitle: string) {
    const template = decisionTemplates.find((item) => item.title === templateTitle);

    if (!template) {
      return;
    }

    setState((current) => ({
      ...current,
      decisions: [...current.decisions, { ...template, id: createId() }],
    }));
    setSelectedDecisionTemplate("");
  }

  function removeDecision(id: string) {
    setState((current) => ({
      ...current,
      decisions: current.decisions.filter((decision) => decision.id !== id),
    }));
  }

  function updateRoadmapTask(
    period: "30" | "60" | "90",
    index: number,
    key: keyof RoadmapTask,
    value: string,
  ) {
    setState((current) => ({
      ...current,
      roadmap: {
        ...current.roadmap,
        [period]: current.roadmap[period].map((task, taskIndex) =>
          taskIndex === index ? { ...task, [key]: value } : task,
        ),
      },
    }));
  }

  function addRoadmapTask(period: "30" | "60" | "90") {
    const task = newRoadmapTask[period];

    if (!task.title.trim()) {
      return;
    }

    setState((current) => ({
      ...current,
      roadmap: {
        ...current.roadmap,
        [period]: [...current.roadmap[period], { ...task, id: createId() }],
      },
    }));
    setNewRoadmapTask((current) => ({
      ...current,
      [period]: { id: "", title: "", owner: "", status: "pendiente", impact: "" },
    }));
  }

  function addRoadmapTaskFromTemplate(period: "30" | "60" | "90", title: string) {
    const template = roadmapTemplates[period].find((item) => item.title === title);

    if (!template) {
      return;
    }

    setState((current) => ({
      ...current,
      roadmap: {
        ...current.roadmap,
        [period]: [...current.roadmap[period], { ...template, id: createId() }],
      },
    }));
    setSelectedRoadmapTemplate((current) => ({ ...current, [period]: "" }));
  }

  function estimateFinance() {
    setState((current) => {
      const monthlyRevenue = Number(current.finances.monthlyRevenue) || 0;
      const margin = Number(current.finances.margin) || 0;
      const payroll = Number(current.finances.payroll) || 0;
      const expenses = Number(current.finances.expenses) || 0;
      const grossProfit = monthlyRevenue * (margin / 100);
      const ebitda = grossProfit - payroll - expenses;
      const cashflow = ebitda;

      return {
        ...current,
        finances: {
          ...current.finances,
          profit: current.finances.profit || String(Math.round(grossProfit)),
          ebitda: current.finances.ebitda || String(Math.round(ebitda)),
          cashflow: current.finances.cashflow || String(Math.round(cashflow)),
          cac: current.finances.cac || "no disponible",
        },
      };
    });
  }

  function startVoiceCapture() {
    if (typeof window === "undefined") {
      return;
    }

    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setVoiceMessage(
        "Tu navegador no soporta dictado directo. Usa Chrome o Edge, o pega la transcripcion manualmente.",
      );
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "es-CO";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.results.length - 1)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (!transcript) {
        return;
      }

      setState((current) => ({
        ...current,
        transcript: [current.transcript, transcript].filter(Boolean).join("\n"),
      }));
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceMessage("No se pudo capturar audio. Revisa permisos del microfono.");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceMessage("Capturando voz de la entrevista...");
    setIsListening(true);
  }

  function stopVoiceCapture() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setVoiceMessage("Captura detenida. Puedes procesar las notas cuando quieras.");
  }

  function processTranscriptIntoBlocks() {
    const matches = getTranscriptMatches(state.transcript);
    const nextFindings: Array<Omit<Finding, "id">> = [];
    const nextDecisions: Array<Omit<Decision, "id">> = [];
    const nextRoadmap: Partial<Record<"30" | "60" | "90", Array<Omit<RoadmapTask, "id">>>> = {};

    if (matches.founder) {
      nextFindings.push(findingTemplates[0]);
      nextDecisions.push(
        decisionTemplates.find(
          (decision) => decision.title === "Separar decisiones estrategicas y operativas",
        ) ?? decisionTemplates[0],
      );
      nextRoadmap["30"] = [
        ...(nextRoadmap["30"] ?? []),
        roadmapTemplates["30"][0],
      ];
    }

    if (matches.sales) {
      nextFindings.push(findingTemplates[1]);
      nextDecisions.push(decisionTemplates[0]);
      nextRoadmap["30"] = [
        ...(nextRoadmap["30"] ?? []),
        roadmapTemplates["30"][1],
      ];
    }

    if (matches.finance) {
      nextFindings.push(findingTemplates[2]);
      nextDecisions.push(
        decisionTemplates.find(
          (decision) => decision.title === "Crear tablero de caja y margen",
        ) ?? decisionTemplates[1],
      );
      nextRoadmap["30"] = [
        ...(nextRoadmap["30"] ?? []),
        roadmapTemplates["30"][2],
      ];
    }

    if (matches.data) {
      nextFindings.push(findingTemplates[3]);
      nextDecisions.push(
        decisionTemplates.find(
          (decision) => decision.title === "Definir indicadores minimos por area",
        ) ?? decisionTemplates[4],
      );
      nextRoadmap["60"] = [
        ...(nextRoadmap["60"] ?? []),
        roadmapTemplates["60"][0],
      ];
    }

    if (matches.process) {
      nextDecisions.push(
        decisionTemplates.find(
          (decision) => decision.title === "Documentar procesos criticos",
        ) ?? decisionTemplates[2],
      );
      nextRoadmap["60"] = [
        ...(nextRoadmap["60"] ?? []),
        roadmapTemplates["60"][1],
      ];
    }

    if (matches.tech) {
      nextDecisions.push(
        decisionTemplates.find(
          (decision) => decision.title === "Limpiar stack tecnologico",
        ) ?? decisionTemplates[4],
      );
      nextRoadmap["90"] = [
        ...(nextRoadmap["90"] ?? []),
        roadmapTemplates["90"][2],
      ];
    }

    setState((current) => ({
      ...current,
      findings: [
        ...current.findings,
        ...nextFindings.map((finding) => ({ ...finding, id: createId() })),
      ],
      decisions: [
        ...current.decisions,
        ...nextDecisions.map((decision) => ({ ...decision, id: createId() })),
      ],
      roadmap: {
        "30": [
          ...current.roadmap["30"],
          ...(nextRoadmap["30"] ?? []).map((task) => ({ ...task, id: createId() })),
        ],
        "60": [
          ...current.roadmap["60"],
          ...(nextRoadmap["60"] ?? []).map((task) => ({ ...task, id: createId() })),
        ],
        "90": [
          ...current.roadmap["90"],
          ...(nextRoadmap["90"] ?? []).map((task) => ({ ...task, id: createId() })),
        ],
      },
    }));

    const createdCount =
      nextFindings.length +
      nextDecisions.length +
      (nextRoadmap["30"]?.length ?? 0) +
      (nextRoadmap["60"]?.length ?? 0) +
      (nextRoadmap["90"]?.length ?? 0);

    setVoiceMessage(
      createdCount
        ? `Notas procesadas: se agregaron ${createdCount} elementos sugeridos.`
        : "No detecte patrones suficientes. Agrega mas contexto o usa las listas sugeridas.",
    );
  }

  function generateIntervention() {
    setState((current) => ({
      ...current,
      generated: buildGeneratedIntervention(current),
    }));
  }

  async function saveIntervention() {
    const savedAt = new Date().toISOString();
    const nextState = { ...state, savedAt };

    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    setState(nextState);
    setSaveMessage("Intervencion guardada localmente. Sincronizando...");
    setIsSaving(true);

    if (clientId === "demo-client") {
      setIsSaving(false);
      setSaveMessage(
        "Intervencion guardada localmente. demo-client no escribe en Supabase.",
      );
      return;
    }

    try {
      const response = await fetch("/api/interventions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          interventionSessionId: nextState.interventionSessionId,
          state: nextState,
          savedAt,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        interventionSessionId?: string;
      };

      if (!response.ok || !data.ok || !data.interventionSessionId) {
        throw new Error(data.error ?? "Supabase no devolvio la intervencion.");
      }

      const syncedState = {
        ...nextState,
        interventionSessionId: data.interventionSessionId,
      };
      window.localStorage.setItem(storageKey, JSON.stringify(syncedState));
      setState(syncedState);
      setSaveMessage("Intervencion guardada en Supabase y localStorage.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? `Guardado local OK. Supabase fallo: ${error.message}`
          : "Guardado local OK. Supabase fallo al sincronizar.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_44%,#020617_100%)] px-4 py-6 text-white sm:px-5 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <WorkspaceIdentity
          clientName={clientName}
          clientDetail="Sesion de intervencion para convertir entrevista, evidencia y criterio en decisiones operativas."
          context="Intervencion en vivo"
        />

        <header className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
                STRAX Intervention Core
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
                Mesa operativa de intervencion
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                Captura evidencia, convierte hallazgos en arquitectura y guarda
                la intervencion real del cliente desde una sola pantalla.
              </p>
            </div>
            <div className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-100">
              intervencion activa
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Section eyebrow="Bloque 1" title="Perfil del founder">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="nombre founder" value={state.founder.name} onChange={(value) => updateFounder("name", value)} />
              <TextInput label="cuello de botella" value={state.founder.bottleneck} onChange={(value) => updateFounder("bottleneck", value)} />
              <SelectInput label="dependencia operativa" value={state.founder.operationalDependency} options={["baja", "media", "alta"]} onChange={(value) => updateFounder("operationalDependency", value)} />
              <SelectInput label="nivel de claridad" value={state.founder.clarityLevel} options={["baja", "media", "alta"]} onChange={(value) => updateFounder("clarityLevel", value)} />
              <SelectInput label="capacidad delegacion" value={state.founder.delegationCapacity} options={["baja", "media", "alta"]} onChange={(value) => updateFounder("delegationCapacity", value)} />
              <SelectInput label="nivel gobierno" value={state.founder.governanceLevel} options={["debil", "informal", "funcional", "maduro"]} onChange={(value) => updateFounder("governanceLevel", value)} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {[
                ["proposito", "purpose"],
                ["vision", "vision"],
                ["principal frustracion", "frustration"],
              ].map(([label, key]) => (
                <label key={key} className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {label}
                  </span>
                  <textarea
                    value={state.founder[key as keyof FounderProfile]}
                    onChange={(event) =>
                      updateFounder(key as keyof FounderProfile, event.target.value)
                    }
                    className="min-h-32 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-blue-300/50"
                  />
                </label>
              ))}
            </div>
          </Section>

          <Section eyebrow="Bloque 2" title="Transcripcion / notas">
            <div className="mb-4 rounded-[1.25rem] border border-blue-300/15 bg-blue-400/10 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-blue-50/90">
                  Pega notas libres de entrevista, WhatsApp o transcripciones.
                  Este bloque funciona como evidencia base para hallazgos,
                  decisiones y roadmap.
                </p>
                <span className="w-fit rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-blue-100">
                  {state.transcript.trim()
                    ? `${state.transcript.trim().length} caracteres capturados`
                    : "sin notas capturadas"}
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={isListening ? stopVoiceCapture : startVoiceCapture}
                  className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    isListening
                      ? "border border-red-300/25 bg-red-400/10 text-red-100 hover:bg-red-400/15"
                      : "bg-white text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  {isListening ? "Detener captura de voz" : "Capturar voz"}
                </button>
                <button
                  type="button"
                  onClick={processTranscriptIntoBlocks}
                  disabled={!state.transcript.trim()}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Convertir notas en bloques
                </button>
              </div>
              {voiceMessage ? (
                <p className="mt-3 text-sm leading-6 text-blue-50/85">
                  {voiceMessage}
                </p>
              ) : null}
            </div>
            <textarea
              value={state.transcript}
              onChange={(event) =>
                setState((current) => ({ ...current, transcript: event.target.value }))
              }
              placeholder="Ejemplo: el founder dice que todas las aprobaciones pasan por el, ventas no tiene pipeline claro, finanzas revisa caja al final del mes, y el equipo opera por WhatsApp..."
              className="min-h-[18rem] max-h-[34rem] w-full resize-y overflow-y-auto rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 text-base leading-8 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/50 sm:min-h-[24rem] xl:min-h-[28rem]"
            />
          </Section>
        </div>

        <Section eyebrow="Bloque 2.5" title="Core del negocio">
          <p className="max-w-3xl text-sm leading-6 text-slate-300">
            Documenta lo que no puede perderse durante la entrevista: que vende
            la empresa, a quien sirve, que problema resuelve y cual es la
            promesa operativa que debe sostener.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <TextInput
              label="oferta principal"
              value={state.businessCore.offer}
              onChange={(value) => updateBusinessCore("offer", value)}
              placeholder="ej. implementacion STRAX para empresas B2B"
            />
            <TextInput
              label="cliente ideal"
              value={state.businessCore.customer}
              onChange={(value) => updateBusinessCore("customer", value)}
              placeholder="ej. founder con equipo 10-50"
            />
            <TextInput
              label="problema core"
              value={state.businessCore.coreProblem}
              onChange={(value) => updateBusinessCore("coreProblem", value)}
              placeholder="ej. crecimiento con desorden operativo"
            />
            <TextInput
              label="modelo de ingresos"
              value={state.businessCore.revenueModel}
              onChange={(value) => updateBusinessCore("revenueModel", value)}
              placeholder="ej. setup + fee mensual"
            />
            <TextInput
              label="promesa critica"
              value={state.businessCore.criticalPromise}
              onChange={(value) => updateBusinessCore("criticalPromise", value)}
              placeholder="ej. control ejecutivo en 90 dias"
            />
            <TextInput
              label="modelo operativo"
              value={state.businessCore.operatingModel}
              onChange={(value) => updateBusinessCore("operatingModel", value)}
              placeholder="ej. venta consultiva + delivery por sprints"
            />
          </div>
        </Section>

        <Section eyebrow="Bloque 3" title="Hallazgos estructurales">
          <div className="mb-4 rounded-[1.25rem] border border-blue-300/15 bg-blue-400/10 p-4">
            <p className="text-sm font-semibold text-blue-100">
              Usa plantillas para capturar rapido mientras entrevistas.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
              <select
                value={selectedFindingTemplate}
                onChange={(event) => setSelectedFindingTemplate(event.target.value)}
                className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">Seleccionar hallazgo frecuente</option>
                {findingTemplates.map((template) => (
                  <option key={template.title} value={template.title}>
                    {template.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => addFindingFromTemplate(selectedFindingTemplate)}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950"
              >
                Agregar hallazgo
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {state.findings.map((finding, index) => (
              <div key={finding.id} className="grid min-w-0 gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(8rem,0.5fr)_minmax(9rem,0.6fr)_auto]">
                <input value={finding.title} onChange={(event) => updateFinding(index, "title", event.target.value)} className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <input value={finding.description} onChange={(event) => updateFinding(index, "description", event.target.value)} className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <select value={finding.severity} onChange={(event) => updateFinding(index, "severity", event.target.value)} className="min-w-0 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                  {severities.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
                </select>
                <select value={finding.category} onChange={(event) => updateFinding(index, "category", event.target.value)} className="min-w-0 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <button type="button" onClick={() => removeFinding(finding.id)} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5">Eliminar</button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(8rem,0.5fr)_minmax(9rem,0.6fr)_auto]">
            <input value={newFinding.title} onChange={(event) => setNewFinding((current) => ({ ...current, title: event.target.value }))} placeholder="titulo" className="min-w-0 rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none" />
            <input value={newFinding.description} onChange={(event) => setNewFinding((current) => ({ ...current, description: event.target.value }))} placeholder="descripcion" className="min-w-0 rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none" />
            <select value={newFinding.severity} onChange={(event) => setNewFinding((current) => ({ ...current, severity: event.target.value }))} className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              {severities.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
            </select>
            <select value={newFinding.category} onChange={(event) => setNewFinding((current) => ({ ...current, category: event.target.value }))} className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <button type="button" onClick={addFinding} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950">Agregar</button>
          </div>
        </Section>

        <Section eyebrow="Bloque 4" title="Procesos">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="hidden grid-cols-[1fr_0.5fr_0.6fr_1fr_1.2fr] bg-slate-950/70 p-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 lg:grid">
              <span>proceso</span><span>existe</span><span>documentado</span><span>responsable</span><span>riesgo</span>
            </div>
            {state.processes.map((process, index) => (
              <div key={process.id} className="grid gap-3 border-t border-white/10 bg-slate-950/35 p-4 lg:grid-cols-[1fr_0.5fr_0.6fr_1fr_1.2fr]">
                <input value={process.process} onChange={(event) => updateProcess(index, "process", event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <select value={process.exists} onChange={(event) => updateProcess(index, "exists", event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                  {binaryStates.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={process.documented} onChange={(event) => updateProcess(index, "documented", event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                  {binaryStates.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input value={process.owner} onChange={(event) => updateProcess(index, "owner", event.target.value)} placeholder="responsable" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <input value={process.risk} onChange={(event) => updateProcess(index, "risk", event.target.value)} placeholder="riesgo" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="Bloque 5" title="Finanzas">
          <div className="mb-5 rounded-[1.25rem] border border-amber-300/15 bg-amber-300/10 p-4">
            <p className="text-sm leading-6 text-amber-50/90">
              No obligues al cliente a saber CAC, EBITDA o flujo de caja en la
              entrevista. Captura facturacion, margen, nomina y gastos; si lo
              demas no existe, marca una estimacion o dejalo como no disponible.
            </p>
            <button
              type="button"
              onClick={estimateFinance}
              className="mt-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Estimar utilidad, flujo y EBITDA
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {financeFields.map((field) => (
              <div key={field.key}>
                <TextInput
                  label={field.label}
                  value={state.finances[field.key]}
                  onChange={(value) => updateFinance(field.key, value)}
                  placeholder={field.placeholder}
                />
                <div className="mt-2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100">
                    Unidad: {field.unit}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {field.helper}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="Bloque 6" title="Decisiones arquitectonicas">
          <div className="mb-4 rounded-[1.25rem] border border-blue-300/15 bg-blue-400/10 p-4">
            <p className="text-sm leading-6 text-blue-50/90">
              Estas decisiones deberian salir casi automaticas desde los
              hallazgos. Selecciona una decision frecuente y ajusta responsable
              o prioridad si hace falta.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
              <select
                value={selectedDecisionTemplate}
                onChange={(event) => setSelectedDecisionTemplate(event.target.value)}
                className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">Seleccionar decision sugerida</option>
                {decisionTemplates.map((template) => (
                  <option key={template.title} value={template.title}>
                    {template.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => addDecisionFromTemplate(selectedDecisionTemplate)}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950"
              >
                Agregar decision
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {state.decisions.map((decision, index) => (
              <div key={decision.id} className="grid min-w-0 gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(8rem,0.5fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(9rem,0.6fr)_auto]">
                <input value={decision.title} onChange={(event) => updateDecision(index, "title", event.target.value)} className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <select value={decision.priority} onChange={(event) => updateDecision(index, "priority", event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                  {severities.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
                </select>
                <input value={decision.impact} onChange={(event) => updateDecision(index, "impact", event.target.value)} placeholder="impacto" className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <input value={decision.owner} onChange={(event) => updateDecision(index, "owner", event.target.value)} placeholder="responsable" className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <select value={decision.status} onChange={(event) => updateDecision(index, "status", event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button type="button" onClick={() => removeDecision(decision.id)} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5">Eliminar</button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(8rem,0.5fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(9rem,0.6fr)_auto]">
            <input value={newDecision.title} onChange={(event) => setNewDecision((current) => ({ ...current, title: event.target.value }))} placeholder="decision" className="min-w-0 rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none" />
            <select value={newDecision.priority} onChange={(event) => setNewDecision((current) => ({ ...current, priority: event.target.value }))} className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              {severities.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
            </select>
            <input value={newDecision.impact} onChange={(event) => setNewDecision((current) => ({ ...current, impact: event.target.value }))} placeholder="impacto" className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none" />
            <input value={newDecision.owner} onChange={(event) => setNewDecision((current) => ({ ...current, owner: event.target.value }))} placeholder="responsable" className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none" />
            <select value={newDecision.status} onChange={(event) => setNewDecision((current) => ({ ...current, status: event.target.value }))} className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none">
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <button type="button" onClick={addDecision} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950">Agregar</button>
          </div>
        </Section>

        <Section eyebrow="Bloque 7" title="Roadmap 30 / 60 / 90">
          <div className="grid gap-4 xl:grid-cols-3">
            {(["30", "60", "90"] as const).map((period) => (
              <article key={period} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4">
                <h3 className="text-2xl font-semibold text-white">{period} dias</h3>
                <div className="mt-4 space-y-3">
                  {state.roadmap[period].map((task, index) => (
                    <div key={task.id} className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                      <input value={task.title} onChange={(event) => updateRoadmapTask(period, index, "title", event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none" />
                      <div className="grid gap-2 sm:grid-cols-3">
                        <input value={task.owner} onChange={(event) => updateRoadmapTask(period, index, "owner", event.target.value)} placeholder="responsable" className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none" />
                        <select value={task.status} onChange={(event) => updateRoadmapTask(period, index, "status", event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <input value={task.impact} onChange={(event) => updateRoadmapTask(period, index, "impact", event.target.value)} placeholder="impacto" className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <select
                    value={selectedRoadmapTemplate[period]}
                    onChange={(event) =>
                      setSelectedRoadmapTemplate((current) => ({
                        ...current,
                        [period]: event.target.value,
                      }))
                    }
                    className="w-full rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="">Seleccionar tarea sugerida</option>
                    {roadmapTemplates[period].map((template) => (
                      <option key={template.title} value={template.title}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      addRoadmapTaskFromTemplate(
                        period,
                        selectedRoadmapTemplate[period],
                      )
                    }
                    className="w-full rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    Agregar sugerida
                  </button>
                  <input value={newRoadmapTask[period].title} onChange={(event) => setNewRoadmapTask((current) => ({ ...current, [period]: { ...current[period], title: event.target.value } }))} placeholder="nueva tarea" className="w-full rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none" />
                  <button type="button" onClick={() => addRoadmapTask(period)} className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">Agregar tarea</button>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Section eyebrow="Bloque 8" title="Generador STRAX">
            <button type="button" onClick={generateIntervention} className="w-full rounded-full bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-slate-950 transition hover:bg-slate-100">
              Generar intervencion STRAX
            </button>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Usa logica local: severidad, procesos, decisiones y roadmap. OpenAI
              queda fuera por ahora.
            </p>
          </Section>

          <Section eyebrow="Salida STRAX" title="Intervencion generada">
            {state.generated ? (
              <div className="space-y-5 text-sm leading-6 text-slate-200">
                <p className="rounded-2xl border border-blue-300/20 bg-blue-400/10 p-4 text-base leading-7 text-white">
                  {state.generated.executiveSummary}
                </p>
                {[
                  ["Fracturas estructurales", state.generated.structuralFractures],
                  ["Prioridades", state.generated.priorities],
                  ["Arquitectura objetivo", state.generated.targetArchitecture],
                  ["Roadmap resumido", state.generated.roadmapSummary],
                ].map(([title, items]) => (
                  <div key={title as string}>
                    <h3 className="font-semibold text-white">{title as string}</h3>
                    <div className="mt-2 space-y-2">
                      {(items as string[]).map((item) => (
                        <p key={item} className="rounded-xl border border-white/10 bg-slate-950/45 px-4 py-3">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-5 text-sm leading-6 text-slate-400">
                Aun no hay salida generada. Captura evidencia y presiona el
                generador.
              </p>
            )}
          </Section>
        </div>

        <section className="mt-6 rounded-[2rem] border border-blue-300/20 bg-blue-400/10 p-6 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
            Bloque 9 - Guardar
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                Guardar intervencion
              </h2>
              <p className="mt-2 text-sm leading-6 text-blue-50/85">
                Guarda localStorage primero y sincroniza con Supabase cuando las
                tablas de intervencion existen.
              </p>
              {state.interventionSessionId ? (
                <p className="mt-2 text-xs text-blue-100/75">
                  Intervention session: {state.interventionSessionId}
                </p>
              ) : null}
              {state.savedAt ? (
                <p className="mt-2 text-xs text-blue-100/75">
                  Ultimo guardado: {new Date(state.savedAt).toLocaleString("es-CO")}
                </p>
              ) : null}
              {saveMessage ? (
                <p className="mt-2 text-sm font-semibold text-emerald-100">
                  {saveMessage}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={saveIntervention}
              disabled={isSaving}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Guardando..." : "Guardar intervencion"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
