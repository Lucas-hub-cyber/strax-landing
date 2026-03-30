import { GOOGLE_CALENDAR_URL } from "@/app/page.data";

const LEAD_CAPTURE_URL =
  process.env.LEAD_CAPTURE_URL ?? process.env.NEXT_PUBLIC_LEAD_CAPTURE_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const LEAD_NOTIFICATION_EMAIL =
  process.env.LEAD_NOTIFICATION_EMAIL ?? "lucas.valencia@ultimate.com.co";
const LEAD_MAIL_FROM = process.env.LEAD_MAIL_FROM;

type LeadPayload = {
  nombre?: string;
  empresa?: string;
  telefono?: string;
  email?: string;
  score?: number;
  level?: string;
  answers?: string[];
};

function buildOwnerEmailHtml(payload: LeadPayload) {
  return `
    <h2>Nuevo lead STRAX</h2>
    <p><strong>Nombre:</strong> ${payload.nombre ?? ""}</p>
    <p><strong>Empresa:</strong> ${payload.empresa ?? ""}</p>
    <p><strong>Telefono:</strong> ${payload.telefono ?? ""}</p>
    <p><strong>Email:</strong> ${payload.email ?? ""}</p>
    <p><strong>Score:</strong> ${payload.score ?? ""}</p>
    <p><strong>Nivel:</strong> ${payload.level ?? ""}</p>
    <p><strong>Answers:</strong> ${(payload.answers ?? []).join(" | ")}</p>
    <p><a href="${GOOGLE_CALENDAR_URL}">Abrir agenda</a></p>
  `;
}

function buildClientEmailHtml(payload: LeadPayload) {
  return `
    <h2>Hola ${payload.nombre ?? ""}</h2>
    <p>Ya registramos tu informacion.</p>
    <p><strong>Empresa:</strong> ${payload.empresa ?? ""}</p>
    <p><strong>Score:</strong> ${payload.score ?? ""}</p>
    <p><strong>Nivel detectado:</strong> ${payload.level ?? ""}</p>
    <p><a href="${GOOGLE_CALENDAR_URL}">Agendar diagnostico</a></p>
  `;
}

async function sendResendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!RESEND_API_KEY || !LEAD_MAIL_FROM) {
    throw new Error("Missing mail configuration");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: LEAD_MAIL_FROM,
      to: [to],
      subject,
      html,
    }),
    cache: "no-store",
  });

  const responseText = await response.text();
  console.info("[leads] resend response", {
    to,
    subject,
    ok: response.ok,
    status: response.status,
    responseText,
  });

  if (!response.ok) {
    throw new Error(responseText || "Resend request failed");
  }
}

export async function POST(request: Request) {
  try {
    if (!LEAD_CAPTURE_URL) {
      return Response.json(
        { ok: false, error: "Missing lead capture url" },
        { status: 500 },
      );
    }

    const payload = (await request.json()) as LeadPayload;
    console.info("[leads] request received", {
      email: payload.email,
      nombre: payload.nombre,
      empresa: payload.empresa,
      level: payload.level,
      score: payload.score,
      answersCount: payload.answers?.length ?? 0,
    });

    const upstreamResponse = await fetch(LEAD_CAPTURE_URL, {
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

    console.info("[leads] sheet upstream response", {
      ok: upstreamResponse.ok,
      status: upstreamResponse.status,
      upstreamBody,
    });

    if (!upstreamResponse.ok) {
      return Response.json(
        {
          ok: false,
          error: "Lead capture upstream failed",
          status: upstreamResponse.status,
          upstreamBody,
        },
        { status: 502 },
      );
    }

    if (
      upstreamBody &&
      typeof upstreamBody === "object" &&
      "success" in upstreamBody &&
      upstreamBody.success === false
    ) {
      return Response.json(
        {
          ok: false,
          error: "Lead capture upstream returned an application error",
          upstreamBody,
        },
        { status: 502 },
      );
    }

    await sendResendEmail({
      to: LEAD_NOTIFICATION_EMAIL,
      subject: `Lead STRAX | ${payload.nombre ?? "Sin nombre"} | ${payload.level ?? ""}`,
      html: buildOwnerEmailHtml(payload),
    });

    if (payload.email) {
      await sendResendEmail({
        to: payload.email,
        subject: "Recibimos tu diagnostico STRAX",
        html: buildClientEmailHtml(payload),
      });
    }

    console.info("[leads] flow completed", {
      ownerEmail: LEAD_NOTIFICATION_EMAIL,
      clientEmail: payload.email ?? null,
    });

    return Response.json({
      ok: true,
      upstreamBody,
    });
  } catch (error) {
    console.error("[leads] flow failed", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
