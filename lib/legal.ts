export const STRAX_TERMS_VERSION = "2026-05-04";
export const STRAX_PRIVACY_VERSION = "2026-05-04";

export type ConsentPayload = {
  userId?: string | null;
  acceptedTermsVersion: string;
  acceptedPrivacyVersion: string;
};

export function hasValidConsent(payload: Record<string, unknown>) {
  return (
    payload.consentAccepted === true &&
    payload.acceptedTermsVersion === STRAX_TERMS_VERSION &&
    payload.acceptedPrivacyVersion === STRAX_PRIVACY_VERSION
  );
}
