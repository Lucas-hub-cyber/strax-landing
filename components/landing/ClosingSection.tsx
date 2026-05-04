import { BrandMark } from "@/components/landing/BrandMark";

export function ClosingSection() {
  return (
    <>
      <section id="cta" className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,_#0f172a_0%,_#111827_48%,_#1d4ed8_100%)] p-8 text-white shadow-[0_40px_120px_-50px_rgba(15,23,42,0.65)] sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Criterio STRAX
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Primero claridad. Después intervención.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              STRAX no empieza vendiendo una solución. Primero identifica si el
              problema está en procesos, decisiones, datos, tecnología o
              dependencia del fundador.
            </p>
            <div className="mt-8 grid gap-3 text-sm leading-6 text-slate-200 sm:grid-cols-3">
              <p className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                Lectura estructural antes que opinión.
              </p>
              <p className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                Decisiones conectadas a margen y control.
              </p>
              <p className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                Plan solo si hay causa real.
              </p>
            </div>
          </div>
        </div>
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
