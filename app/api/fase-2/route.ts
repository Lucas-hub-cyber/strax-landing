const STRAX_PHASE2_URL =
  process.env.STRAX_PHASE2_URL ??
  process.env.NEXT_PUBLIC_STRAX_PHASE2_URL ??
  "";

type PhaseTwoPayload = {
  source?: string;
  captured_at?: string | null;
  initial_snapshot?: unknown;
  deep_diagnostic?: Record<string, unknown>;
  operator_prompt?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PhaseTwoPayload;

    console.info("[fase-2] request received", {
      source: payload.source ?? null,
      capturedAt: payload.captured_at ?? null,
      hasInitialSnapshot: Boolean(payload.initial_snapshot),
      deepDiagnosticKeys: Object.keys(payload.deep_diagnostic ?? {}).length,
    });

    if (!STRAX_PHASE2_URL) {
      return Response.json({
        ok: true,
        mode: "local_capture",
        message:
          "Brief de Fase 2 capturado localmente. Configura STRAX_PHASE2_URL para reenviarlo a GPT o a otro servicio.",
        brief: payload,
      });
    }

    const upstreamResponse = await fetch(STRAX_PHASE2_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

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
  } catch (error) {
    console.error("[fase-2] flow failed", error);
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unknown phase 2 error",
      },
      { status: 500 },
    );
  }
}
