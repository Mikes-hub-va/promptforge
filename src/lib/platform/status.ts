import { isStripeConfigured } from "@/lib/billing/stripe";
import { isAnthropicConfigured } from "@/lib/prompt-engine/providers/anthropic";
import { isGeminiConfigured } from "@/lib/prompt-engine/providers/gemini";
import { isOpenAIConfigured } from "@/lib/prompt-engine/providers/openai";

export function getManagedProviderLabels() {
  return [
    isOpenAIConfigured() ? "OpenAI" : null,
    isAnthropicConfigured() ? "Anthropic" : null,
    isGeminiConfigured() ? "Gemini" : null,
  ].filter((provider): provider is string => Boolean(provider));
}

export function getPlatformStatus() {
  const managedProviders = getManagedProviderLabels();

  return {
    billingReady: isStripeConfigured(),
    managedProviders,
    managedRuntimeReady: managedProviders.length > 0,
  };
}
