"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

type InitialDiagnosisSnapshot = {
  submittedAt?: string;
  payload?: {
    strategy?: { clarity?: string };
    governance?: { founder_dependency?: string };
    operations?: { process_definition?: string };
    data?: { metrics_exist?: string };
    technology?: { tools_stack?: string };
    founder?: { decision_discipline?: string };
  };
  result?: {
    IIA?: number | string;
    IRA?: number | string;
    MIE_percent?: number | string;
  };
};

type DeepDiagnosticState = {
  companyStage: string;
  annualRevenueRange: string;
  teamSize: string;
  mainConstraint: string;
  marginVisibility: string;
  processStability: string;
  decisionFlow: string;
  dataReliability: string;
  systemsIntegration: string;
  founderLoad: string;
  transformationUrgency: string;
  strategicObjective: string;
  structuralSymptoms: string;
  priorityArea: string;
};

type AiAnalysis = {
  executive_summary: string;
  structural_hypothesis: string;
  dominant_risk: string;
  priority_actions: string[];
  questions_to_validate: string[];
  suggested_next_step: string;
};

type StraxEngineResponse = {
  structured?: {
    governance?: { founder_dependency?: string };
    operations?: { process_definition?: string };
  };
  result?: {
    IIA?: number | string;
    IRA?: number | string;
    MIE_percent?: number | string;
  };
};

const initialDeepDiagnosticState: DeepDiagnosticState = {
  companyStage: "expansion",
  annualRevenueRange: "not_shared",
  teamSize: "11_30",
  mainConstraint: "margin_pressure",
  marginVisibility: "partial",
  processStability: "partial",
  decisionFlow: "founder_centric",
  dataReliability: "partial",
  systemsIntegration: "fragmented",
  founderLoad: "high",
  transformationUrgency: "this_quarter",
  strategicObjective: "recover_margin",
  structuralSymptoms: "",
  priorityArea: "",
};

const transformationPlanPhases = [
  {
    label: "FASE 2 — ARQUITECTURA OBJETIVO",
    text: "Diseñar cómo debe funcionar la empresa después del diagnóstico.",
    items: [
      "estructura objetivo",
      "gobierno y roles",
      "flujo operativo ideal",
      "modelo de datos",
      "criterios tecnológicos",
      "prioridades críticas",
    ],
  },
  {
    label: "FASE 3 — PLAN DE INTEGRACIÓN",
    text: "Convertir la arquitectura en una ruta ejecutable.",
    items: [
      "roadmap 0–90 días",
      "prioridades por impacto",
      "procesos a documentar",
      "responsables",
      "indicadores",
      "decisiones tecnológicas",
    ],
  },
  {
    label: "FASE 4 — CONTROL Y EVOLUCIÓN",
    text: "Asegurar que la transformación no se quede en papel.",
    items: [
      "KPIs de seguimiento",
      "control de avance",
      "revisión de madurez",
      "trazabilidad",
      "estabilización operativa",
    ],
  },
];

function readStoredDiagnosis() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem("strax-initial-diagnosis");

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as InitialDiagnosisSnapshot;
  } catch {
    return null;
  }
}

function getMetricNumber(value: number | string | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function buildStructuralHypothesis(snapshot: InitialDiagnosisSnapshot | null) {
  if (!snapshot) {
    return {
      title: "Hipotesis pendiente",
      description:
        "Todavia no tenemos una lectura inicial guardada. Puedes continuar, pero esta fase gana mucho mas valor cuando entra desde el corte preliminar del landing.",
    };
  }

  const mieValue = getMetricNumber(snapshot.result?.MIE_percent);
  const iiaValue = getMetricNumber(snapshot.result?.IIA);
  const founderDependency = snapshot.payload?.governance?.founder_dependency;
  const processDefinition = snapshot.payload?.operations?.process_definition;

  if (mieValue !== null && mieValue >= 15) {
    return {
      title: "Fuga estructural de alta prioridad",
      description:
        "La lectura inicial sugiere una fuga relevante. Esta fase debe validar si el problema central esta en arquitectura operativa, dependencia de decision o diseno de control.",
    };
  }

  if (
    founderDependency === "high" ||
    processDefinition === "none" ||
    (iiaValue !== null && iiaValue < 50)
  ) {
    return {
      title: "Riesgo de dependencia estructural",
      description:
        "El corte preliminar apunta a una empresa que podria estar operando con excesiva carga en el fundador o con procesos aun inmaduros. Esta fase sirve para confirmar si el sistema ya se volvio cuello de botella.",
    };
  }

  return {
    title: "Hipotesis de friccion estructural moderada",
    description:
      "La lectura inicial no marca colapso, pero si suficientes senales para revisar margen, decisiones, coordinacion y confiabilidad operativa con mas contexto.",
  };
}

export default function FaseDosPage() {
  const router = useRouter();
  const [storedDiagnosis, setStoredDiagnosis] =
    useState<InitialDiagnosisSnapshot | null>(null);
  const [formState, setFormState] = useState<DeepDiagnosticState>(
    initialDeepDiagnosticState,
  );
  const [isBriefReady, setIsBriefReady] = useState(false);
  const [isSubmittingBrief, setIsSubmittingBrief] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [straxEngineResponse, setStraxEngineResponse] =
    useState<StraxEngineResponse | null>(null);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [workspaceError, setWorkspaceError] = useState("");

  useEffect(() => {
    setStoredDiagnosis(readStoredDiagnosis());
  }, []);

  const mieValue = getMetricNumber(storedDiagnosis?.result?.MIE_percent);
  const iiaValue = getMetricNumber(storedDiagnosis?.result?.IIA);
  const iraValue = getMetricNumber(storedDiagnosis?.result?.IRA);
  const structuralHypothesis = buildStructuralHypothesis(storedDiagnosis);
  const workspaceHref = useMemo(() => {
    const params = new URLSearchParams();
    const engineResult = straxEngineResponse?.result;
    const structured = straxEngineResponse?.structured;
    const workspaceIia = getMetricNumber(engineResult?.IIA);
    const workspaceIra = getMetricNumber(engineResult?.IRA);
    const workspaceMie = getMetricNumber(engineResult?.MIE_percent);

    if (workspaceIia !== null) {
      params.set("iia", String(workspaceIia));
    }

    if (workspaceIra !== null) {
      params.set("ira", String(workspaceIra));
    }

    if (workspaceMie !== null) {
      params.set("mie", String(workspaceMie));
    }

    if (structured?.governance?.founder_dependency) {
      params.set("founder_dependency", structured.governance.founder_dependency);
    }

    if (structured?.operations?.process_definition) {
      params.set("process_level", structured.operations.process_definition);
    }

    const query = params.toString();

    return query ? `/workspace/demo-client?${query}` : "/workspace/demo-client";
  }, [straxEngineResponse]);
  const workspaceSessionHref = useMemo(() => {
    const [path, query] = workspaceHref.split("?");

    return query ? `${path}/intervention?${query}` : `${path}/intervention`;
  }, [workspaceHref]);

  const gptBrief = useMemo(() => {
    return {
      source: "strax_fase_2",
      captured_at: storedDiagnosis?.submittedAt ?? null,
      initial_snapshot: storedDiagnosis,
      deep_diagnostic: {
        company_stage: formState.companyStage,
        annual_revenue_range: formState.annualRevenueRange,
        team_size: formState.teamSize,
        main_constraint: formState.mainConstraint,
        margin_visibility: formState.marginVisibility,
        process_stability: formState.processStability,
        decision_flow: formState.decisionFlow,
        data_reliability: formState.dataReliability,
        systems_integration: formState.systemsIntegration,
        founder_load: formState.founderLoad,
        transformation_urgency: formState.transformationUrgency,
        strategic_objective: formState.strategicObjective,
        structural_symptoms: formState.structuralSymptoms,
        priority_area: formState.priorityArea,
      },
      operator_prompt:
        "Usa este contexto para profundizar el diagnostico STRAX, detectar cuellos de botella estructurales y proponer la siguiente lectura ejecutiva.",
    };
  }, [formState, storedDiagnosis]);

  function updateField<K extends keyof DeepDiagnosticState>(
    key: K,
    value: DeepDiagnosticState[K],
  ) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleRequestArchitecture() {
    if (!straxEngineResponse) {
      router.push(workspaceSessionHref);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setWorkspaceError(
        "Supabase no esta configurado. Te llevamos al workspace demo.",
      );
      router.push(workspaceSessionHref);
      return;
    }

    setIsCreatingWorkspace(true);
    setWorkspaceError("");

    const result = straxEngineResponse.result;
    const structured = straxEngineResponse.structured;
    const iia = getMetricNumber(result?.IIA);
    const ira = getMetricNumber(result?.IRA);
    const mie = getMetricNumber(result?.MIE_percent);
    const founderDependency =
      structured?.governance?.founder_dependency ?? null;
    const processLevel = structured?.operations?.process_definition ?? null;

    try {
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: `Cliente STRAX ${new Date().toLocaleDateString("es-CO")}`,
          industry: "Sin clasificar",
          status: "Arquitectura solicitada",
        })
        .select("id")
        .single();

      if (clientError || !client) {
        throw new Error(
          clientError?.message ?? "No se pudo crear el cliente en Supabase.",
        );
      }

      const clientId = client.id as string;

      const inserts = await Promise.all([
        supabase.from("assessments").insert({
          client_id: clientId,
          iia,
          ira,
          mie_percent: mie,
          founder_dependency: founderDependency,
          process_level: processLevel,
          raw_result: {
            source: "fase_2_architecture_request",
            structured,
            result,
            brief: gptBrief,
          },
        }),
        supabase.from("roadmap_items").insert([
          {
            client_id: clientId,
            phase: "Fase 1 Diagnóstico",
            title: "Validar lectura estructural",
            description:
              "Confirmar los hallazgos principales del diagnóstico STRAX.",
            status: "done",
            priority: "high",
          },
          {
            client_id: clientId,
            phase: "Fase 2 Arquitectura",
            title: "Diseñar arquitectura objetivo",
            description:
              "Definir estructura objetivo, roles, gobierno y flujo operativo ideal.",
            status: "in_progress",
            priority: "critical",
          },
          {
            client_id: clientId,
            phase: "Fase 3 Integración",
            title: "Construir roadmap 0-90 días",
            description:
              "Convertir la arquitectura en una ruta ejecutable por impacto.",
            status: "pending",
            priority: "high",
          },
          {
            client_id: clientId,
            phase: "Fase 4 Control",
            title: "Definir control y evolución",
            description:
              "Crear KPIs, seguimiento y revisión de madurez operativa.",
            status: "pending",
            priority: "medium",
          },
        ]),
        supabase.from("sessions").insert({
          client_id: clientId,
          session_type: "Arquitectura Objetivo",
          session_date: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "scheduled",
          notes:
            "Sesión para convertir diagnóstico en arquitectura objetivo.",
        }),
        supabase.from("decisions").insert({
          client_id: clientId,
          title: "Separar decisiones operativas de decisiones estratégicas",
          description:
            "Reducir carga del fundador y ordenar gobernanza semanal.",
          impact: "Alto",
        }),
        supabase.from("risks").insert({
          client_id: clientId,
          title:
            founderDependency === "high"
              ? "Dependencia crítica del fundador"
              : "Fricción estructural pendiente de validar",
          severity: founderDependency === "high" ? "critical" : "high",
          impact:
            "Riesgo de cuello de botella en ejecución, control y margen.",
          status: "open",
        }),
      ]);

      const firstError = inserts.map((insert) => insert.error).find(Boolean);

      if (firstError) {
        throw new Error(firstError.message);
      }

      router.push(`/workspace/${clientId}/intervention`);
    } catch (error) {
      setWorkspaceError(
        error instanceof Error
          ? error.message
          : "No se pudo crear el workspace STRAX.",
      );
    } finally {
      setIsCreatingWorkspace(false);
    }
  }

  async function handlePrepareBrief() {
    setIsBriefReady(true);
    setIsSubmittingBrief(true);
    setSubmitError("");
    setSubmitMessage("");
    setAiAnalysis(null);
    setStraxEngineResponse(null);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "strax-fase-2-brief",
        JSON.stringify(gptBrief),
      );
    }

    console.log("strax fase 2 brief", gptBrief);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45000);

    try {
      console.log("calling STRAX backend...");

      const response = await fetch("http://localhost:3001/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: [
            gptBrief.operator_prompt,
            "",
            "Contexto STRAX capturado:",
            JSON.stringify(gptBrief, null, 2),
          ]
            .filter(Boolean)
            .join("\n"),
        }),
        signal: controller.signal,
      });

      console.log("STRAX backend responded");

      const responseText = await response.text();
      let data: {
        ok?: boolean;
        mode?: string;
        message?: string;
        analysis?: AiAnalysis;
        upstreamBody?: StraxEngineResponse;
        structured?: StraxEngineResponse["structured"];
        result?: StraxEngineResponse["result"];
        error?: string;
      } = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {
          error: responseText || "STRAX phase 2 API returned a non-JSON response.",
        };
      }

      if (!response.ok) {
        console.warn("STRAX backend error", {
          status: response.status,
          body: data,
        });

        throw new Error(
          data.message ??
            data.error ??
            `STRAX backend respondio con estado ${response.status}.`,
        );
      }

      if (data.ok === false) {
        console.warn("STRAX backend rejected request", data);

        throw new Error(
          data.message ?? data.error ?? "STRAX backend rechazo la solicitud.",
        );
      }

      if (data.upstreamBody || data.structured || data.result) {
        setStraxEngineResponse(
          data.upstreamBody ?? {
            structured: data.structured,
            result: data.result,
          },
        );
        setSubmitMessage(
          "Lectura STRAX generada correctamente. Ya tienes una primera lectura estructural para revisar.",
        );
      } else if (data.mode === "openai_analysis" && data.analysis) {
        setStraxEngineResponse(null);
        setAiAnalysis(data.analysis);
        setSubmitMessage(data.message ?? "Analisis STRAX generado con IA.");
      } else {
        setSubmitMessage(
          data.message ??
            "El brief quedo capturado localmente y listo para conectar la siguiente lectura.",
        );
      }
    } catch (error) {
      console.warn("STRAX backend request failed", error);

      setSubmitError(
        error instanceof DOMException && error.name === "AbortError"
          ? "STRAX backend no respondio en 45 segundos. Verifica que extract-system este corriendo en localhost:3001 y que el analisis no se haya quedado procesando."
          : error instanceof SyntaxError
            ? "STRAX backend respondio, pero la respuesta no es JSON valido."
            : error instanceof TypeError
              ? "No se pudo conectar con STRAX backend. Verifica que extract-system este activo en localhost:3001 y permita CORS."
              : error instanceof Error
                ? error.message
                : "No se pudo preparar la salida de Fase 2.",
      );
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmittingBrief(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_52%,#020617_100%)] px-6 py-8 text-white lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.75)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-slate-300 transition hover:text-white"
              >
                {"<-"} Volver al sistema de aterrizaje
              </Link>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
                Fase 2 STRAX
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                Diagnostico profundo para entrar con rigor, no solo con
                intuicion.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                Esta etapa ya no funciona como landing. Funciona como sala de
                lectura estructural: consolida contexto, ordena sintomas y
                prepara la entrada a la lectura asistida por GPT.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  IIA inicial
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {iiaValue ?? "N/A"}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  IRA inicial
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {iraValue ?? "N/A"}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-blue-300/20 bg-blue-400/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-blue-100/80">
                  MIE inicial
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {mieValue !== null ? `${mieValue}%` : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
            <aside className="space-y-5">
              <section className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                  Por que existe esta fase
                </p>
                <div className="mt-4 space-y-4 text-base leading-7 text-slate-300">
                  <p>
                    La landing detecta. Esta fase organiza. GPT interpreta.
                  </p>
                  <p>
                    Aqui no buscamos cerrar una agenda a ciegas. Buscamos llegar
                    con una lectura ejecutiva mucho mas seria.
                  </p>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
                  Insumos capturados
                </p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <p>
                    strategy.clarity:{" "}
                    {storedDiagnosis?.payload?.strategy?.clarity ?? "N/A"}
                  </p>
                  <p>
                    governance.founder_dependency:{" "}
                    {storedDiagnosis?.payload?.governance?.founder_dependency ??
                      "N/A"}
                  </p>
                  <p>
                    operations.process_definition:{" "}
                    {storedDiagnosis?.payload?.operations?.process_definition ??
                      "N/A"}
                  </p>
                  <p>
                    data.metrics_exist:{" "}
                    {storedDiagnosis?.payload?.data?.metrics_exist ?? "N/A"}
                  </p>
                  <p>
                    technology.tools_stack:{" "}
                    {storedDiagnosis?.payload?.technology?.tools_stack ?? "N/A"}
                  </p>
                  <p>
                    founder.decision_discipline:{" "}
                    {storedDiagnosis?.payload?.founder?.decision_discipline ??
                      "N/A"}
                  </p>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-blue-300/20 bg-blue-400/10 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
                  Hipotesis inicial
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  {structuralHypothesis.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-blue-50/90">
                  {structuralHypothesis.description}
                </p>
              </section>

              <section className="rounded-[1.75rem] border border-amber-300/20 bg-amber-400/10 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-100">
                  Criterio STRAX
                </p>
                <div className="mt-4 space-y-3 text-base leading-7 text-amber-50/90">
                  <p>
                    Si el problema fuera solo operativo, una herramienta bastaria.
                  </p>
                  <p>
                    Si necesitas reordenar decisiones, flujos, control y margen,
                    entonces ya estas en terreno estructural.
                  </p>
                </div>
              </section>
            </aside>

            <section className="rounded-[1.75rem] border border-white/10 bg-white p-6 text-slate-950 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.45)] sm:p-8">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
                  Preparacion para lectura GPT
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                  Profundiza la hipotesis que la lectura inicial ya detecto.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Aqui ya no estamos preguntando desde cero. Estamos ordenando el
                  caso para comprobar si la hipotesis inicial realmente describe
                  la estructura de tu empresa y preparar una lectura GPT con mas
                  criterio.
                </p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Etapa de empresa
                  </span>
                  <select
                    value={formState.companyStage}
                    onChange={(event) =>
                      updateField("companyStage", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="early">Etapa temprana</option>
                    <option value="expansion">Expansion</option>
                    <option value="scale">Escalamiento</option>
                    <option value="restructure">Reordenamiento</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Rango de ingresos anuales
                  </span>
                  <select
                    value={formState.annualRevenueRange}
                    onChange={(event) =>
                      updateField("annualRevenueRange", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="not_shared">No compartido</option>
                    <option value="under_500k">Menos de 500K</option>
                    <option value="500k_2m">500K a 2M</option>
                    <option value="2m_10m">2M a 10M</option>
                    <option value="10m_plus">Mas de 10M</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Tamano del equipo
                  </span>
                  <select
                    value={formState.teamSize}
                    onChange={(event) =>
                      updateField("teamSize", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="1_10">1 a 10</option>
                    <option value="11_30">11 a 30</option>
                    <option value="31_100">31 a 100</option>
                    <option value="100_plus">Mas de 100</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Restriccion principal
                  </span>
                  <select
                    value={formState.mainConstraint}
                    onChange={(event) =>
                      updateField("mainConstraint", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="margin_pressure">Presion sobre margen</option>
                    <option value="slow_execution">Ejecucion lenta</option>
                    <option value="founder_dependency">
                      Dependencia del fundador
                    </option>
                    <option value="poor_visibility">Poca visibilidad</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Visibilidad real del margen
                  </span>
                  <select
                    value={formState.marginVisibility}
                    onChange={(event) =>
                      updateField("marginVisibility", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="high">Alta</option>
                    <option value="partial">Parcial</option>
                    <option value="low">Baja</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Estabilidad de procesos
                  </span>
                  <select
                    value={formState.processStability}
                    onChange={(event) =>
                      updateField("processStability", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="defined">Definida</option>
                    <option value="partial">Parcial</option>
                    <option value="chaotic">Caotica</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Flujo de decisiones
                  </span>
                  <select
                    value={formState.decisionFlow}
                    onChange={(event) =>
                      updateField("decisionFlow", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="distributed">Distribuido</option>
                    <option value="hybrid">Hibrido</option>
                    <option value="founder_centric">Centrado en fundador</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Confiabilidad de datos
                  </span>
                  <select
                    value={formState.dataReliability}
                    onChange={(event) =>
                      updateField("dataReliability", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="high">Alta</option>
                    <option value="partial">Parcial</option>
                    <option value="low">Baja</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Integracion de sistemas
                  </span>
                  <select
                    value={formState.systemsIntegration}
                    onChange={(event) =>
                      updateField("systemsIntegration", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="integrated">Integrada</option>
                    <option value="partial">Parcial</option>
                    <option value="fragmented">Fragmentada</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Carga del fundador
                  </span>
                  <select
                    value={formState.founderLoad}
                    onChange={(event) =>
                      updateField("founderLoad", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Urgencia de transformacion
                  </span>
                  <select
                    value={formState.transformationUrgency}
                    onChange={(event) =>
                      updateField("transformationUrgency", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="this_month">Este mes</option>
                    <option value="this_quarter">Este trimestre</option>
                    <option value="this_year">Este ano</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Objetivo estrategico dominante
                  </span>
                  <select
                    value={formState.strategicObjective}
                    onChange={(event) =>
                      updateField("strategicObjective", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="recover_margin">Recuperar margen</option>
                    <option value="scale_without_chaos">
                      Escalar sin caos
                    </option>
                    <option value="delegate_control">Delegar control</option>
                    <option value="stabilize_execution">
                      Estabilizar ejecucion
                    </option>
                  </select>
                </label>
              </div>

              <div className="mt-6 grid gap-6">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Sintomas estructurales observados
                  </span>
                  <textarea
                    value={formState.structuralSymptoms}
                    onChange={(event) =>
                      updateField("structuralSymptoms", event.target.value)
                    }
                    rows={5}
                    placeholder="Ejemplo: decisiones frenadas, retrabajo, baja visibilidad por unidad, exceso de aprobaciones, integraciones rotas."
                    className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Area donde sientes mayor fuga hoy
                  </span>
                  <textarea
                    value={formState.priorityArea}
                    onChange={(event) =>
                      updateField("priorityArea", event.target.value)
                    }
                    rows={4}
                    placeholder="Describe el frente mas delicado: comercial, margen, operaciones, liderazgo, datos o tecnologia."
                    className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                  />
                </label>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-950 px-6 py-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                  Salida preparada
                </p>
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                  Al preparar esta salida, dejas listo un brief estructurado para
                  que la siguiente lectura con GPT empiece con contexto real y no
                  con preguntas improvisadas.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handlePrepareBrief}
                    disabled={isSubmittingBrief}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    {isSubmittingBrief
                      ? "Preparando salida..."
                      : "Preparar lectura GPT STRAX"}
                  </button>
                  <Link
                    href="/"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
                  >
                    Volver al landing
                  </Link>
                </div>

                {isBriefReady ? (
                  <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">
                      Lectura lista
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Consolidamos el contexto de esta fase y lo convertimos en
                      una lectura inicial para revisar estructura, riesgo y
                      prioridad de accion.
                    </p>
                    {submitMessage ? (
                      <p className="mt-3 text-sm leading-6 text-blue-100">
                        {submitMessage}
                      </p>
                    ) : null}
                    {submitError ? (
                      <p className="mt-3 text-sm leading-6 text-red-200">
                        {submitError}
                      </p>
                    ) : null}
                    {straxEngineResponse ? (
                      <div className="mt-5 rounded-[1.25rem] border border-emerald-300/20 bg-emerald-300/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                          Lectura estructural
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              IIA
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-white">
                              {getMetricNumber(straxEngineResponse.result?.IIA) ?? "--"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              IRA
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-white">
                              {getMetricNumber(straxEngineResponse.result?.IRA) ?? "--"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              MIE
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-white">
                              {getMetricNumber(straxEngineResponse.result?.MIE_percent) ?? 0}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm leading-6 text-slate-200">
                          <p>
                            <span className="font-semibold text-white">
                              Dependencia del fundador:
                            </span>{" "}
                            {straxEngineResponse.structured?.governance
                              ?.founder_dependency ?? "sin dato"}
                          </p>
                          <p>
                            <span className="font-semibold text-white">
                              Definicion de procesos:
                            </span>{" "}
                            {straxEngineResponse.structured?.operations
                              ?.process_definition ?? "sin dato"}
                          </p>
                        </div>

                        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 shadow-[0_24px_80px_-55px_rgba(15,23,42,0.9)]">
                          <div className="max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
                              PLAN DE TRANSFORMACIÓN STRAX
                            </p>
                            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                              Del diagnóstico al rediseño estructural de la
                              empresa.
                            </h3>
                          </div>

                          <div className="mt-5 grid gap-4 xl:grid-cols-3">
                            {transformationPlanPhases.map((phase) => (
                              <article
                                key={phase.label}
                                className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4"
                              >
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                                  {phase.label}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-slate-200">
                                  {phase.text}
                                </p>
                                <div className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
                                  {phase.items.map((item) => (
                                    <p key={item}>&bull; {item}</p>
                                  ))}
                                </div>
                              </article>
                            ))}
                          </div>

                          <div className="mt-5 rounded-[1.25rem] border border-blue-300/20 bg-blue-400/10 p-4">
                            <p className="text-base font-semibold leading-7 text-white">
                              El diagnóstico muestra dónde está la fractura.
                              <br />
                              El plan STRAX define cómo se corrige.
                            </p>
                            <button
                              type="button"
                              onClick={handleRequestArchitecture}
                              disabled={isCreatingWorkspace}
                              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                            >
                              {isCreatingWorkspace
                                ? "Creando workspace STRAX..."
                                : "Solicitar arquitectura STRAX"}
                            </button>
                            {workspaceError ? (
                              <p className="mt-3 text-sm leading-6 text-red-100">
                                {workspaceError}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {aiAnalysis ? (
                  <div className="mt-6 rounded-[1.5rem] border border-blue-300/20 bg-blue-400/10 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
                      Analista IA STRAX
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold text-white">
                      Lectura ejecutiva generada
                    </h3>
                    <div className="mt-4 space-y-4 text-base leading-7 text-slate-200">
                      <p>{aiAnalysis.executive_summary}</p>
                      <p>
                        <span className="font-semibold text-white">
                          Hipotesis estructural:
                        </span>{" "}
                        {aiAnalysis.structural_hypothesis}
                      </p>
                      <p>
                        <span className="font-semibold text-white">
                          Riesgo dominante:
                        </span>{" "}
                        {aiAnalysis.dominant_risk}
                      </p>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">
                          Prioridades
                        </p>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                          {aiAnalysis.priority_actions.map((item) => (
                            <p key={item}>&bull; {item}</p>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">
                          Validaciones sugeridas
                        </p>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                          {aiAnalysis.questions_to_validate.map((item) => (
                            <p key={item}>&bull; {item}</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-slate-950/35 p-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">
                        Siguiente paso recomendado
                      </p>
                      <p className="mt-3 text-base leading-7 text-white">
                        {aiAnalysis.suggested_next_step}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}







