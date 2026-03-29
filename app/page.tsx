"use client";

import {
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const GOOGLE_CALENDAR_URL = "https://calendar.app.google/MA3xeKtepvt2ANqP7";
const LEAD_CAPTURE_URL = process.env.NEXT_PUBLIC_LEAD_CAPTURE_URL ?? "";

const problemPoints = [
  "Procesos duplicados",
  "Decisiones lentas",
  "Sistemas desconectados",
  "Equipos desalineados",
];

const diagnosticAreas = [
  {
    name: "Estrategia",
    detail: "Claridad de foco, prioridades y mecanismos reales de ejecucion.",
  },
  {
    name: "Gobierno",
    detail: "Roles, decisiones, escalamiento y control para operar sin friccion.",
  },
  {
    name: "Operaciones",
    detail: "Flujos, cuellos de botella y fricciones que erosionan margen.",
  },
  {
    name: "Datos",
    detail: "Calidad de informacion para decidir con velocidad y precision.",
  },
  {
    name: "Tecnologia",
    detail: "Arquitectura, integraciones y herramientas que sostienen la operacion.",
  },
];

const benefits = [
  "Recuperar rentabilidad sin aumentar ventas",
  "Mejor toma de decisiones",
  "Mayor control del negocio",
  "Menor dependencia del fundador",
];

const insights = [
  {
    id: "ventas",
    eyebrow: "Insight 01",
    title: "El mercado cree que el problema es ventas.",
    body: [
      "Pero cuando el margen cae mientras la operacion crece, el problema no esta afuera.",
      "Esta en como esta disenada la empresa.",
    ],
  },
  {
    id: "crecimiento",
    eyebrow: "Insight 02",
    title: "Crecer sin estructura solo acelera la perdida.",
    body: [
      "Mas clientes sobre una operacion fragil no corrigen el sistema.",
      "Escalan reprocesos, desgaste y decisiones cada vez mas lentas.",
    ],
  },
  {
    id: "fundador",
    eyebrow: "Insight 03",
    title: "Cuando todo depende del fundador, el negocio se vuelve cuello de botella.",
    body: [
      "La dependencia centralizada frena ritmo, control y capacidad de delegar.",
      "No es liderazgo: es una arquitectura que no logro madurar.",
    ],
  },
  {
    id: "datos",
    eyebrow: "Insight 04",
    title: "Sin datos confiables, la empresa opera por intuicion costosa.",
    body: [
      "La sensacion de avance puede esconder fugas de margen, retrabajo y desalineacion.",
      "La falta de lectura estructural hace que el problema se vea tarde.",
    ],
  },
];

const questions = [
  {
    id: 1,
    text: "Cuantas personas tiene tu empresa?",
    options: ["1-10", "10-30", "30-100", "100+"],
  },
  {
    id: 2,
    text: "Tienes claridad real de tu margen de ganancia por linea, cliente o unidad de negocio?",
    options: ["Si total", "Parcial", "No"],
  },
  {
    id: 3,
    text: "Las decisiones clave dependen de ti?",
    options: ["Si", "Parcial", "No"],
  },
  {
    id: 4,
    text: "Existen reprocesos o retrabajos frecuentes?",
    options: ["Muchos", "Algunos", "Pocos"],
  },
  {
    id: 5,
    text: "Tus sistemas de tecnologia y datos comparten informacion confiable entre areas?",
    options: ["Si", "Parcial", "No"],
  },
  {
    id: 6,
    text: "Sientes que tu operacion esta desordenada?",
    options: ["Si", "Algo", "No"],
  },
];

type RadarDimensionKey =
  | "estrategia"
  | "operaciones"
  | "datos"
  | "tecnologia"
  | "gobierno";

type RadarDatum = {
  dimension: string;
  key: RadarDimensionKey;
  ideal: number;
  actual: number;
  fullMark: 100;
};

const MARKETING_RADAR_DATA: RadarDatum[] = [
  {
    dimension: "ESTRATEGIA",
    key: "estrategia",
    ideal: 90,
    actual: 54,
    fullMark: 100,
  },
  {
    dimension: "OPERACIONES",
    key: "operaciones",
    ideal: 92,
    actual: 44,
    fullMark: 100,
  },
  {
    dimension: "DATOS",
    key: "datos",
    ideal: 88,
    actual: 39,
    fullMark: 100,
  },
  {
    dimension: "TECNOLOGIA",
    key: "tecnologia",
    ideal: 89,
    actual: 57,
    fullMark: 100,
  },
  {
    dimension: "GOBIERNO",
    key: "gobierno",
    ideal: 87,
    actual: 46,
    fullMark: 100,
  },
];

function getRadarStructuralScore(data: RadarDatum[]) {
  const total = data.reduce((sum, item) => sum + item.actual, 0);

  return Math.round(total / data.length);
}

function getRadarInterpretation(score: number) {
  if (score > 80) {
    return {
      message: "Alta solidez estructural.",
      alert: "Pocos riesgos visibles.",
    };
  }

  return {
    message:
      "Tu empresa muestra una estructura solida, aunque conviene validar puntos ciegos antes de escalar.",
    alert:
      "Aun con una base estable, pequenas fugas pueden erosionar margen si no se corrigen a tiempo.",
  };
}

function getScoreValue(answers: string[]) {
  let score = 0;

  answers.forEach((a) => {
    if (a === "No") score += 2;
    if (a === "Parcial" || a === "Algo") score += 1;
    if (a === "Muchos") score += 2;
  });

  return score;
}

function calculateScore(answers: string[]) {
  const score = getScoreValue(answers);

  if (score >= 7) return "ALTO";
  if (score >= 4) return "MEDIO";
  return "BAJO";
}

function getResultText(level: string) {
  if (level === "ALTO") {
    return {
      title: "Fuga estructural critica detectada",
      desc: "Tu empresa probablemente esta perdiendo entre 10% y 20% de sus ingresos sin verlo.",
    };
  }

  if (level === "MEDIO") {
    return {
      title: "Fuga estructural relevante",
      desc: "Hay senales claras de perdida entre 5% y 10% de tus ingresos.",
    };
  }

  return {
    title: "Estructura estable (por ahora)",
    desc: "No hay senales criticas, pero el crecimiento puede amplificar errores ocultos.",
  };
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

function SystemVisual() {
  const isChartReady = useIsClient();

  return (
    <div className="relative mx-auto w-full max-w-[28rem] overflow-hidden rounded-[1.65rem] border border-blue-400/12 bg-[#0B1F3B] px-3 py-4 sm:px-4 sm:py-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(59,130,246,0.28),transparent_32%),radial-gradient(circle_at_50%_76%,rgba(96,165,250,0.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_100%)]" />
      <div className="relative h-[320px] w-full sm:h-[360px]">
        {isChartReady ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={280}
            minHeight={320}
          >
            <RadarChart
              data={MARKETING_RADAR_DATA}
              cx="50%"
              cy="52%"
              outerRadius="69%"
            >
              <PolarGrid
                stroke="rgba(147, 197, 253, 0.12)"
                radialLines
              />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{
                  fill: "rgba(219, 234, 254, 0.9)",
                  fontSize: 10,
                  letterSpacing: 3,
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Ideal estructural"
                dataKey="ideal"
                stroke="#BFDBFE"
                strokeOpacity={0.7}
                strokeWidth={1.6}
                fill="#BFDBFE"
                fillOpacity={0.08}
                dot={false}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              />
              <Radar
                name="Empresa hoy"
                dataKey="actual"
                stroke="#60A5FA"
                strokeWidth={2.6}
                fill="#2563EB"
                fillOpacity={0.78}
                dot={{
                  r: 3.5,
                  fill: "#93C5FD",
                  stroke: "#0B1F3B",
                  strokeWidth: 1.2,
                }}
                isAnimationActive
                animationBegin={120}
                animationDuration={1100}
                animationEasing="ease-out"
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[1.35rem] border border-white/6 bg-[radial-gradient(circle_at_50%_50%,rgba(96,165,250,0.18),transparent_30%)]">
            <div className="h-44 w-44 rounded-full border border-blue-100/10" />
          </div>
        )}
      </div>

      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/7 bg-white/4 px-4 py-2 text-[10px] uppercase tracking-[0.26em] text-blue-100/72 sm:text-[11px]">
        <span>Lectura estructural</span>
        <span>Ideal vs realidad operativa</span>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <Image
      src="/logos/logo-strax-dark.png"
      alt="STRAX"
      width={160}
      height={40}
      className="h-10 w-auto"
      priority
    />
  );
}

export default function Home() {
  const [showWizard, setShowWizard] = useState(false);
  const [activeInsight, setActiveInsight] = useState(0);
  const radarScore = getRadarStructuralScore(MARKETING_RADAR_DATA);
  const radarInterpretation = getRadarInterpretation(radarScore);

  function handleInsightChange(direction: "prev" | "next") {
    setActiveInsight((current) => {
      if (direction === "prev") {
        return current === 0 ? insights.length - 1 : current - 1;
      }

      return current === insights.length - 1 ? 0 : current + 1;
    });
  }

  if (showWizard) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-5xl">
          <LeadWizard onBack={() => setShowWizard(false)} />
        </div>
      </main>
    );
  }

  const currentInsight = insights[activeInsight];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_36%),radial-gradient(circle_at_80%_20%,_rgba(37,99,235,0.12),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_55%,_#eef2ff_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-6 py-8 lg:px-10 lg:py-10">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <BrandMark />
              <p className="mt-2 text-sm text-slate-600">
                Diagnostico estructural empresarial
              </p>
            </div>

            <a
              href="#cta"
              className="hidden rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white sm:inline-flex"
            >
              Solicitar diagnostico estructural
            </a>
          </header>

          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <div className="min-w-0 max-w-3xl">
              <p className="inline-flex max-w-full rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-900 sm:text-xs sm:tracking-[0.24em]">
                Para CEOs y fundadores en fase de crecimiento
              </p>

              <h1 className="mt-8 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
                Tu empresa esta creciendo...
                <br className="hidden sm:block" />
                pero cada mes pierdes dinero y no sabes donde.
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                No es un problema comercial. Es un problema estructural.
              </p>

              <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-900 sm:text-lg">
                Empresas en crecimiento pierden entre 5% y 20% de su margen por
                problemas estructurales.
                <br className="hidden sm:block" />
                Si tu utilidad no crece al mismo ritmo que tus ventas, ya estas
                pagando el problema.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowWizard(true)}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                >
                  Diagnosticar mi empresa ahora
                </button>
                <a
                  href="#problema"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-100 sm:w-auto"
                >
                  Ver cuanto dinero estoy perdiendo hoy
                </a>
              </div>

              <dl className="mt-12 grid gap-5 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
                  <dt className="text-sm text-slate-500">Impacto frecuente</dt>
                  <dd className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    5% - 20%
                  </dd>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    de ingresos comprometidos por friccion operativa interna.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
                  <dt className="text-sm text-slate-500">Enfoque</dt>
                  <dd className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    Estructura
                  </dd>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    no mas actividad comercial ni mas reuniones sin causa.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
                  <dt className="text-sm text-slate-500">Resultado</dt>
                  <dd className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    Prioridades
                  </dd>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    claras para corregir lo que realmente afecta margen.
                  </p>
                </div>
              </dl>
            </div>

            <div className="relative min-w-0">
              <div className="absolute left-6 top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute bottom-0 right-2 h-40 w-40 rounded-full bg-slate-950/12 blur-3xl" />

              <div className="relative rounded-[2.4rem] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(245,247,252,0.92)_100%)] p-5 shadow-[0_42px_130px_-48px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80 backdrop-blur sm:p-6">
                <div className="rounded-[2rem] bg-[linear-gradient(180deg,_#050b22_0%,_#050919_100%)] px-5 py-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-6 sm:py-7">
                  <div className="flex items-start justify-between gap-4 text-[11px] uppercase tracking-[0.34em] text-blue-200/90 sm:text-xs">
                    <span className="max-w-[8rem] leading-5">Radar estructural</span>
                    <span className="max-w-[11rem] text-right leading-5">
                      5 dimensiones criticas
                    </span>
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <SystemVisual />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.28em] text-blue-100/75 sm:text-[11px]">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-2">
                      <span className="h-2 w-2 rounded-full bg-blue-100/90" />
                      Objetivo
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-2">
                      <span className="h-2 w-2 rounded-full bg-blue-400" />
                      Empresa hoy
                    </span>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">Nivel estructural</p>
                    <h2 className="text-4xl font-bold">{radarScore} / 100</h2>
                  </div>

                  <p className="mt-2 text-center text-gray-400">
                    {radarInterpretation.message}
                  </p>

                  <p className="mt-2 text-center font-medium text-red-400">
                    {radarInterpretation.alert}
                  </p>

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowWizard(true)}
                      className="rounded-full bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-500"
                    >
                      Diagnosticar mi empresa ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                Resultados / Casos
              </p>
              <div className="mt-4 rounded-2xl border border-dashed border-blue-300/40 p-6">
                <p className="text-lg font-semibold text-white">
                  Placeholder para casos, resultados y prueba de autoridad
                </p>
                <p className="mt-3 text-base leading-7 text-slate-300">
                  Espacio reservado para porcentajes recuperados, mejoras
                  operativas o testimonios ejecutivos.
                </p>
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
              Si varias de estas respuestas te incomodan, el problema ya es
              estructural.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              No necesitas completar un formulario largo para saber si hay
              friccion real. Esta lectura rapida muestra si la operacion ya
              esta drenando margen, control y velocidad.
            </p>
          </div>

          <div className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.2)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
              Diagnostico guiado
            </p>
            <h3 className="mt-4 max-w-3xl text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
              Responde 6 preguntas y detecta en minutos si la fuga ya esta
              impactando tu margen.
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              El diagnostico se abre sin salir de esta pagina, para que avances
              directo al punto critico sin distracciones.
            </p>
            <button
              type="button"
              onClick={() => setShowWizard(true)}
              className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Iniciar diagnostico ahora
            </button>
          </div>
        </div>
      </section>

      <section id="cta" className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,_#0f172a_0%,_#111827_48%,_#1d4ed8_100%)] p-8 text-white shadow-[0_40px_120px_-50px_rgba(15,23,42,0.65)] sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Solicitud filtrada
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Solo para CEOs que ya estan perdiendo dinero sin saber cuanto
            </h2>
            <p className="mx-auto mt-6 mb-8 max-w-2xl text-lg leading-8 text-slate-200">
              En una sesion corta te mostramos:
            </p>
            <div className="mb-8 space-y-3 text-left text-base text-slate-200 sm:mx-auto sm:max-w-xl">
              <p>- donde se pierde el dinero</p>
              <p>- que lo esta causando</p>
              <p>- cuanto impacto tiene</p>
            </div>

            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <a
                href={GOOGLE_CALENDAR_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-center font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
              >
                Ver diagnostico en sesion
              </a>
              <a
                href="https://wa.me/573117008193?text=Hola,%20quiero%20entender%20cu%C3%A1nto%20dinero%20estoy%20perdiendo%20en%20mi%20empresa"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-green-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-green-500 sm:w-auto"
              >
                Hablar por WhatsApp
              </a>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Sesion privada. Solo si hay problema estructural real.
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Si no hay problema estructural real, no seguimos.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold">
          Si tu empresa esta creciendo pero tu utilidad no...
        </h2>
        <p className="mt-2 text-gray-500">
          ya no es un problema comercial. Es estructural.
        </p>
        <button className="mt-6 rounded-full bg-black px-6 py-3 text-white">
          Diagnosticar ahora
        </button>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-10">
          <BrandMark />
          <p>Diagnostico estructural empresarial para companias en crecimiento.</p>
        </div>
      </footer>
    </main>
  );
}

// Legacy wizard kept only to avoid reflow while the new lead flow replaces it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Wizard({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  function handleAnswer(answer: string) {
    setAnswers((current) => [...current, answer]);
    setStep((current) => current + 1);
  }

  if (step >= questions.length) {
    const level = calculateScore(answers);
    const result = getResultText(level);

    return (
      <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-center text-white shadow-[0_30px_90px_-50px_rgba(15,23,42,0.55)] sm:p-10">
        <div className="text-left">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 text-sm text-slate-400 transition hover:text-white"
          >
            ← Volver
          </button>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
          Lectura inicial
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          {result.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          {result.desc}
        </p>

        <a
          href="https://calendar.app.google/MA3xeKtepvt2ANqP7"
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Ver diagnostico completo en sesion
        </a>
      </div>
    );
  }

  const current = questions[step];

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-[0_24px_70px_-45px_rgba(15,23,42,0.2)] sm:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-left">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 text-sm text-slate-500 transition hover:text-slate-900"
          >
            ← Volver
          </button>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
          Paso {step + 1} de {questions.length}
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
          {current.text}
        </h2>

        <div className="mt-8 flex flex-col gap-4">
          {current.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleAnswer(opt)}
              className="rounded-2xl border border-slate-200 px-4 py-4 text-left text-base font-medium text-slate-800 transition hover:border-slate-950 hover:bg-slate-50"
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-950 transition-all"
            style={{ width: `${(step / questions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function LeadWizard({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [leadData, setLeadData] = useState({
    nombre: "",
    empresa: "",
    telefono: "",
    email: "",
  });
  const [acceptedDataPolicy, setAcceptedDataPolicy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleAnswer(answer: string) {
    setAnswers((current) => [...current, answer]);
    setStep((current) => current + 1);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setLeadData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !leadData.nombre ||
      !leadData.empresa ||
      !leadData.telefono ||
      !leadData.email
    ) {
      setSubmitError("Completa los datos clave antes de continuar.");
      return;
    }

    if (!acceptedDataPolicy) {
      setSubmitError("Debes aceptar el tratamiento de datos para continuar.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const score = getScoreValue(answers);
    const level = calculateScore(answers);
    const payload = JSON.stringify({
      ...leadData,
      score,
      level,
    });

    try {
      if (!LEAD_CAPTURE_URL) {
        throw new Error("Missing lead capture url");
      }

      await fetch(LEAD_CAPTURE_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: payload,
      });

      window.location.href = GOOGLE_CALENDAR_URL;
    } catch {
      setSubmitError(
        "No pudimos guardar tus datos en este momento. Intenta de nuevo.",
      );
      setIsSubmitting(false);
    }
  }

  if (step >= questions.length) {
    const level = calculateScore(answers);
    const result = getResultText(level);
    const score = getScoreValue(answers);

    return (
      <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-center text-white shadow-[0_30px_90px_-50px_rgba(15,23,42,0.55)] sm:p-10">
        <div className="text-left">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 text-sm text-slate-400 transition hover:text-white"
          >
            {"<-"} Volver
          </button>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
          Lectura inicial
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
          {result.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          {result.desc}
        </p>
        <div className="mt-6 inline-flex max-w-full flex-wrap justify-center gap-x-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          <span>Score detectado: {score}</span>
          <span>|</span>
          <span>Nivel: {level}</span>
        </div>

        <form
          onSubmit={handleLeadSubmit}
          className="mx-auto mt-10 max-w-2xl rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-left sm:p-6"
        >
          <h3 className="text-2xl font-semibold text-white">
            Recibe el diagnostico completo en sesion
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Dejanos tus datos clave. Guardamos tu resultado y te llevamos
            directo a la agenda.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Nombre
              </span>
              <input
                type="text"
                name="nombre"
                value={leadData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Empresa
              </span>
              <input
                type="text"
                name="empresa"
                value={leadData.empresa}
                onChange={handleInputChange}
                placeholder="Nombre de la empresa"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                WhatsApp
              </span>
              <input
                type="tel"
                name="telefono"
                value={leadData.telefono}
                onChange={handleInputChange}
                placeholder="+57 311 700 8193"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Email
              </span>
              <input
                type="email"
                name="email"
                value={leadData.email}
                onChange={handleInputChange}
                placeholder="tu@empresa.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </label>
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-300">
            <input
              type="checkbox"
              checked={acceptedDataPolicy}
              onChange={(event) => setAcceptedDataPolicy(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900"
            />
            <span>
              Acepto el tratamiento de datos para recibir el diagnostico y ser
              contactado sobre esta evaluacion.
            </span>
          </label>

          {submitError ? (
            <p className="mt-4 text-sm text-red-300">{submitError}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting
              ? "Guardando y redirigiendo..."
              : "Guardar y agendar sesion"}
          </button>
        </form>
      </div>
    );
  }

  const current = questions[step];

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-[0_24px_70px_-45px_rgba(15,23,42,0.2)] sm:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-left">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 text-sm text-slate-500 transition hover:text-slate-900"
          >
            {"<-"} Volver
          </button>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
          Paso {step + 1} de {questions.length}
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
          {current.text}
        </h2>

        <div className="mt-8 flex flex-col gap-4">
          {current.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleAnswer(opt)}
              className="rounded-2xl border border-slate-200 px-4 py-4 text-left text-base font-medium text-slate-800 transition hover:border-slate-950 hover:bg-slate-50"
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-950 transition-all"
            style={{ width: `${(step / questions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
