"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

import {
  calculateScore,
  getResultText,
  getScoreValue,
  GOOGLE_CALENDAR_URL,
  questions,
} from "@/app/page.data";
import {
  BackButton,
  WizardQuestionStep,
} from "@/components/landing/WizardPrimitives";
import {
  trackLeadSubmitAttempt,
  trackLeadSubmitError,
  trackLeadSubmitSuccess,
} from "@/lib/analytics";

export function LeadWizard({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [leadData, setLeadData] = useState({
    nombre: "",
    empresa: "",
    telefono: "",
    email: "",
  });
  const [acceptedDataPolicy, setAcceptedDataPolicy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleAnswer(answer: string) {
    setAnswers((current) => [...current, answer]);
    setStep((current) => current + 1);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setLeadData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    trackLeadSubmitAttempt({
      source: "lead_wizard",
      step,
      answers_count: answers.length,
    });

    if (
      !leadData.nombre ||
      !leadData.empresa ||
      !leadData.telefono ||
      !leadData.email
    ) {
      setSubmitError("Completa los datos clave antes de continuar.");
      return;
    }

    if (!acceptedDataPolicy) {
      setSubmitError("Debes aceptar el tratamiento de datos para continuar.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const score = getScoreValue(answers);
    const level = calculateScore(answers);
    const payload = {
      ...leadData,
      answers,
      score,
      level,
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Lead capture request failed");
      }

      trackLeadSubmitSuccess({
        source: "lead_wizard",
        score,
        level,
      });
      window.location.href = GOOGLE_CALENDAR_URL;
    } catch {
      trackLeadSubmitError({
        source: "lead_wizard",
        score,
        level,
      });
      setSubmitError(
        "No pudimos guardar tus datos en este momento. Intenta de nuevo.",
      );
      setIsSubmitting(false);
    }
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
        <p className="mt-4 text-sm text-slate-400">
          Si dejas tus datos ahora, guardamos esta lectura y te llevamos
          directo a la agenda.
        </p>

        <form
          onSubmit={handleLeadSubmit}
          className="mx-auto mt-10 max-w-2xl rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-left sm:p-6"
        >
          <h3 className="text-2xl font-semibold text-white">
            Recibe el diagnostico completo en sesion
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Dejanos tus datos clave. Guardamos tu resultado y te llevamos
            directo a la agenda.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-2">
              Sin spam
            </span>
            <span className="rounded-full border border-white/10 px-3 py-2">
              Contacto ejecutivo
            </span>
            <span className="rounded-full border border-white/10 px-3 py-2">
              Agenda inmediata
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Nombre
              </span>
              <input
                type="text"
                name="nombre"
                value={leadData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Empresa
              </span>
              <input
                type="text"
                name="empresa"
                value={leadData.empresa}
                onChange={handleInputChange}
                placeholder="Nombre de la empresa"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                WhatsApp
              </span>
              <input
                type="tel"
                name="telefono"
                value={leadData.telefono}
                onChange={handleInputChange}
                placeholder="+57 311 700 8193"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Email
              </span>
              <input
                type="email"
                name="email"
                value={leadData.email}
                onChange={handleInputChange}
                placeholder="tu@empresa.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </label>
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-300">
            <input
              type="checkbox"
              checked={acceptedDataPolicy}
              onChange={(event) => setAcceptedDataPolicy(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900"
            />
            <span>
              Acepto el tratamiento de datos para recibir el diagnostico y ser
              contactado sobre esta evaluacion.
            </span>
          </label>

          {submitError ? (
            <p className="mt-4 text-sm text-red-300">{submitError}</p>
          ) : null}

          <p className="mt-4 text-xs leading-5 text-slate-400">
            Usamos estos datos solo para guardar tu resultado, contactarte sobre
            esta evaluacion y facilitar la agenda del diagnostico.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting
              ? "Guardando y redirigiendo..."
              : "Guardar y agendar sesion"}
          </button>
        </form>
      </div>
    );
  }

  const current = questions[step];

  return (
    <WizardQuestionStep
      current={current}
      step={step}
      onBack={onBack}
      onAnswer={handleAnswer}
    />
  );
}
