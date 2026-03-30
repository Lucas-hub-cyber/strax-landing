const LEAD_CAPTURE_URL =
  process.env.LEAD_CAPTURE_URL ?? process.env.NEXT_PUBLIC_LEAD_CAPTURE_URL;

export async function POST(request: Request) {
  try {
    if (!LEAD_CAPTURE_URL) {
      return Response.json(
        { ok: false, error: "Missing lead capture url" },
        { status: 500 },
      );
    }

    const payload = await request.json();

    const upstreamResponse = await fetch(LEAD_CAPTURE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const responseText = await upstreamResponse.text();

    if (!upstreamResponse.ok) {
      return Response.json(
        {
          ok: false,
          error: "Lead capture upstream failed",
          status: upstreamResponse.status,
          responseText,
        },
        { status: 502 },
      );
    }

    return Response.json({
      ok: true,
      responseText,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
