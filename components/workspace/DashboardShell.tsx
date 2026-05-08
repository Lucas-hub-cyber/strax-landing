import Link from "next/link";
import type { ReactNode } from "react";

type MetricTone = "green" | "yellow" | "red" | "blue" | "gold";

export type StructuralLayer = {
  key: string;
  label: string;
  value: number;
};

export type MetricCardData = {
  label: string;
  title: string;
  value: string;
  detail: string;
  tone: MetricTone;
  footer?: string;
};

export type FounderData = {
  value: number;
  status: "Estable" | "Condicional" | "Critico";
  risks: string[];
};

export type CriticalAlertData = {
  layer: StructuralLayer;
  iiaImpact: string;
  iraImpact: string;
  economicImpact: string;
};

export type EconomicImpactData = {
  revenue: string;
  annualLoss: string;
  causes: string[];
};

export type RecommendationData = {
  actions: string[];
  projectedIia: string;
  projectedIra: string;
  recovery: string;
};

const navItems = [
  "Resumen Ejecutivo",
  "Evaluacion",
  "Capas Estructurales",
  "Riesgo",
  "Impacto Economico",
  "Recomendaciones",
];

function toneClasses(tone: MetricTone) {
  const tones: Record<MetricTone, string> = {
    green: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
    yellow: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
    red: "text-red-400 border-red-400/30 bg-red-400/5",
    blue: "text-[#1E5EFF] border-[#1E5EFF]/40 bg-[#1E5EFF]/10",
    gold: "text-[#C9A227] border-[#C9A227]/40 bg-[#C9A227]/10",
  };

  return tones[tone];
}

function getScoreTone(value: number) {
  if (value >= 76) {
    return "green" as const;
  }

  if (value >= 56) {
    return "yellow" as const;
  }

  return "red" as const;
}

function Sparkline({ tone }: { tone: MetricTone }) {
  const stroke =
    tone === "red"
      ? "#F87171"
      : tone === "yellow" || tone === "gold"
        ? "#FACC15"
        : tone === "blue"
          ? "#1E5EFF"
          : "#34D399";

  return (
    <svg aria-hidden="true" viewBox="0 0 132 44" className="h-11 w-32">
      <path
        d="M2 33 C15 31, 20 20, 31 18 S48 27, 61 20 78 19, 88 13 106 20, 130 11"
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function DashboardFrame({
  clientName,
  evaluationDate,
  children,
}: {
  clientName: string;
  evaluationDate: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0B0D10] text-white">
      <aside className="hidden border-r border-white/10 bg-[#0B0D10] px-5 py-6 lg:fixed lg:left-0 lg:top-[57px] lg:block lg:h-[calc(100vh-57px)] lg:w-64">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-sm font-semibold">
            SX
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-[0.02em]">
              STRAX
            </span>
            <span className="block text-[10px] uppercase tracking-[0.24em] text-white/45">
              Structural Intelligence
            </span>
          </span>
        </Link>

        <nav className="mt-10 space-y-1">
          <Link
            href="/fase-2"
            className="mb-4 flex min-h-11 items-center justify-center rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Abrir formulario diagnostico
          </Link>

          {navItems.map((item, index) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
              className={`block rounded-lg px-3 py-2.5 text-sm transition ${
                index === 0
                  ? "bg-[#1E5EFF] text-white"
                  : "text-white/62 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0B0D10]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                Resumen Ejecutivo
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {clientName}
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Fecha de evaluacion: {evaluationDate}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/fase-2"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1E5EFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#174ed6]"
              >
                Abrir formulario diagnostico
              </Link>
              <button
                type="button"
                className="w-fit rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/82 transition hover:border-[#1E5EFF] hover:text-white"
              >
                Exportar Reporte
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>
    </main>
  );
}

export function MetricCards({ metrics }: { metrics: MetricCardData[] }) {
  return (
    <section
      id="evaluacion"
      className="grid gap-4 md:grid-cols-3"
      aria-label="Metricas principales"
    >
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-lg border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/20"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/88">{metric.label}</p>
              <p className="mt-1 text-xs text-white/45">{metric.title}</p>
            </div>
            <Sparkline tone={metric.tone} />
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className={`text-5xl font-semibold ${toneClasses(metric.tone)}`}>
                {metric.value}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                {metric.detail}
              </p>
            </div>
            {metric.footer ? (
              <p className="max-w-32 text-right text-xs leading-5 text-white/55">
                {metric.footer}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}

export function StructuralRadar({ layers }: { layers: StructuralLayer[] }) {
  const center = 140;
  const radius = 92;
  const points = layers.map((layer, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / layers.length;
    const scoreRadius = (layer.value / 100) * radius;

    return {
      ...layer,
      x: center + Math.cos(angle) * scoreRadius,
      y: center + Math.sin(angle) * scoreRadius,
      labelX: center + Math.cos(angle) * (radius + 34),
      labelY: center + Math.sin(angle) * (radius + 34),
      axisX: center + Math.cos(angle) * radius,
      axisY: center + Math.sin(angle) * radius,
    };
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section
      id="capas-estructurales"
      className="rounded-lg border border-white/10 bg-white/[0.035] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Mapa Estructural</p>
          <p className="mt-1 text-xs text-white/45">
            Lectura de las cinco capas STRAX.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2 text-[11px] text-white/50">
          <span className="text-emerald-400">76-100</span>
          <span className="text-yellow-400">56-75</span>
          <span className="text-red-400">0-55</span>
        </div>
      </div>

      <svg viewBox="0 0 280 280" className="mt-5 h-[320px] w-full max-w-full">
        {[0.25, 0.5, 0.75, 1].map((scale) => {
          const ring = layers
            .map((_, index) => {
              const angle = -Math.PI / 2 + (Math.PI * 2 * index) / layers.length;
              return `${center + Math.cos(angle) * radius * scale},${
                center + Math.sin(angle) * radius * scale
              }`;
            })
            .join(" ");

          return (
            <polygon
              key={scale}
              points={ring}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
          );
        })}

        {points.map((point) => (
          <line
            key={point.key}
            x1={center}
            y1={center}
            x2={point.axisX}
            y2={point.axisY}
            stroke="rgba(255,255,255,0.12)"
          />
        ))}

        <polygon
          points={polygon}
          fill="rgba(30,94,255,0.16)"
          stroke="#1E5EFF"
          strokeWidth="2"
        />

        {points.map((point) => {
          const tone = getScoreTone(point.value);
          const fill =
            tone === "green" ? "#34D399" : tone === "yellow" ? "#FACC15" : "#F87171";

          return (
            <g key={point.key}>
              <circle cx={point.x} cy={point.y} r="4" fill={fill} />
              <text
                x={point.labelX}
                y={point.labelY}
                fill={fill}
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                {point.label}
              </text>
              <text
                x={point.labelX}
                y={point.labelY + 15}
                fill={fill}
                fontSize="13"
                fontWeight="700"
                textAnchor="middle"
              >
                {point.value}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}

export function CriticalAlert({ alert }: { alert: CriticalAlertData }) {
  return (
    <section
      id="riesgo"
      className="rounded-lg border border-red-400/30 bg-red-400/[0.06] p-5"
    >
      <p className="text-sm font-semibold text-red-300">Alerta Critica</p>
      <p className="mt-4 text-sm text-white/72">Capa en falla:</p>
      <p className="mt-1 text-2xl font-semibold text-red-300">
        {alert.layer.label} ({alert.layer.value})
      </p>
      <div className="mt-5 space-y-2 text-sm leading-6 text-white/72">
        <p>Impacto en IIA: {alert.iiaImpact}</p>
        <p>Impacto en IRA: {alert.iraImpact}</p>
        <p>Impacto economico: {alert.economicImpact}</p>
      </div>
    </section>
  );
}

export function FounderModule({ founder }: { founder: FounderData }) {
  const tone =
    founder.status === "Estable"
      ? "green"
      : founder.status === "Condicional"
        ? "yellow"
        : "red";

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <p className="text-sm font-semibold text-white">Founder Index (IF)</p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className={`text-4xl font-semibold ${toneClasses(tone)}`}>
            IF: {founder.value}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
            {founder.status}
          </p>
        </div>
        <div className={`rounded-lg border px-3 py-2 text-xs ${toneClasses(tone)}`}>
          Decision load
        </div>
      </div>
      <ul className="mt-5 space-y-2 text-sm text-white/68">
        {founder.risks.map((risk) => (
          <li key={risk}>+ {risk}</li>
        ))}
      </ul>
    </section>
  );
}

export function EconomicImpact({ impact }: { impact: EconomicImpactData }) {
  return (
    <section
      id="impacto-economico"
      className="rounded-lg border border-white/10 bg-white/[0.035] p-5"
    >
      <p className="text-sm font-semibold text-white">Impacto Economico</p>
      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs text-white/45">Ingresos anuales</p>
          <p className="mt-1 text-2xl font-semibold">{impact.revenue}</p>
        </div>
        <div>
          <p className="text-xs text-white/45">Perdida anual estimada</p>
          <p className="mt-1 text-2xl font-semibold text-red-300">
            {impact.annualLoss}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
            Top causas
          </p>
          <ol className="mt-3 space-y-2 text-sm text-white/68">
            {impact.causes.map((cause, index) => (
              <li key={cause}>
                {index + 1}. {cause}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Recommendations({
  recommendation,
}: {
  recommendation: RecommendationData;
}) {
  return (
    <section
      id="recomendaciones"
      className="rounded-lg border border-[#1E5EFF]/35 bg-[#1E5EFF]/10 p-5"
    >
      <p className="text-sm font-semibold text-blue-200">
        Recomendacion Principal
      </p>
      <ul className="mt-4 space-y-2 text-sm text-white/76">
        {recommendation.actions.map((action) => (
          <li key={action}>+ {action}</li>
        ))}
      </ul>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Mejora IIA", recommendation.projectedIia],
          ["Reduccion IRA", recommendation.projectedIra],
          ["Recuperacion", recommendation.recovery],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">
              {label}
            </p>
            <p className="mt-2 text-lg font-semibold text-emerald-300">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
