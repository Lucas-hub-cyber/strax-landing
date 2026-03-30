"use client";

import { useEffect, useState } from "react";
import { trackCtaClick } from "@/lib/analytics";

const CTA_STATES = {
  top: {
    eyebrow: "Diagnostico express",
    message: "Detecta si ya estas perdiendo margen",
    action: "Empezar",
  },
  middle: {
    eyebrow: "Lectura inicial",
    message: "Responde 6 preguntas y mira tu nivel estructural",
    action: "Ver resultado",
  },
  bottom: {
    eyebrow: "Siguiente paso",
    message: "Guarda tu resultado y pasa directo a agenda",
    action: "Agendar",
  },
} as const;

export function MobileStickyCTA({
  onStartDiagnostic,
}: {
  onStartDiagnostic: () => void;
}) {
  const [ctaState, setCtaState] = useState<
    keyof typeof CTA_STATES
  >("top");

  useEffect(() => {
    function updateState() {
      const scrollTop = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (documentHeight <= 0) {
        setCtaState("top");
        return;
      }

      const progress = scrollTop / documentHeight;

      if (progress > 0.68) {
        setCtaState("bottom");
        return;
      }

      if (progress > 0.28) {
        setCtaState("middle");
        return;
      }

      setCtaState("top");
    }

    updateState();
    window.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);

    return () => {
      window.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, []);

  const currentCta = CTA_STATES[ctaState];

  return (
    <>
      <div className="h-24 sm:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_-18px_48px_-28px_rgba(15,23,42,0.45)] backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {currentCta.eyebrow}
            </p>
            <p className="truncate text-sm font-medium text-slate-900">
              {currentCta.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              trackCtaClick({
                source: "mobile_sticky_cta",
                variant: ctaState,
                label: currentCta.action,
              });
              onStartDiagnostic();
            }}
            className="shrink-0 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {currentCta.action}
          </button>
        </div>
      </div>
    </>
  );
}
