"use client";

import type { Question } from "@/app/page.data";
import { questions } from "@/app/page.data";

export function BackButton({
  onClick,
  dark = false,
}: {
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        dark
          ? "mb-6 text-sm text-slate-400 transition hover:text-white"
          : "mb-6 text-sm text-slate-500 transition hover:text-slate-900"
      }
    >
      {"<-"} Volver
    </button>
  );
}

export function WizardQuestionStep({
  current,
  step,
  onBack,
  onAnswer,
}: {
  current: Question;
  step: number;
  onBack: () => void;
  onAnswer: (answer: string) => void;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-[0_24px_70px_-45px_rgba(15,23,42,0.2)] sm:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-left">
          <BackButton onClick={onBack} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-900">
          Paso {step + 1} de {questions.length}
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
          {current.text}
        </h2>

        <div className="mt-8 flex flex-col gap-4">
          {current.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onAnswer(opt)}
              className="rounded-2xl border border-slate-200 px-4 py-4 text-left text-base font-medium text-slate-800 transition hover:border-slate-950 hover:bg-slate-50"
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-950 transition-all"
            style={{ width: `${(step / questions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
