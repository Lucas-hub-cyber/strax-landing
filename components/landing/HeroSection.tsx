"use client";

import type { RadarInterpretation } from "@/app/page.data";
import { BrandMark } from "@/components/landing/BrandMark";
import { SystemVisual } from "@/components/landing/SystemVisual";
import { trackCtaClick } from "@/lib/analytics";

export function HeroSection({
  radarScore,
  radarInterpretation,
  onStartDiagnostic,
}: {
  radarScore: number;
  radarInterpretation: RadarInterpretation;
  onStartDiagnostic: () => void;
}) {
  return (
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
            onClick={() =>
              trackCtaClick({
                source: "hero_header",
                variant: "anchor_cta",
                target: "cta_section",
              })
            }
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
                onClick={() => {
                  trackCtaClick({
                    source: "hero_primary",
                    variant: "start_diagnostic",
                  });
                  onStartDiagnostic();
                }}
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
              >
                Diagnosticar mi empresa ahora
              </button>
              <a
                href="#problema"
                onClick={() =>
                  trackCtaClick({
                    source: "hero_secondary",
                    variant: "scroll_to_problem",
                    target: "problema_section",
                  })
                }
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-100 sm:w-auto"
              >
                Ver cuanto dinero estoy perdiendo hoy
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                Sin costo inicial
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                Respuesta en menos de 2 minutos
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                Diagnostico orientado a margen
              </span>
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
                  <span className="max-w-[8rem] leading-5">
                    Radar estructural
                  </span>
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
                    onClick={() => {
                      trackCtaClick({
                        source: "hero_radar_card",
                        variant: "start_diagnostic",
                      });
                      onStartDiagnostic();
                    }}
                    className="rounded-full bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-500"
                  >
                    Diagnosticar mi empresa ahora
                  </button>
                </div>

                <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-blue-100/60">
                  Lectura inicial sin costo. Agenda solo si detectamos fuga real.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
