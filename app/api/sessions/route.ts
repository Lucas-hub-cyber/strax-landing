import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

type SaveSessionRequest = {
  clientId?: string;
  supabaseSessionId?: string | null;
  companyInfo?: {
    company?: string;
    industry?: string;
  };
  operationalPayload?: Record<string, unknown>;
  savedAt?: string;
};

function getRequiredClientId(clientId: unknown) {
  if (typeof clientId !== "string" || !clientId.trim()) {
    throw new Error("Missing client id.");
  }

  return clientId.trim();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SaveSessionRequest;
    const clientId = getRequiredClientId(payload.clientId);
    const savedAt = payload.savedAt ?? new Date().toISOString();
    const operationalPayload = payload.operationalPayload ?? {};

    if (!isSupabaseAdminConfigured || !supabaseAdmin) {
      return Response.json(
        {
          ok: false,
          error: "Supabase admin is not configured.",
        },
        { status: 503 },
      );
    }

    const clientResponse = await supabaseAdmin
      .from("clients")
      .update({
        name: payload.companyInfo?.company || "Cliente STRAX",
        industry: payload.companyInfo?.industry || null,
        status: "intervencion activa",
      })
      .eq("id", clientId);

    if (clientResponse.error) {
      throw new Error(clientResponse.error.message);
    }

    const sessionRecord = {
      client_id: clientId,
      session_type: "Intervencion STRAX",
      session_date: savedAt,
      status: "saved",
      notes: JSON.stringify(operationalPayload),
    };

    const response = payload.supabaseSessionId
      ? await supabaseAdmin
          .from("sessions")
          .update(sessionRecord)
          .eq("id", payload.supabaseSessionId)
          .select("id")
          .single()
      : await supabaseAdmin
          .from("sessions")
          .insert(sessionRecord)
          .select("id")
          .single();

    if (response.error || !response.data) {
      throw new Error(
        response.error?.message ?? "Supabase no devolvio la sesion guardada.",
      );
    }

    return Response.json({
      ok: true,
      supabaseSessionId: response.data.id,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown session error",
      },
      { status: 500 },
    );
  }
}
