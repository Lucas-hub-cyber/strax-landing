import { evaluateStructure, hashEvaluation, rules } from "@/engine/scoring";
import { hasValidConsent, STRAX_PRIVACY_VERSION, STRAX_TERMS_VERSION } from "@/lib/legal";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1";

type PhaseTwoPayload = {
  source?: string;
  captured_at?: string | null;
  initial_snapshot?: unknown;
  deep_diagnostic?: Record<string, unknown>;
  operator_prompt?: string;
  consentAccepted?: boolean;
  acceptedTermsVersion?: string;
  acceptedPrivacyVersion?: string;
};

type AiAnalysis = {
  executive_summary: string;
  structural_hypothesis: string;
  dominant_risk: string;
  priority_actions: string[];
  questions_to_validate: string[];
  suggested_next_step: string;
};

type EngineInput = {
  strategy: Record<string, unknown>;
  governance: Record<string, unknown>;
  operations: Record<string, unknown>;
  data: Record<string, unknown>;
  technology: Record<string, unknown>;
  founder: Record<string, unknown>;
  economicInputs: Record<string, unknown>;
};

function getObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getInitialPayload(payload: PhaseTwoPayload) {
  return getObject(getObject(payload.initial_snapshot).payload);
}

function getInitialSection(payload: PhaseTwoPayload, section: string) {
  return getObject(getInitialPayload(payload)[section]);
}

function mapMarginVisibility(value: string) {
  if (value === "high") {
    return "structured";
  }

  if (value === "low") {
    return "none";
  }

  return "basic";
}

function mapProcessStability(value: string) {
  if (value === "defined") {
    return "defined";
  }

  if (value === "chaotic") {
    return "none";
  }

  return "partial";
}

function mapDecisionFlow(value: string) {
  if (value === "distributed") {
    return "distributed";
  }

  if (value === "founder_centric") {
    return "centralized";
  }

  return "semi_structured";
}

function mapFounderDependency(value: string) {
  if (value === "distributed" || value === "low") {
    return "low";
  }

  if (value === "founder_centric" || value === "high") {
    return "high";
  }

  return "medium";
}

function mapReliability(value: string) {
  if (value === "high") {
    return "high";
  }

  if (value === "low") {
    return "low";
  }

  return "medium";
}

function mapSystemsIntegration(value: string) {
  if (value === "integrated") {
    return "integrated";
  }

  if (value === "fragmented") {
    return "disconnected";
  }

  return "semi_connected";
}

function mapAutomation(value: string) {
  if (value === "integrated") {
    return "advanced";
  }

  if (value === "fragmented") {
    return "none";
  }

  return "partial";
}

function mapFounderLoadToDelegation(value: string) {
  if (value === "low") {
    return "structured";
  }

  if (value === "high") {
    return "none";
  }

  return "partial";
}

function estimateRevenue(value: string) {
  if (value === "under_500k") {
    return 300000;
  }

  if (value === "500k_2m") {
    return 1250000;
  }

  if (value === "2m_10m") {
    return 6000000;
  }

  if (value === "10m_plus") {
    return 12000000;
  }

  return 750000;
}

function estimateTeamHours(value: string) {
  if (value === "1_10") {
    return 80;
  }

  if (value === "31_100") {
    return 420;
  }

  if (value === "100_plus") {
    return 900;
  }

  return 180;
}

function estimateCostPerHour(value: string) {
  if (value === "under_500k") {
    return 45;
  }

  if (value === "2m_10m") {
    return 95;
  }

  if (value === "10m_plus") {
    return 140;
  }

  return 70;
}

function estimateReworkRate(processStability: string) {
  if (processStability === "chaotic") {
    return 0.18;
  }

  if (processStability === "defined") {
    return 0.04;
  }

  return 0.1;
}

function estimateErrorRate(mainConstraint: string, dataReliability: string) {
  if (mainConstraint === "poor_visibility" || dataReliability === "low") {
    return 0.035;
  }

  if (dataReliability === "high") {
    return 0.008;
  }

  return 0.018;
}

function estimateDecisionTimeLost(decisionFlow: string, founderLoad: string) {
  if (decisionFlow === "founder_centric" || founderLoad === "high") {
    return 90;
  }

  if (decisionFlow === "distributed" && founderLoad === "low") {
    return 20;
  }

  return 45;
}

function estimateDataQualityLoss(dataReliability: string, marginVisibility: string) {
  if (dataReliability === "low" || marginVisibility === "low") {
    return 0.025;
  }

  if (dataReliability === "high" && marginVisibility === "high") {
    return 0.004;
  }

  return 0.012;
}

function estimateTechDowntime(systemsIntegration: string) {
  if (systemsIntegration === "fragmented") {
    return 30;
  }

  if (systemsIntegration === "integrated") {
    return 6;
  }

  return 14;
}

function buildLocalEngineInput(payload: PhaseTwoPayload): EngineInput {
  const deepDiagnostic = getObject(payload.deep_diagnostic);
  const initialStrategy = getInitialSection(payload, "strategy");
  const initialGovernance = getInitialSection(payload, "governance");
  const initialOperations = getInitialSection(payload, "operations");
  const initialData = getInitialSection(payload, "data");
  const initialTechnology = getInitialSection(payload, "technology");
  const initialFounder = getInitialSection(payload, "founder");
  const decisionFlow = getString(deepDiagnostic.decision_flow);
  const founderLoad = getString(deepDiagnostic.founder_load);
  const processStability = getString(deepDiagnostic.process_stability);
  const dataReliability = getString(deepDiagnostic.data_reliability);
  const marginVisibility = getString(deepDiagnostic.margin_visibility);
  const systemsIntegration = getString(deepDiagnostic.systems_integration);
  const annualRevenueRange = getString(deepDiagnostic.annual_revenue_range);
  const teamSize = getString(deepDiagnostic.team_size);
  const mainConstraint = getString(deepDiagnostic.main_constraint);
  const revenue = estimateRevenue(annualRevenueRange);
  const costPerHour = estimateCostPerHour(annualRevenueRange);

  return {
    strategy: {
      clarity: getString(initialStrategy.clarity) || "medium",
      focus: "semi_focused",
      value_proposition: "generic",
      scalability:
        getString(deepDiagnostic.company_stage) === "scale" ? "scalable" : "limited",
      coherence: "partial",
    },
    governance: {
      founder_dependency:
        getString(initialGovernance.founder_dependency) ||
        mapFounderDependency(founderLoad || decisionFlow),
      role_clarity: "partial",
      decision_structure: mapDecisionFlow(decisionFlow),
      accountability: "informal",
      delegation: mapFounderLoadToDelegation(founderLoad),
    },
    operations: {
      process_definition:
        getString(initialOperations.process_definition) ||
        mapProcessStability(processStability),
      replicability: processStability === "defined" ? "high" : "low",
      bottlenecks: processStability === "chaotic" ? "constant" : "frequent",
      execution_time: processStability === "defined" ? "stable" : "variable",
      quality_control: processStability === "defined" ? "systematic" : "manual",
    },
    data: {
      metrics_exist:
        getString(initialData.metrics_exist) || mapMarginVisibility(marginVisibility),
      data_accuracy: mapReliability(dataReliability),
      decision_based_on_data:
        dataReliability === "high" || marginVisibility === "high"
          ? "always"
          : "sometimes",
      frequency_of_review: marginVisibility === "high" ? "weekly" : "monthly",
      data_integration: systemsIntegration === "integrated" ? "integrated" : "partial",
    },
    technology: {
      tools_stack:
        getString(initialTechnology.tools_stack) ||
        mapSystemsIntegration(systemsIntegration),
      manual_dependency: systemsIntegration === "integrated" ? "low" : "medium",
      automation_level: mapAutomation(systemsIntegration),
      scalability: systemsIntegration === "integrated" ? "high" : "limited",
      system_reliability: systemsIntegration === "fragmented" ? "unstable" : "acceptable",
    },
    founder: {
      decision_discipline:
        getString(initialFounder.decision_discipline) ||
        (decisionFlow === "distributed" ? "high" : "medium"),
      delegation: mapFounderLoadToDelegation(founderLoad),
      data_usage: dataReliability === "high" ? "advanced" : "basic",
      scaling_mindset: "developing",
      architecture_acceptance: "neutral",
    },
    economicInputs: {
      revenue,
      hours: estimateTeamHours(teamSize),
      reworkRate: estimateReworkRate(processStability),
      costPerHour,
      errorRate: estimateErrorRate(mainConstraint, dataReliability),
      decisionTimeLost: estimateDecisionTimeLost(decisionFlow, founderLoad),
      dataQualityLoss: estimateDataQualityLoss(dataReliability, marginVisibility),
      techDowntime: estimateTechDowntime(systemsIntegration),
      costDowntimePerHour: costPerHour,
    },
  };
}

function buildAnalysisPrompt(payload: PhaseTwoPayload) {
  return [
    "Eres STRAX AI Analyst.",
    "Analiza el caso con lenguaje ejecutivo, preciso y util para un CEO o fundador.",
    "No des consejos genericos. Prioriza estructura, margen, control, decisiones, dependencia del fundador, datos y operaciones.",
    "Devuelve una lectura inicial para Fase 2 con una hipotesis estructural clara y siguientes validaciones.",
    "",
    "Contexto capturado:",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

async function runOpenAIAnalysis(payload: PhaseTwoPayload) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: buildAnalysisPrompt(payload),
      text: {
        format: {
          type: "json_schema",
          name: "strax_phase2_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              executive_summary: {
                type: "string",
              },
              structural_hypothesis: {
                type: "string",
              },
              dominant_risk: {
                type: "string",
              },
              priority_actions: {
                type: "array",
                items: {
                  type: "string",
                },
                minItems: 3,
                maxItems: 3,
              },
              questions_to_validate: {
                type: "array",
                items: {
                  type: "string",
                },
                minItems: 3,
                maxItems: 3,
              },
              suggested_next_step: {
                type: "string",
              },
            },
            required: [
              "executive_summary",
              "structural_hypothesis",
              "dominant_risk",
              "priority_actions",
              "questions_to_validate",
              "suggested_next_step",
            ],
          },
        },
      },
    }),
    cache: "no-store",
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText || "OpenAI analysis request failed");
  }

  const parsedResponse = JSON.parse(responseText) as {
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  const jsonText =
    parsedResponse.output?.[0]?.content?.find((item) => item.type === "output_text")
      ?.text ?? "";

  if (!jsonText) {
    throw new Error("OpenAI analysis returned no structured output");
  }

  return JSON.parse(jsonText) as AiAnalysis;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PhaseTwoPayload;

    if (!hasValidConsent(payload as Record<string, unknown>)) {
      return Response.json(
        {
          ok: false,
          error: "Consent required",
          message:
            "STRAX requiere autorización de tratamiento de datos y aceptación de términos antes de preparar la Fase 2.",
          requiredTermsVersion: STRAX_TERMS_VERSION,
          requiredPrivacyVersion: STRAX_PRIVACY_VERSION,
        },
        { status: 403 },
      );
    }

    console.info("[fase-2] request received", {
      source: payload.source ?? null,
      capturedAt: payload.captured_at ?? null,
      hasInitialSnapshot: Boolean(payload.initial_snapshot),
      deepDiagnosticKeys: Object.keys(payload.deep_diagnostic ?? {}).length,
    });

    const structured = buildLocalEngineInput(payload);
    const result = evaluateStructure(structured);
    const evaluationHash = await hashEvaluation({
      modelVersion: rules.version,
      input: structured,
      evaluation: result,
    });
    const resultWithTrace = {
      ...result,
      modelVersion: rules.version,
      evaluationHash,
      evaluatedAt: new Date().toISOString(),
    };

    if (OPENAI_API_KEY) {
      const analysis = await runOpenAIAnalysis(payload);

      return Response.json({
        ok: true,
        mode: "openai_analysis",
        message: "Analisis STRAX generado con IA.",
        structured,
        result: resultWithTrace,
        analysis,
      });
    }

    return Response.json({
      ok: true,
      mode: "local_engine",
      message:
        "Lectura STRAX generada con el engine interno. Configura OPENAI_API_KEY solo si quieres sumar analisis IA.",
      structured,
      result: resultWithTrace,
    });
  } catch (error) {
    console.error("[fase-2] flow failed", error);
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unknown phase 2 error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo preparar la Fase 2.",
      },
      { status: 500 },
    );
  }
}

