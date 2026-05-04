"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";

import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

type CompanyInfo = {
  company: string;
  founder: string;
  architect: string;
  industry: string;
  city: string;
  employees: string;
  monthlyRevenue: string;
  approximateMargin: string;
  stage: string;
};

type ProcessRow = {
  process: string;
  status: string;
  owner: string;
  notes: string;
};

type FinanceState = {
  revenue: string;
  costs: string;
  profit: string;
  cash: string;
  debt: string;
  payroll: string;
  operatingExpenses: string;
};

type TechStackState = {
  crm: string;
  erp: string;
  whatsapp: string;
  excel: string;
  automations: string;
  accounting: string;
  criticalTools: string;
};

type Risk = {
  name: string;
  impact: string;
  priority: string;
  observation: string;
};

type ActionItem = {
  title: string;
  done: boolean;
};

type SessionState = {
  supabaseSessionId: string | null;
  companyInfo: CompanyInfo;
  conversation: string;
  findings: string[];
  customFinding: string;
  processes: ProcessRow[];
  finance: FinanceState;
  techStack: TechStackState;
  risks: Risk[];
  actions: ActionItem[];
  newRisk: Risk;
  newAction: string;
  strategicDecisions: string;
  savedAt: string | null;
};

const defaultFindings = [
  "founder dependency",
  "ventas sin CRM",
  "KPIs inexistentes",
  "gobierno débil",
  "caos operativo",
  "decisiones centralizadas",
];

const processStatuses = ["inexistente", "parcial", "documentado", "optimizado"];
const riskPriorities = ["crítica", "alta", "media", "baja"];

const initialSessionState: SessionState = {
  supabaseSessionId: null,
  companyInfo: {
    company: "Café Campillo",
    founder: "Álvaro Campuzano",
    architect: "Lucas Valencia",
    industry: "",
    city: "",
    employees: "",
    monthlyRevenue: "",
    approximateMargin: "",
    stage: "",
  },
  conversation:
    "El founder menciona que todas las ventas pasan por él y que la operación se coordina principalmente por WhatsApp.",
  findings: ["founder dependency", "ventas sin CRM", "KPIs inexistentes"],
  customFinding: "",
  processes: [
    { process: "ventas", status: "parcial", owner: "Founder", notes: "" },
    { process: "operaciones", status: "parcial", owner: "", notes: "" },
    { process: "finanzas", status: "inexistente", owner: "", notes: "" },
    { process: "RH", status: "inexistente", owner: "", notes: "" },
    { process: "tecnología", status: "parcial", owner: "", notes: "" },
    { process: "compras", status: "inexistente", owner: "", notes: "" },
  ],
  finance: {
    revenue: "",
    costs: "",
    profit: "",
    cash: "",
    debt: "",
    payroll: "",
    operatingExpenses: "",
  },
  techStack: {
    crm: "",
    erp: "",
    whatsapp: "",
    excel: "",
    automations: "",
    accounting: "",
    criticalTools: "",
  },
  risks: [
    {
      name: "Dependencia del founder",
      impact: "La ejecución se bloquea si el founder no interviene.",
      priority: "crítica",
      observation: "",
    },
  ],
  actions: [
    { title: "documentar pipeline", done: false },
    { title: "crear comité semanal", done: false },
    { title: "definir ownership financiero", done: false },
    { title: "estructurar KPIs", done: false },
    { title: "revisar flujo comercial", done: false },
  ],
  newRisk: { name: "", impact: "", priority: "alta", observation: "" },
  newAction: "",
  strategicDecisions: "",
  savedAt: null,
};

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/50"
      />
    </label>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_100px_-80px_rgba(15,23,42,0.9)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function StraxSessionWorkspacePage() {
  const params = useParams<{ client: string }>();
  const clientId = params.client ?? "demo-client";
  const storageKey = useMemo(
    () => `strax-session-workspace:${clientId}`,
    [clientId],
  );
  const [session, setSession] = useState<SessionState>(initialSessionState);
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return;
    }

    try {
      const parsedSession = JSON.parse(storedValue) as SessionState;

      window.queueMicrotask(() => setSession(parsedSession));
    } catch {
      window.queueMicrotask(() =>
        setSaveMessage("No se pudo cargar la sesión guardada."),
      );
    }
  }, [storageKey]);

  function updateCompanyInfo(key: keyof CompanyInfo, value: string) {
    setSession((current) => ({
      ...current,
      companyInfo: { ...current.companyInfo, [key]: value },
    }));
  }

  function updateFinance(key: keyof FinanceState, value: string) {
    setSession((current) => ({
      ...current,
      finance: { ...current.finance, [key]: value },
    }));
  }

  function updateTechStack(key: keyof TechStackState, value: string) {
    setSession((current) => ({
      ...current,
      techStack: { ...current.techStack, [key]: value },
    }));
  }

  function updateProcess(index: number, key: keyof ProcessRow, value: string) {
    setSession((current) => ({
      ...current,
      processes: current.processes.map((process, processIndex) =>
        processIndex === index ? { ...process, [key]: value } : process,
      ),
    }));
  }

  function toggleFinding(finding: string) {
    setSession((current) => {
      const exists = current.findings.includes(finding);

      return {
        ...current,
        findings: exists
          ? current.findings.filter((item) => item !== finding)
          : [...current.findings, finding],
      };
    });
  }

  function addCustomFinding() {
    const finding = session.customFinding.trim();

    if (!finding) {
      return;
    }

    setSession((current) => ({
      ...current,
      findings: current.findings.includes(finding)
        ? current.findings
        : [...current.findings, finding],
      customFinding: "",
    }));
  }

  const visibleFindings = [
    ...defaultFindings,
    ...session.findings.filter((finding) => !defaultFindings.includes(finding)),
  ];

  function updateNewRisk(key: keyof Risk, value: string) {
    setSession((current) => ({
      ...current,
      newRisk: { ...current.newRisk, [key]: value },
    }));
  }

  function addRisk() {
    if (!session.newRisk.name.trim()) {
      return;
    }

    setSession((current) => ({
      ...current,
      risks: [...current.risks, current.newRisk],
      newRisk: { name: "", impact: "", priority: "alta", observation: "" },
    }));
  }

  function toggleAction(index: number) {
    setSession((current) => ({
      ...current,
      actions: current.actions.map((action, actionIndex) =>
        actionIndex === index ? { ...action, done: !action.done } : action,
      ),
    }));
  }

  function addAction() {
    const title = session.newAction.trim();

    if (!title) {
      return;
    }

    setSession((current) => ({
      ...current,
      actions: [...current.actions, { title, done: false }],
      newAction: "",
    }));
  }

  async function saveSession() {
    const savedAt = new Date().toISOString();
    const nextSession = { ...session, savedAt };

    window.localStorage.setItem(storageKey, JSON.stringify(nextSession));
    setSession(nextSession);
    setIsSaving(true);
    setSaveMessage("Sesion STRAX guardada en este navegador. Sincronizando...");

    if (!isSupabaseConfigured || !supabase || clientId === "demo-client") {
      setIsSaving(false);
      setSaveMessage(
        clientId === "demo-client"
          ? "Sesion STRAX guardada localmente. demo-client no escribe en Supabase."
          : "Sesion STRAX guardada localmente. Falta configurar Supabase.",
      );
      return;
    }

    const operationalPayload = {
      source: "strax_session_workspace",
      savedAt,
      clientId,
      companyInfo: nextSession.companyInfo,
      conversation: nextSession.conversation,
      findings: nextSession.findings,
      processes: nextSession.processes,
      finance: nextSession.finance,
      techStack: nextSession.techStack,
      risks: nextSession.risks,
      actions: nextSession.actions,
      strategicDecisions: nextSession.strategicDecisions,
    };

    try {
      await supabase
        .from("clients")
        .update({
          name: nextSession.companyInfo.company || "Cliente STRAX",
          industry: nextSession.companyInfo.industry || null,
          status: "intervencion activa",
        })
        .eq("id", clientId);

      const sessionRecord = {
        client_id: clientId,
        session_type: "Intervencion STRAX",
        session_date: savedAt,
        status: "saved",
        notes: JSON.stringify(operationalPayload),
      };

      const response = nextSession.supabaseSessionId
        ? await supabase
            .from("sessions")
            .update(sessionRecord)
            .eq("id", nextSession.supabaseSessionId)
            .select("id")
            .single()
        : await supabase
            .from("sessions")
            .insert(sessionRecord)
            .select("id")
            .single();

      if (response.error || !response.data) {
        throw new Error(
          response.error?.message ?? "Supabase no devolvio la sesion guardada.",
        );
      }

      const syncedSession = {
        ...nextSession,
        supabaseSessionId: response.data.id as string,
      };

      window.localStorage.setItem(storageKey, JSON.stringify(syncedSession));
      setSession(syncedSession);
      setSaveMessage("Sesion STRAX guardada en Supabase y en este navegador.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? `Guardado local OK. Supabase fallo: ${error.message}`
          : "Guardado local OK. Supabase fallo al sincronizar.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_42%,#020617_100%)] px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.85)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">
            STRAX Session Workspace
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Empresa
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {session.companyInfo.company || "Sin empresa"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Founder
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {session.companyInfo.founder || "Sin founder"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Arquitecto STRAX
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {session.companyInfo.architect || "Sin arquitecto"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Estado
              </p>
              <p className="mt-2 w-fit rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                intervención activa
              </p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Section eyebrow="Bloque 1" title="Información empresa">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="empresa"
                value={session.companyInfo.company}
                onChange={(value) => updateCompanyInfo("company", value)}
              />
              <Field
                label="founder"
                value={session.companyInfo.founder}
                onChange={(value) => updateCompanyInfo("founder", value)}
              />
              <Field
                label="industria"
                value={session.companyInfo.industry}
                onChange={(value) => updateCompanyInfo("industry", value)}
              />
              <Field
                label="ciudad"
                value={session.companyInfo.city}
                onChange={(value) => updateCompanyInfo("city", value)}
              />
              <Field
                label="empleados"
                value={session.companyInfo.employees}
                onChange={(value) => updateCompanyInfo("employees", value)}
              />
              <Field
                label="ingresos mensuales"
                value={session.companyInfo.monthlyRevenue}
                onChange={(value) =>
                  updateCompanyInfo("monthlyRevenue", value)
                }
              />
              <Field
                label="margen aproximado"
                value={session.companyInfo.approximateMargin}
                onChange={(value) =>
                  updateCompanyInfo("approximateMargin", value)
                }
              />
              <Field
                label="etapa empresa"
                value={session.companyInfo.stage}
                onChange={(value) => updateCompanyInfo("stage", value)}
              />
            </div>
          </Section>

          <Section eyebrow="Bloque 2" title="Conversación estratégica">
            <textarea
              value={session.conversation}
              onChange={(event) =>
                setSession((current) => ({
                  ...current,
                  conversation: event.target.value,
                }))
              }
              className="min-h-80 w-full resize-y rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 text-base leading-8 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/50"
              placeholder="Escribe aquí mientras hablas con el founder..."
            />
          </Section>
        </div>

        <Section eyebrow="Bloque 3" title="Hallazgos detectados">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleFindings.map((finding) => (
              <label
                key={finding}
                className="flex cursor-pointer items-center gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4 text-sm font-semibold text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={session.findings.includes(finding)}
                  onChange={() => toggleFinding(finding)}
                  className="h-4 w-4 accent-blue-400"
                />
                {finding}
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={session.customFinding}
              onChange={(event) =>
                setSession((current) => ({
                  ...current,
                  customFinding: event.target.value,
                }))
              }
              placeholder="Agregar hallazgo manual"
              className="min-h-12 flex-1 rounded-full border border-white/10 bg-slate-950/60 px-5 text-sm text-white outline-none focus:border-blue-300/50"
            />
            <button
              type="button"
              onClick={addCustomFinding}
              className="min-h-12 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Agregar hallazgo
            </button>
          </div>
        </Section>

        <Section eyebrow="Bloque 4" title="Procesos">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="grid grid-cols-4 bg-slate-950/70 p-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>proceso</span>
              <span>estado</span>
              <span>responsable</span>
              <span>observaciones</span>
            </div>
            {session.processes.map((process, index) => (
              <div
                key={process.process}
                className="grid gap-3 border-t border-white/10 bg-slate-950/35 p-4 md:grid-cols-4"
              >
                <input
                  value={process.process}
                  onChange={(event) =>
                    updateProcess(index, "process", event.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                />
                <select
                  value={process.status}
                  onChange={(event) =>
                    updateProcess(index, "status", event.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                >
                  {processStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input
                  value={process.owner}
                  onChange={(event) =>
                    updateProcess(index, "owner", event.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                />
                <input
                  value={process.notes}
                  onChange={(event) =>
                    updateProcess(index, "notes", event.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                />
              </div>
            ))}
          </div>
        </Section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Section eyebrow="Bloque 5" title="Finanzas y balances">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["ingresos", "revenue"],
                ["costos", "costs"],
                ["utilidad", "profit"],
                ["caja", "cash"],
                ["deuda", "debt"],
                ["nómina", "payroll"],
                ["gastos operativos", "operatingExpenses"],
              ].map(([label, key]) => (
                <Field
                  key={key}
                  label={label}
                  value={session.finance[key as keyof FinanceState]}
                  onChange={(value) =>
                    updateFinance(key as keyof FinanceState, value)
                  }
                />
              ))}
            </div>
          </Section>

          <Section eyebrow="Bloque 6" title="Stack tecnológico">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["CRM", "crm"],
                ["ERP", "erp"],
                ["WhatsApp", "whatsapp"],
                ["Excel", "excel"],
                ["automatizaciones", "automations"],
                ["contabilidad", "accounting"],
                ["herramientas críticas", "criticalTools"],
              ].map(([label, key]) => (
                <Field
                  key={key}
                  label={label}
                  value={session.techStack[key as keyof TechStackState]}
                  onChange={(value) =>
                    updateTechStack(key as keyof TechStackState, value)
                  }
                />
              ))}
            </div>
          </Section>
        </div>

        <Section eyebrow="Bloque 7" title="Riesgos críticos">
          <div className="grid gap-4 lg:grid-cols-3">
            {session.risks.map((risk, index) => (
              <article
                key={`${risk.name}-${index}`}
                className="rounded-[1.5rem] border border-red-300/20 bg-red-400/10 p-5"
              >
                <p className="text-lg font-semibold text-white">{risk.name}</p>
                <p className="mt-3 text-sm leading-6 text-red-50/85">
                  {risk.impact || "Impacto pendiente"}
                </p>
                <p className="mt-3 text-sm font-semibold text-red-100">
                  prioridad: {risk.priority}
                </p>
                {risk.observation ? (
                  <p className="mt-2 text-sm leading-6 text-red-50/75">
                    {risk.observation}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_0.7fr_1fr_auto]">
            <input
              value={session.newRisk.name}
              onChange={(event) => updateNewRisk("name", event.target.value)}
              placeholder="nombre"
              className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
            />
            <input
              value={session.newRisk.impact}
              onChange={(event) => updateNewRisk("impact", event.target.value)}
              placeholder="impacto"
              className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
            />
            <select
              value={session.newRisk.priority}
              onChange={(event) => updateNewRisk("priority", event.target.value)}
              className="rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            >
              {riskPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <input
              value={session.newRisk.observation}
              onChange={(event) =>
                updateNewRisk("observation", event.target.value)
              }
              placeholder="observación"
              className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={addRisk}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950"
            >
              Agregar riesgo
            </button>
          </div>
        </Section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Section eyebrow="Bloque 8" title="Acciones inmediatas">
            <div className="space-y-3">
              {session.actions.map((action, index) => (
                <label
                  key={`${action.title}-${index}`}
                  className="flex cursor-pointer items-center gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/45 p-4 text-sm font-semibold text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={action.done}
                    onChange={() => toggleAction(index)}
                    className="h-4 w-4 accent-blue-400"
                  />
                  <span className={action.done ? "text-slate-500 line-through" : ""}>
                    {action.title}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={session.newAction}
                onChange={(event) =>
                  setSession((current) => ({
                    ...current,
                    newAction: event.target.value,
                  }))
                }
                placeholder="Crear tarea nueva"
                className="min-h-12 flex-1 rounded-full border border-white/10 bg-slate-950/60 px-5 text-sm text-white outline-none"
              />
              <button
                type="button"
                onClick={addAction}
                className="min-h-12 rounded-full bg-white px-6 text-sm font-semibold text-slate-950"
              >
                Crear tarea
              </button>
            </div>
          </Section>

          <Section eyebrow="Bloque 9" title="Decisiones estratégicas">
            <textarea
              value={session.strategicDecisions}
              onChange={(event) =>
                setSession((current) => ({
                  ...current,
                  strategicDecisions: event.target.value,
                }))
              }
              placeholder="Decisiones, acuerdos, cambios y responsables..."
              className="min-h-72 w-full resize-y rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 text-base leading-8 text-white outline-none"
            />
          </Section>
        </div>

        <section className="mt-6 rounded-[2rem] border border-blue-300/20 bg-blue-400/10 p-6 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
            Bloque 10 — Guardar sesión
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                Guardar intervención STRAX
              </h2>
              <p className="mt-2 text-sm leading-6 text-blue-50/85">
                La sesión queda guardada en este navegador y, si el cliente es
                real, también se sincroniza con Supabase.
              </p>
              {session.supabaseSessionId ? (
                <p className="mt-2 text-xs text-blue-100/75">
                  Supabase session: {session.supabaseSessionId}
                </p>
              ) : null}
              {session.savedAt ? (
                <p className="mt-2 text-xs text-blue-100/75">
                  Último guardado: {new Date(session.savedAt).toLocaleString("es-CO")}
                </p>
              ) : null}
              {saveMessage ? (
                <p className="mt-2 text-sm font-semibold text-emerald-100">
                  {saveMessage}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={saveSession}
              disabled={isSaving}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Guardando sesion..." : "Guardar sesión STRAX"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
