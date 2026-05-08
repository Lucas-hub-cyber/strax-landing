export type InitialDiagnosisSnapshot = {
  submittedAt?: string;
  payload?: {
    strategy?: { clarity?: string };
    governance?: { founder_dependency?: string };
    operations?: { process_definition?: string };
    data?: { metrics_exist?: string };
    technology?: { tools_stack?: string };
    founder?: { decision_discipline?: string };
  };
  result?: {
    IIA?: number | string;
    IRA?: number | string;
    MIE_percent?: number | string;
    CEA?: number | string;
    modelVersion?: string;
    evaluationHash?: string;
    evaluatedAt?: string;
  };
};

export type DeepDiagnosticState = {
  companyStage: string;
  annualRevenueRange: string;
  teamSize: string;
  mainConstraint: string;
  marginVisibility: string;
  processStability: string;
  decisionFlow: string;
  dataReliability: string;
  systemsIntegration: string;
  founderLoad: string;
  transformationUrgency: string;
  strategicObjective: string;
  structuralSymptoms: string;
  priorityArea: string;
};

export type AiAnalysis = {
  executive_summary: string;
  structural_hypothesis: string;
  dominant_risk: string;
  priority_actions: string[];
  questions_to_validate: string[];
  suggested_next_step: string;
};

export type StraxEngineResponse = {
  structured?: {
    governance?: { founder_dependency?: string };
    operations?: { process_definition?: string };
  };
  result?: {
    IIA?: number | string;
    IRA?: number | string;
    MIE_percent?: number | string;
    CEA?: number | string;
    modelVersion?: string;
    evaluationHash?: string;
    evaluatedAt?: string;
  };
};

export const initialDeepDiagnosticState: DeepDiagnosticState = {
  companyStage: "expansion",
  annualRevenueRange: "not_shared",
  teamSize: "11_30",
  mainConstraint: "margin_pressure",
  marginVisibility: "partial",
  processStability: "partial",
  decisionFlow: "founder_centric",
  dataReliability: "partial",
  systemsIntegration: "fragmented",
  founderLoad: "high",
  transformationUrgency: "this_quarter",
  strategicObjective: "recover_margin",
  structuralSymptoms: "",
  priorityArea: "",
};

export const transformationPlanPhases = [
  {
    label: "FASE 2 - ARQUITECTURA OBJETIVO",
    text: "Disenar como debe funcionar la empresa despues del diagnostico.",
    items: [
      "estructura objetivo",
      "gobierno y roles",
      "flujo operativo ideal",
      "modelo de datos",
      "criterios tecnologicos",
      "prioridades criticas",
    ],
  },
  {
    label: "FASE 3 - PLAN DE INTEGRACION",
    text: "Convertir la arquitectura en una ruta ejecutable.",
    items: [
      "roadmap 0-90 dias",
      "prioridades por impacto",
      "procesos a documentar",
      "responsables",
      "indicadores",
      "decisiones tecnologicas",
    ],
  },
  {
    label: "FASE 4 - CONTROL Y EVOLUCION",
    text: "Asegurar que la transformacion no se quede en papel.",
    items: [
      "KPIs de seguimiento",
      "control de avance",
      "revision de madurez",
      "trazabilidad",
      "estabilizacion operativa",
    ],
  },
];

export function getMetricNumber(value: number | string | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

export function getIiaReading(value: number | null) {
  if (value === null) {
    return "Pendiente de calcular.";
  }

  if (value < 50) {
    return "Arquitectura fragil: la empresa depende de pocas personas, procesos o controles.";
  }

  if (value < 70) {
    return "Arquitectura intermedia: funciona, pero aun tiene friccion estructural.";
  }

  return "Arquitectura saludable: la operacion tiene mejor base para escalar.";
}

export function getIraReading(value: number | null) {
  if (value === null) {
    return "Pendiente de calcular.";
  }

  if (value > 70) {
    return "Riesgo alto: conviene intervenir antes de crecer o automatizar.";
  }

  if (value >= 50) {
    return "Riesgo medio: hay senales claras de perdida de control o velocidad.";
  }

  return "Riesgo controlado: no desaparece, pero no parece critico en este corte.";
}

export function getMieReading(value: number | null) {
  if (value === null) {
    return "Pendiente de calcular.";
  }

  if (value >= 15) {
    return "Impacto alto: posible fuga relevante sobre ingresos o margen.";
  }

  if (value > 0) {
    return "Impacto visible: hay fuga economica estimada, pero no extrema.";
  }

  return "Sin impacto economico estimado con los datos disponibles.";
}

export function formatEstimatedMoney(value: number | null) {
  if (value === null) {
    return "sin estimacion";
  }

  return value.toLocaleString("es-CO", {
    maximumFractionDigits: 0,
  });
}

export function translateFounderDependency(value: string | undefined) {
  if (value === "high") {
    return "alta: muchas decisiones todavia dependen del fundador.";
  }

  if (value === "medium") {
    return "media: existe delegacion parcial, pero aun hay carga centralizada.";
  }

  if (value === "low") {
    return "baja: la empresa opera con mayor autonomia del fundador.";
  }

  return "sin dato suficiente.";
}

export function translateProcessDefinition(value: string | undefined) {
  if (value === "defined") {
    return "definida: los procesos son claros y repetibles.";
  }

  if (value === "partial") {
    return "parcial: existen procesos, pero no estan completamente estandarizados.";
  }

  if (value === "none") {
    return "baja: la operacion depende demasiado de criterio informal.";
  }

  return "sin dato suficiente.";
}

export function buildStructuralHypothesis(
  snapshot: InitialDiagnosisSnapshot | null,
) {
  if (!snapshot) {
    return {
      title: "Hipotesis pendiente",
      description:
        "Todavia no tenemos una lectura inicial guardada. Puedes continuar, pero esta fase gana mucho mas valor cuando entra desde el corte preliminar del landing.",
    };
  }

  const mieValue = getMetricNumber(snapshot.result?.MIE_percent);
  const iiaValue = getMetricNumber(snapshot.result?.IIA);
  const founderDependency = snapshot.payload?.governance?.founder_dependency;
  const processDefinition = snapshot.payload?.operations?.process_definition;

  if (mieValue !== null && mieValue >= 15) {
    return {
      title: "Fuga estructural de alta prioridad",
      description:
        "La lectura inicial sugiere una fuga relevante. Esta fase debe validar si el problema central esta en arquitectura operativa, dependencia de decision o diseno de control.",
    };
  }

  if (
    founderDependency === "high" ||
    processDefinition === "none" ||
    (iiaValue !== null && iiaValue < 50)
  ) {
    return {
      title: "Riesgo de dependencia estructural",
      description:
        "El corte preliminar apunta a una empresa que podria estar operando con excesiva carga en el fundador o con procesos aun inmaduros. Esta fase sirve para confirmar si el sistema ya se volvio cuello de botella.",
    };
  }

  return {
    title: "Hipotesis de friccion estructural moderada",
    description:
      "La lectura inicial no marca colapso, pero si suficientes senales para revisar margen, decisiones, coordinacion y confiabilidad operativa con mas contexto.",
  };
}

export function buildWorkspaceHref(engineResponse: StraxEngineResponse | null) {
  const params = new URLSearchParams();
  const engineResult = engineResponse?.result;
  const structured = engineResponse?.structured;
  const iia = getMetricNumber(engineResult?.IIA);
  const ira = getMetricNumber(engineResult?.IRA);
  const mie = getMetricNumber(engineResult?.MIE_percent);

  if (iia !== null) {
    params.set("iia", String(iia));
  }

  if (ira !== null) {
    params.set("ira", String(ira));
  }

  if (mie !== null) {
    params.set("mie", String(mie));
  }

  if (structured?.governance?.founder_dependency) {
    params.set("founder_dependency", structured.governance.founder_dependency);
  }

  if (structured?.operations?.process_definition) {
    params.set("process_level", structured.operations.process_definition);
  }

  const query = params.toString();

  return query ? `/workspace/demo-client?${query}` : "/workspace/demo-client";
}

export function buildWorkspaceSessionHref(
  engineResponse: StraxEngineResponse | null,
) {
  const workspaceHref = buildWorkspaceHref(engineResponse);
  const [path, query] = workspaceHref.split("?");

  return query ? `${path}/intervention?${query}` : `${path}/intervention`;
}
