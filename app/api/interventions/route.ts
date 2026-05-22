import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

type SaveInterventionRequest = {
  clientId?: string;
  interventionSessionId?: string | null;
  state?: Record<string, unknown>;
  savedAt?: string;
};

function getRequiredClientId(clientId: unknown) {
  if (typeof clientId !== "string" || !clientId.trim()) {
    throw new Error("Missing client id.");
  }

  return clientId.trim();
}

function getStateRecord(state: unknown) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new Error("Missing intervention state.");
  }

  return state as Record<string, unknown>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = getRequiredClientId(searchParams.get("clientId"));

    if (!isSupabaseAdminConfigured || !supabaseAdmin) {
      return Response.json(
        {
          ok: false,
          error: "Supabase admin is not configured.",
        },
        { status: 503 },
      );
    }

    const [clientResponse, sessionResponse] = await Promise.all([
      supabaseAdmin
        .from("clients")
        .select("name")
        .eq("id", clientId)
        .maybeSingle<{ name: string }>(),
      supabaseAdmin
        .from("intervention_sessions")
        .select("*")
        .eq("client_id", clientId)
        .order("saved_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (clientResponse.error) {
      throw new Error(clientResponse.error.message);
    }

    if (sessionResponse.error) {
      throw new Error(sessionResponse.error.message);
    }

    if (!sessionResponse.data) {
      return Response.json({
        ok: true,
        clientName: clientResponse.data?.name ?? null,
        session: null,
        findings: [],
      });
    }

    const findingsResponse = await supabaseAdmin
      .from("intervention_findings")
      .select("id,title,description,severity,category")
      .eq("intervention_session_id", sessionResponse.data.id)
      .order("created_at", { ascending: true });

    if (findingsResponse.error) {
      throw new Error(findingsResponse.error.message);
    }

    return Response.json({
      ok: true,
      clientName: clientResponse.data?.name ?? null,
      session: sessionResponse.data,
      findings: findingsResponse.data ?? [],
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unknown intervention error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SaveInterventionRequest;
    const clientId = getRequiredClientId(payload.clientId);
    const state = getStateRecord(payload.state);
    const savedAt = payload.savedAt ?? new Date().toISOString();

    if (!isSupabaseAdminConfigured || !supabaseAdmin) {
      return Response.json(
        {
          ok: false,
          error: "Supabase admin is not configured.",
        },
        { status: 503 },
      );
    }

    const sessionPayload = {
      client_id: clientId,
      founder_profile: state.founder ?? null,
      transcript: state.transcript ?? null,
      finances: state.finances ?? null,
      processes: state.processes ?? null,
      roadmap: state.roadmap ?? null,
      generated_output: state.generated ?? null,
      raw_state: state,
      status: "saved",
      saved_at: savedAt,
    };

    const response = payload.interventionSessionId
      ? await supabaseAdmin
          .from("intervention_sessions")
          .update(sessionPayload)
          .eq("id", payload.interventionSessionId)
          .select("id")
          .single()
      : await supabaseAdmin
          .from("intervention_sessions")
          .insert(sessionPayload)
          .select("id")
          .single();

    if (response.error || !response.data) {
      throw new Error(
        response.error?.message ?? "Supabase no devolvio la intervencion.",
      );
    }

    const interventionSessionId = response.data.id as string;

    const deleteResponse = await supabaseAdmin
      .from("intervention_findings")
      .delete()
      .eq("intervention_session_id", interventionSessionId);

    if (deleteResponse.error) {
      throw new Error(deleteResponse.error.message);
    }

    const findings = Array.isArray(state.findings) ? state.findings : [];

    if (findings.length) {
      const findingsResponse = await supabaseAdmin
        .from("intervention_findings")
        .insert(
          findings.map((finding) => {
            const record =
              finding && typeof finding === "object"
                ? (finding as Record<string, unknown>)
                : {};

            return {
              intervention_session_id: interventionSessionId,
              client_id: clientId,
              title: String(record.title ?? ""),
              description: String(record.description ?? ""),
              severity: String(record.severity ?? "media"),
              category: String(record.category ?? "operacion"),
            };
          }),
        );

      if (findingsResponse.error) {
        throw new Error(findingsResponse.error.message);
      }
    }

    return Response.json({
      ok: true,
      interventionSessionId,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unknown intervention error",
      },
      { status: 500 },
    );
  }
}
