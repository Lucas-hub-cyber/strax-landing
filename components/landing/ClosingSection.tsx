"use client";

import { GOOGLE_CALENDAR_URL } from "@/app/page.data";
import { BrandMark } from "@/components/landing/BrandMark";
import { trackCtaClick } from "@/lib/analytics";

export function ClosingSection({
  onStartDiagnostic,
}: {
  onStartDiagnostic: () => void;
}) {
  return (
    <>
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
                onClick={() =>
                  trackCtaClick({
                    source: "closing_section",
                    variant: "calendar_link",
                    destination: "google_calendar",
                  })
                }
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-center font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
              >
                Ver diagnostico en sesion
              </a>
              <a
                href="https://wa.me/573117008193?text=Hola,%20quiero%20entender%20cu%C3%A1nto%20dinero%20estoy%20perdiendo%20en%20mi%20empresa"
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackCtaClick({
                    source: "closing_section",
                    variant: "whatsapp_link",
                    destination: "whatsapp",
                  })
                }
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
        <button
          type="button"
          onClick={() => {
            trackCtaClick({
              source: "closing_bottom_bar",
              variant: "start_diagnostic",
            });
            onStartDiagnostic();
          }}
          className="mt-6 rounded-full bg-black px-6 py-3 text-white"
        >
          Diagnosticar ahora
        </button>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-10">
          <BrandMark />
          <p>Diagnostico estructural empresarial para companias en crecimiento.</p>
        </div>
      </footer>
    </>
  );
}
