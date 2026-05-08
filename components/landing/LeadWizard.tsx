"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  calculateScore,
  getResultText,
  getScoreValue,
  questions,
} from "@/app/page.data";
import {
  BackButton,
  WizardQuestionStep,
} from "@/components/landing/WizardPrimitives";
import { ConsentCheckbox } from "@/components/legal/ConsentCheckbox";
import { STRAX_PRIVACY_VERSION, STRAX_TERMS_VERSION } from "@/lib/legal";

export function LeadWizard({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentError, setConsentError] = useState("");

  async function registerConsentLog() {
    const response = await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acceptedTermsVersion: STRAX_TERMS_VERSION,
        acceptedPrivacyVersion: STRAX_PRIVACY_VERSION,
      }),
    });

    if (!response.ok) {
      console.warn("[consent] lead wizard log was not persisted", {
        status: response.status,
      });
    }
  }

  async function handleAnswer(answer: string) {
    if (step === 0 && !consentAccepted) {
      setConsentError("Debes aceptar términos y política de datos para iniciar.");
      return;
    }

    if (step === 0) {
      try {
        await registerConsentLog();
      } catch (error) {
        console.warn("[consent] lead wizard log request failed", error);
      }
    }

    setConsentError("");
    setAnswers((current) => [...current, answer]);
    setStep((current) => current + 1);
  }

  function handleContinueToPhaseTwo(score: number, level: string) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "strax-initial-diagnosis",
        JSON.stringify({
          submittedAt: new Date().toISOString(),
          source: "lead_wizard",
          answers,
          score,
          level,
        }),
      );
    }

    router.push("/registro?next=%2Ffase-2");
  }

  if (step >= questions.length) {
    const level = calculateScore(answers);
    const result = getResultText(level);
    const score = getScoreValue(answers);

    return (
      <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-center text-white shadow-[0_30px_90px_-50px_rgba(15,23,42,0.55)] sm:p-10">
        <div className="text-left">
          <BackButton onClick={onBack} dark />
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
        <div className="mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-left sm:p-6">
          <h3 className="text-2xl font-semibold text-white">
            Esta salida es una lectura inicial, no el diagnostico completo.
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            El siguiente paso recomendado no es dejar tus datos a ciegas. Es
            entrar a Fase 2 STRAX para ordenar el caso con mas rigor y preparar
            la lectura estructural completa.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-2">
              Lectura preliminar
            </span>
            <span className="rounded-full border border-white/10 px-3 py-2">
              Fase 2 STRAX
            </span>
            <span className="rounded-full border border-white/10 px-3 py-2">
              Agenda opcional
            </span>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-blue-300/20 bg-blue-400/10 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
              Recomendacion
            </p>
            <p className="mt-3 text-base leading-7 text-slate-200">
              Con este nivel detectado, conviene validar primero si la friccion
              principal esta en dependencia del fundador, desorden operativo o
              falta de control estructural.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleContinueToPhaseTwo(score, level)}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 sm:w-auto"
            >
              Entrar a Fase 2 STRAX
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-400">
            La agenda queda disponible como opcion secundaria. El camino
            principal ahora es profundizar la lectura antes de cerrar una
            recomendacion.
          </p>
        </div>
      </div>
    );
  }

  const current = questions[step];

  return (
    <div className="space-y-5">
      {step === 0 ? (
        <ConsentCheckbox
          checked={consentAccepted}
          onChange={(checked) => {
            setConsentAccepted(checked);
            setConsentError("");
          }}
          error={consentError}
        />
      ) : null}
      <WizardQuestionStep
        current={current}
        step={step}
        onBack={onBack}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
