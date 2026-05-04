import rules from "@/engine/scoringRules.json";
import {
  calculateCEA,
  calculateFounderScore,
  calculateIIA,
  calculateIIABase,
  calculateIRA,
  calculateLayerScore,
  calculateStructuralPenalty,
} from "@/engine/calculations";

type EngineInput = {
  strategy: Record<string, unknown>;
  governance: Record<string, unknown>;
  operations: Record<string, unknown>;
  data: Record<string, unknown>;
  technology: Record<string, unknown>;
  founder: Record<string, unknown>;
  economicInputs: Record<string, unknown>;
};

type LayerKey = keyof Omit<EngineInput, "founder" | "economicInputs">;

function evaluateStructure(input: EngineInput) {
  const layers = Object.fromEntries(
    (Object.keys(rules.layers) as LayerKey[]).map((layerKey) => [
      layerKey,
      calculateLayerScore(layerKey, input[layerKey], rules),
    ]),
  );
  const founder = calculateFounderScore(input.founder, rules);
  const layerList = Object.values(layers);
  const IIA_base = calculateIIABase(layerList);
  const structural_penalty = calculateStructuralPenalty(layerList, rules.theta);
  const IIA = calculateIIA(IIA_base, structural_penalty);
  const risk = calculateIRA(layers, founder.score);
  const economics = calculateCEA(input.economicInputs);

  return {
    layers: Object.fromEntries(
      Object.entries(layers).map(([key, layer]) => [key, layer.score])
    ),
    founder: founder.score,
    IIA_base,
    structural_penalty,
    IIA,
    IRA_base: risk.IRA_base,
    critical_penalty: risk.critical_penalty,
    founder_penalty: risk.founder_penalty,
    IRA: risk.IRA,
    CR: economics.CR,
    CE: economics.CE,
    CGov: economics.CGov,
    CD: economics.CD,
    CT: economics.CT,
    CEA: economics.CEA,
    MIE_percent: economics.MIE_percent
  };
}

async function hashEvaluation(value: unknown) {
  const payload = JSON.stringify(value);
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(payload));

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export {
  evaluateStructure,
  hashEvaluation,
  rules,
};
