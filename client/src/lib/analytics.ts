import posthog from "posthog-js";

// Fires the same event to PostHog and Google Analytics.
export function trackEvent(name: string, props: Record<string, string | number> = {}) {
  posthog.capture(name, props);
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", name, props);
  }
}
