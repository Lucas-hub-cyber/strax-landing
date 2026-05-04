const structuralMetrics = [
  {
    label: "IIA",
    value: "49",
    tone: "border-red-300/25 bg-red-400/10 text-red-100",
    marker: "bg-red-400",
  },
  {
    label: "IRA",
    value: "67",
    tone: "border-amber-300/25 bg-amber-400/10 text-amber-100",
    marker: "bg-amber-300",
  },
  {
    label: "MIE",
    value: "22%",
    tone: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    marker: "bg-emerald-300",
  },
];

const criticalFindings = [
  "Founder dependency alta",
  "KPIs inexistentes",
  "Procesos no documentados",
  "Gobierno informal",
];

const activeMissions = [
  {
    title: "Revisar flujo comercial",
    status: "in_progress",
    objective: "Entender cómo entra, se gestiona y se pierde una venta.",
    deliverables: [
      "pipeline real",
      "ownership comercial",
      "trazabilidad",
      "puntos de fuga",
    ],
    tone: "border-blue-300/25 bg-blue-400/10 text-blue-100",
  },
  {
    title: "Revisar estructura operativa",
    status: "critical",
    objective: "Detectar dependencia founder y vacíos de operación.",
    deliverables: ["mapa operativo", "dependencias", "responsables críticos"],
    tone: "border-red-300/25 bg-red-400/10 text-red-100",
  },
  {
    title: "Revisar stack tecnológico",
    status: "pending",
    objective: "Entender herramientas, duplicidades y fragmentación operativa.",
    deliverables: [
      "stack actual",
      "software crítico",
      "trazabilidad",
      "integración",
    ],
    tone: "border-white/10 bg-white/5 text-slate-300",
  },
];

const structuralInsights = [
  "Founder concentra decisiones críticas.",
  "Ventas sin trazabilidad formal.",
  "Operación depende de comunicación informal.",
  "No existe ownership financiero claro.",
];

const architectureDecisions = [
  "Separar operación diaria de decisiones estratégicas.",
  "Centralizar indicadores críticos.",
  "Crear ownership comercial.",
  "Formalizar reuniones operativas semanales.",
];

const roadmap = [
  {
    range: "0-30 días",
    items: ["estabilización", "ownership", "trazabilidad básica"],
  },
  {
    range: "30-60 días",
    items: ["KPIs", "reuniones", "control operativo"],
  },
  {
    range: "60-90 días",
    items: ["automatización", "dashboards", "STRAX LIVE"],
  },
];

function StatusBadge({ value, tone }: { value: string; tone: string }) {
  return (
    <span className={`inline-flex max-w-full rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
      {value}
    </span>
  );
}

export default function ArchitectureWorkspacePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_46%,#020617_100%)] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <WorkspaceIdentity
          clientName="Cliente Demo STRAX"
          clientDetail="Arquitectura objetivo preparada para convertir hallazgos en sistema operativo."
          context="Arquitectura objetivo"
        />

        <header className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.75)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
            STRAX Architecture Workspace
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
            Arquitectura Objetivo
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Esta fase convierte el diagnóstico estructural en un sistema
            operativo ejecutable para la organización.
          </p>
        </header>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-7">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                Estado estructural actual
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                Señales que definen la intervención.
              </h2>
            </div>
            <span className="w-fit rounded-full border border-red-300/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-100">
              intervención activa
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {structuralMetrics.map((metric) => (
              <article
                key={metric.label}
                className={`rounded-[1.5rem] border p-5 ${metric.tone}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                    {metric.label}
                  </p>
                  <span className={`h-2.5 w-2.5 rounded-full ${metric.marker}`} />
                </div>
                <p className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-white">
                  {metric.value}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {criticalFindings.map((finding) => (
              <div
                key={finding}
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4 text-sm font-semibold text-slate-200"
              >
                {finding}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
            Misiones activas STRAX
          </p>
          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {activeMissions.map((mission, index) => (
              <article
                key={mission.title}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_100px_-70px_rgba(15,23,42,0.9)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-sm font-semibold text-blue-100">
                    0{index + 1}
                  </div>
                  <StatusBadge value={mission.status} tone={mission.tone} />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {mission.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {mission.objective}
                </p>
                <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Entregables
                  </p>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-200">
                    {mission.deliverables.map((deliverable) => (
                      <p key={deliverable}>• {deliverable}</p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Hallazgos estructurales
            </p>
            <div className="mt-5 grid gap-3">
              {structuralInsights.map((insight) => (
                <div
                  key={insight}
                  className="rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4 text-sm leading-6 text-slate-200"
                >
                  {insight}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Decisiones arquitectónicas
            </p>
            <div className="mt-5 grid gap-3">
              {architectureDecisions.map((decision) => (
                <div
                  key={decision}
                  className="rounded-[1.25rem] border border-blue-300/15 bg-blue-400/10 p-4 text-sm font-semibold leading-6 text-blue-50"
                >
                  {decision}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
            Roadmap 90 días
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {roadmap.map((stage) => (
              <article
                key={stage.range}
                className="relative rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5"
              >
                <div className="absolute left-5 top-0 h-1 w-14 rounded-full bg-blue-300" />
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                  {stage.range}
                </h2>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  {stage.items.map((item) => (
                    <p key={item}>• {item}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-blue-300/20 bg-blue-400/10 p-6 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
            Próxima fase
          </p>
          <h2 className="mt-3 max-w-4xl text-2xl font-semibold tracking-[-0.03em] text-white">
            La arquitectura ya identificó fracturas, ownership y prioridades. El
            siguiente paso es convertir esto en implementación operativa.
          </h2>
          <button
            type="button"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 sm:w-auto"
          >
            Continuar a Implementación
          </button>
        </section>
      </div>
    </main>
  );
}
import { WorkspaceIdentity } from "@/components/workspace/WorkspaceIdentity";
