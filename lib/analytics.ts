type AnalyticsEventParams = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

function emitAnalyticsEvent(
  eventName: string,
  params: AnalyticsEventParams,
) {
  try {
    if (typeof window === "undefined") {
      return;
    }

    window.dataLayer?.push({
      event: eventName,
      ...params,
    });

    window.gtag?.("event", eventName, params);

    window.dispatchEvent(
      new CustomEvent("strax:analytics", {
        detail: {
          event: eventName,
          ...params,
        },
      }),
    );

    if (process.env.NODE_ENV !== "production") {
      console.info("[analytics]", eventName, params);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics:error]", eventName, error);
    }
  }
}

export function trackCtaClick(params: AnalyticsEventParams) {
  emitAnalyticsEvent("cta_click", params);
}

export function trackLeadSubmitAttempt(params: AnalyticsEventParams) {
  emitAnalyticsEvent("lead_submit_attempt", params);
}

export function trackLeadSubmitSuccess(params: AnalyticsEventParams) {
  emitAnalyticsEvent("lead_submit_success", params);
}

export function trackLeadSubmitError(params: AnalyticsEventParams) {
  emitAnalyticsEvent("lead_submit_error", params);
}
