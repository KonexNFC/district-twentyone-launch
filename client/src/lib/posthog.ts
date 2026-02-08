declare global {
  interface Window {
    posthog: any;
  }
}

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;

let initialized = false;

export function initPostHog() {
  if (initialized || !POSTHOG_KEY || !window.posthog) return;
  window.posthog.init(POSTHOG_KEY, {
    api_host: "https://us.i.posthog.com",
    person_profiles: "identified_only",
    autocapture: true,
  });
  initialized = true;
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  if (window.posthog && initialized) {
    window.posthog.capture(event, properties);
  }
}
