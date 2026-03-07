import { getStripeConfigStatus } from "@/lib/billing/stripe";
import { isAnthropicConfigured } from "@/lib/prompt-engine/providers/anthropic";
import { isGeminiConfigured } from "@/lib/prompt-engine/providers/gemini";
import { isOpenAIConfigured } from "@/lib/prompt-engine/providers/openai";

export function getManagedProviderLabels() {
  return [
    isOpenAIConfigured() ? (process.env.OPENAI_PROVIDER_LABEL?.trim() || "OpenAI-compatible") : null,
    isAnthropicConfigured() ? "Anthropic" : null,
    isGeminiConfigured() ? "Gemini" : null,
  ].filter((provider): provider is string => Boolean(provider));
}

export function getPlatformStatus() {
  const managedProviders = getManagedProviderLabels();
  const billing = getStripeConfigStatus();

  return {
    billing,
    billingReady: billing.billingReady,
    managedProviders,
    managedRuntimeReady: managedProviders.length > 0,
  };
}
