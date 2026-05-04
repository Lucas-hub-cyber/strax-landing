"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";

import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

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
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.9)] sm:p-6">
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
        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/50"
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
        className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-300/50"
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
  const storageKey = useMemo(() => `strax-intervention:${clientId}`, [clientId]);
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
  const [newRoadmapTask, setNewRoadmapTask] = useState<
    Record<"30" | "60" | "90", RoadmapTask>
  >({
    "30": { id: "", title: "", owner: "", status: "pendiente", impact: "" },
    "60": { id: "", title: "", owner: "", status: "pendiente", impact: "" },
    "90": { id: "", title: "", owner: "", status: "pendiente", impact: "" },
  });
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const storedValue = window.localStorage.getItem(storageKey);

    if (storedValue) {
      try {
        const parsedState = JSON.parse(storedValue) as InterventionState;
        window.queueMicrotask(() => {
          if (!cancelled) {
            setState(parsedState);
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
      if (!isSupabaseConfigured || !supabase || clientId === "demo-client") {
        return;
      }

      const sessionResponse = await supabase
        .from("intervention_sessions")
        .select("*")
        .eq("client_id", clientId)
        .order("saved_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sessionResponse.error || !sessionResponse.data) {
        return;
      }

      const savedSession = sessionResponse.data;
      const findingsResponse = await supabase
        .from("intervention_findings")
        .select("id,title,description,severity,category")
        .eq("intervention_session_id", savedSession.id)
        .order("created_at", { ascending: true });

      const rawState =
        savedSession.raw_state && typeof savedSession.raw_state === "object"
          ? (savedSession.raw_state as Partial<InterventionState>)
          : {};
      const findings =
        findingsResponse.data?.map((finding) => ({
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

    if (!isSupabaseConfigured || !supabase || clientId === "demo-client") {
      setIsSaving(false);
      setSaveMessage(
        clientId === "demo-client"
          ? "Intervencion guardada localmente. demo-client no escribe en Supabase."
          : "Intervencion guardada localmente. Falta configurar Supabase.",
      );
      return;
    }

    try {
      const sessionPayload = {
        client_id: clientId,
        founder_profile: nextState.founder,
        transcript: nextState.transcript,
        finances: nextState.finances,
        processes: nextState.processes,
        roadmap: nextState.roadmap,
        generated_output: nextState.generated,
        raw_state: nextState,
        status: "saved",
        saved_at: savedAt,
      };

      const response = nextState.interventionSessionId
        ? await supabase
            .from("intervention_sessions")
            .update(sessionPayload)
            .eq("id", nextState.interventionSessionId)
            .select("id")
            .single()
        : await supabase
            .from("intervention_sessions")
            .insert(sessionPayload)
            .select("id")
            .single();

      if (response.error || !response.data) {
        throw new Error(
          response.error?.message ?? "Supabase no devolvio la intervencion.",
        );
      }

      const interventionSessionId = response.data.id as string;

      await supabase
        .from("intervention_findings")
        .delete()
        .eq("intervention_session_id", interventionSessionId);

      if (nextState.findings.length) {
        const findingsResponse = await supabase.from("intervention_findings").insert(
          nextState.findings.map((finding) => ({
            intervention_session_id: interventionSessionId,
            client_id: clientId,
            title: finding.title,
            description: finding.description,
            severity: finding.severity,
            category: finding.category,
          })),
        );

        if (findingsResponse.error) {
          throw new Error(findingsResponse.error.message);
        }
      }

      const syncedState = { ...nextState, interventionSessionId };
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_44%,#020617_100%)] px-5 py-7 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8">
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
            <textarea
              value={state.transcript}
              onChange={(event) =>
                setState((current) => ({ ...current, transcript: event.target.value }))
              }
              placeholder="Pega aqui transcript, notas, WhatsApp, observaciones o audios transcritos..."
              className="min-h-[28rem] w-full resize-y rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 text-base leading-8 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/50"
            />
          </Section>
        </div>

        <Section eyebrow="Bloque 3" title="Hallazgos estructurales">
          <div className="space-y-3">
            {state.findings.map((finding, index) => (
              <div key={finding.id} className="grid gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4 lg:grid-cols-[1fr_1.2fr_0.5fr_0.6fr_auto]">
                <input value={finding.title} onChange={(event) => updateFinding(index, "title", event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <input value={finding.description} onChange={(event) => updateFinding(index, "description", event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <select value={finding.severity} onChange={(event) => updateFinding(index, "severity", event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                  {severities.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
                </select>
                <select value={finding.category} onChange={(event) => updateFinding(index, "category", event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <button type="button" onClick={() => removeFinding(finding.id)} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5">Eliminar</button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr_0.5fr_0.6fr_auto]">
            <input value={newFinding.title} onChange={(event) => setNewFinding((current) => ({ ...current, title: event.target.value }))} placeholder="titulo" className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none" />
            <input value={newFinding.description} onChange={(event) => setNewFinding((current) => ({ ...current, description: event.target.value }))} placeholder="descripcion" className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none" />
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["facturacion mensual", "monthlyRevenue"],
              ["margen", "margin"],
              ["utilidad", "profit"],
              ["nomina", "payroll"],
              ["gastos", "expenses"],
              ["CAC", "cac"],
              ["flujo caja", "cashflow"],
              ["EBITDA", "ebitda"],
            ].map(([label, key]) => (
              <TextInput key={key} label={label} value={state.finances[key as keyof FinanceState]} onChange={(value) => updateFinance(key as keyof FinanceState, value)} />
            ))}
          </div>
        </Section>

        <Section eyebrow="Bloque 6" title="Decisiones arquitectonicas">
          <div className="space-y-3">
            {state.decisions.map((decision, index) => (
              <div key={decision.id} className="grid gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4 lg:grid-cols-[1fr_0.5fr_1fr_0.8fr_0.6fr_auto]">
                <input value={decision.title} onChange={(event) => updateDecision(index, "title", event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <select value={decision.priority} onChange={(event) => updateDecision(index, "priority", event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                  {severities.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
                </select>
                <input value={decision.impact} onChange={(event) => updateDecision(index, "impact", event.target.value)} placeholder="impacto" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <input value={decision.owner} onChange={(event) => updateDecision(index, "owner", event.target.value)} placeholder="responsable" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
                <select value={decision.status} onChange={(event) => updateDecision(index, "status", event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button type="button" onClick={() => removeDecision(decision.id)} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5">Eliminar</button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.5fr_1fr_0.8fr_0.6fr_auto]">
            <input value={newDecision.title} onChange={(event) => setNewDecision((current) => ({ ...current, title: event.target.value }))} placeholder="decision" className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none" />
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
