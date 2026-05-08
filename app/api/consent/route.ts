import { headers } from "next/headers";

import { STRAX_PRIVACY_VERSION, STRAX_TERMS_VERSION } from "@/lib/legal";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

type ConsentRequest = {
  userId?: string | null;
  acceptedTermsVersion?: string;
  acceptedPrivacyVersion?: string;
};

function isRecoverableConsentLogError(errorMessage: string) {
  const normalizedMessage = errorMessage.toLowerCase();

  return (
    normalizedMessage.includes("consent_logs") &&
    (normalizedMessage.includes("could not find the table") ||
      normalizedMessage.includes("schema cache") ||
      normalizedMessage.includes("permission denied") ||
      normalizedMessage.includes("row-level security"))
  );
}

function getClientIp(headerList: Headers) {
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ConsentRequest;
    const acceptedTermsVersion =
      payload.acceptedTermsVersion ?? STRAX_TERMS_VERSION;
    const acceptedPrivacyVersion =
      payload.acceptedPrivacyVersion ?? STRAX_PRIVACY_VERSION;

    if (
      acceptedTermsVersion !== STRAX_TERMS_VERSION ||
      acceptedPrivacyVersion !== STRAX_PRIVACY_VERSION
    ) {
      return Response.json(
        {
          ok: false,
          error: "Invalid legal version",
          requiredTermsVersion: STRAX_TERMS_VERSION,
          requiredPrivacyVersion: STRAX_PRIVACY_VERSION,
        },
        { status: 400 },
      );
    }

    const headerList = await headers();
    const consentLog = {
      user_id: payload.userId ?? null,
      ip: getClientIp(headerList),
      accepted_terms_version: acceptedTermsVersion,
      accepted_privacy_version: acceptedPrivacyVersion,
      user_agent: headerList.get("user-agent"),
      accepted_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("consent_logs")
        .insert(consentLog)
        .select("id")
        .single();

      if (error) {
        if (isRecoverableConsentLogError(error.message)) {
          console.warn("[consent] log not persisted", {
            reason: error.message,
          });

          return Response.json({
            ok: true,
            id: "unpersisted-consent",
            mode: "consent_log_not_persisted",
            warning: error.message,
            acceptedTermsVersion,
            acceptedPrivacyVersion,
          });
        }

        throw new Error(error.message);
      }

      return Response.json({
        ok: true,
        id: data.id,
        acceptedTermsVersion,
        acceptedPrivacyVersion,
      });
    }

    return Response.json({
      ok: true,
      id: "local-consent",
      mode: "supabase_not_configured",
      acceptedTermsVersion,
      acceptedPrivacyVersion,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unknown consent log error",
      },
      { status: 500 },
    );
  }
}
