import { evaluateStructure, hashEvaluation, rules } from "@/engine/scoring";
import { hasValidConsent, STRAX_PRIVACY_VERSION, STRAX_TERMS_VERSION } from "@/lib/legal";

type RawPayload = Record<string, unknown>;

function normalizeSection(section: unknown) {
  if (!section || typeof section !== "object" || Array.isArray(section)) {
    return {};
  }

  return section as Record<string, unknown>;
}

function mapInput(rawInput: RawPayload = {}) {
  const economicInputs = normalizeSection(rawInput.economicInputs);

  return {
    strategy: normalizeSection(rawInput.strategy),
    governance: normalizeSection(rawInput.governance),
    operations: normalizeSection(rawInput.operations),
    data: normalizeSection(rawInput.data),
    technology: normalizeSection(rawInput.technology),
    founder: normalizeSection(rawInput.founder),
    economicInputs: {
      revenue: Number(economicInputs.revenue) || 0,
      hours: Number(economicInputs.hours) || 0,
      reworkRate: Number(economicInputs.reworkRate) || 0,
      costPerHour: Number(economicInputs.costPerHour) || 0,
      errorRate: Number(economicInputs.errorRate) || 0,
      decisionTimeLost: Number(economicInputs.decisionTimeLost) || 0,
      dataQualityLoss: Number(economicInputs.dataQualityLoss) || 0,
      techDowntime: Number(economicInputs.techDowntime) || 0,
      costDowntimePerHour: Number(economicInputs.costDowntimePerHour) || 0,
    },
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RawPayload;

    if (!hasValidConsent(payload)) {
      return Response.json(
        {
          ok: false,
          error: "Consent required",
          message:
            "STRAX requiere autorización de tratamiento de datos y aceptación de términos antes de ejecutar la evaluación.",
          requiredTermsVersion: STRAX_TERMS_VERSION,
          requiredPrivacyVersion: STRAX_PRIVACY_VERSION,
        },
        { status: 403 },
      );
    }

    const mappedInput = mapInput(payload);
    const evaluation = evaluateStructure(mappedInput);
    const evaluationHash = await hashEvaluation({
      modelVersion: rules.version,
      input: mappedInput,
      evaluation,
    });

    return Response.json({
      ...evaluation,
      modelVersion: rules.version,
      evaluationHash,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: "Invalid JSON payload",
        message: error instanceof Error ? error.message : "Unknown evaluation error",
      },
      { status: 400 },
    );
  }
}
