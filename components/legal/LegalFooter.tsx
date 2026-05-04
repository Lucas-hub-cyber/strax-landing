import Link from "next/link";

export function LegalFooter() {
  return (
    <div className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-center text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-10">
        <p>
          El uso de STRAX implica aceptación de las políticas y términos del
          sistema.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/privacy" className="font-semibold text-slate-700 hover:text-slate-950">
            Política de datos
          </Link>
          <Link href="/terms" className="font-semibold text-slate-700 hover:text-slate-950">
            Términos
          </Link>
        </div>
      </div>
    </div>
  );
}
