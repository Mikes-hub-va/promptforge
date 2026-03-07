export const ANALYTICS_EVENTS = {
  prompt_generated: "prompt_generated",
  prompt_copied: "prompt_copied",
  prompt_saved: "prompt_saved",
  template_selected: "template_selected",
  compare_view_opened: "compare_view_opened",
  export_used: "export_used",
  pricing_cta_clicked: "pricing_cta_clicked",
} as const;

export function trackEvent(event: keyof typeof ANALYTICS_EVENTS, payload: Record<string, unknown> = {}) {
  const detail = {
    event: ANALYTICS_EVENTS[event],
    payload,
    at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("promptify:analytics", { detail }));
    if (process.env.NODE_ENV === "development") {
      console.info("Analytics event", detail);
    }
  }
}
