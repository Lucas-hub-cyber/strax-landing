"use client";

import { useState } from "react";

import {
  benefits,
  diagnosticAreas,
  GOOGLE_CALENDAR_URL,
  insights,
  problemPoints,
} from "@/app/page.data";
import { trackCtaClick } from "@/lib/analytics";

export function LandingSections({
  onStartDiagnostic,
}: {
  onStartDiagnostic: () => void;
}) {
  const [activeInsight, setActiveInsight] = useState(0);
  const currentInsight = insights[activeInsight];

  function handleInsightChange(direction: "prev" | "next") {
    setActiveInsight((current) => {
      if (direction === "prev") {
        return current === 0 ? insights.length - 1 : current - 1;
      }

      return current === insights.length - 1 ? 0 : current + 1;
    });
  }

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
            <div className="mb-6 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                6 preguntas
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                Sin reunion previa
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                Resultado inmediato
              </span>
            </div>
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
