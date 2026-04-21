const STRAX_API_URL =
  process.env.STRAX_API_URL ??
  process.env.NEXT_PUBLIC_STRAX_API_URL ??
  "http://localhost:3001";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const upstreamResponse = await fetch(`${STRAX_API_URL}/evaluate`, {
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

    if (!upstreamResponse.ok) {
      return Response.json(
        {
          ok: false,
          error: "STRAX evaluate upstream failed",
          status: upstreamResponse.status,
          upstreamBody,
        },
        { status: 502 },
      );
    }

    return Response.json(upstreamBody, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unknown evaluation error",
      },
      { status: 500 },
    );
  }
}
