"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  benefits,
  diagnosticAreas,
  GOOGLE_CALENDAR_URL,
  insights,
  problemPoints,
} from "@/app/page.data";
import { STRAX_PRIVACY_VERSION, STRAX_TERMS_VERSION } from "@/lib/legal";
import { trackCtaClick } from "@/lib/analytics";

type DiagnosticPayload = {
  strategy: {
    clarity: string;
    focus: string;
    value_proposition: string;
    scalability: string;
    coherence: string;
  };
  governance: {
    founder_dependency: string;
    role_clarity: string;
    decision_structure: string;
    accountability: string;
    delegation: string;
  };
  operations: {
    process_definition: string;
    replicability: string;
    bottlenecks: string;
    execution_time: string;
    quality_control: string;
  };
  data: {
    metrics_exist: string;
    data_accuracy: string;
    decision_based_on_data: string;
    frequency_of_review: string;
    data_integration: string;
  };
  technology: {
    tools_stack: string;
    manual_dependency: string;
    automation_level: string;
    scalability: string;
    system_reliability: string;
  };
  founder: {
    decision_discipline: string;
    delegation: string;
    data_usage: string;
    scaling_mindset: string;
    architecture_acceptance: string;
  };
  economicInputs: {
    revenue: number;
    hours: number;
    reworkRate: number;
    costPerHour: number;
    errorRate: number;
    decisionTimeLost: number;
    dataQualityLoss: number;
    techDowntime: number;
    costDowntimePerHour: number;
  };
};

type SectionKey = Exclude<keyof DiagnosticPayload, "economicInputs">;

type SelectFieldConfig = {
  section: SectionKey;
  field: string;
  label: string;
  options: string[];
};

const landingDiagnosticFields: SelectFieldConfig[] = [
  {
    section: "strategy",
    field: "clarity",
    label: "strategy.clarity",
    options: ["low", "medium", "high"],
  },
  {
    section: "governance",
    field: "founder_dependency",
    label: "governance.founder_dependency",
    options: ["high", "medium", "low"],
  },
  {
    section: "operations",
    field: "process_definition",
    label: "operations.process_definition",
    options: ["none", "partial", "defined"],
  },
  {
    section: "data",
    field: "metrics_exist",
    label: "data.metrics_exist",
    options: ["none", "basic", "structured"],
  },
  {
    section: "technology",
    field: "tools_stack",
    label: "technology.tools_stack",
    options: ["disconnected", "semi_connected", "integrated"],
  },
  {
    section: "founder",
    field: "decision_discipline",
    label: "founder.decision_discipline",
    options: ["low", "medium", "high"],
  },
];

const initialDiagnosticValues: DiagnosticPayload = {
  strategy: {
    clarity: "medium",
    focus: "semi_focused",
    value_proposition: "generic",
    scalability: "limited",
    coherence: "partial",
  },
  governance: {
    founder_dependency: "medium",
    role_clarity: "partial",
    decision_structure: "semi_structured",
    accountability: "informal",
    delegation: "partial",
  },
  operations: {
    process_definition: "partial",
    replicability: "low",
    bottlenecks: "frequent",
    execution_time: "variable",
    quality_control: "manual",
  },
  data: {
    metrics_exist: "basic",
    data_accuracy: "medium",
    decision_based_on_data: "sometimes",
    frequency_of_review: "monthly",
    data_integration: "partial",
  },
  technology: {
    tools_stack: "semi_connected",
    manual_dependency: "medium",
    automation_level: "partial",
    scalability: "limited",
    system_reliability: "acceptable",
  },
  founder: {
    decision_discipline: "medium",
    delegation: "partial",
    data_usage: "basic",
    scaling_mindset: "developing",
    architecture_acceptance: "neutral",
  },
  economicInputs: {
    revenue: 0,
    hours: 0,
    reworkRate: 0,
    costPerHour: 0,
    errorRate: 0,
    decisionTimeLost: 0,
    dataQualityLoss: 0,
    techDowntime: 0,
    costDowntimePerHour: 0,
  },
};

type DiagnosticResult = {
  layers?: Record<string, number | string>;
  founder?: number | string;
  IIA_base?: number | string;
  structural_penalty?: number | string;
  IIA?: number | string;
  IRA_base?: number | string;
  critical_penalty?: number | string;
  founder_penalty?: number | string;
  IRA?: number | string;
  CR?: number | string;
  CE?: number | string;
  CGov?: number | string;
  CD?: number | string;
  CT?: number | string;
  CEA?: number | string;
  MIE_percent?: number | string;
  modelVersion?: string;
  evaluationHash?: string;
  evaluatedAt?: string;
};

function getMetricNumber(value: number | string | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function getIiaTone(value: number | null) {
  if (value === null) {
    return "text-slate-950";
  }

  if (value < 50) {
    return "text-red-600";
  }

  if (value <= 70) {
    return "text-amber-500";
  }

  return "text-emerald-600";
}

function getIraTone(value: number | null) {
  if (value === null) {
    return "text-slate-950";
  }

  if (value > 70) {
    return "text-red-700";
  }

  if (value >= 50) {
    return "text-amber-500";
  }

  return "text-emerald-600";
}

function getStructuralFieldValue(
  payload: DiagnosticPayload,
  section: SectionKey,
  field: string,
) {
  return payload[section][field as keyof DiagnosticPayload[SectionKey]];
}

function buildInitialSnapshot(payload: DiagnosticPayload) {
  return {
    strategy: {
      clarity: payload.strategy.clarity,
    },
    governance: {
      founder_dependency: payload.governance.founder_dependency,
    },
    operations: {
      process_definition: payload.operations.process_definition,
    },
    data: {
      metrics_exist: payload.data.metrics_exist,
    },
    technology: {
      tools_stack: payload.technology.tools_stack,
    },
    founder: {
      decision_discipline: payload.founder.decision_discipline,
    },
    economicInputs: {
      revenue: payload.economicInputs.revenue,
    },
  };
}

function buildExecutiveReading(result: DiagnosticResult | null) {
  const iiaValue = getMetricNumber(result?.IIA);
  const iraValue = getMetricNumber(result?.IRA);
  const ceaValue = getMetricNumber(result?.CEA);
  const mieValue = getMetricNumber(result?.MIE_percent);

  if (mieValue !== null && mieValue >= 15) {
    return {
      headline: "Riesgo estructural alto con fuga prioritaria",
      summary:
        "La lectura inicial sugiere una empresa con friccion estructural capaz de erosionar margen con rapidez si no se valida a tiempo.",
      priority: "Prioridad alta: verificar arquitectura operativa y dependencia de decision.",
      nextCheck:
        "Siguiente validacion recomendada: confirmar donde se concentra la fuga entre gobierno, operaciones y capacidad de ejecucion.",
    };
  }

  if (
    (iiaValue !== null && iiaValue < 50) ||
    (iraValue !== null && iraValue > 70) ||
    (ceaValue !== null && ceaValue < 50)
  ) {
    return {
      headline: "Riesgo estructural moderado con señales de tension",
      summary:
        "El sistema no parece colapsado, pero ya muestra suficientes sintomas para justificar una validacion mas rigurosa antes de escalar.",
      priority:
        "Prioridad media: revisar coordinacion, calidad de procesos y madurez de control.",
      nextCheck:
        "Siguiente validacion recomendada: contrastar si el problema principal esta en diseno de operacion, datos o centralizacion del fundador.",
    };
  }

  return {
    headline: "Lectura inicial estable, pero no concluyente",
    summary:
      "No aparecen señales criticas en este corte preliminar, aunque todavia puede haber fricciones ocultas que la Fase 2 ayude a validar.",
    priority: "Prioridad actual: confirmar si la estabilidad es real o solo aparente.",
    nextCheck:
      "Siguiente validacion recomendada: revisar consistencia entre decision, visibilidad y capacidad de escalar sin retrabajo.",
  };
}

export function LandingSections({
  onStartDiagnostic,
}: {
  onStartDiagnostic: () => void;
}) {
  const router = useRouter();
  const [activeInsight, setActiveInsight] = useState(0);
  const [diagnosticValues, setDiagnosticValues] =
    useState<DiagnosticPayload>(initialDiagnosticValues);
  const [diagnosticResult, setDiagnosticResult] =
    useState<DiagnosticResult | null>(null);
  const [diagnosticError, setDiagnosticError] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const currentInsight = insights[activeInsight];

  function handleDiagnosticChange(event: ChangeEvent<HTMLSelectElement>) {
    const { name, value } = event.target;
    const [section, field] = name.split(".") as [SectionKey, string];

    setDiagnosticValues((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  }

  async function handleDiagnosticSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsEvaluating(true);
    setDiagnosticError("");
    setDiagnosticResult(null);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...diagnosticValues,
          consentAccepted: true,
          acceptedTermsVersion: STRAX_TERMS_VERSION,
          acceptedPrivacyVersion: STRAX_PRIVACY_VERSION,
        }),
      });

      if (!response.ok) {
        throw new Error(`Diagnostic request failed with ${response.status}`);
      }

      const data = (await response.json()) as DiagnosticResult;
      setDiagnosticResult(data);
    } catch {
      setDiagnosticError(
        "No pudimos ejecutar el motor STRAX interno. Intenta nuevamente o revisa la salida del servidor Next.",
      );
    } finally {
      setIsEvaluating(false);
    }
  }

  function handleInsightChange(direction: "prev" | "next") {
    setActiveInsight((current) => {
      if (direction === "prev") {
        return current === 0 ? insights.length - 1 : current - 1;
      }

      return current === insights.length - 1 ? 0 : current + 1;
    });
  }

  function handleContinueToPhaseTwo() {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "strax-initial-diagnosis",
        JSON.stringify({
          submittedAt: new Date().toISOString(),
          payload: buildInitialSnapshot(diagnosticValues),
          result: diagnosticResult,
        }),
      );
    }

    router.push("/fase-2");
  }

  const iiaValue = getMetricNumber(diagnosticResult?.IIA);
  const iraValue = getMetricNumber(diagnosticResult?.IRA);
  const mieValue = getMetricNumber(diagnosticResult?.MIE_percent);
  const revenueValue = getMetricNumber(
    diagnosticValues.economicInputs.revenue,
  );
  const executiveReading = buildExecutiveReading(diagnosticResult);
  const annualLossEstimate =
    revenueValue !== null && mieValue !== null
      ? revenueValue * (mieValue / 100)
      : null;

  return (
    <>
      <section id="problema" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-24">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
              Problema
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Las empresas pierden entre 5% y 20% de sus ingresos por
              ineficiencias internas.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              No es un error puntual. Es un sistema mal disenado que escala el
              problema contigo.
            </p>
            <p className="mt-4 text-lg font-medium leading-8 text-slate-950">
              Todo esto no es operacion. Es desorden estructural.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {problemPoints.map((point, index) => (
              <article
                key={point}
                className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  0{index + 1}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-950">
                  {point}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="insight" className="border-b border-slate-200 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-start">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
                  Insight
                </p>
                <div className="hidden h-px flex-1 bg-gradient-to-r from-blue-400/30 to-transparent sm:block" />
              </div>

              <div className="mt-8 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {insights.map((item, index) => {
                  const isActive = index === activeInsight;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveInsight(index)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.24em] transition ${
                        isActive
                          ? "border-blue-300/60 bg-blue-400/12 text-blue-100"
                          : "border-white/10 bg-white/4 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      {item.eyebrow}
                    </button>
                  );
                })}
              </div>

              <h2 className="mt-8 max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                {currentInsight.title}
              </h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {currentInsight.eyebrow}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleInsightChange("prev")}
                    aria-label="Insight anterior"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-blue-300/40 hover:bg-white/10 hover:text-white"
                  >
                    {"<-"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsightChange("next")}
                    aria-label="Siguiente insight"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-blue-300/40 hover:bg-white/10 hover:text-white"
                  >
                    {"->"}
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-6 text-lg leading-8 text-slate-300">
                {currentInsight.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-2">
                {insights.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveInsight(index)}
                    aria-label={`Ir al ${item.eyebrow.toLowerCase()}`}
                    className={`h-2.5 rounded-full transition ${
                      index === activeInsight
                        ? "w-10 bg-blue-300"
                        : "w-2.5 bg-white/18 hover:bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solucion" className="border-b border-slate-200 bg-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
              Solucion
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              No hacemos consultoria. Medimos la estructura de tu empresa.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {diagnosticAreas.map((area) => (
              <article
                key={area.name}
                className="group rounded-[1.75rem] border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_30px_80px_-50px_rgba(37,99,235,0.45)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Evaluacion
                </p>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  {area.name}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  {area.detail}
                </p>
                <div className="mt-8 h-px w-full bg-gradient-to-r from-blue-600/50 to-slate-200" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
              Beneficios
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Esto no mejora tu operacion. Recupera tu rentabilidad.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <article
                key={benefit}
                className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-blue-700" />
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">
                      {benefit}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">
                      Resultado directo de identificar la causa estructural y
                      priorizar correcciones con criterio de negocio.
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="autoridad" className="border-b border-slate-200 bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
              Autoridad
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Esto no es una opinion. Es una lectura estructural de tu empresa.
            </h2>
            <p className="mt-8 text-lg leading-8 text-slate-300">
              El valor no esta en entregar opiniones, sino en exponer con
              claridad donde se pierde rentabilidad, por que ocurre y cuales son
              las decisiones prioritarias para corregirlo.
            </p>
            <a
              href={GOOGLE_CALENDAR_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackCtaClick({
                  source: "authority_section",
                  variant: "calendar_link",
                  destination: "google_calendar",
                })
              }
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Ver diagnostico estructural
            </a>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Posicionamiento
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                Partner estrategico
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Diagnostico riguroso para equipos directivos que necesitan una
                lectura de negocio, no una lista generica de recomendaciones.
              </p>
            </article>

            <article className="rounded-[1.75rem] border border-blue-400/20 bg-blue-500/10 p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                Lo que recibes
              </p>
              <div className="mt-4 space-y-4 rounded-2xl border border-blue-300/25 bg-slate-950/20 p-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100/75">
                    Entregable 01
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Mapa de fugas estructurales
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100/75">
                    Entregable 02
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Prioridades con impacto en margen
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100/75">
                    Entregable 03
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Ruta de accion para corregir sin improvisar
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="prediagnostico" className="border-b border-slate-200 bg-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
              Prediagnostico
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Diagnostico empresarial inicial para detectar si tu problema ya es
              estructural.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              No necesitas una consultoria larga para detectar si hay
              ineficiencias operativas, dependencia del fundador o perdida de
              rentabilidad. Esta lectura inicial muestra si la operacion ya
              esta drenando margen, control y velocidad.
            </p>
          </div>

          <div className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.2)] sm:p-10">
            <div className="mb-6 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                Evaluacion estructural
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                Motor STRAX en vivo
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                Lectura inicial
              </span>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
              Diagnostico guiado
            </p>
            <h3 className="mt-4 max-w-3xl text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
              Responde un diagnostico inicial y detecta si el problema ya es
              estructural, no solo operativo.
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Esta primera lectura filtra severidad y abre la siguiente fase con
              mejor contexto. El rigor completo del diagnostico estructural se
              desarrolla despues.
            </p>
            <form
              onSubmit={handleDiagnosticSubmit}
              className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:p-6"
            >
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <span className="rounded-full border border-slate-200 px-3 py-2">
                    Baja friccion
                  </span>
                  <span className="rounded-full border border-slate-200 px-3 py-2">
                    6 variables criticas
                  </span>
                  <span className="rounded-full border border-slate-200 px-3 py-2">
                    Entrada a Fase 2
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {landingDiagnosticFields.map((field) => (
                    <label
                      key={`${field.section}.${field.field}`}
                      className="block"
                    >
                      <span className="mb-2 block text-sm font-medium text-slate-700">
                        {field.label}
                      </span>
                      <select
                        name={`${field.section}.${field.field}`}
                        value={getStructuralFieldValue(
                          diagnosticValues,
                          field.section,
                          field.field,
                        )}
                        onChange={handleDiagnosticChange}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-500"
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isEvaluating}
                className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isEvaluating
                  ? "Ejecutando diagnostico..."
                  : "Ejecutar diagnostico STRAX"}
              </button>

              {diagnosticError ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {diagnosticError}
                </p>
              ) : null}

              {diagnosticResult ? (
                <div className="mt-5 rounded-[1.5rem] border border-blue-200 bg-white px-5 py-4 text-slate-950">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
                    Lectura inicial STRAX:
                  </p>
                  <div className="mt-4 rounded-[1.25rem] border border-blue-100 bg-blue-50 px-4 py-4">
                    <h4 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                      {executiveReading.headline}
                    </h4>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
                      {executiveReading.summary}
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-900">
                      {executiveReading.priority}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {executiveReading.nextCheck}
                    </p>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                    Esta salida no reemplaza el diagnostico profundo. Funciona
                    como corte preliminar para estimar severidad estructural y
                    decidir si debes pasar a Fase 2.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <p className={getIiaTone(iiaValue)}>
                      IIA: {diagnosticResult.IIA ?? "N/A"}
                    </p>
                    <p className={getIraTone(iraValue)}>
                      IRA: {diagnosticResult.IRA ?? "N/A"}
                    </p>
                    <p>CEA: {diagnosticResult.CEA ?? "N/A"}</p>
                    <p>Founder: {diagnosticResult.founder ?? "N/A"}</p>
                    <p>
                      MIE:{" "}
                      {diagnosticResult.MIE_percent !== undefined
                        ? `${diagnosticResult.MIE_percent}%`
                        : "N/A"}
                    </p>
                  </div>

                  <details className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">
                      Ver detalle tecnico del motor
                    </summary>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        IIA_base: {diagnosticResult.IIA_base ?? "N/A"}
                      </p>
                      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        structural_penalty:{" "}
                        {diagnosticResult.structural_penalty ?? "N/A"}
                      </p>
                      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        IRA_base: {diagnosticResult.IRA_base ?? "N/A"}
                      </p>
                      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        critical_penalty:{" "}
                        {diagnosticResult.critical_penalty ?? "N/A"}
                      </p>
                      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        founder_penalty:{" "}
                        {diagnosticResult.founder_penalty ?? "N/A"}
                      </p>
                      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        CR: {diagnosticResult.CR ?? "N/A"}
                      </p>
                      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        CE: {diagnosticResult.CE ?? "N/A"}
                      </p>
                      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        CGov: {diagnosticResult.CGov ?? "N/A"}
                      </p>
                      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        CD: {diagnosticResult.CD ?? "N/A"}
                      </p>
                      <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        CT: {diagnosticResult.CT ?? "N/A"}
                      </p>
                    </div>

                    {diagnosticResult.layers ? (
                      <div className="mt-4 rounded-[1.1rem] border border-slate-200 bg-white p-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">
                          Layers
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {Object.entries(diagnosticResult.layers).map(
                            ([layer, value]) => (
                              <p
                                key={layer}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                              >
                                {layer}: {value}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    ) : null}
                  </details>
                </div>
              ) : null}

              {diagnosticResult ? (
                <div className="mt-4 rounded-[1.5rem] border border-slate-950 bg-slate-950 px-5 py-5 text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                    Hipotesis de impacto
                  </p>
                  <div className="mt-3 space-y-3 text-base leading-7 text-slate-200">
                    <p>
                      Esto no parece un problema aislado de operacion. Apunta a
                      una friccion estructural que conviene verificar con mas
                      rigor.
                    </p>
                    <p>
                      La lectura inicial estima una posible fuga de hasta{" "}
                      {mieValue !== null ? `${mieValue}%` : "N/A"} de tu
                      operacion. La siguiente fase sirve para confirmar donde se
                      produce y que tan critica es.
                    </p>
                    <p>Ahora tienes dos caminos:</p>
                    <p>&bull; Profundizar la lectura estructural</p>
                    <p>&bull; Seguir operando sin confirmar la causa real</p>
                    {annualLossEstimate !== null ? (
                      <p className="font-semibold text-white">
                        Referencia economica preliminar:{" "}
                        {annualLossEstimate.toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {diagnosticResult ? (
                <div className="mt-4 rounded-[1.75rem] border border-blue-200 bg-gradient-to-br from-white via-blue-50 to-slate-100 px-6 py-6 shadow-[0_24px_70px_-45px_rgba(37,99,235,0.35)] sm:px-7 sm:py-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
                    Siguiente paso
                  </p>
                  <div className="mt-4 space-y-4 text-base leading-7 text-slate-700">
                    <p>
                      Esta lectura inicial ya sugiere que el siguiente paso no
                      es una herramienta aislada. Es una verificacion estructural
                      con mas contexto.
                    </p>
                    <p>
                      En Fase 2 STRAX profundizamos la hipotesis y ordenamos el
                      caso para responder con mas claridad:
                    </p>
                    <p>&bull; como deberia operar la empresa</p>
                    <p>&bull; donde podria estar la fuga principal</p>
                    <p>&bull; que vale la pena validar con GPT y criterio ejecutivo</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinueToPhaseTwo}
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                  >
                    Entrar a Fase 2 STRAX
                  </button>
                </div>
              ) : null}
            </form>
            <button
              type="button"
              onClick={() => {
                trackCtaClick({
                  source: "prediagnostico_section",
                  variant: "start_diagnostic",
                });
                onStartDiagnostic();
              }}
              className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Iniciar diagnostico ahora
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
