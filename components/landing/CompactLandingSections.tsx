"use client";

import Link from "next/link";

export function CompactLandingSections({
  onStartDiagnostic,
}: {
  onStartDiagnostic: () => void;
}) {
  return (
    <>
      <section id="problema" className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
              Lo que STRAX detecta
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              No buscamos mas tareas. Buscamos la causa.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Margen que se pierde en retrabajo",
              "Decisiones que dependen del fundador",
              "Procesos que nadie puede repetir",
              "Datos que no sirven para decidir",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5 text-lg font-semibold text-slate-950"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="prediagnostico" className="bg-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.25)] sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
                  Entrada al diagnostico
                </p>
                <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                  La lectura real empieza con contexto, no con selects tecnicos.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  En la siguiente fase capturamos la situacion de la empresa,
                  ordenamos sintomas y generamos una primera lectura estructural
                  con el motor STRAX.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-900">
                  Siguiente paso
                </p>
                <p className="mt-3 text-base leading-7 text-slate-700">
                  Si quieres una lectura rapida, usa el diagnostico guiado. Si
                  ya tienes contexto del caso, entra directo a Fase 2.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    href="/registro?next=%2Ffase-2"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                  >
                    Crear perfil para Fase 2
                  </Link>
                  <button
                    type="button"
                    onClick={onStartDiagnostic}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Hacer diagnostico guiado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
