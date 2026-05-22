import {
  type StraxEngineResponse,
  buildWorkspaceSessionHref,
  getMetricNumber,
} from "@/lib/fase2";
import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

type CreateWorkspaceRequest = {
  brief?: unknown;
  engineResponse?: StraxEngineResponse;
};

export async function POST(request: Request) {
  let clientId: string | null = null;

  try {
    const payload = (await request.json()) as CreateWorkspaceRequest;
    const engineResponse = payload.engineResponse;

    if (!engineResponse?.result) {
      return Response.json(
        {
          ok: false,
          error: "Missing engine response",
          message: "Primero debes generar la lectura STRAX.",
        },
        { status: 400 },
      );
    }

    if (!isSupabaseAdminConfigured || !supabaseAdmin) {
      return Response.json({
        ok: true,
        fallbackHref: buildWorkspaceSessionHref(engineResponse),
        message:
          "Supabase admin no esta configurado. Te llevamos al workspace demo.",
      });
    }

    const result = engineResponse.result;
    const structured = engineResponse.structured;
    const iia = getMetricNumber(result.IIA);
    const ira = getMetricNumber(result.IRA);
    const mie = getMetricNumber(result.MIE_percent);
    const founderDependency =
      structured?.governance?.founder_dependency ?? null;
    const processLevel = structured?.operations?.process_definition ?? null;

    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .insert({
        name: `Cliente STRAX ${new Date().toLocaleDateString("es-CO")}`,
        industry: "Sin clasificar",
        status: "Arquitectura solicitada",
      })
      .select("id")
      .single();

    if (clientError || !client) {
      throw new Error(
        clientError?.message ?? "No se pudo crear el cliente en Supabase.",
      );
    }

    clientId = client.id as string;

    const inserts = [
      await supabaseAdmin.from("assessments").insert({
        client_id: clientId,
        iia,
        ira,
        mie_percent: mie,
        founder_dependency: founderDependency,
        process_level: processLevel,
        raw_result: {
          source: "fase_2_architecture_request",
          structured,
          result,
          brief: payload.brief,
        },
      }),
      await supabaseAdmin.from("roadmap_items").insert([
        {
          client_id: clientId,
          phase: "Fase 1 Diagnostico",
          title: "Validar lectura estructural",
          description:
            "Confirmar los hallazgos principales del diagnostico STRAX.",
          status: "done",
          priority: "high",
        },
        {
          client_id: clientId,
          phase: "Fase 2 Arquitectura",
          title: "Disenar arquitectura objetivo",
          description:
            "Definir estructura objetivo, roles, gobierno y flujo operativo ideal.",
          status: "in_progress",
          priority: "critical",
        },
        {
          client_id: clientId,
          phase: "Fase 3 Integracion",
          title: "Construir roadmap 0-90 dias",
          description:
            "Convertir la arquitectura en una ruta ejecutable por impacto.",
          status: "pending",
          priority: "high",
        },
        {
          client_id: clientId,
          phase: "Fase 4 Control",
          title: "Definir control y evolucion",
          description:
            "Crear KPIs, seguimiento y revision de madurez operativa.",
          status: "pending",
          priority: "medium",
        },
      ]),
      await supabaseAdmin.from("sessions").insert({
        client_id: clientId,
        session_type: "Arquitectura Objetivo",
        session_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "scheduled",
        notes: "Sesion para convertir diagnostico en arquitectura objetivo.",
      }),
      await supabaseAdmin.from("decisions").insert({
        client_id: clientId,
        title: "Separar decisiones operativas de decisiones estrategicas",
        description: "Reducir carga del fundador y ordenar gobernanza semanal.",
        impact: "Alto",
      }),
      await supabaseAdmin.from("risks").insert({
        client_id: clientId,
        title:
          founderDependency === "high"
            ? "Dependencia critica del fundador"
            : "Friccion estructural pendiente de validar",
        severity: founderDependency === "high" ? "critical" : "high",
        impact: "Riesgo de cuello de botella en ejecucion, control y margen.",
        status: "open",
      }),
    ];

    const firstError = inserts.map((insert) => insert.error).find(Boolean);

    if (firstError) {
      throw new Error(firstError.message);
    }

    return Response.json({
      ok: true,
      clientId,
    });
  } catch (error) {
    if (clientId && supabaseAdmin) {
      await supabaseAdmin.from("clients").delete().eq("id", clientId);
    }

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unknown workspace error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo crear el workspace STRAX.",
      },
      { status: 500 },
    );
  }
}
