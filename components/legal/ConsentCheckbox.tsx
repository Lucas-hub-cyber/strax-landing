"use client";

import Link from "next/link";

import { STRAX_PRIVACY_VERSION, STRAX_TERMS_VERSION } from "@/lib/legal";

export function ConsentCheckbox({
  checked,
  onChange,
  error,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
      <label className="flex gap-3 text-sm leading-6 text-slate-700">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-slate-950"
        />
        <span>
          Autorizo el tratamiento de mis datos y acepto los{" "}
          <Link href="/terms" className="font-semibold text-blue-800 underline">
            términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/privacy" className="font-semibold text-blue-800 underline">
            política de tratamiento de datos
          </Link>{" "}
          de STRAX.
        </span>
      </label>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Versiones: términos {STRAX_TERMS_VERSION} · privacidad{" "}
        {STRAX_PRIVACY_VERSION}
      </p>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
