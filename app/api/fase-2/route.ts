const STRAX_PHASE2_URL =
  process.env.STRAX_PHASE2_URL ??
  process.env.NEXT_PUBLIC_STRAX_PHASE2_URL ??
  "";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1";

type PhaseTwoPayload = {
  source?: string;
  captured_at?: string | null;
  initial_snapshot?: unknown;
  deep_diagnostic?: Record<string, unknown>;
  operator_prompt?: string;
};

type AiAnalysis = {
  executive_summary: string;
  structural_hypothesis: string;
  dominant_risk: string;
  priority_actions: string[];
  questions_to_validate: string[];
  suggested_next_step: string;
};

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

    console.info("[fase-2] request received", {
      source: payload.source ?? null,
      capturedAt: payload.captured_at ?? null,
      hasInitialSnapshot: Boolean(payload.initial_snapshot),
      deepDiagnosticKeys: Object.keys(payload.deep_diagnostic ?? {}).length,
    });

    if (STRAX_PHASE2_URL) {
      let upstreamResponse: Response;

      try {
        const upstreamPayload = STRAX_PHASE2_URL.endsWith("/analyze")
          ? {
              text: [
                payload.operator_prompt,
                "",
                "Contexto STRAX capturado:",
                JSON.stringify(payload, null, 2),
              ]
                .filter(Boolean)
                .join("\n"),
            }
          : payload;

        upstreamResponse = await fetch(STRAX_PHASE2_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(upstreamPayload),
          cache: "no-store",
        });
      } catch (error) {
        console.error("[fase-2] upstream connection failed", error);

        return Response.json(
          {
            ok: false,
            error: "Phase 2 upstream unavailable",
            message:
              "No se pudo conectar con STRAX System. Verifica que el backend este corriendo en localhost:3001.",
          },
          { status: 502 },
        );
      }

      const responseText = await upstreamResponse.text();
      let upstreamBody: unknown = null;

      try {
        upstreamBody = responseText ? JSON.parse(responseText) : null;
      } catch {
        upstreamBody = responseText;
      }

      console.info("[fase-2] upstream response", {
        ok: upstreamResponse.ok,
        status: upstreamResponse.status,
        hasBody: Boolean(upstreamBody),
      });

      if (!upstreamResponse.ok) {
        return Response.json(
          {
            ok: false,
            error: "Phase 2 upstream failed",
            message:
              "STRAX System respondio con error al preparar la Fase 2.",
            status: upstreamResponse.status,
            upstreamBody,
          },
          { status: 502 },
        );
      }

      return Response.json({
        ok: true,
        mode: "upstream_forwarded",
        upstreamBody,
      });
    }

    if (OPENAI_API_KEY) {
      const analysis = await runOpenAIAnalysis(payload);

      return Response.json({
        ok: true,
        mode: "openai_analysis",
        message: "Analisis STRAX generado con IA.",
        analysis,
      });
    }

    return Response.json({
      ok: true,
      mode: "local_capture",
      message:
        "Brief de Fase 2 capturado localmente. Configura OPENAI_API_KEY para obtener un analisis IA o STRAX_PHASE2_URL para reenviarlo a otro servicio.",
      brief: payload,
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

