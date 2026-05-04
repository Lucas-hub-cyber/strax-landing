import { WorkspaceIdentity } from "@/components/workspace/WorkspaceIdentity";

const structuralRisks = [
  {
    title: "Founder dependency",
    impact: "La empresa no escala sin intervención directa del founder.",
    priority: "Crítica",
    level: "border-red-300/25 bg-red-400/10 text-red-100",
  },
  {
    title: "Ventas sin trazabilidad",
    impact: "No existe control real del pipeline comercial.",
    priority: "Alta",
    level: "border-amber-300/25 bg-amber-400/10 text-amber-100",
  },
  {
    title: "Operación informal",
    impact: "La operación depende de comunicación no estructurada.",
    priority: "Alta",
    level: "border-amber-300/25 bg-amber-400/10 text-amber-100",
  },
  {
    title: "KPIs inexistentes",
    impact: "No hay control de desempeño.",
    priority: "Media",
    level: "border-blue-300/25 bg-blue-400/10 text-blue-100",
  },
];

const ownershipRows = [
  ["Ventas", "Founder", "Alta", "Crítico"],
  ["Operación", "Coordinador", "Media", "Inestable"],
  ["Finanzas", "Sin ownership", "Alta", "Crítico"],
  ["Tecnología", "Freelance externo", "Media", "Riesgo"],
];

const missingProcesses = [
  ["Pipeline comercial estructurado", "missing", "critical", "Control de origen, avance y pérdida de ventas."],
  ["Reunión operativa semanal", "missing", "high", "Ritmo mínimo para destrabar decisiones."],
  ["Dashboard financiero", "missing", "high", "Visibilidad de margen y desempeño."],
  ["Ownership por área", "partial", "critical", "Responsabilidad clara por ejecución."],
  ["Trazabilidad de proyectos", "missing", "high", "Seguimiento de compromisos y bloqueos."],
  ["Flujo formal de decisiones", "partial", "high", "Separar urgencias de criterio estratégico."],
  ["SLA operativo", "missing", "medium", "Estándares mínimos de respuesta."],
  ["Gestión documental", "partial", "medium", "Base de operación replicable."],
];

const recommendedSystem = [
  ["CRM centralizado", "Centralizar ventas y trazabilidad comercial."],
  ["Comité operativo semanal", "Formalizar control y decisiones."],
  ["Dashboard ejecutivo", "Visibilidad semanal del negocio."],
  ["Ownership financiero", "Separar operación y control financiero."],
  ["Modelo de KPIs", "Crear métricas mínimas obligatorias."],
];

const executableRoadmap = [
  {
    range: "30 días",
    items: [
      "documentar pipeline",
      "definir ownership comercial",
      "estructurar reuniones",
      "identificar indicadores mínimos",
    ],
  },
  {
    range: "60 días",
    items: [
      "implementar CRM",
      "dashboard financiero",
      "control operativo semanal",
      "trazabilidad de proyectos",
    ],
  },
  {
    range: "90 días",
    items: [
      "automatización",
      "gobierno operativo",
      "control estratégico",
      "STRAX LIVE",
    ],
  },
];

const operatingBlocks = [
  "Founder",
  "Dirección operativa",
  "Ventas | Operación | Finanzas | Tecnología",
  "KPIs + reuniones + trazabilidad",
  "Dashboard ejecutivo",
];

function StatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone =
    normalized.includes("critical") || normalized.includes("crítico")
      ? "border-red-300/25 bg-red-400/10 text-red-100"
      : normalized.includes("high") ||
          normalized.includes("alta") ||
          normalized.includes("riesgo")
        ? "border-amber-300/25 bg-amber-400/10 text-amber-100"
        : normalized.includes("partial") ||
            normalized.includes("media") ||
            normalized.includes("inestable")
          ? "border-blue-300/25 bg-blue-400/10 text-blue-100"
          : "border-white/10 bg-white/5 text-slate-300";

  return (
    <span className={`inline-flex max-w-full rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
      {value}
    </span>
  );
}

export default function StraxEnginePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_44%,#020617_100%)] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <WorkspaceIdentity
          clientName="Cliente Demo STRAX"
          clientDetail="Motor estructural para traducir riesgos en ownership, procesos y control."
          context="STRAX Engine"
        />

        <header className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.85)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
                STRAX ENGINE
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
                Conversión Arquitectónica
              </h1>
              <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
                STRAX transforma hallazgos estructurales en ownership, procesos,
                control y ejecución operativa.
              </p>
            </div>
            <span className="w-fit rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100">
              engine active
            </span>
          </div>
        </header>

        <section className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
            Riesgos estructurales detectados
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-4">
            {structuralRisks.map((risk) => (
              <article
                key={risk.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
                    {risk.title}
                  </h2>
                  <StatusPill value={risk.priority} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {risk.impact}
                </p>
                <div className={`mt-5 h-1.5 rounded-full border ${risk.level}`} />
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
            Ownership map
          </p>
          <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-white/10">
            <div className="hidden bg-slate-950/70 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:grid md:grid-cols-4">
              <div className="p-4">Área</div>
              <div className="p-4">Responsable actual</div>
              <div className="p-4">Dependencia founder</div>
              <div className="p-4">Estado</div>
            </div>
            {ownershipRows.map(([area, owner, dependency, status]) => (
              <div
                key={area}
                className="grid grid-cols-1 border-t border-white/10 bg-slate-950/35 text-sm text-slate-200 md:grid-cols-4"
              >
                <div className="p-4 font-semibold text-white">{area}</div>
                <div className="p-4">{owner}</div>
                <div className="p-4">
                  <StatusPill value={dependency} />
                </div>
                <div className="p-4">
                  <StatusPill value={status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
            Procesos críticos faltantes
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {missingProcesses.map(([title, status, priority, impact]) => (
              <article
                key={title}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusPill value={status} />
                  <StatusPill value={priority} />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{impact}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
            Sistema operativo recomendado
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {recommendedSystem.map(([title, description]) => (
              <article
                key={title}
                className="rounded-[1.5rem] border border-blue-300/15 bg-blue-400/10 p-5"
              >
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-blue-50/80">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Roadmap ejecutable
            </p>
            <div className="mt-5 space-y-4">
              {executableRoadmap.map((stage) => (
                <article
                  key={stage.range}
                  className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5"
                >
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    {stage.range}
                  </h2>
                  <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-300 sm:grid-cols-2">
                    {stage.items.map((item) => (
                      <p key={item}>• {item}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Arquitectura operativa objetivo
            </p>
            <div className="mt-5 space-y-3">
              {operatingBlocks.map((block, index) => (
                <div key={block}>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-4 text-center text-sm font-semibold text-white">
                    {block}
                  </div>
                  {index < operatingBlocks.length - 1 ? (
                    <div className="flex justify-center py-2 text-blue-200">↓</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-blue-300/20 bg-blue-400/10 p-6 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
            Próxima transición
          </p>
          <h2 className="mt-3 max-w-4xl text-2xl font-semibold tracking-[-0.03em] text-white">
            La arquitectura ya definió ownership, riesgos y estructura operativa.
            El siguiente paso es convertir el modelo en implementación real.
          </h2>
          <button
            type="button"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 sm:w-auto"
          >
            Iniciar implementación STRAX
          </button>
        </section>
      </div>
    </main>
  );
}
